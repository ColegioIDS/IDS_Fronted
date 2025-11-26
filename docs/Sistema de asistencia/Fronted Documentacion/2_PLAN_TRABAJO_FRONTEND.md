# 📅 PLAN DE TRABAJO - IMPLEMENTACIÓN FRONTEND ASISTENCIA

**Fecha:** Nov 21, 2025  
**Duración Total:** 30-40 horas de desarrollo  
**Timeline:** 2-3 semanas (si dedicas 3-4 horas diarias)

---

## 🎯 OBJETIVOS

1. ✅ Desarrollar 4 TABs funcionales
2. ✅ Integrar con API backend (20 endpoints)
3. ✅ Validaciones completas
4. ✅ Manejo de errores robusto
5. ✅ UI/UX polida con Tailwind + Shadcn
6. ✅ Tests unitarios básicos
7. ✅ Documentación clara

---

## 📊 FASES DE DESARROLLO

### **FASE 0: PREPARACIÓN (1-2 horas) ✅ 85% COMPLETADA**

**Tareas:**
- [x] Clonar/actualizar repo
- [x] Crear estructura de carpetas
- [ ] Instalar dependencias nuevas (VERIFICAR)
- [x] Configurar eslint/prettier
- [x] Crear `.env.local` con variables

**Checklist:**
```
✅ Carpeta components/features/attendance/ creada
✅ Carpeta hooks/data/attendance/ creada
✅ Carpeta schemas/, middleware/, constants/ creadas
⏳ npm install axios recharts date-fns (VERIFICAR)
✅ tsconfig.json actualizado
✅ .env.local con NEXT_PUBLIC_API_URL
```

**Archivos Creados:**
- ✅ `src/app/(admin)/(management)/attendance/page.tsx`
- ✅ `src/components/features/attendance/index.ts`
- ✅ `src/components/features/attendance/AttendancePageContent.tsx` (BONUS)
- ✅ `src/hooks/data/attendance/index.ts`
- ✅ `src/services/attendance.service.ts` (537 líneas - COMPLETO)
- ✅ `src/types/attendance.types.ts` (561 líneas - COMPLETO)
- ✅ `src/schemas/attendance.schema.ts` (527 líneas - COMPLETO)
- ⏳ `src/middleware/api-handler.ts` (VACÍO - FALTA LLENAR)
- ⏳ `src/constants/attendance.constants.ts` (VACÍO - FALTA LLENAR)
- ⏳ `src/utils/attendance-utils.ts` (VACÍO - FALTA LLENAR)

---

### **FASE 1: FOUNDATION - Tipos, Service, Hooks (4-5 horas) ✅ 60% COMPLETADA**

**Por qué primero:** Sin estos, no puedes desarrollar componentes.

#### 1.1 - Types (`attendance.types.ts`) ✅ COMPLETADO
- ✅ 561 líneas implementadas
- ✅ 20+ interfaces documentadas con JSDoc
- ✅ EnrollmentStatusEnum, AttendanceStatus, StudentAttendance, StudentClassAttendance, StudentAttendanceReport, etc.
- ✅ Exportadas en index (barrel export)
- ✅ TypeScript strict mode sin errores

**Status:** ✅ LISTO

---

#### 1.2 - Schemas (`attendance.schema.ts`) ✅ 95% COMPLETADO
- ✅ 527 líneas implementadas
- ✅ 6+ schemas de Zod: CreateAttendanceSchema, UpdateAttendanceSchema, DailyRegistrationSchema, BulkUpdateSchema, FilterSchema, DateRangeSchema
- ✅ Validaciones correctas
- ✅ Mensajes de error claros

**Status:** ✅ CASI LISTO (revisar si necesita ajustes menores)

---

#### 1.3 - Service (`attendance.service.ts`) ✅ 95% COMPLETADO
- ✅ 537 líneas implementadas
- ✅ 15+ métodos implementados:
  - Validaciones: getBimester, getHoliday, getWeek, getTeacherAbsence, getConfig, getAllowedStatuses
  - TAB 1: registerDaily, getDailyRegistrationStatus
  - TAB 2: getSectionAttendance, getAttendanceByDate, updateClassAttendance, bulkUpdateAttendance
  - TAB 3: getAttendanceReport, getStudentAttendance
  - Util: getCycleActive
