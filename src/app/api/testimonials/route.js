import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { normalizeTestimonial } from "@/lib/normalize";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.query("SELECT * FROM testimonials");
    const items = rows.map(t => ({
      ...t,
      customId: t.custom_id,
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }));
    return NextResponse.json(items.map(normalizeTestimonial));
  } catch (error) {
    console.error("GET Testimonials Error:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of testimonials" }, { status: 400 });
    }

    // Delete all existing → insert new batch
    const insertedIds = await db.transaction(async (conn) => {
      await conn.execute("DELETE FROM testimonials");
      const ids = [];
      for (let idx = 0; idx < body.length; idx++) {
        const t = body[idx];
        const [result] = await conn.execute(
          `INSERT INTO testimonials (
            custom_id, name, city, avatar, rating, text, product, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
          [
            t.id || t._id || `t-${Date.now()}`,
            t.name || "Anonymous",
            t.city || null,
            t.avatar || null,
            parseInt(t.rating) || 5,
            t.text || "",
            t.product || null
          ]
        );
        ids.push(result.insertId);
      }
      return ids;
    });

    const insertedRows = await db.query("SELECT * FROM testimonials");
    const inserted = insertedRows.map(t => ({
      ...t,
      customId: t.custom_id,
      createdAt: t.created_at,
      updatedAt: t.updated_at
    }));

    revalidateTag("testimonials");
    return NextResponse.json(inserted.map(normalizeTestimonial), { status: 200 });
  } catch (error) {
    console.error("PUT Testimonials Error:", error);
    return NextResponse.json({ error: "Failed to update testimonials" }, { status: 500 });
  }
}
