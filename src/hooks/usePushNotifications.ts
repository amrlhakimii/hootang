import { useEffect } from 'react'
import { getToken } from 'firebase/messaging'
import { doc, setDoc, arrayUnion } from 'firebase/firestore'
import { db, getFirebaseMessaging } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export function usePushNotifications() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user || !('Notification' in window) || !('serviceWorker' in navigator)) return

    async function setup() {
      const messaging = await getFirebaseMessaging()
      if (!messaging) return

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return

      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        })
        if (token && user) {
          await setDoc(
            doc(db, 'users', user.uid),
            { fcmTokens: arrayUnion(token), email: user.email },
            { merge: true }
          )
        }
      } catch (err) {
        console.error('Push notification setup failed:', err)
      }
    }

    setup()
  }, [user])
}
