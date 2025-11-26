# User Profile Module

Módulo para la gestión del perfil personal del usuario autenticado.

## Estructura

```
src/
├── app/(admin)/user-profile/
│   └── page.tsx                    # Página principal del perfil
├── components/features/user-profile/
│   ├── UserProfileForm.tsx         # Formulario de edición del perfil
│   ├── UserProfilePageContent.tsx  # Componente contenedor con lógica
│   └── index.ts                    # Exportaciones
├── hooks/user-profile/
│   ├── useUserProfile.ts           # Hook personalizado
│   └── index.ts                    # Exportaciones
├── schemas/
│   └── user-profile.schema.ts      # Validación con Zod
└── services/
    └── user-profile.service.ts     # Servicio API
```

## Componentes

### UserProfileForm
Componente de formulario para la edición del perfil del usuario.

**Props:**
- `profile: UserProfile` - Datos actuales del perfil
- `onSubmit: (data) => Promise<void>` - Callback para enviar datos
- `isLoading?: boolean` - Estado de carga

**Campos:**
- Nombres
- Apellidos
- Email (validado como único)
- Teléfono
- Fecha de Nacimiento
- Género

**Campos de solo lectura:**
- Username
- DPI
- Fecha de creación
- Última actualización

### UserProfilePageContent
Componente contenedor que gestiona el estado y la lógica de carga/actualización del perfil.

## Hooks

### useUserProfile
Hook personalizado para gestionar el estado del perfil del usuario.

**Retorna:**
```typescript
{
  profile: UserProfile | null,
  isLoading: boolean,
  isUpdating: boolean,
  error: string | null,
  refetch: () => Promise<void>,
  updateProfile: (data: UpdateUserProfileDto) => Promise<void>
}
```

## Servicio

### userProfileService
Servicio para interactuar con la API de perfil.

**Métodos:**
- `getProfile()` - Obtiene el perfil del usuario autenticado
- `updateProfile(data)` - Actualiza el perfil

## API Endpoints

Todos los endpoints requieren autenticación JWT.

### GET /api/user-profile
Obtiene el perfil completo del usuario autenticado.

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
  "role": { ... },
  "pictures": [ ... ],
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
  "phone": "+1234567890",
  "birthDate": "1990-05-15"
}
```

**Response:** Perfil actualizado con los mismos campos que GET

## Validación

Las validaciones se definen en `user-profile.schema.ts` usando Zod:

- `givenNames` - 1-100 caracteres (opcional)
- `lastNames` - 1-100 caracteres (opcional)
- `email` - Email válido, único en el sistema (opcional)
- `phone` - Máximo 20 caracteres (opcional)
- `birthDate` - Fecha ISO válida (opcional)
- `gender` - Máximo 20 caracteres (opcional)

## Uso

### Con el hook personalizado
```tsx
import { useUserProfile } from '@/hooks/user-profile';

export function MyComponent() {
  const { profile, isLoading, updateProfile } = useUserProfile();
  
  if (isLoading) return <div>Cargando...</div>;
  
  const handleUpdate = async (data) => {
    await updateProfile(data);
  };
  
  return <UserProfileForm profile={profile} onSubmit={handleUpdate} />;
}
```

### Como página protegida
```tsx
import { UserProfilePageContent } from '@/components/features/user-profile';

export default function UserProfilePage() {
  return (
    <ProtectedPage module="user-profile" action="read">
      <main>
        <UserProfilePageContent />
      </main>
    </ProtectedPage>
  );
}
```

## Características

✅ Edición de información personal
✅ Validación de datos con Zod
✅ Manejo de errores
✅ Estados de carga/actualización
✅ Notificaciones con Toast
✅ Campos de solo lectura
✅ Diseño responsive
✅ Modo oscuro soportado
✅ Protección de rutas
✅ Integración con API REST
