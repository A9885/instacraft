import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { normalizeCoupon } from "@/lib/normalize";

export const dynamic = "force-dynamic";

async function getCouponByIdentifier(identifier) {
  let coupon = null;
  const numericId = parseInt(identifier);
  if (!isNaN(numericId)) {
    const rows = await db.query("SELECT * FROM coupons WHERE id = ?", [numericId]);
    if (rows.length > 0) coupon = rows[0];
  }

  if (!coupon) {
    const rows = await db.query("SELECT * FROM coupons WHERE custom_id = ?", [identifier]);
    if (rows.length > 0) coupon = rows[0];
  }

  if (!coupon) return null;

  return {
    ...coupon,
    customId: coupon.custom_id,
    minOrder: coupon.min_order,
    maxUses: coupon.max_uses,
    usedCount: coupon.used_count,
    validUntil: coupon.valid_until,
    createdAt: coupon.created_at,
    updatedAt: coupon.updated_at
  };
}

// ── PATCH : update coupon fields ──────────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const resolvedParams = await params;
    const body = await request.json();

    const coupon = await getCouponByIdentifier(resolvedParams.id);
    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    const fields = [];
    const values = [];

    if (body.active !== undefined) {
      fields.push("active = ?");
      values.push(body.active ? 1 : 0);
    }
    if (body.code !== undefined) {
      fields.push("code = ?");
      values.push(body.code.toUpperCase());
    }
    if (body.description !== undefined) {
      fields.push("description = ?");
      values.push(body.description);
    }
    if (body.discount !== undefined) {
      fields.push("discount = ?");
      values.push(parseFloat(body.discount));
    }
    if (body.type !== undefined) {
      fields.push("type = ?");
      values.push(body.type);
    }
    if (body.minOrder !== undefined) {
      fields.push("min_order = ?");
      values.push(parseFloat(body.minOrder));
    }
    if (body.maxUses !== undefined) {
      fields.push("max_uses = ?");
      values.push(body.maxUses != null ? parseInt(body.maxUses) : null);
    }
    if (body.validUntil !== undefined) {
      fields.push("valid_until = ?");
      values.push(body.validUntil ? new Date(body.validUntil) : null);
    }

    if (fields.length > 0) {
      values.push(coupon.id);
      await db.query(`UPDATE coupons SET ${fields.join(", ")}, updated_at = NOW(3) WHERE id = ?`, values);
    }

    const updated = await getCouponByIdentifier(coupon.id);
    revalidateTag("coupons");
    return NextResponse.json(normalizeCoupon(updated));
  } catch (error) {
    console.error("PATCH Coupon Error:", error);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// ── DELETE : remove a coupon ──────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const resolvedParams = await params;
    const coupon = await getCouponByIdentifier(resolvedParams.id);
    if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });

    await db.query("DELETE FROM coupons WHERE id = ?", [coupon.id]);

    revalidateTag("coupons");
    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("DELETE Coupon Error:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
