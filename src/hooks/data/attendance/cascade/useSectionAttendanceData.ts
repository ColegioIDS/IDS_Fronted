'use client';

import { useEffect, useState } from 'react';
import { attendanceReportsService } from '@/services/attendance-reports.service';
import {
  SectionAttendanceReport,
  ReportQueryParams,
} from '@/types/attendance-reports.types';

export function useSectionAttendanceData(
  sectionId: number | null,
  params?: Partial<ReportQueryParams>
) {
  const [data, setData] = useState<SectionAttendanceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('📍 [useSectionAttendanceData] Hook called with sectionId:', sectionId);
    
    if (!sectionId) {
      console.log('📍 [useSectionAttendanceData] No sectionId provided, clearing data');
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      try {
        console.log('📍 [useSectionAttendanceData] Loading section data for sectionId:', sectionId);
        setLoading(true);
        setError(null);
        const response = await attendanceReportsService.getSectionReport(sectionId, params);
        console.log('📍 [useSectionAttendanceData] Section data received:', response);
        console.log('📍 [useSectionAttendanceData] Students count:', response?.students?.length || 0);
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error('Error desconocido');
          console.error('📍 [useSectionAttendanceData] Error loading section data:', error);
          setError(error);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [sectionId, params]);

  return { data, loading, error };
}
