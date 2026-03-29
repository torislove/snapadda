import { ShieldCheck, Compass, MapPin, Expand, Flame, Building2, User } from 'lucide-react';

interface LivePreviewCardProps {
  image?: string;
  title?: string;
  price?: string;
  location?: string;
  beds?: number;
  baths?: number;
  areaSize?: number;
  sqft?: number;
  type?: string;
  condition?: string;
  facing?: string;
  approval?: string;
  measurementUnit?: string;
  isVerified?: boolean;
  listerType?: string;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({
  image,
  title = 'Your Property Title',
  price = '8500000',
  location = 'Amaravati or Default City',
  beds = 0,
  baths = 0,
  areaSize = 1000,
  sqft,
  type = 'Apartment',
  condition = '1st Hand',
  facing = 'Any',
  approval = 'N/A',
  measurementUnit = 'Sq.Ft',
  isVerified = false,
  listerType = 'Individual Owner',
}) => {
  const displayImage = image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  const displayPrice = price && price !== '' ? `₹ ${price}` : '₹ TBD';

  return (
    <div style={{ 
      background: 'var(--bg-secondary)', 
      borderRadius: 'var(--radius-lg)', 
      overflow: 'hidden', 
      border: '1px solid var(--border-subtle)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      width: '100%',
      maxWidth: '350px',
      margin: '0 auto'
    }}>
      <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
        <img src={displayImage} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '6px 12px', borderRadius: '4px', fontWeight: 600, fontSize: '1.1rem' }}>
          {displayPrice}
        </div>
        
        <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10, alignItems: 'flex-end' }}>
          {approval && approval !== 'N/A' && approval !== 'Pending' && (
            <div style={{ background: 'rgba(212, 175, 55, 0.95)', color: 'black', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              <ShieldCheck size={12} /> {approval}
            </div>
          )}
          {facing && facing !== 'Any' && (
            <div style={{ background: 'rgba(0, 0, 0, 0.75)', color: '#d4af37', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid #d4af37' }}>
              <Compass size={12} /> {facing}
            </div>
          )}
        </div>

        <div style={{ position: 'absolute', bottom: '16px', right: '16px', zIndex: 10 }}>
            <div style={{ background: 'rgba(231, 76, 60, 0.9)', color: 'white', padding: '4px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
              <Flame size={12} /> Hot Property
            </div>
        </div>

        {isVerified && (
          <div style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(46, 204, 113, 0.9)', color: 'white', padding: '4px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Verified
          </div>
        )}
      </div>
      
      <div style={{ padding: '20px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title || 'Property Title'}</h3>
        <p style={{ color: 'gray', fontSize: '0.875rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} /> {location || 'No Location specified'}
        </p>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px', fontSize: '0.75rem', color: listerType === 'Verified Builder' ? '#d4af37' : 'var(--text-secondary)' }}>
          {listerType === 'Verified Builder' ? <Building2 size={12} /> : <User size={12} />}
          {listerType}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {type && <span style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{type}</span>}
          {condition && condition !== 'N/A' && <span style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{condition}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
          {type !== 'Agriculture' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{beds || 0}</span>
                <span style={{ fontSize: '0.7rem', color: 'gray' }}>Beds</span>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{baths || 0}</span>
                <span style={{ fontSize: '0.7rem', color: 'gray' }}>Baths</span>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }}></div>
            </>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Expand size={12} /> {areaSize || sqft || 0}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'gray' }}>{measurementUnit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