- ✅ Manejo de errores con middleware
- ✅ Tipos correctos en inputs/outputs
- ✅ Documentación JSDoc completa

**Status:** ✅ CASI LISTO (compilación sin errores)
✓ Manejo de errores con middleware
✓ Tipos correctos en inputs/outputs
✓ Documentación JSDoc
```

**Métodos obligatorios:**
```typescript
// Validaciones
- getBimester(cycleId, date)
- getHoliday(bimesterId, date)
- getWeek(bimesterId, date)
- getTeacherAbsence(teacherId, date)
- getConfig()
- getAllowedStatuses(roleId)

// TAB 1
- registerDaily(data)
- getDailyRegistrationStatus(sectionId, date)

// TAB 2
- getSectionAttendance(sectionId, cycleId, date)
- getAttendanceByDate(courseAssignmentId, date)
- updateClassAttendance(classAttendanceId, data)
- bulkUpdateAttendance(data)

// TAB 3
- getAttendanceReport(enrollmentId)
- getStudentAttendance(enrollmentId)

// Util
- getCycleActive()
```

✓ Manejo de errores con middleware
✓ Tipos correctos en inputs/outputs
✓ Documentación JSDoc

**Status:** ✅ CASI LISTO (compilación sin errores)

---

#### 1.4 - Hooks (`hooks/data/attendance/`) ⏳ 0% - NO INICIADO

Necesitas crear estos 5 hooks:
```
- [ ] useAttendance.ts (Hook principal - 150 líneas)
- [ ] useAttendanceValidations.ts (Validaciones - 200 líneas)
- [ ] useAttendanceReport.ts (Reportes - 180 líneas)
- [ ] useAttendanceFilters.ts (Filtros - 120 líneas)
- [ ] useDailyRegistration.ts (Registro diario - 150 líneas)
```

**Checklist:**
- [ ] Todos los hooks usan useCallback
- [ ] Debounce en búsquedas
- [ ] Memory leak prevention (cleanup functions)
- [ ] Error handling completo

**Status:** ⏳ PENDIENTE (CRÍTICO PARA CONTINUAR)

---

**Fin FASE 1:** Tienes toda la lógica lista. Compilación sin errores.

---

## 📋 RESUMEN ESTADO ACTUAL - Nov 21, 2025

### ✅ COMPLETADO (FASE 0 + Parte de FASE 1):
- ✅ Estructura de carpetas (10/10)
- ✅ Types (attendance.types.ts) - 561 líneas
- ✅ Schemas (attendance.schema.ts) - 527 líneas  
- ✅ Service (attendance.service.ts) - 537 líneas
- ✅ Ruta principal del módulo

### ⏳ EN PROGRESO (FASE 1 Incompleto):
- ⏳ Hooks de datos (0/5 creados) - BLOQUEADOR
- ⏳ Archivos auxiliares vacíos:
  - api-handler.ts (middleware)
  - attendance.constants.ts
  - attendance-utils.ts

### ❌ NO INICIADO:
- ❌ FASE 2: TAB 4 (Validaciones)
- ❌ FASE 3: TAB 1 (Registro Diario)
- ❌ FASE 4: TAB 2 (Gestión por Curso)
- ❌ FASE 5: TAB 3 (Reportes)
- ❌ Componentes compartidos

### 📊 PROGRESO TOTAL: ~40% (FASE 0 + 60% de FASE 1)

**PRÓXIMO PASO CRÍTICO:**
1. Llenar los 3 archivos auxiliares (constants, utils, api-handler)
2. Crear los 5 hooks de datos
3. Compilación y testing sin errores
4. ENTONCES comenzar componentes

---

### **FASE 2: TAB 4 (VALIDACIONES) - 3-4 horas**

**Por qué TAB 4 primero:** Es el más simple. Te permite entender el flow sin complejidad.

#### 2.1 - Componentes TAB 4 - 3 horas
```
✓ ValidationsChecker.tsx (contenedor)
✓ BimesterCheck.tsx
✓ HolidayCheck.tsx
✓ WeekCheck.tsx
✓ TeacherAbsenceCheck.tsx
✓ ConfigDisplay.tsx
✓ AllowedStatusesDisplay.tsx
```

**Estructura de cada Check:**
```tsx
- Card container
- Icon + title
- Loading state
- Success/error state
- Data display
```

**Checklist:**
- [ ] Todos los componentes compilados
- [ ] Estilos Tailwind correctos
- [ ] Integración con hooks correcta
- [ ] Manejo de errores
- [ ] No hay warnings

---

#### 2.2 - Testing TAB 4 - 1 hora
```
✓ Unit tests para hooks
✓ Component rendering tests
✓ API integration tests (mock)
```

**Checklist:**
- [ ] 5+ tests escritos
- [ ] 80%+ coverage

---

**Fin FASE 2:** TAB 4 funcional. Puedes validar que la API conecta bien.

---

### **FASE 3: TAB 1 (REGISTRO DIARIO) - 8-10 horas**

**Por qué segundo:** Es lo que más usan los maestros. Alto impacto.

#### 3.1 - Componentes Base - 2 horas
```
✓ DailyRegistrationForm.tsx (contenedor)
✓ ValidationChecks.tsx (6 validaciones previas)
✓ Integrar con hooks
```

**Checklist:**
- [ ] Forma carga correctamente
- [ ] Validaciones se ejecutan
- [ ] Estados de loading/error

---

#### 3.2 - Tabla de Estudiantes - 3 horas
```
✓ StudentGrid.tsx (tabla principal)
✓ StatusSelector.tsx (dropdown status)
✓ Paginación
✓ Estilos responsive
```

**Features:**
- Tabla con 30+ estudiantes
- Status selector por fila
- Barra de progreso "X/30 registrados"
- Búsqueda/filtro por nombre

**Checklist:**
- [ ] Tabla renderiza correctamente
- [ ] Select de status funciona
- [ ] Responsive en mobile
- [ ] Sin performance issues

---

#### 3.3 - Registro y Confirmación - 2 horas
```
✓ RegistrationSummary.tsx
✓ Botón "Registrar Todos"
✓ Dialog de confirmación
✓ POST /daily-registration
✓ Manejo de respuesta
```

**Checklist:**
- [ ] Botón hace POST correcto
- [ ] Dialog pide confirmación
- [ ] Spinner durante request
- [ ] Success message con toast
- [ ] Error handling visible

---

#### 3.4 - Shared Components - 1 hora
```
✓ AttendanceStatusBadge.tsx
✓ AttendanceStatusSelect.tsx
✓ SectionSelector.tsx
```

---

#### 3.5 - Testing TAB 1 - 2 horas
```
✓ Integration test (flujo completo)
✓ Unit tests (componentes)
✓ Mock API calls
```

**Checklist:**
- [ ] 10+ tests
- [ ] E2E test del flujo

---

**Fin FASE 3:** TAB 1 100% funcional. Puedes registrar asistencia.

---

### **FASE 4: TAB 2 (GESTIÓN POR CURSO) - 8-10 horas**

**Por qué tercero:** Necesita componentes compartidos de TAB 1.

#### 4.1 - Selector y Tabla - 3 horas
```
✓ CourseManagementForm.tsx (contenedor)
✓ CourseSelector.tsx
✓ EditableAttendanceGrid.tsx
```

**Features:**
- Selector de curso y fecha
- Tabla editable
- Edición inline de status
- Indicador de "modificado"

**Checklist:**
- [ ] Tabla editable funciona
- [ ] Cambios se reflejan en UI
- [ ] Status actual vs original visible

---

#### 4.2 - Fila Editable - 2 horas
```
✓ StudentAttendanceRow.tsx
✓ Modal editor inline
✓ Salida temprana (departureTime)
```

**Checklist:**
- [ ] Puedes editar status
- [ ] Puedes editar hora de salida
- [ ] Cambios persistentes

---

#### 4.3 - Bulk Update y Historial - 2 horas
```
✓ BulkUpdateDialog.tsx
✓ AttendanceHistoryModal.tsx
✓ PATCH /bulk-update
```

**Checklist:**
- [ ] Dialog de actualización masiva
- [ ] Muestra historial de cambios
- [ ] Auditoría visible (quién cambió qué)

---

#### 4.4 - Validaciones Permisos - 1 hora
```
✓ ProtectedButton en TAB 2
✓ Validar canModify
✓ Mostrar "Sin permisos"
```

---

#### 4.5 - Testing TAB 2 - 2 horas
```
✓ Unit tests componentes
✓ Integration test (editar)
✓ Test de permisos
```

---

**Fin FASE 4:** TAB 2 100% funcional. Puedes editar asistencia.

---

### **FASE 5: TAB 3 (REPORTES) - 6-8 horas**

**Por qué cuarto:** Necesita que funcionen TAB 1 y 2 (datos reales).

#### 5.1 - Selector y Tarjeta - 2 horas
```
✓ ReportsContainer.tsx (contenedor)
✓ StudentSelector.tsx
✓ ReportCard.tsx (métricas principales)
```

**Features:**
- Selector de estudiante
- Card con resumen
- Porcentaje asistencia (color: verde/rojo)
- Indicador de riesgo

**Checklist:**
- [ ] Card muestra datos correctamente
- [ ] Colores indicadores correcto
- [ ] Responsive

---

#### 5.2 - Gráfico y Tabla - 2 horas
```
✓ AttendanceChart.tsx (Recharts)
✓ AttendanceTable.tsx (Historial)
✓ RiskIndicator.tsx
```

**Features:**
- Pie chart de asistencia
- Tabla con 50+ registros paginada
- Filtro por rango de fechas

**Checklist:**
- [ ] Gráfico muestra datos
- [ ] Tabla paginada
- [ ] Responsive

---

#### 5.3 - Shared Components - 1 hora
```
✓ RiskIndicator.tsx
✓ StudentInfo.tsx
✓ DateRangePicker.tsx
```

---

#### 5.4 - Testing TAB 3 - 1 hora
```
✓ Unit tests
✓ Mock data para reportes
```

---

**Fin FASE 5:** TAB 3 100% funcional. Ves reportes detallados.

---

### **FASE 6: INTEGRACIÓN Y PULIDO (4-5 horas)**

#### 6.1 - Componente Principal - 1 hora
```
✓ AttendancePageContent.tsx
✓ AttendanceTabs.tsx
✓ Navegación entre TABs
✓ Persistencia de TAB activo
```

**Checklist:**
- [ ] Todos los TABs accesibles
- [ ] TAB activo se guarda (localStorage)
- [ ] Transiciones suaves

---

#### 6.2 - Shared Components - 1 hora
```
✓ Todos los shared components
✓ Reutilización entre TABs
✓ Consistency de estilos
```

---

#### 6.3 - Error Handling y Validaciones - 1 hora
```
✓ Error Boundary (componente)
✓ Validaciones locales (Zod)
✓ Mensajes de error claros
✓ Toast notifications
```

**Checklist:**
- [ ] Error Boundary implementado
- [ ] Todos los errores muestran toast
- [ ] Validaciones antes de enviar

---

#### 6.4 - Estilos y Responsive - 1 hora
```
✓ Tailwind CSS pulido
✓ Mobile responsivo
✓ Dark mode (si aplica)
✓ Temas consistentes
```

---

#### 6.5 - Testing e2e - 1 hora
```
✓ Flujo completo: TAB 1 → TAB 2 → TAB 3
✓ Test de permisos
✓ Test de errores
```

---

**Fin FASE 6:** Sistema completo funcionando. Listo para QA.

---

## 📈 TIMELINE RECOMENDADO

### **Semana 1: Fundación + TAB 4**
```
Día 1: FASE 0 (2h) + FASE 1 inicio (2h) = 4h
Día 2: FASE 1 continuación (4h) = 4h
Día 3: FASE 1 finalización (2h) + FASE 2 (2h) = 4h
Día 4: FASE 2 completar (2h) = 2h
Día 5: TAB 4 testing + fixes (2h) = 2h

