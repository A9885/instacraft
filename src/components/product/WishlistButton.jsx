'use client';

import { useWishlist } from '@/store/WishlistContext';

export default function WishlistButton({ product, className = '' }) {
  const { toggleItem, isInWishlist } = useWishlist();
  const active = isInWishlist(product.id);

  return (
    <button
      id={`wishlist-${product.id}`}
      className={`btn btn-icon-sm ${className}`}
      onClick={(e) => { e.preventDefault(); toggleItem(product); }}
      aria-label={active ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
      aria-pressed={active}
      style={{
        background: active ? 'var(--primary)' : 'rgba(255,255,255,0.9)',
        color: active ? 'var(--surface-white)' : 'var(--text-dark)',
        border: '1.5px solid',
        borderColor: active ? 'var(--primary)' : 'var(--border-light)',
        backdropFilter: 'blur(4px)',
        transition: 'all var(--transition-base)',
      }}
    >
      <svg
        width="16"
        height="16"
        fill={active ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ transition: 'fill var(--transition-fast)' }}
      >
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
