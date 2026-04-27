/**
 * src/lib/normalize.js
 * Converts Native MySQL rows → the same shape as old Mongoose/MongoDB documents.
 * This keeps all existing React components and pages working unchanged.
 * Supports both snake_case (from raw DB queries) and camelCase (for backward compatibility).
 */

const toNum = (val) => (val == null ? null : parseFloat(val.toString()));

// ── PRODUCT ───────────────────────────────────────────────────────────────────
export function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    _id: p.id.toString(),
    price: toNum(p.price),
    salePrice: p.sale_price !== undefined ? toNum(p.sale_price) : toNum(p.salePrice),
    rating: toNum(p.rating),
    weight: toNum(p.weight),
    length: toNum(p.length),
    breadth: toNum(p.breadth),
    height: toNum(p.height),
    size: p.size && !/inch|cm|mm|ft|m/i.test(p.size) ? `${p.size} inches` : p.size,
    dimensions: p.dimensions || (p.length && p.breadth && p.height ? `${p.length} x ${p.breadth} x ${p.height} inches` : (p.size && !/inch|cm|mm|ft|m/i.test(p.size) ? `${p.size} inches` : p.size)),
    createdAt: p.created_at || p.createdAt,
    updatedAt: p.updated_at || p.updatedAt,
    // Flatten joined tables → plain arrays (same shape as old MongoDB arrays)
    images: (p.images || [])
      .sort((a, b) => a.position - b.position)
      .map((img) => img.url),
    tags: (p.tags || []).map((t) => t.tag),
  };
}

// ── ORDER ─────────────────────────────────────────────────────────────────────
export function normalizeOrder(o) {
  if (!o) return null;
  return {
    ...o,
    _id: o.id.toString(),
    totalAmount: toNum(o.total_amount || o.totalAmount),
    shippingFee: toNum(o.shipping_fee || o.shippingFee),
    couponDiscount: (o.coupon_discount || o.couponDiscount) != null ? toNum(o.coupon_discount || o.couponDiscount) : null,
    paymentMethod: o.payment_method || o.paymentMethod || 'Online',
    createdAt: o.created_at || o.createdAt,
    updatedAt: o.updated_at || o.updatedAt,
    // Reconstruct nested objects that old code expects
    payment: {
      status: o.payment_status || o.paymentStatus,
      orderId: o.payment_order_id || o.paymentOrderId,
      paymentId: o.payment_payment_id || o.paymentPaymentId,
      signature: o.payment_signature || o.paymentSignature,
    },
    logistics: {
      status: o.logistics_status || o.logisticsStatus,
      awbCode: o.logistics_awb_code || o.logisticsAwbCode,
      shipmentId: o.logistics_shipment_id || o.logisticsShipmentId,
      timestamps: {
        placedAt: o.placed_at || o.placedAt,
        packedAt: o.packed_at || o.packedAt,
        dispatchedAt: o.dispatched_at || o.dispatchedAt,
        inTransitAt: o.in_transit_at || o.inTransitAt,
        deliveredAt: o.delivered_at || o.deliveredAt,
      },
    },
    shippingAddress: {
      name: o.shipping_name || o.shippingName,
      phone: o.shipping_phone || o.shippingPhone,
      address: o.shipping_address || o.shippingAddress,
      city: o.shipping_city || o.shippingCity,
      pincode: o.shipping_pincode || o.shippingPincode,
    },
    coupon: {
      code: o.coupon_code || o.couponCode,
      discount: (o.coupon_discount || o.couponDiscount) != null ? toNum(o.coupon_discount || o.couponDiscount) : null,
    },
    items: (o.items || []).map((item) => ({
      ...item,
      id: item.item_product_id || item.itemProductId, // backward compat
      price: toNum(item.price),
    })),
  };
}

// ── CUSTOMER ──────────────────────────────────────────────────────────────────
export function normalizeCustomer(c) {
  if (!c) return null;
  return {
    ...c,
    _id: c.id.toString(),
    firebaseUid: c.firebase_uid || c.firebaseUid,
    totalSpent: toNum(c.total_spent || c.totalSpent),
    createdAt: c.created_at || c.createdAt,
    updatedAt: c.updated_at || c.updatedAt,
    addresses: (c.addresses || []).map((addr) => ({
      ...addr,
      _id: addr.id.toString(),
      isDefault: !!(addr.is_default || addr.isDefault)
    })),
  };
}

// ── OFFER ─────────────────────────────────────────────────────────────────────
export function normalizeOffer(o) {
  if (!o) return null;
  return {
    ...o,
    _id: o.id.toString(),
    id: o.custom_id || o.customId || o.id.toString(),
    discount: toNum(o.discount),
    createdAt: o.created_at || o.createdAt,
    updatedAt: o.updated_at || o.updatedAt,
  };
}

// ── COUPON ────────────────────────────────────────────────────────────────────
export function normalizeCoupon(c) {
  if (!c) return null;
  return {
    ...c,
    _id: c.id.toString(),
    id: c.custom_id || c.customId || c.id.toString(),
    discount: toNum(c.discount),
    minOrder: toNum(c.min_order || c.minOrder),
    createdAt: c.created_at || c.createdAt,
    updatedAt: c.updated_at || c.updatedAt,
  };
}

// ── HERO SLIDE ────────────────────────────────────────────────────────────────
export function normalizeHeroSlide(h) {
  if (!h) return null;
  return {
    ...h,
    _id: h.id.toString(),
    id: h.custom_id || h.customId || h.id.toString(),
    order: h.sort_order || h.sortOrder, // backward compat
    createdAt: h.created_at || h.createdAt,
    updatedAt: h.updated_at || h.updatedAt,
  };
}

// ── TESTIMONIAL ───────────────────────────────────────────────────────────────
export function normalizeTestimonial(t) {
  if (!t) return null;
  return {
    ...t,
    _id: t.id.toString(),
    id: t.custom_id || t.customId || t.id.toString(),
    createdAt: t.created_at || t.createdAt,
    updatedAt: t.updated_at || t.updatedAt,
  };
}

// ── SITE CONFIG ───────────────────────────────────────────────────────────────
export function normalizeSiteConfig(c) {
  if (!c) return null;
  return {
    ...c,
    _id: c.id.toString(),
    shippingFee: toNum(c.shipping_fee || c.shippingFee),
    freeShippingThreshold: toNum(c.free_shipping_threshold || c.freeShippingThreshold),
    maxUploadSize: toNum(c.max_upload_size || c.maxUploadSize),
    createdAt: c.created_at || c.createdAt,
    updatedAt: c.updated_at || c.updatedAt,
  };
}

// ── WHOLESALE CATALOG ─────────────────────────────────────────────────────────
export function normalizeWholesaleCatalog(wc) {
  if (!wc) return null;
  return {
    ...wc,
    _id: wc.id.toString(),
    accessToken: wc.access_token || wc.accessToken,
    expiryDate: wc.expiry_date || wc.expiryDate,
    isActive: wc.is_active !== undefined ? !!wc.is_active : !!wc.isActive,
    lockedToDevice: wc.locked_to_device || wc.lockedToDevice,
    createdAt: wc.created_at || wc.createdAt,
    updatedAt: wc.updated_at || wc.updatedAt,
    // Normalize nested products array
    products: (wc.products || []).map((p) => ({
      ...p,
      _id: p.id.toString(),
      wholesalePrice: toNum(p.wholesale_price || p.wholesalePrice),
      // Keep full product nested as "product" field
      product: p.product ? normalizeProduct(p.product) : null,
    })),
  };
}
