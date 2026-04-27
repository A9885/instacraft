import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { normalizeOrder } from "@/lib/normalize";

export async function GET(request) {
  try {
    const { decodedToken, error } = await verifyAuth(request);
    if (error) return error;

    const ordersRaw = await db.query(
      "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
      [decodedToken.uid],
    );

    if (ordersRaw.length === 0) {
      return NextResponse.json({ success: true, orders: [] }, { status: 200 });
    }

    const orderIds = ordersRaw.map((o) => o.id);
    const itemsRaw = await db.query(
      `SELECT * FROM order_items WHERE order_id IN (${orderIds.join(",")})`,
    );

    const orders = ordersRaw.map((o) => {
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
        items: itemsRaw
          .filter((i) => i.order_id === o.id)
          .map((i) => ({
            ...i,
            itemProductId: i.item_product_id,
          })),
      };
      return normalizeOrder(mapped);
    });

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    console.error("Customer Orders Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
