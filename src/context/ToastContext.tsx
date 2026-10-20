import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, XCircle, Info, Loader2 } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'loading'

export interface ToastAction {
  label: string
  onClick: () => void
}

interface Toast {
  id: string
  message: string
  type: ToastType
  action?: ToastAction
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, durationMs?: number, action?: ToastAction) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
  error: <XCircle size={16} className="text-red-400 shrink-0" />,
  info: <Info size={16} className="text-[#00ADB5] shrink-0" />,
  loading: <Loader2 size={16} className="text-[#EEEEEE]/50 shrink-0 animate-spin" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info', durationMs = 3200, action?: ToastAction) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type, action }])
    if (durationMs > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
        timers.current.delete(id)
      }, durationMs)
      timers.current.set(id, timer)
    }
    return id
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed left-1/2 flex flex-col items-center gap-2 pointer-events-none"
          style={{ top: 'calc(env(safe-area-inset-top) + 14px)', transform: 'translateX(-50%)', zIndex: 10000, width: 'min(92vw, 380px)' }}
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              onClick={() => dismiss(t.id)}
              className="pointer-events-auto flex items-center gap-2 w-full px-4 py-3 rounded-2xl text-sm font-medium cursor-pointer animate-[toast-in_0.25s_ease-out]"
              style={{
                background: '#2d3440',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                color: '#EEEEEE',
              }}
            >
              {icons[t.type]}
              <span className="truncate flex-1">{t.message}</span>
              {t.action && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    t.action?.onClick()
                    dismiss(t.id)
                  }}
                  className="shrink-0 -my-2 -mr-2 px-3 py-2 min-h-[44px] rounded-xl text-[#00ADB5] font-semibold hover:bg-white/5 cursor-pointer"
                >
                  {t.action.label}
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
