'use client';

import { EnrollmentsPageContent } from '@/components/features/enrollments';

export default function EnrollmentPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <EnrollmentsPageContent />
      </div>
    </div>
  );
}