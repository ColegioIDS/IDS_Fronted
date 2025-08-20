//src/app/(admin)/grades/page.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GradeProvider } from '@/context/GradeContext';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';

// Crear cliente específico para esta página
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
});

const GradesContent = dynamic(() => import('@/components/grades/GradesContent'), {
  loading: () => <ProfileSkeleton type="meta" />
});

function GradesPageContent() {
  return (
    <div className="space-y-6">
      <Breadcrumb
        pageTitle=""
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "/academic" },
          { label: "Grados", href: "#" },
        ]}
      />
      <GradesContent />
    </div>
  );
}

export default function GradesPageWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <GradeProvider>
        <GradesPageContent />
      </GradeProvider>
    </QueryClientProvider>
  );
}