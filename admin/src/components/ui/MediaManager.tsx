import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { X, Camera, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import imageCompression from 'browser-image-compression';

interface MediaItem {
  id: string;
  url: string;
  file?: File;
  isNew: boolean;
  objectFit?: 'cover' | 'contain';
}

interface MediaManagerProps {
  existingUrls: string[];
  existingSettings?: { url: string; objectFit: 'cover' | 'contain' }[];
  onImagesChange: (urls: string[], newFiles: File[], settings: { url: string; objectFit: 'cover' | 'contain' }[]) => void;
  maxFiles?: number;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ 
  existingUrls = [], 
  existingSettings = [],
  onImagesChange, 
  maxFiles = 10 
}) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize items from existingUrls and existingSettings
  useEffect(() => {
    const initialItems: MediaItem[] = existingUrls.map(url => {
      const setting = existingSettings.find(s => s.url === url);
      return {
        id: url,
        url,
        isNew: false,
        objectFit: setting?.objectFit || 'cover'
      };
    });
    setItems(initialItems);
  }, [existingUrls, existingSettings]);

  const syncParent = (currentItems: MediaItem[]) => {
    const urls = currentItems.map(it => it.url);
    const newFiles = currentItems.filter(it => it.isNew && it.file).map(it => it.file!);
    const settings = currentItems.map(it => ({
      url: it.url,
      objectFit: it.objectFit || 'cover'
    }));
    onImagesChange(urls, newFiles, settings);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsCompressing(true);
    const options = { maxSizeMB: 0.03, maxWidthOrHeight: 1280, useWebWorker: true };

    try {
      const newItems: MediaItem[] = [];
      for (const file of files) {
        if (items.length + newItems.length >= maxFiles) {
          toast.error(`Max ${maxFiles} assets allowed.`);
          break;
        }
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], file.name, { type: file.type });
        const previewUrl = URL.createObjectURL(compressedFile);
        
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          url: previewUrl,
          file: compressedFile,
          isNew: true,
          objectFit: 'cover'
        });
      }

      const updated = [...items, ...newItems];
      setItems(updated);
      syncParent(updated);
    } catch (err) {
      console.error('Compression error:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeItem = (id: string) => {
    const updated = items.filter(it => it.id !== id);
    setItems(updated);
    syncParent(updated);
  };

  const moveItem = (index: number, direction: 'left' | 'right') => {
    const updated = [...items];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= updated.length) return;
    
    [updated[index], updated[targetIdx]] = [updated[targetIdx], updated[index]];
    setItems(updated);
    syncParent(updated);
  };

  const toggleFit = (id: string) => {
    const updated = items.map(it => {
      if (it.id === id) {
        return { 
          ...it, 
          objectFit: (it.objectFit === 'contain' ? 'cover' : 'contain') as 'cover' | 'contain'
        };
      }
      return it;
    });
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
              background: '#05050a'
            }}
          >
            {item.file?.type.startsWith('video/') || item.url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={item.url} alt="media" style={{ width: '100%', height: '100%', objectFit: item.objectFit || 'cover' }} />
            )}
            
            {/* Delete Button */}
            <button 
              type="button" 
              onClick={() => removeItem(item.id)}
              style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(245,57,123,0.95)', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={12} />
            </button>

            {/* Fit Toggle Button */}
            <button 
              type="button" 
              onClick={() => toggleFit(item.id)}
              title={item.objectFit === 'cover' ? 'Switch to Fit (Show entire image)' : 'Switch to Fill (Cover area)'}
              style={{ 
                position: 'absolute', top: '6px', left: '6px', 
                background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', 
                borderRadius: '6px', padding: '4px', cursor: 'pointer', zIndex: 10,
                fontSize: '0.55rem', fontWeight: 900, textTransform: 'uppercase'
              }}
            >
              {item.objectFit === 'cover' ? 'FILL' : 'FIT'}
            </button>

            {/* Reorder Controls */}
            <div style={{ 
              position: 'absolute', bottom: 0, left: 0, right: 0, 
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
              padding: '20px 4px 4px', display: 'flex', justifyContent: 'center', gap: '8px',
            }}>
              <button 
                type="button"
                disabled={idx === 0}
                onClick={() => moveItem(idx, 'left')}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '4px', color: 'white', padding: '2px', cursor: idx === 0 ? 'not-allowed' : 'pointer',
                  opacity: idx === 0 ? 0.3 : 1
                }}
              >
                <ArrowLeft size={12} />
              </button>
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)', fontWeight: 800 }}>#{idx + 1}</span>
              <button 
                type="button"
                disabled={idx === items.length - 1}
                onClick={() => moveItem(idx, 'right')}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '4px', color: 'white', padding: '2px', cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: idx === items.length - 1 ? 0.3 : 1
                }}
              >
                <ArrowRight size={12} />
              </button>
            </div>

            {item.isNew && (
              <div style={{ position: 'absolute', bottom: '24px', right: 0, background: 'var(--gold)', color: 'black', fontSize: '7px', fontWeight: 950, padding: '1px 4px', borderTopLeftRadius: '4px' }}>NEW</div>
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
