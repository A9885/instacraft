import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import db from "@/lib/db";
import { ShiprocketAPI } from "@/lib/shiprocket";
import { normalizeOrder } from "@/lib/normalize";

async function getOrderWithItems(id) {
  const rows = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
  const order = rows[0];
  if (!order) return null;

  const items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [id]);

  return {
    ...order,
    customerId: order.customer_id,
    totalAmount: order.total_amount,
    shippingFee: order.shipping_fee,
    wholesaleToken: order.wholesale_token,
    paymentStatus: order.payment_status,
    paymentOrderId: order.payment_order_id,
    paymentPaymentId: order.payment_payment_id,
    paymentSignature: order.payment_signature,
    logisticsStatus: order.logistics_status,
    logisticsAwbCode: order.logistics_awb_code,
    logisticsShipmentId: order.logistics_shipment_id,
    placedAt: order.placed_at,
    packedAt: order.packed_at,
    dispatchedAt: order.dispatched_at,
    inTransitAt: order.in_transit_at,
    deliveredAt: order.delivered_at,
    couponCode: order.coupon_code,
    couponDiscount: order.coupon_discount,
    shippingName: order.shipping_name,
    shippingPhone: order.shipping_phone,
    shippingAddress: order.shipping_address,
    shippingCity: order.shipping_city,
    shippingPincode: order.shipping_pincode,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: items.map(i => ({
      ...i,
      itemProductId: i.item_product_id
    }))
  };
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const { status } = body;

    const validStatuses = ["Placed", "Packed", "Dispatched", "In_Transit", "Delivered"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid workflow status" }, { status: 400 });
    }

    const order = await getOrderWithItems(parseInt(id));
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const now = new Date();
    const updateData = { logistics_status: status };
    const fields = ["logistics_status = ?"];
    const values = [status];

    if (status === "Packed") {
      fields.push("packed_at = ?");
      values.push(now);
    } else if (status === "Dispatched") {
      fields.push("dispatched_at = ?");
      values.push(now);

      // Shiprocket integration — pass normalized order shape
      try {
        const normalizedForShiprocket = normalizeOrder(order);
        const syncPayload = await ShiprocketAPI.pushOrder(normalizedForShiprocket);
        fields.push("logistics_awb_code = ?");
        values.push(syncPayload.awbCode);
        fields.push("logistics_shipment_id = ?");
        values.push(syncPayload.shipmentId);
      } catch (logisticsError) {
        console.error("Shiprocket API Rejection Blocked Transaction:", logisticsError);
        return NextResponse.json({ error: logisticsError.message }, { status: 502 });
      }
    } else if (status === "In_Transit") {
      fields.push("in_transit_at = ?");
      values.push(now);
    } else if (status === "Delivered") {
      fields.push("delivered_at = ?");
      values.push(now);
    }

    values.push(parseInt(id));
    await db.query(`UPDATE orders SET ${fields.join(", ")}, updated_at = NOW(3) WHERE id = ?`, values);

    const updated = await getOrderWithItems(parseInt(id));

    return NextResponse.json({ success: true, order: normalizeOrder(updated) }, { status: 200 });

  } catch (error) {
    console.error("Admin Order Patch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
