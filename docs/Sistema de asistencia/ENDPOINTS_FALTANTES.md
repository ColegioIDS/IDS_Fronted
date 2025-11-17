# Endpoints Faltantes - Attendance Controller

Este documento especifica los endpoints que deben agregarse al `attendance.controller.ts` del backend.

---

## 1. GET /api/attendance/holidays

### Descripción
Obtiene la lista completa de días festivos (holidays) para un bimestre específico o todos los holidays del ciclo activo.

### Ruta
```
GET /api/attendance/holidays
```

### Permisos
```typescript
@Permissions('attendance', 'read')
```

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `bimesterId` | number | No | ID del bimestre. Si no se proporciona, retorna holidays de todos los bimestres del ciclo activo |

### Respuesta Exitosa (200 OK)

```typescript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Día de Todos los Santos",
      "date": "2025-11-01",
      "isRecovered": false,
      "recoveryDate": null,
      "bimesterId": 3,
      "bimester": {
        "id": 3,
        "name": "Tercer Bimestre",
        "startDate": "2025-09-01",
        "endDate": "2025-10-31"
      },
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Día de la Independencia",
      "date": "2025-09-15",
      "isRecovered": false,
      "recoveryDate": null,
      "bimesterId": 3,
      "bimester": {
        "id": 3,
        "name": "Tercer Bimestre",
        "startDate": "2025-09-01",
        "endDate": "2025-10-31"
      },
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "count": 2,
  "message": "Holidays retrieved successfully"
}
```

### Respuesta de Error (404 Not Found)

```typescript
{
  "success": false,
  "message": "No holidays found for bimester 5",
  "statusCode": 404
}
```

### Respuesta de Error (400 Bad Request)

```typescript
{
  "success": false,
  "message": "Invalid bimesterId",
  "statusCode": 400
}
```

### Ejemplo de Uso

```bash
# Obtener todos los holidays del ciclo activo
GET /api/attendance/holidays

# Obtener holidays de un bimestre específico
GET /api/attendance/holidays?bimesterId=3
```

### Lógica del Backend

```typescript
@Get('holidays')
@HttpCode(HttpStatus.OK)
@Permissions('attendance', 'read')
async getHolidays(
  @Query('bimesterId') bimesterId?: string,
) {
  const parsedBimesterId = bimesterId ? parseInt(bimesterId, 10) : undefined;

  if (bimesterId && isNaN(parsedBimesterId!)) {
    throw new BadRequestException('Invalid bimesterId');
  }

  const holidays = await this.attendanceService.getHolidays(parsedBimesterId);

  return {
    success: true,
    data: holidays,
    count: holidays.length,
    message: 'Holidays retrieved successfully',
  };
}
```

### Servicio Requerido

Necesitas implementar en `attendance.service.ts`:

```typescript
async getHolidays(bimesterId?: number): Promise<Holiday[]> {
  // Si se proporciona bimesterId, filtrar por ese bimestre
  if (bimesterId) {
    return this.prisma.holiday.findMany({
      where: {
        bimesterId: bimesterId,
      },
      include: {
        bimester: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  // Si no se proporciona bimesterId, obtener todos los holidays del ciclo activo
  const activeCycle = await this.getActiveCycle();

  return this.prisma.holiday.findMany({
    where: {
      bimester: {
        cycleId: activeCycle.id,
      },
    },
    include: {
      bimester: true,
    },
    orderBy: {
      date: 'asc',
    },
  });
}
```

### Modelo Prisma Esperado

```prisma
model Holiday {
  id           Int       @id @default(autoincrement())
  name         String    @db.VarChar(100)
  date         DateTime  @db.Date
  isRecovered  Boolean   @default(false)
  recoveryDate DateTime? @db.Date
  bimesterId   Int
  bimester     Bimester  @relation(fields: [bimesterId], references: [id])
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@map("holidays")
}
```

---

## 2. GET /api/attendance/bimester/active

### Descripción
Obtiene el bimestre activo actual basándose en la fecha actual.

### Ruta
```
GET /api/attendance/bimester/active
```

### Permisos
```typescript
@Permissions('attendance', 'read')
```

### Query Parameters
Ninguno

### Respuesta Exitosa (200 OK)

```typescript
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Tercer Bimestre",
    "startDate": "2025-09-01T00:00:00.000Z",
    "endDate": "2025-10-31T23:59:59.000Z",
    "cycleId": 1,
    "order": 3,
    "isActive": true,
    "cycle": {
      "id": 1,
      "name": "Ciclo Escolar 2025",
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-10-31T23:59:59.000Z"
    },
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  },
  "message": "Active bimester found"
}
```

### Respuesta de Error (404 Not Found)

```typescript
{
  "success": false,
  "message": "No active bimester found for current date",
  "statusCode": 404
}
```

### Ejemplo de Uso

```bash
GET /api/attendance/bimester/active
```

### Lógica del Backend

```typescript
@Get('bimester/active')
@HttpCode(HttpStatus.OK)
@Permissions('attendance', 'read')
async getActiveBimester() {
  const bimester = await this.attendanceService.getActiveBimester();

  return {
    success: true,
    data: bimester,
    message: 'Active bimester found',
  };
}
```

### Servicio Requerido

```typescript
async getActiveBimester(): Promise<Bimester> {
  const today = new Date();

  const bimester = await this.prisma.bimester.findFirst({
    where: {
      startDate: {
        lte: today,
      },
      endDate: {
        gte: today,
      },
      isActive: true,
    },
    include: {
      cycle: true,
    },
  });

  if (!bimester) {
    throw new NotFoundException('No active bimester found for current date');
  }

  return bimester;
}
```

---

## 3. GET /api/attendance/enrollment/section/:sectionId/students

