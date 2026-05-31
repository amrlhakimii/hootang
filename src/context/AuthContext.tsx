import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth'
import { auth } from '../lib/firebase'

const LOCAL_KEYS = [
  'hootang_friends',
  'hootang_loans',
  'hootang_bills',
  'hootang_subs',
  'hootang_receipts',
]

interface AuthContextType {
  user: User | null
  authLoading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider())
  }

  const logout = async () => {
    await signOut(auth)
    LOCAL_KEYS.forEach((key) => localStorage.removeItem(key))
  }

  return (
    <AuthContext.Provider value={{ user, authLoading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
