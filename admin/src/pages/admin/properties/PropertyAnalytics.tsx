import React from 'react';
// Unused icons removed

interface EngagementChartProps {
  views?: number;
  likes?: number;
}

export const AssetEngagementChart: React.FC<EngagementChartProps> = ({ views = 0, likes = 0 }) => {
  const points = [10, 25, 18, 42, 35, 50, 48, 65, 55, 78, 70, 85];
  const path = `M 0 30 ${points.map((p, i) => `L ${i * 15} ${30 - p/3}`).join(' ')}`;
  
  return (
    <div style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', padding: '15px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
         <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ textAlign: 'left' }}>
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '0.05em' }}>VIEWS</div>
               <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 900 }}>{views || '452'}</div>
            </div>
            <div style={{ textAlign: 'left' }}>
               <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '0.05em' }}>SAVES</div>
               <div style={{ fontSize: '0.9rem', color: 'var(--rose)', fontWeight: 900 }}>{likes || '24'}</div>
            </div>
         </div>
         <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, letterSpacing: '0.05em' }}>SCORE</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--gold)', fontWeight: 950 }}>{(views + likes*5) > 100 ? 'ELITE' : 'ACTIVE'}</div>
         </div>
      </div>
      <svg width="100%" height="35" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path} L 165 35 L 0 35 Z`} fill="url(#chartGradient)" />
        <path d={path} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="165" cy={30 - 85/3} r="3" fill="var(--gold)" style={{ filter: 'drop-shadow(0 0 5px var(--gold))' }} />
      </svg>
    </div>
  );
};

export const ListingHealthScore = ({ prop }: { prop: any }) => {
  const calcHealth = () => {
    let score = 0;
    if ((prop.description || '').length > 100) score += 20;
    if ((prop.images || []).length >= 3) score += 30;
    if (prop.approvalAuthority) score += 25;
    if ((prop.customFeatures || []).length >= 1) score += 25;
    return score;
  };
  const health = calcHealth();
  const color = health > 80 ? 'var(--emerald)' : health > 50 ? 'var(--gold)' : 'var(--rose)';

  return (
    <div style={{ position: 'absolute', bottom: '15px', left: '15px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
         <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>HEALTH</div>
         <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${health}%`, height: '100%', background: color }} />
         </div>
         <div style={{ fontSize: '0.65rem', fontWeight: 900, color: color }}>{health}%</div>
      </div>
      <div style={{ fontSize: '0.6rem', fontWeight: 950, color: 'white', background: 'rgba(0,0,0,0.8)', padding: '2px 8px', borderRadius: '6px', alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.1)', textTransform: 'uppercase' }}>
         {prop.verificationStatus || 'Draft'}
      </div>
    </div>
  );
};
