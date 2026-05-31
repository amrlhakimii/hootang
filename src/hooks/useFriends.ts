import { type Friend } from '../types/friend'
import { useFirestoreCollection } from './useFirestoreCollection'
import { generateID } from '../utils/generateID'

export function useFriends() {
  const [friends, setFriends] = useFirestoreCollection<Friend>('hootang_friends', 'friends')

  const addFriend = (name: string, notes: string) => {
    const friend: Friend = { id: generateID(), name: name.trim(), notes }
    setFriends((prev) => [...prev, friend])
  }

  const updateFriend = (id: string, name: string, notes: string) => {
    setFriends((prev) => prev.map((f) => (f.id === id ? { ...f, name, notes } : f)))
  }

  const deleteFriend = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id))
  }

  return { friends, addFriend, updateFriend, deleteFriend }
}
