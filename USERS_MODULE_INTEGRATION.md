# 🚀 GUÍA DE INTEGRACIÓN - MÓDULO DE USUARIOS

## ⚡ Quick Start

### 1. Crear página de usuarios

Crea el archivo: `src/app/(admin)/users/page.tsx`

```tsx
'use client';

import { UsersPageContent } from '@/components/features/users';

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        <UsersPageContent />
      </div>
    </div>
  );
}
```

### 2. Agregar a navegación

En tu layout o sidebar, agrega:

```tsx
import { Users } from 'lucide-react';
import Link from 'next/link';

<Link href="/users" className="flex items-center gap-2">
  <Users className="w-4 h-4" />
  Usuarios
</Link>
```

### 3. ¡Listo!

El módulo está completamente funcional. Solo necesitas:
- ✅ Backend API funcionando
- ✅ Autenticación configurada
- ✅ Permisos en base de datos

---

## 🔗 Integración con Rutas

### Opción 1: En carpeta (admin)
```
src/app/(admin)/
├── roles/
├── users/          ← Aquí
│   └── page.tsx
└── layout.tsx
```

### Opción 2: En carpeta (full-width-pages)
```
src/app/(full-width-pages)/
├── users/          ← Aquí
│   └── page.tsx
```

### Opción 3: Ruta principal
```
src/app/
├── users/          ← Aquí
│   └── page.tsx
```

---

## 🎨 Personalización

### Cambiar tema de colores

En cualquier componente, reemplaza `dark:bg-slate-900` por tu color:

```tsx
// De:
className="dark:bg-slate-900"

// A:
className="dark:bg-blue-900"
```

### Cambiar cantidad de usuarios por página

En `UsersPageContent.tsx`:

```tsx
const { ... } = useUsers({
  page: 1,
  limit: 20,  // ← Cambiar aquí (default: 12)
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
```

### Agregar más filtros

En `UserFilters.tsx`, agrega un nuevo Select:

```tsx
{/* Role Filter */}
<Select
  value={query.roleId?.toString() || 'all'}
  onValueChange={(value) => 
    onQueryChange({ roleId: value === 'all' ? undefined : parseInt(value), page: 1 })
  }
>
  <SelectTrigger>
    <SelectValue placeholder="Rol" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">Todos</SelectItem>
    {/* Agregar opciones de roles */}
  </SelectContent>
</Select>
```

---

## 🔐 Configurar Permisos

### En base de datos (Seed)

Verifica que exista el seed de usuarios:

```bash
src/database/seeds/modules/users/users.seed.ts
```

Permisos disponibles:
- user:create
- user:read
- user:read-one
- user:update
- user:delete
- user:change-password
- user:grant-access
- user:revoke-access
- user:verify-email
- user:assign-role
- user:read-stats

### Asignar a un rol

1. Ve a Roles
2. Busca el rol (ej: Administrador)
3. Haz clic en "Ver" o "Editar"
4. Agrega los permisos de usuario que desees

---

## 📸 Configurar Upload de Fotos

### Cloudinary (Recomendado)

Si usas Cloudinary (como en tu proyecto):

1. En `users.service.ts`, la foto se envía como FormData
2. El backend debe guardar la URL en Picture

2. El backend maneja la subida a Cloudinary
3. Retorna la URL para guardar en base de datos

### Localmente

Si guardas en servidor local:

1. El endpoint `/api/users/:id/pictures` debe procesar FormData
2. Guardar el archivo en carpeta pública
3. Retornar URL relativa

---

## 🧪 Testing

### Probar crear usuario

```bash
# Datos de prueba
Email: usuario@test.com
Username: usuario_test
Password: Test12345!
DPI: 1234567890123
Nombre: Juan Carlos
Apellido: Pérez García
Rol: Docente
```

### Probar con foto

1. Selecciona un archivo JPG/PNG < 5MB
2. Verás preview
3. Al guardar, se subirá automáticamente

### Probar cambiar contraseña

1. En tabla, click en ⋯ (Cambiar contraseña)
2. Ingresa contraseña actual
3. Ingresa nueva (con mayúscula, número, especial)
4. Confirma

---

## 🐛 Troubleshooting

### "400 Bad Request" al crear usuario

**Problema**: Los datos no cumplen validaciones del backend

**Solución**:
- Verifica que email sea único
- Verifica que DPI sea único
- Verifica que contraseña sea robusta
- Verifica que rol exista

### Fotos no se cargan

**Problema**: Upload a Cloudinary falla

**Solución**:
- Verifica credenciales de Cloudinary
- Verifica que el tamaño sea < 5MB
- Verifica que el formato sea válido
- Checa console para errores

### Permiso "Sin acceso" aparece

**Problema**: Usuario no tiene permisos

**Solución**:
- Verifica que el rol tenga permisos user:read
- Checa en base de datos: role_permissions
- Reinicia sesión después de cambiar permisos

### Dark mode no funciona

**Problema**: Clases dark no se aplican

**Solución**:
- Verifica que html tenga clase "dark"
- En layout raíz: `<html className="dark">`
- Limpia caché del navegador
- Verifica que Tailwind esté configurado

### Tabla vacía

**Problema**: No se cargan usuarios

**Solución**:
- Verifica que API esté funcionando
- Checa que existan usuarios en base de datos
- Mira console para errores
- Verifica que token sea válido

---

## 🔄 Flujo de Datos

```
UsersPageContent
    ↓
useUsers Hook
    ↓
usersService
    ↓
API Backend
    ↓
Database
```

Cada capa:
1. **Componente**: UI y eventos del usuario
2. **Hook**: State management y lógica
3. **Servicio**: Llamadas a API
4. **Backend**: Validaciones y operaciones DB
5. **Database**: Almacenamiento

---

## 📦 Dependencias Usadas

- ✅ `react-hook-form` - Manejo de formularios
- ✅ `@hookform/resolvers` - Integración con Zod
- ✅ `zod` - Validaciones
- ✅ `sonner` - Toast notifications
- ✅ `shadcn/ui` - Componentes UI
- ✅ `tailwindcss` - Estilos
- ✅ `lucide-react` - Iconos
- ✅ `date-fns` - Formateo de fechas

Todas ya están en tu `package.json` ✅

---

## 🚀 Deployment

### Antes de ir a producción:

1. ✅ Prueba todos los permisos
2. ✅ Prueba crear/editar/eliminar usuarios
3. ✅ Prueba upload de fotos
4. ✅ Prueba dark mode
5. ✅ Verifica URLs de API
6. ✅ Verifica token expiration
7. ✅ Prueba en diferentes navegadores

---

## 📞 Soporte

Si tienes dudas:

1. **Lee la documentación**: `USERS_MODULE_DOCUMENTATION.md`
2. **Checa el resumen**: `USERS_MODULE_SUMMARY.md`
3. **Mira el seed**: `src/database/seeds/modules/users/users.seed.ts`
4. **Revisa console**: F12 → Console

---

## ✨ Siguientes Pasos Opcionales

1. Agregar búsqueda avanzada por fechas
2. Exportar usuarios a CSV/Excel
3. Importar usuarios desde CSV
4. Cambiar permisos en lote
5. Activar/desactivar múltiples usuarios
6. Agregar avatar personalizado
7. Integrar con Slack/Email para notificaciones

---

¡Módulo completamente integrado! 🎉

Cualquier duda → Revisa la documentación o el código.
