// src/hooks/data/useSectionFormData.ts

'use client';

import { useState, useEffect } from 'react';
import { sectionsService } from '@/services/sections.service';
import { gradesService } from '@/services/grades.service';

interface FormDataReturn {
  grades: Array<{ id: number; name: string; level: string }>;
  teachers: Array<{ id: number; givenNames: string; lastNames: string }>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para cargar datos del formulario de secciones
 * Usa SOLO endpoints de sections (respeta permisos)
 */
export function useSectionFormData(): FormDataReturn {
  const [grades, setGrades] = useState<Array<{ id: number; name: string; level: string }>>([]);
  const [teachers, setTeachers] = useState<Array<{ id: number; givenNames: string; lastNames: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFormData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Cargar grados y profesores en paralelo
        const [gradesData, teachersData] = await Promise.all([
          gradesService.getAll({ limit: 100, sortBy: 'order', sortOrder: 'asc' }),
          sectionsService.getAvailableTeachers(), // ✅ Usa endpoint de sections
        ]);

        setGrades(gradesData.data);
        setTeachers(teachersData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos del formulario');
        console.error('Error loading form data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, []);

  return {
    grades,
    teachers,
    isLoading,
    error,
  };
}
