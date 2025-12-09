// ERICA HISTORY - ESTRUCTURA CREADA

## Directorio de Componentes
📁 src/components/features/erica-history/
  ├─ index.ts                          (exports principales)
  ├─ history-filter-controls.tsx       (filtros en cascada)
  ├─ history-statistics.tsx            (tarjetas de estadísticas)
  ├─ history-week-section.tsx          (secciones por semana)
  └─ history-content.tsx               (contenedor principal)

## Types
📁 src/types/
  └─ erica-history.ts                  (tipos de datos)

## Services
📁 src/services/
  └─ erica-history.service.ts          (llamadas a API)

## Page
📁 src/app/(admin)/
  └─ erica-history/
     └─ page.tsx                       (página principal)

## Utilities
📁 src/lib/
  └─ date-utils.ts                     (funciones de formato de fecha)

---

## FEATURES IMPLEMENTADAS

### 1. COMPONENTES

#### HistoryFilterControls
- Selects en cascada para: Bimestre, Curso, Sección, Semana Académica
- Botones: Buscar y Limpiar filtros
- Responsive en todos los tamaños
- Estados de carga

#### HistoryStatistics
- 4 tarjetas principales (Total Evaluaciones, Estudiantes, Semanas, Promedio)
- Distribución por Dimensión (EJECUTA, RETIENE, INTERPRETA, CONOCE, AMPLIA)
- Distribución por Estado (E, B, P, C, N)
- Colores diferenciados por tipo

#### HistoryWeekSection
- Tarjetas expandibles por semana
- Tabla con evaluaciones detalladas
- Columnas: Estudiante, Dimensión, Estado, Puntos, Evaluado por, Fecha
- Sección de notas si existen
- Avatar de estudiantes
- Responsive con scroll horizontal

#### HistoryContent
- Manejo de estados (loading, error, datos)
- Integración de todos los componentes
- Notificaciones con Sonner
- Mensajes cuando no hay resultados

### 2. TYPES (erica-history.ts)
- EricaHistoryFilters
- EricaHistoryEvaluation
- EricaHistoryTopic
- EricaHistoryAcademicWeek
- EricaHistoryWeekData
- EricaHistoryStats (con subtipos de Dimensión y Estado)
- EricaHistoryFilterResponse
- EricaHistoryReport
- CascadeResponse

### 3. SERVICE (erica-history.service.ts)
Métodos:
- getCascadeData()          → GET /api/erica-evaluations/cascade
- getEvaluationsByFilters() → GET /api/erica-evaluations/reports/by-filters

Manejo de errores incluido

### 4. PAGE (page.tsx)
- Carga datos de cascada al montar
- Muestra skeleton mientras carga
- Renderiza HistoryContent con datos

### 5. UTILITIES (date-utils.ts)
- formatDate()        → DD/MM/YYYY
- formatDateTime()    → DD/MM/YYYY HH:MM
- getDaysDifference() → diferencia en días
- formatISO()         → convierte ISO a formato

---

## FLUJO DE USUARIO

1. Usuario accede a /erica-history
2. Se cargan datos de cascada (bimesters, courses, sections, weeks)
3. Usuario selecciona filtros (opcional todos)
4. Hace clic en "Buscar"
5. Se llama a getEvaluationsByFilters()
6. Se muestran:
   - Estadísticas generales
   - Lista de semanas con evaluaciones
   - Detalle completo de cada evaluación
7. Usuario puede expandir/contraer semanas
8. Puede limpiar filtros y buscar de nuevo

---

## RESPONSIVE DESIGN

✅ Mobile (xs-sm)
  - Grid de 1 columna en filtros
  - Tabla con scroll horizontal
  - Textos acortados
  - Padding reducido

✅ Tablet (md)
  - Grid de 2 columnas en filtros
  - Tabla mejorada
  - Más espacio

✅ Desktop (lg+)
  - Grid de 4 columnas en filtros
  - Tabla completa
  - Máximo espacio

---

## CONEXIÓN A API

Los endpoints esperados son:

```
GET  /api/erica-evaluations/cascade
GET  /api/erica-evaluations/reports/by-filters?bimesterId=X&courseId=Y...
```

Ambos devuelven respuestas con estructura:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## INTEGRACIÓN

Para agregar la página al menú, edita el archivo de navegación:
- src/layout/AppSidebar.tsx

Y agrega un ítem que apunte a: `/erica-history`
