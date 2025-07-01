//src\app\(admin)\(Roles-Permisos)\permissions\PermissionContext.tsx
"use client";
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/common/Breadcrumb';
import { MdViewModule } from 'react-icons/md';
import ComponentCard from "@/components/common/ComponentCard";


import { PermissionProvider, usePermissionContext } from '@/context/PermissionContext';

const PermissionTable = dynamic(() => import('@/components/permissions/PermissionsTable'), {
  loading: () => <ProfileSkeleton type="meta" />
});
export default function PermissionContent() {
  return (
    <PermissionProvider>
      <PermissionContentInner />

    </PermissionProvider>
  );
}

function PermissionContentInner() {
  const { isLoading, error } = usePermissionContext();
  if (isLoading) return <ProfileSkeleton type="full" />;
  return (

    <div>

      <Breadcrumb
        pageTitle="Permisos"
        icon={<MdViewModule />}
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Permisos", href: "/permissions" },
        ]}
      />

      <div>
        <div className="space-y-6">
          <ComponentCard title="Permisos Existentes">
            <PermissionTable />
          </ComponentCard>
        </div>
      </div>



    </div>


  );
}