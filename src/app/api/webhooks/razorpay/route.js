import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const rawBody = await request.text();

    // 1. Cryptographic Verification
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature" }, { status: 400 });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing RAZORPAY_WEBHOOK_SECRET");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }

    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");

    if (
      expectedBuffer.length !== signatureBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
    ) {
      console.error("Invalid Razorpay Webhook Signature - Forgery Attempt Blocked!");
      return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    // 2. Process Successful Payment Event
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const orderRows = await db.query(
        "SELECT * FROM orders WHERE payment_order_id = ? LIMIT 1",
        [razorpayOrderId]
      );
      const order = orderRows[0];

      if (order) {
        // 3. Idempotency: ignore duplicate events
        if (order.payment_status === "Paid") {
          return NextResponse.json({ status: "already_processed" }, { status: 200 });
        }

        // Update payment status
        await db.query(
          "UPDATE orders SET payment_status = 'Paid', payment_payment_id = ?, payment_signature = ?, updated_at = NOW(3) WHERE id = ?",
          [razorpayPaymentId, signature, order.id]
        );
        console.log(`✅ Order ${order.id} marked as Paid.`);

        // ── BACKGROUND TASKS ────────────────────────────────────────────────

        // Block A: Update Customer stats + clear cart
        try {
          const actualPaid = parseFloat(order.total_amount.toString());
          await db.query(
            "UPDATE customers SET orders = orders + 1, total_spent = total_spent + ?, cart = '[]' WHERE firebase_uid = ?",
            [actualPaid, order.customer_id]
          );
          console.log(`👤 Customer stats updated & cart cleared for: ${order.customer_id}`);
        } catch (err) {
          console.error("❌ Failed to update customer stats:", err);
        }

        // Block B: Stock reduction
        try {
          const itemsRaw = await db.query("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
          for (const item of itemsRaw) {
            if (item.slug) {
              await db.query(
                "UPDATE products SET stock = stock - ?, updated_at = NOW(3) WHERE slug = ?",
                [item.qty, item.slug]
              );
            }
          }
          revalidateTag("products");
          console.log("📦 Stock reduction and cache revalidation complete.");
        } catch (err) {
          console.error("❌ Failed to reduce stock / revalidate cache:", err);
        }

        // Block C: Coupon usage tracking
        try {
          if (order.coupon_code) {
            await db.query(
              "UPDATE coupons SET used_count = used_count + 1, updated_at = NOW(3) WHERE code = ?",
              [order.coupon_code.toUpperCase()]
            );
            console.log(`🎟️ Coupon Usage Incremented: ${order.coupon_code}`);
          }
        } catch (err) {
          console.error("❌ Failed to increment coupon usage:", err);
        }

        // Block D: Wholesale Catalog Self-Destruct
        try {
          if (order.wholesale_token) {
            await db.query(
              "UPDATE wholesale_catalogs SET is_active = 0, updated_at = NOW(3) WHERE access_token = ?",
              [order.wholesale_token]
            );
            console.log(`💥 Wholesale Catalog [${order.wholesale_token}] self-destructed.`);
          }
        } catch (err) {
          console.error("❌ Failed to self-destruct wholesale catalog:", err);
        }

      } else {
        console.error("Order not found in DB for Razorpay Webhook:", razorpayOrderId);
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
