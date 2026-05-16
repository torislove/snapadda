import React, { useRef } from 'react';
import { User, Camera, Upload } from 'lucide-react';

interface ProfileSectionProps {
  profileName: string;
  setProfileName: (v: string) => void;
  profileAvatar: string;
  profileStatus: string;
  handleProfileSave: (e: React.FormEvent) => void;
  onImageUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  lbl: any;
  inp: any;
  inputWrap: any;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profileName, setProfileName, profileAvatar, profileStatus, 
  handleProfileSave, onImageUpload, isUploading, lbl, inp, inputWrap
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onImageUpload(file);
    }
  };

  return (
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(155,89,245,0.1)', borderRadius: '12px', color: 'var(--violet)' }}>
          <User size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Identity Profile</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>How you appear to clients and team.</p>
        </div>
      </div>
      
      <form onSubmit={handleProfileSave} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                width: '100px', height: '100px', borderRadius: '30px', 
                background: profileAvatar ? `url(${profileAvatar}) center/cover` : 'var(--bg-glass)', 
                border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer',
                overflow: 'hidden', position: 'relative', transition: 'all 0.3s'
              }}
            >
              {!profileAvatar && !isUploading && <Camera size={32} />}
              {isUploading && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Upload size={24} className="pulse" />
                </div>
              )}
            </div>
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '32px', height: '32px', borderRadius: '10px', background: 'var(--violet)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(155,89,245,0.4)', cursor: 'pointer' }}
            >
              <Plus size={16} />
            </button>
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label htmlFor="st-profileName" style={lbl}>Full Identity Name</label>
            {inputWrap(<User size={15} />, 
              <input id="st-profileName" type="text" value={profileName} onChange={e => setProfileName(e.target.value)} style={inp} placeholder="Executive Name" required />
            )}
          </div>
        </div>

        <button type="submit" disabled={profileStatus === 'saving' || isUploading} className="btn-violet btn-3d-liquid" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 900 }}>
          {profileStatus === 'saving' ? 'SYNCING...' : 'UPDATE IDENTITY'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSection;

const Plus = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
