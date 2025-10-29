# 📁 Índice de Archivos - Integración Bimester/Cycles

## 🗂️ Estructura de Archivos Creados

```
IDS_Fronted/
│
├── 📖 Documentación (en raíz)
│   ├── README_BIMESTER_INTEGRATION.md ⭐ (Resumen ejecutivo)
│   ├── QUICK_START_BIMESTER_CYCLES.md 🚀 (Guía rápida)
│   ├── INTEGRATION_BIMESTER_CYCLES.md 🔧 (Doc completa)
│   ├── BIMESTER_CYCLES_ENDPOINTS.md 📝 (Spec endpoints)
│   └── INDEX_BIMESTER_FILES.md 📁 (Este archivo)
│
├── src/
│   │
│   ├── types/
│   │   └── bimester.types.ts ✅ (Tipos TypeScript)
│   │
│   ├── services/
│   │   └── bimester.service.ts ✅ (Lógica de API)
│   │
│   ├── hooks/
│   │   └── data/
│   │       ├── useBimesters.ts ✅ (Hook bimestres)
│   │       └── useBimesterCycles.ts ✅ (Hook ciclos)
│   │
│   ├── utils/
│   │   └── handleApiError.ts ✅ (Manejo errores)
│   │
│   └── components/
│       │
│       ├── shared/
│       │   ├── selectors/
│       │   │   ├── CycleSelector.tsx ✅ (Dropdown ciclos)
│       │   │   └── index.ts (Barrel export)
│       │   │
│       │   └── info/
│       │       ├── CycleInfo.tsx ✅ (Card info ciclo)
│       │       └── index.ts (Barrel export)
│       │
│       └── features/
│           └── bimesters/
│               ├── BimesterFormExample.tsx ✅ (Form completo)
│               └── index.ts (Barrel export)
│
└── README.md (Actualizado con nueva sección)
```

---

## 📚 Archivos por Categoría

### 🎯 Documentación (EMPEZAR AQUÍ)

| Archivo | Descripción | Usar cuando... |
|---------|-------------|----------------|
| `README_BIMESTER_INTEGRATION.md` | 📖 Resumen ejecutivo | Quieres un overview general |
| `QUICK_START_BIMESTER_CYCLES.md` | 🚀 Guía rápida | Necesitas copiar código rápido |
| `INTEGRATION_BIMESTER_CYCLES.md` | 🔧 Doc completa | Necesitas entender a fondo |
| `BIMESTER_CYCLES_ENDPOINTS.md` | 📝 Spec endpoints | Necesitas ver los endpoints del backend |

---

### 🧩 Código Fuente

#### 1️⃣ Types
| Archivo | Ubicación | Qué contiene |
|---------|-----------|--------------|
| `bimester.types.ts` | `src/types/` | - Tipos de Bimester<br>- Tipos de SchoolCycleForBimester<br>- DTOs<br>- Responses<br>- Stats |

#### 2️⃣ Services
| Archivo | Ubicación | Qué contiene |
|---------|-----------|--------------|
| `bimester.service.ts` | `src/services/` | - CRUD de bimestres<br>- `getActiveCycle()`<br>- `getAvailableCycles()`<br>- `getCycleById()`<br>- `validateBimesterDates()` |

#### 3️⃣ Hooks
| Archivo | Ubicación | Qué hace |
|---------|-----------|----------|
| `useBimesters.ts` | `src/hooks/data/` | Gestiona lista de bimestres con paginación |
| `useBimesterCycles.ts` | `src/hooks/data/` | Gestiona ciclos desde permisos de bimester |

#### 4️⃣ Componentes
| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `CycleSelector.tsx` | `src/components/shared/selectors/` | Dropdown de ciclos con auto-selección |
| `CycleInfo.tsx` | `src/components/shared/info/` | Card informativa del ciclo |
| `BimesterFormExample.tsx` | `src/components/features/bimesters/` | Formulario completo (TEMPLATE) |

#### 5️⃣ Utilities
| Archivo | Ubicación | Qué hace |
|---------|-----------|----------|
| `handleApiError.ts` | `src/utils/` | Manejo centralizado de errores con toasts |

---

## 🔗 Dependencias entre Archivos

```
bimester.types.ts
    ↓
bimester.service.ts
    ↓
useBimesterCycles.ts
    ↓
CycleSelector.tsx ←→ CycleInfo.tsx
    ↓
BimesterFormExample.tsx
```

