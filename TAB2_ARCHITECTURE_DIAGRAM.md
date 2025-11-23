# 🏗️ Arquitectura TAB 2 - Smart Edit

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     ATTENDANCE LAYOUT                          │
│  (Tab 1 | Tab 2 | Tab 3 | Tab 4)                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ Selecciona TAB 2
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│         UpdateAttendance-Smart.tsx (Wrapper)                   │
│                                                                  │
│  - useAttendanceContext()                                       │
│  - useAuth()                                                    │
│  - Estado: consolidatedData, allowedStatuses, loading, error    │
│                                                                  │
│  - useEffect: Carga datos al montarse                           │
│  - handleStatusUpdate: Orquesta actualización                   │
└────────┬──────────────────────────┬────────────────────────────┘
         │                          │
         │ onStatusUpdate callback  │ data + allowedStatuses
         │                          ▼
         │         ┌──────────────────────────────────────────┐
         │         │ ConsolidatedAttendanceViewComponent      │
         │         │                                          │
         │         │ - Tabla expandible                       │
         │         │ - StudentRow x N                         │
         │         │   - Expandible por estudiante            │
         │         │   - Modo lectura: Original vs Actual     │
         │         │   - Modo edición: Dropdown + Input       │
         │         │   - Botones Save/Cancel                  │
         │         │                                          │
         │         │ State: editingCourse (per course)        │
         │         │ State: isExpanded (per student)          │
         └─────────▶ onStatusUpdate(enrollmentId, courseId,   │
                     newStatusId, reason)                      │
                  └──────────────────────────────────────────┘
                           │
                           │ await updateAttendanceStatus()
                           ▼
         ┌──────────────────────────────────────────┐
         │   attendance.service.ts                  │
         │                                          │
         │   updateAttendanceStatus(                │
         │     enrollmentId,                        │
         │     courseId,                            │
         │     statusId,                            │
         │     reason                               │
         │   )                                      │
         └──────────────┬───────────────────────────┘
                        │ api.patch(...)
                        ▼
         ┌──────────────────────────────────────────┐
         │  HTTP PATCH                              │
         │  /api/attendance/update-status           │
         │                                          │
         │  Body: {                                 │
         │    enrollmentId: number,                 │
         │    courseId: number,                     │
         │    statusId: number,                     │
         │    reason: string                        │
         │  }                                       │
         └──────────────┬───────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────────────────┐
         │  src/api/attendance/update-status/       │
         │  route.ts                                │
         │                                          │
         │  PATCH handler:                          │
         │  - Validar campos requeridos   ✅        │
         │  - Validar permisos            ⚠️ TODO   │
         │  - Actualizar en BD            ⚠️ TODO   │
         │  - Registrar auditoría         ⚠️ TODO   │
         │  - Retornar éxito/error       ✅        │
         └──────────────┬───────────────────────────┘
                        │ Response:
                        │ { success: true, data: {...} }
                        ▼
         ┌──────────────────────────────────────────┐
         │  UpdateAttendance-Smart.tsx              │
         │                                          │
         │  1. setConsolidatedData(null)            │
         │  2. Recargar: getSectionAttendance...()  │
         │  3. Actualizar UI                        │
         │  4. Mostrar: "✓ Actualizado"             │
         │  5. Limpiar después 3s                   │
         └──────────────────────────────────────────┘
```

---

## Diagrama de Estado (EditingState)

```
                    NORMAL (No editando)
                    /            \
                   /              \
                  ✏️ Click        Expandir
                  /                \
                 ▼                  ▼
          EDITANDO              EXPANDED (lectura)
         (por curso)                 │
             │                       │
    ┌────────┼────────┐             │
    │        │        │             │
    │    Cambios:    │             │
    │  - newStatusId │             │
    │  - reason      │             │
    │  - isSaving    │             │
    │                │             │
    ▼                ▼             │
  💾 SAVE        ✗ CANCEL         │
    │                │             │
    │  Guardando...  │             │
    │    ↓           │             │
    │  API Call      │             │
    │    ↓           │             │
  ✅ Éxito         Cancelar        │
    │                │             │
    └────────┬───────┘             │
             │                     │
             └─────────┬───────────┘
                       │
                    NORMAL
                  (Refrescado)
