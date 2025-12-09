// EJEMPLO DE USO - ERICA HISTORY

/**
 * ESTRUCTURA COMPLETA PARA CONSULTAR EVALUACIONES
 */

// 1. IMPORTAR EL SERVICE
import { ericaHistoryService } from '@/services/erica-history.service';

// 2. OBTENER DATOS DE CASCADA (para llenar los selects)
const cascadeData = await ericaHistoryService.getCascadeData();
// Respuesta:
// {
//   cycles: [...],
//   bimesters: [{ id, name, number, startDate, endDate }, ...],
//   courses: [{ id, name, code }, ...],
//   sections: [{ id, name }, ...],
//   academicWeeks: [{ id, number, startDate, endDate }, ...]
// }

// 3. USUARIO SELECCIONA FILTROS
const filters = {
  bimesterId: 1,
  courseId: 9,
  sectionId: undefined,     // opcional
  academicWeekId: undefined, // opcional
  teacherId: undefined       // opcional
};

// 4. LLAMAR AL SERVICIO DE REPORTES
const report = await ericaHistoryService.getEvaluationsByFilters(filters);
// Respuesta:
// {
//   filters: { bimesterId: 1, courseId: 9, ... },
//   weeks: [
//     {
//       academicWeek: { id: 1, number: 1, startDate: "...", endDate: "..." },
//       topic: { id: 1, title: "Sumas", weekTheme: "Sumas", description: "..." },
//       evaluations: [
//         {
//           id: 1,
//           student: { id: 1, givenNames: "Nelson", lastNames: "Guaran" },
//           section: { id: 1, name: "A", grade: { name: "Primero" } },
//           dimension: "EJECUTA",
//           state: "B",
//           points: 0.75,
//           notes: null,
//           evaluatedBy: { id: 2, givenNames: "Juan", lastNames: "Pérez García" },
//           course: { id: 9, name: "Aprestamiento...", code: "APRESLENG0101" },
//           bimester: { id: 1, name: "Bimestre I", number: 1 },
//           evaluatedAt: "2025-12-07T14:50:20.316Z",
//           createdAt: "2025-12-07T14:45:43.977Z",
//           updatedAt: "2025-12-07T14:50:20.320Z"
//         }
//       ]
//     }
//   ],
//   stats: {
//     totalEvaluations: 15,
//     totalStudents: 4,
//     totalWeeks: 1,
//     averagePoints: 0.85,
//     byDimension: {
//       EJECUTA: 5,
//       RETIENE: 4,
//       INTERPRETA: 3,
//       CONOCE: 2,
//       AMPLIA: 1
//     },
//     byState: {
//       E: 2,   // Excelente
//       B: 8,   // Bueno
//       P: 3,   // Por mejorar
//       C: 2,   // En construcción
//       N: 0    // No evaluado
//     }
//   }
// }

/**
 * EJEMPLOS DE DIFERENTES FILTROS
 */

// Ejemplo 1: Solo bimestre
const filters1 = { bimesterId: 1 };
const result1 = await ericaHistoryService.getEvaluationsByFilters(filters1);

// Ejemplo 2: Bimestre + Curso
const filters2 = { bimesterId: 1, courseId: 9 };
const result2 = await ericaHistoryService.getEvaluationsByFilters(filters2);

// Ejemplo 3: Bimestre + Curso + Sección
const filters3 = { bimesterId: 1, courseId: 9, sectionId: 1 };
const result3 = await ericaHistoryService.getEvaluationsByFilters(filters3);

// Ejemplo 4: Solo semana académica
const filters4 = { academicWeekId: 1 };
const result4 = await ericaHistoryService.getEvaluationsByFilters(filters4);

// Ejemplo 5: Evaluaciones de un maestro en un bimestre
const filters5 = { teacherId: 2, bimesterId: 1 };
const result5 = await ericaHistoryService.getEvaluationsByFilters(filters5);

// Ejemplo 6: Sin filtros (todas las evaluaciones)
const filters6 = {};
const result6 = await ericaHistoryService.getEvaluationsByFilters(filters6);

/**
 * COMPONENTES RENDERIZADOS EN LA PÁGINA
 */

// El archivo src/app/(admin)/erica-history/page.tsx contiene:
// 1. HistoryContent (contenedor principal)
//    ├─ HistoryFilterControls (selects de filtros)
//    ├─ HistoryStatistics (tarjetas de estadísticas)
//    └─ HistoryWeekSection[] (secciones por semana)
//       └─ Tabla de evaluaciones

/**
 * CÓMO AGREGAR A LA NAVEGACIÓN
 */

// En src/layout/AppSidebar.tsx, agrega algo como:
// {
//   label: "Historial ERICA",
//   href: "/erica-history",
//   icon: Clock, // o el icono que prefieras
//   description: "Ver historial de evaluaciones"
// }

/**
 * PERSONALIZACIONES POSIBLES
 */

// 1. Cambiar colores de dimensiones
// → Editar DIMENSION_COLORS en history-week-section.tsx

// 2. Agregar más campos a la tabla
// → Modificar HistoryWeekSection

// 3. Agregar filtros adicionales
// → Agregar selects en HistoryFilterControls
// → Actualizar EricaHistoryFilters en types

// 4. Cambiar formato de fechas
// → Editar date-utils.ts

// 5. Agregar exportación a Excel/PDF
// → Crear nuevo componente de exportación
// → Agregar botón en HistoryContent
