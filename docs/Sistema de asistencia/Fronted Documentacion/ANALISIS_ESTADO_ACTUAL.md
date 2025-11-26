# 📋 ANÁLISIS - ESTADO ACTUAL & DECISIONES CRÍTICAS

**Fecha:** Nov 21, 2025  
**Análisis realizado para PASO 1-2 de FASE 1**

---

## ⚠️ HALLAZGOS CRÍTICOS

### 1. **ESTADOS DE ASISTENCIA - DINÁMICOS (schema.prisma)**

❌ **NO usar enums estáticos**

```typescript
// ❌ INCORRECTO
enum AttendanceStatusCode {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
}

// ✅ CORRECTO
type AttendanceStatusCode = string;  // Viene de BD
```

**En BD (AttendanceStatus table):**
- `code`: String único (PRESENT, ABSENT, LATE, EXCUSED, etc)
- `name`: Nombre descriptivo
- `isNegative`: Boolean (¿afecta asistencia negativa?)
- `isExcused`: Boolean (¿es disculpa válida?)
- `requiresJustification`: Boolean
- `colorCode`: Color hex para UI

**Implicación:** Types/Schemas/Constants deben usar `string`, no enums.

---

### 2. **HOOKS EXISTENTES - ANÁLISIS DETALLADO**

**Revisados 7 hooks antiguos:**

| Hook | Líneas | Contenido | Decisión |
|------|--------|----------|----------|
| `useAttendanceConfig.ts` | 391 | Config general, load/create/update configs | ✅ **REUTILIZAR** - Muy útil |
| `useAttendanceManager.ts` | 154 | Manejo de secciones, cursos, estudiantes, estado | ⚠️ **REVISAR** - Algunos patterns útiles |
| `useAttendanceSystem.ts` | 459 | Hook composado complejo, ciclos + cursos + estudiantes + reportes | ⚠️ **COMPLEJO** - Demasiado grande, dividir |
| `useAttendancePermissions.ts` | 221 | Control de permisos por rol y scope | ✅ **REUTILIZAR** - Necesario para seguridad |
| `useAttendanceValidationPhases.ts` | 639 | **13 FASES** de validación (mega hook) | ⚠️ **MUY COMPLEJO** - Dividir en hooks pequeños |
| `useAttendanceValidationServices.ts` | 244 | Queries para ciclos, bimestres, semanas, ausencias | ✅ **REUTILIZAR** - Uso de react-query, bien estructurado |
| `useAttendanceUtils.ts` | ? | ? | ⏳ **NO REVISADO** - Revisar contenido |

**Status:** Hay código reutilizable, pero también código heredado y mega-hooks.

**Plan:**
- ✅ Reutilizar: `useAttendanceConfig.ts`, `useAttendancePermissions.ts`, `useAttendanceValidationServices.ts`
- 🔄 Refactorizar: `useAttendanceSystem.ts`, `useAttendanceValidationPhases.ts` (dividir)
- ⏳ Revisar: `useAttendanceUtils.ts`
- 🆕 Crear nuevos: 5 hooks en `/data/attendance/` con lógica específica

---

### 3. **ESTRUCTURA DE ARCHIVOS - ESTADO**

**En `src/hooks/data/attendance/`:**
- ✅ Carpeta existe
- ⏳ Solo tiene `index.ts` vacío
- ❌ Falta crear 5 hooks nuevos

**Hooks a crear en `/data/attendance/`:**
```
src/hooks/data/attendance/
├── index.ts (ya existe)
├── useAttendance.ts ← NUEVO
├── useAttendanceValidations.ts ← NUEVO
├── useAttendanceReport.ts ← NUEVO
├── useAttendanceFilters.ts ← NUEVO
└── useDailyRegistration.ts ← NUEVO
```

**Hooks viejos fuera de `/data/`:**
```
src/hooks/
├── useAttendanceConfig.ts ← REVISAR/LIMPIAR
├── useAttendanceManager.ts ← REVISAR/LIMPIAR
├── useAttendanceSystem.ts ← REVISAR/LIMPIAR
├── useAttendancePermissions.ts ← REVISAR/LIMPIAR
├── useAttendanceValidationPhases.ts ← REVISAR/LIMPIAR
├── useAttendanceValidationServices.ts ← REVISAR/LIMPIAR
└── useAttendanceUtils.ts ← REVISAR/LIMPIAR
```

---

## 🎯 PLAN DE ACCIÓN CORREGIDO

### PASO 0: Limpiar hooks antiguos (1 hora)
- [ ] Revisar cada hook antiguo
- [ ] Identificar código útil vs obsoleto
- [ ] Documentar decisiones
- [ ] Mover/eliminar según análisis

### PASO 1: Archivos auxiliares (1-2 horas)
- [ ] `src/middleware/api-handler.ts` - Middleware de errores
- [ ] `src/constants/attendance.constants.ts` - Constantes (SIN enums de status)
- [ ] `src/utils/attendance-utils.ts` - Funciones útiles

### PASO 2: Nuevos hooks (2-3 horas)
- [ ] `useAttendance.ts` - Principal
- [ ] `useAttendanceValidations.ts` - Validaciones
- [ ] `useAttendanceReport.ts` - Reportes
- [ ] `useAttendanceFilters.ts` - Filtros
- [ ] `useDailyRegistration.ts` - Registro diario

### PASO 3: Compilación (1 hora)
- [ ] `npm run build`
- [ ] `npm run lint`

---

## 📝 CAMBIOS A SCHEMA/TYPES

### Lo que ESTÁ BIEN en types/attendance.types.ts:
- ✅ EnrollmentStatusEnum (SÍ es enum - estático en Prisma)
- ✅ Interfaces generales
- ✅ Types para payloads

### Lo que DEBE CAMBIAR:
- ❌ Si hay enum de AttendanceStatus → cambiar a `string`
- ❌ Si hay hardcoded estados → remover, traer de BD
- ✅ Agregar tipo: `type AttendanceStatusCode = string`

---

## 🔑 NOTAS FINALES

1. **Reutilizar código existente** - No duplicar
2. **NO hardcodear estados** - Son dinámicos de BD
3. **Revisar antes de crear** - Evitar obsoletos
4. **Documentar decisiones** - Qué se reutiliza, qué se elimina
5. **Compilar sin warnings** - Indicador de salud

---

**Próximo paso:** ¿Empezar PASO 0 (revisar hooks antiguos)?
