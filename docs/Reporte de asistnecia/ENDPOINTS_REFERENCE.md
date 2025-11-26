# 📋 Referencia Completa de Endpoints - Attendance Reports

## Índice
1. [Resumen de Sección](#resumen-de-sección)
2. [Reporte Detallado](#reporte-detallado)
3. [Reporte por Curso](#reporte-por-curso)
4. [Estudiantes en Riesgo](#estudiantes-en-riesgo)
5. [Opciones de Filtros](#opciones-de-filtros)

---

## Resumen de Sección

**Descripción:** Obtiene estadísticas agregadas de asistencia de una sección completa.

### Endpoint
```
GET /attendance-reports/sections/:sectionId/summary
```

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|----------|-------------|---------|
| `courseId` | number | No | Filtrar por curso específico | `5` |
| `bimesterId` | number | No | Filtrar por bimestre | `1` |
| `academicWeekId` | number | No | Filtrar por semana académica | `10` |
| `enrollmentStatus` | string | No | Estado de inscripción (ACTIVE\|INACTIVE) | `ACTIVE` |

### Request Example
```bash
curl -X GET "http://localhost:3000/attendance-reports/sections/1/summary?courseId=5&bimesterId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "section": {
      "sectionId": 1,
      "sectionName": "6to Grado A",
      "gradeLevel": "6",
      "gradeName": "Sexto Grado",
      "totalStudents": 28,
      "totalCourses": 8,
      "averageAttendance": 92.5,
      "averagePresentDays": 47,
      "averageAbsentDays": 3,
      "averageJustifiedAbsentDays": 1,
      "averageLateDays": 2,
      "atRiskCount": 3,
      "criticalRiskCount": 1,
      "needsInterventionCount": 4,
      "reportDate": "2025-11-25"
    },
    "statusBreakdown": [
      {
        "statusId": 1,
        "statusCode": "P",
        "statusName": "Presente",
        "count": 1316,
        "percentage": 92.5,
        "isNegative": false,
        "isExcused": false
      },
      {
        "statusId": 2,
        "statusCode": "A",
        "statusName": "Ausente",
        "count": 84,
        "percentage": 5.9,
        "isNegative": true,
        "isExcused": false
      },
      {
        "statusId": 3,
        "statusCode": "J",
        "statusName": "Ausente Justificado",
        "count": 28,
        "percentage": 1.96,
        "isNegative": false,
        "isExcused": true
      }
    ],
    "riskBreakdown": [
      {
        "riskLevel": "LOW",
        "count": 24,
        "percentage": 85.7
      },
      {
        "riskLevel": "MEDIUM",
        "count": 3,
        "percentage": 10.7
      },
      {
        "riskLevel": "HIGH",
        "count": 1,
        "percentage": 3.6
      }
    ],
    "filters": {
      "sectionId": 1,
      "courseId": 5,
      "bimesterId": 1,
      "academicWeekId": null,
      "enrollmentStatus": "ACTIVE"
    }
  }
}
```

### Error Response (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Sección 999 no encontrada",
  "error": "Not Found"
}
```

### Error Response (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Validación fallida",
  "errors": {
    "sectionId": "sectionId debe ser un número positivo"
  }
}
```

---

## Reporte Detallado

**Descripción:** Obtiene lista completa de estudiantes con estadísticas individuales de asistencia.

### Endpoint
```
GET /attendance-reports/sections/:sectionId/detailed
```

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|----------|-------------|---------|
| `courseId` | number | No | Filtrar por curso específico | `5` |
| `bimesterId` | number | No | Filtrar por bimestre | `1` |
| `academicWeekId` | number | No | Filtrar por semana académica | `10` |
| `enrollmentStatus` | string | No | Estado de inscripción (ACTIVE\|INACTIVE) | `ACTIVE` |
| `includeClasses` | boolean | No | Incluir detalle de cada clase | `true` |

### Request Example
```bash
curl -X GET "http://localhost:3000/attendance-reports/sections/1/detailed?bimesterId=1&includeClasses=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "section": {
      "sectionId": 1,
      "sectionName": "6to Grado A",
      "gradeLevel": "6",
      "gradeName": "Sexto Grado",
      "totalStudents": 28,
      "totalCourses": 8,
      "averageAttendance": 92.5,
      "averagePresentDays": 47,
      "averageAbsentDays": 3,
      "averageJustifiedAbsentDays": 1,
      "averageLateDays": 2,
      "atRiskCount": 3,
      "criticalRiskCount": 1,
      "needsInterventionCount": 4,
      "reportDate": "2025-11-25"
    },
    "students": [
      {
        "enrollmentId": 101,
        "studentId": 5,
        "studentCode": "E001",
        "firstName": "Juan",
        "lastName": "Pérez García",
        "codeSIRE": "SIR001234",
        "totalClasses": 50,
        "totalPresent": 48,
        "totalAbsent": 1,
        "totalJustifiedAbsent": 1,
        "totalTardy": 0,
        "attendancePercentage": 96.0,
        "riskLevel": "LOW",
        "status": "ACTIVE",
        "lastAttendanceDate": "2025-11-25",
        "lastAttendanceStatus": "P",
        "classes": [
          {
            "scheduleId": 201,
            "courseId": 5,
            "courseName": "Matemáticas",
            "courseCode": "MAT601",
            "date": "2025-11-25",
            "dayOfWeek": 2,
            "startTime": "08:00",
            "endTime": "09:00",
            "status": "P",
            "statusName": "Presente",
            "statusCode": "P",
            "arrivalTime": "07:55",
            "minutesLate": 0,
            "notes": null
          }
        ]
      },
      {
        "enrollmentId": 102,
        "studentId": 6,
        "studentCode": "E002",
        "firstName": "María",
        "lastName": "López Martínez",
        "codeSIRE": "SIR001235",
        "totalClasses": 50,
        "totalPresent": 45,
        "totalAbsent": 4,
        "totalJustifiedAbsent": 1,
        "totalTardy": 2,
        "attendancePercentage": 90.0,
        "riskLevel": "MEDIUM",
        "status": "ACTIVE",
        "lastAttendanceDate": "2025-11-25",
        "lastAttendanceStatus": "P",
        "classes": []
      }
    ],
    "filters": {
      "sectionId": 1,
      "courseId": null,
      "bimesterId": 1,
      "academicWeekId": null,
      "enrollmentStatus": "ACTIVE"
    }
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "El parámetro includeClasses debe ser un booleano"
}
```

---

## Reporte por Curso

**Descripción:** Obtiene estadísticas de asistencia para un curso específico dentro de una sección.

### Endpoint
```
GET /attendance-reports/sections/:sectionId/courses/:courseId/report
```

### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `sectionId` | number | ID de la sección |
| `courseId` | number | ID del curso |

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|----------|-------------|---------|
| `bimesterId` | number | No | Filtrar por bimestre | `1` |
| `academicWeekId` | number | No | Filtrar por semana académica | `10` |
| `enrollmentStatus` | string | No | Estado de inscripción (ACTIVE\|INACTIVE) | `ACTIVE` |

### Request Example
```bash
curl -X GET "http://localhost:3000/attendance-reports/sections/1/courses/5/report?bimesterId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "section": {
      "sectionId": 1,
      "sectionName": "6to Grado A",
      "gradeLevel": "6",
      "gradeName": "Sexto Grado",
      "totalStudents": 28,
      "totalCourses": 8,
      "averageAttendance": 92.5,
      "averagePresentDays": 47,
      "averageAbsentDays": 3,
      "averageJustifiedAbsentDays": 1,
      "averageLateDays": 2,
      "atRiskCount": 3,
      "criticalRiskCount": 1,
      "needsInterventionCount": 4,
      "reportDate": "2025-11-25"
    },
    "course": {
      "courseId": 5,
      "courseName": "Matemáticas",
      "courseCode": "MAT601",
      "courseArea": "Matemáticas",
      "courseColor": "#FF6B6B",
      "totalStudents": 28,
      "totalClasses": 10,
      "averageAttendance": 93.2,
      "statusBreakdown": [
        {
          "statusId": 1,
          "statusCode": "P",
          "statusName": "Presente",
          "count": 260,
          "percentage": 93.2,
          "isNegative": false,
          "isExcused": false
        },
        {
          "statusId": 2,
          "statusCode": "A",
          "statusName": "Ausente",
          "count": 15,
          "percentage": 5.4,
          "isNegative": true,
          "isExcused": false
        },
        {
          "statusId": 3,
          "statusCode": "J",
          "statusName": "Ausente Justificado",
          "count": 4,
          "percentage": 1.4,
          "isNegative": false,
          "isExcused": true
        }
      ],
      "students": [
        {
          "enrollmentId": 101,
          "studentId": 5,
          "studentCode": "E001",
          "firstName": "Juan",
          "lastName": "Pérez García",
          "codeSIRE": "SIR001234",
          "totalClasses": 10,
          "totalPresent": 10,
          "totalAbsent": 0,
          "totalJustifiedAbsent": 0,
          "totalTardy": 0,
          "attendancePercentage": 100.0,
          "riskLevel": "LOW",
          "lastAttendanceDate": "2025-11-25",
          "lastAttendanceStatus": "P"
        }
      ]
    },
    "filters": {
      "sectionId": 1,
      "courseId": 5,
      "bimesterId": 1,
      "academicWeekId": null,
      "enrollmentStatus": "ACTIVE"
    }
  }
}
```

### Error Response (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Curso 999 no está asignado a la sección 1",
  "error": "Bad Request"
}
```

---

## Estudiantes en Riesgo

**Descripción:** Obtiene lista de estudiantes con bajo porcentaje de asistencia que requieren intervención.

### Endpoint
```
GET /attendance-reports/sections/:sectionId/at-risk
```

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción | Rango | Ejemplo |
|-----------|------|----------|-------------|-------|---------|
| `minimumAbsencePercentage` | number | No | Umbral mínimo de ausencias para riesgo | 0-100 | `20` |
| `riskLevel` | string | No | Filtrar por nivel de riesgo | LOW\|MEDIUM\|HIGH | `HIGH` |
| `page` | number | No | Número de página (paginación) | 1+ | `1` |
| `limit` | number | No | Registros por página | 1-100 | `20` |

### Request Example
```bash
curl -X GET "http://localhost:3000/attendance-reports/sections/1/at-risk?minimumAbsencePercentage=20&riskLevel=HIGH&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "section": {
      "sectionId": 1,
      "sectionName": "6to Grado A",
      "gradeLevel": "6",
      "gradeName": "Sexto Grado",
      "totalStudents": 28,
      "totalCourses": 8,
      "averageAttendance": 92.5,
      "averagePresentDays": 47,
      "averageAbsentDays": 3,
      "averageJustifiedAbsentDays": 1,
      "averageLateDays": 2,
      "atRiskCount": 3,
      "criticalRiskCount": 1,
      "needsInterventionCount": 4,
      "reportDate": "2025-11-25"
    },
    "students": [
      {
        "enrollmentId": 105,
        "studentId": 10,
        "studentCode": "E005",
        "firstName": "Carlos",
        "lastName": "Gómez López",
        "codeSIRE": "SIR001239",
        "totalClasses": 50,
        "totalPresent": 35,
        "totalAbsent": 12,
        "totalJustifiedAbsent": 3,
        "totalTardy": 4,
        "attendancePercentage": 70.0,
        "riskLevel": "HIGH",
        "riskScore": 8.5,
        "interventionPriority": "URGENT",
        "status": "ACTIVE",
        "guardianEmail": "carlos.gómez@email.com",
        "guardianPhone": "+34 612 345 678",
        "lastAttendanceDate": "2025-11-20",
        "consecutiveAbsences": 2,
        "absenceHistory": [
          {
            "date": "2025-11-24",
            "courseId": 5,
            "courseName": "Matemáticas",
            "reason": null
          },
          {
            "date": "2025-11-23",
            "courseId": 8,
            "courseName": "Educación Física",
            "reason": "Enfermedad"
          }
        ]
      },
      {
        "enrollmentId": 103,
        "studentId": 8,
        "studentCode": "E003",
        "firstName": "Laura",
        "lastName": "Sánchez Ruiz",
        "codeSIRE": "SIR001237",
        "totalClasses": 50,
        "totalPresent": 40,
        "totalAbsent": 8,
        "totalJustifiedAbsent": 2,
        "totalTardy": 3,
        "attendancePercentage": 80.0,
        "riskLevel": "MEDIUM",
        "riskScore": 5.2,
        "interventionPriority": "MODERATE",
        "status": "ACTIVE",
        "guardianEmail": "laura.sanchez@email.com",
        "guardianPhone": "+34 634 567 890",
        "lastAttendanceDate": "2025-11-25",
        "consecutiveAbsences": 0,
        "absenceHistory": []
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    },
    "filters": {
      "sectionId": 1,
      "minimumAbsencePercentage": 20,
      "riskLevel": "HIGH"
    }
  }
}
```

### Error Response (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "minimumAbsencePercentage debe estar entre 0 y 100",
  "errors": {
    "minimumAbsencePercentage": "Debe ser un porcentaje válido"
  }
}
```

---

## Opciones de Filtros

**Descripción:** Obtiene listas de valores disponibles para construcción de filtros (cursos, bimestres, semanas académicas).

### Endpoint
```
GET /attendance-reports/sections/:sectionId/options
```

### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `sectionId` | number | ID de la sección |

### Request Example
```bash
curl -X GET "http://localhost:3000/attendance-reports/sections/1/options" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "section": {
      "id": 1,
      "name": "6to Grado A",
      "gradeName": "Sexto Grado"
    },
    "courses": [
      {
        "id": 5,
        "name": "Matemáticas",
        "code": "MAT601",
        "area": "Matemáticas",
        "totalStudents": 28,
        "isActive": true
      },
      {
        "id": 6,
        "name": "Lengua y Literatura",
        "code": "LEN601",
        "area": "Lenguaje",
        "totalStudents": 28,
        "isActive": true
      },
      {
        "id": 7,
        "name": "Ciencias Naturales",
        "code": "CSN601",
        "area": "Ciencias",
        "totalStudents": 28,
        "isActive": true
      }
    ],
    "bimesters": [
      {
        "id": 1,
        "name": "I Bimestre",
        "number": 1,
        "startDate": "2025-01-15",
        "endDate": "2025-03-20"
      },
      {
        "id": 2,
        "name": "II Bimestre",
        "number": 2,
        "startDate": "2025-03-21",
        "endDate": "2025-05-28"
      },
      {
        "id": 3,
        "name": "III Bimestre",
        "number": 3,
        "startDate": "2025-05-29",
        "endDate": "2025-08-01"
      },
      {
        "id": 4,
        "name": "IV Bimestre",
        "number": 4,
        "startDate": "2025-08-02",
        "endDate": "2025-11-28"
      }
    ],
    "academicWeeks": [
      {
        "id": 1,
        "number": 1,
        "startDate": "2025-01-15",
        "endDate": "2025-01-21"
      },
      {
        "id": 2,
        "number": 2,
        "startDate": "2025-01-22",
        "endDate": "2025-01-28"
      }
    ]
  }
}
```

### Error Response (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "Sección 999 no encontrada",
  "error": "Not Found"
}
```

---

## Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-----------|-------------|
| 200 | OK | Solicitud exitosa |
| 400 | Bad Request | Error de validación en parámetros |
| 401 | Unauthorized | Token no válido o no proporcionado |
| 403 | Forbidden | Permisos insuficientes |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## Autenticación

Todos los endpoints requieren un token Bearer válido en el header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Permisos Requeridos

Todos los endpoints requieren el permiso `attendance:read`:

```typescript
@Permissions('attendance', 'read')
```

---

## Notas Importantes

- **Sección-Específica**: TODOS los endpoints requieren `sectionId`. No existen endpoints generales.
- **Paginación**: El endpoint de "Estudiantes en Riesgo" soporta paginación con `page` y `limit`.
- **Filtros Opcionales**: Los filtros por `courseId`, `bimesterId` y `academicWeekId` son opcionales.
- **Códigos SIRE**: El campo `codeSIRE` puede ser null si no está registrado.
- **Respuesta Consistente**: Todas las respuestas incluyen `success: true/false` y estructura de error estandarizada.

