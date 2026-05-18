import React, { useState, useEffect, useRef } from 'react';
import {
  fetchAllPromotions, createPromotion, updatePromotion,
  reorderPromotions, uploadMedia, sendPushNotification, fetchProperties,
  deletePromotion
} from '../../services/api';
import {
  Plus, Loader2, Sparkles, TrendingUp, MousePointer2,
  Zap, GripVertical, Eye, EyeOff, X, AlertCircle, Building, ArrowRight,
  Trash2
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { 
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import { MediaManager } from '../../components/ui/MediaManager';

/* ── Color presets ── */
const COLOR_PRESETS = [
  { id: 'glass-dark',     label: 'Midnight',  bg: 'linear-gradient(135deg,#18181b,#09090b)',   accent: '#71717a' },
  { id: 'red-gradient',   label: 'Ruby',      bg: 'linear-gradient(135deg,#7f1d1d,#450a0a)',   accent: '#f87171' },
  { id: 'green-gradient', label: 'Emerald',   bg: 'linear-gradient(135deg,#064e3b,#022c22)',   accent: '#34d399' },
  { id: 'blue-gradient',  label: 'Sapphire',  bg: 'linear-gradient(135deg,#1e3a5f,#0f172a)',   accent: '#60a5fa' },
  { id: 'gold-gradient',  label: 'Gold Rush', bg: 'linear-gradient(135deg,#78350f,#451a03)',   accent: '#fbbf24' },
];

const getThemeBg = (c?: string) =>
  COLOR_PRESETS.find(p => p.id === c)?.bg ?? COLOR_PRESETS[0].bg;

const TYPE_CONFIG: Record<string, { label: string; badgeColor: string; badge: string }> = {
  festival:      { label: 'Festival',      badgeColor: '#f5c842', badge: 'FEATURED EVENT' },
  ad:            { label: 'Standard Ad', badgeColor: '#9b59f5', badge: 'PROMOTION'      },
  update:        { label: 'Update',      badgeColor: '#22d9e0', badge: 'NEW UPDATE'     },
  institutional: { label: 'Institutional', badgeColor: '#e8b84b', badge: 'INSTITUTIONAL' },
  offer:         { label: 'Offer',        badgeColor: '#27c97d', badge: 'EXCLUSIVE OFFER' },
};

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.quicktime'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.includes('video/upload');
};

const EMPTY_FORM = {
  type: 'offer', title: '', subtitle: '', actionText: 'Explore Details', actionUrl: '',
  size: '1x1', countdownActive: false, cardColor: 'glass-dark',
  image: '', mediaSettings: [] as { url: string; objectFit: 'cover' | 'contain' }[], 
  priority: 0, targetLocation: 'All', startDate: '', endDate: '',
  displaySegment: 'both', linkedPropertyId: '',
  videoUrl: '', pdfUrl: '', videoSource: 'url', pdfSource: 'url',
  promotionType: 'photo', description: ''
};

/* ── Mini Live Preview (Precise Vertical 3:4 Aspect Ratio) ── */
const MiniPreview = ({ form }: { form: any }) => {
  const isVideo = form.promotionType === 'video' || form.videoUrl || isVideoUrl(form.image);
  return (
    <div style={{
      position: 'relative', borderRadius: '16px', overflow: 'hidden',
      aspectRatio: '3/4', background: '#04040a',
      border: '1px solid rgba(255,255,255,0.12)', flexShrink: 0,
      width: '100%', maxWidth: '220px', margin: '0 auto',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    }}>
      {(form.image || form.videoUrl) && (
        <>
          {isVideo ? (
            <video 
              src={form.videoUrl || form.image} 
              autoPlay muted loop playsInline 
              style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity: 0.8 }} 
            />
          ) : (
            <div style={{ 
              position:'absolute', inset:0, 
              backgroundImage:`url(${form.image})`, 
              backgroundSize: form.mediaSettings?.find((s: any) => s.url === form.image)?.objectFit === 'contain' ? 'contain' : 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition:'center',
              opacity: 0.8
            }} />
          )}
          <div style={{ position:'absolute', inset:0, background: getThemeBg(form.cardColor), opacity:0.3, mixBlendMode:'multiply' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(4,4,10,0.95) 0%, rgba(4,4,10,0.3) 60%, transparent 100%)' }} />
        </>
      )}
      <div style={{ position:'absolute', inset:0, padding:'0.8rem', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
        <span style={{
          fontSize:'0.5rem', fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase',
          background:'rgba(232,184,75,0.2)', color:'var(--gold)', padding:'2px 8px', borderRadius:'4px',
          backdropFilter:'blur(8px)', alignSelf:'flex-start', border:'1px solid var(--gold)',
          marginBottom: '6px'
        }}>{TYPE_CONFIG[form.type]?.badge || 'EXCLUSIVE OFFER'}</span>
        
        <div>
          {form.title && (
            <div style={{ fontSize:'0.85rem', fontWeight:950, color:'#fff', lineHeight:1.2, marginBottom:'4px' }}>
              {form.title}
            </div>
          )}
          {form.subtitle && (
            <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.6)', lineHeight:1.3, marginBottom: '6px' }}>
              {form.subtitle}
            </div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)', fontWeight: 800, fontSize: '0.65rem',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {form.actionText || 'Explore Details'} <ArrowRight size={10} />
          </div>
        </div>
      </div>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />
    </div>
  );
};

/* ── Analytics Helpers ── */
const calculateCTR = (views: number = 0, clicks: number = 0) => {
  if (!views) return '0%';
  return ((clicks / views) * 100).toFixed(1) + '%';
};

/* ── Promotion Card in Grid (Precise Vertical 3:4 Aspect Ratio) ── */
const PromoCard = ({
  promo, onToggle, onEdit, onDelete, onDragStart, onDragOver, onDrop, isDragging
}: any) => {
  const cfg = TYPE_CONFIG[promo.type] || TYPE_CONFIG.offer;
  const color = COLOR_PRESETS.find(c => c.id === promo.cardColor)?.accent ?? '#71717a';
  
  const stats = promo.stats || { views: 0, clicks: 0 };
  const ctr = calculateCTR(stats.views, stats.clicks);

  const isVideo = promo.promotionType === 'video' || promo.videoUrl || (promo.image && isVideoUrl(promo.image));

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      style={{
        background: '#07070f',
        border: `1px solid ${isDragging ? color : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px', 
        overflow: 'hidden',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDragging ? `0 20px 40px ${color}33` : '0 10px 30px rgba(0,0,0,0.4)',
        position: 'relative',
        aspectRatio: '3/4',
        width: '100%',
        maxWidth: '300px',
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        margin: '0 auto'
      }}
    >
      {/* Background Media */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {isVideo ? (
          <video 
            src={promo.videoUrl || promo.image} 
            autoPlay muted loop playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} 
          />
        ) : promo.image ? (
          <div style={{ 
            width: '100%', height: '100%', 
            backgroundImage: `url(${promo.image})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.7
          }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: getThemeBg(promo.cardColor) }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,7,12,0.98) 0%, rgba(7,7,12,0.5) 50%, transparent 100%)' }} />
      </div>

      {/* Drag Grip Handle */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        cursor: 'grab', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.5)',
        borderRadius: '4px', padding: '2px 6px', display: 'flex', alignItems: 'center', zIndex: 10
      }}>
        <GripVertical size={10} />
      </div>

      {/* Top Floating Badges */}
      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '5px' }}>
          <div style={{
            fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
            background: 'rgba(0,0,0,0.6)', color: cfg.badgeColor,
            padding: '2px 8px', borderRadius: '99px', backdropFilter: 'blur(8px)',
            border: `1px solid ${cfg.badgeColor}33`,
          }}>{promo.promotionType?.toUpperCase() || 'PHOTO'}</div>
          
          {promo.targetLocation && promo.targetLocation !== 'All' && (
            <span style={{ fontSize: '0.55rem', color: 'var(--cyan)', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(34,217,224,0.3)', padding: '2px 8px', borderRadius: '99px', fontWeight: 700, backdropFilter: 'blur(8px)' }}>
              📍 {promo.targetLocation}
            </span>
          )}
        </div>

        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: promo.isActive ? '#10d98c' : '#4b5563',
          boxShadow: promo.isActive ? '0 0 8px #10d98c' : 'none',
        }} />
      </div>

      {/* Bottom Content Area */}
      <div style={{ position: 'relative', zIndex: 5, padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div>
          <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.9rem', lineHeight: 1.2, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {promo.title}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {promo.subtitle || 'No subtitle'}
          </div>
        </div>

        {/* Quick Mini Analytics */}
        <div style={{ 
          padding: '6px 8px', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.65rem'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>V: </span>
              <strong style={{ color: '#fff' }}>{stats.views}</strong>
            </div>
            <div>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>C: </span>
              <strong style={{ color: 'var(--gold)' }}>{stats.clicks}</strong>
            </div>
          </div>
          <div>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>CTR: </span>
            <strong style={{ color: '#10d98c' }}>{ctr}</strong>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => onToggle(promo._id, promo.isActive)}
            style={{
              flex: 1, padding: '6px 0', fontSize: '0.7rem', fontWeight: 700,
              borderRadius: '8px', cursor: 'pointer', border: 'none',
              background: promo.isActive ? 'rgba(16,217,140,0.15)' : 'rgba(255,255,255,0.05)',
              color: promo.isActive ? '#10d98c' : 'rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            {promo.isActive ? <><Eye size={10} /> Live</> : <><EyeOff size={10} /> Hidden</>}
          </button>
          <button
            onClick={() => onEdit(promo)}
            style={{
              padding: '6px 12px', fontSize: '0.7rem', fontWeight: 700,
              borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#fff',
              transition: 'all 0.2s ease',
            }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(promo._id)}
            style={{
              padding: '6px 10px', fontSize: '0.7rem', fontWeight: 700,
              borderRadius: '8px', cursor: 'pointer', border: 'none',
              background: 'rgba(245,57,123,0.15)', color: '#f5397b',
              transition: 'all 0.2s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Delete Campaign"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Input styles ── */
const inputCls: React.CSSProperties = {
  width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
  color:'#f0eeff', borderRadius:'10px', padding:'0.6rem 0.9rem', fontSize:'0.85rem',
  outline:'none',
};

const labelStyle: React.CSSProperties = { 
  display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', 
  textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem' 
};

/* ── Push Broadcast Section ── */
const PushBroadcast = ({ showToast }: { showToast: (m: string, t?: 'success' | 'error') => void }) => {
  const [pushForm, setPushForm] = useState({ title: '', body: '', imageUrl: '', link: '/' });
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushForm.title || !pushForm.body) return;
    setSending(true);
    try {
      await sendPushNotification(pushForm);
      showToast('Notification broadcasted successfully! 🔔');
      setPushForm({ title: '', body: '', imageUrl: '', link: '/' });
    } catch {
      showToast('Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={20} color="var(--gold)" /> Broadcast Free Push Notification
          </h3>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Notification Title</label>
              <input value={pushForm.title} onChange={e => setPushForm({...pushForm, title: e.target.value})} style={inputCls} placeholder="New Property Alert! 🏡" />
            </div>
            <div>
              <label style={labelStyle}>Message Body</label>
              <textarea rows={3} value={pushForm.body} onChange={e => setPushForm({...pushForm, body: e.target.value})} style={{ ...inputCls, resize: 'none' }} placeholder="A new 3BHK Villa is available in Vijayawada..." />
            </div>
            <div className="responsive-form-grid" style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Image URL (Optional)</label>
                <input value={pushForm.imageUrl} onChange={e => setPushForm({...pushForm, imageUrl: e.target.value})} style={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label style={labelStyle}>Redirect Link</label>
                <input value={pushForm.link} onChange={e => setPushForm({...pushForm, link: e.target.value})} style={inputCls} placeholder="/property/..." />
              </div>
            </div>
            <button disabled={sending} className="btn btn-gold" style={{ marginTop: '0.5rem', width: 'fit-content' }}>
              {sending ? 'Broadcasting...' : 'SEND TO ALL DEVICES'}
            </button>
          </form>
        </div>
        <div style={{ width: '300px' }}>
          <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'1rem' }}>Live Preview</label>
          <div style={{ background: '#111', borderRadius: '18px', padding: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={20} color="black" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontSize: '0.85rem', fontWeight: 800 }}>{pushForm.title || 'SnapAdda Notification'}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '2px', lineHeight: 1.4 }}>{pushForm.body || 'This is how your message will appear on user devices.'}</div>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,217,140,0.05)', border: '1px solid rgba(16,217,140,0.15)', borderRadius: '12px', fontSize: '0.7rem', color: '#10d98c', lineHeight: 1.5 }}>
            <strong>Note:</strong> Free push notifications are delivered to all users who have allowed notifications on your website.
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════ MAIN PROMOTIONS COMPONENT ═══════════════════════════════════════════ */
export const Promotions = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({ ...EMPTY_FORM });
  const [activeTab, setActiveTab] = useState<'campaigns' | 'push'>('campaigns');
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();
  const dragOverIdxRef = useRef<number | null>(null);

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);
  const [newPdfFiles, setNewPdfFiles] = useState<File[]>([]);

  const statsData = promotions.map(p => ({
    name: p.title?.length > 10 ? p.title.substring(0, 8) + '...' : (p.title || 'Offer'),
    views: p.stats?.views || 0,
    clicks: p.stats?.clicks || 0,
    ctr: parseFloat(calculateCTR(p.stats?.views, p.stats?.clicks))
  })).sort((a, b) => b.views - a.views).slice(0, 6);

  const totalViews = promotions.reduce((sum, p) => sum + (p.stats?.views || 0), 0);
  const totalClicks = promotions.reduce((sum, p) => sum + (p.stats?.clicks || 0), 0);
  const avgCTR = calculateCTR(totalViews, totalClicks);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { 
    load(); 
    fetchProperties().then(res => {
      if (res.status === 'success') {
        setProperties(res.data || []);
      }
    }).catch(err => console.error("Failed to load properties list:", err));
  }, []);

  const load = () => {
    setLoading(true);
    fetchAllPromotions()
      .then(res => setPromotions(res.data || []))
      .catch(() => showToast('Failed to load promotions', 'error'))
      .finally(() => setLoading(false));
  };

  const handleMediaChange = (urls: string[], files: File[], settings: any[]) => {
    setFormData((p: any) => ({ 
      ...p, 
      image: urls.length > 0 ? urls[0] : '',
      mediaSettings: settings 
    }));
    setNewImageFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (newImageFiles.length > 0) {
        const res = await uploadMedia(newImageFiles);
        if (res.status === 'success' && res.data?.length > 0) {
          finalImageUrl = res.data[0];
        }
      }

      let finalVideoUrl = formData.videoUrl;
      if (newVideoFiles.length > 0) {
        const res = await uploadMedia(newVideoFiles);
        if (res.status === 'success' && res.data?.length > 0) {
          finalVideoUrl = res.data[0];
        }
      }

      let finalPdfUrl = formData.pdfUrl;
      if (newPdfFiles.length > 0) {
        const res = await uploadMedia(newPdfFiles);
        if (res.status === 'success' && res.data?.length > 0) {
          finalPdfUrl = res.data[0];
        }
      }
      
      const payload = { 
        ...formData, 
        image: finalImageUrl,
        videoUrl: finalVideoUrl,
        pdfUrl: finalPdfUrl
      };

      if (editingId) {
        await updatePromotion(editingId, payload);
        showToast('Campaign updated! ✨');
      } else {
        await createPromotion(payload);
        showToast('Campaign launched! 🚀');
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });
      setNewImageFiles([]);
      setNewVideoFiles([]);
      setNewPdfFiles([]);
      load();
    } catch (err: any) { 
      showToast(editingId ? 'Failed to update campaign' : 'Failed to create campaign', 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleEdit = (promo: any) => {
    setEditingId(promo._id);
    setFormData({
      type: promo.type || 'offer',
      title: promo.title || '',
      subtitle: promo.subtitle || '',
      actionText: promo.actionText || 'Explore Details',
      actionUrl: promo.actionUrl || '',
      size: promo.size || '1x1',
      countdownActive: !!promo.countdownActive,
      cardColor: promo.cardColor || 'glass-dark',
      image: promo.image || '',
      priority: promo.priority || 0,
      targetLocation: promo.targetLocation || 'All',
      mediaSettings: promo.mediaSettings || [],
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : '',
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : '',
      displaySegment: promo.displaySegment || 'both',
      videoUrl: promo.videoUrl || '',
      pdfUrl: promo.pdfUrl || '',
      videoSource: promo.videoUrl?.includes('cloudinary') ? 'upload' : 'url',
      pdfSource: (promo.pdfUrl || promo.documentUrl)?.includes('cloudinary') ? 'upload' : 'url',
      promotionType: promo.promotionType || 'photo',
      description: promo.description || '',
      linkedPropertyId: promo.linkedPropertyId || ''
    });
    setIsModalOpen(true);
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updatePromotion(id, { isActive: !current });
      setPromotions(ps => ps.map(p => p._id === id ? { ...p, isActive: !current } : p));
    } catch { showToast('Update failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this campaign? This action is irreversible.')) return;
    try {
      await deletePromotion(id);
      setPromotions(ps => ps.filter(p => p._id !== id));
      showToast('Campaign deleted successfully! 🗑️');
    } catch {
      showToast('Deletion failed', 'error');
    }
  };

  /* ── Drag-and-Drop ── */
  const handleDragStart = (idx: number) => { setDragSrcIdx(idx); };
  const handleDragOver = (idx: number) => {
    dragOverIdxRef.current = idx;
  };
  const handleDrop = async () => {
    const src = dragSrcIdx;
    const over = dragOverIdxRef.current;
    if (src === null || over === null || src === over) { setDragSrcIdx(null); return; }
    const reordered = [...promotions];
    const [moved] = reordered.splice(src, 1);
    reordered.splice(over, 0, moved);
    setPromotions(reordered);
    setDragSrcIdx(null);
    try {
      await reorderPromotions(reordered.map(p => p._id));
      showToast('Order saved ✓');
    } catch { showToast('Reorder failed', 'error'); }
  };

  /* ═══════════════════ RENDER MAIN DASHBOARD ═══════════════════ */
  return (
    <div style={{ minHeight:'100%', display:'flex', flexDirection:'column', gap:'1.5rem', position:'relative' }}>
      <ToastComponent />

      {/* ── Performance Cockpit ── */}
      {!loading && promotions.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '0.5rem'
        }}>
          {/* Global Stats Cards */}
          <div className="responsive-form-grid" style={{ display: 'grid', gap: '1rem' }}>
            {[
              { label: 'Total Views', val: totalViews.toLocaleString(), icon: <Eye size={18}/>, color: '#fff' },
              { label: 'Total Clicks', val: totalClicks.toLocaleString(), icon: <MousePointer2 size={18}/>, color: 'var(--gold)' },
              { label: 'Avg. CTR', val: avgCTR, icon: <TrendingUp size={18}/>, color: '#10d98c' },
            ].map((s, i) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '20px', 
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {s.icon} <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Quick Analytics Chart */}
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '24px', 
            padding: '1.25rem',
            height: '180px',
            position: 'relative',
            overflow: 'hidden'
          }}>
             <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Performance Benchmarks</span>
                <span style={{ color: 'var(--gold)' }}>Top 6 Campaigns</span>
             </div>
             <div style={{ height: '100px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData}>
                    <Bar dataKey="views" fill="var(--violet)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <div style={{ background: 'rgba(155,89,245,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(155,89,245,0.1)', marginBottom: '2rem' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--violet)', fontWeight: 600 }}>
            💡 <strong>Help:</strong> Drag and drop cards to reorder how they appear in the client portal scroll. Adjust card properties to control targeting and schedule dates.
          </p>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.25rem', fontFamily:'var(--font-mono)' }}>✦ Campaign Manager</div>
            <h1 style={{ fontSize:'1.8rem', background:'linear-gradient(135deg,#f5c842,#e8820c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'0.2rem' }}>
              {activeTab === 'campaigns' ? 'Exclusive Offers' : 'Push Broadcasts'}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => setActiveTab('campaigns')}
                style={{ background: 'none', border: 'none', padding: '4px 0', borderBottom: activeTab === 'campaigns' ? '2px solid var(--gold)' : '2px solid transparent', color: activeTab === 'campaigns' ? 'white' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Dashboard Banners (3:4 Cards)
              </button>
              <button 
                onClick={() => setActiveTab('push')}
                style={{ background: 'none', border: 'none', padding: '4px 0', borderBottom: activeTab === 'push' ? '2px solid var(--gold)' : '2px solid transparent', color: activeTab === 'push' ? 'white' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Push Notifications
              </button>
            </div>
          </div>

          {activeTab === 'campaigns' && (
            <button
              onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ ...EMPTY_FORM }); }}
              className="btn btn-gold"
            >
              <Plus size={15} /> New Offer
            </button>
          )}
        </div>
      </div>

      {activeTab === 'push' ? (
        <PushBroadcast showToast={showToast} />
      ) : (
        <>
          {/* ── 3:4 Cards Grid ── */}
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'1.5rem' }}>
              {[1,2,3].map(i => <div key={i} style={{ aspectRatio: '3/4', borderRadius:'20px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', animation:'pulse 1.5s infinite' }} />)}
            </div>
          ) : promotions.length === 0 ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem 2rem', borderRadius:'20px', border:'1.5px dashed rgba(255,255,255,0.08)', textAlign:'center' }}>
              <Sparkles size={32} style={{ color:'var(--text-muted)', marginBottom:'1rem' }} />
              <h3 style={{ color:'var(--text-secondary)', fontFamily:'var(--font-body)', marginBottom:'0.5rem' }}>No exclusive offers yet</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', maxWidth:'280px' }}>Launch a video or photo promotion campaign to sync instantly with client dashboards.</p>
              <button onClick={() => setIsModalOpen(true)} className="btn btn-ghost btn-sm" style={{ marginTop:'1.25rem' }}>
                <Plus size={13} /> Create Campaign
              </button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:'1.5rem' }}>
              {promotions.map((promo, idx) => (
                <PromoCard
                  key={promo._id}
                  promo={promo}
                  isDragging={dragSrcIdx === idx}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={() => handleDragOver(idx)}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════ REVAMPED MODAL FORM ════════════════ */}
      {isModalOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:9000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
          background:'rgba(0,0,0,0.92)', backdropFilter:'blur(16px)',
        }}>
          <div style={{
            width:'100%', maxWidth:'950px', maxHeight:'90vh',
            display:'flex', flexDirection:'column',
            background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.09)',
            borderRadius:'24px', overflow:'hidden',
            boxShadow:'0 32px 80px rgba(0,0,0,0.7)',
          }}>
            {/* Modal header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.75rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'rgba(232,184,75,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Sparkles size={16} style={{ color:'var(--gold)' }} />
                </div>
                <div>
                  <div style={{ color:'var(--text-primary)', fontWeight:700, fontSize:'1.1rem', lineHeight:1 }}>{editingId ? 'Edit Exclusive Offer Campaign' : 'Create Exclusive Offer Campaign'}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginTop:'2px' }}>Fill in details and preview in live 3:4 vertical scale</div>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} style={{ color:'var(--text-muted)', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex', background: 'none', border: 'none' }}>
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'1.2fr 0.8fr' }}>
                
                {/* Left Form Inputs */}
                <div style={{ padding:'1.5rem 1.75rem', borderRight:'1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Three Massive Buttons Toggle */}
                  <div>
                    <label style={labelStyle}>Choose Promotion Type</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {[
                        { id: 'video', label: '📹 Video Campaign', desc: 'Promote with a vertical video' },
                        { id: 'photo', label: '🖼 Photo Banner', desc: 'Promote with an optimized image' },
                        { id: 'property', label: '🏡 Property Card', desc: 'Link directly to property details' },
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setFormData((p: any) => ({ ...p, promotionType: t.id }));
                          }}
                          style={{
                            flex: 1,
                            padding: '12px 8px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            border: formData.promotionType === t.id ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                            background: formData.promotionType === t.id ? 'rgba(232,184,75,0.12)' : 'rgba(255,255,255,0.02)',
                            color: formData.promotionType === t.id ? 'var(--gold)' : 'rgba(255,255,255,0.6)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span style={{ fontSize: '0.9rem' }}>{t.label.split(' ')[0]}</span>
                          <span style={{ fontWeight: 800 }}>{t.label.split(' ').slice(1).join(' ')}</span>
                          <span style={{ fontSize: '0.55rem', opacity: 0.5, fontWeight: 500 }}>{t.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property Selector (If property type chosen) */}
                  {formData.promotionType === 'property' && (
                    <div style={{ padding: '1rem', background: 'rgba(232,184,75,0.03)', borderRadius: '12px', border: '1px solid rgba(232,184,75,0.15)' }}>
                      <label style={labelStyle}>Select Venture / Property to Link</label>
                      <select
                        value={formData.linkedPropertyId}
                        onChange={(e) => {
                          const propId = e.target.value;
                          const prop = properties.find(p => p._id === propId);
                          if (prop) {
                            setFormData((p: any) => ({
                              ...p,
                              linkedPropertyId: propId,
                              title: prop.title || '',
                              subtitle: `${prop.type?.toUpperCase() || 'RESIDENTIAL'} inside ${prop.location || 'Strategic Location'}`,
                              image: prop.images?.[0] || '',
                              videoUrl: prop.videos?.[0] || '',
                              actionText: 'Explore Details',
                              actionUrl: `/property/${prop._id}`
                            }));
                            showToast('Linked property details pulled successfully! 🏡');
                          } else {
                            setFormData((p: any) => ({ ...p, linkedPropertyId: propId }));
                          }
                        }}
                        style={inputCls}
                      >
                        <option value="">-- Choose Existing Property --</option>
                        {properties.map(p => (
                          <option key={p._id} value={p._id}>{p.title} ({p.location || 'Andhra Pradesh'})</option>
                        ))}
                      </select>
                      <p style={{ fontSize:'0.65rem', color:'rgba(232,184,75,0.6)', marginTop:'6px', marginBottom: 0 }}>
                        Auto-fills the Title, Subtitle, Media Banner, and CTA links instantly from your database details.
                      </p>
                    </div>
                  )}

                  {/* Standard Form Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={labelStyle}>Headline (Offer Title)</label>
                      <input type="text" value={formData.title} onChange={e => setFormData((p: any) => ({...p, title: e.target.value}))} style={inputCls} placeholder="e.g. Premium Plots Presale" />
                    </div>
                    <div>
                      <label style={labelStyle}>Action Text (CTA)</label>
                      <input type="text" value={formData.actionText} onChange={e => setFormData((p: any) => ({...p, actionText: e.target.value}))} style={inputCls} placeholder="Explore Details" />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Subheading / Short Description</label>
                    <textarea rows={2} value={formData.subtitle} onChange={e => setFormData((p: any) => ({...p, subtitle: e.target.value}))} style={{ ...inputCls, resize:'none' }} placeholder="e.g. 50% booked. Launching inside AP state highway with amenities." />
                  </div>

                  <div>
                    <label style={labelStyle}>Campaign Details / Full Highlighting Copy (Optional)</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData((p: any) => ({...p, description: e.target.value}))} style={{ ...inputCls, resize:'none' }} placeholder="Detailed campaign specifications that will open inside the separate detail page." />
                  </div>

                  {/* Photo Upload (For photo type and property type fallback) */}
                  {(formData.promotionType === 'photo' || formData.promotionType === 'property') && (
                    <div>
                      <label style={labelStyle}>Photo Banner (Cloudinary Optimized)</label>
                      <MediaManager 
                        existingUrls={formData.image ? [formData.image] : []}
                        existingSettings={formData.mediaSettings || []}
                        maxFiles={1}
                        onImagesChange={handleMediaChange}
                      />
                      <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'6px' }}>Recommended: Vertical 3:4 aspect ratio. Upload uploads directly to Cloudinary.</p>
                    </div>
                  )}

                  {/* Video Upload (For video type) */}
                  {formData.promotionType === 'video' && (
                    <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <label style={labelStyle}>Campaign Background Video</label>
                      <div style={{ display:'flex', gap:'8px', marginBottom:'0.75rem' }}>
                        {['url', 'upload'].map(s => (
                          <button key={s} type="button" onClick={() => setFormData((p: any) => ({ ...p, videoSource: s }))}
                            style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', border: formData.videoSource === s ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: formData.videoSource === s ? 'rgba(232,184,75,0.1)' : 'transparent', color: formData.videoSource === s ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer' }}
                          >{s}</button>
                        ))}
                      </div>
                      {formData.videoSource === 'url' ? (
                        <input type="text" value={formData.videoUrl} onChange={e => setFormData((p: any) => ({...p, videoUrl: e.target.value}))} style={inputCls} placeholder="Direct MP4 / Cloudinary URL..." />
                      ) : (
                        <MediaManager 
                          existingUrls={formData.videoUrl ? [formData.videoUrl] : []}
                          maxFiles={1}
                          onImagesChange={(urls, files) => {
                            setFormData((p: any) => ({...p, videoUrl: urls[0] || ''}));
                            setNewVideoFiles(files);
                          }}
                        />
                      )}
                      <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'6px' }}>Recommended: Precise 3:4 vertical MP4 format. &lt; 10MB.</p>
                    </div>
                  )}

                  {/* Venture Brochure PDF Upload */}
                  <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <label style={labelStyle}>Attached Venture Brochure PDF (Auto-embeds on Detail Page)</label>
                    <div style={{ display:'flex', gap:'8px', marginBottom:'0.75rem' }}>
                      {['url', 'upload'].map(s => (
                        <button key={s} type="button" onClick={() => setFormData((p: any) => ({ ...p, pdfSource: s }))}
                          style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', border: formData.pdfSource === s ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: formData.pdfSource === s ? 'rgba(232,184,75,0.1)' : 'transparent', color: formData.pdfSource === s ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer' }}
                        >{s}</button>
                      ))}
                    </div>
                    {formData.pdfSource === 'url' ? (
                      <input type="text" value={formData.pdfUrl} onChange={e => setFormData((p: any) => ({...p, pdfUrl: e.target.value}))} style={inputCls} placeholder="Direct PDF Link..." />
                    ) : (
                      <MediaManager 
                        existingUrls={formData.pdfUrl ? [formData.pdfUrl] : []}
                        maxFiles={1}
                        onImagesChange={(urls, files) => {
                          setFormData((p: any) => ({...p, pdfUrl: urls[0] || ''}));
                          setNewPdfFiles(files);
                        }}
                      />
                    )}
                    <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'6px' }}>Upload brochure to embed and display full pages automatically inside detail page.</p>
                  </div>

                  {/* Targeting & Ordering Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <label style={labelStyle}>Target City / Location Filter</label>
                      <select value={formData.targetLocation} onChange={e => setFormData((p: any) => ({...p, targetLocation: e.target.value}))} style={inputCls}>
                        {['All', 'Amaravati', 'Vijayawada', 'Guntur', 'Visakhapatnam', 'Mangalagiri'].map(loc => (
                          <option key={loc} value={loc}>{loc === 'All' ? '🌐 All Locations' : loc}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Campaign Targeting Tier</label>
                      <select value={formData.displaySegment} onChange={e => setFormData((p: any) => ({...p, displaySegment: e.target.value}))} style={inputCls}>
                        <option value="both">Both (Carousel + Offers Grid)</option>
                        <option value="hero">Carousel Only</option>
                        <option value="floating">Offers Grid Only</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Display Priority (0 = First)</label>
                      <input type="number" min={0} max={50} value={formData.priority} onChange={e => setFormData((p: any) => ({...p, priority: parseInt(e.target.value) || 0}))} style={inputCls} />
                    </div>
                    <div>
                      <label style={labelStyle}>Theme Preset</label>
                      <select value={formData.cardColor} onChange={e => setFormData((p: any) => ({...p, cardColor: e.target.value}))} style={inputCls}>
                        {COLOR_PRESETS.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Campaign Start Date (Optional)</label>
                      <input type="datetime-local" value={formData.startDate} onChange={e => setFormData((p: any) => ({...p, startDate: e.target.value}))} style={inputCls} />
                    </div>
                    <div>
                      <label style={labelStyle}>Campaign Expiry Date (Optional)</label>
                      <input type="datetime-local" value={formData.endDate} onChange={e => setFormData((p: any) => ({...p, endDate: e.target.value}))} style={inputCls} />
                    </div>
                  </div>

                </div>

                {/* Right Visual 3:4 Live Preview */}
                <div style={{ padding:'1.5rem 1.75rem', background:'rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', gap: '1.5rem', justifyContent: 'flex-start', alignItems: 'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', alignSelf: 'flex-start' }}>
                    <Eye size={14} style={{ color:'var(--violet)' }} />
                    <span style={{ fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Real-Time 3:4 preview</span>
                  </div>
                  
                  {/* Live Card Embed Preview */}
                  <MiniPreview form={formData} />

                  {/* Summary Settings Info */}
                  <div style={{ width: '100%', padding:'1rem', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'12px', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>Campaign Highlights</div>
                    {[
                      ['Link Status', formData.linkedPropertyId ? '🏡 Mapped to Property' : '🔗 Manual Link'],
                      ['Target City', formData.targetLocation === 'All' ? '🌐 All Cities' : `📍 ${formData.targetLocation}`],
                      ['Attached PDF', (formData.pdfUrl || formData.pdfSource === 'upload' && newPdfFiles.length > 0) ? '📄 Brochure Embedded' : '❌ No PDF attached'],
                      ['Priority Order', `Priority Tier ${formData.priority}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem' }}>
                        <span style={{ color:'var(--text-muted)' }}>{k}</span>
                        <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background:'rgba(245,200,66,0.03)', border:'1px solid rgba(245,200,66,0.1)',
                    borderRadius:'12px', padding:'0.85rem', display:'flex', gap:'0.5rem', width: '100%'
                  }}>
                    <AlertCircle size={14} style={{ color:'var(--gold)', flexShrink:0, marginTop:'1px' }} />
                    <p style={{ fontSize:'0.7rem', color:'rgba(245,200,66,0.6)', lineHeight:1.5, margin: 0 }}>
                      Videos and photos are pushed to the Cloudinary CDN. PDF brochures automatically open all pages scrollably in a premium user iframe.
                    </p>
                  </div>
                </div>

              </div>

              {/* Modal Footer Controls */}
              <div style={{ display:'flex', justifyContent:'flex-end', gap: '0.75rem', alignItems:'center', padding:'1rem 1.75rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ ...EMPTY_FORM }); }} 
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 size={14} style={{ animation:'spin 1s linear infinite', marginRight: '6px' }} /> Launching to Cloudinary...</>
                  ) : (
                    <><Zap size={14} style={{ marginRight: '4px' }} /> {editingId ? 'Save Changes' : 'Launch Campaign'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
