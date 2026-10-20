import { useCallback, useEffect, useState } from 'react'
import { deleteField, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { type Profile } from '../types/profile'

export function useProfile() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [snapshot, setSnapshot] = useState<{ uid: string; data: Profile } | null>(null)

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    return onSnapshot(
      doc(db, 'users', uid, 'profile', 'main'),
      (snap) => setSnapshot({ uid, data: (snap.data() as Profile | undefined) ?? {} }),
      () => setSnapshot({ uid, data: {} })
    )
  }, [user])

  const ready = !user || snapshot?.uid === user.uid
  const profile: Profile = user && snapshot?.uid === user.uid ? snapshot.data : {}

  const saveProfile = useCallback(
    async (changes: { [K in keyof Profile]: Profile[K] | null }) => {
      if (!user) return
      const data = Object.fromEntries(
        Object.entries(changes).map(([k, v]) => [k, v === null ? deleteField() : v])
      )
      try {
        await setDoc(doc(db, 'users', user.uid, 'profile', 'main'), data, { merge: true })
      } catch {
        toast('Could not save. Check your connection and try again.', 'error')
        throw new Error('save failed')
      }
    },
    [user, toast]
  )

  return { profile, saveProfile, loading: !ready }
}
