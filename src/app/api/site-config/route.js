import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { revalidateTag } from "next/cache";
import db from "@/lib/db";
import { normalizeSiteConfig } from "@/lib/normalize";

export const revalidate = 60;

async function getConfig() {
  const rows = await db.query("SELECT * FROM site_config LIMIT 1");
  if (rows.length === 0) return null;
  const config = rows[0];
  return {
    ...config,
    promoBannerText: config.promo_banner_text,
    promoBannerActive: config.promo_banner_active,
    shippingFee: config.shipping_fee,
    freeShippingThreshold: config.free_shipping_threshold,
    maxUploadSize: config.max_upload_size,
    createdAt: config.created_at,
    updatedAt: config.updated_at
  };
}

export async function GET() {
  try {
    let config = await getConfig();
    if (!config) {
      const result = await db.query("INSERT INTO site_config (created_at, updated_at) VALUES (NOW(3), NOW(3))");
      const rows = await db.query("SELECT * FROM site_config WHERE id = ?", [result.insertId]);
      const newConfig = rows[0];
      config = {
        ...newConfig,
        promoBannerText: newConfig.promo_banner_text,
        promoBannerActive: newConfig.promo_banner_active,
        shippingFee: newConfig.shipping_fee,
        freeShippingThreshold: newConfig.free_shipping_threshold,
        maxUploadSize: newConfig.max_upload_size,
        createdAt: newConfig.created_at,
        updatedAt: newConfig.updated_at
      };
    }
    return NextResponse.json(normalizeSiteConfig(config));
  } catch (error) {
    console.error("GET /api/site-config error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch site configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const data = await request.json();

    let config = await getConfig();
    if (!config) {
      const result = await db.query(
        `INSERT INTO site_config (
          promo_banner_text, promo_banner_active, email, phone, whatsapp, address, 
          shipping_fee, free_shipping_threshold, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
        [
          data.promoBannerText || null,
          data.promoBannerActive !== undefined ? (data.promoBannerActive ? 1 : 0) : 0,
          data.email || null,
          data.phone || null,
          data.whatsapp || null,
          data.address || null,
          data.shippingFee != null ? parseFloat(data.shippingFee) : null,
          data.freeShippingThreshold != null ? parseFloat(data.freeShippingThreshold) : null,
          data.maxUploadSize != null ? parseFloat(data.maxUploadSize) : 30
        ]
      );
      const rows = await db.query("SELECT * FROM site_config WHERE id = ?", [result.insertId]);
      const newConfig = rows[0];
      config = {
        ...newConfig,
        promoBannerText: newConfig.promo_banner_text,
        promoBannerActive: newConfig.promo_banner_active,
        shippingFee: newConfig.shipping_fee,
        freeShippingThreshold: newConfig.free_shipping_threshold,
        createdAt: newConfig.created_at,
        updatedAt: newConfig.updated_at
      };
    } else {
      const fields = [];
      const values = [];

      if (data.promoBannerText !== undefined) {
        fields.push("promo_banner_text = ?");
        values.push(data.promoBannerText);
      }
      if (data.promoBannerActive !== undefined) {
        fields.push("promo_banner_active = ?");
        values.push(data.promoBannerActive ? 1 : 0);
      }
      if (data.email !== undefined) {
        fields.push("email = ?");
        values.push(data.email);
      }
      if (data.phone !== undefined) {
        fields.push("phone = ?");
        values.push(data.phone);
      }
      if (data.whatsapp !== undefined) {
        fields.push("whatsapp = ?");
        values.push(data.whatsapp);
      }
      if (data.address !== undefined) {
        fields.push("address = ?");
        values.push(data.address);
      }
      if (data.shippingFee !== undefined) {
        fields.push("shipping_fee = ?");
        values.push(parseFloat(data.shippingFee));
      }
      if (data.freeShippingThreshold !== undefined) {
        fields.push("free_shipping_threshold = ?");
        values.push(parseFloat(data.freeShippingThreshold));
      }
      if (data.maxUploadSize !== undefined) {
        fields.push("max_upload_size = ?");
        values.push(parseFloat(data.maxUploadSize));
      }

      if (fields.length > 0) {
        values.push(config.id);
        await db.query(`UPDATE site_config SET ${fields.join(", ")}, updated_at = NOW(3) WHERE id = ?`, values);
        config = await getConfig();
      }
    }

    revalidateTag("site-config");
    return NextResponse.json({ success: true, siteConfig: normalizeSiteConfig(config) });
  } catch (error) {
    console.error("PUT /api/site-config error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update site configuration" },
      { status: 500 }
    );
  }
}
