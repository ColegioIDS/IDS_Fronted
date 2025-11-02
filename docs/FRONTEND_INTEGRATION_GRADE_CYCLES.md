# Frontend Integration Guide - GradeCycles Module

**Version:** 1.0.0  
**Last Updated:** November 1, 2025  
**Base URL:** `/api/grade-cycles`

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [TypeScript Interfaces](#typescript-interfaces)
4. [API Endpoints](#api-endpoints)
5. [Helper Endpoints](#helper-endpoints)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## 🎯 Overview

El módulo **GradeCycles** gestiona la relación entre **grados** (grades) y **ciclos escolares** (school cycles). Permite:

- ✅ Asociar grados a ciclos escolares
- ✅ Configurar qué grados están disponibles en cada ciclo
- ✅ Obtener grados/ciclos disponibles sin depender de otros módulos
- ✅ Gestionar relaciones de forma individual o masiva

### ⚠️ Importante: Endpoints Helper Independientes

Este módulo incluye **endpoints helper** que permiten obtener grados y ciclos **sin necesitar permisos** de los módulos `grades` o `school-cycles`. Esto resuelve el problema de usuarios con acceso limitado.

---

## 🔐 Authentication

Todos los endpoints requieren:

```typescript
Authorization: Bearer <JWT_TOKEN>
```

### Permisos Requeridos

| Permiso | Descripción |
|---------|-------------|
| `grade-cycle:read` | Ver relaciones y usar helpers |
| `grade-cycle:create` | Crear relaciones |
| `grade-cycle:update` | Actualizar relaciones |
| `grade-cycle:delete` | Eliminar relaciones |

---

## 📘 TypeScript Interfaces

### Request DTOs

```typescript
/**
 * Crear una relación individual grado-ciclo
 */
interface CreateGradeCycleDto {
  cycleId: number;   // ID del ciclo escolar
  gradeId: number;   // ID del grado
}

/**
 * Crear múltiples relaciones para un ciclo
 */
interface BulkCreateGradeCycleDto {
  cycleId: number;     // ID del ciclo escolar
  gradeIds: number[];  // Array de IDs de grados
}

/**
 * Actualizar una relación existente
 */
interface UpdateGradeCycleDto {
  cycleId?: number;  // Opcional
  gradeId?: number;  // Opcional
}
```

### Response DTOs

```typescript
/**
 * Respuesta de una relación grado-ciclo
 */
interface GradeCycleResponse {
  id: number;
  cycleId: number;
  gradeId: number;
  grade: {
    id: number;
    name: string;      // "Primero", "Segundo", etc.
    level: string;     // "Primaria", "Básico"
    order: number;     // Orden de visualización
  };
  cycle: {
    id: number;
    name: string;      // "Ciclo 2025"
    startDate: Date;
    endDate: Date;
    isActive: boolean;
  };
}

/**
 * Grado disponible (helper)
 */
interface AvailableGrade {
  id: number;
  name: string;
  level: string;
  order: number;
  isActive: boolean;
}

/**
 * Ciclo disponible (helper)
 */
interface AvailableCycle {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  canEnroll: boolean;
}
```

---

## 🚀 API Endpoints

### 1. Crear Relación Individual

```typescript
POST /api/grade-cycles
```

**Body:**
```json
{
  "cycleId": 1,
  "gradeId": 2
}
```

**Response:** `201 Created`
```json
{
  "id": 5,
  "cycleId": 1,
  "gradeId": 2,
  "grade": {
    "id": 2,
    "name": "Segundo",
    "level": "Primaria",
    "order": 2
  },
  "cycle": {
    "id": 1,
    "name": "Ciclo 2025",
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2025-10-31T00:00:00.000Z",
    "isActive": true
  }
}
```

---

### 2. Crear Relaciones Masivas

```typescript
POST /api/grade-cycles/bulk
```

**Body:**
```json
{
  "cycleId": 1,
  "gradeIds": [1, 2, 3, 4, 5, 6]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "cycleId": 1,
  "created": 6,
  "results": [
    { "gradeId": 1, "gradeName": "Primero", "status": "created" },
    { "gradeId": 2, "gradeName": "Segundo", "status": "created" }
  ]
}
```

---

### 3. Obtener Grados de un Ciclo

```typescript
GET /api/grade-cycles/by-cycle/:cycleId
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "cycleId": 1,
    "gradeId": 1,
    "grade": {
      "id": 1,
      "name": "Primero",
      "level": "Primaria",
      "order": 1
    },
    "cycle": {
      "id": 1,
      "name": "Ciclo 2025",
      "isActive": true
    }
  }
]
```

---

### 4. Obtener Ciclos de un Grado

```typescript
GET /api/grade-cycles/by-grade/:gradeId
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "cycleId": 1,
    "gradeId": 2,
    "grade": { "id": 2, "name": "Segundo" },
    "cycle": {
      "id": 1,
      "name": "Ciclo 2025",
      "startDate": "2025-01-15T00:00:00.000Z",
      "isActive": true
    }
  }
]
```

---

### 5. Eliminar Relación

```typescript
DELETE /api/grade-cycles/:cycleId/:gradeId
```

**Response:** `200 OK`
```json
{
  "message": "Relación eliminada exitosamente",
  "cycleId": 1,
  "gradeId": 2
}
```

---

## 🔧 Helper Endpoints (Independientes)

### 🌟 ¿Por qué usar Helpers?

Los helpers permiten obtener datos **sin necesitar permisos** de otros módulos. Ideal para usuarios con acceso limitado.

---

### 1. Obtener Todos los Grados Activos

```typescript
GET /api/grade-cycles/helpers/available-grades
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Primero",
    "level": "Primaria",
    "order": 1,
    "isActive": true
  },
  {
    "id": 2,
    "name": "Segundo",
    "level": "Primaria",
    "order": 2,
    "isActive": true
  }
]
```

---

### 2. Obtener Todos los Ciclos Activos

```typescript
GET /api/grade-cycles/helpers/available-cycles
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Ciclo 2025",
    "startDate": "2025-01-15T00:00:00.000Z",
    "endDate": "2025-10-31T00:00:00.000Z",
    "isActive": true,
    "canEnroll": true
  }
]
```

---

### 3. Obtener Grados Disponibles para un Ciclo

```typescript
GET /api/grade-cycles/helpers/available-grades-for-cycle/:cycleId
```

**Descripción:** Retorna grados que **aún NO están asociados** al ciclo especificado.

**Response:** `200 OK`
```json
[
  {
    "id": 4,
    "name": "Cuarto",
    "level": "Primaria",
    "order": 4,
    "isActive": true
  }
]
```

---

### 4. Obtener Ciclos Disponibles para un Grado

```typescript
GET /api/grade-cycles/helpers/available-cycles-for-grade/:gradeId
```

**Descripción:** Retorna ciclos que **aún NO están asociados** al grado especificado.

**Response:** `200 OK`
```json
[
  {
    "id": 2,
    "name": "Ciclo 2026",
    "startDate": "2026-01-15T00:00:00.000Z",
    "endDate": "2026-10-31T00:00:00.000Z",
    "isActive": false,
    "canEnroll": false
  }
]
```

---

## 💻 Usage Examples

### React/Next.js Service

```typescript
// services/gradeCycles.service.ts

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const gradeCyclesService = {
  /**
   * 🔧 HELPER: Obtener todos los grados sin permisos de grades
   */
  async getAvailableGrades() {
    const response = await axios.get(
      `${API_URL}/api/grade-cycles/helpers/available-grades`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * 🔧 HELPER: Obtener todos los ciclos sin permisos de cycles
   */
  async getAvailableCycles() {
    const response = await axios.get(
      `${API_URL}/api/grade-cycles/helpers/available-cycles`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * 🔧 HELPER: Obtener grados disponibles para asociar a un ciclo
   */
  async getAvailableGradesForCycle(cycleId: number) {
    const response = await axios.get(
      `${API_URL}/api/grade-cycles/helpers/available-grades-for-cycle/${cycleId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Obtener grados asociados a un ciclo
   */
  async getGradesByCycle(cycleId: number) {
    const response = await axios.get(
      `${API_URL}/api/grade-cycles/by-cycle/${cycleId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Crear relación individual
   */
  async createGradeCycle(data: { cycleId: number; gradeId: number }) {
    const response = await axios.post(
      `${API_URL}/api/grade-cycles`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Crear relaciones masivas
   */
  async bulkCreateGradeCycles(data: { cycleId: number; gradeIds: number[] }) {
    const response = await axios.post(
      `${API_URL}/api/grade-cycles/bulk`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  /**
   * Eliminar relación
   */
  async deleteGradeCycle(cycleId: number, gradeId: number) {
    const response = await axios.delete(
      `${API_URL}/api/grade-cycles/${cycleId}/${gradeId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },
};
```

---

### React Component Example

```tsx
// components/ConfigureCycleGrades.tsx

import React, { useState, useEffect } from 'react';
import { gradeCyclesService } from '@/services/gradeCycles.service';

interface ConfigureCycleGradesProps {
  cycleId: number;
  cycleName: string;
}

export const ConfigureCycleGrades: React.FC<ConfigureCycleGradesProps> = ({
  cycleId,
  cycleName,
}) => {
  const [availableGrades, setAvailableGrades] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAvailableGrades();
  }, [cycleId]);

  const fetchAvailableGrades = async () => {
    try {
      setLoading(true);
      // 🔧 Usar helper endpoint para obtener grados disponibles
      const grades = await gradeCyclesService.getAvailableGradesForCycle(cycleId);
      setAvailableGrades(grades);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGrade = (gradeId: number) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await gradeCyclesService.bulkCreateGradeCycles({
        cycleId,
        gradeIds: selectedGrades,
      });
      alert('Grados configurados exitosamente');
      fetchAvailableGrades(); // Recargar lista
      setSelectedGrades([]);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Configurar Grados - {cycleName}
      </h2>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          <div className="space-y-2 mb-6">
            {availableGrades.map((grade: any) => (
              <label
                key={grade.id}
                className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedGrades.includes(grade.id)}
                  onChange={() => handleToggleGrade(grade.id)}
                  className="w-4 h-4"
                />
                <span>
                  {grade.name} ({grade.level})
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={selectedGrades.length === 0 || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Guardar Configuración
          </button>
        </>
      )}
    </div>
  );
};
```

---

## ⚠️ Error Handling

### Common Errors

| Status Code | Error | Solución |
|-------------|-------|----------|
| `400` | Bad Request | Verificar formato de datos |
| `401` | Unauthorized | Token inválido o expirado |
| `403` | Forbidden | Sin permisos `grade-cycle:*` |
| `404` | Not Found | Ciclo o grado no existe |
| `409` | Conflict | Relación ya existe |

### Example Error Response

```json
{
  "statusCode": 409,
  "message": "Ya existe una relación entre el ciclo 1 y el grado 2",
  "error": "Conflict"
}
```

---

## ✅ Best Practices

### 1. Usar Helpers para Independencia
```typescript
// ❌ MAL: Depender de /api/grades
const grades = await axios.get('/api/grades');

// ✅ BIEN: Usar helper independiente
const grades = await gradeCyclesService.getAvailableGrades();
```

### 2. Validar Antes de Crear
```typescript
// Verificar grados disponibles antes de mostrar formulario
const available = await gradeCyclesService.getAvailableGradesForCycle(cycleId);
if (available.length === 0) {
  alert('Todos los grados ya están configurados');
}
```

### 3. Usar Bulk Create para Eficiencia
```typescript
// ❌ MAL: Crear uno por uno
for (const gradeId of gradeIds) {
  await gradeCyclesService.createGradeCycle({ cycleId, gradeId });
}

// ✅ BIEN: Crear en lote
await gradeCyclesService.bulkCreateGradeCycles({ cycleId, gradeIds });
```

### 4. Manejo de Errores
```typescript
try {
  await gradeCyclesService.createGradeCycle(data);
} catch (error) {
  if (error.response?.status === 409) {
    alert('Esta relación ya existe');
  } else {
    alert('Error al crear relación');
  }
}
```

---

## 📊 Changelog

### v1.0.0 (2025-11-01)
- ✨ Implementación inicial del módulo GradeCycles
- ✨ Endpoints helper independientes para grados y ciclos
- ✨ CRUD completo con validaciones
- ✨ Soporte para creación masiva (bulk)
- ✨ Decoradores de permisos `@Permissions`

---

## 🤝 Support

Para soporte o preguntas:
- 📧 Email: soporte@ids.edu.gt
- 📖 Docs: `/docs/grade-cycles`

---

**© 2025 IDS Backend - GradeCycles Module**
