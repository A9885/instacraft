"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/store/AuthContext";
import { auth } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import OrderTimeline from "@/components/profile/OrderTimeline";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  Clock,
  Filter,
  Calendar,
  XCircle,
  ArrowLeft,
  Search,
  ShoppingBag,
  CreditCard,
  Banknote,
} from "lucide-react";
import { useCart } from "@/store/CartContext";

function OrdersContent() {
  const { user } = useAuth();
  const { items: cartItems, clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error("Orders load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Handle resurrected local cart when returning after checkout
  useEffect(() => {
    if (orders.length > 0 && cartItems.length > 0) {
      const paidOrders = orders.filter((o) => o.payment.status === "Paid");
      if (paidOrders.length === 0) return;

      // Optimization: Efficiently find the most recent paid order
      const recentPaid = paidOrders.reduce((latest, o) => {
        const oTime = new Date(o.createdAt).getTime();
        const latestTime = new Date(latest.createdAt).getTime();
        return oTime > latestTime ? o : latest;
      }, paidOrders[0]);

      if (recentPaid) {
        const orderTime = new Date(recentPaid.createdAt).getTime();
        const now = Date.now();
        const diffMinutes = (now - orderTime) / (1000 * 60);

        // If order was placed within the last 15 minutes
        if (diffMinutes < 15) {
          // Strictly match cart items to the recent order items
          const isSameCart =
            cartItems.length === recentPaid.items.length &&
            cartItems.every((cItem) =>
              recentPaid.items.some(
                (oItem) =>
                  (oItem.slug === cItem.slug || oItem.id === cItem.id) &&
                  oItem.qty === cItem.qty,
              ),
            );

          if (isSameCart) {
            console.log("Stale cart detected after payment. Auto-clearing.");
            clearCart();
          }
        }
      }
    }
  }, [orders, cartItems, clearCart]);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone.",
    );
    if (!confirmCancel) return;

    try {
      const token = await user?.getIdToken();
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("Order cancelled successfully.");
      fetchOrders();
    } catch (err) {
      alert("Cancellation failed: " + err.message);
    }
  };

  // Extract unique years
  const orderYears = [
    ...new Set(orders.map((o) => new Date(o.createdAt).getFullYear())),
  ].sort((a, b) => b - a);

  // Filter + search (Memoized)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const statusMatch =
        orderFilter === "All" ? true : o.logistics.status === orderFilter;
      const yearMatch =
        yearFilter === "All"
          ? true
          : new Date(o.createdAt).getFullYear().toString() === yearFilter;
      const searchMatch = !searchQuery.trim()
        ? true
        : o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.items.some((i) =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase()),
          ) ||
          (o.shippingAddress?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
      return statusMatch && yearMatch && searchMatch;
    });
  }, [orders, orderFilter, yearFilter, searchQuery]);

  // Stats (Memoized)
  const totalSpent = useMemo(
    () =>
      orders
        .filter((o) => o.payment.status === "Paid")
        .reduce(
          (acc, o) =>
            acc +
            (o.totalAmount || o.items.reduce((a, i) => a + i.price * i.qty, 0)),
          0,
        ),
    [orders],
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.logistics.status === "Delivered").length,
    [orders],
  );
  const activeCount = useMemo(
    () =>
      orders.filter((o) =>
        ["Placed", "Packed", "Dispatched", "In_Transit"].includes(
          o.logistics.status,
        ),
      ).length,
    [orders],
  );

  return (
    <div
      className="section"
      style={{ backgroundColor: "var(--surface-sunken)", minHeight: "100vh" }}
    >
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Header */}
        <div className="fade-in" style={{ marginBottom: 32 }}>
          <Link
            href="/profile"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--primary)",
              fontSize: "var(--fs-14)",
              fontWeight: 600,
              textDecoration: "none",
              marginBottom: 16,
            }}
          >
            <ArrowLeft size={16} /> Back to Profile
          </Link>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1 className="heading-lg" style={{ margin: 0 }}>
                My Orders
              </h1>
              <p
                className="text-muted"
                style={{ fontSize: "var(--fs-14)", marginTop: 4 }}
              >
                Track, manage, and review your purchases
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div
          className="fade-in"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div
            className="card"
            style={{
              background: "var(--surface-white)",
              border: "1px solid var(--border-light)",
              borderBottom: "3px solid var(--primary)",
            }}
          >
            <div className="card-body" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      margin: 0,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Total Orders
                  </p>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      margin: "6px 0 0",
                      fontFamily: "var(--font-heading)",
                      color: "var(--primary)",
                    }}
                  >
                    {orders.length}
                  </p>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--error-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingBag size={22} color="var(--primary)" />
                </div>
              </div>
            </div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--surface-white)",
              border: "1px solid var(--border-light)",
              borderBottom: "3px solid var(--secondary)",
            }}
          >
            <div className="card-body" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      margin: 0,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Total Spent
                  </p>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      margin: "6px 0 0",
                      fontFamily: "var(--font-heading)",
                      color: "var(--secondary-dark)",
                    }}
                  >
                    {formatPrice(totalSpent)}
                  </p>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--warning-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle size={22} color="var(--secondary-dark)" />
                </div>
              </div>
            </div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--surface-white)",
              border: "1px solid var(--border-light)",
              borderBottom: "3px solid var(--warning)",
            }}
          >
            <div className="card-body" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      margin: 0,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Active
                  </p>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      margin: "6px 0 0",
                      fontFamily: "var(--font-heading)",
                      color: "var(--warning)",
                    }}
                  >
                    {activeCount}
                  </p>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--warning-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock size={22} color="var(--warning)" />
                </div>
              </div>
            </div>
          </div>
          <div
            className="card"
            style={{
              background: "var(--surface-white)",
              border: "1px solid var(--border-light)",
              borderBottom: "3px solid var(--accent)",
            }}
          >
            <div className="card-body" style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      margin: 0,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    Delivered
                  </p>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      margin: "6px 0 0",
                      fontFamily: "var(--font-heading)",
                      color: "var(--accent)",
                    }}
                  >
                    {deliveredCount}
                  </p>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--info-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Package size={22} color="var(--accent)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="card fade-in" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ padding: "16px 20px" }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              {/* Search */}
              <div
                style={{
                  position: "relative",
                  flex: "1 1 220px",
                  minWidth: 180,
                }}
              >
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search orders by ID, product, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: 36,
                    borderRadius: 24,
                    fontSize: 13,
                    height: 40,
                  }}
                />
              </div>

              {/* Year Filter */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--surface-sunken)",
                  padding: "6px 14px",
                  borderRadius: 24,
                  border: "1px solid var(--border-light)",
                }}
              >
                <Calendar size={14} color="var(--primary)" />
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    appearance: "none",
                    paddingRight: 4,
                    minWidth: 60,
                  }}
                >
                  <option value="All">All Years</option>
                  {orderYears.map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "var(--surface-sunken)",
                  padding: "6px 14px",
                  borderRadius: 24,
                  border: "1px solid var(--border-light)",
                }}
              >
                <Filter size={14} color="var(--primary)" />
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    appearance: "none",
                    paddingRight: 4,
                    minWidth: 100,
                  }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Placed">Placed</option>
                  <option value="Packed">Packed</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="In_Transit">In Transit</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div
          className="fade-in"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <p
            className="text-muted"
            style={{ fontSize: "var(--fs-13)", margin: 0 }}
          >
            Showing {filteredOrders.length} of {orders.length} orders
          </p>
          {(orderFilter !== "All" ||
            yearFilter !== "All" ||
            searchQuery.trim()) && (
            <button
              onClick={() => {
                setOrderFilter("All");
                setYearFilter("All");
                setSearchQuery("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Orders List */}
        {loading ? (
          <div
            className="card fade-in"
            style={{ padding: 48, textAlign: "center" }}
          >
            <div
              style={{
                display: "inline-block",
                width: 40,
                height: 40,
                border: "3px solid var(--border-light)",
                borderTop: "3px solid var(--primary)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p className="text-muted" style={{ marginTop: 16 }}>
              Loading your orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card fade-in">
            <div
              className="card-body"
              style={{ textAlign: "center", padding: "var(--space-12)" }}
            >
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "var(--space-4)",
                }}
              >
                <Package size={56} color="var(--primary)" />
              </span>
              <h3 className="heading-sm mb-2">
                {orders.length === 0
                  ? "No orders yet"
                  : `No ${orderFilter !== "All" ? orderFilter : ""} orders found`}
                {yearFilter !== "All" ? ` for ${yearFilter}` : ""}
              </h3>
              <p className="text-muted mb-5">
                {orders.length === 0
                  ? "Start shopping to see your orders here!"
                  : "Try adjusting your filters or search query."}
              </p>
              {orders.length === 0 ? (
                <Link href="/shop" className="btn btn-primary">
                  Explore Products
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setOrderFilter("All");
                    setYearFilter("All");
                    setSearchQuery("");
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {filteredOrders.map((order) => {
              const totalItemsPrice = order.items.reduce(
                (acc, i) => acc + i.price * i.qty,
                0,
              );
              const isPaid = order.payment.status === "Paid";
              const isCancelled = order.logistics.status === "Cancelled";
              const isWholesale = !!order.wholesaleToken;
              const canCancel = ["Placed", "Packed"].includes(
                order.logistics.status,
              );

              return (
                <div
                  key={order._id}
                  className="card order-card-hover fade-in"
                  style={{
                    transition: "transform 0.2s, box-shadow 0.2s",
                    opacity: isCancelled ? 0.7 : 1,
                    border: isWholesale ? "1px solid rgba(122, 31, 31, 0.1)" : "1px solid var(--border-light)",
                    backgroundColor: isWholesale ? "var(--wholesale-bg)" : "var(--surface-raised)",
                  }}
                >
                  <div className="card-body">
                    <div
                      className="flex-between mb-4"
                      style={{ flexWrap: "wrap", gap: "12px" }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Order ID: #
                          {order._id
                            .substring(order._id.length - 8)
                            .toUpperCase()}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginTop: "2px",
                          }}
                        >
                          <h3
                            style={{
                              fontSize: "15px",
                              fontWeight: 700,
                              margin: 0,
                              color: "var(--text-dark)",
                            }}
                          >
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </h3>
                          {isWholesale && (
                            <span
                              style={{
                                backgroundColor: "var(--primary)",
                                color: "white",
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                letterSpacing: "0.5px",
                                fontWeight: 700,
                                display: "inline-flex",
                                alignItems: "center",
                              }}
                            >
                              WHOLESALE
                            </span>
                          )}
                          {/* Payment method badge */}
                          <span
                            style={{
                              backgroundColor: order.paymentMethod === 'COD' ? "#FEF3C7" : "#EFF6FF",
                              color: order.paymentMethod === 'COD' ? "#92400E" : "#1D4ED8",
                              fontSize: "12px",
                              padding: "4px 10px",
                              borderRadius: "16px",
                              fontWeight: 600,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                          >
                            {order.paymentMethod === 'COD' ? (
                              <>
                                <Banknote size={14} />
                                Pay on Delivery
                              </>
                            ) : (
                              <>
                                <CreditCard size={14} />
                                Paid Online
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        {/* Only show payment status badge for COD orders if they are resolved (paid/cancelled) */}
                        {order.paymentMethod === 'COD' && (isPaid || isCancelled) && (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              backgroundColor: isPaid
                                ? "var(--success-bg)"
                                : isCancelled
                                  ? "var(--neutral-bg)"
                                  : "var(--error-bg)",
                              color: isPaid
                                ? "var(--success-text)"
                                : isCancelled
                                  ? "var(--neutral-text)"
                                  : "var(--error-text)",
                              padding: "6px 14px",
                              borderRadius: "24px",
                              fontSize: "12px",
                              fontWeight: 700,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            }}
                          >
                            {isPaid ? (
                              <CheckCircle size={14} />
                            ) : (
                              <Clock size={14} />
                            )}
                            {isPaid
                              ? "Cash Received"
                              : isCancelled
                                ? "Disposed"
                                : "Pay on Delivery"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="divider" style={{ margin: "16px 0" }} />

                    <div className="order-details-grid">
                      {/* Items List */}
                      <div>
                        {order.items.map((item, idx) => (
                          <div
                            key={item.id || item._id || `item-${idx}`}
                            style={{
                              display: "flex",
                              gap: 16,
                              marginBottom: 16,
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "var(--neutral-bg)",
                                flexShrink: 0,
                                border: "1px solid var(--border-light)",
                              }}
                            >
                              <img
                                src={item.image || "/images/placeholder.webp"}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "var(--text-dark)",
                                }}
                              >
                                {item.title}
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "var(--text-muted)",
                                }}
                              >
                                Quantity: {item.qty} × {formatPrice(item.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                            marginTop: 12,
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 16px",
                              background: "var(--surface-sunken)",
                              borderRadius: 8,
                              display: "inline-flex",
                              flexDirection: "column",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                              }}
                            >
                              Amount Paid
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 18,
                                  fontWeight: 800,
                                  color: isCancelled
                                    ? "var(--text-muted)"
                                    : "var(--primary)",
                                }}
                              >
                                {formatPrice(
                                  order.totalAmount || totalItemsPrice,
                                )}
                              </span>
                              {order.coupon && order.coupon.discount > 0 && (
                                <span
                                  style={{
                                    fontSize: 11,
                                    backgroundColor: "var(--success-bg)",
                                    color: "var(--success-text)",
                                    padding: "2px 8px",
                                    borderRadius: 4,
                                    fontWeight: 700,
                                  }}
                                >
                                  COUPON: {order.coupon.code} (-{formatPrice(order.coupon.discount)})
                                </span>
                              )}
                            </div>
                          </div>

                          {isCancelled && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                color: "var(--error)",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              <XCircle size={16} /> Order Cancelled
                            </div>
                          )}

                          {!isCancelled && canCancel && (
                            <button
                              onClick={() => handleCancelOrder(order._id)}
                              className="btn btn-ghost btn-sm"
                              style={{
                                color: "var(--error)",
                                textDecoration: "underline",
                                padding: 0,
                              }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Logistics Pipeline */}
                      <OrderTimeline order={order} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute redirectTo="/">
      <OrdersContent />
    </ProtectedRoute>
  );
}
