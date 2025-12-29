'use client';

import { useState, useEffect } from 'react';
import { useCotejosStudentsFilters } from '@/hooks/data/useCotejosStudentsFilters';
import { useCascadeData } from '@/hooks/data';
import { CotejosStudentsFiltersQuery } from '@/types/cotejos.types';
import { CotejosReportesFilters } from '@/components/features/cotejos-reports/CotejosReportesFilters';
import { CotejosReportesResults } from '@/components/features/cotejos-reports/CotejosReportesResults';
import { CotejosReportesError } from '@/components/features/cotejos-reports/CotejosReportesError';

export default function ReportesPage() {
  // Estado para los filtros
  const [filters, setFilters] = useState<Partial<CotejosStudentsFiltersQuery>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook de datos en cascada del módulo de cotejos
  const { data: cascadeData, loading: cascadeLoading } = useCascadeData();
  const { data: studentsData, loading: studentsLoading, error: studentsError, fetch } =
    useCotejosStudentsFilters();

  // Extrae datos de cascadeData
  const cycles = cascadeData?.data?.cycle ? [cascadeData.data.cycle] : [];
  const bimestres = cascadeData?.data?.activeBimester ? [cascadeData.data.activeBimester] : [];
  const grades = cascadeData?.data?.grades || [];
  const gradesSections = cascadeData?.data?.gradesSections || {};
  
  // Obtener secciones del grado seleccionado
  const sections = filters.gradeId ? gradesSections[filters.gradeId] || [] : [];
  
  // Obtener cursos de las secciones del grado seleccionado
  const coursesSet = new Map<number, any>();
  if (filters.gradeId && sections.length > 0) {
    sections.forEach((section: any) => {
      section.courseAssignments?.forEach((assignment: any) => {
        if (!coursesSet.has(assignment.course.id)) {
          coursesSet.set(assignment.course.id, assignment.course);
        }
      });
    });
  }
  const courses = Array.from(coursesSet.values());

  // Autoseleccionar valores si solo hay uno
  useEffect(() => {
    if (cascadeLoading) return;

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
  }, [cycles.length, bimestres.length, grades.length, sections.length, cascadeLoading]);

  // Manejar el cambio de filtros
  const handleFilterChange = (key: keyof CotejosStudentsFiltersQuery, value: number) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };

      // Resetear valores dependientes
      if (key === 'cycleId') {
        delete updated.bimesterId;
        delete updated.gradeId;
        delete updated.sectionId;
        delete updated.courseId;
      } else if (key === 'bimesterId') {
        // El bimestre no afecta otros filtros por ahora
      } else if (key === 'gradeId') {
        delete updated.sectionId;
        delete updated.courseId;
      } else if (key === 'sectionId') {
        delete updated.courseId;
      }

      return updated;
    });
  };

  // Obtener estudiantes
  const handleSearch = async () => {
    if (!filters.cycleId || !filters.bimesterId || !filters.gradeId || !filters.sectionId || !filters.courseId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(filters as CotejosStudentsFiltersQuery);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    filters.cycleId && filters.bimesterId && filters.gradeId && filters.sectionId && filters.courseId;

  return (
    <div className="space-y-6 p-6">
      <CotejosReportesFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        cascadeLoading={cascadeLoading}
        studentsLoading={studentsLoading}
        isSubmitting={isSubmitting}
        cycles={cycles}
        bimestres={bimestres}
        grades={grades}
        sections={sections}
        courses={courses}
      />

      {studentsError && <CotejosReportesError error={studentsError} />}

      {studentsData && <CotejosReportesResults studentsData={studentsData} />}
    </div>
  );
}
