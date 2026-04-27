'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { AlertTriangle, ArrowLeft, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function AdminWholesaleCatalogPreview({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const { user, isAdmin, loading: authLoading } = useAuth();
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const idToken = await user?.getIdToken();
        if (!idToken) throw new Error("Security blockage: Token missing.");

        const res = await fetch(`/api/admin/wholesale-catalogs/${id}`, {
          headers: { 'Authorization': `Bearer ${idToken}` }
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load catalog");
        }

        setCatalog(data.catalog);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (user && isAdmin) {
        fetchCatalog();
      } else {
        setError("Unauthorized Admin Access.");
        setLoading(false);
      }
    }
  }, [id, authLoading, user, isAdmin]);

  if (loading) {
    return (
      <div className="admin-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading catalog preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page" style={{ minHeight: "100vh", padding: "20px" }}>
        <div style={{ background: "var(--error-bg)", border: "1px solid var(--error)", padding: "2rem", borderRadius: "12px", textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
          <AlertTriangle size={48} color="var(--error)" style={{ margin: "0 auto 1rem" }} />
          <h1 className="heading-md mb-2" style={{ color: "var(--error)" }}>Data Load Failed</h1>
          <p style={{ color: "var(--error)", opacity: 0.9 }}>{error}</p>
          <button onClick={() => router.push('/admin/wholesale')} className="btn btn-primary mt-4">Go Back</button>
        </div>
      </div>
    );
  }

  if (!catalog) return null;

  return (
    <div className="admin-page fade-in" style={{ paddingBottom: "60px" }}>
      <button onClick={() => router.push('/admin/wholesale')} className="btn btn-ghost mb-6" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingLeft: 0 }}>
        <ArrowLeft size={18} /> Back to Catalogs
      </button>

      {/* Header matching public view */}
      <header style={{ background: "var(--surface)", padding: "3rem 2rem", textAlign: "center", border: "1px solid var(--border-medium)", borderRadius: "16px", marginBottom: "2rem" }}>
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <span className="badge badge-secondary mb-4" style={{ display: "inline-flex", padding: "6px 14px", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
            <Eye size={14} style={{ marginRight: 6 }} /> Customer Preview Mode
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
      <main>
        <p className="text-muted mb-6" style={{ fontSize: "0.95rem" }}>
          Currently showing exactly what your B2B customers will see when they visit this link. 
          Checkout actions and quantity steppers are disabled in admin preview mode.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {catalog.products.map((item) => {
            if (!item.product) return null;
            const p = item.product;
            const retailPrice = p.salePrice || p.price;
            const savings = retailPrice - item.wholesalePrice;
            const savingsPercent = Math.round((savings / retailPrice) * 100);

            return (
              <div
                key={p._id}
                style={{
                  background: "var(--surface)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid var(--border-medium)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "box-shadow 0.2s ease",
                }}
              >
                {/* Product Image */}
                <div style={{ aspectRatio: "4/3", background: "var(--surface-sunken)", position: "relative", overflow: "hidden" }}>
                  <img src={p.images?.[0] || '/placeholder.webp'} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", gap: "6px" }}>
                    <span className="badge badge-success" style={{ fontWeight: 700, fontSize: "12px" }}>
                      ₹{item.wholesalePrice} / wholesale
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
                        Retail ₹{retailPrice}
                      </span>
                    </div>
                  </div>

                  {/* Read-only stats instead of QTY stepper */}
                  <div style={{ marginTop: "auto", background: "var(--bg-main)", padding: "12px", borderRadius: "8px", border: "1px dashed var(--border-medium)" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Discount Value</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--success)" }}>-{formatPrice(savings)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "4px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Profit Margin Cut</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)" }}>{savingsPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
