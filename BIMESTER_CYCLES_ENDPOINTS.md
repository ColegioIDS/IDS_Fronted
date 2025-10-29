# 🎯 Guía de Endpoints de Ciclos Escolares para Usuarios con Permisos de Bimester

## 📋 Problema Resuelto

**Problema:** Un usuario con permisos de `bimester` (crear, editar, eliminar bimestres) necesita acceder a información de ciclos escolares para trabajar, pero no tiene permisos de `school-cycle`.

**Solución:** Hemos creado endpoints especiales en el módulo de bimesters que permiten acceder a información de ciclos escolares usando permisos de `bimester`.

---

## 🆕 Nuevos Endpoints (Base: `/api/bimesters/cycles`)

### 1️⃣ **Obtener Ciclo Activo**

```http
GET /api/bimesters/cycles/active
```

**Permiso requerido:** `bimester.read`

**Descripción:** Obtiene el ciclo escolar activo actual del sistema.

**Caso de uso:** Cuando necesitas el `cycleId` para crear o listar bimestres.

**Response 200:**
```json
{
  "id": 1,
  "name": "Ciclo Escolar 2025",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-10-31T23:59:59.000Z",
  "isActive": true,
  "isArchived": false
}
```

**Ejemplo Frontend:**
```typescript
async function getActiveCycleId() {
  const response = await fetch('/api/bimesters/cycles/active', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const cycle = await response.json();
  return cycle.id; // Usar este ID para trabajar con bimestres
}
```

---

### 2️⃣ **Obtener Ciclos Disponibles (No Archivados)** ⭐

```http
GET /api/bimesters/cycles/available
```

**Permiso requerido:** `bimester.read`

**Descripción:** Obtiene SOLO los ciclos escolares NO archivados (disponibles para trabajar).

