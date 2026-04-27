import { getStateFromPincode } from "./utils";

export class ShiprocketAPI {
  static cachedToken = null;
  static tokenExpiry = null;

  /**
   * Generates a short-lived bearer token using the Admin credentials
   * securely stored in backend .env.local
   */
  static async getToken() {
    if (process.env.SHIPROCKET_MOCK === "true") return "mock_token";

    // Check if we have a valid cached token (valid for ~24 hours usually, we cache for 12hrs)
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry && now < this.tokenExpiry) {
      console.log("🎟️ Using cached Shiprocket token");
      return this.cachedToken;
    }

    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      throw new Error(
        "Shiprocket credentials missing from server environment.",
      );
    }

    console.log("🔑 Fetching fresh Shiprocket token...");
    const authRes = await fetch(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    if (!authRes.ok) {
      throw new Error(
        "Shiprocket Authentication Failed: Invalid credentials or account blocked.",
      );
    }

    const { token } = await authRes.json();
    
    // Cache the token for 12 hours (Shiprocket tokens typically last 1-10 days)
    this.cachedToken = token;
    this.tokenExpiry = now + 12 * 60 * 60 * 1000; 

    return token;
  }

  /**
   * Pushes the verified order to the Delivery Partner (Shiprocket) directly.
   * Maps MongoDB `Order` document constraints to Shiprocket's strict validation schema.
   */
  static async pushOrder(order) {
    // Check for Mock Mode to prevent cluttering real Shiprocket account during development
    if (process.env.SHIPROCKET_MOCK === "true") {
      console.log(
        "🛠️ Shiprocket MOCK MODE: Simulating successful order push...",
      );
      return {
        awbCode: `MOCK-AWB-${Math.floor(100000 + Math.random() * 900000)}`,
        shipmentId: `MOCK-SID-${Math.floor(100000 + Math.random() * 900000)}`,
      };
    }

    const token = await this.getToken();
    const totalAmount = order.items.reduce(
      (acc, i) => acc + i.price * i.qty,
      0,
    );

    // Dynamic Logistics Calculation (Stacking heuristic)
    let totalWeight = 0.5; // Base buffer weight (packing material)
    let maxLength = 15;
    let maxBreadth = 15;
    let totalHeight = 10; // Base buffer height

    if (order.items && order.items.length > 0) {
      totalWeight = order.items.reduce((acc, i) => acc + ((i.weight || 1) * i.qty), 0);
      maxLength = Math.max(...order.items.map(i => i.length || 15));
      maxBreadth = Math.max(...order.items.map(i => i.breadth || 15));
      totalHeight = order.items.reduce((acc, i) => acc + ((i.height || 10) * i.qty), 0);
    }

    // Secure payload mapping mapping our flexible MongoDB schema to rigorous Shiprocket logistics requirements
    const payload = {
      // 1. Core Order Mapping
      order_id: `BH-${order._id.toString().substring(15).toUpperCase()}`, // Generating Unique Merchant Order ID
      order_date: new Date(order.createdAt)
        .toISOString()
        .replace("T", " ")
        .substring(0, 19),
      pickup_location: "Primary", // Defaults to the primary registered warehouse

      // 2. Billing & Destination Mapping
      billing_customer_name: order.shippingAddress?.name || "Customer",
      billing_last_name: "",
      billing_address: order.shippingAddress?.address || "Address fallback",
      billing_city: order.shippingAddress?.city || "City",
      billing_pincode: order.shippingAddress?.pincode || "110001",
      billing_state: getStateFromPincode(order.shippingAddress?.pincode), 
      billing_country: "India",
      billing_email: process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",")[0].trim()
        : "test@example.com", // Proxied for data safety
      billing_phone: order.shippingAddress?.phone || "9999999999",
      shipping_is_billing: true, // Destination = Billing

      // 3. Line Items Snapshot Mapping
      order_items: order.items.map((item) => ({
        name: item.title,
        sku: item.slug || item.id,
        units: item.qty,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 4420, // Generic HSN for Handicraft Items
      })),

      // 4. Financials & Delivery Dimensions Mapping
      payment_method: order.payment.status === "Paid" ? "Prepaid" : "COD",
      shipping_charges: 0, // Using internal free delivery structure
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: totalAmount,
      length: maxLength,
      breadth: maxBreadth,
      height: totalHeight,
      weight: totalWeight,
    };

    const res = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adHoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    // Shiprocket sends 200 technically occasionally even on errors, so we verify structurally.
    if (!res.ok || (data.status_code && data.status_code !== 1)) {
      console.error("Shiprocket Rejection Payload: ", JSON.stringify(data));
      throw new Error(
        `Delivery API Rejected Shipment: ${data.message || "Unknown Schema Violation"}`,
      );
    }

    return {
      awbCode: data.awb_code || "",
      shipmentId: data.shipment_id ? data.shipment_id.toString() : "",
    };
  }
}
