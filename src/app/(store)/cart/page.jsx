'use client';

import { useCart } from '@/store/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [shippingFee, setShippingFee] = useState(199);
  const [shippingThreshold, setShippingThreshold] = useState(1000);

  useEffect(() => {
    fetch('/api/site-config/public')
      .then(res => res.json())
      .then(data => {
        setShippingFee(data.shippingFee ?? 199);
        setShippingThreshold(data.freeShippingThreshold ?? 1000);
      })
      .catch(err => console.error("Could not load shipping config", err));
  }, []);

  const applicableShipping = subtotal >= shippingThreshold ? 0 : shippingFee;
  const finalTotal = subtotal + applicableShipping;

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <ShoppingBag size={64} strokeWidth={1.5} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }} />
          <h1 className="heading-lg mb-4">Your Cart is Empty</h1>
          <p className="text-body mb-8" style={{ maxWidth: 500, marginInline: 'auto' }}>
            It looks like you haven&apos;t added any handcrafted treasures to your cart yet.
          </p>
          <Link href="/shop" className="btn btn-primary btn-lg">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ backgroundColor: 'var(--surface-sunken)', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="heading-lg mb-8">Shopping Cart</h1>

        <div className="col-layout" style={{ gridTemplateColumns: '2fr 1fr', alignItems: 'start' }}>
          {/* Main List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {items.map((item) => (
              <div key={item.id} className="card card-bordered" style={{ display: 'flex', padding: 'var(--space-5)', gap: 'var(--space-6)' }}>
                {/* Image */}
                <div style={{ width: 120, height: 120, position: 'relative', flexShrink: 0 }}>
                  <Image
                    src={item.images[0]}
                    alt={item.title}
                    fill
                    style={{ objectFit: 'cover', borderRadius: 'var(--border-radius-md)' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div className="flex-between mb-1">
                    <h2 className="heading-sm" style={{ margin: 0 }}>{item.title}</h2>
                    <span className="price" style={{ fontSize: 'var(--fs-18)' }}>
                      {formatPrice((item.salePrice || item.price) * item.qty)}
                    </span>
                  </div>
                  <p className="text-muted mb-3" style={{ fontSize: 'var(--fs-14)' }}>{item.artisan}</p>

                  {/* Customization Metadata */}
                  {item.customization && (
                    <div style={{ 
                      background: 'rgba(122, 31, 31, 0.05)', 
                      padding: 'var(--space-3)', 
                      borderRadius: 'var(--border-radius-sm)', 
                      marginBottom: 'var(--space-4)',
                      fontSize: 'var(--fs-13)',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 4 }}>Customization Details:</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                        <span><strong>Pictures:</strong> {item.customization.picCount} ({item.customization.type})</span>
                        <span><strong>Size:</strong> {item.customization.size}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <strong>Frame:</strong>
                           <span style={{ 
                             width: 14, 
                             height: 14, 
                             borderRadius: '50%', 
                             backgroundColor: item.customization.frameColor,
                             border: '1px solid var(--border-light)' 
                           }} />
                           <span>{item.customization.frameColor}</span>
                        </div>
                        <span><strong>Uploads:</strong> {item.customization.imageCount} files</span>
                      </div>
                    </div>
                  )}

                  <div className="flex-between">
                    {/* Qty */}
                    <div className="cart-item-qty">
                      <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                      <span className="cart-qty-val">{item.qty}</span>
                      <button className="cart-qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    </div>

                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ color: 'var(--error)', gap: 6 }}
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button 
              className="btn btn-ghost btn-sm" 
              style={{ width: 'fit-content', color: 'var(--text-muted)' }}
              onClick={clearCart}
            >
              Clear Shopping Cart
            </button>
          </div>

          {/* Sidebar / Checkout */}
          <div className="card card-bordered" style={{ position: 'sticky', top: 'calc(var(--navbar-height) + 24px)', padding: 'var(--space-6)' }}>
            <h3 className="heading-sm mb-6">Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div className="flex-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex-between">
                <span className="text-muted">Shipping</span>
                {applicableShipping === 0 ? (
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
                ) : (
                  <span style={{ fontWeight: 500 }}>{formatPrice(applicableShipping)}</span>
                )}
              </div>
              <div className="divider" style={{ margin: 0 }} />
              <div className="flex-between" style={{ fontWeight: 'bold', fontSize: 'var(--fs-20)' }}>
                <span>Total</span>
                <span className="price">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-lg w-full" style={{ gap: 8 }} onClick={handleCheckout}>
              Proceed to Checkout <ArrowRight size={20} />
            </button>

            <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)' }}>
              <Link href="/shop" className="btn btn-outline w-full">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
