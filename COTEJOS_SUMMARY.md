# 📊 Módulo de Cotejos - Resumen de Creación

## ✅ Completado

Se ha creado un **módulo completo de Cotejos** para la consolidación de calificaciones con la siguiente estructura:

### 📁 Archivos Creados

#### 1. **Tipos y Interfaces** (`src/types/cotejos.types.ts`)
- `Cotejo` - Entidad principal
- `CotejoResponse` - Respuesta del API
- `CascadeResponse` - Respuesta de cascada
- `Student`, `Enrollment`, `Course`, `Bimester`, `Teacher`, `Grade`, `Section`, `SchoolCycle`, `AcademicWeek`, `CourseAssignment`
- DTOs para todas las operaciones

#### 2. **Esquemas de Validación** (`src/schemas/cotejos.schema.ts`)
- `GenerateCotejoSchema`
- `UpdateActitudinalSchema` (0-20)
- `UpdateDeclarativoSchema` (0-30)
- `SubmitCotejoSchema`
- `CascadeQuerySchema`
- `CotejoBySectionQuerySchema`

#### 3. **Servicio API** (`src/services/cotejos.service.ts`)
- `getCascadeData()` - Obtener datos en cascada
- `generateCotejo()` - Generar nuevo cotejo
- `getCotejo()` - Obtener cotejo por ID
- `getCotejosBySection()` - Obtener cotejos de una sección
- `updateActitudinal()` - Actualizar puntuación de comportamiento
- `updateDeclarativo()` - Actualizar puntuación de conocimiento
- `submitCotejo()` - Finalizar cotejo
- `generateCotejosBatch()` - Operación en lote

#### 4. **Hooks Personalizados** (`src/hooks/useCotejos.ts`)
- `useCotejo(id)` - Obtener cotejo
- `useCascade(includeInactive)` - Obtener cascada
- `useCotejosBySection(params)` - Obtener cotejos de sección
- `useUpdateActitudinal()` - Mutación actualizar actitudinal
- `useUpdateDeclarativo()` - Mutación actualizar declarativo
- `useGenerateCotejo()` - Mutación generar cotejo
- `useSubmitCotejo()` - Mutación finalizar cotejo

#### 5. **Componentes** (`src/components/features/cotejos/`)

| Componente | Propósito |
|-----------|-----------|
| `CotejosContent.tsx` | Orquestador principal - Maneja filtros, tablas y dialogs |
| `CotejosFilters.tsx` | Filtros en cascada: Ciclo → Bimestre → Grado → Sección → Curso |
| `CotejosTable.tsx` | Tabla de listado con estados visuales y totales |
| `CotejosRowActions.tsx` | Menú desplegable de acciones por cotejo |
| `CotejoForm.tsx` | Formulario para generar nuevo cotejo |
| `CotejoEditDialog.tsx` | Dialog principal con 3 tabs para edición |
| `CotejoEditActitudinal.tsx` | Edición de comportamiento (0-20 pts) con slider |
| `CotejoEditDeclarativo.tsx` | Edición de conocimiento (0-30 pts) con slider |
| `CotejoSubmit.tsx` | Finalización: Resumen + cálculo + validación de total |
| `index.ts` | Exportaciones centralizadas |

#### 6. **Página** (`src/app/(admin)/cotejos/page.tsx`)
- Página principal del módulo de cotejos

#### 7. **Documentación**
- `COTEJOS_MODULE.md` - Documentación completa del módulo
- `COTEJOS_IMPLEMENTATION_NOTES.md` - Notas técnicas y TODO para backend
- `cotejos.examples.ts` - Ejemplos de uso del módulo

#### 8. **Actualización de Sidebar** (`src/layout/AppSidebar.tsx`)
- Agregada sección "Cotejo" con 2 subitems:
  - ✅ "Consolidación de Calificaciones" → `/cotejos`
  - ✅ "Tareas" → `/assignments`

## 🎨 Estructura de Puntuación

```
Total: 100 puntos máximo

┌─ ERICA (0-40 pts) ◄─ Automático (EricaEvaluationAggregate.bimestre_average × 40)
├─ TAREAS (0-20 pts) ◄─ Automático (Sum(AssignmentSubmission.score) / Sum(maxScore) × 20)
├─ ACTITUDINAL (0-20 pts) ◄─ Manual (Ingresado por docente)
├─ DECLARATIVO (0-30 pts) ◄─ Manual (Ingresado por docente)
└─ TOTAL (0-100 pts) ◄─ Calculado (Solo al submit)
```

## 🔄 Flujo de Trabajo

```mermaid
1. Docente accede a /cotejos
        ↓
2. Sistema carga datos en cascada
        ↓
3. Selecciona: Ciclo → Bimestre → Grado → Sección → Curso
        ↓
4. Se cargan cotejos de esa sección/curso (si existen)
        ↓
5. [GENERAR] Nuevo cotejo (si no existe)
   - Selecciona estudiante
   - ERICA y TAREAS se calculan automáticamente
   - Estado: DRAFT
        ↓
6. [EDITAR] Cotejo en 3 tabs
   Tab 1: Ingresa ACTITUDINAL (0-20)
   Tab 2: Ingresa DECLARATIVO (0-30)
   Tab 3: Visualiza resumen y finaliza
        ↓
7. [SUBMIT] Finalizar
   - Valida que todos componentes tengan valor
   - Calcula TOTAL
   - Valida que TOTAL ≤ 100
   - Cambia estado a COMPLETED
        ↓
8. Cotejo completado ✅
```

## 🎯 Estados del Cotejo

