'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  Users,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Student } from '@/types/students.types';
import { toast } from 'sonner';

interface ReportGeneratorProps {
  students: Student[];
  loading?: boolean;
  onExport?: (format: 'pdf' | 'excel') => void;
}

interface EnrollmentData {
  cycleName: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

interface GradeDistribution {
  gradeName: string;
  total: number;
  active: number;
  inactive: number;
  [key: string]: string | number;
}

interface GenderDistribution {
  gender: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

interface AgeGroup {
  range: string;
  count: number;
  percentage: number;
  [key: string]: string | number;
}

interface MonthlyEnrollment {
  month: string;
  enrollments: number;
  transfers: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  students,
  loading = false,
  onExport,
}) => {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedCycle, setSelectedCycle] = useState<string>('all');
  const [reportType, setReportType] = useState<'overview' | 'enrollment' | 'demographic' | 'academic'>('overview');

  // Filtrar estudiantes por fecha
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      if (dateFrom && new Date(student.createdAt || '') < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && new Date(student.createdAt || '') > new Date(dateTo)) {
        return false;
      }
      if (selectedCycle !== 'all' && student.enrollments?.[0]?.cycle?.id !== Number(selectedCycle)) {
        return false;
      }
      return true;
    });
  }, [students, dateFrom, dateTo, selectedCycle]);

  // Calcular estadísticas de inscripción
  const enrollmentStats = useMemo((): EnrollmentData[] => {
    const cycles: Record<string, number> = {};
    filteredStudents.forEach((student) => {
      const cycleName = student.enrollments?.[0]?.cycle?.name || 'Sin Ciclo';
      cycles[cycleName] = (cycles[cycleName] || 0) + 1;
    });

    const total = Object.values(cycles).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(cycles).map(([name, count]) => ({
      cycleName: name,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [filteredStudents]);

  // Calcular distribución por grado
  const gradeDistribution = useMemo((): GradeDistribution[] => {
    const grades: Record<string, { total: number; active: number }> = {};
    filteredStudents.forEach((student) => {
      const gradeName = student.enrollments?.[0]?.section?.grade?.name || 'Sin Grado';
      if (!grades[gradeName]) {
        grades[gradeName] = { total: 0, active: 0 };
      }
      grades[gradeName].total++;
      if (student.enrollments?.[0]?.status !== 'inactive') {
        grades[gradeName].active++;
      }
    });

    return Object.entries(grades).map(([gradeName, data]) => ({
      gradeName,
      total: data.total,
      active: data.active,
      inactive: data.total - data.active,
    }));
  }, [filteredStudents]);

  // Calcular distribución por género
  const genderDistribution = useMemo((): GenderDistribution[] => {
    const genders: Record<string, number> = {};
    filteredStudents.forEach((student) => {
      const gender = student.gender || 'No especificado';
      genders[gender] = (genders[gender] || 0) + 1;
    });

    const total = Object.values(genders).reduce((a, b) => a + b, 0) || 1;
    const labels: Record<string, string> = {
      'M': 'Masculino',
      'F': 'Femenino',
      'O': 'Otro',
      'No especificado': 'No especificado',
    };

    return Object.entries(genders).map(([gender, count]) => ({
      gender: labels[gender] || gender,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [filteredStudents]);

  // Calcular grupos de edad
  const ageDistribution = useMemo((): AgeGroup[] => {
    const ageGroups: Record<string, number> = {
      '5-7 años': 0,
      '8-10 años': 0,
      '11-13 años': 0,
      '14-16 años': 0,
      '17-19 años': 0,
      '20+ años': 0,
    };

    const today = new Date();
    filteredStudents.forEach((student) => {
      if (!student.birthDate) return;
      const birthDate = new Date(student.birthDate);
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age >= 5 && age <= 7) ageGroups['5-7 años']++;
      else if (age >= 8 && age <= 10) ageGroups['8-10 años']++;
      else if (age >= 11 && age <= 13) ageGroups['11-13 años']++;
      else if (age >= 14 && age <= 16) ageGroups['14-16 años']++;
      else if (age >= 17 && age <= 19) ageGroups['17-19 años']++;
      else if (age >= 20) ageGroups['20+ años']++;
    });

    const total = Object.values(ageGroups).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [filteredStudents]);

  // Calcular trend mensual (simulado)
  const monthlyTrend = useMemo((): MonthlyEnrollment[] => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ];
    return months.map((month, idx) => ({
      month,
      enrollments: Math.floor(Math.random() * 50) + 20,
      transfers: Math.floor(Math.random() * 10) + 2,
    }));
  }, []);

  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter((s) => s.enrollments?.[0]?.status !== 'inactive').length;
  const inactiveStudents = totalStudents - activeStudents;

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedCycle('all');
    toast.success('Filtros restablecidos');
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      // Implementar exportación
      toast.info(`Exportando reporte en formato ${format.toUpperCase()}`);
      onExport?.(format);
    } catch (error) {
      toast.error('Error al exportar reporte');
    }
  };

  const cycles = [...new Set(students.map((s) => s.enrollments?.[0]?.cycle?.id).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Filtros de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Fecha Desde */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Desde
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Fecha Hasta */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Hasta
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Ciclo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ciclo Escolar
              </label>
              <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Ciclos</SelectItem>
                  {cycles.map((cycleId) => (
                    <SelectItem key={cycleId} value={String(cycleId)}>
                      Ciclo {cycleId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Reporte */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo
              </label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Vista General</SelectItem>
                  <SelectItem value="enrollment">Inscripción</SelectItem>
                  <SelectItem value="demographic">Demográfico</SelectItem>
                  <SelectItem value="academic">Académico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botones de acción */}
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                className="flex-1 border-gray-300 dark:border-gray-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Estadísticas */}
      {reportType === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total */}
            <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Estudiantes</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {totalStudents}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-blue-200 dark:text-blue-800" />
                </div>
              </CardContent>
            </Card>

            {/* Activos */}
            <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estudiantes Activos</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {activeStudents}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-200 dark:text-green-800" />
                </div>
              </CardContent>
            </Card>

            {/* Inactivos */}
            <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Estudiantes Inactivos</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {inactiveStudents}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {totalStudents > 0 ? Math.round((inactiveStudents / totalStudents) * 100) : 0}%
                    </p>
                  </div>
                  <AlertCircle className="h-12 w-12 text-red-200 dark:text-red-800" />
                </div>
              </CardContent>
            </Card>

            {/* Ciclos */}
            <Card className="border-gray-200 dark:border-gray-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Ciclos Escolares</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {enrollmentStats.length}
                    </p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Registrados
                    </p>
                  </div>
                  <Calendar className="h-12 w-12 text-purple-200 dark:text-purple-800" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por Ciclo */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Distribución por Ciclo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={enrollmentStats}
                      dataKey="count"
                      nameKey="cycleName"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {enrollmentStats.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución por Género */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Distribución por Género
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={genderDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="gender" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Estudiantes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución por Grado */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Distribución por Grado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="gradeName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" stackId="a" fill="#3b82f6" name="Activos" />
                    <Bar dataKey="inactive" stackId="a" fill="#ef4444" name="Inactivos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribución por Edad */}
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Distribución por Edad</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ageDistribution}>
                    <defs>
                      <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorAge)"
                      name="Estudiantes"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tendencia Mensual */}
            <Card className="border-gray-200 dark:border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle>Tendencia Mensual de Inscripciones</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="enrollments"
                      stroke="#3b82f6"
                      name="Inscripciones"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="transfers"
                      stroke="#f59e0b"
                      name="Traslados"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Botones de Exportación */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => handleExport('excel')}
          className="border-gray-300 dark:border-gray-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar a Excel
        </Button>
        <Button
          onClick={() => handleExport('pdf')}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar a PDF
        </Button>
      </div>
    </div>
  );
};
