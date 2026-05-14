import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, ExternalLink, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatSnapAddaPrice } from '../utils/priceUtils';
import ErrorBoundary from './ErrorBoundary';

// Fix default marker icons in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// CSS filter for OSM to make it Elite Dark
const osmFilter = 'brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7)';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Gold premium marker for featured
const GoldIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:linear-gradient(135deg,#e8b84b,#d4972a);
    border:2px solid rgba(255,255,255,0.8);
    box-shadow:0 4px 12px rgba(232,184,75,0.6);
    transform:rotate(-45deg);
    display:flex;align-items:center;justify-content:center;
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -32],
});

// Elite Institutional Icon
const InstitutionalIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:#0a0a14;
    border:2px solid #e8b84b;
    box-shadow:0 0 15px rgba(232,184,75,0.8);
    display:flex;align-items:center;justify-content:center;
    position:relative;
  ">
    <div style="width:8px;height:8px;background:#e8b84b;border-radius:50%;box-shadow:0 0 10px #e8b84b;"></div>
    <div style="position:absolute;top:-4px;right:-4px;width:12px;height:12px;background:#10d98c;border-radius:50%;border:1px solid white;"></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Strict Google Maps Coordinate Resolver


function resolveCoords(property) {
  if (!property) return null;

  // 1. Direct coordinates field on property (Stored by backend)
  if (property.coordinates?.lat && property.coordinates?.lng) {
    return [parseFloat(property.coordinates.lat), parseFloat(property.coordinates.lng)];
  }
  
  // 2. Parse Google Maps Link (Strict User Requirement)
  const url = property.googleMapsLink;
  if (url && typeof url === 'string') {
    try {
      // Pattern 1: @lat,lng
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) return [parseFloat(atMatch[1]), parseFloat(atMatch[2])];
      
      // Pattern 2: q=lat,lng
      const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];

      // Pattern 3: !3d lat !4d lng
      const d3dMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (d3dMatch) return [parseFloat(d3dMatch[1]), parseFloat(d3dMatch[2])];

      // Pattern 4: /place/name/lat,lng
      const placeMatch = url.match(/\/place\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (placeMatch) return [parseFloat(placeMatch[1]), parseFloat(placeMatch[2])];

      // Pattern 5: /dir/lat,lng
      const dirMatch = url.match(/\/dir\/[^/]+\/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (dirMatch) return [parseFloat(dirMatch[1]), parseFloat(dirMatch[2])];

      // Pattern 6: ll=lat,lng
      const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) return [parseFloat(llMatch[1]), parseFloat(llMatch[2])];

      // Pattern 7: Brute force fallback
      const bruteMatch = url.match(/(-?\d+\.\d{5,}),\s*(-?\d+\.\d{5,})/);
      if (bruteMatch) return [parseFloat(bruteMatch[1]), parseFloat(bruteMatch[2])];
    } catch (e) {
      console.warn('Map link parsing error:', e);
    }
  }

  return null;
}



function ChangeView({ center, zoom, bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, bounds, map]);
  return null;
}

