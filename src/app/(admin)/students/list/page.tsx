// src/app/(admin)/students/list/page.tsx
"use client";

import { useAuth } from '@/context/AuthContext';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';
import { StudentsPageContent } from '@/components/features/students';

export default function StudentsListPage() {
  const { hasPermission } = useAuth();

  const canRead = hasPermission(MODULES_PERMISSIONS.STUDENT.READ.module, MODULES_PERMISSIONS.STUDENT.READ.action);
  const canReadOne = hasPermission(MODULES_PERMISSIONS.STUDENT.READ_ONE.module, MODULES_PERMISSIONS.STUDENT.READ_ONE.action);
  const canCreate = hasPermission(MODULES_PERMISSIONS.STUDENT.CREATE.module, MODULES_PERMISSIONS.STUDENT.CREATE.action);
  const canUpdate = hasPermission(MODULES_PERMISSIONS.STUDENT.UPDATE.module, MODULES_PERMISSIONS.STUDENT.UPDATE.action);
  const canDelete = hasPermission(MODULES_PERMISSIONS.STUDENT.DELETE.module, MODULES_PERMISSIONS.STUDENT.DELETE.action);
  const canUploadPicture = hasPermission(MODULES_PERMISSIONS.STUDENT.UPLOAD_PICTURE.module, MODULES_PERMISSIONS.STUDENT.UPLOAD_PICTURE.action);
  const canDeletePicture = hasPermission(MODULES_PERMISSIONS.STUDENT.DELETE_PICTURE.module, MODULES_PERMISSIONS.STUDENT.DELETE_PICTURE.action);
  const canGenerateReport = hasPermission(MODULES_PERMISSIONS.STUDENT.GENERATE_REPORT.module, MODULES_PERMISSIONS.STUDENT.GENERATE_REPORT.action);

  return (
    <ProtectedPage module="student" action="read">
      <StudentsPageContent 
        canRead={canRead}
        canReadOne={canReadOne}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canUploadPicture={canUploadPicture}
        canDeletePicture={canDeletePicture}
        canGenerateReport={canGenerateReport}
      />
    </ProtectedPage>
  );
}