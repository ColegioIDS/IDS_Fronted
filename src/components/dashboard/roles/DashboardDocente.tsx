'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import DocenteHeader from '../docente/DocenteHeader';
import QuickStats from '../docente/QuickStats';
import MyCoursesSection from '../docente/MyCoursesSection';
import AttendanceChart from '../docente/AttendanceChart';
import GradesChart from '../docente/GradesChart';
import PendingTasks from '../docente/PendingTasks';
import RecentActivity from '../docente/RecentActivity';
import QuickActions from '../docente/QuickActions';

export default function DashboardDocente() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('2024-1');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      {/* Header */}
      <DocenteHeader userName={user?.fullName || 'Docente'} period={selectedPeriod} />

      {/* Quick Stats */}
      <QuickStats />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Courses */}
          <MyCoursesSection />

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AttendanceChart />
            <GradesChart />
          </div>

          {/* Pending Tasks */}
          <PendingTasks />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />

          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
