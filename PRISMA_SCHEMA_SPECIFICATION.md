# 🗄️ PRISMA SCHEMA - Schedules Module

## Overview

Esquema Prisma recomendado para soportar el módulo de horarios del frontend.

---

## 📋 Models Requeridos

```prisma
// ============================================================================
// SCHEDULE CONFIG MODEL
// ============================================================================
// Configuración de horario (1:1 con Section)
// Define: días laborales, horarios, duración de clase, breaks
// ============================================================================

model ScheduleConfig {
  id                Int       @id @default(autoincrement())
  section           Section   @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId         Int       @unique  // Uno-a-uno: una config por sección
  
  // Horario del día
  startTime         String    @db.VarChar(5)  // "07:00"
  endTime           String    @db.VarChar(5)  // "17:00"
  
  // Configuración
  classDuration     Int       // Minutos (45, 50, etc)
  workingDays       Int[]     // [1,2,3,4,5] (1=Lunes, 7=Domingo)
  
  // Breaks (Recreo, Almuerzo)
  breakSlots        BreakSlot[]
  
  // Auditoría
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  createdBy         Int?      // User ID
  
  @@index([sectionId])
  @@index([createdAt])
}

// ============================================================================
// BREAK SLOT (Embedded in ScheduleConfig)
// ============================================================================

type BreakSlot {
  start    String  // "10:00"
  end      String  // "10:15"
  label    String? // "RECREO", "ALMUERZO"
}

// ============================================================================
// SCHEDULE MODEL (Main)
// ============================================================================
// Horario de clase
// PRIMARY KEY: courseAssignmentId (no id)
// ============================================================================

model Schedule {
  id                    Int           @id @default(autoincrement())
  
  // PRIMARY IDENTIFIER
  courseAssignment      CourseAssignment  @relation("ScheduleCourseAssignment", fields: [courseAssignmentId], references: [id], onDelete: Cascade)
  courseAssignmentId    Int               // PRIMARY - MUST EXIST
  
  // OPTIONAL: Maestro actual (puede ser diferente del assignment si hay sustitución)
  teacher               User?             @relation("ScheduleTeacher", fields: [teacherId], references: [id])
  teacherId             Int?              // Nullable: si null, usar del courseAssignment
  
  // Ubicación
  section               Section       @relation("ScheduleSection", fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId             Int
  
  classroom             String?       // "A-101", "B-5", etc
  
  // Timing
  dayOfWeek             Int           // 1-7 (1=Lunes, 7=Domingo)
  startTime             String        @db.VarChar(5)  // "08:00"
  endTime               String        @db.VarChar(5)  // "08:45"
  
  // Auditoría
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  createdBy             Int?          // User ID
  
  // Constraints
  @@unique([courseAssignmentId, dayOfWeek, startTime])  // Único por asignación + día + hora
  @@index([sectionId])
  @@index([teacherId])
  @@index([courseAssignmentId])
  @@index([dayOfWeek])
  @@index([createdAt])
}

// ============================================================================
// COURSE ASSIGNMENT MODEL
// ============================================================================
// Asignación de maestro a curso en una sección
// ============================================================================

model CourseAssignment {
  id            Int       @id @default(autoincrement())
  
  section       Section   @relation("SectionCourseAssignments", fields: [sectionId], references: [id], onDelete: Cascade)
  sectionId     Int
  
  course        Course    @relation("CourseCourseAssignments", fields: [courseId], references: [id], onDelete: Cascade)
  courseId      Int
  
  teacher       User      @relation("UserCourseAssignments", fields: [teacherId], references: [id], onDelete: Cascade)
  teacherId     Int
  
  // Tipo de asignación
  assignmentType String   @db.VarChar(20)  // "titular", "apoyo", "temporal", "suplente"
  
  // Relación con horarios
  schedules     Schedule[]  @relation("ScheduleCourseAssignment")
  
  // Auditoría
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Constraints
  @@unique([sectionId, courseId, teacherId, assignmentType])  // Evitar duplicados
  @@index([sectionId])
  @@index([courseId])
  @@index([teacherId])
}

// ============================================================================
// REQUIRED EXISTING MODELS (Referenciadas)
// ============================================================================

model Section {
  id                        Int           @id @default(autoincrement())
  name                      String        // "6A", "7B", etc
  capacity                  Int
  grade                     Grade         @relation(fields: [gradeId], references: [id])
  gradeId                   Int
  
  // Nuevas relaciones
  scheduleConfig            ScheduleConfig? @relation("SectionScheduleConfig")
  schedules                 Schedule[]        @relation("ScheduleSection")
  courseAssignments         CourseAssignment[] @relation("SectionCourseAssignments")
  
  createdAt                 DateTime      @default(now())
  updatedAt                 DateTime      @updatedAt
  
  @@index([gradeId])
}

model Course {
  id                    Int       @id @default(autoincrement())
  code                  String    @unique
  name                  String
  area                  String?   // "Ciencias", "Lengua", etc
  color                 String?   // "#FF5733"
  isCore                Boolean   @default(false)
  
  // Nuevas relaciones
  courseAssignments     CourseAssignment[] @relation("CourseCourseAssignments")
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([code])
}

model User {
  id                    Int       @id @default(autoincrement())
  givenNames            String
  lastNames             String
  email                 String    @unique
  
  // Nuevas relaciones
  courseAssignmentsAsTeacher  CourseAssignment[] @relation("UserCourseAssignments")
  schedules             Schedule[] @relation("ScheduleTeacher")
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([email])
}

model Grade {
  id                    Int       @id @default(autoincrement())
  name                  String    // "6to", "7mo", etc
  level                 String
  order                 Int
  
  sections              Section[] @relation()
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

// ============================================================================
// OPTIONAL: AUDIT LOG (Para tracking de cambios)
// ============================================================================

model ScheduleAuditLog {
  id                    Int       @id @default(autoincrement())
  
  schedule              Schedule?     @relation(fields: [scheduleId], references: [id], onDelete: SetNull)
  scheduleId            Int?
  
  action                String        // "created", "updated", "deleted"
  previousData          Json?         // Datos anteriores
  newData               Json?         // Datos nuevos
  changedBy             Int?          // User ID
  
  createdAt             DateTime  @default(now())
  
  @@index([scheduleId])
  @@index([createdAt])
}
```

