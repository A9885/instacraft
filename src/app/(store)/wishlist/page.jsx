'use client';

import { useWishlist } from '@/store/WishlistContext';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import AddToCartButton from '@/components/product/AddToCartButton';
import WishlistButton from '@/components/product/WishlistButton';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import ProtectedRoute from '@/components/common/ProtectedRoute';

function WishlistContent() {
  const { items: wishlistItems, count } = useWishlist();

  return (
    <div className="section" style={{ backgroundColor: 'var(--surface-sunken)', minHeight: '80vh' }}>
      <div className="container">

        {/* Page Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '40px',
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, rgba(var(--primary-rgb, 246,146,30),0.12), rgba(var(--primary-rgb, 246,146,30),0.04))',
              border: '1px solid rgba(var(--primary-rgb, 246,146,30),0.2)',
              borderRadius: '24px',
              padding: '4px 14px',
              marginBottom: '12px',
            }}>
              <Heart size={13} style={{ color: 'var(--primary)' }} fill="var(--primary)" />
              <span style={{ fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--primary)' }}>My Wishlist</span>
            </div>
            <h1 className="heading-lg" style={{ margin: 0 }}>Saved Items</h1>
            <p className="text-muted" style={{ marginTop: 6 }}>
              {count === 0
                ? 'You have no saved items yet'
                : `${count} handcrafted ${count === 1 ? 'piece' : 'pieces'} saved`}
            </p>
          </div>

          <Link href="/shop" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={16} />
            Browse More
          </Link>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
              <div style={{
                width: 80, height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(var(--primary-rgb,246,146,30),0.15), rgba(var(--primary-rgb,246,146,30),0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-6)',
              }}>
                <Heart size={36} color="var(--primary)" />
              </div>
              <h2 className="heading-sm mb-2">Your wishlist is empty</h2>
              <p className="text-muted mb-6" style={{ maxWidth: 380, margin: '0 auto var(--space-6)' }}>
                Tap the ❤️ on any product to save it here. Your wishlist syncs across devices when you're signed in.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/shop" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} />
                  Explore Products
                </Link>
                <Link href="/deals" className="btn btn-outline">
                  View Deals
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-auto-md">
              {wishlistItems.map((product, idx) => (
                <article key={product.id || product._id || `wishlist-${idx}`} className="product-card">
                  <div className="product-card-image-wrap">
                    <Link href={`/product/${product.slug}`}>
                      <img
                        src={product.images?.[0] || '/images/placeholder.webp'}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Link>
                    <div className="product-card-actions" style={{ opacity: 1, transform: 'none' }}>
                      <WishlistButton product={product} />
                    </div>
                  </div>
                  <div className="product-card-body">
                    <h3 className="product-card-title">
                      <Link href={`/product/${product.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {product.title}
                      </Link>
                    </h3>
                    <p className="product-card-art artisan">by {product.artisan}</p>
                    <div className="product-card-price-row">
                      <span className="price">{formatPrice(product.salePrice || product.price)}</span>
                      {product.salePrice && product.price && product.salePrice < product.price && (
                        <span style={{ fontSize: 'var(--fs-13)', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="product-card-footer">
                    <AddToCartButton product={product} className="w-full" />
                  </div>
                </article>
              ))}
            </div>

            {/* Footer CTA */}
            <div style={{
              marginTop: 48,
              padding: '32px 24px',
              background: 'linear-gradient(135deg, var(--surface), var(--surface-sunken))',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid var(--border-light)',
              textAlign: 'center',
            }}>
              <p className="text-muted" style={{ marginBottom: 16 }}>
                Ready to bring home some artisan magic?
              </p>
              <Link href="/checkout" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={16} />
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute redirectTo="/">
      <WishlistContent />
    </ProtectedRoute>
  );
}
