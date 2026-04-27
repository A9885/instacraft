"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "../../app/globals.css";
import {
  BarChart,
  Palette,
  Tag,
  Package,
  Ticket,
  Users,
  ShoppingBag,
  Settings,
  X,
  Monitor,
  ShoppingCart,
  Briefcase,
  LogOut,
  Megaphone,
  Layers,
  Image as ImageIcon
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <BarChart size={20} />,
  },
  { href: "/admin/orders", label: "Orders", icon: <ShoppingCart size={20} /> },
  { href: "/admin/products", label: "Products", icon: <Palette size={20} /> },
  { href: "/admin/hero-slider", label: "Hero Slider", icon: <Monitor size={20} /> },
  { href: "/admin/promo-banners", label: "Promo Banners", icon: <Layers size={20} /> },
  { href: "/admin/sale", label: "Sale Banner", icon: <Megaphone size={20} /> },
  { href: "/admin/custom-gallery", label: "Custom Gallery", icon: <ImageIcon size={20} /> },
  { href: "/admin/offers", label: "Offers", icon: <Tag size={20} /> },
  { href: "/admin/inventory", label: "Inventory", icon: <Package size={20} /> },
  { href: "/admin/coupons", label: "Coupons", icon: <Ticket size={20} /> },
  { href: "/admin/customers", label: "Customers", icon: <Users size={20} /> },
  { href: "/admin/wholesale", label: "Wholesale", icon: <Briefcase size={20} /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings size={20} /> },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLinkClick = () => {
    if (window.innerWidth <= 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      <div 
        className={`admin-sidebar-overlay${isOpen ? " open" : ""}`} 
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`admin-sidebar${isOpen ? " open" : ""}`}
        role="navigation"
        aria-label="Admin navigation"
      >
        <button
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        <Link href="/" onClick={handleLinkClick}>
          <div className="admin-sidebar-header">
            <span className="admin-sidebar-brand">Ishta Crafts Admin</span>
            <span className="admin-sidebar-sub">Management Portal</span>
          </div>
        </Link>

        <nav className="admin-sidebar-nav">
          <span className="admin-nav-section-label">Main</span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link${pathname === item.href ? " active" : ""}`}
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={handleLinkClick}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          <span className="admin-nav-section-label">Store</span>
          <Link
            href="/"
            className="admin-nav-link"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
          >
            <span aria-hidden="true">
              <ShoppingBag size={24} />
            </span>
            <span>View Store</span>
          </Link>
        </nav>
        <div className="admin-sidebar-footer">
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="admin-nav-link"
            style={{ 
              width: '100%', 
              textAlign: 'left', 
              border: 'none', 
              background: 'transparent',
              marginBottom: 'var(--space-4)',
              cursor: 'pointer'
            }}
          >
            <span aria-hidden="true">
              <LogOut size={24} />
            </span>
            <span>Logout</span>
          </button>
          <p
            className="text-muted"
            style={{ fontSize: "var(--fs-13)", color: "rgba(255,255,255,0.4)" }}
          >
            Ishta Crafts v1.0 — Admin
          </p>
        </div>
      </aside>
    </>
  );
}
