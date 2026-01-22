/**
 * Hook para obtener secciones de un grado
 * Usa SOLO endpoints del módulo attendance
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSectionsByGrade } from '@/services/attendance.service';

export interface SectionData {
  id: number;
  name: string;
  grade?: string;
}

interface UseSectionsByGradeReturn {
  sections: SectionData[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener secciones de un grado
 * @param cycleId - IGNORADO (no se usa en el endpoint de attendance)
 * @param gradeId - ID del grado
 */
export const useSectionsByGrade = (
  _cycleId: number | null | undefined,
  gradeId: number | null | undefined
): UseSectionsByGradeReturn => {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Solo un efecto que maneja todo: limpieza + carga
  useEffect(() => {
    if (!gradeId) {
      console.log('🚫 [useSectionsByGrade] Sin gradeId, limpiando secciones');
      setSections([]);
      setLoading(false);
      return;
    }

    console.log('🔄 [useSectionsByGrade] gradeId cambió a:', gradeId, '- limpiando y reloading');
    
    // Limpiar datos antiguos ANTES de cargar nuevos
    setSections([]);
    setLoading(true);

    // Función async para cargar secciones
    const loadSections = async () => {
      console.log('📡 [useSectionsByGrade] Cargando secciones para gradeId:', gradeId);

      try {
        setError(null);
        
        // Obtener secciones del grado desde attendance service
        const data = await getSectionsByGrade(gradeId);
        
        if (Array.isArray(data)) {
          console.log('✅ [useSectionsByGrade] Recibido', data.length, 'secciones para grado:', gradeId);
          const sectionsList = data.map((section: unknown) => {
            const s = section as Record<string, unknown>;
            return {
              id: Number(s.id),
              name: String(s.name),
              grade: String(s.gradeName ?? ''),
            };
          });
          console.log('📥 [useSectionsByGrade] Seteando estado con secciones:', sectionsList.map(s => ({ id: s.id, name: s.name })));
          setSections(sectionsList);
        } else {
          console.log('❌ [useSectionsByGrade] Data no es un array');
          setSections([]);
        }
      } catch (err: unknown) {
        const errorMessage = typeof err === 'object' && err !== null && 'message' in err
          ? String((err as Record<string, unknown>).message)
          : 'Error al obtener secciones';
        setError(errorMessage);
        setSections([]);
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar carga de forma async
    loadSections();
  }, [gradeId]);

  // Función refetch sin dependency
  const refetch = useCallback(async () => {
    if (!gradeId) return;
    
    try {
      setError(null);
      const data = await getSectionsByGrade(gradeId);
      if (Array.isArray(data)) {
        const sectionsList = data.map((section: unknown) => {
          const s = section as Record<string, unknown>;
          return {
            id: Number(s.id),
            name: String(s.name),
            grade: String(s.gradeName ?? ''),
          };
        });
        setSections(sectionsList);
      }
    } catch (err: unknown) {
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as Record<string, unknown>).message)
        : 'Error al obtener secciones';
      setError(errorMessage);
    }
  }, [gradeId]);


  return {
    sections,
    loading,
    error,
    refetch,
  };
};

export default useSectionsByGrade;
