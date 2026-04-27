import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Public endpoint to fetch active promotional offers.
 * Does NOT require admin permissions.
 */
export async function GET() {
  try {
    const rows = await db.query("SELECT * FROM offers WHERE active = 1");
    const items = rows.map(o => ({
      ...o,
      _id: o.id.toString(),
      discount: parseFloat(o.discount.toString()),
      createdAt: o.created_at,
      updatedAt: o.updated_at
    }));
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET Active Offers Error:", error);
    return NextResponse.json({ error: "Failed to fetch active offers" }, { status: 500 });
  }
}
