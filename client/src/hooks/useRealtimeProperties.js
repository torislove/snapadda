import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';

/**
 * useRealtimeProperties - Hook to subscribe to real-time property updates
 * @param {string} specificId - Optional specific property ID to watch
 * @returns {Array|Object|null} - Current live data from Firebase
 */
export const useRealtimeProperties = (specificId = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const path = specificId ? `properties/${specificId}` : 'properties';
    const propertyRef = ref(db, path);

    const unsubscribe = onValue(propertyRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        if (specificId) {
          setData(val);
        } else {
          // Convert object to array and sort by updatedAt desc
          const list = Object.values(val).sort((a, b) => 
            new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
          );
          setData(list);
        }
      } else {
        setData(specificId ? null : []);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase Realtime Error:", error);
      setLoading(false);
    });

    return () => {
      off(propertyRef);
    };
  }, [specificId]);

  return { data, loading };
};
