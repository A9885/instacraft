'use client';

import { useState } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import AdminMobileHeader from '@/components/layout/AdminMobileHeader';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import '../../app/globals.css';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="admin-layout">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        <div className="admin-content">
          <AdminMobileHeader onMenuToggle={() => setSidebarOpen(true)} />
          <div className="admin-page">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
