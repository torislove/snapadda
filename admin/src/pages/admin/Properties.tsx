import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { 
  fetchProperties, createProperty, deleteProperty, 
  updateProperty, uploadMedia 
} from '../../services/api';
import { 
  ShieldCheck, Plus, Trash2, Star, X, 
  Search, Zap, Edit3, LayoutGrid, List, MapPin, Heart, Share2
} from 'lucide-react';
import { LivePreviewCard } from '../../components/ui/LivePreviewCard';
import { motion, AnimatePresence } from 'framer-motion';
import { parseSmartSearch, getFuzzySuggestions } from '../../services/SearchParser';
import { MediaManager } from '../../components/ui/MediaManager';
import { 
  formatSnapAddaPrice, 
  formatLandSize, 
  smartAreaConverter, 
  acresCentsToDecimal,
  decomposeAcres
} from '../../../../client/src/utils/priceUtils';

const AdminProperties = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [customFeatures, setCustomFeatures] = useState<{label: string, value: string}[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [liveData, setLiveData] = useState<any>({});
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [priceUnit, setPriceUnit] = useState<'Total' | 'Lakhs' | 'Cr'>('Total');
  const [pricePerAcreUnit, setPricePerAcreUnit] = useState<'Total' | 'Lakhs' | 'Cr'>('Lakhs');
  const [agriAcres, setAgriAcres] = useState<number | string>('');
  const [agriCents, setAgriCents] = useState<number | string>('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards');

  const addCustomFeature = () => {
    setCustomFeatures([...customFeatures, { label: '', value: '' }]);
  };

  const removeCustomFeature = (index: number) => {
    setCustomFeatures(customFeatures.filter((_, i) => i !== index));
  };

  const updateCustomFeature = (index: number, key: 'label' | 'value', val: string) => {
    const updated = [...customFeatures];
    updated[index][key] = val;
    setCustomFeatures(updated);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingProperty(null);
    setCustomFeatures([]);
    setIsVerified(false);
    setIsFeatured(false);
    setNewImageFiles([]);
    setCurrentImageUrls([]);
    setLiveData({});
    setPriceUnit('Total');
    setPricePerAcreUnit('Total');
    setAgriAcres('');
    setAgriCents('');
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
    const existing = prop.images || (prop.image ? [prop.image] : []);
    setCurrentImageUrls(existing);
    setLiveData(prop);
    
    // Auto-detect unit for price
    if (prop.price >= 10000000) setPriceUnit('Cr');
    else if (prop.price >= 100000) setPriceUnit('Lakhs');
    else setPriceUnit('Total');

    if (prop.pricePerAcre >= 10000000) setPricePerAcreUnit('Cr');
    else if (prop.pricePerAcre >= 100000) setPricePerAcreUnit('Lakhs');
    else setPricePerAcreUnit('Total');

    // Sync agri components
    if (prop.type === 'Agricultural Land' && prop.totalAcres) {
      const { acres, cents } = decomposeAcres(prop.totalAcres);
      setAgriAcres(acres);
      setAgriCents(cents);
    }

    setIsEditing(true);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleGenerateAIDescription = async () => {
    if (!liveData.title || !liveData.location) {
      alert("Please enter a Title and Location first to help the AI.");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/generate-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          details: {
            title: liveData.title,
            location: liveData.location,
            features: JSON.stringify(customFeatures),
            price: liveData.price
          }
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setLiveData((prev: any) => ({ ...prev, description: data.data }));
        // Manually update the textarea value if needed, but liveData binding should handle it
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const formatPriceAdminLocal = (price: number | string) => {
    return formatSnapAddaPrice(Number(price));
  };

  const formatLandSizeAdmin = (totalAcres: number) => {
    return formatLandSize(totalAcres);
  };

  const getAgriTotalDecimal = () => {
    return acresCentsToDecimal(Number(agriAcres), Number(agriCents));
  };

  const agriAutoValuation = () => {
    const ta = getAgriTotalDecimal();
    const ppa = convertToValue(liveData.pricePerAcre || 0, pricePerAcreUnit);
    if (!ta || !ppa) return 0;
    return Math.round(ta * Number(ppa));
  };

  const convertToValue = (val: number | string, unit: string) => {
    const n = Number(val) || 0;
    if (unit === 'Cr') return n * 10000000;
    if (unit === 'Lakhs') return n * 100000;
    return n;
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
      let uploadedUrls: string[] = [...currentImageUrls];
      
      // STAGE 1: Media Upload
      if (newImageFiles.length > 0) {
        setIsUploading(true); // Ensure loading state is on for upload
        try {
          const uploadResult = await uploadMedia(newImageFiles);
          if (uploadResult.status === 'success') {
            uploadedUrls = [...uploadedUrls, ...uploadResult.data];
          } else {
            throw new Error(uploadResult.message || 'Media server rejected the files');
          }
        } catch (mediaErr: any) {
          console.error("Media Upload Failure:", mediaErr);
          alert(`MEDIA UPLOAD FAILED: ${mediaErr.message || "Cloudinary connection issue"}\n\nTIP: Try with fewer images or check your internet connection.`);
          setIsUploading(false);
          return; // Stop here if upload fails
        }
      }

      // STAGE 2: Property Data Save
      setIsUploading(true);
      try {
        // Convert unit-based prices before submission
        propData.price = convertToValue(propData.price, priceUnit);
        propData.pricePerAcre = convertToValue(propData.pricePerAcre, pricePerAcreUnit);

        // For agricultural land, combine acres + cents into totalAcres decimal
        if (liveData.type === 'Agricultural Land') {
          propData.totalAcres = getAgriTotalDecimal();
          // If price not set but pricePerAcre and totalAcres exist, auto-calculate
          if (!propData.price && propData.pricePerAcre && propData.totalAcres) {
            propData.price = Math.round(Number(propData.pricePerAcre) * Number(propData.totalAcres));
          }
        } else {
          propData.totalAcres = Number(propData.totalAcres) || 0;
        }

        propData.images = uploadedUrls;
        if (uploadedUrls.length > 0) propData.image = uploadedUrls[0];
        
        propData.areaSize = Number(propData.areaSize) || 0;
        propData.bhk = Number(propData.bhk) || 0;
        propData.carpetArea = Number(propData.carpetArea) || 0;
        propData.superBuiltupArea = Number(propData.superBuiltupArea) || 0;
        propData.totalFloors = Number(propData.totalFloors) || 0;
        propData.floorNo = Number(propData.floorNo) || 0;
        propData.vastuCompliant = !!propData.vastuCompliant;
        propData.cornerProperty = !!propData.cornerProperty;
        propData.boundaryWall = !!propData.boundaryWall;
        propData.googleMapsLink = propData.googleMapsLink || '';
        propData.surveyNo = propData.surveyNo || '';
        propData.waterSource = propData.waterSource || 'N/A';
        propData.roadType = propData.roadType || 'N/A';

        const payload = {
          ...propData,
          customFeatures,
          isVerified,
          isFeatured,
          images: uploadedUrls,
          image: uploadedUrls.length > 0 ? uploadedUrls[0] : null
        };

        if (isEditing && editingProperty) {
          await updateProperty(editingProperty._id || editingProperty.id, payload);
        } else {
          await createProperty(payload);
        }
        
        loadProperties();
        handleCloseForm();
      } catch (saveErr: any) {
        console.error("Database Save Failure:", saveErr);
        const serverMsg = saveErr.response?.data?.message || saveErr.message;
        alert(`PROPERTY SAVE FAILED: ${serverMsg}\n\nTIP: Ensure all required fields (Title, Price, Location) are filled correctly.`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const updatedData: any = Object.fromEntries(formData.entries());
    
    // Explicitly sync state-based values that FormData might miss or delay
    updatedData.price = convertToValue(updatedData.price, priceUnit);
    updatedData.pricePerAcre = convertToValue(updatedData.pricePerAcre, pricePerAcreUnit);
    updatedData.isVerified = isVerified;
    updatedData.isFeatured = isFeatured;
    updatedData.images = currentImageUrls;
    updatedData.image = currentImageUrls.length > 0 ? currentImageUrls[0] : (liveData.image || '');
    
    setLiveData(updatedData);
  };

  // Re-sync preview when auxiliary states change
  useEffect(() => {
    let previewImage = currentImageUrls.length > 0 ? currentImageUrls[0] : '';
    // If no existing image, and there's a new file, show it
    if (!previewImage && newImageFiles.length > 0) {
      previewImage = URL.createObjectURL(newImageFiles[0]);
    }

    setLiveData((prev: any) => ({
      ...prev,
      isVerified,
      isFeatured,
      images: currentImageUrls,
      image: previewImage || (prev.image || '')
    }));
  }, [isVerified, isFeatured, currentImageUrls, newImageFiles]);

  const handleMediaChange = (urls: string[], files: File[]) => {
    setCurrentImageUrls(urls);
    setNewImageFiles(files);
    
    // If we have an existing URL, use it. Otherwise, if we have a new file, create a temporary preview.
    let previewImage = urls.length > 0 ? urls[0] : '';
    if (!previewImage && files.length > 0) {
      previewImage = URL.createObjectURL(files[0]);
    }

    setLiveData((prev: any) => ({
      ...prev,
      image: previewImage || (prev.image || '')
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
      <div className="flex-row-mobile-stack" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--gold)', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>✦ ASSET INTELLIGENCE</div>
          <h1 style={{ lineHeight: 1.2, fontWeight: 800, background: 'linear-gradient(135deg,#fff,#9b59f5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
            Property Command
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>Simple management of property assets across the SnapAdda regional network.</p>
        </div>
        {!isAdding && (
          <div className="flex-row-mobile-stack" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={() => { setLiveData({ type: 'Apartment' }); setIsAdding(true); }}
              className="btn btn-ghost" 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--violet)', color: 'var(--violet)' }}
            >
              + ADD FLAT
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              onClick={() => { setLiveData({ type: 'Agricultural Land' }); setIsAdding(true); }}
              className="btn btn-ghost" 
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--emerald)', color: 'var(--emerald)' }}
            >
              + ADD LAND
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsAdding(true)}
              className="btn btn-violet" 
              style={{ padding: '0.85rem 2rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 800, boxShadow: '0 10px 20px rgba(155,89,245,0.2)' }}
            >
              <Plus size={18} /> ADD ANY PROPERTY
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isAdding ? (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="admin-grid-1-2"
          >
            {/* Editor Console */}
            <div className="glass-card" style={{ padding: '3rem', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)' }}>
                  {isEditing ? 'Modify Property' : 'Add Property'}
                </h2>
                <button onClick={handleCloseForm} style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form key={isEditing ? 'edit' : 'add'} onChange={handleFormChange} onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                
                <section>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'var(--violet)' }} /> STEP 1: CLASSIFICATION
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                      <label className="admin-label">Property Type</label>
                      <select name="type" defaultValue={editingProperty?.type || 'Apartment'} className="admin-select">
                        <optgroup label="Residential">
                          <option>Apartment</option>
                          <option>Independent House</option>
                          <option>Villa</option>
                          <option>Residential Plot</option>
                        </optgroup>
                        <optgroup label="Commercial">
                          <option>Commercial Plot</option>
                          <option>Commercial Space</option>
                        </optgroup>
                        <optgroup label="Agricultural">
                          <option>Agricultural Land</option>
                          <option>Farmhouse</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">City / Area</label>
                      <input name="location" defaultValue={editingProperty?.location || ''} className="admin-input" placeholder="e.g. Mangalagiri" />
                    </div>
                    <div>
                      <label className="admin-label">Price</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          name="price" 
                          type="number" 
                          step="0.01"
                          defaultValue={isEditing ? (editingProperty?.price >= 10000000 ? editingProperty.price / 10000000 : (editingProperty?.price >= 100000 ? editingProperty.price / 100000 : editingProperty?.price)) : ''} 
                          className="admin-input" 
                          placeholder="Amount"
                          style={{ flex: 1 }}
                        />
                        <select 
                          className="admin-select" 
                          style={{ width: '80px' }}
                          value={priceUnit}
                          onChange={(e) => setPriceUnit(e.target.value as any)}
                        >
                          <option value="Total">Rs</option>
                          <option value="Lakhs">L</option>
                          <option value="Cr">Cr</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="admin-label">Purpose</label>
                      <select name="purpose" defaultValue={editingProperty?.purpose || 'Sale'} className="admin-select">
                        <option value="Sale">For Sale</option>
                        <option value="Rent">For Rent</option>
                        <option value="Lease">Lease</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label className="admin-label">Property Title</label>
                      <input name="title" defaultValue={editingProperty?.title || ''} className="admin-input" placeholder="e.g. 6 Acres of CRM Land in Mangalagiri" />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'var(--emerald)' }} /> STEP 2: LOCATION & LEGAL
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="admin-label">Full Address</label>
                      <textarea name="address" defaultValue={editingProperty?.address || ''} className="admin-input" rows={2} placeholder="Near coca cola factory..." />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label className="admin-label" style={{ marginBottom: 0 }}>Property Description</label>
                        <button 
                          type="button" 
                          onClick={handleGenerateAIDescription}
                          disabled={isGeneratingAI}
                          className="btn-ghost"
                          style={{ 
                            fontSize: '0.65rem', padding: '4px 10px', borderRadius: '6px', 
                            border: '1px solid var(--gold)', color: 'var(--gold)',
                            display: 'flex', alignItems: 'center', gap: '5px',
                            background: isGeneratingAI ? 'rgba(212,175,55,0.1)' : 'transparent'
                          }}
                        >
                          <Zap size={10} fill={isGeneratingAI ? 'var(--gold)' : 'none'} /> 
                          {isGeneratingAI ? 'GENERATING...' : 'GENERATE WITH AI'}
                        </button>
                      </div>
                      <textarea 
                        name="description" 
                        value={liveData.description || ''} 
                        onChange={(e) => setLiveData((p: any) => ({ ...p, description: e.target.value }))}
                        className="admin-input" 
                        rows={4} 
                        placeholder="Luxury 3BHK with panoramic views..." 
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label className="admin-label">Google Maps Link</label>
                      <input name="googleMapsLink" defaultValue={editingProperty?.googleMapsLink || ''} className="admin-input" placeholder="Google Maps URL" />
                    </div>
                    <div>
                      <label className="admin-label">RERA ID</label>
                      <input name="reraId" defaultValue={editingProperty?.reraId || ''} className="admin-input" placeholder="If applicable" />
                    </div>
                    <div>
                      <label className="admin-label">Approval Authority</label>
                      <select name="approvalAuthority" defaultValue={editingProperty?.approvalAuthority || 'N/A'} className="admin-select">
                        <option value="N/A">None / Pending</option>
                        <option value="AP CRDA">AP CRDA Approved</option>
                        <option value="AP RERA">AP RERA Registered</option>
                        <option value="VMRDA">VMRDA (Visakhapatnam)</option>
                        <option value="DTCP">DTCP Approved</option>
                        <option value="TUDA">TUDA (Tirupati)</option>
                        <option value="Panchayat">Grama Panchayat</option>
                        <option value="Municipal">Municipal Approval</option>
                      </select>
                    </div>
                  </div>
                </section>

                {liveData.type === 'Agricultural Land' && (
                  <section>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '1px', background: 'var(--emerald)' }} /> 🌾 AGRICULTURAL LAND DETAILS (AP STANDARD)
                    </h3>
                    {/* Auto-valuation preview */}
                    {agriAutoValuation() > 0 && (
                      <div style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(16,217,140,0.05)', borderRadius: '14px', border: '1px solid rgba(16,217,140,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 800 }}>AUTO-CALCULATED TOTAL VALUATION</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{formatPriceAdminLocal(agriAutoValuation())}</div>
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                      {/* Acres */}
                      <div>
                        <label className="admin-label">Acres (ఎకరాలు)</label>
                        <input 
                          type="number" 
                          step="1"
                          min="0"
                          value={agriAcres}
                          onChange={(e) => { setAgriAcres(e.target.value); setLiveData((p: any) => ({ ...p, totalAcres: Number(e.target.value) + Number(agriCents) / 100 })); }}
                          className="admin-input"
                          placeholder="e.g. 2"
                        />
                      </div>
                      {/* Cents */}
                      <div>
                        <label className="admin-label">Cents (సెంట్లు) <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>100 Cents = 1 Acre</span></label>
                        <input 
                          type="number" 
                          step="1"
                          min="0"
                          max="99"
                          value={agriCents}
                          onChange={(e) => { setAgriCents(e.target.value); setLiveData((p: any) => ({ ...p, totalAcres: Number(agriAcres) + Number(e.target.value) / 100 })); }}
                          className="admin-input"
                          placeholder="e.g. 50"
                        />
                      </div>
                      {/* Total display */}
                      <div>
                        <label className="admin-label">Total Area (Auto)</label>
                        <div className="admin-input" style={{ background: 'rgba(16,217,140,0.05)', color: 'var(--emerald)', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                          {getAgriTotalDecimal() > 0 ? `${getAgriTotalDecimal().toFixed(2)} Acres (${formatLandSizeAdmin(getAgriTotalDecimal())})` : '—'}
                        </div>
                      </div>
                      {/* Price Per Acre */}
                      <div>
                        <label className="admin-label">Price Per Acre (ఎకరాకు)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            name="pricePerAcre" 
                            type="number" 
                            step="0.01"
                            defaultValue={isEditing ? (editingProperty?.pricePerAcre >= 10000000 ? editingProperty.pricePerAcre / 10000000 : (editingProperty?.pricePerAcre >= 100000 ? editingProperty.pricePerAcre / 100000 : editingProperty?.pricePerAcre)) : ''} 
                            className="admin-input" 
                            placeholder="Amount"
                            style={{ flex: 1 }}
                          />
                          <select 
                            className="admin-select" 
                            style={{ width: '80px' }}
                            value={pricePerAcreUnit}
                            onChange={(e) => setPricePerAcreUnit(e.target.value as any)}
                          >
                            <option value="Total">Rs</option>
                            <option value="Lakhs">L</option>
                            <option value="Cr">Cr</option>
                          </select>
                        </div>
                      </div>
                      {/* Price Per Cent (auto-calculated) */}
                      <div>
                        <label className="admin-label">Price Per Cent (Auto) <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>1/100 of acre price</span></label>
                        <div className="admin-input" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                          {liveData.pricePerAcre ? `₹ ${Math.round(convertToValue(liveData.pricePerAcre, pricePerAcreUnit) / 100).toLocaleString('en-IN')} / Cent` : '—'}
                        </div>
                      </div>
                      {/* Survey Number */}
                      <div>
                        <label className="admin-label">Survey Number (సర్వే నంబర్)</label>
                        <input name="surveyNo" defaultValue={editingProperty?.surveyNo || ''} className="admin-input" placeholder="e.g. 123/A" />
                      </div>
                      {/* Water Source */}
                      <div>
                        <label className="admin-label">Water Source (నీటి వనరు)</label>
                        <select name="waterSource" defaultValue={editingProperty?.waterSource || 'N/A'} className="admin-select">
                          <option value="N/A">N/A</option>
                          <option value="Borewell">Borewell (బోర్ వెల్)</option>
                          <option value="Canal">Canal / నాలా</option>
                          <option value="Both">Both (రెండూ)</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                      {/* Road Type */}
                      <div>
                        <label className="admin-label">Road Type (రోడ్డు రకం)</label>
                        <select name="roadType" defaultValue={editingProperty?.roadType || 'N/A'} className="admin-select">
                          <option value="N/A">N/A</option>
                          <option value="NH">National Highway (NH)</option>
                          <option value="SH">State Highway (SH)</option>
                          <option value="CC Road">CC Road (సిసి రోడ్డు)</option>
                          <option value="Mud Road">Mud Road (మట్టి రోడ్డు)</option>
                          <option value="Kachha">Kachha Path</option>
                        </select>
                      </div>
                      {/* Road Width */}
                      <div>
                        <label className="admin-label">Road Width (Ft)</label>
                        <input name="roadWidth" type="number" defaultValue={editingProperty?.roadWidth || ''} className="admin-input" placeholder="e.g. 30" />
                      </div>
                    </div>

                    {/* SMART UNIT CONVERTER WIDGET */}
                    <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid rgba(212,175,55,0.2)', background: 'rgba(212,175,55,0.02)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={14} /> SMART UNIT CONVERTER (GAJAM STANDARD)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>GAJAALU (SQ.YDS)</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{smartAreaConverter(getAgriTotalDecimal(), 'acre').gajam.toLocaleString('en-IN')}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>SQUARE FEET</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{smartAreaConverter(getAgriTotalDecimal(), 'acre').sqft.toLocaleString('en-IN')}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>PRICE PER GAJAM</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold)' }}>
                            {liveData.pricePerAcre ? `₹ ${Math.round(convertToValue(liveData.pricePerAcre, pricePerAcreUnit) / 4840).toLocaleString('en-IN')}` : '—'}
                          </div>
                        </div>
                      </div>
                      <div style={{ marginTop: '1rem', fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        * 1 Acre = 100 Cents = 4840 Gajam. Land values are calculated using standard AP regional metrics.
                      </div>
                    </div>
                  </section>
                )}
                {['Residential Plot', 'Commercial Plot'].includes(liveData.type) && (
                  <section>
                    <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '20px', height: '1px', background: 'var(--cyan)' }} /> PLOT SPECIFIC DETAILS
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                       <div>
                        <label className="admin-label">Plot Dimensions</label>
                        <input name="areaSize" type="number" defaultValue={editingProperty?.areaSize || ''} className="admin-input" placeholder="Total Area" />
                      </div>
                      <div>
                        <label className="admin-label">Unit</label>
                        <select name="measurementUnit" defaultValue={editingProperty?.measurementUnit || 'Sq.Yards'} className="admin-select">
                          <option value="Sq.Yards">Sq. Yards</option>
                          <option value="Cents">Cents</option>
                          <option value="Acres">Acres</option>
                          <option value="Guntas">Guntas</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                         <input type="checkbox" name="isGated" defaultChecked={editingProperty?.isGated} />
                         <label className="admin-label" style={{ marginBottom: 0 }}>Gated Community</label>
                      </div>
                    </div>
                  </section>
                )}

                {['Apartment', 'Villa', 'Farmhouse', 'Independent House', 'Commercial Space'].includes(liveData.type) && (
                <section>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'var(--rose)' }} /> STEP 3: CONFIGURATION & SIZE
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label className="admin-label">Facing</label>
                      <select name="facing" defaultValue={editingProperty?.facing || 'East'} className="admin-select">
                        <option>East</option><option>West</option><option>North</option><option>South</option><option>North-East</option><option>South-West</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Primary Size</label>
                      <input name="areaSize" type="number" defaultValue={editingProperty?.areaSize || ''} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Unit</label>
                      <select name="measurementUnit" defaultValue={editingProperty?.measurementUnit || 'Sq.Ft'} className="admin-select">
                        <option value="Sq.Yards">Sq. Yards</option>
                        <option value="Cents">Cents</option>
                        <option value="Acres">Acres</option>
                        <option value="Sq.Ft">Sq. Ft</option>
                        <option value="Guntas">Guntas</option>
                      </select>
                    </div>
                  </div>
                </section>
                )}

                <section>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'var(--cyan)' }} /> STEP 4: INTERIOR & CONFIG
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {['Apartment', 'Villa', 'Farmhouse', 'Independent House'].includes(liveData.type) && (
                      <div style={{ gridColumn: 'span 2' }}>
                         <label className="admin-label">BHK</label>
                         <input name="bhk" type="number" defaultValue={editingProperty?.bhk || ''} className="admin-input" placeholder="e.g. 3" />
                      </div>
                    )}
                    
                    <div>
                      <label className="admin-label">Carpet Area (Sq.Ft)</label>
                      <input name="carpetArea" type="number" defaultValue={editingProperty?.carpetArea || ''} className="admin-input" />
                    </div>
                    <div>
                      <label className="admin-label">Builtup Area</label>
                      <input name="superBuiltupArea" type="number" defaultValue={editingProperty?.superBuiltupArea || ''} className="admin-input" />
                    </div>

                    <div>
                      <label className="admin-label">Furnishing</label>
                      <select name="furnishing" defaultValue={editingProperty?.furnishing || 'N/A'} className="admin-select">
                         <option value="N/A">N/A</option>
                         <option value="Furnished">Fully Furnished</option>
                         <option value="Semi-Furnished">Semi-Furnished</option>
                         <option value="Unfurnished">Unfurnished</option>
                      </select>
                    </div>

                    <div>
                      <label className="admin-label">Age</label>
                      <select name="propertyAge" defaultValue={editingProperty?.propertyAge || 'N/A'} className="admin-select">
                         <option value="N/A">N/A</option>
                         <option value="0-1 yrs">New</option>
                         <option value="1-5 yrs">1-5 Years</option>
                         <option value="5-10 yrs">5-10 Years</option>
                      </select>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'var(--rose)' }} /> STEP 5: ADDITIONAL DETAILS
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                      <label className="admin-label">Ownership</label>
                      <select name="ownershipType" defaultValue={editingProperty?.ownershipType || 'Freehold'} className="admin-select">
                        <option value="Freehold">Freehold</option>
                        <option value="Leasehold">Leasehold</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Parking</label>
                      <select name="parking" defaultValue={editingProperty?.parking || 'N/A'} className="admin-select">
                        <option value="N/A">N/A</option>
                        <option value="Available">Available</option>
                        <option value="None">None</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem 0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                          <input name="vastuCompliant" type="checkbox" defaultChecked={editingProperty?.vastuCompliant} /> Vastu
                        </label>
                        {['Residential Plot', 'Commercial Plot', 'Agricultural Land'].includes(liveData.type) && (
                          <>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                              <input name="cornerProperty" type="checkbox" defaultChecked={editingProperty?.cornerProperty} /> Corner
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                              <input name="boundaryWall" type="checkbox" defaultChecked={editingProperty?.boundaryWall} /> Wall
                            </label>
                          </>
                        )}
                    </div>
                  </div>
                </section>

                 <section>
                   <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ width: '20px', height: '1px', background: 'var(--gold)' }} /> STEP 5: TRUST & VISIBILITY
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

                <section>
                   <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <div style={{ width: '20px', height: '1px', background: 'var(--violet)' }} /> STEP 6: EXTRA CUSTOM FIELDS
                   </h3>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {customFeatures.map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <input 
                            placeholder="Feature Label (e.g. Distance to Highway)" 
                            className="admin-input" 
                            style={{ flex: 1 }}
                            value={feat.label}
                            onChange={(e) => updateCustomFeature(idx, 'label', e.target.value)}
                          />
                          <input 
                            placeholder="Value (e.g. 500m)" 
                            className="admin-input" 
                            style={{ flex: 1 }}
                            value={feat.value}
                            onChange={(e) => updateCustomFeature(idx, 'value', e.target.value)}
                          />
                          <button 
                            type="button" 
                            onClick={() => removeCustomFeature(idx)}
                            style={{ background: 'rgba(245,57,123,0.1)', border: 'none', padding: '10px', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button 
                        type="button" 
                        onClick={addCustomFeature}
                        className="btn-ghost"
                        style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Plus size={16} /> ADD CUSTOM FIELD
                      </button>
                   </div>
                </section>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="admin-label">STEP 7: VISUAL ASSETS (MULTI-SELECT)</label>
                  <MediaManager 
                    existingUrls={currentImageUrls}
                    onImagesChange={handleMediaChange}
                    maxFiles={12}
                  />
                </div>

                 <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Button type="button" onClick={handleCloseForm} className="btn-ghost" style={{ flex: 1, padding: '1rem' }}>CANCEL</Button>
                    <Button type="submit" disabled={isUploading} className="btn-violet" style={{ flex: 2, padding: '1rem' }}>
                     {isUploading ? 'SAVING...' : 'ADD PROPERTY'}
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
                 purpose={liveData.purpose}
                 isVerified={isVerified}
                 isFeatured={isFeatured}
                 isGated={liveData.isGated}
                 vastuCompliant={liveData.vastuCompliant}
                 listerType={liveData.listerType || "SnapAdda verified"}
                 measurementUnit={liveData.measurementUnit}
                 sqft={liveData.sqft}
                 areaSize={liveData.areaSize}
                 totalAcres={liveData.totalAcres}
                 pricePerAcre={liveData.pricePerAcre}
                 bhk={liveData.bhk}
                 floorNo={liveData.floorNo}
                 totalFloors={liveData.totalFloors}
                 constructionStatus={liveData.constructionStatus}
                 approval={liveData.approvalAuthority || liveData.approval}
                 images={currentImageUrls}
                 image={currentImageUrls.length > 0 ? currentImageUrls[0] : undefined}
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

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem', gap: '1rem' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>{prop.type} • {prop.location}</div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.title}</h4>
                          </div>
                          <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                            {prop.isVerified && <ShieldCheck size={18} style={{ color: 'var(--emerald)' }} />}
                            {prop.isFeatured && <Star size={18} fill="var(--gold)" style={{ color: 'var(--gold)' }} />}
                          </div>
                        </div>

                        {/* TYPE-SPECIFIC DETAIL ROW */}
                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                          {prop.type === 'Agricultural Land' ? (
                            <>
                              <div style={{ fontSize: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>AREA</span>
                                <span style={{ color: 'var(--emerald)', fontWeight: 800 }}>{formatLandSizeAdmin(prop.totalAcres)}</span>
                              </div>
                              {prop.pricePerAcre > 0 && (
                                <div style={{ fontSize: '0.75rem' }}>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>PRICE/ACRE</span>
                                  <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{formatPriceAdminLocal(prop.pricePerAcre)}</span>
                                </div>
                              )}
                              {prop.pricePerAcre > 0 && (
                                <div style={{ fontSize: '0.75rem' }}>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>PRICE/CENT</span>
                                  <span style={{ color: '#a8ff78', fontWeight: 800 }}>₹{Math.round(Number(prop.pricePerAcre)/100).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {prop.waterSource && prop.waterSource !== 'N/A' && (
                                <div style={{ fontSize: '0.75rem' }}>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>WATER</span>
                                  <span style={{ color: 'var(--cyan)', fontWeight: 800 }}>{prop.waterSource}</span>
                                </div>
                              )}
                            </>
                          ) : prop.type?.includes('Plot') ? (
                            <>
                              <div style={{ fontSize: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>AREA</span>
                                <span style={{ color: 'var(--cyan)', fontWeight: 800 }}>{prop.areaSize} {prop.measurementUnit || 'Sq.Yds'}</span>
                              </div>
                              {prop.approvalAuthority && prop.approvalAuthority !== 'N/A' && (
                                <div style={{ fontSize: '0.75rem' }}>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>APPROVAL</span>
                                  <span style={{ color: 'var(--gold)', fontWeight: 800 }}>{prop.approvalAuthority}</span>
                                </div>
                              )}
                              {prop.isGated && <span style={{ fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>GATED</span>}
                              {prop.cornerProperty && <span style={{ fontSize: '0.65rem', background: 'rgba(34,217,224,0.1)', color: 'var(--cyan)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>CORNER</span>}
                            </>
                          ) : prop.bhk ? (
                            <>
                              <div style={{ fontSize: '0.75rem' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>CONFIG</span>
                                <span style={{ color: 'var(--violet)', fontWeight: 800 }}>{prop.bhk} BHK</span>
                              </div>
                              {prop.areaSize > 0 && (
                                <div style={{ fontSize: '0.75rem' }}>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>AREA</span>
                                  <span style={{ color: 'white', fontWeight: 700 }}>{prop.areaSize} {prop.measurementUnit || 'Sq.Ft'}</span>
                                </div>
                              )}
                              {prop.facing && <div style={{ fontSize: '0.75rem' }}><span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>FACING</span><span style={{ color: 'var(--gold)', fontWeight: 800 }}>{prop.facing}</span></div>}
                            </>
                          ) : (
                            <div style={{ fontSize: '0.75rem' }}>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.6rem', display: 'block', marginBottom: '2px' }}>AREA</span>
                              <span style={{ color: 'white', fontWeight: 700 }}>{prop.areaSize || '—'} {prop.measurementUnit || ''}</span>
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>MARKET VALUE</div>
                              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{formatPriceAdminLocal(prop.price)}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2px' }}>ENGAGEMENT</div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--rose)', fontSize: '0.85rem', fontWeight: 700 }}>
                                  <Heart size={14} fill="var(--rose)" /> {prop.likeCount || 0}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--cyan)', fontSize: '0.85rem', fontWeight: 700 }}>
                                  <Share2 size={14} /> {prop.shareCount || 0}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.6rem' }}>
                            <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }} onClick={() => handleEdit(prop)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '12px', color: 'white', cursor: 'pointer' }} title="Edit"><Edit3 size={16} /></motion.button>
                            <motion.button whileHover={{ scale: 1.1, background: 'rgba(245,57,123,0.2)' }} onClick={() => { if(window.confirm('Wipe asset data?')) deleteProperty(prop._id || prop.id).then(loadProperties); }} style={{ background: 'rgba(245,57,123,0.1)', border: 'none', padding: '10px', borderRadius: '12px', color: 'var(--rose)', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></motion.button>
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
