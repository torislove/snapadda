import React, { useRef } from 'react';
import { 
  ShieldCheck, MapPin, Expand, Building2, User, 
  Star, ArrowRight, Zap
} from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

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
  address?: string;
  pricePerAcre?: number;
}

export const LivePreviewCard: React.FC<LivePreviewCardProps> = ({
  image,
  title = 'PREMIUM ROYAL ESTATE',
  price = '8500000',
  location = 'AMARAVATI SECTOR, AP',
  areaSize = 1250,
  type = 'Apartment',
  facing = 'East',
  approval = 'AP CRDA',
  measurementUnit = 'Sq.Ft',
  isVerified = true,
  listerType = 'Certified Builder',
  address = '',
  pricePerAcre = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const displayImage = image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  
  const formatLivePrice = (p: number | string) => {
    const n = Number(p);
    if (!n) return '₹ Price TBD';
    if (n >= 10000000) return `₹ ${(n / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
    if (n >= 100000) return `₹ ${(n / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Lakhs`;
    return `₹ ${n.toLocaleString('en-IN')}`;
  };

  const displayPrice = formatLivePrice(price);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
    >
      <div 
        style={{ 
          background: 'rgba(14,14,26,0.8)', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          width: '100%',
          maxWidth: '360px',
          margin: '0 auto',
          backdropFilter: 'blur(20px)',
          position: 'relative'
        }}
      >
        {/* Media Container */}
        <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden' }}>
          <img 
            src={displayImage} 
            alt={title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', transition: 'transform 0.5s ease' }} 
          />
          
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(3,3,8,0.9) 100%)' }} />

          {/* Verification Badge */}
          {isVerified && (
            <div style={{ 
              position: 'absolute', top: '16px', left: '16px', 
              background: 'rgba(16,217,140,0.95)', color: 'black', 
              padding: '6px 14px', borderRadius: '10px', 
              display: 'flex', alignItems: 'center', gap: '6px', 
              fontSize: '0.7rem', fontWeight: 800,
              boxShadow: '0 4px 15px rgba(16,217,140,0.3)',
              transform: 'translateZ(30px)'
            }}>
              <ShieldCheck size={14} strokeWidth={3} /> VERIFIED
            </div>
          )}

          {/* Price Tag */}
          <div style={{ 
            position: 'absolute', bottom: '20px', left: '20px', 
            color: 'white', fontWeight: 800, fontSize: '1.4rem',
            fontFamily: 'var(--font-heading)',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            transform: 'translateZ(40px)'
          }}>
            {displayPrice}
            {pricePerAcre > 0 && type === 'Agricultural Land' && (
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px', fontWeight: 600 }}>
                ₹ {pricePerAcre.toLocaleString('en-IN')} / Acre
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 10, alignItems: 'flex-end', transform: 'translateZ(25px)' }}>
            {approval && approval !== 'N/A' && (
              <div style={{ 
                background: 'rgba(245,200,66,0.95)', color: 'black', 
                padding: '5px 12px', borderRadius: '8px', 
                display: 'flex', alignItems: 'center', gap: '5px', 
                fontSize: '0.65rem', fontWeight: 900,
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
              }}>
                <Zap size={12} fill="black" /> {approval}
              </div>
            )}
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.7)', color: 'var(--gold)', 
              padding: '5px 12px', borderRadius: '8px', 
              display: 'flex', alignItems: 'center', gap: '5px', 
              fontSize: '0.65rem', fontWeight: 800, border: '1px solid var(--gold)'
            }}>
              <Star size={12} fill="var(--gold)" /> FEATURED
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div style={{ padding: '24px', transform: 'translateZ(20px)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.12em', color: 'var(--gold)', marginBottom: '8px' }}>
            {type.toUpperCase()} • {facing.toUpperCase()} FACING
          </div>
          
          <h3 style={{ 
            margin: '0 0 10px 0', fontSize: '1.25rem', fontWeight: 700, color: 'white',
            fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em',
            lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {title}
          </h3>
          
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} style={{ color: 'var(--violet)' }} /> {location}
          </p>

          {address && (
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', margin: '-12px 0 16px 21px', lineHeight: 1.4 }}>
              {address}
            </p>
          )}
          
          {/* Amenities Row */}
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
            padding: '16px 0', borderTop: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>SPACE</span>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Expand size={14} style={{ color: 'var(--violet)' }} /> {areaSize} {measurementUnit}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>LISTER</span>
              <div style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {listerType === 'Verified Builder' ? <Building2 size={13} /> : <User size={13} />}
                {listerType}
              </div>
            </div>
          </div>

          <div style={{
            width: '100%', padding: '12px', borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontWeight: 700, fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'default'
          }}>
            VIEW PERFORMANCE DATA <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
