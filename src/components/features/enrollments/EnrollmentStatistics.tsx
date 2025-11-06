'use client';

import type { EnrollmentStatistics as IEnrollmentStatistics } from '@/types/enrollments.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnrollmentStatisticsProps {
  statistics: IEnrollmentStatistics | null;
  loading?: boolean;
}

const COLORS = {
  ACTIVE: '#10b981',
  INACTIVE: '#64748b',
  GRADUATED: '#3b82f6',
  TRANSFERRED: '#a855f7',
};

const statusLabels = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  GRADUATED: 'Graduado',
  TRANSFERRED: 'Transferido',
};

export const EnrollmentStatistics = ({
  statistics,
  loading = false,
}: EnrollmentStatisticsProps) => {
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

  // Preparar datos para gráfico de estados
  const statusData = Object.entries(statistics.byStatus).map(([key, value]) => ({
    key: key as keyof typeof COLORS,
    name: statusLabels[key as keyof typeof statusLabels] || key,
    value,
  }));

  // Preparar datos para grado - manejar si es array u objeto
  const gradeData = Array.isArray(statistics.byGrade) 
    ? statistics.byGrade.map((g: any) => ({
        name: g.gradeName.split(' ')[0],
        count: g.count,
      }))
    : [];

  const StatCard = ({
    icon: Icon,
    label,
    value,
    subtitle,
  }: {
    icon: any;
    label: string;
    value: string | number;
    subtitle?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </CardTitle>
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total de Matrículas"
          value={statistics.total}
          subtitle="Todos los ciclos activos"
        />
        <StatCard
          icon={TrendingUp}
          label="Activos"
          value={statistics.byStatus.ACTIVE || 0}
          subtitle={`${((statistics.byStatus.ACTIVE || 0 / statistics.total) * 100).toFixed(1)}% del total`}
        />
        <StatCard
          icon={Award}
          label="Graduados"
          value={statistics.byStatus.GRADUATED || 0}
          subtitle="Este ciclo"
        />
        <StatCard
          icon={AlertCircle}
          label="Inactivos"
          value={statistics.byStatus.INACTIVE || 0}
          subtitle="Requieren atención"
        />
      </div>

      {/* Distribución por estado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribución por Estado</CardTitle>
          <CardDescription>Desglose de matrículas activas</CardDescription>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <div className="space-y-4">
              {statusData.map((item) => {
                const percentage = ((item.value / statistics.total) * 100).toFixed(1);
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {item.name}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
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
            <div className="h-32 flex items-center justify-center text-slate-500">
              Sin datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Matrículas por grado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Matrículas por Grado</CardTitle>
          <CardDescription>Distribución de estudiantes</CardDescription>
        </CardHeader>
        <CardContent>
          {gradeData.length > 0 ? (
            <div className="space-y-3">
              {gradeData.map((item: any) => {
                const maxCount = Math.max(...gradeData.map((g: any) => g.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {item.name}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">{item.count}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-slate-500">
              Sin datos disponibles
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacidad por sección */}
      {Array.isArray(statistics.sectionOccupancy) && statistics.sectionOccupancy.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ocupación de Secciones</CardTitle>
            <CardDescription>Capacidad actual vs máxima</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.sectionOccupancy.map((section) => (
                <div key={section.sectionId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {section.sectionName}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {section.enrolled}/{section.capacity}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        section.percentage > 90
                          ? 'bg-red-500'
                          : section.percentage > 70
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                      )}
                      style={{ width: `${section.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
