import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';
import { StudentsList } from './StudentsList';
import { StudentDetailDialog } from './StudentDetailDialog';
import { Card } from '@/components/ui/card';
import { Student } from '@/types/students.types';

interface StudentStats {
  total: number;
  enrolled: number;
  notEnrolled: number;
}

export const StudentsPageContent: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [stats, setStats] = useState<StudentStats>({
    total: 0,
    enrolled: 0,
    notEnrolled: 0,
  });

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Estudiantes
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestiona el registro de estudiantes
              </p>
            </div>
          </div>

          <Link href="/students/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Estudiante
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Total de Estudiantes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Inscritos
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {stats.enrolled}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Sin Inscribir
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                  {stats.notEnrolled}
                </p>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Students List */}
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
          <StudentsList onViewStudent={handleViewStudent} onStatsUpdate={handleStatsUpdate} />
        </Card>

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


