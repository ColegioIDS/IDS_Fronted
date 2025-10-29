# 🛠️ Troubleshooting & Comandos Útiles

## 🚀 Comandos Rápidos

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Limpiar caché y reiniciar
npm run dev -- --turbo

# Build de producción
npm run build

# Verificar TypeScript
npx tsc --noEmit

# Verificar linting
npm run lint
```

### Testing
```bash
# Probar endpoints (con curl)
curl -X GET http://localhost:5000/api/bimesters/cycles/active \
  -H "Authorization: Bearer YOUR_TOKEN"

# Probar con httpie (más amigable)
http GET http://localhost:5000/api/bimesters/cycles/available \
  Authorization:"Bearer YOUR_TOKEN"
```

---

## 🐛 Problemas Comunes y Soluciones

### 1. "No hay ciclos disponibles"

**Síntoma:**
```
CycleSelector muestra: "No hay ciclos disponibles"
```

**Causas posibles:**
1. ❌ No hay ciclos en la base de datos
2. ❌ Todos los ciclos están archivados (isArchived = true)
3. ❌ Error en el endpoint backend

**Solución:**
```typescript
// 1. Verificar en backend si hay ciclos
GET /api/school-cycles

// 2. Verificar si están archivados
GET /api/school-cycles?isArchived=false

// 3. Crear un ciclo activo desde módulo School Cycles
```

**Debug:**
```typescript
// En useBimesterCycles.ts, agregar console.log
const { cycles, error } = useBimesterCycles();

console.log('Cycles loaded:', cycles);
console.log('Error:', error);
```

---

### 2. "403 Forbidden" al acceder a ciclos

**Síntoma:**
```
Error: 403 Forbidden
No tienes permisos para acceder a este recurso
```

**Causas:**
- ❌ Usuario no tiene permiso `bimester:read`
- ❌ Token JWT expirado
- ❌ Token JWT inválido

**Solución:**
```typescript
// 1. Verificar permisos del usuario
// En backend o DB:
SELECT * FROM permissions WHERE userId = X;

// 2. Verificar que el rol tenga el permiso
SELECT * FROM role_permissions WHERE permissionName = 'bimester:read';

// 3. Asignar el permiso al rol
INSERT INTO role_permissions (roleId, permissionName) 
VALUES (roleId, 'bimester:read');
```

**Debug:**
```typescript
// Verificar token en localStorage
console.log('Token:', localStorage.getItem('token'));

// Decodificar token (en jwt.io)
// Copiar el token y pegarlo en https://jwt.io
```

---

### 3. "Module not found" o error de importación

**Síntoma:**
```
Error: Cannot find module '@/components/shared/selectors/CycleSelector'
Module not found: Can't resolve '@/hooks/data/useBimesterCycles'
```

**Causas:**
- ❌ Path alias no configurado
- ❌ Archivo no existe
- ❌ Typo en el path

**Solución:**
```typescript
// 1. Verificar tsconfig.json tiene paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// 2. Verificar que el archivo existe
// Debe estar en:
// src/components/shared/selectors/CycleSelector.tsx

// 3. Usar import correcto
import { CycleSelector } from '@/components/shared/selectors/CycleSelector';
// O con barrel export:
import { CycleSelector } from '@/components/shared/selectors';
```

**Debug:**
```bash
# Listar archivos
ls src/components/shared/selectors/

# Buscar archivos
find src -name "CycleSelector.tsx"
```

---

### 4. "Fechas fuera de rango" al crear bimestre

**Síntoma:**
```
Error: La fecha de inicio del bimestre no puede ser anterior al inicio del ciclo
```

**Causas:**
- ❌ Fechas del bimestre están fuera del rango del ciclo
- ❌ Formato de fecha incorrecto

**Solución:**
```typescript
// 1. Usar validación antes de crear
const validation = bimesterService.validateBimesterDates(
  bimesterStart,
  bimesterEnd,
  cycleStart,
  cycleEnd
);

