import React, { useState, useEffect, useRef } from 'react';
import {
  fetchAllPromotions, createPromotion, updatePromotion,
  reorderPromotions, uploadMedia, sendPushNotification
} from '../../services/api';
import {
  Plus, Loader2,
  Sparkles,
  TrendingUp, MousePointer2, Calendar,
  Zap, GripVertical, Eye, EyeOff, X, AlertCircle, Building
} from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import { 
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
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
  type: 'ad', title: '', subtitle: '', actionText: '', actionUrl: '',
  size: '1x1', countdownActive: false, cardColor: 'glass-dark',
  image: '', mediaSettings: [] as { url: string; objectFit: 'cover' | 'contain' }[], 
  priority: 0, targetLocation: 'All', startDate: '', endDate: '',
  displaySegment: 'both', linkedPropertyId: '',
  videoUrl: '', pdfUrl: '', videoSource: 'url', pdfSource: 'url'
};

/* ── Mini Live Preview ── */
const MiniPreview = ({ form }: { form: typeof EMPTY_FORM }) => (
  <div style={{
    position: 'relative', borderRadius: '14px', overflow: 'hidden',
    aspectRatio: '16/9', background: getThemeBg(form.cardColor),
    border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
  }}>
    {(form.image || form.videoUrl) && (
      <>
        {(isVideoUrl(form.image) || isVideoUrl(form.videoUrl)) ? (
          <video 
            src={form.videoUrl || form.image} 
            autoPlay muted loop playsInline 
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} 
          />
        ) : (
          <div style={{ 
            position:'absolute', inset:0, 
            backgroundImage:`url(${form.image})`, 
            backgroundSize: form.mediaSettings?.find(s => s.url === form.image)?.objectFit === 'contain' ? 'contain' : 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition:'center' 
          }} />
        )}
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
        {form.title && (
          <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#fff', lineHeight:1.2, marginBottom:'0.2rem' }}>
            {form.title}
          </div>
        )}
        {form.subtitle && (
          <div style={{ fontSize:'0.58rem', color:'rgba(255,255,255,0.6)', lineHeight:1.3 }}>
            {form.subtitle}
          </div>
        )}
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

/* ── Analytics Helpers ── */
const calculateCTR = (views: number = 0, clicks: number = 0) => {
  if (!views) return '0%';
  return ((clicks / views) * 100).toFixed(1) + '%';
};

/* ── Promotion Card in Grid ── */
const PromoCard = ({
  promo, onToggle, onEdit, onDragStart, onDragOver, onDrop, isDragging
}: any) => {
  const cfg = TYPE_CONFIG[promo.type] || TYPE_CONFIG.ad;
  const color = COLOR_PRESETS.find(c => c.id === promo.cardColor)?.accent ?? '#71717a';
  
  const stats = promo.stats || { views: 0, clicks: 0 };
  const ctr = calculateCTR(stats.views, stats.clicks);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDrop={onDrop}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${isDragging ? color : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '24px', overflow: 'hidden',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isDragging ? `0 20px 40px ${color}33` : '0 4px 20px rgba(0,0,0,0.2)',
        position: 'relative'
      }}
    >
      {/* Image / gradient preview strip */}
      <div style={{
        height: '120px', position: 'relative', background: getThemeBg(promo.cardColor), overflow: 'hidden',
      }}>
        {promo.image && (
          <>
            {isVideoUrl(promo.image) ? (
              <video 
                src={promo.image} 
                autoPlay muted loop playsInline
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} 
              />
            ) : (
              <div style={{ 
                position:'absolute', inset:0, 
                backgroundImage:`url(${promo.image})`, 
                backgroundSize: promo.mediaSettings?.find((s: any) => s.url === promo.image)?.objectFit === 'contain' ? 'contain' : 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition:'center' 
              }} />
            )}
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

        {/* Analytics Overlay Toggle */}
        <div style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div title="Views">
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Views</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{stats.views.toLocaleString()}</div>
            </div>
            <div title="Clicks">
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Clicks</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold)' }}>{stats.clicks.toLocaleString()}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CTR</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10d98c' }}>{ctr}</div>
          </div>
        </div>

        {/* Schedule Info */}
        {(promo.startDate || promo.endDate) && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.65rem', 
            color: 'rgba(255,255,255,0.4)',
            marginBottom: '1rem',
            padding: '4px 8px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '6px'
          }}>
            <Calendar size={10} />
            <span>
              {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'Now'} 
              {' → '} 
              {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Forever'}
            </span>
          </div>
        )}

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
          <button
            onClick={() => onEdit(promo)}
            style={{
              padding: '0.45rem 0.65rem', fontSize: '0.75rem', fontWeight: 600,
              borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            Edit
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

/* ── Step Content ── */
const StepContent = ({ activeStep, formData, setFormData, handleMediaChange }: { 
  activeStep: number; 
  formData: any; 
  setFormData: any; 
  handleMediaChange: any; 
}) => {
  const labelStyle: React.CSSProperties = { display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem' };
  const gapStyle: React.CSSProperties = { display:'flex', flexDirection:'column', gap:'1rem' };

  switch (activeStep) {
    case 0:
      return (
        <div style={gapStyle}>
          <div>
            <label style={labelStyle}>Card Type</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(80px, 1fr))', gap:'0.5rem' }}>
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
            <label style={labelStyle}>Headline (Optional)</label>
            <input type="text" value={formData.title} onChange={e => setFormData((p: any) => ({...p, title: e.target.value}))} style={inputCls} placeholder="e.g. Grand Villa Launch" />
          </div>
          <div>
            <label style={labelStyle}>Subtitle</label>
            <textarea rows={2} value={formData.subtitle} onChange={e => setFormData((p: any) => ({...p, subtitle: e.target.value}))} style={{ ...inputCls, resize:'none' }} placeholder="Exclusive presale starts now." />
          </div>
          <div className="responsive-form-grid" style={{ display:'grid', gap:'0.75rem' }}>
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
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(60px, 1fr))', gap:'0.5rem' }}>
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
            <label style={labelStyle}>Banner Image (Cloudinary Optimized)</label>
            <MediaManager 
              existingUrls={formData.image ? [formData.image] : []}
              existingSettings={formData.mediaSettings || []}
              maxFiles={1}
              onImagesChange={handleMediaChange}
            />
            <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'6px' }}>Recommended: 1200x1600px (3:4 Ratio) or 1920x1080px (16:9). Max 2MB.</p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <label style={labelStyle}>Background Video</label>
            <div style={{ display:'flex', gap:'8px', marginBottom:'0.75rem' }}>
              {['url', 'upload'].map(s => (
                <button key={s} type="button" onClick={() => setFormData((p: any) => ({ ...p, videoSource: s }))}
                  style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', border: formData.videoSource === s ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: formData.videoSource === s ? 'rgba(232,184,75,0.1)' : 'transparent', color: formData.videoSource === s ? 'var(--gold)' : 'var(--text-muted)' }}
                >{s}</button>
              ))}
            </div>
            {formData.videoSource === 'url' ? (
              <input type="text" value={formData.videoUrl} onChange={e => setFormData((p: any) => ({...p, videoUrl: e.target.value}))} style={inputCls} placeholder="Direct MP4 URL..." />
            ) : (
              <MediaManager 
                existingUrls={formData.videoUrl ? [formData.videoUrl] : []}
                maxFiles={1}
                onImagesChange={(urls) => setFormData((p: any) => ({...p, videoUrl: urls[0] || ''}))}
              />
            )}
            <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'6px' }}>Specs: MP4 format, &lt; 10MB. Vertical for cards, Horizontal for pages.</p>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <label style={labelStyle}>Venture Brochure (PDF)</label>
            <div style={{ display:'flex', gap:'8px', marginBottom:'0.75rem' }}>
              {['url', 'upload'].map(s => (
                <button key={s} type="button" onClick={() => setFormData((p: any) => ({ ...p, pdfSource: s }))}
                  style={{ flex:1, padding:'6px', borderRadius:'6px', fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', border: formData.pdfSource === s ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', background: formData.pdfSource === s ? 'rgba(232,184,75,0.1)' : 'transparent', color: formData.pdfSource === s ? 'var(--gold)' : 'var(--text-muted)' }}
                >{s}</button>
              ))}
            </div>
            {formData.pdfSource === 'url' ? (
              <input type="text" value={formData.pdfUrl} onChange={e => setFormData((p: any) => ({...p, pdfUrl: e.target.value}))} style={inputCls} placeholder="Direct PDF URL..." />
            ) : (
              <MediaManager 
                existingUrls={formData.pdfUrl ? [formData.pdfUrl] : []}
                maxFiles={1}
                onImagesChange={(urls) => setFormData((p: any) => ({...p, pdfUrl: urls[0] || ''}))}
              />
            )}
            <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'6px' }}>Specs: Optimized PDF brochures only. &lt; 5MB.</p>
          </div>
        </div>
      );

    case 2:
      return (
        <div style={gapStyle}>
          <div>
            <label style={labelStyle}>Target Location</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(100px, 1fr))', gap:'0.4rem' }}>
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
              <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem' }}>Notification Title</label>
              <input value={pushForm.title} onChange={e => setPushForm({...pushForm, title: e.target.value})} style={inputCls} placeholder="New Property Alert! 🏡" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem' }}>Message Body</label>
              <textarea rows={3} value={pushForm.body} onChange={e => setPushForm({...pushForm, body: e.target.value})} style={{ ...inputCls, resize: 'none' }} placeholder="A new 3BHK Villa is available in Vijayawada..." />
            </div>
            <div className="responsive-form-grid" style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem' }}>Image URL (Optional)</label>
                <input value={pushForm.imageUrl} onChange={e => setPushForm({...pushForm, imageUrl: e.target.value})} style={inputCls} placeholder="https://..." />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem' }}>Redirect Link</label>
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

