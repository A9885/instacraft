"use client";

import { useRef } from 'react';
import ProductCard from './ProductCard';
import { StarIcon } from '../common/Icons';

const ChevronLeft = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function ProductGrid({ products, columns = 'auto-md', layout = 'grid' }) {
  const scrollRef = useRef(null);

  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-20) 0' }}>
        <div style={{ marginBottom: 'var(--space-4)', color: 'var(--text-muted)' }}>
          <StarIcon size={48} />
        </div>
        <h3 className="heading-sm" style={{ marginBottom: 'var(--space-2)' }}>No products found</h3>
        <p className="text-muted">Try a different category or check back soon.</p>
      </div>
    );
  }

  const isRow = layout === 'row';

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!isRow) {
    return (
      <div className={`grid grid-${columns}`} role="list" aria-label="Products">
        {products.map(product => (
          <div key={product._id || product.id} role="listitem">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="product-slider-wrapper" style={{ position: 'relative', width: '100%', padding: '0 10px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .flex-row-scroll::-webkit-scrollbar { display: none; }
        .product-slider-item {
          flex: 0 0 280px;
        }
        @media (min-width: 1024px) {
          .product-slider-item {
            flex: 0 0 calc(25% - 12px);
          }
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          .product-slider-item {
            flex: 0 0 calc(33.33% - 11px);
          }
        }
        @media (max-width: 767px) {
          .product-slider-item {
            flex: 0 0 85%;
          }
        }
        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: white;
          border: 1px solid var(--border-light);
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          cursor: pointer;
          transition: all 0.25s ease;
          color: var(--text-dark);
          opacity: 0.9;
        }
        .nav-btn:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          transform: translateY(-50%) scale(1.1);
          opacity: 1;
        }
        .nav-btn.left { left: -15px; }
        .nav-btn.right { right: -15px; }
        @media (max-width: 640px) {
          .nav-btn { display: none; }
        }
      `}} />

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="flex-row-scroll"
        role="list"
        aria-label="Featured Products"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          gap: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map(product => (
          <div key={product._id || product.id} className="product-slider-item" role="listitem">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button className="nav-btn left" onClick={() => scroll('left')} aria-label="Previous Products">
        <ChevronLeft size={20} />
      </button>
      <button className="nav-btn right" onClick={() => scroll('right')} aria-label="Next Products">
        <ChevronRight size={20} />
      </button>
    </div>
  );
}


