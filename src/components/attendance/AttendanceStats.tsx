// src/components/attendance/AttendanceStats.tsx

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  TrendingUp,
  Users,
  AlertCircle,
  XCircle,
  Clock,
  Calendar,
} from 'lucide-react';

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export default function AttendanceStats() {
  // Mock data - Reemplaza con datos reales del hook
  const mockStats = {
    totalStudents: 45,
    presentToday: 42,
    absentToday: 2,
    lateToday: 1,
    averageAttendance: 92.5,
    atRiskStudents: 3,
  };

  const percentagePresent = useMemo(() => {
    return Math.round(
      ((mockStats.presentToday + mockStats.lateToday) / mockStats.totalStudents) * 100
    );
  }, [mockStats]);

  const stats: StatItem[] = [
    {
      icon: Users,
      label: 'Total de Estudiantes',
      value: mockStats.totalStudents,
      subtext: 'Matriculados',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      icon: CheckCircle2,
      label: 'Presentes Hoy',
      value: mockStats.presentToday,
      subtext: `${percentagePresent}% de asistencia`,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      icon: XCircle,
      label: 'Ausentes Hoy',
      value: mockStats.absentToday,
      subtext: 'Sin justificación',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    {
      icon: Clock,
      label: 'Tardíos Hoy',
      value: mockStats.lateToday,
      subtext: 'Llegada después de las 8:00',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className={`border ${stat.borderColor} ${stat.bgColor} transition-all hover:shadow-md`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{stat.subtext}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Rate */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Promedio de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-4xl font-bold ${
                  mockStats.averageAttendance >= 85
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`}>
                  {mockStats.averageAttendance}%
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Meta: 85%
                </p>
              </div>
              <Badge
                className={`${
                  mockStats.averageAttendance >= 85
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                } border-0`}
              >
                {mockStats.averageAttendance >= 85 ? '✅ Excelente' : '⚠️ Revisar'}
              </Badge>
            </div>

            <div className="space-y-2">
              <Progress
                value={mockStats.averageAttendance}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Basado en los últimos 20 días de clase
              </p>
            </div>
          </CardContent>
        </Card>

        {/* At Risk Students */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              Estudiantes en Riesgo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                  {mockStats.atRiskStudents}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Estudiantes con bajo porcentaje
                </p>
              </div>
              <Badge
                variant="destructive"
                className="px-3 py-1"
              >
                {((mockStats.atRiskStudents / mockStats.totalStudents) * 100).toFixed(1)}%
              </Badge>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm font-medium text-red-900 dark:text-red-100">
                Acción requerida
              </p>
              <p className="text-xs text-red-800 dark:text-red-200 mt-1">
                Requiere intervención académica y comunicación con apoderados
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Umbral: Menos del 80% de asistencia
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            Desglose del Día
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Presentes', value: mockStats.presentToday, color: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300' },
              { label: 'Ausentes', value: mockStats.absentToday, color: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-300' },
              { label: 'Tardíos', value: mockStats.lateToday, color: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-300' },
              { label: 'No marcados', value: mockStats.totalStudents - mockStats.presentToday - mockStats.absentToday - mockStats.lateToday, color: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-300' },
            ].map((item, idx) => (
              <div key={idx} className={`${item.color} p-4 rounded-lg text-center`}>
                <p className={`text-2xl font-bold ${item.textColor}`}>{item.value}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}