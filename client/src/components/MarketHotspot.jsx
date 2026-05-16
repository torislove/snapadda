import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Navigation, ExternalLink, TrendingUp, Search, 
  Maximize2, Layers, Filter, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatSnapAddaPrice } from '../utils/priceUtils';
import ErrorBoundary from './ErrorBoundary';

// ── Elite Icons & Styling ───────────────────────────────────────────────────

// Fix default marker icons in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const GoldIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="
    width:32px;height:32px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#e8b84b,#d4972a);
    border:2px solid #fff;
    box-shadow:0 4px 15px rgba(232,184,75,0.6);
    transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
  "><div style="transform:rotate(45deg);width:8px;height:8px;background:white;border-radius:50%"></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const InstitutionalIcon = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div style="
    width:38px;height:38px;border-radius:50%;
    background:#080810;
    border:2px solid #e8b84b;
    box-shadow:0 0 20px rgba(232,184,75,0.8);
    display:flex;align-items:center;justify-content:center;
    position:relative;
  ">
    <div style="width:10px;height:10px;background:#e8b84b;border-radius:50%;box-shadow:0 0 10px #e8b84b;"></div>
    <div style="position:absolute;top:-2px;right:-2px;width:14px;height:14px;background:#10d98c;border-radius:50%;border:2px solid #080810;display:flex;align-items:center;justify-content:center;">
       <svg viewBox="0 0 24 24" width="8" height="8" stroke="white" stroke-width="4" fill="none"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
  </div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19],
});

// ── Coordinate Resolver (Strict User Requirement: Google Maps Link Only) ───────


function resolveCoords(p) {
  if (!p) return null;

  // 1. Direct coordinates field on property (Highest Priority - Set by backend during sync/save)
  if (p.coordinates?.lat && p.coordinates?.lng) {
    return [parseFloat(p.coordinates.lat), parseFloat(p.coordinates.lng)];
  }

  // 2. Parse Google Maps Link (Strict User Requirement - Extract exact pin location)
  const url = p.googleMapsLink;
  if (url && typeof url === 'string') {
    try {
      // Pattern 1: @lat,lng (Standard long URLs)
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) return [parseFloat(atMatch[1]), parseFloat(atMatch[2])];
      
      // Pattern 2: q=lat,lng (Search URLs)
      const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];

      // Pattern 3: !3d lat !4d lng (Common in desktop shared URLs)
      const d3dMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (d3dMatch) return [parseFloat(d3dMatch[1]), parseFloat(d3dMatch[2])];

      // Pattern 4: /place/name/lat,lng
      const placeMatch = url.match(/\/place\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (placeMatch) return [parseFloat(placeMatch[1]), parseFloat(placeMatch[2])];

      // Pattern 5: ll=lat,lng
      const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) return [parseFloat(llMatch[1]), parseFloat(llMatch[2])];

      // Pattern 6: /dir/lat,lng
      const dirMatch = url.match(/\/dir\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (dirMatch) return [parseFloat(dirMatch[1]), parseFloat(dirMatch[2])];

      // Pattern 7: Brute force - find any two decimals separated by a comma (fallback)
      const bruteMatch = url.match(/(-?\d+\.\d{5,}),\s*(-?\d+\.\d{5,})/);
      if (bruteMatch) return [parseFloat(bruteMatch[1]), parseFloat(bruteMatch[2])];

    } catch (e) {
      console.warn('Map link parsing error:', e);
    }
  }

  return null;
}



// ── Sub-Components ──────────────────────────────────────────────────────────

const MapEvents = ({ onResize }) => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

const MapController = ({ center, zoom, bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    else if (center) map.setView(center, zoom || 13, { animate: true });
  }, [center, zoom, bounds, map]);
  return null;
};

// ── Main Component ──────────────────────────────────────────────────────────

