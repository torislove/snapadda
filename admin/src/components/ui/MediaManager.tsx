import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface MediaItem {
  id: string;
  url: string;
  file?: File;
  isNew: boolean;
}

interface MediaManagerProps {
  existingUrls: string[];
  onImagesChange: (urls: string[], newFiles: File[]) => void;
  maxFiles?: number;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ 
  existingUrls = [], 
  onImagesChange, 
  maxFiles = 10 
}) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize items from existingUrls
  useEffect(() => {
    // Only initialize if items are empty or we want to sync from props (on mount)
    if (items.length === 0 && existingUrls.length > 0) {
      setItems(existingUrls.map((url, i) => ({
        id: `existing-${i}-${Date.now()}`,
        url,
        isNew: false
      })));
    }
  }, [existingUrls]);

  const syncParent = (newItems: MediaItem[]) => {
    const allUrls = newItems.map(it => it.url);
    const newFiles = newItems.filter(it => it.isNew && it.file).map(it => it.file!);
    onImagesChange(allUrls, newFiles);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const OVERSIZE_LIMIT = 30 * 1024 * 1024;
    const oversized = files.filter(f => f.size > OVERSIZE_LIMIT);
    if (oversized.length > 0) {
      alert(`Files too large (Max 30MB): ${oversized.map(f => f.name).join(', ')}`);
      return;
    }

    setIsCompressing(true);
    try {
      const options = { maxSizeMB: 1.5, maxWidthOrHeight: 1920, useWebWorker: true };
      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.type.startsWith('video/')) return file;
          try { return await imageCompression(file, options); } 
          catch (err) { return file; }
        })
      );

      const remainingSlots = maxFiles - items.length;
      const limitedFiles = compressedFiles.slice(0, remainingSlots);

      const newMediaItems: MediaItem[] = limitedFiles.map(file => ({
        id: `new-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        file,
        isNew: true
      }));

      const updatedItems = [...items, ...newMediaItems];
      setItems(updatedItems);
      syncParent(updatedItems);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeItem = (id: string) => {
    const itemToRemove = items.find(it => it.id === id);
    if (itemToRemove?.isNew) URL.revokeObjectURL(itemToRemove.url);
    
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    syncParent(updated);
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;

    const updated = [...items];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    
    setItems(updated);
    syncParent(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            style={{ 
              position: 'relative', aspectRatio: '4/3', borderRadius: '14px', overflow: 'hidden', 
              border: item.isNew ? '1.5px solid var(--gold)' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: item.isNew ? '0 0 15px rgba(232,184,75,0.15)' : 'none',
              group: 'true'
            } as any}
            className="media-item-container"
          >
            <img src={item.url} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            
            {/* Delete Button */}
            <button 
              type="button" 
              onClick={() => removeItem(item.id)}
              style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(245,57,123,0.95)', color: '#fff', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.5)', zIndex: 10 }}
            >
              <X size={14} />
            </button>

            {/* Reorder Controls */}
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0, 
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
              padding: '20px 8px 8px', display: 'flex', justifyContent: 'center', gap: '12px',
              opacity: 1, transition: '0.2s'
            }}>
              <button 
                type="button"
                disabled={idx === 0}
                onClick={() => moveItem(idx, 'left')}
                style={{ 
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '6px', color: 'white', padding: '4px', cursor: idx === 0 ? 'not-allowed' : 'pointer',
                  opacity: idx === 0 ? 0.3 : 1
                }}
              >
                <ArrowLeft size={14} />
              </button>
              <span style={{ fontSize: '10px', color: 'white', fontWeight: 900, background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>#{idx + 1}</span>
              <button 
                type="button"
                disabled={idx === items.length - 1}
                onClick={() => moveItem(idx, 'right')}
                style={{ 
                  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '6px', color: 'white', padding: '4px', cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: idx === items.length - 1 ? 0.3 : 1
                }}
              >
                <ArrowRight size={14} />
              </button>
            </div>

            {item.isNew && (
              <div style={{ position: 'absolute', top: 0, left: 0, background: 'var(--gold)', color: 'black', fontSize: '8px', fontWeight: 900, padding: '2px 6px', borderBottomRightRadius: '8px' }}>NEW</div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {items.length < maxFiles && (
          <button 
            type="button"
            disabled={isCompressing}
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              aspectRatio: '4/3', borderRadius: '14px', border: '2px dashed rgba(255,255,255,0.1)', 
              background: 'rgba(255,255,255,0.02)', color: 'var(--text-muted)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {isCompressing ? <Loader2 size={32} className="animate-spin" style={{ color: 'var(--gold)' }} /> : (
              <>
                <Camera size={24} />
                <span style={{ fontSize: '10px', fontWeight: 800 }}>ADD MEDIA</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input 
        ref={fileInputRef}
        type="file" multiple accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Reorder by clicking the arrows. The first image will be the <strong>Cover Photo</strong>. Max {maxFiles} assets.
      </p>
    </div>
  );
};

