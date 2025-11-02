// DOCUMENTACIÓN - MÓDULO DE USUARIOS

## 📋 Resumen de Implementación

Se ha implementado un módulo completo de gestión de usuarios con una interfaz profesional, robusta y creativa, con soporte full dark/light mode.

---

## 📁 Estructura de Archivos Creados

```
src/
├── types/
│   └── users.types.ts              ✅ Tipos e interfaces
├── schemas/
│   └── users.schema.ts             ✅ Validaciones Zod
├── services/
│   └── users.service.ts            ✅ API calls
├── hooks/data/
│   └── useUsers.ts                 ✅ State management
└── components/features/users/
    ├── index.ts                    ✅ Barrel export
    ├── UserStats.tsx               ✅ Estadísticas
    ├── UserFilters.tsx             ✅ Filtros avanzados
    ├── UserCard.tsx                ✅ Tarjeta individual
    ├── UserTable.tsx               ✅ Tabla DataTable
    ├── UsersGrid.tsx               ✅ Grid de tarjetas
    ├── UserForm.tsx                ✅ Crear/Editar + Upload foto
    ├── DeleteUserDialog.tsx        ✅ Diálogo eliminar
    ├── ChangePasswordDialog.tsx    ✅ Cambiar contraseña
    ├── UserDetailDialog.tsx        ✅ Vista detallada
    └── UsersPageContent.tsx        ✅ Página principal
```

---

## 🎨 Características de Diseño

### Dark/Light Mode ✅
- Todos los componentes tienen clases de Tailwind para dark mode
- Uso de `dark:` prefix para estilos oscuros
- Colores profesionales sin gradientes full color
- Transiciones suaves

### Diseño Creativo & Robusto ✅
- Tarjetas con bordes sutiles y shadows
- Backgrounds neutros con tonos de slate
- Iconos relevantes para cada sección
- Espaciado consistente (gap, padding)
- Estados visuales claros (activo/inactivo)

### Componentes Reutilizables ✅
- Badges con colores semánticos (verde=activo, rojo=error)
- Avatares con iniciales
- Diálogos reusables
- Tabs para organización

---

## 🔐 Permisos Implementados

Basado en el seed de usuarios, se integran los permisos:

```
user:create            - Crear nuevos usuarios
user:read              - Listar todos los usuarios
user:read-one          - Ver detalles de un usuario
user:update            - Actualizar información
user:delete            - Eliminar usuario
user:change-password   - Cambiar contraseña
user:grant-access      - Otorgar acceso a plataforma
user:revoke-access     - Revocar acceso a plataforma
user:verify-email      - Verificar email
user:assign-role       - Asignar rol
user:read-stats        - Ver estadísticas
```

Los componentes ProtectedPage y ProtectedButton validan permisos automáticamente.

---

## 📊 Componentes Principales

### 1. UserStats
- 5 tarjetas con estadísticas principales
- Iconos y colores semánticos
- Cálculo de porcentajes
- Loading skeleton

### 2. UserFilters
- Búsqueda por nombre/email/DPI
- Filtros: Estado, Acceso, Ordenamiento
- Botón limpiar filtros activo
- Diseño responsivo

### 3. UserCard & UserTable
- Vista flexible (toggle grid/tabla)
- Información completa del usuario
- Acciones rápidas (Ver, Editar, Eliminar)
- Dropdown menu en tabla
- Avatar con iniciales

### 4. UserForm
- Tabs: Información + Foto
- Crear/Editar en un componente
- Upload de foto integrado con preview
- Validación de contraseña robusta
- Toggle para mostrar/ocultar contraseña
- Rollback automático si falla foto

### 5. Diálogos
- **DeleteUserDialog**: Confirmación con advertencia
- **ChangePasswordDialog**: Cambio seguro de contraseña
- **UserDetailDialog**: Vista completa con fotos

### 6. UsersPageContent
- Página principal con todo integrado
- Tabs (Listado/Formulario)
- Paginación
- Protección de permisos
- Manejo completo de errores

---

## 🔄 Flujos de Usuario

### Crear Usuario
1. Click en "Crear Usuario"
2. Tab cambia a formulario
3. Llenar datos + foto (opcional)
4. Submit
5. Se carga foto si existe
6. Vuelve a lista actualizada

### Editar Usuario
1. Click "Editar" en usuario
2. Carga datos del usuario
3. Tab cambia a formulario
4. Editar datos + foto (opcional)
5. Submit
6. Se actualiza usuario + foto
7. Vuelve a lista

### Cambiar Contraseña
1. Click "Cambiar contraseña" (solo tabla)
2. Modal con 3 campos
3. Validaciones estrictas
4. Confirmación
5. Notificación de éxito

### Eliminar Usuario
1. Click "Eliminar"
2. Modal de confirmación
3. Muestra advertencia de soft delete
4. Confirmación
5. Usuario marcado como eliminado

