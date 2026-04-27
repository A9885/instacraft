import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/requireAdmin";
import db from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const { token } = await params;

    // 1. Auth check
    const { error } = await verifyAuth(request);
    if (error) return error;

    // 2. Verify the Razorpay Order ID exists in our DB
    const { razorpayOrderId } = await request.json();
    if (!razorpayOrderId) {
      return NextResponse.json({ error: "Missing razorpayOrderId" }, { status: 400 });
    }

    const orderRows = await db.query(
      "SELECT * FROM orders WHERE payment_order_id = ? LIMIT 1",
      [razorpayOrderId]
    );
    const order = orderRows[0];
    if (!order) {
      console.error(`Self-destruct: No order found for Razorpay ID ${razorpayOrderId}`);
      return NextResponse.json({ error: "No matching order found for this payment." }, { status: 404 });
    }

    // 3. Disable the catalog
    const result = await db.query(
      "UPDATE wholesale_catalogs SET is_active = 0, updated_at = NOW(3) WHERE access_token = ?",
      [token]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Catalog not found." }, { status: 404 });
    }

    console.log(`💥 Catalog [${token}] self-destructed via client handler for Razorpay order ${razorpayOrderId}`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Wholesale Complete API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
