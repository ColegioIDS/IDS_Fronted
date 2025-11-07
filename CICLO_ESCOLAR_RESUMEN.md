# 🎯 RESUMEN: Ciclo Escolar Activo

## El Problema ❌
```
Error mostrado al usuario:
"No hay un ciclo escolar activo. No hay un bimestre activo. 
Contacte al administrador del sistema."
```

**Causa**: 
- `AttendanceHeader.tsx` tenía `const activeCycle = null` (siempre)
- No había hook para obtener ciclo activo del backend
- No había endpoint en backend

---

## La Solución ✅

### 1. Hook Creado: `useActiveCycle.ts`

**Ubicación**: `src/hooks/attendance/useActiveCycle.ts`

**Qué hace**:
```typescript
export function useActiveCycle() {
  const [cycle, setCycle] = useState(null);           // Ciclo escolar activo
  const [activeBimester, setActiveBimester] = useState(null); // Bimestre activo
  const [progress, setProgress] = useState(0);        // % progreso del ciclo
  const [daysRemaining, setDaysRemaining] = useState(0); // Días restantes
  const [loading, setLoading] = useState(true);       // Estado de carga
  const [error, setError] = useState(null);           // Error si falla API
  
  // Auto-fetch en mount
  useEffect(() => {
    fetchActiveCycle(); // GET /api/attendance/configuration/active-cycle
  }, []);
  
  return { cycle, activeBimester, progress, daysRemaining, loading, error, ... };
}
```

**Características**:
- ✅ AISLADO: Solo depende de `@/config/api`
- ✅ Auto-ejecuta en mount
- ✅ Maneja loading y error
- ✅ Tipado con TypeScript

**Uso**:
```typescript
const { cycle, activeBimester, progress, daysRemaining } = useActiveCycle();
```

---

### 2. Componente Actualizado: `AttendanceHeader.tsx`

**Cambio Principal**:

```typescript
// ❌ ANTES
const activeCycle: any = null;
const activeBimester: any = null;
const progress = 0;
const daysRemaining = 0;

// ✅ AHORA
const { cycle: activeCycle, activeBimester, progress, daysRemaining } = useActiveCycle();
```

**Resultado**:
- ✅ Muestra ciclo escolar REAL
- ✅ Muestra bimestre REAL
- ✅ Calcula progreso REAL
- ✅ Muestra días restantes REAL
- ✅ Alerta SOLO si backend retorna null (no es error)

---

### 3. Documentación Creada

| Archivo | Propósito |
|---------|-----------|
| `CICLO_ESCOLAR_ACTIVO_ENDPOINT.md` | Especificación COMPLETA para backend<br/>- Request/response examples<br/>- Prisma queries<br/>- Índices DB<br/>- Testing |
| `SOLUCION_CICLO_ESCOLAR_ACTIVO.md` | Explicación de problema+solución<br/>- Flujo de datos<br/>- Checklist<br/>- Tips |

---

## Estado Actual 📊

| Componente | Estado | Notas |
|-----------|--------|-------|
| Frontend Hook | ✅ COMPLETO | `useActiveCycle.ts` listo |
| Componente | ✅ COMPLETO | `AttendanceHeader.tsx` actualizado |
| TypeScript | ✅ COMPLETO | 0 errores |
| Estilos | ✅ COMPLETO | 100% preservados |
| **Backend Endpoint** | ⏳ PENDIENTE | **TÚ IMPLEMENTAS** |
| **Database** | ⏳ VERIFICAR | Ciclo activo en BD? |

---

## ¿Qué Necesitas Hacer? 🚀

### Step 1: Backend (Inmediato)
Crear endpoint en tu backend:

```
GET /api/attendance/configuration/active-cycle

Prisma:
- SELECT * FROM school_cycles WHERE isActive=true
- Incluir bimesters activos
- Calcular progreso % y días restantes
- Retornar JSON especificado
```

**Ver detalles en**: `CICLO_ESCOLAR_ACTIVO_ENDPOINT.md`

### Step 2: Database (Verificar)
Asegúrate que tu BD tiene:
- ✅ Al menos UN ciclo escolar con `isActive=true`
- ✅ Al menos UN bimestre con `isActive=true`

```sql
-- Si no los tienes:
UPDATE school_cycles SET isActive=true WHERE id=1;
UPDATE bimesters SET isActive=true WHERE cycleId=1;
```

