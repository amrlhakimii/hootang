import { useState } from 'react'
import { X, Cloud, Smartphone, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface LoginModalProps {
  onClose: () => void
}

export function LoginModal({ onClose }: LoginModalProps) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithGoogle()
      onClose()
    } catch {
      setError('Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 pb-10 sm:pb-6"
        style={{
          background: '#2d3440',
          border: '1px solid rgba(238,238,238,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <span style={{ fontFamily: "'Syne', sans-serif" }} className="text-lg font-extrabold">
            <span style={{ color: '#00ADB5' }}>hoo</span>
            <span className="text-[#EEEEEE]">tang</span>
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            style={{ background: 'rgba(238,238,238,0.06)' }}
          >
            <X size={14} className="text-[#EEEEEE]/60" />
          </button>
        </div>

        <h2 style={{ fontFamily: "'Syne', sans-serif" }} className="text-xl font-extrabold text-[#EEEEEE] mb-1.5">
          Sync across devices
        </h2>
        <p className="text-[#EEEEEE]/50 text-sm mb-6">
          Sign in to keep your data safe and access it from any device.
        </p>

        <div className="flex flex-col gap-2.5 mb-7">
          {[
            { icon: Cloud, text: 'Auto cloud backup' },
            { icon: Smartphone, text: 'Access from any device' },
            { icon: RefreshCw, text: 'Real-time sync' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: '#00ADB510', border: '1px solid #00ADB522' }}
              >
                <Icon size={13} style={{ color: '#00ADB5' }} />
              </div>
              <span className="text-[#EEEEEE]/70 text-sm">{text}</span>
            </div>
          ))}
        </div>

        {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
          style={{ background: '#fff', color: '#222831' }}
        >
          {loading ? (
            <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
          )}
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2.5 text-[#EEEEEE]/35 text-sm hover:text-[#EEEEEE]/60 transition-colors cursor-pointer"
        >
          Continue without signing in
        </button>
      </div>
    </div>
  )
}
