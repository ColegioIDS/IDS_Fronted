# 🔐 Validación de Permisos - Módulo Grades (Grados Académicos)

## 📋 Flujo General de Validación de Permisos

```
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣  CONSTANTES DE PERMISOS (Define qué permisos existen)      │
│     src/constants/modules-permissions/grade/grade.permissions.ts │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣  PÁGINA (Valida permisos antes de renderizar)              │
│     src/app/(admin)/grades/page.tsx                            │
│     - Verifica permisos del usuario                            │
│     - Muestra "Acceso Denegado" si no tiene READ               │
│     - Pasa flags de permisos al componente                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣  COMPONENTES (Utiliza flags para renderizar UI)            │
│     src/components/features/grades/GradesPageContent.tsx       │
│     - Recibe: canView, canCreate, canEdit, canDelete          │
│     - Renderiza botones/acciones según permisos               │
│     - Pasa permisos a componentes hijo                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4️⃣  COMPONENTES HIJO (Mostrar/Ocultar funcionalidades)        │
│     - GradesGrid.tsx                                            │
│     - GradeCard.tsx                                             │
│     - Buttons/Actions específicas                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ CONSTANTES DE PERMISOS

**Archivo:** `src/constants/modules-permissions/grade/grade.permissions.ts`

```typescript
export const GRADE_PERMISSIONS = {
  CREATE: {
    module: 'grade',
    action: 'create',
    description: 'Crear nuevos grados escolares en el sistema',
    allowedScopes: ['all'],
  },
  
  READ: {
    module: 'grade',
    action: 'read',
    description: 'Listar y consultar grados escolares con filtros',
    allowedScopes: ['all'],
  },
  
  READ_ONE: {
    module: 'grade',
    action: 'read-one',
    description: 'Ver detalles de un grado escolar específico',
    allowedScopes: ['all'],
  },
  
  UPDATE: {
    module: 'grade',
    action: 'update',
    description: 'Actualizar información de grados escolares',
    allowedScopes: ['all'],
  },
  
  DELETE: {
    module: 'grade',
    action: 'delete',
    description: 'Eliminar grados escolares del sistema',
    allowedScopes: ['all'],
  },
};
```

**Estructura de cada permiso:**
- `module`: 'grade' - Identificador del módulo
- `action`: Acción específica (create, read, read-one, update, delete)
- `description`: Descripción legible para auditoría
- `allowedScopes`: Roles que pueden tener este permiso

---

## 2️⃣ VALIDACIÓN EN LA PÁGINA

**Archivo:** `src/app/(admin)/grades/page.tsx`

### Paso 1: Obtener permisos del contexto
```typescript
import { usePermissions } from '@/hooks/usePermissions';
import { MODULES_PERMISSIONS } from '@/constants/modules-permissions';

