import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const useNotifications = () => {
  const registerToken = async () => {
    if (!messaging) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (token) {
          console.log('FCM Token registered');
          await axios.post(`${API_URL}/automation/register-token`, {
            token,
            deviceInfo: navigator.userAgent
          });
        }
      }
    } catch (err) {
      console.error('FCM Token registration failed:', err);
    }
  };

  useEffect(() => {
    if (!messaging) return;
    
    // Auto-register if permission is already granted
    if (Notification.permission === 'granted') {
      registerToken();
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground Message:', payload);
      if (payload?.notification?.title) {
        new Notification(payload.notification.title, {
          body: payload.notification.body || '',
          icon: '/logo192.png'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { registerToken, permission: Notification.permission };
};
