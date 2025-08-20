// src/components/attendance/attendance-grid.tsx
"use client";
import { useState, useEffect } from 'react';

// Hooks para obtener datos automáticos (activos/actuales)
import { useCurrentSchoolCycle } from '@/context/SchoolCycleContext';
import { useCurrentBimester } from '@/context/newBimesterContext';
import { useCurrentAcademicWeek } from '@/context/AcademicWeeksContext';

// Hooks para selección manual
import { useGradeContext } from '@/context/GradeContext';
import { useSectionContext } from '@/context/SectionContext';

// Hooks para obtener estudiantes y manejar asistencias
import { useEnrollmentContext } from '@/context/EnrollmentContext';
import { useAttendanceContext } from '@/context/AttendanceContext';

export default function ContentAttendance() {
  // ✅ AUTOMÁTICOS: Siempre usamos los activos/actuales
  const { cycle: activeCycle, isActive: hasCycle } = useCurrentSchoolCycle();
  const { bimester: activeBimester, isActive: hasBimester } = useCurrentBimester();
  const { week: currentWeek, isActive: hasWeek } = useCurrentAcademicWeek();

  // ✅ SELECCIONABLES: Grado y Sección
  const { grades } = useGradeContext();
  const { sections, fetchSections } = useSectionContext();

  // ✅ ESTUDIANTES: Matriculados en la sección seleccionada
  const { fetchEnrollmentsBySection } = useEnrollmentContext();

  // ✅ ASISTENCIAS: Manejo de registros
  const {
    state: { attendances, loading: loadingAttendances },
    fetchAttendancesByBimester,
    fetchAttendancesByEnrollment,
    createBulkAttendance
  } = useAttendanceContext();

  // Estados locales para selección
  const [selectedGradeId, setSelectedGradeId] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<number, string>>({});

  // Filtrar secciones por grado seleccionado
  const filteredSections = selectedGradeId 
    ? sections.filter(section => section.gradeId === selectedGradeId)
    : [];

  // Cargar secciones cuando se selecciona un grado
  useEffect(() => {
    if (selectedGradeId) {
      fetchSections(selectedGradeId);
      setSelectedSectionId(null); // Reset sección
    }
  }, [selectedGradeId]); // Remover fetchSections de las dependencias

  // Cargar estudiantes cuando se selecciona una sección
  useEffect(() => {
    if (selectedSectionId && activeCycle) {
      loadStudents();
    }
  }, [selectedSectionId, activeCycle]);

  // Cargar asistencias existentes para la semana actual
  useEffect(() => {
    if (selectedSectionId && activeBimester && currentWeek) {
      loadExistingAttendances();
    }
  }, [selectedSectionId, activeBimester, currentWeek]);

  const loadStudents = async () => {
    if (!selectedSectionId) return;
    
    try {
      const result = await fetchEnrollmentsBySection(selectedSectionId);
      if (result.success) {
        setEnrollments(result.data || []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadExistingAttendances = async () => {
    if (!activeBimester?.id) return;

    try {
      await fetchAttendancesByBimester(activeBimester.id, {
        sectionId: selectedSectionId || undefined,
        // Podrías filtrar por fecha específica si es necesario
      });
    } catch (error) {
      console.error('Error loading attendances:', error);
    }
  };

  const handleAttendanceChange = (enrollmentId: number, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [enrollmentId]: status
    }));
  };

  const handleSaveAttendances = async () => {
    if (!currentWeek || !activeBimester) {
      alert('No hay semana académica o bimestre activo');
      return;
    }

    const attendanceRecords = Object.entries(attendanceData).map(([enrollmentId, status]) => ({
      enrollmentId: parseInt(enrollmentId),
      bimesterId: activeBimester.id!,
      date: new Date(), // O la fecha específica que elijas
      status: status as 'present' | 'absent' | 'late' | 'justified',
      notes: ''
    }));

    if (attendanceRecords.length === 0) {
      alert('No hay registros de asistencia para guardar');
      return;
    }

    const result = await createBulkAttendance(attendanceRecords);
    if (result.success) {
      setAttendanceData({});
      loadExistingAttendances(); // Recargar para mostrar los nuevos registros
    }
  };

  // Verificar si tenemos el contexto necesario
  if (!hasCycle || !hasBimester || !hasWeek) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800">
            Contexto Académico Incompleto
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc list-inside space-y-1">
              {!hasCycle && <li>No hay ciclo escolar activo</li>}
              {!hasBimester && <li>No hay bimestre activo</li>}
              {!hasWeek && <li>No hay semana académica actual</li>}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Información del contexto académico */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Contexto Académico Actual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Ciclo:</span>
            <p className="text-blue-700">{activeCycle?.name}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Bimestre:</span>
            <p className="text-blue-700">{activeBimester?.name}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Semana:</span>
            <p className="text-blue-700">
              Semana {currentWeek?.number} 
              ({new Date(currentWeek?.startDate || '').toLocaleDateString()} - 
               {new Date(currentWeek?.endDate || '').toLocaleDateString()})
            </p>
          </div>
        </div>
      </div>

      {/* Selectores de Grado y Sección */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Grado
          </label>
          <select
            value={selectedGradeId || ''}
            onChange={(e) => setSelectedGradeId(Number(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Seleccionar Grado --</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Sección
          </label>
          <select
            value={selectedSectionId || ''}
            onChange={(e) => setSelectedSectionId(Number(e.target.value) || null)}
            disabled={!selectedGradeId}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">-- Seleccionar Sección --</option>
            {filteredSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cuadro de Asistencias */}
      {selectedSectionId && enrollments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Lista de Asistencia - {new Date().toLocaleDateString()}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {enrollments.length} estudiante(s) matriculado(s)
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ausente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tardanza
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Justificado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment, index) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.student?.givenNames} {enrollment.student?.lastNames}
                      </div>
                    </td>
                    {['present', 'absent', 'late', 'justified'].map((status) => (
                      <td key={status} className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="radio"
                          name={`attendance-${enrollment.id}`}
                          value={status}
                          checked={attendanceData[enrollment.id] === status}
                          onChange={() => handleAttendanceChange(enrollment.id, status)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleSaveAttendances}
              disabled={Object.keys(attendanceData).length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Guardar Asistencias ({Object.keys(attendanceData).length})
            </button>
          </div>
        </div>
      )}

      {/* Estado cuando no hay estudiantes */}
      {selectedSectionId && enrollments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No hay estudiantes matriculados en esta sección.</p>
        </div>
      )}
    </div>
  );
}