"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// Map slugs to human-readable labels
const LABEL_MAP = {
  shop: "Shop",
  product: "Product",
  deals: "Deals",
  about: "Our Story",
  contact: "Contact Us",
  profile: "My Account",
  wishlist: "My Wishlist",
  cart: "Cart",
  checkout: "Checkout",
  login: "Sign In",
  signup: "Create Account",
  "wall-hangings": "Wall Hangings",
  "table-top-mount": "Table Top / Décors",
  "wall-table-combo": "Wall & Table Combo",
  "gift-items": "Gift Items",
  "custom-creations": "Custom Creations",
};

function toLabel(segment) {
  if (LABEL_MAP[segment]) return LABEL_MAP[segment];
  // Convert slug to Title Case
  return segment
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Don't show on homepage
  if (!pathname || pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [
    { label: "Home", href: "/" },
    ...segments.map((seg, i) => ({
      label: toLabel(seg),
      href: "/" + segments.slice(0, i + 1).join("/"),
    })),
  ];

  return (
    <nav
      className="breadcrumb-bar"
      aria-label="Breadcrumb"
    >
      <div className="container">
        <ol className="breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li
                key={crumb.href}
                className="breadcrumb-item"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {isLast ? (
                  <span className="breadcrumb-current" aria-current="page" itemProp="name">
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link href={crumb.href} className="breadcrumb-link" itemProp="item">
                      <span itemProp="name">{crumb.label}</span>
                    </Link>
                    <span className="breadcrumb-sep" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </>
                )}
                <meta itemProp="position" content={String(i + 1)} />
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
