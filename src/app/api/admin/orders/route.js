import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { normalizeOrder } from "@/lib/normalize";

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "1000");
    const offset = (page - 1) * limit;

    const [ordersRaw, countRows] = await Promise.all([
      db.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]),
      db.query("SELECT COUNT(*) as count FROM orders")
    ]);

    const total = countRows[0].count;

    if (ordersRaw.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }, { status: 200 });
    }

    const orderIds = ordersRaw.map(o => o.id);
    const itemsRaw = await db.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds.join(",")})`
    );

    const orders = ordersRaw.map(o => {
      const mapped = {
        ...o,
        customerId: o.customer_id,
        totalAmount: o.total_amount,
        shippingFee: o.shipping_fee,
        wholesaleToken: o.wholesale_token,
        paymentStatus: o.payment_status,
        paymentOrderId: o.payment_order_id,
        paymentPaymentId: o.payment_payment_id,
        paymentSignature: o.payment_signature,
        logisticsStatus: o.logistics_status,
        logisticsAwbCode: o.logistics_awb_code,
        logisticsShipmentId: o.logistics_shipment_id,
        placedAt: o.placed_at,
        packedAt: o.packed_at,
        dispatchedAt: o.dispatched_at,
        inTransitAt: o.in_transit_at,
        deliveredAt: o.delivered_at,
        couponCode: o.coupon_code,
        couponDiscount: o.coupon_discount,
        shippingName: o.shipping_name,
        shippingPhone: o.shipping_phone,
        shippingAddress: o.shipping_address,
        shippingCity: o.shipping_city,
        shippingPincode: o.shipping_pincode,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        items: itemsRaw.filter(i => i.order_id === o.id).map(i => ({
          ...i,
          itemProductId: i.item_product_id
        }))
      };
      return normalizeOrder(mapped);
    });

    return NextResponse.json({
      success: true,
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });
  } catch (error) {
    console.error("Admin Orders Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
