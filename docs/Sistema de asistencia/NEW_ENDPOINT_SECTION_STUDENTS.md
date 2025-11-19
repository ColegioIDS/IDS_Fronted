## 🆕 NEW ENDPOINT: Get Section Students for Attendance

### Propósito
Obtener todos los estudiantes de una sección con toda la información necesaria para registrar asistencia de forma centralizada.

---

## 📋 Endpoint Specification

### URL
```
GET /api/attendance/section/:sectionId/students
```

### Parámetros

#### Path Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `sectionId` | number | Sí | ID de la sección |

#### Query Parameters (Opcionales)
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `cycleId` | number | Filtrar por ciclo específico (default: ciclo activo) |
| `status` | string | Filtrar por estado: `ACTIVE`, `INACTIVE`, `ALL` (default: ACTIVE) |

---

## 📤 Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "section": {
      "id": 1,
      "name": "4-A",
      "gradeId": 2,
      "gradeName": "Cuarto Grado"
    },
    "cycle": {
      "id": 5,
      "name": "2025",
      "startDate": "2025-01-15",
      "endDate": "2025-12-15",
      "isActive": true
    },
    "enrollmentCount": 35,
    "students": [
      {
        "enrollmentId": 1001,
        "enrollmentStatus": "ACTIVE",
        "studentId": 50,
        "firstName": "Juan",
        "lastName": "Pérez García",
        "fullName": "Juan Pérez García",
        "studentCode": "STU-2025-001",
        "email": "juan.perez@school.edu",
        "phone": "555-0001",
        "picture": {
          "id": 10,
          "url": "https://api.school.edu/pictures/50.jpg",
          "format": "jpg"
        },
        "enrollmentDate": "2025-01-15",
        "enrollmentEndDate": null,
        "enrollmentReason": "NEW_STUDENT"
      },
      {
        "enrollmentId": 1002,
        "enrollmentStatus": "ACTIVE",
        "studentId": 51,
        "firstName": "María",
        "lastName": "González López",
        "fullName": "María González López",
        "studentCode": "STU-2025-002",
        "email": "maria.gonzalez@school.edu",
        "phone": "555-0002",
        "picture": {
          "id": 11,
          "url": "https://api.school.edu/pictures/51.jpg",
          "format": "jpg"
        },
        "enrollmentDate": "2025-01-15",
        "enrollmentEndDate": null,
        "enrollmentReason": "NEW_STUDENT"
      }
      // ... más estudiantes
    ]
  },
  "message": "Section students retrieved successfully",
  "timestamp": "2025-11-19T10:30:00Z"
}
```

### Error Response Examples

#### 404 - Section Not Found
```json
{
  "success": false,
  "message": "Section not found",
  "errorCode": "SECTION_NOT_FOUND",
  "statusCode": 404
}
```

#### 403 - Access Denied
```json
{
  "success": false,
  "message": "You don't have permission to view this section",
  "errorCode": "ACCESS_DENIED",
  "statusCode": 403
}
```

#### 400 - Invalid Section
```json
{
  "success": false,
  "message": "Section has no students enrolled",
  "errorCode": "NO_STUDENTS",
  "statusCode": 400
}
```

---

## 🔐 Authorization

### Required Permissions
- **User Role**: TEACHER, ADMIN, COORDINATOR, SECRETARY
- **Scope Check**: 
  - `ALL`: Can view any section
  - `GRADE`: Can view sections in their assigned grades
  - `SECTION`: Can only view their assigned sections
  - `OWN`: Can view only sections where they teach
  - `DEPARTMENT`: Can view sections in their department

### Permission Validation
```
1. Check if user is authenticated
2. Check if user's role has attendance view permission
3. Check if user's scope allows access to this section
4. Check if section exists and has students
```

---

## 📊 Data Structure Details

### Student Object Fields

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `enrollmentId` | number | ID único de la matrícula (PRIMARY KEY para asistencia) |
| `enrollmentStatus` | string | Estado: ACTIVE, DROPPED, TRANSFERRED, GRADUATED |
| `studentId` | number | ID del estudiante |
| `firstName` | string | Nombre del estudiante |
| `lastName` | string | Apellido del estudiante |
| `fullName` | string | Nombre completo formateado |
| `studentCode` | string | Código único del estudiante |
| `email` | string | Email del estudiante |
| `phone` | string | Teléfono de contacto |
| `picture` | object | Información de foto de perfil |
| `picture.id` | number | ID de la foto |
| `picture.url` | string | URL de la foto |
| `picture.format` | string | Formato: jpg, png, etc |
| `enrollmentDate` | date | Fecha de inscripción |
| `enrollmentEndDate` | date | Fecha de fin (si aplica) |
| `enrollmentReason` | string | Razón: NEW_STUDENT, TRANSFER_IN, RETURNING, etc |

---

## 💡 Use Cases

### Use Case 1: Teacher Marking Daily Attendance
```typescript
// 1. Profesor abre página de asistencia
// 2. Selecciona sección
// 3. Sistema llama:
GET /api/attendance/section/1/students

// 4. Recibe lista de estudiantes
// 5. Profesor marca cada uno (✓ Presente, ✗ Ausente, etc)
// 6. Envía:
POST /api/attendance/register
{
  "attendances": [
    { "enrollmentId": 1001, "statusId": 1 },
    { "enrollmentId": 1002, "statusId": 1 },
    ...
  ]
}
```

### Use Case 2: Admin Viewing Student List
```typescript
// Admin quiere ver estudiantes de una sección
GET /api/attendance/section/5/students?status=ACTIVE

