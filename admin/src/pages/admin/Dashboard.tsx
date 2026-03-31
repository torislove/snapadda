import { useState, useEffect, useRef } from 'react';
import {
  Building, Users, MessageSquare, ShieldCheck, TrendingUp,
  Plus, ArrowRight, Activity,
  Zap, BarChart3, Target, Layers, Contact2, Megaphone, Settings, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ─── Animated Counter ─── */
const AnimatedNumber = ({ target }: { target: number }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<any>(null);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    ref.current = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(ref.current); }
      else setVal(start);
    }, 30);
    return () => clearInterval(ref.current);
  }, [target]);
  return <>{val.toLocaleString()}</>;
};

/* ─── Metric Card ─── */
const MetricCard = ({ title, value, icon: Icon, color, gradient, sub, trend, link }: any) => (
  <Link to={link || '#'} style={{ textDecoration: 'none' }}>
    <div style={{
      background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
      border: `1px solid ${color}22`,
      borderRadius: '20px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      boxShadow: `0 4px 24px ${color}18`,
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px) scale(1.01)';
      (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${color}30`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)';
      (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${color}18`;
    }}
    >
      {/* Decorative glow orb */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${color}15`,
          border: `1px solid ${color}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
        }}>
          <Icon size={20} />
        </div>
        {trend && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            padding: '3px 10px', borderRadius: '99px',
            background: trend > 0 ? 'rgba(16,217,140,0.12)' : 'rgba(245,57,123,0.12)',
            color: trend > 0 ? '#10d98c' : '#f5397b',
            border: `1px solid ${trend > 0 ? 'rgba(16,217,140,0.2)' : 'rgba(245,57,123,0.2)'}`,
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="stat-number" style={{ color, marginBottom: '0.35rem' }}>
        <AnimatedNumber target={value} />
      </div>
      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '0.25rem', fontFamily: 'var(--font-body)' }}>{title}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{sub}</div>}
    </div>
  </Link>
);

/* ─── Activity Item ─── */
const ActivityRow = ({ icon: Icon, color, title, sub, time, badge }: any) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.8rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px',
      background: `${color}12`, border: `1px solid ${color}20`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, flexShrink: 0,
    }}>
      <Icon size={15} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>
    </div>
    {badge && (
      <span style={{
        fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
        padding: '2px 8px', borderRadius: '99px',
        background: badge === 'Answered' ? 'rgba(16,217,140,0.1)' : badge === 'Pending' ? 'rgba(255,140,66,0.1)' : 'rgba(155,89,245,0.1)',
        color: badge === 'Answered' ? '#10d98c' : badge === 'Pending' ? '#ff8c42' : '#9b59f5',
        border: `1px solid ${badge === 'Answered' ? 'rgba(16,217,140,0.2)' : badge === 'Pending' ? 'rgba(255,140,66,0.2)' : 'rgba(155,89,245,0.2)'}`,
        flexShrink: 0,
      }}>{badge}</span>
    )}
    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0 }}>{time}</div>
  </div>
);

