'use client';
export const dynamic = "force-dynamic";

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { getCustomers } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Users, Check, Banknote, MapPin, Search } from 'lucide-react';
import AdminPagination from '@/components/admin/AdminPagination';

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "joinDate", direction: "desc" });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;

  useEffect(() => {
    async function loadCustomers() {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const data = await getCustomers(token, true, currentPage, limit);
        setCustomers(data.customers || []);
        setTotalItems(data.total || 0);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [user, currentPage]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const activeCount = customers.filter(c => c.status === 'active').length;

  const processedCustomers = useMemo(() => {
    return [...customers]
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase()) ||
          c.city.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
          selectedStatus === "all" || c.status === selectedStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [customers, search, selectedStatus, sortConfig]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="admin-page flex-center" style={{ minHeight: '60vh' }}>
        <p className="text-muted">Loading customers...</p>
      </div>
    );
  }

  const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
  const newCustomersCount = customers.filter(c => new Date(c.joinDate) >= thirtyDaysAgo).length;
  const customerGrowth = customers.length > 0 ? Math.round((newCustomersCount / customers.length) * 100) : 0;

  return (
    <div className="admin-page">
      <div className="flex-between flex-between-responsive mb-8">
        <div>
          <span className="overline">Buyer Management</span>
          <h1 className="heading-lg">Customers</h1>
        </div>
      </div>
 
      {/* Summary */}
      <div className="grid grid-3 mb-8">
        <div className="stat-card">
          <span className="stat-label">Total Customers</span>
          <div className="stat-card-row">
            <div className="stat-icon stat-icon-accent"><Users size={20} /></div>
            <span className="stat-value">{customers.length}</span>
          </div>
          <div className="stat-change up">+{customerGrowth}% growth</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Customers</span>
          <div className="stat-card-row">
            <div className="stat-icon stat-icon-success"><Check size={20} /></div>
            <span className="stat-value">{activeCount}</span>
          </div>
          <div className="stat-change up">+{Math.round((activeCount/customers.length)*100 || 0)}% active</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <div className="stat-card-row">
            <div className="stat-icon stat-icon-secondary"><Banknote size={20} /></div>
            <span className="stat-value">{formatPrice(totalRevenue)}</span>
          </div>
          <div className="stat-change up">+0% growth</div>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-wrap">
        <div className="data-table-header" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div className="flex-between flex-between-responsive w-full mb-2">
            <h2 className="heading-sm">All Customers</h2>
            <span className="text-muted">{processedCustomers.length} results</span>
          </div>

          <div className="flex-responsive" style={{ width: '100%', marginBottom: 'var(--space-4)' }}>
            {/* Search */}
            <div className="search-bar" style={{ maxWidth: 300, flex: 1 }}>
              <Search size={16} />
              <input
                type="search"
                placeholder="Search by name, email or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search customers"
              />
            </div>

            {/* Status Filter */}
            <div className="search-bar" style={{ maxWidth: 220 }}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0 4px",
                  fontSize: "var(--fs-14)",
                  color: "var(--text-main)",
                  outline: "none",
                  width: "100%",
                }}
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th
                  onClick={() => requestSort("name")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Customer
                  </div>
                </th>
                <th
                  onClick={() => requestSort("city")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Location
                  </div>
                </th>
                <th
                  onClick={() => requestSort("orders")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Orders
                  </div>
                </th>
                <th
                  onClick={() => requestSort("totalSpent")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Total Spent
                  </div>
                </th>
                <th
                  onClick={() => requestSort("joinDate")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Joined
                  </div>
                </th>
                <th
                  onClick={() => requestSort("status")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    Status
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {processedCustomers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--surface-white)', fontWeight: 700, fontSize: 'var(--fs-14)', flexShrink: 0,
                      }} aria-hidden="true">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 'var(--fs-14)' }}>{c.name}</p>
                        <p style={{ fontSize: 'var(--fs-13)', color: 'var(--text-muted)' }}>{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--fs-14)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} />{c.city}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.orders}</span>
                    <span style={{ fontSize: 'var(--fs-13)', color: 'var(--text-muted)' }}> orders</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(c.totalSpent)}</td>
                  <td style={{ fontSize: 'var(--fs-13)', color: 'var(--text-muted)' }}>{formatDate(c.joinDate)}</td>
                  <td>
                    <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ textTransform: 'capitalize' }}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
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
