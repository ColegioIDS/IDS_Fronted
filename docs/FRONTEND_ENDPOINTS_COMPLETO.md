# 🎯 ENDPOINTS COMPLETOS - USUARIOS & FOTOS

## 📌 INDICE
1. [Tipos TypeScript](#tipos-typescript)
2. [Esquemas de Validación](#esquemas-de-validación)
3. [Endpoints GET](#endpoints-get)
4. [Endpoints POST](#endpoints-post)
5. [Endpoints PATCH](#endpoints-patch)
6. [Endpoints DELETE](#endpoints-delete)
7. [Enums y Constantes](#enums-y-constantes)

---

## 🔷 TIPOS TYPESCRIPT

### User Type
```typescript
export interface User {
  id: number;
  email: string;
  username: string;
  givenNames: string;
  lastNames: string;
  dpi: string;
  phone?: string | null;
  gender?: 'M' | 'F' | null;
  profilePhotoUrl?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  canAccessPlatform: boolean;
  failedLoginAttempts: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastLogin?: string | null; // ISO 8601
  roleId: number;
  role?: Role;
}
```

### Role Type
```typescript
export interface Role {
  id: number;
  name: string; // "Administrador" | "Docente" | "Coordinador" | "Padre" | "Estudiante"
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: Permission[];
}
```

### Permission Type
```typescript
export interface Permission {
  id: number;
  module: string; // "user" | "role" | etc
  action: string; // "create" | "read" | "update" | "delete" | etc
  description: string;
  scopes?: string[];
}
```

### Picture Type
```typescript
export interface Picture {
  id: number;
  publicId: string; // ID de Cloudinary para eliminar
  url: string; // URL pública de Cloudinary
  kind: 'profile' | 'document' | 'evidence';
  description?: string | null;
  uploadedAt: string; // ISO 8601
  userId?: number | null;
  studentId?: number | null;
}
```

### Pagination Metadata
```typescript
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
```

### Stats Type
```typescript
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersWithPlatformAccess: number;
  usersWithoutPlatformAccess: number;
  usersByRole: {
    [roleName: string]: number;
  };
  usersWithProfilePhoto: number;
  usersWithoutProfilePhoto: number;
  verifiedEmails: number;
  unverifiedEmails: number;
}
```

---

## 📝 ESQUEMAS DE VALIDACIÓN

### Create User DTO
```typescript
export interface CreateUserDto {
  email: string; // RFC 5322, único
  password: string; // 8+ chars, mayús, minús, número, especial
  username: string; // 3-50 chars, único
  givenNames: string; // 1-100 chars
  lastNames?: string; // 1-100 chars (opcional)
  dpi: string; // 13 dígitos, único
  phone?: string; // Formato: +502XXXXXXXX
  gender?: 'M' | 'F';
  roleId: number; // ID del rol a asignar
}

// Validación Zod:
export const createUserSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .refine(
      async (email) => {
        // Verifica que sea único
        const existing = await prisma.user.findUnique({ where: { email } });
        return !existing;
      },
      'Email ya existe'
    ),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener mayúscula')
    .regex(/[a-z]/, 'Debe contener minúscula')
    .regex(/[0-9]/, 'Debe contener número')
    .regex(/[!@#$%^&*]/, 'Debe contener carácter especial'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, _ y -'),
  givenNames: z.string().min(1).max(100),
  lastNames: z.string().min(1).max(100).optional(),
  dpi: z
    .string()
    .length(13, 'DPI debe tener 13 dígitos')
    .regex(/^\d+$/, 'DPI solo números'),
  phone: z
    .string()
    .regex(/^\+502\d{8}$/, 'Formato: +502XXXXXXXX')
    .optional(),
  gender: z.enum(['M', 'F']).optional(),
  roleId: z.number().int().positive('Role ID inválido'),
});
```

### Update User DTO
```typescript
export interface UpdateUserDto {
  phone?: string;
  gender?: 'M' | 'F';
  canAccessPlatform?: boolean;
}

// Validación Zod:
export const updateUserSchema = z.object({
  phone: z
    .string()
    .regex(/^\+502\d{8}$/, 'Formato: +502XXXXXXXX')
    .optional(),
  gender: z.enum(['M', 'F']).optional(),
  canAccessPlatform: z.boolean().optional(),
});
```

### Change Password DTO
```typescript
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Validación Zod:
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener mayúscula')
      .regex(/[a-z]/, 'Debe contener minúscula')
      .regex(/[0-9]/, 'Debe contener número')
      .regex(/[!@#$%^&*]/, 'Debe contener carácter especial'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });
```

### Query Users DTO
```typescript
export interface QueryUsersDto {
  page?: number; // default: 1
  limit?: number; // default: 10, max: 100
  search?: string; // búsqueda en nombre, email, DPI
  isActive?: boolean;
  canAccessPlatform?: boolean;
  roleId?: number;
  sortBy?: 'name' | 'email' | 'dpi' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

// Validación Zod:
export const queryUsersSchema = z.object({
  page: z.number().int().positive().default(1).catch(1),
  limit: z.number().int().min(1).max(100).default(10).catch(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  canAccessPlatform: z.boolean().optional(),
  roleId: z.number().int().positive().optional(),
  sortBy: z
    .enum(['name', 'email', 'dpi', 'createdAt', 'lastLogin'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
```

---

## 🔽 ENDPOINTS GET

### GET 1: Listar Usuarios (Paginado)
```
GET /api/users?page=1&limit=10&search=juan&isActive=true&roleId=2

Permission: user:read
Method: GET
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### Query Parameters
| Param | Type | Default | Descripción |
|-------|------|---------|-------------|
| page | number | 1 | Página actual |
| limit | number | 10 | Registros por página (max 100) |
| search | string | - | Busca en nombres, email, DPI |
| isActive | boolean | - | Filtrar activos/inactivos |
| canAccessPlatform | boolean | - | Filtrar acceso plataforma |
| roleId | number | - | Filtrar por rol |
| sortBy | string | createdAt | Campo para ordenar |
| sortOrder | string | desc | Orden (asc/desc) |

#### Response 200 OK
```json
{
  "data": [
    {
      "id": 1,
      "email": "admin@colegioids.com",
      "username": "admin",
      "givenNames": "Administrador",
      "lastNames": "Sistema",
      "dpi": "1234567890123",
      "phone": "+50212345678",
      "gender": "M",
      "profilePhotoUrl": null,
      "isActive": true,
      "isEmailVerified": true,
      "canAccessPlatform": true,
      "failedLoginAttempts": 0,
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T14:22:00Z",
      "lastLogin": "2025-01-15T10:30:00Z",
      "roleId": 1,
      "role": {
        "id": 1,
        "name": "Administrador",
        "description": "Full system access with all permissions",
        "isActive": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 450,
    "totalPages": 45
  }
}
```

#### Response 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Invalid token"
}
```

---

### GET 2: Obtener Usuario por ID
```
GET /api/users/:id

Permission: user:read
Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "username": "admin",
  "givenNames": "Administrador",
  "lastNames": "Sistema",
  "dpi": "1234567890123",
  "phone": "+50212345678",
  "gender": "M",
  "profilePhotoUrl": null,
  "isActive": true,
  "isEmailVerified": true,
  "canAccessPlatform": true,
  "failedLoginAttempts": 0,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T14:22:00Z",
  "lastLogin": "2025-01-15T10:30:00Z",
  "roleId": 1,
  "role": {
    "id": 1,
    "name": "Administrador",
    "description": "Full system access",
    "isActive": true,
    "permissions": [
      {
        "id": 1,
        "module": "user",
        "action": "create",
        "description": "Crear nuevos usuarios"
      }
    ]
  }
}
```

#### Response 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Usuario con ID 999 no encontrado"
}
```

---

### GET 3: Obtener Usuario por Email
```
GET /api/users/email/:email

Permission: user:read
Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| email | string | Email del usuario |

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "username": "admin",
  "givenNames": "Administrador",
  "lastNames": "Sistema",
  "dpi": "1234567890123",
  "phone": "+50212345678",
  "gender": "M",
  "profilePhotoUrl": null,
  "isActive": true,
  "isEmailVerified": true,
  "canAccessPlatform": true,
  "failedLoginAttempts": 0,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T14:22:00Z",
  "lastLogin": "2025-01-15T10:30:00Z",
  "roleId": 1,
  "role": { ... }
}
```

#### Response 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Usuario con email 'notfound@colegioids.com' no encontrado"
}
```

---

### GET 4: Obtener Usuario por DPI
```
GET /api/users/dpi/:dpi

Permission: user:read
Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| dpi | string | DPI del usuario (13 dígitos) |

#### Response 200 OK
```json
{
  "id": 2,
  "email": "docente@colegioids.com",
  "username": "docente_prueba",
  "givenNames": "Juan",
  "lastNames": "Pérez García",
  "dpi": "9876543210987",
  "phone": "+50287654321",
  "gender": "M",
  "profilePhotoUrl": null,
  "isActive": true,
  "isEmailVerified": true,
  "canAccessPlatform": true,
  "failedLoginAttempts": 0,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T14:22:00Z",
  "lastLogin": "2025-01-15T09:15:00Z",
  "roleId": 2,
  "role": {
    "id": 2,
    "name": "Docente",
    "description": "Teacher role with limited permissions"
  }
}
```

---

### GET 5: Estadísticas de Usuarios
```
GET /api/users/stats

Permission: user:read-stats
Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Response 200 OK
```json
{
  "totalUsers": 450,
  "activeUsers": 420,
  "inactiveUsers": 30,
  "usersWithPlatformAccess": 420,
  "usersWithoutPlatformAccess": 30,
  "usersByRole": {
    "Administrador": 2,
    "Docente": 25,
    "Coordinador": 5,
    "Padre": 180,
    "Estudiante": 238
  },
  "usersWithProfilePhoto": 320,
  "usersWithoutProfilePhoto": 130,
  "verifiedEmails": 380,
  "unverifiedEmails": 70
}
```

---

### GET 6: Obtener Todos los Roles
```
GET /api/users/roles/all?isActive=true

Permission: user:read
Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Query Parameters
| Param | Type | Default | Descripción |
|-------|------|---------|-------------|
| isActive | boolean | - | Filtrar roles activos (opcional) |

#### Response 200 OK
```json
[
  {
    "id": 1,
    "name": "Administrador",
    "description": "Full system access with all permissions",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "permissions": [
      {
        "id": 1,
        "module": "user",
        "action": "create",
        "description": "Crear nuevos usuarios"
      },
      {
        "id": 2,
        "module": "user",
        "action": "read",
        "description": "Listar usuarios + ver roles"
      }
    ]
  },
  {
    "id": 2,
    "name": "Docente",
    "description": "Teacher role with limited permissions",
    "isActive": true,
    "permissions": [...]
  }
]
```

---

### GET 7: Obtener Detalles de un Rol
```
GET /api/users/roles/:roleId

Permission: user:read
Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| roleId | number | ID del rol |

#### Response 200 OK
```json
{
  "id": 1,
  "name": "Administrador",
  "description": "Full system access with all permissions",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "permissions": [
    {
      "id": 1,
      "module": "user",
      "action": "create",
      "description": "Crear nuevos usuarios",
      "scopes": ["ALL"]
    },
    {
      "id": 2,
      "module": "user",
      "action": "read",
      "description": "Listar usuarios + ver roles",
      "scopes": ["ALL"]
    },
    {
      "id": 3,
      "module": "user",
      "action": "read-one",
      "description": "Ver detalles de usuario",
      "scopes": ["ALL"]
    },
    {
      "id": 4,
      "module": "user",
      "action": "update",
      "description": "Actualizar información",
      "scopes": ["ALL"]
    },
    {
      "id": 5,
      "module": "user",
      "action": "delete",
      "description": "Eliminar usuario",
      "scopes": ["ALL"]
    },
    {
      "id": 6,
      "module": "user",
      "action": "change-password",
      "description": "Cambiar contraseña",
      "scopes": ["ALL"]
    },
    {
      "id": 7,
      "module": "user",
      "action": "grant-access",
      "description": "Otorgar acceso a plataforma",
      "scopes": ["ALL"]
    },
    {
      "id": 8,
      "module": "user",
      "action": "revoke-access",
      "description": "Revocar acceso a plataforma",
      "scopes": ["ALL"]
    },
    {
      "id": 9,
      "module": "user",
      "action": "verify-email",
      "description": "Verificar email",
      "scopes": ["ALL"]
    },
    {
      "id": 10,
      "module": "user",
      "action": "restore",
      "description": "Restaurar usuario",
      "scopes": ["ALL"]
    },
    {
      "id": 11,
      "module": "user",
      "action": "assign-role",
      "description": "Asignar rol a usuario",
      "scopes": ["ALL"]
    },
    {
      "id": 12,
      "module": "user",
      "action": "read-stats",
      "description": "Ver estadísticas",
      "scopes": ["ALL"]
    }
  ]
}
```

---

### GET 8: Obtener Fotos del Usuario
```
GET /api/users/:id/pictures

Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Response 200 OK
```json
[
  {
    "id": 1,
    "publicId": "ids_usuarios/abc123def456",
    "url": "https://res.cloudinary.com/dnxxxxxxxxxx/image/upload/v1705329600/ids_usuarios/abc123def456.jpg",
    "kind": "profile",
    "description": "Foto de perfil",
    "uploadedAt": "2025-01-15T14:35:00Z",
    "userId": 1,
    "studentId": null
  },
  {
    "id": 2,
    "publicId": "ids_usuarios/xyz789abc123",
    "url": "https://res.cloudinary.com/dnxxxxxxxxxx/image/upload/v1705415700/ids_usuarios/xyz789abc123.jpg",
    "kind": "document",
    "description": "Cédula de identidad",
    "uploadedAt": "2025-01-16T09:20:00Z",
    "userId": 1,
    "studentId": null
  }
]
```

#### Response 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Usuario con ID 999 no encontrado"
}
```

---

### GET 9: Obtener Foto de Perfil
```
GET /api/users/:id/pictures/profile

Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Response 200 OK
```json
{
  "id": 1,
  "publicId": "ids_usuarios/abc123def456",
  "url": "https://res.cloudinary.com/dnxxxxxxxxxx/image/upload/v1705329600/ids_usuarios/abc123def456.jpg",
  "kind": "profile",
  "description": "Foto de perfil",
  "uploadedAt": "2025-01-15T14:35:00Z",
  "userId": 1
}
```

#### Response 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Foto de perfil no encontrada para el usuario 1"
}
```

---

### GET 10: Obtener Foto Específica
```
GET /api/users/:id/pictures/:picId

Method: GET
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |
| picId | number | ID de la foto |

#### Response 200 OK
```json
{
  "id": 1,
  "publicId": "ids_usuarios/abc123def456",
  "url": "https://res.cloudinary.com/dnxxxxxxxxxx/image/upload/v1705329600/ids_usuarios/abc123def456.jpg",
  "kind": "profile",
  "description": "Foto de perfil",
  "uploadedAt": "2025-01-15T14:35:00Z",
  "userId": 1,
  "studentId": null
}
```

---

## ⬆️ ENDPOINTS POST

### POST 1: Crear Usuario
```
POST /api/users

Permission: user:create
Method: POST
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### Request Body
```json
{
  "email": "nuevo@colegioids.com",
  "password": "SecurePass123!",
  "username": "nuevouser",
  "givenNames": "Juan",
  "lastNames": "Pérez García",
  "dpi": "9876543210987",
  "phone": "+50287654321",
  "gender": "M",
  "roleId": 2
}
```

#### Response 201 Created
```json
{
  "id": 451,
  "email": "nuevo@colegioids.com",
  "username": "nuevouser",
  "givenNames": "Juan",
  "lastNames": "Pérez García",
  "dpi": "9876543210987",
  "phone": "+50287654321",
  "gender": "M",
  "profilePhotoUrl": null,
  "isActive": true,
  "isEmailVerified": false,
  "canAccessPlatform": true,
  "failedLoginAttempts": 0,
  "createdAt": "2025-01-15T14:22:00Z",
  "updatedAt": "2025-01-15T14:22:00Z",
  "lastLogin": null,
  "roleId": 2,
  "role": {
    "id": 2,
    "name": "Docente",
    "description": "Teacher role"
  }
}
```

#### Response 400 Bad Request (Email duplicado)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "email": ["Email ya existe"]
  }
}
```

#### Response 400 Bad Request (DPI duplicado)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "dpi": ["DPI ya existe"]
  }
}
```

#### Response 400 Bad Request (Password débil)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "password": [
      "Debe contener mayúscula",
      "Debe contener número",
      "Debe contener carácter especial"
    ]
  }
}
```

#### Response 409 Conflict (Username duplicado)
```json
{
  "statusCode": 409,
  "message": "Username ya existe",
  "error": "Conflict"
}
```

---

### POST 2: Subir Foto de Usuario
```
POST /api/users/:id/pictures

Method: POST
Content-Type: multipart/form-data
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Form Data
| Field | Type | Required | Descripción |
|-------|------|----------|-------------|
| file | File | ✅ | Archivo de imagen (JPG, PNG, GIF, WebP) |
| kind | string | ✅ | Tipo: "profile" \| "document" \| "evidence" |
| description | string | ❌ | Descripción opcional |

#### Response 201 Created
```json
{
  "id": 3,
  "publicId": "ids_usuarios/mnopqrst",
  "url": "https://res.cloudinary.com/dnxxxxxxxxxx/image/upload/v1705586400/ids_usuarios/mnopqrst.jpg",
  "kind": "profile",
  "description": null,
  "uploadedAt": "2025-01-18T10:00:00Z",
  "userId": 1,
  "studentId": null
}
```

#### Response 400 Bad Request (Tipo inválido)
```json
{
  "statusCode": 400,
  "message": "Kind debe ser: profile | document | evidence",
  "error": "Bad Request"
}
```

#### Response 413 Payload Too Large
```json
{
  "statusCode": 413,
  "message": "El archivo es demasiado grande (máximo 5MB)",
  "error": "Payload Too Large"
}
```

#### Response 415 Unsupported Media Type
```json
{
  "statusCode": 415,
  "message": "Tipo de archivo no permitido. Use: JPG, PNG, GIF, WebP",
  "error": "Unsupported Media Type"
}
```

---

## ✏️ ENDPOINTS PATCH

### PATCH 1: Actualizar Usuario
```
PATCH /api/users/:id

Permission: user:update
Method: PATCH
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Request Body
```json
{
  "phone": "+50299999999",
  "gender": "M",
  "canAccessPlatform": false
}
```

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "username": "admin",
  "givenNames": "Administrador",
  "lastNames": "Sistema",
  "dpi": "1234567890123",
  "phone": "+50299999999",
  "gender": "M",
  "profilePhotoUrl": null,
  "isActive": true,
  "isEmailVerified": true,
  "canAccessPlatform": false,
  "failedLoginAttempts": 0,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-15T15:45:00Z",
  "lastLogin": "2025-01-15T10:30:00Z",
  "roleId": 1,
  "role": { ... }
}
```

---

### PATCH 2: Cambiar Contraseña
```
PATCH /api/users/:id/change-password

Permission: user:change-password
Method: PATCH
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Request Body
```json
{
  "currentPassword": "Admin123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

#### Response 200 OK
```json
{
  "message": "Contraseña actualizada exitosamente",
  "user": {
    "id": 1,
    "email": "admin@colegioids.com",
    "updatedAt": "2025-01-15T15:50:00Z"
  }
}
```

#### Response 400 Bad Request (Contraseña actual incorrecta)
```json
{
  "statusCode": 400,
  "message": "Contraseña actual es incorrecta",
  "error": "Bad Request"
}
```

#### Response 400 Bad Request (Contraseñas no coinciden)
```json
{
  "statusCode": 400,
  "message": "Las contraseñas no coinciden",
  "error": "Bad Request",
  "details": {
    "confirmPassword": ["Las contraseñas no coinciden"]
  }
}
```

---

### PATCH 3: Otorgar Acceso a Plataforma
```
PATCH /api/users/:id/grant-access

Permission: user:grant-access
Method: PATCH
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Request Body
```json
{}
```

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "canAccessPlatform": true,
  "updatedAt": "2025-01-15T15:55:00Z"
}
```

#### Response 400 Bad Request (Ya tiene acceso)
```json
{
  "statusCode": 400,
  "message": "El usuario ya tiene acceso a la plataforma",
  "error": "Bad Request"
}
```

---

### PATCH 4: Revocar Acceso a Plataforma
```
PATCH /api/users/:id/revoke-access

Permission: user:revoke-access
Method: PATCH
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Request Body
```json
{}
```

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "canAccessPlatform": false,
  "updatedAt": "2025-01-15T16:00:00Z"
}
```

#### Response 400 Bad Request (Ya no tiene acceso)
```json
{
  "statusCode": 400,
  "message": "El usuario ya no tiene acceso a la plataforma",
  "error": "Bad Request"
}
```

---

### PATCH 5: Verificar Email
```
PATCH /api/users/:id/verify-email

Permission: user:verify-email
Method: PATCH
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Request Body
```json
{}
```

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "isEmailVerified": true,
  "updatedAt": "2025-01-15T16:05:00Z"
}
```

#### Response 400 Bad Request (Email ya verificado)
```json
{
  "statusCode": 400,
  "message": "El email ya está verificado",
  "error": "Bad Request"
}
```

---

### PATCH 6: Restaurar Usuario
```
PATCH /api/users/:id/restore

Permission: user:restore
Method: PATCH
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Request Body
```json
{}
```

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "isActive": true,
  "updatedAt": "2025-01-15T16:10:00Z"
}
```

#### Response 400 Bad Request (Ya está activo)
```json
{
  "statusCode": 400,
  "message": "El usuario ya está activo",
  "error": "Bad Request"
}
```

---

### PATCH 7: Asignar Rol
```
PATCH /api/users/:id/assign-role/:roleId

Permission: user:assign-role
Method: PATCH
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |
| roleId | number | ID del rol a asignar |

#### Request Body
```json
{}
```

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "roleId": 3,
  "role": {
    "id": 3,
    "name": "Coordinador",
    "description": "Coordinator role"
  },
  "updatedAt": "2025-01-15T16:15:00Z"
}
```

#### Response 404 Not Found (Rol no existe)
```json
{
  "statusCode": 404,
  "message": "Rol con ID 999 no encontrado",
  "error": "Not Found"
}
```

---

### PATCH 8: Actualizar Foto
```
PATCH /api/users/:id/pictures/:picId

Method: PATCH
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |
| picId | number | ID de la foto |

#### Request Body
```json
{
  "description": "Nueva descripción de la foto",
  "kind": "document"
}
```

#### Response 200 OK
```json
{
  "id": 1,
  "publicId": "ids_usuarios/abc123def456",
  "url": "https://res.cloudinary.com/dnxxxxxxxxxx/image/upload/v1705329600/ids_usuarios/abc123def456.jpg",
  "kind": "document",
  "description": "Nueva descripción de la foto",
  "uploadedAt": "2025-01-15T14:35:00Z",
  "userId": 1,
  "updatedAt": "2025-01-15T16:20:00Z"
}
```

---

## 🗑️ ENDPOINTS DELETE

### DELETE 1: Eliminar Usuario (Soft Delete)
```
DELETE /api/users/:id

Permission: user:delete
Method: DELETE
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |

#### Request Body
```json
{}
```

#### Response 200 OK
```json
{
  "id": 1,
  "email": "admin@colegioids.com",
  "isActive": false,
  "deletedAt": "2025-01-15T16:25:00Z"
}
```

#### Response 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Usuario con ID 999 no encontrado"
}
```

#### Response 400 Bad Request (Ya eliminado)
```json
{
  "statusCode": 400,
  "message": "El usuario ya está marcado como inactivo",
  "error": "Bad Request"
}
```

---

### DELETE 2: Eliminar Foto
```
DELETE /api/users/:id/pictures/:picId

Method: DELETE
Authorization: Bearer <JWT_TOKEN>
```

#### Path Parameters
| Param | Type | Descripción |
|-------|------|-------------|
| id | number | ID del usuario |
| picId | number | ID de la foto |

#### Request Body
```json
{}
```

#### Response 200 OK
```json
{
  "message": "Imagen eliminada exitosamente",
  "picture": {
    "id": 1,
    "publicId": "ids_usuarios/abc123def456",
    "url": "https://res.cloudinary.com/dnxxxxxxxxxx/image/upload/v1705329600/ids_usuarios/abc123def456.jpg"
  }
}
```

#### Response 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Foto con ID 1 no encontrada"
}
```

---

## 📋 ENUMS Y CONSTANTES

### Roles
```typescript
export const ROLES = {
  ADMINISTRADOR: 1,
  DOCENTE: 2,
  COORDINADOR: 3,
  PADRE: 4,
  ESTUDIANTE: 5,
} as const;

export const ROLE_NAMES = {
  1: 'Administrador',
  2: 'Docente',
  3: 'Coordinador',
  4: 'Padre',
  5: 'Estudiante',
} as const;
```

### Picture Types
```typescript
export const PICTURE_KINDS = {
  PROFILE: 'profile',
  DOCUMENT: 'document',
  EVIDENCE: 'evidence',
} as const;

export type PictureKind = typeof PICTURE_KINDS[keyof typeof PICTURE_KINDS];
```

### Gender
```typescript
export const GENDER = {
  MALE: 'M',
  FEMALE: 'F',
} as const;

export type Gender = typeof GENDER[keyof typeof GENDER];
```

### Permissions
```typescript
export const USER_PERMISSIONS = {
  CREATE: 'user:create',
  READ: 'user:read',
  READ_ONE: 'user:read-one',
  UPDATE: 'user:update',
  DELETE: 'user:delete',
  CHANGE_PASSWORD: 'user:change-password',
  GRANT_ACCESS: 'user:grant-access',
  REVOKE_ACCESS: 'user:revoke-access',
  VERIFY_EMAIL: 'user:verify-email',
  RESTORE: 'user:restore',
  ASSIGN_ROLE: 'user:assign-role',
  READ_STATS: 'user:read-stats',
} as const;
```

### HTTP Status Codes
```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

### File Constraints
```typescript
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;
```

### Validation Rules
```typescript
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_PATTERN: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  DPI_LENGTH: 13,
  DPI_PATTERN: /^\d{13}$/,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  PHONE_PATTERN: /^\+502\d{8}$/,
  NAMES_MIN_LENGTH: 1,
  NAMES_MAX_LENGTH: 100,
} as const;
```

---

## 📊 RESUMEN DE ENDPOINTS

| # | Método | Ruta | Permission | Descripción |
|---|--------|------|-----------|-------------|
| 1 | GET | /api/users | user:read | Listar usuarios (paginado) |
| 2 | GET | /api/users/:id | user:read | Obtener usuario por ID |
| 3 | GET | /api/users/email/:email | user:read | Obtener usuario por email |
| 4 | GET | /api/users/dpi/:dpi | user:read | Obtener usuario por DPI |
| 5 | GET | /api/users/stats | user:read-stats | Estadísticas de usuarios |
| 6 | GET | /api/users/roles/all | user:read | Obtener todos los roles |
| 7 | GET | /api/users/roles/:roleId | user:read | Obtener detalles de rol |
| 8 | GET | /api/users/:id/pictures | - | Listar fotos del usuario |
| 9 | GET | /api/users/:id/pictures/profile | - | Obtener foto de perfil |
| 10 | GET | /api/users/:id/pictures/:picId | - | Obtener foto específica |
| 11 | POST | /api/users | user:create | Crear usuario |
| 12 | POST | /api/users/:id/pictures | - | Subir foto |
| 13 | PATCH | /api/users/:id | user:update | Actualizar usuario |
| 14 | PATCH | /api/users/:id/change-password | user:change-password | Cambiar contraseña |
| 15 | PATCH | /api/users/:id/grant-access | user:grant-access | Otorgar acceso |
| 16 | PATCH | /api/users/:id/revoke-access | user:revoke-access | Revocar acceso |
| 17 | PATCH | /api/users/:id/verify-email | user:verify-email | Verificar email |
| 18 | PATCH | /api/users/:id/restore | user:restore | Restaurar usuario |
| 19 | PATCH | /api/users/:id/assign-role/:roleId | user:assign-role | Asignar rol |
| 20 | PATCH | /api/users/:id/pictures/:picId | - | Actualizar foto |
| 21 | DELETE | /api/users/:id | user:delete | Eliminar usuario |
| 22 | DELETE | /api/users/:id/pictures/:picId | - | Eliminar foto |

---

## 🎯 EJEMPLO DE USO COMPLETO

### 1. Login (En tu auth module)
```typescript
const loginResponse = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@colegioids.com',
    password: 'Admin123!'
  })
});