```

---

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│ INITIAL LOAD                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ AttendanceContext                                            │
│   ├─ selectedSectionId: 5                                   │
│   ├─ selectedDate: "2025-11-22"                             │
│   └─ selectedBimesterId: 3                                  │
│                                                              │
│                    ▼                                         │
│                                                              │
│ useEffect(() => {                                           │
│   loadData() {                                              │
│     1. getSectionAttendanceConsolidatedView(5, "2025-11-22")│
│     2. getAllowedAttendanceStatusesByRole(userId)           │
│   }                                                         │
│ })                                                          │
│                                                              │
│                    ▼                                         │
│                                                              │
│ State Updates:                                              │
│   ├─ consolidatedData: ConsolidatedAttendanceView           │
│   ├─ allowedStatuses: AttendanceStatus[]                    │
│   └─ loading: false                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EDITING FLOW                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ User: Clicks ✏️ Edit on Course X                           │
│                                                              │
│                    ▼                                         │
│                                                              │
│ handleEditClick(courseId, currentStatusId)                  │
│   setEditingCourse({                                        │
│     courseId: 10,                                           │
│     newStatusId: 5,  // current status                      │
│     reason: "",      // empty                               │
│     isSaving: false                                         │
│   })                                                        │
│                                                              │
│                    ▼                                         │
│                                                              │
│ UI: Muestra selector dropdown + input texto                 │
│                                                              │
│ User: Selecciona nuevo estado (statusId: 7)                 │
│       Ingresa razón: "Cambio de justificación"              │
│                                                              │
│ editingCourse = {                                           │
│   courseId: 10,                                             │
│   newStatusId: 7,    // <-- cambió                          │
│   reason: "Cambio de justificación",  // <-- cambió        │
│   isSaving: false                                           │
│ }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SAVING FLOW                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ User: Clicks 💾 Save                                        │
│                                                              │
│                    ▼                                         │
│                                                              │
│ handleSaveStatus()                                          │
│   setEditingCourse.isSaving = true  // Desabilita botones   │
│                                                              │
│                    ▼                                         │
│                                                              │
│ updateAttendanceStatus(                                     │
│   enrollmentId: 123,                                        │
│   courseId: 10,                                             │
│   statusId: 7,                                              │
│   reason: "Cambio de justificación"                         │
│ )                                                           │
│                                                              │
│                    ▼                                         │
│                                                              │
│ api.patch("/api/attendance/update-status", payload)        │
│                                                              │
│                    ▼                                         │
│                                                              │
│ Backend: Valida + Actualiza (TODO)                          │
│                                                              │
│                    ▼                                         │
│                                                              │
│ Response: { success: true, message: "...", data: {...} }    │
│                                                              │
│                    ▼                                         │
│                                                              │
│ setEditingCourse(null)  // Sale del modo edición            │
│ Recarga: getSectionAttendanceConsolidatedView()             │
│ consolidatedData = <nuevos datos con cambios>              │
│                                                              │
│                    ▼                                         │
│                                                              │
│ setSuccessMessage("✓ Estado actualizado...")               │
│ setTimeout(() => clearMessage(), 3000ms)                    │
│                                                              │
│                    ▼                                         │
│                                                              │
│ UI: Actualiza tabla + muestra alerta verde                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura de Datos - ConsolidatedAttendanceView

```typescript
ConsolidatedAttendanceView {
  ├─ sectionId: 5
  ├─ date: "2025-11-22"
  ├─ dayName: "Viernes"
  ├─ dayOfWeek: 5  // ISO 8601 (1=Mon, 5=Fri, 7=Sun)
  ├─ totalStudents: 30
  ├─ totalRecords: 28
  │
  └─ students: [{
       ├─ enrollmentId: 123
       ├─ studentName: "Juan Pérez"
       ├─ studentId: 45
       │
       └─ courses: [{
            ├─ courseId: 10
            ├─ courseName: "Matemáticas"
            ├─ originalStatus: "PRESENT"       // Código
            ├─ originalStatusName: "Presente"
            ├─ currentStatus: "ABSENT"         // ⚠️ Cambió
            ├─ currentStatusName: "Ausente"
            ├─ hasModifications: true
            │
            ├─ modificationDetails: {
            │  ├─ modifiedBy: "prof.torres@ids.edu.gt"
            │  ├─ modifiedAt: "2025-11-22T14:30:00Z"
            │  └─ reason: "Cambio de justificación"
            │}
            │
            ├─ recordedBy: "prof.torres@ids.edu.gt"
            ├─ recordedAt: "2025-11-22T14:00:00Z"
            └─ colorCode: "#ef4444"  // Red para ABSENT
          }]
     }]
}
```

---

## Estructura de Datos - EditingState

```typescript
interface EditingState {
  courseId: 10,                    // Qué curso se está editando
  newStatusId: 7,                  // Nuevo estado seleccionado
  reason: "Cambio de justificación",  // Razón capturada
  isSaving: false                  // Durante petición PATCH
}

