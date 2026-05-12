import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState({ msg: '', type: 'success', visible: false })

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000)
  }, [])

  return { toast, showToast }
}
