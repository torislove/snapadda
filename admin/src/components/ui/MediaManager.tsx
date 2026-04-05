import React, { useState, useRef } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

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
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUrls, setCurrentUrls] = useState<string[]>(existingUrls);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // File Size Validation
    const OVERSIZE_LIMIT = 30 * 1024 * 1024; // 30MB
    const oversized = files.filter(f => f.size > OVERSIZE_LIMIT);
    if (oversized.length > 0) {
      alert(`The following files are too large (Max 30MB): ${oversized.map(f => f.name).join(', ')}`);
      return;
    }

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };

      const compressedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.type.startsWith('video/')) return file;
          try {
            return await imageCompression(file, options);
          } catch (err) {
            console.error('Compression failed for', file.name, err);
            return file;
          }
        })
      );

      const allNewFiles = [...newFiles, ...compressedFiles].slice(0, maxFiles - currentUrls.length);
      setNewFiles(allNewFiles);
      
      const newPreviews = allNewFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
      
      onImagesChange(currentUrls, allNewFiles);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeExisting = (url: string) => {
    const updated = currentUrls.filter(u => u !== url);
    setCurrentUrls(updated);
    onImagesChange(updated, newFiles);
  };

  const removeNew = (index: number) => {
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    
    // Revoke blob URL to prevent memory leaks
    URL.revokeObjectURL(previews[index]);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
    
    onImagesChange(currentUrls, updatedFiles);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
        {/* Existing Images */}
        {currentUrls.map((url, idx) => (
          <div key={`existing-${idx}`} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <img src={url} alt="existing" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button 
              type="button" 
              onClick={() => removeExisting(url)}
              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(245,57,123,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
            >
              <X size={14} />
            </button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '2px', textAlign: 'center' }}>CLOUDINARY</div>
          </div>
        ))}

        {/* New Previews */}
        {previews.map((url, idx) => (
          <div key={`new-${idx}`} style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--gold)', boxShadow: '0 0 10px rgba(245,200,66,0.2)' }}>
            <img src={url} alt="new" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button 
              type="button" 
              onClick={() => removeNew(idx)}
              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(245,57,123,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={14} />
            </button>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(245,200,66,0.8)', color: '#000', fontSize: '10px', fontWeight: 800, padding: '2px', textAlign: 'center' }}>NEW SELECT</div>
          </div>
        ))}

        {/* Upload Button */}
        {currentUrls.length + newFiles.length < maxFiles && (
          <button 
            type="button"
            disabled={isCompressing}
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              aspectRatio: '4/3', 
              borderRadius: '12px', 
              border: '2px dashed rgba(255,255,255,0.1)', 
              background: 'rgba(255,255,255,0.02)', 
              color: 'var(--text-muted)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'rgba(245,200,66,0.03)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            {isCompressing ? (
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Loader2 size={32} style={{ animation: 'spin 1.5s linear infinite', color: 'var(--gold)' }} />
                <div style={{ fontSize: '9px', fontWeight: 900, marginTop: '8px', color: 'var(--gold)', letterSpacing: '0.1em' }}>COMPRESSING...</div>
              </div>
            ) : (
              <>
                <Camera size={24} />
                <span style={{ fontSize: '10px', fontWeight: 700 }}>ADD MEDIA</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input 
        ref={fileInputRef}
        type="file" 
        multiple 
        accept="image/*,video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        Supports JPG, PNG, WEBP, HEIC, MP4. Max {maxFiles} assets. Images auto-optimized by SnapAdda Engine.
      </p>
    </div>
  );
};
