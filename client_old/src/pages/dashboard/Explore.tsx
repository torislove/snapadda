import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, Map as MapIcon } from 'lucide-react';
import { PropertyCard } from '../../components/ui/PropertyCard';

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

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('snap_seo_update', { 
      detail: { title: 'Explore Premium Properties in Andhra Pradesh | SnapAdda' } 
    }));
    return () => {
      window.dispatchEvent(new CustomEvent('snap_seo_update', { detail: null }));
    };
  }, []);

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
            <div key={prop._id}>
              <PropertyCard {...prop as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
