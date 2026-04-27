'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearch } from '@/store/SearchContext';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';

export default function NavbarSearch() {
  const { isOpen, query, results, loading, close, search } = useSearch();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={close} role="dialog" aria-modal="true" aria-label="Search">
      <div className="search-overlay-box" onClick={e => e.stopPropagation()}>
        <div className="search-overlay-input-row">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
            <path d="M16.5 16.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            id="search-input"
            className="search-overlay-input"
            type="search"
            placeholder="Search for handcrafted treasures..."
            value={query}
            onChange={e => search(e.target.value)}
            aria-label="Search products"
            autoComplete="off"
          />
          <button className="btn btn-ghost btn-sm" onClick={close} aria-label="Close search">Esc</button>
        </div>

        <div className="search-results-list" role="listbox" aria-label="Search results">
          {loading && (
            <div className="search-empty">Searching...</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="search-empty">No results for &ldquo;{query}&rdquo;</div>
          )}
          {!loading && !query && (
            <div className="search-empty">Start typing to discover artisan crafts...</div>
          )}
          {results.map(product => (
            <Link
              key={product._id || product.id}
              href={`/product/${product.slug}`}
              className="search-result-item"
              onClick={close}
              role="option"
            >
              <Image
                src={product.images?.[0] || "/images/placeholder.webp"}
                alt={product.title}
                width={60}
                height={60}
                className="search-result-img"
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 'var(--fs-15)', fontWeight: 600, color: 'var(--text-dark)', marginBottom: 2 }} className="truncate">
                  {product.title}
                </p>
                {product.artisan && (
                  <p style={{ fontSize: 'var(--fs-13)', color: 'var(--text-muted)' }}>
                    {product.artisan}
                  </p>
                )}
              </div>
              <span className="price" style={{ fontSize: 'var(--fs-15)', flexShrink: 0 }}>
                {formatPrice(product.salePrice || product.price)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