// Respuesta incluye solo estudiantes activos
```

### Use Case 3: Secretary Correcting Attendance
```typescript
// Secretaria necesita ver quién faltó para corregir
GET /api/attendance/section/3/students

// Luego puede actualizar registros específicos
PUT /api/attendance/:attendanceId
```

---

## 🎯 Implementation Checklist

### Backend (NestJS)

- [ ] Create `SectionStudentsDto` DTO with all fields
- [ ] Create `GetSectionStudentsQuery` for query params
- [ ] Create `getSectionStudents()` method in AttendanceController
- [ ] Add service method in AttendanceService
- [ ] Implement authorization checks:
  - [ ] Authentication check
  - [ ] Role-based access
  - [ ] Scope validation
- [ ] Add query optimizations:
  - [ ] Load relations: student, picture, enrollment
  - [ ] Filter by status if provided
  - [ ] Order by: firstName, lastName
  - [ ] Use left joins to avoid null pictures
- [ ] Add error handling:
  - [ ] Section not found
  - [ ] No students enrolled
  - [ ] Access denied
  - [ ] Invalid section
- [ ] Add logging for audit trail
- [ ] Write unit tests
- [ ] Add swagger documentation

### Frontend (React)

- [ ] Create `useSectionStudents()` hook
- [ ] Update service layer with new endpoint
- [ ] Create component to display students list
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add filtering (optional)
- [ ] Add sorting (optional)

---

## 🔄 Integration with Existing Endpoints

### Relationship to Other Endpoints

```
1. GET /api/attendance/section/:sectionId/students
   ↓ (Get students to mark attendance)
   
2. POST /api/attendance/register
   ↓ (Use enrollmentId from #1 to register)
   
3. GET /api/attendance/section/:sectionId/cycle/:cycleId/date/:date
   ↓ (Verify if attendance was already recorded)
```

### Frontend Flow

```tsx
1. Load students
   const { students } = useSectionStudents(sectionId)

2. Display in UI with status indicators
   {students.map(s => <StudentRow enrollmentId={s.enrollmentId} />)}

3. Mark attendance
   onMarkAttendance(enrollmentId, statusId)

4. Submit all at once
   await registerAttendance({ attendances: [...] })

5. Show confirmation
   toast.success(`Attendance recorded for ${count} students`)
```

---

## 📈 Performance Considerations

### Query Optimization
```sql
-- Recommended indexes
CREATE INDEX idx_enrollment_section_status 
ON "Enrollment"(sectionId, status);

CREATE INDEX idx_student_enrollment_id 
ON "Student"(id);

CREATE INDEX idx_picture_student_id 
ON "Picture"(studentId);
```

### Pagination (Optional Future Enhancement)
```typescript
GET /api/attendance/section/:sectionId/students?page=1&limit=50

Response:
{
  data: [...],
  pagination: {
    page: 1,
    limit: 50,
    total: 150,
    totalPages: 3
  }
}
```

---

## 🧪 Test Cases

### Happy Path
```typescript
✓ GET /api/attendance/section/1/students
  Returns 200 with array of students
  
✓ GET /api/attendance/section/1/students?status=ACTIVE
  Returns only active students
  
✓ GET /api/attendance/section/1/students?cycleId=5
  Returns students for specific cycle
```

### Error Cases
```typescript
✗ GET /api/attendance/section/999/students
  Returns 404 Section not found
  
✗ GET /api/attendance/section/1/students (unauthorized user)
  Returns 403 Access denied
  
✗ GET /api/attendance/section/2/students (empty section)
  Returns 400 No students enrolled
```

---

## 📚 Related Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/attendance/section/:id/students` | GET | **[NEW] Get students for attendance** |
| `/attendance/register` | POST | Register attendance for selected students |
| `/attendance/section/:id/cycle/:cycleId/date/:date` | GET | Get attendance records for date |
| `/enrollment/section/:id` | GET | Get enrollments (alternative endpoint) |
| `/attendance/statuses` | GET | Get available status types |

---

## 🔗 Database Relations

```
Section
  ├── has many Enrollments (via sectionId)
  │   └── has one Student
  │       └── has one Picture (optional)
  └── has one Grade
      ├── has one Department
      └── has many SchoolCycles (via GradeCycle)
```

---

## ✅ Validation Rules

### Input Validation
```
- sectionId: must be positive integer
- cycleId (optional): must be positive integer
- status (optional): must be one of ACTIVE, INACTIVE, ALL
```

### Business Validation
```
- Section must exist
- Section must have at least 1 active enrollment
- User must have permission to view this section
- If cycleId provided, cycle must be associated with section
```

---

## 📝 Notes

### Design Decisions
1. **Why include picture data?** - UI needs profile images for better UX
2. **Why include enrollment dates?** - Helps identify recently added/removed students
3. **Why status filter?** - Teachers need to see only active students for marking

### Future Enhancements
1. Add pagination for large sections (1000+ students)
2. Add search by student name or code
3. Add export to CSV
4. Add bulk operations (mark all as present)

---

## 🚀 Implementation Priority

**Priority**: HIGH  
**Effort**: MEDIUM (2-4 hours)  
**Complexity**: MEDIUM  
**Impact**: HIGH (Core functionality for attendance marking)

---

**Last Updated**: November 19, 2025  
**Status**: Ready for Implementation
