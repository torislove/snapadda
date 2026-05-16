import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building, Users, MessageSquare, ShieldCheck,
  Plus, Activity,
  Zap, Target, Contact2, MapPin, Heart, Share2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { WelcomeOverlay } from '../../components/ui/WelcomeOverlay';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';
import { useServerHealth } from '../../hooks/useServerHealth';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/* ─── Mock Chart Data ─── */
const CHART_DATA = [
  { name: 'Mon', leads: 4, views: 24 },
  { name: 'Tue', leads: 7, views: 42 },
  { name: 'Wed', leads: 5, views: 38 },
  { name: 'Thu', leads: 12, views: 65 },
  { name: 'Fri', leads: 9, views: 48 },
  { name: 'Sat', leads: 15, views: 82 },
  { name: 'Sun', leads: 11, views: 54 },
];

/* ─── Animated Counter ─── */
const AnimatedNumber = ({ target }: { target: number }) => {
  const [val, setVal] = useState(0);
  const ref = useRef<any>(null);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / 40) || 1;
    ref.current = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(ref.current); }
      else setVal(start);
    }, 30);
    return () => clearInterval(ref.current);
  }, [target]);
  return <>{val.toLocaleString()}</>;
};

/* ─── Elite Metric Card ─── */
const MetricCard = ({ title, value, icon: Icon, color, sub, trend, link, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="glass-3d hover-glow"
    style={{ 
      padding: '1.75rem', 
      border: `1px solid ${color}33`,
      background: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, ${color}05 100%)`
    }}
  >
    <Link to={link || '#'} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '14px',
          background: `${color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
          filter: `drop-shadow(0 0 10px ${color}44)`
        }}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className={`metric-trend ${trend > 0 ? 'up' : 'down'}`} style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '10px', background: trend > 0 ? 'rgba(16,217,140,0.1)' : 'rgba(245,57,123,0.1)', color: trend > 0 ? '#10d98c' : '#f5397b' }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="metric-value" style={{ fontSize: '2.25rem', fontWeight: 950, color: 'white', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
        <AnimatedNumber target={value} />
      </div>
      <div className="metric-label" style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.7 }}>
        {title}
      </div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '8px', fontWeight: 600 }}>{sub}</div>}
    </Link>
  </motion.div>
);


/* ─── Elite Activity Item ─── */
const ActivityRow = ({ icon: Icon, color, title, sub, time, badge }: any) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    padding: '0.875rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.15s',
  }}>
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px',
      background: `${color}10`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, flexShrink: 0,
    }}>
      <Icon size={16} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ 
        fontSize: '0.85rem', 
        fontWeight: 600, 
        color: 'white', 
        marginBottom: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>{title}</div>
      <div style={{ 
        fontSize: '0.7rem', 
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>{sub}</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
      {badge && (
        <span style={{
          fontSize: '0.55rem', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase',
          padding: '2px 6px', borderRadius: '4px',
          background: badge === 'Answered' || badge === 'Verified' ? 'rgba(16,217,140,0.1)' : 'rgba(255,140,66,0.1)',
          color: badge === 'Answered' || badge === 'Verified' ? '#10d98c' : '#ff8c42',
          border: `1px solid ${badge === 'Verified' ? 'rgba(16,217,140,0.2)' : 'rgba(255,140,66,0.2)'}`,
        }}>{badge}</span>
      )}
      <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{time}</div>
    </div>
  </div>
);

/* ─── Quick Action Elite ─── */
const QuickAction = ({ icon: Icon, label, color, to }: any) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <motion.div 
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="glass-3d"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
        padding: '1.25rem',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: '24px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'all 0.3s',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px',
        background: `${color}12`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} />
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
    </motion.div>
  </Link>
);

