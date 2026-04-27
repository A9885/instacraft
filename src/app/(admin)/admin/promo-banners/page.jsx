"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Tag,
  Type,
  AlignLeft,
  Eye,
  EyeOff,
} from "lucide-react";

const BADGE_TYPES = [
  { value: "sale", label: "🔴 Sale" },
  { value: "launch", label: "🔵 New Launch" },
  { value: "upcoming", label: "🟡 Coming Soon" },
  { value: "new", label: "🟢 New" },
  { value: "hot", label: "🟠 Hot Deal" },
  { value: "limited", label: "🟣 Limited Offer" },
];

export default function PromoBannersAdminPage() {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (!user) return;
    const fetchBanners = async () => {
      const idToken = await user.getIdToken();
      fetch("/api/promo-banners?all=true", {
        headers: { Authorization: `Bearer ${idToken}` },
      })
        .then((r) => r.json())
        .then((data) => setBanners(Array.isArray(data) ? data : []))
        .catch(console.error);
    };
    fetchBanners();
  }, [user]);

  const updateBanner = (index, field, value) => {
    const next = [...banners];
    next[index] = { ...next[index], [field]: value };
    setBanners(next);
  };

  const addBanner = () => {
    setBanners([
      ...banners,
      {
        id: `pb-${Date.now()}`,
        title: "New Promo Banner",
        subtitle: "",
        description: "",
        badge: "New",
        badgeType: "new",
        image: "",
        ctaText: "Shop Now",
        ctaLink: "/shop",
        active: true,
      },
    ]);
  };

  const deleteBanner = (index) => {
    if (window.confirm("Delete this promo banner?")) {
      setBanners(banners.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setStatus({ type: "info", message: "Uploading image..." });
      const idToken = await user.getIdToken();
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        callback(data.url);
        setStatus({ type: "success", message: "Image uploaded!" });
        setTimeout(() => setStatus({ type: "", message: "" }), 2000);
      } else {
        setStatus({ type: "error", message: data.error || "Upload failed" });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Upload error" });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/promo-banners", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(banners),
      });
      if (res.ok) {
        setStatus({
          type: "success",
          message: "Promo banners saved successfully!",
        });
        setTimeout(() => setStatus({ type: "", message: "" }), 2000);
      } else {
        setStatus({ type: "error", message: "Failed to save." });
      }
    } catch (err) {
      setStatus({ type: "error", message: "Network error." });
    }
  };

  if (!hasMounted) return <div className="admin-page" style={{ opacity: 0 }} />;

  return (
    <div className="admin-page">
      <div className="flex-between flex-between-responsive mb-8">
        <div>
          <span className="overline">Store Interface</span>
          <h1 className="heading-lg">
            <span>Promo Banner Strip</span>
          </h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            Manage the 4 promotional cards shown below the hero slider.
          </p>
        </div>
        <div className="flex-responsive">
          <button
            className="btn btn-outline"
            onClick={addBanner}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={18} /> Add Banner
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Save size={18} /> Save All
          </button>
        </div>
      </div>

      {status.message && (
        <div
          className={`badge ${status.type === "success" ? "badge-success" : status.type === "error" ? "badge-error" : "badge-secondary"}`}
          style={{
            width: "100%",
            padding: "var(--space-3)",
            marginBottom: "var(--space-6)",
            justifyContent: "center",
            fontSize: "var(--fs-14)",
          }}
        >
          {status.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {banners.map((banner, idx) => (
          <section key={banner._id || banner.id || idx} className="admin-card">
            <div className="flex-between mb-6">
              <h2
                className="heading-sm"
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <ImageIcon size={20} />
                <span>Banner #{idx + 1}</span>
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                    fontSize: "var(--fs-13)",
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={banner.active !== false}
                    onChange={(e) =>
                      updateBanner(idx, "active", e.target.checked)
                    }
                  />
                  Active
                </label>
                <button
                  type="button"
                  onClick={() => deleteBanner(idx)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--error)" }}
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: "var(--space-8)" }}>
              {/* Left: Text */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">
                    <Tag size={14} /> Badge Label
                  </label>
                  <input
                    className="form-input"
                    value={banner.badge || ""}
                    onChange={(e) => updateBanner(idx, "badge", e.target.value)}
                    placeholder="e.g. Sale Live Now"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Tag size={14} /> Badge Type (Color)
                  </label>
                  <select
                    className="form-input"
                    value={banner.badgeType || "new"}
                    onChange={(e) =>
                      updateBanner(idx, "badgeType", e.target.value)
                    }
                  >
                    {BADGE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <Type size={14} /> Subtitle
                  </label>
                  <input
                    className="form-input"
                    value={banner.subtitle || ""}
                    onChange={(e) =>
                      updateBanner(idx, "subtitle", e.target.value)
                    }
                    placeholder="e.g. New Arrival"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <AlignLeft size={14} /> Title
                  </label>
                  <input
                    className="form-input"
                    value={banner.title || ""}
                    onChange={(e) => updateBanner(idx, "title", e.target.value)}
                    placeholder="e.g. Diwali Sale — Upto 50% Off"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={2}
                    value={banner.description || ""}
                    onChange={(e) =>
                      updateBanner(idx, "description", e.target.value)
                    }
                    placeholder="Short supporting text..."
                  />
                </div>
              </div>

              {/* Right: Image & Link */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">
                    <ImageIcon size={14} /> Banner Image
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 120,
                        height: 80,
                        borderRadius: 8,
                        background: "var(--surface-sunken)",
                        border: "1px solid var(--border-color)",
                        overflow: "hidden",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span
                          style={{ fontSize: 10, color: "var(--text-muted)" }}
                        >
                          No Image
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        className="form-input form-input-sm mb-2"
                        value={banner.image || ""}
                        onChange={(e) =>
                          updateBanner(idx, "image", e.target.value)
                        }
                        placeholder="Image URL"
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() =>
                          document.getElementById(`pb-img-${idx}`).click()
                        }
                      >
                        <Upload size={14} /> Upload
                      </button>
                      <input
                        id={`pb-img-${idx}`}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            updateBanner(idx, "image", url),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <LinkIcon size={14} /> CTA Button Text
                  </label>
                  <input
                    className="form-input"
                    value={banner.ctaText || ""}
                    onChange={(e) =>
                      updateBanner(idx, "ctaText", e.target.value)
                    }
                    placeholder="e.g. Shop Now"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <LinkIcon size={14} /> CTA Link
                  </label>
                  <input
                    className="form-input"
                    value={banner.ctaLink || ""}
                    onChange={(e) =>
                      updateBanner(idx, "ctaLink", e.target.value)
                    }
                    placeholder="e.g. /deals or /shop/pottery"
                  />
                </div>
              </div>
            </div>
          </section>
        ))}

        {banners.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "var(--space-12)",
              background: "var(--surface-sunken)",
              borderRadius: "var(--radius-lg)",
              border: "2px dashed var(--border-color)",
            }}
          >
            <ImageIcon
              size={48}
              style={{
                color: "var(--text-muted)",
                marginBottom: "var(--space-4)",
              }}
            />
            <p className="text-body-lg" style={{ color: "var(--text-muted)" }}>
              No promo banners yet. Add your first one!
            </p>
            <button className="btn btn-primary mt-6" onClick={addBanner}>
              <Plus size={18} /> Add Banner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
