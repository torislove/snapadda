import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { fetchProperties, createProperty, deleteProperty, updateProperty, uploadMedia, togglePropertyVerification } from '../../services/api';
import { ShieldCheck, Plus, Trash2, Camera, Star, Check, X } from 'lucide-react';
import { LivePreviewCard } from '../../components/ui/LivePreviewCard';

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
      // 1. Upload Media to Cloudinary via Backend
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
      
      // Ensure numeric types
      propData.price = Number(propData.price) || 0;
      propData.areaSize = Number(propData.areaSize) || 0;
      propData.bhk = Number(propData.bhk) || 0;

      if (isEditing && editingProperty) {
        await updateProperty(editingProperty._id || editingProperty.id, propData);
        alert('Property updated successfully!');
      } else {
        const result = await createProperty(propData);
        setProperties(prev => [...prev, result.data]);
        alert('Property created successfully!');
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

  const removeCustomFeature = (index: number) => {
    setCustomFeatures(customFeatures.filter((_, i) => i !== index));
  };

  const handleDelete = async (propId: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      await deleteProperty(propId);
      loadProperties();
      alert('Property deleted successfully!');
    } catch {
      alert('Failed to delete. Try again.');
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
    
    // Generate object URLs for immediate visual preview
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
    
    setLiveData((prev: any) => ({
      ...prev,
      image: previewUrls.length > 0 ? previewUrls[0] : prev.image
    }));
  };

  const addCustomFeature = () => {
    setCustomFeatures([...customFeatures, { label: '', value: '' }]);
  };

  const updateCustomFeature = (index: number, field: 'label' | 'value', val: string) => {
    const updated = [...customFeatures];
    updated[index][field] = val;
    setCustomFeatures(updated);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>Property Management</h1>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Close Form' : 'Add New Property'}
        </Button>
      </div>

      {isAdding && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)', alignItems: 'start' }}>
          
          {/* Left Column: Data Entry Form */}
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h2 style={{ marginBottom: 'var(--spacing-md)' }}>
              {isEditing ? `Edit: ${editingProperty?.title}` : 'Add Andhra Property Listing'}
            </h2>
            <form onChange={handleFormChange} onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Property Title</label>
                <input name="title" type="text" required defaultValue={editingProperty?.title || ''} placeholder="Beautiful East Facing Villa in Amaravati" style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Property Type</label>
                <select name="type" defaultValue={editingProperty?.type || 'Apartment'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                  <option>Agriculture</option>
                  <option>Flat</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Plot</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Lister Type</label>
                <select name="listerType" defaultValue={editingProperty?.listerType || 'Individual Owner'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                  <option>Individual Owner</option>
                  <option>Verified Builder</option>
                  <option>Agent / Broker</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Vastu Facing</label>
                <select name="facing" defaultValue={editingProperty?.facing || 'East'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                  <option>East</option>
                  <option>West</option>
                  <option>North</option>
                  <option>South</option>
                  <option>North-East</option>
                  <option>North-West</option>
                  <option>South-East</option>
                  <option>South-West</option>
                  <option>Any</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>BHK</label>
                <select name="bhk" defaultValue={editingProperty?.bhk || 0} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                  <option value={0}>N/A</option>
                  <option value={1}>1 BHK</option>
                  <option value={2}>2 BHK</option>
                  <option value={3}>3 BHK</option>
                  <option value={4}>4 BHK</option>
                  <option value={5}>5+ BHK</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Furnishing</label>
                <select name="furnishing" defaultValue={editingProperty?.furnishing || 'N/A'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                  <option>N/A</option>
                  <option>Unfurnished</option>
                  <option>Semi-Furnished</option>
                  <option>Furnished</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Construction Status</label>
                <select name="constructionStatus" defaultValue={editingProperty?.constructionStatus || 'N/A'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                  <option>N/A</option>
                  <option>Ready to Move</option>
                  <option>Under Construction</option>
                  <option>New Launch</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Approval Authority</label>
                <select name="approvalAuthority" defaultValue={editingProperty?.approvalAuthority || 'AP CRDA'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                  <option>AP CRDA</option>
                  <option>AP RERA</option>
                  <option>VMRDA</option>
                  <option>Panchayat</option>
                  <option>Pending</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Area Size</label>
                  <input name="areaSize" type="number" required defaultValue={editingProperty?.areaSize || ''} placeholder="1000" style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Unit</label>
                  <select name="measurementUnit" defaultValue={editingProperty?.measurementUnit || 'Sq.Ft'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                    <option>Sq.Yards (Gajam)</option>
                    <option>Cents</option>
                    <option>Acres</option>
                    <option>Sq.Ft</option>
                  </select>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Price Value (in INR)</label>
                <input name="price" type="number" required defaultValue={editingProperty?.price || ''} placeholder="8500000" style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Location / City</label>
                <input name="location" type="text" required defaultValue={editingProperty?.location || ''} placeholder="Amaravati, Guntur" style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</label>
                <select name="status" defaultValue={editingProperty?.status || 'Active'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Sold</option>
                </select>
              </div>

              {/* Verification and Dynamic Fields */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: '24px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="verifyProp"
                    checked={isVerified}
                    onChange={(e) => setIsVerified(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="verifyProp" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isVerified ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                    <ShieldCheck size={20} /> Verified Property
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="featureProp"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="featureProp" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isFeatured ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 600 }}>
                    <Star size={20} /> Featured Listing
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Media Center</label>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'gray' }}>Images</label>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageSelect}
                        style={{ width: '100%', padding: '8px', background: 'var(--bg-secondary)' }}
                      />
                      
                      {/* Instant Image Thumbnails */}
                      {imagePreviewUrls.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                          {imagePreviewUrls.map((url, idx) => (
                            <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                              <img src={url} alt={`preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'gray' }}>Virtual Tour URL</label>
                      <input 
                        type="url" 
                        name="videoUrl"
                        defaultValue={editingProperty?.videoUrl || ''}
                        placeholder="https://www.youtube.com/watch?v=..."
                        style={{ width: '100%', padding: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'white', marginTop: '4px' }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Custom Information Fields</label>
                    <Button type="button" variant="ghost" size="sm" onClick={addCustomFeature}>
                      <Plus size={16} style={{ marginRight: '4px' }} /> Add Field
                    </Button>
                  </div>
                  {customFeatures.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="e.g. Distance to Airport" 
                        value={feat.label}
                        onChange={(e) => updateCustomFeature(idx, 'label', e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }}
                      />
                      <input 
                        type="text" 
                        placeholder="e.g. 5 km" 
                        value={feat.value}
                        onChange={(e) => updateCustomFeature(idx, 'value', e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'white' }}
                      />
                      <Button type="button" variant="ghost" onClick={() => removeCustomFeature(idx)}>
                        <Trash2 size={18} color="#e74c3c" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
                <Button type="button" variant="ghost" onClick={handleCloseForm}>Cancel</Button>
                <Button type="submit" disabled={isUploading}>{isUploading ? 'Saving...' : 'Save Property'}</Button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Property Demo Card */}
          <div style={{ position: 'sticky', top: 'var(--spacing-xl)', backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--spacing-lg)', color: 'var(--accent-gold)', fontWeight: 600 }}>
              <Camera size={20} /> Client Live Preview
            </div>
            <p style={{ fontSize: '0.85rem', color: 'gray', marginBottom: '16px' }}>This is exactly how your property will look to buyers on the website.</p>
            <LivePreviewCard 
              title={liveData.title || ''}
              price={liveData.price || ''}
              location={liveData.location || ''}
              type={liveData.type || 'Apartment'}
              facing={liveData.facing || 'Any'}
              approval={liveData.approvalAuthority || 'N/A'}
              measurementUnit={liveData.measurementUnit || 'Sq.Ft'}
              areaSize={liveData.areaSize || 0}
              isVerified={isVerified}
              listerType={liveData.listerType || 'Individual Owner'}
              image={imagePreviewUrls.length > 0 ? imagePreviewUrls[0] : undefined}
            />
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: 'var(--spacing-md)' }}>ID</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Verified</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Featured</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Title</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Price</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Status</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((prop) => (
                <tr key={prop._id || prop.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-muted)' }}>#{prop.id || prop._id?.substring(0, 4)}</td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <button 
                      onClick={() => togglePropertyVerification(prop._id || prop.id, prop.isVerified).then(loadProperties)}
                      style={{ color: prop.isVerified ? 'var(--success)' : 'var(--text-muted)', transition: 'all 0.2s' }}
                    >
                      {prop.isVerified ? <Check size={20} /> : <X size={20} />}
                    </button>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', color: prop.isFeatured ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                    {prop.isFeatured ? <Star size={18} fill="currentColor" /> : <Star size={18} />}
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>{prop.title}</td>
                  <td style={{ padding: 'var(--spacing-md)' }}>{prop.price}</td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      backgroundColor: prop.status === 'Active' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                      color: prop.status === 'Active' ? 'var(--success)' : '#f1c40f'
                    }}>
                      {prop.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', display: 'flex', gap: '6px' }}>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(prop)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(prop._id || prop.id)} style={{ color: 'var(--error)' }}>
                      <Trash2 size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProperties;
