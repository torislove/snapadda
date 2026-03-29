import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
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
            <motion.div
              key={prop._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="property-card-simple p-4 bg-secondary rounded-xl border border-subtle"
            >
              <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                <img src={prop.images?.[0] || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'} alt={prop.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{prop.title}</h3>
              <p className="text-accent-gold font-bold">₹ {(prop.price || 0).toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-2">{prop.location}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
