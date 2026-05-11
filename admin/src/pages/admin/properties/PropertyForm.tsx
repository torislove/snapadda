import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { Plus, X, Zap, Trash2 } from 'lucide-react';

import { MediaManager } from '../../../components/ui/MediaManager';
import { LivePreviewCard } from '../../../components/ui/LivePreviewCard';
import { smartAreaConverter, calcPricePerCent } from '../../../utils/priceUtils';

import { getFuzzySuggestions } from '../../../services/SearchParser';
import { Search, Sparkles } from 'lucide-react';


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
  pricePerAcreUnit: 'Total' | 'Lakhs' | 'Cr';
  setPricePerAcreUnit: (v: 'Total' | 'Lakhs' | 'Cr') => void;
  agriAcres: number | string;
  setAgriAcres: (v: number | string) => void;
  handleAddSubmit: (e: React.FormEvent) => Promise<void>;
  handleFormChange: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCloseForm: () => void;
  handleGenerateAIDescription: () => Promise<void>;
  handleMediaChange: (urls: string[], files: File[]) => void;
  convertToValue: (val: number | string, unit: string) => number;
  agriAutoValuation: () => number;
  formatPriceAdminLocal: (price: number | string) => string;
  getAgriTotalDecimal: () => number;
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
  currentImageUrls, priceUnit, setPriceUnit, pricePerAcreUnit, setPricePerAcreUnit,
  agriAcres, setAgriAcres, handleAddSubmit, handleFormChange, handleCloseForm, handleGenerateAIDescription,
  handleMediaChange, convertToValue, agriAutoValuation, formatPriceAdminLocal, getAgriTotalDecimal,
  addCustomFeature, removeCustomFeature, updateCustomFeature,
  realtorData, setRealtorData, realtors = []
}) => {
  const [locInput, setLocInput] = useState(editingProperty?.location || '');

  const [suggestions, setSuggestions] = useState<any[]>([]);

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
                    <option value="Gated Community Plot">Gated Community Plot</option>
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
                    <option value="Agricultural Land">Agricultural Land (Farm)</option>
                    <option value="Farmhouse">Farmhouse / Farm Villa</option>
                  </optgroup>
                  <optgroup label="Industrial">
                    <option value="Industrial Shed">Industrial Shed</option>
                    <option value="Warehouse">Warehouse / Godown</option>
                    <option value="Factory">Factory / Unit</option>
                  </optgroup>
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
                <input name="pincode" defaultValue={editingProperty?.pincode || ''} className="admin-input" placeholder="6-digit code" required maxLength={6} />
              </div>

              <div>
                <label className="admin-label">Mandal / Tahsil</label>
                <input name="mandal" defaultValue={editingProperty?.mandal || ''} className="admin-input" placeholder="e.g. Mangalagiri" />
              </div>

              <div>
                <label className="admin-label">Village / Locality</label>
                <input name="village" defaultValue={editingProperty?.village || ''} className="admin-input" placeholder="e.g. Navuluru" />
              </div>

              <div>
                <label className="admin-label">District (AP) <span className="required-asterisk">*</span></label>
                <select name="district" defaultValue={editingProperty?.district || ''} className="admin-select" required>
                  <option value="">Select District</option>
                  {['Anantapur','Annamayya','Alluri Sitharama Raju','Bapatla','Chittoor','East Godavari','Eluru','Guntur','Kadapa','Kakinada','Konaseema','Krishna','Kurnool','Nandyal','Nellore','NTR','Palnadu','Parvathipuram Manyam','Prakasam','Srikakulam','Sri Sathya Sai','Tirupati','Visakhapatnam','Vizianagaram','West Godavari','YSR Kadapa'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="admin-label">State</label>
                <input name="state" defaultValue={editingProperty?.state || 'Andhra Pradesh'} className="admin-input" readOnly />
              </div>

              <div>
                <label className="admin-label">Price <span className="required-asterisk">*</span></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    name="price" 
                    type="number" 
                    step="0.01"
                    defaultValue={isEditing ? (editingProperty?.price >= 10000000 ? editingProperty.price / 10000000 : (editingProperty?.price >= 100000 ? editingProperty.price / 100000 : editingProperty?.price)) : ''} 
                    className="admin-input" 
                    placeholder="Amount"
                    style={{ flex: 1 }}
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
              <div>
                <label className="admin-label">Area Size</label>
                <input name="areaSize" type="number" step="0.01" defaultValue={editingProperty?.areaSize || ''} className="admin-input" placeholder="e.g. 1500 or 6.5" />
              </div>
              <div>
                <label className="admin-label">Measurement Unit</label>
                <select name="measurementUnit" defaultValue={editingProperty?.measurementUnit || (liveData.type === 'Agricultural Land' ? 'Acres' : 'Sq.Yards')} className="admin-select">
                  <option value="Sq.Ft">Square Feet (sft)</option>
                  <option value="Sq.Yards">Gajalu (Sq. Yards)</option>
                  <option value="Acres">Acres (ఎకరాలు)</option>
                  <option value="Cents">Cents (సెంట్లు)</option>
                  <option value="Guntas">Guntas (గుంటలు)</option>
                  <option value="Ankanam">Ankanam (అంకణం)</option>
                </select>
              </div>
            </div>
          </section>

          <section>

              <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '1px', background: 'var(--emerald)' }} /> 2. LOCATION & DESC
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
                  <label className="admin-label">RERA ID</label>
                  <input name="reraId" defaultValue={editingProperty?.reraId || ''} className="admin-input" placeholder="If applicable" />
                </div>
                <div>
                  <label className="admin-label">Approval Authority</label>
                  <select name="approvalAuthority" defaultValue={editingProperty?.approvalAuthority || 'N/A'} className="admin-select" style={{ border: '1px solid var(--emerald)', background: 'rgba(16,217,140,0.05)' }}>
                    <option value="N/A">N/A / Not Applicable</option>
                    <option value="CRDA">CRDA (Capital Region)</option>
                    <option value="AP CRDA">AP CRDA (Amaravati Local)</option>
                    <option value="VMRDA">VMRDA (Visakhapatnam)</option>
                    <option value="DTCP">DTCP Approved</option>
                    <option value="HMDA">HMDA</option>
                    <option value="AP RERA">AP RERA Registered</option>
                    <option value="TUDA">TUDA (Tirupati)</option>
                    <option value="APIIC">APIIC (Industrial)</option>
                    <option value="Revenue">Revenue Layout</option>
                    <option value="Gram Panchayat">Gram Panchayat</option>
                    <option value="Municipal">Municipal / Town Planning</option>
                    <option value="Clear Title">Patta / Clear Title Only</option>
                    <option value="SEZ">SEZ Zone</option>
                  </select>
                </div>
              </div>
            </section>


          {liveData.type === 'Agricultural Land' && (
            <section>
              <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--emerald)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '1px', background: 'var(--emerald)' }} /> 🌾 AGRICULTURAL LAND DETAILS (AP STANDARD)
              </h3>
              {agriAutoValuation() > 0 && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem', background: 'rgba(16,217,140,0.08)', borderRadius: '14px', border: '1px solid rgba(16,217,140,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(16,217,140,0.1)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 900, letterSpacing: '0.05em' }}>INSTITUTIONAL ASSET VALUATION (AUTO)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 950, color: 'white' }}>{formatPriceAdminLocal(agriAutoValuation())}</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                <div className="col-span-full">
                  <label className="admin-label">Total Acres (ఎకరాలు)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={agriAcres}
                    onChange={(e) => { setAgriAcres(e.target.value); setLiveData((p: any) => ({ ...p, totalAcres: e.target.value })); }}
                    className="admin-input"
                    placeholder="e.g. 6.5"
                    style={{ fontSize: '1.2rem', fontWeight: 800 }}
                  />
                </div>
                <div style={{ gridColumn: 'span 1', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{ padding: '12px', background: 'rgba(16,217,140,0.1)', borderRadius: '12px', color: 'var(--emerald)', fontSize: '0.75rem', fontWeight: 800 }}>
                     PRECISION: {Number(agriAcres || 0).toFixed(2)} AC
                  </div>
                </div>
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
                  {liveData.pricePerAcre > 0 && (
                     <div style={{ marginTop: '8px', fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700 }}>
                        CURRENCY HUD: {convertToValue(liveData.pricePerAcre, pricePerAcreUnit).toLocaleString('en-IN')}
                     </div>
                  )}
                </div>
                <div>
                  <label className="admin-label">Price Per Cent (సెంటుకు ధర) <span style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>Auto: Acre Price / 100</span></label>
                  <div className="admin-input" style={{ background: 'rgba(16,217,140,0.05)', color: 'var(--emerald)', fontWeight: 700 }}>
                    {liveData.pricePerAcre ? `₹ ${calcPricePerCent(convertToValue(liveData.pricePerAcre, pricePerAcreUnit)).toLocaleString('en-IN')} / Cent` : '—'}
                  </div>
                </div>
                <div>
                  <label className="admin-label">Survey Number (సర్వే నంబర్)</label>
                  <input name="surveyNo" defaultValue={editingProperty?.surveyNo || ''} className="admin-input" placeholder="e.g. 123/A" />
                </div>
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
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Use "Additional Details" section for checkboxes like Gated Community or Corner Plot.
                </div>
              </div>
            </section>
          )}

          {['Apartment', 'Villa', 'Farmhouse', 'Independent House', 'Commercial Space'].includes(liveData.type) && (
          <section>

            <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--rose)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--rose)' }} /> 3. SPECIFICATIONS
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label className="admin-label">Facing</label>
                <select name="facing" defaultValue={editingProperty?.facing || 'East'} className="admin-select">
                  <option>East</option><option>West</option><option>North</option><option>South</option><option>North-East</option><option>South-West</option>
                </select>
              </div>
              {['Apartment', 'Villa', 'Farmhouse', 'Independent House'].includes(liveData.type) && (
                 <div>
                    <label className="admin-label">BHK</label>
                    <input name="bhk" type="number" defaultValue={editingProperty?.bhk || ''} className="admin-input" placeholder="e.g. 3" />
                 </div>
              )}
              <div>
                <label className="admin-label">Carpet Area</label>
                <input name="carpetArea" type="number" defaultValue={editingProperty?.carpetArea || ''} className="admin-input" />
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
                <label className="admin-label">Total Floors</label>
                <input name="totalFloors" type="number" defaultValue={editingProperty?.totalFloors || ''} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Floor No</label>
                <input name="floorNo" type="number" defaultValue={editingProperty?.floorNo || ''} className="admin-input" />
              </div>
            </div>
          </section>
          )}

          <section>

              <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '20px', height: '1px', background: 'var(--cyan)' }} /> 4. ASSET STATUS
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label className="admin-label">Property Age</label>
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
                <div style={{ width: '20px', height: '1px', background: 'var(--rose)' }} /> 5. FEATURES
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
                  <select name="parking" defaultValue={editingProperty?.parking || 'Available'} className="admin-select">
                    <option value="Available">Available (కార్ పార్కింగ్ ఉంది)</option>
                    <option value="None">No Dedicated Parking</option>
                    <option value="Reserved">Reserved Basement</option>
                    <option value="Open">Open Street Parking</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1rem 0', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                      <input name="vastuCompliant" type="checkbox" defaultChecked={editingProperty?.vastuCompliant} /> Vastu Compliant
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                      <input name="isGated" type="checkbox" defaultChecked={editingProperty?.isGated} /> Gated Community
                    </label>
                    {['Residential Plot', 'Commercial Plot', 'Agricultural Land', 'CRDA Approved Plot', 'Open Plot', 'Layout Plot'].includes(liveData.type) && (
                      <>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                          <input name="cornerProperty" type="checkbox" defaultChecked={editingProperty?.cornerProperty} /> Corner Plot
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                          <input name="boundaryWall" type="checkbox" defaultChecked={editingProperty?.boundaryWall} /> Boundary Wall
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


          {/* STEP 7: REALTOR / SOURCE INFO */}
          <section>
            <h3 style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '20px', height: '1px', background: 'var(--gold)' }} /> 7. CONTACT INFO
            </h3>
            <div style={{ padding: '1.25rem', background: 'rgba(232,184,75,0.04)', borderRadius: '16px', border: '1px solid rgba(232,184,75,0.15)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* CRM Picker - Only show in Advanced */}
              {realtors.length > 0 && (

                <div>
                  <label className="admin-label">Pick from CRM Realtors</label>
                  <select
                    className="admin-select"
                    value={realtorData.contactId || ''}
                    onChange={(e) => {
                      const picked = realtors.find((r: any) => r._id === e.target.value);
                      if (picked) {
                        setRealtorData({
                          contactId: picked._id,
                          name:      picked.name,
                          phone:     picked.phone,
                          email:     picked.email || '',
                          agency:    picked.company || '',
                          licenseNo: picked.licenseNo || '',
                          photo:     picked.photo || '',
                        });
                      } else {
                        setRealtorData({});
                      }
                    }}
                    style={{ border: '1px solid rgba(232,184,75,0.3)' }}
                  >
                    <option value="">-- Enter manually --</option>
                    {realtors.map((r: any) => (
                      <option key={r._id} value={r._id}>
                        {r.name}{r.company ? ` · ${r.company}` : ''}
                      </option>
                    ))}
                  </select>
                  {realtorData.contactId && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(16,217,140,0.08)', border: '1px solid rgba(16,217,140,0.2)', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 700 }}>
                      ✅ Linked to CRM: {realtorData.name} · {realtorData.phone}
                    </div>
                  )}
                </div>
              )}

              <div className="responsive-form-grid">
                <div>
                  <label className="admin-label">Realtor Name <span className="required-asterisk">*</span></label>
                  <input className="admin-input" placeholder="e.g. Ravi Kumar" value={realtorData.name || ''}
                    onChange={e => setRealtorData((p: any) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="admin-label">Phone / WhatsApp <span className="required-asterisk">*</span></label>
                  <input className="admin-input" placeholder="e.g. 9346793364" value={realtorData.phone || ''}
                    onChange={e => setRealtorData((p: any) => ({ ...p, phone: e.target.value }))} required />
                </div>
                <div>

                  <label className="admin-label">Agency / Firm</label>
                  <input className="admin-input" placeholder="e.g. Ravi Realty" value={realtorData.agency || ''}
                    onChange={e => setRealtorData((p: any) => ({ ...p, agency: e.target.value }))} />
                </div>
                <div>
                  <label className="admin-label">RERA License No</label>
                  <input className="admin-input" placeholder="If applicable" value={realtorData.licenseNo || ''}
                    onChange={e => setRealtorData((p: any) => ({ ...p, licenseNo: e.target.value }))} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="admin-label">Email</label>
                  <input className="admin-input" placeholder="realtor@email.com" value={realtorData.email || ''}
                    onChange={e => setRealtorData((p: any) => ({ ...p, email: e.target.value }))} />
                </div>
              </div>

              {realtorData.name && (
                <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(232,184,75,0.1)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  👤 Listed by <strong style={{ color: 'var(--gold)' }}>{realtorData.name}</strong>{realtorData.agency ? ` · ${realtorData.agency}` : ''}
                </div>
              )}
            </div>
          </section>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="admin-label">8. MEDIA ASSETS (UP TO 12)</label>

            <MediaManager 
              existingUrls={currentImageUrls}
              onImagesChange={handleMediaChange}
              maxFiles={12}
            />
          </div>

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
  );
};
