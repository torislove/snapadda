import { useState, useEffect, useRef } from 'react';
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
  <div
    className={`card hover-lift animate-slide-up stagger-${Math.min(index + 1, 6)}`}
    style={{ borderTop: `3px solid ${color}`, padding: '1.5rem' }}
  >
    <a href={link || '#'} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: `${color}12`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
        }}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className={`metric-trend ${trend > 0 ? 'up' : 'down'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="metric-value"><AnimatedNumber target={value} /></div>
      <div className="metric-label">{title}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
    </a>
  </div>
);


/* ─── Elite Activity Item ─── */
const ActivityRow = ({ icon: Icon, color, title, sub, time, badge }: any) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.875rem',
    padding: '0.875rem 0',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    transition: 'background 0.15s',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px',
      background: `${color}10`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, flexShrink: 0,
    }}>
      <Icon size={18} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ 
        fontSize: '0.9rem', 
        fontWeight: 600, 
        color: 'var(--text-primary)', 
        marginBottom: '2px'
      }}>{title}</div>
      <div style={{ 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>{sub}</div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
      {badge && (
        <span style={{
          fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '2px 8px', borderRadius: '4px',
          background: badge === 'Answered' || badge === 'Verified' ? 'rgba(16,217,140,0.1)' : 'rgba(255,140,66,0.1)',
          color: badge === 'Answered' || badge === 'Verified' ? '#10d98c' : '#ff8c42',
          border: `1px solid ${badge === 'Verified' ? 'rgba(16,217,140,0.2)' : 'rgba(255,140,66,0.2)'}`,
        }}>{badge}</span>
      )}
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>{time}</div>
    </div>
  </div>
);

/* ─── Quick Action Elite ─── */
const QuickAction = ({ icon: Icon, label, color, to }: any) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <motion.div 
      whileHover={{ scale: 1.03, translateY: -3 }}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
        padding: '1.25rem 1rem',
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,0.06)`,
        borderRadius: '16px',
        cursor: 'pointer',
        textAlign: 'center',
        transition: 'border-color 0.3s',
      }}
    >
      <div style={{
        width: '46px', height: '46px', borderRadius: '13px',
        background: `${color}12`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 8px 16px ${color}08`,
      }}>
        <Icon size={22} />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.01em' }}>{label}</span>
    </motion.div>
  </Link>
);

/* ─── Dashboard Main ─── */
const AdminDashboard = () => {
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
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

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
          setStats({ propertyCount: 12, leadCount: 48, inquiryCount: 24, verifiedCount: 8, activeCount: 10, pendingInquiries: 5, totalLikes: 0, totalShares: 0, recentProperties: [], recentInquiries: [], recentLeads: [] });
        }
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const METRICS = [
    {
      title: 'Properties', value: stats?.propertyCount || 0,
      icon: Building, color: '#9b59f5',
      sub: `${stats?.activeCount || 0} Live Listings`, trend: 12, link: '/admin/properties',
    },
    {
      title: 'Active Leads', value: stats?.leadCount || 0,
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
      sub: 'Viral Reach', trend: 22, link: '/admin/properties',
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
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
      >

      {/* ── Header ── */}
      <div className="flex-row-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <ConnectivityBanner compact />
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}
          >
            ✦ STRATEGIC COMMAND HUB
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ fontSize: '2.75rem', lineHeight: 1.1, fontWeight: 900, background: 'linear-gradient(135deg, #fff 30%, var(--gold) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.75rem', fontFamily: 'var(--font-heading)', letterSpacing: '-0.04em' }}
          >
            {greeting}, snapadda_admin
          </motion.h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: 1.6 }}>
            Market dynamics are currently <strong style={{ color: health.allOk ? 'var(--emerald)' : '#f5c842' }}>{health.allOk ? 'Positive (+8.4%)' : 'Monitoring...'}</strong>. {health.allOk ? 'All estate systems are operational and performing at peak efficiency.' : 'Some services may be degraded. Check connectivity status.'}
          </p>
        </div>
        <Link to="/admin/properties">
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="btn btn-violet" style={{ gap: '10px', padding: '0.8rem 1.75rem', borderRadius: '14px', boxShadow: '0 10px 30px rgba(155,89,245,0.25)' }}
          >
            <Plus size={18} strokeWidth={3} /> Add Listing
          </motion.button>
        </Link>
      </div>

      {/* ── Metrics Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '1.5rem' }}>
        {METRICS.map((m, i) => <MetricCard key={m.title} index={i} {...m} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(310px, 100%), 1fr))', gap: '2rem' }}>
        {/* Engagement Analytics */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.01)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>Engagement Pulse</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily traffic & lead conversion metrics</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--violet)' }} />
                 <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>VIEWS</span>
               </div>
            </div>
          </div>
          <div style={{ height: '280px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--violet)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <Tooltip contentStyle={{ background: 'rgba(8,8,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', backdropFilter: 'blur(10px)' }} />
                <Area type="monotone" dataKey="views" stroke="var(--violet)" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Rapid Operations */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="glass-card" style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Zap size={20} style={{ color: 'var(--gold)' }} fill="var(--gold)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>Rapid Operations</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
            <QuickAction icon={Building} label="New Property" color="var(--violet)" to="/admin/properties" />
            <QuickAction icon={MapPin} label="Geo Zone" color="var(--cyan)" to="/admin/cities" />
            <QuickAction icon={Users} label="Lead Board" color="var(--emerald)" to="/admin/leads" />
            <QuickAction icon={Contact2} label="CRM" color="var(--rose)" to="/admin/contacts" />
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(245,200,66,0.05)', border: '1px solid rgba(245,200,66,0.1)', display: 'flex', gap: '12px' }}>
            <Activity size={20} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
              <strong>Tip:</strong> Holographic Command Hub is now active.
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Network Intelligence (Adaptive Carousel) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '2rem' }}>
        
        {/* Listings Pulse */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
          className="glass-card" style={{ padding: '1.75rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building size={20} style={{ color: 'var(--violet)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Listing Registry</h3>
            </div>
            <Link to="/admin/properties" style={{ fontSize: '0.8rem', color: 'var(--violet)', fontWeight: 700 }}>Manage All</Link>
          </div>
          
          <div className="holographic-carousel-container">
            {(stats?.recentProperties || []).length > 0 ? stats.recentProperties.map((p: any, i: number) => (
              <div key={i} className="holographic-carousel-item">
                <ActivityRow icon={Building} color="var(--violet)" title={p.title} sub={p.location} time={p.price || 'Market Val'} badge={p.isVerified ? 'Verified' : 'Pending'} />
              </div>
            )) : <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>No recent assets.</p>}
          </div>
        </motion.div>

        {/* Lead Stream */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
          className="glass-card" style={{ padding: '1.75rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Target size={20} style={{ color: 'var(--cyan)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Lead Stream</h3>
            </div>
            <Link to="/admin/leads" style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 700 }}>Open CRM</Link>
          </div>
          
          <div className="holographic-carousel-container">
            {(stats?.recentLeads || []).length > 0 ? stats.recentLeads.map((lead: any, i: number) => (
              <div key={i} className="holographic-carousel-item">
                <ActivityRow icon={Target} color="var(--cyan)" title={lead.name || 'Anonymous Lead'} sub={lead.message || 'No specific message'} time={new Date(lead.createdAt).toLocaleDateString()} badge={lead.status} />
              </div>
            )) : <p style={{ opacity: 0.5, fontSize: '0.8rem' }}>No recent leads.</p>}
          </div>
        </motion.div>
      </div>

      </motion.div>
    </>
  );
};

export default AdminDashboard;
