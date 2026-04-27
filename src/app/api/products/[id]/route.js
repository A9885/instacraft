import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { normalizeProduct } from "@/lib/normalize";

export const dynamic = "force-dynamic";

// Find by MySQL integer id or slug (slug used as fallback)
// Find by MySQL integer id or slug
async function getProductByIdentifier(identifier) {
  let product = null;
  const numericId = parseInt(identifier);

  if (!isNaN(numericId)) {
    const rows = await db.query("SELECT * FROM products WHERE id = ?", [numericId]);
    if (rows.length > 0) product = rows[0];
  }

  if (!product) {
    const rows = await db.query("SELECT * FROM products WHERE slug = ?", [identifier]);
    if (rows.length > 0) product = rows[0];
  }

  if (!product) return null;

  // Map database snake_case to camelCase expected by normalization
  const mappedProduct = {
    ...product,
    salePrice: product.sale_price,
    ctaType: product.cta_type,
    ctaLabel: product.cta_label,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };

  // Fetch images and tags
  const images = await db.query("SELECT * FROM product_images WHERE product_id = ? ORDER BY position ASC", [product.id]);
  const tags = await db.query("SELECT * FROM product_tags WHERE product_id = ?", [product.id]);

  return {
    ...mappedProduct,
    images: images,
    tags: tags,
  };
}

// ── GET : get single product ─────────────────────────────────────────────────
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const product = await getProductByIdentifier(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(normalizeProduct(product));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// ── PATCH : update product ───────────────────────────────────────────────────
export async function PATCH(req, { params }) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const { id } = await params;
    const body = await req.json();

    const existing = await getProductByIdentifier(id);
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Price validation
    const newPrice = body.price !== undefined ? Number(body.price) : parseFloat(existing.price.toString());
    const newSalePrice = body.salePrice !== undefined ? Number(body.salePrice) : (existing.salePrice != null ? parseFloat(existing.salePrice.toString()) : null);

    if (body.price !== undefined && (isNaN(newPrice) || newPrice <= 0)) {
      return NextResponse.json({ error: "Price must be a positive number" }, { status: 400 });
    }
    if (newSalePrice !== null && newSalePrice !== undefined) {
      if (isNaN(newSalePrice) || newSalePrice < 0) return NextResponse.json({ error: "Invalid sale price" }, { status: 400 });
      if (newSalePrice > newPrice) return NextResponse.json({ error: "Sale price cannot be higher than regular price" }, { status: 400 });
    }
    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (isNaN(stock) || stock < 0) return NextResponse.json({ error: "Stock must be a non-negative number" }, { status: 400 });
    }

    const ALLOWED_CATEGORIES = ["wall-hangings", "table-top-mount", "wall-table-combo", "gift-items", "custom-creations"];
    if (body.category && !ALLOWED_CATEGORIES.includes(body.category)) {
      return NextResponse.json({ error: "Invalid product category" }, { status: 400 });
    }

    const scalarFields = {
      title: "title",
      slug: "slug",
      description: "description",
      category: "category",
      stock: "stock",
      artisan: "artisan",
      material: "material",
      size: "size",
      color: "color",
      quantity: "quantity",
      type: "type",
      video: "video",
      ctaType: "cta_type",
      ctaLabel: "cta_label",
      featured: "featured",
      rating: "rating",
      reviews: "reviews",
      weight: "weight",
      length: "length",
      breadth: "breadth",
      height: "height"
    };

    const updateFields = [];
    const values = [];

    for (const [key, col] of Object.entries(scalarFields)) {
      if (body[key] !== undefined) {
        updateFields.push(`${col} = ?`);
        values.push(body[key]);
      }
    }
    if (body.price !== undefined) {
      updateFields.push("price = ?");
      values.push(newPrice);
    }
    if (body.salePrice !== undefined) {
      updateFields.push("sale_price = ?");
      values.push(newSalePrice);
    }

    await db.transaction(async (conn) => {
      if (updateFields.length > 0) {
        values.push(existing.id);
        await conn.execute(`UPDATE products SET ${updateFields.join(", ")}, updated_at = NOW(3) WHERE id = ?`, values);
      }

      if (body.images !== undefined) {
        await conn.execute("DELETE FROM product_images WHERE product_id = ?", [existing.id]);
        for (let i = 0; i < body.images.length; i++) {
          await conn.execute("INSERT INTO product_images (product_id, url, position) VALUES (?, ?, ?)", [existing.id, body.images[i], i]);
        }
      }

      if (body.tags !== undefined) {
        await conn.execute("DELETE FROM product_tags WHERE product_id = ?", [existing.id]);
        for (const tag of body.tags) {
          await conn.execute("INSERT INTO product_tags (product_id, tag) VALUES (?, ?)", [existing.id, tag]);
        }
      }
    });

    const updated = await getProductByIdentifier(existing.id);

    revalidateTag("products");
    return NextResponse.json(normalizeProduct(updated));
  } catch (error) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ error: `Update failed: ${error.message}` }, { status: 500 });
  }
}

// ── DELETE : delete product ──────────────────────────────────────────────────
export async function DELETE(req, { params }) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const { id } = await params;
    const product = await getProductByIdentifier(id);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    // Cascade delete is handled by DB if configured, or explicitly here
    await db.query("DELETE FROM products WHERE id = ?", [product.id]);

    revalidateTag("products");
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
