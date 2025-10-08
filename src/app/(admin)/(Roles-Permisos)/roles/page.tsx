// src/app/(admin)/roles/page.tsx
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import dynamic from 'next/dynamic';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

const RolesContent = dynamic(() => import('@/components/roles/RolesContent'), {
  loading: () => <ProfileSkeleton type="meta" />
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function RolesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <Breadcrumb
          pageTitle="Gestión de Roles"
          items={[
            { label: "Inicio", href: "/dashboard" },
            { label: "Administración", href: "#" },
            { label: "Roles", href: "#" },
          ]}
        />
        <RolesContent />
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}