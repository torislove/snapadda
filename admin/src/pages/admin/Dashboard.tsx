import { useState, useEffect } from 'react';
import { Building, Users, MessageSquare, ShieldCheck, TrendingUp, Clock, Plus, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const StatCard = ({ title, value, icon: Icon, color, sub }: any) => (
  <div style={{
    backgroundColor: 'var(--bg-secondary)',
    padding: 'var(--spacing-xl)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-md)',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '12px',
      background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: color, flexShrink: 0,
    }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{sub}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/admin/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setStats(data.data);
      })
      .catch(() => {
        // Fallback stats
        setStats({ propertyCount: 6, leadCount: 24, inquiryCount: 12, verifiedCount: 4, activeCount: 5, pendingInquiries: 3, recentProperties: [], recentInquiries: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 'var(--spacing-xl)' }}>
        <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: '120px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', animation: 'pulse 1.5s infinite' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>Dashboard</h1>
        <Link to="/admin/properties">
          <Button size="sm"><Plus size={16} style={{ marginRight: '4px' }} /> Add Property</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xxl)' }}>
        <StatCard title="Total Properties" value={stats?.propertyCount || 0} icon={Building} color="#c9a84c" sub={`${stats?.activeCount || 0} active`} />
        <StatCard title="Active Leads" value={stats?.leadCount || 0} icon={Users} color="#7c9473" sub="From all sources" />
        <StatCard title="Inquiries" value={stats?.inquiryCount || 0} icon={MessageSquare} color="#5b7ea1" sub={`${stats?.pendingInquiries || 0} pending`} />
        <StatCard title="Verified" value={stats?.verifiedCount || 0} icon={ShieldCheck} color="#2ecc71" sub="Trusted badges" />
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>

        {/* Recent Properties */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-lg)', color: 'var(--accent-gold)' }}>
            <TrendingUp size={20} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Recent Properties</h3>
          </div>
          {(stats?.recentProperties || []).length > 0 ? stats.recentProperties.map((prop: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx < stats.recentProperties.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{prop.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prop.location}</div>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)' }}>{prop.price || 'N/A'}</span>
            </div>
          )) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: 'var(--spacing-lg) 0' }}>No properties yet. Add your first listing!</div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-lg)', color: '#5b7ea1' }}>
            <Clock size={20} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Recent Inquiries</h3>
          </div>
          {(stats?.recentInquiries || []).length > 0 ? stats.recentInquiries.map((inq: any, idx: number) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx < stats.recentInquiries.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{inq.clientName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inq.question?.substring(0, 40)}...</div>
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600,
                padding: '2px 8px', borderRadius: '10px',
                background: inq.status === 'Answered' ? 'rgba(46,204,113,0.15)' : 'rgba(243,156,18,0.15)',
                color: inq.status === 'Answered' ? '#2ecc71' : '#f39c12',
              }}>{inq.status}</span>
            </div>
          )) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: 'var(--spacing-lg) 0' }}>No inquiries yet.</div>
          )}
          <Link to="/admin/leads" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'var(--spacing-md)', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
