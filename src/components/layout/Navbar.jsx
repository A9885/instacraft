"use client";

import Link from "next/link";
import NavbarActions from "./NavbarActions";
import { Image, Palette, Gift, ShoppingBag, Sparkles } from "lucide-react";
import { PotteryIcon } from "@/components/common/Icons";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

import { getCategories } from "@/lib/api";

export default function Navbar({ staticContent, staticCategories }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [desktopShopOpen, setDesktopShopOpen] = useState(false);
  const [categories, setCategories] = useState(staticCategories || []);
  const pathname = usePathname();
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  const handleMobileLogout = async () => {
    setMobileOpen(false);
    await logout();
    router.push("/");
  };

  const getCategoryIcon = (iconName, size = 20) => {
    const icons = {
      wall_hanging: <Image size={size} />,
      table_top: <PotteryIcon size={size} />,
      combo: <Palette size={size} />,
      gift: <Gift size={size} />,
      custom: <Sparkles size={size} />,
    };
    return icons[iconName] || null;
  };

  const shopCategories = categories.map((cat) => ({
    href: `/shop/${cat.slug}`,
    label: cat.label,
    icon: getCategoryIcon(cat.icon),
    desc: cat.description,
  }));

  useEffect(() => {
    if (staticCategories?.length > 0) return;
    const fetchCats = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchCats();
  }, [staticCategories]);

  // Close mobile menu if window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setMobileOpen(false);
        setMobileShopOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setMobileShopOpen(false);
    setDesktopShopOpen(false);
  }, [pathname]);

  return (
    <header className="navbar" role="banner">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link
          href="/"
          className="navbar-brand"
          aria-label="Ishta Crafts — Home"
        >
          <span className="navbar-brand-text">
            Ishta Crafts
            <span className="navbar-brand-sub">Artisan Marketplace</span>
          </span>
        </Link>

        {/* Mobile Menu */}
        <div
          className={`navbar-mobile-overlay${mobileOpen ? " open" : ""}`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`navbar-mobile-menu${mobileOpen ? " open" : ""}`}
          role="dialog"
          aria-label="Mobile navigation"
        >
          <div className="flex-between mb-6">
            <Link
              href="/"
              className="navbar-brand"
              onClick={() => setMobileOpen(false)}
            >
              <span
                className="navbar-brand-text"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "var(--fs-20)",
                  color: "var(--primary)",
                }}
              >
                Ishta Crafts
              </span>
            </Link>
            <button
              className="navbar-icon-btn"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
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
          <div className="flex-col gap-1">
            <Link
              href="/"
              className={`nav-link ${pathname === "/" ? " active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>

            {/* Mobile Shop Dropdown */}
            <div className="mobile-nav-dropdown">
              <button
                className={`nav-link w-full flex-between ${pathname.startsWith("/shop") ? " active" : ""}`}
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
              >
                All Products
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{
                    transform: mobileShopOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div
                className={`mobile-nav-dropdown-content ${mobileShopOpen ? "open" : ""}`}
              >
                {shopCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className={`nav-link ${pathname === cat.href ? " active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontSize: "var(--fs-14)",
                      paddingLeft: "var(--space-8)",
                    }}
                  >
                    ↳ {cat.label}
                  </Link>
                ))}
              </div>
            </div>

            {[
              { href: "/deals", label: "Deals" },
              { href: "/about", label: "Our Story" },
              { href: "/contact", label: "Contact Us" },
            ].map((l) => {
              const isActive =
                pathname === l.href ||
                (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`nav-link ${isActive ? " active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              );
            })}

            {/* ── Auth Section ── */}
            <div className="navbar-mobile-auth-section">
              {loading ? (
                <div className="navbar-mobile-auth-skeleton" aria-hidden="true" />
              ) : user ? (
                <>
                  <div className="navbar-mobile-user-badge">
                    <div className="navbar-mobile-user-avatar">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" referrerPolicy="no-referrer" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      ) : (
                        <span>{user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : "?"}</span>
                      )}
                    </div>
                    <div>
                      <p className="navbar-mobile-user-name">{user.displayName || "Artisan Enthusiast"}</p>
                      <p className="navbar-mobile-user-email">{user.email || user.phoneNumber || ""}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className={`nav-link${pathname === "/profile" ? " active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    My Account
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      className="nav-link"
                      onClick={() => setMobileOpen(false)}
                      style={{ color: "var(--primary)", fontWeight: 700 }}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/wishlist"
                    className="nav-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <button
                    className="nav-link navbar-mobile-signout-btn"
                    onClick={handleMobileLogout}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`nav-link${pathname === "/login" ? " active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className={`nav-link${pathname === "/signup" ? " active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="navbar-nav" aria-label="Main navigation">
          <Link
            href="/"
            className={`nav-link ${pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>

          {/* Shop Dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setDesktopShopOpen(true)}
            onMouseLeave={() => setDesktopShopOpen(false)}
          >
            <button
              className={`nav-dropdown-toggle ${pathname.startsWith("/shop") ? "active" : ""}`}
              aria-haspopup="true"
              aria-expanded={desktopShopOpen}
              onClick={() => setDesktopShopOpen(!desktopShopOpen)}
            >
              Shop
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  transform: desktopShopOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              >
                <path
                  d="M2 4l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              className={`nav-dropdown-menu ${desktopShopOpen ? "open" : ""}`}
              role="menu"
            >
              {shopCategories.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className={`nav-dropdown-item ${pathname === cat.href ? "active" : ""}`}
                  role="menuitem"
                >
                  <span className="nav-dropdown-item-icon" aria-hidden="true">
                    {cat.icon}
                  </span>
                  <span>
                    <span style={{ display: "block", fontWeight: 600 }}>
                      {cat.label}
                    </span>
                    <span
                      style={{
                        fontSize: "var(--fs-13)",
                        color: "var(--text-muted)",
                        fontWeight: 400,
                      }}
                    >
                      {cat.desc}
                    </span>
                  </span>
                </Link>
              ))}
              <div
                style={{
                  borderTop: "1px solid var(--border-light)",
                  marginTop: "var(--space-2)",
                  paddingTop: "var(--space-2)",
                }}
              >
                <Link
                  href="/shop"
                  className={`nav-dropdown-item ${pathname === "/shop" ? "active" : ""}`}
                  role="menuitem"
                >
                  <span className="nav-dropdown-item-icon" aria-hidden="true">
                    <ShoppingBag size={20} />
                  </span>
                  <span style={{ fontWeight: 600 }}>All Products</span>
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/deals"
            className={`nav-link ${pathname === "/deals" ? "active" : ""}`}
          >
            Deals
          </Link>
          <Link
            href="/about"
            className={`nav-link ${pathname === "/about" ? "active" : ""}`}
          >
            About
          </Link>
          <Link
            href="/contact"
            className={`nav-link ${pathname === "/contact" ? "active" : ""}`}
          >
            Contact
          </Link>
        </nav>

        {/* Actions (Search/Wishlist/Cart/Profile) — Client */}
        <NavbarActions
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          mobileOpen={mobileOpen}
        />
      </div>
    </header>
  );
}
