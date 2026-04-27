"use client";

import { useState } from "react";
import { useAdmin } from "@/store/AdminContext";
import { useAuth } from "@/store/AuthContext";
import { formatDate } from "@/lib/utils";
import { X } from "lucide-react";

export default function AdminCouponsPage() {
  const { coupons, dispatch } = useAdmin();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    discount: "",
    type: "percentage",
    minOrder: "",
    maxUses: "",
    validUntil: "",
    active: true,
  });
  const [error, setError] = useState("");

  const handleCodeChange = (val) => {
    const uppercased = val.toUpperCase();
    if (/\s/.test(uppercased)) {
      setError("Coupon code cannot contain spaces");
    } else {
      setError("");
    }
    setForm((f) => ({ ...f, code: uppercased }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    if (/\s/.test(form.code)) {
      setError("Spaces are not allowed in coupon codes");
      return;
    }

    const idToken = await user.getIdToken();
    const newCoupon = {
      ...form,
      id: `cup-${Date.now()}`,
      code: form.code.toUpperCase(),
      discount: Number(form.discount),
      minOrder: Number(form.minOrder) || 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      usedCount: 0,
    };

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(newCoupon),
      });

      if (!res.ok) throw new Error("Failed to create coupon");

      const savedCoupon = await res.json();
      dispatch({ type: "ADD_COUPON", coupon: savedCoupon });

      setShowForm(false);
      setForm({
        code: "",
        description: "",
        discount: "",
        type: "percentage",
        minOrder: "",
        maxUses: "",
        validUntil: "",
        active: true,
      });
      window.location.reload();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to save coupon to database");
    }
  }

  async function handleToggle(coupon) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const targetId = coupon._id || coupon.id;
      const res = await fetch(`/api/coupons/${targetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ active: !coupon.active }),
      });
      if (!res.ok) throw new Error("Failed to update coupon");
      const updatedCoupon = await res.json();
      dispatch({ type: "UPDATE_COUPON", coupon: updatedCoupon });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update coupon status");
    }
  }

  async function handleDelete(coupon) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const targetId = coupon._id || coupon.id;
      const res = await fetch(`/api/coupons/${targetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete coupon");
      dispatch({ type: "DELETE_COUPON", id: targetId });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete coupon");
    }
  }

  const usagePercent = (c) =>
    c.maxUses ? Math.min(100, (c.usedCount / c.maxUses) * 100) : 0;

  return (
    <div className="admin-page">
      <div className="flex-between flex-between-responsive mb-8">
        <div>
          <span className="overline">Discount Codes</span>
          <h1 className="heading-lg">Coupons</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Create Coupon
        </button>
      </div>

      {/* Add modal */}
      {showForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h2 className="heading-sm">Create New Coupon</h2>
              <button
                className="navbar-icon-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-4)",
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Coupon Code *</label>
                    <input
                      className={`form-input ${error ? "border-error" : ""}`}
                      required
                      placeholder="e.g. SAVE20 (No spaces)"
                      value={form.code}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      style={{
                        textTransform: "uppercase",
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.08em",
                      }}
                    />
                    {error && (
                      <p
                        style={{
                          color: "var(--error)",
                          fontSize: "11px",
                          marginTop: "4px",
                          fontWeight: 600,
                        }}
                      >
                        {error}
                      </p>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      className="form-input"
                      placeholder="e.g. 20% off on first order"
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "var(--space-4)",
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label">Type</label>
                      <select
                        className="form-input form-select"
                        value={form.type}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, type: e.target.value }))
                        }
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat (₹)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount Value</label>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        value={form.discount}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, discount: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "var(--space-4)",
                    }}
                  >
                    <div className="form-group">
                      <label className="form-label">Min. Order (₹)</label>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        placeholder="0 = no minimum"
                        value={form.minOrder}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, minOrder: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Uses</label>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        placeholder="Leave blank for unlimited"
                        value={form.maxUses}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, maxUses: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Valid Until</label>
                    <input
                      className="form-input"
                      type="date"
                      value={form.validUntil}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, validUntil: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setShowForm(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!!error}
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrap">
        <div className="data-table-header">
          <h2 className="heading-sm">All Coupons</h2>
          <span className="text-muted">
            {coupons.filter((c) => c.active).length} active
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Min. Order</th>
              <th>Usage</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      color: "var(--primary)",
                      letterSpacing: "0.06em",
                      fontSize: "var(--fs-14)",
                    }}
                  >
                    {c.code}
                  </span>
                </td>
                <td
                  style={{
                    fontSize: "var(--fs-14)",
                    color: "var(--text-medium)",
                  }}
                >
                  {c.description}
                </td>
                <td>
                  <span className="badge badge-secondary">
                    {c.type === "percentage"
                      ? `${c.discount}%`
                      : `₹${c.discount}`}
                  </span>
                </td>
                <td style={{ fontSize: "var(--fs-14)" }}>
                  {c.minOrder > 0 ? `₹${c.minOrder}` : "None"}
                </td>
                <td>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--fs-13)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {c.usedCount} used
                      </span>
                      {c.maxUses && (
                        <span
                          style={{
                            fontSize: "var(--fs-13)",
                            color: "var(--text-muted)",
                          }}
                        >
                          / {c.maxUses}
                        </span>
                      )}
                    </div>
                    {c.maxUses && (
                      <div
                        style={{
                          width: 100,
                          height: 4,
                          background: "var(--border-color)",
                          borderRadius: 99,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${usagePercent(c)}%`,
                            background:
                              usagePercent(c) >= 90
                                ? "var(--error)"
                                : "var(--success)",
                            borderRadius: 99,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </td>
                <td
                  style={{
                    fontSize: "var(--fs-13)",
                    color: "var(--text-muted)",
                  }}
                >
                  {c.validUntil ? formatDate(c.validUntil) : "—"}
                </td>
                <td>
                  <span
                    className={`badge ${c.active ? "badge-success" : "badge-neutral"}`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleToggle(c)}
                    >
                      {c.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleDelete(c)}
                      style={{
                        background: "var(--error-bg)",
                        color: "var(--error)",
                        border: "1.5px solid var(--error-bg)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
