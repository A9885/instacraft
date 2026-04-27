import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureTable() {
  // Drop and re-create to support multi-row. Safe because we always replace all rows.
  await db.query(`
    CREATE TABLE IF NOT EXISTS sale_banners (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      custom_id   VARCHAR(100) UNIQUE NOT NULL,
      enabled     TINYINT(1)    NOT NULL DEFAULT 1,
      message     VARCHAR(300)  NOT NULL DEFAULT '',
      cta_text    VARCHAR(100)  NOT NULL DEFAULT '',
      cta_link    VARCHAR(300)  NOT NULL DEFAULT '',
      bg_color    VARCHAR(20)   NOT NULL DEFAULT '#7A1F1F',
      text_color  VARCHAR(20)   NOT NULL DEFAULT '#FFFFFF',
      dismissible TINYINT(1)    NOT NULL DEFAULT 1,
      expires_at  DATETIME      NULL DEFAULT NULL,
      sort_order  INT           NOT NULL DEFAULT 0,
      updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

function rowToBanner(row) {
  if (!row) return null;
  return {
    _id:        row.id.toString(),
    id:         row.custom_id || row.id.toString(),
    enabled:    !!row.enabled,
    message:    row.message,
    ctaText:    row.cta_text,
    ctaLink:    row.cta_link,
    bgColor:    row.bg_color,
    textColor:  row.text_color,
    dismissible:!!row.dismissible,
    expiresAt:  row.expires_at ? new Date(row.expires_at).toISOString() : null,
    sortOrder:  row.sort_order,
    updatedAt:  row.updated_at ? new Date(row.updated_at).toISOString() : null,
  };
}

// ── GET — public ─────────────────────────────────────────────────────────────
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
      ? "SELECT * FROM sale_banners ORDER BY sort_order ASC"
      : "SELECT * FROM sale_banners WHERE enabled = 1 ORDER BY sort_order ASC";

    const rows = await db.query(sql);

    // Backwards compatibility: if old single-row table exists, return [] 
    return NextResponse.json(rows.map(rowToBanner));
  } catch (error) {
    console.error("GET sale-banner error:", error);
    // Return empty array so the storefront never crashes
    return NextResponse.json([]);
  }
}

// ── POST — admin only, replace all rows ──────────────────────────────────────
export async function POST(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    await ensureTable();

    const body = await request.json();
    const banners = Array.isArray(body) ? body : [body];

    const parseDate = (d) => {
      if (!d) return null;
      const pd = new Date(d);
      return isNaN(pd.getTime()) ? null : pd;
    };

    await db.transaction(async (conn) => {
      await conn.execute("DELETE FROM sale_banners");
      for (let idx = 0; idx < banners.length; idx++) {
        const b = banners[idx];
        await conn.execute(
          `INSERT INTO sale_banners
            (custom_id, enabled, message, cta_text, cta_link, bg_color, text_color, dismissible, expires_at, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            b.id || b._id || `sb-${Date.now()}-${idx}`,
            b.enabled !== false ? 1 : 0,
            (b.message  || "").slice(0, 300),
            (b.ctaText  || "").slice(0, 100),
            (b.ctaLink  || "").slice(0, 300),
            (b.bgColor  || "#7A1F1F").slice(0, 20),
            (b.textColor|| "#FFFFFF").slice(0, 20),
            b.dismissible !== false ? 1 : 0,
            parseDate(b.expiresAt),
            idx,
          ]
        );
      }
    });

    revalidateTag("sale-banner");
    const rows = await db.query("SELECT * FROM sale_banners ORDER BY sort_order ASC");
    return NextResponse.json(rows.map(rowToBanner), { status: 200 });
  } catch (error) {
    console.error("POST sale-banner error:", error);
    return NextResponse.json({ error: "Failed to save banner" }, { status: 500 });
  }
}
