// src/app/(admin)/permissions/page.tsx
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const PermissionsContent = dynamic(() => import('@/components/permissions/PermissionsContent'), {
  loading: () => <ProfileSkeleton type="meta" />
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function PermissionsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <Breadcrumb
          pageTitle="Gestión de Permisos"
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Administración", href: "#" },
            { label: "Permisos", href: "#" },
          ]}
        />
        <PermissionsContent />
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}