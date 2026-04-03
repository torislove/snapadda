import { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Heart, User, Settings, LogOut, Star, MapPin, ShieldCheck, Phone, RefreshCw, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFavorites, fetchUserQuestions } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import Logo from '../components/Logo';
import ContactModal from '../components/ContactModal';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Dashboard home tab
function DashboardHome({ user, stats }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem 0' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{t('dashboard.welcome')}, {user?.name || 'Explorer'}!</h2>
        <p style={{ color: 'var(--txt-muted)', marginBottom: '2rem' }}>Here's your property journey at a glance.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Saved Properties', val: stats.favoritesCount, icon: <Heart size={20} style={{ color: 'var(--gold)' }} /> },
            { label: 'Cities Explored', val: stats.citiesCount, icon: <MapPin size={20} style={{ color: '#10d98c' }} /> },
            { label: 'Inquiries Sent', val: stats.inquiriesCount, icon: <Phone size={20} style={{ color: '#9b59f5' }} /> },
          ].map((s, i) => (
            <div key={i} className="glass-heavy" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {s.icon}
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--txt-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Advanced CRM CRM Recharts Metric Integration */}
        <div className="glass-heavy" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', minHeight: '300px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--txt-secondary)' }}>Activity Forecast (Free Edition)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={[
              { name: 'Mon', views: 4, inquiries: 0 },
              { name: 'Tue', views: 7, inquiries: 1 },
              { name: 'Wed', views: 3, inquiries: 0 },
              { name: 'Thu', views: 12, inquiries: 2 },
              { name: 'Fri', views: 8, inquiries: 1 },
              { name: 'Sat', views: 15, inquiries: 3 },
            ]}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10d98c" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10d98c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" stroke="var(--txt-muted)" fontSize={12} />
              <YAxis stroke="var(--txt-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'rgba(10,10,15,0.9)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="views" stroke="var(--gold)" fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="inquiries" stroke="#10d98c" fillOpacity={1} fill="url(#colorInq)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <button className="hero-btn hero-btn-primary" onClick={() => navigate('/')}>
          Browse Properties <Star size={16} />
        </button>
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
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qLoading, setQLoading] = useState(true);
  const [stats, setStats] = useState({ favoritesCount: 0, citiesCount: 0, inquiriesCount: 0 });

  useEffect(() => {
    if (!user?._id && !user?.id) return;
    
    const id = user._id || user.id;
    setLoading(true);
    setQLoading(true);

    getFavorites(id)
      .then(res => {
        setSaved(res || []);
        setStats(prev => ({ ...prev, favoritesCount: res.length }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetchUserQuestions(id)
      .then(res => {
        setQuestions(res || []);
        setStats(prev => ({ ...prev, inquiriesCount: res.length }));
      })
      .catch(console.error)
      .finally(() => setQLoading(false));
  }, [user]);

  const TABS = [
    { key: 'home', label: 'Overview', icon: <ShieldCheck size={18} /> },
    { key: 'favorites', label: 'Saved', icon: <Heart size={18} /> },
    { key: 'inquiries', label: 'Inquiries', icon: <MessageSquare size={18} /> },
    { key: 'profile', label: 'Profile', icon: <User size={18} /> },
  ];

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', paddingTop: 'var(--nav-h)' }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Tab Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--border)', marginBottom: '0', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s',
                  background: activeTab === t.key ? 'rgba(244,208,63,0.15)' : 'transparent', color: activeTab === t.key ? 'var(--gold)' : 'var(--txt-muted)' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          
          <button onClick={() => navigate('/')} className="hero-btn hero-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', fontSize: '0.9rem', height: 'fit-content' }}>
            <Home size={18} /> {t('dashboard.backToSite')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && <DashboardHome user={user} stats={stats} />}
        {activeTab === 'favorites' && <Favorites saved={saved} loading={loading} />}
        {activeTab === 'inquiries' && <Inquiries questions={questions} loading={qLoading} />}
        {activeTab === 'profile' && <Profile user={user} />}
      </div>

      {/* FAB */}
      <button className="fab-callback" onClick={() => setModalOpen(true)}><Phone size={28} /></button>
      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type="callback" />
    </div>
  );
}
