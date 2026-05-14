import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { Plus, X, Zap, Trash2 } from 'lucide-react';

import { MediaManager } from '../../../components/ui/MediaManager';
import { LivePreviewCard } from '../../../components/ui/LivePreviewCard';
import { getFuzzySuggestions } from '../../../services/SearchParser';
import { Search, Sparkles, ShieldCheck, Users } from 'lucide-react';
import { locationService } from '../../../services/locationService';


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
  isVerified, setIsVerified, isFeatured, setIsFeatured, isGeneratingAI, isUploading,
  currentImageUrls, priceUnit, setPriceUnit,
  handleAddSubmit, handleFormChange, handleCloseForm, handleGenerateAIDescription,
  handleMediaChange,
  addCustomFeature, removeCustomFeature, updateCustomFeature,
  realtorData, setRealtorData, realtors = []
}) => {
  const [locInput, setLocInput] = useState(editingProperty?.location || '');

  const [suggestions, setSuggestions] = useState<any[]>([]);

  const propType = (liveData.type || '').toLowerCase();
  const isAgri = propType.includes('agri') || propType.includes('farm');
  const isPlot = propType.includes('plot') || propType.includes('layout') || propType.includes('crda');
  const isLand = isAgri || isPlot;
  const isCommercial = propType.includes('commercial') || propType.includes('shop') || propType.includes('office');
  const isResidential = !isLand && !isCommercial;

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

        <form key={isEditing ? 'edit' : 'add'} onChange={handleFormChange} onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          <section>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--violet)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--violet)' }} /> 1. BASIC INFO
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
                          const size = parseFloat(e.target.value) || 0;
                          const pUnit = liveData.pricePerUnit || 0;
                          setLiveData((p: any) => ({ 
                            ...p, 
                            areaSize: size,
                            price_raw: pUnit > 0 ? (size * pUnit) : p.price_raw
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
                          onChange={(e) => setLiveData((p: any) => ({ ...p, measurementUnit: e.target.value }))}
                        >
                          <option value="Sq.Yards">Sq. Yards</option>
                          <option value="Cents">Cents</option>
                          <option value="Acres">Acres</option>
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
                          const pUnit = parseFloat(e.target.value) || 0;
                          const size = liveData.areaSize || 0;
                          setLiveData((p: any) => ({ 
                            ...p, 
                            pricePerUnit: pUnit,
                            price_raw: size > 0 ? (size * pUnit) : p.price_raw
                          }));
                        }}
                        className="admin-input" 
                        placeholder="e.g. 25000" 
                      />
                    </div>
                    <div>
                      <label className="admin-label">Total Price Result (Calculated)</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          name="price" 
                          type="number" 
                          value={liveData.price_raw || ''} 
                          onChange={(e) => setLiveData((p: any) => ({ ...p, price_raw: e.target.value }))}
                          className="admin-input" 
                          style={{ flex: 1, fontWeight: 900, color: 'var(--gold)', background: 'rgba(232,184,75,0.05)' }}
                          required
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
              <div className="col-span-full">
                <label className="admin-label">Property Title <span className="required-asterisk">*</span></label>
                <input name="title" defaultValue={editingProperty?.title || ''} className="admin-input" placeholder="e.g. 6 Acres of CRM Land in Mangalagiri" required />
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
                    <input name="powerKVA" type="number" defaultValue={editingProperty?.powerKVA || ''} className="admin-input" placeholder="e.g. 15" />
                  </div>
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
                <div style={{ width: '20px', height: '1px', background: 'var(--violet)' }} /> 6. CUSTOM FIELDS
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


          {/* STEP 4: BRANDING & COMMUNICATION HUB */}
          <section>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--gold)' }} /> 4. BRANDING & COMMUNICATION HUB
            </h3>
            
            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(232,184,75,0.03)', border: '1px solid rgba(232,184,75,0.15)' }}>
              <div className="responsive-form-grid" style={{ gap: '2rem' }}>
                
                {/* Identity Toggle */}
                <div>
                  <label className="admin-label">Public Identity Source</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => setLiveData((p: any) => ({ ...p, displayContactType: 'Admin', listerType: 'SnapAdda Admin' }))}
                      style={{ 
                        padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', 
                        background: liveData.displayContactType !== 'Lister' ? 'var(--gold)' : 'transparent',
                        color: liveData.displayContactType !== 'Lister' ? 'black' : 'white',
                        fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <ShieldCheck size={16} /> INSTITUTIONAL
                    </button>
                    <button 
                      type="button"
                      onClick={() => setLiveData((p: any) => ({ ...p, displayContactType: 'Lister' }))}
                      style={{ 
                        padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', 
                        background: liveData.displayContactType === 'Lister' ? 'var(--emerald)' : 'transparent',
                        color: liveData.displayContactType === 'Lister' ? 'black' : 'white',
                        fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                      }}
                    >
                      <Users size={16} /> DIRECT CONTACT
                    </button>

                  </div>
                  
                  <div style={{ marginTop: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'white', fontSize: '0.8rem', fontWeight: 700 }}>
                      <input 
                        type="checkbox" 
                        name="isOwnerListing"
                        checked={liveData.isOwnerListing || false} 
                        onChange={(e) => setLiveData((p: any) => ({ ...p, isOwnerListing: e.target.checked }))} 
                      />
                      MARK AS "DIRECT OWNER" LISTING
                    </label>
                  </div>
                </div>

                {/* Live Preview & Realtor Select */}
                <div>
                  <label className="admin-label">Public Phone Preview</label>
                  <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Displayed on Client Portal:</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 950, color: liveData.displayContactType === 'Lister' ? 'var(--emerald)' : 'var(--gold)' }}>
                      {liveData.displayContactType === 'Lister' 
                        ? (realtorData.phone || 'Select Realtor Below') 
                        : '+91 93467 93364'}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                      Label: {liveData.isOwnerListing ? 'Contact Owner' : (realtorData.name ? `Contact ${realtorData.name}` : 'Contact Agent')}
                    </div>
                  </div>

                  {liveData.displayContactType === 'Lister' && (
                    <select
                      className="admin-select"
                      value={realtorData.contactId || ''}
                      onChange={handleRealtorSelect}
                      style={{ border: '1px solid var(--emerald)', fontSize: '0.9rem', fontWeight: 700 }}
                    >
                      <option value="">-- Choose Realtor from CRM --</option>
                      {realtors.map((r: any) => (
                        <option key={r._id} value={r._id}>{r.name} — {r.phone}</option>
                      ))}
                    </select>
                  )}
                </div>

              </div>
            </div>
          </section>


          <section>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="admin-label">3. MEDIA ASSETS (UP TO 12)</label>
              <MediaManager 
                existingUrls={currentImageUrls}
                onImagesChange={handleMediaChange}
                maxFiles={12}
              />
            </div>
          </section>

           <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Button type="button" onClick={handleCloseForm} className="btn-ghost" style={{ flex: 1, padding: '1rem' }}>CANCEL</Button>
              <Button type="submit" disabled={isUploading} className="btn-violet" style={{ flex: 2, padding: '1rem' }}>
               {isUploading ? 'SAVING...' : (isEditing ? 'UPDATE PROPERTY' : 'ADD PROPERTY')}
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
