# AttendanceFilters Component - Guía de Uso

## ¿Dónde está el componente de selección?

El componente **`AttendanceFilters`** es el panel que ahora aparece **ANTES de los TABs** en la página de asistencia.

```
Gestión de Asistencia
        ↓
[FILTROS - Ciclo / Bimestre / Grado / Sección]  ← NUEVO
        ↓
[TABS - Validaciones / Registro Diario / ...]
```

---

## ¿Cómo se usa?

### Estructura de Flujo

```
1. Selecciona CICLO ESCOLAR
   ↓
2. Se cargan BIMESTRES del ciclo
   ↓
3. Selecciona BIMESTRE
   ↓
4. Se cargan GRADOS y SECCIONES
   ↓
5. Selecciona GRADO
   ↓
6. Se muestran SECCIONES de ese grado
   ↓
7. Selecciona SECCIÓN
   ↓
8. Se cargan los ESTUDIANTES de esa sección
   ↓
9. Ahora puedes usar los TABs para registrar asistencia
```

---

## Componentes y Sus Responsabilidades

### AttendanceFilters.tsx
**Ubicación**: `src/components/features/attendance/AttendanceFilters.tsx`

**Responsabilidades**:
- ✅ Panel de selección con 4 dropdowns
- ✅ Cascada de selecciones (ciclo → bimestre → grado → sección)
- ✅ Integración con `useAttendance` hook
- ✅ Integración con `useCycles` hook
- ✅ Loading states
- ✅ Resumen de selección

**Props**: Ninguna (todo viene de los hooks)

**Retorna**: Componente de UI con 4 selectores

---

### AttendancePageContent.tsx
**Ubicación**: `src/components/features/attendance/AttendancePageContent.tsx`

**Cambios**:
- ✅ Importa y renderiza `<AttendanceFilters />`
- ✅ Coloca los filtros ANTES de los TABs
- ✅ Mantiene la lógica de TABs sin cambios

---

## Estado Local vs Estado Global

### Estado Global (useAttendance hook)
```typescript
{
  selectedCycleId,      // Ciclo seleccionado
  selectedBimesterId,   // Bimestre seleccionado
  selectedSectionId,    // Sección seleccionada
  students,             // Estudiantes de esa sección
  ...
}
```

### Estado Local (AttendanceFilters component)
```typescript
bimesters,             // Array de bimestres del ciclo actual
sections,              // Array de secciones del bimestre actual
grades,                // Array de grados únicos
loadingBimesters,      // Loading state para bimestres
loadingSections        // Loading state para secciones
```

---

## Flujo de Datos

```
USER INTERACTION
    ↓
handleCycleChange(cycleId)
    ├─ attendanceActions.selectCycle(id)  [actualiza estado global]
    └─ setBimesters([])  [limpia estado local]
    ↓
useEffect detecta cycleId cambió
    ↓
Simula carga de bimestres (TODO: API real)
    ↓
setBimesters([...]) [actualiza estado local]
    ↓
RENDER: dropdown de bimestres habilitado
    ↓
USER selecciona bimestre
    ↓
[Repite el patrón para secciones/grados]
```

---

## TODO: Integraciones Pendientes

### 1. Cargar bimestres del API real
**Archivo**: `AttendanceFilters.tsx`, línea 55-64

Actualmente está simulado:
```typescript
// TODO: Reemplazar con llamada real a API
setTimeout(() => {
  setBimesters([...]);
}, 500);
```

**Debe ser reemplazado por**:
```typescript
const bimesters = await bimestersService.getBimestersByCycle(cycleId);
setBimesters(bimesters);
```

---

### 2. Cargar secciones del API real
**Archivo**: `AttendanceFilters.tsx`, línea 71-93

Actualmente está simulado:
```typescript
// TODO: Reemplazar con llamada real a API
setTimeout(() => {
  setSections([...]);
}, 500);
```

**Debe ser reemplazado por**:
```typescript
const sections = await sectionsService.getSectionsByBimester(bimesterId);
setSections(sections);
```

---

### 3. Cargar estudiantes del API real
**Archivo**: `useAttendance.ts` (hook existente)

Cuando se selecciona una sección, debe cargar estudiantes:
```typescript
useEffect(() => {
  if (selectedSectionId && selectedBimesterId) {
    fetchStudentsBySection(selectedSectionId, selectedBimesterId);
  }
}, [selectedSectionId, selectedBimesterId]);
```

---

## Prueba Manual

### Pasos para verificar que funciona:

1. **Navega a `/attendance`**
   - Deberías ver: "Gestión de Asistencia"

2. **Busca el panel de Filtros**
   - Deberías ver: 4 selectores (Ciclo, Bimestre, Grado, Sección)

3. **Selecciona un Ciclo**
   - El dropdown de Bimestre debe habilitarse
   - Deberías ver: "Cargando..." por 500ms
   - Luego deberías ver: 4 opciones de bimestres

4. **Selecciona un Bimestre**
   - Los dropdowns de Grado/Sección deben habilitarse
   - Deberías ver: "Cargando..." por 500ms
   - Luego deberías ver: Grados y Secciones cargadas

5. **Selecciona un Grado**
   - El dropdown de Sección debe mostrar secciones de ese grado

6. **Selecciona una Sección**
   - Deberías ver: Resumen azul con "Seleccionado: [Grado] • Sección [X]"
   - Los TABs de abajo deben recibir los datos

---

## Debugging

### Ver Estado Global
La página tiene un Debug Panel (en desarrollo):
```
Click: "Estado del Módulo (DEBUG)"
```

Busca estas propiedades:
- `selectedCycleId`: Debe ser el número del ciclo
- `selectedBimesterId`: Debe ser el número del bimestre
- `selectedSectionId`: Debe ser el número de la sección
- `students`: Debe ser un array con estudiantes

---

## Arquitectura Visual

```
┌─────────────────────────────────────────────────────┐
│         AttendancePageContent (Container)            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Header: "Gestión de Asistencia"                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │      AttendanceFilters (NEW)                 │   │
│  │  ┌────────┐┌────────┐┌────────┐┌────────┐   │   │
│  │  │ Ciclo  ││Bimestre││ Grado  ││Sección │   │   │
│  │  └────────┘└────────┘└────────┘└────────┘   │   │
│  │  Resumen: [Seleccionado info]                │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Tabs (Validaciones / Diario / ...)         │   │
│  │                                              │   │
│  │  [TAB 1] [TAB 2] [TAB 3] [TAB 4]            │   │
│  │                                              │   │
│  │  ┌──────────────────────────────────────┐   │   │
│  │  │  Contenido del TAB seleccionado      │   │   │
│  │  └──────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Checklist de Implementación

- [x] Crear componente AttendanceFilters
- [x] Integrar con AttendancePageContent
- [x] Agregar a barrel exports
- [x] Validar TypeScript (0 errors)
- [x] Validar ESLint (0 warnings)
- [ ] Integrar con API real para bimestres
- [ ] Integrar con API real para secciones
- [ ] Integrar con API real para estudiantes
- [ ] Testing manual completo
- [ ] Tests unitarios

---

## Próximas Fases

### FASE 3 - TAB 1 (Registro Diario)
Usará:
- `selectedCycleId` ✅
- `selectedBimesterId` ✅
- `selectedSectionId` ✅
- `students` array ✅

Todo listo para implementar el formulario de registro.

---

*Documento actualizado: 2025-01-22*
*Status: En Desarrollo ✅*