### Descripción
Obtiene todos los estudiantes matriculados (enrollments) en una sección específica para el ciclo activo. Más simple que el endpoint existente `enrollment/section/:sectionId/cycle/:cycleId/active` cuando solo necesitas la lista básica.

### Ruta
```
GET /api/attendance/enrollment/section/:sectionId/students
```

### Permisos
```typescript
@Permissions('attendance', 'read')
```

### Path Parameters

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `sectionId` | number | ID de la sección |

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `includeInactive` | boolean | No | Incluir estudiantes inactivos. Default: false |

### Respuesta Exitosa (200 OK)

```typescript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentId": 101,
      "sectionId": 1,
      "cycleId": 1,
      "enrollmentDate": "2025-01-15T00:00:00.000Z",
      "status": "active",
      "student": {
        "id": 101,
        "firstName": "Juan Carlos",
        "lastName": "Pérez López",
        "sireCode": "SIRE001",
        "email": "juan.perez@student.edu.gt",
        "birthDate": "2010-05-15T00:00:00.000Z"
      },
      "section": {
        "id": 1,
        "name": "6to A",
        "gradeId": 6,
        "capacity": 35
      }
    }
    // ... más enrollments
  ],
  "count": 30,
  "message": "Enrollments retrieved successfully"
}
```

### Respuesta de Error (404 Not Found)

```typescript
{
  "success": false,
  "message": "Section not found",
  "statusCode": 404
}
```

### Ejemplo de Uso

```bash
# Solo estudiantes activos
GET /api/attendance/enrollment/section/1/students

# Incluir inactivos
GET /api/attendance/enrollment/section/1/students?includeInactive=true
```

### Lógica del Backend

```typescript
@Get('enrollment/section/:sectionId/students')
@HttpCode(HttpStatus.OK)
@Permissions('attendance', 'read')
async getEnrollmentsBySection(
  @Param('sectionId') sectionId: string,
  @Query('includeInactive') includeInactive?: string,
) {
  const parsedSectionId = parseInt(sectionId, 10);

  if (isNaN(parsedSectionId)) {
    throw new BadRequestException('Invalid sectionId');
  }

  const enrollments = await this.attendanceService.getEnrollmentsBySection(
    parsedSectionId,
    includeInactive === 'true'
  );

  return {
    success: true,
    data: enrollments,
    count: enrollments.length,
    message: 'Enrollments retrieved successfully',
  };
}
```

### Servicio Requerido

```typescript
async getEnrollmentsBySection(
  sectionId: number,
  includeInactive: boolean = false
): Promise<Enrollment[]> {
  // Verificar que la sección existe
  const section = await this.prisma.section.findUnique({
    where: { id: sectionId },
  });

  if (!section) {
    throw new NotFoundException('Section not found');
  }

  // Obtener ciclo activo
  const activeCycle = await this.getActiveCycle();

  // Construir filtros
  const where: any = {
    sectionId: sectionId,
    cycleId: activeCycle.id,
  };

  if (!includeInactive) {
    where.status = 'active';
  }

  return this.prisma.enrollment.findMany({
    where,
    include: {
      student: true,
      section: {
        include: {
          grade: true,
        },
      },
    },
    orderBy: {
      student: {
        lastName: 'asc',
      },
    },
  });
}
```

---

## Resumen de Endpoints a Crear

| # | Método | Ruta | Prioridad | Descripción |
|---|--------|------|-----------|-------------|
| 1 | GET | `/api/attendance/holidays` | **ALTA** | Lista de holidays por bimestre |
| 2 | GET | `/api/attendance/bimester/active` | **MEDIA** | Bimestre activo actual |
| 3 | GET | `/api/attendance/enrollment/section/:sectionId/students` | **BAJA** | Enrollments de una sección (simplificado) |

---

## Notas de Implementación

### Validaciones Comunes

Todos los endpoints deben:
1. ✅ Validar permisos con `@Permissions('attendance', 'read')`
2. ✅ Validar parámetros con schemas de Zod si es necesario
3. ✅ Retornar formato consistente: `{ success, data, message }`
4. ✅ Manejar errores con códigos HTTP apropiados (400, 404, 403, 500)

### Orden de Implementación Sugerido

1. **Primero**: `GET /api/attendance/holidays` (ALTA prioridad)
   - El frontend ya está esperando este endpoint
   - Es necesario para mostrar días festivos en el calendario de asistencia

2. **Segundo**: `GET /api/attendance/bimester/active` (MEDIA prioridad)
   - Útil para simplificar la lógica del frontend
   - Complementa el endpoint de ciclo activo

3. **Tercero**: `GET /api/attendance/enrollment/section/:sectionId/students` (BAJA prioridad)
   - Ya existe el endpoint más completo con date filter
   - Este es solo una conveniencia

---

## Actualización del Frontend después de Crear Endpoints

Una vez que implementes estos endpoints en el backend, actualiza el frontend:

### 1. Para holidays:

```typescript
// En attendance.service.ts - remover el warning
export async function getHolidays(bimesterId?: number): Promise<HolidaysResponse> {
  const params = bimesterId ? { bimesterId } : {};
  const response = await apiClient.get<any>(`${BASE_URL}/holidays`, { params });

  return {
    success: response.success || true,
    data: response.data || [],
    message: response.message || 'Holidays retrieved successfully',
  };
}
```

### 2. Para bimestre activo:

```typescript
// En attendance.service.ts - agregar función
export async function getActiveBimester() {
  const response = await apiClient.get<any>(`${BASE_URL}/bimester/active`);
  return response.data;
}
```

---

**Autor**: Claude
**Fecha**: 2025-11-17
**Versión**: 1.0
