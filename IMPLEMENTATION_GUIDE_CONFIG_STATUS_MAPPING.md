# Config-Status-Mapping API Integration - Frontend Implementation

## Overview

Se ha implementado la integración completa del módulo **Config-Status-Mapping** en el frontend, consumiendo los endpoints de la API de NestJS.

## Estructura de Archivos Creados

### 1. Servicio (`src/services/config-status-mapping.service.ts`)

Servicio que encapsula toda la lógica de comunicación con la API.

**Métodos implementados:**

- `findAll(page, limit)` - GET `/api/config-status-mappings`
  - Obtiene listado paginado de todos los mappings
  
- `findById(id)` - GET `/api/config-status-mappings/:id`
  - Obtiene un mapping específico por ID
  
- `findByConfigId(configId, page, limit)` - GET `/api/config-status-mappings/config/:configId`
  - Obtiene mappings filtrados por Config ID
  
- `findByStatusId(statusId, page, limit)` - GET `/api/config-status-mappings/status/:statusId`
  - Obtiene mappings filtrados por Status ID
  
- `create(dto)` - POST `/api/config-status-mappings`
  - Crea un nuevo mapping (HTTP 201)
  
- `update(id, dto)` - PATCH `/api/config-status-mappings/:id`
  - Actualiza un mapping existente (HTTP 200)
  
- `delete(id)` - DELETE `/api/config-status-mappings/:id`
  - Elimina un mapping (HTTP 204)

**Características:**
- Utiliza axios configurado en `src/config/api.ts`
- Incluye manejo de errores detallado
- Soporta paginación en todas las consultas GET
- Autenticación vía Bearer token automática

### 2. Tipos (`src/types/config-status-mapping.types.ts`)

Define las interfaces TypeScript para type-safety:

```typescript
// DTOs de solicitud
CreateConfigStatusMappingDto
UpdateConfigStatusMappingDto

// DTO de respuesta
ConfigStatusMappingResponseDto {
  id: number
  configId: number
  statusId: number
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Respuesta paginada
PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
```

### 3. Componente Principal (`src/components/features/config-status-mapping/ConfigStatusMappingPage.tsx`)

Componente React que proporciona la interfaz completa:

**Funcionalidades:**

1. **Listado con Paginación**
   - Tabla responsiva con información de mappings
   - Paginación con botones anterior/siguiente
   - Mostrador de resultados (X de Y)

2. **Crear Mapping**
   - Formulario modal con validación
   - Campos: Config ID, Status ID, Display Order, Is Active
   - Confirmación de éxito/error

3. **Editar Mapping**
   - Botón de edición en cada fila
   - Precarga de datos en el formulario
   - Actualización sin recargar página

4. **Eliminar Mapping**
   - Botón de eliminación con confirmación
   - Confirmación visual antes de eliminar
   - Actualización automática de listado

5. **Filtros Avanzados**
   - Filtrar por Config ID
   - Filtrar por Status ID
   - Botón para limpiar filtros

6. **Estados Visuales**
   - Loading spinner durante operaciones
   - Mensajes de error con icono
   - Mensajes de éxito con auto-cierre
   - Estados disabled en formulario/botones

**Diseño:**
- Tema claro/oscuro compatible
- Tailwind CSS con valores de proyecto
- Iconos de Lucide React
- Responsive design (mobile/tablet/desktop)
- Bordes, sombras y espaciado consistentes

### 4. Página de App (`src/app/(admin)/config-status-mapping/page.tsx`)

Página Next.js 15+ que integra el componente:
- Metadata para SEO
- Layout (admin)
- Client component (`'use client'`)

## Flujo de Datos

```
UI Component (ConfigStatusMappingPage)
        ↓
Service Layer (configStatusMappingService)
        ↓
HTTP Client (axios via config/api.ts)
        ↓
Backend API (NestJS Controller)
```

## Ejemplo de Uso

```typescript
import { configStatusMappingService } from '@/services/config-status-mapping.service';

// Obtener todos los mappings
const response = await configStatusMappingService.findAll(1, 10);
console.log(response.data); // ConfigStatusMappingResponseDto[]

// Crear mapping
const newMapping = await configStatusMappingService.create({
  configId: 1,
  statusId: 5,
  displayOrder: 1,
  isActive: true,
});

// Actualizar mapping
await configStatusMappingService.update(1, {
  displayOrder: 2,
  isActive: false,
});

// Eliminar mapping
await configStatusMappingService.delete(1);

// Filtrar por Config ID
const configMappings = await configStatusMappingService.findByConfigId(1, 1, 10);

// Filtrar por Status ID
const statusMappings = await configStatusMappingService.findByStatusId(5, 1, 10);
```

## Validaciones en Frontend

1. **Campos Requeridos:**
   - Config ID (> 0)
   - Status ID (> 0)
   - Display Order (>= 0)

2. **Confirmaciones:**
   - Eliminación requiere confirmación
   - Cambios se aplican inmediatamente

3. **Feedback Usuario:**
   - Mensajes de error detallados
   - Spinner de carga durante operaciones
   - Mensajes de éxito con auto-dismiss (3s)

## Permisos Requeridos

Según el controlador NestJS, se requieren estos permisos:
- `config_status_mapping.read` - Para listar y obtener
- `config_status_mapping.create` - Para crear
- `config_status_mapping.update` - Para actualizar
- `config_status_mapping.delete` - Para eliminar

Los permisos se validan en el backend (decorador `@Permissions`)

## Ruta de Acceso

```
http://localhost:3000/config-status-mapping
```

O através del menú de navegación si está integrado.

## Status de Implementación

✅ Servicio CRUD completo
✅ Tipos TypeScript
✅ Componente principal con UI
✅ Página integrada
✅ Paginación
✅ Filtros
✅ Formulario create/edit
✅ Eliminación con confirmación
✅ Manejo de errores
✅ Feedback visual

## Próximos Pasos (Opcional)

1. Agregar navegación al menú principal
2. Agregar validación de permisos en el frontend
3. Crear sub-componentes (ConfigStatusMappingForm, ConfigStatusMappingTable)
4. Agregar ordenamiento de columnas
5. Agregar búsqueda global
6. Agregar export a CSV/Excel
7. Agregar bulk operations

## Notas Importantes

- El servicio usa axios con configuración de autenticación automática
- Los errores HTTP se manejan con try/catch
- La paginación es manejada por el usuario (click en botones)
- Los filtros se aplican inmediatamente al cambiar valores
- El componente es `'use client'` (React Hook Form compatible)
- Compatible con dark mode automáticamente
