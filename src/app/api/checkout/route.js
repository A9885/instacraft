import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { verifyAuth } from "@/lib/requireAdmin";
import db from "@/lib/db";

export async function POST(request) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Missing Razorpay Keys in Environment");
      return NextResponse.json({ error: "Server Configuration Error: Missing Gateway Keys" }, { status: 500 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // 1. Verify token
    const { decodedToken, error } = await verifyAuth(request);
    if (error) return error;

    const customerId = decodedToken.uid;

    // 2. Extract payload
    const body = await request.json();
    const { items, shippingAddress, couponCode, saveAddress, paymentMethod = 'Online' } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Invalid payload: Missing items or shipping address" }, { status: 400 });
    }

    // 3. Calculate total from DB prices only — never trust frontend
    let grandTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity <= 0) {
        return NextResponse.json({ error: `Invalid quantity requested for: ${item.slug}` }, { status: 400 });
      }

      const rows = await db.query("SELECT * FROM products WHERE slug = ?", [item.slug]);
      const product = rows[0];
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.slug}`, missingSlug: item.slug }, { status: 404 });
      }

      if (product.type !== "service" && product.stock < quantity) {
        return NextResponse.json({ error: `Insufficient stock for product: ${product.title}` }, { status: 400 });
      }

      const dbPrice = parseFloat(product.price.toString());
      const dbSalePrice = product.sale_price !== null ? parseFloat(product.sale_price.toString()) : null;
      const price = dbSalePrice && dbSalePrice > 0 ? dbSalePrice : dbPrice;

      grandTotal += price * quantity;

      // Fetch first image for order item summary
      const imageRows = await db.query("SELECT url FROM product_images WHERE product_id = ? ORDER BY position ASC LIMIT 1", [product.id]);
      const image = imageRows[0]?.url || "";

      orderItems.push({
        itemProductId: product.id.toString(),
        slug: product.slug,
        title: product.title,
        qty: quantity,
        price,
        image,
        customization: item.customization || null,
      });
    }

    // 4. Server-side coupon verification
    let appliedDiscount = 0;
    let couponCode_saved = null;
    let couponDiscount_saved = null;

    if (couponCode) {
      const normalizedCode = couponCode.replace(/\s+/g, "").toUpperCase();
      const rows = await db.query("SELECT * FROM coupons WHERE code = ? AND active = 1", [normalizedCode]);
      const coupon = rows[0];

      if (coupon) {
        const isNotExpired = !coupon.valid_until || new Date(coupon.valid_until) >= new Date();
        const isMinOrderMet = grandTotal >= parseFloat(coupon.min_order.toString());
        const isLimitNotReached = !coupon.max_uses || coupon.used_count < coupon.max_uses;

        if (isNotExpired && isMinOrderMet && isLimitNotReached) {
          const discount = parseFloat(coupon.discount.toString());
          if (coupon.type === "percentage") {
            appliedDiscount = (grandTotal * discount) / 100;
          } else if (coupon.type === "flat") {
            appliedDiscount = discount;
          }
          grandTotal = Math.max(1, grandTotal - appliedDiscount);
          couponCode_saved = coupon.code;
          couponDiscount_saved = appliedDiscount;
        }
      }
    }

    // 5. Shipping fee
    let finalShippingFee = 199;
    let shippingThreshold = 1000;
    try {
      const rows = await db.query("SELECT * FROM site_config LIMIT 1");
      const config = rows[0];
      if (config) {
        if (config.shipping_fee != null) finalShippingFee = parseFloat(config.shipping_fee.toString());
        if (config.free_shipping_threshold != null) shippingThreshold = parseFloat(config.free_shipping_threshold.toString());
      }
    } catch (e) {
      console.error("Config fetch error during checkout:", e);
    }

    const appliedShippingFee = grandTotal >= shippingThreshold ? 0 : finalShippingFee;
    grandTotal += appliedShippingFee;

    // 6. Create Payment Order (Razorpay for Online, Internal for COD)
    let razorpayOrder = null;
    if (paymentMethod === 'Online') {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        receipt: `rcpt_${Date.now()}_${customerId.substring(0, 5)}`,
      });
    } else {
      // Mock object for COD to maintain compatibility with the insertion logic
      razorpayOrder = { id: `COD-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
    }

    // 7. Create pending order in MySQL
    const newOrderId = await db.transaction(async (conn) => {
      const [orderResult] = await conn.execute(
        `INSERT INTO orders (
          customer_id, total_amount, shipping_fee, payment_method, payment_status, 
          payment_order_id, logistics_status, coupon_code, coupon_discount, 
          shipping_name, shipping_phone, shipping_address, shipping_city, 
          shipping_pincode, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
        [
          customerId, grandTotal, appliedShippingFee, paymentMethod, "Pending", 
          razorpayOrder.id, "Placed", couponCode_saved, couponDiscount_saved, 
          shippingAddress.name, shippingAddress.phone, shippingAddress.address, 
          shippingAddress.city, shippingAddress.pincode
        ]
      );

      const orderId = orderResult.insertId;

      for (const item of orderItems) {
        await conn.execute(
          `INSERT INTO order_items (
            order_id, item_product_id, slug, title, qty, price, image, customization
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, item.itemProductId, item.slug, item.title, item.qty, item.price, 
            item.image, item.customization ? JSON.stringify(item.customization) : null
          ]
        );
      }

      if (couponCode_saved) {
        await conn.execute(
          `UPDATE coupons SET used_count = used_count + 1 WHERE code = ?`,
          [couponCode_saved]
        );
      }

      return orderId;
    });

    // 8. Save address if requested
    if (saveAddress) {
      try {
        const rows = await db.query("SELECT id FROM customers WHERE firebase_uid = ?", [customerId]);
        const customer = rows[0];
        if (customer) {
          await db.query(
            `INSERT INTO customer_addresses (
              customer_id, tag, name, phone, street, city, pincode, is_default
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              customer.id, "home", shippingAddress.name, shippingAddress.phone, 
              shippingAddress.address, shippingAddress.city, shippingAddress.pincode, 0
            ]
          );
        }
      } catch (err) {
        console.error("Failed to save address:", err);
      }
    }

    return NextResponse.json({
      success: true,
      paymentMethod,
      order: {
        dbId: newOrderId,
        razorpayOrderId: paymentMethod === 'Online' ? razorpayOrder.id : null,
        codReference: paymentMethod === 'COD' ? razorpayOrder.id : null,
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        keyId,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
