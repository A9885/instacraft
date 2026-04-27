export const dynamic = "force-dynamic";

import { getDashboardAnalytics } from '@/lib/api-server';
import { formatPrice, formatNumber, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Banknote, Package, Users, Palette, Calendar, AlertTriangle, ArrowUp, ArrowDown, Ticket, Check } from 'lucide-react';


export const metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const data = await getDashboardAnalytics();

  const stats = [
    { label: 'Total Revenue',  value: formatPrice(data.totalRevenue),      change: `${data.revenueChange >= 0 ? '+' : ''}${data.revenueChange}%`,   up: data.revenueChange >= 0,   icon: <Banknote size={20} />, iconClass: 'stat-icon-secondary' },
    { label: 'Total Orders',   value: formatNumber(data.totalOrders),      change: `${data.ordersChange >= 0 ? '+' : ''}${data.ordersChange}%`,     up: data.ordersChange >= 0,    icon: <Package  size={20} />, iconClass: 'stat-icon-primary'   },
    { label: 'Customers',      value: formatNumber(data.totalCustomers),   change: `${data.customersChange >= 0 ? '+' : ''}${data.customersChange}%`, up: data.customersChange >= 0,   icon: <Users    size={20} />, iconClass: 'stat-icon-accent'    },
    { label: 'Products',       value: data.totalProducts,                  change: `${data.lowStockCount} low stock`,                               up: data.lowStockCount === 0,  icon: <Palette  size={20} />, iconClass: 'stat-icon-success'   },
  ];

  const statusColors = {
    delivered:  'badge-success',
    shipped:    'badge-secondary',
    processing: 'badge-warning',
    cancelled:  'badge-error',
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="dashboard-header mb-8">
        <div>
          <span className="overline">Overview</span>
          <h1 className="heading-lg">Dashboard</h1>
        </div>
        <div className="dashboard-date">
          <Calendar size={16} />
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* KPI Stats — 4 cols → 2 cols (tablet) → 1 col (mobile) */}
      <div className="dashboard-stats-grid mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="stat-card">
            <span className="stat-label">{stat.label}</span>
            <div className="stat-card-row">
              <div className={`stat-icon ${stat.iconClass}`}>{stat.icon}</div>
              <span className="stat-value">{stat.value}</span>
            </div>
            <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>
              {stat.label === 'Products' ? (
                stat.up ? <Check size={16} /> : <AlertTriangle size={16} />
              ) : (
                stat.up ? <ArrowUp size={16} /> : <ArrowDown size={16} />
              )} {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="data-table-wrap mb-8">
        <div className="data-table-header">
          <h2 className="heading-sm">Recent Orders</h2>
          <Link href="/admin/orders" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th className="dashboard-col-hide-sm">Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="dashboard-col-hide-sm">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                    No recent orders to display.
                  </td>
                </tr>
              ) : (
                data.recentOrders.map(order => {
                  // Final defensive fallback layer
                  const orderId = order.id || order._id;
                  const customerName = order.customer || order.shipping_name || order.shippingName || "Customer";
                  const displayAmount = order.amount ?? order.total_amount ?? order.totalAmount;
                  const displayStatus = order.status || order.logistics_status || order.logisticsStatus || "Placed";
                  const displayDate = order.date || order.created_at || order.createdAt || order.placed_at;

                  return (
                    <tr key={orderId}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-13)' }}>#{orderId}</td>
                      <td>{customerName}</td>
                      <td className="dashboard-col-hide-sm truncate" style={{ maxWidth: 160 }}>{order.product || "Standard Item"}</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(displayAmount)}</td>
                      <td>
                        <span className={`badge ${statusColors[displayStatus.toLowerCase()] || 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                          {displayStatus.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="dashboard-col-hide-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(displayDate)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions — 3 cols → 1 col (mobile) */}
      <div>
        <h2 className="heading-sm mb-4">Quick Actions</h2>
        <div className="dashboard-actions-grid">
          {[
            { href: '/admin/products',  label: 'Manage Products',  icon: <Palette size={20} />, desc: `${data.totalProducts} products listed` },
            { href: '/admin/inventory', label: 'Check Inventory',  icon: <Package size={20} />, desc: `${data.lowStockCount} low stock alerts` },
            { href: '/admin/coupons',   label: 'Manage Coupons',   icon: <Ticket  size={20} />, desc: 'Create & edit discount codes' },
          ].map(action => (
            <Link key={action.href} href={action.href} className="card" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="card-body" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <span className="dashboard-action-icon" aria-hidden="true">{action.icon}</span>
                <div>
                  <h3 className="subheading">{action.label}</h3>
                  <p className="text-muted">{action.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
