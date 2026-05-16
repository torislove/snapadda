import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Phone, Mail, Search, Upload, Plus, Edit3, MessageCircle, X, Building2, User, Filter, FileSpreadsheet, Check, StickyNote, Share2, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ConnectivityBanner } from '../../components/ui/ConnectivityBanner';
import { fetchContactStats, updateContact, addContactNote } from '../../services/api';
import { locationService } from '../../services/locationService';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type Contact = {
  _id: string; name: string; phone: string; email: string; type: 'Realtor' | 'Client';
  company: string; location: string; district: string;
  notes: { text: string; addedAt: string; addedBy: string }[];
  isStarred: boolean; tags: string[]; source: string;
  whatsappSent: { count: number; lastSent?: string };
  realtorCode: string; licenseNo: string; photo: string;
  createdAt: string;
  communicationHistory?: any[];
};

const ContactCard = ({ contact, onStar, onBroadcast, onEdit, onPromoteToLead }: {
  contact: Contact; onStar: () => void; onBroadcast: () => void; onEdit: () => void; onPromoteToLead: (c: Contact) => void;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)', padding: '20px', position: 'relative',
      borderLeft: contact.isStarred ? '3px solid var(--accent-gold)' : '3px solid transparent',
      transition: 'all 0.3s'
    }}
  >
    <button onClick={onStar} style={{
      position: 'absolute', top: '14px', right: '14px', background: 'none', color: contact.isStarred ? 'var(--accent-gold)' : 'var(--text-muted)',
      cursor: 'pointer', transition: 'color 0.2s', padding: '4px'
    }}>
      <Star size={18} fill={contact.isStarred ? 'var(--accent-gold)' : 'none'} />
    </button>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%',
        background: contact.type === 'Realtor' ? 'rgba(201,168,76,0.2)' : 'rgba(91,126,161,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: contact.type === 'Realtor' ? 'var(--accent-gold)' : '#5b7ea1', fontWeight: 700,
      }}>
        {contact.name.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{contact.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
            background: contact.type === 'Realtor' ? 'rgba(201,168,76,0.15)' : 'rgba(91,126,161,0.15)',
            color: contact.type === 'Realtor' ? 'var(--accent-gold)' : '#5b7ea1',
          }}>
            {contact.type === 'Realtor' ? <Building2 size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> : <User size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />}
            {contact.type}
          </span>
          {contact.source === 'Excel' && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '8px' }}>
              <FileSpreadsheet size={9} style={{ verticalAlign: 'middle', marginRight: '2px' }} />Excel
            </span>
          )}
        </div>
      </div>
    </div>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
        <Phone size={13} /> {contact.phone}
      </div>
      {contact.email && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
          <Mail size={13} /> {contact.email}
        </div>
      )}
      {contact.company && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{contact.company}</div>
      )}
      {contact.location && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {contact.location}{contact.district ? `, ${contact.district}` : ''}</div>
      )}
    </div>

    {contact.tags && contact.tags.length > 0 && (
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {contact.tags.map((tag, i) => (
          <span key={i} style={{
            fontSize: '0.68rem', padding: '2px 8px', borderRadius: '10px',
            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)'
          }}>{tag}</span>
        ))}
      </div>
    )}

    {contact.whatsappSent?.count > 0 && (
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
        📤 {contact.whatsappSent.count} WhatsApp messages sent
      </div>
    )}

    <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
      <Button size="sm" style={{ flex: 1, backgroundColor: 'var(--accent-gold)', borderColor: 'var(--accent-gold)', color: '#000', fontSize: '0.78rem', fontWeight: 800 }} onClick={onBroadcast}>
        <MessageCircle size={13} style={{ marginRight: '4px' }} /> Broadcast
      </Button>
      <Button size="sm" variant="outline" onClick={onEdit} style={{ fontSize: '0.78rem' }}>
        <Edit3 size={14} />
      </Button>
      <Button size="sm" variant="outline" onClick={() => {
        const text = `👤 *${contact.name}*\n📞 ${contact.phone}\n📧 ${contact.email || 'N/A'}\n🏢 ${contact.company || 'N/A'}\n📍 ${contact.location || 'N/A'}\n\n_Shared via SnapAdda CRM_`;
        navigator.clipboard.writeText(text);
        toast.success('Contact details copied to clipboard!');
      }} style={{ fontSize: '0.78rem' }}>
        <Share2 size={13} />
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={(e) => { e.stopPropagation(); onPromoteToLead(contact); }}
        style={{ fontSize: '0.72rem', borderColor: 'var(--emerald)', color: 'var(--emerald)', background: 'rgba(16,217,140,0.05)' }}
      >
        <Zap size={12} style={{ marginRight: '4px' }} /> Lead
      </Button>
    </div>
  </motion.div>
);

const AdminContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [broadcastContact, setBroadcastContact] = useState<Contact | null>(null);
  const [broadcastChannel, setBroadcastChannel] = useState<'WhatsApp' | 'Email' | 'Both'>('Both');
  const [broadcastProps, setBroadcastProps] = useState<string[]>([]);
  const [waProperties, setWaProperties] = useState<any[]>([]);
  const [noteText, setNoteText] = useState('');
  const [stats, setStats] = useState({ realtors: 0, clients: 0, whatsappSent: 0, newThisWeek: 0 });
  const fileRef = useRef<HTMLInputElement>(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [villages, setVillages] = useState<string[]>([]);

  const handlePincodeChange = async (code: string) => {
    setFormData(p => ({ ...p, location: code })); // Temporarily using location field for pincode or adding one
    if (code.length === 6) {
      setPincodeLoading(true);
      const data = await locationService.fetchByPincode(code);
      if (data) {
        setVillages(data.allVillages);
        setFormData(p => ({
          ...p,
          district: data.district,
          location: data.mandal,
        }));
      }
      setPincodeLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', type: 'Client' as 'Realtor' | 'Client',
    company: '', location: '', district: '', tags: ''
  });

  useEffect(() => {
    fetchContactStats().then(setStats).catch(() => {});
    fetch(`${API_URL}/properties?limit=100`).then(r => r.json()).then(d => setWaProperties(d?.data || [])).catch(() => {});
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchContacts(); }, [filter, searchQuery]);

  const fetchContacts = async () => {
    try {
      const params = new URLSearchParams();
      if (filter === 'Realtor' || filter === 'Client') params.set('type', filter);
      if (filter === 'starred') params.set('starred', 'true');
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`${API_URL}/contacts?${params}`);
      const data = await res.json();
      if (data.status === 'success') setContacts(data.data);
    } catch { } finally { setLoading(false); }
  };

  const handleStar = async (id: string) => {
    await fetch(`${API_URL}/contacts/${id}/star`, { method: 'PUT' });
    fetchContacts();
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, tags: formData.tags ? formData.tags.split(',').map((t: string) => t.trim()) : [] };
    await fetch(`${API_URL}/contacts`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setShowAddModal(false);
    setFormData({ name: '', phone: '', email: '', type: 'Client', company: '', location: '', district: '', tags: '' });
    fetchContactStats().then(setStats).catch(() => {});
    fetchContacts();
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    await updateContact(editingContact._id, editingContact);
    setEditingContact(null);
    fetchContacts();
  };

  const handleBroadcast = async (contact: Contact) => {
    try {
      const res = await fetch(`${API_URL}/contacts/${contact._id}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: broadcastChannel,
          propertyIds: broadcastProps
        })
      });
      const data = await res.json();
      if (data.status === 'success' && data.whatsappText) {
        window.open(`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(data.whatsappText)}`, '_blank');
      }
      setBroadcastContact(null);
      setBroadcastProps([]);
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromoteToLead = async (contact: Contact) => {
    if (!window.confirm(`Promote ${contact.name} to Active Lead?`)) return;
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          district: contact.district || contact.location,
          source: 'CRM Promotion',
          priority: 'Normal',
          message: `Contact promoted from CRM (${contact.type}). Notes: ${(contact.notes||[]).map(n => n.text).join(' | ')}`
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        toast.success('Successfully promoted to Lead pipeline');
      }
    } catch (err) {
      toast.error('Promotion failed');
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadResult(null);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_URL}/contacts/bulk`, { method: 'POST', body: fd });
      const data = await res.json();
      setUploadResult(`✅ ${data.message || `Imported ${data.imported} contacts`}`);
      fetchContacts();
    } catch {
      setUploadResult('❌ Upload failed. Check your Excel format.');
    }
  };

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'Realtor', label: 'Realtors' },
    { key: 'Client', label: 'Clients' },
    { key: 'starred', label: '⭐ Starred' },
  ];

  return (
    <div>
      <ConnectivityBanner />

      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '12px', marginBottom: '1.5rem' }}>
        {[
          { label: 'Realtors', value: stats.realtors, color: 'var(--accent-gold)', icon: '🏢' },
          { label: 'Clients', value: stats.clients, color: '#5b7ea1', icon: '👤' },
          { label: 'WA Sent', value: stats.whatsappSent, color: '#25D366', icon: '💬' },
          { label: 'New This Week', value: stats.newThisWeek, color: 'var(--emerald)', icon: '✨' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--spacing-xl)' }}>
        <h1>CRM Contacts</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm" variant="outline" onClick={() => setShowUploadModal(true)}>
            <Upload size={14} /> Upload Excel
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Contact
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)', padding: '8px 16px',
        }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            id="admin-contacts-search"
            type="text" placeholder="Search contacts..." value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
              background: filter === f.key ? 'var(--accent-gold-dim)' : 'var(--bg-secondary)',
              color: filter === f.key ? 'var(--accent-gold)' : 'var(--text-muted)',
              border: `1px solid ${filter === f.key ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
              transition: 'all 0.2s'
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {contacts.length} contacts
        </div>
      </div>

      {/* Contact Cards Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: '220px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Filter size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <h3 style={{ fontFamily: 'var(--font-body)', marginBottom: '8px' }}>No contacts found</h3>
          <p>Add your first realtor or client contact, or upload an Excel sheet.</p>
        </div>
      ) : (
        <motion.div
          layout
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-lg)' }}
        >
          <AnimatePresence>
            {contacts.map(c => (
              <ContactCard
                key={c._id} contact={c}
                onStar={() => handleStar(c._id)}
                onBroadcast={() => { setBroadcastContact(c); setBroadcastProps([]); }}
                onEdit={() => setEditingContact({ ...c })}
                onPromoteToLead={handlePromoteToLead}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
              padding: '32px', maxWidth: '500px', width: '100%', border: '1px solid var(--border-subtle)',
              maxHeight: '85vh', overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Add Contact</h2>
              <button onClick={() => setShowAddModal(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['Client', 'Realtor'] as const).map(t => (
                  <button key={t} type="button" onClick={() => setFormData(p => ({ ...p, type: t }))} style={{
                    flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600,
                    background: formData.type === t ? (t === 'Realtor' ? 'rgba(201,168,76,0.15)' : 'rgba(91,126,161,0.15)') : 'var(--bg-tertiary)',
                    color: formData.type === t ? (t === 'Realtor' ? 'var(--accent-gold)' : '#5b7ea1') : 'var(--text-muted)',
                    border: `1px solid ${formData.type === t ? (t === 'Realtor' ? 'var(--border-gold)' : 'rgba(91,126,161,0.4)') : 'var(--border-subtle)'}`,
                    transition: 'all 0.2s'
                  }}>
                    {t === 'Realtor' ? <Building2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> : <User size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />}
                    {t}
                  </button>
                ))}
              </div>
              <input placeholder="Name *" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              <input placeholder="Phone *" required value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
              <input placeholder="Email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
              {formData.type === 'Realtor' && (
                <input placeholder="Company / Agency" value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} />
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    placeholder="Pincode" 
                    maxLength={6}
                    value={formData.location} 
                    onChange={e => handlePincodeChange(e.target.value)} 
                    style={{ width: '100%', border: pincodeLoading ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)' }}
                  />
                  {pincodeLoading && <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.6rem', color: 'var(--accent-gold)' }}>Loading...</div>}
                </div>
                <input placeholder="District" value={formData.district} onChange={e => setFormData(p => ({ ...p, district: e.target.value }))} style={{ flex: 1 }} />
              </div>
              
              {villages.length > 0 && (
                <select 
                  className="admin-select"
                  value={formData.location.includes(',') ? formData.location.split(',')[0] : ''}
                  onChange={(e) => setFormData(p => ({ ...p, location: `${e.target.value}, ${formData.location}` }))}
                  style={{ width: '100%', background: 'rgba(16,217,140,0.05)', borderColor: 'rgba(16,217,140,0.2)', fontSize: '0.85rem' }}
                >
                  <option value="">-- Select Village / Locality --</option>
                  {villages.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
              <input placeholder="Tags (comma separated)" value={formData.tags} onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))} />
              <Button type="submit" style={{ width: '100%' }}>
                <Check size={16} /> Save Contact
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)',
              padding: '32px', maxWidth: '480px', width: '100%', border: '1px solid var(--border-subtle)',
              textAlign: 'center'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Upload Excel</h2>
              <button onClick={() => { setShowUploadModal(false); setUploadResult(null); }} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}><X size={20} /></button>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: '2px dashed var(--border-gold)', borderRadius: 'var(--radius-lg)',
                padding: '40px 20px', cursor: 'pointer', marginBottom: '16px',
                background: 'rgba(201,168,76,0.05)', transition: 'background 0.2s'
              }}
            >
              <FileSpreadsheet size={40} style={{ color: 'var(--accent-gold)', marginBottom: '12px' }} />
              <p style={{ fontWeight: 600, marginBottom: '4px' }}>Click to select .xlsx file</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Excel should have columns: Name, Phone, Email, Type (Realtor/Client)
              </p>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} hidden />
            </div>

            {uploadResult && (
              <div style={{
                padding: '12px', borderRadius: 'var(--radius-md)',
                background: uploadResult.includes('✅') ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)',
                color: uploadResult.includes('✅') ? 'var(--success)' : 'var(--error)',
                fontSize: '0.9rem', fontWeight: 500
              }}>
                {uploadResult}
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              Auto-detects columns like: Name, Phone/Mobile, Email, Type/Category, Company, Location, District
            </p>
          </motion.div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingContact && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px' }}>
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            style={{ background:'var(--bg-secondary)',borderRadius:'var(--radius-lg)',padding:'32px',maxWidth:'500px',width:'100%',border:'1px solid var(--border-subtle)',maxHeight:'85vh',overflowY:'auto' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px' }}>
              <h2 style={{ margin:0 }}>Edit Contact</h2>
              <button onClick={() => setEditingContact(null)} style={{ background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer' }}><X size={20}/></button>
            </div>
            <form onSubmit={handleEditSave} style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
              <input placeholder="Name" required value={editingContact.name} onChange={e => setEditingContact(p => p ? {...p,name:e.target.value} : p)} />
              <input placeholder="Phone" required value={editingContact.phone} onChange={e => setEditingContact(p => p ? {...p,phone:e.target.value} : p)} />
              <input placeholder="Email" value={editingContact.email||''} onChange={e => setEditingContact(p => p ? {...p,email:e.target.value} : p)} />
              <input placeholder="Company / Agency" value={editingContact.company||''} onChange={e => setEditingContact(p => p ? {...p,company:e.target.value} : p)} />
              <div style={{ display:'flex',gap:'8px' }}>
                <input placeholder="Location" value={editingContact.location||''} onChange={e => setEditingContact(p => p ? {...p,location:e.target.value} : p)} style={{ flex:1 }} />
                <input placeholder="District" value={editingContact.district||''} onChange={e => setEditingContact(p => p ? {...p,district:e.target.value} : p)} style={{ flex:1 }} />
              </div>
              <input placeholder="RERA License" value={editingContact.licenseNo||''} onChange={e => setEditingContact(p => p ? {...p,licenseNo:e.target.value} : p)} />
              <input placeholder="Realtor Code" value={editingContact.realtorCode||''} onChange={e => setEditingContact(p => p ? {...p,realtorCode:e.target.value} : p)} />
              
              {/* Notes thread & Comm Log */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin Notes</label>
                  {(editingContact.notes||[]).length > 0 && (
                    <div style={{ background:'var(--bg-tertiary)',borderRadius:'10px',padding:'12px',maxHeight:'150px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px', marginTop: '4px' }}>
                      {editingContact.notes.map((n,i) => (
                        <div key={i} style={{ fontSize:'0.78rem',color:'var(--text-secondary)',borderBottom:'1px solid var(--border-subtle)',paddingBottom:'6px' }}>
                          <span style={{ fontWeight:700,color:'var(--text-primary)' }}>{n.addedBy}</span>: {n.text}
                          <span style={{ marginLeft:'8px',color:'var(--text-muted)',fontSize:'0.68rem' }}>{new Date(n.addedAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display:'flex',gap:'8px', marginTop: '8px' }}>
                    <input placeholder="Add note..." value={noteText} onChange={e => setNoteText(e.target.value)} style={{ flex:1 }}
                      onKeyDown={e => { if(e.key==='Enter'){ e.preventDefault(); if(noteText.trim()){ addContactNote(editingContact._id,noteText).then(()=>setNoteText('')); }}}} />
                    <Button type="button" size="sm" onClick={() => { if(noteText.trim()){ addContactNote(editingContact._id,noteText).then(()=>setNoteText('')); }}}><StickyNote size={14}/></Button>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Communication Log</label>
                  <div style={{ background:'var(--bg-tertiary)',borderRadius:'10px',padding:'12px',maxHeight:'150px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'8px', marginTop: '4px' }}>
                    {/* @ts-ignore */}
                    {(editingContact.communicationHistory || []).length > 0 ? (
                      /* @ts-ignore */
                      editingContact.communicationHistory.map((log: any, i: number) => (
                        <div key={i} style={{ fontSize:'0.75rem',color:'var(--text-secondary)',borderBottom:'1px solid var(--border-subtle)',paddingBottom:'6px' }}>
                          <span style={{ fontWeight:800, color: log.channel==='WhatsApp'?'#25D366':(log.channel==='Email'?'#5b7ea1':'var(--accent-gold)') }}>[{log.channel}]</span>
                          <span style={{ marginLeft: '4px' }}>Sent {log.propertiesSent?.length || 0} properties</span>
                          <div style={{ color:'var(--text-muted)',fontSize:'0.65rem', marginTop: '2px' }}>{new Date(log.sentAt).toLocaleString()} by {log.sentBy}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No broadcasts sent yet.</div>
                    )}
                  </div>
                </div>
              </div>

              <Button type="submit" style={{ width:'100%', marginTop: '10px' }}><Check size={16}/> Save Changes</Button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Broadcast Property Modal */}
      {broadcastContact && (
        <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px' }}>
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            style={{ background:'var(--bg-secondary)',borderRadius:'var(--radius-lg)',padding:'32px',maxWidth:'520px',width:'100%',border:'1px solid var(--border-subtle)' }}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px' }}>
              <h2 style={{ margin:0,fontSize:'1.2rem' }}>Broadcast to {broadcastContact.name}</h2>
              <button onClick={() => setBroadcastContact(null)} style={{ background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer' }}><X size={20}/></button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              {(['WhatsApp', 'Email', 'Both'] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setBroadcastChannel(ch)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', border: 'none',
                    background: broadcastChannel === ch ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                    color: broadcastChannel === ch ? '#000' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>

            <div style={{ display:'flex',flexDirection:'column',gap:'14px' }}>
              <div>
                <label style={{ fontSize:'0.75rem',fontWeight:700,color:'var(--text-muted)',display:'block',marginBottom:'6px' }}>SELECT PROPERTIES TO SEND</label>
                <div style={{ background:'var(--bg-tertiary)', border:'1px solid var(--border-subtle)', borderRadius:'10px', maxHeight:'250px', overflowY:'auto', padding:'10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {waProperties.map((p:any) => (
                    <label key={p._id||p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      <input 
                        type="checkbox" 
                        checked={broadcastProps.includes(p._id||p.id)}
                        onChange={(e) => {
                          if (e.target.checked) setBroadcastProps([...broadcastProps, p._id||p.id]);
                          else setBroadcastProps(broadcastProps.filter(id => id !== (p._id||p.id)));
                        }}
                      />
                      <span>
                        <strong>{p.title}</strong> <span style={{ color: 'var(--text-muted)' }}>({p.location}) - ₹{(p.price/100000).toFixed(1)}L</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={() => handleBroadcast(broadcastContact)} style={{ width:'100%',background:'var(--accent-gold)',borderColor:'var(--accent-gold)',color:'#000',fontWeight:900, marginTop: '10px' }}>
                <MessageCircle size={16}/> Send Broadcast ({broadcastProps.length} selected)
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
