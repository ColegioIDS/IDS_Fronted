//src\app\(admin)\cycle\CyclesContent.tsx
'use client';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/common/Breadcrumb';
import { MdViewModule } from 'react-icons/md';
import ComponentCard from "@/components/common/ComponentCard";
import { CyclesProvider, useCyclesContext } from '@/context/CyclesContext';


const SchoolCycleTable = dynamic(() => import('@/components/cycles/SchoolCycleTable'), {
  loading: () => <ProfileSkeleton type="meta" />
});

export default function CyclesContent() {
  return (
    <CyclesProvider>
      <CyclesContentInner />
    </CyclesProvider>
  );
}

function CyclesContentInner() {
  const { isLoadingCycles } = useCyclesContext();

  if (isLoadingCycles) return <ProfileSkeleton type="full" />;

  return (
    <div>
      <Breadcrumb
        pageTitle=""
        //icon={<MdViewModule />}
        items={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Permisos", href: "/permissions" },
        ]}
      />

      <div className="space-y-6">
        
          <SchoolCycleTable />
       
      </div>
    </div>
  );
}
