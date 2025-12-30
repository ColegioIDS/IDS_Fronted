'use client';

import type { Metadata } from "next";
import React, { useEffect, useState } from "react";
import { Sparkles, Zap, TrendingUp, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white dark:bg-slate-900 p-6">
      {/* Animated background elements - subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-slate-200 dark:bg-slate-800/30 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000" />
      </div>

      {/* Main content */}
      <div className={`relative z-10 text-center max-w-3xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {/* Icon section */}
        <div className="mb-8 flex justify-center items-center gap-3">
          <div className="relative">
            <div className="relative bg-blue-600 p-4 rounded-full shadow-lg">
              <BarChart3 className="w-8 h-8 text-white animate-bounce" />
            </div>
          </div>
          <div className="h-1 w-12 bg-blue-600 rounded-full" />
          <div className="relative">
            <div className="relative bg-blue-600 p-4 rounded-full shadow-lg">
              <TrendingUp className="w-8 h-8 text-white animate-bounce animation-delay-1000" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight">
          Próximamente
        </h1>

        {/* Subtitle */}
        <div className="mb-8 space-y-4">
          <p className="text-xl sm:text-2xl text-slate-700 dark:text-slate-300 font-semibold">
            Estamos preparando algo increíble
          </p>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mx-auto max-w-2xl">
            Nuestro nuevo dashboard con análisis avanzados, reportes en tiempo real y herramientas poderosas está en construcción. Será revolucionario.
          </p>
        </div>

        {/* Stats preview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{transitionDelay: '100ms'}}>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Análisis Avanzados</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">15+</p>
          </div>

          <div className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{transitionDelay: '200ms'}}>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Reportes en Tiempo Real</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">24/7</p>
          </div>

          <div className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{transitionDelay: '300ms'}}>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg mx-auto mb-3">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Herramientas Poderosas</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">50+</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`mb-12 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
            Progreso de desarrollo
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{width: '75%'}} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">75% completado</p>
        </div>

        {/* Notification badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 border border-blue-300 dark:border-blue-800 mb-8 transition-all duration-1000 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{transitionDelay: '400ms'}}>
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">En construcción</span>
        </div>

        {/* CTA Button */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{transitionDelay: '500ms'}}>
          <button className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white text-lg overflow-hidden rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 bg-blue-600 hover:bg-blue-700 active:bg-blue-800">
            {/* Content */}
            <span className="relative flex items-center gap-2">
              Notificarme cuando esté listo
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </span>
          </button>

          <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            Esperamos poder compartirlo muy pronto
          </p>
        </div>
      </div>

      {/* Floating elements */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-2000 {
          animation-delay: 2000ms;
        }
        .animation-delay-4000 {
          animation-delay: 4000ms;
        }
      `}</style>
    </div>
  );
}
