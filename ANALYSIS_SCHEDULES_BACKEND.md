// ANALYSIS_SCHEDULES_BACKEND.md
# Análisis del Schema Backend para Schedules

## 📊 Tablas Principales

### 1. **Schedule** (Horarios)
```prisma
model Schedule {
  id                  Int      @id @default(autoincrement())
  sectionId           Int      // Sección donde se aplica el horario
  courseId            Int      // Curso que se imparte
  courseAssignmentId  Int      // CLAVE: Relación con el maestro asignado al curso
  dayOfWeek           Int      // Día de la semana (1=Lunes, 2=Martes, etc.)
  startTime           String   // Hora inicio "08:00"
  endTime             String   // Hora fin "09:00"
  classroom           String?  // Aula/Salón (opcional)
  
  teacherId           Int?     // Maestro actual (puede ser diferente si hay sustitución)
  substituteTeacherId Int?     // Maestro suplente (si hay ausencia)
  isSubstitution      Boolean  // Flag de sustitución
  substitutionReason  String?  // Razón de la sustitución
  substitutionDate    DateTime?// Fecha de la sustitución
  
  absenceId           Int?     // Si hay ausencia del maestro
  
  createdAt           DateTime
  updatedAt           DateTime
  
  // Relaciones
  section             Section
  course              Course
  courseAssignment    CourseAssignment  // ⭐ CRITICAL: Aquí está el maestro base
  teacher             User?             // Maestro actual
  substituteTeacher   User?             // Suplente
  absence             TeacherAbsence?
}
```

### 2. **ScheduleConfig** (Configuración de Horarios)
```prisma
model ScheduleConfig {
  id            Int      @id @default(autoincrement())
  sectionId     Int      @unique  // Una config por sección
  workingDays   Json     // Array de días laborales: [1, 2, 3, 4, 5]
  startTime     String   // Hora inicio de clases "07:00"
  endTime       String   // Hora fin de clases "17:00"
  classDuration Int      // Duración en minutos: 45, 50, 60
  breakSlots    Json     // Recreos/almuerzos: [{start: "10:30", end: "11:00", label: "RECREO"}]
  createdAt     DateTime
  updatedAt     DateTime
  
  section       Section  // Relación con sección
}
```

---

## 🔑 RELACIONES CRÍTICAS IDENTIFICADAS

### ⭐ **La Cadena de Relaciones Correcta:**

```
CourseAssignment (maestro + curso)
        ↓
    Schedule (usa courseAssignmentId para obtener maestro base)
        ↓
    El maestro del Schedule se obtiene de:
    - teacherId (maestro actual, igual a courseAssignment.teacherId normalmente)
    - substituteTeacherId (si hay sustitución, que reemplaza al teacherId)
```

### 📌 **Flujo de Datos:**

1. **Course-Assignments** (YA HECHO ✅)
   - Asigna: Maestro → Curso
   - Resultado: `CourseAssignment { courseId, teacherId }`

2. **Schedules** (LO NUEVO)
   - Recibe: `CourseAssignment` → obtiene curso + maestro base
   - Input del usuario: Arrastra CURSO (que contiene courseAssignmentId)
   - Drop en grid: Crea `Schedule` con:
     - `courseAssignmentId` ← de donde obtiene maestro y curso
     - `dayOfWeek`, `startTime`, `endTime`, `classroom`

3. **Sustituciones** (Futuro)
   - Si maestro falta: `substituteTeacherId` reemplaza a `teacherId`
   - `absenceId` registra la razón

---

## ✅ LO QUE ENTENDÍ

### **Frontend Flow (Propuesto):**

```
PASO 1: En Course-Assignments (YA LISTO)
├─ Se asigna: Matemáticas → Maestro Juan
└─ Resultado: CourseAssignment { id: 1, courseId: 5, teacherId: 3 }

PASO 2: En Schedules (NUEVO)
├─ ScheduleConfig crea grilla dinámica:
│  ├─ workingDays: [1,2,3,4,5] (Lun-Vie)
│  ├─ classDuration: 45 minutos
│  ├─ breakSlots: [{start:"10:30", end:"11:00", label:"RECREO"}]
│  └─ Grid: Lun-Vie × 07:00-17:00
│
├─ Sidebar muestra CURSOS (del section)
│  ├─ 📚 Matemáticas
│  │   └─ 👤 Juan Pérez (del courseAssignment)
│  ├─ 📚 Español
│  │   └─ 👤 María García
│  └─ (etc)
│
├─ Usuario arrastra CURSO a grid
│  ├─ Drag data: { courseAssignmentId: 1, courseId: 5, teacherId: 3 }
│  └─ Muestra preview: "Matemáticas - Juan Pérez"
│
└─ Drop crea Schedule:
   {
     sectionId: 1,
     courseId: 5,
     courseAssignmentId: 1,    ← CLAVE: de aquí vienen course + teacher
     teacherId: 3,             ← del courseAssignment
     dayOfWeek: 1,             ← Lunes
     startTime: "08:00",       ← Usuario define
     endTime: "08:45",         ← Basado en classDuration
     classroom: "201"
   }
```

