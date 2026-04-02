import React, { useState, useEffect } from 'react';
import {
  fetchTestimonials, createTestimonial,
  deleteTestimonial, uploadMedia
} from '../../services/api';
import {
  Plus, Trash2, Loader2, X,
  Zap, CheckCircle, AlertCircle, Quote, Star
} from 'lucide-react';

/* ── Color map ── */
const COLOR_PRESETS = [
  { id: '#6b4226', label: 'Earthy Brown', bg: 'linear-gradient(135deg,#6b4226,#3a2212)', accent: '#b97a4d' },
  { id: '#1e3a5f', label: 'Deep Ocean', bg: 'linear-gradient(135deg,#1e3a5f,#0f172a)', accent: '#60a5fa' },
  { id: '#064e3b', label: 'Forest', bg: 'linear-gradient(135deg,#064e3b,#022c22)', accent: '#34d399' },
  { id: '#18181b', label: 'Midnight', bg: 'linear-gradient(135deg,#18181b,#09090b)', accent: '#71717a' },
];

const EMPTY_FORM = {
  name: '', location: '', text: '', rating: 5, image: '', color: '#6b4226',
};

const TestimonialCard = ({
  testimonial, onDelete
}: any) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const colorObj = COLOR_PRESETS.find(c => c.id === testimonial.color) || COLOR_PRESETS[0];

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: '18px', overflow: 'hidden',
        transition: 'all 0.25s ease',
      }}
    >
      <div style={{
        height: '60px', position: 'relative', background: colorObj.bg, overflow: 'hidden',
      }}>
         <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
         <Quote size={24} style={{ position: 'absolute', right: 12, top: 18, opacity: 0.1, color: 'white' }} />
      </div>

      <div style={{ padding: '0.9rem', position: 'relative' }}>
        <img
          src={testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`}
          alt={testimonial.name}
          style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: '-28px', border: '3px solid #18181b' }}
        />
        <div style={{ marginTop: '28px' }}>
          <div style={{ fontWeight: 600, color: '#f0eeff', fontSize: '0.88rem', marginBottom: '0.2rem' }}>
            {testimonial.name}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            {testimonial.location || 'Client'}
          </div>
          <div style={{ display: 'flex', gap: '2px', marginBottom: '0.75rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={11} fill={star <= testimonial.rating ? '#e8b84b' : 'transparent'} color={star <= testimonial.rating ? '#e8b84b' : 'var(--text-muted)'} />
              ))}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            "{testimonial.text}"
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {confirmDelete ? (
              <button
                onClick={() => { onDelete(testimonial._id); setConfirmDelete(false); }}
                style={{
                  flex: 1, padding: '0.45rem 0', fontSize: '0.75rem', fontWeight: 700,
                  borderRadius: '10px', cursor: 'pointer', border: 'none',
                  background: 'var(--rose)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  animation: 'pulse 0.3s ease',
                }}
              >
                <AlertCircle size={12} /> Confirm Deletion
              </button>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  padding: '0.45rem', fontSize: '0.75rem', fontWeight: 600, width: '100%',
                  borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(245,57,123,0.2)',
                  background: 'rgba(245,57,123,0.06)', color: 'var(--rose)',
                  transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<any>({ ...EMPTY_FORM });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    fetchTestimonials()
      .then(res => setTestimonials(res.data || []))
      .catch(() => showToast('Failed to load testimonials', 'error'))
      .finally(() => setLoading(false));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingImage(true);
    try {
      const res = await uploadMedia(Array.from(files));
      if (res.urls?.length) setFormData((p: any) => ({ ...p, image: res.urls[0] }));
    } catch { showToast('Image upload failed', 'error'); }
    finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.text) return;
    setIsSubmitting(true);
    try {
      await createTestimonial(formData);
      setIsModalOpen(false);
      setFormData({ ...EMPTY_FORM });
      load();
      showToast('Testimonial added! ✨');
    } catch { showToast('Failed to create testimonial', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id);
      setTestimonials(ps => ps.filter(p => p._id !== id));
      showToast('Testimonial removed');
    } catch { showToast('Delete failed', 'error'); }
  };

  const inputCls: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)',
    color:'#f0eeff', borderRadius:'10px', padding:'0.6rem 0.9rem', fontSize:'0.85rem',
    outline:'none',
  };

  const labelStyle: React.CSSProperties = { display:'block', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.45rem' };
  
  return (
    <div style={{ minHeight:'100%', display:'flex', flexDirection:'column', gap:'1.5rem', position:'relative' }}>

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

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <div style={{ fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--orange)', marginBottom:'0.25rem', fontFamily:'var(--font-mono)' }}>✦ Client Feedback</div>
          <h1 style={{ fontSize:'1.8rem', background:'linear-gradient(135deg,#f2994a,#f2c94c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:'0.2rem' }}>
            Testimonials
          </h1>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>
            Manage the user reviews and testimonials shown on the homepage.
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setFormData({ ...EMPTY_FORM }); }}
          className="btn" style={{ background: 'var(--orange)', color: 'white', border: 'none' }}
        >
          <Plus size={15} /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'1rem' }}>
          {[1,2,3].map(i => <div key={i} style={{ height:'180px', borderRadius:'18px', background:'var(--bg-glass)', border:'1px solid var(--border)', animation:'pulse 1.5s infinite' }} />)}
        </div>
      ) : testimonials.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem 2rem', borderRadius:'20px', border:'1.5px dashed rgba(255,255,255,0.08)', textAlign:'center' }}>
          <Quote size={32} style={{ color:'var(--text-muted)', marginBottom:'1rem' }} />
          <h3 style={{ color:'var(--text-secondary)', fontFamily:'var(--font-body)', marginBottom:'0.5rem' }}>No testimonials yet</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.83rem', maxWidth:'280px' }}>Add voices from your best clients to build trust on your landing page.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'1.5rem' }}>
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial._id}
              testimonial={testimonial}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:9000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
          background:'rgba(0,0,0,0.88)', backdropFilter:'blur(16px)',
        }}>
          <div style={{
            width:'100%', maxWidth:'600px',
            background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.09)',
            borderRadius:'20px', overflow:'hidden',
            boxShadow:'0 32px 80px rgba(0,0,0,0.7)',
          }}>
            <div style={{ padding:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Quote style={{ color: 'var(--orange)' }} size={20} />
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>New Testimonial</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                   <img
                     src={formData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name||'User')}&background=random`}
                     alt="avatar"
                     style={{ width:'64px', height:'64px', borderRadius:'50%', objectFit:'cover', border:'2px solid var(--border)' }}
                   />
                   <label style={{ position:'absolute', bottom:'-5px', right:'-5px', width:'26px', height:'26px', borderRadius:'50%', background:'var(--orange)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                     {uploadingImage ? <Loader2 size={12} style={{ animation:'spin 1s linear infinite' }}/> : <Plus size={12}/>}
                     <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleImageUpload(e.target.files)}/>
                   </label>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <input required type="text" value={formData.name} onChange={e => setFormData((p: any) => ({...p, name: e.target.value}))} style={inputCls} placeholder="Reviewer Name *" />
                  <input type="text" value={formData.location} onChange={e => setFormData((p: any) => ({...p, location: e.target.value}))} style={{...inputCls, padding: '0.4rem 0.9rem'}} placeholder="Location (e.g. Hyderabad, India)" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Testimonial Text *</label>
                <textarea required rows={4} value={formData.text} onChange={e => setFormData((p: any) => ({...p, text: e.target.value}))} style={{ ...inputCls, resize:'none' }} placeholder="What did they say about SnapAdda?" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                 <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Rating (1-5)</label>
                    <select value={formData.rating} onChange={e => setFormData((p: any) => ({...p, rating: parseInt(e.target.value)}))} style={inputCls}>
                       <option value={5}>5 Stars</option>
                       <option value={4}>4 Stars</option>
                       <option value={3}>3 Stars</option>
                       <option value={2}>2 Stars</option>
                       <option value={1}>1 Star</option>
                    </select>
                 </div>
                 <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Theme Color</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                       {COLOR_PRESETS.map(c => (
                         <button type="button" key={c.id} title={c.label} onClick={() => setFormData((p:any) => ({...p, color: c.id}))} style={{ width: '28px', height: '28px', borderRadius: '50%', background: c.id, border: formData.color === c.id ? '2px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }} />
                       ))}
                    </div>
                 </div>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn" style={{ background: 'var(--orange)', color: 'white', border: 'none' }} disabled={isSubmitting || uploadingImage || !formData.name || !formData.text}>
                  {isSubmitting ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Saving...</> : <><Zap size={14} /> Add Testimonial</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
