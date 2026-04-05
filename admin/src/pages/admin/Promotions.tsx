import React, { useState, useEffect, useRef } from 'react';
import {
  fetchAllPromotions, createPromotion, updatePromotion,
  deletePromotion, reorderPromotions, uploadMedia
} from '../../services/api';
import {
  Plus, Trash2, Loader2,
  Sparkles,
  Zap, GripVertical, Eye, EyeOff, X, CheckCircle, AlertCircle
} from 'lucide-react';
import { MediaManager } from '../../components/ui/MediaManager';

/* ── Color map ── */
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
  festival: { label: 'Festival',    badgeColor: '#f5c842', badge: 'FEATURED EVENT' },
  ad:       { label: 'Standard Ad', badgeColor: '#9b59f5', badge: 'PROMOTION'      },
  update:   { label: 'Update',      badgeColor: '#22d9e0', badge: 'NEW UPDATE'     },
};

const EMPTY_FORM = {
  type: 'ad', title: '', subtitle: '', actionText: '', actionUrl: '',
  size: '1x1', countdownActive: false, cardColor: 'glass-dark',
  image: '', priority: 0, targetLocation: 'All', startDate: '', endDate: '',
};

/* ── Mini Live Preview ── */
const MiniPreview = ({ form }: { form: typeof EMPTY_FORM }) => (
  <div style={{
    position: 'relative', borderRadius: '14px', overflow: 'hidden',
    aspectRatio: '16/9', background: getThemeBg(form.cardColor),
    border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
  }}>
    {form.image && (
      <>
        <div style={{ position:'absolute', inset:0, backgroundImage:`url(${form.image})`, backgroundSize:'cover', backgroundPosition:'center' }} />
        <div style={{ position:'absolute', inset:0, background: getThemeBg(form.cardColor), opacity:0.7, mixBlendMode:'multiply' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }} />
      </>
    )}
    <div style={{ position:'absolute', inset:0, padding:'0.75rem', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <span style={{
        fontSize:'0.52rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
        background:'rgba(0,0,0,0.4)', color:'#fff', padding:'2px 6px', borderRadius:'4px',
        backdropFilter:'blur(4px)', alignSelf:'flex-start', border:'1px solid rgba(255,255,255,0.1)',
      }}>{TYPE_CONFIG[form.type]?.badge}</span>
      <div>
        <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:'0.2rem' }}>
          {form.title || 'Your Headline'}
        </div>
        <div style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.6)', lineHeight:1.3 }}>
          {form.subtitle || 'Subtitle here...'}
        </div>
        {form.actionText && (
          <div style={{
            marginTop:'0.4rem', fontSize:'0.55rem', fontWeight:700,
            background:'#f5c842', color:'#000', padding:'2px 8px',
            borderRadius:'99px', display:'inline-block',
          }}>{form.actionText}</div>
        )}
      </div>
    </div>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />
  </div>
);

