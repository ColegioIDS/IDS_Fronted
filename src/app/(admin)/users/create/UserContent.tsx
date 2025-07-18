//src\app\(admin)\users\create\UserContent.tsx
'use client';
import Breadcrumb from '@/components/common/Breadcrumb';
import {UserForm} from "@/components/users/UserForm";
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { UserProvider, useUserContext } from '@/context/UserContext';

  export default function UserContent() {
  return (
    <UserProvider isEditMode={false}>
      <UserContentInner />
    </UserProvider>
  );
}


 function UserContentInner() {
const { isLoadingUsers, usersError } = useUserContext();
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

