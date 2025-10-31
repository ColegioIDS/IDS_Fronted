# Sections Module - Frontend Integration Guide

## 📋 Table of Contents
- [Overview](#overview)
- [TypeScript Interfaces](#typescript-interfaces)
- [API Endpoints](#api-endpoints)
- [Query Parameters](#query-parameters)
- [Validation Rules](#validation-rules)
- [Business Rules](#business-rules)
- [Code Examples](#code-examples)
- [Error Handling](#error-handling)

---

## Overview

The Sections module manages sections (classrooms/groups) within the school system. Each section belongs to a grade and can have a teacher assigned to it. Sections have capacity limits and track enrollments.

**Base URL:** `/api/sections`

---

## TypeScript Interfaces

### Section
```typescript
interface Section {
  id: number;
  name: string;
  capacity: number;
  gradeId: number;
  teacherId: number | null;
  grade?: {
    id: number;
    name: string;
    level: string;
    order: number;
  };
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
    email: string | null;
  };
  _count?: {
    enrollments: number;
    courseAssignments: number;
    schedules: number;
  };
}
```

### CreateSectionDto
```typescript
interface CreateSectionDto {
  name: string;           // Required, 1-100 characters
  capacity: number;       // Required, 1-100
  gradeId: number;        // Required, must exist
  teacherId?: number | null;  // Optional
}
```

### UpdateSectionDto
```typescript
interface UpdateSectionDto {
  name?: string;          // Optional, 1-100 characters
  capacity?: number;      // Optional, 1-100
  gradeId?: number;       // Optional, must exist
  teacherId?: number | null;  // Optional
}
```

### QuerySectionsDto
```typescript
interface QuerySectionsDto {
  page?: number;          // Default: 1
  limit?: number;         // Default: 10, max: 100
  gradeId?: number;       // Filter by grade
  teacherId?: number;     // Filter by teacher
  minCapacity?: number;   // Filter by minimum capacity
  maxCapacity?: number;   // Filter by maximum capacity
  hasTeacher?: boolean;   // Filter sections with/without teacher
  search?: string;        // Search in section name
  sortBy?: 'name' | 'capacity' | 'createdAt';  // Default: 'name'
  sortOrder?: 'asc' | 'desc';  // Default: 'asc'
}
```

### PaginatedSectionsResponse
```typescript
interface PaginatedSectionsResponse {
  data: Section[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### SectionStats
```typescript
interface SectionStats {
  id: number;
  name: string;
  capacity: number;
  currentEnrollments: number;
  availableSpots: number;
  utilizationPercentage: number;
  totalCourseAssignments: number;
  totalSchedules: number;
  hasTeacher: boolean;
  teacher?: {
    id: number;
    givenNames: string;
    lastNames: string;
  };
  grade: {
    id: number;
    name: string;
    level: string;
  };
}
```

---

## API Endpoints

### 1. Create Section
**POST** `/api/sections`

Creates a new section.

**Request Body:**
```json
{
  "name": "A",
  "capacity": 30,
  "gradeId": 1,
  "teacherId": 5
}
```

**Success Response (201):**
```json
{
  "id": 1,
  "name": "A",
  "capacity": 30,
  "gradeId": 1,
  "teacherId": 5,
  "grade": {
    "id": 1,
    "name": "Primero Primaria",
    "level": "Primaria",
    "order": 1
  },
  "teacher": {
    "id": 5,
    "givenNames": "María",
    "lastNames": "López García",
    "email": "maria.lopez@school.com"
  },
  "_count": {
    "enrollments": 0,
    "courseAssignments": 0,
    "schedules": 0
  }
}
```

**Error Responses:**
- **409 Conflict:** Section name already exists for this grade
- **400 Bad Request:** Invalid capacity or grade doesn't exist

---

### 2. Get All Sections (with filters)
**GET** `/api/sections?page=1&limit=10&gradeId=1&sortBy=name`

Retrieve sections with pagination and filters.

**Query Parameters:** See [Query Parameters](#query-parameters)

**Success Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "A",
      "capacity": 30,
      "gradeId": 1,
      "teacherId": 5,
      "grade": {
        "id": 1,
        "name": "Primero Primaria",
        "level": "Primaria",
        "order": 1
      },
      "teacher": {
        "id": 5,
        "givenNames": "María",
        "lastNames": "López García",
        "email": "maria.lopez@school.com"
      },
      "_count": {
        "enrollments": 25,
        "courseAssignments": 8,
        "schedules": 40
      }
    }
  ],
  "meta": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

### 3. Get Section by Grade
**GET** `/api/sections/grade/:gradeId`

Get all sections for a specific grade.

**URL Parameters:**
- `gradeId` (number, required): Grade ID

**Success Response (200):**
```json
[
  {
    "id": 1,
    "name": "A",
    "capacity": 30,
    "gradeId": 1,
    "teacherId": 5,
    "grade": { /*...*/ },
    "teacher": { /*...*/ },
    "_count": { /*...*/ }
  },
  {
    "id": 2,
    "name": "B",
    "capacity": 28,
    "gradeId": 1,
    "teacherId": 6,
    "grade": { /*...*/ },
    "teacher": { /*...*/ },
    "_count": { /*...*/ }
  }
]
```

---

### 4. Get Section by ID
**GET** `/api/sections/:id`

Retrieve a specific section by ID.

**URL Parameters:**
- `id` (number, required): Section ID

**Success Response (200):**
```json
{
  "id": 1,
  "name": "A",
  "capacity": 30,
  "gradeId": 1,
  "teacherId": 5,
  "grade": {
    "id": 1,
    "name": "Primero Primaria",
    "level": "Primaria",
    "order": 1
  },
  "teacher": {
    "id": 5,
    "givenNames": "María",
    "lastNames": "López García",
    "email": "maria.lopez@school.com"
  },
  "_count": {
    "enrollments": 25,
    "courseAssignments": 8,
    "schedules": 40
  }
}
```

**Error Response:**
- **404 Not Found:** Section doesn't exist

---

### 5. Update Section
**PATCH** `/api/sections/:id`

Update section information.

**URL Parameters:**
- `id` (number, required): Section ID

**Request Body (all fields optional):**
```json
{
  "name": "A-1",
  "capacity": 35,
  "teacherId": 7
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "A-1",
  "capacity": 35,
  "gradeId": 1,
  "teacherId": 7,
  "grade": { /*...*/ },
  "teacher": { /*...*/ },
  "_count": { /*...*/ }
}
```

**Error Responses:**
- **404 Not Found:** Section doesn't exist
- **409 Conflict:** New name already exists for this grade
- **400 Bad Request:** Capacity less than current enrollments

---

### 6. Delete Section
**DELETE** `/api/sections/:id`

Delete a section (only if no dependencies exist).

**URL Parameters:**
- `id` (number, required): Section ID

**Success Response (200):**
```json
{
  "message": "Sección \"A\" eliminada correctamente"
}
```

**Error Responses:**
- **404 Not Found:** Section doesn't exist
- **400 Bad Request:** Section has dependencies (enrollments, courses, schedules, or ERICA topics)

---

### 7. Get Section Statistics
**GET** `/api/sections/:id/stats`

Get detailed statistics for a section.

**URL Parameters:**
- `id` (number, required): Section ID

**Success Response (200):**
```json
{
  "id": 1,
  "name": "A",
  "capacity": 30,
  "currentEnrollments": 25,
  "availableSpots": 5,
  "utilizationPercentage": 83.33,
  "totalCourseAssignments": 8,
  "totalSchedules": 40,
  "hasTeacher": true,
  "teacher": {
    "id": 5,
    "givenNames": "María",
    "lastNames": "López García"
  },
  "grade": {
    "id": 1,
    "name": "Primero Primaria",
    "level": "Primaria"
  }
}
```

**Error Response:**
- **404 Not Found:** Section doesn't exist

---

### 8. Assign Teacher to Section
**PATCH** `/api/sections/:id/assign-teacher`

Assign a teacher to a section.

**URL Parameters:**
- `id` (number, required): Section ID

**Request Body:**
```json
{
  "teacherId": 5
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "name": "A",
  "capacity": 30,
  "gradeId": 1,
  "teacherId": 5,
  "grade": { /*...*/ },
  "teacher": { /*...*/ },
  "_count": { /*...*/ }
}
```

**Error Response:**
- **404 Not Found:** Section doesn't exist

---

### 9. Remove Teacher from Section
**PATCH** `/api/sections/:id/remove-teacher`

Remove the assigned teacher from a section.

**URL Parameters:**
- `id` (number, required): Section ID

**Success Response (200):**
```json
{
  "id": 1,
  "name": "A",
  "capacity": 30,
  "gradeId": 1,
  "teacherId": null,
  "grade": { /*...*/ },
  "teacher": null,
  "_count": { /*...*/ }
}
```

**Error Response:**
- **404 Not Found:** Section doesn't exist

---

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Items per page (max: 100) |
| `gradeId` | number | - | Filter by grade ID |
| `teacherId` | number | - | Filter by teacher ID |
| `minCapacity` | number | - | Minimum capacity filter |
| `maxCapacity` | number | - | Maximum capacity filter |
| `hasTeacher` | boolean | - | Filter sections with/without teacher |
| `search` | string | - | Search in section name (case-insensitive) |
| `sortBy` | string | 'name' | Sort field: 'name', 'capacity', 'createdAt' |
| `sortOrder` | string | 'asc' | Sort direction: 'asc' or 'desc' |

**Example Usage:**
```
GET /api/sections?gradeId=1&hasTeacher=true&minCapacity=25&sortBy=capacity&sortOrder=desc
```

---

## Validation Rules

### Section Name
- ✅ Required
- ✅ Must be 1-100 characters
- ✅ Trimmed automatically
- ✅ Must be unique per grade (case-insensitive)

### Capacity
- ✅ Required
- ✅ Must be a positive integer
- ✅ Minimum: 1 student
- ✅ Maximum: 100 students
- ✅ Cannot be less than current enrollments when updating

### Grade ID
- ✅ Required
- ✅ Must be a positive integer
- ✅ Grade must exist in database

### Teacher ID
- ✅ Optional (nullable)
- ✅ Must be a positive integer if provided
- ✅ Teacher must exist in database

---

## Business Rules

### 1. Unique Names per Grade
- Section names must be unique within each grade
- Case-insensitive validation
- Example: Grade "Primero Primaria" cannot have two sections named "A"

### 2. Capacity Management
- Capacity must always be ≥ current enrollments
- Cannot reduce capacity below enrolled student count
- Available spots = capacity - current enrollments

### 3. Safe Deletion
Sections can only be deleted if they have NO:
- Student enrollments
- Course assignments
- Schedules configured
- ERICA topics

If dependencies exist, delete them first or use deactivation instead.

### 4. Teacher Assignment
- Teachers can be assigned/removed at any time
- A section can exist without a teacher
- Multiple sections can share the same teacher

### 5. Grade Association
- Each section belongs to exactly one grade
- Grade can be changed (with validation)
- Name uniqueness is re-validated when changing grade

---

## Code Examples

### React/TypeScript Service

```typescript
// services/sections.service.ts
import axios from 'axios';

const API_BASE = '/api/sections';

export interface CreateSectionDto {
  name: string;
  capacity: number;
  gradeId: number;
  teacherId?: number | null;
}

export interface UpdateSectionDto {
  name?: string;
  capacity?: number;
  gradeId?: number;
  teacherId?: number | null;
}

export interface QuerySectionsDto {
  page?: number;
  limit?: number;
  gradeId?: number;
  teacherId?: number;
  minCapacity?: number;
  maxCapacity?: number;
  hasTeacher?: boolean;
  search?: string;
  sortBy?: 'name' | 'capacity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const sectionsService = {
  // Get all sections with filters
  getAll: async (params?: QuerySectionsDto) => {
    const response = await axios.get(API_BASE, { params });
    return response.data;
  },

  // Get sections by grade
  getByGrade: async (gradeId: number) => {
    const response = await axios.get(`${API_BASE}/grade/${gradeId}`);
    return response.data;
  },

  // Get section by ID
  getById: async (id: number) => {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  },

  // Get section statistics
  getStats: async (id: number) => {
    const response = await axios.get(`${API_BASE}/${id}/stats`);
    return response.data;
  },

  // Create section
  create: async (data: CreateSectionDto) => {
    const response = await axios.post(API_BASE, data);
    return response.data;
  },

  // Update section
  update: async (id: number, data: UpdateSectionDto) => {
    const response = await axios.patch(`${API_BASE}/${id}`, data);
    return response.data;
  },

  // Delete section
  delete: async (id: number) => {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  },

  // Assign teacher
  assignTeacher: async (id: number, teacherId: number) => {
    const response = await axios.patch(`${API_BASE}/${id}/assign-teacher`, {
      teacherId,
    });
    return response.data;
  },

  // Remove teacher
  removeTeacher: async (id: number) => {
    const response = await axios.patch(`${API_BASE}/${id}/remove-teacher`);
    return response.data;
  },
};
```

### React Component Example

```typescript
// components/SectionsList.tsx
import React, { useState, useEffect } from 'react';
import { sectionsService } from '../services/sections.service';

export const SectionsList: React.FC = () => {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    gradeId: undefined,
    search: '',
    hasTeacher: undefined,
  });

  useEffect(() => {
    fetchSections();
  }, [page, filters]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await sectionsService.getAll({
        page,
        limit: 10,
        ...filters,
      });
      setSections(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Your UI implementation */}
    </div>
  );
};
```

### Form Validation Example

```typescript
// validation/section.validation.ts
import { z } from 'zod';

export const sectionSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  capacity: z
    .number()
    .int('La capacidad debe ser un número entero')
    .min(1, 'La capacidad mínima es 1')
    .max(100, 'La capacidad máxima es 100'),
  gradeId: z.number().int().positive('Debe seleccionar un grado'),
  teacherId: z.number().int().positive().nullable().optional(),
});

export type SectionFormData = z.infer<typeof sectionSchema>;
```

---

## Error Handling

### Common Error Responses

```typescript
// 400 Bad Request
{
  "message": "La capacidad mínima es 1 estudiante",
  "error": "Bad Request",
  "statusCode": 400
}

// 404 Not Found
{
  "message": "Sección con ID 999 no encontrada",
  "error": "Not Found",
  "statusCode": 404
}

// 409 Conflict
{
  "message": "Ya existe una sección con el nombre \"A\" para este grado",
  "error": "Conflict",
  "statusCode": 409
}

// 400 Bad Request (Dependencies)
{
  "message": "No se puede eliminar la sección \"A\" porque tiene estudiantes inscritos, tiene cursos asignados. Por favor, elimine primero estas dependencias o desactive la sección.",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Error Handling in Frontend

```typescript
try {
  await sectionsService.create(formData);
  toast.success('Sección creada correctamente');
} catch (error: any) {
  if (error.response?.status === 409) {
    toast.error('Ya existe una sección con ese nombre en este grado');
  } else if (error.response?.status === 400) {
    toast.error(error.response.data.message);
  } else {
    toast.error('Error al crear la sección');
  }
}
```

---

## UI/UX Recommendations

### 1. Sections List View
- Display sections grouped by grade
- Show capacity utilization (bar or percentage)
- Highlight sections without assigned teacher
- Add filters for grade, teacher assignment status
- Implement search by section name

### 2. Section Form (Create/Edit)
- Grade selector (dropdown or autocomplete)
- Teacher selector (optional, searchable)
- Capacity input with min/max validation
- Show current enrollments when editing
- Disable capacity reduction if it would exceed enrollments

### 3. Section Details View
- Display teacher information (with option to change)
- Show statistics card:
  - Current enrollments / Capacity
  - Available spots
  - Utilization percentage
  - Course assignments count
  - Schedules count
- List enrolled students (if applicable)
- List assigned courses
- Show schedule preview

### 4. Capacity Warnings
- Show warning when utilization > 90%
- Alert when section is at full capacity
- Prevent reducing capacity below enrollments

### 5. Deletion Confirmation
- Show dependencies before allowing deletion
- Suggest alternatives (deactivation, reassignment)
- Display impact of deletion

---

## Recommended Flows

### Creating a Section
1. Select grade from list
2. Enter section name (A, B, C, etc.)
3. Set capacity (default: 30)
4. Optionally assign teacher
5. Submit and redirect to section details

### Assigning Teacher
1. View section details
2. Click "Assign Teacher" button
3. Search and select teacher from list
4. Confirm assignment
5. Show success message

### Managing Capacity
1. View section statistics
2. See current utilization
3. If needed, adjust capacity
4. System validates against enrollments
5. Update capacity if valid

---

## Notes

- All endpoints require appropriate permissions
- Section names are case-insensitive for uniqueness
- Teacher assignment is optional and can be changed anytime
- Sections cannot be deleted if they have dependencies
- Capacity changes are validated against current enrollments
- Statistics are calculated in real-time

---

**Last Updated:** October 31, 2025
**API Version:** 1.0.0
