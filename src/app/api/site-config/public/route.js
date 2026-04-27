import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db.query("SELECT * FROM site_config LIMIT 1");
    const config = rows[0];
    
    if (!config) {
      return NextResponse.json({ error: "Site configuration not found" }, { status: 404 });
    }

    const normalized = {
      ...config,
      _id: config.id.toString(),
      promoBannerText: config.promo_banner_text,
      promoBannerActive: !!config.promo_banner_active,
      shippingFee: parseFloat(config.shipping_fee.toString()),
      freeShippingThreshold: parseFloat(config.free_shipping_threshold.toString()),
      maxUploadSize: parseFloat((config.max_upload_size || 30).toString()),
      createdAt: config.created_at,
      updatedAt: config.updated_at
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("GET Public Site Config Error:", error);
    return NextResponse.json({ error: "Failed to fetch site config" }, { status: 500 });
  }
}
