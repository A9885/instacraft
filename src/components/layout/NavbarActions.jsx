"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/store/CartContext";
import { useWishlist } from "@/store/WishlistContext";
import { useSearch } from "@/store/SearchContext";
import { useAuth } from "@/store/AuthContext";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import CartDrawer from "./CartDrawer";
import NavbarSearch from "./NavbarSearch";

export default function NavbarActions({ onMenuToggle, mobileOpen }) {
  const { isCartOpen, setIsCartOpen, itemCount } = useCart();
  const { count: wishCount } = useWishlist();
  const { open: openSearch } = useSearch();
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
        setProfileOpen(false);
        if (onMenuToggle && mobileOpen) onMenuToggle();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setIsCartOpen, onMenuToggle, mobileOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    router.push("/");
  };

  // Build avatar initials from displayName or email
  const getInitial = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (user?.phoneNumber) return "📱";
    return "?";
  };

  return (
    <>
      <div className="navbar-actions">
        {/* Search */}
        <button
          id="navbar-search-btn"
          className="navbar-icon-btn"
          onClick={openSearch}
          aria-label="Search products"
          title="Search"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16.5 16.5l4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Wishlist */}
        <Link
          href="/wishlist"
          id="navbar-wishlist-btn"
          className="navbar-icon-btn"
          aria-label={`Wishlist — ${wishCount} items`}
          title="Wishlist"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {wishCount > 0 && (
            <span className="navbar-icon-count" aria-live="polite">
              {wishCount}
            </span>
          )}
        </Link>

        {/* Cart */}
        <button
          id="navbar-cart-btn"
          className="navbar-icon-btn"
          onClick={() => setIsCartOpen(true)}
          aria-label={`Shopping cart — ${itemCount} items`}
          title="Cart"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M16 10a4 4 0 0 1-8 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {itemCount > 0 && (
            <span className="navbar-icon-count" aria-live="polite">
              {itemCount}
            </span>
          )}
        </button>

        {/* Auth Profile Button */}
        {loading ? (
          /* Skeleton shimmer while Firebase resolves auth state */
          <div
            className="navbar-avatar-skeleton"
            aria-hidden="true"
            id="navbar-profile-btn"
          />
        ) : user ? (
          /* ── Logged-in: avatar button + dropdown ── */
          <div
            className="navbar-profile-wrap"
            ref={dropdownRef}
            id="navbar-profile-btn"
          >
            <button
              className={`navbar-avatar-btn${profileOpen ? " open" : ""}`}
              onClick={() => setProfileOpen((v) => !v)}
              aria-label="Account menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              title={user.displayName || user.email || "My Account"}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Profile"}
                  className="navbar-avatar-photo"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="navbar-avatar-initial">{getInitial()}</span>
              )}
            </button>

            {/* Dropdown */}
            <div
              className={`navbar-profile-dropdown${profileOpen ? " open" : ""}`}
              role="menu"
              aria-label="Account options"
            >
              {/* User info header */}
              <div className="navbar-profile-header">
                <p className="navbar-profile-name">
                  {user.displayName || "Artisan Enthusiast"}
                </p>
                <p className="navbar-profile-email">
                  {user.email || user.phoneNumber || ""}
                </p>
              </div>

              <div className="navbar-profile-divider" />

              <Link
                href="/profile"
                className="navbar-profile-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
                My Profile
              </Link>

              <Link
                href="/wishlist"
                className="navbar-profile-item"
                role="menuitem"
                onClick={() => setProfileOpen(false)}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Wishlist
              </Link>

              {isAdmin && (
                <>
                  <div className="navbar-profile-divider" />
                  <Link
                    href="/admin/dashboard"
                    className="navbar-profile-item"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Admin Panel
                  </Link>
                </>
              )}

              <div className="navbar-profile-divider" />

              <button
                className="navbar-profile-item navbar-profile-logout"
                role="menuitem"
                onClick={handleLogout}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* ── Logged-out: plain icon → /login ── */
          <Link
            href="/login"
            id="navbar-profile-btn"
            className="navbar-icon-btn"
            aria-label="Sign in"
            title="Sign In"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </Link>
        )}

        <button
          className="navbar-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Search Overlay */}
      <NavbarSearch />

      {/* Cart Drawer */}
      {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
    </>
  );
}