Total Semana 1: 16 horas
```

### **Semana 2: TAB 1 y TAB 2**
```
Día 6: FASE 3 inicio (4h) = 4h
Día 7: FASE 3 continuación (4h) = 4h
Día 8: FASE 3 testing (2h) + FASE 4 inicio (2h) = 4h
Día 9: FASE 4 continuación (4h) = 4h
Día 10: FASE 4 testing (2h) = 2h

Total Semana 2: 18 horas
```

### **Semana 3: TAB 3 e Integración**
```
Día 11: FASE 5 inicio (4h) = 4h
Día 12: FASE 5 continuación (3h) + FASE 6 (1h) = 4h
Día 13: FASE 6 continuación (4h) = 4h
Día 14: FASE 6 testing + fixes (4h) = 4h

Total Semana 3: 16 horas
```

**Total: ~50 horas de trabajo**

---

## ⏰ TIMELINE COMPRIMIDO (Si tienes más tiempo)

Si trabajas 4-5 horas diarias:
- Semana 1: Fundación + TAB 4 + TAB 1 (16h)
- Semana 2: TAB 1 + TAB 2 (16h)
- Semana 3: TAB 2 + TAB 3 (16h)
- Semana 4: TAB 3 + Integración (12h)

**Total: 3-4 semanas**

---

## 📋 DAILY STANDUP CHECKLIST

Cada día, marca qué completaste:

```markdown
## DÍA X (FECHA)

