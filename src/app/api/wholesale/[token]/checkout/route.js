import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { verifyAuth } from "@/lib/requireAdmin";
import db from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const { token } = await params;

    // 1. Authenticate user
    const { decodedToken, error } = await verifyAuth(request);
    if (error) return error;
    const customerId = decodedToken.uid;

    // 2. Parse body
    const { items, shippingAddress, paymentMethod = 'Online' } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return NextResponse.json({ error: "Invalid payload: Missing items or shipping address" }, { status: 400 });
    }

    // 3. Verify catalog is active
    const catalogRows = await db.query(
      "SELECT * FROM wholesale_catalogs WHERE access_token = ? AND is_active = 1 LIMIT 1",
      [token]
    );
    const catalog = catalogRows[0];
    if (!catalog) {
      return NextResponse.json({ error: "This wholesale catalog link has expired or been disabled." }, { status: 400 });
    }
    if (catalog.expiry_date && new Date(catalog.expiry_date) < new Date()) {
      return NextResponse.json({ error: "This wholesale catalog link has expired." }, { status: 400 });
    }

    // Fetch catalog products
    const catalogProducts = await db.query(
      "SELECT cp.*, p.title FROM wholesale_catalog_products cp JOIN products p ON cp.product_id = p.id WHERE cp.catalog_id = ?",
      [catalog.id]
    );

    // 4. Calculate total from DB wholesale prices only
    let grandTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const qty = parseInt(item.qty, 10);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json({ error: "Invalid quantity for item" }, { status: 400 });
      }

      // Find in catalog by productId (MySQL integer)
      const catalogItem = catalogProducts.find(
        (cp) => cp.product_id.toString() === item.productId.toString()
      );
      if (!catalogItem) {
        return NextResponse.json({ error: "Product not found in this wholesale catalog." }, { status: 400 });
      }

      const price = parseFloat(catalogItem.wholesale_price.toString());
      grandTotal += price * qty;

      orderItems.push({
        itemProductId: item.productId.toString(),
        slug: item.slug || null,
        title: item.title || catalogItem.title || "",
        qty,
        price,
        image: item.image || "", // Basic fallback
      });
    }

    // 5. Create Payment Order (Razorpay for Online, Internal for COD)
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Server Configuration Error: Missing Gateway Keys" }, { status: 500 });
    }

    let razorpayOrder = null;
    if (paymentMethod === 'Online') {
      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(grandTotal * 100),
        currency: "INR",
        receipt: `whl_${Date.now()}_${customerId.substring(0, 5)}`,
      });
    } else {
      razorpayOrder = { id: `COD-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
    }

    // 6. Create pending order with wholesaleToken using a transaction
    const newOrderId = await db.transaction(async (conn) => {
      const [insertResult] = await conn.execute(
        `INSERT INTO orders (
          customer_id, total_amount, shipping_fee, payment_method, payment_status, 
          payment_order_id, logistics_status, wholesale_token, shipping_name, 
          shipping_phone, shipping_address, shipping_city, shipping_pincode, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(3), NOW(3))`,
        [
          customerId, grandTotal, 0, paymentMethod, "Pending", razorpayOrder.id, 
          "Placed", token, shippingAddress.name, shippingAddress.phone, 
          shippingAddress.address, shippingAddress.city, shippingAddress.pincode
        ]
      );

      const orderId = insertResult.insertId;

      for (const item of orderItems) {
        await conn.execute(
          `INSERT INTO order_items (
            order_id, item_product_id, slug, title, qty, price, image
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, item.itemProductId, item.slug, item.title, item.qty, item.price, item.image
          ]
        );
      }

      return orderId;
    });

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
    console.error("Wholesale Checkout API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
