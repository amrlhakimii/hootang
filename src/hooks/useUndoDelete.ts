import { useCallback, useRef } from 'react'
import { useToast } from '../context/ToastContext'

const UNDO_WINDOW_MS = 6000
const DOUBLE_CLICK_MS = 1000

/**
 * Delete immediately, then offer an Undo toast.
 *
 * `remove` performs the delete; `restore` must put the same item back (ideally at its
 * original position). Both are plain callbacks, so this works with any hook's state.
 * Pass the item's `id` so a fast double-click doesn't delete twice or stack two Undo toasts.
 */
export function useUndoDelete() {
  const { toast } = useToast()
  const recent = useRef(new Map<string, number>())

  return useCallback(
    (label: string, remove: () => void, restore: () => void, id?: string) => {
      if (id) {
        const now = Date.now()
        if (now - (recent.current.get(id) ?? 0) < DOUBLE_CLICK_MS) return
        recent.current.set(id, now)
      }
      remove()
      toast(`${label} deleted`, 'info', UNDO_WINDOW_MS, { label: 'Undo', onClick: restore })
    },
    [toast]
  )
}
