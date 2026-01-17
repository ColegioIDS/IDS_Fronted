'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { notificationsService } from '@/services/notifications.service';
import { api } from '@/config/api';
import { Notification, PaginatedNotifications } from '@/types/notifications.types';
import { useAuth } from '@/context/AuthContext';
import { registerWebSocketHandlers, unregisterWebSocketHandlers } from '@/lib/websocket-event-handlers';

interface WebSocketData {
  data?: Notification | null;
  notificationId?: number;
  userId?: number;
  timestamp?: string;
}

export function useNotifications() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // ✅ Usar el contexto de autenticación para saber si hay sesión válida
  const { isAuthenticated } = useAuth();
  
  // Obtener token del localStorage o cookies
  const getToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Método 1: localStorage
    let token = localStorage.getItem('token');
    if (token) return token;
    
    // Método 2: auth-storage (Zustand)
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        token = parsed.state?.token || parsed.token;
        if (token) return token;
      } catch {
        // Continuar
      }
    }
    
    // Método 3: Cookies (última opción)
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith('token=')) {
        return cookie.substring(6);
      }
      if (cookie.startsWith('auth-token=')) {
        return cookie.substring(11);
      }
      if (cookie.startsWith('authToken=')) {
        return cookie.substring(10);
      }
    }
    
    // Si no hay token en cookies, posiblemente esté en HttpOnly cookies
    // En ese caso, devuelve 'cookie' y el navegador lo enviará automáticamente
    return 'cookie';
  }, []);

  // Función para cargar notificaciones iniciales
  const loadInitialNotifications = useCallback(async () => {
    const maxRetries = 3;
    let retries = 0;

    const attemptLoad = async (): Promise<void> => {
      try {
        const response: PaginatedNotifications = await notificationsService.getNotifications({
          page: 1,
          limit: 20,
        });
        
        const notifs = response?.data || [];
        console.log(`📦 Notificaciones cargadas: ${notifs.length}`);
        setNotifications(notifs);
      } catch (error) {
        retries++;
        console.error(`❌ Error cargando notificaciones (intento ${retries}/${maxRetries}):`, error);
        
        // ✅ SEGURIDAD: Reintentar automáticamente con backoff
        if (retries < maxRetries) {
          const delayMs = 1000 * retries; // 1s, 2s, 3s
          console.log(`⏳ Reintentando en ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return attemptLoad(); // Reintento recursivo
        } else {
          console.error('❌ Máximo de reintentos alcanzado');
          setNotifications([]);
        }
      }
    };

    await attemptLoad();
  }, []);

  // Conectar al WebSocket
  useEffect(() => {
    // ✅ SOLO conectar si hay autenticación válida
    if (!isAuthenticated) {
      console.log('⏭️ No autenticado - desconectando WebSocket');
      setIsConnected(false);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Si ya hay un socket conectado, no crear uno nuevo
    if (socket?.connected) {
      console.log('✅ WebSocket ya conectado, no crear uno nuevo');
      return;
    }

    // Pequeño delay para asegurar que el token/cookies están disponibles
    const timer = setTimeout(() => {
      const token = getToken();
      
      // ✅ Doble verificación: token y isAuthenticated
      if (!token) {
        console.log('⏭️ Sin token - no conectando WebSocket');
        setIsConnected(false);
        return;
      }
      
      console.log('🔌 === INICIANDO CONEXIÓN WEBSOCKET ===');
      // ✅ SEGURIDAD: Solo mostrar token info en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('   Token:', token === 'cookie' ? 'HttpOnly Cookies' : `${token.substring(0, 20)}...`);
        console.log('   Cookies disponibles:', document.cookie ? 'Sí' : 'No');
      } else {
        console.log('   Autenticación: Configurada');
      }

      // Obtener URL base del API
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
      const wsUrl = `${apiBase}/notifications`;
      if (process.env.NODE_ENV === 'development') {
        console.log('   URL:', wsUrl);
      }

      const socketConfig: any = {
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: Infinity, // Reintentar indefinidamente
        transports: ['websocket', 'polling'],
        withCredentials: true, // ✅ Enviar cookies automáticamente
      };

      // Si hay token Bearer, enviarlo en auth
      if (token && token !== 'cookie') {
        socketConfig.auth = {
          Authorization: token, // Socket.io lo espera sin "Bearer" aquí
        };
        console.log('   Autenticación: Bearer token');
      } else {
        // Las cookies se enviarán automáticamente con withCredentials
        console.log('   Autenticación: HttpOnly cookies');
      }

      const newSocket = io(wsUrl, socketConfig);

      // ✅ ORDEN: Registrar handlers de forma centralizada y limpia
      registerWebSocketHandlers(newSocket, {
        onConnect: (socket) => {
          console.log('✅ WebSocket conectado exitosamente');
          console.log('   Socket ID:', socket.id);
          console.log('   Estado:', socket.connected ? 'Conectado' : 'No conectado');
          setIsConnected(true);
        },

        onDisconnect: (reason, socket) => {
          console.log('❌ Desconectado - Razón:', reason);
          setIsConnected(false);
          
          // Auto-reconectar según la razón
          if (reason === 'io server disconnect') {
            console.log('   → Desconexión del servidor. Reintentando en 3 segundos...');
            setTimeout(() => {
              if (socket && !socket.connected) {
                console.log('   🔄 Intentando reconectar...');
                socket.connect();
              }
            }, 3000);
          } else if (reason === 'transport close' || reason === 'io client disconnect') {
            console.log('   → Desconexión limpia (no es error)');
          } else {
            console.warn(`   ⚠️ Desconexión inesperada: ${reason}`);
          }
        },

        onConnectError: (error) => {
          console.error('❌ Error de conexión WebSocket:');
          console.error('   Mensaje:', error.message);
          if (process.env.NODE_ENV === 'development') {
            console.error('   Stack:', error.stack);
          }
        },

        onError: (data) => {
          console.error('❌ Error del servidor WebSocket:', data);
          if (data?.code === 'NO_AUTH') {
            console.error('   → Sin autenticación. Por favor inicia sesión.');
            newSocket.disconnect();
          } else if (data?.code === 'INVALID_TOKEN') {
            console.error('   → Token inválido o expirado. Por favor inicia sesión nuevamente.');
            newSocket.disconnect();
          } else if (data?.code === 'RATE_LIMIT_EXCEEDED') {
            console.error('   → Rate limit excedido. Demasiadas conexiones.');
            newSocket.disconnect();
          }
        },

        onConnected: (data) => {
          console.log('✅ Sesión iniciada:', data);
        },

        onNotificationNew: (data) => {
          console.log('📬 [WS] Nueva notificación recibida:', data);
          const notification = data.data;
          if (notification) {
            setNotifications((prev) => [notification, ...prev]);
          }
        },

        onNotificationRead: (data) => {
          console.log('✅ [WS] Notificación marcada como leída:', data.notificationId);
          if (data.notificationId) {
            setNotifications((prev) =>
              prev.map((n) =>
                n.id === data.notificationId
                  ? { ...n, status: 'READ' as const }
                  : n
              )
            );
          }
        },
      });

      // Heartbeat para mantener viva la conexión
      const heartbeat = setInterval(() => {
        if (newSocket.connected) {
          newSocket.emit('ping');
        }
      }, 30000);

      setSocket(newSocket);

      return () => {
        clearInterval(heartbeat);
        // ✅ Limpieza: Desregistrar handlers para evitar memory leaks
        unregisterWebSocketHandlers(newSocket);
        newSocket.disconnect();
      };
    }, 800);

    return () => clearTimeout(timer);
  }, [isAuthenticated, getToken]);

  // Cargar notificaciones al montar el componente (solo si autenticado)
  useEffect(() => {
    // ✅ Solo cargar si hay autenticación válida
    if (isAuthenticated) {
      loadInitialNotifications();
    } else {
      // Si no está autenticado, limpiar notificaciones
      setNotifications([]);
    }
  }, [isAuthenticated]);

  // Marcar una notificación como leída
  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        const response = await api.patch(
          `/api/notifications/${notificationId}/read`
        );

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Error al marcar como leída');
        }

        // Actualizar localmente
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, status: 'READ' as const }
              : n
          )
        );
        console.log(`✅ Notificación ${notificationId} marcada como leída`);
      } catch (error) {
        console.error('Error marcando como leída:', error);
        throw error;
      }
    },
    []
  );

  // Marcar múltiples como leídas
  const markAllAsRead = useCallback(
    async (notificationIds?: number[]) => {
      try {
        const ids = notificationIds || notifications
          .filter((n) => n.status !== 'READ')
          .map((n) => n.id);

        if (ids.length === 0) {
          console.log('No hay notificaciones sin leer');
          return;
        }

        const response = await api.patch(
          '/api/notifications/bulk/read',
          { notificationIds: ids }
        );

        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Error al marcar como leídas');
        }

        // Actualizar localmente
        setNotifications((prev) =>
          prev.map((n) =>
            ids.includes(n.id)
              ? { ...n, status: 'READ' as const }
              : n
          )
        );
        console.log(`✅ ${ids.length} notificaciones marcadas como leídas`);
      } catch (error) {
        console.error('Error marcando como leídas:', error);
        throw error;
      }
    },
    [notifications]
  );

  // Obtener contador de no leídas
  const unreadCount = notifications.filter(
    (n) => n.status !== 'READ'
  ).length;

  return {
    notifications,
    setNotifications,
    socket,
    isConnected,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
