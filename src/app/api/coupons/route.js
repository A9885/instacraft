import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { normalizeCoupon } from "@/lib/normalize";

export const dynamic = "force-dynamic";

// ── GET : list all coupons (Admin) ────────────────────────────────────────────
export async function GET(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const rows = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
    
    const coupons = rows.map(c => ({
      ...c,
      customId: c.custom_id,
      minOrder: c.min_order,
      maxUses: c.max_uses,
      usedCount: c.used_count,
      validUntil: c.valid_until,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));

    return NextResponse.json(coupons.map(normalizeCoupon));
  } catch (error) {
    console.error("GET Coupons Error:", error);
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// ── POST : create coupon(s) ───────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    let result;

    if (Array.isArray(body)) {
      await db.transaction(async (conn) => {
        for (const c of body) {
          const customId = c.id || c._id || `cpn-${Date.now()}`;
          const code = c.code.toUpperCase();
          const description = c.description || "";
          const discount = parseFloat(c.discount) || 0;
          const type = c.type === "flat" ? "flat" : "percentage";
          const minOrder = parseFloat(c.minOrder) || 0;
          const maxUses = c.maxUses != null ? parseInt(c.maxUses) : null;
          const usedCount = parseInt(c.usedCount) || 0;
          const validUntil = c.validUntil ? new Date(c.validUntil) : null;
          const active = c.active !== false ? 1 : 0;

          await conn.execute(
            `INSERT IGNORE INTO coupons (
              custom_id, code, description, discount, type, min_order, 
              max_uses, used_count, valid_until, active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
            [customId, code, description, discount, type, minOrder, maxUses, usedCount, validUntil, active]
          );
        }
      });
      const rows = await db.query("SELECT * FROM coupons ORDER BY created_at DESC");
      result = rows.map(c => ({
        ...c,
        customId: c.custom_id,
        minOrder: c.min_order,
        maxUses: c.max_uses,
        usedCount: c.used_count,
        validUntil: c.valid_until,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      }));
    } else {
      if (!body.code || !body.discount || !body.id) {
        return NextResponse.json({ error: "Missing required fields (code, discount, id)" }, { status: 400 });
      }
      if (/\s/.test(body.code)) {
        return NextResponse.json({ error: "Coupon codes cannot contain spaces" }, { status: 400 });
      }

      const customId = body.id;
      const code = body.code.toUpperCase();
      const description = body.description || "";
      const discount = parseFloat(body.discount) || 0;
      const type = body.type === "flat" ? "flat" : "percentage";
      const minOrder = parseFloat(body.minOrder) || 0;
      const maxUses = body.maxUses != null ? parseInt(body.maxUses) : null;
      const validUntil = body.validUntil ? new Date(body.validUntil) : null;
      const active = body.active !== false ? 1 : 0;

      const insertResult = await db.query(
        `INSERT INTO coupons (
          custom_id, code, description, discount, type, min_order, 
          max_uses, valid_until, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
        [customId, code, description, discount, type, minOrder, maxUses, validUntil, active]
      );
      
      const rows = await db.query("SELECT * FROM coupons WHERE id = ?", [insertResult.insertId]);
      const c = rows[0];
      result = {
        ...c,
        customId: c.custom_id,
        minOrder: c.min_order,
        maxUses: c.max_uses,
        usedCount: c.used_count,
        validUntil: c.valid_until,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      };
    }

    revalidateTag("coupons");
    return NextResponse.json(
      Array.isArray(result) ? result.map(normalizeCoupon) : normalizeCoupon(result),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Coupons Error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create coupon(s)" }, { status: 500 });
  }
}
