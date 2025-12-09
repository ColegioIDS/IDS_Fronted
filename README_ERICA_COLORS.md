# ERICA Colors - Estructura del Módulo

## 📁 Estructura de Carpetas

```
erica-colors/
├── 📄 types/
│   └── erica-colors.types.ts       # Tipos e interfaces principales
├── 📄 services/
│   └── erica-colors.service.ts     # Llamadas a API
├── 📄 hooks/
│   └── useEricaColors.ts           # Hook principal con caché
├── 📄 schemas/
│   └── erica-colors.ts             # Validaciones Zod
├── 📄 constants/
│   └── erica-colors.permissions.ts # Permisos
├── 📄 context/
│   └── EricaColorsContext.tsx      # Context API para compartir colores
└── 📄 components/features/erica-colors/
    ├── DimensionLegend.tsx         # Leyenda de dimensiones
    ├── StateLegend.tsx             # Leyenda de estados
    ├── ColorPicker.tsx             # Selector de color
    ├── EricaColorSelector.tsx      # Selector en formularios
    └── index.ts                    # Exports
```

## 🔧 Componentes Creados

### 1. **erica-colors.types.ts**
Define todas las interfaces y tipos:
- `EricaColor` - Estructura base de color
- `EricaDimensionColor` - Color de dimensión (E, R, I, C, A)
- `EricaStateColor` - Color de estado (E, B, P, C, N)
- `EricaColorsResponse` - Respuesta de API combinada
- Constantes: `ERICA_DIMENSIONS`, `ERICA_STATES`, `STATE_LABELS`

### 2. **erica-colors.service.ts**
Servicios de API:
- `getEricaDimensionColors()` - Obtener colores de dimensiones
- `getEricaStateColors()` - Obtener colores de estados
- `getEricaColors()` - Obtener todos (recomendado)
- `updateDimensionColor()` - Actualizar color de dimensión
- `updateStateColor()` - Actualizar color de estado
- Utilidades: `hexToRgb()`, `rgbToHex()`, `isValidHexColor()`

### 3. **useEricaColors.ts**
Hook principal con:
- Caché automático en localStorage (24 horas)
- Métodos para obtener colores:
  - `getDimensionColor(dimension)` → hex string
  - `getStateColor(state)` → hex string
  - `getStateLabel(state)` → etiqueta en español
- Métodos para actualizar colores
- `fetchColors(forceRefresh?)` - Recargar desde API
- `clearCache()` - Limpiar caché

### 4. **Componentes**

#### DimensionLegend.tsx
```tsx
<DimensionLegend />  // Versión completa
<DimensionLegend compact showLabels={false} />  // Versión compacta
```

#### StateLegend.tsx
```tsx
<StateLegend />  // Versión completa
<StateLegend compact showLabels={false} />  // Versión compacta
```

#### ColorPicker.tsx
```tsx
<ColorPicker type="dimension" dimension="EJECUTA" />
<ColorPicker type="state" state="E" />
```

#### EricaColorSelector.tsx
```tsx
<EricaColorSelector type="dimension" onChange={handleChange} />
<EricaColorSelector type="state" placeholder="Selecciona estado" />
```

### 5. **EricaColorsContext.tsx**
Context para acceso global:
```tsx
// En app.tsx
<EricaColorsProvider>
  <App />
</EricaColorsProvider>

// En componentes
const { getDimensionColor, getStateColor } = useEricaColorsContext();
```

## 📋 Tipos de Datos

### Dimensiones ERICA
```typescript
type EricaDimension = 'EJECUTA' | 'RETIENE' | 'INTERPRETA' | 'CONOCE' | 'AMPLIA';
```

| Dimensión  | Hex     | RGB        | Descripción |
|-----------|---------|------------|------------|
| EJECUTA   | #FF6B6B | 255,107,107| Rojo coral (acción) |
| RETIENE   | #4ECDC4 | 78,205,196 | Turquesa (retención) |
| INTERPRETA| #45B7D1 | 69,183,209 | Azul claro (análisis) |
| CONOCE    | #96CEB4 | 150,206,180| Verde menta (saber) |
| AMPLIA    | #FFEAA7 | 255,234,167| Amarillo claro (expansión) |

### Estados de Desempeño
```typescript
type EricaState = 'E' | 'B' | 'P' | 'C' | 'N';
```

