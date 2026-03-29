import { useState, useEffect } from 'react';
import { Search, MapPin, SlidersHorizontal, LayoutGrid, Map as MapIcon, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Property {
  _id: string;
  title: string;
  price: number;
  location: string;
  type: string;
  images?: string[];
}

const Explore = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('all');

  const propertyTypes = [
    { id: 'all', label: 'All' },
    { id: 'Apartment', label: 'Apartments' },
    { id: 'Villa', label: 'Villas' },
    { id: 'Plot', label: 'Plots' },
    { id: 'Agriculture', label: 'Agriculture' },
  ];

  useEffect(() => {
    fetchProperties();
  }, [activeType, search]);

  const fetchProperties = async () => {
    try {
      const params = new URLSearchParams();
      if (activeType !== 'all') params.append('type', activeType);
      if (search) params.append('search', search);

      const res = await fetch(`${API_URL}/properties?${params.toString()}`);
      const data = await res.json();
      if (data.status === 'success') {
        setProperties(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="explore-page">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="dashboard-title">Explore Amaravati</h1>
          <p className="dashboard-subtitle">Find your next premium property.</p>
        </div>
        <div className="flex gap-2 bg-secondary p-1 rounded-xl border border-subtle">
          <button className="p-2 rounded-lg bg-tertiary text-accent-gold"><LayoutGrid size={20} /></button>
          <button className="p-2 rounded-lg text-muted-foreground"><MapIcon size={20} /></button>
        </div>
      </header>

      <div className="search-bar-wrapper mb-6 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <input
          type="text"
          placeholder="Search by location, title, or type..."
          className="w-full bg-secondary border border-subtle rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-accent-gold outline-none transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filter-scroll flex gap-3 overflow-x-auto pb-4 mb-4 no-scrollbar">
        {propertyTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
              activeType === type.id
                ? 'bg-accent-gold text-bg-primary border-accent-gold'
                : 'bg-tertiary text-muted-foreground border-subtle hover:border-accent-gold-dim'
            }`}
          >
            {type.label}
          </button>
        ))}
        <button className="px-4 py-2 bg-tertiary border border-subtle rounded-full text-muted-foreground"><SlidersHorizontal size={18} /></button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-secondary animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center p-20 opacity-50">
          <p>No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className="properties-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <motion.div
              layout
              key={prop._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="property-card group cursor-pointer"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 border border-subtle">
                <img
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={prop.title}
                />
                <button className="absolute top-3 right-3 p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:text-accent-gold transition-colors">
                  <Heart size={20} />
                </button>
                <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg text-xs font-semibold text-white border border-white/20">
                  {prop.type}
                </div>
              </div>
              <div className="px-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg leading-tight group-hover:text-accent-gold transition-colors">{prop.title}</h3>
                  <div className="text-accent-gold font-bold text-lg whitespace-nowrap">₹ {(prop.price || 0).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin size={14} />
                  <span>{prop.location}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