// Estados posibles:
// null: No está editando nada
// { courseId, newStatusId: current, reason: "", isSaving: false }
//   → Acaba de entrar en modo edición
// { ..., newStatusId: 7, reason: "..." }
//   → Usuario cambió estado y/o ingresó razón
// { ..., isSaving: true }
//   → Guardando en servidor
```

---

## Props Flow

```
UpdateAttendance-Smart
    │
    ├─ state={consolidatedData}          ◄── Datos consolidados
    ├─ allowedStatuses={allowedStatuses} ◄── Opciones permitidas
    └─ onStatusUpdate={handleStatusUpdate} ◄── Callback para guardar
            │
            ▼
    ConsolidatedAttendanceViewComponent
        │
        ├─ Para cada StudentRow:
        │   ├─ student={student}
        │   ├─ allowedStatuses={allowedStatuses}
        │   └─ onStatusUpdate={onStatusUpdate}
        │       │
        │       ▼
        │   StudentRow
        │       │
        │       ├─ Renderea fila principal
        │       │
        │       ├─ Si expanded: Renderea filas de cursos
        │       │   ├─ Modo lectura: Muestra estados
        │       │   ├─ Modo edición: Dropdown + Input + Botones
        │       │   │
        │       │   └─ onClick Edit:
        │       │       setEditingCourse({
        │       │         courseId,
        │       │         newStatusId: statusActual,
        │       │         reason: "",
        │       │         isSaving: false
        │       │       })
        │       │
        │       └─ onClick Save:
        │           await onStatusUpdate(
        │             enrollmentId,
        │             courseId,
        │             newStatusId,
        │             reason
        │           )
```

---

## Componentes Relacionados en el Proyecto

```
src/
├─ components/
│  └─ features/
│     └─ attendance/
│        ├─ Tab1_DailyRegistration/
│        │  ├─ DailyRegistration.tsx          ✅ TAB 1
│        │  ├─ ExpandableStudentAttendanceTable.tsx
│        │  ├─ AttendanceStatusSelector.tsx
│        │  ├─ RegistrationSummary.tsx
│        │  └─ ExistingAttendanceSummary.tsx
│        │
│        ├─ Tab2_UpdateAttendance/
│        │  ├─ UpdateAttendance-Smart.tsx     ✅ NEW (Wrapper)
│        │  ├─ ConsolidatedAttendanceView.tsx ✅ MODIFIED (Edición)
│        │  └─ UpdateAttendance.tsx           (Old - Deprecated)
│        │
│        ├─ Tab4_Validations/
│        │  ├─ ValidationsChecker.tsx         ✅ TAB 4
│        │  └─ [7 validation components]
│        │
│        └─ AttendanceLayout.tsx              (Switch de tabs)
│
├─ context/
│  ├─ AttendanceContext.tsx
│  └─ AuthContext.tsx
│
├─ services/
│  └─ attendance.service.ts                  ✅ MODIFIED
│
├─ api/
│  └─ attendance/
│     └─ update-status/
│        └─ route.ts                         ✅ NEW
│
├─ types/
│  └─ attendance.types.ts
│
└─ hooks/
   └─ useAttendanceValidations.ts
```

---

## Errores Prevenidos

```
✅ HTML Validation
   └─ Nested <tbody> error: RESUELTO con <Fragment>

✅ TypeScript Errors
   └─ Props types: Todas las interfaces definidas

✅ Race Conditions
   └─ EditingState aislado por courseId

✅ UX Issues
   └─ Botones deshabilitados durante guardado
   └─ Mensajes de feedback inmediatos
   └─ Recarga automática después de actualizar

⚠️ Security (TODO en backend)
   └─ Validación de permisos
   └─ Auditoría de cambios
   └─ Verificación de datos
```

---

**Diagrama completo de arquitectura TAB 2 - Smart Edit**
