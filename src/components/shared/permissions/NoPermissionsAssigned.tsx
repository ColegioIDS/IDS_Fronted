// src/components/shared/permissions/NoPermissionsAssigned.tsx

'use client';

import React from 'react';
import { AlertCircle, Lock, ArrowRight, Clock, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface NoPermissionsAssignedProps {
  userName?: string;
}

export function NoPermissionsAssigned({
  userName
}: NoPermissionsAssignedProps) {
  const { user } = useAuth();
  const displayName = userName || user?.fullName || "Usuario";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Main card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow">
          {/* Icon section */}
          <div className="flex justify-center mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
              <Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          {/* Title section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Acceso Restringido
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Hola <span className="font-semibold text-blue-600 dark:text-blue-400">{displayName}</span>, necesitas permisos
            </p>
          </div>

          {/* Alert box */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-5 mb-8">
            <div className="flex gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-semibold text-amber-900 dark:text-amber-200 mb-2">
                  Sin Permisos Asignados
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-300/80 leading-relaxed">
                  Tu cuenta no tiene permisos asignados para acceder a ningún módulo del sistema. 
                  El administrador necesita configurar tus permisos para que puedas continuar.
                </p>
              </div>
            </div>
          </div>

          {/* Steps section */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Próximos pasos
            </p>
            <div className="space-y-3">
              <div className="flex gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-200 dark:bg-blue-800/50 border border-blue-300 dark:border-blue-700">
                    <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">1</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Contacta al administrador</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Solicita que te asigne los permisos necesarios para tu rol</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-200 dark:border-indigo-800/30 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-200 dark:bg-indigo-800/50 border border-indigo-300 dark:border-indigo-700">
                    <span className="text-indigo-700 dark:text-indigo-300 font-bold text-sm">2</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Espera confirmación</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">El administrador revisará y asignará tus permisos</p>
                </div>
              </div>

              <div className="flex gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800/30 hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-emerald-200 dark:bg-emerald-800/50 border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Recarga la página</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Una vez asignados, actualiza para ver los cambios</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info boxes */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-800/30 rounded-lg hover:border-cyan-300 dark:hover:border-cyan-700/50 transition-colors">
              <Shield className="h-5 w-5 text-cyan-600 dark:text-cyan-400 mb-2" />
              <p className="text-xs text-cyan-900 dark:text-cyan-200 font-medium">Seguridad</p>
              <p className="text-xs text-cyan-700 dark:text-cyan-300/70 mt-1">Sistema protegido</p>
            </div>
            <div className="p-4 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800/30 rounded-lg hover:border-violet-300 dark:hover:border-violet-700/50 transition-colors">
              <Clock className="h-5 w-5 text-violet-600 dark:text-violet-400 mb-2" />
              <p className="text-xs text-violet-900 dark:text-violet-200 font-medium">Rápido</p>
              <p className="text-xs text-violet-700 dark:text-violet-300/70 mt-1">Se activa instantáneamente</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Recargar Página</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              asChild
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Link href="/" className="flex items-center justify-center gap-2">
                <span>Volver al Inicio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            Si crees que esto es un error, contacta con el equipo de soporte técnico.
          </p>
        </div>
      </div>
    </div>
  );
}
