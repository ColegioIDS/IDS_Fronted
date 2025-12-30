import { ExportsStudentsFiltersQuery } from '@/types/exports.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, BookOpen, GraduationCap, Users, Download, ArrowRight } from 'lucide-react';

interface ExportFiltersProps {
  filters: Partial<ExportsStudentsFiltersQuery>;
  onFilterChange: (key: keyof ExportsStudentsFiltersQuery, value: number) => void;
  onGenerateReport: () => Promise<void>;
  dataLoading: boolean;
  isSubmitting: boolean;
  cycles: any[];
  bimestres: any[];
  grades: any[];
  sections: any[];
  isFormValid: boolean;
}

export function ExportFilters({
  filters,
  onFilterChange,
  onGenerateReport,
  dataLoading,
  isSubmitting,
  cycles,
  bimestres,
  grades,
  sections,
  isFormValid,
}: ExportFiltersProps) {
  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 overflow-hidden">
      <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 sm:p-8">
        <div className="flex items-start gap-4 sm:gap-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-slate-900 dark:text-white text-xl sm:text-2xl font-bold">
              Generar Reporte
            </CardTitle>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2">
              Configura los filtros para obtener el reporte de estudiantes que necesitas
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 sm:p-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Primera fila: Ciclo y Bimestre */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Período Académico
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Ciclo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  Ciclo Escolar
                </label>
                <Select
                  value={filters.cycleId?.toString() || ''}
                  onValueChange={(value) => onFilterChange('cycleId', parseInt(value))}
                  disabled={dataLoading || cycles.length <= 1}
                >
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                    <SelectValue placeholder="Selecciona un ciclo" />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles.map((cycle: any) => (
                      <SelectItem key={cycle.id} value={cycle.id.toString()}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bimestre */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  Bimestre
                </label>
                <Select
                  value={filters.bimesterId?.toString() || ''}
                  onValueChange={(value) => onFilterChange('bimesterId', parseInt(value))}
                  disabled={!filters.cycleId || dataLoading || bimestres.length <= 1}
                >
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50">
                    <SelectValue placeholder="Selecciona un bimestre" />
                  </SelectTrigger>
                  <SelectContent>
                    {bimestres.map((bimestre: any) => (
                      <SelectItem key={bimestre.id} value={bimestre.id.toString()}>
                        {bimestre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 dark:bg-slate-700" />

          {/* Segunda fila: Grado y Sección */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Clasificación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Grado */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  Grado
                </label>
                <Select
                  value={filters.gradeId?.toString() || ''}
                  onValueChange={(value) => onFilterChange('gradeId', parseInt(value))}
                  disabled={!filters.cycleId || dataLoading || grades.length === 0}
                >
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50">
                    <SelectValue placeholder="Selecciona un grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade: any) => (
                      <SelectItem key={grade.id} value={grade.id.toString()}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sección */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                  Sección
                </label>
                <Select
                  value={filters.sectionId?.toString() || ''}
                  onValueChange={(value) => onFilterChange('sectionId', parseInt(value))}
                  disabled={!filters.gradeId || dataLoading || sections.length === 0}
                >
                  <SelectTrigger className="w-full h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all disabled:opacity-50">
                    <SelectValue placeholder="Selecciona una sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section: any) => (
                      <SelectItem key={section.id} value={section.id.toString()}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            onClick={onGenerateReport}
            disabled={!isFormValid || dataLoading || isSubmitting}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center gap-2"
          >
            {dataLoading || isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generar Reporte
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
