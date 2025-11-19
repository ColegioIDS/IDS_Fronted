// EXAMPLE: How to use AttendanceTeacherPage
// 
// This is an example of how to integrate the new attendance system
// into your application pages

import React, { useState } from 'react';
import { AttendanceTeacherPage } from '@/components/features/attendance';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

/**
 * OPTION 1: As a main page component
 * 
 * Usage in a route like `/attendance/teacher`
 */
export function AttendanceTeacherPageContainer() {
  const handleSuccess = () => {
    // Refresh data, show success message, navigate, etc.
    console.log('Attendance registered successfully');
  };

  return <AttendanceTeacherPage onSuccess={handleSuccess} />;
}

/**
 * OPTION 2: Inside a modal/dialog
 * 
 * Usage when you want to show it in a modal on an existing page
 */
export function AttendanceTeacherModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">
        Register Attendance
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full max-w-2xl">
          <SheetHeader>
            <SheetTitle>Teacher Attendance Registration</SheetTitle>
            <SheetDescription>Register attendance for multiple courses at once</SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <AttendanceTeacherPage
              onClose={() => setIsOpen(false)}
              onSuccess={() => {
                setIsOpen(false);
                // Refresh parent component data
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * OPTION 3: Integrate into existing attendance page
 * 
 * Usage in a page with tabs or navigation
 */
export function AttendancePageWithTabs() {
  const [activeTab, setActiveTab] = useState<'by-schedule' | 'by-courses'>('by-schedule');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('by-schedule')}
          className={`px-4 py-2 ${activeTab === 'by-schedule' ? 'border-b-2 border-blue-600' : ''}`}
        >
          By Schedule
        </button>
        <button
          onClick={() => setActiveTab('by-courses')}
          className={`px-4 py-2 ${activeTab === 'by-courses' ? 'border-b-2 border-blue-600' : ''}`}
        >
          By Multiple Courses
        </button>
      </div>

      <div>
        {activeTab === 'by-schedule' && (
          <div>
            {/* Import and use AttendanceBySchedulesPage here */}
            {/* <AttendanceBySchedulesPage /> */}
          </div>
        )}
        {activeTab === 'by-courses' && <AttendanceTeacherPage />}
      </div>
    </div>
  );
}
