import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const offset = (page - 1) * limit;

    const [customersRaw, countRows] = await Promise.all([
      db.query("SELECT * FROM customers ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]),
      db.query("SELECT COUNT(*) as count FROM customers")
    ]);

    const total = countRows[0].count;

    // Auto-heal: recalculate orders+totalSpent from actual paid orders
    const healed = await Promise.all(
      customersRaw.map(async (c) => {
        // Fetch paid orders and their items
        const paidOrders = await db.query(
          "SELECT * FROM orders WHERE customer_id = ? AND payment_status = 'Paid'",
          [c.firebase_uid]
        );

        let actualOrderCount = paidOrders.length;
        let actualTotalSpent = 0;

        if (actualOrderCount > 0) {
          const orderIds = paidOrders.map(o => o.id);
          const items = await db.query(
            `SELECT price, qty FROM order_items WHERE order_id IN (${orderIds.join(",")})`
          );
          actualTotalSpent = items.reduce((s, i) => s + parseFloat(i.price.toString()) * i.qty, 0);
        }

        if (c.orders !== actualOrderCount || Math.abs((parseFloat(c.total_spent.toString()) || 0) - actualTotalSpent) > 0.01) {
          await db.query(
            "UPDATE customers SET orders = ?, total_spent = ?, updated_at = NOW(3) WHERE id = ?",
            [actualOrderCount, actualTotalSpent, c.id]
          );
        }

        // Fetch city from first address
        const addrRows = await db.query("SELECT city FROM customer_addresses WHERE customer_id = ? LIMIT 1", [c.id]);
        const city = addrRows[0]?.city || "Unknown";

        return {
          id: c.id.toString(),
          name: c.name || "Anonymous",
          email: c.email || c.phone || "Unspecified",
          city: city,
          orders: actualOrderCount,
          totalSpent: actualTotalSpent,
          joinDate: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
          status: c.status || "active",
        };
      })
    );

    return NextResponse.json({
      customers: healed,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });
  } catch (error) {
    console.error("Customers GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
