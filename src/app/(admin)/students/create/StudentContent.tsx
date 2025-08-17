//src\app\(admin)\students\create\StudentContent.tsx
'use client';
import Breadcrumb from '@/components/common/Breadcrumb';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { StudentProvider, useStudentContext } from '@/context/StudentContext';
import { CyclesProvider, useCyclesContext } from '@/context/CyclesContext';
import { GradeProvider, useGradeContext } from '@/context/GradeContext';
import { SectionProvider, useSectionContext } from '@/context/SectionContext';
import { StudentForm } from '@/components/students/StudentForm';

export default function StudentCreatePage() {
    return (
        <CyclesProvider>
            <GradeProvider>
                <SectionProvider>
                    <StudentProvider>
                        <StudentFormContentInner />
                    </StudentProvider>
                </SectionProvider>
            </GradeProvider>
        </CyclesProvider>
    );
}

function StudentFormContentInner() {
    const { isLoadingUsers, usersError } = useStudentContext();
    const { cycles, isLoadingCycles } = useCyclesContext();
    const { grades, isLoadingGrades } = useGradeContext();
    const { sections, isLoadingSections } = useSectionContext();

    // Mostrar loading si cualquier context está cargando
    const isLoading = isLoadingUsers || isLoadingCycles || isLoadingGrades || isLoadingSections;

    if (isLoading) return <ProfileSkeleton type="full" />;

    if (usersError) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="text-red-500">Error: {usersError}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <Breadcrumb
                pageTitle="Crear Estudiante"
                icon={<i className="fas fa-user-graduate" />}
                items={[
                    { label: "Inicio", href: "/dashboard" },
                    { label: "Estudiantes", href: "/students" },
                    { label: "Crear Estudiante", href: "" }, // Agregado href vacío
                ]}
            />
            <StudentForm />
        </div>
    );
}