---

## 📋 CAMBIOS EN FRONTEND

### **Tipos TypeScript a Actualizar:**

```typescript
// schedules.types.ts

// 1. El DragItem para drag & drop
export interface DragItem {
  id: number;
  type: 'course-with-assignment';  // Cambio: antes era 'course'
  name: string;
  data: {
    courseAssignmentId: number;    // ← CLAVE
    courseId: number;
    teacherId: number;
    courseName: string;
    teacherName: string;
  }
}

// 2. TempSchedule (antes de guardarse)
export interface TempSchedule {
  id: string;
  sectionId: number;
  courseAssignmentId: number;      // ← CLAVE: es el identificador
  courseId: number;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classroom?: string;
  isTemp: true;
  // Info visual
  course?: { name: string };
  teacher?: { fullName: string };
}
```

### **Backend Endpoints Necesarios:**

```typescript
// GET /api/schedules/config?sectionId=1
Response: {
  id: 1,
  workingDays: [1,2,3,4,5],
  startTime: "07:00",
  endTime: "17:00",
  classDuration: 45,
  breakSlots: [{start:"10:30", end:"11:00", label:"RECREO"}]
}

// GET /api/course-assignments?sectionId=1
Response: [
  {
    id: 1,
    courseId: 5,
    teacherId: 3,
    assignmentType: "titular",
    course: { id: 5, name: "Matemáticas", code: "MAT-001" },
    teacher: { id: 3, givenNames: "Juan", lastNames: "Pérez", fullName: "Juan Pérez" }
  },
  ...
]

// GET /api/schedules?sectionId=1&dayOfWeek=1
Response: [
  {
    id: 1,
    sectionId: 1,
    courseAssignmentId: 1,
    courseId: 5,
    teacherId: 3,
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "08:45",
    classroom: "201",
    course: { name: "Matemáticas" },
    teacher: { fullName: "Juan Pérez" }
  },
  ...
]

// POST /api/schedules (crear Schedule)
Body: {
  sectionId: 1,
  courseAssignmentId: 1,
  dayOfWeek: 1,
  startTime: "08:00",
  endTime: "08:45",
  classroom: "201"
}

// PUT /api/schedules/:id (actualizar Schedule)
// DELETE /api/schedules/:id
```

---

## 🎯 COMPONENTES A CREAR/MODIFICAR

| Componente | Acción | Razón |
|---|---|---|
| `DraggableCourse` | ✏️ Rename a `DraggableCourseAssignment` | Ahora arrastra assignment (con maestro) |
| `DraggableTeacher` | ❌ ELIMINAR | Ya no se necesita (maestro está en assignment) |
| `DroppableTimeSlot` | ✏️ Mejorar | Recibe courseAssignmentId como identificador |
| `ScheduleSidebar` | ✏️ Refactorizar | Muestra CourseAssignments en lugar de courses + teachers |
| `ScheduleGrid` | ✅ Mantener | Grid dinámica con workingDays/classDuration |
| `ScheduleConfigModal` | ✅ Mantener | Configuración de horarios sigue igual |
| `ContentSchedules` | ✏️ Refactorizar | Cambiar flujo de datos |

---

## 📊 ESTRUCTURA DE CARPETAS (Propuesta)

```
src/components/features/schedules/
├── README.md
├── index.ts
├── ContentSchedules.tsx          # Principal
├── ScheduleCalendarView.tsx      # Vista de calendario
├── calendar/
│   ├── index.ts
│   ├── ScheduleGrid.tsx          # ✅ Mantener
│   ├── ScheduleHeader.tsx        # ✅ Mantener
│   ├── ScheduleSidebar.tsx       # ✏️ Refactorizar (muestre assignments)
│   ├── DroppableTimeSlot.tsx     # ✏️ Mejorar
│   ├── ScheduleConfigModal.tsx   # ✅ Mantener
│   └── TimeSlotGenerator.ts      # Helper para generar slots dinámicamente
└── draggable/
    ├── index.ts
    ├── DraggableCourseAssignment.tsx  # ✏️ Nuevo nombre (antes DraggableCourse)
    └── DraggableSchedule.tsx      # ✅ Mantener (para schedules ya creados)
```

---

## ✅ CONFIRMACIÓN DE RESPUESTAS

### 1️⃣ **¿El `courseAssignmentId` siempre existe?**
**✅ SÍ, es OBLIGATORIO**
- Todo Schedule DEBE tener un courseAssignmentId válido
- Restricción única: `@@unique([courseAssignmentId, dayOfWeek, startTime])`
- No puede haber duplicados del mismo assignment en el mismo slot

---

### 2️⃣ **¿`teacherId` en Schedule es redundante?**
**⚠️ NO ES REDUNDANTE - Tiene Propósito Específico**