/* ─── Quick Action Button ─── */
const QuickAction = ({ icon: Icon, label, color, to }: any) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
      padding: '1rem 0.75rem',
      background: 'var(--bg-glass)',
      border: `1px solid ${color}18`,
      borderRadius: '14px',
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      cursor: 'pointer',
      textAlign: 'center',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
      (e.currentTarget as HTMLElement).style.background = `${color}0a`;
      (e.currentTarget as HTMLElement).style.borderColor = `${color}35`;
      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${color}15`;
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLElement).style.background = 'var(--bg-glass)';
      (e.currentTarget as HTMLElement).style.borderColor = `${color}18`;
      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
    }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: `${color}15`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} />
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  </Link>
);

/* ─── Dashboard Main ─── */
const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const token = localStorage.getItem('snapadda_admin_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${API_URL}/admin/stats`, { headers })
      .then(r => r.json())
      .then(d => { if (d.status === 'success') setStats(d.data); })
      .catch(() => {
        setStats({ propertyCount: 6, leadCount: 24, inquiryCount: 12, verifiedCount: 4, activeCount: 5, pendingInquiries: 3, recentProperties: [], recentInquiries: [] });
      })
      .finally(() => setLoading(false));
  }, []);

  const METRICS = [
    {
      title: 'Total Properties', value: stats?.propertyCount || 0,
      icon: Building, color: '#9b59f5',
      gradient: ['rgba(155,89,245,0.12)', 'rgba(14,14,26,0.95)'],
      sub: `${stats?.activeCount || 0} active listings`, trend: 12, link: '/admin/properties',
    },
    {
      title: 'Active Leads', value: stats?.leadCount || 0,
      icon: Target, color: '#22d9e0',
      gradient: ['rgba(34,217,224,0.1)', 'rgba(14,14,26,0.95)'],
      sub: 'From all channels', trend: 8, link: '/admin/leads',
    },
    {
      title: 'Inquiries', value: stats?.inquiryCount || 0,
      icon: MessageSquare, color: '#f5397b',
      gradient: ['rgba(245,57,123,0.1)', 'rgba(14,14,26,0.95)'],
      sub: `${stats?.pendingInquiries || 0} awaiting response`, trend: -3, link: '/admin/contacts',
    },
    {
      title: 'Verified Properties', value: stats?.verifiedCount || 0,
      icon: ShieldCheck, color: '#10d98c',
      gradient: ['rgba(16,217,140,0.1)', 'rgba(14,14,26,0.95)'],
      sub: 'Trust-certified listings', trend: 5, link: '/admin/properties',
    },
  ];

  if (loading) return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ height: '28px', width: '240px', borderRadius: '8px', background: 'var(--bg-glass)', marginBottom: '8px' }} />
        <div style={{ height: '16px', width: '160px', borderRadius: '6px', background: 'var(--bg-glass)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: '140px', borderRadius: '20px', background: 'var(--bg-glass)', border: '1px solid var(--border)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--violet)', marginBottom: '0.25rem', fontFamily: 'var(--font-mono)' }}>
            ✦ Dashboard Overview
          </div>
          <h1 style={{ fontSize: '2rem', background: 'linear-gradient(135deg, #f0eeff 0%, #9b59f5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem', fontFamily: 'var(--font-heading)' }}>
            {greeting}, Admin
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Here's what's happening with SnapAdda today.
          </p>
        </div>
        <Link to="/admin/properties">
          <button className="btn btn-violet" style={{ gap: '8px' }}>
            <Plus size={16} /> Add Property
          </button>
        </Link>
      </div>

      {/* ── Metrics Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {METRICS.map(m => <MetricCard key={m.title} {...m} />)}
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Zap size={15} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Quick Actions</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
          <QuickAction icon={Building}   label="Add Property"   color="var(--violet)"  to="/admin/properties" />
          <QuickAction icon={MapPin}     label="New Region"     color="var(--cyan)"    to="/admin/cities" />
          <QuickAction icon={Users}      label="View Leads"     color="var(--emerald)" to="/admin/leads" />
          <QuickAction icon={Contact2}  label="CRM"            color="var(--rose)"    to="/admin/contacts" />
          <QuickAction icon={Megaphone}  label="Promotions"     color="var(--gold)"    to="/admin/promotions" />
          <QuickAction icon={Settings}   label="Settings"       color="var(--violet)"  to="/admin/settings" />
        </div>
      </div>

      {/* ── Activity Panels ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>

        {/* Recent Properties */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '1.5rem',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--violet)' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Recent Properties</h3>
            </div>
            <Link to="/admin/properties" style={{ fontSize: '0.75rem', color: 'var(--violet)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {(stats?.recentProperties || []).length > 0 ? stats.recentProperties.map((p: any, i: number) => (
            <ActivityRow
              key={i}
              icon={Building}
              color="var(--violet)"
              title={p.title}
              sub={p.location || 'No location'}
              time={p.price || 'N/A'}
              badge={p.isVerified ? 'Verified' : 'Pending'}
            />
          )) : (
            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
              <Layers size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No properties yet.</p>
              <Link to="/admin/properties">
                <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.75rem' }}>
                  <Plus size={12} /> Add First Listing
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Inquiries */}
        <div style={{
          background: 'var(--bg-glass)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '1.5rem',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} style={{ color: 'var(--rose)' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Recent Inquiries</h3>
            </div>
            <Link to="/admin/leads" style={{ fontSize: '0.75rem', color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={12} />
            </Link>
          </div>
          {(stats?.recentInquiries || []).length > 0 ? stats.recentInquiries.map((inq: any, i: number) => (
            <ActivityRow
              key={i}
              icon={MessageSquare}
              color="var(--rose)"
              title={inq.clientName || 'Anonymous'}
              sub={inq.question?.substring(0, 45) + '...'}
              time="Just now"
              badge={inq.status || 'Pending'}
            />
          )) : (
            <div style={{ padding: '2rem 0', textAlign: 'center' }}>
              <MessageSquare size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No inquiries yet.</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Platform Health Bar ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(155,89,245,0.08) 0%, rgba(34,217,224,0.05) 50%, rgba(245,200,66,0.05) 100%)',
        border: '1px solid rgba(155,89,245,0.15)',
        borderRadius: '20px',
        padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <BarChart3 size={15} style={{ color: 'var(--cyan)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Platform Health</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Active Listings', value: stats?.activeCount || 0, max: stats?.propertyCount || 1, color: 'var(--violet)' },
            { label: 'Pending Inquiries', value: stats?.pendingInquiries || 0, max: stats?.inquiryCount || 1, color: 'var(--rose)' },
            { label: 'Verified Rate', value: stats?.verifiedCount || 0, max: stats?.propertyCount || 1, color: 'var(--emerald)' },
          ].map(item => {
            const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
            return (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.color }}>{pct}%</span>
                </div>
                <div style={{ height: '4px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    borderRadius: '99px',
                    background: item.color,
                    boxShadow: `0 0 6px ${item.color}`,
                    transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
