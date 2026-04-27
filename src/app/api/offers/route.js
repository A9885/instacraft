import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { normalizeOffer } from "@/lib/normalize";

export const dynamic = "force-dynamic";

// ── GET : list all offers (Admin Only) ───────────────────────────────────────
export async function GET(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const rows = await db.query("SELECT * FROM offers ORDER BY created_at DESC");
    const offers = rows.map(o => ({
      ...o,
      customId: o.custom_id,
      bgColor: o.bg_color,
      textColor: o.text_color,
      validUntil: o.valid_until,
      createdAt: o.created_at,
      updatedAt: o.updated_at
    }));

    return NextResponse.json(offers.map(normalizeOffer));
  } catch (error) {
    console.error("Admin GET Offers Error:", error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

// ── POST : create offer(s) ────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    let result;

    if (Array.isArray(body)) {
      // Bulk insert
      await db.transaction(async (conn) => {
        for (const o of body) {
          const customId = o.id || o._id || `off-${Date.now()}`;
          const title = o.title || "";
          const description = o.description || "";
          const discount = parseFloat(o.discount) || 0;
          const type = ["percentage", "flat", "shipping"].includes(o.type) ? o.type : "percentage";
          const category = o.category || null;
          const icon = o.icon || null;
          const image = o.image || null;
          const bgColor = o.bgColor || "#7A1F1F";
          const textColor = o.textColor || "#FFFFFF";
          const validUntil = o.validUntil ? new Date(o.validUntil) : null;
          const active = o.active !== false ? 1 : 0;
          const featured = o.featured ? 1 : 0;

          await conn.execute(
            `INSERT IGNORE INTO offers (
              custom_id, title, description, discount, type, category, icon, 
              image, bg_color, text_color, valid_until, active, featured, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
            [customId, title, description, discount, type, category, icon, image, bgColor, textColor, validUntil, active, featured]
          );
        }
      });
      const rows = await db.query("SELECT * FROM offers ORDER BY created_at DESC");
      result = rows.map(o => ({
        ...o,
        customId: o.custom_id,
        bgColor: o.bg_color,
        textColor: o.text_color,
        validUntil: o.valid_until,
        createdAt: o.created_at,
        updatedAt: o.updated_at
      }));
    } else {
      if (!body.title || !body.id) {
        return NextResponse.json({ error: "Missing required fields (title, id)" }, { status: 400 });
      }

      const customId = body.id;
      const title = body.title;
      const description = body.description;
      const discount = parseFloat(body.discount) || 0;
      const type = ["percentage", "flat", "shipping"].includes(body.type) ? body.type : "percentage";
      const category = body.category || null;
      const icon = body.icon || null;
      const image = body.image || null;
      const bgColor = body.bgColor || "#7A1F1F";
      const textColor = body.textColor || "#FFFFFF";
      const validUntil = body.validUntil ? new Date(body.validUntil) : null;
      const active = body.active !== false ? 1 : 0;
      const featured = body.featured ? 1 : 0;

      const insertResult = await db.query(
        `INSERT INTO offers (
          custom_id, title, description, discount, type, category, icon, 
          image, bg_color, text_color, valid_until, active, featured, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
        [customId, title, description, discount, type, category, icon, image, bgColor, textColor, validUntil, active, featured]
      );
      
      const rows = await db.query("SELECT * FROM offers WHERE id = ?", [insertResult.insertId]);
      const o = rows[0];
      result = {
        ...o,
        customId: o.custom_id,
        bgColor: o.bg_color,
        textColor: o.text_color,
        validUntil: o.valid_until,
        createdAt: o.created_at,
        updatedAt: o.updated_at
      };
    }

    revalidateTag("offers");
    return NextResponse.json(
      Array.isArray(result) ? result.map(normalizeOffer) : normalizeOffer(result),
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Offers Error:", error);
    return NextResponse.json({ error: "Failed to create offer(s)" }, { status: 500 });
  }
}
