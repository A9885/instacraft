'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Copy, Check, Trash2, Edit, Eye } from 'lucide-react';

export default function WholesaleDashboard() {
  const { user } = useAuth();
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCatalogs();
    }
  }, [user]);

  async function fetchCatalogs() {
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/admin/wholesale-catalogs', {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setCatalogs(data.catalogs);
      }
    } catch (err) {
      console.error("Error fetching catalogs:", err);
      alert("Failed to load catalogs");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(catalog) {
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/admin/wholesale-catalogs/${catalog._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ isActive: !catalog.isActive })
      });
      
      if (!res.ok) throw new Error('Failed to update');
      
      // Update local state without refreshing the page
      setCatalogs(catalogs.map(c => 
        c._id === catalog._id ? { ...c, isActive: !catalog.isActive } : c
      ));
    } catch (err) {
      console.error(err);
      alert('Failed to update catalog status');
    }
  }

  async function handleDelete(catalog) {
    if (!confirm('Are you absolutely sure you want to delete this catalog? This cannot be undone.')) return;
    
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/admin/wholesale-catalogs/${catalog._id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      // Remove from local state
      setCatalogs(catalogs.filter(c => c._id !== catalog._id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete catalog');
    }
  }

  const handleCopyLink = (token) => {
    const link = `${window.location.origin}/wholesale/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="admin-page">
      <div className="flex-between flex-between-responsive mb-8">
        <div>
          <span className="overline">B2B Sales</span>
          <h1 className="heading-lg">Wholesale Catalogs</h1>
        </div>
        <Link href="/admin/wholesale/create" className="btn btn-primary">
          + Create Catalog
        </Link>
      </div>

      <div className="data-table-wrap">
        <div className="data-table-header">
          <h2 className="heading-sm">All Catalogs</h2>
          <span className="text-muted">{catalogs.length} total</span>
        </div>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading catalogs...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Catalog Name</th>
                <th>Products</th>
                <th>Shareable Link</th>
                <th>Status</th>
                <th>Security lock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {catalogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                    No wholesale catalogs created yet.
                  </td>
                </tr>
              ) : catalogs.map(catalog => (
                <tr key={catalog._id}>
                  <td>
                    <div>
                      <Link href={`/admin/wholesale/${catalog._id}`} className="link-hover" style={{ fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {catalog.name}
                      </Link>
                      {catalog.expiryDate && (
                        <p style={{ fontSize: 'var(--fs-13)', color: 'var(--error)' }}>
                          Exp: {formatDate(catalog.expiryDate)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">
                      {catalog.products?.length || 0} items
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleCopyLink(catalog.accessToken)}
                      className="btn btn-outline btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      {copiedToken === catalog.accessToken ? <Check size={14} /> : <Copy size={14} />}
                      {copiedToken === catalog.accessToken ? "Copied!" : "Copy Link"}
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${catalog.isActive ? 'badge-success' : 'badge-neutral'}`}>
                      {catalog.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ 
                      background: catalog.lockedToDevice ? 'var(--warning-bg)' : 'transparent', 
                      color: catalog.lockedToDevice ? 'var(--warning-text)' : 'var(--text-muted)',
                      border: catalog.lockedToDevice ? '1px solid var(--warning-border)' : '1px solid var(--border-medium)',
                      fontWeight: 600
                    }}>
                      {catalog.lockedToDevice ? 'Locked to Customer' : 'Unclaimed'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Link href={`/admin/wholesale/${catalog._id}`} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} /> Preview
                      </Link>
                      <button className="btn btn-outline btn-sm" onClick={() => handleToggle(catalog)}>
                        {catalog.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button className="btn btn-sm" onClick={() => handleDelete(catalog)} style={{ background: 'var(--error-bg)', color: 'var(--error)', border: '1.5px solid var(--error-bg)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
