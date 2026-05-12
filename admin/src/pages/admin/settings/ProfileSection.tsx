import React from 'react';
import { User, Camera } from 'lucide-react';

interface ProfileSectionProps {
  profileName: string;
  setProfileName: (v: string) => void;
  profileStatus: string;
  handleProfileSave: (e: React.FormEvent) => void;
  lbl: any;
  inp: any;
  inputWrap: any;
  StatusAlert: any;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profileName, setProfileName, profileStatus, handleProfileSave, lbl, inp, inputWrap, StatusAlert
}) => (
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
          <div style={{ width: '100px', height: '100px', borderRadius: '30px', background: 'var(--bg-glass)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <Camera size={32} />
          </div>
          <button type="button" style={{ position: 'absolute', bottom: '-5px', right: '-5px', width: '32px', height: '32px', borderRadius: '10px', background: 'var(--violet)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(155,89,245,0.4)' }}>
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

      <StatusAlert status={profileStatus} successMsg="Profile identity updated." errorMsg="Sync failed." />
      
      <button type="submit" disabled={profileStatus === 'saving'} className="btn-violet btn-3d-liquid" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 900 }}>
        {profileStatus === 'saving' ? 'SYNCING...' : 'UPDATE IDENTITY'}
      </button>
    </form>
  </div>
);

const Plus = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
