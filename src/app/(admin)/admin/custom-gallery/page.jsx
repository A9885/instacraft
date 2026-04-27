"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useAuth } from "@/store/AuthContext";
import {
  Save, AlertCircle, CheckCircle2, Plus, Trash2,
  Image as ImageIcon, Upload, Link as LinkIcon,
  Tag, Type, AlignLeft, Eye, EyeOff, Star
} from "lucide-react";

export default function CustomGalleryAdminPage() {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [heroImage, setHeroImage] = useState("/images/pexels-photo-31452296.webp");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (!user) return;
    const fetchContent = async () => {
      fetch("/api/site-content")
        .then((r) => r.json())
        .then((data) => {
          if (data.siteContent?.customCreations) {
            setImages(Array.isArray(data.siteContent.customCreations) ? data.siteContent.customCreations : []);
          } else {
            setImages([
              { src: "/images/pexels-photo-14694207.webp", alt: "Custom Gallery Image 1" },
              { src: "/images/pexels-photo-21383559.webp", alt: "Custom Gallery Image 2" },
            ]);
          }
          if (data.siteContent?.customCreationsHero) {
            setHeroImage(data.siteContent.customCreationsHero);
          }
        })
        .catch(console.error);
    };
    fetchContent();
  }, [user]);

  const updateImage = (index, field, value) => {
    const next = [...images];
    next[index] = { ...next[index], [field]: value };
    setImages(next);
  };

  const addImage = () => {
    setImages([
      ...images,
      {
        id: `cg-${Date.now()}`,
        src: "",
        alt: "New Custom Creation"
      },
    ]);
  };

  const deleteImage = (index) => {
    if (window.confirm("Delete this gallery image?")) {
      setImages(images.filter((_, i) => i !== index));
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

  const handleMultipleFilesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !user) return;

    setStatus({ type: "info", message: `Uploading ${files.length} images...` });
    try {
      const idToken = await user.getIdToken();
      let newUploadedImages = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${idToken}` },
          body: formData,
        });
        const data = await res.json();

        if (res.ok && data.url) {
          newUploadedImages.push({
            id: `cg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            src: data.url,
            alt: file.name.split('.')[0] || "Custom Creation"
          });
        }
      }

      if (newUploadedImages.length > 0) {
        setImages(prev => [...prev, ...newUploadedImages]);
        setStatus({ type: "success", message: `Successfully uploaded ${newUploadedImages.length} images!` });
      } else {
        setStatus({ type: "error", message: "Failed to upload images." });
      }
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);

      e.target.value = "";
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "Upload error" });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();

      const contentRes = await fetch("/api/site-content");
      const contentData = await contentRes.json();

      const payload = {
        siteContent: {
          ...contentData.siteContent,
          customCreations: images,
          customCreationsHero: heroImage
        }
      };

      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus({ type: "success", message: "Settings saved successfully!" });
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
            <span>Custom Gallery</span>
          </h1>
          <p className="text-body" style={{ marginTop: 4 }}>
            Manage the hero image and gallery images shown on the Custom Creations page.
          </p>
        </div>
        <div className="flex-responsive">
          <label
            className="btn btn-outline"
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
          >
            <Upload size={18} /> Bulk Upload
            <input
              type="file"
              multiple
              hidden
              accept="image/*"
              onChange={handleMultipleFilesUpload}
            />
          </label>
          <button
            className="btn btn-outline"
            onClick={addImage}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <Plus size={18} /> Add Empty Card
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
          style={{ width: "100%", padding: "var(--space-3)", marginBottom: "var(--space-6)", justifyContent: "center", fontSize: "var(--fs-14)" }}
        >
          {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        
        {/* HERO IMAGE SECTION */}
        <section className="admin-card" style={{ 
          background: "var(--surface-raised)", 
          border: "1px solid var(--primary)", 
          marginBottom: "var(--space-4)",
          padding: "var(--space-6)",
          borderRadius: "var(--radius-lg)"
        }}>
          <div className="flex-between mb-4">
            <h2 className="heading-sm" style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--primary)" }}>
              <Star size={20} />
              <span>Page Hero Image</span>
            </h2>
          </div>
          <p className="text-body text-muted mb-4">This is the large, floating feature image shown at the very top of the Custom Creations page.</p>
          
          <div className="form-group">
            <label className="form-label"><LinkIcon size={14} /> Hero Image Source (URL)</label>
            <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
              <input
                className="form-input"
                value={heroImage || ""}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="e.g. /images/hero-image.webp"
                style={{ flex: 1 }}
              />
              <label className="btn btn-outline" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "0 16px", whiteSpace: "nowrap" }}>
                <Upload size={14} /> Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, setHeroImage)}
                />
              </label>
            </div>
            {heroImage && (
              <div style={{ width: 120, height: 120, borderRadius: 12, overflow: "hidden", border: "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f0f0" }}>
                <img src={heroImage} alt="Hero Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            )}
          </div>
        </section>

        <h2 className="heading-sm mt-8 mb-4">Gallery Items</h2>

        {images.map((img, idx) => (
          <section key={img.id || idx} className="admin-card" style={{
            padding: "var(--space-6)",
            borderRadius: "var(--radius-lg)"
          }}>
            <div className="flex-between mb-6">
              <h2 className="heading-sm" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ImageIcon size={20} />
                <span>Image #{idx + 1}</span>
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
                <button
                  type="button"
                  onClick={() => deleteImage(idx)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--error)" }}
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: "var(--space-8)" }}>
              {/* Left: Text */}
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                <div className="form-group">
                  <label className="form-label"><AlignLeft size={14} /> Alt Text / Title</label>
                  <input
                    className="form-input"
                    value={img.alt || ""}
                    onChange={(e) => updateImage(idx, "alt", e.target.value)}
                    placeholder="e.g. Brass Elephant Sculpture"
                  />
                </div>
              </div>

              {/* Right: Image */}
              <div className="form-group">
                <label className="form-label"><LinkIcon size={14} /> Image Source (URL)</label>
                <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                  <input
                    className="form-input"
                    value={img.src || ""}
                    onChange={(e) => updateImage(idx, "src", e.target.value)}
                    placeholder="e.g. /images/pexels-photo-14694207.webp or https://..."
                    style={{ flex: 1 }}
                  />
                  <label className="btn btn-outline" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "0 16px", whiteSpace: "nowrap" }}>
                    <Upload size={14} /> Upload
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, (url) => updateImage(idx, "src", url))}
                    />
                  </label>
                </div>

                <div
                  className="image-upload-area"
                  style={{
                    border: "2px dashed var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-4)",
                    textAlign: "center",
                    position: "relative",
                    background: "var(--surface-sunken)",
                    minHeight: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}
                >
                  {img.src ? (
                    <img src={img.src} alt="" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", borderRadius: "var(--radius-sm)" }} />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)", width: "100%", height: "100%", justifyContent: "center" }}>
                      <ImageIcon size={24} style={{ color: "var(--text-muted)" }} />
                      <span className="text-body-sm" style={{ color: "var(--text-muted)" }}>No image provided</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}

        {images.length === 0 && (
          <div className="admin-card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <ImageIcon size={48} style={{ color: "var(--text-muted)", margin: "0 auto var(--space-4)" }} />
            <h3 className="heading-sm">No Gallery Images</h3>
            <p className="text-body text-muted mb-4">You haven't added any images yet.</p>
            <button className="btn btn-primary" onClick={addImage}>
              <Plus size={18} /> Add Your First Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
