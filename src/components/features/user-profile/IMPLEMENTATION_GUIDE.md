# Guía de Implementación - User Profile Module

## Resumen

Se ha desarrollado un módulo completo de perfil de usuario que permite a los usuarios autenticados ver y editar su información personal. El módulo incluye formularios validados, servicios API, hooks personalizados y componentes reutilizables.

## Estructura de Archivos Creados

```
src/
├── app/(admin)/
│   └── user-profile/
│       └── page.tsx                          # Página principal
│
├── components/features/user-profile/
│   ├── UserProfileForm.tsx                   # Formulario principal
│   ├── UserProfilePageContent.tsx            # Contenedor con lógica
│   ├── UserProfileCard.tsx                   # Tarjeta de perfil
│   ├── UserNav.tsx                           # Menú de navegación
│   ├── README.md                             # Documentación
│   └── index.ts                              # Exportaciones
│
├── hooks/user-profile/
│   ├── useUserProfile.ts                     # Hook personalizado
│   └── index.ts                              # Exportaciones
│
├── schemas/
│   └── user-profile.schema.ts                # Validación Zod
│
└── services/
    └── user-profile.service.ts               # Servicio API
```

## Componentes Principales

### 1. UserProfileForm ✅
**Propósito**: Formulario interactivo para editar información personal

**Características:**
- Validación en tiempo real con Zod
- Campos editables: nombres, apellidos, email, teléfono, fecha nacimiento, género
- Campos de solo lectura: username, DPI, fechas de creación/actualización
- Botones Guardar/Descartar con estado inteligente
- Notificaciones de éxito/error
- Diseño responsive y modo oscuro soportado

**Campos:**
```typescript
{
  givenNames: string        // Nombres (1-100 caracteres)
  lastNames: string         // Apellidos (1-100 caracteres)
  email: string             // Email válido único
  phone: string             // Teléfono (máx 20 caracteres)
  birthDate: string         // Fecha ISO
  gender: string            // Género (máx 20 caracteres)
}
```

### 2. UserProfilePageContent ✅
**Propósito**: Contenedor que gestiona el ciclo de vida del perfil

**Responsabilidades:**
- Cargar perfil inicial desde API
- Manejar estados de carga/error
- Integrar formulario con servicio
- Actualizar estado local tras cambios
- Mostrar skeletons mientras carga

### 3. UserProfileCard ✅
**Propósito**: Tarjeta visual compacta del perfil

**Uso:**
```tsx
<UserProfileCard 
  profile={profile}
  onEditClick={() => router.push('/user-profile')}
/>
```

**Características:**
- Imagen de perfil con avatar fallback
- Información principal (nombre, email, teléfono, DPI)
- Gradiente decorativo
- Botón de acción
- Responsive

### 4. UserNav ✅
**Propósito**: Menú de navegación en la barra superior

**Características:**
- Avatar del usuario con iniciales
- Dropdown menu con opciones
- Integración con logout
- Enlaces a perfil, configuración, documentos
- Estado de carga

**Uso en layout:**
```tsx
<header>
  {/* ... otros elementos ... */}
  <UserNav />
</header>
```

## Servicios y Hooks

### userProfileService ✅
```typescript
// Obtener perfil
const profile = await userProfileService.getProfile();

// Actualizar perfil
const updated = await userProfileService.updateProfile(updateData);
```

### useUserProfile Hook ✅
```typescript
const { 
  profile,      // UserProfile | null
  isLoading,    // boolean
  isUpdating,   // boolean
  error,        // string | null
  refetch,      // () => Promise<void>
  updateProfile // (data) => Promise<void>
} = useUserProfile();
```

## Validación con Zod

Las validaciones se aplican automáticamente en los formularios:

```typescript
- givenNames: 1-100 caracteres, requerido si se edita
- lastNames: 1-100 caracteres, requerido si se edita
- email: Email válido, único en el sistema
- phone: Máximo 20 caracteres
- birthDate: Fecha ISO válida
- gender: Máximo 20 caracteres
```

## API Endpoints Utilizados

### GET /api/user-profile
Obtiene el perfil del usuario autenticado.

**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "givenNames": "John",
  "lastNames": "Doe",
  "phone": "+1234567890",
  "dpi": "1234567890",
  "birthDate": "1990-05-15T00:00:00Z",
  "gender": "M",
  "pictures": [
    {
      "id": 1,
      "url": "https://...",
      "kind": "profile_picture"
    }
  ],
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### PATCH /api/user-profile
Actualiza el perfil del usuario autenticado.

**Request Body:**
```json
{
  "givenNames": "Jonathan",
  "lastNames": "Doe",
  "email": "jonathan@example.com",
  "phone": "+1234567890",
  "birthDate": "1990-05-15",
  "gender": "M"
}
```

**Response:** Perfil actualizado (mismo formato que GET)

## Cómo Usar

### Opción 1: Página Completa
```tsx
import { UserProfilePageContent } from '@/components/features/user-profile';

export default function UserProfilePage() {
  return (
    <ProtectedPage module="user-profile" action="read">
      <main className="p-6">
        <UserProfilePageContent />
      </main>
    </ProtectedPage>
  );
}
```

### Opción 2: Con Hook Personalizado
```tsx
'use client';
import { useUserProfile } from '@/hooks/user-profile';
import { UserProfileForm } from '@/components/features/user-profile';

export default function MyComponent() {
  const { profile, isLoading, updateProfile } = useUserProfile();
  
  if (isLoading) return <div>Cargando...</div>;
  if (!profile) return <div>No encontrado</div>;
  
  return (
    <UserProfileForm
      profile={profile}
      onSubmit={updateProfile}
    />
  );
}
```

### Opción 3: En Layout con Navegación
```tsx
import { UserNav } from '@/components/features/user-profile';

export default function Header() {
  return (
    <header className="flex justify-between items-center">
      <h1>Mi Aplicación</h1>
      <UserNav />
    </header>
  );
}
```

## Manejo de Errores

El módulo maneja automáticamente:
- Errores de red
- Errores de validación
- Conflictos (email duplicado)
- Tokens expirados
- Datos incompletos

Los errores se muestran mediante:
- Notificaciones Toast
- Alertas en el componente
- Logs en consola (desarrollo)

## Características

✅ Edición completa de perfil  
✅ Validación con Zod  
✅ Estados de carga/error  
✅ Notificaciones Toast  
✅ Diseño responsive  
✅ Modo oscuro  
✅ Protección de rutas  
✅ Hook personalizado reutilizable  
✅ Servicio API centralizado  
✅ Componentes modulares  
✅ Integración con ProtectedPage  

## Próximos Pasos

Para completar la implementación:

1. **Integrar UserNav en el Header:**
   ```tsx
   // En tu componente de header
   import { UserNav } from '@/components/features/user-profile';
   
   <header>
     {/* ... otros elementos ... */}
     <UserNav />
   </header>
   ```

2. **Asegurar que los endpoints del backend están activos**

3. **Probar la integración completa:**
   - Cargar perfil
   - Editar información
   - Guardar cambios
   - Ver notificaciones

4. **Configurar permisos en ProtectedPage** si es necesario

5. **Personalizar estilos** según tu tema de aplicación

## Documentación Adicional

- Backend API: `/api/user-profile` endpoints
- Validación: `src/schemas/user-profile.schema.ts`
- Servicio: `src/services/user-profile.service.ts`
- Hook: `src/hooks/user-profile/useUserProfile.ts`
- Componentes: `src/components/features/user-profile/`