---

## 📖 Rutas de Lectura Recomendadas

### 🎓 Ruta 1: Quiero entender todo
1. `README_BIMESTER_INTEGRATION.md` (5 min)
2. `INTEGRATION_BIMESTER_CYCLES.md` (15 min)
3. Ver código en orden: types → service → hooks → components

### 🚀 Ruta 2: Solo necesito usar
1. `QUICK_START_BIMESTER_CYCLES.md` (3 min)
2. Copiar ejemplo que necesites
3. Listo!

### 🔧 Ruta 3: Necesito modificar/extender
1. `INTEGRATION_BIMESTER_CYCLES.md` (15 min)
2. Ver `BimesterFormExample.tsx` (template base)
3. Revisar `bimester.service.ts` (métodos disponibles)

---

## 📦 Imports Rápidos

### Copiar esto en tu archivo:

```tsx
// Types
import type {
  Bimester,
  SchoolCycleForBimester,
} from '@/types/bimester.types';

// Hooks
import { useBimesters } from '@/hooks/data/useBimesters';
import { useBimesterCycles } from '@/hooks/data/useBimesterCycles';

// Services
import { bimesterService } from '@/services/bimester.service';

// Components
import { CycleSelector } from '@/components/shared/selectors';
import { CycleInfo } from '@/components/shared/info';
import { BimesterFormExample } from '@/components/features/bimesters';

// Utils
import { handleApiError, handleApiSuccess } from '@/utils/handleApiError';
```

---

## 🎯 Casos de Uso → Archivo a Usar

| Quiero... | Usa este archivo... |
|-----------|---------------------|
| Ver el ciclo activo | `useBimesterCycles().activeCycle` |
| Mostrar dropdown de ciclos | `<CycleSelector />` |
| Mostrar info de un ciclo | `<CycleInfo />` |
| Formulario completo | `<BimesterFormExample />` |
| Crear bimestre programático | `bimesterService.create()` |
| Validar fechas | `bimesterService.validateBimesterDates()` |

---

## 🧪 Testing: Archivos a Verificar

### Checklist de Testing
```
☐ src/services/bimester.service.ts
    - Verificar que getActiveCycle() funciona
    - Verificar que getAvailableCycles() funciona
    - Verificar que create() funciona

☐ src/components/shared/selectors/CycleSelector.tsx
    - Verificar que carga ciclos
    - Verificar auto-selección
    - Verificar dark mode

☐ src/components/shared/info/CycleInfo.tsx
    - Verificar que muestra datos
    - Verificar loading state
    - Verificar error state

☐ src/components/features/bimesters/BimesterFormExample.tsx
    - Verificar formulario completo
    - Verificar validación
    - Verificar submit
```

---

## 🔧 Archivos a Modificar para Integración

Si vas a integrar en tu proyecto existente:

### 1. Reemplazar formulario existente
- **Archivo actual:** `src/components/bimester/BimesterDialog.tsx` (o similar)
- **Reemplazar con:** `src/components/features/bimesters/BimesterFormExample.tsx`

### 2. Agregar selector en filtros
- **Archivo actual:** Tu componente de filtros
- **Agregar:** `<CycleSelector />` en la sección de filtros

### 3. Actualizar página principal
- **Archivo actual:** `src/app/(admin)/bimesters/page.tsx`
- **Importar:** Nuevos componentes y hooks

---

## 📊 Estadísticas

```
📁 Archivos documentación:  4
📁 Archivos código:         11
📁 Total:                   15

⚡ Endpoints integrados:    3
🎨 Componentes nuevos:      3
🪝 Hooks nuevos:            2

✅ Coverage tests:          0% (pending)
📖 Documentación:           100%
🎯 Siguiendo master guide:  ✅
```

---

## 🚀 Próximos Pasos

1. **Leer** → `QUICK_START_BIMESTER_CYCLES.md`
2. **Probar** → `BimesterFormExample.tsx` en dev
3. **Integrar** → En tu página de bimestres
4. **Extender** → Crear tus propios componentes

---

## 📞 Referencias Cruzadas

- Para arquitectura general → `master_guide_general_v2.md`
- Para endpoints backend → `BIMESTER_CYCLES_ENDPOINTS.md`
- Para ejemplos de uso → `QUICK_START_BIMESTER_CYCLES.md`

---

**Última actualización:** 2025-01-29  
**Versión:** 1.0
