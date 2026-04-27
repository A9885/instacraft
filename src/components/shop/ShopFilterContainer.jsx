"use client";

import { useState, useMemo } from "react";
import ProductGrid from "../product/ProductGrid";
import { CloseIcon } from "../common/Icons";

// materials aligned with the structured product data
const MATERIALS = ["Brass", "Bronze", "Aluminium"];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Customer Ratings' },
];

export default function ShopFilterContainer({ initialProducts, isCustomCategory = false }) {
  // Filter States
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState('newest');

  // Available options (not shown for custom-creations)
  const sizes = ["Small", "Medium", "Large"];
  const themes = ["Ganesh", "Buddha", "Lakshmi", "Shiva", "Krishna", "Om", "Traditional", "Tribal"];

  const toggleSelection = (state, setState, value) => {
    setState(state.includes(value) ? state.filter((i) => i !== value) : [...state, value]);
  };

  const clearAllFilters = () => {
    setSelectedMaterials([]);
    setSelectedSizes([]);
    setSelectedThemes([]);
    setMaxPrice(15000);
    setSortBy('newest');
  };

  const activeFilterCount =
    selectedMaterials.length +
    (isCustomCategory ? 0 : selectedSizes.length + selectedThemes.length + (maxPrice < 15000 ? 1 : 0));

  const sortedAndFilteredProducts = useMemo(() => {
    let result = initialProducts.filter((p) => {
      // Service items: only material filter applies
      if (p.type === "service") {
        if (selectedMaterials.length > 0 && !selectedMaterials.includes(p.material)) return false;
        return true;
      }

      // Price filter (not relevant for services)
      const currentPrice = p.salePrice || p.price;
      if (!isCustomCategory && currentPrice > maxPrice) return false;

      // Size filter
      if (!isCustomCategory && selectedSizes.length > 0 && !selectedSizes.includes(p.size)) return false;

      // Theme filter
      if (!isCustomCategory && selectedThemes.length > 0 && !selectedThemes.includes(p.theme)) return false;

      // Material filter
      if (selectedMaterials.length > 0 && !selectedMaterials.includes(p.material)) return false;

      return true;
    });

    // Sorting Logic
    return result.sort((a, b) => {
      const priceA = a.salePrice || a.price;
      const priceB = b.salePrice || b.price;

      switch (sortBy) {
        case 'price-low':  return priceA - priceB;
        case 'price-high': return priceB - priceA;
        case 'rating':     return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:           
          // Sort by MongoDB creation time (Newest first)
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
  }, [initialProducts, selectedMaterials, selectedSizes, selectedThemes, maxPrice, isCustomCategory, sortBy]);

  return (
    <div className="shop-layout">
      {/* Filters Sidebar */}
      <aside className="shop-sidebar">
        <div className="mobile-filter-header">
          <h2 className="heading-sm" style={{ margin: 0 }}>Filters</h2>
          <label htmlFor="mobile-filter-toggle" className="mobile-filter-close" aria-label="Close filters">
            <CloseIcon size={18} />
          </label>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <>
            <div className="filter-active-section">
              <span style={{ fontWeight: 600, color: "var(--text-dark)", fontSize: "var(--fs-15)" }}>
                Active Filters ({activeFilterCount})
              </span>
              <button className="filter-clear-btn" onClick={clearAllFilters}>Clear All</button>
            </div>
            <div className="filter-divider-black" />
          </>
        )}

        {/* Material — shown for ALL categories */}
        <div className="filter-group">
          <h3 className="filter-title">Material</h3>
          <div className="filter-list">
            {MATERIALS.map((material) => (
              <label key={material} className="filter-item">
                <input
                  type="checkbox"
                  className="filter-checkbox"
                  checked={selectedMaterials.includes(material)}
                  onChange={() => toggleSelection(selectedMaterials, setSelectedMaterials, material)}
                />
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                    background: material === "Brass" ? "#c8a43a" : material === "Bronze" ? "#a0522d" : "#8fa3b1",
                  }} aria-hidden="true" />
                  {material}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="filter-divider-black" />

        {/* Filters below are hidden for custom-creations */}
        {isCustomCategory ? (
          <div style={{ padding: "var(--space-4)", background: "var(--surface-sunken)", borderRadius: "var(--border-radius)", text: "center" }}>
            <p style={{ fontSize: "var(--fs-13)", color: "var(--text-muted)", lineHeight: "var(--lh-loose)", textAlign: "center" }}>
              Custom orders are priced individually.<br />Filter by material to find your preferred metal.
            </p>
          </div>
        ) : (
          <>
            {/* Size */}
            <div className="filter-group">
              <h3 className="filter-title">Size</h3>
              <div className="filter-list">
                {sizes.map((size) => (
                  <label key={size} className="filter-item">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSelection(selectedSizes, setSelectedSizes, size)}
                    />
                    {size}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-divider-black" />

            {/* Price Range */}
            <div className="filter-group">
              <h3 className="filter-title">Price Range</h3>
              <div className="filter-range-container">
                <input
                  type="range" min="0" max="15000" step="500" value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="filter-range-input"
                />
                <div className="filter-range-labels">
                  <span>₹0</span>
                  <span>{maxPrice >= 15000 ? "Any Price" : `Up to ₹${maxPrice}`}</span>
                </div>
              </div>
            </div>

            <div className="filter-divider-black" />

            {/* Theme */}
            <div className="filter-group">
              <h3 className="filter-title">Theme</h3>
              <div className="filter-list">
                {themes.map((theme) => (
                  <label key={theme} className="filter-item">
                    <input
                      type="checkbox"
                      className="filter-checkbox"
                      checked={selectedThemes.includes(theme)}
                      onChange={() => toggleSelection(selectedThemes, setSelectedThemes, theme)}
                    />
                    {theme}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-divider-black" />
          </>
        )}

        {/* Mobile Apply Button */}
        <div className="mobile-apply-btn">
          <label htmlFor="mobile-filter-toggle" className="btn btn-primary" style={{ width: "100%" }}>
            Apply Filters
          </label>
        </div>
      </aside>

      {/* Products Area */}
      <div className="shop-products">
        {/* Toolbar */}
        <div className="shop-toolbar">
          <div className="shop-results-count">
            <span>Showing <strong style={{ color: 'var(--text-dark)' }}>{sortedAndFilteredProducts.length}</strong> items</span>
          </div>
          <div className="shop-sort-wrap">
            <span className="sort-label">Sort By:</span>
            <div className="custom-select-wrap">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="custom-select"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {sortedAndFilteredProducts.length === 0 ? (
          <div style={{
            padding: "var(--space-8)", textAlign: "center",
            backgroundColor: "var(--surface)", borderRadius: "var(--border-radius-lg)",
            border: "1px solid var(--border-light)",
          }}>
            <h3 style={{ marginBottom: "var(--space-2)" }}>No items found</h3>
            <p style={{ color: "var(--text-medium)", marginBottom: "var(--space-4)" }}>
              Try adjusting your filters or clearing them to see more items.
            </p>
            <button className="btn btn-outline" onClick={clearAllFilters}>Clear Filters</button>
          </div>
        ) : (
          <ProductGrid products={sortedAndFilteredProducts} columns="auto-md" />
        )}
      </div>
    </div>
  );
}
