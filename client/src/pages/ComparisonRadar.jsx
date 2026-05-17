import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, XCircle, SlidersHorizontal, 
  MapPin, IndianRupee, Compass, Square, Building, ShieldCheck, 
  Trash2, ArrowRight
} from 'lucide-react';
import { fetchProperties } from '../services/api';
import { formatSnapAddaPrice, getPropertyTypeKey } from '../utils/priceUtils';
import { useTranslation } from 'react-i18next';

const ComparisonRadar = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',') || [];
    if (ids.length === 0) {
      navigate('/');
      return;
    }

    setLoading(true);
    fetchProperties({ ids: ids.join(',') })
      .then(res => {
        setProperties(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams, navigate]);

  const removeProperty = (id) => {
    const newProperties = properties.filter(p => p._id !== id);
    if (newProperties.length === 0) {
      navigate('/');
    } else {
      const newIds = newProperties.map(p => p._id).join(',');
      navigate(`/compare?ids=${newIds}`, { replace: true });
      setProperties(newProperties);
    }
  };

  const attributes = [
    { label: 'Price', key: 'price', format: (v) => formatSnapAddaPrice(v), icon: <IndianRupee size={16} /> },
    { label: 'Type', key: 'type', format: (v) => t(`types.${getPropertyTypeKey(v)}`, v), icon: <Building size={16} /> },
    { label: 'Location', key: 'location', format: (v) => v, icon: <MapPin size={16} /> },
    { label: 'Size', key: 'areaSize', format: (v, p) => `${v} ${p.measurementUnit || 'Sq.Ft'}`, icon: <Square size={16} /> },
    { label: 'Facing', key: 'facing', format: (v) => t(`card.facing_${(v || '').toLowerCase()}`, v), icon: <Compass size={16} /> },
    { label: 'Verified', key: 'isVerified', format: (v) => v ? <CheckCircle2 color="var(--emerald)" size={16}/> : <XCircle color="var(--rose)" size={16}/>, icon: <ShieldCheck size={16} /> },
    { label: 'Vastu', key: 'vastuCompliant', format: (v) => v ? 'Yes' : 'N/A', icon: <Compass size={16} /> },
    { label: 'Status', key: 'status', format: (v) => v || 'Active', icon: <SlidersHorizontal size={16} /> },
  ];

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
      <div className="loader"></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', paddingTop: 'var(--nav-h)' }}>
      <div className="container" style={{ padding: '2rem 1rem 5rem' }}>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700 }}>
              <ArrowLeft size={18} /> Back to Search
            </button>
            <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 900, margin: 0 }}>Comparison Radar</h1>
            <p style={{ color: 'var(--txt-muted)', marginTop: '0.5rem' }}>Analyzing side-by-side metrics for your shortlisted assets.</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '12px 24px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
          >
            Clear All
          </button>
        </header>

        <div style={{ overflowX: 'auto', paddingBottom: '2rem' }} className="hide-scrollbar">
          <div style={{ display: 'grid', gridTemplateColumns: `200px repeat(${properties.length}, 300px)`, gap: '20px', minWidth: 'fit-content' }}>
            {/* Labels Column */}
            <div style={{ paddingTop: '200px' }}>
              {attributes.map((attr, i) => (
                <div key={i} style={{ height: '80px', display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {attr.icon} {attr.label}
                </div>
              ))}
            </div>

            {/* Property Columns */}
            {properties.map((p) => (
              <motion.div 
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={p.images?.[0] || p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => removeProperty(p._id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <XCircle size={18} />
                  </button>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                    <h3 style={{ color: 'white', margin: 0, fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</h3>
                  </div>
                </div>

                <div style={{ padding: '0 20px' }}>
                  {attributes.map((attr, i) => (
                    <div key={i} style={{ height: '80px', display: 'flex', alignItems: 'center', color: 'white', fontWeight: 800, fontSize: '0.95rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      {attr.format(p[attr.key], p)}
                    </div>
                  ))}
                </div>

                <div style={{ padding: '20px' }}>
                  <button 
                    onClick={() => navigate(`/property/${p._id}`)}
                    className="btn-3d-glass"
                    style={{ width: '100%', padding: '12px', background: 'var(--gold)', color: 'black', borderRadius: '12px', fontWeight: 900, fontSize: '0.8rem', border: 'none', cursor: 'pointer' }}
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ComparisonRadar;
