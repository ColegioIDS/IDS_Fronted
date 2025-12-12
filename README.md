# IDS Colegio - Sistema de Gestión Académica Integral

**Sistema de gestión académica completo** construido con **Next.js 15 + React 19 + TypeScript + Tailwind CSS v4**, proporcionando todas las herramientas necesarias para administrar de forma integral un colegio moderno.

## 🎯 Módulos Principales

### 📊 Dashboard Académico
- Estadísticas generales de estudiantes, asistencia y calificaciones
- Visualización de ciclos escolares y bimestres activos
- Resumen de actividades recientes

### 👥 Gestión de Estudiantes
- Creación y edición de estudiantes
- Sistema de matrículas con validación de capacidad
- Historial de transferencias entre secciones
- Búsqueda y filtros avanzados

### 📋 Asistencia
- Registro de asistencia por clase
- Reportes de asistencia por estudiante
- Gestión de justificantes
- Estadísticas de inasistencia

### 📚 Crear y Gestionar Tareas
- Creación de tareas por curso y bimestre
- Interfaz con **dos tabs**:
  - **Tab 1 - Tareas del Curso**: Listado de tareas con toggle para ver detalles de calificaciones por tarea individual
  - **Tab 2 - Calificaciones**: Tabla de estudiantes con todas sus calificaciones por tarea
- Nuevo endpoint integrado: `/api/assignments/course/:courseId/bimester/:bimesterId/students-submissions`
- Calificación por lotes
- Visualización de entregas con estado (calificado/pendiente)

### 📝 Cotejos (Consolidación de Calificaciones)
- Sistema completo de consolidación de calificaciones por componentes:
  - **ERICA**: 0-40 puntos (evaluaciones contextualizadas)
  - **TAREAS**: Suma de calificaciones de tareas (máximo 20 puntos)
  - **ACTITUDINAL**: 0-20 puntos
  - **DECLARATIVO**: 0-30 puntos
  - **TOTAL**: 0-100 puntos
- Tabla con **columnas coloreadas temáticamente**:
  - 🟢 Verde para ERICA
  - 🟠 Naranja para TAREAS (individual + total)
  - 🔵 Azul para ACTITUDINAL
  - 🟣 Púrpura para DECLARATIVO
  - ⭐ Gris para TOTAL
- Toggle para mostrar/ocultar detalles de tareas individuales
- Auto-selección de ciclo y bimestre activos
- Estados: DRAFT, SUBMITTED, COMPLETED
- Protección: No se pueden editar cotejos completados/enviados
- Errores específicos en toasts

### 🎓 Evaluaciones ERICA
- Gestión de evaluaciones contextualizadas
- Colores por dimensión
- Permisos por rol

### 💻 Autenticación
- Sistema de autenticación con roles
- Control de acceso basado en permisos
- Gestión de sesiones seguras

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Next.js** | 15.x | Framework React fullstack |
| **React** | 19 | Librería UI |
| **TypeScript** | 5.x | Tipado estricto |
| **Tailwind CSS** | v4 | Estilos |
| **Shadcn/ui** | Latest | Componentes base |
| **Lucide React** | Latest | Iconos |
| **Zod** | Latest | Validación de esquemas |
| **Axios** | Latest | Cliente HTTP |
| **Date-fns** | Latest | Manipulación de fechas |
| **Sonner** | Latest | Notificaciones toast |

---

## 📁 Estructura del Proyecto

```
src/
├── app/                          # Rutas y layouts de Next.js 15
│   ├── (admin)/                 # Layout admin protegido
│   ├── (auth)/                  # Layout de autenticación
│   ├── (full-width-pages)/      # Páginas sin sidebar
│   └── auth/                    # Rutas de autenticación
├── components/
│   ├── features/                # Componentes por módulo
│   │   ├── assignments/         # Módulo de tareas
│   │   ├── cotejos/            # Módulo de cotejos
│   │   ├── attendance/         # Módulo de asistencia
│   │   ├── students/           # Módulo de estudiantes
│   │   └── ...
│   ├── ui/                      # Componentes base (shadcn/ui)
│   └── shared/                  # Componentes reutilizables
├── services/                    # Servicios API
│   ├── assignments.service.ts
│   ├── cotejos.service.ts
│   ├── enrollments.service.ts
│   └── ...
├── hooks/                       # Hooks personalizados
│   ├── useCotejos/
│   ├── useStudentSubmissions.ts
│   └── ...
├── types/                       # Tipos TypeScript
├── constants/                   # Constantes y configuración
│   └── cotejos/                # Constantes del módulo cotejos
│       ├── errors.constants.ts
│       └── index.ts
├── utils/                       # Utilidades
│   ├── cotejos-error.utils.ts
│   └── ...
└── config/                      # Configuración
    ├── api.ts
    ├── theme.config.ts
    └── timezone.ts
```