/* ─── Dashboard Main ─── */
const AdminDashboard = () => {
  const { t } = useTranslation();
  const { adminUser } = useAdminAuth();
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(CHART_DATA);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const health = useServerHealth(30000);

  useEffect(() => {
    // Show welcome only once per session
    const hasShown = sessionStorage.getItem('snapadda_welcome_shown');
    if (!hasShown && adminUser) {
      setShowWelcome(true);
      sessionStorage.setItem('snapadda_welcome_shown', 'true');
    }

    const hour = new Date().getHours();
    if (hour < 12) setGreeting(t('dashboard.welcome', 'Good Morning'));
    else if (hour < 17) setGreeting(t('dashboard.welcome', 'Good Afternoon'));
    else setGreeting(t('dashboard.welcome', 'Good Evening'));

    const token = localStorage.getItem('snapadda_admin_token');
    const headers: any = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const cachedStats = sessionStorage.getItem('snapadda_admin_stats');
    if (cachedStats) {
      const parsed = JSON.parse(cachedStats);
      setStats(parsed);
      setLoading(false);
      if (parsed.marketIntelligence?.heatmap) {
        setChartData(parsed.marketIntelligence.heatmap.map((item: any) => ({
          name: item._id || 'Unknown', views: item.count || 0
        })));
      }
    }

    fetch(`${API_URL}/admin/stats`, { headers })
      .then(r => r.json())
      .then(d => { 
        if (d.status === 'success') {
          setStats(d.data);
          sessionStorage.setItem('snapadda_admin_stats', JSON.stringify(d.data));
          if (d.data.marketIntelligence?.heatmap) {
            const newChartData = d.data.marketIntelligence.heatmap.map((item: any) => ({
              name: item._id || 'Unknown',
              views: item.count || 0
            }));
            if (newChartData.length > 0) setChartData(newChartData);
          }
        } 
      })
      .catch(() => {
        if (!cachedStats) {
          setStats({ propertyCount: 0, leadCount: 0, inquiryCount: 0, verifiedCount: 0, activeCount: 0, pendingInquiries: 0, totalLikes: 0, totalShares: 0, recentProperties: [], recentInquiries: [], recentLeads: [] });
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const METRICS = [
    {
      title: t('nav.properties', 'Properties'), value: stats?.propertyCount || 0,
      icon: Building, color: '#9b59f5',
      sub: `${stats?.activeCount || 0} ${t('dashboard.stats.active', 'Live Listings')}`, trend: 12, link: '/admin/properties',
    },
    {
      title: t('nav.leads', 'Active Leads'), value: stats?.leadCount || 0,
      icon: Target, color: '#22d9e0',
      sub: 'Qualifying Prospects', trend: 8, link: '/admin/leads',
    },
    {
      title: 'Inquiries', value: stats?.inquiryCount || 0,
      icon: MessageSquare, color: '#f5397b',
      sub: `${stats?.pendingInquiries || 0} Unanswered`, trend: -3, link: '/admin/contacts',
    },
    {
      title: 'Verified', value: stats?.verifiedCount || 0,
      icon: ShieldCheck, color: '#10d98c',
      sub: 'Trust Badge Assets', trend: 5, link: '/admin/properties',
    },
    {
      title: 'Pending Submissions', value: stats?.pendingSubmissions || 0,
      icon: Activity, color: '#f5c842',
      sub: 'Awaiting Review', trend: 0, link: '/admin/properties',
    },
    {
      title: 'Total Likes', value: stats?.totalLikes || 0,
      icon: Heart, color: '#f5397b',
      sub: 'User Favorites', trend: 15, link: '/admin/properties',
    },
    {
      title: 'Total Shares', value: stats?.totalShares || 0,
      icon: Share2, color: '#22d9e0',
      sub: 'Viral Reach', trend: 22, link: '/admin/engagement',
    },
    {
      title: 'Total Views', value: stats?.totalViews || 0,
      icon: Activity, color: '#f5c842',
      sub: 'Platform Visibility', trend: 31, link: '/admin/engagement',
    },
  ];

if (loading) return (
    <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ height: '100px', width: '300px', borderRadius: '20px', background: 'var(--bg-glass)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: '160px', borderRadius: '24px', background: 'var(--bg-glass)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {showWelcome && adminUser && (
        <WelcomeOverlay 
          adminName={adminUser.name} 
          adminAvatar={adminUser.avatar} 
          onComplete={() => setShowWelcome(false)} 
        />
      )}
      
      <div className="dashboard-container">

      {/* ── Header ── */}
      <div className="flex-row-mobile-stack dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <ConnectivityBanner compact />
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.25rem', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}
          >
            ✦ DASHBOARD
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ fontSize: '2.5rem', lineHeight: 1, fontWeight: 900, background: 'linear-gradient(135deg, #fff 30%, var(--gold) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.04em' }}
          >
            {greeting}, {adminUser?.name?.split(' ')[0] || 'Admin'}
          </motion.h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '450px', lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-flex', width: '8px', height: '8px', borderRadius: '50%', background: health.allOk ? 'var(--emerald)' : '#f5c842', boxShadow: health.allOk ? '0 0 12px var(--emerald)' : '0 0 12px #f5c842', animation: 'pulse 2s infinite' }} />
            System is <strong style={{ color: health.allOk ? 'var(--emerald)' : '#f4d03f' }}>{health.allOk ? 'Live' : 'Degraded'}</strong>. Pipeline activity is stable.
          </p>
        </div>
        <Link to="/admin/properties">
          <motion.button 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn btn-violet" style={{ gap: '10px', padding: '0.85rem 2rem', borderRadius: '16px', boxShadow: '0 15px 40px rgba(155,89,245,0.25)', fontWeight: 900, fontSize: '0.9rem' }}
          >
            <Plus size={20} strokeWidth={3} /> Post Property
          </motion.button>
        </Link>
      </div>

      {/* ── Metrics Grid ── */}
      <div className="metrics-grid">
        {METRICS.map((m, i) => <MetricCard key={m.title} index={i} {...m} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem' }}>
        {/* Engagement Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-3d-heavy" style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Traffic Pulse</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily unique platform interactions</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--violet)', boxShadow: '0 0 10px var(--violet)' }} />
              <span style={{ fontSize: '0.7rem', color: 'white', fontWeight: 800, letterSpacing: '0.05em' }}>VIEWS</span>
            </div>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--violet)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={10} fontWeight={700} />
                <Tooltip contentStyle={{ background: 'rgba(8,8,18,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', backdropFilter: 'blur(20px)' }} />
                <Area type="monotone" dataKey="views" stroke="var(--violet)" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rapid Operations */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-3d-heavy" style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <Zap size={22} style={{ color: 'var(--gold)', filter: 'drop-shadow(0 0 8px var(--gold-glow))' }} fill="var(--gold)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 950, color: 'white', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rapid Portal</h3>
          </div>
          <div className="quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <QuickAction icon={Building} label="Listings" color="var(--violet)" to="/admin/properties" />
            <QuickAction icon={MapPin} label="Territory" color="var(--cyan)" to="/admin/cities" />
            <QuickAction icon={Users} label="Prospects" color="var(--emerald)" to="/admin/leads" />
            <QuickAction icon={Contact2} label="Comm Hub" color="var(--rose)" to="/admin/contacts" />
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '20px', background: 'rgba(244,208,63,0.04)', border: '1px solid rgba(244,208,63,0.1)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Activity size={20} style={{ color: 'var(--gold)', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, fontWeight: 600 }}>
              SnapAdda Console is optimized for <strong style={{ color: 'white' }}>Professional Management</strong>.
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Network Intelligence (Adaptive Carousel) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '1.5rem' }}>
        
        {/* Listings Pulse */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
          className="glass-3d" style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Building size={18} style={{ color: 'var(--violet)' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, textTransform: 'uppercase', color: 'white' }}>Recent Assets</h3>
            </div>
            <Link to="/admin/properties" style={{ fontSize: '0.75rem', color: 'var(--violet)', fontWeight: 900, textDecoration: 'none' }}>VIEW ALL</Link>
          </div>
          
          <div className="activity-stream">
            {(stats?.recentProperties || []).length > 0 ? stats.recentProperties.map((p: any, i: number) => (
              <ActivityRow key={i} icon={Building} color="var(--violet)" title={p.title} sub={p.location} time={p.price || 'Market Val'} badge={p.isVerified ? 'Verified' : 'Draft'} />
            )) : <p style={{ opacity: 0.4, fontSize: '0.75rem', textAlign: 'center', padding: '2rem 0' }}>No recent asset activity detected.</p>}
          </div>
        </motion.div>

        {/* Lead Stream */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
          className="glass-3d" style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Target size={18} style={{ color: 'var(--cyan)' }} />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, textTransform: 'uppercase', color: 'white' }}>Lead Registry</h3>
            </div>
            <Link to="/admin/leads" style={{ fontSize: '0.75rem', color: 'var(--cyan)', fontWeight: 900, textDecoration: 'none' }}>CRM HUB</Link>
          </div>
          
          <div className="activity-stream">
            {(stats?.recentLeads || []).length > 0 ? stats.recentLeads.map((lead: any, i: number) => (
              <ActivityRow key={i} icon={Target} color="var(--cyan)" title={lead.name || 'Inquirer'} sub={lead.message || 'Intent expressed'} time={new Date(lead.createdAt).toLocaleDateString()} badge={lead.status} />
            )) : <p style={{ opacity: 0.4, fontSize: '0.75rem', textAlign: 'center', padding: '2rem 0' }}>Lead stream is currently quiet.</p>}
          </div>
        </motion.div>
      </div>

      </div>
    </>
  );
};

export default AdminDashboard;
