import { NextResponse } from "next/server";
import db from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // 1. Security Check
    const authHeader = request.headers.get("x-api-key");
    const secretKey = process.env.SHIPROCKET_WEBHOOK_SECRET;

    if (!secretKey) {
      console.error("Missing SHIPROCKET_WEBHOOK_SECRET in environment");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }
    if (!authHeader || authHeader !== secretKey) {
      console.error("Blocked unauthorized Shiprocket webhook attempt.");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Payload
    const payload = await request.json();
    const awbCode = payload.awb;
    const currentStatus = payload.current_status;

    if (!awbCode || !currentStatus) {
      return NextResponse.json({ error: "Invalid payload: missing AWB or status" }, { status: 400 });
    }

    // 3. Map Shiprocket status → internal status
    let newInternalStatus = null;
    const s = currentStatus.toString().toUpperCase();

    if (s === "PICKED UP") newInternalStatus = "Dispatched";
    else if (s === "IN TRANSIT" || s === "OUT FOR DELIVERY" || s === "SHIPPED") newInternalStatus = "In_Transit";
    else if (s === "DELIVERED") newInternalStatus = "Delivered";
    else if (s === "CANCELLED" || s.startsWith("RTO") || s === "RETURNED") newInternalStatus = "Cancelled";
    else {
      console.log(`Shiprocket Webhook: Ignored intermediate status '${s}' for AWB ${awbCode}`);
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    // 4. Update Database
    const orderRows = await db.query(
      "SELECT * FROM orders WHERE logistics_awb_code = ? LIMIT 1",
      [awbCode]
    );
    const order = orderRows[0];

    if (!order) {
      console.error(`Shiprocket Webhook Error: Order not found for AWB ${awbCode}`);
      return NextResponse.json({ status: "order_not_found" }, { status: 200 });
    }

    // Prevent backwards updates
    if (order.logistics_status === "Delivered" || order.logistics_status === "Cancelled") {
      return NextResponse.json({ status: "already_finalized" }, { status: 200 });
    }

    const fields = ["logistics_status = ?", "updated_at = NOW(3)"];
    const values = [newInternalStatus];

    if (newInternalStatus === "Delivered" && !order.delivered_at) {
      fields.push("delivered_at = NOW(3)");
    }

    values.push(order.id);
    await db.query(
      `UPDATE orders SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    console.log(`✅ Shiprocket Webhook: Order ${order.id} updated to ${newInternalStatus} (AWB: ${awbCode})`);
    return NextResponse.json({ status: "ok" }, { status: 200 });

  } catch (error) {
    console.error("Shiprocket Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
