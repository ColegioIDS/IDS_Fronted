# 📋 Plan de Trabajo - Implementación Frontend de Asistencia

**Fecha:** 13 de Noviembre, 2025  
**Estado:** 🔄 En Progreso  
**Backend Status:** ✅ 100% Completado

---

## 🎯 Objetivo General

Integrar el sistema de asistencia de estudiantes en el frontend consumiendo 4 endpoints del backend.

---

## ✅ FASE 1: TIPOS Y INTERFACES

- [ ] 1.1 Revisar `/src/types/attendance.types.ts`
- [ ] 1.2 Crear `CreateAttendancePayload` interface
- [ ] 1.3 Crear `UpdateAttendancePayload` interface (con changeReason OBLIGATORIO)
- [ ] 1.4 Crear `AttendanceReport` interface
- [ ] 1.5 Crear `AttendanceScope` type

---

## 📡 FASE 2: ACTUALIZAR SERVICIO HTTP

- [ ] 2.1 Revisar `/src/services/attendance.service.ts`
- [ ] 2.2 Implementar `registerBulkAttendance()` → POST /api/attendance/register
- [ ] 2.3 Implementar `updateAttendance()` → PATCH /api/attendance/:id
- [ ] 2.4 Implementar `getAttendanceHistory()` → GET /api/attendance/enrollment/:enrollmentId
- [ ] 2.5 Implementar `getAttendanceReport()` → GET /api/attendance/report/:enrollmentId
- [ ] 2.6 Agregar manejo de errores y toasts

---

## 🎨 FASE 3: COMPONENTES UI - BÁSICOS

- [ ] 3.1 Actualizar `AttendanceManager.tsx` (componente principal)
- [ ] 3.2 Crear `AttendanceForm.tsx` (formulario de registro)
- [ ] 3.3 Crear `StudentCheckboxTable.tsx` (tabla con checkboxes)
- [ ] 3.4 Crear `GradeSectionSelector.tsx` (selectores dinámicos)
- [ ] 3.5 Crear `AttendanceStatusSelect.tsx` (estados de asistencia)

---

## 📊 FASE 4: HISTORIAL Y REPORTES

- [ ] 4.1 Crear `AttendanceHistory.tsx` (historial paginado)
- [ ] 4.2 Crear `ChangeReasonModal.tsx` (modal para editar)
- [ ] 4.3 Crear `AttendanceReport.tsx` (reporte consolidado)
- [ ] 4.4 Crear `AttendanceStats.tsx` (tarjetas de estadísticas)

---

## 🔐 FASE 5: PERMISOS Y VALIDACIONES

- [ ] 5.1 Crear `useAttendancePermissions.ts` (hook de permisos)
- [ ] 5.2 Implementar validación de scope
- [ ] 5.3 Integrar con autenticación
- [ ] 5.4 Crear `NoPermission.tsx` (componente de sin permisos)

---

## 🪝 FASE 6: CUSTOM HOOKS

- [ ] 6.1 Crear `useAttendance.ts` (hook principal con mutations/queries)
- [ ] 6.2 Crear `useGradesAndSections.ts` (hook de datos académicos)
- [ ] 6.3 Crear `useAttendanceStatuses.ts` (hook de estados)

---

## 📱 FASE 7: PÁGINAS Y RUTAS

- [ ] 7.1 Crear ruta `/attendance` (página principal)
- [ ] 7.2 Crear ruta `/attendance/register` (registro masivo)
- [ ] 7.3 Crear ruta `/attendance/history/:enrollmentId` (historial)
- [ ] 7.4 Crear ruta `/attendance/reports` (reportes)

---

## ✅ FASE 8: VALIDACIONES Y ERRORES

- [ ] 8.1 Crear Zod schemas en frontend
- [ ] 8.2 Manejo de errores HTTP (400, 403, 404, 500)
- [ ] 8.3 Validaciones de negocio
- [ ] 8.4 Feedback visual (toasts, spinners, estados)

---

## 🧪 FASE 9: TESTING (OPCIONAL)

- [ ] 9.1 Tests unitarios de servicios
- [ ] 9.2 Tests de componentes
- [ ] 9.3 Tests E2E

---

## 📚 FASE 10: DOCUMENTACIÓN

- [ ] 10.1 Crear guía de integración
- [ ] 10.2 Actualizar README
- [ ] 10.3 Verificar funcionamiento completo

---

## 🔗 Endpoints Lista

```
POST   /api/attendance/register
PATCH  /api/attendance/:id
GET    /api/attendance/enrollment/:enrollmentId?limit=50&offset=0
GET    /api/attendance/report/:enrollmentId
```

---

## 📊 Progreso

```
Backend:     ████████████████████████ 100% ✅
Frontend:    ░░░░░░░░░░░░░░░░░░░░░░░░  0% 🔄

Total:       ████░░░░░░░░░░░░░░░░░░░░ ~33%
```

---

**Última Actualización:** 13 Noviembre 2025  
**Status:** 🔄 En Progreso
