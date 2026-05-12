import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Heart, User, Settings, LogOut, Star, MapPin, ShieldCheck, Phone, RefreshCw, MessageSquare, Sparkles, LayoutDashboard, Building } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getFavorites, fetchUserQuestions, fetchMyProperties } from '../services/api';
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
              {t('dashboard.welcome')}, {(user?.name || 'Elite').split(' ')[0]}! ✦
            </h2>
            <p style={{ color: 'var(--txt-muted)', fontSize: '0.95rem' }}>Your digital real estate registry is up-to-date.</p>
          </div>
          <div className="glass-panel" style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--midnight)', backdropFilter: 'none' }}>
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
            <div key={i} className="glass-panel" style={{ padding: '1.75rem', borderRadius: '24px', border: `1px solid ${s.color}22`, background: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, ${s.color}08 100%)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ color: s.color }}>{s.icon}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--txt-muted)', letterSpacing: '0.1em' }}>KPI {i+1}</div>
              </div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.2rem', fontFamily: 'var(--font-mono)' }}>{s.val}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--txt-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
        
        <div className="bento-grid" style={{ marginTop: '2.5rem' }}>
          {/* Main Stat Card (Large Bento) */}
          <div className="bento-item glass-panel" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 950 }}>Engagement Yield</h3>
              <Sparkles size={18} style={{ color: 'var(--gold)' }} />
            </div>
            <div style={{ height: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Mon', views: 4 }, { name: 'Tue', views: 12 }, { name: 'Wed', views: 8 },
                  { name: 'Thu', views: 18 }, { name: 'Fri', views: 14 }, { name: 'Sat', views: 25 }, { name: 'Sun', views: 20 }
                ]}>
                  <defs>
                    <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: 'var(--midnight)', borderColor: 'var(--gold-royal-dim)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="views" stroke="var(--gold)" strokeWidth={3} fill="url(#yieldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bento-item glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--gold)' }}>{stats.favoritesCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>Saved Assets</div>
          </div>

          <div className="bento-item glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: 'var(--gold)' }}>{stats.inquiriesCount}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>Active Inquiries</div>
          </div>

          {/* Recently Viewed (Secondary Large Bento) */}
          <div className="bento-item glass-panel" style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={18} style={{ color: 'var(--gold)' }} /> Performance History
            </h3>
            {recent && recent.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {recent.slice(0, 4).map((p, i) => (
                  <Link key={i} to={`/property/${p._id || p.id}`} style={{ textDecoration: 'none', padding: '1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--gold)', marginTop: '4px' }}>Analyze Asset →</div>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ opacity: 0.5, fontSize: '0.85rem' }}>No recent asset movements detected.</p>
            )}
          </div>

          {/* Institutional Badge */}
          <div className="bento-item glass-panel" style={{ gridColumn: 'span 2', background: 'linear-gradient(135deg, var(--midnight-royal) 0%, #1a1a2e 100%)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'var(--gold-royal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={32} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 950, fontSize: '1.1rem' }}>Executive Verification</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Your profile is currently under institutional review.</div>
            </div>
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
          {saved.filter(p => p).map(p => <PropertyCard key={p._id || p.id} {...p} />)}
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

// My Listings tab
function MyListings({ properties, loading }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center' }}><RefreshCw className="animate-spin" /> Syncing with registry...</div>;
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>{t('mylistings.title')}</h2>
        <button onClick={() => navigate('/post-property')} className="btn-3d-glass" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
          {t('mylistings.addBtn')}
        </button>
      </div>

      {properties.length > 0 ? (
        <div className="properties-grid">
          {properties.map(p => (
            <div key={p._id || p.id} style={{ position: 'relative' }}>
              <div style={{ 
                position: 'absolute', top: '15px', left: '15px', zIndex: 10,
                padding: '4px 12px', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900,
                background: p.status === 'Active' ? '#10d98c' : (p.status === 'Pending' ? '#e8b84b' : '#f5397b'),
                color: 'black', textTransform: 'uppercase', letterSpacing: '0.05em',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}>
                {p.status === 'Active' ? t('mylistings.live') : (p.status === 'Pending' ? t('mylistings.reviewing') : p.status)}
              </div>
              <PropertyCard {...p} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state glass-panel" style={{ padding: '5rem 2rem', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <Building size={48} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{t('mylistings.noAssets')}</h3>
          <p style={{ color: 'var(--txt-muted)', marginBottom: '2rem' }}>{t('mylistings.noAssetsSub')}</p>
          <button onClick={() => navigate('/post-property')} className="hero-btn hero-btn-primary">{t('mylistings.addBtn')}</button>
        </div>
      )}
    </div>
  );
}


// Profile tab — Full Premium Profile Page
function Profile({ user, logout, stats }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const avatarUrl = user?.picture || user?.avatar || user?.photo ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true&size=200`;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
    : 'Recently Joined';

  const infoRows = [
    { label: 'Full Name', value: user?.name, icon: '👤' },
    { label: 'Email Address', value: user?.email, icon: '📧' },
    { label: 'Phone', value: user?.phone || 'Not provided', icon: '📞' },
    { label: 'Member Since', value: memberSince, icon: '📅' },
    { label: 'Account Type', value: user?.role === 'client' ? 'Premium Client' : (user?.role || 'Client'), icon: '⭐' },
  ];

  const activityCards = [
    { label: 'Saved Properties', value: stats?.favoritesCount || 0, color: '#e8b84b', icon: <Heart size={18} /> },
    { label: 'Active Inquiries', value: stats?.inquiriesCount || 0, color: '#9b59f5', icon: <MessageSquare size={18} /> },
    { label: 'Market Interest', value: stats?.engagementCount || 0, color: '#10d98c', icon: <Star size={18} /> },
  ];

  return (
    <div style={{ padding: '2rem 0', maxWidth: '860px' }}>
      {/* ── Hero Profile Card ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, rgba(232,184,75,0.08) 0%, rgba(155,89,245,0.06) 50%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid rgba(232,184,75,0.2)',
          borderRadius: '28px', padding: '2.5rem',
          marginBottom: '1.5rem', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,184,75,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarUrl}
              alt={user?.name || 'Profile'}
              style={{
                width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover',
                border: '3px solid rgba(232,184,75,0.6)',
                boxShadow: '0 0 30px rgba(232,184,75,0.25), 0 10px 40px rgba(0,0,0,0.4)',
              }}
              onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=e8b84b&color=000&bold=true&size=200`; }}
            />
            {/* Verified badge */}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#10d98c', border: '2px solid rgba(10,10,22,1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={14} style={{ color: '#fff' }} />
            </div>
          </div>

          {/* Name & info */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '4px' }}>✦ SNAPADDA MEMBER</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '4px', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
              {user?.name || 'Elite Client'}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>{user?.email}</div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 14px', borderRadius: '20px', background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.3)', color: '#e8b84b', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                PREMIUM ACCOUNT
              </span>
              {user?.isVerified && (
                <span style={{ padding: '4px 14px', borderRadius: '20px', background: 'rgba(16,217,140,0.1)', border: '1px solid rgba(16,217,140,0.25)', color: '#10d98c', fontSize: '0.7rem', fontWeight: 800 }}>
                  ✓ VERIFIED
                </span>
              )}
              <span style={{ padding: '4px 14px', borderRadius: '20px', background: 'rgba(155,89,245,0.1)', border: '1px solid rgba(155,89,245,0.25)', color: '#9b59f5', fontSize: '0.7rem', fontWeight: 800 }}>
                {memberSince}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Activity Row ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
      >
        {activityCards.map((card, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.02) 0%, ${card.color}08 100%)`,
            border: `1px solid ${card.color}22`,
            borderRadius: '20px', padding: '1.5rem 1.25rem',
            display: 'flex', flexDirection: 'column', gap: '6px',
          }}>
            <div style={{ color: card.color }}>{card.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>{card.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{card.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Account Information ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem', marginBottom: '1.5rem' }}
      >
        <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '1.25rem' }}>ACCOUNT INFORMATION</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {infoRows.map((row, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 0', borderBottom: i < infoRows.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1rem', width: '24px', textAlign: 'center' }}>{row.icon}</span>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{row.label}</span>
              </div>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: row.value ? '#fff' : 'rgba(255,255,255,0.25)', textAlign: 'right', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.value || '—'}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Preferences ────────────────────────────────────────────────── */}
      {(user?.preferences?.propertyType || user?.preferences?.city || user?.preferences?.budget) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem', marginBottom: '1.5rem' }}
        >
          <div style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', color: 'var(--gold)', marginBottom: '1.25rem' }}>YOUR PREFERENCES</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {user?.preferences?.city && (
              <span style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(34,217,224,0.08)', border: '1px solid rgba(34,217,224,0.2)', color: '#22d9e0', fontSize: '0.78rem', fontWeight: 700 }}>
                📍 {user.preferences.city}
              </span>
            )}
            {user?.preferences?.propertyType && (
              <span style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(155,89,245,0.08)', border: '1px solid rgba(155,89,245,0.2)', color: '#9b59f5', fontSize: '0.78rem', fontWeight: 700 }}>
                🏠 {user.preferences.propertyType}
              </span>
            )}
            {user?.preferences?.budget && (
              <span style={{ padding: '6px 14px', borderRadius: '10px', background: 'rgba(232,184,75,0.08)', border: '1px solid rgba(232,184,75,0.2)', color: 'var(--gold)', fontSize: '0.78rem', fontWeight: 700 }}>
                💰 Budget: ₹{(Number(user.preferences.budget) / 100000).toFixed(0)}L
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
      >
        <button
          onClick={() => navigate('/')}
          className="hero-btn hero-btn-primary"
          style={{ padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', flex: 1, justifyContent: 'center', minWidth: '160px' }}
        >
          <Home size={16} /> Browse Properties
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', gap: '8px',
            borderRadius: '14px', border: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.8)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', flex: 1, justifyContent: 'center', minWidth: '160px',
          }}
        >
          <LayoutDashboard size={16} /> My Dashboard
        </button>
        {showLogoutConfirm ? (
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', gap: '8px',
              borderRadius: '14px', border: '1px solid rgba(245,57,123,0.4)',
              background: 'rgba(245,57,123,0.15)', color: '#f5397b',
              fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', flex: 1, justifyContent: 'center', minWidth: '160px',
            }}
          >
            <LogOut size={16} /> Confirm Sign Out
          </button>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              padding: '0.9rem 2rem', display: 'flex', alignItems: 'center', gap: '8px',
              borderRadius: '14px', border: '1px solid rgba(245,57,123,0.2)',
              background: 'rgba(245,57,123,0.06)', color: 'rgba(245,57,123,0.8)',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', flex: 1, justifyContent: 'center', minWidth: '160px',
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        )}
      </motion.div>
    </div>
  );
}

export default function Dashboard({ defaultTab = 'home' }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [modalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [recent, setRecent] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myLoading, setMyLoading] = useState(true);
  const [qLoading, setQLoading] = useState(true);
  const [stats, setStats] = useState({ favoritesCount: 0, citiesCount: 3, inquiriesCount: 0, engagementCount: 0, listingsCount: 0 });

  useEffect(() => {
    // Load recent from localStorage with safety
    try {
      const storedRecent = JSON.parse(localStorage.getItem('snapadda_recent_viewed') || '[]');
      setRecent(Array.isArray(storedRecent) ? storedRecent : []);
    } catch (err) {
      console.warn('Failed to parse recent history:', err);
      setRecent([]);
      localStorage.removeItem('snapadda_recent_viewed');
    }

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

    setMyLoading(true);
    fetchMyProperties(uid)
      .then(res => {
        const arr = Array.isArray(res?.data) ? res.data : [];
        setMyProperties(arr);
        setStats(prev => ({ ...prev, listingsCount: arr.length }));
      })
      .catch(console.error)
      .finally(() => setMyLoading(false));

    fetchUserQuestions(uid)
      .then(res => {
        const questionsArr = Array.isArray(res) ? res : [];
        setQuestions(questionsArr);
        setStats(prev => ({ 
          ...prev, 
          inquiriesCount: questionsArr.length, 
          engagementCount: Math.floor(questionsArr.length * 2.5) + (user?.verified ? 10 : 0) 
        }));
      })
      .catch(err => {
        console.error('Questions fetch error:', err);
        setQuestions([]);
      })
      .finally(() => setQLoading(false));
  }, [user]);

  const TABS = [
    { key: 'home', label: t('dashboard.overview'), icon: <ShieldCheck size={18} /> },
    { key: 'listings', label: t('mylistings.title'), icon: <Building size={18} /> },
    { key: 'favorites', label: t('dashboard.saved'), icon: <Heart size={18} /> },
    { key: 'profile', label: t('dashboard.profile'), icon: <User size={18} /> },
  ];

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', paddingTop: 'var(--nav-h)', paddingBottom: '4rem' }}>

      <div className="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* Tab Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            gap: '0.4rem', 
            background: 'rgba(255,255,255,0.02)', 
            padding: '6px', 
            borderRadius: '18px', 
            border: '1px solid rgba(255,255,255,0.05)',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%'
          }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.6rem', 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '14px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '0.82rem', 
                  fontWeight: 700, 
                  transition: 'all 0.3s',
                  whiteSpace: 'nowrap',
                  background: activeTab === t.key ? 'rgba(244,208,63,0.1)' : 'transparent', 
                  color: activeTab === t.key ? 'var(--gold)' : 'var(--txt-muted)', 
                  boxShadow: activeTab === t.key ? '0 4px 15px rgba(0,0,0,0.1)' : 'none' 
                }}>
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
            {activeTab === 'listings' && <MyListings properties={myProperties} loading={myLoading} />}
            {activeTab === 'favorites' && <Favorites saved={saved} loading={loading} />}
            {activeTab === 'profile' && <Profile user={user} logout={logout} stats={stats} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FAB */}
      <button className="fab-callback" onClick={() => setModalOpen(true)} style={{ width: '64px', height: '64px', borderRadius: '22px', boxShadow: '0 15px 30px rgba(212,175,55,0.3)' }}><Phone size={28} /></button>
      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} type="callback" />
    </div>
  );
}
