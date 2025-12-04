# ERICA Topics - Integración con Cascade Data

## Cambios Realizados

Se ha integrado el módulo `cascade-data` en el módulo ERICA Topics para eliminar la necesidad de que los usuarios ingresen IDs numéricos manualmente.

### Archivos Nuevos

1. **`src/services/cascade-data.service.ts`**
   - Servicio para consumir los endpoints de cascade-data
   - Métodos principales:
     - `getActiveCycle()` - Obtiene ciclo escolar activo
     - `getActiveBimester(cycleId)` - Obtiene bimestre activo
     - `getWeeks(bimesterId)` - Obtiene semanas académicas
     - `getGrades(cycleId)` - Obtiene grados
     - `getCourses(gradeId)` - Obtiene cursos de un grado
     - `getAllCascadeData()` - **Endpoint principal** que retorna todo en una sola solicitud

2. **`src/hooks/useCascadeData.ts`**
   - Hook personalizado para consumir cascade-data
   - Maneja estados de loading y error
   - Cachea datos automáticamente

3. **`src/components/features/erica-topics/EricaTopicsListEnhanced.tsx`**
   - Componente de listado mejorado
   - Muestra nombres de cursos y semanas en lugar de IDs
   - Mejor visualización de datos académicos

### Archivos Modificados

1. **`src/components/features/erica-topics/EricaTopicForm.tsx`**
   - Carga datos en cascada al montar
   - Select dinámico para Grado → Curso
   - Select dinámico para Semana Académica
   - Campos sectionId y teacherId temporalmente con input numérico (requieren endpoints adicionales)

2. **`src/components/features/erica-topics/index.ts`**
   - Exporta `EricaTopicsListEnhanced` además del componente original

3. **`src/app/(admin)/erica-topics/page.tsx`**
   - Usa `EricaTopicsListEnhanced` para mejor visualización

## Flujo del Formulario Mejorado

### Creación/Edición de Tema ERICA

1. **Carga de datos académicos**
   ```
   GET /api/cascade-data/all
   ↓
   Retorna ciclo, bimestre, semanas, grados, cursos
   ```

2. **Usuario selecciona Grado**
   ```
   Dropdown mostrará todos los grados activos
   Ejemplo: "Primero (Nivel 1)", "Segundo (Nivel 2)"
   ```

3. **Cursos se cargan dinámicamente**
   ```
   Basado en el grado seleccionado
   Ejemplo: "Matemáticas (MATH-101)", "Español (ESP-101)"
   ```

4. **Usuario selecciona Semana Académica**
   ```
   Dropdown mostrará semanas del bimestre activo
   Formato: "Semana 1 (24 Feb 2025 - 02 Mar 2025)"
   ```

5. **Datos de sección y docente** (pendiente)
   ```
   Actualmente requeridos como ID numérico
   En futuro se pueden mejorar con cascades adicionales
   ```

## Visualización en Listado

### Antes (IDs numéricos)
```
Curso: 1
Semana: 33
Sección/Docente: 2 / 5
```

### Después (Nombres descriptivos)
```
Curso: Matemáticas
Semana: Semana 1
Sección/Docente: 2 / 5
```

## Endpoints Requeridos en Backend

Para que funcione completamente, el backend debe proporcionar:

### Ya implementados en cascade-data:
- ✅ `GET /api/cascade-data/all` - Todos los datos en cascada
- ✅ `GET /api/cascade-data/active-cycle` - Ciclo activo
- ✅ `GET /api/cascade-data/active-bimester/:cycleId` - Bimestre activo
- ✅ `GET /api/cascade-data/weeks/:bimesterId` - Semanas
- ✅ `GET /api/cascade-data/grades/:cycleId` - Grados
- ✅ `GET /api/cascade-data/courses/:gradeId` - Cursos

### Para mejorar aún más (futuro):
- `GET /api/cascade-data/sections/:gradeId` - Secciones por grado
- `GET /api/cascade-data/teachers` - Listado de docentes
- `GET /api/cascade-data/section-teachers/:sectionId` - Docentes por sección

## Optimizaciones Implementadas

1. **Single Request Loading**: El endpoint `/cascade-data/all` obtiene todo en una sola solicitud HTTP
2. **Caching**: Los datos se cachean a nivel de componente con `useCascadeData`
3. **Validaciones**: Todos los selects tienen validaciones Zod
4. **Dark Mode**: Todos los componentes soportan dark mode
5. **Responsive**: Diseño adaptable a móvil y desktop

## Uso en Otros Módulos

El servicio `cascadeDataService` y el hook `useCascadeData` pueden reutilizarse en cualquier otro módulo:

```typescript
import { useCascadeData } from '@/hooks/useCascadeData';
import { cascadeDataService } from '@/services/cascade-data.service';

export function MiComponente() {
  const { data, loading, error } = useCascadeData();
  
  // data.grades
  // data.weeks
  // data.gradesCourses
  // etc
}
```

## Próximos Pasos

1. Verificar que los endpoints de cascade-data estén funcionando
2. Considerar agregar selects para Secciones y Docentes (requieren endpoints adicionales)
3. Implementar búsqueda avanzada por grado, curso, docente en la página de listado
4. Agregar estadísticas (ej: % de temas completados por grado)
