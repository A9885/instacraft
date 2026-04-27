"use client";

import { useCart } from "@/store/CartContext";
import { formatPrice } from "@/lib/utils";
import { ShieldCheck, Truck, CreditCard, Trash2, Banknote } from "lucide-react";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";

function CheckoutContent() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clearCart, removeItemBySlug } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Online"); // 'Online' or 'COD'
  const router = useRouter();

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const [shippingFee, setShippingFee] = useState(199);
  const [shippingThreshold, setShippingThreshold] = useState(1000);

  // Load addresses when auth resolves
  useEffect(() => {
    let isMounted = true;
    if (authLoading) return; // Wait until auth finishes loading

    const fetchAddresses = async (token) => {
      try {
        const res = await fetch("/api/profile/addresses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && isMounted) {
          const data = await res.json();
          setSavedAddresses(data.addresses || []);
        }
      } catch (e) {
        console.error("Failed to load saved addresses:", e);
      } finally {
        if (isMounted) setAddressesLoading(false);
      }
    };

    if (user) {
      user.getIdToken().then((token) => {
        if (isMounted) fetchAddresses(token);
      });
    } else {
      if (isMounted) setAddressesLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Fetch Shipping Config on mount
  useEffect(() => {
    let isMounted = true;
    fetch("/api/site-config/public")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setShippingFee(data.shippingFee ?? 199);
          setShippingThreshold(data.freeShippingThreshold ?? 1000);
        }
      })
      .catch((err) => console.error("Could not load shipping config", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectAddress = (addr) => {
    setShipping({
      name: addr.name,
      phone: addr.phone,
      address: addr.street,
      city: addr.city,
      pincode: addr.pincode,
    });
    setSaveNewAddress(false);
  };

  const handleDeleteAddress = async (e, addressId) => {
    e.stopPropagation(); // Prevent selecting the address

    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/profile/addresses?id=${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setSavedAddresses(prev => prev.filter(addr => (addr.id || addr._id) !== addressId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete address");
      }
    } catch (err) {
      console.error("Delete address error:", err);
      alert("An error occurred while deleting the address");
    }
  };

  const [couponInput, setCouponInput] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setCouponError("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.replace(/\s+/g, "") }),
      });

      const data = await response.json();

      if (data.valid) {
        // Check if subtotal meets the minimum requirement
        if (subtotal < data.coupon.minOrder) {
          setCouponError(`Min order of ₹${data.coupon.minOrder} required`);
          return;
        }

        setAppliedCoupon(data.coupon);
        setIsCouponApplied(true);
        console.log("Coupon applied:", data.coupon);
      } else {
        setCouponError(data.message || "Invalid coupon code");
      }
    } catch (err) {
      setCouponError("Could not validate coupon. Try again.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setIsCouponApplied(false);
    setCouponInput("");
    setCouponError("");
  };

  // Calculate actual discount amount
  const discountAmount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? (subtotal * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0;

  const applicableShipping = subtotal >= shippingThreshold ? 0 : shippingFee;
  const finalTotal = Math.max(
    1,
    subtotal - discountAmount + applicableShipping,
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get Unified Token
      const token = await user?.getIdToken();
      if (!token) {
        throw new Error("Authentication error. Please log in again.");
      }

      // 2. Format cart items for the secure backend
      const formattedItems = items.map((item) => ({
        slug: item.slug,
        quantity: item.qty,
      }));

      // 3. Request secure order generation
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: formattedItems,
          shippingAddress: shipping,
          couponCode: appliedCoupon?.code || null,
          paymentMethod,
          saveAddress: saveNewAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(
          data.error || "Failed to initialize secure checkout",
        );
        error.missingSlug = data.missingSlug;
        throw error;
      }

      // 4. Handle Redirect vs Gateway
      if (paymentMethod === "COD") {
        alert("Success! Your order has been placed via Pay on Delivery.");
        clearCart();
        router.push("/profile");
        return;
      }

      // 5. Trigger Razorpay UI Web Wrapper
      const options = {
        key: data.order.keyId, // Key injected dynamically from server
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Handicrafts Store",
        description: "Secure Checkout",
        order_id: data.order.razorpayOrderId,
        handler: function (paymentResponse) {
          // Note: The real verification drops into the Webhook!
          // This frontend handler is just for UX/Routing
          alert("Payment Successful! Your order has been placed securely.");
          clearCart();
          router.push("/profile"); // Redirect to profile/orders
        },
        prefill: {
          name: shipping.name,
          contact: shipping.phone,
        },
        theme: {
          color: "#000000", // We'll keep a sleek black or use primary color
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (paymentResponse) {
        alert("Payment Failed: " + paymentResponse.error.description);
      });
      razorpayInstance.open();
    } catch (error) {
      // Find specifically handled "missing product" error from server
      const missingSlug = error.missingSlug;
      const notFoundMatch = error.message?.match(/Product not found: (.+)/);
      const slugToRemove =
        missingSlug || (notFoundMatch ? notFoundMatch[1] : null);

      if (slugToRemove) {
        const itemToRemove = items.find((i) => i.slug === slugToRemove);
        const productTitle = itemToRemove ? itemToRemove.title : slugToRemove;

        alert(
          `Sorry! "${productTitle}" is no longer available and has been removed from your cart. Please review your order and try again.`,
        );
        removeItemBySlug(slugToRemove);
        // We stop loading here so the user can see the updated cart and decide how to proceed
        setLoading(false);
        return;
      }

      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="section container text-center">
        <h1 className="heading-lg mb-4">Your Cart is Empty</h1>
        <p className="mb-6 text-muted">
          Add some products to your cart to proceed with checkout.
        </p>
        <Link href="/shop" className="btn btn-primary">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Inject Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div
        className="section"
        style={{ backgroundColor: "var(--surface-sunken)", minHeight: "100vh" }}
      >
        <div className="container">
          <div className="flex-between mb-8">
            <h1 className="heading-lg">Secure Checkout</h1>
            <div style={{ display: "flex", gap: 12, color: "var(--success)" }}>
              <ShieldCheck />{" "}
              <span style={{ fontWeight: 600 }}>100% Safe Payments</span>
            </div>
          </div>

          <div
            className="col-layout"
            style={{ gridTemplateColumns: "1.5fr 1fr", alignItems: "start" }}
          >
            {/* Shipping Form */}
            <div className="card">
              <div className="card-body" style={{ padding: "var(--space-6)" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: "var(--space-6)",
                  }}
                >
                  <Truck size={24} color="var(--primary)" />
                  <h2 className="heading-md" style={{ margin: 0 }}>
                    Shipping Address
                  </h2>
                </div>

                <form onSubmit={handlePlaceOrder}>
                  {savedAddresses.length > 0 && (
                    <div style={{ marginBottom: "var(--space-6)" }}>
                      <p className="text-body-sm text-muted mb-3">
                        Select a saved address:
                      </p>
                      <div style={{ display: "grid", gap: "var(--space-3)" }}>
                        {savedAddresses.map((addr, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectAddress(addr)}
                            className="card-hover-shadow"
                            style={{
                              padding: 'var(--space-3)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--border-radius-sm)',
                              cursor: 'pointer',
                              position: 'relative',
                              backgroundColor: shipping.pincode === addr.pincode && shipping.address === addr.street ? 'var(--primary-subtle)' : 'transparent',
                              borderColor: shipping.pincode === addr.pincode && shipping.address === addr.street ? 'var(--primary)' : 'var(--border-color)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                              <strong style={{ fontSize: 'var(--fs-14)' }}>
                                {addr.name}
                              </strong>
                              <button
                                onClick={(e) => handleDeleteAddress(e, addr.id || addr._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--error, #ff4444)',
                                  cursor: 'pointer',
                                  padding: 4,
                                  marginTop: -4,
                                  marginRight: -4,
                                  opacity: 0.6,
                                  transition: 'opacity 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                title="Delete Address"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <p
                              className="text-muted"
                              style={{
                                fontSize: "var(--fs-13)",
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              {addr.street}, {addr.city} - {addr.pincode}
                              <br />
                              {addr.phone}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div
                        className="divider"
                        style={{ margin: "var(--space-6) 0 var(--space-4)" }}
                      />
                      <p className="text-body-sm text-muted mb-4">
                        Or enter a new address:
                      </p>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-4)",
                    }}
                  >
                    <div
                      className="grid grid-2"
                      style={{ gap: "var(--space-4)" }}
                    >
                      <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={shipping.name || ""}
                          onChange={(e) =>
                            setShipping({ ...shipping, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mobile Number</label>
                        <input
                          type="tel"
                          required
                          className="form-input"
                          value={shipping.phone || ""}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            setShipping({ ...shipping, phone: val });
                          }}
                          placeholder="10-digit mobile number"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Complete Address</label>
                      <textarea
                        required
                        className="form-input form-textarea"
                        style={{ minHeight: 80 }}
                        value={shipping.address || ""}
                        onChange={(e) =>
                          setShipping({ ...shipping, address: e.target.value })
                        }
                      ></textarea>
                    </div>

                    <div
                      className="grid grid-2"
                      style={{ gap: "var(--space-4)" }}
                    >
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={shipping.city || ""}
                          onChange={(e) =>
                            setShipping({ ...shipping, city: e.target.value })
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Pincode</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={shipping.pincode || ""}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setShipping({ ...shipping, pincode: val });
                          }}
                          placeholder="6-digit pincode"
                        />
                      </div>
                    </div>

                    <div
                      className="form-group"
                      style={{ marginTop: "var(--space-2)" }}
                    >
                      <label
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          className="filter-checkbox"
                          checked={saveNewAddress}
                          onChange={(e) => setSaveNewAddress(e.target.checked)}
                        />
                        <span style={{ fontSize: "var(--fs-14)" }}>
                          Save this address for future orders
                        </span>
                      </label>
                    </div>
                  </div>

                  <div
                    className="divider"
                    style={{ margin: "var(--space-6) 0" }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: "var(--space-6)",
                    }}
                  >
                    <CreditCard size={24} color="var(--primary)" />
                    <h2 className="heading-md" style={{ margin: 0 }}>
                      Payment Method
                    </h2>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "var(--space-3)",
                      marginBottom: "var(--space-6)",
                    }}
                  >
                    <div
                      onClick={() => setPaymentMethod("Online")}
                      style={{
                        padding: "var(--space-4)",
                        border: `1.5px solid ${paymentMethod === "Online" ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "var(--border-radius)",
                        cursor: "pointer",
                        backgroundColor:
                          paymentMethod === "Online"
                            ? "rgba(122, 31, 31, 0.04)"
                            : "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "2px solid var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {paymentMethod === "Online" && (
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: "var(--primary)",
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div
                          style={{ fontWeight: 600, fontSize: "var(--fs-15)", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <CreditCard size={18} />
                          Paid Online
                        </div>
                        <div
                          style={{
                            fontSize: "var(--fs-13)",
                            color: "var(--text-muted)",
                            marginTop: "4px"
                          }}
                        >
                          UPI, Cards, Netbanking (via Razorpay)
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setPaymentMethod("COD")}
                      style={{
                        padding: "var(--space-4)",
                        border: `1.5px solid ${paymentMethod === "COD" ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "var(--border-radius)",
                        cursor: "pointer",
                        backgroundColor:
                          paymentMethod === "COD"
                            ? "rgba(122, 31, 31, 0.04)"
                            : "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          border: "2px solid var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {paymentMethod === "COD" && (
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: "var(--primary)",
                            }}
                          />
                        )}
                      </div>
                      <div>
                        <div
                          style={{ fontWeight: 600, fontSize: "var(--fs-15)", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                          <Banknote size={18} />
                          Pay on Delivery
                        </div>
                        <div
                          style={{
                            fontSize: "var(--fs-13)",
                            color: "var(--text-muted)",
                            marginTop: "4px"
                          }}
                        >
                          Pay securely at your doorstep
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "var(--space-4)",
                      border: "1.5px dashed var(--border-dark)",
                      borderRadius: "var(--border-radius)",
                      backgroundColor: "#fff",
                      textAlign: "center",
                    }}
                  >
                    <p className="text-muted" style={{ fontWeight: 500 }}>
                      {paymentMethod === "Online"
                        ? "Razorpay Secure Checkout will verify and process your payment."
                        : "Your order will be placed immediately. Please keep cash ready at delivery."}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-full mt-8"
                    disabled={loading}
                  >
                    {loading
                      ? paymentMethod === "Online"
                        ? "Initializing Gateway..."
                        : "Placing Order..."
                      : paymentMethod === "Online"
                        ? `Proceed to Pay ${formatPrice(finalTotal)} via Razorpay`
                        : `Confirm COD Order (${formatPrice(finalTotal)})`}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div
              className="card card-bordered"
              style={{
                position: "sticky",
                top: "calc(var(--navbar-height) + 24px)",
                padding: "var(--space-6)",
              }}
            >
              <h3 className="heading-sm mb-6">Order Summary</h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4)",
                  marginBottom: "var(--space-6)",
                }}
              >
                {items.map((item) => (
                  <div
                    key={item.id || item.slug}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "var(--space-4)",
                      fontSize: "var(--fs-14)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-3)",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          position: "relative",
                          flexShrink: 0,
                          borderRadius: "var(--border-radius-sm)",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <span
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            background: "var(--text-dark)",
                            color: "#fff",
                            fontSize: 10,
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {item.qty}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          className="text-dark"
                          style={{ fontWeight: 500, lineHeight: 1.2 }}
                        >
                          {item.title}
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "var(--fs-12)" }}
                        >
                          {item.artisan}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600 }}>
                      {formatPrice((item.salePrice || item.price) * item.qty)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider" style={{ margin: "var(--space-4) 0" }} />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                  marginBottom: "var(--space-6)",
                }}
              >
                <div
                  className="flex-between text-muted"
                  style={{ fontSize: "var(--fs-14)" }}
                >
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div
                  className="flex-between text-muted"
                  style={{ fontSize: "var(--fs-14)" }}
                >
                  <span>Shipping</span>
                  {applicableShipping === 0 ? (
                    <span style={{ color: "var(--success)" }}>FREE</span>
                  ) : (
                    <span style={{ fontWeight: 500 }}>
                      {formatPrice(applicableShipping)}
                    </span>
                  )}
                </div>
                <div
                  className="divider"
                  style={{ margin: "var(--space-2) 0" }}
                />
                {!isCouponApplied ? (
                  <div className="coupon-input-container">
                    <span
                      className="text-muted"
                      style={{
                        fontSize: "var(--fs-13)",
                        marginBottom: 8,
                        display: "block",
                      }}
                    >
                      Enter coupon code
                    </span>
                    <div className="flex-between flex-row" style={{ gap: 8 }}>
                      <input
                        type="text"
                        className="form-input coupon-input"
                        placeholder="e.g. SAVE20"
                        value={couponInput || ""}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        style={{ textTransform: "uppercase" }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm coupon-apply-btn"
                        onClick={handleApplyCoupon}
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="form-error mt-2">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div
                    className="coupon-applied"
                    style={{
                      backgroundColor: "var(--success-bg)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--border-radius)",
                      border: "1.5px dashed var(--success)",
                      marginTop: "var(--space-2)",
                    }}
                  >
                    <div className="flex-between">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            color: "var(--success)",
                            fontWeight: 600,
                            fontSize: "var(--fs-14)",
                          }}
                        >
                          Coupon Applied
                        </span>
                        <span
                          className="badge badge-success"
                          style={{ fontSize: 10 }}
                        >
                          {appliedCoupon?.code}
                        </span>
                      </div>
                      <span
                        style={{ fontWeight: 700, color: "var(--success)" }}
                      >
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: 11,
                        textDecoration: "underline",
                        cursor: "pointer",
                        marginTop: 4,
                        padding: 0,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                <div
                  className="flex-between"
                  style={{ fontWeight: "bold", fontSize: "var(--fs-18)" }}
                >
                  <span>Total</span>
                  <span className="price">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <p
                className="text-muted"
                style={{
                  fontSize: "var(--fs-12)",
                  textAlign: "center",
                  marginTop: "var(--space-4)",
                }}
              >
                By placing your order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
