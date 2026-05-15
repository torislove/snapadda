import React from 'react';
import { Globe, BarChart3, Search, MessageSquare, Phone, Mail } from 'lucide-react';

interface MarketingSectionProps {
  seoTitle: string;
  setSeoTitle: (v: string) => void;
  seoDesc: string;
  setSeoDesc: (v: string) => void;
  gaId: string;
  setGaId: (v: string) => void;
  fbPixel: string;
  setFbPixel: (v: string) => void;
  waNumber: string;
  setWaNumber: (v: string) => void;
  waMessage: string;
  setWaMessage: (v: string) => void;
  supportEmail: string;
  setSupportEmail: (v: string) => void;
  supportPhone: string;
  setSupportPhone: (v: string) => void;
  heroTitle: string;
  setHeroTitle: (v: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (v: string) => void;
  handleMarketingSave: (e: React.FormEvent) => void;
  lbl: any;
  inp: any;
  inputWrap: any;
}

export const MarketingSection: React.FC<MarketingSectionProps> = ({
  seoTitle, setSeoTitle, seoDesc, setSeoDesc, gaId, setGaId, fbPixel, setFbPixel,
  waNumber, setWaNumber, waMessage, setWaMessage, supportEmail, setSupportEmail,
  supportPhone, setSupportPhone,
  heroTitle, setHeroTitle, heroSubtitle, setHeroSubtitle,
  handleMarketingSave, lbl, inp, inputWrap
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
    <div style={{ background: 'rgba(232,184,75,0.05)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(232,184,75,0.1)', marginBottom: '1rem' }}>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
        💡 <strong>Help:</strong> This page controls how your website looks to users and search engines (like Google). You can change the main heading of your site, your contact details, and technical tracking codes here.
      </p>
    </div>

    {/* Hero Content Section */}
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(232,184,75,0.1)', borderRadius: '12px', color: 'var(--gold)' }}>
          <Globe size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Website Main Heading</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Change the big text shown at the top of your homepage.</p>
        </div>
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label htmlFor="st-heroTitle" style={lbl}>Main Website Title</label>
          <input id="st-heroTitle" type="text" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} style={{ ...inp, paddingLeft: '12px' }} placeholder="Discover Your Dream Place in Andhra" />
        </div>
        <div>
          <label htmlFor="st-heroSubtitle" style={lbl}>Website Subtitle (Smaller text)</label>
          <textarea id="st-heroSubtitle" value={heroSubtitle} onChange={e => setHeroSubtitle(e.target.value)} style={{ ...inp, paddingLeft: '12px', height: '80px', paddingTop: '12px', resize: 'none' }} placeholder="Browse verified listings across Amaravati, Vijayawada, Guntur & beyond." />
        </div>
      </div>
    </div>
    {/* SEO & Meta */}
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(34,217,224,0.1)', borderRadius: '12px', color: 'var(--cyan)' }}>
          <Globe size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Search & Presence</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configure how Google and Bing see your platform.</p>
        </div>
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={lbl}>Institutional SEO Title</label>
          <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} style={inp} placeholder="e.g. SnapAdda | Andhra's #1 Property Hub" />
        </div>
        <div>
          <label style={lbl}>Meta Narrative (Description)</label>
          <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} style={{ ...inp, height: '80px', resize: 'none', padding: '0.75rem 1rem' }} placeholder="Global description of the platform..." />
        </div>
      </div>
    </div>

    {/* Tracking & Analytics */}
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(245,57,123,0.1)', borderRadius: '12px', color: '#f5397b' }}>
          <BarChart3 size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Data Intelligence</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connect Google Analytics and Facebook Pixels.</p>
        </div>
      </div>
      <div className="responsive-form-grid" style={{ padding: '1.5rem', display: 'grid', gap: '1.5rem' }}>
        <div>
          <label style={lbl}>Google Analytics G-ID</label>
          {inputWrap(<Search size={15}/>, <input type="text" value={gaId} onChange={e => setGaId(e.target.value)} style={inp} placeholder="G-XXXXXXXXXX" />)}
        </div>
        <div>
          <label style={lbl}>Facebook Pixel ID</label>
          {inputWrap(<BarChart3 size={15}/>, <input type="text" value={fbPixel} onChange={e => setFbPixel(e.target.value)} style={inp} placeholder="1234567890" />)}
        </div>
      </div>
    </div>

    {/* Outreach Channels */}
    <div className="glass-card" style={{ overflow: 'hidden', borderRadius: '24px' }}>
      <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ padding: '10px', background: 'rgba(16,217,140,0.1)', borderRadius: '12px', color: 'var(--emerald)' }}>
          <MessageSquare size={20} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>Communication Hub</h3>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>WhatsApp and Support line configurations.</p>
        </div>
      </div>
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="responsive-form-grid" style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label htmlFor="st-waNumber" style={lbl}>WhatsApp Number</label>
            {inputWrap(<Phone size={15}/>, <input id="st-waNumber" type="text" value={waNumber} onChange={e => setWaNumber(e.target.value)} style={inp} placeholder="919876543210" />)}
          </div>
          <div>
            <label htmlFor="st-supportEmail" style={lbl}>Institutional Email</label>
            {inputWrap(<Mail size={15}/>, <input id="st-supportEmail" type="email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} style={inp} placeholder="info@snapadda.com" />)}
          </div>
          <div>
            <label htmlFor="st-supportPhone" style={lbl}>Support Phone Number</label>
            {inputWrap(<Phone size={15}/>, <input id="st-supportPhone" type="text" value={supportPhone} onChange={e => setSupportPhone(e.target.value)} style={inp} placeholder="+91 93467 93364" />)}
          </div>
        </div>
        <div>
          <label htmlFor="st-waMessage" style={lbl}>Default Outreach Message</label>
          <textarea id="st-waMessage" value={waMessage} onChange={e => setWaMessage(e.target.value)} style={{ ...inp, height: '80px', resize: 'none', padding: '0.75rem 1rem' }} />
        </div>
      </div>
    </div>

    <button onClick={handleMarketingSave} className="btn-emerald btn-3d-liquid" style={{ alignSelf: 'flex-start', padding: '0.8rem 2.5rem', borderRadius: '14px', fontSize: '1rem', fontWeight: 900, background: 'var(--emerald)', color: 'white', border: 'none' }}>
      SYNC ALL CHANNELS
    </button>
  </div>
);
