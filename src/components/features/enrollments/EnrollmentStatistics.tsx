'use client';

import type { EnrollmentStatistics as IEnrollmentStatistics } from '@/types/enrollments.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Award, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface EnrollmentStatisticsProps {
  statistics: IEnrollmentStatistics | null;
  loading?: boolean;
}

const COLORS = {
  ACTIVE: '#10b981',
  SUSPENDED: '#f59e0b',
  INACTIVE: '#64748b',
  TRANSFERRED: '#a855f7',
};

const statusLabels = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspendido',
  INACTIVE: 'Inactivo',
  TRANSFERRED: 'Transferido',
};

export const EnrollmentStatistics = ({
  statistics,
  loading = false,
}: EnrollmentStatisticsProps) => {
  const iconColorClasses: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber: 'text-amber-600 dark:text-amber-400',
    slate: 'text-slate-600 dark:text-slate-400',
  };
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  // Calcular utilización si no viene del backend
  let utilizationPercentage = statistics.utilizationPercentage || 0;
  
  if (!statistics.utilizationPercentage && statistics.bySection && statistics.bySection.length > 0) {
    const totalCapacity = statistics.bySection.reduce((sum, s) => sum + (s.capacity || 0), 0);
    utilizationPercentage = totalCapacity > 0 ? (statistics.total / totalCapacity) * 100 : 0;
  }

  // Preparar datos para estados (filtrando solo los que tienen valor)
  const statusData = Object.entries(statistics.byStatus)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      key: key as keyof typeof COLORS,
      name: statusLabels[key as keyof typeof statusLabels] || key,
      value,
    }));

  // Calcular porcentaje de cada estado
  const getStatusPercentage = (value: number) => {
    return statistics.total > 0 ? ((value / statistics.total) * 100).toFixed(1) : '0';
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
    color = 'blue',
  }: {
    icon: any;
    label: string;
    value: string | number;
    subtitle?: string;
    color?: 'blue' | 'emerald' | 'amber' | 'slate';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </CardTitle>
        <Icon className={cn('h-5 w-5', iconColorClasses[color] || iconColorClasses.slate)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Tarjetas resumen principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total de Matrículas"
          value={statistics.total}
          subtitle={`${utilizationPercentage.toFixed(1)}% utilización`}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Activos"
          value={statistics.byStatus.ACTIVE || 0}
          subtitle={`${getStatusPercentage(statistics.byStatus.ACTIVE || 0)}% del total`}
          color="emerald"
        />
        <StatCard
          icon={Award}
          label="Suspendidos"
          value={statistics.byStatus.SUSPENDED || 0}
          subtitle={`${getStatusPercentage(statistics.byStatus.SUSPENDED || 0)}% del total`}
          color="amber"
        />
        <StatCard
          icon={AlertCircle}
          label="Inactivos"
          value={statistics.byStatus.INACTIVE || 0}
          subtitle={`${getStatusPercentage(statistics.byStatus.INACTIVE || 0)}% del total`}
          color="slate"
        />
      </div>

      {/* Barra de utilización general */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Utilización General
          </CardTitle>
          <CardDescription>Porcentaje de ocupación de toda la institución</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Capacidad utilizada
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {utilizationPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={Math.min(utilizationPercentage, 100)} 
              className="h-3"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {statistics.total} matrículas registradas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Distribución por estado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribución por Estado</CardTitle>
          <CardDescription>Desglose detallado de matrículas</CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <div className="space-y-4">
              {statusData.map((item) => {
                const percentage = getStatusPercentage(item.value);
                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {item.name}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[item.key] || '#8884d8',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-20 flex items-center justify-center text-slate-500">
              Sin datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matrículas por grado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Matrículas por Grado
          </CardTitle>
          <CardDescription>Distribución de estudiantes por nivel académico</CardDescription>
        </CardHeader>
        <CardContent>
          {statistics.byGrade && statistics.byGrade.length > 0 ? (
            <div className="space-y-4">
              {statistics.byGrade.map((grade) => {
                const maxCount = Math.max(...statistics.byGrade.map((g) => g.count));
                const percentage = (grade.count / maxCount) * 100;
                const gradePercentage = ((grade.count / statistics.total) * 100).toFixed(1);
                
                return (
                  <div key={grade.gradeId} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {grade.gradeName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {grade.count} estudiantes ({gradePercentage}% del total)
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {grade.count}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-slate-500">
              Sin datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ocupación de secciones */}
      {statistics.bySection && statistics.bySection.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Ocupación por Sección
            </CardTitle>
            <CardDescription>Capacidad actual vs máxima por sección</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.bySection.map((section) => {
                const percentage = (section.count / section.capacity) * 100;
                const statusColor = percentage > 90 
                  ? 'bg-red-500' 
                  : percentage > 70 
                    ? 'bg-yellow-500' 
                    : 'bg-emerald-500';

                return (
                  <div key={section.sectionId} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          Sección {section.sectionName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {section.count} de {section.capacity} estudiantes
                        </p>
                      </div>
                      <span className={cn(
                        'text-sm font-semibold px-2 py-1 rounded',
                        percentage > 90 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200' :
                        percentage > 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200'
                      )}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', statusColor)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ciclos escolares */}
      {statistics.byCycle && Object.keys(statistics.byCycle).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Matrículas por Ciclo Escolar</CardTitle>
            <CardDescription>Distribución entre ciclos activos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(statistics.byCycle).map(([cycle, count]) => (
                <div 
                  key={cycle} 
                  className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    {cycle}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {count}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {((count / statistics.total) * 100).toFixed(1)}% del total
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
