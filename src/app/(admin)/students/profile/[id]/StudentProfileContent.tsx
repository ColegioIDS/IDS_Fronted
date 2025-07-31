//src\app\(admin)\students\profile\[id]\StudentProfileContent.tsx
'use client';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';
import { StudentProvider, useStudentContext } from '@/context/StudentContext';
import  StudentProfile  from '@/components/students/StudentProfile';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function UserListContent() {

    return (
        <StudentProvider isEditMode={true}>
            <StudentProfileContentInner />
        </StudentProvider>
    );
}

function StudentProfileContentInner() {
    const { isLoadingUsers, usersError, studentLoaded, fetchStudentById } = useStudentContext();
    const {id} = useParams()
    const studentId = Number(id)
    const route = useRouter();

    useEffect(()=>{
        if(isNaN(studentId))
        {
            route.push('/not-found');
            return;
        }
        fetchStudentById(studentId);
        
    },[studentId])



if (!studentLoaded ) {
  return <div>Cargando datos del usuario...</div>;
}

    return (
        <div className="container mx-auto px-4 py-6">
            <Breadcrumb
                pageTitle=""
                icon={<i className="fas fa-users" />}
                items={[
                    { label: "Inicio", href: "/dashboard" },
                    { label: "Estudiantes", href: "/students" },
                ]}
            />
            <StudentProfile isEditMode studentId={studentId} /> 

        </div>
    );
}