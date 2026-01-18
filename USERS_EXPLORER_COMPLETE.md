# 📋 Exploración Completa: Módulo de Usuarios
**Ubicación:** `src/app/(admin)/users`  
**Fecha:** 18 de Enero, 2026

---

## 📑 Tabla de Contenidos
1. [Estructura General](#estructura-general)
2. [Página Principal](#página-principal)
3. [Componentes](#componentes)
4. [Hooks](#hooks)
5. [Types](#types)
6. [Schemas](#schemas)
7. [Services](#services)
8. [Permisos](#permisos)
9. [Flujos de Datos](#flujos-de-datos)

---

## 🏗️ Estructura General

```
src/app/(admin)/users/
├── page.tsx                          # Página principal con validación de permisos

src/components/features/users/
├── UsersPageContent.tsx              # Contenedor principal
├── UserForm.tsx                      # Formulario de creación/edición
├── UserTable.tsx                     # Vista tabla de usuarios
├── UsersGrid.tsx                     # Vista grid de usuarios
├── UserCard.tsx                      # Tarjeta individual de usuario
├── UserFilters.tsx                   # Sistema de filtros
├── UserStats.tsx                     # Estadísticas de usuarios
├── UserDetailDialog.tsx              # Modal de detalles
├── DeleteUserDialog.tsx              # Modal de confirmación de eliminación
├── ChangePasswordDialog.tsx          # Modal para cambiar contraseña
├── ParentDetailsForm.tsx             # Formulario de detalles de padre/madre
├── TeacherDetailsForm.tsx            # Formulario de detalles de maestro
├── ParentStudentLinksDialog.tsx      # Modal para vincular padre-estudiante
└── index.ts                          # Exports

src/hooks/data/
├── useUsers.ts                       # Hook principal de usuarios

src/types/
├── users.types.ts                    # Tipos e interfaces

src/schemas/
├── users.schema.ts                   # Validaciones Zod

src/services/
├── users.service.ts                  # API service

src/constants/modules-permissions/
└── user/
    └── user.permissions.ts           # Definición de permisos
```

---

## 🎯 Página Principal

### `page.tsx`
**Cliente:** Sí (`'use client'`)  
**Propósito:** Punto de entrada, validación de permisos

```typescript
// Permisos verificados:
- USER.READ           → Lectura general de usuarios
- USER.READ_ONE       → Ver detalles de usuario
- USER.CREATE         → Crear nuevos usuarios
- USER.UPDATE         → Editar usuarios
- USER.DELETE         → Eliminar usuarios
- USER.CHANGE_PASSWORD    → Cambiar contraseña
- USER.GRANT_ACCESS       → Otorgar acceso a plataforma
- USER.REVOKE_ACCESS      → Revocar acceso a plataforma
- USER.VERIFY_EMAIL       → Verificar email
- USER.RESTORE            → Restaurar usuario eliminado
- USER.ASSIGN_ROLE        → Asignar roles
- USER.READ_STATS         → Leer estadísticas
```

**Props pasadas a `UsersPageContent`:**
```typescript
interface UsersPageContentProps {
  canView?: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canChangePassword?: boolean;
  canGrantAccess?: boolean;
  canRevokeAccess?: boolean;
  canVerifyEmail?: boolean;
  canRestore?: boolean;
  canAssignRole?: boolean;
  canReadStats?: boolean;
}
```

---

## 🧩 Componentes

### 1. **UsersPageContent.tsx** 
**Responsabilidad:** Orquestador principal, gestiona estado y lógica

**Estado interno:**
```typescript
- activeTab: 'list' | 'form'
- viewMode: 'grid' | 'table'
- editingUserId: number | undefined
- deleteDialogOpen: boolean
- passwordDialogOpen: boolean
- detailDialogOpen: boolean
- selectedUser: User | null
- selectedDetailUser: User | UserWithRelations | null
```

**Funciones principales:**
- `handleCreateNew()` → Inicia creación de usuario
- `handleEdit()` → Abre formulario de edición
- `handleFormSubmit()` → Procesa crear/actualizar usuario
- `handleDeleteUser()` → Abre diálogo de eliminación
- `handleChangePassword()` → Abre diálogo de cambio de contraseña
- `handleReset()` → Reinicia filtros
- `handlePageChange()` → Cambiar página de paginación

**Usa Hook:**
- `useUsers()` → Gestiona usuarios
- `useRoles()` → Obtiene roles disponibles

---

### 2. **UserForm.tsx**
**Responsabilidad:** Formulario completo de usuario (crear/editar)

**Props:**
```typescript
interface UserFormProps {
  user?: User | UserWithRelations;  // Usuario a editar
  isLoading?: boolean;
  onSubmit: (data: CreateUserFormData | UpdateUserFormData, file?: File) => Promise<void>;
  onCancel?: () => void;
}
```

**Features:**
- 🔄 Detección automática de modo (crear vs editar)
- 📸 Upload de foto de perfil con preview
- 👥 Formularios condicionados por rol (Parent/Teacher details)
- 🔐 Validación de contraseña fuerte (en modo crear)
- 📋 Tabs para datos principales y detalles adicionales
- 👨‍👩‍👧 Detalles especiales para padres (DPI, email, ocupación, etc.)
- 👨‍🏫 Detalles especiales para maestros (fecha contratación, grado académico, etc.)

**Campos del formulario:**
```typescript
// Datos base (todos)
- email: string (email válido)
- username: string (3-20 caracteres)
- password: string (solo crear, 8+ chars, mayúscula, número, especial)
- givenNames: string
- lastNames: string
- phone: string (opcional)
- gender: 'M' | 'F' | 'O'
- roleId: string (ID del rol)
- isActive: boolean
- canAccessPlatform: boolean

// Detalles de padre/madre (si roleId es padre/madre)
- parentDetails: {
    dpiIssuedAt: string
    email: string
    workPhone: string
    occupation: string
    workplace: string
    isSponsor: boolean
    sponsorInfo: string
  }

// Detalles de maestro (si roleId es maestro)
- teacherDetails: {
    hiredDate: Date
    academicDegree: string
    isHomeroomTeacher: boolean
  }
```

---

### 3. **UserTable.tsx**
**Responsabilidad:** Vista tabular de usuarios

**Features:**
- 📊 Layout responsivo (grid)
- 👤 Columnas: Avatar, Usuario, Email, Rol, Estado
- 🎯 Acciones contextuales (Edit, Delete, Change Password, View Details)
- 🖼️ Avatar con iniciales
- ✅ Indicador de email verificado
- 🔴 Estados visuales (Activo/Inactivo)

**Props:**
```typescript
interface UserTableProps {
  users: (User | UserWithRelations)[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewDetails?: (user: User) => void;
  onChangePassword?: (user: User) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
  canChangePassword?: boolean;
}
```

---

### 4. **UsersGrid.tsx**
**Responsabilidad:** Vista grid de usuarios (similar a UserTable pero formato tarjeta)

**Features:**
- 🎨 Layout grid responsive
- 🃏 Usa componente `UserCard`
- 📱 Adaptable a mobile

---

### 5. **UserCard.tsx**
**Responsabilidad:** Tarjeta individual de usuario con acciones

**Features:**
- 🎨 Diseño elegante con animaciones
- 👁️ Indicador visual de estado (activo/inactivo)
- 📧 Información de contacto
- 🛡️ Badge de rol
- ✅ Indicador de email verificado
- 🎯 Botones de acciones (Edit, Delete, View Details)
- 🌈 Gradientes y efectos hover

**Props:**
```typescript
interface UserCardProps {
  user: User | UserWithRelations;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onViewDetails?: (user: User) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canView?: boolean;
}
```

---

### 6. **UserFilters.tsx**
**Responsabilidad:** Sistema de filtrado y búsqueda

**Filtros disponibles:**
```typescript
- search: string               → Búsqueda por nombre, email, DPI
- isActive: boolean            → Filtro por estado (Activo/Inactivo)
- canAccessPlatform: boolean   → Filtro por acceso a plataforma
- roleId: number               → Filtro por rol
- sortBy: string               → Ordenamiento
- sortOrder: 'asc' | 'desc'   → Dirección de ordenamiento
```

**Features:**
- 🔍 Búsqueda en tiempo real
- 📋 Filtros múltiples
- 🔄 Botón reset
- 💾 Indicador de filtros activos

---

### 7. **UserStats.tsx**
**Responsabilidad:** Panel de estadísticas

**Estadísticas mostradas:**
```typescript
- totalUsers: number           → Total de usuarios
- activeUsers: number          → Usuarios activos
- inactiveUsers: number        → Usuarios inactivos
- verifiedEmails: number       → Emails verificados
- canAccessPlatform: number    → Usuarios con acceso
```

**Features:**
- 📊 Cards con iconos
- 📉 Manejo de permisos (si no tiene permisos, muestra alerta)
- ⚙️ Skeleton loaders durante carga

---

### 8. **DeleteUserDialog.tsx**
**Responsabilidad:** Modal de confirmación de eliminación

**Features:**
- ⚠️ Confirmación explícita
- ℹ️ Información sobre soft delete
- 🔒 Opción de restaurar después

---

### 9. **ChangePasswordDialog.tsx**
**Responsabilidad:** Modal para cambiar contraseña de usuario

**Campos:**
```typescript
- currentPassword: string       → Contraseña actual
- newPassword: string           → Nueva contraseña
- confirmPassword: string       → Confirmación
```

**Validaciones:**
- Contraseña actual requerida
- Nueva contraseña: 8+ chars, mayúscula, número, especial
- Confirmación debe coincidir
- Nueva ≠ Antigua

---

### 10. **UserDetailDialog.tsx**
**Responsabilidad:** Modal con detalles completos del usuario

**Información mostrada:**
- Datos personales (nombres, email, DPI, teléfono)
- Rol y permisos
- Detalles de padre/maestro (si aplica)
- Foto de perfil
- Fechas de creación/actualización

---

### 11. **ParentDetailsForm.tsx**
**Responsabilidad:** Formulario específico para datos de padre/madre

**Campos:**
```typescript
- dpiIssuedAt: Date            → Fecha de emisión del DPI
- email: string                → Email
- workPhone: string            → Teléfono del trabajo
- occupation: string           → Ocupación
- workplace: string            → Lugar de trabajo
- isSponsor: boolean           → ¿Es patrocinador?
- sponsorInfo: string          → Información del patrocinio
```

---

### 12. **TeacherDetailsForm.tsx**
**Responsabilidad:** Formulario específico para datos de maestro

**Campos:**
```typescript
- hiredDate: Date              → Fecha de contratación
- academicDegree: string       → Título académico
- isHomeroomTeacher: boolean   → ¿Es tutor de grado?
```

---

### 13. **ParentStudentLinksDialog.tsx**
**Responsabilidad:** Gestión de relaciones padre-estudiante

**Features:**
- 👨‍👩‍👧 Vincular padres con estudiantes
- 📋 Tipos de relación (Padre, Madre, Tutor, Abuelo, etc.)
- 🔗 Gestionar responsabilidades (custodia, contacto de emergencia, etc.)

---

## 🎣 Hooks

### `useUsers(initialQuery?: UsersQuery)`

**Ubicación:** `src/hooks/data/useUsers.ts`

**Estado:**
```typescript
interface UseUsersState {
  data: PaginatedUsers | null;      // Lista paginada de usuarios
  stats: UserStats | null;          // Estadísticas
  isLoading: boolean;               // Cargando
  error: Error | null;              // Error ocurrido
  query: UsersQuery;                // Query params actual
  permissionError: string | null;   // Error de permisos
}
```

**Funciones retornadas:**
```typescript
{
  // Data
  data: PaginatedUsers | null,
  stats: UserStats | null,
  isLoading: boolean,
  error: Error | null,
  query: UsersQuery,
  permissionError: string | null,
  
  // Métodos
  updateQuery(partial: Partial<UsersQuery>): void,
  refresh(): Promise<PaginatedUsers | null>,
  
  // CRUD operations
  createUser(data: CreateUserFormData): Promise<User>,
  updateUser(id: number, data: UpdateUserFormData): Promise<User>,
  deleteUser(id: number): Promise<void>,
  getUserById(id: number): Promise<UserWithRelations>,
  
  // Special operations
  changePassword(id: number, data: ChangePasswordFormData): Promise<void>,
  uploadPicture(id: number, file: File, kind: 'profile' | 'document' | 'evidence'): Promise<PictureUploadResponse>,
  grantAccess(id: number): Promise<GrantAccessResponse>,
  revokeAccess(id: number): Promise<RevokeAccessResponse>,
  verifyEmail(id: number): Promise<VerifyEmailResponse>,
  restoreUser(id: number): Promise<User>,
}
```

**Features:**
- ✅ Carga automática al inicializar
- ✅ Carga de estadísticas (solo si tiene permiso `read-stats`)
- ✅ Refresh automático tras cambios
- ✅ Manejo de errores de permisos
- ✅ Upload de imágenes a Cloudinary

---

## 📘 Types

### Ubicación: `src/types/users.types.ts`

#### User (Base)
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  givenNames: string;
  lastNames: string;
  dpi: string;
  phone: string | null;
  gender: 'M' | 'F' | 'O';
  isActive: boolean;
  accountVerified: boolean;
  canAccessPlatform: boolean;
  createdAt: string;
  updatedAt: string;
  roleId: number;
}
```

#### UserWithRelations
```typescript
interface UserWithRelations extends User {
  role: RoleBasic;
  pictures?: Picture[];
  parentDetails?: ParentDetails;
  teacherDetails?: TeacherDetails;
  createdBy?: { id, givenNames, lastNames };
  modifiedBy?: { id, givenNames, lastNames };
}
```

#### Picture
```typescript
interface Picture {
  id: number;
  userId?: number;
  url: string;
  publicId: string;
  kind: 'profile' | 'document' | 'evidence';
  description: string | null;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  uploadedAt: string;
  studentId?: number | null;
}
```

#### ParentDetails
```typescript
interface ParentDetails {
  id: number;
  userId: number;
  dpiIssuedAt?: string | null;
  email?: string | null;
  workPhone?: string | null;
  occupation?: string | null;
  workplace?: string | null;
  isSponsor: boolean;
  sponsorInfo?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

#### TeacherDetails
```typescript
interface TeacherDetails {
  id: number;
  userId: number;
  hiredDate: string;
  isHomeroomTeacher: boolean;
  academicDegree?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

#### UserStats
```typescript
interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedEmails: number;
  unverifiedEmails: number;
  canAccessPlatform: number;
  cannotAccessPlatform: number;
  usersByRole: Record<string, number>;
}
```

#### UsersQuery
```typescript
interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  canAccessPlatform?: boolean;
  roleId?: number;
  sortBy?: 'givenNames' | 'email' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
```

#### PaginatedUsers
```typescript
interface PaginatedUsers {
  data: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

#### DTOs (Data Transfer Objects)
```typescript
interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  givenNames: string;
  lastNames: string;
  dpi: string;
  phone?: string;
  gender: 'M' | 'F' | 'O';
  roleId: number;
  isActive?: boolean;
  canAccessPlatform?: boolean;
}

interface UpdateUserDto {
  givenNames?: string;
  lastNames?: string;
  phone?: string;
  gender?: 'M' | 'F' | 'O';
  roleId?: number;
  isActive?: boolean;
  canAccessPlatform?: boolean;
}

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UploadPictureDto {
  file: File;
  kind: 'profile' | 'document' | 'evidence';
  description?: string;
  isDefault?: boolean;
}
```

---

## 📋 Schemas (Validación Zod)

### Ubicación: `src/schemas/users.schema.ts`

#### Create User Schema
```typescript
// Validaciones:
- email: string válido (required)
- username: 3-20 chars, letras/números/guiones
- password: 8+ chars, mayúscula, minúscula, número, especial (required)
- confirmPassword: debe coincidir (required)
- givenNames: 2-50 chars (required)
- lastNames: 2-50 chars (required)
- dpi: exactamente 13 dígitos
- phone: 7-14 dígitos (opcional)
- gender: 'M' | 'F' | 'O' (required)
- roleId: número válido (required)
- isActive: boolean (default: true)
- canAccessPlatform: boolean (default: false)
- parentDetails: objeto con detalles de padre (opcional)
- teacherDetails: objeto con detalles de maestro (opcional)
```

#### Update User Schema
```typescript
// Igual al anterior pero todos los campos son opcionales
// No incluye email ni dpi (no se pueden cambiar)
```

#### Change Password Schema
```typescript
- currentPassword: string (required)
- newPassword: 8+ chars, validaciones fuertes (required)
- confirmPassword: debe coincidir (required)
- Validación: nueva != actual
```

#### Upload Picture Schema
```typescript
- file: File ≤ 5MB, JPEG|PNG|GIF|WebP
- kind: 'profile' | 'document' | 'evidence'
- description: string (opcional)
```

---

## 🔌 Service

### Ubicación: `src/services/users.service.ts`

**Métodos principales:**

```typescript
usersService = {
  // Lectura
  getUsers(query: UsersQuery): Promise<PaginatedUsers>,
  getUserById(id: number): Promise<UserWithRelations>,
  getUserByEmail(email: string): Promise<UserWithRelations>,
  getUserByDpi(dpi: string): Promise<UserWithRelations>,
  getUserStats(): Promise<UserStats>,
  
  // Creación y actualización
  createUser(data: CreateUserDto): Promise<User>,
  updateUser(id: number, data: UpdateUserDto): Promise<User>,
  deleteUser(id: number): Promise<void>,
  restoreUser(id: number): Promise<User>,
  
  // Contraseña y acceso
  changePassword(id: number, data: ChangePasswordDto): Promise<void>,
  grantAccess(id: number): Promise<GrantAccessResponse>,
  revokeAccess(id: number): Promise<RevokeAccessResponse>,
  verifyEmail(id: number): Promise<VerifyEmailResponse>,
  
  // Fotos
  uploadPicture(id: number, file: File, kind: string): Promise<PictureUploadResponse>,
  getPictures(id: number): Promise<Picture[]>,
  deletePicture(id: number, pictureId: number): Promise<void>,
}
```

**Endpoints API:**
```
GET    /api/users                      → Listar usuarios paginados
GET    /api/users/stats                → Obtener estadísticas
GET    /api/users/:id                  → Obtener usuario por ID
GET    /api/users/email/:email         → Obtener usuario por email
GET    /api/users/dpi/:dpi             → Obtener usuario por DPI
POST   /api/users                      → Crear usuario
PATCH  /api/users/:id                  → Actualizar usuario
DELETE /api/users/:id                  → Eliminar usuario (soft delete)
PATCH  /api/users/:id/restore          → Restaurar usuario
PATCH  /api/users/:id/change-password  → Cambiar contraseña
PATCH  /api/users/:id/grant-access     → Otorgar acceso
PATCH  /api/users/:id/revoke-access    → Revocar acceso
PATCH  /api/users/:id/verify-email     → Verificar email
POST   /api/users/:id/upload-picture   → Subir foto
```

---

## 🔐 Permisos

### Ubicación: `src/constants/modules-permissions/user/user.permissions.ts`

**Permisos del módulo:**
```typescript
USER_PERMISSIONS = {
  READ: {
    module: 'user',
    action: 'read',
    description: 'Listar todos los usuarios del sistema',
    allowedScopes: ['all'],
  },
  
  READ_ONE: {
    module: 'user',
    action: 'read-one',
    description: 'Ver detalles de un usuario específico',
    allowedScopes: ['all', 'own'],
  },
  
  CREATE: {
    module: 'user',
    action: 'create',
    description: 'Crear nuevos usuarios en el sistema',
    allowedScopes: ['all'],
  },
  
  UPDATE: {
    module: 'user',
    action: 'update',
    description: 'Actualizar información de usuarios',
    allowedScopes: ['all', 'own'],
  },
  
  DELETE: {
    module: 'user',
    action: 'delete',
    description: 'Eliminar usuarios del sistema (soft delete)',
    allowedScopes: ['all'],
  },
  
  CHANGE_PASSWORD: {
    module: 'user',
    action: 'change-password',
    description: 'Cambiar contraseña de usuarios',
    allowedScopes: ['all', 'own'],
  },
  
  GRANT_ACCESS: {
    module: 'user',
    action: 'grant-access',
    description: 'Otorgar acceso a plataforma',
    allowedScopes: ['all'],
  },
  
  REVOKE_ACCESS: {
    module: 'user',
    action: 'revoke-access',
    description: 'Revocar acceso a plataforma',
    allowedScopes: ['all'],
  },
  
  VERIFY_EMAIL: {
    module: 'user',
    action: 'verify-email',
    description: 'Verificar email de usuarios',
    allowedScopes: ['all'],
  },
  
  RESTORE: {
    module: 'user',
    action: 'restore',
    description: 'Restaurar usuarios eliminados',
    allowedScopes: ['all'],
  },
  
  ASSIGN_ROLE: {
    module: 'user',
    action: 'assign-role',
    description: 'Asignar roles a usuarios',
    allowedScopes: ['all'],
  },
  
  READ_STATS: {
    module: 'user',
    action: 'read-stats',
    description: 'Leer estadísticas de usuarios',
    allowedScopes: ['all'],
  },
}
```

---

## 🔄 Flujos de Datos

### 1. Flujo de Listado
```
page.tsx
  ↓ (verifica permisos)
UsersPageContent
  ↓
useUsers() → usersService.getUsers()
  ↓
UserFilters → actualiza query
  ↓
(UserTable | UsersGrid)
  ↓ (usa UserCard en grid)
  ↓
Muestra usuarios
```

### 2. Flujo de Creación
```
UsersPageContent (tab='form', editingUserId=undefined)
  ↓
UserForm (isEditMode=false)
  ↓
Usuario completa formulario + sube foto
  ↓
Validación con schema createUserSchema
  ↓
onSubmit en UsersPageContent
  ↓
useUsers().createUser() → usersService.createUser()
  ↓
uploadPicture() si hay archivo
  ↓
refresh() para actualizar lista
  ↓
Vuelta a tab='list'
```

### 3. Flujo de Edición
```
UserCard/UserTable → click Edit
  ↓
UsersPageContent.handleEdit(user)
  ↓
setEditingUserId(user.id)
  ↓
setActiveTab('form')
  ↓
UserForm (isEditMode=true) con datos precargados
  ↓
Usuario actualiza campos + opcionalmente foto
  ↓
Validación con schema updateUserSchema
  ↓
onSubmit → useUsers().updateUser() → usersService.updateUser()
  ↓
uploadPicture() si hay nuevo archivo
  ↓
refresh()
  ↓
Vuelta a tab='list'
```

### 4. Flujo de Eliminación
```
UserCard/UserTable → click Delete
  ↓
UsersPageContent.handleDeleteUser(user)
  ↓
setSelectedUser(user)
  ↓
setDeleteDialogOpen(true)
  ↓
DeleteUserDialog abierto
  ↓
Usuario confirma
  ↓
UsersPageContent.handleConfirmDelete()
  ↓
useUsers().deleteUser() → usersService.deleteUser()
  ↓
refresh()
  ↓
Cierra diálogo
```

### 5. Flujo de Cambio de Contraseña
```
UserCard/UserTable → click Change Password
  ↓
UsersPageContent.handleChangePassword(user)
  ↓
setSelectedUser(user)
  ↓
setPasswordDialogOpen(true)
  ↓
ChangePasswordDialog abierto
  ↓
Usuario ingresa contraseñas
  ↓
Validación con schema changePasswordSchema
  ↓
onSubmit → useUsers().changePassword()
  ↓
usersService.changePassword()
  ↓
Toast de éxito
  ↓
Cierra diálogo
```

### 6. Flujo de Visualización de Detalles
```
UserCard/UserTable → click View Details
  ↓
UsersPageContent.handleViewDetails(user)
  ↓
setSelectedDetailUser(user)
  ↓
setDetailDialogOpen(true)
  ↓
UserDetailDialog abierto
  ↓
Muestra información completa del usuario
```

---

## 🎨 Características Destacadas

### ✨ UI/UX
- 🎭 Dark mode completo
- 📱 Responsive design
- 🎨 Gradientes y animaciones
- 🔄 Skeleton loaders
- 📊 Indicadores visuales de estado
- 🎯 Transiciones suaves

### 🔒 Seguridad
- ✅ Validación de permisos en página
- ✅ Validación de permisos en componentes
- ✅ Schemas Zod estrictos
- ✅ Passwords hasheados en backend
- ✅ Soft delete (no eliminación real)
- ✅ Auditoría (createdBy/modifiedBy)

### 📈 Performance
- 🚀 Paginación
- 🔍 Filtros optimizados
- 📦 Lazy loading de imágenes
- 💾 Caché en hooks
- 🔄 Refresh selectivo

### 🎯 Funcionalidades
- ✅ CRUD completo
- ✅ Búsqueda en tiempo real
- ✅ Filtros múltiples
- ✅ Ordenamiento
- ✅ Upload de fotos
- ✅ Cambio de contraseña
- ✅ Control de acceso
- ✅ Verificación de email
- ✅ Gestión de roles
- ✅ Detalles específicos por rol (Parent/Teacher)
- ✅ Recuperación de usuarios eliminados
- ✅ Estadísticas en tiempo real

---

## 🔗 Relaciones

```
User 1 ←→ Many Pictures
User 1 ←→ Many ParentStudentLinks
User 1 ←→ 1 Role
User 1 ←→ 0|1 ParentDetails
User 1 ←→ 0|1 TeacherDetails
User Many ←→ 1 User (createdBy/modifiedBy)
```

---

## 🚀 Cómo Extender

### Agregar nuevo campo en User
1. Actualizar `src/types/users.types.ts`
2. Actualizar `src/schemas/users.schema.ts`
3. Actualizar `UserForm.tsx` (si aplica a UI)
4. Actualizar backend schema.prisma

### Agregar nuevo permiso
1. Crear en `src/constants/modules-permissions/user/user.permissions.ts`
2. Actualizar validación en `page.tsx`
3. Usar en componentes con `can.do()`

### Agregar nuevo filtro
1. Actualizar `UsersQuery` en types
2. Actualizar `UserFilters.tsx`
3. Actualizar `usersService.getUsers()` con nuevo parámetro

---

## 📌 Notas Importantes

1. **Soft Delete:** Los usuarios eliminados no se borran, solo se marcan como inactivos. Pueden restaurarse.

2. **Upload de Fotos:** Usa Cloudinary para almacenar imágenes. El archivo se convierte a FormData en el hook.

3. **Detalles Condicionados:** Los detalles (Parent/Teacher) se envían solo si el rol lo requiere, filtrando en `UsersPageContent`.

4. **Validación Doble:** Se valida en frontend (Zod) y backend (prisma + controlador).

5. **Permisos Granulares:** Se pueden especificar scopos ('all' vs 'own') para permitir usuarios editar su propio perfil.

6. **Paginación:** Siempre incluye límite máximo de 100 items por página para performance.

7. **Estadísticas:** Solo se cargan si el usuario tiene permiso `read-stats`.

---

## 📝 Resumen Estructura

```
PÁGINA
  ↓
CONTENEDOR (UsersPageContent)
  ↓ ┌─────────────────────────────────┐
    ├─→ ESTADÍSTICAS (UserStats)
    ├─→ FILTROS (UserFilters)
    ├─→ VISTA (UserTable | UsersGrid)
    │     └─→ TARJETA (UserCard)
    └─→ FORMULARIO (UserForm)
        └─→ DETALLES (ParentDetailsForm | TeacherDetailsForm)
  
  ↓ DIÁLOGOS
    ├─→ DeleteUserDialog
    ├─→ ChangePasswordDialog
    └─→ UserDetailDialog
        └─→ ParentStudentLinksDialog

  ↓ HOOK
    └─→ useUsers()
        └─→ SERVICE
            └─→ usersService
                ├─→ getUsers()
                ├─→ createUser()
                ├─→ updateUser()
                ├─→ deleteUser()
                └─→ changePassword()
                    
  ↓ VALIDACIÓN
    └─→ SCHEMAS (Zod)
        ├─→ createUserSchema
        ├─→ updateUserSchema
        ├─→ changePasswordSchema
        └─→ uploadPictureSchema
```

---

**✅ Exploración completada el 18 de Enero, 2026**
