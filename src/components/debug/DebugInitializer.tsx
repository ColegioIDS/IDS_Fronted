'use client'

import { useEffect } from 'react'
import { debugNotifications } from '@/lib/debug-notifications'

export function DebugInitializer() {
  useEffect(() => {
    // Exponer debug functions globalmente
    if (typeof window !== 'undefined') {
      ;(window as any).debugNotifications = debugNotifications
      console.log('✅ Debug tools available: window.debugNotifications.checkAPI()')
    }
  }, [])

  return null
}
