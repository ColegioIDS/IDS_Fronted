// NEXT_STEPS.md

# 🚀 Próximos Pasos - Fase 2 Attendance

**Completado:** Fase 1 ✅  
**En Progreso:** Fase 2 (Refactorización de Componentes)  
**Fecha:** 7 de Noviembre, 2025

---

## 📋 Checklist Fase 2

### Component Refactorization

- [ ] **AttendanceHeader** (`components/attendance-header/`)
  - [ ] Integrar `useAttendanceFilters`
  - [ ] Integrar `useAttendanceData` para estadísticas
  - [ ] Crear selector de fecha inteligente
  - [ ] Crear selector de sección
  - [ ] Mostrar estadísticas en tiempo real

- [ ] **AttendanceGrid** (`components/attendance-grid/`)
  - [ ] Usar `useAttendanceData` para listar
  - [ ] Usar `useAttendanceActions` para cambiar status
  - [ ] Implementar cambio de status en tiempo real
  - [ ] Refactorizar StudentRow para nuevo estado
  - [ ] Agregar indicador de carga por fila

- [ ] **AttendanceModals** (`components/attendance-modals/`)
  - [ ] BulkEditModal con `useAttendanceActions`
  - [ ] JustificationModal con `createJustification`
  - [ ] ReportsModal con `generateReport`
  - [ ] ConfirmationModal para bulk deletes

- [ ] **AttendanceControls** (`components/attendance-controls/`)
  - [ ] BulkActions con funciones nuevo
  - [ ] FilterControls con `useAttendanceFilters`
  - [ ] SaveStatus integrado
  - [ ] ViewModeToggle funcional

- [ ] **AttendanceStates** (`components/attendance-states/`)
  - [ ] LoadingState con skeleton mejorado
  - [ ] ErrorState con retry logic
  - [ ] EmptyState personalizado
  - [ ] HolidayNotice desde datos

### Permission Integration

- [ ] [ ] Crear `usePermissionsScope.ts` hook (nuevo)
  - [ ] Obtener scope del usuario
  - [ ] Validar acceso por scope
  - [ ] Filtrar datos automáticamente

- [ ] Integrar permisos en componentes
  - [ ] AttendanceHeader: mostrar/ocultar botones según permisos
  - [ ] AttendanceGrid: ocultar columnas de edición si no tiene permiso
  - [ ] Bulk actions: validar scope antes de ejecutar

- [ ] Validar en hooks
  - [ ] `useAttendanceActions`: validar scope antes de crear/actualizar
  - [ ] `useAttendanceData`: añadir scope automáticamente

### Testing

- [ ] Unit tests para hooks
  - [ ] `useAttendanceData.test.ts`
  - [ ] `useAttendanceFilters.test.ts`
  - [ ] `useAttendanceActions.test.ts`

- [ ] Integration tests
  - [ ] Test flujo completo de componente

- [ ] E2E tests (si aplica)

### Documentation

- [ ] Actualizar README.md del módulo
- [ ] Documentar componentes refactorizados
- [ ] Crear guía de migración para devs
- [ ] Ejemplos de implementación

---

## 📝 Template: Componente Refactorizado

```typescript
'use client';

import {
  useAttendanceData,
  useAttendanceFilters,
  useAttendanceActions,
} from '@/hooks/attendance';
import { useEffect } from 'react';

interface ComponentProps {
  sectionId?: number;
  studentId?: number;
}

export function RefactoredComponent({ sectionId, studentId }: ComponentProps) {
  // Hooks
  const { attendances, loading, error, fetchAttendances } = useAttendanceData();
  const { filters, setFilter, getQueryParams } = useAttendanceFilters();
  const { updateAttendance, loading: actionLoading } = useAttendanceActions();

  // Effects
  useEffect(() => {
    const query = getQueryParams();
    fetchAttendances({
      ...query,
      sectionId,
      studentId,
      page: 1,
      limit: 20,
    });
  }, [sectionId, studentId]);

  // Handlers
  const handleStatusChange = async (attendanceId: number, newStatus: any) => {
    try {
      await updateAttendance(attendanceId, { statusCode: newStatus });
      await fetchAttendances(getQueryParams());
    } catch (err) {
      console.error('Error updating attendance:', err);
    }
  };

  // Render
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (attendances.length === 0) return <EmptyState />;

  return (
    <div>
      {/* Componentes */}
    </div>
  );
}
```

---

## 🔧 Cambios de API Esperados

### Nuevos Endpoints (Confirmar con Backend)

```
GET    /api/attendance              ✅ Listado
GET    /api/attendance/:id          ✅ Detalle
POST   /api/attendance              ✅ Crear
PATCH  /api/attendance/:id          ✅ Actualizar
DELETE /api/attendance/:id          ✅ Eliminar

POST   /api/attendance/bulk         ✅ Crear múltiples
PATCH  /api/attendance/bulk         ✅ Actualizar múltiples
DELETE /api/attendance/bulk         ✅ Eliminar múltiples
POST   /api/attendance/bulk-apply-status ✅ Aplicar status

GET    /api/attendance/stats        ✅ Estadísticas
GET    /api/attendance/reports      ✅ Reportes
GET    /api/attendance/export/csv   ✅ Exportar

GET    /api/attendance/justifications
POST   /api/attendance/justifications
PATCH  /api/attendance/justifications/:id
PATCH  /api/attendance/justifications/:id/approve
PATCH  /api/attendance/justifications/:id/reject
DELETE /api/attendance/justifications/:id
```

