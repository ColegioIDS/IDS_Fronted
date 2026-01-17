// ESTRUCTURA DE CARPETAS - MÓDULO NOTIFICACIONES

```
src/
├── types/
│   └── notifications.types.ts ..................... Interfaces y tipos
│
├── schemas/
│   └── notification.schema.ts ..................... Validaciones Zod
│
├── services/
│   └── notifications.service.ts .................. API service
│
├── hooks/
│   └── data/
│       └── notifications/
│           ├── useNotifications.ts ............... Hook: Listar con filtros
│           ├── useNotificationDetail.ts ......... Hook: Obtener detalle
│           ├── useNotificationPreferences.ts ... Hook: Preferencias
│           ├── useSendNotification.ts .......... Hook: Envío
│           └── index.ts ......................... Exportación
│
├── components/
│   └── features/
│       └── notifications/
│           ├── NotificationCard.tsx ............. Tarjeta de notificación
│           ├── NotificationFilters.tsx ......... Filtros
│           ├── NotificationsGrid.tsx ........... Grid con paginación
│           ├── NotificationForm.tsx ............ Formulario de envío
│           ├── NotificationDetailDialog.tsx ... Diálogo de detalles
│           ├── DeleteNotificationDialog.tsx ... Diálogo de eliminación
│           ├── UserPreferencesPanel.tsx ....... Preferencias personales
│           ├── PreferencesList.tsx ............ Listado de preferencias (admin)
│           ├── NotificationsPageContent.tsx .. Contenedor principal
│           ├── index.ts ....................... Exportación
│           └── IMPLEMENTACION.md .............. Documentación
│
├── app/
│   └── (admin)/
│       └── (management)/
│           └── notifications/
│               └── page.tsx ...................... Página principal
│
└── constants/
    └── modules-permissions/
        └── notifications/
            └── notifications.permissions.ts .... Configuración de permisos
```

---

## 🔄 FLUJO DE DATOS

```
Usuario
  ↓
NotificationsPageContent (contenedor)
  ├── useNotifications (hook) → notificationsService → API Backend
  ├── useNotificationDetail (hook) → notificationsService → API Backend
  ├── useNotificationPreferences (hook) → notificationsService → API Backend
  └── useSendNotification (hook) → notificationsService → API Backend
       ↓
   Componentes presentacionales
   ├── NotificationsGrid
   ├── NotificationForm
   ├── UserPreferencesPanel
   └── ...
```

---

## 📊 ARQUITECTURA DE TIPOS

```typescript
// Flujo de tipos
1. Definición: notifications.types.ts
   ├── Notification (base)
   ├── NotificationWithRelations (con relaciones)
   ├── NotificationRecipient
   ├── NotificationDeliveryLog
   ├── NotificationPreference
   └── ...

2. Validación: notification.schema.ts
   ├── createNotificationSchema
   ├── sendNotificationSchema
   └── updatePreferenceSchema

3. Uso en:
   ├── Services (notificationsService)
   ├── Hooks (useNotifications, etc)
   └── Componentes
```

---

## 🎯 PATRÓN USADO (Similar a Roles)

El módulo sigue exactamente el mismo patrón que roles.service:

```typescript
// roles.service.ts (patrón)
async getRoles(query: RolesQuery): Promise<PaginatedRoles> {
  const params = new URLSearchParams();
  // ... construir params
  const response = await api.get(`/api/roles?${params.toString()}`);
  return { data, meta };
}

// notifications.service.ts (mismo patrón)
async getNotifications(query: NotificationsQuery): Promise<PaginatedNotifications> {
  const params = new URLSearchParams();
  // ... construir params
  const response = await api.get(`/api/notifications?${params.toString()}`);
  return { data, meta };
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

✅ Tipos TypeScript definidos
✅ Esquemas Zod para validación
✅ Service con métodos CRUD
✅ Hooks personalizados (4 hooks)
✅ Componentes de presentación
✅ Componentes de diálogo
✅ Formularios validados
✅ Página principal
✅ Permisos configurados
✅ Paginación
✅ Filtros avanzados
✅ Manejo de errores
✅ Estados de carga
✅ Toast notifications
✅ Internacionalización
✅ Responsive design
✅ Documentación

---

## 🚀 CÓMO USAR

### 1. Listar notificaciones con filtros

```tsx
import { useNotifications } from '@/hooks/data/notifications';

function MiComponente() {
  const { data, isLoading, error, query, updateQuery, refresh } = 
    useNotifications({ page: 1, limit: 10 });

  return (
    <NotificationsGrid
      notifications={data?.data || []}
      isLoading={isLoading}
      onPageChange={(page) => updateQuery({ page })}
    />
  );
}
```

### 2. Obtener detalles de una notificación

```tsx
import { useNotificationDetail } from '@/hooks/data/notifications';

function MiComponente({ notificationId }) {
  const { data, isLoading, error } = useNotificationDetail(notificationId);

  return data && <div>{data.title}</div>;
}
```

### 3. Enviar notificación

```tsx
import { useSendNotification } from '@/hooks/data/notifications';
import { SendNotificationDto } from '@/types/notifications.types';

function MiComponente() {
  const { send, isLoading, error, result } = useSendNotification();

  const handleSend = async () => {
    const payload: SendNotificationDto = {
      title: 'Test',
      recipients: { sendToAll: true }
    };
    await send(payload);
  };

  return <button onClick={handleSend}>Enviar</button>;
}
```

### 4. Gestionar preferencias

```tsx
import { useNotificationPreferences } from '@/hooks/data/notifications';

function MiComponente() {
  const { preferences, updatePreferences, unsubscribe } = 
    useNotificationPreferences();

  return (
    <button onClick={() => updatePreferences({ emailEnabled: false })}>
      Deshabilitar email
    </button>
  );
}
```

---

## 🔒 PERMISOS REQUERIDOS

Para acceder a la página:
```typescript
MODULES_PERMISSIONS.NOTIFICATIONS.VIEW // required
```

Para enviar notificaciones:
```typescript
MODULES_PERMISSIONS.NOTIFICATIONS.SEND
```

Para ver todas las preferencias:
```typescript
MODULES_PERMISSIONS.NOTIFICATIONS.VIEW_PREFERENCES
```

---

## 🔧 CONFIGURACIÓN REQUERIDA

✅ API base configurada en `@/config/api`
✅ AuthContext disponible en `@/context/AuthContext`
✅ ShadCN/UI componentes instalados
✅ date-fns y sonner instalados
✅ tailwindcss configurado
