/**
 * Debug helper para notificaciones
 * Úsalo en la consola del navegador: window.debugNotifications.checkAPI()
 */

import { api } from '@/config/api'

export const debugNotifications = {
  async checkAPI() {
    console.log('🔍 Verificando API de notificaciones...\n')

    try {
      // 1. Verificar endpoint sin parámetros
      console.log('1️⃣ GET /api/notifications (sin parámetros)')
      const response1 = await api.get('/api/notifications')
      console.log('✅ Status:', response1.status)
      console.log('📦 Response:', response1.data)
      console.log('📊 Data length:', response1.data?.data?.length)
      console.log('')

      // 2. Verificar con parámetros explícitos
      console.log('2️⃣ GET /api/notifications?page=1&limit=12')
      const response2 = await api.get('/api/notifications?page=1&limit=12')
      console.log('✅ Status:', response2.status)
      console.log('📊 Data length:', response2.data?.data?.length)
      console.log('Meta:', response2.data?.meta)
      console.log('')

      // 3. Verificar estructura de respuesta
      console.log('3️⃣ Estructura de respuesta:')
      console.log('Success:', response2.data?.success)
      console.log('Message:', response2.data?.message)
      console.log('First notification:', response2.data?.data?.[0])
      console.log('')

      // 4. Verificar por ID si hay notificaciones
      if (response2.data?.data?.[0]?.id) {
        const notifId = response2.data.data[0].id
        console.log(`4️⃣ GET /api/notifications/${notifId}`)
        const response3 = await api.get(`/api/notifications/${notifId}`)
        console.log('✅ Status:', response3.status)
        console.log('Notification:', response3.data?.data)
      }
    } catch (error: any) {
      console.error('❌ Error:', error.message)
      console.error('Response:', error.response?.data)
      console.error('Status:', error.response?.status)
    }
  },

  async checkPermissions() {
    console.log('🔐 Verificando permisos...\n')
    try {
      const response = await api.get('/api/auth/me')
      console.log('User:', response.data?.data)
      console.log('Role:', response.data?.data?.role)
      console.log('Permissions:', response.data?.data?.role?.permissions)
    } catch (error: any) {
      console.error('Error:', error.message)
    }
  },

  async checkRoles() {
    console.log('👥 Verificando roles disponibles...\n')
    try {
      const response = await api.get('/api/notifications/info/roles')
      console.log('Roles:', response.data)
    } catch (error: any) {
      console.error('Error:', error.message)
    }
  },
}

// Exponer globalmente
if (typeof window !== 'undefined') {
  ;(window as any).debugNotifications = debugNotifications
}
