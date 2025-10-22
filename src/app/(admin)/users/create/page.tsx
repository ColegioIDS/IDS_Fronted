// src/app/(admin)/users/create/page.tsx
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/context/UserContext';
import Breadcrumb from '@/components/common/Breadcrumb';
import { UserForm } from "@/components/users/UserForm";
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { useUserContext } from '@/context/UserContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchInterval: 5 * 60 * 1000,
    },
  },
});

function UserContentInner() {
  const { isLoadingUsers } = useUserContext();

  if (isLoadingUsers) return <ProfileSkeleton type="full" />;

  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb
        pageTitle="Usuarios"
        icon={<i className="fas fa-users" />}
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Usuarios", href: "/users" },
        ]}
      />
      <UserForm />
    </div>
  );
}

export default function CreateUserPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider isEditMode={false}>
        <UserContentInner />
      </UserProvider>
    </QueryClientProvider>
  );
}