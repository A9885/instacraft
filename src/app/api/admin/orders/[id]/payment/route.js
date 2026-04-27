import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { normalizeOrder } from "@/lib/normalize";

async function getOrderWithItems(id) {
  const rows = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
  const order = rows[0];
  if (!order) return null;

  const items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [id]);

  return {
    ...order,
    items: items.map(i => ({
      ...i,
      itemProductId: i.item_product_id
    }))
  };
}

// PATCH: Update payment status (e.g., mark COD as Paid)
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { status, paymentId } = await request.json();

    if (!["Paid", "Pending", "Failed"].includes(status)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }

    const order = await getOrderWithItems(parseInt(id));
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const fields = ["payment_status = ?"];
    const values = [status];

    if (paymentId) {
      fields.push("payment_payment_id = ?");
      values.push(paymentId);
    }

    values.push(parseInt(id));

    await db.query(
      `UPDATE orders SET ${fields.join(", ")}, updated_at = NOW(3) WHERE id = ?`,
      values
    );

    const updated = await getOrderWithItems(parseInt(id));

    return NextResponse.json({ 
      success: true, 
      order: normalizeOrder(updated) 
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Order Payment Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
