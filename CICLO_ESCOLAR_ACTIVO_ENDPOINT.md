# 🎓 ENDPOINT: Ciclo Escolar Activo

## Problema Actual
El frontend muestra error: **"No hay un ciclo escolar activo"**

Razón: El frontend necesita un endpoint que devuelva el ciclo escolar activo + bimestre activo

---

## 📋 Endpoint Specification

### GET /api/attendance/configuration/active-cycle

**Descripción**: Obtiene el ciclo escolar activo y el bimestre activo actual

**Método**: `GET`

**URL**: `/api/attendance/configuration/active-cycle`

**Headers Requeridos**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 📥 Parámetros de Query

| Parámetro | Tipo | Requerido | Valor Defecto | Descripción |
|-----------|------|-----------|---------------|------------|
| `includeStats` | boolean | ❌ | false | Si true, incluye progreso % y días restantes |

---

## 📤 Response (Success - 200 OK)

```json
{
  "success": true,
  "data": {
    "cycle": {
      "id": 1,
      "name": "Ciclo 2025-I",
      "startDate": "2025-01-06T00:00:00Z",
      "endDate": "2025-05-23T00:00:00Z",
      "academicYear": 2025,
      "description": "Primer ciclo del año 2025",
      "isActive": true,
      "isArchived": false,
      "canEnroll": true,
      "createdAt": "2024-12-01T10:00:00Z"
    },
    "activeBimester": {
      "id": 1,
      "cycleId": 1,
      "number": 1,
      "name": "Bimestre 1",
      "startDate": "2025-01-06T00:00:00Z",
      "endDate": "2025-02-28T00:00:00Z",
      "isActive": true,
      "weeksCount": 8
    },
    "progress": 35,
    "daysRemaining": 138
  }
}
```

---

## 📤 Response (No Active Cycle - 200 OK)

```json
{
  "success": true,
  "data": {
    "cycle": null,
    "activeBimester": null,
    "message": "No hay un ciclo escolar activo en este momento",
    "progress": 0,
    "daysRemaining": 0
  }
}
```

---

## ❌ Error Responses

### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token no válido o expirado"
  }
}
```

### 500 - Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Error en el servidor"
  }
}
```

---

## 🔧 Implementación en Backend (Prisma)

### Query Prisma

```typescript
// Obtener ciclo activo con su bimestre activo
const cycle = await prisma.schoolCycle.findFirst({
  where: {
    isActive: true,
    isArchived: false,
  },
  include: {
    bimesters: {
      where: {
        isActive: true,
      },
      take: 1, // Solo el bimestre activo
    },
  },
  orderBy: {
    startDate: 'desc',
  },
});

// Si hay ciclo activo
if (cycle && cycle.bimesters.length > 0) {
  const activeBimester = cycle.bimesters[0];
  
  // Calcular progreso
  const now = new Date();
  const total = cycle.endDate.getTime() - cycle.startDate.getTime();
  const elapsed = now.getTime() - cycle.startDate.getTime();
  const progress = Math.round((elapsed / total) * 100);
  
  // Calcular días restantes
  const daysRemaining = Math.ceil(
    (cycle.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return {
    success: true,
    data: {
      cycle: {
        id: cycle.id,
        name: cycle.name,
        startDate: cycle.startDate.toISOString(),
        endDate: cycle.endDate.toISOString(),
        academicYear: cycle.academicYear,
        description: cycle.description,
        isActive: cycle.isActive,
        isArchived: cycle.isArchived,
        canEnroll: cycle.canEnroll,
        createdAt: cycle.createdAt.toISOString(),
      },
      activeBimester: {
        id: activeBimester.id,
        cycleId: activeBimester.cycleId,
        number: activeBimester.number,
        name: activeBimester.name,
        startDate: activeBimester.startDate.toISOString(),
        endDate: activeBimester.endDate.toISOString(),
        isActive: activeBimester.isActive,
        weeksCount: activeBimester.weeksCount,
      },
      progress,
      daysRemaining,
    },
  };
}

// Si NO hay ciclo activo
return {
  success: true,
  data: {
    cycle: null,
    activeBimester: null,
    message: 'No hay un ciclo escolar activo',
    progress: 0,
    daysRemaining: 0,
  },
};
```

