"use client";

import { Menu } from "lucide-react";
import Link from "next/link";

export default function AdminMobileHeader({ onMenuToggle }) {
  return (
    <header className="admin-mobile-header">
      <button
        onClick={onMenuToggle}
        className="admin-toggle-btn"
        aria-label="Open administration menu"
      >
        <Menu size={24} />
      </button>

      <Link href="/admin/dashboard" className="admin-sidebar-brand" style={{ fontSize: 'var(--fs-16)', color: 'var(--primary)' }}>
        Ishta Admin
      </Link>

      <div style={{ width: 40 }} /> {/* Spacer for symmetry */}
    </header>
  );
}
