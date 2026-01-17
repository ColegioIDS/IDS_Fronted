'use client';

import React, { createContext, useContext } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notifications.types';
import { Socket } from 'socket.io-client';

interface NotificationsContextType {
  notifications: Notification[];
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const notificationsState = useNotifications();

  return (
    <NotificationsContext.Provider value={notificationsState}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }
  return context;
}
