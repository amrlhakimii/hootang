import { useState, useEffect, useRef, useCallback } from 'react'
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  query,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export function useFirestoreCollection<T extends { id: string }>(
  _localKey: string,
  collectionName: string,
  initialValue: T[] = []
) {
  const { user } = useAuth()
  const [items, setItemsState] = useState<T[]>(initialValue)
  const itemsRef = useRef<T[]>(initialValue)

  useEffect(() => {
    itemsRef.current = items
  }, [items])

  useEffect(() => {
    if (!user) {
      setItemsState(initialValue)
      return
    }

    const colRef = collection(db, 'users', user.uid, collectionName)

    const unsubscribe = onSnapshot(query(colRef), (snapshot) => {
      const data = snapshot.docs.map((d) => d.data() as T)
      setItemsState(data)
    })

    return unsubscribe
  }, [user, collectionName])

  const setItems = useCallback(
    async (value: T[] | ((prev: T[]) => T[])) => {
      if (!user) return

      const prev = itemsRef.current
      const next = typeof value === 'function' ? (value as (p: T[]) => T[])(prev) : value

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
    [user, collectionName]
  )

  return [items, setItems] as const
}
