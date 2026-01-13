'use client';

import React from 'react';
import { Users, BookOpen, AlertCircle, TrendingUp } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardData';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: 'blue' | 'green' | 'orange' | 'red';
}

const StatCard = ({ icon, label, value, subtext, color }: StatCard) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {subtext && <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{subtext}</p>}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
};

export default function QuickStats() {
  const { stats, isLoading, error } = useDashboardStats();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="p-6 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <p className="text-red-700 dark:text-red-300">Error: {error}</p>
      </div>
    );
  }

  // No data state
  if (!stats) {
    return (
      <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-700 dark:text-yellow-300">No hay datos disponibles</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Total de Estudiantes',
      value: stats.totalStudents,
      subtext: 'En todos tus cursos',
      color: 'blue' as const,
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: 'Cursos Activos',
      value: stats.activeCoursesToday,
      subtext: 'Este periodo',
      color: 'green' as const,
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Asistencia Promedio',
      value: `${stats.averageAttendance}%`,
      subtext: 'Todos los cursos',
      color: 'orange' as const,
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      label: 'Tareas Pendientes',
      value: stats.pendingTasksToGrade,
      subtext: 'Por calificar',
      color: 'red' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
