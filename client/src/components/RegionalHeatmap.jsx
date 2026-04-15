import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DISTRICTS = [
  { name: 'Amaravati', growth: '+18.4%', liquidity: 'High', color: '#10d98c' },
  { name: 'Vijayawada', growth: '+12.1%', liquidity: 'Elite', color: '#e8b84b' },
  { name: 'Guntur', growth: '+9.8%', liquidity: 'Steady', color: '#22d9e0' },
  { name: 'Vizag', growth: '+15.2%', liquidity: 'Rising', color: '#9b59f5' },
];

export default function LiquidityHeatmap() {
  const { t } = useTranslation();

  return (
    <>
      <div className="glass-heavy" style={{ padding: '2.5rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.03)', marginTop: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Zap size={14} className="pulse-primary" /> {t('geo.hotspotsTitle', 'Regional Hotspots')}
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)' }}>
            {t('geo.hotspotsHeadline', 'Regional Growth Hotspots')}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--gold)' }}>84.2</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--txt-muted)', fontWeight: 800 }}>AP LIQUIDITY ALPHA</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10d98c' }}>+2.4%</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--txt-muted)', fontWeight: 800 }}>MOM VELOCITY</div>
            </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {DISTRICTS.map((d, i) => (
          <motion.div 
            key={d.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            className="heatmap-node"
            style={{ 
              padding: '1.5rem', 
              borderRadius: '20px', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: d.color }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'white' }}>{t(`geo.${d.name.toLowerCase()}`, d.name)}</div>
              <TrendingUp size={16} style={{ color: d.color }} />
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', marginBottom: '0.2rem' }}>{d.growth}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--txt-muted)', fontWeight: 700 }}>{t('radar.liquidity', 'Liquidity')}:</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 900, color: d.color, textTransform: 'uppercase' }}>{d.liquidity}</span>
            </div>
            
            <div style={{ marginTop: '1rem', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '70%' }}
                    style={{ height: '100%', background: d.color, borderRadius: '10px' }}
                />
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    <style>{`
        .heatmap-node { transition: all 0.3s var(--ease-butter); cursor: pointer; }
        .heatmap-node:hover { background: rgba(255,255,255,0.04); transform: translateY(-5px); border-color: rgba(255,255,255,0.1); }
      `}</style>
    </>
  );
}
