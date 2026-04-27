import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { normalizeProduct } from "@/lib/normalize";
import crypto from "crypto";

async function getCatalogsWithProducts(id = null) {
  let query = "SELECT * FROM wholesale_catalogs";
  let params = [];
  if (id) {
    query += " WHERE id = ?";
    params.push(id);
  } else {
    query += " ORDER BY created_at DESC";
  }

  const catalogsRaw = await db.query(query, params);
  if (catalogsRaw.length === 0) return id ? null : [];

  const catalogIds = catalogsRaw.map(c => c.id);
  const productsRaw = await db.query(
    `SELECT * FROM wholesale_catalog_products WHERE catalog_id IN (${catalogIds.join(",")})`
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

  const catalogs = catalogsRaw.map(wc => ({
    ...wc,
    _id: wc.id.toString(),
    accessToken: wc.access_token,
    expiryDate: wc.expiry_date,
    isActive: !!wc.is_active,
    createdAt: wc.created_at,
    updatedAt: wc.updated_at,
    products: productsRaw.filter(p => p.catalog_id === wc.id).map(p => ({
      ...p,
      _id: p.id.toString(),
      wholesalePrice: parseFloat(p.wholesale_price.toString()),
      product: productsMap[p.product_id] || null
    }))
  }));

  return id ? catalogs[0] : catalogs;
}

// GET: Fetch all catalogs for admin dashboard
export async function GET(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const catalogs = await getCatalogsWithProducts();
    return NextResponse.json({ success: true, catalogs: catalogs }, { status: 200 });
  } catch (error) {
    console.error("Fetch Wholesale Catalogs Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new wholesale catalog
export async function POST(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const accessToken = crypto.randomBytes(4).toString("hex");

    const newCatalogId = await db.transaction(async (conn) => {
      const [insertResult] = await conn.execute(
        `INSERT INTO wholesale_catalogs (
          name, description, access_token, expiry_date, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(3), NOW(3))`,
        [
          body.name,
          body.description || null,
          accessToken,
          body.expiryDate ? new Date(body.expiryDate) : null,
          body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1
        ]
      );

      const catalogId = insertResult.insertId;

      for (const p of (body.products || [])) {
        await conn.execute(
          `INSERT INTO wholesale_catalog_products (
            catalog_id, product_id, wholesale_price
          ) VALUES (?, ?, ?)`,
          [catalogId, parseInt(p.product), parseFloat(p.wholesalePrice)]
        );
      }

      return catalogId;
    });

    const catalog = await getCatalogsWithProducts(newCatalogId);
    return NextResponse.json({ success: true, catalog }, { status: 201 });
  } catch (error) {
    console.error("Create Wholesale Catalog Error:", error);
    return NextResponse.json({ error: "Failed to create catalog" }, { status: 500 });
  }
}