```typescript
// Escenarios posibles:
schedule.teacherId === courseAssignment.teacherId
  → ✅ Caso normal: maestro titular dando su clase

schedule.teacherId !== courseAssignment.teacherId
  → ⚠️ Caso de sustitución: maestro titular ausente, otro lo reemplaza

schedule.substituteTeacherId === schedule.teacherId
  → 🔄 Indica que hay un suplente cubriendo
```

**Conclusión:**
- `courseAssignment.teacherId` = Maestro asignado al curso (BASE)
- `schedule.teacherId` = Maestro que DA esa clase específica (puede cambiar)
- `schedule.substituteTeacherId` = Suplente si hay ausencia (futuro)

**Implicación para Frontend:**
- Al crear un Schedule, normalmente: `schedule.teacherId = courseAssignment.teacherId`
- Pero permite cambios posteriores si hay ausencias/sustituciones

---

### 3️⃣ **¿El backend trae `courseAssignment` completo?**
**✅ SÍ, con TODOS los datos**

```typescript
// Endpoint: GET /api/course-assignments?sectionId=X
Response incluye:
{
  id: 1,
  courseId: 5,
  teacherId: 3,
  assignmentType: "titular",
  course: {
    id: 5,
    code: "MAT-001",
    name: "Matemáticas",
    area: "Matemáticas",
    color: "#FF6B6B"
  },
  teacher: {
    id: 3,
    givenNames: "Juan",
    lastNames: "Pérez",
    fullName: "Juan Pérez"  // ← Completo
  }
}
```

**Conclusión:**
- ✅ Frontend recibe CourseAssignment con Course + Teacher complete
- ✅ Perfecto para mostrar en sidebar: "📚 Matemáticas - 👤 Juan Pérez"
- ✅ Ya trae todo lo necesario para el drag & drop

---

### 4️⃣ **¿Las grillas son por sección?**
**✅ SÍ, una ScheduleConfig POR SECCIÓN (relación 1:1)**

```typescript
// ScheduleConfig estructura:
{
  id: 1,
  sectionId: 1,      // ← UNIQUE: Solo una config por sección
  workingDays: [1,2,3,4,5],      // Lun-Vie
  startTime: "07:00",            // Inicio de jornada
  endTime: "17:00",              // Fin de jornada
  classDuration: 45,             // Minutos por clase
  breakSlots: [
    { start: "10:30", end: "11:00", label: "RECREO" },
    { start: "13:00", end: "14:00", label: "ALMUERZO" }
  ]
}
```

**Implicación:**
- Cada sección tiene su propia configuración de horarios
- La grilla se genera DINÁMICAMENTE basada en esto
- Ejemplo: Sección A (07:00-17:00) vs Sección B (08:00-16:00)

---

### 5️⃣ **¿Se pueden crear schedules sin llenar TODOS los slots?**
**✅ SÍ, se permiten grillas parciales (con huecos)**

```typescript
// Escenarios válidos:
1. Curso ocupado L/M/Mi (no J/V)
   └─ Valid: 3 schedules solo esos días

2. Curso con múltiples horarios:
   └─ Matemáticas: L 8:00-8:45, L 13:00-13:45, etc.

3. Grilla con espacios vacíos:
   └─ Algunos slots sin clases asignadas

4. Cursos parciales (solo medio día):
   └─ Clases solo por la mañana, tarde vacía
```

**Restricciones:**
- ❌ NO puede haber duplicado: `[courseAssignmentId, dayOfWeek, startTime]` único
- ✅ SÍ puede haber espacios sin llenar
- ✅ SÍ se permite horarios parciales

**Implicación Visual:**
```
    LUN    MAR    MIÉ    JUE    VIE
07:00 [ ]    [ ]    [ ]    [ ]    [ ]
08:00 [MAT]  [MAT]  [MAT]  [MAT]  [ ]  ← No hay clase viernes
09:00 [ESP]  [ ]    [ESP]  [ESP]  [ESP]  ← Martes sin español
10:00 [REC]  [REC]  [REC]  [REC]  [REC]  ← Recreo (breakSlot)
```

---

## 🎯 RESUMEN FINAL CONFIRMADO

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **courseAssignmentId** | ✅ Obligatorio | Llave para obtener maestro + curso |
| **teacherId** | ⚠️ Dinámico | Puede cambiar si hay sustituciones |
| **Backend Data** | ✅ Completo | Trae courseAssignment + course + teacher |
| **Grilla** | ✅ Por sección | 1:1 ScheduleConfig:Section |
| **Slots Vacíos** | ✅ Permitidos | Grillas parciales válidas |

---

## 🚀 PROCEDER CON MIGRACIÓN

**Confirmado todo. Ahora sí procedo con:**

1. ✅ Crear estructura `features/schedules`
2. ✅ Migrar componentes de calendario
3. ✅ Refactorizar drag & drop (solo CourseAssignment, no Teacher)
4. ✅ Mejorar ScheduleSidebar (mostrar assignments)
5. ✅ Actualizar tipos TypeScript
6. ✅ Crear documentación
7. ✅ Verificar compilación

**¿Iniciamos la migración?**