// Fix for gray boxes/unloaded tiles in Leaflet
function MapResizeHandler() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const PropertyMap = ({ properties = [], selectedProperty, onMarkerClick }) => {
  const [mapCenter] = useState([16.5062, 80.6480]); // Default to Vijayawada
  const [zoom] = useState(8);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [selectedZoom, setSelectedZoom] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  const markers = useMemo(() => {
    if (!properties?.length) return [];
    return properties
      .map(p => ({ ...p, coords: resolveCoords(p) }))
      .filter(p => p.coords);
  }, [properties]);

  useEffect(() => {
    if (selectedProperty) {
      const sel = markers.find(m => m._id === selectedProperty._id);
      if (sel?.coords) {
        setSelectedCenter(sel.coords);
        setSelectedZoom(15);
        setMapBounds(null);
      }
    } else if (markers.length > 0) {
      // Auto-fit to show all markers if none selected
      const bounds = L.latLngBounds(markers.map(m => m.coords));
      setMapBounds(bounds);
    }
  }, [selectedProperty, markers]);

  const priceDisplay = (p) => {
    if (p.priceDisplay) return p.priceDisplay;
    return formatSnapAddaPrice(p.price);
  };

  const handleRecenter = () => {
    setSelectedCenter([16.5062, 80.6480]);
    setSelectedZoom(8);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', background: '#05050a' }}
      >
        <MapResizeHandler />
        <ChangeView
          center={selectedCenter || (!mapBounds ? mapCenter : null)}
          zoom={selectedZoom || (!mapBounds ? zoom : null)}
          bounds={mapBounds}
        />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="elite-osm-layer"
        />

        {markers.map((p) => (
          <Marker
            key={p._id}
            position={p.coords}
            icon={p.isVerified && p.isFeatured ? InstitutionalIcon : (p.isFeatured ? GoldIcon : DefaultIcon)}
            eventHandlers={{ click: () => onMarkerClick && onMarkerClick(p) }}
          >
            <Tooltip permanent direction="top" offset={[0, -32]} className="elite-map-tag">
              <span style={{ fontWeight: 900, color: '#b45309', fontSize: '11px' }}>
                {priceDisplay(p)}
              </span>
            </Tooltip>
            <Popup className="property-popup advanced-popup" minWidth={280}>
              <div style={{ padding: '0px', minWidth: '270px', overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={p.image || (p.images && p.images[0]) || '/placeholder.jpg'}
                    alt={p.title}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderBottom: '2px solid var(--gold)' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  {p.isVerified && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(16,217,140,0.9)', backdropFilter: 'blur(4px)', color: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '10px', fontWeight: 900 }}>
                      VERIFIED
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '6px 10px', borderRadius: '8px', fontSize: '14px', fontWeight: 900 }}>
                    {priceDisplay(p)}
                  </div>
                </div>
                
                <div style={{ padding: '12px' }}>
                  <div style={{ fontWeight: 950, fontSize: '15px', marginBottom: '8px', color: '#1e293b', lineHeight: 1.3 }}>
                    {p.title}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <TrendingUp size={12} color="var(--gold)" />
                      {p.areaSize ? `${p.areaSize} ${p.measurementUnit || 'Sq.Yds'}` : (p.bhk ? `${p.bhk} BHK` : 'Premium Asset')}
                    </div>
                    <div style={{ background: '#f1f5f9', padding: '6px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} color="var(--cyan)" />
                      {[p.location, p.district].filter(Boolean).join(', ')}
                    </div>
                  </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <a
                    href={`/property/${p._id}`}
                    style={{
                      flex: 1, padding: '10px', background: '#0f172a', color: 'white',
                      borderRadius: '10px', fontSize: '11px', fontWeight: 800, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                  >
                    VIEW ASSET <ExternalLink size={10} />
                  </a>
                  {p.googleMapsLink && (
                    <a
                      href={p.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px', background: 'rgba(66, 133, 244, 0.1)', color: '#4285F4',
                        borderRadius: '10px', fontSize: '11px', fontWeight: 800, textDecoration: 'none',
                        border: '1px solid rgba(66, 133, 244, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      <MapPin size={14} />
                    </a>
                  )}
                </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating UI Controls */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          onClick={handleRecenter}
          style={{ 
            background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(10px)', 
            border: '1px solid rgba(232,184,75,0.4)', color: 'var(--gold)',
            padding: '10px', borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '0.7rem', fontWeight: 900, boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}
        >
          <Navigation size={14} /> RECENTER
        </button>

        <div style={{
          background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
          padding: '10px 14px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10d98c', boxShadow: '0 0 8px #10d98c' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>MAP INTEL</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--gold)' }}>
            {markers.length} <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Properties</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SafePropertyMap = (props) => (
  <ErrorBoundary>
    <PropertyMap {...props} />
  </ErrorBoundary>
);

export default SafePropertyMap;
