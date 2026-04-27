"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CUSTOM_SERVICES, BUSINESS_INFO } from "@/lib/constants";
import { useSiteConfig } from "@/store/SiteConfigContext";
import { useCart } from "@/store/CartContext";
import { SparkleIcon } from "@/components/common/Icons";

// ── GALLERY IMAGES ────────────────────────────
const GALLERY_IMAGES = [
  { src: "/images/pexels-photo-31452296.webp", alt: "Custom photo frame in brass finish" },
  { src: "/images/pexels-photo-33619692.webp", alt: "Handcrafted decorative frame" },
  { src: "/images/pexels-photo-31477845.webp", alt: "Metal art wall piece" },
  { src: "/images/pexels-photo-12896785.webp", alt: "Bespoke frame close-up" },
  { src: "/images/pexels-photo-30921929.webp", alt: "Custom creation craftsmanship" },
  { src: "/images/pexels-photo-21383559.webp", alt: "Handmade metal frame detail" },
  { src: "/images/pexels-photo-33810565.webp", alt: "Artisan photo frame work" },
  { src: "/images/pexels-photo-14913872.webp", alt: "Finished custom order" },
  { src: "/images/pexels-photo-20895320.webp", alt: "Premium handicraft creation" },
];

// ── LIGHTBOX COMPONENT ────────────────────────────────────────────────────────
function Lightbox({ images, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, currentIndex]);

  const showNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const showPrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const image = images[currentIndex];

  if (!image) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 5, 15, 0.95)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-6)",
        cursor: "zoom-out",
        animation: "fadeIn 0.3s ease",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 32,
          right: 32,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          width: 48,
          height: 48,
          cursor: "pointer",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          transition: "all 0.3s ease",
          zIndex: 10000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.2)";
          e.currentTarget.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        ✕
      </button>

      {images.length > 1 && (
        <button
          onClick={showPrev}
          aria-label="Previous"
          style={{
            position: "absolute",
            left: 32,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: 48,
            height: 48,
            cursor: "pointer",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            zIndex: 10000,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
      )}

      {images.length > 1 && (
        <button
          onClick={showNext}
          aria-label="Next"
          style={{
            position: "absolute",
            right: 32,
            top: "50%",
            transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: 48,
            height: 48,
            cursor: "pointer",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
            zIndex: 10000,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.2)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.transform = "translateY(-50%) scale(1)";
          }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90vw",
          maxHeight: "90vh",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "scaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
        key={currentIndex} /* Force re-render on change to re-trigger animation */
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={1200}
          height={800}
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.98); opacity: 0.8; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ── DETAILED FORM MODAL COMPONENT ────────────────────────────────────────────────
function CustomCreationFormModal({ onClose, service = {} }) {
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
    if (!form.name || !form.email || !form.vision) {
      setError("All fields (Name, Email, and Instructions) are required.");
      return;
    }

    const count =
      form.type === "Single Photo" ? 1 : parseInt(form.picCount) || 0;
    if (!count || count < 1) {
      setError("Please specify a valid number of pictures (1-5).");
      return;
    }
    if (form.images.length !== count) {
      setError(
        `Please upload exactly ${count} image${count > 1 ? "s" : ""} as specified in "Number of Pictures".`,
      );
      return;
    }

    // Creating a mock product object to add to cart
    const customProduct = {
      id: `custom-${Date.now()}`,
      slug: `${service?.id || "creation"}`,
      title: service?.title || "Custom Creation",
      price: 1,
      salePrice: 0,
      images:
        previews.length > 0
          ? [previews[0]]
          : ["/images/pexels-photo-31452296.webp"],
      category: "custom-creations",
      type: "service",
      customization: {
        picCount: count,
        type: form.type,
        size: form.size,
        frameColor: form.frameColor,
        imageCount: form.images.length,
        imageNames: form.images.map((f) => f.name),
        description: form.vision,
        contact: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
      },
    };

    addItem(customProduct, 1);
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
      aria-label={`Customize ${service?.title}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ zIndex: 99999 }}
    >
      <div className="modal" style={{ maxWidth: 640, width: "95%", borderRadius: 24, padding: "var(--space-6)" }}>
        <div className="modal-header">
          <div>
            <h2 className="heading-sm" style={{ fontSize: "var(--fs-24)" }}>Bring Your Idea to Life</h2>
            <p
              className="text-muted"
              style={{ fontSize: "var(--fs-14)", marginTop: 8 }}
            >
              Share your details and vision. We'll handle the craftsmanship.
            </p>
          </div>
          <button
            className="navbar-icon-btn"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "var(--surface-sunken)", borderRadius: "50%" }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="modal-body" style={{ marginTop: "var(--space-4)" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "var(--space-8) 0" }}>
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <SparkleIcon size={56} style={{ color: "var(--primary)" }} />
              </span>
              <h3 className="heading-sm mb-3">Request Received!</h3>
              <p className="text-body">
                Added to your cart. Redirecting to checkout...
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
                    borderRadius: "12px",
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
                    style={{ borderRadius: 12 }}
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
                    placeholder="hello@example.com"
                    style={{ borderRadius: 12 }}
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
                    Images Required (1-5) *
                  </label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="5"
                    required
                    disabled={form.type === "Single Photo"}
                    value={
                      form.type === "Single Photo" ? 1 : (form.picCount ?? "")
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      setForm((f) => ({
                        ...f,
                        picCount: val === "" ? "" : parseInt(val),
                      }));
                    }}
                    style={{ borderRadius: 12 }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Composition *</label>
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
                    style={{ borderRadius: 12 }}
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
                    style={{ borderRadius: 12 }}
                  >
                    <option>Small (8x10")</option>
                    <option>Medium (16x20")</option>
                    <option>Large (24x36")</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Accent Color *</label>
                  <div
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    <input
                      type="color"
                      className="form-input"
                      style={{ padding: 0, height: 42, width: 60, borderRadius: 12, border: 'none', overflow: 'hidden' }}
                      value={form.frameColor}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, frameColor: e.target.value }))
                      }
                    />
                    <span
                      style={{
                        fontSize: "var(--fs-13)",
                        fontFamily: "monospace",
                        color: "var(--text-muted)",
                        background: "var(--surface-sunken)",
                        padding: "4px 8px",
                        borderRadius: 6
                      }}
                    >
                      {form.frameColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reference Images (Max 5, 5MB each) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    multiple={form.type !== "Single Photo"}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="form-input"
                    style={{ padding: "12px", borderRadius: 12, border: '1px dashed var(--border)', background: 'var(--surface-sunken)' }}
                  />
                </div>
                {previews.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 12,
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
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 12,
                            border: "2px solid var(--border-light)",
                          }}
                          alt="preview"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "var(--red-500)",
                            color: "var(--surface-white)",
                            border: "none",
                            fontSize: 14,
                            cursor: "pointer",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
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
                <label className="form-label">Design Vision *</label>
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  required
                  placeholder="Describe the mood, specific details, or any special requests..."
                  value={form.vision}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vision: e.target.value }))
                  }
                  style={{ borderRadius: 12, resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                className="btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  marginTop: 16,
                  background: "var(--primary)",
                  color: "white",
                  padding: "16px 32px",
                  borderRadius: 999,
                  fontSize: "var(--fs-16)",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Add Custom Order to Cart
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function CustomCreationsClient() {
  const [showModal, setShowModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const { config } = useSiteConfig();
  const [isMounted, setIsMounted] = useState(false);
  const [galleryImages, setGalleryImages] = useState(GALLERY_IMAGES);
  const [heroImage, setHeroImage] = useState("/images/pexels-photo-31452296.webp");

  useEffect(() => {
    setIsMounted(true);
    window.scrollTo(0, 0);
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        if (data.siteContent?.customCreations?.length > 0) {
          setGalleryImages(data.siteContent.customCreations);
        }
        if (data.siteContent?.customCreationsHero) {
          setHeroImage(data.siteContent.customCreationsHero);
        }
      })
      .catch(console.error);
  }, []);

  const validGalleryImages = galleryImages.map(img => ({
    ...img,
    src: img.src || `https://placehold.co/${img.width || 600}x${img.height || 800}/1c0926/ffffff?text=Image+Pending`
  }));

  const whatsappNumber = config?.phone || BUSINESS_INFO.whatsapp;
  const whatsappQuoteUrl = `https://wa.me/${whatsappNumber}?text=Hi%2C%20I%20am%20interested%20in%20a%20custom%20photo%20frame%20from%20Ishta%20Crafts.`;
  const contactEmail = config?.email || BUSINESS_INFO.email;
  const contactAddress = config?.address || BUSINESS_INFO.address;

  const service = CUSTOM_SERVICES[0];

  const scrollToHowItWorks = () => {
    const el = document.getElementById("how-it-works");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <style>{`
        /* ── CUSTOM HERO DESIGN ── */
        .premium-hero {
          position: relative;
          min-height: 90vh;
          background: linear-gradient(145deg, #381a44 0%, #2a1136 50%, #1c0926 100%);
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: calc(var(--header-height, 80px) + 40px) 0 80px;
        }

        .premium-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 70% 30%, rgba(138, 43, 226, 0.15) 0%, transparent 60%),
                            radial-gradient(circle at 20% 80%, rgba(255, 105, 180, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }
        
        .hero-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83v58.34h-58.34l-.83-.83L0 54.628v-58.34h58.34l.83.83-4.543 4.543z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E");
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .hero-content {
          color: #ffffff;
          padding-right: 40px;
        }
        
        .hero-title {
          font-family: var(--font-heading);
          font-size: clamp(3rem, 5vw, 4.5rem);
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          color: #fdfdfd;
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .hero-desc {
          font-size: 1.125rem;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 40px;
          max-width: 540px;
          opacity: 0;
          transform: translateY(20px);
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
        }

        .hero-cta-group {
          display: flex;
          align-items: center;
          gap: 24px;
          opacity: 0;
          transform: translateY(20px);
          animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards;
        }

        .btn-custom-primary {
          background: #ffffff;
          color: #2a1136;
          padding: 16px 36px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 1.05rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }

        .btn-custom-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
          background: #f0f0f0;
        }

        .btn-custom-link {
          color: rgba(255, 255, 255, 0.9);
          background: transparent;
          border: none;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          padding: 8px 0;
          transition: color 0.3s ease;
        }
        
        .btn-custom-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.4);
          transition: background 0.3s ease;
        }

        .btn-custom-link:hover {
          color: #ffffff;
        }
        
        .btn-custom-link:hover::after {
          background: #ffffff;
        }

        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 1000px;
        }

        .floating-product {
          position: relative;
          width: 100%;
          max-width: 500px;
          aspect-ratio: 1;
          animation: float 6s ease-in-out infinite;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .floating-product:hover {
          animation-play-state: paused;
          transform: scale(1.05) rotateY(-5deg) rotateX(5deg);
        }

        .floating-product-img {
          border-radius: 24px;
          box-shadow: 20px 30px 60px rgba(0, 0, 0, 0.4), 
                      inset 0 0 0 1px rgba(255, 255, 255, 0.1);
          object-fit: cover;
        }

        /* ── ANIMATIONS ── */
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .hero-content {
            padding-right: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-cta-group {
            justify-content: center;
          }
          .floating-product {
            max-width: 400px;
          }
        }
        
        /* ── GALLERY SECTION ── */
        .premium-gallery {
          background: var(--background);
          padding: 60px 0;
          color: var(--text);
        }
        
        .gallery-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .gallery-title {
          font-family: var(--font-heading);
          font-size: clamp(2rem, 4vw, 3rem);
          margin-bottom: 16px;
        }
        
        .masonry-grid {
          column-count: 4;
          column-gap: 20px;
        }
        
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 20px;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transform: translateZ(0); /* Force hardware acceleration */
        }
        
        .masonry-item img {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.7s cubic-bezier(0.2, 1, 0.3, 1), filter 0.5s ease;
          filter: brightness(0.9);
        }
        
        .masonry-item:hover img {
          transform: scale(1.08);
          filter: brightness(1.05);
        }
        
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.4);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .masonry-item:hover .gallery-overlay {
          opacity: 1;
        }
        
        .gallery-icon {
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(4px);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transform: scale(0.8);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.2, 1, 0.3, 1);
        }
        
        .masonry-item:hover .gallery-icon {
          transform: scale(1);
          opacity: 1;
        }
        
        .premium-cta {
          position: relative;
          padding: 60px 0;
          background: linear-gradient(145deg, #381a44 0%, #2a1136 50%, #1c0926 100%);
          color: white;
          text-align: center;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .premium-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle at 50% 0%, rgba(255, 105, 180, 0.15) 0%, transparent 60%),
                            radial-gradient(circle at 80% 100%, rgba(138, 43, 226, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .cta-content-wrapper {
          position: relative;
          z-index: 2;
          max-width: 700px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px 32px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .btn-cta-primary {
          background: #ffffff;
          color: #2a1136;
          padding: 12px 28px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .btn-cta-outline {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 12px 28px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        @media (max-width: 768px) {
          .cta-content-wrapper {
            padding: 32px 20px;
          }
          .cta-buttons {
            flex-direction: column;
          }
          .btn-cta-primary, .btn-cta-outline {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 1024px) {
          .masonry-grid { column-count: 3; }
        }
        @media (max-width: 768px) {
          .masonry-grid { column-count: 2; column-gap: 16px; }
          .masonry-item { margin-bottom: 16px; }
          .process-line { display: none; }
        }
        @media (max-width: 480px) {
          .masonry-grid { column-count: 1; }
        }
      `}</style>

      {showModal && (
        <CustomCreationFormModal
          onClose={() => setShowModal(false)}
          service={service}
        />
      )}

      {lightboxIndex !== null && (
        <Lightbox
          images={validGalleryImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* ── HERO ── */}
      <section className="premium-hero" aria-labelledby="custom-hero-title">
        <div className="hero-pattern"></div>
        <div className="container hero-grid">
          <div className="hero-content">
            <h1 id="custom-hero-title" className="hero-title">
              Thoughtful crafting <br /> made easy
            </h1>
            <p className="hero-desc">
              Whether you're looking for a personalized gift, a bespoke décor piece, or something truly special just because, our custom creation service brings your unique vision to life in premium metalwork.
            </p>
            <div className="hero-cta-group">
              <button
                onClick={() => setShowModal(true)}
                className="btn-custom-primary"
              >
                Get started
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="btn-custom-link"
              >
                Learn how it works
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div
              className="floating-product"
              onClick={() => setShowModal(true)}
              style={{ cursor: "pointer" }}
            >
              <Image
                src={heroImage}
                alt="Custom Crafted Masterpiece"
                fill
                priority
                className="floating-product-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS (Process) ── */}
      <section id="how-it-works" className="section" style={{ background: "var(--surface-sunken)", padding: "100px 0" }}>
        <div className="container">
          <div className="section-header" style={{ textAlign: "center", marginBottom: 60 }}>
            <span className="overline" style={{ color: "var(--primary)" }}>The Process</span>
            <h2 className="heading-lg" style={{ fontFamily: "var(--font-heading)" }}>How It Works</h2>
          </div>
          <div style={{ position: "relative" }}>
            {/* The horizontal connecting line */}
            <div
              className="process-line"
              style={{
                position: "absolute",
                top: 30, /* Half of the 60px circle */
                left: "12.5%",
                right: "12.5%",
                height: 2,
                background: "var(--border-color, rgba(0,0,0,0.1))",
                zIndex: 0
              }}
            />
            <div className="grid grid-4" style={{ gap: 40, position: "relative", zIndex: 1 }}>
              {[
                { step: "01", title: "Share Your Vision", desc: "Upload a photo or describe your idea. Our team reviews your request." },
                { step: "02", title: "Design & Quote", desc: "We provide a digital mock-up and a detailed, transparent quotation." },
                { step: "03", title: "Handcrafting", desc: "Master artisans bring your design to life using premium brass or bronze." },
                { step: "04", title: "Safe Delivery", desc: "Your bespoke creation is securely packaged and shipped to your doorstep." }
              ].map((item) => (
                <div key={item.step} style={{ textAlign: "center", position: "relative" }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: "50%", background: "var(--surface)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px", fontSize: "1.25rem", fontWeight: "700", color: "var(--primary)",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                    position: "relative",
                    zIndex: 2
                  }}>
                    {item.step}
                  </div>
                  <h3 className="heading-sm mb-3">{item.title}</h3>
                  <p className="text-body-sm" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PREMIUM GALLERY ── */}
      <section className="premium-gallery">
        <div className="container">
          <div className="gallery-header">
            <span style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.85rem", opacity: 0.7, display: "block", marginBottom: 12 }}>
              Our Portfolio
            </span>
            <h2 className="gallery-title">Crafted Masterpieces</h2>
            <p style={{ color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Explore some of the unique, personalized metal artworks we've created for our clients. Click any image to view details.
            </p>
          </div>

          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div className="masonry-grid">
              {validGalleryImages.map((img, i) => (
                <div
                  key={i}
                  className="masonry-item"
                  onClick={() => setLightboxIndex(i)}
                >
                  <img src={img.src} alt={img.alt} loading="lazy" />
                  <div className="gallery-overlay">
                    <div className="gallery-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="premium-cta">
        <div className="container">
          <div className="cta-content-wrapper">
            <h2 className="heading-lg mb-4" style={{ fontFamily: "var(--font-heading)", color: "#ffffff" }}>
              Ready to create something unique?
            </h2>
            <p className="text-body mb-8" style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem" }}>
              Our master artisans are ready to turn your ideas into a timeless piece of metal art. Let's build your vision together.
            </p>
            <div className="cta-buttons" style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              <button
                onClick={() => setShowModal(true)}
                className="btn-cta-primary"
              >
                Start Customizing
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
              <a
                href={whatsappQuoteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta-outline"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