| Estado | Hex     | RGB        | Label | Rango |
|--------|---------|------------|-------|-------|
| E      | #4CAF50 | 76,175,80  | Excelente | 0.875-1.0 |
| B      | #FFC107 | 255,193,7  | Bueno | 0.625-0.874 |
| P      | #2196F3 | 33,150,243 | Proficiente | 0.375-0.624 |
| C      | #FF9800 | 255,152,0  | En Construcción | 0.125-0.374 |
| N      | #F44336 | 244,67,54  | No Logrado | 0.0-0.124 |

## 🚀 Uso en Componentes

### Ejemplo Básico
```tsx
import { useEricaColors } from '@/hooks/useEricaColors';

export const MyComponent = () => {
  const { getDimensionColor, getStateColor } = useEricaColors();

  return (
    <div style={{ backgroundColor: getDimensionColor('EJECUTA') }}>
      Fondo con color de EJECUTA
    </div>
  );
};
```

### Con Context
```tsx
import { useEricaColorsContext } from '@/context/EricaColorsContext';

export const MyComponent = () => {
  const { colors, getDimensionColor } = useEricaColorsContext();

  return (
    <div>
      {colors?.dimensions.map(dim => (
        <div key={dim.id} style={{ backgroundColor: dim.colorHex }}>
          {dim.dimension}
        </div>
      ))}
    </div>
  );
};
```

### Tabla ERICA
```tsx
import { useEricaColors } from '@/hooks/useEricaColors';
import { DimensionLegend, StateLegend } from '@/components/features/erica-colors';

export const EricaTable = () => {
  const { getDimensionColor, getStateColor } = useEricaColors();

  return (
    <div>
      <DimensionLegend compact />
      <StateLegend compact />
      
      <table>
        <thead>
          <tr>
            {['EJECUTA', 'RETIENE', 'INTERPRETA', 'CONOCE', 'AMPLIA'].map(dim => (
              <th 
                key={dim}
                style={{ backgroundColor: getDimensionColor(dim as any) }}
              >
                {dim}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Filas con colores de estado */}
        </tbody>
      </table>
    </div>
  );
};
```

## 🔄 Flujo de Carga

1. **Inicialización**
   - Hook detecta localStorage
   - Si está vacío o expirado (>24h), obtiene del servidor
   - Guarda en localStorage

2. **Acceso**
   - Componentes usan hook o context
   - Métodos retornan colores del caché local
   - Muy rápido, sin latencia

3. **Actualización**
   - Admin cambio color vía API (PUT)
   - Hook actualiza estado local y localStorage
   - Componentes re-renderizan automáticamente

## 🛡️ Validaciones

### Formato Hexadecimal
```typescript
// Válido
#FF6B6B
#ff6b6b
#123ABC

// Inválido
FF6B6B (sin #)
#FF6B (muy corto)
#GGGGGG (carácter inválido)
```

## 📝 Ejemplos de Uso

### Obtener Color de Dimensión
```tsx
const color = getDimensionColor('EJECUTA');
// Retorna: "#FF6B6B"
```

### Obtener Color de Estado
```tsx
const color = getStateColor('E');
// Retorna: "#4CAF50"

const label = getStateLabel('E');
// Retorna: "Excelente"
```

### Actualizar Color
```tsx
try {
  await updateDimensionColor('EJECUTA', '#FF0000');
  toast.success('Color actualizado');
} catch (error) {
  toast.error(error.message);
}
```

### Renderizar Evaluación
```tsx
<div
  style={{
    backgroundColor: getStateColor(evaluation.state),
    borderLeft: `4px solid ${getDimensionColor(evaluation.dimension)}`
  }}
>
  {evaluation.state} - {getStateLabel(evaluation.state)}
</div>
```

## 🎨 Notas de Diseño

- **Caché Frontend**: 24 horas para reducir llamadas API
- **Fallback**: Colores por defecto si API falla
- **Reactividad**: Context API mantiene sincronización
- **Performance**: Métodos memoizados para evitar re-renders
- **Accesibilidad**: Se recomienda combinar colores con iconos o patrones

## 🔐 Permisos

```typescript
// Lectura
resource: 'erica'
action: 'read-colors'

// Gestión
resource: 'erica'
action: 'manage-colors'
```

## 📚 API Endpoints

```
GET    /api/erica-colors
GET    /api/erica-colors/dimensions
GET    /api/erica-colors/states
PUT    /api/erica-colors/dimensions/:dimension
PUT    /api/erica-colors/states/:state
```

