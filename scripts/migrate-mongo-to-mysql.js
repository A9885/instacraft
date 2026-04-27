/**
 * scripts/migrate-mongo-to-mysql.js
 *
 * ONE-TIME DATA MIGRATION SCRIPT
 * Reads all data from MongoDB Atlas → writes to MySQL (cPanel)
 *
 * HOW TO RUN:
 *   node scripts/migrate-mongo-to-mysql.js
 *
 * SAFE TO RE-RUN: Uses upsert logic (ON DUPLICATE KEY UPDATE) so it won't duplicate data.
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const mysql = require("mysql2/promise");

// ─── Step 1: Load .env.local manually ────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env.local file");
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnv();

// ─── Step 2: MySQL Connection Helper ─────────────────────────────────────────
async function createDbConnection() {
  const url = new URL(process.env.DATABASE_URL);
  return await mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password || undefined,
    database: url.pathname.slice(1),
  });
}

// ─── Step 3: Define Mongoose Schemas (minimal) ───────────────────────────────
const ProductSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const CustomerSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const OrderSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const CouponSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const OfferSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const HeroSlideSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const SiteConfigSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const SiteContentSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const TestimonialSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const WholesaleCatalogSchema = new mongoose.Schema({}, { strict: false, timestamps: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const toDecimal = (val, defaultVal = 0) => {
  const n = parseFloat(val);
  return isNaN(n) ? defaultVal : n;
};

const toInt = (val, defaultVal = 0) => {
  const n = parseInt(val);
  return isNaN(n) ? defaultVal : n;
};

const toDate = (val, defaultVal = new Date()) => {
  if (!val) return defaultVal;
  const d = new Date(val);
  return isNaN(d.getTime()) ? defaultVal : d;
};

const log = (msg) => console.log(`\n✅ ${msg}`);
const warn = (msg) => console.log(`⚠️  ${msg}`);
const info = (msg) => console.log(`   → ${msg}`);

// ─── MAIN MIGRATION ───────────────────────────────────────────────────────────
async function main() {
  console.log("\n🚀 Starting MongoDB → MySQL Migration (Native SQL)");
  console.log("━".repeat(50));

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ MongoDB connected");

  const conn = await createDbConnection();
  console.log("✅ MySQL connected");

  const productIdMap = new Map();

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: PRODUCTS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n📦 Migrating Products...");
  const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);
  const products = await Product.find({}).lean();
  
  for (const p of products) {
    const mongoId = p._id.toString();
    const slug = p.slug || `product-${mongoId}`;

    await conn.execute(
      `INSERT INTO products (
        slug, title, description, price, sale_price, category, stock, artisan, featured, 
        rating, reviews, weight, length, breadth, height, quantity, size, material, 
        color, type, video, cta_type, cta_label, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE title=VALUES(title), updated_at=NOW(3)`,
      [
        slug, p.title || "Untitled", p.description || null, toDecimal(p.price, 0),
        p.salePrice != null ? toDecimal(p.salePrice) : null, p.category || null,
        toInt(p.stock, 0), p.artisan || null, !!p.featured ? 1 : 0, toDecimal(p.rating, 0),
        toInt(p.reviews, 0), toDecimal(p.weight, 1), toDecimal(p.length, 15),
        toDecimal(p.breadth, 15), toDecimal(p.height, 10), p.quantity || null,
        p.size || null, p.material || null, p.color || null, p.type || null,
        p.video || null, p.ctaType || null, p.ctaLabel || null,
        toDate(p.createdAt), toDate(p.updatedAt)
      ]
    );

    const [rows] = await conn.execute("SELECT id FROM products WHERE slug = ?", [slug]);
    productIdMap.set(mongoId, rows[0].id);

    // Images & Tags
    await conn.execute("DELETE FROM product_images WHERE product_id = ?", [rows[0].id]);
    for (const [idx, url] of (p.images || []).entries()) {
      await conn.execute("INSERT INTO product_images (product_id, url, position) VALUES (?, ?, ?)", [rows[0].id, String(url), idx]);
    }
    await conn.execute("DELETE FROM product_tags WHERE product_id = ?", [rows[0].id]);
    for (const tag of (p.tags || [])) {
      await conn.execute("INSERT INTO product_tags (product_id, tag) VALUES (?, ?)", [rows[0].id, String(tag)]);
    }
  }
  log(`Products migrated: ${products.length}`);

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: CUSTOMERS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n👤 Migrating Customers...");
  const Customer = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
  const customers = await Customer.find({}).lean();

  for (const c of customers) {
    await conn.execute(
      `INSERT INTO customers (
        firebase_uid, name, email, phone, role, orders, total_spent, status, cart, wishlist, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE name=VALUES(name), updated_at=NOW(3)`,
      [
        c.firebaseUid, c.name || "Unknown", c.email || null, c.phone || null,
        c.role === "admin" ? "admin" : "customer", toInt(c.orders, 0), toDecimal(c.totalSpent, 0),
        ["active", "inactive", "banned"].includes(c.status) ? c.status : "active",
        JSON.stringify(c.cart || []), JSON.stringify(c.wishlist || []),
        toDate(c.createdAt), toDate(c.updatedAt)
      ]
    );

    await conn.execute("DELETE FROM customer_addresses WHERE customer_uid = ?", [c.firebaseUid]);
    for (const addr of (c.addresses || [])) {
      await conn.execute(
        `INSERT INTO customer_addresses (
          customer_uid, tag, name, phone, street, city, state, pincode, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.firebaseUid, ["home", "work", "other"].includes(addr.tag) ? addr.tag : "home",
          addr.name || "", addr.phone || "", addr.street || "", addr.city || "",
          addr.state || null, addr.pincode || "", !!addr.isDefault ? 1 : 0
        ]
      );
    }
  }
  log(`Customers migrated: ${customers.length}`);

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: ORDERS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n📋 Migrating Orders...");
  const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);
  const orders = await Order.find({}).lean();

  for (const o of orders) {
    const payment = o.payment || {};
    const logistics = o.logistics || {};
    const timestamps = logistics.timestamps || {};
    const coupon = o.coupon || {};
    const addr = o.shippingAddress || {};

    const [result] = await conn.execute(
      `INSERT INTO orders (
        customer_id, total_amount, shipping_fee, wholesale_token, payment_status, 
        payment_order_id, payment_payment_id, payment_signature, logistics_status, 
        logistics_awb_code, logistics_shipment_id, placed_at, packed_at, dispatched_at, 
        in_transit_at, delivered_at, coupon_code, coupon_discount, shipping_name, 
        shipping_phone, shipping_address, shipping_city, shipping_pincode, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.customerId || "", toDecimal(o.totalAmount, 0), toDecimal(o.shippingFee, 0), o.wholesaleToken || null,
        ["Pending", "Paid", "Failed"].includes(payment.status) ? payment.status : "Pending",
        payment.orderId || null, payment.paymentId || null, payment.signature || null,
        ["Placed", "Packed", "Dispatched", "In_Transit", "Delivered", "Cancelled"].includes(logistics.status) ? logistics.status : "Placed",
        logistics.awbCode || null, logistics.shipmentId || null, toDate(timestamps.placedAt),
        timestamps.packedAt ? toDate(timestamps.packedAt) : null,
        timestamps.dispatchedAt ? toDate(timestamps.dispatchedAt) : null,
        timestamps.inTransitAt ? toDate(timestamps.inTransitAt) : null,
        timestamps.deliveredAt ? toDate(timestamps.deliveredAt) : null,
        coupon.code || null, coupon.discount != null ? toDecimal(coupon.discount) : null,
        addr.name || "", addr.phone || "", addr.address || "", addr.city || "",
        addr.pincode || "", toDate(o.createdAt), toDate(o.updatedAt)
      ]
    );

    for (const item of (o.items || [])) {
      await conn.execute(
        `INSERT INTO order_items (order_id, item_product_id, slug, title, qty, price, image, customization)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          result.insertId, item.id || item._id?.toString() || "", item.slug || null,
          item.title || "", toInt(item.qty, 1), toDecimal(item.price, 0),
          item.image || null, item.customization || null
        ]
      );
    }
  }
  log(`Orders migrated: ${orders.length}`);

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: COUPONS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n🎟️  Migrating Coupons...");
  const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
  const coupons = await Coupon.find({}).lean();

  for (const c of coupons) {
    await conn.execute(
      `INSERT INTO coupons (
        custom_id, code, description, discount, type, min_order, max_uses, used_count, 
        valid_until, active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE description=VALUES(description), updated_at=NOW(3)`,
      [
        c.id || c._id.toString(), c.code, c.description || "", toDecimal(c.discount, 0),
        c.type === "flat" ? "flat" : "percentage", toDecimal(c.minOrder, 0),
        c.maxUses != null ? toInt(c.maxUses) : null, toInt(c.usedCount, 0),
        c.validUntil ? toDate(c.validUntil) : null, c.active !== false ? 1 : 0,
        toDate(c.createdAt), toDate(c.updatedAt)
      ]
    );
  }
  log(`Coupons migrated: ${coupons.length}`);

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: OFFERS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n🏷️  Migrating Offers...");
  const Offer = mongoose.models.Offer || mongoose.model("Offer", OfferSchema);
  const offers = await Offer.find({}).lean();

  for (const o of offers) {
    await conn.execute(
      `INSERT INTO offers (
        custom_id, title, description, discount, type, category, icon, image, 
        bg_color, text_color, valid_until, active, featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.id || o._id.toString(), o.title || "", o.description || "", toDecimal(o.discount, 0),
        ["percentage", "flat", "shipping"].includes(o.type) ? o.type : "percentage",
        o.category || null, o.icon || null, o.image || null, o.bgColor || "#7A1F1F",
        o.textColor || "#FFFFFF", o.validUntil ? toDate(o.validUntil) : null,
        o.active !== false ? 1 : 0, !!o.featured ? 1 : 0, toDate(o.createdAt), toDate(o.updatedAt)
      ]
    );
  }
  log(`Offers migrated: ${offers.length}`);

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: HERO SLIDES
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n🖼️  Migrating Hero Slides...");
  const HeroSlide = mongoose.models.HeroSlide || mongoose.model("HeroSlide", HeroSlideSchema);
  const heroSlides = await HeroSlide.find({}).lean();

  for (const h of heroSlides) {
    await conn.execute(
      `INSERT INTO hero_slides (
        custom_id, title, subtitle, description, badge, video, poster, 
        product_slug, active, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        h.id || h._id.toString(), h.title || "", h.subtitle || null, h.description || null,
        h.badge || null, h.video || null, h.poster || null, h.productSlug || null,
        h.active !== false ? 1 : 0, toInt(h.order, 0), toDate(h.createdAt), toDate(h.updatedAt)
      ]
    );
  }
  log(`Hero Slides migrated: ${heroSlides.length}`);

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: SITE CONFIG
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n⚙️  Migrating Site Config...");
  const SiteConfig = mongoose.models.SiteConfig || mongoose.model("SiteConfig", SiteConfigSchema);
  const siteConfig = await SiteConfig.findOne({}).lean();
  if (siteConfig) {
    await conn.execute(
      `INSERT INTO site_config (
        promo_banner_text, promo_banner_active, email, phone, whatsapp, address, 
        shipping_fee, free_shipping_threshold, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        siteConfig.promoBannerText || "Special Offer!", siteConfig.promoBannerActive !== false ? 1 : 0,
        siteConfig.email || "info@balajihandicrafts.in", siteConfig.phone || "9198492515",
        siteConfig.whatsapp || "984925153", siteConfig.address || "Charminar, Hyderabad",
        toDecimal(siteConfig.shippingFee, 199), toDecimal(siteConfig.freeShippingThreshold, 1000),
        toDate(siteConfig.createdAt), toDate(siteConfig.updatedAt)
      ]
    );
    log("Site Config migrated");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: SITE CONTENT
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n📄 Migrating Site Content...");
  const SiteContent = mongoose.models.SiteContent || mongoose.model("SiteContent", SiteContentSchema);
  const siteContent = await SiteContent.findOne({}).lean();
  if (siteContent) {
    await conn.execute(
      `INSERT INTO site_content (about, contact, footer, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
      [
        JSON.stringify(siteContent.about || {}), JSON.stringify(siteContent.contact || {}),
        JSON.stringify(siteContent.footer || {}), toDate(siteContent.createdAt), toDate(siteContent.updatedAt)
      ]
    );
    log("Site Content migrated");
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: TESTIMONIALS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n💬 Migrating Testimonials...");
  const Testimonial = mongoose.models.Testimonial || mongoose.model("Testimonial", TestimonialSchema);
  const testimonials = await Testimonial.find({}).lean();

  for (const t of testimonials) {
    await conn.execute(
      `INSERT INTO testimonials (custom_id, name, city, avatar, rating, text, product, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        t.id || t._id.toString(), t.name || "Anonymous", t.city || null, t.avatar || null,
        toInt(t.rating, 5), t.text || "", t.product || null, toDate(t.createdAt), toDate(t.updatedAt)
      ]
    );
  }
  log(`Testimonials migrated: ${testimonials.length}`);

  // ─────────────────────────────────────────────────────────────────────────
  // MIGRATE: WHOLESALE CATALOGS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n🏪 Migrating Wholesale Catalogs...");
  const WholesaleCatalog = mongoose.models.WholesaleCatalog || mongoose.model("WholesaleCatalog", WholesaleCatalogSchema);
  const catalogs = await WholesaleCatalog.find({}).lean();

  for (const wc of catalogs) {
    const [result] = await conn.execute(
      `INSERT INTO wholesale_catalogs (
        name, description, access_token, expiry_date, is_active, locked_to_device, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        wc.name || "Untitled", wc.description || null, wc.accessToken,
        wc.expiryDate ? toDate(wc.expiryDate) : null, wc.isActive !== false ? 1 : 0,
        wc.lockedToDevice || null, toDate(wc.createdAt), toDate(wc.updatedAt)
      ]
    );

    for (const p of (wc.products || [])) {
      const mysqlProductId = productIdMap.get(p.product?.toString());
      if (mysqlProductId) {
        await conn.execute(
          "INSERT INTO wholesale_catalog_products (catalog_id, product_id, wholesale_price) VALUES (?, ?, ?)",
          [result.insertId, mysqlProductId, toDecimal(p.wholesalePrice, 0)]
        );
      }
    }
  }
  log(`Wholesale Catalogs migrated: ${catalogs.length}`);

  console.log("\n🎉 MIGRATION COMPLETE!");
  await conn.end();
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n❌ Migration failed:", err);
  process.exit(1);
});
