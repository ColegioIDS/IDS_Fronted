// src/app/(admin)/(management)/notifications/page.tsx
'use client';

import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import { Bell } from 'lucide-react';

const NotificationsPageContent = dynamic(
  () =>
    import('@/components/features/notifications').then((mod) => ({
      default: mod.NotificationsPageContent,
    })),
  { ssr: false }
);

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle="Notificaciones"
        icon={<Bell className="h-6 w-6" />}
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Gestión', href: '/notifications' },
          { label: 'Notificaciones', href: '/notifications' },
        ]}
      />
      <NotificationsPageContent />
    </div>
  );
}
