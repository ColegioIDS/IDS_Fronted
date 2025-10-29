# 🚀 Quick Start: Usar Ciclos en Bimestres

## 📦 ¿Qué se creó?

**3 formas de usar ciclos escolares desde permisos de bimester:**

1. **Hook directo** → `useBimesterCycles()`
2. **Componente Selector** → `<CycleSelector />`
3. **Componente Info** → `<CycleInfo />`

---

## 🎯 Caso 1: Solo necesito el ciclo activo

```tsx
import { useBimesterCycles } from '@/hooks/data/useBimesterCycles';

function MiComponente() {
  const { activeCycle, isLoading } = useBimesterCycles();

  if (isLoading) return <div>Cargando...</div>;

  return <div>Ciclo actual: {activeCycle?.name}</div>;
}
```

---

## 🎯 Caso 2: Necesito un dropdown de ciclos

```tsx
import { CycleSelector } from '@/components/shared/selectors/CycleSelector';

function MiFormulario() {
  const [cycleId, setCycleId] = useState<number | null>(null);

  return (
    <form>
      <CycleSelector
        value={cycleId}
        onValueChange={setCycleId}
        label="Selecciona un ciclo"
        required
      />
      {/* resto del formulario */}
    </form>
  );
}
```

**Props disponibles:**
- `value` - ID del ciclo seleccionado
- `onValueChange` - Callback al cambiar
- `label` - Etiqueta del selector
- `placeholder` - Texto placeholder
- `required` - Campo obligatorio
- `disabled` - Deshabilitar
- `showDateRange` - Mostrar fechas (default: true)

---

## 🎯 Caso 3: Necesito mostrar info detallada del ciclo

```tsx
import { CycleInfo } from '@/components/shared/info/CycleInfo';

function DetallesBimestre({ cycleId }: { cycleId: number }) {
  return (
    <CycleInfo
      cycleId={cycleId}
      showBimesters
      showStats
    />
  );
}
```

**Props disponibles:**
- `cycleId` - ID del ciclo a mostrar
- `showBimesters` - Mostrar lista de bimestres (default: true)
- `showStats` - Mostrar estadísticas (default: true)

---

## 🎯 Caso 4: Formulario completo de bimestre

```tsx
import { BimesterFormExample } from '@/components/features/bimesters';

function MiPagina() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <button onClick={() => setFormOpen(true)}>
        Crear Bimestre
      </button>

      <BimesterFormExample
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => {
          console.log('Bimestre creado!');
          // Refrescar lista, etc.
        }}
      />
    </>
  );
}
```

---

## 🎯 Caso 5: Validar fechas de bimestre contra ciclo

```tsx
import { bimesterService } from '@/services/bimester.service';

const validation = bimesterService.validateBimesterDates(
  '2025-01-15', // inicio bimestre
  '2025-03-31', // fin bimestre
  '2025-01-01', // inicio ciclo
  '2025-12-31'  // fin ciclo
);

if (!validation.valid) {
  console.error('Errores:', validation.errors);
}
```

---

## 🎯 Caso 6: Llamar directamente al service

```tsx
import { bimesterService } from '@/services/bimester.service';

// Obtener ciclo activo
const activeCycle = await bimesterService.getActiveCycle();

// Obtener ciclos disponibles (NO archivados)
const { data: cycles } = await bimesterService.getAvailableCycles();

// Obtener ciclo específico con bimestres
const cycle = await bimesterService.getCycleById(1);

// Crear bimestre
const newBimester = await bimesterService.create(cycleId, {
  number: 1,
  name: "Primer Bimestre",
  startDate: "2025-01-15T00:00:00.000Z",
  endDate: "2025-03-31T23:59:59.000Z",
  isActive: true,
  weeksCount: 8,
});
```

---

## 📁 Importaciones Rápidas

```tsx
// Hooks
import { useBimesters } from '@/hooks/data/useBimesters';
import { useBimesterCycles } from '@/hooks/data/useBimesterCycles';

// Services
import { bimesterService } from '@/services/bimester.service';

// Components
import { CycleSelector } from '@/components/shared/selectors/CycleSelector';
import { CycleInfo } from '@/components/shared/info/CycleInfo';
import { BimesterFormExample } from '@/components/features/bimesters';

// Types
import type {
  Bimester,
  SchoolCycleForBimester,
  CreateBimesterDto,
  UpdateBimesterDto,
} from '@/types/bimester.types';

// Utils
import { handleApiError, handleApiSuccess } from '@/utils/handleApiError';
```

---

## 🔐 Permisos Necesarios

Para que todo funcione, el usuario debe tener:

```
✅ bimester:read        → Ver ciclos y bimestres
✅ bimester:read-one    → Ver detalles
✅ bimester:create      → Crear bimestres
✅ bimester:update      → Editar bimestres
✅ bimester:delete      → Eliminar bimestres
```

**NO necesita:**
```
❌ school-cycle:read
❌ school-cycle:create
❌ school-cycle:update
```

---

## 🎨 Estilos y Dark Mode

Todos los componentes soportan dark mode automáticamente:

```tsx
// No necesitas hacer nada especial
<CycleSelector value={id} onValueChange={setId} />

// El componente ya tiene clases dark:
// - dark:bg-gray-900
// - dark:text-gray-100
// - dark:border-gray-700
// etc.
```

---

## 🐛 Troubleshooting

### Error: "No hay ciclos disponibles"

**Causa:** No hay ciclos NO archivados en el sistema.

**Solución:** Crear un ciclo escolar activo desde el módulo de School Cycles.

---

### Error: "403 Forbidden"

**Causa:** Usuario no tiene permisos de `bimester:read`.

**Solución:** Asignar permisos correctos al rol del usuario.

---

### Error: Fechas fuera de rango

**Causa:** Las fechas del bimestre están fuera del rango del ciclo.

**Solución:** Usar `bimesterService.validateBimesterDates()` antes de enviar.

---

## ✨ Tips Pro

1. **Auto-selección:** `CycleSelector` auto-selecciona el ciclo activo
2. **Validación:** Usa `validateBimesterDates()` antes de crear
3. **Loading:** Todos los componentes tienen loading states
4. **Errors:** Usan `handleApiError()` para toasts automáticos
5. **Responsive:** Funcionan en mobile, tablet y desktop

---

## 📖 Documentación Completa

Ver: `INTEGRATION_BIMESTER_CYCLES.md`

---

**¡Listo para usar!** 🚀
