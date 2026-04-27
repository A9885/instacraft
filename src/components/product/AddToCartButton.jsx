'use client';

import { useState } from 'react';
import { useCart } from '@/store/CartContext';

export default function AddToCartButton({ product, qty = 1, disabled = false, className = '' }) {
  const { addItem, updateQty, removeItem, items } = useCart();
  const [added, setAdded] = useState(false);
  
  const productId = product.id || product._id;
  const cartItem = items.find(i => (i.id || i._id) === productId);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  function handleAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleIncrement(e) {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock && qtyInCart >= product.stock) {
      alert("Cannot add more than available stock.");
      return;
    }
    updateQty(productId, qtyInCart + 1);
  }

  function handleDecrement(e) {
    e.preventDefault();
    e.stopPropagation();
    if (qtyInCart <= 1) {
      removeItem(productId);
    } else {
      updateQty(productId, qtyInCart - 1);
    }
  }

  if (disabled) {
    return (
      <button className={`btn btn-ghost btn-sm ${className}`} disabled aria-label="Out of stock">
        Out of Stock
      </button>
    );
  }

  // If item is already in cart, show a quantity counter
  if (qtyInCart > 0) {
    return (
      <div 
        className={`counter-pill ${className}`}
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          background: 'var(--surface-sunken)', 
          borderRadius: 'var(--border-radius)', 
          border: '1px solid var(--border-color)',
          height: 36, // Fits nicely with other small buttons
        }}
        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
      >
        <button 
          onClick={handleDecrement}
          aria-label="Decrease quantity"
          style={{ width: 32, height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', fontWeight: 'bold' }}
        >
          -
        </button>
        <span style={{ minWidth: 28, textAlign: 'center', fontSize: 'var(--fs-13)', fontWeight: 600, color: 'var(--primary)' }}>
          {qtyInCart}
        </span>
        <button 
          onClick={handleIncrement}
          aria-label="Increase quantity"
          style={{ width: 32, height: '100%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', fontWeight: 'bold' }}
        >
          +
        </button>
      </div>
    );
  }

  return (
    <button
      id={`add-to-cart-${productId}`}
      className={`btn btn-primary btn-sm ${className}`}
      onClick={handleAdd}
      aria-label={added ? 'Added to cart!' : `Add ${product.title} to cart`}
    >
      {added ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Added!
        </span>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add
        </span>
      )}
    </button>
  );
}