### Completado Hoy
- [ ] Componente A
- [ ] Hook B
- [ ] Tests para C

### Bloques
- [ ] (Si hay, describir)

### Para Mañana
- [ ] Componente D
- [ ] Integración con E

### Notas
- Qué aprendiste
- Qué fue fácil/difícil
```

---

## 🚨 RIESGOS Y SOLUCIONES

| Riesgo | Probabilidad | Solución |
|--------|-------------|----------|
| API cambios | Media | Mantener tests de API |
| Performance lentitud | Baja | Usar React.memo en tablas |
| Mobile responsive | Baja | Testear en iPhone 12 |
| Permisos complejos | Media | Validar cada endpoint |
| Errores no manejados | Alta | Usar Error Boundary |

---

## ✅ CRITERIA DE ÉXITO

### MVP (Mínimo Viable)
```
✅ TAB 1 funcional (registrar asistencia)
✅ TAB 2 funcional (editar registros)
✅ TAB 3 funcional (ver reportes)
✅ TAB 4 funcional (validaciones)
✅ Errores manejados
✅ Mobile responsive
✅ Documentación clara
```

### BONUS (Nice to Have)
```
✅ Tests e2e funcionales
✅ Dark mode
✅ Exportar reportes a PDF
✅ Gráficos avanzados
✅ Historial completo
✅ Performance optimizado
```

---

## 📞 CONTACTO Y PREGUNTAS

Si tienes dudas durante implementación:

1. **Revisar ESTRUCTURA_FRONTEND_ATTENDANCE.md**
2. **Revisar código de ROLES** (como referencia)
3. **Revisar API_ENDPOINTS_DOCUMENTATION.md** (conexión backend)
4. **Preguntar en el equipo**

---

## 🎯 NEXT STEPS

1. ✅ Leer este plan completamente
2. ✅ Leer ESTRUCTURA_FRONTEND_ATTENDANCE.md
3. ✅ Crear estructura de carpetas
4. ✅ Instalar dependencias
5. ✅ Empezar FASE 0
6. ✅ Comenzar FASE 1

**Estima:** Estás listo para empezar en 1 hora.

---

**¡A codear! 🚀**

Generado: Nov 21, 2025
