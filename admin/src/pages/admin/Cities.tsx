import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { fetchCities, createCity, updateCity, deleteCity, uploadMedia } from '../../services/api';
import { Trash2, Edit3, Plus, X } from 'lucide-react';
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this region? All properties in this region will be unlinked.')) return;
    try {
      await deleteCity(id);
      loadCities();
      alert('Region deleted successfully');
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const cityData: any = Object.fromEntries(formData.entries());

    try {
      // Handle Image Upload
      if (newImageFile) {
        const uploadResult = await uploadMedia([newImageFile]);
        if (uploadResult.status === 'success' && uploadResult.data.length > 0) {
          cityData.image = uploadResult.data[0];
        }
      } else {
        cityData.image = currentImageUrl; // Keep existing or empty if removed
      }

      if (isEditing && editingCity) {
        await updateCity(editingCity._id || editingCity.id, cityData);
        alert('Region updated!');
      } else {
        await createCity(cityData);
        alert('Region added!');
      }
      setIsAdding(false);
      setIsEditing(false);
      setEditingCity(null);
      setNewImageFile(null);
      setCurrentImageUrl('');
      loadCities();
    } catch (err) {
      alert('Failed to save region');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <h1>Andhra Regions & Cities</h1>
        <Button size="sm" onClick={() => {
          setIsAdding(!isAdding);
          if (isEditing) {
            setIsEditing(false);
            setEditingCity(null);
            setCurrentImageUrl('');
            setNewImageFile(null);
          }
        }}>
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? ' Close' : ' Add New City'}
        </Button>
      </div>

      {isAdding && (
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-xl)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-xl)', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>{isEditing ? `Edit: ${editingCity?.name}` : 'Add New Region'}</h2>
          <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>City/Region Name</label>
              <input name="name" type="text" required defaultValue={editingCity?.name || ''} placeholder="e.g. Vizag" style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</label>
              <select name="status" defaultValue={editingCity?.status || 'Active'} style={{ width: '100%', padding: '10px', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'white' }}>
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
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
              <Button type="button" variant="ghost" onClick={() => {
                setIsEditing(false);
                setEditingCity(null);
                setCurrentImageUrl('');
                setNewImageFile(null);
              }}>Cancel</Button>
              <Button type="submit" disabled={isUploading}>{isUploading ? 'Uploading...' : (isEditing ? 'Update Region' : 'Save Region')}</Button>
            </div>
          </form>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
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
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(city._id || city.id)} style={{ color: 'var(--error)' }}>
                      <Trash2 size={16} />
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

export default AdminCities;
