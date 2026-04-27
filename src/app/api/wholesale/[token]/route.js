import { NextResponse } from "next/server";
import db from "@/lib/db";
import { normalizeProduct } from "@/lib/normalize";
import crypto from "crypto";

// GET: Publicly accessible endpoint for wholesalers to view a catalog using the secret token
export async function GET(request, { params }) {
  try {
    const { token } = await params;

    // 1. Find the catalog — active only
    const catalogRows = await db.query(
      "SELECT * FROM wholesale_catalogs WHERE access_token = ? AND is_active = 1 LIMIT 1",
      [token]
    );
    const catalog = catalogRows[0];

    // 2. Does it exist?
    if (!catalog) {
      return NextResponse.json({ error: "This catalog is invalid, disabled, or does not exist." }, { status: 404 });
    }

    // 3. Has it expired?
    if (catalog.expiry_date && new Date() > catalog.expiry_date) {
      return NextResponse.json({ error: "This wholesale offer has expired." }, { status: 403 });
    }

    // 4. Browser locking logic
    const cookieStore = request.cookies;
    const existingStamp = cookieStore.get("wholesale_device_stamp");
    let currentStamp = existingStamp?.value;
    let needsNewStamp = false;

    if (!currentStamp) {
      currentStamp = crypto.randomUUID();
      needsNewStamp = true;
    }

    if (!catalog.locked_to_device) {
      await db.query(
        "UPDATE wholesale_catalogs SET locked_to_device = ?, updated_at = NOW(3) WHERE id = ?",
        [currentStamp, catalog.id]
      );
    } else if (catalog.locked_to_device !== currentStamp) {
      return NextResponse.json({
        error: "Access Denied: This private link has already been claimed by another device.",
      }, { status: 403 });
    }

    // 5. Fetch and normalize products
    const productsRaw = await db.query(
      "SELECT * FROM wholesale_catalog_products WHERE catalog_id = ?",
      [catalog.id]
    );

    const productIds = productsRaw.map(p => p.product_id);
    let productsMap = {};
    if (productIds.length > 0) {
      const productsInfoRaw = await db.query(`SELECT * FROM products WHERE id IN (${productIds.join(",")})`);
      const imagesRaw = await db.query(`SELECT * FROM product_images WHERE product_id IN (${productIds.join(",")}) ORDER BY position ASC`);
      const tagsRaw = await db.query(`SELECT * FROM product_tags WHERE product_id IN (${productIds.join(",")})`);

      productsMap = productsInfoRaw.reduce((acc, p) => {
        const mapped = {
          ...p,
          salePrice: p.sale_price,
          ctaType: p.cta_type,
          ctaLabel: p.cta_label,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          images: imagesRaw.filter(img => img.product_id === p.id),
          tags: tagsRaw.filter(t => t.product_id === p.id)
        };
        acc[p.id] = normalizeProduct(mapped);
        return acc;
      }, {});
    }

    const normalizedCatalog = {
      ...catalog,
      _id: catalog.id.toString(),
      accessToken: catalog.access_token,
      expiryDate: catalog.expiry_date,
      isActive: !!catalog.is_active,
      lockedToDevice: catalog.locked_to_device || currentStamp,
      createdAt: catalog.created_at,
      updatedAt: catalog.updated_at,
      products: productsRaw.map((p) => ({
        ...p,
        _id: p.id.toString(),
        wholesalePrice: parseFloat(p.wholesale_price.toString()),
        product: productsMap[p.product_id] || null,
      })),
    };

    const response = NextResponse.json({ success: true, catalog: normalizedCatalog }, { status: 200 });

    if (needsNewStamp) {
      response.cookies.set("wholesale_device_stamp", currentStamp, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch (error) {
    console.error("Fetch Public Wholesale Catalog Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