---

## 🚀 Primeros Pasos

### Prerequisitos
- Node.js 18.x o superior (recomendado 20.x)
- npm o yarn

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/ColegioIDS/IDS_Fronted.git
cd IDS_Fronted

# Instalar dependencias
npm install
# o
yarn install

# Variables de entorno (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Iniciar servidor de desarrollo
npm run dev
# o
yarn dev
```

Accede a http://localhost:3000

### Build para producción

```bash
npm run build
npm run start
```

---

## 🎨 Características Destacadas

### ✨ Sistema de Errores Centralizado
- `constants/cotejos/errors.constants.ts`: Mapeo de códigos de error
- `utils/cotejos-error.utils.ts`: Extracción y procesamiento de errores
- `hooks/useCotejosErrorToast.ts`: Notificaciones de error específicas
- Errores genéricos evitados, mensajes descriptivos en toasts

### 🎯 Auto-selección de Contexto
- Ciclo académico activo auto-seleccionado en cascadas
- Bimestre activo auto-seleccionado
- Información visual con fechas y detalles

### 📊 Tablas Mejoradas
- Colores temáticos por componente de calificación
- Dark mode completo
- Responsive con scroll horizontal
- Indicadores visuales (badges, iconos)

### 🔐 Control de Acceso
- Protección en rutas
- Validación de permisos
- Middleware de autenticación

---

## 📊 Módulos Técnicos Implementados

### Cotejos
- ✅ 7 endpoints backend integrados
- ✅ 7 hooks personalizados con manejo de errores
- ✅ Sistema completo de error handling
- ✅ Componentes de edición (Actitudinal, Declarativo)
- ✅ Componente de envío (Submit)
- ✅ Tabla con toggle de detalles
- ✅ Protección contra edición de estados finales

### Tareas (Assignments)
- ✅ Cascada de selección (Grado → Sección → Curso → Bimestre)
- ✅ Creación de tareas
- ✅ Listado con tarjetas de tarea
- ✅ Endpoint nuevo: `students-submissions`
- ✅ Hook: `useStudentSubmissions`
- ✅ Tabla de calificaciones por estudiante
- ✅ Estados: Calificado/Pendiente

---

## 🔄 Flujo de Datos

### Exemplo: Creación de Cotejo
```
1. Usuario selecciona Ciclo → Bimestre → Grado → Sección → Curso
2. Sistema auto-selecciona ciclo/bimestre activos
3. Se genera cotejo para cada estudiante
4. Usuario edita componentes (ERICA, Tareas, Actitudinal, Declarativo)
5. Sistema valida no exceder 100 puntos
6. Usuario envía/completa el cotejo
7. Se bloquea edición para estados SUBMITTED/COMPLETED
8. Errores específicos en toasts (no genéricos)
```

---

## 🛡️ Manejo de Errores

### Estrategia
1. **Captura en servicio**: `validateApiResponse()` detecta `success: false`
2. **Transformación**: `extractCotejosError()` extrae código y mensaje
3. **Presentación**: `useCotejosErrorToast()` muestra error específico
4. **UI**: Toast con descripción clara del problema

### Ejemplo
```typescript
// En componente
const { showError } = useCotejosErrorToast();
try {
  await updateActitudinal(...);
  toast.success('Actualizado exitosamente');
} catch (error: any) {
  showError(error?.errorCode, error?.message);
  // Muestra: "Puntuación inválida: máximo 20 puntos"
}
```

---

## 📝 Convenciones de Código

- **TypeScript**: Tipado estricto, sin `any`
- **Componentes**: Funcionales con hooks
- **Nombrado**: PascalCase (componentes), camelCase (variables)
- **Imports**: Ruta absoluta con alias `@/`
- **Estilos**: Tailwind CSS, dark mode en todos los componentes
- **Errores**: Específicos, no genéricos

---

## 🤝 Contribuir

Este es un proyecto privado del Colegio IDS. Para cambios:
1. Crear rama desde `dev`
2. Implementar cambios
3. Hacer PR a `dev`
4. Esperar review

---

## 📄 Licencia

Proyecto privado - Colegio IDS

---

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo del Colegio IDS.

---

**Última actualización**: 12 de diciembre de 2025
**Versión**: 1.0.0
**Estado**: En desarrollo activo
