'use client';

import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export default function DashboardAdministrador() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Dashboard Administrativo
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            En construcción - Próximamente disponible
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-800">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
            <span className="font-semibold text-purple-700 dark:text-purple-300">Estamos trabajando en esto</span>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase">
                Próximamente
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">KPIs Generales</p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase">
                Próximamente
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Reportes Institucionales</p>
            </div>
            <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase">
                Próximamente
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Control del Sistema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
