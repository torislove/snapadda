import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { 
  fetchProperties, createProperty, deleteProperty, 
  updateProperty, uploadMedia 
} from '../../services/api';
import { 
  ShieldCheck, Plus, Trash2, Star, X, 
  Search, Zap, Edit3, LayoutGrid, List, MapPin
} from 'lucide-react';
import { LivePreviewCard } from '../../components/ui/LivePreviewCard';
import { motion, AnimatePresence } from 'framer-motion';
import { parseSmartSearch, getFuzzySuggestions } from '../../services/SearchParser';

const AdminProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [customFeatures, setCustomFeatures] = useState<{label: string, value: string}[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [liveData, setLiveData] = useState<any>({});
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards');

  const handleCloseForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingProperty(null);
    setCustomFeatures([]);
    setIsVerified(false);
    setIsFeatured(false);
    setImages([]);
    setLiveData({});
    setImagePreviewUrls([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = () => {
    fetchProperties().then(data => {
      const p = data?.data || (Array.isArray(data) ? data : []);
      setProperties(p);
    }).catch(err => {
      console.error("Database connection failed:", err);
      setProperties([]);
    });
  };

  const handleEdit = (prop: any) => {
    setEditingProperty(prop);
    setCustomFeatures(prop.customFeatures || []);
    setIsVerified(prop.isVerified || false);
    setIsFeatured(prop.isFeatured || false);
    setImagePreviewUrls(prop.images || (prop.image ? [prop.image] : []));
    setLiveData(prop);
    setIsEditing(true);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const propData: any = Object.fromEntries(formData.entries());
    
    propData.customFeatures = customFeatures;
    propData.isVerified = isVerified;
    propData.isFeatured = isFeatured;

    try {
      let uploadedUrls: string[] = [...imagePreviewUrls.filter(url => url.startsWith('http'))];
      
      if (images.length > 0) {
        const uploadResult = await uploadMedia(images);
        if (uploadResult.status === 'success') {
          uploadedUrls = [...uploadedUrls, ...uploadResult.data];
        } else {
          throw new Error('Upload failed');
        }
      }

      propData.images = uploadedUrls;
      if (uploadedUrls.length > 0) propData.image = uploadedUrls[0];
      
      propData.price = Number(propData.price) || 0;
      propData.areaSize = Number(propData.areaSize) || 0;
      propData.bhk = Number(propData.bhk) || 0;

      if (isEditing && editingProperty) {
        await updateProperty(editingProperty._id || editingProperty.id, propData);
      } else {
        await createProperty(propData);
      }
      loadProperties();
      handleCloseForm();
    } catch (err: any) {
      console.error(err);
      alert('Failed to save: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const updatedData: any = Object.fromEntries(formData.entries());
    updatedData.isVerified = isVerified;
    updatedData.isFeatured = isFeatured;
    if (imagePreviewUrls.length > 0) {
      updatedData.image = imagePreviewUrls[0];
    }
    setLiveData(updatedData);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
    setLiveData((prev: any) => ({
      ...prev,
      image: previewUrls.length > 0 ? previewUrls[0] : prev.image
    }));
  };

  const filteredProperties = useMemo(() => {
    if (!search) return properties;
    
    // Smart Parsing for Natural Language
    const smart = parseSmartSearch(search);
    
    return properties.filter(p => {
      // NLP Match
      const matchesType = !smart?.type || p.type?.toLowerCase() === smart.type.toLowerCase();
      const matchesCity = !smart?.city || p.location?.toLowerCase().includes(smart.city.toLowerCase());
      const matchesMaxPrice = !smart?.maxPrice || p.price <= smart.maxPrice;
      const matchesMinPrice = !smart?.minPrice || p.price >= smart.minPrice;
      const matchesBHK = !smart?.bhk || Number(p.bhk) === Number(smart.bhk);
      
      // Keyword Match (fallback)
      const keyword = smart?.keyword || search;
      const matchesKeyword = !keyword || 
        p.title?.toLowerCase().includes(keyword.toLowerCase()) || 
        p.location?.toLowerCase().includes(keyword.toLowerCase());
        
      return (matchesType && matchesCity && matchesMaxPrice && matchesMinPrice && matchesBHK) || matchesKeyword;
    });
  }, [properties, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>✦ ASSET INTELLIGENCE</div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, background: 'linear-gradient(135deg,#fff,#9b59f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            Portfolio Command
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>Precision management of high-value real estate assets across the SnapAdda regional network.</p>
        </div>
        {!isAdding && (
          <motion.button 
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="btn btn-violet" 
            style={{ padding: '0.85rem 2rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800, boxShadow: '0 10px 20px rgba(155,89,245,0.2)' }}
          >
            <Plus size={18} /> REGISTER NEW ASSET
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '2.5rem', alignItems: 'start' }}
          >
            {/* Editor Console */}
            <div className="glass-card" style={{ padding: '3rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)' }}>
                  {isEditing ? 'Asset Modification' : 'Asset Deployment'}
                </h2>
                <button onClick={handleCloseForm} style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onChange={handleFormChange} onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                {/* Basic Intel */}
                <section>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'var(--violet)' }} /> PRIMARY INTEL
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="admin-label">Portfolio Title</label>
                      <input name="title" required defaultValue={editingProperty?.title || ''} className="admin-input" placeholder="Market-ready title for this asset..." />
                    </div>
                    <div>
                      <label className="admin-label">Geo Location / City</label>
                      <input name="location" required defaultValue={editingProperty?.location || ''} className="admin-input" placeholder="Location index" />
                    </div>
                    <div>
                      <label className="admin-label">Valuation (INR)</label>
                      <input name="price" type="number" required defaultValue={editingProperty?.price || ''} className="admin-input" placeholder="85,00,000" />
                    </div>
                  </div>
                </section>

                {/* Technical Specs */}
                <section>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'var(--emerald)' }} /> TECH SPECIFICATIONS
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label className="admin-label">Transaction Purpose</label>
                      <select name="purpose" defaultValue={editingProperty?.purpose || 'Sale'} className="admin-select">
                        <option value="Sale">For Sale (New/Resale)</option>
                        <option value="Rent">For Rent (Monthly)</option>
                        <option value="Lease">Commercial Lease</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Asset Category</label>
                      <select name="type" defaultValue={editingProperty?.type || 'Apartment'} className="admin-select">
                        <option>Apartment</option>
                        <option>Independent House</option>
                        <option>Villa</option>
                        <option>Residential Plot</option>
                        <option>Commercial Plot</option>
                        <option>Agricultural Land</option>
                        <option>Commercial Space</option>
                        <option>Farmhouse</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Vastu Orientation</label>
                      <select name="facing" defaultValue={editingProperty?.facing || 'East'} className="admin-select">
                        <option>East</option><option>West</option><option>North</option><option>South</option><option>North-East</option><option>South-West</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Radial Area</label>
                      <input name="areaSize" type="number" defaultValue={editingProperty?.areaSize || ''} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Measurement Index</label>
                      <select name="measurementUnit" defaultValue={editingProperty?.measurementUnit || 'Sq.Ft'} className="admin-select">
                        <option value="Sq.Yards">Square Yards (Plots)</option>
                        <option value="Cents">Cents (Farming)</option>
                        <option value="Acres">Acres (Agri)</option>
                        <option value="Sq.Ft">Square Feet (Apts)</option>
                        <option value="Guntas">Guntas</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Approval Authority</label>
                      <select name="approvalAuthority" defaultValue={editingProperty?.approvalAuthority || 'N/A'} className="admin-select">
                        <option value="N/A">None / Pending</option>
                        <option value="AP CRDA">AP CRDA Approved</option>
                        <option value="AP RERA">AP RERA Registered</option>
                        <option value="VMRDA">VMRDA (Visakhapatnam)</option>
                        <option value="DTCP">DTCP Approved</option>
                        <option value="Panchayat">Grama Panchayat</option>
                        <option value="Municipal">Municipal Approval</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                   <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ width: '20px', height: '1px', background: 'var(--gold)' }} /> SECURITY & CLEARANCE
                   </h3>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                     <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', border: isVerified ? '1px solid rgba(16,217,140,0.2)' : '1px solid rgba(255,255,255,0.05)', background: isVerified ? 'rgba(16,217,140,0.03)' : 'transparent' }}>
                        <input type="checkbox" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} style={{ width: '22px', height: '22px', cursor: 'pointer' }} />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isVerified ? 'var(--emerald)' : 'white' }}>TRUST SEAL</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Verified authenticity badge.</div>
                        </div>
                     </div>
                     <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', border: isFeatured ? '1px solid rgba(245,200,66,0.2)' : '1px solid rgba(255,255,255,0.05)', background: isFeatured ? 'rgba(245,200,66,0.03)' : 'transparent' }}>
                        <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '22px', height: '22px', cursor: 'pointer' }} />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isFeatured ? 'var(--gold)' : 'white' }}>ELITE STATUS</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Priority search positioning.</div>
                        </div>
                     </div>
                   </div>
                </section>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">Visual Assets</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="admin-input" style={{ padding: '12px' }} />
                  {imagePreviewUrls.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', overflowX: 'auto', paddingBottom: '10px' }}>
                      {imagePreviewUrls.map((url, idx) => (
                        <div key={idx} style={{ flexShrink: 0, width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                   <Button type="button" onClick={handleCloseForm} className="btn-ghost" style={{ flex: 1, padding: '1rem' }}>ABORT</Button>
                   <Button type="submit" disabled={isUploading} className="btn-violet" style={{ flex: 2, padding: '1rem' }}>
                    {isUploading ? 'SYNCHRONIZING...' : 'EMPLACE ASSET'}
                   </Button>
                </div>

              </form>
            </div>

            {/* Live Preview Display */}
            <div style={{ position: 'sticky', top: '2rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>
                 <div style={{ width: '6 px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 10px var(--emerald)' }} /> HOLOGRAPHIC RENDER
               </div>
               <LivePreviewCard 
                 title={liveData.title}
                 price={liveData.price}
                 location={liveData.location}
                 type={liveData.type}
                 facing={liveData.facing}
                 isVerified={isVerified}
                 listerType="Certified Builder"
                 measurementUnit={liveData.measurementUnit}
                 areaSize={liveData.areaSize}
                 image={imagePreviewUrls[0]}
               />
               <div style={{ marginTop: '2.5rem', padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                 <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                   <Zap size={16} style={{ color: 'var(--gold)', verticalAlign: 'middle', marginRight: '8px' }} />
                   Rendered using the <strong>SnapAdda Spatial Engine v2.0</strong>. This preview reflects the exact buyer perspective including 3D orientation and volumetric lighting.
                 </p>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            {/* Toolbar */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div style={{ position: 'relative', width: 'clamp(300px, 40vw, 500px)' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.8)' }} 
            />
            <input 
              type="text" 
              placeholder="Search assets (e.g. 'Flat in Guntur 50L')..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.9rem 1.2rem 0.9rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
            {search.length >= 2 && getFuzzySuggestions(search).length > 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: 'rgba(7,7,15,0.95)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px', zIndex: 100, overflow: 'hidden', backdropFilter: 'blur(15px)' }}>
                <div style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 800, background: 'rgba(212,175,55,0.05)', letterSpacing: '0.1em' }}>SUGGESTED ASSET LOCATIONS</div>
                {getFuzzySuggestions(search).map((s: any) => (
                  <button 
                    key={`${s.name}-${s.type}`}
                    onClick={() => setSearch(s.name)}
                    style={{ width: '100%', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left', cursor: 'pointer', transition: 'background 0.2s' }}
                  >
                    <MapPin size={14} style={{ color: 'var(--gold)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: '#fff' }}>{s.name}</span>
                      <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{s.type} • {s.district || 'Andhra'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
              <div style={{ display: 'flex', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '15px' }}>
                {[
                  { id: 'cards', icon: LayoutGrid },
                  { id: 'grid', icon: List }
                ].map(mode => (
                  <button 
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as any)} 
                    style={{ 
                      background: viewMode === mode.id ? 'rgba(255,255,255,0.1)' : 'transparent', 
                      border: 'none', padding: '0.6rem 0.8rem', borderRadius: '10px', 
                      color: viewMode === mode.id ? 'white' : 'var(--text-muted)', 
                      cursor: 'pointer', transition: 'all 0.2s' 
                    }}
                  >
                    <mode.icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Asset List */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: viewMode === 'grid' ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', 
              gap: '2rem' 
            }}>
              <AnimatePresence>
                {filteredProperties.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '5rem', textAlign: 'center', opacity: 0.2 }}>
                    <LayoutGrid size={60} style={{ marginBottom: '1rem' }} />
                    <p>No assets found in current sector.</p>
                  </div>
                ) : (
                  filteredProperties.map((prop, idx) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      key={prop._id || prop.id}
                      className="glass-card"
                      style={{ 
                        padding: viewMode === 'grid' ? '1.25rem 1.75rem' : '1.75rem', 
                        display: 'flex', 
                        flexDirection: viewMode === 'grid' ? 'row' : 'column',
                        gap: '1.5rem',
                        alignItems: viewMode === 'grid' ? 'center' : 'stretch',
                        borderLeft: prop.isVerified ? '4px solid var(--emerald)' : '4px solid transparent',
                        position: 'relative'
                      }}
                    >
                      {/* Media Index */}
                      <div style={{ 
                        width: viewMode === 'grid' ? '140px' : '100%', 
                        aspectRatio: viewMode === 'grid' ? '16/10' : '16/9',
                        borderRadius: '16px', overflow: 'hidden', flexShrink: 0,
                        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <img src={prop.image || 'https://via.placeholder.com/400x250?text=No+Asset+Image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                          <div>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>{prop.type} • {prop.location}</div>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)' }}>{prop.title}</h4>
                          </div>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            {prop.isVerified && <ShieldCheck size={18} style={{ color: 'var(--emerald)' }} />}
                            {prop.isFeatured && <Star size={18} fill="var(--gold)" style={{ color: 'var(--gold)' }} />}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                          <div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>MARKET VALUE</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white' }}>₹{(Number(prop.price)/100000).toFixed(1)}L</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }} onClick={() => handleEdit(prop)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '12px', color: 'white', cursor: 'pointer' }}><Edit3 size={16} /></motion.button>
                            <motion.button whileHover={{ scale: 1.1, background: 'rgba(245,57,123,0.2)' }} onClick={() => { if(window.confirm('Wipe asset data?')) deleteProperty(prop._id || prop.id).then(loadProperties); }} style={{ background: 'rgba(245,57,123,0.1)', border: 'none', padding: '10px', borderRadius: '12px', color: 'var(--rose)', cursor: 'pointer' }}><Trash2 size={16} /></motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProperties;
