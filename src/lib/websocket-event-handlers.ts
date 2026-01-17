/**
 * src/lib/websocket-event-handlers.ts
 * 
 * ✅ ORDEN: Abstracción limpia de handlers WebSocket
 * Separa la lógica de eventos de la lógica del hook
 */

import { Socket } from 'socket.io-client';

export interface WebSocketData {
  data?: any;
  notificationId?: number;
  userId?: number;
  timestamp?: string;
}

export interface WebSocketHandlers {
  onConnect: (socket: Socket) => void;
  onDisconnect: (reason: string, socket: Socket) => void;
  onConnectError: (error: Error) => void;
  onError: (data: any) => void;
  onConnected: (data: WebSocketData) => void;
  onNotificationNew: (data: WebSocketData) => void;
  onNotificationRead: (data: WebSocketData) => void;
}

/**
 * Registra todos los eventos WebSocket en el socket proporcionado
 * 
 * ✅ VENTAJAS:
 * - Código limpio y mantenible
 * - Fácil de testear cada handler
 * - Centraliza la lógica de eventos
 * - Evita repetición en useNotifications.ts
 */
export function registerWebSocketHandlers(
  socket: Socket,
  handlers: Partial<WebSocketHandlers>
) {
  if (handlers.onConnect) {
    socket.on('connect', () => {
      if (handlers.onConnect) handlers.onConnect(socket);
    });
  }

  if (handlers.onDisconnect) {
    socket.on('disconnect', (reason: string) => {
      if (handlers.onDisconnect) handlers.onDisconnect(reason, socket);
    });
  }

  if (handlers.onConnectError) {
    socket.on('connect_error', (error: Error) => {
      if (handlers.onConnectError) handlers.onConnectError(error);
    });
  }

  if (handlers.onError) {
    socket.on('error', (data: any) => {
      if (handlers.onError) handlers.onError(data);
    });
  }

  if (handlers.onConnected) {
    socket.on('connected', (data: WebSocketData) => {
      if (handlers.onConnected) handlers.onConnected(data);
    });
  }

  if (handlers.onNotificationNew) {
    socket.on('notification:new', (data: WebSocketData) => {
      if (handlers.onNotificationNew) handlers.onNotificationNew(data);
    });
  }

  if (handlers.onNotificationRead) {
    socket.on('notification:read', (data: WebSocketData) => {
      if (handlers.onNotificationRead) handlers.onNotificationRead(data);
    });
  }
}

/**
 * Cleanup: Desregistra todos los listeners
 * Previene memory leaks en componentes
 */
export function unregisterWebSocketHandlers(socket: Socket) {
  socket.off('connect');
  socket.off('disconnect');
  socket.off('connect_error');
  socket.off('error');
  socket.off('connected');
  socket.off('notification:new');
  socket.off('notification:read');
}
