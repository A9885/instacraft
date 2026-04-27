"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function WholesaleCatalogPage() {
  const { token } = useParams();
  const router = useRouter();

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch(`/api/wholesale/${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load catalog");
        }

        setCatalog(data.catalog);

        // Default all quantities to 0 — wholesaler must opt in
        const initialQs = {};
        data.catalog.products.forEach((p) => {
          if (p.product) initialQs[p.product._id] = 0;
        });
        setQuantities(initialQs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCatalog();
  }, [token]);

  const handleQtyChange = (id, val) => {
    let q = parseInt(val, 10);
    if (isNaN(q) || q < 0) q = 0;
    setQuantities((prev) => ({ ...prev, [id]: q }));
  };

  const handleCheckout = () => {
    const selectedItems = [];
    catalog.products.forEach((item) => {
      const qty = quantities[item.product._id];
      if (qty > 0) {
        selectedItems.push({
          productId: item.product._id,
          slug: item.product.slug,
          title: item.product.title,
          image: item.product.images[0],
          wholesalePrice: item.wholesalePrice,
          qty,
        });
      }
    });

    if (selectedItems.length === 0) {
      alert("Please select a quantity for at least one item to proceed.");
      return;
    }

    // Store in sessionStorage — isolated from normal cart
    sessionStorage.setItem(
      `wholesale-cart-${token}`,
      JSON.stringify(selectedItems)
    );
    router.push(`/wholesale/${token}/checkout`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading your private catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)", padding: "20px" }}>
        <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", padding: "2rem", borderRadius: "12px", textAlign: "center", maxWidth: "500px" }}>
          <AlertTriangle size={48} color="var(--error)" style={{ margin: "0 auto 1rem" }} />
          <h1 className="heading-md mb-2" style={{ color: "var(--error)" }}>Access Denied</h1>
          <p style={{ color: "var(--error)", opacity: 0.9 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!catalog) return null;

  // Live totals for the sticky footer
  let currentTotal = 0;
  let totalItems = 0;
  catalog.products.forEach((item) => {
    const qty = quantities[item.product?._id] || 0;
    currentTotal += qty * item.wholesalePrice;
    if (qty > 0) totalItems += qty;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", paddingBottom: "130px" }}>

      {/* Header */}
      <header style={{ background: "var(--surface)", padding: "3rem 2rem", textAlign: "center", borderBottom: "1px solid var(--border-color)" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span className="badge badge-secondary mb-4" style={{ display: "inline-flex", padding: "6px 14px", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            🔒 Private Wholesale Offer
          </span>
          <h1 className="heading-xl mb-4 text-gradient">{catalog.name}</h1>
          {catalog.description && (
            <p className="text-muted" style={{ fontSize: "1.05rem", lineHeight: 1.7 }}>{catalog.description}</p>
          )}
          {catalog.expiryDate && (
            <p style={{ marginTop: "1rem", color: "var(--error)", fontSize: "13px", fontWeight: 600 }}>
              ⚠️ Offer expires: {new Date(catalog.expiryDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </header>

      {/* Bulk Order Grid */}
      <main className="container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 2rem" }}>
        <p className="text-muted mb-6" style={{ fontSize: "0.95rem" }}>
          Enter the quantity you want to order for each product. The total will update live at the bottom.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {catalog.products.map((item) => {
            if (!item.product) return null;
            const p = item.product;
            const qty = quantities[p._id] || 0;
            const lineTotal = qty * item.wholesalePrice;

            return (
              <div
                key={p._id}
                style={{
                  background: "var(--surface)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: qty > 0 ? "2px solid var(--primary)" : "1px solid var(--border-color)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  boxShadow: qty > 0 ? "0 4px 20px rgba(122,31,31,0.12)" : "none",
                }}
              >
                {/* Product Image */}
                <div style={{ aspectRatio: "4/3", background: "var(--surface-sunken)", position: "relative", overflow: "hidden" }}>
                  <img src={p.images[0]} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px" }}>
                    <span className="badge badge-success" style={{ fontWeight: 700, fontSize: "12px" }}>
                      ₹{item.wholesalePrice} / pc
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div style={{ padding: "1.25rem", flexGrow: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "4px" }}>{p.title}</h3>
                    <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                      <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary)" }}>₹{item.wholesalePrice}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", textDecoration: "line-through" }}>
                        Retail ₹{p.salePrice || p.price}
                      </span>
                    </div>
                  </div>

                  {/* Qty stepper */}
                  <div style={{ marginTop: "auto" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px", fontWeight: 500 }}>
                      ORDER QTY
                    </label>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleQtyChange(p._id, qty - 1)}
                        style={{ padding: "0 14px", height: "40px", fontSize: "1.2rem" }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="form-input"
                        value={qty}
                        onChange={(e) => handleQtyChange(p._id, e.target.value)}
                        style={{ textAlign: "center", fontSize: "1.1rem", fontWeight: 700, height: "40px", flex: 1 }}
                        min="0"
                      />
                      <button
                        className="btn btn-outline"
                        onClick={() => handleQtyChange(p._id, qty + 1)}
                        style={{ padding: "0 14px", height: "40px", fontSize: "1.2rem" }}
                      >
                        +
                      </button>
                    </div>
                    {qty > 0 && (
                      <p style={{ marginTop: "8px", fontSize: "0.85rem", fontWeight: 600, color: "var(--primary)" }}>
                        Line total: {formatPrice(lineTotal)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom Bar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "var(--surface)",
        borderTop: "2px solid var(--border-color)",
        padding: "1rem 2rem",
        zIndex: 100,
        boxShadow: "0 -8px 30px rgba(0,0,0,0.08)"
      }}>
        <div className="container" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Wholesale Order Total
            </p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
              <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--primary)" }}>{formatPrice(currentTotal)}</span>
              {totalItems > 0 && (
                <span style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>{totalItems} item{totalItems !== 1 ? "s" : ""} selected</span>
              )}
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ display: "flex", alignItems: "center", gap: "10px", opacity: totalItems === 0 ? 0.5 : 1, cursor: totalItems === 0 ? "not-allowed" : "pointer" }}
            onClick={handleCheckout}
            disabled={totalItems === 0}
          >
            Review & Checkout <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
