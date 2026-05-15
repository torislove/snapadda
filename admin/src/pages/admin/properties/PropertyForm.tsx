import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { Plus, X, Zap, Trash2 } from 'lucide-react';

import { MediaManager } from '../../../components/ui/MediaManager';
import { LivePreviewCard } from '../../../components/ui/LivePreviewCard';
import { getFuzzySuggestions } from '../../../services/SearchParser';
import { Search, Sparkles, ShieldCheck, Users } from 'lucide-react';
import { locationService } from '../../../services/locationService';

const convertToValue = (val: any, unit: string) => {
  const v = parseFloat(val) || 0;
  if (unit === 'Lakhs') return v * 100000;
  if (unit === 'Cr') return v * 10000000;
  return v;
};
interface PropertyFormProps {
  isEditing: boolean;
  editingProperty: any;
  liveData: any;
  setLiveData: React.Dispatch<React.SetStateAction<any>>;
  customFeatures: {label: string, value: string}[];
  isVerified: boolean;
  setIsVerified: (v: boolean) => void;
  isFeatured: boolean;
  setIsFeatured: (v: boolean) => void;
  isElite: boolean;
  setIsElite: (v: boolean) => void;
  isTrustVerified: boolean;
  setIsTrustVerified: (v: boolean) => void;
  isGeneratingAI: boolean;
  isUploading: boolean;
  currentImageUrls: string[];
  priceUnit: 'Total' | 'Lakhs' | 'Cr';
  setPriceUnit: (v: 'Total' | 'Lakhs' | 'Cr') => void;
  handleAddSubmit: (e: React.FormEvent) => Promise<void>;
  handleFormChange: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCloseForm: () => void;
  handleGenerateAIDescription: () => Promise<void>;
  handleMediaChange: (urls: string[], files: File[]) => void;
  formatPriceAdminLocal: (price: number | string) => string;
  addCustomFeature: () => void;
  removeCustomFeature: (index: number) => void;
  updateCustomFeature: (index: number, key: 'label' | 'value', val: string) => void;
  realtorData: any;
  setRealtorData: (v: any) => void;
  realtors?: any[];
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  isEditing, editingProperty, liveData, setLiveData, customFeatures,
  isVerified, setIsVerified, isFeatured, setIsFeatured, isElite, setIsElite, isTrustVerified, setIsTrustVerified, isGeneratingAI, isUploading,
  currentImageUrls, priceUnit, setPriceUnit,
  handleAddSubmit, handleFormChange, handleCloseForm, handleGenerateAIDescription,
  handleMediaChange,
  addCustomFeature, removeCustomFeature, updateCustomFeature,
  realtorData, setRealtorData, realtors = []
}) => {
  const [locInput, setLocInput] = useState(editingProperty?.location || '');
  const [activeTab, setActiveTab] = useState<'basics' | 'advanced' | 'media' | 'trust'>('basics');

  const [suggestions, setSuggestions] = useState<any[]>([]);

  const propType = (liveData.type || '').toLowerCase();
  const isAgri = propType.includes('agri') || propType.includes('farm');
  const isPlot = propType.includes('plot') || propType.includes('layout') || propType.includes('crda');
  const isCommercial = propType.includes('commercial') || propType.includes('shop') || propType.includes('office') || propType.includes('showroom');
  const isIndustrial = propType.includes('industrial') || propType.includes('shed') || propType.includes('warehouse') || propType.includes('factory');
  const isLand = isAgri || isPlot || isIndustrial;
  const isResidential = !isLand && !isCommercial && !isIndustrial;

  const formatPriceInWords = (value: any) => {
    const num = parseFloat(value);
    if (!num || isNaN(num)) return "";
    if (num >= 10000000) return `(₹ ${(num / 10000000).toFixed(2)} Crore)`;
    if (num >= 100000) return `(₹ ${(num / 100000).toFixed(2)} Lakh)`;
    return `(₹ ${num.toLocaleString("en-IN")})`;
  };

  const handleLocSearch = (val: string) => {
    setLocInput(val);
    if (val.length >= 2) {
      const results = getFuzzySuggestions(val);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const selectLoc = (loc: any) => {
    setLocInput(loc.name);
    setSuggestions([]);
    
    // Comprehensive Auto-Fill
    setLiveData((p: any) => ({ 
      ...p, 
      location: loc.name,
      district: loc.district || p.district,
      mandal: loc.mandal || loc.name,
      pincode: loc.pincode || '',
      state: loc.state || 'Andhra Pradesh'
    }));

    // Manually sync DOM if needed (form usually handles via name/value)
    setTimeout(() => {
      const fields = ['location', 'district', 'mandal', 'pincode', 'state'];
      fields.forEach(f => {
        const el = document.querySelector(`[name="${f}"]`) as HTMLInputElement | HTMLSelectElement;
        if (el) {
          if (f === 'location') el.value = loc.name;
          else if (f === 'district') el.value = loc.district || '';
          else if (f === 'mandal') el.value = loc.mandal || loc.name;
          else if (f === 'pincode') el.value = loc.pincode || '';
          else if (f === 'state') el.value = loc.state || 'Andhra Pradesh';
        }
      });
    }, 0);
  };

  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [villages, setVillages] = useState<string[]>([]);

  const handlePincodeChange = async (code: string) => {
    setLiveData((p: any) => ({ ...p, pincode: code }));
    if (code.length === 6) {
      setPincodeLoading(true);
      const data = await locationService.fetchByPincode(code);
      if (data) {
        setVillages(data.allVillages);
        setLiveData((prev: any) => ({
          ...prev,
          district: data.district,
          mandal: data.mandal,
          state: data.state,
          village: data.village || prev.village
        }));
      }
      setPincodeLoading(false);
    }
  };

  const handleRealtorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    const selected = realtors.find(r => r._id === rId);
    if (selected) {
      setRealtorData({
        contactId: selected._id,
        name: selected.name,
        phone: selected.phone,
        email: selected.email || '',
        agency: selected.company || '',
        licenseNo: selected.licenseNo || '',
        photo: selected.photo || ''
      });
    } else {
      setRealtorData({});
    }
  };


  return (
    <motion.div 
      key="editor"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="admin-grid-1-2-responsive"
      style={{ willChange: 'transform' }}
    >
      {/* Editor Console */}
      <div className="property-form-card" style={{ borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)', transform: 'translateZ(0)', background: 'var(--bg-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {isEditing ? 'Update Asset' : 'New Asset'}
            </h2>
          </div>

          <button onClick={handleCloseForm} style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { id: 'basics', label: '1. Basics', icon: <Zap size={14}/> },
            { id: 'advanced', label: '2. Advanced Details', icon: <ShieldCheck size={14}/> },
            { id: 'media', label: '3. Media Hub', icon: <Sparkles size={14}/> },
            { id: 'trust', label: '4. Trust & Branding', icon: <Users size={14}/> }
          ].map(tab => (
            <button 
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 20px', borderRadius: '12px 12px 0 0', border: 'none',
                background: activeTab === tab.id ? 'rgba(232,184,75,0.1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '8px', borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
            >
              {tab.icon} {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        <form key={isEditing ? 'edit' : 'add'} onChange={handleFormChange} onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {activeTab === 'basics' && (
          <section>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--violet)' }} /> 1. BASIC INFO & GEOGRAPHY
            </h3>
            <div className="responsive-form-grid">
              <div>
                <label className="admin-label">Property Type <span className="required-asterisk">*</span></label>
                <select name="type" defaultValue={editingProperty?.type || 'Apartment'} className="admin-select"
                  onChange={(e) => setLiveData((p: any) => ({ ...p, type: e.target.value }))}
                >
                  <optgroup label="Residential">
                    <option value="Apartment">Apartment / Flat</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Villa">Villa / Duplex</option>
                    <option value="Residential Plot">Residential Plot</option>
                  </optgroup>
                  <optgroup label="Special / CRDA">
                    <option value="CRDA Approved Plot">CRDA Approved Plot</option>
                    <option value="Open Plot">Open Plot</option>
                    <option value="Layout Plot">Layout Plot</option>
                  </optgroup>
                  <optgroup label="Commercial">
                    <option value="Commercial Plot">Commercial Plot</option>
                    <option value="Commercial Space">Commercial Space</option>
                    <option value="Office Space">Office Space</option>
                    <option value="Showroom">Showroom / Retail</option>
                  </optgroup>
                  <optgroup label="Agricultural">
                    <option value="Agricultural Land">Agricultural Land</option>
                    <option value="Farmhouse">Farmhouse</option>
                  </optgroup>
                  <optgroup label="Industrial">
                    <option value="Industrial Shed">Industrial Shed</option>
                    <option value="Warehouse">Warehouse</option>
                    <option value="Factory">Factory</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="admin-label">Lister Type <span className="required-asterisk">*</span></label>
                <select 
                  name="listerType" 
                  defaultValue={editingProperty?.listerType || 'SnapAdda Admin'} 
                  className="admin-select"
                  onChange={(e) => setLiveData((p: any) => ({ ...p, listerType: e.target.value }))}
                >
                  <option value="SnapAdda Admin">Added by Admin</option>
                  <option value="Verified Realtor">Added for Realtor</option>
                  <option value="Direct Owner">Direct Owner Listing</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="admin-label">Property Title <span className="required-asterisk">*</span></label>
                <input name="title" defaultValue={editingProperty?.title || ''} className="admin-input" placeholder="e.g. 6 Acres of CRM Land in Mangalagiri" required />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="admin-label" style={{ marginBottom: 0 }}>City / Area <span className="required-asterisk">*</span></label>
                  <button 
                    type="button" 
                    onClick={() => {
                      if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                          try {
                            const { latitude, longitude } = pos.coords;
                            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                            const data = await res.json();
                            const city = data.city || data.locality || data.principalSubdivision;
                            if (city) { 
                              setLiveData((p: any) => ({ ...p, location: city }));
                              const input = document.querySelector('input[name="location"]') as HTMLInputElement;
                              if (input) input.value = city;
                            }
                          } catch (e) {
                            console.error('Location fetch failed', e);
                          }
                        });
                      }
                    }}
                    className="btn-ghost"
                    style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--cyan)', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    📍 AUTO-DETECT
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    name="location" 
                    value={locInput}
                    onChange={(e) => handleLocSearch(e.target.value)}
                    className="admin-input" 
                    placeholder="e.g. Mangalagiri, Vijayawada" 
                    autoComplete="off"
                    required 
                  />
                  {suggestions.length > 0 && (
                    <div style={{ 
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                      background: 'rgba(15,20,35,0.98)', backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px', marginTop: '8px', overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                    }}>
                      {suggestions.map((loc, idx) => (
                        <div 
                          key={idx}
                          onClick={() => selectLoc(loc)}
                          style={{ 
                            padding: '12px 18px', cursor: 'pointer', borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(232,184,75,0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Search size={14} style={{ color: 'var(--gold)', opacity: 0.6 }} />
                            <div>
                              <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>
                                {loc.name} {loc.pincode && <span style={{ color: 'var(--gold)', fontWeight: 500 }}>({loc.pincode})</span>}
                              </div>
                              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {loc.type} {loc.district ? `• ${loc.district}` : ''}
                              </div>
                            </div>
                          </div>
                          <Sparkles size={12} style={{ color: 'var(--gold)', opacity: 0.3 }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="admin-label">Pincode <span className="required-asterisk">*</span></label>
                <div style={{ position: 'relative' }}>
                  <input 
                    name="pincode" 
                    value={liveData.pincode || ''} 
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    className="admin-input" 
                    placeholder="6-digit code" 
                    required 
                    maxLength={6} 
                    style={{ border: pincodeLoading ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)' }}
                  />
                  {pincodeLoading && <div className="loader-dots" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />}
                </div>
              </div>

              <div>
                <label className="admin-label">Village / Locality</label>
                {villages.length > 0 ? (
                  <select 
                    name="village" 
                    value={liveData.village || ''} 
                    onChange={(e) => setLiveData((p: any) => ({ ...p, village: e.target.value }))}
                    className="admin-select"
                  >
                    <option value="">Select Village</option>
                    {villages.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : (
                  <input 
                    name="village" 
                    value={liveData.village || ''} 
                    onChange={(e) => setLiveData((p: any) => ({ ...p, village: e.target.value }))}
                    className="admin-input" 
                    placeholder="e.g. Navuluru" 
                  />
                )}
              </div>

              <div>
                <label className="admin-label">Mandal / Tahsil</label>
                <input 
                  name="mandal" 
                  value={liveData.mandal || ''} 
                  onChange={(e) => setLiveData((p: any) => ({ ...p, mandal: e.target.value }))}
                  className="admin-input" 
                  placeholder="e.g. Mangalagiri" 
                />
              </div>

              <div>
                <label className="admin-label">District (AP) <span className="required-asterisk">*</span></label>
                <input 
                  name="district" 
                  value={liveData.district || ''} 
                  onChange={(e) => setLiveData((p: any) => ({ ...p, district: e.target.value }))}
                  className="admin-input" 
                  placeholder="District" 
                  required
                />
              </div>

              <div>
                <label className="admin-label">State</label>
                <input 
                  name="state" 
                  value={liveData.state || 'Andhra Pradesh'} 
                  className="admin-input" 
                  readOnly 
                />
              </div>
              
              <div>
                <label className="admin-label">Survey Number</label>
                <input name="surveyNo" defaultValue={editingProperty?.surveyNo || ''} className="admin-input" placeholder="e.g. 124/A" />
              </div>

              <div className="col-span-full">
                <div style={{ padding: '2rem', background: 'rgba(100,100,255,0.04)', borderRadius: '24px', border: '1px solid rgba(100,100,255,0.1)' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--violet)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={16} /> PRICE & AREA CALCULATOR
                  </h4>
                  <div className="responsive-form-grid">
                    <div>
                      <label className="admin-label">
                        {isLand ? `Total Area (${liveData.measurementUnit || 'Sq.Yards'})` : 'Built-up Area (Sq.Ft)'}
                      </label>
                      <input 
                        name="areaSize" 
                        type="number" 
                        value={liveData.areaSize || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const size = parseFloat(val) || 0;
                          const pUnit = Number(liveData.pricePerUnit) || 0;
                          setLiveData((p: any) => ({ 
                            ...p, 
                            areaSize: val,
                            price_raw: pUnit > 0 ? Math.round(size * pUnit) : p.price_raw
                          }));
                        }}
                        className="admin-input" 
                        placeholder="e.g. 200" 
                      />
                    </div>
                    {isLand && (
                      <div>
                        <label className="admin-label">Unit Type</label>
                        <select 
                          name="measurementUnit" 
                          value={liveData.measurementUnit || 'Sq.Yards'} 
                          className="admin-select"
                          onChange={(e) => {
                            const unit = e.target.value;
                            setLiveData((p: any) => ({ ...p, measurementUnit: unit }));
                            
                            // Re-sync price_raw if pricePerUnit exists
                            if (liveData.pricePerUnit && liveData.areaSize) {
                              setLiveData((p: any) => ({
                                ...p,
                                price_raw: Math.round(Number(p.areaSize) * Number(p.pricePerUnit))
                              }));
                            }
                          }}
                          style={{ border: '1px solid var(--violet)', background: 'rgba(155,89,245,0.05)' }}
                        >
                          <option value="Sq.Yards">Sq. Yards (Gajalu)</option>
                          <option value="Cents">Cents</option>
                          <option value="Acres">Acres</option>
                          <option value="Ankanams">Ankanams (Nellore/Tirupati)</option>
                          <option value="Guntas">Guntas (Telangana Border)</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="admin-label">Price Per {isLand ? (liveData.measurementUnit?.slice(0, -1) || 'Unit') : 'Sq.Ft'}</label>
                      <input 
                        name="pricePerUnit" 
                        type="number" 
                        value={liveData.pricePerUnit || ''} 
                        onChange={(e) => {
                          const val = e.target.value;
                          const pUnit = parseFloat(val) || 0;
                          const size = Number(liveData.areaSize) || 0;
                          setLiveData((p: any) => ({ 
                            ...p, 
                            pricePerUnit: val,
                            price_raw: size > 0 ? Math.round(size * pUnit) : p.price_raw
                          }));
                        }}
                        className="admin-input" 
                        placeholder={`Price per ${liveData.measurementUnit?.slice(0, -1) || 'Unit'}`}
                      />
                    </div>
                    <div className="col-span-full">
                      <label className="admin-label">Price Model</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {['fixed', 'range'].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setLiveData((p: any) => ({ ...p, priceType: m }))}
                            className={`btn-ghost ${liveData.priceType === m ? 'active' : ''}`}
                            style={{ 
                              flex: 1, padding: '10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800,
                              background: liveData.priceType === m ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                              color: liveData.priceType === m ? 'black' : 'white',
                              border: liveData.priceType === m ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)'
                            }}
                          >
                            {m === 'fixed' ? 'FIXED PRICE' : 'PRICE RANGE'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {liveData.priceType === 'range' ? (
                      <div className="col-span-full" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                         <div>
                            <label className="admin-label">Min Price ({priceUnit})</label>
                            <input 
                              type="number" 
                              value={liveData.minPrice || ''} 
                              onChange={(e) => setLiveData((p: any) => ({ ...p, minPrice: e.target.value }))}
                              className="admin-input" 
                              style={{ color: 'var(--gold)', fontWeight: 900 }}
                            />
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{formatPriceInWords(convertToValue(liveData.minPrice, priceUnit))}</div>
                         </div>
                         <div>
                            <label className="admin-label">Max Price ({priceUnit})</label>
                            <input 
                              type="number" 
                              value={liveData.maxPrice || ''} 
                              onChange={(e) => setLiveData((p: any) => ({ ...p, maxPrice: e.target.value }))}
                              className="admin-input" 
                              style={{ color: 'var(--gold)', fontWeight: 900 }}
                            />
                            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{formatPriceInWords(convertToValue(liveData.maxPrice, priceUnit))}</div>
                         </div>
                      </div>
                    ) : (
                      <div>
                        <label className="admin-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          Total Price ({priceUnit}) {formatPriceInWords(convertToValue(liveData.price_raw, priceUnit)) && <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{formatPriceInWords(convertToValue(liveData.price_raw, priceUnit))}</span>}
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input 
                            name="price" 
                            type="number" 
                            value={liveData.price_raw || ''} 
                            onChange={(e) => {
                              const total = parseFloat(e.target.value) || 0;
                              const size = parseFloat(liveData.areaSize) || 0;
                              setLiveData((p: any) => ({ 
                                  ...p, 
                                  price_raw: total,
                                  pricePerUnit: size > 0 ? Math.round(convertToValue(total, priceUnit) / size) : p.pricePerUnit
                              }));
                            }}
                            className="admin-input" 
                            style={{ flex: 1, fontWeight: 950, color: 'white', background: 'rgba(34,217,224,0.1)', borderColor: 'var(--cyan)', fontSize: '1.1rem' }}
                            required={liveData.priceType !== 'range'}
                          />
                        </div>
                      </div>
                    )}

                    <div style={{ alignSelf: 'end' }}>
                       <label className="admin-label">Currency Unit</label>
                       <select 
                          className="admin-select" 
                          value={priceUnit}
                          onChange={(e) => setPriceUnit(e.target.value as any)}
                        >
                          <option value="Total">Rs (Actual)</option>
                          <option value="Lakhs">L (Lakhs)</option>
                          <option value="Cr">Cr (Crores)</option>
                        </select>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)' }} />
                    Auto-synchronized with SnapAdda valuation engine.
                  </div>
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
              <div>
                <label className="admin-label">Listing Status</label>
                <select name="status" defaultValue={editingProperty?.status || 'Active'} className="admin-select">
                  <option value="Active">Active / Live</option>
                  <option value="Sold">MARKED SOLD</option>
                  <option value="Pending">Pending / Reserved</option>
                  <option value="Rented">Rented Out</option>
                </select>
              </div>

              {isResidential && (
                <div>
                  <label className="admin-label">BHK / Bedrooms</label>
                  <select name="bhk" defaultValue={editingProperty?.bhk || 0} className="admin-select">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} BHK</option>)}
                  </select>
                </div>
              )}

            </div>
          </section>
          )}

          {activeTab === 'advanced' && (
            <section>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '1px', background: 'var(--emerald)' }} /> 2. ADVANCED SPECIFICATIONS & LEGAL
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                
                {/* AI Description Section */}
                <div style={{ background: 'rgba(232,184,75,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(232,184,75,0.1)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <label className="admin-label" style={{ marginBottom: 0 }}>Public Marketing Description</label>
                      <button 
                        type="button" 
                        onClick={handleGenerateAIDescription}
                        disabled={isGeneratingAI}
                        className="btn-ghost"
                        style={{ 
                          fontSize: '0.65rem', padding: '6px 12px', borderRadius: '8px', 
                          border: '1px solid var(--gold)', color: 'var(--gold)',
                          display: 'flex', alignItems: 'center', gap: '8px'
                        }}
                      >
                        <Sparkles size={12} /> {isGeneratingAI ? 'AI THINKING...' : 'AI AUTO-DESCRIBE (TELUGU + ENG)'}
                      </button>
                   </div>
                   <textarea 
                     name="description" 
                     value={liveData.description || ''} 
                     onChange={(e) => setLiveData((p: any) => ({ ...p, description: e.target.value }))}
                     className="admin-input" 
                     rows={6} 
                     placeholder="AI will generate professional Telugu/English content here..." 
                   />
                </div>

                {/* Technical / Legal Grid */}
                <div className="responsive-form-grid">
                  <div className="col-span-full" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>Legal & Approvals</h4>
                  </div>
                  <div>
                    <label className="admin-label">Approval Authority</label>
                    <select name="approvalAuthority" defaultValue={editingProperty?.approvalAuthority || 'None'} className="admin-select">
                      <option value="None">No Specific Approval</option>
                      <option value="CRDA">CRDA (Vijayawada/Guntur)</option>
                      <option value="DTCP">DTCP Approved</option>
                      <option value="HUDA/HMDA">HUDA / HMDA</option>
                      <option value="LRS">LRS Regularized</option>
                      <option value="Gram Panchayat">Gram Panchayat</option>
                      <option value="VMC/GMC">Municipal Corporation</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">RERA ID</label>
                    <input name="reraId" defaultValue={editingProperty?.reraId || ''} className="admin-input" placeholder="e.g. P024000..." />
                  </div>
                  <div>
                    <label className="admin-label">Approval Number (L.P. No)</label>
                    <input name="approvalNumber" defaultValue={editingProperty?.approvalNumber || ''} className="admin-input" placeholder="e.g. 12/2023/CRDA" />
                  </div>
                  <div>
                    <label className="admin-label">Layout / Venture Name</label>
                    <input name="layoutName" defaultValue={editingProperty?.layoutName || ''} className="admin-input" placeholder="e.g. Amaravati Greens" />
                  </div>
                  <div>
                    <label className="admin-label">Ownership Type</label>
                    <select name="ownershipType" defaultValue={editingProperty?.ownershipType || 'Freehold'} className="admin-select">
                      <option value="Freehold">Freehold (Own)</option>
                      <option value="Leasehold">Leasehold</option>
                      <option value="Power of Attorney">Power of Attorney</option>
                      <option value="Ancestral">Ancestral</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Vastu Compliant</label>
                    <select name="vastuCompliant" defaultValue={editingProperty?.vastuCompliant ? 'Yes' : 'No'} className="admin-select">
                      <option value="Yes">Yes (Vastu Compliant)</option>
                      <option value="No">No / Neutral</option>
                    </select>
                  </div>

                  <div className="col-span-full" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginTop: '1rem', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>Location & Road Infrastructure</h4>
                  </div>
                  <div>
                    <label className="admin-label">Road Type</label>
                    <select name="roadType" defaultValue={editingProperty?.roadType || 'BT Road'} className="admin-select">
                      <option value="BT Road">BT Road (Tar)</option>
                      <option value="CC Road">CC Road (Cement)</option>
                      <option value="Mud Road">Mud Road</option>
                      <option value="Metal Road">Metal Road</option>
                      <option value="No Road">No Direct Road</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Road Width (Feet)</label>
                    <input name="roadWidth" type="number" defaultValue={editingProperty?.roadWidth || ''} className="admin-input" placeholder="e.g. 40" />
                  </div>
                  <div>
                    <label className="admin-label">Overlooking</label>
                    <input name="overlooking" defaultValue={editingProperty?.overlooking || ''} className="admin-input" placeholder="e.g. Main Road, Park, East" />
                  </div>
                  <div>
                    <label className="admin-label">Corner Property</label>
                    <select name="cornerProperty" defaultValue={editingProperty?.cornerProperty ? 'Yes' : 'No'} className="admin-select">
                      <option value="Yes">Yes (Corner)</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  {!isLand && (
                    <>
                      <div className="col-span-full" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginTop: '1rem', marginBottom: '10px' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>Building & Structure Details</h4>
                      </div>
                      <div>
                        <label className="admin-label">Property Age</label>
                        <select name="propertyAge" defaultValue={editingProperty?.propertyAge || 'New'} className="admin-select">
                          <option value="New">Brand New / Under Const.</option>
                          <option value="0-1">0-1 Year</option>
                          <option value="1-5">1-5 Years</option>
                          <option value="5-10">5-10 Years</option>
                          <option value="10+">10+ Years</option>
                        </select>
                      </div>
                      <div>
                        <label className="admin-label">Construction Status</label>
                        <select name="constructionStatus" defaultValue={editingProperty?.constructionStatus || 'Ready to Move'} className="admin-select">
                          <option value="Ready to Move">Ready to Move</option>
                          <option value="Under Construction">Under Construction</option>
                          <option value="Shell Only">Shell Only</option>
                        </select>
                      </div>
                      <div>
                        <label className="admin-label">Furnishing</label>
                        <select name="furnishing" defaultValue={editingProperty?.furnishing || 'Unfurnished'} className="admin-select">
                          <option value="Unfurnished">Unfurnished</option>
                          <option value="Semi-Furnished">Semi-Furnished</option>
                          <option value="Fully Furnished">Fully Furnished</option>
                        </select>
                      </div>
                      <div>
                        <label className="admin-label">Total Floors in Building</label>
                        <input name="totalFloors" type="number" defaultValue={editingProperty?.totalFloors || ''} className="admin-input" placeholder="e.g. 5" />
                      </div>
                    </>
                  )}

                  <div className="col-span-full" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginTop: '1rem', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>Utilities & Maintenance</h4>
                  </div>
                  <div>
                    <label className="admin-label">Water Source</label>
                    <select name="waterSupply" defaultValue={editingProperty?.waterSupply || 'Municipal'} className="admin-select">
                      <option value="Municipal">Municipal / Tap</option>
                      <option value="Borewell">Borewell</option>
                      <option value="Both">Both</option>
                      <option value="Tinker Only">Tanker Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Power (KVA Load)</label>
                    <input name="powerKVA" type="number" defaultValue={editingProperty?.powerKVA || ''} className="admin-input" placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="admin-label">Security Level</label>
                    <select name="securityLevel" defaultValue={editingProperty?.securityLevel || 'Standard'} className="admin-select">
                      <option value="Standard">Standard</option>
                      <option value="24/7 Guard">24/7 Guard</option>
                      <option value="Gated Community">Gated Community</option>
                      <option value="CCTV Only">CCTV Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Maintenance Fee / Month</label>
                    <input name="maintenanceFee" type="number" defaultValue={editingProperty?.maintenanceFee || ''} className="admin-input" placeholder="e.g. 2000" />
                  </div>
                </div>

              </div>
            </section>
          )}

          <section>

              <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '1px', background: 'var(--emerald)' }} /> 2. ADDITIONAL SPECS
              </h3>
              <div className="responsive-form-grid">
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
                  <label className="admin-label">Exact Latitude (for Map Hotspot)</label>
                  <input 
                    name="coordinates.lat" 
                    type="number"
                    step="any"
                    value={liveData.coordinates?.lat || ''} 
                    onChange={(e) => setLiveData((p: any) => ({ ...p, coordinates: { ...p.coordinates, lat: parseFloat(e.target.value) } }))}
                    className="admin-input" 
                    placeholder="e.g. 16.5062" 
                  />
                </div>
                <div>
                  <label className="admin-label">Exact Longitude (for Map Hotspot)</label>
                  <input 
                    name="coordinates.lng" 
                    type="number"
                    step="any"
                    value={liveData.coordinates?.lng || ''} 
                    onChange={(e) => setLiveData((p: any) => ({ ...p, coordinates: { ...p.coordinates, lng: parseFloat(e.target.value) } }))}
                    className="admin-input" 
                    placeholder="e.g. 80.6480" 
                  />
                </div>
                <div>
                  <label className="admin-label">RERA ID</label>
                  <input name="reraId" defaultValue={editingProperty?.reraId || ''} className="admin-input" placeholder="e.g. P0240000..." />
                </div>
                {isLand && (
                  <>
                    <div>
                      <label className="admin-label">Approval Number (L.P. No)</label>
                      <input name="approvalNumber" defaultValue={editingProperty?.approvalNumber || ''} className="admin-input" placeholder="e.g. 10/2024" />
                    </div>
                    <div>
                      <label className="admin-label">Layout / Venture Name</label>
                      <input name="layoutName" defaultValue={editingProperty?.layoutName || ''} className="admin-input" placeholder="e.g. Capital City Phase 1" />
                    </div>
                  </>
                )}
                {isResidential && (
                  <>
                    <div>
                      <label className="admin-label">Total Floors</label>
                      <input name="totalFloors" type="number" defaultValue={editingProperty?.totalFloors || ''} className="admin-input" placeholder="e.g. 5" />
                    </div>
                    <div>
                      <label className="admin-label">Floor No</label>
                      <input name="floorNo" type="number" defaultValue={editingProperty?.floorNo || ''} className="admin-input" placeholder="e.g. 3" />
                    </div>
                    <div>
                      <label className="admin-label">Bathrooms</label>
                      <input name="baths" type="number" defaultValue={editingProperty?.baths || ''} className="admin-input" placeholder="e.g. 2" />
                    </div>
                    <div>
                      <label className="admin-label">Construction Status</label>
                      <select name="constructionStatus" defaultValue={editingProperty?.constructionStatus || 'Ready to Move'} className="admin-select">
                        <option value="Ready to Move">Ready to Move</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="New Launch">New Launch</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Furnishing</label>
                      <select name="furnishing" defaultValue={editingProperty?.furnishing || 'Unfurnished'} className="admin-select">
                        <option value="Unfurnished">Unfurnished</option>
                        <option value="Semi-Furnished">Semi-Furnished</option>
                        <option value="Fully Furnished">Fully Furnished</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Maintenance Fee / Mo</label>
                      <input name="maintenanceFee" type="number" defaultValue={editingProperty?.maintenanceFee || ''} className="admin-input" placeholder="e.g. 5000" />
                    </div>
                    <div>
                      <label className="admin-label">Balconies</label>
                      <input name="balconies" type="number" defaultValue={editingProperty?.balconies || ''} className="admin-input" placeholder="e.g. 3" />
                    </div>
                    <div>
                      <label className="admin-label">Security Level</label>
                      <select name="securityLevel" defaultValue={editingProperty?.securityLevel || 'Standard'} className="admin-select">
                        <option>Standard</option><option>24/7 Security</option><option>CCTV Monitored</option><option>Elite Gated Security</option>
                      </select>
                    </div>
                  </>
                )}

                {isCommercial && (
                  <div>
                    <label className="admin-label">Power Supply (KVA)</label>
                    <input name="powerKVA" type="number" key={editingProperty?._id + '-pkva'} defaultValue={editingProperty?.powerKVA || ''} className="admin-input" placeholder="e.g. 15" />
                  </div>
                )}
                {isIndustrial && (
                  <>
                    <div>
                      <label className="admin-label">Power Load (KVA)</label>
                      <input name="powerKVA" type="number" key={editingProperty?._id + '-iload'} defaultValue={editingProperty?.powerKVA || ''} className="admin-input" placeholder="e.g. 100" />
                    </div>
                    <div>
                      <label className="admin-label">Ceiling Height (Ft)</label>
                      <input name="ceilingHeight" type="number" key={editingProperty?._id + '-cheight'} defaultValue={editingProperty?.ceilingHeight || ''} className="admin-input" placeholder="e.g. 30" />
                    </div>
                    <div>
                      <label className="admin-label">Loading Docks</label>
                      <input name="loadingDocks" type="number" key={editingProperty?._id + '-ldocks'} defaultValue={editingProperty?.loadingDocks || ''} className="admin-input" placeholder="e.g. 4" />
                    </div>
                  </>
                )}
                {(isCommercial || isIndustrial) && (
                  <>
                    <div>
                      <label className="admin-label">Floor Type</label>
                      <select name="floorType" defaultValue={editingProperty?.floorType || 'N/A'} className="admin-select">
                        <option value="N/A">N/A</option>
                        <option value="Cement">Cement</option>
                        <option value="VDF">VDF</option>
                        <option value="Epoxy">Epoxy</option>
                        <option value="Tile/Marble">Tile/Marble</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '100%' }}>
                      <input type="checkbox" name="fireSafety" defaultChecked={editingProperty?.fireSafety} style={{ width: '18px', height: '18px' }} />
                      <label className="admin-label" style={{ marginBottom: 0 }}>Fire Safety Certified</label>
                    </div>
                  </>
                )}
                {isLand && (
                  <div>
                    <label className="admin-label">Approval Authority</label>
                    <select name="approvalAuthority" defaultValue={editingProperty?.approvalAuthority || 'N/A'} className="admin-select" style={{ border: '1px solid var(--emerald)', background: 'rgba(16,217,140,0.05)' }}>
                      <option value="N/A">N/A / Not Applicable</option>
                      <option value="DTCP">DTCP Approved</option>
                      <option value="HMDA">HMDA</option>
                      <option value="AP CRDA">AP CRDA (Amaravati)</option>
                      <option value="VMRDA">VMRDA (Vizag)</option>
                      <option value="TUDA">TUDA (Tirupati)</option>
                      <option value="GP">Gram Panchayat</option>
                      <option value="Clear Title">Patta / Clear Title Only</option>
                    </select>
                  </div>
                )}
              </div>
            </section>


          {/* Category-Specific Grid */}
          <section>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--cyan)' }} /> 2. SPECIFICATIONS
            </h3>
            <div className="responsive-form-grid">
              <div>
                <label className="admin-label">Facing</label>
                <select name="facing" defaultValue={editingProperty?.facing || 'East'} className="admin-select">
                  <option>East</option><option>West</option><option>North</option><option>South</option><option>North-East</option><option>South-West</option>
                </select>
              </div>

              {isResidential && (
                <>
                  <div>
                    <label className="admin-label">Construction Status</label>
                    <select name="constructionStatus" defaultValue={editingProperty?.constructionStatus || 'Ready to Move'} className="admin-select">
                      <option>Ready to Move</option><option>Under Construction</option><option>New Launch</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Furnishing</label>
                    <select name="furnishing" defaultValue={editingProperty?.furnishing || 'Unfurnished'} className="admin-select">
                      <option>Unfurnished</option><option>Semi-Furnished</option><option>Fully Furnished</option>
                    </select>
                  </div>
                </>
              )}

              {isAgri && (
                <>
                  <div>
                    <label className="admin-label">Road Type</label>
                    <select name="roadType" defaultValue={editingProperty?.roadType || 'Mud Road'} className="admin-select">
                      <option>Mud Road</option><option>BT Road</option><option>CC Road</option><option>NH / SH</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Water Source</label>
                    <select name="waterSource" defaultValue={editingProperty?.waterSource || 'Borewell'} className="admin-select">
                      <option>Borewell</option><option>Canal</option><option>Both</option><option>None</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Survey Number</label>
                    <input name="surveyNo" defaultValue={editingProperty?.surveyNo || ''} className="admin-input" placeholder="e.g. 124/A" />
                  </div>
                </>
              )}

              {isLand && (
                <>
                  <div>
                    <label className="admin-label">Approval Authority</label>
                    <select name="approvalAuthority" defaultValue={editingProperty?.approvalAuthority || 'GP'} className="admin-select">
                      <option>GP</option><option>DTCP</option><option>HMDA</option><option>AP CRDA</option><option>VMRDA</option><option>Clear Title</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Road Width (Feet)</label>
                    <input name="roadWidth" type="number" defaultValue={editingProperty?.roadWidth || ''} className="admin-input" placeholder="e.g. 40" />
                  </div>
                </>
              )}

              {(isResidential || isCommercial) && (
                <>
                  <div>
                    <label className="admin-label">Floor Type</label>
                    <select name="floorType" defaultValue={editingProperty?.floorType || 'Vitrified Tiles'} className="admin-select">
                      <option>Vitrified Tiles</option><option>Marble</option><option>Granite</option><option>Mosaic</option><option>Wooden</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Power Supply (KVA)</label>
                    <input name="powerKVA" type="number" defaultValue={editingProperty?.powerKVA || ''} className="admin-input" placeholder="e.g. 15" />
                  </div>
                </>
              )}
            </div>
          </section>

          <section>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--gold)' }} /> 3. VERIFICATION & STATUS
            </h3>
            <div className="responsive-form-grid">
              <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h4 style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}>Quality Assurance Log</h4>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Record site visits or agent calls to verify asset authenticity.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      id="vLogAction" 
                      placeholder="Action (e.g. Site Visit)" 
                      className="admin-input" 
                      style={{ fontSize: '0.7rem', padding: '8px', background: 'rgba(255,255,255,0.02)' }} 
                    />
                    <input 
                      id="vLogNotes" 
                      placeholder="Notes (e.g. Photos taken)" 
                      className="admin-input" 
                      style={{ fontSize: '0.7rem', padding: '8px', background: 'rgba(255,255,255,0.02)' }} 
                    />
                    <button 
                      type="button" 
                      className="btn-violet" 
                      style={{ fontSize: '0.6rem', padding: '0 12px', whiteSpace: 'nowrap' }}
                      onClick={() => {
                        const actionEl = document.getElementById('vLogAction') as HTMLInputElement;
                        const notesEl = document.getElementById('vLogNotes') as HTMLInputElement;
                        if (actionEl.value) {
                          setLiveData((p: any) => ({
                            ...p,
                            verificationLog: [...(p.verificationLog || []), { 
                              action: actionEl.value, 
                              notes: notesEl.value, 
                              timestamp: new Date().toISOString() 
                            }]
                          }));
                          actionEl.value = '';
                          notesEl.value = '';
                        }
                      }}
                    >
                      COMMIT LOG
                    </button>
                  </div>

                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {(liveData.verificationLog || []).length > 0 ? (
                    liveData.verificationLog.map((log: any, idx: number) => (
                      <div key={idx} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '15px' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--gold)', minWidth: '80px' }}>{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>{log.action}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{log.notes}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                      No verification logs found for this property.
                    </div>
                  )}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap', gridColumn: '1 / -1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', fontSize: '0.85rem' }}>
                  <input name="isVerified" type="checkbox" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} /> Trust Seal (Verified)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white', fontSize: '0.85rem' }}>
                  <input name="isFeatured" type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} /> Elite Featured Status
                </label>
              </div>
            </div>
          </section>

                    {activeTab === 'media' && (
            <section>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '1px', background: 'var(--gold)' }} /> 3. MEDIA ASSETS & VISUALS
              </h3>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div style={{ marginBottom: '2rem' }}>
                    <label className="admin-label">Upload High-Resolution Media (Photos & Videos)</label>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-8px', marginBottom: '1.5rem' }}>Drag and drop images or videos. First image will be the primary thumbnail.</p>
                    <MediaManager 
                      existingUrls={currentImageUrls}
                      onImagesChange={handleMediaChange}
                      maxFiles={15}
                    />
                 </div>
              </div>
            </section>
          )}

          {activeTab === 'trust' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <section>
                 <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '20px', height: '1px', background: 'var(--emerald)' }} /> 4. TRUST SEAL & VISIBILITY
                 </h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', border: isVerified ? '1px solid rgba(16,217,140,0.3)' : '1px solid rgba(255,255,255,0.08)', background: isVerified ? 'rgba(16,217,140,0.05)' : 'transparent', borderRadius: '20px' }}>
                       <input type="checkbox" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
                       <div>
                         <div style={{ fontSize: '0.9rem', fontWeight: 900, color: isVerified ? 'var(--emerald)' : 'white' }}>TRUST SEAL</div>
                         <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Verified authenticity badge for buyers.</div>
                       </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', border: isFeatured ? '1px solid rgba(245,200,66,0.3)' : '1px solid rgba(255,255,255,0.08)', background: isFeatured ? 'rgba(245,200,66,0.05)' : 'transparent', borderRadius: '20px' }}>
                       <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
                       <div>
                         <div style={{ fontSize: '0.9rem', fontWeight: 900, color: isFeatured ? 'var(--gold)' : 'white' }}>FEATURED ASSET</div>
                         <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Priority placement in search results.</div>
                       </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', border: isElite ? '1px solid #e8b84b' : '1px solid rgba(255,255,255,0.08)', background: isElite ? 'rgba(232,184,75,0.1)' : 'transparent', borderRadius: '20px' }}>
                       <input type="checkbox" checked={isElite} onChange={e => setIsElite(e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
                       <div>
                         <div style={{ fontSize: '0.9rem', fontWeight: 900, color: isElite ? '#e8b84b' : 'white' }}>ELITE STATUS</div>
                         <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Premium institutional grade badge.</div>
                       </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', border: isTrustVerified ? '1px solid #10d98c' : '1px solid rgba(255,255,255,0.08)', background: isTrustVerified ? 'rgba(16,217,140,0.1)' : 'transparent', borderRadius: '20px' }}>
                       <input type="checkbox" checked={isTrustVerified} onChange={e => setIsTrustVerified(e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer' }} />
                       <div>
                         <div style={{ fontSize: '0.9rem', fontWeight: 900, color: isTrustVerified ? '#10d98c' : 'white' }}>TRUST SEAL</div>
                         <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Verified by SnapAdda compliance.</div>
                       </div>
                    </div>
                 </div>
              </section>

              <section>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '1px', background: 'var(--violet)' }} /> 5. CONTACT & BRANDING
                </h3>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="responsive-form-grid">
                    <div>
                      <label className="admin-label">Public Contact Display</label>
                      <select 
                        className="admin-select"
                        value={liveData.displayContactType || 'Admin'}
                        onChange={(e) => setLiveData((p: any) => ({ ...p, displayContactType: e.target.value }))}
                      >
                        <option value="Admin">SnapAdda Support (+91 93467 93364)</option>
                        <option value="Lister">Direct Realtor / Owner Info</option>
                      </select>
                    </div>

                    {liveData.displayContactType === 'Lister' && (
                      <div>
                        <label className="admin-label">Choose Realtor / Owner</label>
                        <select
                          className="admin-select"
                          value={realtorData.contactId || ''}
                          onChange={handleRealtorSelect}
                          style={{ border: '1px solid var(--emerald)' }}
                        >
                          <option value="">-- Select Registered Contact --</option>
                          {realtors.map((r: any) => (
                            <option key={r._id} value={r._id}>{r.name} ({r.phone})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                       <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: 'white', fontSize: '0.85rem', fontWeight: 700, padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', width: '100%' }}>
                          <input 
                            type="checkbox" 
                            name="isOwnerListing"
                            checked={liveData.isOwnerListing || false} 
                            onChange={(e) => setLiveData((p: any) => ({ ...p, isOwnerListing: e.target.checked }))} 
                            style={{ width: '18px', height: '18px' }}
                          />
                          MARK AS "DIRECT OWNER"
                       </label>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '1px', background: 'var(--gold)' }} /> 6. CUSTOM ATTRIBUTES
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {customFeatures.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input 
                          placeholder="Label (e.g. Near Metro)" 
                          className="admin-input" 
                          style={{ flex: 1 }}
                          value={feat.label}
                          onChange={(e) => updateCustomFeature(idx, 'label', e.target.value)}
                        />
                        <input 
                          placeholder="Value (e.g. 200m)" 
                          className="admin-input" 
                          style={{ flex: 1 }}
                          value={feat.value}
                          onChange={(e) => updateCustomFeature(idx, 'value', e.target.value)}
                        />
                        <button 
                          type="button" 
                          onClick={() => removeCustomFeature(idx)}
                          style={{ background: 'rgba(245,57,123,0.1)', border: 'none', padding: '12px', borderRadius: '10px', color: 'var(--rose)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={addCustomFeature}
                      className="btn-ghost"
                      style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)' }}
                    >
                      <Plus size={16} /> ADD CUSTOM FIELD
                    </button>
                </div>
              </section>
            </div>
          )}

           <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
              <Button type="button" onClick={handleCloseForm} className="btn-ghost" style={{ flex: 1, padding: '1rem', borderRadius: '18px' }}>CANCEL</Button>
              <Button type="submit" disabled={isUploading} className="btn-violet" style={{ flex: 2, padding: '1rem', borderRadius: '18px', fontWeight: 900, letterSpacing: '0.05em' }}>
               {isUploading ? 'SAVING DATA...' : (isEditing ? 'UPDATE ASSET' : 'PUBLISH ASSET')}
              </Button>
           </div>

        </form>
      </div>

      {/* Live Preview Display */}
      <div style={{ position: 'sticky', top: '2rem' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>
           <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 10px var(--emerald)' }} /> HOLOGRAPHIC RENDER
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
           areaSize={liveData.areaSize}
           bhk={liveData.bhk}
           floorNo={liveData.floorNo}
           totalFloors={liveData.totalFloors}
           constructionStatus={liveData.constructionStatus}
           approval={liveData.approvalAuthority || liveData.approval}
           images={currentImageUrls}
           image={currentImageUrls.length > 0 ? currentImageUrls[0] : undefined}
           priceType={liveData.priceType}
           minPrice={liveData.minPrice}
           maxPrice={liveData.maxPrice}
          />
         <div style={{ marginTop: '2.5rem', padding: '2rem', borderRadius: '24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
           <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
             <Zap size={16} style={{ color: 'var(--gold)', verticalAlign: 'middle', marginRight: '8px' }} />
             Rendered using the <strong>SnapAdda Spatial Engine v2.0</strong>. This preview reflects the exact buyer perspective including 3D orientation and volumetric lighting.
           </p>
         </div>
      </div>
    </motion.div>
  );
};
