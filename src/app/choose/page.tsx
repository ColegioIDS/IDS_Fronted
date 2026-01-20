'use client';

import { useRouter } from 'next/navigation';
import { Shield, Users, Zap, Lock, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Particle {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  size: number;
}

export default function ChoosePage() {
  const router = useRouter();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  // Generar partículas solo en el cliente después del montaje
  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        size: 2 + Math.random() * 4,
      }))
    );
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo con elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/20 backdrop-blur-sm"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-up {
          animation: slideInUp 0.6s ease-out;
        }

        .animate-slide-left {
          animation: slideInLeft 0.6s ease-out 0.2s both;
        }

        .animate-slide-right {
          animation: slideInRight 0.6s ease-out 0.2s both;
        }
      `}</style>

      {/* Contenedor principal */}
      <div className="relative z-10 max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Bienvenido
          </h1>
          <p className="text-xl text-blue-100 mb-2">
            Selecciona el acceso que necesitas
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
        </div>

        {/* Grid de opciones */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Card - Administración */}
          <div
            onClick={() => router.push('/signin')}
            className="group cursor-pointer animate-slide-left"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/30 hover:border-white/60 transition-all duration-300 h-full flex flex-col justify-between hover:shadow-2xl hover:shadow-blue-500/30 transform hover:scale-105 hover:bg-white/15 relative overflow-hidden group">
              {/* Efecto de brillo interno */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Icono */}
              <div className="mb-8 flex justify-center relative z-10">
                <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300 transform group-hover:scale-110 relative">
                  <div className="absolute inset-0 bg-blue-300 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <Shield className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
                </div>
              </div>

              {/* Contenido */}
              <div className="text-center flex-grow relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Administración
                </h2>
                <p className="text-blue-100 text-lg leading-relaxed mb-6">
                  Acceso para administradores y personal educativo
                </p>

                {/* Características */}
                <div className="space-y-3 mt-6 text-left bg-white/5 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-blue-100">
                    <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Gestión rápida de calificaciones</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <Lock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Acceso seguro y protegido</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm">Control en tiempo real</span>
                  </div>
                </div>
              </div>

              {/* Botón */}
              <div className="mt-8 relative z-10">
                <button className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:shadow-lg text-lg shadow-blue-500/50">
                  Acceder
                </button>
              </div>

              {/* Decoración */}
              <div className="mt-6 flex gap-2 justify-center relative z-10">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>

          {/* Card - Portal de Padres (Placeholder) */}
          <div className="group cursor-not-allowed opacity-60 hover:opacity-75 transition-opacity duration-300 animate-slide-right">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 hover:border-white/30 transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden">
              {/* Efecto de brillo interno */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/2 via-transparent to-white/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Badge Próximamente */}
              <div className="absolute top-4 right-4 z-20">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/30 backdrop-blur-sm border border-purple-400/50 rounded-full text-purple-200 text-xs font-semibold">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                  Próximamente
                </span>
              </div>

              {/* Icono */}
              <div className="mb-8 flex justify-center relative z-10">
                <div className="p-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-lg opacity-60 group-hover:opacity-80 transition-all relative">
                  <div className="absolute inset-0 bg-purple-300 rounded-2xl blur-lg opacity-30"></div>
                  <Users className="w-16 h-16 text-white relative z-10" strokeWidth={1.5} />
                </div>
              </div>

              {/* Contenido */}
              <div className="text-center flex-grow relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white/70 mb-3">
                  Portal de Padres
                </h2>
                <p className="text-blue-100/60 text-lg leading-relaxed mb-6">
                  Acceso dedicado para padres y tutores
                </p>

                {/* Características */}
                <div className="space-y-3 mt-6 text-left bg-white/3 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3 text-blue-100/60">
                    <Zap className="w-4 h-4 text-purple-400/50 flex-shrink-0" />
                    <span className="text-sm">Seguimiento del desempeño</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100/60">
                    <Lock className="w-4 h-4 text-purple-400/50 flex-shrink-0" />
                    <span className="text-sm">Privacidad garantizada</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100/60">
                    <Clock className="w-4 h-4 text-purple-400/50 flex-shrink-0" />
                    <span className="text-sm">Notificaciones en tiempo real</span>
                  </div>
                </div>
              </div>

              {/* Badge */}
              <div className="mt-8 relative z-10">
                <button disabled className="w-full bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-white/50 font-bold py-3 px-6 rounded-xl cursor-not-allowed text-lg backdrop-blur-sm border border-white/10">
                  Próximamente
                </button>
              </div>

              {/* Decoración */}
              <div className="mt-6 flex gap-2 justify-center relative z-10">
                <div className="w-2 h-2 bg-purple-400/40 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-400/30 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-purple-400/20 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-200/60 text-sm">
          <p>Sistema de Gestión Académica</p>
        </div>
      </div>
    </div>
  );
}
