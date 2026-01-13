'use client';

import React from 'react';
import { CheckCircle, Clock, AlertCircle, User } from 'lucide-react';

interface Activity {
  id: string;
  type: 'success' | 'pending' | 'warning';
  user: string;
  action: string;
  course: string;
  timestamp: string;
}

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
    default:
      return <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
  }
};

export default function RecentActivity() {
  // Datos placeholder
  const activities: Activity[] = [
    {
      id: '1',
      type: 'success',
      user: 'Juan Pérez',
      action: 'Entregó tarea',
      course: 'Matemáticas A',
      timestamp: 'Hace 2 horas',
    },
    {
      id: '2',
      type: 'pending',
      user: 'María García',
      action: 'Por entregar tarea',
      course: 'Ciencias B',
      timestamp: 'Hace 1 día',
    },
    {
      id: '3',
      type: 'warning',
      user: 'Carlos López',
      action: 'Baja calificación',
      course: 'Español A',
      timestamp: 'Hace 3 días',
    },
    {
      id: '4',
      type: 'success',
      user: 'Ana Martínez',
      action: 'Mejoró promedio',
      course: 'Historia C',
      timestamp: 'Hace 5 días',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Actividad Reciente
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Últimos eventos en tus cursos
        </p>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="mt-1">
              <ActivityIcon type={activity.type} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {activity.user}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                {activity.action}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                {activity.course} • {activity.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        Ver todas las actividades
      </button>
    </div>
  );
}