export default function GradesPage() {
  const { can } = usePermissions();
```

### Paso 2: Verificar cada permiso
```typescript
  // Verificar permisos usando las constantes
  const canRead = can.do(
    MODULES_PERMISSIONS.GRADE.READ.module,
    MODULES_PERMISSIONS.GRADE.READ.action
  );
  
  const canCreate = can.do(
    MODULES_PERMISSIONS.GRADE.CREATE.module,
    MODULES_PERMISSIONS.GRADE.CREATE.action
  );
  
  const canEdit = can.do(
    MODULES_PERMISSIONS.GRADE.UPDATE.module,
    MODULES_PERMISSIONS.GRADE.UPDATE.action
  );
  
  const canDelete = can.do(
    MODULES_PERMISSIONS.GRADE.DELETE.module,
    MODULES_PERMISSIONS.GRADE.DELETE.action
  );
```

### Paso 3: Control de acceso (Guard)
```typescript
  // Si no tiene permiso de lectura, mostrar componente de acceso denegado
  if (!canRead) {
    return (
      <NoPermissionCard
        module={MODULES_PERMISSIONS.GRADE.READ.module}
        action={MODULES_PERMISSIONS.GRADE.READ.action}
        title="Acceso Denegado"
        description="No tienes permisos para acceder a la gestión de grados escolares."
        variant="page"
      />
    );
  }
```

### Paso 4: Pasar permisos al componente
```typescript
  return (
    <div className="space-y-6">
      <Breadcrumb ... />
      <GradesPageContent
        canView={canView}
        canCreate={canCreate}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}
```

---

## 3️⃣ USO DE PERMISOS EN COMPONENTES

**Archivo:** `src/components/features/grades/GradesPageContent.tsx`

### Interfaz de Props
```typescript
interface GradesPageContentProps {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function GradesPageContent({
  canView = false,
  canCreate = false,
  canEdit = false,
  canDelete = false,
}: GradesPageContentProps) {
```

### Ejemplo 1: Mostrar/Ocultar Botón de Crear
```typescript
  {canCreate && (
    <Button
      onClick={() => setFormDialog({ open: true, mode: "create" })}
      className="bg-indigo-600 hover:bg-indigo-700"
    >
      <Plus className="w-5 h-5 mr-2" />
      Nuevo Grado
    </Button>
  )}
```

**Lógica:**
- Si `canCreate = true` → Muestra el botón "Nuevo Grado"
- Si `canCreate = false` → No renderiza el botón

### Ejemplo 2: Pasar permisos a componente hijo
```typescript
  <GradesGrid
    grades={data || []}
    isLoading={isLoading}
    onView={handleView}
    onEdit={handleEdit}
    onDelete={handleDeleteClick}
    onViewStats={handleStatsClick}
    canView={canView}      // ← Pasar permisos
    canEdit={canEdit}      // ← Pasar permisos
    canDelete={canDelete}  // ← Pasar permisos
  />
```

---

## 4️⃣ COMPONENTES HIJO - GradesGrid

**Archivo:** `src/components/features/grades/GradesGrid.tsx`

```typescript
interface GradesGridProps {
  grades: Grade[];
  isLoading: boolean;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onView?: (grade: Grade) => void;
  onEdit?: (grade: Grade) => void;
  onDelete?: (grade: Grade) => void;
}

export function GradesGrid({
  grades,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  ...props
}: GradesGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {grades.map((grade) => (
        <GradeCard
          key={grade.id}
          grade={grade}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
```

---

## 5️⃣ COMPONENTES HIJO - GradeCard

**Archivo:** `src/components/features/grades/GradeCard.tsx`

```typescript
interface GradeCardProps {
  grade: Grade;
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onView?: (grade: Grade) => void;
  onEdit?: (grade: Grade) => void;
  onDelete?: (grade: Grade) => void;
}

export function GradeCard({
  grade,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: GradeCardProps) {
  return (
    <Card>
      {/* Contenido de la tarjeta */}
      
      <div className="flex gap-2">
        {/* Botón Ver Detalles */}
        {canView && (
          <Button 
            onClick={() => onView?.(grade)}
            variant="outline"
          >
            Ver
          </Button>
        )}
        
        {/* Botón Editar */}
        {canEdit && (
          <Button 
            onClick={() => onEdit?.(grade)}
            variant="outline"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
        
        {/* Botón Eliminar */}
        {canDelete && (
          <Button 
            onClick={() => onDelete?.(grade)}
            variant="destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
```

---

## 🔄 Flujo Completo de Una Acción

### Ejemplo: Usuario intenta crear un grado

```
1. Usuario hace clic en "Nuevo Grado"
   ↓
2. GradesPageContent: handleFormSubmit() se ejecuta
   ↓
3. Service: gradesService.create(dto)
   ↓
4. API: POST /api/grades/create
   │
   ├─ ✅ Si el servidor permite (backend también valida):
   │     - Grado creado
   │     - Toast: "Grado creado exitosamente"
   │     - refresh() → Recarga la lista
   │
   └─ ❌ Si hay error en el servidor:
       - handleApiError() → Muestra error
```

---

## 🎯 Resumen: 3 Niveles de Validación

### Nivel 1: Frontend (UX)
- **Dónde:** Página y componentes
- **Qué:** Mostrar/ocultar botones y funcionalidades
- **Por qué:** Mejor experiencia de usuario
- **Seguridad:** BAJA (Usuario experto puede burlar)

```typescript
{canCreate && <Button>Crear</Button>}
```

### Nivel 2: Request Headers (Token)
- **Dónde:** En cada petición HTTP
- **Qué:** Se envía el token JWT del usuario
- **Por qué:** Identificar al usuario
- **Seguridad:** MEDIA (Token puede ser robado)

```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

### Nivel 3: Backend (Autorización)
- **Dónde:** API Server
- **Qué:** Validar permisos antes de permitir la acción
- **Por qué:** Máxima seguridad
- **Seguridad:** ALTA (Validación del servidor)

```javascript
// Pseudocódigo backend
POST /api/grades/create
if (!user.hasPermission('grade', 'create')) {
  return 403 Forbidden
}
```

---

## 📊 Matriz de Permisos - Grados

| Acción | READ | READ_ONE | CREATE | UPDATE | DELETE |
|--------|:----:|:--------:|:------:|:------:|:------:|
| Ver lista | ✅ | - | - | - | - |
| Ver detalles | ✅ | ✅ | - | - | - |
| Crear nuevo | - | - | ✅ | - | - |
| Editar | - | ✅ | - | ✅ | - |
| Eliminar | - | ✅ | - | - | ✅ |

---

## 🔗 Archivos Relacionados

```
src/
├── app/(admin)/grades/
│   └── page.tsx                    ← Página principal (validación)
│
├── components/features/grades/
│   ├── GradesPageContent.tsx       ← Componente principal
│   ├── GradesGrid.tsx              ← Grid con permisos
│   ├── GradeCard.tsx               ← Tarjeta con acciones
│   ├── GradeForm.tsx               ← Formulario de creación/edición
│   ├── GradeDetailDialog.tsx       ← Diálogo de detalles
│   ├── DeleteGradeDialog.tsx       ← Diálogo de eliminación
│   └── index.ts                    ← Exporta componentes
│
├── constants/modules-permissions/grade/
│   ├── grade.permissions.ts        ← Definición de permisos
│   └── index.ts                    ← Exporta permisos
│
├── hooks/
│   └── usePermissions.ts           ← Hook para verificar permisos
│
└── services/
    └── grades.service.ts           ← Llamadas a API
```

---

## 🚀 Patrones de Uso

### Patrón 1: Guard en Página
```typescript
if (!canRead) {
  return <NoPermissionCard />;
}
```

### Patrón 2: Flag en Props
```typescript
<Component canEdit={canEdit} />
```

### Patrón 3: Renderizado Condicional
```typescript
{canCreate && <Button>Crear</Button>}
```

### Patrón 4: Callback Condicional
```typescript
onView={canView ? handleView : undefined}
```

---

## 📝 Notas Importantes

1. **Frontend es solo presentación**: No es seguridad real
2. **Siempre validar en backend**: Cada acción debe validarse en el servidor
3. **Tokens expiran**: Verificar expiración y renovación
4. **Permisos son granulares**: Cada acción tiene su propio permiso
5. **Constantes centralizadas**: Cambiar en un solo lugar

---

## ✅ Checklist de Implementación

Cuando agregues un nuevo módulo con permisos:

- [ ] Crear `src/constants/modules-permissions/{module}/{module}.permissions.ts`
- [ ] Definir permisos: CREATE, READ, READ_ONE, UPDATE, DELETE
- [ ] Agregar al index: `src/constants/modules-permissions/index.ts`
- [ ] Validar en página: `src/app/(admin)/{module}/page.tsx`
- [ ] Pasar flags a componentes
- [ ] Renderizar condicional en UI
- [ ] Validar en backend (API)
- [ ] Testing de permisos