if (!validation.valid) {
  console.error('Errores:', validation.errors);
  // Mostrar errores al usuario
}

// 2. Verificar formato de fechas
// Deben ser ISO 8601: "2025-01-15T00:00:00.000Z"

// 3. Convertir correctamente
const isoDate = new Date(dateString).toISOString();
```

**Debug:**
```typescript
// Verificar fechas del ciclo seleccionado
const { cycles } = useBimesterCycles();
const selectedCycle = cycles.find(c => c.id === cycleId);

console.log('Ciclo:', selectedCycle?.name);
console.log('Inicio:', selectedCycle?.startDate);
console.log('Fin:', selectedCycle?.endDate);

// Verificar fechas del bimestre
console.log('Bimestre inicio:', bimesterStart);
console.log('Bimester fin:', bimesterEnd);
```

---

### 5. CycleSelector no auto-selecciona ciclo activo

**Síntoma:**
```
El selector queda vacío aunque hay un ciclo activo
```

**Causas:**
- ❌ No hay ciclo con `isActive = true`
- ❌ El efecto de auto-selección no se ejecuta
- ❌ El componente está disabled

**Solución:**
```typescript
// 1. Verificar que hay un ciclo activo
const { activeCycle } = useBimesterCycles();
console.log('Active cycle:', activeCycle);

// 2. Verificar que el componente no está disabled
<CycleSelector disabled={false} />

// 3. Forzar selección manual
useEffect(() => {
  if (activeCycle && !value) {
    onValueChange(activeCycle.id);
  }
}, [activeCycle]);
```

---

### 6. Dark mode no funciona

**Síntoma:**
```
Los componentes se ven mal en dark mode
```

**Causas:**
- ❌ Falta clase `dark:` en estilos
- ❌ Provider de tema no configurado
- ❌ Clase `dark` no está en <html>

**Solución:**
```typescript
// 1. Verificar que el provider está en layout
// app/layout.tsx
<ThemeProvider>
  {children}
</ThemeProvider>

// 2. Verificar que los estilos tienen dark:
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-gray-100">Texto</p>
</div>

// 3. Agregar clase dark al HTML
// Verificar en DevTools que <html class="dark"> existe
```

---

### 7. Toast no aparece

**Síntoma:**
```
No se muestran los mensajes de éxito/error
```

**Causas:**
- ❌ Toaster no está en el layout
- ❌ handleApiError no se llama
- ❌ Sonner no instalado

**Solución:**
```typescript
// 1. Verificar que Toaster está en layout
// app/layout.tsx
import { Toaster } from 'sonner';

<Toaster position="top-right" />

// 2. Verificar que se llama handleApiError
catch (err: any) {
  handleApiError(err, 'Error al guardar');
}

// 3. Instalar sonner si falta
npm install sonner
```

**Debug:**
```typescript
// Probar toast manualmente
import { toast } from 'sonner';

toast.success('Test');
toast.error('Test error');
```

---

### 8. "validateStatus is not a function"

**Síntoma:**
```
Error: axios.validateStatus is not a function
```

**Causas:**
- ❌ Config de axios mal configurado
- ❌ validateStatus no es una función

**Solución:**
```typescript
// src/config/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  validateStatus: () => true, // ⚠️ CRÍTICO: Debe ser una función
});

// NO hacer esto:
// validateStatus: true ❌
```

---

### 9. Componente no se actualiza después de crear

**Síntoma:**
```
Después de crear un bimestre, la lista no se refresca
```

**Causas:**
- ❌ No se llama refresh() después de crear
- ❌ onSuccess no dispara actualización

**Solución:**
```typescript
// En BimesterFormExample
const handleSuccess = async () => {
  await bimesterService.create(cycleId, data);
  
  // ✅ Refrescar lista
  onSuccess?.(); // Callback para refrescar
  
  // O si usas el hook directamente
  refresh();
};

// En componente padre
<BimesterFormExample
  onSuccess={() => {
    refresh(); // De useBimesters
  }}
