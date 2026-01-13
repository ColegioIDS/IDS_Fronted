'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle, BookOpen } from 'lucide-react';

interface Task {
  id: string;
  type: 'grade' | 'feedback' | 'review';
  title: string;
  course: string;
  count: number;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
}

const TaskIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'grade':
      return <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    case 'feedback':
      return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
    case 'review':
      return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    default:
      return <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
  }
};

export default function PendingTasks() {
  // Datos placeholder
  const tasks: Task[] = [
    {
      id: '1',
      type: 'grade',
      title: 'Calificar Pruebas',
      course: 'Matemáticas A',
      count: 8,
      dueDate: '15 de Enero',
      priority: 'high',
    },
    {
      id: '2',
      type: 'feedback',
      title: 'Agregar Comentarios',
      course: 'Ciencias Naturales B',
      count: 12,
      dueDate: '17 de Enero',
      priority: 'medium',
    },
    {
      id: '3',
      type: 'review',
      title: 'Revisar Tareas',
      course: 'Español A',
      count: 5,
      dueDate: '16 de Enero',
      priority: 'high',
    },
  ];

  const priorityColors = {
    high: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    medium: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    low: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  };

  const priorityBadgeColors = {
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
    medium: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-300',
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Tareas Pendientes
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Acciones que requieren tu atención
        </p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border ${priorityColors[task.priority]} transition-all hover:shadow-md cursor-pointer`}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                <TaskIcon type={task.type} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {task.title}
                  </h4>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${priorityBadgeColors[task.priority]}`}>
                    {task.priority === 'high' ? 'Urgente' : task.priority === 'medium' ? 'Normal' : 'Baja'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                  {task.course} • <span className="font-semibold">{task.count}</span> pendientes
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-500">
                  Vence: {task.dueDate}
                </p>
              </div>

              <button className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                Ir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
