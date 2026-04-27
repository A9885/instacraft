import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { normalizeOffer } from "@/lib/normalize";

export const dynamic = "force-dynamic";

// Find by MySQL integer id or customId string
async function getOfferByIdentifier(identifier) {
  let offer = null;
  const numericId = parseInt(identifier);
  if (!isNaN(numericId)) {
    const rows = await db.query("SELECT * FROM offers WHERE id = ?", [numericId]);
    if (rows.length > 0) offer = rows[0];
  }

  if (!offer) {
    const rows = await db.query("SELECT * FROM offers WHERE custom_id = ?", [identifier]);
    if (rows.length > 0) offer = rows[0];
  }

  if (!offer) return null;

  return {
    ...offer,
    customId: offer.custom_id,
    bgColor: offer.bg_color,
    textColor: offer.text_color,
    validUntil: offer.valid_until,
    createdAt: offer.created_at,
    updatedAt: offer.updated_at
  };
}

// ── PATCH : update offer fields ───────────────────────────────────────────────
export async function PATCH(request, { params }) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const resolvedParams = await params;
    const body = await request.json();

    const offer = await getOfferByIdentifier(resolvedParams.id);
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    const fields = [];
    const values = [];

    if (body.active !== undefined) {
      fields.push("active = ?");
      values.push(body.active ? 1 : 0);
    }
    if (body.featured !== undefined) {
      fields.push("featured = ?");
      values.push(body.featured ? 1 : 0);
    }
    if (body.title !== undefined) {
      fields.push("title = ?");
      values.push(body.title);
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
    if (body.category !== undefined) {
      fields.push("category = ?");
      values.push(body.category);
    }
    if (body.icon !== undefined) {
      fields.push("icon = ?");
      values.push(body.icon);
    }
    if (body.image !== undefined) {
      fields.push("image = ?");
      values.push(body.image);
    }
    if (body.bgColor !== undefined) {
      fields.push("bg_color = ?");
      values.push(body.bgColor);
    }
    if (body.textColor !== undefined) {
      fields.push("text_color = ?");
      values.push(body.textColor);
    }
    if (body.validUntil !== undefined) {
      fields.push("valid_until = ?");
      values.push(body.validUntil ? new Date(body.validUntil) : null);
    }

    if (fields.length > 0) {
      values.push(offer.id);
      await db.query(`UPDATE offers SET ${fields.join(", ")}, updated_at = NOW(3) WHERE id = ?`, values);
    }

    const updated = await getOfferByIdentifier(offer.id);
    revalidateTag("offers");
    return NextResponse.json(normalizeOffer(updated));
  } catch (error) {
    console.error("PATCH Offer Error:", error);
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 });
  }
}

// ── DELETE : remove an offer ──────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const resolvedParams = await params;
    const offer = await getOfferByIdentifier(resolvedParams.id);
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });

    await db.query("DELETE FROM offers WHERE id = ?", [offer.id]);

    revalidateTag("offers");
    return NextResponse.json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error("DELETE Offer Error:", error);
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 });
  }
}
