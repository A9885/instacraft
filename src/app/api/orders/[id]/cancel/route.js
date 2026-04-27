import { NextResponse } from "next/server";
import { requireUser } from "@/lib/requireUser";
import db from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { error, decodedToken } = await requireUser(request);
    if (error) return error;

    const customerId = decodedToken.uid;

    // Find the order and verify the customer owns it (security: filter by both id AND customerId)
    const rows = await db.query(
      "SELECT * FROM orders WHERE id = ? AND customer_id = ?",
      [parseInt(id), customerId]
    );
    const order = rows[0];

    if (!order) {
      return NextResponse.json({ error: "Order not found or access denied." }, { status: 404 });
    }

    // Can only cancel Placed or Packed orders
    const allowedToCancel = ["Placed", "Packed"].includes(order.logistics_status);
    if (!allowedToCancel) {
      return NextResponse.json({
        error: `Cannot cancel an item that is already ${order.logistics_status.toLowerCase()}.`,
      }, { status: 400 });
    }

    await db.query(
      "UPDATE orders SET logistics_status = ?, updated_at = NOW(3) WHERE id = ?",
      ["Cancelled", order.id]
    );

    return NextResponse.json({
      success: true,
      message: "Order has been cancelled successfully.",
    }, { status: 200 });

  } catch (error) {
    console.error("Order Cancellation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