| Estado | Descripción | Color |
|--------|-------------|-------|
| **DRAFT** | Incompleto, falta ACTITUDINAL y/o DECLARATIVO | 🟡 Amarillo |
| **COMPLETED** | Finalizado, todos los componentes ingresados | 🟢 Verde |
| **SUBMITTED** | (Reservado para futuras funcionalidades) | 🔵 Azul |

## 📱 Interfaz de Usuario

### Header
- Título "Cotejos"
- Descripción "Consolidación de calificaciones por estudiante y curso"
- Botón "Generar Cotejo" (habilitado cuando filtros completos)

### Filtros (Cascada)
```
[Ciclo ▼]  [Bimestre ▼]  [Grado ▼]  [Sección ▼]  [Curso ▼]
```

### Tabla
```
| Estudiante | ERICA | TAREAS | ACTITUDINAL | DECLARATIVO | TOTAL | Estado | Acciones |
|-----------|-------|--------|-------------|-------------|-------|--------|----------|
| Juan Pérez | 32.5  | 18.75  | 18.0        | 28.5        | 97.75 | ✓      | ⋮ Editar |
```

### Dialog de Edición
```
Tab 1: ACTITUDINAL
├─ Descripción del componente
├─ Slider (0-20)
├─ Textarea para feedback
└─ Botón "Guardar Actitudinal"

Tab 2: DECLARATIVO
├─ Descripción del componente
├─ Slider (0-30)
├─ Textarea para feedback
└─ Botón "Guardar Declarativo"

Tab 3: FINALIZAR (solo si todos tienen valor)
├─ Resumen en 4 tarjetas de color
├─ Puntuación TOTAL (grande y destacada)
├─ Indicador de error si TOTAL > 100
├─ Textarea para comentarios finales
└─ Botón "Finalizar Cotejo"
```

## 🔐 Permisos

Todos los endpoints requieren autenticación JWT y permisos específicos:

```typescript
{
  module: 'cotejo',
  actions: ['create', 'read', 'update', 'submit']
}
```

En el sidebar, se validan con `ProtectedNavItem`:
```typescript
requiredAnyPermissions: [
  { module: 'cotejo', action: 'read' },
  { module: 'assignments', action: 'read' }
]
```

## 🚀 Características

✅ **Completado en Frontend:**
- Estructura en cascada de filtros
- Tabla de listado con estados visuales
- Edición por tabs ordenados
- Validaciones en tiempo real
- Sliders para puntuaciones
- Cálculo automático de totales
- Indicadores visuales de error
- Soporte para tema oscuro
- Manejo de loading y errores
- Tipos TypeScript completos

⏳ **Requiere Backend:**
- Implementación de 7 endpoints API
- Modelo Prisma para tabla `Cotejo`
- Cálculos automáticos de ERICA y TAREAS
- Persistencia en base de datos
- Validaciones server-side
- Auditoría de cambios

## 📊 Endpoints Esperados

```
GET    /api/cotejos/cascade                                    (Read cascade data)
POST   /api/cotejos/:enrollmentId/course/:courseId/generate    (Create/recalc)
GET    /api/cotejos/:id                                         (Get one)
GET    /api/cotejos/section/:sectionId/course/:courseId        (List by section)
PATCH  /api/cotejos/:id/actitudinal                            (Update behavioral)
PATCH  /api/cotejos/:id/declarativo                            (Update knowledge)
PATCH  /api/cotejos/:id/submit                                 (Finalize)
```

## 🎓 Ejemplo de Uso

```typescript
// 1. Importar componente principal
import { CotejosContent } from '@/components/features/cotejos';

// 2. Usar en página
export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <CotejosContent />
    </div>
  );
}

// 3. Usar hooks en componentes
import { useCotejo, useCascade } from '@/hooks/useCotejos';

function MiComponente() {
  const { cascade, loading } = useCascade(false);
  
  return <div>{cascade?.data?.cycle?.name}</div>;
}
```

## 📚 Documentación

- **COTEJOS_MODULE.md**: Documentación técnica completa (tipos, schemas, service, hooks, componentes, ejemplos)
- **COTEJOS_IMPLEMENTATION_NOTES.md**: Notas de implementación backend con ejemplos de código
- **cotejos.examples.ts**: Ejemplos de uso del service y hooks

## 🔍 Checklist de Integración

- [x] Tipos TypeScript creados
- [x] Schemas de validación Zod
- [x] Service completo
- [x] Hooks personalizados
- [x] Componentes de UI
- [x] Página /cotejos
- [x] Sidebar actualizado
- [x] Dark mode soporte
- [x] Documentación completa
- [ ] Backend endpoints (TODO)
- [ ] Base de datos (TODO)
- [ ] Testing (TODO)
- [ ] Permisos configurados (TODO)

## 📝 Notas Importantes

1. **CotejoForm**: Actualmente espera recibir estudiantes del API
   - Requerido: `GET /api/sections/:id/students`

2. **Cálculos**: ERICA y TAREAS se recalculan cada vez que se genera
   - Revisar lógica de cálculo en backend según especificación

3. **Validación**: Frontend valida, pero backend debe validar nuevamente
   - No confiar solo en validación cliente

4. **Errores**: Los componentes manejan errores genéricamente
   - Customizar según respuestas reales del backend

5. **Totales**: El sistema valida que TOTAL ≤ 100 antes de finalizar
   - Implementar misma validación en backend

## 🎉 Próximos Pasos

1. Implementar endpoints en backend (ver COTEJOS_IMPLEMENTATION_NOTES.md)
2. Crear modelo Prisma para `Cotejo`
3. Configurar permisos en base de datos
4. Testar flujo completo
5. Training para docentes
6. Deploy a producción

---

**Status**: ✅ **FRONTEND COMPLETADO**
**Última actualización**: 11 de diciembre de 2025
**Módulo**: Cotejos - Consolidación de Calificaciones
