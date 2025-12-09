# ERICA Colors Management

## Estructura de Componentes

La página de Paleta de Colores ha sido refactorizada en componentes reutilizables y escalables.

### 📁 Componentes

#### `EricaColorsHeader.tsx`
Encabezado de la página con título, descripción y botón de recargar.

**Props:**
- `onRefresh: () => Promise<void>` - Callback para refrescar colores
- `isLoading?: boolean` - Indicador de carga

**Responsabilidades:**
- Mostrar título y descripción
- Manejar lógica del botón de recargar

#### `DimensionsTable.tsx`
Tabla de dimensiones ERICA (E, R, I, C, A).

**Props:**
- `dimensions: EricaDimensionColor[]` - Array de dimensiones
- `onEditClick: (dimension, color) => void` - Callback al hacer click en editar
- `copiedColor?: string | null` - Color copiado al portapapeles

**Features:**
- Mostrar nombre y descripción
- Swatch de color
- Valor hex con botón de copiar
- Botón de editar

#### `StatesTable.tsx`
Tabla de estados de desempeño (E, B, P, C, N).

**Props:**
- `states: EricaStateColor[]` - Array de estados
- `onEditClick: (state, color) => void` - Callback al hacer click en editar
- `copiedColor?: string | null` - Color copiado al portapapeles

**Features:**
- Mostrar nombre, descripción y puntos
- Swatch de color
- Valor hex con botón de copiar
- Botón de editar

#### `ColorPreview.tsx`
Sección de vista previa con grid de colores.

**Props:**
- `dimensions: EricaDimensionColor[]` - Dimensiones a mostrar
- `states: EricaStateColor[]` - Estados a mostrar

**Features:**
- Mostrar 2 columnas (Dimensiones y Estados)
- Swatches de 16x16px con códigos
- Color de texto automático (blanco/negro) basado en luminancia
- Nombres y puntos debajo

#### `ColorEditDialogs.tsx`
Componente que maneja ambos diálogos de edición (Color Picker y Confirmación).

**Props:**
- `editingDimension: EricaDimension | null` - Dimensión siendo editada
- `editingState: EricaState | null` - Estado siendo editado
- `newColor: string` - Color seleccionado
- `showConfirm: boolean` - Mostrar confirmación
- `updating: boolean` - Estado de actualización
- `confirmType: 'dimension' | 'state'` - Tipo siendo editado
- Callbacks para actualizar estados

**Features:**
- Diálogo de color picker
- Diálogo de confirmación
- Flujo de dos pasos: Seleccionar → Confirmar → Actualizar

### 🔄 Flujo de Actualización

1. Usuario hace click en "Editar" en tabla
   - `handleEditDimensionClick()` o `handleEditStateClick()`
2. Se abre Color Picker Dialog
3. Usuario selecciona color y hace click en "Siguiente"
   - Abre ConfirmDialog
4. Usuario hace click en "Actualizar"
   - `handleConfirmUpdate()` ejecuta la actualización
   - Cierra ambos diálogos
   - Muestra toast de éxito

### 📊 Estructura del Estado (page.tsx)

```typescript
// Dialog states
editingDimension: EricaDimension | null
editingState: EricaState | null
newColor: string
updating: boolean
showConfirm: boolean
confirmType: 'dimension' | 'state'
copiedColor: string | null
activeTab: 'dimensions' | 'states'
```

### 🎯 Beneficios de la Refactorización

✅ **Separación de responsabilidades**: Cada componente tiene una función clara
✅ **Reutilizable**: Los componentes pueden usarse en otras páginas
✅ **Escalable**: Fácil agregar nuevas funcionalidades
✅ **Mantenible**: Código más limpio y organizado
✅ **Testeable**: Componentes más pequeños son más fáciles de testear

### 🔗 Imports

```typescript
import {
  EricaColorsHeader,
  DimensionsTable,
  StatesTable,
  ColorPreview,
  ColorEditDialogs,
} from '@/components/features/erica-colors';
```

Todos se exportan desde `index.ts` para un import limpio.
