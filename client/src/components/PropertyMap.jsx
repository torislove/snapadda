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

// AP cities + districts + mandalheadquarters (comprehensive lookup table)
const AP_COORDS = [
  { name: 'Vijayawada', aliases: ['vijayawada', 'bezawada', 'benz'], lat: 16.5062, lng: 80.6480 },
  { name: 'Guntur', aliases: ['guntur'], lat: 16.3067, lng: 80.4365 },
  { name: 'Visakhapatnam', aliases: ['visakhapatnam', 'vizag', 'vishakhapatnam', 'waltair'], lat: 17.6868, lng: 83.2185 },
  { name: 'Tirupati', aliases: ['tirupati', 'tirumala'], lat: 13.6288, lng: 79.4192 },
  { name: 'Nellore', aliases: ['nellore', 'nelore'], lat: 14.4426, lng: 79.9865 },
  { name: 'Kurnool', aliases: ['kurnool', 'kurnul'], lat: 15.8281, lng: 78.0373 },
  { name: 'Rajahmundry', aliases: ['rajahmundry', 'rajamahendravaram', 'rajam'], lat: 17.0005, lng: 81.8040 },
  { name: 'Kakinada', aliases: ['kakinada', 'cocanada'], lat: 16.9891, lng: 82.2475 },
  { name: 'Eluru', aliases: ['eluru', 'ellore'], lat: 16.7107, lng: 81.0952 },
  { name: 'Ongole', aliases: ['ongole'], lat: 15.5057, lng: 80.0499 },
  { name: 'Anantapur', aliases: ['anantapur', 'anantapuram'], lat: 14.6819, lng: 77.6006 },
  { name: 'Kadapa', aliases: ['kadapa', 'cuddapah', 'ysr'], lat: 14.4674, lng: 78.8241 },
  { name: 'Srikakulam', aliases: ['srikakulam'], lat: 18.2949, lng: 83.8994 },
  { name: 'Vizianagaram', aliases: ['vizianagaram', 'vizianagram'], lat: 18.1067, lng: 83.3956 },
  { name: 'Amaravati', aliases: ['amaravati', 'amaravathi'], lat: 16.5731, lng: 80.3565 },
  { name: 'Mangalagiri', aliases: ['mangalagiri', 'manglagiri'], lat: 16.4303, lng: 80.5572 },
  { name: 'Tadepalli', aliases: ['tadepalli', 'tadepalle'], lat: 16.4783, lng: 80.6012 },
  { name: 'Tenali', aliases: ['tenali'], lat: 16.2418, lng: 80.6384 },
  { name: 'Narasaraopet', aliases: ['narasaraopet', 'narsaraopet'], lat: 16.2347, lng: 80.0497 },
  { name: 'Bapatla', aliases: ['bapatla'], lat: 15.9072, lng: 80.4673 },
  { name: 'Chirala', aliases: ['chirala'], lat: 15.8277, lng: 80.3556 },
  { name: 'Markapur', aliases: ['markapur'], lat: 15.7349, lng: 79.2694 },
  { name: 'Pattikonda', aliases: ['pattikonda'], lat: 15.3883, lng: 77.5826 },
  { name: 'Tadipatri', aliases: ['tadipatri'], lat: 14.9020, lng: 78.0115 },
  { name: 'Adoni', aliases: ['adoni'], lat: 15.6287, lng: 77.2740 },
  { name: 'Nandyal', aliases: ['nandyal'], lat: 15.4778, lng: 78.4846 },
  { name: 'Machilipatnam', aliases: ['machilipatnam', 'masulipatnam', 'bandar'], lat: 16.1875, lng: 81.1350 },
  { name: 'Bhimavaram', aliases: ['bhimavaram'], lat: 16.5449, lng: 81.5212 },
  { name: 'Narasapuram', aliases: ['narasapuram'], lat: 16.4355, lng: 81.6887 },
  { name: 'Palasa', aliases: ['palasa', 'kasibugga'], lat: 18.7704, lng: 84.4118 },
  { name: 'Tarakarama Nagar', aliases: ['tarakarama'], lat: 16.3000, lng: 80.5000 },
  { name: 'Penamaluru', aliases: ['penamaluru'], lat: 16.4600, lng: 80.5700 },
  { name: 'Ibrahimpatnam', aliases: ['ibrahimpatnam'], lat: 16.4500, lng: 80.6200 },
  { name: 'Nuzvid', aliases: ['nuzvid'], lat: 16.7868, lng: 80.8427 },
  { name: 'Gudivada', aliases: ['gudivada'], lat: 16.4351, lng: 80.9928 },
  { name: 'Jagannadhapuram', aliases: ['jagannadhapuram', 'jnpuram'], lat: 16.4800, lng: 80.6100 },
];

