import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icon in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter = [16.5062, 80.6480]; // Vijayawada/Amaravati Region

export default function InteractiveMap({ properties }) {
  if (!properties || properties.length === 0) return null;

  return (
    <div className="interactive-map-container" style={{ height: '400px', width: '100%', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)', marginBottom: '2rem' }}>
      <MapContainer center={defaultCenter} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map(property => {
          // If the database does not have exact lat/lng coordinates, fallback to default for staging purposes.
          // In production, coordinates should be explicitly queried from property.location via GeoCoding.
          const position = property.coordinates ? [property.coordinates.lat, property.coordinates.lng] : defaultCenter;
          
          return (
            <Marker key={property._id || property.id} position={position}>
              <Popup>
                <div style={{ padding: '4px' }}>
                  <img src={property.images?.[0] || property.image} alt={property.title} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>{property.title}</h4>
                  <p style={{ margin: '0', color: '#16a34a', fontWeight: '600' }}>₹ {property.price}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
