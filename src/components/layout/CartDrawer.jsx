"use client";

import Link from "next/link";
import { useCart } from "@/store/CartContext";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useRouter } from "next/navigation";

export default function CartDrawer({ onClose }) {
  const { items, removeItem, updateQty, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    onClose(); // close drawer
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  return (
    <>
      <div
        className="cart-drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="cart-drawer-header">
          <h2 className="heading-sm">
            My Cart {items.length > 0 && `(${items.length})`}
          </h2>
          <button
            className="navbar-icon-btn cart-close-btn"
            onClick={onClose}
            aria-label="Close cart"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div
              style={{ textAlign: "center", paddingBlock: "var(--space-16)" }}
            >
              <div
                style={{
                  marginBottom: "var(--space-4)",
                  display: "inline-flex",
                }}
              >
                <ShoppingBag size={48} />
              </div>
              <p
                className="heading-sm"
                style={{ marginBottom: "var(--space-2)" }}
              >
                Your cart is empty
              </p>
              <p className="text-muted">
                Discover handcrafted treasures and fill it up!
              </p>
              <Link
                href="/shop"
                className="btn btn-primary mt-6"
                onClick={onClose}
              >
                Shop Now
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item._id || item.id} className="cart-item">
                <Image
                  src={item.images?.[0] || "/images/placeholder.webp"}
                  alt={item.title}
                  width={80}
                  height={80}
                  className="cart-item-img"
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="product-card-title" style={{ marginBottom: 4 }}>
                    {item.title}
                  </p>
                  {item.artisan && (
                    <p className="text-muted" style={{ fontSize: 'var(--fs-13)' }}>
                      {item.artisan}
                    </p>
                  )}

                  {/* Customization Metadata */}
                  {item.customization && (
                    <div style={{ 
                      background: 'rgba(122, 31, 31, 0.04)', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      marginBlock: '8px',
                      fontSize: '11px',
                      borderLeft: '2px solid var(--primary)'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
                        <span><strong>Pics:</strong> {item.customization.picCount} ({item.customization.type})</span>
                        <span><strong>Size:</strong> {item.customization.size}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <strong>Color:</strong>
                           <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.customization.frameColor }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex-between mt-2">
                    <div className="cart-item-qty">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="cart-qty-val">{item.qty}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span
                      className="price"
                      style={{ fontSize: "var(--fs-16)" }}
                    >
                      {formatPrice((item.salePrice || item.price) * item.qty)}
                    </span>
                  </div>
                </div>
                <button
                  className="navbar-icon-btn btn-icon-sm"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.title} from cart`}
                  style={{ color: "var(--error)", flexShrink: 0 }}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <polyline
                      points="3 6 5 6 21 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M19 6l-1 14H6L5 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 11v6M14 11v6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="flex-between mb-4">
              <span className="text-body-sm" style={{ fontWeight: 600 }}>
                Subtotal
              </span>
              <span className="price">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-muted mb-4" style={{ textAlign: "center" }}>
              Free shipping on orders above ₹999
            </p>
            <Link
              href="/shop"
              className="btn btn-outline w-full mb-3"
              onClick={onClose}
              style={{ display: "flex" }}
            >
              Continue Shopping
            </Link>
            <button
              className="btn btn-primary w-full"
              style={{ display: "flex" }}
              onClick={handleCheckout}
            >
              Checkout — {formatPrice(subtotal)}
            </button>
            <button
              className="btn btn-ghost btn-sm mt-3 w-full"
              onClick={clearCart}
              style={{ color: "var(--text-muted)", display: "flex" }}
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
