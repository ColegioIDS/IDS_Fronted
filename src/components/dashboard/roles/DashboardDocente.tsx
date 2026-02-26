'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  useTeacherProfile,
  useTopStudents,
  useBirthdays,
  usePendingTasks,
  useAttendanceReport,
  useDashboardClasses,
  useTodayClasses,
  useScheduleGrid,
  useScheduleWeekly,
  useDailyAttendanceReport,
  useWeeklyAttendanceReport,
  useBimestralAttendanceReport,
} from '@/hooks/data/dashboard';
import DocenteHeader from '../docente/DocenteHeader';
import QuickStats from '../docente/QuickStats';
import ScheduleView from '../docente/ScheduleView';
import MyCoursesSection from '../docente/MyCoursesSection';
import PendingTasks from '../docente/PendingTasks';
import RecentActivity from '../docente/RecentActivity';
import StudentBirthdays from '../docente/ambos/StudentBirthdays';
import QuickActions from '../docente/QuickActions';

// Titular only components
import AttendanceReport from '../docente/titular/AttendanceReport';
import TopStudentsSection from '../docente/titular/TopStudentsSection';

export default function DashboardDocente() {
  const { user } = useAuth();
  const { profile } = useTeacherProfile();
  const { topStudents, isLoading: isLoadingTopStudents } = useTopStudents();
  const { birthdays, isLoading: isLoadingBirthdays } = useBirthdays();

  // Check if teacher is titular
  const isTitular = profile?.profile?.isTitular || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      {/* Header */}
      <DocenteHeader userName={user?.fullName || 'Docente'} />

      {/* Quick Stats */}
      <QuickStats />

      {/* Schedule View */}
      <div className="grid grid-cols-1 mt-8">
        <ScheduleView />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <MyCoursesSection />

          {/* Attendance Reports - Only for titular teachers */}
          {isTitular && <AttendanceReport />}

          {/* Pending Tasks */}
          <PendingTasks />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Top Students (only for titular teachers) or Recent Activity */}
          {isTitular && topStudents && !isLoadingTopStudents ? (
            <TopStudentsSection data={topStudents} />
          ) : (
            <RecentActivity />
          )}

          {/* Student Birthdays */}
          {birthdays && !isLoadingBirthdays && (
            <StudentBirthdays data={birthdays} />
          )}
        </div>
      </div>
    </div>
  );
}
