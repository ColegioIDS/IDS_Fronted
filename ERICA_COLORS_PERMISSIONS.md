# ERICA Colors - Sistema de Permisos

## 📋 Configuración de Permisos

### Módulo Base
```
Módulo: erica-colors
Scope: ALL (Solo administradores)
```

## 🔑 Permisos Disponibles

### 1. **READ** - Lectura de Colores de Dimensiones
```typescript
{
  resource: 'erica-colors',
  action: 'read'
}
```
**Descripción:** Obtener colores de dimensiones ERICA (EJECUTA, RETIENE, INTERPRETA, CONOCE, AMPLIA)

**Permite:**
- Acceder a la página `/erica-colors`
- Ver la pestaña "Vista Previa"
- Ver la pestaña "Dimensiones" (solo lectura)

**Requerido por:**
- Componente: `<DimensionLegend />`
- Hook: `useEricaColors()`
- Página: `/erica-colors`

---

### 2. **READ_STATES** - Lectura de Colores de Estados
```typescript
{
  resource: 'erica-colors',
  action: 'read-states'
}
```
**Descripción:** Obtener colores de estados ERICA (E, B, P, C, N)

**Permite:**
- Ver colores de desempeño (Excelente, Bueno, Proficiente, En Construcción, No Logrado)
- Ver la pestaña "Estados" (solo lectura)

**Requerido por:**
- Componente: `<StateLegend />`
- Componentes de evaluación

---

### 3. **MANAGE** - Gestión de Todos los Colores
```typescript
{
  resource: 'erica-colors',
  action: 'manage'
}
```
**Descripción:** Actualizar colores de dimensiones y estados ERICA

**Permite:**
- Editar cualquier color de dimensión
- Editar cualquier color de estado
- Abrir diálogos de edición
- Guardar cambios de color
- Recargar colores desde el servidor

**Requerido por:**
- Página: `/erica-colors` (para edición)
- Botón: "Editar Color"
- Diálogos de actualización

---

## 🔐 Mapeo en Frontend

### Archivo: `src/constants/erica-colors.permissions.ts`

```typescript
export const ERICA_COLORS_PERMISSIONS = {
  // Lectura
  READ: {
    resource: 'erica-colors',
    action: 'read',
  },
  
  READ_STATES: {
    resource: 'erica-colors',
    action: 'read-states',
  },

  // Actualización
  MANAGE: {
    resource: 'erica-colors',
    action: 'manage',
  },

  // Alias (apuntan a MANAGE)
  UPDATE_DIMENSIONS: {
    resource: 'erica-colors',
    action: 'manage',
  },

  UPDATE_STATES: {
    resource: 'erica-colors',
    action: 'manage',
  },
};
```

---

## 📱 Uso en Componentes

### ProtectedPage (Acceso a la página)
```tsx
import { ERICA_COLORS_PERMISSIONS } from '@/constants/erica-colors.permissions';

export default function EricaColorsPage() {
  return (
    <ProtectedPage {...ERICA_COLORS_PERMISSIONS.READ}>
      {/* Contenido de la página */}
    </ProtectedPage>
  );
}
```

### ProtectedContent (Elementos editables)
```tsx
{/* Solo administradores con permiso 'manage' */}
<ProtectedContent {...ERICA_COLORS_PERMISSIONS.MANAGE} hideOnNoPermission>
  <button onClick={handleEdit}>Editar Color</button>
</ProtectedContent>
```

### Hook useEricaColors (Acceso a datos)
```tsx
import { useEricaColors } from '@/hooks/useEricaColors';

function MyComponent() {
  const { getDimensionColor, getStateColor } = useEricaColors();
  
  // Retorna colores del caché (no requiere permiso)
  const color = getDimensionColor('EJECUTA');
  
  return <div style={{ backgroundColor: color }} />;
}
```

---

## 🗺️ Sidebar Navigation

### Ruta en el menú:
```
ERICA (Menú Principal)
├─ Temas ERICA          → /erica-topics
└─ Colores ERICA ← NEW! → /erica-colors
```

**Permisos para mostrar:**
- `ERICA_COLORS_PERMISSIONS.READ` (módulo erica-colors:read)

---

## 🔄 Flujo de Permisos

### Acceso a la Página
```
Usuario → /erica-colors
  ↓
¿Tiene permisos 'erica-colors:read'?
  ├─ SÍ  → Acceder a la página
  └─ NO  → Mostrar "Acceso Denegado"
```

### Edición de Colores
```
Usuario → Clic en "Editar Color"
  ↓
¿Tiene permisos 'erica-colors:manage'?
  ├─ SÍ  → Abrir diálogo de edición
  └─ NO  → Ocular botón (hideOnNoPermission)
```

### Actualización de Color
```
Usuario → Clic en "Guardar"
  ↓
Frontend → API PUT
  ↓
Backend verifica permisos 'erica-colors:manage'
  ├─ SÍ  → Actualizar color en BD
  └─ NO  → Error 403 Forbidden
```

---

## 📊 Comparación: ERICA Topics vs ERICA Colors

| Aspecto | ERICA Topics | ERICA Colors |
|---------|-------------|--------------|
| **Módulo** | erica | erica-colors |
| **Lectura** | erica:read | erica-colors:read |
| **Lectura Estados** | - | erica-colors:read-states |
| **Gestión** | erica:manage-topics | erica-colors:manage |
| **Scope** | TEACHER, ADMIN | ADMIN (ALL) |
| **Página** | /erica-topics | /erica-colors |

---

## ⚙️ Backend - Seeds

### Ubicación:
```
src/database/seeds/modules/erica-colors/erica-colors-permissions.seed.ts
```

### Permisos Creados:
1. `erica-colors:read` - Lectura de colores de dimensiones
2. `erica-colors:read-states` - Lectura de colores de estados
3. `erica-colors:manage` - Gestión de todos los colores

### Ejecución:
```bash
npm run seed
```

---

## 🛡️ Notas de Seguridad

✅ **Scope ALL**: Solo administradores pueden cambiar colores del sistema
✅ **Validación Hex**: Frontend y backend validan formato hexadecimal
✅ **Caché Local**: Los colores se cachean 24 horas para reducir llamadas
✅ **Sincronización**: Cambios en admin se reflejan en nuevas llamadas GET
✅ **Auditoría**: Backend registra qién cambió qué color y cuándo

---

## 📝 Checklist de Implementación

- [x] Tipos definidos en `erica-colors.types.ts`
- [x] Permisos creados en backend (seed)
- [x] Permisos mapeados en frontend `erica-colors.permissions.ts`
- [x] Página `/erica-colors` creada
- [x] Componentes ProtectedPage y ProtectedContent implementados
- [x] Hook useEricaColors con caché
- [x] Sidebar actualizado con nueva ruta
- [x] Documentación completa

---

## 🎯 Próximos Pasos (Opcional)

Si necesitas expandir en el futuro:

1. **Permisos por Dimensión**
   ```typescript
   action: 'update-dimension-EJECUTA'
   action: 'update-dimension-RETIENE'
   // etc...
   ```

2. **Auditoria de Cambios**
   ```typescript
   // Registrar quién cambió qué color y cuándo
   ```

3. **Temas Personalizados**
   ```typescript
   // Permitir usuarios crear paletas personalizadas
   ```

4. **Validación de Contraste**
   ```typescript
   // Verificar contraste WCAG AA/AAA
   ```

