# 🎯 Grade-Cycles: Arquitectura de Independencia Total

## 🔐 Principio Fundamental

El módulo **grade-cycles** está diseñado para ser **completamente independiente** de otros módulos del sistema. No requiere permisos ni acceso directo a:
- ❌ Módulo `grades`
- ❌ Módulo `cycles`
- ❌ Hooks de otros módulos
- ❌ Servicios de otros módulos
- ❌ Context providers externos

## 🔧 Endpoints Helper: La Solución

El backend proporciona **4 endpoints helper** que encapsulan toda la lógica necesaria:

### 1. `GET /grade-cycles/helpers/available-grades`
```typescript
// Retorna todos los grados activos del sistema
// Requiere SOLO: grade-cycle:read
```

### 2. `GET /grade-cycles/helpers/available-cycles`
```typescript
// Retorna todos los ciclos activos del sistema
// Requiere SOLO: grade-cycle:read
```

### 3. `GET /grade-cycles/helpers/available-grades-for-cycle/:cycleId`
```typescript
// Retorna grados que AÚN NO están asociados a un ciclo
// Útil para evitar duplicados
// Requiere SOLO: grade-cycle:read
```

### 4. `GET /grade-cycles/helpers/available-cycles-for-grade/:gradeId`
```typescript
// Retorna ciclos que AÚN NO están asociados a un grado
// Útil para evitar duplicados
// Requiere SOLO: grade-cycle:read
```

## 📊 Flujo de Datos

```
┌─────────────────────────────────────────────────────┐
│          WIZARD (GradeCycleWizard.tsx)              │
│  - NO usa hooks externos                            │
│  - Solo gradeCyclesService                          │
└─────────────────┬───────────────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    ┌────▼─────┐    ┌─────▼──────┐    ┌────────────┐
    │  Step 1  │    │   Step 2   │    │   Step 3   │
    │  Cycles  │───▶│   Grades   │───▶│  Confirm   │
    └────┬─────┘    └─────┬──────┘    └──────┬─────┘
         │                │                   │
    ┌────▼─────┐    ┌─────▼──────┐    ┌──────▼─────┐
    │ Helper 2 │    │  Helper 3  │    │ bulkCreate │
    │ getCycles│    │ getGrades  │    │    POST    │
    └──────────┘    │  ForCycle  │    └────────────┘
                    └────────────┘
```

### Paso a Paso:

1. **Step1SelectCycle.tsx**:
   - `useEffect` → llama a `gradeCyclesService.getAvailableCycles()`
   - Muestra lista de ciclos
   - Usuario selecciona uno
   - Click "Siguiente" → avanza a Step 2

2. **Step2SelectGrades.tsx**:
   - `useEffect` → llama a `gradeCyclesService.getAvailableGradesForCycle(cycleId)`
   - Muestra checkboxes de grados disponibles
   - Usuario selecciona múltiples
   - Click "Siguiente" → avanza a Step 3

3. **Step3Confirm.tsx**:
   - Muestra resumen de selección
   - Click "Guardar" → llama a `gradeCyclesService.bulkCreate({ cycleId, gradeIds })`

## 🏗️ Arquitectura de Componentes

```typescript
// ❌ NO HACER (dependencias externas):
import { useCycles } from '@/hooks/data/useCycles';
import { useGrades } from '@/hooks/data/useGrades';
import { cyclesService } from '@/services/cycles.service';

// ✅ SÍ HACER (solo grade-cycles):
import { gradeCyclesService } from '@/services/grade-cycles.service';

// Cada componente carga sus datos:
useEffect(() => {
  const loadData = async () => {
    const data = await gradeCyclesService.getAvailableCycles();
    setData(data);
  };
  loadData();
}, []);
```

## 🎨 Ventajas de Esta Arquitectura

### 1. **Independencia de Permisos**
Un usuario con **SOLO** `grade-cycle:read` puede:
- ✅ Ver todos los ciclos activos
- ✅ Ver todos los grados activos
- ✅ Configurar relaciones

**No necesita**:
- ❌ `cycles:read`
- ❌ `grades:read`

### 2. **Simplicidad**
- Cada componente se encarga de sus propios datos
- No hay props drilling excesivo
- Loading states locales

### 3. **Mantenibilidad**
- Cambios en `grades` o `cycles` no afectan este módulo
- Endpoints helper actúan como capa de abstracción
- Tests más simples (mock solo gradeCyclesService)

### 4. **Performance**
- Carga datos solo cuando son necesarios
- Step 1 no carga grados innecesariamente
- Step 2 carga solo grados del ciclo seleccionado

## 📝 Código de Ejemplo

### Step1SelectCycle.tsx
```typescript
export function Step1SelectCycle({ selectedCycle, onSelect, onNext }) {
  const [cycles, setCycles] = useState<AvailableCycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCycles = async () => {
      try {
        setIsLoading(true);
        // 🔧 Helper de grade-cycles (no usa cyclesService)
        const data = await gradeCyclesService.getAvailableCycles();
        setCycles(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCycles();
  }, []);

  // Render...
}
```

### Step2SelectGrades.tsx
```typescript
export function Step2SelectGrades({ cycle, selectedGrades, onSelect }) {
  const [grades, setGrades] = useState<AvailableGrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGrades = async () => {
      try {
        setIsLoading(true);
        // 🔧 Helper de grade-cycles (no usa gradesService)
        const data = await gradeCyclesService.getAvailableGradesForCycle(cycle.id);
        setGrades(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGrades();
  }, [cycle.id]);

  // Render...
}
```

### GradeCycleWizard.tsx
```typescript
export function GradeCycleWizard({ onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedGradeIds, setSelectedGradeIds] = useState([]);

  // ❌ NO usa:
  // const { cycles } = useGradeCycleHelpers();
  // const { grades } = useGrades();

  const handleConfirm = async () => {
    // ✅ Llama directamente al servicio
    await gradeCyclesService.bulkCreate({
      cycleId: selectedCycle.id,
      gradeIds: selectedGradeIds,
    });
    onSuccess?.();
  };

  // Render steps...
}
```

## 🔍 Verificación de Independencia

### ✅ Checklist:
- [ ] No hay `import` de hooks externos (useCycles, useGrades)
- [ ] No hay `import` de servicios externos (cyclesService, gradesService)
- [ ] Solo usa `gradeCyclesService`
- [ ] Cada componente maneja su propio loading state
- [ ] No recibe datos por props desde hooks externos

### 🚫 Red Flags (no deben existir):
```typescript
// ❌ Estos imports indican dependencias externas:
import { useCycles } from '@/hooks/data/useCycles';
import { useGrades } from '@/hooks/data/useGrades';
import { cyclesService } from '@/services/cycles.service';
import { gradesService } from '@/services/grades.service';
import { CyclesContext } from '@/context/cycles';
```

## 🎯 Resultado Final

Un módulo **totalmente autónomo** que:
1. ✅ Funciona con **un solo permiso**: `grade-cycle:read`
2. ✅ No depende de otros módulos del frontend
3. ✅ No requiere permisos de grades o cycles
4. ✅ Mantiene su propia lógica de estado
5. ✅ Es fácil de probar y mantener

---

**Fecha**: Noviembre 1, 2025  
**Arquitecto**: Sistema de Helpers Encapsulados  
**Principio**: Maximum Decoupling, Minimum Permissions
