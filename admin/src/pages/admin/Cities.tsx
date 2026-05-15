import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { fetchCities, createCity, updateCity, uploadMedia } from '../../services/api';
import { Edit3, Plus, X } from 'lucide-react';
import { MediaManager } from '../../components/ui/MediaManager';

const AdminCities = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const loadCities = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCities();
      if (data && data.data) setCities(data.data);
      else if (Array.isArray(data)) setCities(data);
    } catch (error) {
      console.error("Failed to load cities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const handleEdit = (city: any) => {
    setEditingCity(city);
    setCurrentImageUrl(city.image || '');
    setIsEditing(true);
    setIsAdding(true);
  };


  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const cityData: any = Object.fromEntries(formData.entries());

    try {
      // Handle Image Upload
      if (newImageFile) {
        try {
          const uploadResult = await uploadMedia([newImageFile]);
          if (uploadResult.status === 'success' && uploadResult.data.length > 0) {
            cityData.image = uploadResult.data[0];
          } else {
            throw new Error(uploadResult.message || "Media server error");
          }
        } catch (mediaErr: any) {
          console.error("City Image Upload Failed:", mediaErr);
          alert(`Image upload failed: ${mediaErr.message || "Connection error"}. Saving without new image.`);
          cityData.image = currentImageUrl;
        }
      } else {
        cityData.image = currentImageUrl; // Keep existing or empty if removed
      }

      if (isEditing && editingCity) {
        await updateCity(editingCity._id || editingCity.id, cityData);
        alert('Region updated successfully!');
      } else {
        await createCity(cityData);
        alert('Region added successfully!');
      }
      setIsAdding(false);
      setIsEditing(false);
      setEditingCity(null);
      setNewImageFile(null);
      setCurrentImageUrl('');
      loadCities();
    } catch (err: any) {
      console.error("City Save Error:", err);
      alert(`Failed to save region: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaChange = (urls: string[], files: File[]) => {
    setCurrentImageUrl(urls.length > 0 ? urls[0] : '');
    setNewImageFile(files.length > 0 ? files[0] : null);
  };

  return (
    <div>
      <div style={{ background: 'rgba(34,217,224,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(34,217,224,0.1)', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 600 }}>
          💡 <strong>Help:</strong> Here you can add or edit the cities and regions (like Vizag or Amaravati) that appear on your website. Each city can have its own cover image to make the site look beautiful.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>Andhra Regions & Cities</h1>
        <Button 
          className="btn-3d-liquid"
          style={{ background: 'var(--violet)', color: 'white', borderRadius: '14px', padding: '0.8rem 1.5rem', fontWeight: 800, border: 'none', boxShadow: '0 10px 20px rgba(155,89,245,0.2)' }}
          onClick={() => {
            setIsAdding(!isAdding);
            if (isEditing) {
              setIsEditing(false);
              setEditingCity(null);
              setCurrentImageUrl('');
              setNewImageFile(null);
            }
          }}
        >
          {isAdding ? <X size={20} /> : <Plus size={20} />}
          {isAdding ? ' CLOSE' : ' ADD LOCATION'}
        </Button>
      </div>

      {isAdding && (
        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '28px', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.08)', transform: 'translateZ(0)' }}>
          <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 800 }}>{isEditing ? `Edit Location: ${editingCity?.name}` : 'Add New Location'}</h2>
          <form onSubmit={handleAddSubmit} className="responsive-form-grid" style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>City/Region Name</label>
              <input name="name" type="text" required defaultValue={editingCity?.name || ''} placeholder="e.g. Vizag" style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white', minHeight: '44px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</label>
              <select name="status" defaultValue={editingCity?.status || 'Active'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white', minHeight: '44px' }}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Region Cover Image</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                <MediaManager 
                  existingUrls={currentImageUrl ? [currentImageUrl] : []}
                  maxFiles={1}
                  onImagesChange={(urls, files) => handleMediaChange(urls, files)}
                />
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <Button type="button" variant="ghost" onClick={() => {
                setIsEditing(false);
                setEditingCity(null);
                setCurrentImageUrl('');
                setNewImageFile(null);
              }} style={{ flex: 1, minWidth: '120px' }}>Cancel</Button>
              <Button type="submit" disabled={isUploading} style={{ flex: 2, minWidth: '160px' }}>{isUploading ? 'Uploading...' : (isEditing ? 'Update Region' : 'Save Region')}</Button>
            </div>
          </form>
        </div>
      )}

      {/* Desktop View */}
      <div className="desktop-only" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: 'var(--spacing-md)' }}>ID</th>
                <th style={{ padding: 'var(--spacing-md)' }}>City Name</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Status</th>
                <th style={{ padding: 'var(--spacing-md)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>Loading cities...</td></tr>
              ) : cities.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>No regions found. Add one above!</td></tr>
              ) : cities.map((city) => (
                <tr key={city._id || city.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: 'var(--spacing-md)', color: 'var(--text-muted)' }}>#{ (city._id || city.id).toString().substring(0, 5) }</td>
                  <td style={{ padding: 'var(--spacing-md)', fontWeight: 500 }}>{city.name}</td>
                  <td style={{ padding: 'var(--spacing-md)' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      backgroundColor: city.status === 'Active' ? 'rgba(46, 204, 113, 0.2)' : 'rgba(241, 196, 15, 0.2)',
                      color: city.status === 'Active' ? 'var(--success)' : '#f1c40f'
                    }}>
                      {city.status}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--spacing-md)', display: 'flex', gap: '10px' }}>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(city)}>
                      <Edit3 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isLoading ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : cities.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No regions found.</div>
        ) : cities.map((city) => (
          <div key={city._id || city.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {city.image ? (
                <img src={city.image} alt={city.name} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={16} style={{ opacity: 0.3 }} />
                </div>
              )}
              <div>
                <div style={{ fontWeight: 800, color: 'white', fontSize: '0.9rem' }}>{city.name}</div>
                <div style={{ 
                  fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: city.status === 'Active' ? 'var(--emerald)' : 'var(--orange)' 
                }}>
                  {city.status}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleEdit(city)} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white' }}><Edit3 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCities;
