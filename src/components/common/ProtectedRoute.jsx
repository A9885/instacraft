'use client';

import { useAuth } from '@/store/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Wraps any page/component with an auth guard.
 * 
 * Props:
 *   - adminOnly: if true, also checks for admin email
 *   - redirectTo: where to send unauthenticated users (default: '/login')
 */
export default function ProtectedRoute({ children, adminOnly = false, redirectTo = '/login' }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const searchParams = new URLSearchParams();
      searchParams.set('redirect', window.location.pathname + window.location.search);
      router.replace(`${redirectTo}?${searchParams.toString()}`);
      return;
    }

    if (adminOnly && !isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, loading, router, adminOnly, redirectTo]);

  // Still loading auth state — show nothing to avoid flash
  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted, #888)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid #f6921e', borderTopColor: 'transparent',
            animation: 'spin 0.7s linear infinite', margin: '0 auto 12px'
          }} />
          <p style={{ fontSize: 14 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Unauthenticated or non-admin — render nothing while redirecting
  if (!user) return null;
  if (adminOnly && !isAdmin) return null;

  return children;
}
