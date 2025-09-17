import { useCallback } from 'react'

type ToastOptions = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = useCallback((opts: ToastOptions) => {
    if (opts.variant === 'destructive') {
      console.error(`[Toast] ${opts.title || ''} ${opts.description || ''}`)
      alert(`${opts.title || 'Hata'}: ${opts.description || ''}`)
    } else {
      console.log('[Toast]', opts)
      if (opts.title || opts.description) {
        alert(`${opts.title || ''}\n${opts.description || ''}`)
      }
    }
  }, [])

  return { toast }
}