/* ── Promotion Card in Grid ── */
const PromoCard = ({
  promo, onToggle, onDelete, onDragStart, onDragOver, onDrop, isDragging
}: any) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const cfg = TYPE_CONFIG[promo.type] || TYPE_CONFIG.ad;
  const color = COLOR_PRESETS.find(c => c.id === promo.cardColor)?.accent ?? '#71717a';

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isDragging ? color : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '18px', overflow: 'hidden',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.25s ease',
        boxShadow: isDragging ? `0 0 24px ${color}44` : 'none',
      }}
    >
      {/* Image / gradient preview strip */}
      <div style={{
        height: '120px', position: 'relative', background: getThemeBg(promo.cardColor), overflow: 'hidden',
      }}>
        {promo.image && (
          <>
            <div style={{ position:'absolute', inset:0, backgroundImage:`url(${promo.image})`, backgroundSize:'cover', backgroundPosition:'center' }} />
            <div style={{ position:'absolute', inset:0, background: getThemeBg(promo.cardColor), opacity:0.65, mixBlendMode:'multiply' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
          </>
        )}
        {/* Drag handle */}
        <div style={{
          position:'absolute', top:8, left:8, cursor:'grab',
          color:'rgba(255,255,255,0.4)', background:'rgba(0,0,0,0.3)',
          borderRadius:'6px', padding:'4px', backdropFilter:'blur(4px)',
        }}>
          <GripVertical size={14} />
        </div>
        {/* Type badge */}
        <div style={{
          position:'absolute', top:8, right:8,
          fontSize:'0.58rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
          background:'rgba(0,0,0,0.5)', color: cfg.badgeColor,
          padding:'2px 8px', borderRadius:'99px', backdropFilter:'blur(6px)',
          border:`1px solid ${cfg.badgeColor}33`,
        }}>{cfg.badge}</div>
        {/* Active indicator */}
        <div style={{
          position:'absolute', bottom:8, right:8,
          width:'8px', height:'8px', borderRadius:'50%',
          background: promo.isActive ? '#10d98c' : '#4b5563',
          boxShadow: promo.isActive ? '0 0 8px #10d98c' : 'none',
        }} />
      </div>

      {/* Card body */}
      <div style={{ padding: '0.9rem' }}>
        <div style={{ fontWeight: 600, color: '#f0eeff', fontSize: '0.88rem', marginBottom: '0.2rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {promo.title}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.75rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {promo.subtitle || 'No subtitle'}
        </div>

        {/* Chips */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem', marginBottom:'0.75rem' }}>
          {promo.targetLocation && promo.targetLocation !== 'All' && (
            <span style={{ fontSize:'0.62rem', color:'var(--cyan)', background:'var(--cyan-dim)', border:'1px solid rgba(34,217,224,0.15)', padding:'1px 7px', borderRadius:'99px', fontWeight:600 }}>
              📍{promo.targetLocation}
            </span>
          )}
          {promo.countdownActive && (
            <span style={{ fontSize:'0.62rem', color:'var(--rose)', background:'var(--rose-dim)', border:'1px solid rgba(245,57,123,0.15)', padding:'1px 7px', borderRadius:'99px', fontWeight:600 }}>
              ⏱ Limited
            </span>
          )}
          <span style={{ fontSize:'0.62rem', color:'var(--text-muted)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', padding:'1px 7px', borderRadius:'99px' }}>
            Priority {promo.priority ?? 0}
          </span>
          <span style={{ fontSize:'0.62rem', fontWeight:600, padding:'1px 7px', borderRadius:'99px', background:`${color}15`, color, border:`1px solid ${color}25` }}>
            ◉ {COLOR_PRESETS.find(c => c.id === promo.cardColor)?.label || 'Dark'}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onToggle(promo._id, promo.isActive)}
            style={{
              flex: 1, padding: '0.45rem 0', fontSize: '0.75rem', fontWeight: 600,
              borderRadius: '10px', cursor: 'pointer', border: 'none',
              background: promo.isActive ? 'rgba(16,217,140,0.1)' : 'rgba(255,255,255,0.05)',
              color: promo.isActive ? '#10d98c' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              transition: 'all 0.2s ease',
            }}
          >
            {promo.isActive ? <><Eye size={12} /> Live</> : <><EyeOff size={12} /> Hidden</>}
          </button>
          {confirmDelete ? (
            <button
              onClick={() => { onDelete(promo._id); setConfirmDelete(false); }}
              style={{
                flex: 1, padding: '0.45rem 0', fontSize: '0.75rem', fontWeight: 700,
                borderRadius: '10px', cursor: 'pointer', border: 'none',
                background: 'var(--rose)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                animation: 'pulse 0.3s ease',
              }}
            >
              <AlertCircle size={12} /> Confirm
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                padding: '0.45rem 0.65rem', fontSize: '0.75rem', fontWeight: 600,
                borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(245,57,123,0.2)',
                background: 'rgba(245,57,123,0.06)', color: 'var(--rose)',
                transition: 'all 0.2s ease',
              }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════ MAIN COMPONENT ═══════════════════════════════════════════ */
export const Promotions = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({ ...EMPTY_FORM });
  const [activeStep, setActiveStep] = useState(0);
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const dragOverIdxRef = useRef<number | null>(null);

  const steps = ['Content', 'Design', 'Targeting', 'Schedule'];

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    fetchAllPromotions()
      .then(res => setPromotions(res.data || []))
      .catch(() => showToast('Failed to load promotions', 'error'))
      .finally(() => setLoading(false));
  };

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const handleMediaChange = (urls: string[], files: File[]) => {
    setFormData((p: any) => ({ ...p, image: urls.length > 0 ? urls[0] : '' }));
    setNewImageFiles(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (newImageFiles.length > 0) {
        const res = await uploadMedia(newImageFiles);
        if (res.status === 'success' && res.data?.length > 0) {
          finalImageUrl = res.data[0];
        }
      }
      await createPromotion({ ...formData, image: finalImageUrl });
      setIsModalOpen(false);
      setFormData({ ...EMPTY_FORM });
      setNewImageFiles([]);
      setActiveStep(0);
      load();
      showToast('Campaign launched! 🚀');
    } catch { showToast('Failed to create campaign', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updatePromotion(id, { isActive: !current });
      setPromotions(ps => ps.map(p => p._id === id ? { ...p, isActive: !current } : p));
    } catch { showToast('Update failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion(id);
      setPromotions(ps => ps.filter(p => p._id !== id));
      showToast('Campaign removed');
    } catch { showToast('Delete failed', 'error'); }
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

  /* ── Input styles ── */
  const inputCls: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
    color:'#f0eeff', borderRadius:'10px', padding:'0.6rem 0.9rem', fontSize:'0.85rem',
    outline:'none',
  };

  /* ── Step Content ── */
  const StepContent = () => {
    const labelStyle: React.CSSProperties = { display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem' };
    const gapStyle: React.CSSProperties = { display:'flex', flexDirection:'column', gap:'1rem' };

    switch (activeStep) {
      case 0:
        return (
          <div style={gapStyle}>
            <div>
              <label style={labelStyle}>Card Type</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5rem' }}>
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                  <button key={k} type="button"
                    onClick={() => setFormData((p: any) => ({ ...p, type: k }))}
                    style={{
                      padding:'0.6rem 0.4rem', borderRadius:'10px', cursor:'pointer', fontSize:'0.76rem', fontWeight:600,
                      border: formData.type === k ? `1.5px solid ${v.badgeColor}` : '1px solid rgba(255,255,255,0.08)',
                      background: formData.type === k ? `${v.badgeColor}12` : 'rgba(255,255,255,0.03)',
                      color: formData.type === k ? v.badgeColor : 'var(--text-muted)',
                      transition:'all 0.2s ease',
                    }}
                  >{v.label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Headline *</label>
              <input required type="text" value={formData.title} onChange={e => setFormData((p: any) => ({...p, title: e.target.value}))} style={inputCls} placeholder="e.g. Grand Villa Launch" />
            </div>
            <div>
              <label style={labelStyle}>Subtitle</label>
              <textarea rows={2} value={formData.subtitle} onChange={e => setFormData((p: any) => ({...p, subtitle: e.target.value}))} style={{ ...inputCls, resize:'none' }} placeholder="Exclusive presale starts now." />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              <div>
                <label style={labelStyle}>CTA Text</label>
                <input type="text" value={formData.actionText} onChange={e => setFormData((p: any) => ({...p, actionText: e.target.value}))} style={inputCls} placeholder="View Details" />
              </div>
              <div>
                <label style={labelStyle}>CTA URL</label>
                <input type="text" value={formData.actionUrl} onChange={e => setFormData((p: any) => ({...p, actionUrl: e.target.value}))} style={inputCls} placeholder="/properties/..." />
              </div>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
              <div
                onClick={() => setFormData((p: any) => ({...p, countdownActive: !p.countdownActive}))}
                style={{
                  width:'38px', height:'20px', borderRadius:'99px', position:'relative',
                  background: formData.countdownActive ? 'var(--rose)' : 'rgba(255,255,255,0.1)',
                  transition:'background 0.2s', cursor:'pointer', flexShrink:0,
                }}
              >
                <div style={{
                  position:'absolute', top:'2px', width:'16px', height:'16px', borderRadius:'50%', background:'white',
                  left: formData.countdownActive ? '20px' : '2px', transition:'left 0.2s',
                }} />
              </div>
              <span style={{ fontSize:'0.83rem', color:'var(--text-secondary)' }}>Enable <strong style={{ color:'var(--rose)' }}>"Limited Time"</strong> badge</span>
            </label>
          </div>
        );

      case 1:
        return (
          <div style={gapStyle}>
            <div>
              <label style={labelStyle}>Color Theme</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.5rem' }}>
                {COLOR_PRESETS.map(c => (
                  <button key={c.id} type="button" title={c.label}
                    onClick={() => setFormData((p: any) => ({...p, cardColor: c.id}))}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'5px', background:'none', border:'none', cursor:'pointer' }}
                  >
                    <div style={{
                      width:'100%', aspectRatio:'1', borderRadius:'10px',
                      background: c.bg,
                      border: formData.cardColor === c.id ? `2.5px solid ${c.accent}` : '2px solid transparent',
                      boxShadow: formData.cardColor === c.id ? `0 0 12px ${c.accent}55` : 'none',
                      transition:'all 0.2s',
                    }} />
                    <span style={{ fontSize:'0.6rem', color: formData.cardColor === c.id ? c.accent : 'var(--text-muted)' }}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Banner Image</label>
              <MediaManager 
                existingUrls={formData.image ? [formData.image] : []}
                maxFiles={1}
                onImagesChange={handleMediaChange}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div style={gapStyle}>
            <div>
              <label style={labelStyle}>Target Location</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.4rem' }}>
                {['All', 'Amaravati', 'Vijayawada', 'Guntur', 'Visakhapatnam', 'Mangalagiri'].map(loc => (
                  <button key={loc} type="button" onClick={() => setFormData((p: any) => ({...p, targetLocation: loc}))}
                    style={{
                      padding:'0.5rem 0.4rem', borderRadius:'8px', cursor:'pointer', fontSize:'0.75rem', fontWeight:600,
                      border: formData.targetLocation === loc ? '1.5px solid var(--cyan)' : '1px solid rgba(255,255,255,0.08)',
                      background: formData.targetLocation === loc ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.02)',
                      color: formData.targetLocation === loc ? 'var(--cyan)' : 'var(--text-muted)',
                      transition:'all 0.15s',
                    }}
                  >{loc === 'All' ? '🌐 All' : loc}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Display Priority (lower = shown first)</label>
              <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
                <input type="range" min={0} max={10} value={formData.priority}
                  onChange={e => setFormData((p: any) => ({...p, priority: parseInt(e.target.value)}))}
                  style={{ flex:1, accentColor:'var(--gold)' }} />
                <span style={{ color:'var(--gold)', fontWeight:700, fontFamily:'var(--font-mono)', minWidth:'20px', textAlign:'center' }}>{formData.priority}</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div style={gapStyle}>
            <div>
              <label style={labelStyle}>Campaign Start Date</label>
              <input type="datetime-local" value={formData.startDate} onChange={e => setFormData((p: any) => ({...p, startDate: e.target.value}))} style={inputCls} />
              <p style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'4px' }}>Leave blank to go live immediately.</p>
            </div>
            <div>
              <label style={labelStyle}>Campaign Expiry Date</label>
              <input type="datetime-local" value={formData.endDate} onChange={e => setFormData((p: any) => ({...p, endDate: e.target.value}))} style={inputCls} />
              <p style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:'4px' }}>Leave blank to run indefinitely.</p>
            </div>
            <div style={{
              background:'rgba(245,200,66,0.05)', border:'1px solid rgba(245,200,66,0.15)',
              borderRadius:'10px', padding:'0.85rem', display:'flex', gap:'0.5rem',
            }}>
              <AlertCircle size={14} style={{ color:'var(--gold)', flexShrink:0, marginTop:'1px' }} />
              <p style={{ fontSize:'0.75rem', color:'rgba(245,200,66,0.7)', lineHeight:1.5 }}>
                Campaigns auto-deactivate after the expiry date. The banner stops appearing to clients automatically.
              </p>
            </div>
          </div>
        );

      default: return null;
    }
  };

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div style={{ minHeight:'100%', display:'flex', flexDirection:'column', gap:'1.5rem', position:'relative' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position:'fixed', bottom:'24px', right:'24px', zIndex:9999,
          padding:'0.75rem 1.25rem', borderRadius:'12px', display:'flex', alignItems:'center', gap:'8px',
          background: toast.type === 'success' ? 'rgba(16,217,140,0.12)' : 'rgba(245,57,123,0.12)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,217,140,0.3)' : 'rgba(245,57,123,0.3)'}`,
          color: toast.type === 'success' ? 'var(--emerald)' : 'var(--rose)',
          backdropFilter:'blur(12px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
          animation:'fadeInUp 0.3s ease-out',
          fontWeight: 600, fontSize:'0.85rem',
        }}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.25rem', fontFamily:'var(--font-mono)' }}>✦ Campaign Manager</div>
          <h1 style={{ fontSize:'1.8rem', background:'linear-gradient(135deg,#f5c842,#e8820c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'0.2rem' }}>
            Active Promotions
          </h1>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>
            Drag cards to reorder · Toggle live status · Upload images
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setActiveStep(0); setFormData({ ...EMPTY_FORM }); }}
          className="btn btn-gold"
        >
          <Plus size={15} /> New Promotion
        </button>
      </div>

      {/* ── Cards Grid ── */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'1rem' }}>
          {[1,2,3].map(i => <div key={i} style={{ height:'220px', borderRadius:'18px', background:'var(--bg-glass)', border:'1px solid var(--border)', animation:'pulse 1.5s infinite' }} />)}
        </div>
      ) : promotions.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem 2rem', borderRadius:'20px', border:'1.5px dashed rgba(255,255,255,0.08)', textAlign:'center' }}>
          <Sparkles size={32} style={{ color:'var(--text-muted)', marginBottom:'1rem' }} />
          <h3 style={{ color:'var(--text-secondary)', fontFamily:'var(--font-body)', marginBottom:'0.5rem' }}>No campaigns yet</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', maxWidth:'280px' }}>Create your first campaign to override static defaults on the client dashboard.</p>
          <button onClick={() => setIsModalOpen(true)} className="btn btn-ghost btn-sm" style={{ marginTop:'1.25rem' }}>
            <Plus size={13} /> Create Campaign
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'1rem' }}>
          {promotions.map((promo, idx) => (
            <PromoCard
              key={promo._id}
              promo={promo}
              isDragging={dragSrcIdx === idx}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={() => handleDragOver(idx)}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {/* ════════════════ CREATION MODAL ════════════════ */}
      {isModalOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:9000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
          background:'rgba(0,0,0,0.88)', backdropFilter:'blur(16px)',
        }}>
          <div style={{
            width:'100%', maxWidth:'900px', maxHeight:'92vh',
            display:'flex', flexDirection:'column',
            background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.09)',
            borderRadius:'24px', overflow:'hidden',
            boxShadow:'0 32px 80px rgba(0,0,0,0.7)',
          }}>
            {/* Modal header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.75rem', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'var(--gold-dim)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Sparkles size={16} style={{ color:'var(--gold)' }} />
                </div>
                <div>
                  <div style={{ color:'var(--text-primary)', fontWeight:700, fontSize:'1rem', lineHeight:1 }}>Create Campaign</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginTop:'2px' }}>Live preview updates as you type</div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ color:'var(--text-muted)', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex' }}>
                <X size={18} />
              </button>
            </div>

            {/* Step tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'0 1.75rem' }}>
              {steps.map((s, i) => (
                <button key={s} type="button" onClick={() => setActiveStep(i)}
                  style={{
                    padding:'0.9rem 1rem', fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
                    border:'none', background:'none',
                    color: i === activeStep ? 'var(--gold)' : 'var(--text-muted)',
                    borderBottom: i === activeStep ? '2px solid var(--gold)' : '2px solid transparent',
                    transition:'all 0.2s',
                  }}
                >
                  <span style={{ opacity:0.4, marginRight:'4px', fontSize:'0.65rem' }}>{String(i+1).padStart(2,'0')}</span>{s}
                </button>
              ))}
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'1fr 1fr' }}>
                {/* Left: Form step */}
                <div style={{ padding:'1.5rem 1.75rem', borderRight:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ marginBottom:'1.25rem' }}>
                    <h3 style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:600, color:'var(--text-primary)', marginBottom:'2px' }}>{steps[activeStep]}</h3>
                    <p style={{ fontSize:'0.73rem', color:'var(--text-muted)' }}>
                      {['Set the text and actions for this banner.','Choose the visual style and upload an image.','Control who sees this and where.','Set a go-live date and auto-expiry.'][activeStep]}
                    </p>
                  </div>
                  <StepContent />
                </div>
                {/* Right: Live preview */}
                <div style={{ padding:'1.5rem 1.75rem', background:'rgba(0,0,0,0.2)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'1rem' }}>
                    <Eye size={13} style={{ color:'var(--violet)' }} />
                    <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)' }}>Live Preview</span>
                  </div>
                  <MiniPreview form={formData} />
                  <div style={{ marginTop:'1rem', padding:'0.85rem', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'10px', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {[
                      ['Target', formData.targetLocation === 'All' ? '🌐 All Locations' : `📍 ${formData.targetLocation}`],
                      ['Priority', String(formData.priority)],
                      ['Color', COLOR_PRESETS.find(c => c.id === formData.cardColor)?.label || 'Dark'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem' }}>
                        <span style={{ color:'var(--text-muted)' }}>{k}</span>
                        <span style={{ color:'var(--text-primary)', fontWeight:500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.75rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', gap:'5px' }}>
                  {steps.map((_, i) => (
                    <div key={i} style={{ height:'3px', borderRadius:'99px', background: i === activeStep ? 'var(--gold)' : 'rgba(255,255,255,0.08)', width: i === activeStep ? '20px' : '10px', transition:'all 0.3s' }} />
                  ))}
                </div>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  {activeStep > 0 && (
                    <button type="button" onClick={() => setActiveStep(s => s - 1)} className="btn btn-ghost btn-sm">← Back</button>
                  )}
                  {activeStep < steps.length - 1 ? (
                    <button type="button" onClick={() => setActiveStep(s => s + 1)} className="btn btn-gold btn-sm" disabled={!formData.title}>Next →</button>
                  ) : (
                    <button type="submit" className="btn btn-gold" disabled={isSubmitting || !formData.title}>
                      {isSubmitting ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Launching...</> : <><Zap size={14} /> Launch Campaign</>}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