### Índices Recomendados

```prisma
// En el schema.prisma, agregar índices:
model SchoolCycle {
  // ... campos existentes
  
  @@index([isActive])
  @@index([isArchived])
  @@unique([isActive, isArchived]) // Para encontrar rápidamente el activo
  @@map("school_cycles")
}

model Bimester {
  // ... campos existentes
  
  @@index([cycleId, isActive])
  @@map("bimesters")
}
```

---

## 🔗 Uso en Frontend

### Hook (Aislado - No Dependencias)

```typescript
// src/hooks/useActiveCycle.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/config/api';

export function useActiveCycle() {
  const [cycle, setCycle] = useState(null);
  const [activeBimester, setActiveBimester] = useState(null);
  const [progress, setProgress] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActiveCycle() {
      try {
        const response = await apiClient.get(
          '/attendance/configuration/active-cycle'
        );
        
        if (response.data.success) {
          setCycle(response.data.data.cycle);
          setActiveBimester(response.data.data.activeBimester);
          setProgress(response.data.data.progress || 0);
          setDaysRemaining(response.data.data.daysRemaining || 0);
          setError(null);
        } else {
          setError(response.data.data?.message || 'No hay ciclo activo');
          setCycle(null);
          setActiveBimester(null);
        }
      } catch (err) {
        setError((err as any).message || 'Error al obtener ciclo activo');
        setCycle(null);
        setActiveBimester(null);
      } finally {
        setLoading(false);
      }
    }

    fetchActiveCycle();
  }, []);

  return {
    cycle,
    activeBimester,
    progress,
    daysRemaining,
    loading,
    error,
    hasCycle: !!cycle,
    hasBimester: !!activeBimester,
  };
}
```

### Uso en Componente

```typescript
// En AttendanceHeader.tsx
import { useActiveCycle } from '@/hooks/useActiveCycle';

export default function AttendanceHeader(props) {
  const { cycle, activeBimester, progress, daysRemaining, error } = useActiveCycle();

  // Si hay error, mostrar alerta
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Mostrar información del ciclo
  return (
    <div>
      <h2>{cycle?.name}</h2>
      <p>Bimestre: {activeBimester?.name}</p>
      <p>Progreso: {progress}%</p>
      <p>Días restantes: {daysRemaining}</p>
    </div>
  );
}
```

---

## 🧪 Testing

### Request (cURL)

```bash
curl -X GET "http://localhost:3000/api/attendance/configuration/active-cycle" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Request (Postman)

1. **Method**: GET
2. **URL**: `http://localhost:3000/api/attendance/configuration/active-cycle`
3. **Headers**:
   - `Authorization`: `Bearer <YOUR_TOKEN>`
   - `Content-Type`: `application/json`
4. **Send**

---

## ✅ Checklist de Implementación Backend

- [ ] Crear endpoint GET en ruta `/api/attendance/configuration/active-cycle`
- [ ] Validar que el usuario esté autenticado (JWT)
- [ ] Ejecutar consulta Prisma para ciclo activo
- [ ] Calcular progreso en porcentaje
- [ ] Calcular días restantes
- [ ] Retornar formato JSON especificado
- [ ] Manejar caso cuando NO hay ciclo activo
- [ ] Agregar índices en Prisma para mejorar performance
- [ ] Probar con Postman
- [ ] Testear en producción

---

## 📈 Escalabilidad

**Caché Recomendado**: 5-10 minutos
- El ciclo activo no cambia frecuentemente
- El frontend puede cachear la respuesta
- Invalida caché cuando se cree un nuevo ciclo o se active uno

---

**Documento**: Especificación de Endpoint para Ciclo Escolar Activo  
**Versión**: 1.0  
**Fecha**: 7 Noviembre 2025  
**Status**: 🔴 Pendiente de Implementación en Backend
