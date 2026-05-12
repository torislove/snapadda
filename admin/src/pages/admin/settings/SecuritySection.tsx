import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface SecuritySectionProps {
  currentPw: string;
  setCurrentPw: (v: string) => void;
  newPw: string;
  setNewPw: (v: string) => void;
  confirmPw: string;
  setConfirmPw: (v: string) => void;
  showCurrent: boolean;
  setShowCurrent: (v: boolean) => void;
  showNew: boolean;
  setShowNew: (v: boolean) => void;
  pwStatus: string;
  pwError: string;
  handlePasswordChange: (e: React.FormEvent) => void;
  lbl: any;
  inp: any;
  inputWrap: any;
  StatusAlert: any;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({
  currentPw, setCurrentPw, newPw, setNewPw, confirmPw, setConfirmPw,
  showCurrent, setShowCurrent, showNew, setShowNew,
  pwStatus, pwError, handlePasswordChange, lbl, inp, inputWrap, StatusAlert
}) => (
  <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ padding: '10px', background: 'rgba(245,57,123,0.1)', borderRadius: '12px', color: '#f5397b' }}>
        <Lock size={20} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Authentication Shield</h3>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Secure your administrative access credentials.</p>
      </div>
    </div>

    <form onSubmit={handlePasswordChange} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <label style={lbl}>Current Protocol Password</label>
        {inputWrap(<Lock size={15}/>, 
          <div style={{ position: 'relative' }}>
            <input type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)} style={inp} required />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div>
          <label style={lbl}>New Secure Key</label>
          <div style={{ position: 'relative' }}>
            <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)} style={inp} required />
            <button type="button" onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label style={lbl}>Confirm Key</label>
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={inp} required />
        </div>
      </div>

      {pwError && <div style={{ color: '#f5397b', fontSize: '0.75rem', fontWeight: 800 }}>⚠️ {pwError}</div>}
      <StatusAlert status={pwStatus} successMsg="Security protocols updated." errorMsg="Authentication error." />

      <button type="submit" disabled={pwStatus === 'saving'} className="btn-rose btn-3d-liquid" style={{ alignSelf: 'flex-start', padding: '0.8rem 2rem', borderRadius: '14px', fontSize: '0.9rem', fontWeight: 900, background: '#f5397b', color: 'white', border: 'none' }}>
        {pwStatus === 'saving' ? 'ENCRYPTING...' : 'UPDATE SHIELD'}
      </button>
    </form>
  </div>
);
