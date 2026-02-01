/**
 * 📜 Componente Changelog
 * Muestra el historial de versiones y cambios
 */

'use client';

import React, { useState } from 'react';
import { CHANGELOG, getCurrentVersion } from '@/constants/changelog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, CheckCircle2, Bug, Zap, Calendar, Tag, AlertCircle } from 'lucide-react';

export function ChangelogViewer() {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(
    CHANGELOG[0]?.version
  );

  const currentVersion = getCurrentVersion();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'beta':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'alpha':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'stable':
        return 'Estable';
      case 'beta':
        return 'Beta';
      case 'alpha':
        return 'Alpha';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Version Card */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950/40 dark:via-blue-950/40 dark:to-purple-950/40 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-transparent dark:from-indigo-400/10 rounded-full -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/20 to-transparent dark:from-blue-400/10 rounded-full -ml-48 -mb-48" />

        <CardHeader className="relative pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                  <Tag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Versión Actual</p>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                    v{currentVersion.version}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-12">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">{currentVersion.date}</span>
              </div>
            </div>
            <Badge className={`${getStatusColor(currentVersion.status)} text-sm font-bold px-4 py-2 rounded-lg`}>
              {getStatusLabel(currentVersion.status).toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-5">
          {currentVersion.features.length > 0 && (
            <div className="rounded-xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-5 border border-emerald-200/50 dark:border-emerald-800/30 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-emerald-900 dark:text-emerald-100 text-lg">
                  Nuevas Funcionalidades
                </h4>
                <span className="ml-auto text-xs font-semibold px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
                  {currentVersion.features.length}
                </span>
              </div>
              <ul className="space-y-2">
                {currentVersion.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700 dark:text-gray-300 text-sm">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentVersion.fixes.length > 0 && (
            <div className="rounded-xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-5 border border-blue-200/50 dark:border-blue-800/30 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Bug className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-bold text-blue-900 dark:text-blue-100 text-lg">
                  Correcciones
                </h4>
                <span className="ml-auto text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  {currentVersion.fixes.length}
                </span>
              </div>
              <ul className="space-y-2">
                {currentVersion.fixes.map((fix, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700 dark:text-gray-300 text-sm">
                    <span className="text-blue-500 font-bold">◆</span>
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {currentVersion.improvements.length > 0 && (
            <div className="rounded-xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-5 border border-amber-200/50 dark:border-amber-800/30 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="font-bold text-amber-900 dark:text-amber-100 text-lg">
                  Mejoras
                </h4>
                <span className="ml-auto text-xs font-semibold px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                  {currentVersion.improvements.length}
                </span>
              </div>
              <ul className="space-y-2">
                {currentVersion.improvements.map((improvement, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700 dark:text-gray-300 text-sm">
                    <span className="text-amber-500 font-bold">⚡</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </div>

      {/* Version History Timeline */}
      {CHANGELOG.length > 1 && (
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Historial de Versiones</h3>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-blue-500 to-purple-500 dark:from-indigo-400 dark:via-blue-400 dark:to-purple-400 opacity-30" />

            <div className="space-y-5">
              {CHANGELOG.slice(1).map((entry, idx) => (
                <div key={entry.version} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-4 w-14 h-14 flex items-center justify-center">
                    <div className="w-5 h-5 bg-white dark:bg-gray-900 border-4 border-indigo-500 dark:border-indigo-400 rounded-full shadow-lg" />
                  </div>

                  {/* Version card */}
                  <div
                    className="ml-20 group cursor-pointer"
                    onClick={() =>
                      setExpandedVersion(
                        expandedVersion === entry.version ? null : entry.version
                      )
                    }
                  >
                    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                v{entry.version}
                              </h4>
                              <Badge className={`${getStatusColor(entry.status)} text-xs`}>
                                {getStatusLabel(entry.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {entry.date}
                            </p>
                          </div>

                          {/* Quick summary badges */}
                          <div className="flex gap-2 flex-wrap">
                            {entry.features.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                                  {entry.features.length}
                                </span>
                              </div>
                            )}
                            {entry.fixes.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Bug className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                  {entry.fixes.length}
                                </span>
                              </div>
                            )}
                            {entry.improvements.length > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                                  {entry.improvements.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expand/collapse chevron */}
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-300 ml-4 flex-shrink-0 ${
                            expandedVersion === entry.version ? 'rotate-180' : ''
                          }`}
                        />
                      </div>

                      {/* Expanded content */}
                      {expandedVersion === entry.version && (
                        <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700 space-y-4">
                          {entry.features.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <h5 className="font-semibold text-emerald-900 dark:text-emerald-100">
                                  Nuevas Funcionalidades
                                </h5>
                              </div>
                              <ul className="space-y-2 ml-6">
                                {entry.features.map((feature, fidx) => (
                                  <li key={fidx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                    <span className="text-emerald-500 font-bold">✓</span>
                                    <span>{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {entry.fixes.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Bug className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <h5 className="font-semibold text-blue-900 dark:text-blue-100">
                                  Correcciones
                                </h5>
                              </div>
                              <ul className="space-y-2 ml-6">
                                {entry.fixes.map((fix, fidx) => (
                                  <li key={fidx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                    <span className="text-blue-500 font-bold">◆</span>
                                    <span>{fix}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {entry.improvements.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <h5 className="font-semibold text-amber-900 dark:text-amber-100">
                                  Mejoras
                                </h5>
                              </div>
                              <ul className="space-y-2 ml-6">
                                {entry.improvements.map((improvement, fidx) => (
                                  <li key={fidx} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                    <span className="text-amber-500 font-bold">⚡</span>
                                    <span>{improvement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {entry.breakingChanges && entry.breakingChanges.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                <h5 className="font-semibold text-rose-900 dark:text-rose-100">
                                  Cambios Incompatibles
                                </h5>
                              </div>
                              <ul className="space-y-2 ml-6">
                                {entry.breakingChanges.map((change, cidx) => (
                                  <li key={cidx} className="text-sm text-rose-700 dark:text-rose-300 flex gap-2">
                                    <span className="text-rose-500 font-bold">⚠</span>
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800/50 p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-0.5">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong className="font-semibold">Consejo:</strong> Haz clic en cualquier versión para expandir y ver los detalles completos de esa actualización. Las insignias de colores muestran el número de cambios por categoría.
          </p>
        </div>
      </div>
    </div>
  );
}