/* ═══════════════════════════════════════════ MAIN COMPONENT ═══════════════════════════════════════════ */
export const Promotions = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<any>({ ...EMPTY_FORM });
  const [activeTab, setActiveTab] = useState<'campaigns' | 'push'>('campaigns');
  const [activeStep, setActiveStep] = useState(0);
  const [dragSrcIdx, setDragSrcIdx] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();
  const dragOverIdxRef = useRef<number | null>(null);

  const steps = ['Content', 'Design', 'Targeting', 'Schedule'];

  const statsData = promotions.map(p => ({
    name: p.title.length > 10 ? p.title.substring(0, 8) + '...' : p.title,
    views: p.stats?.views || 0,
    clicks: p.stats?.clicks || 0,
    ctr: parseFloat(calculateCTR(p.stats?.views, p.stats?.clicks))
  })).sort((a, b) => b.views - a.views).slice(0, 6);

  const totalViews = promotions.reduce((sum, p) => sum + (p.stats?.views || 0), 0);
  const totalClicks = promotions.reduce((sum, p) => sum + (p.stats?.clicks || 0), 0);
  const avgCTR = calculateCTR(totalViews, totalClicks);

  /* ── No longer need local showToast implementation as we use useToast hook ── */

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    fetchAllPromotions()
      .then(res => setPromotions(res.data || []))
      .catch(() => showToast('Failed to load promotions', 'error'))
      .finally(() => setLoading(false));
  };

  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

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
    if (!formData.image && !formData.videoUrl) {
      showToast('Either Photo or Video is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      let finalImageUrl = formData.image;
      if (newImageFiles.length > 0) {
        const res = await uploadMedia(newImageFiles);
        if (res.status === 'success' && res.data?.length > 0) {
          finalImageUrl = res.data[0];
        }
      }
      
      const payload = { ...formData, image: finalImageUrl };
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
      setActiveStep(0);
      load();
    } catch { showToast(editingId ? 'Failed to update' : 'Failed to create', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleEdit = (promo: any) => {
    setEditingId(promo._id);
    setFormData({
      type: promo.type || 'ad',
      title: promo.title || '',
      subtitle: promo.subtitle || '',
      actionText: promo.actionText || '',
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
      pdfSource: (promo.pdfUrl || promo.documentUrl)?.includes('cloudinary') ? 'upload' : 'url'
    });
    setActiveStep(0);
    setIsModalOpen(true);
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updatePromotion(id, { isActive: !current });
      setPromotions(ps => ps.map(p => p._id === id ? { ...p, isActive: !current } : p));
    } catch { showToast('Update failed', 'error'); }
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

  /* ═══════════════════ RENDER ═══════════════════ */
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
          <div className="responsive-form-grid" style={{ 
            display: 'grid', 
            gap: '1rem' 
          }}>
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
            💡 <strong>Help:</strong> Manage visual banners and marketing offers. Banners appear on the home page and property listings to drive engagement.
          </p>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.25rem', fontFamily:'var(--font-mono)' }}>✦ Campaign Manager</div>
            <h1 style={{ fontSize:'1.8rem', background:'linear-gradient(135deg,#f5c842,#e8820c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'0.2rem' }}>
              {activeTab === 'campaigns' ? 'Active Promotions' : 'Push Notifications'}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => setActiveTab('campaigns')}
                style={{ background: 'none', border: 'none', padding: '4px 0', borderBottom: activeTab === 'campaigns' ? '2px solid var(--gold)' : '2px solid transparent', color: activeTab === 'campaigns' ? 'white' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Dashboard Banners
              </button>
              <button 
                onClick={() => setActiveTab('push')}
                style={{ background: 'none', border: 'none', padding: '4px 0', borderBottom: activeTab === 'push' ? '2px solid var(--gold)' : '2px solid transparent', color: activeTab === 'push' ? 'white' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Push Broadcast
              </button>
            </div>
          </div>

        {activeTab === 'campaigns' && (
          <button
            onClick={() => { setIsModalOpen(true); setEditingId(null); setActiveStep(0); setFormData({ ...EMPTY_FORM }); }}
            className="btn btn-gold"
          >
            <Plus size={15} /> New Promotion
          </button>
        )}
      </div>

      {activeTab === 'push' ? (
        <PushBroadcast showToast={showToast} />
      ) : (
        <>
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
                  onEdit={handleEdit}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={() => handleDragOver(idx)}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          )}
        </>
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
                  <div style={{ color:'var(--text-primary)', fontWeight:700, fontSize:'1rem', lineHeight:1 }}>{editingId ? 'Edit Campaign' : 'Create Campaign'}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.72rem', marginTop:'2px' }}>Live preview updates as you type</div>
                </div>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} style={{ color:'var(--text-muted)', cursor:'pointer', padding:'6px', borderRadius:'8px', display:'flex' }}>
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
                  <StepContent 
  activeStep={activeStep} 
  formData={formData} 
  setFormData={setFormData}
  handleMediaChange={handleMediaChange}
/>

                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <label style={{ display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--gold)', marginBottom:'0.75rem' }}>Campaign Targeting Tier</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['hero', 'floating', 'both'].map(seg => (
                        <button key={seg} type="button" onClick={() => setFormData((p: any) => ({ ...p, displaySegment: seg }))}
                          style={{
                            flex: 1, padding: '0.6rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                            border: formData.displaySegment === seg ? '1.5px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
                            background: formData.displaySegment === seg ? 'rgba(232,184,75,0.1)' : 'transparent',
                            color: formData.displaySegment === seg ? 'var(--gold)' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >{seg}</button>
                      ))}
                    </div>
                  </div>
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
                    <button type="button" onClick={() => setActiveStep(s => s + 1)} className="btn btn-gold btn-sm">Next →</button>
                  ) : (
                    <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Processing...</> : <><Zap size={14} /> {editingId ? 'Save Changes' : 'Launch Campaign'}</>}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
);
};

export default Promotions;
