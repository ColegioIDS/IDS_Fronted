import { CotejosStudentsFiltersQuery } from '@/types/cotejos.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, BookOpen, GraduationCap, Users, BookMarked, Search } from 'lucide-react';

interface CotejosReportesFiltersProps {
  filters: Partial<CotejosStudentsFiltersQuery>;
  onFilterChange: (key: keyof CotejosStudentsFiltersQuery, value: number) => void;
  onSearch: () => Promise<void>;
  cascadeLoading: boolean;
  studentsLoading: boolean;
  isSubmitting: boolean;
  cycles: any[];
  bimestres: any[];
  grades: any[];
  sections: any[];
  courses: any[];
}

export function CotejosReportesFilters({
  filters,
  onFilterChange,
  onSearch,
  cascadeLoading,
  studentsLoading,
  isSubmitting,
  cycles,
  bimestres,
  grades,
  sections,
  courses,
}: CotejosReportesFiltersProps) {
  const isFormValid =
    filters.cycleId && filters.bimesterId && filters.gradeId && filters.sectionId && filters.courseId;

  return (
    <Card className="border-0 shadow-xl bg-white dark:bg-slate-900">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white rounded-t-lg p-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Search className="w-7 h-7" />
          </div>
          <div>
            <CardTitle className="text-white text-2xl">Filtros de Búsqueda</CardTitle>
            <CardDescription className="text-blue-100 mt-2 text-base">
              Selecciona los parámetros para generar el reporte de estudiantes
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Primera fila: Ciclo y Bimestre */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ciclo */}
            <div className="space-y-3 group w-full">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Ciclo
              </label>
              <Select
                value={filters.cycleId?.toString() || ''}
                onValueChange={(value) => onFilterChange('cycleId', parseInt(value))}
                disabled={cascadeLoading || cycles.length <= 1}
              >
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-blue-400 transition-colors h-10">
                  <SelectValue placeholder="Seleccionar ciclo..." />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[200px]">
                  {cycles.map((cycle: any) => (
                    <SelectItem key={cycle.id} value={cycle.id.toString()}>
                      <span className="truncate">{cycle.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bimestre */}
            <div className="space-y-3 group w-full">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Bimestre
              </label>
              <Select
                value={filters.bimesterId?.toString() || ''}
                onValueChange={(value) => onFilterChange('bimesterId', parseInt(value))}
                disabled={!filters.cycleId || cascadeLoading || bimestres.length <= 1}
              >
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-indigo-400 transition-colors h-10">
                  <SelectValue placeholder="Seleccionar bimestre..." />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[200px]">
                  {bimestres.map((bimestre: any) => (
                    <SelectItem key={bimestre.id} value={bimestre.id.toString()}>
                      <span className="truncate">{bimestre.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Segunda fila: Grado, Sección y Curso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Grado */}
            <div className="space-y-3 group w-full">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Grado
              </label>
              <Select
                value={filters.gradeId?.toString() || ''}
                onValueChange={(value) => onFilterChange('gradeId', parseInt(value))}
                disabled={!filters.cycleId || cascadeLoading || grades.length === 0}
              >
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-purple-400 transition-colors h-10">
                  <SelectValue placeholder="Seleccionar grado..." />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[200px]">
                  {grades.map((grade: any) => (
                    <SelectItem key={grade.id} value={grade.id.toString()}>
                      <span className="truncate">{grade.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sección */}
            <div className="space-y-3 group w-full">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                Sección
              </label>
              <Select
                value={filters.sectionId?.toString() || ''}
                onValueChange={(value) => onFilterChange('sectionId', parseInt(value))}
                disabled={!filters.gradeId || cascadeLoading || sections.length === 0}
              >
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-pink-400 transition-colors h-10">
                  <SelectValue placeholder="Seleccionar sección..." />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[200px]">
                  {sections.map((section: any) => (
                    <SelectItem key={section.id} value={section.id.toString()}>
                      <span className="truncate">{section.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Curso */}
            <div className="space-y-3 group w-full">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Curso
              </label>
              <Select
                value={filters.courseId?.toString() || ''}
                onValueChange={(value) => onFilterChange('courseId', parseInt(value))}
                disabled={!filters.gradeId || cascadeLoading || courses.length === 0}
              >
                <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 group-hover:border-amber-400 transition-colors h-10">
                  <SelectValue placeholder="Seleccionar curso..." />
                </SelectTrigger>
                <SelectContent className="w-full min-w-[250px] max-w-md">
                  {courses.map((course: any) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      <span className="truncate max-w-xs">{course.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center lg:justify-end">
          <Button
            onClick={onSearch}
            disabled={!isFormValid || studentsLoading || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="w-5 h-5" />
            {studentsLoading || isSubmitting ? 'Buscando...' : 'Buscar Estudiantes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
