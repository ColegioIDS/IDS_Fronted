'use client';

import React, { useMemo } from 'react';
import { ClipboardList, Users, Calendar, BookOpen, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  color: string;
}

export default function QuickActions() {
  const router = useRouter();
  const { permissions } = useAuth();

  // Determinar la ruta de asistencia basada en permisos
  const attendanceRoute = useMemo(() => {
    const hasAttendancePermission = permissions.some(p => p.module === 'attendance' && p.action === 'read');
    const hasAttendancePlantPermission = permissions.some(p => p.module === 'attendance-plant' && p.action === 'read');
    
    if (hasAttendancePermission) {
      return '/attendance';
    }
    if (hasAttendancePlantPermission) {
      return '/attendance-plant';
    }
    return null;
  }, [permissions]);

  // Verificar permisos para ERICA Topics
  const hasEricaTopicsPermission = useMemo(() => {
    return permissions.some(p => p.module === 'erica-topic' && (p.action === 'read' || p.action === 'create'));
  }, [permissions]);

  // Verificar permisos para ERICA Evaluations
  const hasEricaEvaluationPermission = useMemo(() => {
    return permissions.some(p => p.module === 'erica-evaluation' && p.action === 'evaluate');
  }, [permissions]);

  // Construir acciones dinámicamente
  const actions: QuickAction[] = useMemo(() => {
    const baseActions: QuickAction[] = [
      {
        icon: <ClipboardList className="w-5 h-5" />,
        label: 'Tareas',
        description: 'Crear/Editar tareas',
        href: '/assignments',
        color: 'bg-green-500 hover:bg-green-600',
      },
    ];

    // Agregar asistencia si tiene permiso
    if (attendanceRoute) {
      baseActions.push({
        icon: <Users className="w-5 h-5" />,
        label: 'Asistencia',
        description: 'Registrar asistencia',
        href: attendanceRoute,
        color: 'bg-orange-500 hover:bg-orange-600',
      });
    }

    // Agregar ERICA Topics si tiene permiso
    if (hasEricaTopicsPermission) {
      baseActions.push({
        icon: <BookOpen className="w-5 h-5" />,
        label: 'Temas ERICA',
        description: 'Gestionar temas de clase',
        href: '/erica-topics',
        color: 'bg-pink-500 hover:bg-pink-600',
      });
    }

    // Agregar ERICA Evaluations si tiene permiso
    if (hasEricaEvaluationPermission) {
      baseActions.push({
        icon: <Star className="w-5 h-5" />,
        label: 'Evaluaciones ERICA',
        description: 'Realizar evaluaciones formativas',
        href: '/erica-evaluations',
        color: 'bg-cyan-500 hover:bg-cyan-600',
      });
    }

    // Agregar Horario siempre
    baseActions.push({
      icon: <Calendar className="w-5 h-5" />,
      label: 'Horario',
      description: 'Ver horario',
      href: '/schedules/view',
      color: 'bg-purple-500 hover:bg-purple-600',
    });

    return baseActions;
  }, [attendanceRoute, hasEricaTopicsPermission, hasEricaEvaluationPermission]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
        Acciones Rápidas
      </h3>

      <div className="space-y-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => router.push(action.href)}
            className={`w-full p-4 rounded-lg ${action.color} text-white transition-all hover:shadow-lg active:scale-95 flex items-center gap-3`}
          >
            {action.icon}
            <div className="text-left">
              <p className="font-semibold text-sm">{action.label}</p>
              <p className="text-xs opacity-90">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
