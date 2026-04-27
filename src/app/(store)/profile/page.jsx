'use client';
export const dynamic = "force-dynamic";

import { useWishlist } from '@/store/WishlistContext';
import { useCart } from '@/store/CartContext';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { User, Heart, Package, LogOut, Edit2, Globe, Smartphone, Mail, Key, ArrowRight } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { logout, updateDisplayName, resetPassword } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useState, useEffect, useMemo } from 'react';
import { auth } from '@/lib/firebase';

function ProfileContent() {
  const { count: wishlistCount } = useWishlist();
  const { items: cartItems, subtotal, clearCart } = useCart();
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Lightweight fetch for stats only
  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const token = await user?.getIdToken();
        if (!token) return;
        const res = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setOrders(data.orders || []);
      } catch (err) {
        console.error("Orders stats load failed:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrderStats();
  }, [user]);

  // Handle resurrected local cart when returning after checkout
  useEffect(() => {
    if (orders.length > 0 && cartItems.length > 0) {
      const paidOrders = orders.filter(o => o.payment.status === 'Paid');
      if (paidOrders.length === 0) return;
      
      // Optimization: Find the most recent order more efficiently
      const recentPaid = paidOrders.reduce((latest, o) => {
        const oTime = new Date(o.createdAt).getTime();
        const latestTime = new Date(latest.createdAt).getTime();
        return oTime > latestTime ? o : latest;
      }, paidOrders[0]);

      if (recentPaid) {
        const orderTime = new Date(recentPaid.createdAt).getTime();
        const now = Date.now();
        const diffMinutes = (now - orderTime) / (1000 * 60);
        
        // If order was placed within the last 15 minutes
        if (diffMinutes < 15) {
          // Strictly match cart items to the recent order items
          const isSameCart = cartItems.length === recentPaid.items.length &&
            cartItems.every(cItem => 
              recentPaid.items.some(oItem => 
                (oItem.slug === cItem.slug || oItem.id === cItem.id) && oItem.qty === cItem.qty
              )
            );

          if (isSameCart) {
            console.log("Stale cart detected after payment. Auto-clearing.");
            clearCart();
          }
        }
      }
    }
  }, [orders, cartItems, clearCart]);

  // Check all linked providers to see what's available
  const providers = user?.providerData?.map(p => p.providerId) || [];
  const hasPassword = providers.includes('password');
  const hasGoogle = providers.includes('google.com');
  const hasPhone = providers.includes('phone');

  let ProviderIcon = User;
  let providerFormat = 'Account';
  let canResetPassword = hasPassword;

  if (hasGoogle) { ProviderIcon = Globe; providerFormat = 'Google Linked'; }
  else if (hasPhone) { ProviderIcon = Smartphone; providerFormat = 'Phone Auth'; }
  else if (hasPassword) { ProviderIcon = Mail; providerFormat = 'Email/Password'; }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setIsSavingName(true);
    try {
      await updateDisplayName(newName.trim());
      setIsEditingName(false);
      // Give firebase a moment to propagate
      setTimeout(() => window.location.reload(), 500); 
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      await resetPassword(user.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsResetting(false);
    }
  };

  const activeOrders = useMemo(() => 
    orders.filter(o => ['Placed', 'Packed', 'Dispatched', 'In_Transit'].includes(o.logistics.status)),
    [orders]
  );

  const userData = useMemo(() => ({
    name: user?.displayName || 'Artisan Enthusiast',
    email: user?.email || user?.phoneNumber || 'Guest User',
    city: 'India',
    joinDate: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A',
    ordersCount: orders.length,
    totalSpent: orders
      .filter(o => o.payment.status === 'Paid')
      .reduce((acc, o) => acc + (o.totalAmount || o.items.reduce((a, i) => a + (i.price * i.qty), 0)), 0),
  }), [user, orders]);

  return (
    <div className="section" style={{ backgroundColor: 'var(--surface-sunken)', minHeight: '100vh' }}>
      <div className="container">
        <div className="profile-layout">
          {/* Profile card */}
          <aside>
            <div className="card mb-4">
              <div className="card-body" style={{ textAlign: 'center' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--space-4)',
                  fontSize: 32, color: 'var(--surface-white)', fontFamily: 'var(--font-heading)', fontWeight: 700
                }} aria-hidden="true">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
                <h1 className="heading-sm mb-1" style={{ fontSize: 'var(--fs-20)' }}>{userData.name}</h1>
                <p className="text-muted mb-4" style={{ wordBreak: 'break-all' }}>{userData.email}</p>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface-sunken)', padding: '4px 12px', borderRadius: '20px', fontSize: 'var(--fs-13)', marginBottom: '16px', color: 'var(--text-medium)' }}>
                  <ProviderIcon size={14} />
                  {providerFormat}
                </div>

                <div className="divider" />
                <div className="grid grid-2" style={{ gap: 'var(--space-4)', textAlign: 'center' }}>
                  <div>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-22)', fontWeight: 700, color: 'var(--primary)' }}>{userData.ordersCount}</span>
                    <span className="text-muted">Orders</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontFamily: 'var(--font-heading)', fontSize: 'var(--fs-22)', fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(userData.totalSpent)}</span>
                    <span className="text-muted">Spent</span>
                  </div>
                </div>
              </div>
            </div>
            
            <nav className="card mt-4 mb-4">
              <div className="card-body" style={{ padding: 'var(--space-3)' }}>
                {[
                  { href: '/profile', label: <span style={{display:'inline-flex', alignItems:'center', gap:8}}><User size={16} /> My Settings</span> },
                  { href: '/orders', label: <span style={{display:'inline-flex', alignItems:'center', gap:8}}><Package size={16} /> Order History</span> },
                  { href: '/wishlist', label: <span style={{display:'inline-flex', alignItems:'center', gap:8}}><Heart size={16} /> Wishlist <span style={{background:'var(--primary)',color:'var(--surface-white)',borderRadius:10,padding:'1px 7px',fontSize:11,fontWeight:700,marginLeft:2}}>{wishlistCount > 0 ? wishlistCount : ''}</span></span> },
                  ...(isAdmin ? [{ href: '/admin/dashboard', label: <span style={{display:'inline-flex', alignItems:'center', gap:8}}><Globe size={16} /> Admin Panel</span> }] : [])
                ].map(l => (
                  <Link key={l.href} href={l.href} className="admin-nav-link" style={{ color: l.href === '/admin/dashboard' ? 'var(--primary)' : 'var(--text-dark)', fontWeight: l.href === '/admin/dashboard' ? 600 : 400, borderRadius: 'var(--border-radius)', padding: 'var(--space-3) var(--space-4)' }}>
                    {l.label}
                  </Link>
                ))}
                <button 
                  onClick={handleLogout}
                  className="admin-nav-link" 
                  style={{ 
                    width: '100%', textAlign: 'left', cursor: 'pointer', border: 'none', background: 'transparent',
                    color: 'var(--error)', borderRadius: 'var(--border-radius)', padding: 'var(--space-3) var(--space-4)' 
                  }}
                >
                  <span style={{display:'inline-flex', alignItems:'center', gap:8}}><LogOut size={16} /> Logout</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main>
            {/* Account Settings */}
            <section className="mb-8" id="settings">
              <div className="flex-between mb-4">
                <h2 className="heading-md">Account Settings</h2>
              </div>
              <div className="card">
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Display Name Edit */}
                    <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Display Name</span>
                        {!isEditingName && (
                          <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-13)' }}>
                            <Edit2 size={12} /> Edit
                          </button>
                        )}
                      </label>
                      {isEditingName ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            type="text" 
                            className="form-input" 
                            value={newName} 
                            onChange={(e) => setNewName(e.target.value)} 
                            placeholder="Enter new name"
                          />
                          <button className="btn btn-primary btn-sm" onClick={handleSaveName} disabled={isSavingName}>
                            {isSavingName ? 'Saving...' : 'Save'}
                          </button>
                          <button className="btn btn-ghost btn-sm" onClick={() => { setIsEditingName(false); setNewName(user?.displayName || ''); }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-body">{userData.name}</p>
                      )}
                    </div>

                    {/* Email / Phone info */}
                    <div style={{ paddingBottom: canResetPassword ? '16px' : '0', borderBottom: canResetPassword ? '1px solid var(--border-light)' : 'none' }}>
                       <label className="form-label" style={{ marginBottom: '8px' }}>Contact Information</label>
                       <p className="text-body">{userData.email}</p>
                    </div>

                    {/* Password Reset */}
                    {canResetPassword && (
                      <div>
                        <label className="form-label" style={{ marginBottom: '8px' }}>Security</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <button 
                            className="btn btn-outline btn-sm" 
                            onClick={handlePasswordReset} 
                            disabled={isResetting || resetSent}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                          >
                            <Key size={14} />
                            {isResetting ? 'Sending Link...' : resetSent ? 'Check your email!' : 'Reset Password'}
                          </button>
                          {resetSent && <span style={{ color: 'var(--success)', fontSize: 'var(--fs-13)' }}>A password reset link was sent to your email.</span>}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            </section>

            {/* Orders Summary Card */}
            <section className="mb-8">
              <div className="flex-between mb-4">
                <h2 className="heading-md">My Orders</h2>
              </div>
              <Link href="/orders" style={{ textDecoration: 'none', display: 'block' }}>
                <div className="card order-card-hover" style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer', border: '1px solid var(--border-light)', background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)' }}>
                  <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={24} color="#fff" />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-dark)' }}>Order History & Tracking</h3>
                        <p className="text-muted" style={{ fontSize: 'var(--fs-13)', margin: '2px 0 0' }}>
                          {loadingOrders ? 'Loading...' : (
                            orders.length === 0 ? 'No orders yet — start shopping!' : (
                              <>
                                {orders.length} total order{orders.length !== 1 ? 's' : ''}
                                {activeOrders.length > 0 && <span style={{ color: 'var(--primary)', fontWeight: 600 }}> · {activeOrders.length} active</span>}
                              </>
                            )
                          )}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
                      View All Orders <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </section>

            {/* Wishlist moved to /wishlist page */}
            <section>
              <div className="card">
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Heart size={24} color="var(--primary)" />
                    <div>
                      <h2 className="heading-sm" style={{ margin: 0 }}>My Wishlist</h2>
                      <p className="text-muted" style={{ fontSize: 'var(--fs-13)', margin: 0 }}>
                        {wishlistCount > 0 ? `${wishlistCount} saved ${wishlistCount === 1 ? 'item' : 'items'}` : 'No saved items yet'}
                      </p>
                    </div>
                  </div>
                  <Link href="/wishlist" className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    View My Wishlist
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute redirectTo="/">
      <ProfileContent />
    </ProtectedRoute>
  );
}
