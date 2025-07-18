//src/app/(admin)/users/list/UserListContent.tsx
'use client';
import Breadcrumb from '@/components/common/Breadcrumb';
import { UserView } from '@/components/users/UserList';
import { UserProvider, useUserContext } from '@/context/UserContext';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

/* const UserList = dynamic(() => import('@/components/users/UserList'), {
  loading: () => <ProfileSkeleton type="meta" />,
  ssr: false 
});
 */

export default function UserListContent() {

  return (
    <UserProvider>
      <UserListContentInner />
    </UserProvider>
  );
}
function UserListContentInner() {
  const { isLoadingUsers, usersError } = useUserContext();
  if (isLoadingUsers) return <ProfileSkeleton type="full" />;


  return (
    <div className="container mx-auto px-4 py-6">
      <Breadcrumb
        pageTitle="Lista de Usuarios"
        icon={<i className="fas fa-users" />}
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Usuarios", href: "/users" },
        ]}
      />
      <UserView />

    </div>
  );
}