---

## 🔄 Migraciones Prisma

### Paso 1: Crear los modelos
```bash
npx prisma migrate dev --name add_schedules_models
```

### Paso 2: Generar tipos
```bash
npx prisma generate
```

---

## 🧪 Seeds Recomendados

```typescript
// prisma/seeds/schedules.seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSchedules() {
  // 1. Obtener sección
  const section = await prisma.section.findFirst();
  if (!section) throw new Error('No section found');

  // 2. Crear ScheduleConfig
  const config = await prisma.scheduleConfig.create({
    data: {
      sectionId: section.id,
      startTime: '07:00',
      endTime: '17:00',
      classDuration: 45,
      workingDays: [1, 2, 3, 4, 5],
      breakSlots: [
        { start: '10:00', end: '10:15', label: 'RECREO' },
        { start: '13:15', end: '14:00', label: 'ALMUERZO' },
      ],
    },
  });

  console.log('✅ ScheduleConfig created:', config);

  // 3. Obtener curso y maestro
  const course = await prisma.course.findFirst();
  const teacher = await prisma.user.findFirst();

  if (!course || !teacher) throw new Error('Course or teacher not found');

  // 4. Crear CourseAssignment
  const assignment = await prisma.courseAssignment.create({
    data: {
      sectionId: section.id,
      courseId: course.id,
      teacherId: teacher.id,
      assignmentType: 'titular',
    },
  });

  console.log('✅ CourseAssignment created:', assignment);

  // 5. Crear Schedule
  const schedule = await prisma.schedule.create({
    data: {
      courseAssignmentId: assignment.id,
      sectionId: section.id,
      dayOfWeek: 1,
      startTime: '08:00',
      endTime: '08:45',
      classroom: 'A-101',
    },
  });

  console.log('✅ Schedule created:', schedule);
}

seedSchedules().catch(console.error);
```

---

## 🔍 Queries Comunes

### Obtener horarios de una sección con detalles
```typescript
const schedules = await prisma.schedule.findMany({
  where: { sectionId: 5 },
  include: {
    courseAssignment: {
      include: {
        course: true,
        teacher: true,
      },
    },
    section: true,
    teacher: true,
  },
  orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
});
```

### Verificar disponibilidad de maestro
```typescript
const conflicts = await prisma.schedule.findMany({
  where: {
    teacherId: 3,
    dayOfWeek: 1,
    OR: [
      {
        startTime: { lte: '08:45' },
        endTime: { gt: '08:00' },
      },
    ],
  },
});
```

