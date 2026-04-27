"use client";

import { useState, useEffect } from "react";
import {
  Save,
  Megaphone,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Type,
  Link as LinkIcon,
  Palette,
  Eye,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Info,
} from "lucide-react";
import { useAuth } from "@/store/AuthContext";

export default function AdminSalePage() {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) return; // Wait until user is authenticated

    user
      .getIdToken()
      .then((idToken) => {
        return fetch("/api/sale-banner?all=true", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
      })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        } else if (data && !Array.isArray(data) && data.message !== undefined) {
          // Old single-banner format — migrate it
          setBanners([{ ...data, id: `sb-migrated-1` }]);
        } else {
          setBanners([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
        id: `sb-${Date.now()}`,
        enabled: true,
        message: "New Sale Banner — Edit me!",
        ctaText: "Shop Now",
        ctaLink: "/shop",
        bgColor: "#7A1F1F",
        textColor: "#FFFFFF",
        iconUrl: "",
        dismissible: true,
        expiresAt: "",
      },
    ]);
  };

  const deleteBanner = (index) => {
    if (window.confirm("Delete this banner?")) {
      setBanners(banners.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      showToast("Uploading image...", "info");
      const idToken = await user.getIdToken();
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        callback(data.url);
        showToast("Image uploaded!", "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch {
      showToast("Upload error", "error");
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!user) {
      showToast("You must be logged in.", "error");
      return;
    }
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/sale-banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(banners),
      });
      if (res.ok) {
        showToast("Banners saved successfully!", "success");
      } else {
        showToast("Failed to save.", "error");
      }
    } catch {
      showToast("An error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const hexOnBlur = (value, setter, fallback) => {
    let v = value.trim();
    if (/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(v)) v = "#" + v;
    if (/^#[0-9A-Fa-f]{3}$/.test(v))
      v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    if (/^#[0-9A-Fa-f]{6}$/.test(v)) setter(v.toUpperCase());
    else if (v === "") setter(fallback);
    else setter(v);
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="flex-between flex-between-responsive mb-8">
        <div className="admin-header-main">
          <div className="admin-header-icon">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="admin-title">Sale Banner Control</h1>
            <p className="admin-subtitle">
              Manage the promotional ticker shown at the top of the storefront.
              Supports multiple banners that auto-slide.
            </p>
          </div>
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
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 160,
            }}
          >
            <Save size={18} /> {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Banner cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
        }}
      >
        {banners.map((banner, idx) => (
          <section key={banner._id || banner.id || idx} className="admin-card">
            {/* Card header */}
            <div className="flex-between mb-6">
              <h2
                className="heading-sm"
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <Megaphone size={18} />
                <span>Banner #{idx + 1}</span>
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-4)",
                }}
              >
                <button
                  type="button"
                  className={`sale-admin-toggle sale-admin-toggle--sm ${banner.enabled ? "on" : "off"}`}
                  onClick={() => updateBanner(idx, "enabled", !banner.enabled)}
                >
                  {banner.enabled ? (
                    <ToggleRight size={20} />
                  ) : (
                    <ToggleLeft size={20} />
                  )}
                  {banner.enabled ? "Active" : "Inactive"}
                </button>
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
              {/* Left: message + CTA */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="sale-admin-field-label">
                    <Type size={14} className="inline mr-2" /> Banner Message
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    maxLength={300}
                    placeholder="e.g. 🎉 Grand Diwali Sale — Up to 50% Off!"
                    value={banner.message || ""}
                    onChange={(e) =>
                      updateBanner(idx, "message", e.target.value)
                    }
                  />
                  <p className="sale-admin-char-count">
                    {(banner.message || "").length}/300
                  </p>
                </div>

                <div className="sale-admin-grid-2">
                  <div className="form-group">
                    <label className="sale-admin-field-label">
                      <LinkIcon size={14} className="inline mr-2" /> CTA Text
                    </label>
                    <input
                      className="form-input"
                      placeholder="e.g. Shop Now"
                      value={banner.ctaText || ""}
                      onChange={(e) =>
                        updateBanner(idx, "ctaText", e.target.value)
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="sale-admin-field-label">
                      CTA Link URL
                    </label>
                    <input
                      className="form-input"
                      placeholder="e.g. /shop"
                      value={banner.ctaLink || ""}
                      onChange={(e) =>
                        updateBanner(idx, "ctaLink", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Right: colours + expiry + dismissible */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="sale-admin-field-label">
                    <Calendar size={14} className="inline mr-2" /> Expiry Date
                    (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={
                      banner.expiresAt
                        ? new Date(banner.expiresAt).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      updateBanner(idx, "expiresAt", e.target.value || null)
                    }
                  />
                  <p className="sale-admin-field-hint mt-1">
                    Banner will auto-hide after this date
                  </p>
                </div>

                <div className="sale-admin-grid-2">
                  {/* Background color */}
                  <div className="form-group">
                    <label className="sale-admin-field-label">
                      <Palette size={14} className="inline mr-2" /> Background
                    </label>
                    <div className="sale-admin-color-row">
                      <input
                        type="color"
                        className="sale-admin-color-picker"
                        value={banner.bgColor || "#7A1F1F"}
                        onChange={(e) =>
                          updateBanner(idx, "bgColor", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="sale-admin-color-hex"
                        maxLength={7}
                        spellCheck={false}
                        value={banner.bgColor || "#7A1F1F"}
                        onChange={(e) =>
                          updateBanner(idx, "bgColor", e.target.value)
                        }
                        onBlur={(e) =>
                          hexOnBlur(
                            e.target.value,
                            (v) => updateBanner(idx, "bgColor", v),
                            "#7A1F1F",
                          )
                        }
                      />
                    </div>
                  </div>
                  {/* Text color */}
                  <div className="form-group">
                    <label className="sale-admin-field-label">Text Color</label>
                    <div className="sale-admin-color-row">
                      <input
                        type="color"
                        className="sale-admin-color-picker"
                        value={banner.textColor || "#FFFFFF"}
                        onChange={(e) =>
                          updateBanner(idx, "textColor", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        className="sale-admin-color-hex"
                        maxLength={7}
                        spellCheck={false}
                        value={banner.textColor || "#FFFFFF"}
                        onChange={(e) =>
                          updateBanner(idx, "textColor", e.target.value)
                        }
                        onBlur={(e) =>
                          hexOnBlur(
                            e.target.value,
                            (v) => updateBanner(idx, "textColor", v),
                            "#FFFFFF",
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Live preview */}
                <div className="form-group">
                  <label className="sale-admin-field-label">
                    <Eye size={14} className="inline mr-2" /> Live Preview
                  </label>
                  <div
                    className="sale-banner sale-banner--preview"
                    style={{
                      "--banner-bg": banner.bgColor || "#7A1F1F",
                      "--banner-text": banner.textColor || "#FFFFFF",
                      borderRadius: 6,
                    }}
                  >
                    <div className="sale-banner-inner">
                      {banner.iconUrl && (
                        <img
                          src={banner.iconUrl}
                          alt=""
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: 3,
                            objectFit: "cover",
                            marginRight: 8,
                            border: "1px solid rgba(255,255,255,0.3)",
                          }}
                        />
                      )}
                      <p className="sale-banner-message">
                        {banner.message || "Your message will appear here..."}
                      </p>
                      {banner.ctaText && (
                        <span className="sale-banner-cta">
                          {banner.ctaText} →
                        </span>
                      )}
                    </div>
                  </div>
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
            <Megaphone
              size={48}
              style={{
                color: "var(--text-muted)",
                marginBottom: "var(--space-4)",
              }}
            />
            <p className="text-body-lg" style={{ color: "var(--text-muted)" }}>
              No sale banners yet. Add your first one!
            </p>
            <button className="btn btn-primary mt-6" onClick={addBanner}>
              <Plus size={18} /> Add Banner
            </button>
          </div>
        )}
      </div>

      {toast && (
        <div className={`sale-admin-toast ${toast.type}`}>
          <Info size={18} className="inline mr-2" />
          {toast.msg}
        </div>
      )}
    </div>
  );
}
