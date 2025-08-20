// src/components/grades/GradeStats.tsx
'use client';
import { useEffect } from 'react';
import { useGradeStatsContext } from '@/context/GradeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Users,
  TrendingUp,
  Activity,
  Baby,
  GraduationCap,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function GradeStats() {
  const { stats, loading, fetchStats } = useGradeStatsContext();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total de Grados',
      value: stats.totalGrades,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Grados registrados'
    },
    {
      title: 'Grados Activos',
      value: stats.activeGrades,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Disponibles para inscripción'
    },
    {
      title: 'Grados Inactivos',
      value: stats.inactiveGrades,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'No disponibles'
    },
    {
      title: 'Promedio Estudiantes',
      value: stats.averageStudentsPerGrade || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Por grado',
      isAverage: true
    }
  ];

  const levelColors = {
    'Kinder': { 
      icon: Baby, 
      color: 'text-pink-600', 
      bgColor: 'bg-pink-100', 
      badgeColor: 'bg-pink-100 text-pink-800',
      barColor: 'bg-pink-500'
    },
    'Primaria': { 
      icon: BookOpen, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100', 
      badgeColor: 'bg-blue-100 text-blue-800',
      barColor: 'bg-blue-500'
    },
    'Secundaria': { 
      icon: GraduationCap, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100', 
      badgeColor: 'bg-purple-100 text-purple-800',
      barColor: 'bg-purple-500'
    }
  };

  const maxCount = Math.max(...stats.gradesByLevel.map(l => l.count));

  return (
    <div className="space-y-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.isAverage && stat.value > 0 
                          ? stat.value.toFixed(1) 
                          : stat.value
                        }
                      </p>
                      {stat.isAverage && (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Distribución por niveles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por nivel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Distribución por Nivel</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.gradesByLevel.map((level) => {
              const levelConfig = levelColors[level.level as keyof typeof levelColors];
              const Icon = levelConfig.icon;
              const percentage = maxCount > 0 ? (level.count / maxCount) * 100 : 0;
              
              return (
                <div key={level.level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`h-4 w-4 ${levelConfig.color}`} />
                      <span className="text-sm font-medium text-gray-700">
                        {level.level}
                      </span>
                    </div>
                    <Badge variant="outline" className={levelConfig.badgeColor}>
                      {level.count} grados
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${levelConfig.barColor} transition-all duration-300`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Resumen de estado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Estado de Grados</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Activos vs Inactivos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Activos</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats.activeGrades}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-green-500 transition-all duration-300"
                  style={{ 
                    width: `${stats.totalGrades > 0 ? (stats.activeGrades / stats.totalGrades) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-700">Inactivos</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {stats.inactiveGrades}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-red-500 transition-all duration-300"
                  style={{ 
                    width: `${stats.totalGrades > 0 ? (stats.inactiveGrades / stats.totalGrades) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Porcentaje de activación */}
            <div className="pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Tasa de Activación</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalGrades > 0 
                    ? Math.round((stats.activeGrades / stats.totalGrades) * 100)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}