### Crear múltiples horarios (transacción)
```typescript
const result = await prisma.$transaction(async (tx) => {
  const schedules = await Promise.all(
    schedulesToCreate.map((schedule) =>
      tx.schedule.create({ data: schedule })
    )
  );
  return schedules;
});
```

---

## ⚠️ Validaciones en Prisma

### Antes de insertar Schedule:

```typescript
// 1. Verificar courseAssignment existe
const assignment = await prisma.courseAssignment.findUnique({
  where: { id: courseAssignmentId },
});
if (!assignment) throw new Error('CourseAssignment no existe');

// 2. Verificar ScheduleConfig existe
const config = await prisma.scheduleConfig.findUnique({
  where: { sectionId: assignment.sectionId },
});
if (!config) throw new Error('ScheduleConfig no existe');

// 3. Validar no es break time
const isBreakTime = config.breakSlots.some(
  (slot) => startTime >= slot.start && endTime <= slot.end
);
if (isBreakTime) throw new Error('No puede crear horario en break');

// 4. Validar no hay conflicto de maestro
const conflict = await prisma.schedule.findFirst({
  where: {
    teacherId: teacherId || assignment.teacherId,
    dayOfWeek,
    NOT: [{ id }],  // Excluir el horario actual si es update
    OR: [
      {
        startTime: { lte: startTime },
        endTime: { gt: startTime },
      },
      {
        startTime: { lt: endTime },
        endTime: { gte: endTime },
      },
    ],
  },
});
if (conflict) throw new Error('Conflicto de horario del maestro');

// 5. Crear
const schedule = await prisma.schedule.create({
  data: { courseAssignmentId, sectionId, dayOfWeek, startTime, endTime },
});
```

---

## 📊 Índices Importantes

```prisma
// Ya definidos en los models:
@@index([sectionId])
@@index([courseAssignmentId])
@@index([teacherId])
@@index([dayOfWeek])
@@unique([courseAssignmentId, dayOfWeek, startTime])
```

---

## 🔐 Permisos por Acción

Implementar en controllers con `@Permission()` decorador:

```typescript
// GET
@Get('/schedules')
@Permission('schedule:read')
async getSchedules() { }

// POST
@Post('/schedules')
@Permission('schedule:create')
async createSchedule() { }

// PATCH
@Patch('/schedules/:id')
@Permission('schedule:update')
async updateSchedule() { }

// DELETE
@Delete('/schedules/:id')
@Permission('schedule:delete')
async deleteSchedule() { }

// BATCH
@Post('/schedules/batch')
@Permission('schedule:batch_create')
async batchSaveSchedules() { }
```

---

## 📝 Checklists Backend

### Modelos Prisma
- [ ] ScheduleConfig creado
- [ ] Schedule creado
- [ ] CourseAssignment creado
- [ ] Relaciones configuradas
- [ ] Índices creados
- [ ] Migraciones ejecutadas

### Controllers
- [ ] GET /api/schedule-configs
- [ ] GET /api/schedule-configs/:id
- [ ] GET /api/schedule-configs/section/:sectionId
- [ ] POST /api/schedule-configs
- [ ] PATCH /api/schedule-configs/:id
- [ ] DELETE /api/schedule-configs/:id
- [ ] GET /api/schedules
- [ ] GET /api/schedules/:id
- [ ] GET /api/schedules/section/:sectionId
- [ ] GET /api/schedules/teacher/:teacherId
- [ ] POST /api/schedules
- [ ] PATCH /api/schedules/:id
- [ ] DELETE /api/schedules/:id
- [ ] DELETE /api/schedules/section/:sectionId
- [ ] POST /api/schedules/batch
- [ ] GET /api/schedules/form-data
- [ ] GET /api/schedules/teacher-availability

### Services/Lógica de Negocio
- [ ] Validación courseAssignmentId
- [ ] Validación conflictos de maestro
- [ ] Validación conflictos de aula
- [ ] Validación ScheduleConfig existe
- [ ] Validación no en break time
- [ ] Batch transaction handling
- [ ] Error handling y logging

### Tests
- [ ] Unit tests controllers
- [ ] Integration tests endpoints
- [ ] Validation tests
- [ ] Batch operations tests

---

**Documento Versión**: 1.0  
**Última Actualización**: 5 de Noviembre 2025
