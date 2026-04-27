import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { normalizeProduct } from "@/lib/normalize";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z.string().trim().min(1, "Slug is required"),
  price: z.preprocess((val) => Number(val), z.number().positive("Price must be a positive number")),
  salePrice: z.preprocess((val) => (val !== undefined && val !== "" ? Number(val) : undefined), z.number().nonnegative("Invalid sale price").optional().nullable()),
  description: z.string().optional().nullable(),
  category: z.enum(["wall-hangings", "table-top-mount", "wall-table-combo", "gift-items", "custom-creations"], {
    errorMap: () => ({ message: "Invalid product category" }),
  }).optional().nullable(),
  images: z.array(z.string()).default([]),
  stock: z.preprocess((val) => (val !== undefined ? Number(val) : 0), z.number().nonnegative("Stock must be a non-negative number")),
  artisan: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  quantity: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  video: z.string().optional().nullable(),
  ctaType: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  featured: z.preprocess((val) => val === true || val === "true" || val === 1, z.boolean()).default(false),
  rating: z.preprocess((val) => (val !== undefined ? Number(val) : 0), z.number().min(0).max(5)).optional(),
  reviews: z.preprocess((val) => (val !== undefined ? Number(val) : 0), z.number().nonnegative()).optional(),
  tags: z.array(z.string()).default([]),
  weight: z.preprocess((val) => (val !== undefined ? Number(val) : 1), z.number().nonnegative()),
  length: z.preprocess((val) => (val !== undefined ? Number(val) : 15), z.number().nonnegative()),
  breadth: z.preprocess((val) => (val !== undefined ? Number(val) : 15), z.number().nonnegative()),
  height: z.preprocess((val) => (val !== undefined ? Number(val) : 10), z.number().nonnegative()),
});

export const dynamic = "force-dynamic";

// ── GET : get all products (paginated) ──────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const offset = (page - 1) * limit;

    const [productsRaw, countRows] = await Promise.all([
      db.query("SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]),
      db.query("SELECT COUNT(*) as count FROM products")
    ]);

    const total = countRows[0].count;

    // Fetch images and tags for these products
    if (productsRaw.length === 0) {
      return NextResponse.json({ products: [], total, page, limit, totalPages: Math.ceil(total / limit) });
    }

    const productIds = productsRaw.map(p => p.id);
    const imagesRaw = await db.query(`SELECT * FROM product_images WHERE product_id IN (${productIds.join(",")}) ORDER BY position ASC`);
    const tagsRaw = await db.query(`SELECT * FROM product_tags WHERE product_id IN (${productIds.join(",")})`);

    const products = productsRaw.map(p => {
      // Map database snake_case to camelCase
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
      return normalizeProduct(mapped);
    });

    if (page === 1 && limit === 1000) {
      return NextResponse.json(products);
    }

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Products GET Error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch products",
      details: error.message 
    }, { status: 500 });
  }
}

// ── POST : create product ───────────────────────────────────────────────────
export async function POST(req) {
  try {
    const { error: authError } = await requireAdmin(req);
    if (authError) return authError;

    const body = await req.json();
    const result = productSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.errors[0].message;
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { images, tags, ...productData } = result.data;

    if (productData.salePrice !== undefined && productData.salePrice !== null && productData.salePrice > productData.price) {
      return NextResponse.json({ error: "Sale price cannot be higher than regular price" }, { status: 400 });
    }

    // Insert Product
    const newProductId = await db.transaction(async (conn) => {
      const [insertResult] = await conn.execute(
        `INSERT INTO products (
          title, slug, description, price, sale_price, category, stock, artisan, featured, 
          rating, reviews, weight, length, breadth, height, quantity, size, material, 
          color, type, video, cta_type, cta_label, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
        [
          productData.title, productData.slug, productData.description || null, productData.price, 
          productData.salePrice || null, productData.category || null, productData.stock, 
          productData.artisan || null, productData.featured ? 1 : 0, productData.rating || 0, 
          productData.reviews || 0, productData.weight, productData.length, productData.breadth, 
          productData.height, productData.quantity || null, productData.size || null, 
          productData.material || null, productData.color || null, productData.type || null, 
          productData.video || null, productData.ctaType || null, productData.ctaLabel || null
        ]
      );
      
      const productId = insertResult.insertId;

      for (let i = 0; i < images.length; i++) {
        await conn.execute("INSERT INTO product_images (product_id, url, position) VALUES (?, ?, ?)", [productId, images[i], i]);
      }

      for (const tag of tags) {
        await conn.execute("INSERT INTO product_tags (product_id, tag) VALUES (?, ?)", [productId, tag]);
      }

      return productId;
    });

    // Fetch the created product for response
    const rows = await db.query("SELECT * FROM products WHERE id = ?", [newProductId]);
    const createdProduct = rows[0];
    const createdImages = await db.query("SELECT * FROM product_images WHERE product_id = ? ORDER BY position ASC", [newProductId]);
    const createdTags = await db.query("SELECT * FROM product_tags WHERE product_id = ?", [newProductId]);

    const mapped = {
      ...createdProduct,
      salePrice: createdProduct.sale_price,
      ctaType: createdProduct.cta_type,
      ctaLabel: createdProduct.cta_label,
      createdAt: createdProduct.created_at,
      updatedAt: createdProduct.updated_at,
      images: createdImages,
      tags: createdTags
    };

    revalidateTag("products");
    return NextResponse.json(normalizeProduct(mapped), { status: 201 });
  } catch (error) {
    console.log("🔥 ERROR:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
