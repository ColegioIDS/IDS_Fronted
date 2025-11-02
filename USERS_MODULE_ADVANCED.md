# 💡 GUÍA AVANZADA - EJEMPLOS DE USO

## 🎯 Casos de Uso Avanzados

### 1. Usar el Hook Directamente

```tsx
'use client';

import { useUsers } from '@/hooks/data/useUsers';

export function UsersDashboard() {
  const {
    data,
    stats,
    isLoading,
    error,
    query,
    updateQuery,
    refresh,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div>
      <h1>Total: {stats?.totalUsers}</h1>
      <button onClick={() => refresh()}>Actualizar</button>
      <button onClick={() => updateQuery({ search: 'juan' })}>
        Buscar "juan"
      </button>
      
      {data?.data.map((user) => (
        <div key={user.id}>{user.givenNames} {user.lastNames}</div>
      ))}
    </div>
  );
}
```

---

### 2. Usar el Servicio Directamente

```tsx
import { usersService } from '@/services/users.service';

async function getActiveUsers() {
  try {
    const result = await usersService.getUsers({
      isActive: true,
      page: 1,
      limit: 50,
    });
    console.log('Usuarios activos:', result.data);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function createNewUser() {
  try {
    const user = await usersService.createUser({
      email: 'nuevo@test.com',
      username: 'nuevo_user',
      password: 'Secure123!',
      givenNames: 'Juan',
      lastNames: 'Pérez',
      dpi: '1234567890123',
      phone: '+50212345678',
      gender: 'M',
      roleId: 2,
    });
    console.log('Usuario creado:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

### 3. Componentes Individuales

#### Solo UserCard
```tsx
import { UserCard } from '@/components/features/users';

export function CustomUserView({ user }) {
  return (
    <UserCard
      user={user}
      onEdit={(user) => console.log('Editar:', user)}
      onDelete={(user) => console.log('Eliminar:', user)}
      onViewDetails={(user) => console.log('Detalles:', user)}
    />
  );
}
```

#### Solo UserTable
```tsx
import { UserTable } from '@/components/features/users';

export function CustomUserTable({ users }) {
  return (
    <UserTable
      users={users}
      onEdit={(user) => console.log('Editar:', user)}
      onDelete={(user) => console.log('Eliminar:', user)}
      onChangePassword={(user) => console.log('Cambiar pass:', user)}
    />
  );
}
```

#### Solo UserForm
```tsx
import { UserForm } from '@/components/features/users';

export function CreateUserView() {
  const handleSubmit = async (data, file) => {
    console.log('Datos del formulario:', data);
    console.log('Archivo:', file);
    // Hacer algo con los datos
  };

  return (
    <UserForm
      onSubmit={handleSubmit}
      onCancel={() => console.log('Cancelado')}
    />
  );
}
```

---

### 4. Filtrado Avanzado

```tsx
'use client';

import { useUsers } from '@/hooks/data/useUsers';

export function AdvancedFiltering() {
  const { updateQuery } = useUsers();

  const handleFiltros = () => {
    // Buscar docentes activos sin acceso a plataforma
    updateQuery({
      search: 'juan',
      isActive: true,
      canAccessPlatform: false,
      roleId: 3, // Docentes
      sortBy: 'email',
      sortOrder: 'asc',
      page: 1,
    });
  };

  return (
    <button onClick={handleFiltros}>
      Aplicar Filtros Complejos
    </button>
  );
}
```

---

### 5. Estadísticas Personalizadas

```tsx
'use client';

import { useUsers } from '@/hooks/data/useUsers';
import { UserStats } from '@/components/features/users';

export function DashboardStats() {
  const { stats, isLoading } = useUsers();

  if (!stats) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <UserStats stats={stats} isLoading={isLoading} />

      <div className="p-4 border rounded">
        <h3>Análisis</h3>
        <p>Porcentaje verificados: {
          ((stats.verifiedEmails / stats.totalUsers) * 100).toFixed(2)
        }%</p>
        <p>Porcentaje con acceso: {
          ((stats.canAccessPlatform / stats.totalUsers) * 100).toFixed(2)
        }%</p>
      </div>
    </div>
  );
}
```

---

### 6. Cambiar Contraseña Programáticamente

```tsx
'use client';

import { useUsers } from '@/hooks/data/useUsers';

