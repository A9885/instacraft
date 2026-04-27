'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';
import { CheckCircle, Clock, Package, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import AdminPagination from '@/components/admin/AdminPagination';

export default function AdminOrdersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!authLoading) {
      if (user && isAdmin) {
        fetchOrders(currentPage);
      } else {
        setError("Unauthorized Admin Access.");
        setLoading(false);
      }
    }
  }, [currentPage, authLoading, user, isAdmin]);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      if (!token) throw new Error("Security blockage: Token missing.");

      const response = await fetch(`/api/admin/orders?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setOrders(data.orders || []);
      setTotalItems(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("Security blockage: Token missing.");

      // Optimistic UI lock
      setOrders(orders.map(o => o._id === orderId ? { ...o, logistics: { ...o.logistics, status: newStatus } } : o));

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      
      fetchOrders(currentPage);
    } catch (err) {
      alert("Failed to securely update status: " + err.message);
      fetchOrders(currentPage); // Revert on failure
    }
  };

  const markAsPaid = async (orderId) => {
    try {
      const token = await user?.getIdToken();
      if (!token) throw new Error("Security blockage: Token missing.");

      const response = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'Paid' })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      fetchOrders(currentPage);
    } catch (err) {
      alert("Failed to mark as paid: " + err.message);
    }
  };

  // derived filtered state
  const filteredOrders = orders.filter(order => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDate = new Date(order.createdAt);
    const isToday = orderDate >= today;
    const status = order.logistics?.status || 'Placed';

    if (activeFilter === 'Placed Today') return status === 'Placed' && isToday;
    if (activeFilter === 'In Packing') return status === 'Packed';
    if (activeFilter === 'Dispatched') return status === 'Dispatched';
    if (activeFilter === 'Past Pending') return (status === 'Placed' || status === 'Packed') && !isToday;
    if (activeFilter === 'Wholesale') return !!order.wholesaleToken;
    if (activeFilter === 'Retail') return !order.wholesaleToken;
    
    return true; // 'All'
  });

  if (loading) return <div className="p-8">Authenticating and loading secure orders...</div>;
  if (error) return <div className="p-8 text-danger" style={{ color: 'red' }}>Access Error: {error}</div>;

  return (
    <div className="admin-page-container fade-in p-6" style={{ padding: 'var(--space-6)' }}>
      <div className="flex-between flex-between-responsive mb-8" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 className="heading-lg" style={{ fontSize: '24px', fontWeight: 'bold' }}>Orders & Ticketing Workflow</h1>
        <div className="badge" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '16px', fontWeight: '500' }}>
          {filteredOrders.length} {activeFilter === 'All' ? 'Total' : activeFilter} Orders
        </div>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
         {['All', 'Placed Today', 'In Packing', 'Dispatched', 'Past Pending', 'Retail', 'Wholesale'].map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                 padding: '8px 16px',
                 borderRadius: '20px',
                 fontSize: '14px',
                 fontWeight: 500,
                 border: activeFilter === f ? 'none' : '1px solid var(--border-medium)',
                 backgroundColor: activeFilter === f ? 'var(--primary)' : 'var(--surface)',
                 color: activeFilter === f ? 'var(--surface-white)' : 'var(--text-dark)',
                 cursor: 'pointer',
                 whiteSpace: 'nowrap',
                 transition: 'all 0.2s',
                 boxShadow: activeFilter === f ? 'var(--shadow-sm)' : 'none'
              }}
            >
               {f}
            </button>
         ))}
      </div>

      <div className="card overflow-hidden" style={{ background: 'var(--surface-white)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--surface-table-header)', borderBottom: '1px solid var(--border-medium)' }}>
              <tr>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>Order ID</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>Gateway Status</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>Line Items</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>Destination</th>
                <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>Ticketing Verification</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                     No operations pending for filter: {activeFilter}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isWholesale = !!order.wholesaleToken;
                  return (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: isWholesale ? 'var(--wholesale-bg)' : 'transparent' }}>
                    
                    {/* ID & Date */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                        {isWholesale && <span style={{ backgroundColor: 'var(--primary)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px', fontWeight: 700 }}>WHOLESALE</span>}
                        {order.paymentMethod === 'COD' && <span style={{ backgroundColor: '#D97706', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px', fontWeight: 700 }}>COD</span>}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4 }}>
                        {new Date(order.createdAt).toLocaleString()}
                      </div>
                    </td>

                    {/* Gateway Payment View */}
                    <td style={{ padding: '16px' }}>
                      {order.payment.status === 'Paid' ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--success-bg)', color: 'var(--success-text)', padding: '4px 10px', borderRadius: 16, fontSize: 13, fontWeight: 500 }}>
                          <CheckCircle size={14}/> Paid
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--warning-bg)', color: 'var(--warning-text)', padding: '4px 10px', borderRadius: 16, fontSize: 13, fontWeight: 500 }}>
                          <Clock size={14}/> Pending
                        </div>
                      )}
                      {order.payment.paymentId && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 8 }}>Trx: {order.payment.paymentId}</div>}
                    </td>

                    {/* Items Object Map */}
                    <td style={{ padding: '16px' }}>
                      {order.items.map(i => (
                        <div key={i.id} style={{ fontSize: '14px', marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>{i.qty}x</span> {i.title}
                        </div>
                      ))}
                      
                      {/* Coupon Info */}
                      {order.coupon && order.coupon.discount > 0 && (
                        <div style={{ marginTop: 8, padding: '4px 8px', backgroundColor: 'var(--success-bg)', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '12px', color: 'var(--success-text)', fontWeight: 600 }}>
                          Coupon: {order.coupon.code} (-{formatPrice(order.coupon.discount)})
                        </div>
                      )}

                      <div style={{ fontWeight: 600, marginTop: 8, fontSize: '14px' }}>
                        Total Value: {formatPrice(order.totalAmount || order.items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0))}
                      </div>
                    </td>

                    {/* Shipping Pipeline Data */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{order.shippingAddress?.name || 'N/A'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 2 }}>
                        {order.shippingAddress?.address}<br/>
                        {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                      </div>
                    </td>

                    {/* Ticketing Action Validation */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: 8, flexDirection: 'column', maxWidth: 200 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: 4 }}>
                          Status: <span style={{ color: 'var(--primary)', marginLeft: 4 }}>
                            {(() => {
                              let s = order.logistics?.status?.replace("_", " ") || 'Pending';
                              if (order.paymentMethod === 'Online') {
                                if (order.logistics.status === 'Placed') s = 'Verify';
                                if (order.logistics.status === 'Packed') s = 'Awaiting Dispatch';
                                if (order.logistics.status === 'Dispatched') s = 'Transit';
                              }
                              return s;
                            })()}
                          </span>
                        </div>
                        
                        {order.paymentMethod === 'Online' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                             {order.logistics.status === 'Placed' && (
                               <button 
                                 onClick={() => updateStatus(order._id, 'Packed')} 
                                 style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', borderRadius: 4, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                               >
                                  [ ] Proceed and Verify
                               </button>
                             )}
                             {order.logistics.status === 'Packed' && (
                               <button 
                                 onClick={() => updateStatus(order._id, 'Dispatched')} 
                                 style={{ padding: '6px 12px', background: 'var(--text-dark)', color: 'white', borderRadius: 4, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                               >
                                  [ ] Dispatch
                               </button>
                             )}
                             {['Dispatched', 'In_Transit', 'Delivered'].includes(order.logistics.status) && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ padding: '6px 12px', background: 'var(--surface-sunken)', border: '1px solid var(--border-medium)', color: 'var(--text-medium)', borderRadius: 4, fontSize: 13, textAlign: 'center', fontWeight: 500 }}>
                                    {order.logistics.status === 'Delivered' ? 'Delivered' : 'Dispatched (Tracking via Shiprocket)'}
                                  </div>

                                  {order.logistics.awbCode && (
                                    <div className="timeline-awb-box" style={{ marginTop: '4px', padding: '10px 12px', boxShadow: 'none', background: 'var(--surface-raised)' }}>
                                      <div style={{ flex: 1 }}>
                                        <p className="timeline-awb-label" style={{ fontSize: '9px', marginBottom: '2px' }}>Carrier Tracking ID</p>
                                        <span className="timeline-awb-value" style={{ fontSize: '13px', display: 'block' }}>{order.logistics.awbCode}</span>
                                      </div>
                                      <a 
                                        href={`https://shiprocket.co/tracking/${order.logistics.awbCode}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="timeline-track-link" 
                                        style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                                      >
                                        Track <ExternalLink size={12} />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                             {/* Display Timestamps securely fetched from DB */}
                             <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                               {order.logistics.timestamps?.packedAt && <div>Packed: {new Date(order.logistics.timestamps.packedAt).toLocaleDateString()}</div>}
                               {order.logistics.timestamps?.dispatchedAt && <div>Transited: {new Date(order.logistics.timestamps.dispatchedAt).toLocaleDateString()}</div>}
                             </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {order.logistics.status === 'Placed' && (
                              <button 
                                onClick={() => updateStatus(order._id, 'Packed')} 
                                style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', borderRadius: 4, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                              >
                                [ ] Verify & Pack
                              </button>
                            )}
                            {order.logistics.status === 'Packed' && (
                              <button 
                                onClick={() => updateStatus(order._id, 'Dispatched')} 
                                style={{ padding: '6px 12px', background: 'var(--text-dark)', color: 'white', borderRadius: 4, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                              >
                                [ ] Dispatch
                              </button>
                            )}
                            {['Dispatched', 'In_Transit', 'Delivered'].includes(order.logistics.status) && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ padding: '6px 12px', background: 'var(--surface-sunken)', border: '1px solid var(--border-medium)', color: 'var(--text-medium)', borderRadius: 4, fontSize: 13, textAlign: 'center', fontWeight: 500 }}>
                                  {order.logistics.status === 'Delivered' ? 'Delivered' : 'Dispatched (Tracking via Shiprocket)'}
                                </div>
                                
                                {order.logistics.awbCode && (
                                  <div className="timeline-awb-box" style={{ marginTop: '4px', padding: '10px 12px', boxShadow: 'none', background: 'var(--surface-raised)' }}>
                                    <div style={{ flex: 1 }}>
                                      <p className="timeline-awb-label" style={{ fontSize: '9px', marginBottom: '2px' }}>Carrier Tracking ID</p>
                                      <span className="timeline-awb-value" style={{ fontSize: '13px', display: 'block' }}>{order.logistics.awbCode}</span>
                                    </div>
                                    <a 
                                      href={`https://shiprocket.co/tracking/${order.logistics.awbCode}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="timeline-track-link" 
                                      style={{ padding: '4px 8px', fontSize: '11px', whiteSpace: 'nowrap' }}
                                    >
                                      Track <ExternalLink size={12} />
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                              {order.logistics.timestamps?.packedAt && <div>Packed: {new Date(order.logistics.timestamps.packedAt).toLocaleDateString()}</div>}
                              {order.logistics.timestamps?.dispatchedAt && <div>Dispatched: {new Date(order.logistics.timestamps.dispatchedAt).toLocaleDateString()}</div>}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '0 16px var(--space-4) 16px' }}>
          <AdminPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
