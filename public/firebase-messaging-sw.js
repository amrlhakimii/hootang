importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAK7CrRT5bFPCF_SZu659yrttD8o8o6u0A',
  authDomain: 'hootang-c1723.firebaseapp.com',
  projectId: 'hootang-c1723',
  storageBucket: 'hootang-c1723.firebasestorage.app',
  messagingSenderId: '945749504671',
  appId: '1:945749504671:web:7d53c9c7a1e892928268aa',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'hootang'
  const body = payload.notification?.body ?? ''
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/favicon.png',
  })
})
