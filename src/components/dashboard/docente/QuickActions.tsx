'use client';

import React from 'react';
import { BarChart3, ClipboardList, Users, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  color: string;
}

export default function QuickActions() {
  const router = useRouter();

  const actions: QuickAction[] = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Calificar',
      description: 'Registrar calificaciones',
      href: '/grades',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      label: 'Tareas',
      description: 'Crear/Editar tareas',
      href: '/assignments',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Asistencia',
      description: 'Registrar asistencia',
      href: '/attendance',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Horario',
      description: 'Ver horario',
      href: '/schedule',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
  ];

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