**¿Por qué este endpoint?**
- ✅ Solo devuelve ciclos en los que PUEDES crear/editar bimestres
- ✅ Perfecto para mostrar en dropdowns/selectores
- ✅ No muestra ciclos históricos archivados

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Ciclo Escolar 2025",
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-10-31T23:59:59.000Z",
      "isActive": true,
      "isArchived": false
    },
    {
      "id": 2,
      "name": "Ciclo Escolar 2026",
      "startDate": "2026-01-15T00:00:00.000Z",
      "endDate": "2026-10-31T23:59:59.000Z",
      "isActive": false,
      "isArchived": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 100,
    "total": 2,
    "totalPages": 1
  }
}
```

**Ejemplo Frontend (Dropdown de ciclos):**
```typescript
async function loadCycleSelector() {
  const response = await fetch('/api/bimesters/cycles/available', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  const result = await response.json();
  
  // Mostrar en un select
  const select = document.getElementById('cycle-select');
  result.data.forEach(cycle => {
    const option = document.createElement('option');
    option.value = cycle.id;
    option.textContent = `${cycle.name} ${cycle.isActive ? '(Activo)' : ''}`;
    select.appendChild(option);
  });
}
```

---

### 3️⃣ **Obtener un Ciclo Específico**

```http
GET /api/bimesters/cycles/:id
```

**Permiso requerido:** `bimester.read`

**Descripción:** Obtiene los detalles de un ciclo específico incluyendo sus bimestres.

**Response 200:**
```json
{
  "id": 1,
  "name": "Ciclo Escolar 2025",
  "startDate": "2025-01-15T00:00:00.000Z",
  "endDate": "2025-10-31T23:59:59.000Z",
  "isActive": true,
  "isArchived": false,
  "bimesters": [
    {
      "id": 1,
      "number": 1,
      "name": "Primer Bimestre",
      "startDate": "2025-01-15T00:00:00.000Z",
      "endDate": "2025-03-31T23:59:59.000Z",
      "isActive": true,
      "weeksCount": 8
    }
  ],
  "_count": {
    "bimesters": 4,
    "grades": 12,
    "enrollments": 350
  }
}
```

**Ejemplo Frontend:**
```typescript
async function getCycleDetails(cycleId: number) {
  const response = await fetch(`/api/bimesters/cycles/${cycleId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}
```

---

## 📊 Comparación: Endpoints Originales vs Nuevos

### **Para Usuario A (tiene permisos de `school-cycle`)**

| Acción | Endpoint Original | Nuevo Endpoint | ¿Cuál usar? |
|--------|------------------|----------------|-------------|
| Ver ciclo activo | `GET /school-cycles/active` ✅ | `GET /bimesters/cycles/active` ✅ | Cualquiera |
| Ver ciclos disponibles | `GET /school-cycles?isArchived=false` ✅ | `GET /bimesters/cycles/available` ✅ | Cualquiera |
| Ver ciclo específico | `GET /school-cycles/:id` ✅ | `GET /bimesters/cycles/:id` ✅ | Cualquiera |

### **Para Usuario B (solo tiene permisos de `bimester`)**

| Acción | Endpoint Original | Nuevo Endpoint | ¿Cuál usar? |
|--------|------------------|----------------|-------------|
| Ver ciclo activo | `GET /school-cycles/active` ❌ 403 | `GET /bimesters/cycles/active` ✅ | **Nuevo** |
| Ver ciclos disponibles | `GET /school-cycles?isArchived=false` ❌ 403 | `GET /bimesters/cycles/available` ✅ | **Nuevo** |
| Ver ciclo específico | `GET /school-cycles/:id` ❌ 403 | `GET /bimesters/cycles/:id` ✅ | **Nuevo** |

---

## 🔄 Flujo Completo: Crear Bimestre (Usuario B)

```typescript
// 1. Obtener el ciclo activo (o mostrar selector de ciclos disponibles)
const cycleResponse = await fetch('/api/bimesters/cycles/active', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const cycle = await cycleResponse.json();
const cycleId = cycle.id;

// 2. Validar fechas del ciclo para el formulario
console.log(`Ciclo: ${cycle.name}`);
console.log(`Rango: ${cycle.startDate} - ${cycle.endDate}`);

// 3. Crear el bimestre en ese ciclo
const bimesterData = {
  number: 1,
  name: "Primer Bimestre",
  startDate: "2025-01-15T00:00:00-06:00",
  endDate: "2025-03-31T23:59:59-06:00",
  isActive: true,
  weeksCount: 8
};

const createResponse = await fetch(`/api/school-cycles/${cycleId}/bimesters`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(bimesterData)
});

const newBimester = await createResponse.json();
console.log('✅ Bimestre creado:', newBimester);
```

---

## 🛡️ Reglas de Seguridad

### **¿Qué puede hacer el Usuario B?**

✅ **PUEDE:**
- Ver el ciclo activo
- Ver lista de ciclos NO archivados
- Ver detalles de un ciclo específico
- Crear bimestres en ciclos NO archivados
- Editar bimestres existentes
- Activar/Desactivar bimestres
- Eliminar bimestres (si no tienen datos relacionados)

❌ **NO PUEDE:**
- Crear ciclos escolares
- Editar ciclos escolares
- Activar ciclos escolares
- Archivar ciclos escolares
- Eliminar ciclos escolares
- Ver estadísticas administrativas de ciclos

---

## 🎨 Ejemplo: Componente React Completo

```tsx
import { useState, useEffect } from 'react';

interface Cycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isArchived: boolean;
}

export function BimesterForm() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar ciclos disponibles al montar
  useEffect(() => {
    loadAvailableCycles();
  }, []);

  async function loadAvailableCycles() {
    try {
      const response = await fetch('/api/bimesters/cycles/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error cargando ciclos');

      const result = await response.json();
      setCycles(result.data);

      // Seleccionar el ciclo activo por defecto
      const activeCycle = result.data.find((c: Cycle) => c.isActive);
      if (activeCycle) {
        setSelectedCycleId(activeCycle.id);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudieron cargar los ciclos escolares');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedCycleId) {
      alert('Selecciona un ciclo escolar');
      return;
    }

    // Tu lógica para crear el bimestre...
    const bimesterData = {
      number: 1,
      name: "Primer Bimestre",
      // ... más campos
    };

    try {
      const response = await fetch(`/api/school-cycles/${selectedCycleId}/bimesters`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bimesterData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert('✅ Bimestre creado exitosamente');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  }

  if (loading) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Ciclo Escolar:
        <select
          value={selectedCycleId || ''}
          onChange={(e) => setSelectedCycleId(Number(e.target.value))}
          required
        >
          <option value="">Selecciona un ciclo</option>
          {cycles.map(cycle => (
            <option key={cycle.id} value={cycle.id}>
              {cycle.name} {cycle.isActive && '(Activo)'}
            </option>
          ))}
        </select>
      </label>

      {/* Resto del formulario... */}
      
      <button type="submit">Crear Bimestre</button>
    </form>
  );
}
```

---

## ✅ Resumen

### **Nuevos Endpoints creados:**
1. `GET /api/bimesters/cycles/active` - Ciclo activo
2. `GET /api/bimesters/cycles/available` - Ciclos NO archivados
3. `GET /api/bimesters/cycles/:id` - Ciclo específico

### **Ventajas:**
- ✅ Usuario B puede trabajar con bimestres sin permisos de `school-cycle`
- ✅ No alteramos los endpoints originales
- ✅ Endpoints específicos según reglas de negocio
- ✅ Separación clara de responsabilidades

### **Reglas aplicadas:**
- Solo muestra ciclos NO archivados en `/available`
- Respeta permisos de `bimester`
- No permite modificar ciclos escolares
- Solo lectura de información de ciclos

---

## 🚀 ¡Listo para usar!

Ahora el Usuario B con permisos de `bimester` puede trabajar completamente con bimestres sin necesitar permisos de `school-cycle`. 🎉