### Posibles Cambios
- ⚠️ Validar estructura de response del backend
- ⚠️ Confirmar formato de errores
- ⚠️ Confirmar paginación metadata

---

## 🎯 Prioridad de Componentes

### 🔴 Alta Prioridad
1. **AttendanceGrid** - Core functionality
2. **AttendanceHeader** - UI principal
3. **BulkActions** - Acciones masivas

### 🟡 Media Prioridad
1. **AttendanceModals** - Dialogs
2. **FilterControls** - Búsqueda
3. **AttendanceStats** - Información

### 🟢 Baja Prioridad
1. **LoadingState** - UX
2. **ErrorState** - UX
3. **ReportsModal** - Funcionalidad extra

---

## 💡 Funcionalidades a Implementar

### Básicas
- [x] Listar asistencias
- [x] Crear asistencia
- [x] Actualizar asistencia
- [x] Eliminar asistencia
- [ ] Cambiar status individual
- [ ] Cambiar status masivo
- [ ] Filtrar por sección/fecha
- [ ] Ver estadísticas

### Intermedias
- [ ] Justificantes
- [ ] Historial de cambios
- [ ] Reportes básicos
- [ ] Exportar a CSV

### Avanzadas
- [ ] Análisis de tendencias
- [ ] Alertas automáticas
- [ ] Integración con SMS
- [ ] Gráficos de asistencia

---

## 🔐 Validaciones de Scope

### Scope: 'all'
- Acceso a todas las secciones
- Acceso a todos los estudiantes
- Todas las acciones permitidas
- Rol: Admin

### Scope: 'section'
- Acceso solo a su sección
- Solo estudiantes de su sección
- Crear/editar permitido
- Rol: Docente/Coordinador

### Scope: 'own'
- Acceso solo a sus propios registros
- Lectura de asistencia personal
- Crear justificantes propios
- Rol: Estudiante/Padre

### Scope: 'grade'
- Acceso a su grado
- Múltiples secciones
- Acceso de coordinador
- Rol: Coordinador académico

---

## 📊 Métricas de Éxito Fase 2

- ✅ 100% de componentes refactorizados
- ✅ Permisos funcionando correctamente
- ✅ Carga de datos optimizada
- ✅ Errores manejados apropiadamente
- ✅ Tests pasando
- ✅ Performance aceptable
- ✅ Sin console errors

---

## 🚨 Consideraciones Importantes

### Rendimiento
- El servicio ya maneja paginación
- Los hooks usan `useCallback` para memoización
- Considerar agregar debounce en filtros

### Seguridad
- Backend valida permisos
- Frontend filtra UI según scope
- No confiar en datos del cliente

### UX
- Mostrar loading states
- Mostrar error messages claros
- Confirmación antes de acciones destructivas
- Feedback visual de cambios

---

## 📞 Contactos Útiles

### Backend
- [ ] Confirmar endpoints exactos
- [ ] Confirmar estructura de responses
- [ ] Confirmar códigos de error
- [ ] Confirmar validaciones

### QA
- [ ] Casos de prueba
- [ ] Datos de prueba
- [ ] Escenarios edge cases

### Design
- [ ] Confirmación de UX
- [ ] Loading states
- [ ] Error messages
- [ ] Empty states

---

## 🎓 Learning Resources

- React Hooks: https://react.dev/reference/react/hooks
- TypeScript Handbook: https://www.typescriptlang.org/docs/
- Axios Documentation: https://axios-http.com/docs/intro
- Next.js Client Components: https://nextjs.org/docs/getting-started/react-essentials

---

## ⏰ Estimación de Tiempo

| Tarea | Estimación |
|-------|-----------|
| Refactorizar AttendanceGrid | 4-6 horas |
| Refactorizar AttendanceHeader | 2-3 horas |
| Refactorizar Modals | 3-4 horas |
| Integrar Permisos | 4-6 horas |
| Testing | 4-6 horas |
| Bug Fixes | 2-3 horas |
| Documentación | 1-2 horas |
| **TOTAL** | **20-30 horas** |

---

## 📋 Pre-requisitos para Fase 2

- [x] Tipos creados
- [x] Servicio creado
- [x] Hooks creados
- [ ] Backend endpoints funcionales
- [ ] Autenticación funcionando
- [ ] Permisos en backend implementados
- [ ] Base de datos con datos de prueba

---

## 🎉 Definición de "Completado"

Fase 2 estará completa cuando:

1. ✅ Todos los componentes usan los nuevos hooks
2. ✅ Permisos están integrados correctamente
3. ✅ Tests pasan
4. ✅ No hay console errors
5. ✅ Documentación actualizada
6. ✅ QA aprobó funcionalidad
7. ✅ Performance es aceptable
8. ✅ Código revisado por equipo

---

## 🔗 Links Útiles Fase 2

- **Componentes actuales:** `src/components/features/attendance/components/`
- **Tipos:** `src/types/attendance.types.ts`
- **Servicio:** `src/services/attendance.service.ts`
- **Hooks:** `src/hooks/attendance/`
- **Guía de uso:** `src/hooks/attendance/USAGE_GUIDE.md`
- **Arquitectura:** `ARCHITECTURE_DIAGRAM.md`

---

**Estado:** Fase 1 ✅ Completada  
**Próximo:** Fase 2 - Refactorización 🚀  
**Actualizado:** 7 de Noviembre, 2025

¡Listo para comenzar Fase 2!