/>
```

---

### 10. Error: "Cannot read property 'data' of undefined"

**Síntoma:**
```
TypeError: Cannot read property 'data' of undefined
```

**Causas:**
- ❌ Response no tiene estructura esperada
- ❌ Backend no devuelve { success, data, meta }

**Solución:**
```typescript
// En service, siempre validar:
const response = await api.get('/api/...');

// ✅ Validar que response existe
if (!response) {
  throw new Error('No response from server');
}

// ✅ Validar que response.data existe
if (!response.data) {
  throw new Error('No data in response');
}

// ✅ Validar estructura
if (!response.data.success) {
  const error = new Error(response.data.message) as any;
  error.response = { data: response.data };
  throw error;
}

// ✅ Ahora puedes acceder seguro
return response.data.data;
```

---

## 🔍 Debugging Avanzado

### Verificar Request en Network

```typescript
// 1. Abrir DevTools → Network
// 2. Filtrar por XHR/Fetch
// 3. Hacer la acción (ej: crear bimestre)
// 4. Ver el request:
//    - URL
//    - Method
//    - Headers (Authorization?)
//    - Payload
//    - Response
```

### Ver Estado del Hook

```typescript
// Usar React DevTools
// 1. Instalar extensión React DevTools
// 2. Seleccionar componente
// 3. Ver "hooks" en el panel derecho
// 4. Inspeccionar: data, isLoading, error, etc.
```

### Logging Avanzado

```typescript
// En service
async getAvailableCycles() {
  console.group('🔵 getAvailableCycles');
  console.log('Request URL:', '/api/bimesters/cycles/available');
  
  const response = await api.get('/api/bimesters/cycles/available');
  
  console.log('Response status:', response.status);
  console.log('Response data:', response.data);
  console.groupEnd();
  
  // ... resto del código
}
```

---

## 📊 Verificación de Salud

### Checklist de Diagnóstico

```
Sistema:
☐ Node.js versión 18+ instalado
☐ npm install ejecutado sin errores
☐ .env.local configurado con NEXT_PUBLIC_API_URL

Backend:
☐ Backend corriendo en puerto correcto
☐ Endpoints /api/bimesters/cycles/* responden
☐ Base de datos tiene ciclos NO archivados

Frontend:
☐ Next.js dev server corriendo
☐ No hay errores de compilación TypeScript
☐ No hay warnings en console

Auth:
☐ Usuario logueado
☐ Token JWT en localStorage
☐ Token no expirado
☐ Usuario tiene permisos bimester:read

Componentes:
☐ useBimesterCycles carga datos
☐ CycleSelector renderiza correctamente
☐ CycleInfo muestra información
☐ Dark mode funciona
```

---

## 🎯 Performance

### Si la carga es lenta

```typescript
// 1. Verificar si hay demasiados ciclos
// Limitar en query
const { cycles } = useBimesterCycles({ limit: 20 });

// 2. Usar React.memo
const CycleSelector = React.memo(CycleSelectorComponent);

// 3. Debounce en búsquedas
const debouncedSearch = useDebounce(search, 500);

// 4. Lazy loading
const BimesterForm = lazy(() => import('./BimesterForm'));
```

---

## 📞 Contacto y Soporte

Si ninguna solución funciona:

1. **Revisar documentación:**
   - `INTEGRATION_BIMESTER_CYCLES.md`
   - `QUICK_START_BIMESTER_CYCLES.md`

2. **Verificar logs del backend:**
   ```bash
   # Ver logs en tiempo real
   tail -f backend.log
   ```

3. **Revisar GitHub issues:**
   - Buscar problemas similares
   - Crear un nuevo issue con detalles

---

## 🔧 Scripts Útiles

```bash
# Limpiar y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Limpiar caché de Next.js
rm -rf .next

# Verificar versiones
node --version
npm --version

# Ver puertos en uso
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Matar proceso en puerto (Windows)
taskkill /PID <PID> /F
```

---

**Última actualización:** 2025-01-29  
**Versión:** 1.0