export function AdminChangePassword() {
  const { changePassword } = useUsers();

  const handleResetPassword = async (userId: number) => {
    try {
      await changePassword(userId, {
        currentPassword: 'Admin123!', // Contraseña actual
        newPassword: 'NewPass456!',
        confirmPassword: 'NewPass456!',
      });
      console.log('Contraseña cambiada');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <button onClick={() => handleResetPassword(1)}>
      Resetear Contraseña Usuario 1
    </button>
  );
}
```

---

### 7. Upload de Foto Separado

```tsx
'use client';

import { useUsers } from '@/hooks/data/useUsers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function PhotoUploader({ userId }: { userId: number }) {
  const { uploadPicture } = useUsers();
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await uploadPicture(
        userId,
        file,
        'profile',
        'Foto de perfil'
      );
      console.log('Foto subida:', result);
    } catch (error) {
      console.error('Error al subir foto:', error);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <Button onClick={handleUpload}>Subir Foto</Button>
    </div>
  );
}
```

---

### 8. Acciones en Lote (Idea para Futura Implementación)

```tsx
'use client';

import { useUsers } from '@/hooks/data/useUsers';

export function BulkActions() {
  const { grantAccess, revokeAccess, updateQuery } = useUsers();

  const handleGrantAccessToAll = async () => {
    // Obtener todos los usuarios
    const result = await updateQuery({
      limit: 1000,
      isActive: true,
    });

    // Iterar y otorgar acceso
    // for (const user of result.data) {
    //   await grantAccess(user.id);
    // }
  };

  return (
    <button onClick={handleGrantAccessToAll}>
      Otorgar Acceso a Todos
    </button>
  );
}
```

---

### 9. Integración con SWR (Alternativa)

```tsx
'use client';

import useSWR from 'swr';
import { usersService } from '@/services/users.service';

export function UsersSWRExample() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/users',
    () => usersService.getUsers({ page: 1, limit: 10 })
  );

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map((user) => (
        <div key={user.id}>{user.givenNames}</div>
      ))}
      <button onClick={() => mutate()}>Actualizar</button>
    </div>
  );
}
```

---

### 10. Validar Antes de Guardar

```tsx
'use client';

import { createUserSchema } from '@/schemas/users.schema';
import { ZodError } from 'zod';

export function ValidateUserData() {
  const handleValidate = () => {
    const formData = {
      email: 'usuario@test.com',
      username: 'usuario_test',
      password: 'Test12345!',
      confirmPassword: 'Test12345!',
      givenNames: 'Juan',
      lastNames: 'Pérez',
      dpi: '1234567890123',
      phone: '+50212345678',
      gender: 'M' as const,
      roleId: 2,
    };

    try {
      const validated = createUserSchema.parse(formData);
      console.log('Validación exitosa:', validated);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('Errores de validación:', error.errors);
      }
    }
  };

  return <button onClick={handleValidate}>Validar</button>;
}
```

---

### 11. Modal Personalizado

```tsx
'use client';

import { useState } from 'react';
import { UserDetailDialog } from '@/components/features/users';
import { User } from '@/types/users.types';

export function CustomUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleOpenDetails = (user: User) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  return (
    <>
      <button onClick={() => handleOpenDetails({
        id: 1,
        email: 'test@test.com',
        username: 'test',
        givenNames: 'Juan',
        lastNames: 'Pérez',
        dpi: '1234567890123',
        phone: '+50212345678',
        gender: 'M',
        isActive: true,
        accountVerified: true,
        canAccessPlatform: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roleId: 1,
      })}>
        Ver Detalles
      </button>

      <UserDetailDialog
        user={selectedUser}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}
```

---

### 12. Búsqueda en Tiempo Real

```tsx
'use client';

import { useDebounce } from '@/hooks/useDebounce'; // Tu hook
import { useUsers } from '@/hooks/data/useUsers';
import { Input } from '@/components/ui/input';

export function RealtimeSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const { updateQuery } = useUsers();

  useEffect(() => {
    updateQuery({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch, updateQuery]);

  return (
    <Input
      placeholder="Buscar usuarios..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

---

### 13. Exportar a CSV

```tsx
'use client';

import { useUsers } from '@/hooks/data/useUsers';

export function ExportUsers() {
  const { data } = useUsers();

  const handleExport = () => {
    if (!data?.data) return;

    const csv = [
      ['ID', 'Email', 'Nombre', 'Rol', 'Estado'].join(','),
      ...data.data.map((user) =>
        [
          user.id,
          user.email,
          `${user.givenNames} ${user.lastNames}`,
          'N/A',
          user.isActive ? 'Activo' : 'Inactivo',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios-${new Date().toISOString()}.csv`;
    a.click();
  };

  return <button onClick={handleExport}>Descargar CSV</button>;
}
```

---

## 🎓 Conclusión

Todos estos ejemplos muestran la flexibilidad del módulo:

- ✅ Uso completo con `UsersPageContent`
- ✅ Uso parcial con componentes individuales
- ✅ Uso del servicio directamente
- ✅ Uso del hook
- ✅ Integraciones personalizadas

**Adapta los ejemplos a tus necesidades** 🚀
