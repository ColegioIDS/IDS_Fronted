'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DocenteHeaderProps {
  userName: string;
  period?: string;
}

export default function DocenteHeader({ userName, period }: DocenteHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4">
        {/* Main Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              {getGreeting()}, {userName}!
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Bienvenido a tu panel de docente
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {period && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">{period}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {new Date().toLocaleDateString('es-GT', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
