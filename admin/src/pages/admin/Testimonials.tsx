import React, { useState, useEffect } from 'react';
import {
  fetchTestimonials, createTestimonial, updateTestimonial,
  deleteTestimonial, uploadMedia
} from '../../services/api';
import {
  Plus, Loader2, X, Trash2,
  Quote, Star, Edit3, User
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';

/* ── Color map ── */
const COLOR_PRESETS = [
  { id: '#6b4226', label: 'Earthy', bg: 'linear-gradient(135deg,#6b4226,#3a2212)', accent: '#b97a4d' },
  { id: '#1e3a5f', label: 'Ocean', bg: 'linear-gradient(135deg,#1e3a5f,#0f172a)', accent: '#60a5fa' },
  { id: '#064e3b', label: 'Emerald', bg: 'linear-gradient(135deg,#064e3b,#022c22)', accent: '#34d399' },
  { id: '#18181b', label: 'Midnight', bg: 'linear-gradient(135deg,#18181b,#09090b)', accent: '#71717a' },
];

const EMPTY_FORM = {
  name: '', location: '', text: '', rating: 5, image: '', color: '#6b4226',
};

const TestimonialCard = ({
  testimonial, onEdit
}: any) => {
  const colorObj = COLOR_PRESETS.find(c => c.id === testimonial.color) || COLOR_PRESETS[0];

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: '24px', overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}
    >
      <div style={{
        height: '80px', position: 'relative', background: colorObj.bg, overflow: 'hidden',
      }}>
         <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
         <Quote size={32} style={{ position: 'absolute', right: 16, top: 16, opacity: 0.15, color: 'white' }} />
      </div>

      <div style={{ padding: '1rem', position: 'relative' }}>
        <img
          src={testimonial.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=random`}
          alt={testimonial.name}
          style={{ width: '64px', height: '64px', borderRadius: '20px', objectFit: 'cover', position: 'absolute', top: '-32px', border: '4px solid #0f0f1a', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}
        />
        <div style={{ marginTop: '36px' }}>
          <div style={{ fontWeight: 800, color: 'white', fontSize: '1rem', marginBottom: '4px' }}>
            {testimonial.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
            📍 {testimonial.location || 'Verified Client'}
          </div>
          <div style={{ display: 'flex', gap: '3px', marginBottom: '1rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} size={12} fill={star <= testimonial.rating ? '#f5c842' : 'transparent'} color={star <= testimonial.rating ? '#f5c842' : 'rgba(255,255,255,0.1)'} />
              ))}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1.25rem', fontStyle: 'italic', lineHeight: 1.6 }}>
            "{testimonial.text}"
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onEdit(testimonial)}
              style={{
                flex: 1, padding: '0.6rem', fontSize: '0.8rem', fontWeight: 700,
                borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: 'white',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <Edit3 size={14} /> Edit
            </button>
            <button
              onClick={() => { if(window.confirm('Delete this review?')) testimonial.onDelete(testimonial._id); }}
              style={{
                padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(244,63,94,0.2)',
                background: 'rgba(244,63,94,0.05)', color: 'var(--rose)',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Trash2 size={14} />
            </button>
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<any>({ ...EMPTY_FORM });
  const { showToast, ToastComponent } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    fetchTestimonials()
      .then(res => setTestimonials(res.data || []))
      .catch(() => showToast('Failed to retrieve reviews', 'error'))
      .finally(() => setLoading(false));
  };

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploadingImage(true);
    try {
      const res = await uploadMedia(Array.from(files));
      if (res.urls?.length) setFormData((p: any) => ({ ...p, image: res.urls[0] }));
      else if (res.data?.length) setFormData((p: any) => ({ ...p, image: res.data[0] }));
    } catch { showToast('Profile photo upload failed', 'error'); }
    finally { setUploadingImage(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id);
      showToast('Testimonial removed from server.');
      load();
    } catch { showToast('Failed to delete review.', 'error'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.text) return;
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateTestimonial(editingId, formData);
        showToast('Testimonial synchronized! ✨');
      } else {
        await createTestimonial(formData);
        showToast('New review published to landing page! 📣');
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });
      load();
    } catch { showToast('Database synchronization failed', 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleEdit = (t: any) => {
    setEditingId(t._id);
    setFormData({
      name: t.name || '',
      location: t.location || '',
      text: t.text || '',
      rating: t.rating || 5,
      image: t.image || '',
      color: t.color || '#6b4226',
    });
    setIsModalOpen(true);
  };

  const inputCls: React.CSSProperties = {
    width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
    color:'white', borderRadius:'12px', padding:'0.75rem 1rem', fontSize:'0.9rem',
    outline:'none', transition: 'border 0.2s'
  };

  const labelStyle: React.CSSProperties = { display:'block', fontSize:'0.7rem', fontWeight:900, letterSpacing:'0.05em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:'0.5rem' };
  
  return (
    <div style={{ position:'relative' }}>
      <ToastComponent />

      <div style={{ background: 'rgba(242,153,74,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(242,153,74,0.1)', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--orange)', fontWeight: 600 }}>
          💡 <strong>Help:</strong> Testimonials build trust. Manage user reviews here to showcase client satisfaction on your home page.
        </p>
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize:'1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Quote style={{ color: 'var(--orange)' }} size={28} /> Client Feedback
          </h1>
          <p style={{ fontSize:'0.9rem', color:'var(--text-muted)', marginTop: '4px' }}>
            Voices of trust from our community.
          </p>
        </div>
        <Button
          onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ ...EMPTY_FORM }); }}
          className="btn-3d-liquid" style={{ background: 'var(--orange)', color: 'white', border: 'none', fontWeight: 900 }}
        >
          <Plus size={18} /> NEW REVIEW
        </Button>
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'1.5rem' }}>
          {[1,2,3].map(i => <div key={i} className="glass-card" style={{ height:'240px', animation:'pulse 1.5s infinite' }} />)}
        </div>
      ) : testimonials.length === 0 ? (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'5rem 2rem', borderRadius:'24px', border:'1.5px dashed rgba(255,255,255,0.08)', textAlign:'center' }}>
          <Quote size={40} style={{ color:'var(--text-muted)', marginBottom:'1.5rem', opacity: 0.3 }} />
          <h3 style={{ color:'white', marginBottom:'0.5rem', fontSize: '1.25rem' }}>Silence in the grid...</h3>
          <p style={{ color:'var(--text-muted)', fontSize:'0.9rem', maxWidth:'320px' }}>Add your first client success story to start building authority.</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:'1.5rem' }}>
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial._id}
              testimonial={{ ...testimonial, onDelete: handleDelete }}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Simplified Modal */}
      {isModalOpen && (
        <div style={{
          position:'fixed', inset:0, zIndex:9000,
          display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
          background:'rgba(0,0,0,0.85)', backdropFilter:'blur(20px)',
        }}>
          <div style={{
            width:'100%', maxWidth:'520px',
            background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'28px', overflow:'hidden',
            boxShadow:'0 40px 100px rgba(0,0,0,0.8)',
          }}>
            <div style={{ padding:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Quote style={{ color: 'var(--orange)' }} size={20} />
                <h2 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 800 }}>{editingId ? 'Edit Review' : 'New Feedback'}</h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); setEditingId(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                   <div style={{ width:'72px', height:'72px', borderRadius:'22px', overflow: 'hidden', border:'2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                      {formData.image ? (
                        <img src={formData.image} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      ) : (
                        <div style={{ width:'100%', height:'100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={32} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
                        </div>
                      )}
                   </div>
                   <label style={{ position:'absolute', bottom:'-8px', right:'-8px', width:'28px', height:'28px', borderRadius:'50%', background:'var(--orange)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#000', border: '3px solid #0f0f1a' }}>
                     {uploadingImage ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/> : <Plus size={14}/>}
                     <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleImageUpload(e.target.files)}/>
                   </label>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <input required type="text" value={formData.name} onChange={e => setFormData((p: any) => ({...p, name: e.target.value}))} style={inputCls} placeholder="Client Name *" />
                  <input type="text" value={formData.location} onChange={e => setFormData((p: any) => ({...p, location: e.target.value}))} style={inputCls} placeholder="Location (e.g. Vijayawada)" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Review Text</label>
                <textarea required rows={4} value={formData.text} onChange={e => setFormData((p: any) => ({...p, text: e.target.value}))} style={{ ...inputCls, resize:'none' }} placeholder="What was their experience like?" />
              </div>

              <div className="responsive-form-grid" style={{ display: 'grid', gap: '1.25rem' }}>
                 <div>
                    <label style={labelStyle}>Star Rating</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       {[1,2,3,4,5].map(s => (
                         <button type="button" key={s} onClick={() => setFormData((p:any)=>({...p, rating: s}))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                           <Star size={24} fill={s <= formData.rating ? '#f5c842' : 'transparent'} color={s <= formData.rating ? '#f5c842' : 'rgba(255,255,255,0.1)'} />
                         </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label style={labelStyle}>Theme Preset</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       {COLOR_PRESETS.map(c => (
                         <button type="button" key={c.id} title={c.label} onClick={() => setFormData((p:any) => ({...p, color: c.id}))} style={{ width: '28px', height: '28px', borderRadius: '8px', background: c.id, border: formData.color === c.id ? '2px solid white' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }} />
                       ))}
                    </div>
                 </div>
              </div>

              <Button type="submit" disabled={isSubmitting || uploadingImage || !formData.name || !formData.text} className="btn-3d-liquid" style={{ background: 'var(--orange)', color: 'white', fontWeight: 900, marginTop: '0.5rem' }}>
                {isSubmitting ? 'Synchronizing...' : (editingId ? 'Update Feedback' : 'Publish Review')}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
