'use client';
export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect } from 'react';
import { useAdmin } from '@/store/AdminContext';
import { useAuth } from '@/store/AuthContext';
import { formatDate } from '@/lib/utils';
import { Package, AlertTriangle, Ban, Check, Search } from 'lucide-react';
import AdminPagination from '@/components/admin/AdminPagination';
import { getProducts } from '@/lib/api';


export default function AdminInventoryPage() {
  const { products: contextProducts, dispatch } = useAdmin();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "stock", direction: "asc" });
  const [loadingId, setLoadingId] = useState(null); 
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getProducts(true, currentPage, limit);
        setProducts(data.products || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        console.error("Failed to load inventory:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, currentPage, dispatch]);

  const processedProducts = useMemo(() => {
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

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [products, search, selectedCategory, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const outOfStock = products.filter(p => p.stock === 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10);
  const healthy = products.filter(p => p.stock >= 10);

  async function handleStockUpdate(mongoId, delta) {
    const p = products.find(prod => prod._id === mongoId);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);

    try {
      setLoadingId(mongoId);
      const idToken = await user?.getIdToken();
      if (!idToken) throw new Error("Authentication failed. Please login again.");

      const response = await fetch(`/api/products/${mongoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update stock");
      }

      // 1. Update LOCAL state for instant UI reflection
      setProducts(prev => prev.map(prod => 
        prod._id === mongoId ? { ...prod, stock: newStock } : prod
      ));

      // 2. Update AdminContext for site-wide sync
      dispatch({ type: 'UPDATE_STOCK', id: mongoId, stock: newStock });
    } catch (error) {
      console.error("Stock Update Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="flex-between flex-between-responsive mb-8">
        <div>
          <span className="overline">Stock Management</span>
          <h1 className="heading-lg">Inventory</h1>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-3 mb-8">
        <div className="stat-card">
          <span className="stat-label">Healthy Stock</span>
          <div className="stat-card-row">
            <div className="stat-icon stat-icon-success"><Package size={20} /></div>
            <span className="stat-value">{healthy.length}</span>
          </div>
          <span className="stat-change up">≥ 10 units</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Low Stock</span>
          <div className="stat-card-row">
            <div className="stat-icon stat-icon-secondary"><AlertTriangle size={20} /></div>
            <span className="stat-value">{lowStock.length}</span>
          </div>
          <span className="stat-change" style={{ color: 'var(--warning)' }}>1–9 units</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Out of Stock</span>
          <div className="stat-card-row">
            <div className="stat-icon stat-icon-primary"><Ban size={20} /></div>
            <span className="stat-value">{outOfStock.length}</span>
          </div>
          <span className="stat-change down">Needs restock</span>
        </div>
      </div>

      {/* Inventory table */}
      <div className="data-table-wrap">
        <div className="data-table-header" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div className="flex-between flex-between-responsive w-full mb-2">
            <h2 className="heading-sm">Stock Levels</h2>
            <span className="text-muted">{processedProducts.length} items found</span>
          </div>

          <div className="flex-responsive" style={{ width: '100%', marginBottom: 'var(--space-4)' }}>
            {/* Search */}
            <div className="search-bar" style={{ maxWidth: 300, flex: 1 }}>
              <Search size={16} />
              <input
                type="search"
                placeholder="Search inventory..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search items"
              />
            </div>

            {/* Category Filter */}
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
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th
                  onClick={() => requestSort("title")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Product
                  </div>
                </th>
                <th
                  onClick={() => requestSort("category")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Category
                  </div>
                </th>
                <th
                  onClick={() => requestSort("stock")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Stock Level
                  </div>
                </th>
                <th>Status</th>
                <th>Adjust Stock</th>
              </tr>
            </thead>
            <tbody>
              {processedProducts.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <img src={p.images[0]} alt={p.title} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 'var(--border-radius)', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 'var(--fs-14)' }} className="line-clamp-1">{p.title}</p>
                        <p style={{ fontSize: 'var(--fs-13)', color: 'var(--text-muted)' }}>{p.artisan}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{p.category?.replace(/-/g, ' ') || 'Handicrafts'}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ flex: 1, maxWidth: 120, height: 6, borderRadius: 99, background: 'var(--border-color)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${Math.min(100, (p.stock / 50) * 100)}%`,
                          background: p.stock === 0 ? 'var(--error)' : p.stock < 10 ? 'var(--warning)' : 'var(--success)',
                          borderRadius: 99,
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 'var(--fs-14)', fontWeight: 600, minWidth: 28 }}>{p.stock}</span>
                    </div>
                  </td>
                  <td>
                    {p.stock === 0 ? <span className="stock-badge-out">Out of Stock</span>
                      : p.stock < 10 ? <span className="stock-badge-low" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={14} />Low Stock</span>
                        : <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Check size={14} />In Stock</span>}
                  </td>
                  <td>
                    <div className="cart-item-qty">
                      <button 
                        className="cart-qty-btn" 
                        onClick={() => handleStockUpdate(p._id, -1)} 
                        disabled={loadingId === p._id}
                        aria-label={`Decrease stock for ${p.title}`}
                      >
                        −
                      </button>
                      <span className="cart-qty-val" style={{ minWidth: 32, opacity: loadingId === p._id ? 0.5 : 1 }}>
                        {p.stock}
                      </span>
                      <button 
                        className="cart-qty-btn" 
                        onClick={() => handleStockUpdate(p._id, 1)} 
                        disabled={loadingId === p._id}
                        aria-label={`Increase stock for ${p.title}`}
                      >
                        +
                      </button>
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleStockUpdate(p._id, 10)} 
                        disabled={loadingId === p._id}
                        style={{ marginLeft: 'var(--space-2)' }}
                      >
                        {loadingId === p._id ? '...' : '+10'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '0 16px var(--space-4) 16px' }}>
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