function resolveCoords(property) {
  // 1. Direct coordinates field on property (Stored by backend)
  if (property.coordinates?.lat && property.coordinates?.lng) {
    return [property.coordinates.lat, property.coordinates.lng];
  }
  
  // legacy or raw coords
  if (property.lat && property.lng) {
    return [property.lat, property.lng];
  }

  // 2. Parse Google Maps Link if available (Fallback for client-only data)
  if (property.googleMapsLink) {
    try {
      const url = property.googleMapsLink;
      // Pattern 1: @lat,lng
      const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) return [parseFloat(atMatch[1]), parseFloat(atMatch[2])];
      
      // Pattern 2: q=lat,lng
      const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];

      // Pattern 3: /dir/lat,lng
      const dirMatch = url.match(/\/dir\/(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (dirMatch) return [parseFloat(dirMatch[1]), parseFloat(dirMatch[2])];
      
      // Pattern 4: ll=lat,lng
      const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) return [parseFloat(llMatch[1]), parseFloat(llMatch[2])];
    } catch (e) {
      console.warn('Failed to parse googleMapsLink for coords:', e);
    }
  }

  // 3. customFeatures lat/lng lookup
  const latF = property.customFeatures?.find(f => /lat/i.test(f.label));
  const lngF = property.customFeatures?.find(f => /lng|lon/i.test(f.label));
  if (latF && lngF) {
    const lat = parseFloat(latF.value);
    const lng = parseFloat(lngF.value);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  // 4. AP Regional Fallback (Using AP_COORDS)
  const loc = (property.location || '').toLowerCase();
  const dist = (property.district || '').toLowerCase();
  
  const match = AP_COORDS.find(c => 
    c.aliases.some(a => loc.includes(a) || dist.includes(a)) ||
    loc.includes(c.name.toLowerCase()) || 
    dist.includes(c.name.toLowerCase())
  );

  if (match) {
    // Add slight random jitter so markers in same city don't overlap perfectly
    const jitter = () => (Math.random() - 0.5) * 0.01;
    return [match.lat + jitter(), match.lng + jitter()];
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
        scrollWheelZoom={true}
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
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {markers.map((p) => (
          <Marker
            key={p._id}
            position={p.coords}
            icon={p.isFeatured ? GoldIcon : DefaultIcon}
            eventHandlers={{ click: () => onMarkerClick && onMarkerClick(p) }}
          >
            <Tooltip permanent direction="top" offset={[0, -32]} className="elite-map-tag">
              <span style={{ fontWeight: 900, color: '#b45309', fontSize: '11px' }}>
                {priceDisplay(p)}
              </span>
            </Tooltip>
            <Popup className="property-popup" minWidth={220}>
              <div style={{ padding: '4px', minWidth: '210px' }}>
                <img
                  src={p.image || (p.images && p.images[0]) || '/placeholder.jpg'}
                  alt={p.title}
                  style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px', marginBottom: '8px' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
                <div style={{ fontWeight: 900, fontSize: '14px', marginBottom: '4px', color: '#0f172a', lineHeight: 1.2 }}>
                  {p.title}
                </div>
                <div style={{ color: '#b45309', fontWeight: 900, fontSize: '14px', marginBottom: '6px' }}>
                  {priceDisplay(p)}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                  📍 {[p.location, p.district].filter(Boolean).join(', ')}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <Link
                    to={`/property/${p._id}`}
                    style={{
                      flex: 1, padding: '10px', background: '#0f172a', color: 'white',
                      borderRadius: '10px', fontSize: '11px', fontWeight: 800, textDecoration: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                  >
                    VIEW ASSET <ExternalLink size={10} />
                  </Link>
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
