'use client';

import { useState, useMemo } from 'react';
import { useAdmin } from '@/store/AdminContext';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CreateWholesaleCatalog() {
  const { products } = useAdmin();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // State to track which products are selected and what their custom wholesale price is
  // Shape: { "mongodb_id_1": "500", "mongodb_id_2": "1000" }
  const [selectedProducts, setSelectedProducts] = useState({});
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOption, setSortOption] = useState("Newest");
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter products for the search bar so it's easy to find things to add
  const filteredProducts = useMemo(() => {
    return [...products]
      .filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "price") {
          aValue = a.salePrice || a.price;
          bValue = b.salePrice || b.price;
        }

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

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleToggleProduct = (productId) => {
    setSelectedProducts(prev => {
      const copy = { ...prev };
      if (copy[productId] !== undefined) {
        // If it's already selected, uncheck it by removing it from the object
        delete copy[productId];
      } else {
        // If not selected, add it with a blank price
        copy[productId] = ""; 
      }
      return copy;
    });
  };

  const handlePriceChange = (productId, price) => {
    setSelectedProducts(prev => ({ ...prev, [productId]: price }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Formatting the products array perfectly for our Database
    const finalProductsArray = Object.keys(selectedProducts).map(id => ({
      product: id,
      wholesalePrice: Number(selectedProducts[id])
    }));

    if (finalProductsArray.length === 0) {
      alert("Please select at least one product to add to the catalog!");
      return;
    }

    // Ensure they typed a price for everything they checked
    const hasEmptyPrices = finalProductsArray.some(p => isNaN(p.wholesalePrice) || p.wholesalePrice <= 0);
    if (hasEmptyPrices) {
      alert("Please enter a valid wholesale price for every checked product.");
      return;
    }

    setLoading(true);

    try {
      const idToken = await user.getIdToken();
      
      const payload = {
        name,
        description,
        products: finalProductsArray,
        isActive: true
      };

      if (expiryDate) {
        payload.expiryDate = new Date(expiryDate);
      }

      const res = await fetch('/api/admin/wholesale-catalogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create wholesale catalog');

      // Success! Send them back to the dashboard table
      router.push('/admin/wholesale');
    } catch (err) {
      console.error(err);
      alert("Failed to save catalog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="flex-between mb-8">
        <div>
          <span className="overline">B2B Sales</span>
          <h1 className="heading-lg">Create New Catalog</h1>
        </div>
        <Link href="/admin/wholesale" className="btn btn-outline">
          Cancel & Go Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 'var(--space-6)' }}>
        
        {/* Left Side: Product Selection */}
        <div style={{ background: 'var(--surface)', padding: 'var(--space-6)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)' }}>
          <h2 className="heading-sm mb-4">Select Products</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <div className="search-bar">
              <input 
                type="search" 
                placeholder="Search products by name..." 
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                spellCheck={false}
              />
            </div>
            
            <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
              <div className="search-bar" style={{ maxWidth: 220, gap: 10 }}>
                <span className="text-muted" style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
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
                  {sortOption === "Custom" && <option value="Custom">Custom</option>}
                </select>
              </div>

              <div className="search-bar" style={{ maxWidth: 220 }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
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
            </div>
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>Select</th>
                  <th>Product</th>
                  <th>Retail Price</th>
                  <th>Wholesale Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => {
                  const isSelected = selectedProducts[product._id] !== undefined;
                  
                  return (
                    <tr key={product._id} style={{ opacity: isSelected ? 1 : 0.7 }}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleProduct(product._id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={product.images[0]} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          <span style={{ fontWeight: isSelected ? 600 : 400, whiteSpace: 'normal', wordBreak: 'break-word' }}>{product.title}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        ₹{product.salePrice || product.price}
                      </td>
                      <td>
                        {isSelected ? (
                          <input 
                            type="number"
                            min="0"
                            required
                            placeholder="Enter Price"
                            className="form-input"
                            value={selectedProducts[product._id]}
                            onChange={(e) => handlePriceChange(product._id, e.target.value)}
                            style={{ maxWidth: '120px', padding: '6px 12px' }}
                          />
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Check box to set price</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
              <button 
                type="button"
                className="btn btn-outline btn-sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="text-muted" style={{ fontSize: '13px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                type="button"
                className="btn btn-outline btn-sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Catalog Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ background: 'var(--surface)', padding: 'var(--space-6)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)' }}>
            <h2 className="heading-sm mb-4">Catalog Settings</h2>
            
            <div className="form-group mb-4">
              <label className="form-label">Catalog Name *</label>
              <input 
                className="form-input" 
                required 
                placeholder="e.g. Diwali Bulk Offer"
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Description (Optional)</label>
              <textarea 
                className="form-input form-textarea" 
                rows="3"
                placeholder="Internal notes about this catalog..."
                value={description} 
                onChange={e => setDescription(e.target.value)} 
              />
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Expiry Date (Optional)</label>
              <input 
                type="date"
                className="form-input" 
                value={expiryDate} 
                onChange={e => setExpiryDate(e.target.value)} 
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Leave empty for a link that never expires.
              </span>
            </div>

            <div style={{ padding: 'var(--space-4)', background: 'var(--surface-sunken)', borderRadius: '8px', marginBottom: 'var(--space-6)' }}>
              <strong style={{ display: 'block', marginBottom: '8px' }}>Summary</strong>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Total Products Selected: <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{Object.keys(selectedProducts).length}</span></p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? "Creating Catalog..." : "Finish & Generate Link"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
