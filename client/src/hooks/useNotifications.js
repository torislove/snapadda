import { useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export const useNotifications = () => {
  useEffect(() => {
    if (!messaging) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          const token = await getToken(messaging, { vapidKey: VAPID_KEY });
          if (token) {
            console.log('FCM Token:', token);
            // Register token with server
            await axios.post(`${API_URL}/automation/register-token`, {
              token,
              deviceInfo: navigator.userAgent
            });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground: ', payload);
      // You could show a toast here using your app's toast system
      new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/logo192.png'
      });
    });

    return () => unsubscribe();
  }, []);
};
