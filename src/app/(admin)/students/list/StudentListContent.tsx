//src\app\(admin)\students\list\StudentListContent.tsx
'use client';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';
import { StudentProvider, useStudentContext } from '@/context/StudentContext';
import { StudentList } from '@/components/students/StudentList';
import { CyclesProvider, useCyclesContext } from '@/context/CyclesContext';
import { GradeProvider, useGradeContext } from '@/context/GradeContext';
import { SectionProvider, useSectionContext } from '@/context/SectionContext';


export default function UserListContent() {

    return (
       <CyclesProvider>
                  <GradeProvider>
                      <SectionProvider>
                          <StudentProvider>
                              <StudentListContentInner />
                          </StudentProvider>
                      </SectionProvider>
                  </GradeProvider>
              </CyclesProvider>
    );
}

function StudentListContentInner() {
    const { isLoadingUsers, usersError } = useStudentContext();
    if (isLoadingUsers) return <ProfileSkeleton type="full" />;


    return (
        <div className="container mx-auto px-4 py-6">
            <Breadcrumb
                pageTitle="Lista de Estudiantes"
                icon={<i className="fas fa-users" />}
                items={[
                    { label: "Inicio", href: "/dashboard" },
                    { label: "Usuarios", href: "/users" },
                ]}
            />
            <StudentList />

        </div>
    );
}