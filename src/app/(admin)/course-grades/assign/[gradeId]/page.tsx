// app/(admin)/course-grades/assign/[gradeId]/page.tsx
'use client';

import { CourseAssignmentTable } from '@/components/course-grades/CourseAssignmentTable';
import { useParams, useRouter } from 'next/navigation';

export default function AssignCoursesPage() {
  const params = useParams();
  const router = useRouter();
  const gradeId = parseInt(params.gradeId as string);

  return (
    <div className="container mx-auto py-6">
      <CourseAssignmentTable
        gradeId={gradeId}
        onSave={() => router.push('/course-grades')}
      />
    </div>
  );
}