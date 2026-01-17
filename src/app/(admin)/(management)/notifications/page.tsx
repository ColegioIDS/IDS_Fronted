// src/app/(admin)/(management)/notifications/page.tsx
import { Metadata } from 'next';
import { NotificationsPageContent } from '@/components/features/notifications/NotificationsPageContent';

export const metadata: Metadata = {
  title: 'Notificaciones | IDS',
  description: 'Gestiona notificaciones del sistema',
};

export default function NotificationsPage() {
  return <NotificationsPageContent />;
}
