"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, calcDiscountPercent } from "@/lib/utils";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import { StarIcon, SparkleIcon, RulerIcon } from "../common/Icons";
import { BUSINESS_INFO } from "@/lib/constants";
import { useSiteConfig } from "@/store/SiteConfigContext";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/CartContext";

// ── Service Card CTA Modal (inline, no separate file) ──────────────────────
function ServiceIdeaModal({ onClose, serviceTitle, product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    vision: "",
    picCount: 1,
    type: "Single Photo",
    images: [],
    size: "Medium",
    frameColor: "#5d2323",
  });
  const [previews, setPreviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    if (form.type === "Single Photo" && form.images.length + files.length > 1) {
      setError("Single Photo type only allows 1 image.");
      return;
    }

    if (form.images.length + files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }

    for (let file of files) {
      if (file.size > MAX_SIZE) {
        setError(`File ${file.name} is too large. Max 5MB.`);
        return;
      }
    }

    setError("");
    const newImages = [...form.images, ...files];
    setForm((f) => ({ ...f, images: newImages }));

    // Create previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((p) => [...p, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...form.images];
    newImages.splice(index, 1);
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setForm((f) => ({ ...f, images: newImages }));
    setPreviews(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.vision || form.images.length === 0) {
      setError("All fields including at least one image are required.");
      return;
    }

    const customization = {
      picCount: form.picCount,
      type: form.type,
      size: form.size,
      frameColor: form.frameColor,
      // Storing file names/metadata as actual File objects can't be stringified to localStorage
      imageCount: form.images.length,
      imageNames: form.images.map((f) => f.name),
    };

    addItem({ ...product, customization }, 1);
    setSubmitted(true);
    setTimeout(() => {
      router.push("/cart");
      onClose();
    }, 1500);
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${serviceTitle}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 600, width: "95%" }}>
        <div className="modal-header">
          <div>
            <h2 className="heading-sm">Customize {serviceTitle}</h2>
            <p
              className="text-muted"
              style={{ fontSize: "var(--fs-13)", marginTop: 2 }}
            >
              Tell us your vision — we&apos;ll craft it.
            </p>
          </div>
          <button
            className="navbar-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: "center", padding: "var(--space-6) 0" }}>
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <SparkleIcon size={32} style={{ color: "var(--secondary)" }} />
              </span>
              <h3 className="heading-sm mb-2">Requirement Saved!</h3>
              <p className="text-body-sm">
                Added to cart. Redirecting to checkout...
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              {error && (
                <div
                  style={{
                    padding: "var(--space-3)",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "var(--red-500)",
                    borderRadius: "var(--border-radius)",
                    fontSize: "var(--fs-13)",
                    fontWeight: 600,
                  }}
                >
                  {error}
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-4)",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    className="form-input"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Your name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    className="form-input"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="email@example.com"
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
                  <label className="form-label">
                    Number of Pictures (1-5) *
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="5"
                    required
                    disabled={form.type === "Single Photo"}
                    value={form.type === "Single Photo" ? 1 : form.picCount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        picCount: parseInt(e.target.value),
                      }))
                    }
                  />
                  {form.type === "Single Photo" && (
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                      Locked to 1 for Single Photo
                    </span>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-input"
                    value={form.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setForm((f) => ({
                        ...f,
                        type: newType,
                        picCount: newType === "Single Photo" ? 1 : f.picCount,
                        images:
                          newType === "Single Photo"
                            ? f.images.slice(0, 1)
                            : f.images,
                      }));
                      if (newType === "Single Photo" && previews.length > 1) {
                        setPreviews((p) => p.slice(0, 1));
                      }
                    }}
                  >
                    <option>Single Photo</option>
                    <option>Collage</option>
                  </select>
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
                  <label className="form-label">Frame Size *</label>
                  <select
                    className="form-input"
                    value={form.size}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, size: e.target.value }))
                    }
                  >
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Frame Color *</label>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <input
                      type="color"
                      className="form-input"
                      style={{ padding: 4, height: 42, width: 60 }}
                      value={form.frameColor}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, frameColor: e.target.value }))
                      }
                    />
                    <span
                      style={{
                        fontSize: "var(--fs-13)",
                        fontFamily: "monospace",
                      }}
                    >
                      {form.frameColor}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Upload Images (Max 5, 5MB each) *
                </label>
                <input
                  type="file"
                  multiple={form.type !== "Single Photo"}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-input"
                  style={{ padding: "8px" }}
                />
                {previews.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 8,
                      overflowX: "auto",
                      paddingBottom: 8,
                    }}
                  >
                    {previews.map((src, i) => (
                      <div
                        key={src}
                        style={{ position: "relative", flexShrink: 0 }}
                      >
                        <img
                          src={src}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid var(--border-light)",
                          }}
                          alt="preview"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{
                            position: "absolute",
                            top: -5,
                            right: -5,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "var(--red-500)",
                            color: "var(--surface-white)",
                            border: "none",
                            fontSize: 10,
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Additional Instructions *</label>
                <textarea
                  className="form-input form-textarea"
                  rows={2}
                  required
                  placeholder="Tell us more about your ideas..."
                  value={form.vision}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vision: e.target.value }))
                  }
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ marginTop: 8 }}
              >
                Add Customized Product to Cart →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ProductCard ───────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const {
    slug,
    title,
    category,
    images,
    price,
    salePrice,
    artisan,
    rating,
    reviews,
    stock,
    featured,
    material,
    size,
    type,
    ctaType,
    ctaLabel,
    description,
  } = product;

  const isService = type === "service";
  const discount = isService ? 0 : calcDiscountPercent(price, salePrice);
  // Find the first non-empty image URL; fall back to a placeholder
  const firstImage = images?.find((img) => img && img.trim() !== "") || null;

  const [showModal, setShowModal] = useState(false);
  const { config } = useSiteConfig();
  const whatsappNumber = config?.phone || BUSINESS_INFO.whatsapp;

  // ── SERVICE CARD ────────────────────────────────────────────────────────
  if (isService) {
    const waUrl = `https://wa.me/${whatsappNumber}?text=Hi%2C%20I%27m%20interested%20in%20${encodeURIComponent(title)}%20from%20Ishta%20Crafts.`;
    return (
      <>
        {showModal && (
          <ServiceIdeaModal
            onClose={() => setShowModal(false)}
            serviceTitle={title}
            product={product}
          />
        )}
        <article className="product-card" aria-label={title}>
          <div className="product-card-image-wrap">
            {firstImage && (
              <Image
                src={firstImage}
                alt={title}
                width={600}
                height={600}
                className="feature-product-image"
              />
            )}
            {/* Badge */}
            <div className="product-card-badge">
              <span className="badge badge-secondary">Custom Order</span>
            </div>
          </div>

          <div className="product-card-body">
            <p className="product-card-category">Custom Creations</p>
            <h3
              className="product-card-title"
              style={{ color: "var(--text-dark)" }}
            >
              {title}
            </h3>
            {artisan && (
              <p
                className="product-card-meta"
                style={{ marginBottom: "var(--space-2)" }}
              >
                by{" "}
                <span className="text-dark" style={{ fontWeight: 500 }}>
                  {artisan}
                </span>
              </p>
            )}
            <div className="product-card-metadata-row" style={{ height: 100 }}>
              {/* Material badge */}
              {material && (
                <div style={{ marginTop: "var(--space-1)" }}>
                  <span
                    className="badge"
                    style={{
                      background:
                        material === "Brass"
                          ? "rgba(200,164,58,0.15)"
                          : material === "Bronze"
                            ? "rgba(160,82,45,0.15)"
                            : "rgba(143,163,177,0.18)",
                      color:
                        material === "Brass"
                          ? "#8a6a00"
                          : material === "Bronze"
                            ? "#7a3415"
                            : "#4a6070",
                      border: "1px solid currentColor",
                      fontSize: "var(--fs-11)",
                      fontWeight: 600,
                    }}
                  >
                    {`Metal: ${material} & more`}
                  </span>
                </div>
              )}

              <p
                className="product-card-description-fixed"
                style={{ marginTop: 4 }}
              >
                {description}
              </p>
            </div>

            {/* Price row — replaced with "Get Quote" */}
            <div className="product-card-price-row">
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--primary)",
                  fontSize: "var(--fs-15)",
                }}
              >
                Price on Request
              </span>
            </div>
          </div>

          <div className="product-card-footer">
            {ctaType === "whatsapp" ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{
                  width: "100%",
                  background: "var(--whatsapp)",
                  color: "var(--surface-white)",
                  border: "none",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {ctaLabel || "Get Quote on WhatsApp"}
              </a>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary btn-sm"
                style={{ width: "100%" }}
              >
                {ctaLabel || "Share Your Idea"} →
              </button>
            )}
          </div>
        </article>
      </>
    );
  }

  // ── STANDARD PRODUCT CARD ────────────────────────────────────────────────
  return (
    <article className="product-card" aria-label={title}>
      <div
        className={`product-card-image-wrap ${stock === 0 ? "product-card-image-wrap--out-of-stock" : ""}`}
      >
        <Link
          href={`/product/${slug}`}
          aria-label={`View ${title}`}
          tabIndex={-1}
        >
          {firstImage && (
            <Image
              src={firstImage}
              alt={title}
              width={600}
              height={600}
              className="feature-product-image"
            />
          )}
        </Link>
        {/* Floating actions */}
        <div className="product-card-actions">
          <WishlistButton product={product} />
        </div>

        {/* Badges */}
        <div className="product-card-badge">
          {discount > 0 && (
            <span className="badge badge-error" aria-label={`${discount}% off`}>
              -{discount}%
            </span>
          )}

          {stock < 10 && stock > 0 && (
            <span
              className="badge badge-warning"
              style={{ marginTop: 4, display: "block" }}
            >
              Low Stock
            </span>
          )}
          {stock === 0 && (
            <span className="badge badge-error" aria-label="Out of stock">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="product-card-body">
        <p className="product-card-category">
          {category?.replace(/-/g, " ") || "Handicrafts"}
        </p>
        <h3 className="product-card-title">
          <Link
            href={`/product/${slug}`}
            className="product-card-title"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {title}
          </Link>
        </h3>
        <div className="product-card-metadata-row">
          {artisan && <p className="product-card-artisan">by {artisan}</p>}

          {/* Material + Size micro-badges */}
          {(material || size) && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginTop: "var(--space-1)",
              }}
            >
              {material && (
                <span
                  className="badge"
                  style={{
                    background:
                      material === "Brass"
                        ? "rgba(200,164,58,0.15)"
                        : material === "Bronze"
                          ? "rgba(160,82,45,0.15)"
                          : "rgba(143,163,177,0.18)",
                    color:
                      material === "Brass"
                        ? "#8a6a00"
                        : material === "Bronze"
                          ? "#7a3415"
                          : "#4a6070",
                    border: "1px solid currentColor",
                    fontSize: "var(--fs-11)",
                    fontWeight: 600,
                  }}
                >
                  {material}
                </span>
              )}
              {size && (
                <span
                  className="badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(93,35,35,0.07)",
                    color: "var(--text-medium)",
                    border: "1px solid var(--border-light)",
                    fontSize: "var(--fs-11)",
                  }}
                >
                  <RulerIcon size={12} /> {size}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="product-card-price-row">
          <span className="price">{formatPrice(salePrice || price)}</span>
          {salePrice && (
            <span className="price-sale">{formatPrice(price)}</span>
          )}
          {discount > 0 && (
            <span className="price-discount">{discount}% off</span>
          )}
        </div>
      </div>

      <div className="product-card-footer">
        <div className="flex-between">
          <div
            className="product-card-rating"
            aria-label={`Rating: ${rating} out of 5`}
          >
            <span className="stars" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  size={12}
                  className={
                    i < Math.floor(rating || 0) ? "star-filled" : "star-empty"
                  }
                />
              ))}
            </span>
            <div>
              <span
                style={{
                  fontSize: "var(--fs-13)",
                  color: "var(--text-medium)",
                  fontWeight: 500,
                }}
              >
                {rating}
              </span>
              <span
                style={{ fontSize: "var(--fs-13)", color: "var(--text-muted)" }}
              >
                ({reviews})
              </span>
            </div>
          </div>
          <AddToCartButton product={product} disabled={stock === 0} />
        </div>
      </div>
    </article>
  );
}