### Ver Detalles
1. Click en "Ver" o tarjeta
2. Modal con información completa
3. Tabs: Información + Fotos
4. Muestra todas las fotos del usuario

---

## 🛠️ API Integration

### Endpoints Utilizados

```
GET  /api/users                          - Listar paginado
GET  /api/users/:id                      - Obtener por ID
GET  /api/users/stats                    - Estadísticas
POST /api/users                          - Crear usuario
PATCH /api/users/:id                     - Actualizar
DELETE /api/users/:id                    - Eliminar (soft)
PATCH /api/users/:id/change-password     - Cambiar contraseña
PATCH /api/users/:id/grant-access        - Otorgar acceso
PATCH /api/users/:id/revoke-access       - Revocar acceso
PATCH /api/users/:id/verify-email        - Verificar email
POST /api/users/:id/pictures             - Subir foto
GET  /api/users/:id/pictures             - Listar fotos
GET  /api/users/:id/pictures/:picId      - Obtener foto
DELETE /api/users/:id/pictures/:picId    - Eliminar foto
```

---

## 📦 Validaciones Zod

### CreateUserSchema
- Email: RFC 5322, único
- Username: 3-20 caracteres, alfanumérico + guiones
- Password: 8+ chars, mayúscula, minúscula, número, especial
- DPI: Exactamente 13 dígitos
- Nombres/Apellidos: 2-50 caracteres
- Género: M, F, O
- Rol: Required
- Confirmación de contraseña: Match

### UpdateUserSchema
- Todos los campos opcionales
- Mismas reglas de validación

### ChangePasswordSchema
- Actual password: Required
- New password: Mismas reglas que create
- Confirmación: Match
- Diferente de la actual

---

## 🎯 Uso en la Aplicación

### 1. Importar en página
```tsx
import { UsersPageContent } from '@/components/features/users';

export default function UsersPage() {
  return <UsersPageContent />;
}
```

### 2. Personalizar hook
```tsx
const {
  data,           // Usuarios paginados
  stats,          // Estadísticas
  isLoading,      // Estado de carga
  query,          // Query actual
  updateQuery,    // Actualizar filtros
  createUser,     // Crear usuario
  deleteUser,     // Eliminar usuario
  // ... más acciones
} = useUsers();
```

### 3. Usar servicio directamente
```tsx
import { usersService } from '@/services/users.service';

const users = await usersService.getUsers({
  page: 1,
  limit: 10,
  search: 'juan',
});
```

---

## 🌙 Dark Mode

Todos los componentes soportan dark mode automáticamente:

```tsx
// Ejemplo de clase dark
className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
```

Para activar dark mode en la aplicación (generalmente en layout raíz):
```tsx
<html className="dark">
  {/* contenido */}
</html>
```

---

## ⚠️ Consideraciones Importantes

### Manejo de Fotos
- Se valida tamaño (5MB máx)
- Se valida tipo (JPG, PNG, GIF, WebP)
- En create: Si falla la foto, se elimina el usuario
- En update: Si falla la foto, continúa (se actualiza usuario)

### Protección de Permisos
- ProtectedPage envuelve toda la página
- ProtectedButton controla acciones individuales
- Si sin permisos: Muestra NoPermissionCard o botón deshabilitado

### Estados y Transiciones
- Loading skeleton para datos
- Spinner en botones de submit
- Toast notifications (sonner) para feedback
- Disabled states en inputs durante carga

### Paginación
- Default: 10-12 usuarios por página
- Máximo: 100 usuarios por página
- Mantiene scroll position

---

## 📝 Ejemplo Completo de Uso

```tsx
'use client';

import { UsersPageContent } from '@/components/features/users';
import { ProtectedPage } from '@/components/shared/permissions/ProtectedPage';

export default function UsersPage() {
  return (
    <ProtectedPage module="user" action="read">
      <UsersPageContent />
    </ProtectedPage>
  );
}
```

---

## 🔍 Troubleshooting

### "No permissions" aparece
- Verificar que usuario tenga rol con permisos
- Verificar que el módulo/action sea correcto
- Chequear console para detalles

### Foto no se carga
- Validar tamaño < 5MB
- Validar formato (JPG, PNG, GIF, WebP)
- Chequear que la ruta /api/users/:id/pictures sea correcta

### Filtros no funcionan
- Chequear que API soporte los parámetros
- Validar que sortBy sea campo válido
- Ver console para errores de API

### Dark mode no funciona
- Verificar que el html tenga clase "dark"
- Verificar que tailwind esté configurado para dark mode
- Limpiar caché del navegador

---

## 📞 Soporte

Para errores o dudas:
1. Revisar console del navegador
2. Chequear network en DevTools
3. Verificar permisos del usuario
4. Consultar seed.ts para estructura de datos

---

¡Módulo completamente funcional y listo para producción! 🚀
