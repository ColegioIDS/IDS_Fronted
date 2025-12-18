import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users, GraduationCap, TrendingUp, Filter } from 'lucide-react';
import Link from 'next/link';
import { StudentsList } from './StudentsList';
import { StudentDetailDialog } from './StudentDetailDialog';
import { Card } from '@/components/ui/card';
import { Student } from '@/types/students.types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentStats {
  total: number;
  enrolled: number;
  notEnrolled: number;
}

interface StudentsPageContentProps {
  canRead?: boolean;
  canReadOne?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canUploadPicture?: boolean;
  canDeletePicture?: boolean;
  canGenerateReport?: boolean;
}

export const StudentsPageContent: React.FC<StudentsPageContentProps> = ({
  canRead = false,
  canReadOne = false,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
  canUploadPicture = false,
  canDeletePicture = false,
  canGenerateReport = false,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    enrolled: 0,
    notEnrolled: 0,
  });
  const [searchFilter, setSearchFilter] = useState('');
  const [enrollmentFilter, setEnrollmentFilter] = useState<'all' | 'enrolled' | 'not-enrolled'>('all');

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailDialogOpen(true);
  };

  const handleStatsUpdate = useCallback((students: Student[], total: number) => {
    const enrolled = students.filter((s) => s.enrollments && s.enrollments.length > 0).length;
    const notEnrolled = students.filter((s) => !s.enrollments || s.enrollments.length === 0).length;
    
    setStats({
      total,
      enrolled,
      notEnrolled,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section con Gradient */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left Side */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                  Gestión de Estudiantes
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Administra el registro completo de estudiantes
                </p>
              </div>
            </div>

            {/* Right Side - Actions */}
            {canCreate && (
              <Link href="/students/create">
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2 shadow-lg hover:shadow-xl transition-all h-11 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canCreate}>
                  <Plus className="w-5 h-5" />
                  <span className="font-semibold">Nuevo Estudiante</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards - Mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800/50 dark:to-slate-900/50 border border-blue-200/30 dark:border-blue-800/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Total de Estudiantes
                  </p>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-3">
                    {stats.total}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    Registrados en el sistema
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </Card>

          {/* Enrolled Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-800/50 dark:to-slate-900/50 border border-emerald-200/30 dark:border-emerald-800/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Inscritos Activamente
                  </p>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mt-3">
                    {stats.enrolled}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    Con inscripción activa
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                  <GraduationCap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>
          </Card>

          {/* Not Enrolled Card */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-800/50 dark:to-slate-900/50 border border-amber-200/30 dark:border-amber-800/30 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="p-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Pendientes de Inscripción
                  </p>
                  <p className="text-4xl font-bold text-amber-600 dark:text-amber-400 mt-3">
                    {stats.notEnrolled}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                    Sin inscripción activa
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters Section */}
        <div className="mb-6 p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Filtros</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Buscar por nombre, apellido o código SIRE..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
            />
            <Select value={enrollmentFilter} onValueChange={(value: any) => setEnrollmentFilter(value)}>
              <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Filtrar por estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estudiantes</SelectItem>
                <SelectItem value="enrolled">Solo Inscritos</SelectItem>
                <SelectItem value="not-enrolled">Solo Pendientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Students List */}
          <StudentsList 
            onViewStudent={handleViewStudent} 
            onStatsUpdate={handleStatsUpdate}
            searchFilter={searchFilter}
            enrollmentFilter={enrollmentFilter}
            canRead={canRead}
            canReadOne={canReadOne}
            canUpdate={canUpdate}
            canDelete={canDelete}
            canUploadPicture={canUploadPicture}
            canDeletePicture={canDeletePicture}
          />

        {/* Student Detail Dialog */}
        <StudentDetailDialog
          student={selectedStudent}
          isOpen={isDetailDialogOpen}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedStudent(null);
          }}
        />
      </div>
    </div>
  );
};


