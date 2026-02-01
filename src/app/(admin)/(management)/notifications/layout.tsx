import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notificaciones | IDS',
  description: 'Gestiona notificaciones del sistema y preferencias',
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
