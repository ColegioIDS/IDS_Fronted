"use client";
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/common/Breadcrumb';
import { SiAwsorganizations } from "react-icons/si";
import ComponentCard from "@/components/common/ComponentCard";

import { RoleProvider, useRoleContext } from '@/context/RoleContext';


const PageBlank = dynamic(() => import('@/components/roles/PageBlank'), {
  loading: () => <ProfileSkeleton type="meta" />
});

const RoleTable = dynamic(() => import('@/components/roles/Table'), {
  loading: () => <ProfileSkeleton type="meta" />
});

export default function PermissionContent() {
  return (
    <RoleProvider>
      <PermissionContentInner />

    </RoleProvider>
  );
}

function PermissionContentInner() {
  const { isLoading, error } = useRoleContext();
  if (isLoading) return <ProfileSkeleton type="full" />;
  return (

    <div>

      <Breadcrumb
        pageTitle="Roles"
        icon={<SiAwsorganizations />}
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Roles", href: "/roles" },
        ]}
      />

      <div>
        <div className="space-y-6">
          
        
          <RoleTable />

        </div>
      </div>



    </div>


  );
}