### Step 3: Test
1. Implementa endpoint
2. Prueba con Postman:
   ```
   GET http://localhost:3000/api/attendance/configuration/active-cycle
   ```
3. Frontend automáticamente mostrará datos ✅

---

## Flujo de Datos 🔄

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND (Ya listo ✅)                                       │
│                                                               │
│ AttendanceHeader.tsx                                         │
│      │                                                        │
│      ▼                                                        │
│ useActiveCycle() ─ Auto-fetch en mount                       │
│      │                                                        │
│      ▼                                                        │
│ GET /api/attendance/configuration/active-cycle               │
│      │                                                        │
│      └─────────────────────┬──────────────────────────┐       │
│                            │                          │       │
│                            ▼                          ▼       │
│                    BACKEND (⏳ Pendiente)             DB      │
│                                                         │      │
│                    Prisma Query:                       │      │
│                    - isActive=true                     │      │
│                    - Include bimesters                 │      │
│                    - Calculate progress                │      │
│                    - Calculate daysRemaining           │      │
│                                                         │      │
│                            ▲                          ▲       │
│      ┌─────────────────────┘                          │       │
│      │                                                 │       │
│      ▼                                                 │       │
│ Response JSON ◄──────────────────────────────────────┘       │
│ {                                                             │
│   success: true,                                              │
│   data: {                                                     │
│     cycle: {...},                                            │
│     activeBimester: {...},                                   │
│     progress: 35,                                            │
│     daysRemaining: 138                                       │
│   }                                                           │
│ }                                                             │
│      │                                                        │
│      ▼                                                        │
│ State Update:                                                 │
│   cycle = {id:1, name:'Ciclo 2025-I', ...}                   │
│   activeBimester = {id:1, name:'Bimestre 1', ...}            │
│   progress = 35                                              │
│   daysRemaining = 138                                        │
│      │                                                        │
│      ▼                                                        │
│ ✅ Render con datos REALES                                    │
│   - Nombre del ciclo                                         │
│   - Nombre del bimestre                                      │
│   - Barra de progreso al 35%                                 │
│   - "138 días restantes"                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Errores Esperados (Y Cómo Solucionarlos)

### Error 1: "No hay ciclo escolar activo"
**Causa**: Backend retorna null (no hay ciclo con isActive=true)
**Solución**: 
```sql
UPDATE school_cycles SET isActive=true WHERE id=1;
UPDATE bimesters SET isActive=true WHERE cycleId=1;
```

### Error 2: CORS error
**Causa**: Backend no tiene CORS configurado
**Solución**: Agregar en backend:
```typescript
app.use(cors()); // Express
// o en NestJS
app.enableCors();
```

### Error 3: 404 Not Found
**Causa**: Endpoint no existe
**Solución**: Implementar endpoint según `CICLO_ESCOLAR_ACTIVO_ENDPOINT.md`

### Error 4: 500 Internal Error
**Causa**: Error en backend/Prisma
**Solución**: Revisar logs del backend

---

## Quick Reference 📋

**Frontend Hook**:
```typescript
import { useActiveCycle } from '@/hooks/attendance/useActiveCycle';

const { cycle, activeBimester, progress, daysRemaining, loading, error } = useActiveCycle();
```

**Backend Endpoint**:
```
GET /api/attendance/configuration/active-cycle
```

**Response**:
```json
{
  "success": true,
  "data": {
    "cycle": { id, name, startDate, endDate, academicYear, ... },
    "activeBimester": { id, name, startDate, endDate, ... },
    "progress": 35,
    "daysRemaining": 138
  }
}
```

---

## Archivos Involucrados 📁

**Creados/Modificados**:
- ✅ `src/hooks/attendance/useActiveCycle.ts` (NUEVO)
- ✅ `src/components/features/attendance/components/attendance-header/AttendanceHeader.tsx` (MODIFICADO)
- ✅ `CICLO_ESCOLAR_ACTIVO_ENDPOINT.md` (NUEVO)
- ✅ `SOLUCION_CICLO_ESCOLAR_ACTIVO.md` (NUEVO)

---

**Status**: 🟢 FRONTEND READY - ⏳ BACKEND PENDING  
**Próximo**: Implementar backend según especificación
