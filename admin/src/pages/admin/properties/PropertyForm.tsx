import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { X, Zap, Sparkles, ShieldCheck, Camera, Plus } from 'lucide-react';
import { MediaManager } from '../../../components/ui/MediaManager';
import { LivePreviewCard } from '../../../components/ui/LivePreviewCard';
import { getFuzzySuggestions } from '../../../services/SearchParser';
import { toast } from 'react-hot-toast';

interface PropertyFormProps {
  isEditing: boolean;
  editingProperty: any;
  liveData: any;
  setLiveData: React.Dispatch<React.SetStateAction<any>>;
  customFeatures: { label: string; value: string }[];
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
  mediaSettings: { url: string; objectFit: 'cover' | 'contain' }[];
  priceUnit: 'Total' | 'Lakhs' | 'Cr';
  setPriceUnit: (v: 'Total' | 'Lakhs' | 'Cr') => void;
  handleAddSubmit: (e: React.FormEvent) => Promise<any>;
  handleFormChange: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCloseForm: () => void;
  handleGenerateAIDescription: () => Promise<void>;
  handleMediaChange: (urls: string[], files: File[], settings: any[]) => void;
  addCustomFeature: () => void;
  removeCustomFeature: (index: number) => void;
  updateCustomFeature: (index: number, key: 'label' | 'value', val: string) => void;
  realtorData: any;
  setRealtorData: (v: any) => void;
  realtors?: any[];
  formatPriceAdminLocal?: (price: any, compact?: boolean) => string;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  isEditing,
  editingProperty,
  liveData,
  setLiveData,
  customFeatures,
  isVerified,
  setIsVerified,
  isFeatured,
  setIsFeatured,
  isElite,
  setIsElite,
  isTrustVerified,
  setIsTrustVerified,
  isGeneratingAI,
  isUploading,
  currentImageUrls,
  mediaSettings,
  priceUnit,
  setPriceUnit,
  handleAddSubmit,
  handleFormChange,
  handleCloseForm,
  handleGenerateAIDescription,
  handleMediaChange,
  addCustomFeature,
  removeCustomFeature,
  updateCustomFeature,
  realtorData,
  setRealtorData,
  realtors = [],
  formatPriceAdminLocal,
}) => {
  const [activeTab, setActiveTab] = useState<'essentials' | 'specs' | 'media'>('essentials');
  const [locInput, setLocInput] = useState(editingProperty?.location || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const propType = (liveData.type || '').toLowerCase();
  const isAgri = propType.includes('agri') || propType.includes('farm');
  const isPlot = propType.includes('plot') || propType.includes('layout') || propType.includes('crda');
  const isLand = isAgri || isPlot;
  const isCommercial =
    propType.includes('commercial') ||
    propType.includes('shop') ||
    propType.includes('office') ||
    propType.includes('industrial') ||
    propType.includes('warehouse');
  const isResidential = !isLand && !isCommercial;

  const handleLocSearch = (val: string) => {
    setLocInput(val);
    if (val.length >= 2) setSuggestions(getFuzzySuggestions(val));
    else setSuggestions([]);
  };

  const selectLoc = (loc: any) => {
    setLocInput(loc.name);
    setSuggestions([]);
    setLiveData((p: any) => ({
      ...p,
      location: loc.name,
      district: loc.district || p.district,
      mandal: loc.mandal || loc.name,
      pincode: loc.pincode || '',
    }));
  };

  const onFinalSubmit = async (e: React.FormEvent) => {
    try {
      await handleAddSubmit(e);
      toast.success(isEditing ? 'Asset updated in the grid! ✨' : 'Asset published live! 🚀');
    } catch (err: any) {
      toast.error(err.message || 'Synchronization failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="admin-grid-1-2-responsive">
      <div className="glass-card" style={{ padding: '2rem', borderRadius: '28px', background: 'var(--bg-glass)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>
            {isEditing ? 'Sync Asset' : 'New Listing'}
          </h2>
          <button
            onClick={handleCloseForm}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              color: 'white',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="scroll-x-mobile"
          style={{
            gap: '0.5rem',
            marginBottom: '2.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          { [
            { id: 'essentials', label: 'Essentials', icon: <Zap size={14} /> },
            { id: 'specs', label: 'Specifications', icon: <ShieldCheck size={14} /> },
            { id: 'media', label: 'Media & Trust', icon: <Camera size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '14px 24px',
                background: activeTab === tab.id ? 'rgba(232,184,75,0.05)' : 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--gold)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s',
                borderRadius: '12px 12px 0 0'
              }}
            >
              {tab.icon} {tab.label.toUpperCase()}
            </button>
          ))}
        </div>

        <form
          onChange={handleFormChange}
          onSubmit={onFinalSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}
        >
          {activeTab === 'essentials' && (
            <div className="responsive-form-grid">
              <div className="col-span-full">
                <label className="admin-label">
                  Property Title <span className="required-asterisk">*</span>
                </label>
                <input
                  name="title"
                  defaultValue={editingProperty?.title || ''}
                  className="admin-input"
                  placeholder="e.g. 3BHK Luxury Flat in Amaravati"
                  required
                />
              </div>
              <div>
                <label className="admin-label">
                  Property Type <span className="required-asterisk">*</span>
                </label>
                <select
                  name="type"
                  defaultValue={editingProperty?.type || 'Apartment'}
                  className="admin-select"
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
                  <optgroup label="Agricultural">
                    <option value="Agricultural Land">Agricultural Land</option>
                    <option value="Farmhouse">Farmhouse</option>
                  </optgroup>
                  <optgroup label="Commercial/Industrial">
                    <option value="Commercial Plot">Commercial Plot</option>
                    <option value="Commercial Space">Commercial Space</option>
                    <option value="Office Space">Office Space</option>
                    <option value="Industrial Shed">Industrial Shed</option>
                    <option value="Warehouse">Warehouse</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="admin-label">
                  Listing For <span className="required-asterisk">*</span>
                </label>
                <select name="purpose" defaultValue={editingProperty?.purpose || 'Sale'} className="admin-select">
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                  <option value="Lease">Lease</option>
                </select>
              </div>
              <div className="col-span-full">
                <label className="admin-label">
                  Location / Area <span className="required-asterisk">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={locInput}
                    onChange={(e) => handleLocSearch(e.target.value)}
                    className="admin-input"
                    placeholder="Search locality..."
                    required
                  />
                  {suggestions.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 10,
                        background: '#0a0a14',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        marginTop: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      {suggestions.map((loc, i) => (
                        <div
                          key={i}
                          onClick={() => selectLoc(loc)}
                          style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '0.8rem',
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          {loc.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="admin-label">Price ({priceUnit})</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    name="price"
                    type="number"
                    defaultValue={liveData.price_raw || ''}
                    className="admin-input"
                    style={{ flex: 1 }}
                  />
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value as any)}
                    className="admin-select"
                    style={{ width: '80px' }}
                  >
                    <option value="Total">₹</option>
                    <option value="Lakhs">Lakhs</option>
                    <option value="Cr">Cr</option>
                  </select>
                </div>
              </div>
              <div className="col-span-full">
                <label className="admin-label">Area Size & Units</label>
                <div className="responsive-form-grid" style={{ gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      name="areaSize"
                      type="number"
                      defaultValue={editingProperty?.areaSize || ''}
                      className="admin-input"
                      style={{ flex: 1 }}
                    />
                    <select
                      name="measurementUnit"
                      defaultValue={editingProperty?.measurementUnit || (isAgri ? 'Acres' : 'Sq.Ft')}
                      className="admin-select"
                      style={{ width: '120px' }}
                    >
                      <option value="Sq.Ft">Sq.Ft</option>
                      <option value="Sq.Yards">Sq.Yds</option>
                      <option value="Acres">Acres</option>
                      <option value="Cents">Cents</option>
                      <option value="Ankanam">Ankanam</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Survey / Document No</label>
                    <input
                        name="surveyNo"
                        defaultValue={editingProperty?.surveyNo || ''}
                        className="admin-input"
                        placeholder="e.g. 124/A"
                      />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="admin-label">Market Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateAIDescription}
                    disabled={isGeneratingAI}
                    className="btn-ghost"
                    style={{ fontSize: '0.65rem', color: 'var(--gold)', display: 'flex', gap: '6px', alignItems: 'center' }}
                  >
                    <Sparkles size={12} /> {isGeneratingAI ? 'AI PROCESSING...' : 'AI AUTO-DESCRIBE'}
                  </button>
                </div>
                <textarea
                  name="description"
                  value={liveData.description || ''}
                  onChange={(e) => setLiveData((p: any) => ({ ...p, description: e.target.value }))}
                  className="admin-input"
                  rows={4}
                  placeholder="High-end marketing pitch..."
                />
              </div>

              <div className="responsive-form-grid">
                <div>
                  <label className="admin-label">Facing</label>
                  <select name="facing" defaultValue={editingProperty?.facing || 'East'} className="admin-select">
                    <option>East</option>
                    <option>West</option>
                    <option>North</option>
                    <option>South</option>
                    <option>North-East</option>
                    <option>South-West</option>
                    <option>North-West</option>
                    <option>South-East</option>
                  </select>
                </div>

                {isResidential && (
                  <>
                    <div>
                      <label className="admin-label">BHK</label>
                      <select name="bhk" defaultValue={editingProperty?.bhk || '2'} className="admin-select">
                        <option value="1">1 BHK</option>
                        <option value="2">2 BHK</option>
                        <option value="3">3 BHK</option>
                        <option value="4">4 BHK</option>
                        <option value="5">5+ BHK</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Furnishing</label>
                      <select
                        name="furnishing"
                        defaultValue={editingProperty?.furnishing || 'Unfurnished'}
                        className="admin-select"
                      >
                        <option>Unfurnished</option>
                        <option>Semi-Furnished</option>
                        <option>Fully Furnished</option>
                      </select>
                    </div>
                  </>
                )}

                {isAgri && (
                  <>
                    <div>
                      <label className="admin-label">Road Type</label>
                      <select name="roadType" defaultValue={editingProperty?.roadType || 'Mud Road'} className="admin-select">
                        <option>Mud Road</option>
                        <option>BT Road</option>
                        <option>CC Road</option>
                        <option>NH / SH</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Water Source</label>
                      <select name="waterSource" defaultValue={editingProperty?.waterSource || 'Borewell'} className="admin-select">
                        <option>Borewell</option>
                        <option>Canal</option>
                        <option>Both</option>
                        <option>None</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Survey Number</label>
                      <input
                        name="surveyNo"
                        defaultValue={editingProperty?.surveyNo || ''}
                        className="admin-input"
                        placeholder="e.g. 124/A"
                      />
                    </div>
                  </>
                )}

                {(isAgri || propType.includes('plot')) && (
                  <>
                    <div>
                      <label className="admin-label">Approval Authority</label>
                      <select
                        name="approvalAuthority"
                        defaultValue={editingProperty?.approvalAuthority || 'None'}
                        className="admin-select"
                      >
                        <option value="None">None / LP Pending</option>
                        <option value="CRDA">CRDA Approved</option>
                        <option value="DTCP">DTCP Approved</option>
                        <option value="HMDA">HMDA Approved</option>
                        <option value="VMRDA">VMRDA Approved</option>
                        <option value="GP">Gram Panchayat</option>
                      </select>
                    </div>
                    <div>
                      <label className="admin-label">Road Width (Ft)</label>
                      <input
                        name="roadWidth"
                        type="number"
                        defaultValue={editingProperty?.roadWidth || ''}
                        className="admin-input"
                        placeholder="e.g. 40"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                  <label className="admin-label" style={{ margin: 0 }}>
                    Custom Specifications
                  </label>
                  <button
                    type="button"
                    onClick={addCustomFeature}
                    className="btn-ghost"
                    style={{ fontSize: '0.65rem', color: 'var(--violet)', display: 'flex', gap: '6px', alignItems: 'center' }}
                  >
                    <Plus size={12} /> ADD FIELD
                  </button>
                </div>
                <div className="flex-column" style={{ gap: '0.75rem' }}>
                  {customFeatures.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                        placeholder="Label (e.g. Distance to NH)"
                        value={feat.label}
                        onChange={(e) => updateCustomFeature(idx, 'label', e.target.value)}
                        className="admin-input"
                        style={{ flex: 1 }}
                      />
                      <input
                        placeholder="Value (e.g. 500m)"
                        value={feat.value}
                        onChange={(e) => updateCustomFeature(idx, 'value', e.target.value)}
                        className="admin-input"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeCustomFeature(idx)}
                        style={{
                          background: 'rgba(245,57,123,0.1)',
                          border: 'none',
                          color: 'var(--rose)',
                          padding: '0 12px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label className="admin-label">Asset Media</label>
                <MediaManager
                  existingUrls={currentImageUrls}
                  existingSettings={mediaSettings}
                  onImagesChange={handleMediaChange}
                  maxFiles={12}
                />
              </div>

              <div className="content-grid-tight" style={{ gap: '1rem' }}>
                <div
                  className="glass-card"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    background: isVerified ? 'rgba(16,217,140,0.05)' : 'none',
                    border: isVerified ? '1px solid var(--emerald)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isVerified ? 'var(--emerald)' : 'white' }}>
                      TRUST SEAL
                    </div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Verified authenticity badge.</div>
                  </div>
                </div>
                <div
                  className="glass-card"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    background: isFeatured ? 'rgba(232,184,75,0.05)' : 'none',
                    border: isFeatured ? '1px solid var(--gold)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isFeatured ? 'var(--gold)' : 'white' }}>
                      FEATURED ASSET
                    </div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Priority search positioning.</div>
                  </div>
                </div>
                <div
                  className="glass-card"
                  style={{
                    padding: '1rem',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    background: isElite ? 'rgba(155,89,245,0.05)' : 'none',
                    border: isElite ? '1px solid var(--violet)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isElite}
                    onChange={(e) => setIsElite(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isElite ? 'var(--violet)' : 'white' }}>
                      ELITE STATUS
                    </div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Ultra-premium visibility.</div>
                  </div>
                </div>
                <div
                  className="glass-card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    background: isTrustVerified ? 'rgba(34,217,224,0.05)' : 'none',
                    border: isTrustVerified ? '1px solid var(--cyan)' : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isTrustVerified}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--cyan)' }}
                    onChange={(e) => setIsTrustVerified(e.target.checked)}
                  />
                  <div>
                    <div
                      style={{ fontSize: '0.75rem', fontWeight: 900, color: isTrustVerified ? 'var(--cyan)' : 'white' }}
                    >
                      TRUST VERIFIED
                    </div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>Institutional grade security.</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="admin-label">Communication Hub</label>
                <div
                  className="glass-card"
                  style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setLiveData((p: any) => ({ ...p, displayContactType: 'Admin' }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: liveData.displayContactType === 'Admin' ? 'var(--gold)' : 'transparent',
                        color: liveData.displayContactType === 'Admin' ? 'black' : 'white',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      INSTITUTIONAL
                    </button>
                    <button
                      type="button"
                      onClick={() => setLiveData((p: any) => ({ ...p, displayContactType: 'Lister' }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: liveData.displayContactType === 'Lister' ? 'var(--emerald)' : 'transparent',
                        color: liveData.displayContactType === 'Lister' ? 'black' : 'white',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      DIRECT CONTACT
                    </button>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      <input
                        type="checkbox"
                        name="isOwnerListing"
                        checked={liveData.isOwnerListing || false}
                        onChange={(e) => setLiveData((p: any) => ({ ...p, isOwnerListing: e.target.checked }))}
                      />
                      MARK AS "DIRECT OWNER" LISTING
                    </label>
                  </div>

                  <select
                    className="admin-select"
                    value={realtorData.contactId || ''}
                    onChange={(e) => {
                      const r = realtors.find((re) => re._id === e.target.value);
                      setRealtorData(r ? { contactId: r._id, name: r.name, phone: r.phone } : {});
                    }}
                  >
                    <option value="">-- Select Partner / Realtor (Optional) --</option>
                    {realtors.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={handleCloseForm}
              className="btn btn-ghost"
              style={{ flex: 1, borderRadius: '14px' }}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="btn btn-violet"
              style={{ flex: 2, borderRadius: '14px', fontWeight: 900 }}
            >
              {isUploading ? 'SYNCING...' : isEditing ? 'UPDATE ASSET' : 'PUBLISH LIVE'}
            </button>
          </div>
        </form>
      </div>

      <div className="admin-preview-sticky">
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 950,
            color: 'var(--emerald)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}
        >
          <div
            className="pulse-dot"
            style={{ width: '8px', height: '8px', background: 'var(--emerald)', borderRadius: '50%' }}
          />{' '}
          LIVE SYNC PREVIEW
        </div>
        <LivePreviewCard
          {...liveData}
          isVerified={isVerified}
          isFeatured={isFeatured}
          isElite={isElite}
          isTrustVerified={isTrustVerified}
          images={currentImageUrls}
          image={currentImageUrls[0]}
          formatPrice={formatPriceAdminLocal}
        />
        
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(232,184,75,0.03)', borderRadius: '20px', border: '1px solid rgba(232,184,75,0.1)' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '8px' }}>Pro Tip: High Fidelity Sync</h4>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
            Changes are reflected instantly. Ensure the title is catchy and the location is precisely mapped for optimal institutional discovery.
          </p>
        </div>
      </div>

      <style>{`
        .admin-grid-1-2-responsive {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 2.5rem;
          align-items: start;
        }
        .admin-preview-sticky {
          position: sticky;
          top: 2rem;
        }
        @media (max-width: 1200px) {
          .admin-grid-1-2-responsive {
            grid-template-columns: 1fr;
          }
          .admin-preview-sticky {
            position: static;
            margin-top: 2rem;
          }
        }
      `}</style>
    </motion.div>
  );
};
