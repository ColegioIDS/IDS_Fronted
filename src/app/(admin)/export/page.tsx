'use client';

import { useState, useEffect } from 'react';
import { useExportsAcademicData } from '@/hooks/exports/useExportsAcademicData';
import { useFilteredStudents } from '@/hooks/exports/useFilteredStudents';
import { ExportsStudentsFiltersQuery } from '@/types/exports.types';
import { ExportFilters } from '@/components/features/export/ExportFilters';
import { ExportResults } from '@/components/features/export/ExportResults';
import { ExportError } from '@/components/features/export/ExportError';

export default function ExportPage() {
  // Estado para los filtros
  const [filters, setFilters] = useState<Partial<ExportsStudentsFiltersQuery>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [exportData, setExportData] = useState<any>(null);

  // Hooks
  const { data: academicData, loading: dataLoading, error: dataError } = useExportsAcademicData();
  const { data: studentData, loading: studentLoading, error: studentError, fetchStudents } = useFilteredStudents();

  // Extrae datos
  const cycles = academicData?.cycle ? [academicData.cycle] : [];
  const bimestres = academicData?.activeBimester ? [academicData.activeBimester] : [];
  const grades = academicData?.grades || [];
  const gradesSections = academicData?.gradesSections || {};

  // Obtener secciones del grado seleccionado
  const sections = filters.gradeId ? gradesSections[filters.gradeId] || [] : [];

  // Autoseleccionar valores si solo hay uno
  useEffect(() => {
    if (dataLoading) return;

    setFilters((prev) => {
      let updated = { ...prev };

      // Autoseleccionar ciclo si solo hay uno
      if (!prev.cycleId && cycles.length === 1) {
        updated.cycleId = cycles[0].id;
      }

      // Autoseleccionar bimestre si solo hay uno
      if (!prev.bimesterId && bimestres.length === 1) {
        updated.bimesterId = bimestres[0].id;
      }

      // Autoseleccionar grado si solo hay uno y ya tenemos ciclo
      if (!prev.gradeId && updated.cycleId && grades.length === 1) {
        updated.gradeId = grades[0].id;
      }

      // Autoseleccionar sección si solo hay uno y ya tenemos grado
      if (!prev.sectionId && updated.gradeId && sections.length === 1) {
        updated.sectionId = sections[0].id;
      }

      return Object.keys(updated).length > Object.keys(prev).length ? updated : prev;
    });
  }, [cycles.length, bimestres.length, grades.length, sections.length, dataLoading]);

  // Manejar el cambio de filtros
  const handleFilterChange = (key: keyof ExportsStudentsFiltersQuery, value: number) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };

      // Resetear valores dependientes
      if (key === 'cycleId') {
        delete updated.bimesterId;
        delete updated.gradeId;
        delete updated.sectionId;
      } else if (key === 'bimesterId') {
        // El bimestre no afecta otros filtros por ahora
      } else if (key === 'gradeId') {
        delete updated.sectionId;
      } else if (key === 'sectionId') {
        // La sección no afecta otros filtros por ahora
      }

      return updated;
    });

    // Resetear la página cuando cambian los filtros
    setCurrentPage(1);
    setExportData(null);
  };

  // Generar reporte
  const handleGenerateReport = async () => {
    if (!filters.cycleId || !filters.bimesterId || !filters.gradeId || !filters.sectionId) {
      return;
    }

    setIsSubmitting(true);
    setCurrentPage(1);

    try {
      // Buscar la sección seleccionada
      const selectedSection = sections.find((s: any) => s.id === filters.sectionId);

      // Llamar al servicio de estudiantes filtrados
      await fetchStudents({
        cycleId: filters.cycleId,
        gradeId: filters.gradeId,
        sectionId: filters.sectionId,
        page: 1,
        limit: 10,
      });

      // Guardar los datos de la sección
      setExportData({
        cycle: academicData?.cycle,
        bimester: academicData?.activeBimester,
        section: selectedSection,
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cambio de página
  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);

    try {
      await fetchStudents({
        cycleId: filters.cycleId,
        gradeId: filters.gradeId,
        sectionId: filters.sectionId,
        page: newPage,
        limit: 10,
      });
    } catch (error) {
      console.error('Error changing page:', error);
    }
  };

  const isFormValid =
    !!(filters.cycleId && filters.bimesterId && filters.gradeId && filters.sectionId);

  const getErrorMessage = (err: any): Error | string => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err;
    if (err?.message) return err.message;
    return 'Error desconocido';
  };

  return (
    <div className="space-y-6 p-6">
      {dataError && <ExportError error={getErrorMessage(dataError)} />}
      {studentError && <ExportError error={getErrorMessage(studentError)} />}

      {!dataError && !studentError && (
        <>
          <ExportFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onGenerateReport={handleGenerateReport}
            dataLoading={dataLoading}
            isSubmitting={isSubmitting}
            cycles={cycles}
            bimestres={bimestres}
            grades={grades}
            sections={sections}
            isFormValid={isFormValid}
          />

          {exportData && (
            <ExportResults
              filters={exportData}
              studentData={studentData}
              loading={studentLoading}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