export default function MarketHotspot({ properties = [] }) {
  const [selectedProp, setSelectedProp] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [search, setSearch] = useState('');

  // Process properties to markers
  const markers = useMemo(() => {
    const filterRegex = new RegExp(filterType, 'i');
    return properties
      .map(p => ({ ...p, coords: resolveCoords(p) }))
      .filter(p => p.coords && (filterType === 'All' || filterRegex.test(p.type)))
      .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase()));
  }, [properties, filterType, search]);


  useEffect(() => {
    if (markers.length > 0 && !selectedProp) {
      const b = L.latLngBounds(markers.map(m => m.coords));
      setMapBounds(b);
    }
  }, [markers, selectedProp]);

  const handleSelect = (p) => {
    setSelectedProp(p);
    setMapBounds(null);
  };

  return (
    <div className="hotspot-container" style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: '#04060e', borderRadius: '32px', overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
    }}>
      
      {/* Top Header / Filters */}
      <div style={{
        padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(232,184,75,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={20} color="var(--gold)" />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem' }}>Spatial Discovery</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{markers.length} High-Demand Assets Found</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { label: 'All', value: 'All' },
            { label: 'Plots', value: 'Plot' },
            { label: 'Houses', value: 'House|Villa' },
            { label: 'Flats', value: 'Apartment' },
            { label: 'Agri', value: 'Agri|Farm' }
          ].map(t => (
            <button
              key={t.label}
              onClick={() => { setFilterType(t.value); setSelectedProp(null); }}
              style={{
                padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                background: filterType === t.value ? 'var(--gold)' : 'rgba(255,255,255,0.03)',
                color: filterType === t.value ? '#000' : 'rgba(255,255,255,0.6)',
                fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

      </div>

      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }} className="hotspot-main-layout">
        
        {/* Map Side */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <MapContainer
            center={[16.5062, 80.6480]}
            zoom={8}
            scrollWheelZoom={false}
            attributionControl={false}
            style={{ height: '100%', width: '100%', background: '#05050a' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="elite-osm-layer"
            />
            <MapEvents />
            <MapController 
              center={selectedProp?.coords} 
              bounds={mapBounds}
            />

            {markers.map(p => (
              <Marker
                key={p._id}
                position={p.coords}
                icon={p.isVerified ? InstitutionalIcon : (p.isFeatured ? GoldIcon : DefaultIcon)}
                eventHandlers={{ click: () => setSelectedProp(p) }}
              >
                <Popup className="elite-map-popup" minWidth={280}>
                   <div style={{ overflow: 'hidden', borderRadius: '16px' }}>
                      <div style={{ position: 'relative', height: '140px' }}>
                         <img src={p.images?.[0] || p.image || '/placeholder.jpg'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         <div style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(0,0,0,0.85)', padding: '6px 12px', borderRadius: '8px', color: 'var(--gold)', fontWeight: 900, border: '1px solid var(--gold)' }}>
                            {formatSnapAddaPrice(p.price)}
                         </div>
                      </div>
                      <div style={{ padding: '16px', background: 'rgba(10, 12, 22, 0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                         <div style={{ fontWeight: 900, color: 'white', fontSize: '1rem', marginBottom: '4px' }}>{p.title}</div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.75rem', marginBottom: '12px' }}>
                            <MapPin size={12} /> {p.location}
                         </div>
                         <button 
                           onClick={() => window.open(`/property/${p._id}`, '_blank')}
                           style={{ width: '100%', padding: '10px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                         >
                            VIEW ASSET <ExternalLink size={14} />
                         </button>
                      </div>
                   </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Quick Stats Overlay */}
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, display: 'flex', gap: '10px' }}>
             <div style={{ background: 'rgba(10,10,22,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '8px', height: '8px', background: '#10d98c', borderRadius: '50%', boxShadow: '0 0 10px #10d98c' }} />
                <span style={{ color: 'white', fontWeight: 900, fontSize: '0.7rem' }}>LIVE ENGINE ACTIVE</span>
             </div>
          </div>
        </div>

        {/* Sidebar Side (Visible on Desktop) */}
        <div style={{ width: '340px', height: '100%', background: 'rgba(255,255,255,0.01)', borderLeft: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }} className="hotspot-sidebar">
           <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ position: 'relative' }}>
                 <input 
                   type="text" 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   placeholder="Search area or project..." 
                   style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 12px 10px 36px', borderRadius: '12px', color: 'white', fontSize: '0.8rem', outline: 'none' }} 
                 />
                 <Search size={14} color="rgba(255,255,255,0.3)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
           </div>

           <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }} className="custom-scrollbar">
              {markers.map(p => (
                <div 
                  key={p._id}
                  onClick={() => handleSelect(p)}
                  style={{
                    padding: '12px', borderRadius: '16px', cursor: 'pointer',
                    background: selectedProp?._id === p._id ? 'rgba(232,184,75,0.08)' : 'transparent',
                    border: `1px solid ${selectedProp?._id === p._id ? 'rgba(232,184,75,0.2)' : 'transparent'}`,
                    transition: 'all 0.2s', marginBottom: '8px'
                  }}
                  onMouseEnter={e => !selectedProp || selectedProp._id !== p._id ? e.currentTarget.style.background = 'rgba(255,255,255,0.03)' : null}
                  onMouseLeave={e => !selectedProp || selectedProp._id !== p._id ? e.currentTarget.style.background = 'transparent' : null}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                       <img src={p.images?.[0] || p.image || '/placeholder.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                       <div style={{ color: 'white', fontWeight: 900, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                       <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: '2px' }}>{p.location}</div>
                       <div style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '0.85rem', marginTop: '4px' }}>{formatSnapAddaPrice(p.price)}</div>
                    </div>
                    {p.isVerified && <div style={{ color: '#10d98c' }}><CheckCircle2 size={14} /></div>}
                  </div>
                </div>
              ))}
              {markers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
                   <Search size={32} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                   <div style={{ fontSize: '0.8rem' }}>No properties found in this view</div>
                </div>
              )}
           </div>
        </div>
      </div>

      <style>{`
        .hotspot-sidebar::-webkit-scrollbar { width: 4px; }
        .hotspot-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        
        @media (max-width: 992px) {
           .hotspot-sidebar { display: none !important; }
           .hotspot-main-layout { flex-direction: column; }
        }

        .elite-map-popup .leaflet-popup-content-wrapper { background: rgba(10, 12, 22, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 0; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8); }
        .elite-map-popup .leaflet-popup-content { margin: 0; width: 280px !important; color: white; }
        .elite-map-popup .leaflet-popup-tip { background: rgba(10, 12, 22, 0.95); border: 1px solid rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
