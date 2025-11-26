# 📑 Arquitectura con Tabs - Distribución de Endpoints

## Índice de Navegación
1. [Estructura General](#estructura-general)
2. [Tab 1: Resumen Ejecutivo](#tab-1-resumen-ejecutivo)
3. [Tab 2: Por Sección](#tab-2-por-sección)
4. [Tab 3: Por Curso](#tab-3-por-curso)
5. [Tab 4: Estudiantes en Riesgo](#tab-4-estudiantes-en-riesgo)
6. [Tab 5: Configuración](#tab-5-configuración)
7. [Guía de Implementación UI](#guía-de-implementación-ui)

---

## Estructura General

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATTENDANCE REPORTS DASHBOARD                  │
├─────────────────────────────────────────────────────────────────┤
│ [Summary] [Section] [Course] [At-Risk] [Settings]             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  TAB CONTENT (Cambia según pestaña seleccionada)               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tab 1: Resumen Ejecutivo

**URL Base:** `/attendance-reports`

### Propósito
Vista general rápida de todas las secciones del usuario.

### Componentes

#### 1.1 Selector de Sección
```tsx
<SectionSelector
  placeholder="Selecciona una sección"
  endpoint="GET /attendance-reports/sections/:sectionId/options"
  onSelect={(sectionId) => {
    loadSectionSummary(sectionId);
  }}
/>
```

#### 1.2 Tarjeta de Métricas Principales
```
┌──────────────────────────────────────┐
│ 6to Grado A - Resumen General        │
├──────────────────────────────────────┤
│ Fecha Reporte: 25-11-2025            │
├──────────────────────────────────────┤
│ Total Estudiantes:    28              │
│ Asistencia Promedio:  92.5%          │
│ En Riesgo:            3 (10.7%)      │
│ Crítico:              1 (3.6%)       │
└──────────────────────────────────────┘
```

**Endpoint:** `GET /attendance-reports/sections/:sectionId/summary`

**Query Params:**
```
Optional:
- courseId=5
- bimesterId=1
- enrollmentStatus=ACTIVE
```

#### 1.3 Gráficos

**a) Desglose de Asistencia (Pie Chart)**
```
┌─────────────────────────────┐
│   Distribución de Estados   │
│  ◆ Presente: 1,316 (92.5%)  │
│  ◆ Ausente: 84 (5.9%)       │
│  ◆ Justificado: 28 (1.96%)  │
└─────────────────────────────┘
```

**b) Clasificación de Riesgo (Bar Chart)**
```
┌─────────────────────────────┐
│      Nivel de Riesgo        │
│ LOW      ▓▓▓▓▓▓▓▓ 24 (85%)  │
│ MEDIUM   ▓▓▓ 3 (10%)        │
│ HIGH     ▓ 1 (3%)           │
└─────────────────────────────┘
```

#### 1.4 Filtros Disponibles
```
┌────────────────────────────────────────┐
│ Filtros:                               │
│ ├─ Curso: [Seleccionar Curso...]      │
│ ├─ Bimestre: [I Bimestre]             │
│ └─ Semana: [Todas]                    │
│                                        │
│ [Aplicar Filtros] [Limpiar Filtros]   │
└────────────────────────────────────────┘
```

**Endpoint para opciones:** `GET /attendance-reports/sections/:sectionId/options`

---

## Tab 2: Por Sección

**URL Base:** `/attendance-reports/detailed`

### Propósito
Vista detallada de todos los estudiantes con su asistencia individual.

### Componentes

#### 2.1 Información de la Sección
```
┌──────────────────────────────────────────┐
│ 6to Grado A                              │
├──────────────────────────────────────────┤
│ Grado: Sexto | Estudiantes: 28         │
│ Promedio Asistencia: 92.5%              │
│ Días Presentes: 47  | Ausentes: 3       │
└──────────────────────────────────────────┘
```

#### 2.2 Tabla de Estudiantes
```
┌─────────────────────────────────────────────────────────────┐
│ Estudiantes - 6to Grado A                                 │
├────┬──────────────┬──────┬────────┬─────────┬──────────────┤
│ #  │ Estudiante   │ Cod. │ Asist. │ Riesgo  │ Estado       │
├────┼──────────────┼──────┼────────┼─────────┼──────────────┤
│ 1  │ Juan Pérez   │E001  │ 96.0%  │ LOW     │ ✓ Activo     │
│ 2  │ María López  │E002  │ 90.0%  │ MEDIUM  │ ✓ Activo     │
│ 3  │ Carlos Gómez │E003  │ 70.0%  │ HIGH    │ ⚠ Revisión   │
│ .. │ ...          │ ...  │ ...    │ ...     │ ...          │
└────┴──────────────┴──────┴────────┴─────────┴──────────────┘
[Mostrar 10] [Anterior] [1] [2] [3] [Siguiente]
```

**Endpoint:** `GET /attendance-reports/sections/:sectionId/detailed`

**Campos de Respuesta Mostrados:**
- `studentCode` - Código del estudiante
- `firstName + lastName` - Nombre completo
- `attendancePercentage` - Porcentaje de asistencia
- `riskLevel` - Nivel de riesgo (LOW/MEDIUM/HIGH)
- `status` - Estado de inscripción

#### 2.3 Expander por Estudiante (Opcional)

Al hacer click en una fila:

```
┌─────────────────────────────────────────────────────────────┐
│ ▼ Juan Pérez García (E001)                                  │
├─────────────────────────────────────────────────────────────┤
│ Código SIRE: SIR001234                                      │
│ Total Clases: 50      │ Presente: 48  │ Ausente: 1        │
│ Justificado: 1        │ Retardos: 0   │                    │
│                                                              │
│ Últimas 5 Clases:                                           │
│ ├─ 25-11-2025 | Matemáticas  | 08:00-09:00 | ✓ Presente   │
│ ├─ 24-11-2025 | Lengua       | 09:30-10:30 | ✓ Presente   │
│ ├─ 23-11-2025 | Ciencias     | 10:45-11:45 | ✓ Presente   │
│ ├─ 22-11-2025 | E. Física    | 13:00-14:00 | ✓ Presente   │
│ └─ 21-11-2025 | Matemáticas  | 08:00-09:00 | Ausente ✗    │
└─────────────────────────────────────────────────────────────┘
```

**Query Param:** `includeClasses=true`

#### 2.4 Controles
```
┌────────────────────────────────────────────┐
│ Filtros:                                   │
│ ├─ Curso: [Seleccionar...]                │
│ ├─ Bimestre: [Seleccionar...]             │
│ └─ Estado: [ACTIVE / INACTIVE]            │
│                                            │
│ Exportar: [CSV] [PDF] [Excel]             │
│ Columnas: [Personalizar]                   │
└────────────────────────────────────────────┘
```

---

## Tab 3: Por Curso

**URL Base:** `/attendance-reports/courses`

### Propósito
Análisis detallado de asistencia por cada curso en la sección.

### Componentes

#### 3.1 Selector de Sección y Curso
```
┌─────────────────────────────────────────────┐
│ Sección: [6to Grado A]                      │
│ Curso:   [Seleccionar Curso...]             │
│                                              │
│ [Cargar Reporte]                            │
└─────────────────────────────────────────────┘
```

#### 3.2 Información del Curso
```
┌──────────────────────────────────────────────┐
│ 📚 Matemáticas (MAT601)                     │
├──────────────────────────────────────────────┤
│ Área: Matemáticas | Color: #FF6B6B          │
│ Total Clases: 10  | Total Estudiantes: 28   │
│ Asistencia Promedio: 93.2%                  │
└──────────────────────────────────────────────┘
```

**Endpoint:** `GET /attendance-reports/sections/:sectionId/courses/:courseId/report`

#### 3.3 Gráfico de Asistencia del Curso
```
┌──────────────────────────────────┐
│  Asistencia por Estado - Mat 601 │
│  ◆ Presente: 260 (93.2%)         │
│  ◆ Ausente: 15 (5.4%)            │
│  ◆ Justificado: 4 (1.4%)         │
└──────────────────────────────────┘
```

#### 3.4 Tabla de Estudiantes del Curso
```
┌─────────────────────────────────────────────────┐
│ Asistencia - Matemáticas (MAT601)              │
├────┬──────────────┬─────┬────────┬────────┬────┤
│ #  │ Estudiante   │ Cod │ Asist. │ Riesgo │ ⋯  │
├────┼──────────────┼─────┼────────┼────────┼────┤
│ 1  │ Juan Pérez   │E001 │100.0%  │ LOW    │ ⋯  │
│ 2  │ María López  │E002 │ 80.0%  │ MEDIUM │ ⋯  │
│ 3  │ Laura Sánchez│E003 │ 90.0%  │ LOW    │ ⋯  │
└────┴──────────────┴─────┴────────┴────────┴────┘
[Mostrar 10] Página 1 de 3
```

#### 3.5 Timeline de Clases
```
┌──────────────────────────────────────────────┐
│ Historial de Clases - Matemáticas           │
├──────────────────────────────────────────────┤
│ 📅 25-11-2025 (Lunes, 08:00)                │
│    Presentes: 27/28 (96.4%)                 │
│    Ausentes: Juan García                    │
│                                              │
│ 📅 24-11-2025 (Viernes, 09:30)              │
│    Presentes: 28/28 (100%)                  │
│                                              │
│ 📅 22-11-2025 (Miércoles, 08:00)            │
│    Presentes: 26/28 (92.8%)                 │
│    Ausentes: María López, Carlos Ruiz       │
└──────────────────────────────────────────────┘
```

---

## Tab 4: Estudiantes en Riesgo

**URL Base:** `/attendance-reports/at-risk`

### Propósito
Identificar y monitorear estudiantes con baja asistencia que requieren intervención.

### Componentes

#### 4.1 Configuración de Riesgo
```
┌──────────────────────────────────────────────┐
│ Parámetros de Riesgo                         │
├──────────────────────────────────────────────┤
│ Umbral de Ausencias: [20] %                  │
│ Nivel Riesgo: ⦿ Todos                       │
│              ⦿ Alto (HIGH)                   │
│              ⦿ Medio (MEDIUM)               │
│              ⦿ Bajo (LOW)                   │
│                                              │
│ [Aplicar] [Limpiar]                         │
└──────────────────────────────────────────────┘
```

**Endpoint:** `GET /attendance-reports/sections/:sectionId/at-risk`

#### 4.2 Resumen de Alertas
```
┌────────────────────────────────────────┐
│ 🚨 Estudiantes Requiriendo Intervención│
├────────────────────────────────────────┤
│ CRÍTICO (HIGH):       1 estudiante     │
│ MODERADO (MEDIUM):    3 estudiantes    │
│ BAJO (LOW):           2 estudiantes    │
│                                         │
│ Total en Riesgo: 6 de 28 (21.4%)      │
└────────────────────────────────────────┘
```

#### 4.3 Tabla de Estudiantes en Riesgo
```
┌─────────────────────────────────────────────────────────────┐
│ Estudiantes en Riesgo                                      │
├────┬──────────────┬─────────┬────────┬──────────┬──────────┤
│ #  │ Estudiante   │ Asist.  │ Riesgo │ Acciones │ Contacto │
├────┼──────────────┼─────────┼────────┼──────────┼──────────┤
│ 1  │🔴 Carlos     │ 70.0%   │ HIGH   │ 📞       │ 📧       │
│    │ Gómez López  │ ⚠️ 2 aus│ Score: │ mensaje  │ correo   │
│    │ (E005)       │ consecutivas│ 8.5 │ [Ver]   │          │
├────┼──────────────┼─────────┼────────┼──────────┼──────────┤
│ 2  │🟡 Laura      │ 80.0%   │ MEDIUM │ 📞       │ 📧       │
│    │ Sánchez Ruiz │ ⚠️ Trend│ Score: │ mensaje  │ correo   │
│    │ (E003)       │ decline │ 5.2    │ [Ver]   │          │
├────┼──────────────┼─────────┼────────┼──────────┼──────────┤
│ 3  │🟡 Roberto    │ 75.0%   │ MEDIUM │ 📞       │ 📧       │
│    │ González     │ Bajo    │ Score: │ mensaje  │ correo   │
│    │ (E008)       │ reciente│ 4.8    │ [Ver]   │          │
└────┴──────────────┴─────────┴────────┴──────────┴──────────┘

Mostrando 1-3 de 6 | [Anterior] [1] [2] [Siguiente]
```

#### 4.4 Detalles de Estudiante en Riesgo

Al hacer click en un estudiante:

```
┌──────────────────────────────────────────────────────────┐
│ 🔴 Carlos Gómez López - Análisis de Riesgo              │
├──────────────────────────────────────────────────────────┤
│ Datos Generales:                                         │
│ ├─ Código: E005                                          │
│ ├─ SIRE: SIR001239                                       │
│ ├─ Estado: ACTIVE                                        │
│ └─ Tutor: María Gómez | 📧 maria@email.com | 📞 +34... │
│                                                          │
│ Métricas de Asistencia:                                  │
│ ├─ Total Clases: 50                                      │
│ ├─ Presente: 35 (70%)       ✓                            │
│ ├─ Ausente: 12 (24%)        ✗                            │
│ ├─ Justificado: 3 (6%)      ✓                            │
│ └─ Retardos: 4              ⚠                            │
│                                                          │
│ Clasificación de Riesgo:                                 │
│ ├─ Nivel: HIGH (🔴 CRÍTICO)                              │
│ ├─ Score: 8.5/10 (Muy Alto)                             │
│ ├─ Prioridad: URGENT                                    │
│ └─ Ausencias Consecutivas: 2                             │
│                                                          │
│ Historial de Ausencias Recientes:                        │
│ ├─ 24-11-2025 | Matemáticas   | Sin justificación       │
│ ├─ 23-11-2025 | E. Física     | "Enfermedad"           │
│ ├─ 19-11-2025 | Ciencias      | "Cita médica"          │
│ └─ 15-11-2025 | Lengua        | Sin justificación       │
│                                                          │
│ Acciones Recomendadas:                                   │
│ [📞 Llamar Tutor] [📧 Enviar Email] [📋 Crear Caso]    │
│ [📌 Agendar Reunión] [📊 Ver Gráficos] [🖨 Imprimir]   │
└──────────────────────────────────────────────────────────┘
```

**Datos de Respuesta Mostrados:**
```typescript
{
  enrollmentId, studentId, studentCode, firstName, lastName,
  codeSIRE, totalClasses, totalPresent, totalAbsent,
  attendancePercentage, riskLevel, riskScore,
  interventionPriority, guardianEmail, guardianPhone,
  lastAttendanceDate, consecutiveAbsences,
  absenceHistory: [{ date, courseId, courseName, reason }]
}
```

---

## Tab 5: Configuración

**URL Base:** `/attendance-reports/settings`

### Propósito
Gestionar parámetros y preferencias del reporte.

### Componentes

#### 5.1 Selector de Sección
```
┌──────────────────────────────┐
│ Sección Activa:              │
│ [6to Grado A] ▼              │
│                               │
│ Disponibles:                 │
│ ├─ 6to Grado A (28)         │
│ ├─ 6to Grado B (26)         │
│ ├─ 5to Grado A (29)         │
│ └─ 5to Grado B (27)         │
│                               │
│ [Seleccionar]                │
└──────────────────────────────┘
```

**Endpoint:** `GET /attendance-reports/sections/:sectionId/options`

#### 5.2 Filtros Guardados
```
┌──────────────────────────────────────┐
│ Mis Filtros Guardados:               │
├──────────────────────────────────────┤
│ ☑ Filtro 1: "Bimestre I Activos"   │
│   ├─ Bimestre: I                    │
│   ├─ Estado: ACTIVE                 │
│   └─ [Aplicar] [Editar] [Borrar]    │
│                                      │
│ ☐ Filtro 2: "Estudiantes en Riesgo"│
│   ├─ Riesgo: HIGH                   │
│   └─ [Aplicar] [Editar] [Borrar]    │
│                                      │
│ [+ Crear Nuevo Filtro]              │
└──────────────────────────────────────┘
```

#### 5.3 Preferencias de Visualización
```
┌────────────────────────────────────┐
│ Preferencias Visualización:        │
├────────────────────────────────────┤
│ ☑ Mostrar código SIRE              │
│ ☑ Mostrar teléfono tutor           │
│ ☑ Mostrar datos de riesgo          │
│ ☑ Tabla interactiva                │
│ ☑ Gráficos por defecto             │
│                                     │
│ Registros por página: [20] ▼       │
│ Ordenar por: [Asistencia] ▼ DESC   │
│                                     │
│ [Guardar Preferencias]              │
└────────────────────────────────────┘
```

#### 5.4 Opciones de Exportación
```
┌────────────────────────────────────┐
│ Exportar Datos:                    │
├────────────────────────────────────┤
│ [📊 Descargar CSV]                 │
│ [📄 Descargar PDF]                 │
│ [📑 Descargar Excel]               │
│ [🔗 Compartir Enlace]              │
│ [📧 Enviar por Email]              │
└────────────────────────────────────┘
```

#### 5.5 Información de Ayuda
```
┌────────────────────────────────────┐
│ Información y Ayuda                │
├────────────────────────────────────┤
│ 📖 [Ver Guía Completa]             │
│ ❓ [Preguntas Frecuentes]           │
│ 🎓 [Videos Tutoriales]             │
│ 💬 [Contactar Soporte]             │
│ 📋 [Ver Cambios Recientes]         │
└────────────────────────────────────┘
```

---

## Guía de Implementación UI

### Estructura de Carpetas Recomendada

```
src/modules/attendance-reports/
├── components/
│   ├── tabs/
│   │   ├── SummaryTab.tsx
│   │   ├── SectionTab.tsx
│   │   ├── CourseTab.tsx
│   │   ├── AtRiskTab.tsx
│   │   └── SettingsTab.tsx
│   │
│   ├── shared/
│   │   ├── SectionSelector.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── MetricsCard.tsx
│   │   ├── AttendanceChart.tsx
│   │   └── StudentTable.tsx
│   │
│   ├── forms/
│   │   ├── FilterForm.tsx
│   │   └── DetailsForm.tsx
│   │
│   └── DetailedViews/
│       ├── StudentDetails.tsx
│       ├── CourseDetails.tsx
│       └── RiskAnalysis.tsx
│
├── pages/
│   └── AttendanceReportsDashboard.tsx
│
├── hooks/
│   ├── useAttendanceReport.ts
│   ├── useSectionData.ts
│   └── useFilters.ts
│
├── services/
│   └── attendanceReportsApi.ts
│
├── types/
│   ├── responses.ts
│   ├── filters.ts
│   └── ui.ts
│
└── styles/
    ├── dashboard.css
    ├── tabs.css
    └── tables.css
```

### Componente Principal (Wrapper)

```tsx
// AttendanceReportsDashboard.tsx
import React, { useState } from 'react';
import SummaryTab from './components/tabs/SummaryTab';
import SectionTab from './components/tabs/SectionTab';
import CourseTab from './components/tabs/CourseTab';
import AtRiskTab from './components/tabs/AtRiskTab';
import SettingsTab from './components/tabs/SettingsTab';

export const AttendanceReportsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'section' | 'course' | 'at-risk' | 'settings'>('summary');
  const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

  const tabs = [
    { id: 'summary', label: 'Resumen', icon: '📊' },
    { id: 'section', label: 'Sección', icon: '👥' },
    { id: 'course', label: 'Curso', icon: '📚' },
    { id: 'at-risk', label: 'En Riesgo', icon: '🚨' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' },
  ];

  return (
    <div className="attendance-dashboard">
      <nav className="tabs-navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <span className="icon">{tab.icon}</span>
            <span className="label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {activeTab === 'summary' && <SummaryTab sectionId={selectedSectionId} />}
        {activeTab === 'section' && <SectionTab sectionId={selectedSectionId} />}
        {activeTab === 'course' && <CourseTab sectionId={selectedSectionId} />}
        {activeTab === 'at-risk' && <AtRiskTab sectionId={selectedSectionId} />}
        {activeTab === 'settings' && <SettingsTab onSectionChange={setSelectedSectionId} />}
      </div>
    </div>
  );
};
```

### Hook para Obtener Datos

```tsx
// hooks/useAttendanceReport.ts
import { useQuery } from '@tanstack/react-query';
import { attendanceReportsApi } from '../services/attendanceReportsApi';

export const useAttendanceReportSummary = (sectionId: number, filters?: any) => {
  return useQuery({
    queryKey: ['attendance-report-summary', sectionId, filters],
    queryFn: () => attendanceReportsApi.getSummaryReport(sectionId, filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useAttendanceReportDetailed = (sectionId: number, filters?: any) => {
  return useQuery({
    queryKey: ['attendance-report-detailed', sectionId, filters],
    queryFn: () => attendanceReportsApi.getDetailedReport(sectionId, filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAttendanceReportByCourse = (sectionId: number, courseId: number, filters?: any) => {
  return useQuery({
    queryKey: ['attendance-report-course', sectionId, courseId, filters],
    queryFn: () => attendanceReportsApi.getByCourseReport(sectionId, courseId, filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAttendanceReportAtRisk = (sectionId: number, filters?: any) => {
  return useQuery({
    queryKey: ['attendance-report-at-risk', sectionId, filters],
    queryFn: () => attendanceReportsApi.getAtRiskReport(sectionId, filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAttendanceReportOptions = (sectionId: number) => {
  return useQuery({
    queryKey: ['attendance-report-options', sectionId],
    queryFn: () => attendanceReportsApi.getFilterOptions(sectionId),
    staleTime: 30 * 60 * 1000, // 30 minutos (datos más estables)
  });
};
```

### Servicio API

```tsx
// services/attendanceReportsApi.ts
import { apiClient } from '@/lib/api-client';

export const attendanceReportsApi = {
  getSummaryReport: (sectionId: number, filters?: any) =>
    apiClient.get(`/attendance-reports/sections/${sectionId}/summary`, { params: filters }),

  getDetailedReport: (sectionId: number, filters?: any) =>
    apiClient.get(`/attendance-reports/sections/${sectionId}/detailed`, { params: filters }),

  getByCourseReport: (sectionId: number, courseId: number, filters?: any) =>
    apiClient.get(`/attendance-reports/sections/${sectionId}/courses/${courseId}/report`, { params: filters }),

  getAtRiskReport: (sectionId: number, filters?: any) =>
    apiClient.get(`/attendance-reports/sections/${sectionId}/at-risk`, { params: filters }),

  getFilterOptions: (sectionId: number) =>
    apiClient.get(`/attendance-reports/sections/${sectionId}/options`),
};
```

---

## Flujo de Navegación Recomendado

```
Usuario Inicia Sesión
         ↓
[Dashboard Principal]
         ↓
[Selecciona Sección] → (va a Settings Tab)
         ↓
[Navega a Tab Deseado]
         ↓
┌─────────────────────────────────────┐
│ Summary │ Section │ Course │ At-Risk │
└─────────────────────────────────────┘
    ↓        ↓         ↓         ↓
   [Ver]   [Ver]    [Ver]    [Ver]
  Métricas Tabla  Cursos  En Riesgo
    ↓        ↓         ↓         ↓
 [Filtrar] [Expandir] [Filtrar] [Expandir]
    ↓        ↓         ↓         ↓
 [Exportar] [Detalles] [Timeline] [Análisis]
    ↓        ↓         ↓         ↓
```

---

## Resumen de Endpoints por Tab

| Tab | Endpoint | Método | Descripción |
|-----|----------|--------|-------------|
| Summary | `/sections/:sectionId/summary` | GET | Métricas agregadas |
| Summary | `/sections/:sectionId/options` | GET | Selectores de filtros |
| Section | `/sections/:sectionId/detailed` | GET | Lista de estudiantes |
| Course | `/sections/:sectionId/options` | GET | Lista de cursos |
| Course | `/sections/:sectionId/courses/:courseId/report` | GET | Detalles del curso |
| At-Risk | `/sections/:sectionId/at-risk` | GET | Estudiantes en riesgo |
| Settings | `/sections/:sectionId/options` | GET | Configuración disponible |

---

## Consideraciones de Performance

1. **Lazy Loading**: Cargar datos del tab solo cuando está activo
2. **Caching**: Usar React Query con staleTime apropiado
3. **Paginación**: Implementar en tablas grandes (> 20 registros)
4. **Virtualización**: Para tablas con 100+ filas usar react-window
5. **Debounce**: En filtros para evitar llamadas innecesarias

