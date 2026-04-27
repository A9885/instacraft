"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import Script from "next/script";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Truck, ArrowLeft } from "lucide-react";

export default function WholesaleCheckoutPage() {
  const { token } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' or 'COD'
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Auth guard — check login status as soon as the page loads
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/wholesale/${token}/checkout`)}`
      );
    }
  }, [token, router, user, authLoading]);

  // Load the order items exclusively from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem(`wholesale-cart-${token}`);
    if (!stored) {
      router.replace(`/wholesale/${token}`);
      return;
    }
    setItems(JSON.parse(stored));
  }, [token, router]);

  const grandTotal = items.reduce((sum, item) => sum + item.wholesalePrice * item.qty, 0);
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const idToken = await user?.getIdToken();
      if (!idToken) {
        throw new Error("You need to be logged in to place an order.");
      }

      // Hit the DEDICATED wholesale checkout API
      const res = await fetch(`/api/wholesale/${token}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ items, shippingAddress: shipping, paymentMethod }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const completeOrder = async (pOrderId) => {
        try {
          const freshToken = await user?.getIdToken();
          await fetch(`/api/wholesale/${token}/complete`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${freshToken}`,
            },
            body: JSON.stringify({ razorpayOrderId: pOrderId }),
          });
          sessionStorage.removeItem(`wholesale-cart-${token}`);
        } catch (err) {
          console.error("Completion sync failed:", err);
        }
      };

      if (paymentMethod === "COD") {
        await completeOrder(data.order.codReference);
        alert("Success! Your wholesale order has been placed via Pay on Delivery.");
        router.push("/profile");
        return;
      }

      // Open Razorpay
      const options = {
        key: data.order.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Ishta Crafts",
        description: "Wholesale Bulk Order",
        order_id: data.order.razorpayOrderId,
        handler: async function (response) {
          await completeOrder(response.razorpay_order_id);
          alert("Payment Successful! Your wholesale order has been placed.");
          router.push("/profile");
        },
        prefill: { name: shipping.name, contact: shipping.phone },
        theme: { color: "#7A1F1F" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        alert("Payment Failed: " + resp.error.description);
      });
      rzp.open();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading your order...</p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div style={{ minHeight: "100vh", background: "var(--surface-sunken)" }}>
        <div className="container" style={{ maxWidth: "1100px", padding: "2rem" }}>

          {/* Back link */}
          <button
            onClick={() => router.back()}
            style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginBottom: "2rem", fontSize: "0.9rem" }}
          >
            <ArrowLeft size={16} /> Back to Catalog
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "2rem" }}>
            <ShieldCheck size={28} color="var(--success)" />
            <h1 className="heading-lg" style={{ margin: 0 }}>Wholesale Checkout</h1>
          </div>

          <div className="col-layout" style={{ gridTemplateColumns: "1.4fr 1fr", alignItems: "start", gap: "2rem" }}>

            {/* Shipping Form */}
            <div className="card">
              <div className="card-body" style={{ padding: "var(--space-6)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "var(--space-6)" }}>
                  <Truck size={22} color="var(--primary)" />
                  <h2 className="heading-md" style={{ margin: 0 }}>Shipping Address</h2>
                </div>

                <form onSubmit={handlePlaceOrder} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                  <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" required className="form-input" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input type="tel" required className="form-input" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit number" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Complete Address</label>
                    <textarea required className="form-input form-textarea" style={{ minHeight: "80px" }} value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
                  </div>

                  <div className="grid grid-2" style={{ gap: "var(--space-4)" }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input type="text" required className="form-input" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input type="text" required className="form-input" value={shipping.pincode} onChange={(e) => setShipping({ ...shipping, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="6-digit pincode" />
                    </div>
                  </div>

                  {/* Payment Selection */}
                  <div style={{ marginTop: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>Select Payment Mode</h3>

                    <div
                      onClick={() => setPaymentMethod("Online")}
                      style={{
                        padding: "1rem",
                        border: `1.5px solid ${paymentMethod === "Online" ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "12px",
                        cursor: "pointer",
                        backgroundColor: paymentMethod === "Online" ? "rgba(122, 31, 31, 0.04)" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {paymentMethod === "Online" && <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--primary)" }} />}
                      </div>
                      <span style={{ fontWeight: 600 }}>Online Payment (Cards, UPI)</span>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("COD")}
                      style={{
                        padding: "1rem",
                        border: `1.5px solid ${paymentMethod === "COD" ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "12px",
                        cursor: "pointer",
                        backgroundColor: paymentMethod === "COD" ? "rgba(122, 31, 31, 0.04)" : "#fff",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {paymentMethod === "COD" && <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "var(--primary)" }} />}
                      </div>
                      <span style={{ fontWeight: 600 }}>Pay on Delivery (Pay at Doorstep)</span>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-full mt-8" disabled={loading}>
                    {loading
                      ? (paymentMethod === "Online" ? "Initializing Gateway..." : "Placing Order...")
                      : paymentMethod === "Online"
                        ? `Pay ${formatPrice(grandTotal)} via Razorpay`
                        : `Confirm COD Order (${formatPrice(grandTotal)})`}
                  </button>
                </form>
              </div>
            </div>

            {/* Wholesale Order Summary */}
            <div className="card card-bordered" style={{ position: "sticky", top: "calc(var(--navbar-height) + 24px)", padding: "var(--space-6)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
                <h3 className="heading-sm" style={{ margin: 0 }}>Wholesale Order</h3>
                <span className="badge badge-secondary">{totalItems} items</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", marginBottom: "var(--space-5)" }}>
                {items.map((item) => (
                  <div key={item.productId} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                    <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: "8px", overflow: "hidden" }}>
                      <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        ₹{item.wholesalePrice} × {item.qty}
                      </p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "0.95rem", flexShrink: 0 }}>
                      {formatPrice(item.wholesalePrice * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ margin: "var(--space-4) 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1rem" }}>Wholesale Total</span>
                <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{formatPrice(grandTotal)}</span>
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
