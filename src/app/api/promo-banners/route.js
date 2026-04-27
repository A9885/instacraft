import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { revalidateTag } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

// Ensure table exists on first access
async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS promo_banners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      custom_id VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      subtitle VARCHAR(200),
      description TEXT,
      badge VARCHAR(100),
      badge_type ENUM('sale','launch','upcoming','new','hot','limited') DEFAULT 'new',
      image VARCHAR(500),
      cta_text VARCHAR(100) DEFAULT 'Shop Now',
      cta_link VARCHAR(500),
      active TINYINT(1) DEFAULT 1,
      sort_order INT DEFAULT 0,
      created_at DATETIME(3) DEFAULT NOW(3),
      updated_at DATETIME(3) DEFAULT NOW(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

export async function GET(request) {
  try {
    await ensureTable();
    const url = new URL(request.url);
    const showAll = url.searchParams.get("all") === "true";

    if (showAll) {
      const { error } = await requireAdmin(request);
      if (error) return error;
    }

    const sql = showAll
      ? "SELECT * FROM promo_banners ORDER BY sort_order ASC"
      : "SELECT * FROM promo_banners WHERE active = 1 ORDER BY sort_order ASC";

    const rows = await db.query(sql);
    return NextResponse.json(rows.map(normalizeBanner));
  } catch (error) {
    console.error("GET PromoBanners Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch promo banners" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    await ensureTable();

    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Expected an array of banners" },
        { status: 400 },
      );
    }

    // ── MEDIA CLEANUP ──
    // 1. Get all unique local images before update
    const oldBanners = await db.query("SELECT image FROM promo_banners");
    const oldMedia = new Set();
    oldBanners.forEach((b) => {
      if (b.image?.startsWith("/images/")) oldMedia.add(b.image);
    });

    await db.transaction(async (conn) => {
      await conn.execute("DELETE FROM promo_banners");
      for (let idx = 0; idx < body.length; idx++) {
        const b = body[idx];
        await conn.execute(
          `INSERT INTO promo_banners 
            (custom_id, title, subtitle, description, badge, badge_type, image, cta_text, cta_link, active, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
          [
            b.id || b._id || `pb-${Date.now()}-${idx}`,
            b.title || "Untitled Banner",
            b.subtitle || null,
            b.description || null,
            b.badge || null,
            b.badgeType || b.badge_type || "new",
            b.image || null,
            b.ctaText || b.cta_text || "Shop Now",
            b.ctaLink || b.cta_link || "/shop",
            b.active !== false ? 1 : 0,
            idx,
          ],
        );
      }
    });

    // 2. Identify media that is NO LONGER used in the promo_banners table
    const newMedia = new Set();
    body.forEach((b) => {
      if (b.image?.startsWith("/images/")) newMedia.add(b.image);
    });

    const orphanedMedia = Array.from(oldMedia).filter((m) => !newMedia.has(m));

    // 3. For each orphaned file, check if it's used in OTHER tables before deleting
    for (const mediaUrl of orphanedMedia) {
      try {
        // Check if used in hero slides, product images, etc.
        const [hsVideoUsage] = await db.query(
          "SELECT COUNT(*) as count FROM hero_slides WHERE video = ?",
          [mediaUrl],
        );
        const [hsPosterUsage] = await db.query(
          "SELECT COUNT(*) as count FROM hero_slides WHERE poster = ?",
          [mediaUrl],
        );
        const [piUsage] = await db.query(
          "SELECT COUNT(*) as count FROM product_images WHERE url = ?",
          [mediaUrl],
        );

        const totalUsage =
          (hsVideoUsage?.count || 0) +
          (hsPosterUsage?.count || 0) +
          (piUsage?.count || 0);

        if (totalUsage === 0) {
          const filePath = path.join(process.cwd(), "public", mediaUrl);
          await unlink(filePath).catch((err) =>
            console.warn(
              `Could not delete orphaned file ${filePath}:`,
              err.message,
            ),
          );
          console.log(`[Cleanup] Deleted unused banner image: ${mediaUrl}`);
        }
      } catch (cleanupErr) {
        console.error(
          `[Cleanup] Error during media cleanup for ${mediaUrl}:`,
          cleanupErr,
        );
      }
    }

    revalidateTag("promo-banners");

    const rows = await db.query(
      "SELECT * FROM promo_banners ORDER BY sort_order ASC",
    );
    return NextResponse.json(rows.map(normalizeBanner), { status: 200 });
  } catch (error) {
    console.error("PUT PromoBanners Error:", error);
    return NextResponse.json(
      { error: "Failed to update promo banners" },
      { status: 500 },
    );
  }
}

function normalizeBanner(b) {
  return {
    ...b,
    _id: b.id.toString(),
    id: b.custom_id || b.id.toString(),
    badgeType: b.badge_type,
    ctaText: b.cta_text,
    ctaLink: b.cta_link,
    sortOrder: b.sort_order,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}
