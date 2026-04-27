import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { normalizeProduct } from "@/lib/normalize";

async function getCatalogWithProducts(id) {
  const catalogsRaw = await db.query("SELECT * FROM wholesale_catalogs WHERE id = ?", [id]);
  const wc = catalogsRaw[0];
  if (!wc) return null;

  const productsRaw = await db.query(
    "SELECT * FROM wholesale_catalog_products WHERE catalog_id = ?",
    [id]
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

  return {
    ...wc,
    _id: wc.id.toString(),
    accessToken: wc.access_token,
    expiryDate: wc.expiry_date,
    isActive: !!wc.is_active,
    createdAt: wc.created_at,
    updatedAt: wc.updated_at,
    products: productsRaw.map(p => ({
      ...p,
      _id: p.id.toString(),
      wholesalePrice: parseFloat(p.wholesale_price.toString()),
      product: productsMap[p.product_id] || null
    }))
  };
}

// GET: Fetch single catalog with full product details
export async function GET(request, { params }) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;
    const catalog = await getCatalogWithProducts(parseInt(id));

    if (!catalog) return NextResponse.json({ error: "Catalog not found" }, { status: 404 });

    return NextResponse.json({ success: true, catalog }, { status: 200 });
  } catch (error) {
    console.error("Fetch Single Catalog Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT: Update catalog (only isActive and expiryDate — locked by design)
export async function PUT(request, { params }) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const fields = [];
    const values = [];

    if (body.isActive !== undefined) {
      fields.push("is_active = ?");
      values.push(body.isActive ? 1 : 0);
    }
    if (body.expiryDate !== undefined) {
      fields.push("expiry_date = ?");
      values.push(body.expiryDate ? new Date(body.expiryDate) : null);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No updateable fields provided" }, { status: 400 });
    }

    values.push(parseInt(id));
    const result = await db.query(
      `UPDATE wholesale_catalogs SET ${fields.join(", ")}, updated_at = NOW(3) WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    const updatedCatalog = await db.query("SELECT * FROM wholesale_catalogs WHERE id = ?", [parseInt(id)]);
    const wc = updatedCatalog[0];

    return NextResponse.json({
      success: true,
      catalog: { 
        ...wc, 
        _id: wc.id.toString(),
        accessToken: wc.access_token,
        expiryDate: wc.expiry_date,
        isActive: !!wc.is_active,
        createdAt: wc.created_at,
        updatedAt: wc.updated_at
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Update Catalog Error:", error);
    return NextResponse.json({ error: "Failed to update catalog" }, { status: 500 });
  }
}

// DELETE: Permanently delete a catalog (cascade deletes products too)
export async function DELETE(request, { params }) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;

    const result = await db.query("DELETE FROM wholesale_catalogs WHERE id = ?", [parseInt(id)]);
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Catalog not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Catalog deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Catalog Error:", error);
    return NextResponse.json({ error: "Failed to delete catalog" }, { status: 500 });
  }
}
