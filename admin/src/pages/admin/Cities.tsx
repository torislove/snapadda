import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { fetchCities, createCity, updateCity, uploadMedia } from '../../services/api';
import { Edit3, Plus, X, MapPin, Globe } from 'lucide-react';
import { MediaManager } from '../../components/ui/MediaManager';
import { toast } from 'react-hot-toast';

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
      toast.error('Failed to load regions');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const cityData: any = Object.fromEntries(formData.entries());

    try {
      if (newImageFile) {
        const uploadResult = await uploadMedia([newImageFile]);
        if (uploadResult.status === 'success' && uploadResult.data.length > 0) {
          cityData.image = uploadResult.data[0];
        } else if (uploadResult.urls?.length) {
          cityData.image = uploadResult.urls[0];
        }
      } else {
        cityData.image = currentImageUrl;
      }

      if (isEditing && editingCity) {
        await updateCity(editingCity._id || editingCity.id, cityData);
        toast.success('Region holographic record updated! ✨');
      } else {
        await createCity(cityData);
        toast.success('New region added to the grid! 🌐');
      }
      setIsAdding(false);
      setIsEditing(false);
      setEditingCity(null);
      setNewImageFile(null);
      setCurrentImageUrl('');
      loadCities();
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync region data');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaChange = (urls: string[], files: File[]) => {
    setCurrentImageUrl(urls.length > 0 ? urls[0] : '');
    setNewImageFile(files.length > 0 ? files[0] : null);
  };

  return (
    <div style={{ position: 'relative' }}>
      
      <div style={{ background: 'rgba(34,217,224,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(34,217,224,0.1)', marginBottom: '2rem' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 600 }}>
          💡 <strong>Help:</strong> Manage the cities and regions that appear on your website. Each location represents a key market segment in Andhra.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Globe style={{ color: 'var(--cyan)' }} size={28} /> Regional Coverage
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>Active markets in the SnapAdda spatial grid.</p>
        </div>
        <Button 
          className="btn-3d-liquid"
          style={{ background: 'var(--cyan)', color: 'black', borderRadius: '14px', padding: '0.8rem 1.5rem', fontWeight: 900, border: 'none' }}
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
          {isAdding ? ' CLOSE' : ' ADD REGION'}
        </Button>
      </div>

      {isAdding && (
        <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 800 }}>{isEditing ? `Edit: ${editingCity?.name}` : 'Create New Region'}</h2>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="responsive-form-grid" style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Region Name</label>
                <input name="name" type="text" required defaultValue={editingCity?.name || ''} placeholder="e.g. Amaravati" style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</label>
                <select name="status" defaultValue={editingCity?.status || 'Active'} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cover Image</label>
              <MediaManager 
                existingUrls={currentImageUrl ? [currentImageUrl] : []}
                maxFiles={1}
                onImagesChange={handleMediaChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button type="submit" disabled={isUploading} className="btn-3d-liquid" style={{ background: 'var(--cyan)', color: 'black', fontWeight: 900 }}>
                {isUploading ? 'Processing...' : (isEditing ? 'Sync Changes' : 'Launch Region')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Simplified Responsive Bento Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {isLoading ? (
          [1,2,3].map(i => <div key={i} className="glass-card" style={{ height: '140px', animation: 'pulse 1.5s infinite' }} />)
        ) : cities.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', border: '1.5px dashed rgba(255,255,255,0.1)', borderRadius: '24px' }}>
            No regions mapped. Expand your coverage above.
          </div>
        ) : cities.map((city) => (
          <div key={city._id || city.id} className="glass-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            {city.image ? (
              <img src={city.image} alt={city.name} style={{ width: '60px', height: '60px', borderRadius: '16px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
            ) : (
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={24} style={{ color: 'var(--cyan)', opacity: 0.5 }} />
              </div>
            )}
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'white', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ 
                  width: '6px', height: '6px', borderRadius: '50%', 
                  background: city.status === 'Active' ? '#10d98c' : '#4b5563' 
                }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: city.status === 'Active' ? 'var(--emerald)' : 'var(--text-muted)' }}>
                  {city.status}
                </span>
              </div>
            </div>

            <button 
              onClick={() => handleEdit(city)} 
              style={{ 
                padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', 
                color: 'white', cursor: 'pointer', transition: 'all 0.2s' 
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,217,224,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <Edit3 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCities;
