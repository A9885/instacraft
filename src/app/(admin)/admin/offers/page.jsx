"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useAdmin } from "@/store/AdminContext";
import { useAuth } from "@/store/AuthContext";
import { formatDate } from "@/lib/utils";
import { X } from "lucide-react";

export default function AdminOffersPage() {
  const { offers, dispatch } = useAdmin();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discount: "",
    type: "percentage",
    category: "",
    validUntil: "",
    active: true,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    const idToken = await user.getIdToken();
    const newOffer = {
      ...form,
      id: `off-${Date.now()}`,
      discount: Number(form.discount),
      bgColor: "#7A1F1F",
      textColor: "#FFF8F0",
      image: "/images/offer-e9f38099.webp",
      featured: false,
    };

    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(newOffer),
      });

      if (!res.ok) throw new Error("Failed to create offer");

      const savedOffer = await res.json();
      dispatch({ type: "ADD_OFFER", offer: savedOffer });

      setShowForm(false);
      setForm({
        title: "",
        description: "",
        discount: "",
        type: "percentage",
        category: "",
        validUntil: "",
        active: true,
      });
      window.location.reload();
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to save offer to database");
    }
  }

  async function handleToggle(offer) {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const targetId = offer._id || offer.id;
      const res = await fetch(`/api/offers/${targetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ active: !offer.active }),
      });
      if (!res.ok) throw new Error("Failed to update offer");
      const updatedOffer = await res.json();
      dispatch({ type: "UPDATE_OFFER", offer: updatedOffer });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update offer status");
    }
  }

  async function handleDelete(offer) {
    if (!confirm("Are you sure you want to delete this offer?")) return;
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const targetId = offer._id || offer.id;
      const res = await fetch(`/api/offers/${targetId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("Failed to delete offer");

      dispatch({ type: "DELETE_OFFER", id: targetId });
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete offer");
    }
  }

  return (
    <div className="admin-page">
      <div className="flex-between flex-between-responsive mb-8">
        <div>
          <span className="overline">Promotions</span>
          <h1 className="heading-lg">Offers</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Offer
        </button>
      </div>

      {/* Add modal */}
      {showForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <h2 className="heading-sm">Create New Offer</h2>
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
                    <label className="form-label">Offer Title *</label>
                    <input
                      className="form-input"
                      required
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      className="form-input"
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
                      <label className="form-label">Discount Type</label>
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
                      <label className="form-label">Category</label>
                      <select
                        className="form-input form-select"
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                      >
                        <option value="">All Categories</option>
                        <option value="wall-hangings">Wall Hangings</option>
                        <option value="table-top-mount">Table Top Mount</option>
                        <option value="wall-table-combo">
                          Wall &amp; Table Combo
                        </option>
                        <option value="gift-items">Gift Items</option>
                      </select>
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
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrap">
        <div className="data-table-header">
          <h2 className="heading-sm">All Offers</h2>
          <span className="text-muted">
            {offers.filter((o) => o.active).length} active
          </span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Offer</th>
              <th>Discount</th>
              <th>Category</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>
                  <div>
                    <p style={{ fontWeight: 600 }}>{offer.title}</p>
                    <p
                      style={{
                        fontSize: "var(--fs-13)",
                        color: "var(--text-muted)",
                      }}
                    >
                      {offer.description}
                    </p>
                  </div>
                </td>
                <td>
                  <span className="badge badge-secondary">
                    {offer.type === "percentage"
                      ? `${offer.discount}%`
                      : `₹${offer.discount}`}
                  </span>
                  ``{" "}
                </td>
                <td
                  style={{
                    color: "var(--text-medium)",
                    textTransform: "capitalize",
                  }}
                >
                  {offer.category ? offer.category.replace(/-/g, " ") : "All"}
                </td>
                <td
                  style={{
                    fontSize: "var(--fs-13)",
                    color: "var(--text-muted)",
                  }}
                >
                  {offer.validUntil ? formatDate(offer.validUntil) : "—"}
                </td>
                <td>
                  <span
                    className={`badge ${offer.active ? "badge-success" : "badge-neutral"}`}
                  >
                    {offer.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleToggle(offer)}
                    >
                      {offer.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleDelete(offer)}
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
