import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Heart, User, Settings, LogOut, Star, MapPin, ShieldCheck, Phone, RefreshCw, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFavorites, fetchUserQuestions } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import Logo from '../components/Logo';
import ContactModal from '../components/ContactModal';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Dashboard home tab
function DashboardHome({ user, stats, recent, setModalOpen }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem 0' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
              {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'Elite'}! ✦
            </h2>
            <p style={{ color: 'var(--txt-muted)', fontSize: '0.95rem' }}>Your digital real estate registry is up-to-date.</p>
          </div>
          <div className="glass-heavy" style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 10px var(--gold)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gold)' }}>PREMIUM ACCOUNT</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Saved Assets', val: stats.favoritesCount, icon: <Heart size={20} />, color: 'var(--gold)' },
            { label: 'Market Interest', val: stats.engagementCount || 0, icon: <Star size={20} />, color: '#10d98c' },
            { label: 'Active Inquiries', val: stats.inquiriesCount, icon: <MessageSquare size={20} />, color: '#9b59f5' },
          ].map((s, i) => (
            <div key={i} className="glass-heavy" style={{ padding: '1.75rem', borderRadius: '24px', border: `1px solid ${s.color}22`, background: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, ${s.color}08 100%)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--txt-muted)', letterSpacing: '0.1em' }}>KPI {i+1}</div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>{s.val}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Main Chart */}
          <div className="glass-heavy" style={{ padding: '2.5rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white' }}>Engagement Intelligence</h3>
              <span style={{ fontSize: '0.65rem', color: 'var(--txt-muted)', fontWeight: 700, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px' }}>ROLLING 7 DAYS</span>
            </div>
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Mon', views: 4 }, { name: 'Tue', views: 12 }, { name: 'Wed', views: 8 },
                  { name: 'Thu', views: 18 }, { name: 'Fri', views: 14 }, { name: 'Sat', views: 25 }, { name: 'Sun', views: 20 }
                ]}>
                  <defs>
                    <linearGradient id="colorViewsNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="views" stroke="var(--gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorViewsNew)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recently Viewed */}
          <div className="glass-heavy" style={{ padding: '2rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={18} style={{ color: 'var(--gold)' }} /> Recently Tracked
            </h3>
            {recent && recent.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {recent.map((p, i) => (
                  <Link key={i} to={`/property/${p._id || p.id}`} style={{ textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', transition: 'transform 0.2s' }} 
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                    <img src={p.image || (p.images && p.images[0])} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--txt-muted)' }}>{p.location}</div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--gold)' }}>
                      Rs.{p.price >= 10000000 ? (p.price / 10000000).toFixed(2) + ' Cr' : (p.price / 100000).toFixed(2) + ' L'}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>No recent history detected.</p>
                <Link to="/" style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>Start Exploring Assets</Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="hero-btn hero-btn-primary" onClick={() => navigate('/')} style={{ padding: '1rem 2.5rem' }}>
            Market Explorer <Star size={18} />
          </button>
          <button className="hero-btn hero-btn-outline" onClick={() => setModalOpen(true)} style={{ padding: '1rem 2.5rem' }}>
            Agent Assistance <Phone size={18} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Favorites tab
function Favorites({ saved, loading }) {
  const { t } = useTranslation();
  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center' }}><RefreshCw className="animate-spin" /> Loading favorites...</div>;
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('dashboard.saved')}</h2>
      {saved.length > 0 ? (
        <div className="properties-grid">
          {saved.map(p => <PropertyCard key={p._id || p.id} {...p} />)}
        </div>
      ) : (
        <div className="empty-state">
          <Heart size={48} />
          <h3>No saved properties yet</h3>
          <p>Explore and save properties you love.</p>
          <Link to="/" className="hero-btn hero-btn-primary" style={{ marginTop: '0.5rem' }}>Explore Now</Link>
        </div>
      )}
    </div>
  );
}

// Inquiries tab
function Inquiries({ questions, loading }) {
  const { t } = useTranslation();
  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center' }}><RefreshCw className="animate-spin" /> Loading inquiries...</div>;
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('dashboard.inquiries')}</h2>
      {questions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {questions.map(q => (
            <div key={q._id} className="glass-heavy" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <Link to={`/property/${q.propertyId?._id}`} style={{ display: 'flex', gap: '1rem', textDecoration: 'none' }}>
                  <img src={q.propertyId?.image || q.propertyId?.images?.[0]} style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }} alt="Prop" />
                  <div>
                    <div style={{ fontWeight: 700, color: 'white' }}>{q.propertyId?.title || 'Unknown Asset'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}><MapPin size={10}/> {q.propertyId?.location}</div>
                  </div>
                </Link>
                <div style={{ 
                  padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, height: 'fit-content',
                  background: q.status === 'Answered' ? 'rgba(16,217,140,0.1)' : 'rgba(244,208,63,0.1)',
                  color: q.status === 'Answered' ? 'var(--accent-emerald)' : 'var(--gold)',
                  border: `1px solid ${q.status === 'Answered' ? 'rgba(16,217,140,0.2)' : 'rgba(244,208,63,0.2)'}`
                }}>
                  {q.status.toUpperCase()}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '14px', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--txt-muted)', marginBottom: '0.4rem', fontWeight: 800 }}>Question</div>
                <div style={{ fontSize: '0.95rem' }}>{q.question}</div>
              </div>
              {q.answer && (
                <div style={{ background: 'rgba(155,89,245,0.05)', padding: '1.25rem', borderRadius: '14px', borderLeft: '3px solid var(--violet)' }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--violet)', marginBottom: '0.4rem', fontWeight: 800 }}>Agent Response</div>
                  <div style={{ fontSize: '0.95rem' }}>{q.answer}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <MessageSquare size={48} />
          <h3>No inquiries found</h3>
          <p>Ask questions on any property page to see them here.</p>
          <Link to="/" className="hero-btn hero-btn-primary" style={{ marginTop: '0.5rem' }}>Start Browsing</Link>
        </div>
      )}
    </div>
  );
}

// Profile tab
function Profile({ user }) {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '2rem 0', maxWidth: '480px' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>{t('dashboard.profile')}</h2>
      <div className="glass-heavy" style={{ padding: '2rem', borderRadius: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold),var(--accent-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#07070f' }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--txt-muted)' }}>{user?.email}</div>
          </div>
        </div>
        {[{ label: 'Name', val: user?.name }, { label: 'Email', val: user?.email }, { label: 'Member Since', val: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today' }].map((f, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--txt-muted)', fontSize: '0.85rem' }}>{f.label === 'Member Since' ? t('dashboard.memberSince') : f.label}</span>
            <span style={{ fontWeight: 600 }}>{f.val || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [modalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState([]);
  const [recent, setRecent] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qLoading, setQLoading] = useState(true);
  const [stats, setStats] = useState({ favoritesCount: 0, citiesCount: 3, inquiriesCount: 0, engagementCount: 0 });

  useEffect(() => {
    // Load recent from localStorage
    const storedRecent = JSON.parse(localStorage.getItem('snapadda_recent_viewed') || '[]');
    setRecent(storedRecent);

    if (!user?._id && !user?.id) return;
    
    const id = user._id || user.id;
    setLoading(true);
    setQLoading(true);
    const uid = user._id || user.id || user.sub;
    if (!uid) { setLoading(false); setQLoading(false); return; }

    getFavorites(uid)
      .then(res => {
        const arr = Array.isArray(res) ? res : [];
        setSaved(arr);
        setStats(prev => ({ ...prev, favoritesCount: arr.length }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchUserQuestions(uid)
      .then(res => {
        setQuestions(res || []);
        setStats(prev => ({ ...prev, inquiriesCount: res.length, engagementCount: Math.floor(res.length * 2.5) + (user.verified ? 10 : 0) }));
      })
      .catch(console.error)
      .finally(() => setQLoading(false));
  }, [user]);

  const TABS = [
    { key: 'home', label: 'Overview', icon: <ShieldCheck size={18} /> },
    { key: 'favorites', label: 'Saved Assets', icon: <Heart size={18} /> },
    { key: 'inquiries', label: 'Intelligence', icon: <MessageSquare size={18} /> },
    { key: 'profile', label: 'Executive Info', icon: <User size={18} /> },
  ];

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', paddingTop: 'var(--nav-h)', paddingBottom: '4rem' }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Tab Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.5rem', borderRadius: '14px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.3s',
                  background: activeTab === t.key ? 'rgba(244,208,63,0.1)' : 'transparent', color: activeTab === t.key ? 'var(--gold)' : 'var(--txt-muted)', boxShadow: activeTab === t.key ? '0 4px 15px rgba(0,0,0,0.1)' : 'none' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          
          <button onClick={() => window.location.href = '/'} className="hero-btn hero-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1.5rem', fontSize: '0.85rem', height: 'fit-content', borderRadius: '14px' }}>
            <Home size={18} /> {t('dashboard.backToSite')}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
            {activeTab === 'home' && <DashboardHome user={user} stats={stats} recent={recent} setModalOpen={setModalOpen} />}
            {activeTab === 'favorites' && <Favorites saved={saved} loading={loading} />}
            {activeTab === 'inquiries' && <Inquiries questions={questions} loading={qLoading} />}
            {activeTab === 'profile' && <Profile user={user} logout={logout} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB */}
      <button className="fab-callback" onClick={() => setModalOpen(true)} style={{ width: '64px', height: '64px', borderRadius: '22px', boxShadow: '0 15px 30px rgba(212,175,55,0.3)' }}><Phone size={28} /></button>
      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type="callback" />
    </div>
  );
}
