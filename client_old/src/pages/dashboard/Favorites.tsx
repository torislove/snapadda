import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${API_URL}/users/${user._id}/favorites`);
      const data = await res.json();
      if (data.status === 'success') {
        setFavorites(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-accent-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1 className="dashboard-title">Saved Properties</h1>
      <p className="dashboard-subtitle">Everything you've bookmarked for later.</p>

      {favorites.length === 0 ? (
        <div className="empty-state text-center p-20">
          <Heart size={64} className="text-muted-foreground mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-medium mb-2">No Saved Properties</h3>
          <p className="text-muted-foreground mb-6">Start exploring to find your dream home!</p>
          <button className="dev-mock-btn" style={{ width: 'auto', padding: '12px 24px' }}>Explore Now</button>
        </div>
      ) : (
        <div className="favorites-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((prop) => (
            <div key={prop._id}>
              <PropertyCard {...prop as any} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
