// src\app\(admin)\holiday\page.tsx
'use client';
import dynamic from 'next/dynamic';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { toast } from 'react-toastify';
import Breadcrumb from '@/components/common/Breadcrumb';
import { MdEvent } from 'react-icons/md';
import {

    HolidayProvider,
    useHolidayContext
} from '@/context/HolidayContext';



// Carga dinámica de componentes
const ContentPage = dynamic(() => import('@/components/holidays/ContentPage'), {
    loading: () => <ProfileSkeleton type="meta" />
});



export default function HolidaysContent() {
    return (

        <HolidaysContentInner />

    );
}

function HolidaysContentInner() {
    const {
        isLoading,
        error,
        cycleId,
        bimesterId
    } = useHolidayContext();

    if (isLoading) return <ProfileSkeleton type="full" />;
    if (error) toast.error(error);

    return (
        <div>
            <Breadcrumb
                pageTitle="Días Festivos"
                icon={<MdEvent />}
                items={[
                    { label: "Inicio", href: "/dashboard" },
                    { label: "Calendario", href: "/calendar" },
                    { label: "Días Festivos", href: "#" }
                ]}
            />

            <div className="space-y-6">

                <div className="lg:col-span-2">
                    <ContentPage/>

                </div>
            </div>
        </div>
    );
}