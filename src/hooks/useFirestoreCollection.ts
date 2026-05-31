import { useState, useEffect, useRef, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  getDocs,
  query,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export function useFirestoreCollection<T extends { id: string }>(
  localKey: string,
  collectionName: string,
  initialValue: T[] = []
) {
  const { user } = useAuth()

  const [items, setItemsState] = useState<T[]>(() => {
    try {
      const stored = localStorage.getItem(localKey)
      return stored ? (JSON.parse(stored) as T[]) : initialValue
    } catch {
      return initialValue
    }
  })

  const itemsRef = useRef<T[]>(items)
  useEffect(() => {
    itemsRef.current = items
  }, [items])

  const migratedRef = useRef(false)

  useEffect(() => {
    if (!user) {
      // Guest mode — read from localStorage
      migratedRef.current = false
      try {
        const stored = localStorage.getItem(localKey)
        setItemsState(stored ? (JSON.parse(stored) as T[]) : initialValue)
      } catch {
        setItemsState(initialValue)
      }
      return
    }

    const colRef = collection(db, 'users', user.uid, collectionName)

    // On first sign-in, migrate existing localStorage data to Firestore
    const migrate = async () => {
      if (migratedRef.current) return
      migratedRef.current = true
      try {
        const snapshot = await getDocs(query(colRef))
        if (!snapshot.empty) return
        const stored = localStorage.getItem(localKey)
        const localData: T[] = stored ? JSON.parse(stored) : []
        if (localData.length === 0) return
        const batch = writeBatch(db)
        localData.forEach((item) => batch.set(doc(colRef, item.id), item))
        await batch.commit()
      } catch {}
    }

    migrate()

    const unsubscribe = onSnapshot(query(colRef), (snapshot) => {
      const data = snapshot.docs.map((d) => d.data() as T)
      setItemsState(data)
      try { localStorage.setItem(localKey, JSON.stringify(data)) } catch {}
    })

    return unsubscribe
  }, [user, collectionName, localKey])

  const setItems = useCallback(
    async (value: T[] | ((prev: T[]) => T[])) => {
      const prev = itemsRef.current
      const next = typeof value === 'function' ? (value as (p: T[]) => T[])(prev) : value

      if (!user) {
        // Guest — write to localStorage only
        setItemsState(next)
        itemsRef.current = next
        try { localStorage.setItem(localKey, JSON.stringify(next)) } catch {}
        return
      }

      // Signed in — optimistic update then sync to Firestore
      setItemsState(next)
      itemsRef.current = next

      const colRef = collection(db, 'users', user.uid, collectionName)
      const prevMap = new Map(prev.map((i) => [i.id, i]))
      const nextMap = new Map(next.map((i) => [i.id, i]))
      const batch = writeBatch(db)
      let hasChanges = false

      for (const [id] of prevMap) {
        if (!nextMap.has(id)) {
          batch.delete(doc(colRef, id))
          hasChanges = true
        }
      }

      for (const [id, item] of nextMap) {
        const existing = prevMap.get(id)
        if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
          batch.set(doc(colRef, id), item)
          hasChanges = true
        }
      }

      if (hasChanges) await batch.commit()
    },
    [user, collectionName, localKey]
  )

  return [items, setItems] as const
}
