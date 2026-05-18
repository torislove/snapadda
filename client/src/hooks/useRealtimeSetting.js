import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import { fetchSetting } from '../services/api';

/**
 * useRealtimeSetting - Hook to subscribe to real-time administrative settings updates
 * @param {string} key - The setting key to subscribe to (e.g. 'hero_content')
 * @returns {Object} - { data, loading }
 */
export const useRealtimeSetting = (key) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) {
      setLoading(false);
      return;
    }

    if (!db) {
      // Fallback to one-time REST fetch if Firebase RTDB is unavailable
      fetchSetting(key)
        .then(val => {
          setData(val);
          setLoading(false);
        })
        .catch(() => setLoading(false));
      return;
    }

    const settingRef = ref(db, `settings/${key}`);
    const unsubscribe = onValue(settingRef, (snapshot) => {
      const val = snapshot.val();
      if (val !== null && val !== undefined) {
        setData(val);
      } else {
        // Fallback to REST fetch if key is empty in RTDB
        fetchSetting(key).then(setData).catch(() => {});
      }
      setLoading(false);
    }, (error) => {
      console.warn(`[useRealtimeSetting] Firebase RTDB Sync error for key '${key}':`, error.message);
      // Clean fallback to REST endpoint
      fetchSetting(key).then(setData).catch(() => {});
      setLoading(false);
    });

    return () => {
      off(settingRef);
    };
  }, [key]);

  return { data, loading };
};
