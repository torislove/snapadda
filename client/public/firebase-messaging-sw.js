importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

// These will be injected by the build process or can be hardcoded if stable
// For simplicity in this implementation, we use the compat version which is easier for a standalone SW
firebase.initializeApp({
  apiKey: "AIzaSyAQX18dK6_wumA5bKEhPnKeckOIfC-SOR0",
  authDomain: "snapadda-7a6e6.firebaseapp.com",
  projectId: "snapadda-7a6e6",
  storageBucket: "snapadda-7a6e6.firebasestorage.app",
  messagingSenderId: "227172321059",
  appId: "1:227172321059:web:7fe7097f7937739c0f6e96"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.click_action || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
