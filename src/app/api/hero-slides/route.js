import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { normalizeHeroSlide } from "@/lib/normalize";
import { unlink } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const showAll = url.searchParams.get("all") === "true";

    if (showAll) {
      const { error } = await requireAdmin(request);
      if (error) return error;
    }

    const query = showAll 
      ? "SELECT * FROM hero_slides ORDER BY sort_order ASC" 
      : "SELECT * FROM hero_slides WHERE active = 1 ORDER BY sort_order ASC";
    
    const rows = await db.query(query);
    const slides = rows.map(s => ({
      ...s,
      customId: s.custom_id,
      productSlug: s.product_slug,
      sortOrder: s.sort_order,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));

    return NextResponse.json(slides.map(normalizeHeroSlide));
  } catch (error) {
    console.error("GET HeroSlides Error:", error);
    return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array of hero slides" }, { status: 400 });
    }

    // ── MEDIA CLEANUP ──
    // 1. Get all unique local videos/posters before update
    const oldSlides = await db.query("SELECT video, poster FROM hero_slides");
    const oldMedia = new Set();
    oldSlides.forEach(s => {
      if (s.video?.startsWith('/videos/')) oldMedia.add(s.video);
      if (s.poster?.startsWith('/images/')) oldMedia.add(s.poster);
    });

    // Delete all → insert new batch
    await db.transaction(async (conn) => {
      await conn.execute("DELETE FROM hero_slides");
      for (let idx = 0; idx < body.length; idx++) {
        const h = body[idx];
        await conn.execute(
          `INSERT INTO hero_slides (
            custom_id, title, subtitle, description, badge, video, poster, 
            product_slug, active, sort_order, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
          [
            h.id || h._id || `h-${Date.now()}-${idx}`,
            h.title || "",
            h.subtitle || null,
            h.description || null,
            h.badge || null,
            h.video || null,
            h.poster || null,
            h.productSlug || null,
            h.active !== false ? 1 : 0,
            parseInt(h.order) || idx
          ]
        );
      }
    });

    // 2. Identify media that is NO LONGER used in the hero_slides table
    const newMedia = new Set();
    body.forEach(h => {
      if (h.video?.startsWith('/videos/')) newMedia.add(h.video);
      if (h.poster?.startsWith('/images/')) newMedia.add(h.poster);
    });

    const orphanedMedia = Array.from(oldMedia).filter(m => !newMedia.has(m));

    // 3. For each orphaned file, check if it's used in OTHER tables before deleting
    for (const mediaUrl of orphanedMedia) {
      try {
        // Check if used in products, promo banners, or other config
        const [pbUsage] = await db.query("SELECT COUNT(*) as count FROM promo_banners WHERE image = ?", [mediaUrl]);
        const [piUsage] = await db.query("SELECT COUNT(*) as count FROM product_images WHERE url = ?", [mediaUrl]);
        
        const totalUsage = (pbUsage?.count || 0) + (piUsage?.count || 0);
        
        if (totalUsage === 0) {
          const filePath = path.join(process.cwd(), 'public', mediaUrl);
          await unlink(filePath).catch(err => console.warn(`Could not delete orphaned file ${filePath}:`, err.message));
          console.log(`[Cleanup] Deleted unused hero media: ${mediaUrl}`);
        }
      } catch (cleanupErr) {
        console.error(`[Cleanup] Error during media cleanup for ${mediaUrl}:`, cleanupErr);
      }
    }

    const insertedRows = await db.query("SELECT * FROM hero_slides ORDER BY sort_order ASC");
    const inserted = insertedRows.map(s => ({
      ...s,
      customId: s.custom_id,
      productSlug: s.product_slug,
      sortOrder: s.sort_order,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));

    revalidateTag("hero-slides");
    return NextResponse.json(inserted.map(normalizeHeroSlide), { status: 200 });
  } catch (error) {
    console.error("PUT HeroSlides Error:", error);
    return NextResponse.json({ error: "Failed to update hero slides" }, { status: 500 });
  }
}
