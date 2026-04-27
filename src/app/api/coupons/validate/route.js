import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Public endpoint to validate a coupon code.
 * Does NOT require admin permissions.
 */
export async function POST(request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ valid: false, message: "No coupon code provided" }, { status: 400 });
    }

    const normalizedCode = code.replace(/\s+/g, "").toUpperCase();

    const rows = await db.query(
      "SELECT * FROM coupons WHERE code = ? AND active = 1 LIMIT 1",
      [normalizedCode]
    );
    const coupon = rows[0];

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid or inactive coupon code" }, { status: 404 });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" }, { status: 400 });
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit" }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discount: parseFloat(coupon.discount.toString()),
        minOrder: parseFloat(coupon.min_order.toString()),
      },
    });
  } catch (error) {
    console.error("Coupon Validation Error:", error);
    return NextResponse.json({ valid: false, message: "Server error during validation" }, { status: 500 });
  }
}