const { accessToken, user } = await loginResponse.json();
localStorage.setItem('jwt_token', accessToken);
```

### 2. Listar Usuarios
```typescript
const response = await fetch(
  `${API_URL}/users?page=1&limit=10&search=juan`,
  {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    }
  }
);

const { data, pagination } = await response.json();
console.log(data); // Array de usuarios
console.log(pagination); // { page, limit, total, totalPages }
```

### 3. Crear Usuario
```typescript
const response = await fetch(`${API_URL}/users`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  },
  body: JSON.stringify({
    email: 'nuevo@colegioids.com',
    password: 'SecurePass123!',
    username: 'nuevo',
    givenNames: 'Juan',
    lastNames: 'Pérez',
    dpi: '9876543210987',
    roleId: 2
  })
});

const newUser = await response.json();
```

### 4. Subir Foto
```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('kind', 'profile');
formData.append('description', 'Mi foto de perfil');

const response = await fetch(`${API_URL}/users/1/pictures`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  },
  body: formData
});

const picture = await response.json();
console.log(picture.url); // URL de la foto en Cloudinary
```

### 5. Cambiar Contraseña
```typescript
const response = await fetch(`${API_URL}/users/1/change-password`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
  },
  body: JSON.stringify({
    currentPassword: 'Admin123!',
    newPassword: 'NewPassword456!',
    confirmPassword: 'NewPassword456!'
  })
});

const result = await response.json();
console.log(result.message); // "Contraseña actualizada exitosamente"
```

---

**¡Todo lo que necesitas para integrar el frontend! 🚀**
