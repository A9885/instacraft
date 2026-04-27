"use client";

import { useState, useMemo, useEffect } from "react";
import { useAdmin } from "@/store/AdminContext";
import { useAuth } from "@/store/AuthContext";
import { formatPrice, calcDiscountPercent } from "@/lib/utils";
import { X, AlertTriangle, Star, GripVertical, ImagePlus, Trash2 } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import { getProducts } from "@/lib/api";

export default function AdminProductsPage() {
  const { products: contextProducts, dispatch } = useAdmin();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [sortOption, setSortOption] = useState("Newest");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;

  useEffect(() => {
    async function loadProducts() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getProducts(true, currentPage, limit);
        setProducts(data.products || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [user, currentPage, dispatch]);
  const [form, setForm] = useState({
    title: "",
    price: "",
    salePrice: "",
    category: "wall-hangings",
    stock: "",
    artisan: "",
    description: "",
    material: "Brass",
    size: "",
    color: "",
    quantity: "1 piece",
    type: "product",
    ctaType: "form",
    images: [],
    weight: 1,
    length: 15,
    breadth: 15,
    height: 10,
  });

  const sortedProducts = useMemo(() => {
    return [...products]
      .filter((p) => {
        const matchesSearch =
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.category?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle special cases for nested or derived values
        if (sortConfig.key === "price") {
          aValue = a.salePrice || a.price;
          bValue = b.salePrice || b.price;
        }

        // Convert dates to numeric timestamps so comparison is always accurate
        // regardless of whether createdAt comes as a Date object or ISO string
        if (sortConfig.key === "createdAt") {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [products, search, selectedCategory, sortConfig]);

  const handleSortChange = (option) => {
    setSortOption(option);
    switch (option) {
      case "A-Z":
        setSortConfig({ key: "title", direction: "asc" });
        break;
      case "Z-A":
        setSortConfig({ key: "title", direction: "desc" });
        break;
      case "Newest":
        setSortConfig({ key: "createdAt", direction: "desc" });
        break;
      case "Oldest":
        setSortConfig({ key: "createdAt", direction: "asc" });
        break;
      default:
        break;
    }
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setSortOption("Custom"); // Reset labels if manual table headers are clicked
  };

  function openAdd() {
    setForm({
      title: "",
      price: "",
      salePrice: "",
      category: "wall-hangings",
      stock: "",
      artisan: "",
      description: "",
      material: "Brass",
      size: "",
      color: "",
      quantity: "1 piece",
      type: "product",
      ctaType: "form",
      images: [],
      weight: 1,
      length: 15,
      breadth: 15,
      height: 10,
    });
    setEditProduct(null);
    setShowForm(true);
  }
  function openEdit(p) {
    setForm({
      title: p.title || "",
      price: p.price ?? "",
      salePrice: p.salePrice || "",
      category: p.category || "wall-hangings",
      stock: p.stock ?? "",
      artisan: p.artisan || "",
      description: p.description || "",
      material: p.material || "Brass",
      size: p.size || "",
      color: p.color || "",
      quantity: p.quantity || "1 piece",
      type: p.type || "product",
      ctaType: p.ctaType || "form",
      images: Array.isArray(p.images) ? [...p.images] : [],
      weight: p.weight || 1,
      length: p.length || 15,
      breadth: p.breadth || 15,
      height: p.height || 10,
    });
    setEditProduct(p);
    setShowForm(true);
  }
  async function handleDelete(mongoId) {
    if (confirm("Delete this product?")) {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/products/${mongoId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${idToken}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete product");
        }

        dispatch({ type: "DELETE_PRODUCT", id: mongoId });
        window.location.reload();
      } catch (error) {
        console.error("DB Error:", error);
        alert("Error: " + error.message);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.salePrice && Number(form.salePrice) > Number(form.price)) {
      alert("Error: Sale price cannot be higher than the regular price!");
      return;
    }

    const product = {
      ...(editProduct || {}),
      title: form.title,
      slug: form.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      price: Number(form.price),
      salePrice: form.salePrice ? Number(form.salePrice) : undefined,
      category: form.category,
      stock: Number(form.stock),
      artisan: form.artisan,
      description: form.description,
      type: form.type || "product",
      ctaType: form.type === "service" ? form.ctaType || "form" : undefined,
      ctaLabel:
        form.type === "service"
          ? form.ctaType === "whatsapp"
            ? "Get Quote on WhatsApp"
            : "Share Your Idea"
          : undefined,
      material: form.material || "Brass",
      size: form.size,
      color: form.color,
      quantity: form.quantity || "1 piece",
      weight: Number(form.weight) || 1,
      length: Number(form.length) || 15,
      breadth: Number(form.breadth) || 15,
      height: Number(form.height) || 10,
      images: form.images.length > 0 ? form.images : ["/images/offer-f6cd7197.webp"],
      rating: editProduct?.rating || 4.5,
      reviews: editProduct?.reviews || 0,
      tags: [form.category],
      featured: editProduct?.featured || false,
    };
    if (editProduct) {
      const idToUse = editProduct._id;

      try {
        const idToken = await user.getIdToken();
        const response = await fetch(`/api/products/${idToUse}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update product");
        }

        const updatedProduct = await response.json();
        dispatch({ type: "UPDATE_PRODUCT", product: updatedProduct });
        setShowForm(false);
        window.location.reload();
      } catch (error) {
        console.error("DB Error:", error);
        alert("Error: " + error.message);
      }
    } else {
      try {
        const idToken = await user.getIdToken();
        const response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(product),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save product");
        }

        const savedProduct = await response.json();
        dispatch({ type: "ADD_PRODUCT", product: savedProduct });
        setShowForm(false);
        window.location.reload();
      } catch (error) {
        console.error("DB Error:", error);
        alert("Error: " + error.message);
      }
    }
  }

  return (
    <div className="admin-page">
      <div className="flex-between mb-8">
        <div>
          <span className="overline">Catalogue</span>
          <h1 className="heading-lg">Products</h1>
        </div>
        <button
          className="btn btn-primary"
          onClick={openAdd}
          id="admin-add-product-btn"
        >
          + Add Product
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={editProduct ? "Edit Product" : "Add Product"}
        >
          <div className="modal" style={{ maxWidth: 720 }}>
            <div className="modal-header">
              <h2 className="heading-sm">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                className="navbar-icon-btn"
                onClick={() => setShowForm(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "var(--space-6)",
                  }}
                >
                  {/* Left Column: Image Gallery Preview */}
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>
                        Product Images ({form.images.length}/5)
                        {form.images.length >= 5 && (
                          <span style={{ marginLeft: 8, fontSize: "var(--fs-11)", color: "var(--warning)", fontWeight: 600 }}>Max reached</span>
                        )}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                        disabled={isUploadingImage || form.images.length >= 5}
                        onClick={() => document.getElementById("file-upload").click()}
                      >
                        <ImagePlus size={14} />
                        {isUploadingImage ? "Uploading..." : "Add Image"}
                      </button>
                    </label>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const MAX_IMAGES = 5;
                        const selected = Array.from(e.target.files);
                        if (selected.length === 0) return;

                        // Capture current count before any state update
                        const currentCount = form.images.length;
                        if (currentCount >= MAX_IMAGES) {
                          alert(`You can upload a maximum of ${MAX_IMAGES} images per product.`);
                          e.target.value = "";
                          return;
                        }

                        const slots = MAX_IMAGES - currentCount;
                        const filesToUpload = selected.slice(0, slots);
                        if (selected.length > slots) {
                          alert(`Only ${slots} image${slots === 1 ? "" : "s"} can be added (max ${MAX_IMAGES}). The rest were skipped.`);
                        }

                        setIsUploadingImage(true);
                        try {
                          const idToken = await user.getIdToken();
                          for (const file of filesToUpload) {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              headers: { Authorization: `Bearer ${idToken}` },
                              body: formData,
                            });
                            const data = await res.json();
                            if (res.ok && data.url) {
                              setForm((f) => ({ ...f, images: [...f.images, data.url] }));
                            } else {
                              alert(data.error || "Upload failed for: " + file.name);
                            }
                          }
                        } catch (err) {
                          console.error(err);
                          alert("Network error during upload");
                        } finally {
                          setIsUploadingImage(false);
                          e.target.value = "";
                        }
                      }}
                    />

                    {form.images.length === 0 ? (
                      <div
                        style={{
                          background: "var(--surface-sunken)",
                          borderRadius: "var(--border-radius-lg)",
                          padding: "var(--space-8)",
                          border: "2px dashed var(--border-color)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "var(--space-3)",
                          cursor: "pointer",
                          transition: "border-color 0.2s",
                        }}
                        onClick={() => document.getElementById("file-upload").click()}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
                      >
                        <ImagePlus size={32} style={{ color: "var(--text-muted)" }} />
                        <span className="text-muted" style={{ fontSize: "var(--fs-14)" }}>
                          Click to upload product images
                        </span>
                        <span className="text-muted" style={{ fontSize: "var(--fs-12)" }}>
                          First image will be the primary / cover photo
                        </span>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
                          gap: "var(--space-3)",
                          background: "var(--surface-sunken)",
                          borderRadius: "var(--border-radius-lg)",
                          padding: "var(--space-3)",
                          border: "1px solid var(--border-light)",
                        }}
                      >
                        {form.images.map((url, idx) => (
                          <div
                            key={idx}
                            style={{
                              position: "relative",
                              aspectRatio: "1",
                              borderRadius: "var(--border-radius)",
                              overflow: "hidden",
                              border: idx === 0 ? "2px solid var(--primary)" : "2px solid transparent",
                              background: "var(--surface)",
                            }}
                          >
                            <img
                              src={url}
                              alt={`Product image ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            {idx === 0 && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: 4,
                                  left: 4,
                                  background: "var(--primary)",
                                  color: "#fff",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  padding: "2px 6px",
                                  borderRadius: "var(--border-radius-sm)",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))}
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                background: "rgba(0,0,0,0.6)",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 0,
                                transition: "background 0.15s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "var(--error)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.6)"}
                              title="Remove image"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        {/* Add more button inline — hidden when at the 5-image limit */}
                        {form.images.length < 5 && (
                          <div
                            style={{
                              aspectRatio: "1",
                              borderRadius: "var(--border-radius)",
                              border: "2px dashed var(--border-color)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "border-color 0.2s, background 0.2s",
                              background: "transparent",
                            }}
                            onClick={() => document.getElementById("file-upload").click()}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = "var(--primary)";
                              e.currentTarget.style.background = "rgba(122,31,31,0.04)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "var(--border-color)";
                              e.currentTarget.style.background = "transparent";
                            }}
                            title="Add more images"
                          >
                            <ImagePlus size={20} style={{ color: "var(--text-muted)" }} />
                          </div>
                        )}
                      </div>
                    )}
                    <p style={{ fontSize: "var(--fs-12)", color: "var(--text-muted)", marginTop: 4 }}>
                      Max 5 images per product. First image is the cover photo shown in listings. Click ✕ to remove.
                    </p>
                  </div>

                  {/* Right Column: Key Details */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-4)",
                      gridColumn: "1 / -1",
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="prod-title" className="form-label">
                        Product Title *
                      </label>
                      <input
                        id="prod-title"
                        className="form-input"
                        required
                        value={form.title}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, title: e.target.value }))
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
                        <label htmlFor="prod-price" className="form-label">
                          Price (₹) *
                        </label>
                        <input
                          id="prod-price"
                          className="form-input"
                          type="number"
                          min="0"
                          required
                          value={form.price}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, price: e.target.value }))
                          }
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="prod-sale" className="form-label">
                          Sale Price (₹)
                        </label>
                        <input
                          id="prod-sale"
                          className="form-input"
                          type="number"
                          min="0"
                          value={form.salePrice}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              salePrice: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-4)",
                    marginTop: "var(--space-4)",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "var(--space-4)",
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="prod-category" className="form-label">
                        Category *
                      </label>
                      <select
                        id="prod-category"
                        className="form-input form-select"
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            category: e.target.value,
                            type:
                              e.target.value === "custom-creations"
                                ? "service"
                                : "product",
                          }))
                        }
                      >
                        <option value="wall-hangings">Wall Hangings</option>
                        <option value="table-top-mount">
                          Table Top / Décors
                        </option>
                        <option value="wall-table-combo">
                          Wall &amp; Table Combo
                        </option>
                        <option value="gift-items">Gift Items</option>
                        <option value="custom-creations">
                          Custom Creations
                        </option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="prod-stock" className="form-label">
                        Stock *
                      </label>
                      <input
                        id="prod-stock"
                        className="form-input"
                        type="number"
                        min="0"
                        required
                        value={form.stock}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, stock: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  {/* Type + CTA — only for custom-creations */}
                  {form.category === "custom-creations" && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "var(--space-4)",
                      }}
                    >
                      <div className="form-group">
                        <label htmlFor="prod-type" className="form-label">
                          Item Type
                        </label>
                        <select
                          id="prod-type"
                          className="form-input form-select"
                          value={form.type}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, type: e.target.value }))
                          }
                        >
                          <option value="service">
                            Service (Custom Order)
                          </option>
                          <option value="product">Product (Standard)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label htmlFor="prod-ctatype" className="form-label">
                          CTA Type
                        </label>
                        <select
                          id="prod-ctatype"
                          className="form-input form-select"
                          value={form.ctaType}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, ctaType: e.target.value }))
                          }
                        >
                          <option value="form">Form Modal (Share Idea)</option>
                          <option value="whatsapp">WhatsApp (Get Quote)</option>
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="form-group">
                    <label htmlFor="prod-artisan" className="form-label">
                      Artisan Name &amp; Location
                    </label>
                    <input
                      id="prod-artisan"
                      className="form-input"
                      placeholder="Name, City"
                      value={form.artisan}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, artisan: e.target.value }))
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
                      <label htmlFor="prod-material" className="form-label">
                        Material *
                      </label>
                      <select
                        id="prod-material"
                        className="form-input form-select"
                        value={form.material}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, material: e.target.value }))
                        }
                      >
                        <option value="Brass">Brass</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Aluminium">Aluminium</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="prod-size" className="form-label">
                        Size (in inches)
                      </label>
                      <input
                        id="prod-size"
                        className="form-input"
                        placeholder="e.g. 12 x 8 inches"
                        value={form.size}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, size: e.target.value }))
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
                      <label htmlFor="prod-color" className="form-label">
                        Color / Finish
                      </label>
                      <input
                        id="prod-color"
                        className="form-input"
                        placeholder="e.g. Antique Gold"
                        value={form.color}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, color: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="prod-quantity" className="form-label">
                        Quantity / Set Info
                      </label>
                      <input
                        id="prod-quantity"
                        className="form-input"
                        placeholder="e.g. 1 piece"
                        value={form.quantity}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, quantity: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {/* Logistics Dimensions for Shiprocket */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: "var(--space-4)",
                    background: "var(--surface-sunken)",
                    padding: "var(--space-4)",
                    borderRadius: "var(--border-radius)",
                    border: "1px solid var(--border-light)"
                  }}>
                    <div className="form-group mb-0">
                      <label htmlFor="prod-weight" className="form-label" style={{ fontSize: "11px" }}>Weight (kg) *</label>
                      <input id="prod-weight" className="form-input" type="number" step="0.1" min="0" required value={form.weight} onChange={(e) => setForm((f) => ({...f, weight: e.target.value}))} />
                    </div>
                    <div className="form-group mb-0">
                      <label htmlFor="prod-length" className="form-label" style={{ fontSize: "11px" }}>Length (cm) *</label>
                      <input id="prod-length" className="form-input" type="number" min="1" required value={form.length} onChange={(e) => setForm((f) => ({...f, length: e.target.value}))} />
                    </div>
                    <div className="form-group mb-0">
                      <label htmlFor="prod-breadth" className="form-label" style={{ fontSize: "11px" }}>Breadth (cm) *</label>
                      <input id="prod-breadth" className="form-input" type="number" min="1" required value={form.breadth} onChange={(e) => setForm((f) => ({...f, breadth: e.target.value}))} />
                    </div>
                    <div className="form-group mb-0">
                      <label htmlFor="prod-height" className="form-label" style={{ fontSize: "11px" }}>Height (cm) *</label>
                      <input id="prod-height" className="form-input" type="number" min="1" required value={form.height} onChange={(e) => setForm((f) => ({...f, height: e.target.value}))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="prod-desc" className="form-label">
                      Description
                    </label>
                    <textarea
                      id="prod-desc"
                      className="form-input form-textarea"
                      rows={4}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                    />
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
                <button type="submit" className="btn btn-primary" disabled={isUploadingImage}>
                  {isUploadingImage ? "Uploading Image..." : (editProduct ? "Save Changes" : "Add Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrap">
        <div className="data-table-header">
          <div className="search-bar" style={{ maxWidth: 300 }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.5 16.5l4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
            }}
          >
            {/* Beautified Sort Dropdown */}
            <div className="search-bar" style={{ maxWidth: 220, gap: 10 }}>
              <span
                className="text-muted"
                style={{ fontSize: "13px", whiteSpace: "nowrap" }}
              >
                Sort Products:
              </span>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0 4px",
                  fontSize: "var(--fs-14)",
                  fontWeight: 600,
                  color: "var(--text-main)",
                  outline: "none",
                  width: "100%",
                  cursor: "pointer",
                }}
                aria-label="Sort products"
              >
                <option value="A-Z">A-Z</option>
                <option value="Z-A">Z-A</option>
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                {sortOption === "Custom" && (
                  <option value="Custom">Custom</option>
                )}
              </select>
            </div>

            <div className="search-bar" style={{ maxWidth: 220 }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0 4px",
                  fontSize: "var(--fs-14)",
                  color: "var(--text-main)",
                  outline: "none",
                  width: "100%",
                  cursor: "pointer",
                }}
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                <option value="wall-hangings">Wall Hangings</option>
                <option value="table-top-mount">Table Top / Décors</option>
                <option value="wall-table-combo">Wall & Table Combo</option>
                <option value="gift-items">Gift Items</option>
                <option value="custom-creations">Custom Creations</option>
              </select>
            </div>
            <span className="text-muted">{sortedProducts.length} products</span>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th
                  onClick={() => requestSort("title")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    Product
                  </div>
                </th>
                <th
                  onClick={() => requestSort("category")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    Category
                  </div>
                </th>
                <th
                  onClick={() => requestSort("price")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    Price
                  </div>
                </th>
                <th
                  onClick={() => requestSort("stock")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    Stock
                  </div>
                </th>
                <th
                  onClick={() => requestSort("rating")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    Rating
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                      }}
                    >
                      <img
                        src={p.images?.[0] || "/images/placeholder.webp"}
                        alt={p.title}
                        style={{
                          width: 44,
                          height: 44,
                          objectFit: "cover",
                          borderRadius: "var(--border-radius)",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <p
                          style={{ fontWeight: 600, fontSize: "var(--fs-14)" }}
                          className="truncate"
                        >
                          {p.title}
                        </p>
                        <p
                          style={{
                            fontSize: "var(--fs-13)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {p.artisan}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className="badge badge-secondary"
                      style={{ textTransform: "capitalize" }}
                    >
                      {p.category?.replace(/-/g, " ") || "Handicrafts"}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span
                        style={{ fontWeight: 700, color: "var(--primary)" }}
                      >
                        {formatPrice(p.salePrice || p.price)}
                      </span>
                      {p.salePrice && (
                        <span
                          style={{
                            display: "block",
                            fontSize: "var(--fs-13)",
                            textDecoration: "line-through",
                            color: "var(--text-muted)",
                          }}
                        >
                          {formatPrice(p.price)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {p.stock === 0 ? (
                      <span className="stock-badge-out">Out of Stock</span>
                    ) : p.stock < 10 ? (
                      <span
                        className="stock-badge-low"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <AlertTriangle size={14} />
                        {p.stock} left
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        {p.stock} units
                      </span>
                    )}
                  </td>
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <span style={{ color: "var(--secondary)" }}>
                        <Star size={14} fill="currentColor" />
                      </span>
                      <span style={{ fontSize: "var(--fs-14)" }}>
                        {p.rating} ({p.reviews})
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "var(--space-2)" }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => handleDelete(p._id)}
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
        <div style={{ padding: "0 var(--space-4) var(--space-4) var(--space-4)" }}>
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
