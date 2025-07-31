'use client';
import Breadcrumb from '@/components/common/Breadcrumb';
import {UserForm} from "@/components/users/UserForm";
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { StudentProvider, useStudentContext } from '@/context/StudentContext';
import { StudentForm } from '@/components/students/StudentForm';


export default function UserListContent() {

    return (
        <StudentProvider>
            <StudentFormContentInner />
        </StudentProvider>
    );
}

function StudentFormContentInner() {
    const { isLoadingUsers, usersError } = useStudentContext();
    if (isLoadingUsers) return <ProfileSkeleton type="full" />;


    return (
        <div className="container mx-auto px-4 py-6">
            <Breadcrumb
                pageTitle=""
                icon={<i className="fas fa-users" />}
                items={[
                    { label: "Inicio", href: "/dashboard" },
                    { label: "Usuarios", href: "/users" },
                ]}
            />
            <StudentForm />

        </div>
    );
}