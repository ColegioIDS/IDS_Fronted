# 📋 Signatures Module - Frontend Implementation

## Overview

El módulo de Signatures en el frontend proporciona una interfaz completa para gestionar firmas digitales. **Versión 2.0**: Ahora con carga automática de imágenes a Cloudinary y selector de usuarios.

## 📁 Estructura de Archivos

```
src/
├── types/
│   └── signatures.types.ts          # Tipos TypeScript
├── services/
│   └── signatures.service.ts        # Servicio API (con getAvailableUsers)
├── hooks/
│   └── useSignatures.ts             # Hook personalizado (con carga a Cloudinary)
├── components/
│   └── features/signatures/
│       ├── SignaturesTable.tsx      # Tabla de firmas
│       └── SignatureFormModal.tsx   # Modal de formulario (ACTUALIZADO)
└── app/
    └── (admin)/
        └── signatures/
            └── page.tsx             # Página principal
```

## 🎨 Cambios en v2.0

### ✨ Nuevas Características

1. **Carga Automática de Imágenes**
   - Selecciona imagen desde tu dispositivo
   - Se sube automáticamente a Cloudinary al guardar
   - No necesitas URLs manuales

2. **Selector de Usuarios**
   - Dropdown con lista de usuarios disponibles
   - Muestra nombre completo y rol
   - No necesitas recordar IDs de usuario

3. **Preview en Tiempo Real**
   - Ve la imagen de la firma antes de guardar
   - Indicador visual cuando está seleccionada

4. **Mejor UX/UI**
   - Diseño modernizado con gradientes
   - Estados de loading con animaciones
   - Validaciones claras
   - Soporte completo para dark mode

### 📋 Campos del Formulario

**Al Crear:**
```
- Tipo de Firma (selector: TEACHER, DIRECTOR, etc.)
- Usuario (dropdown con usuarios disponibles)
- Imagen de firma (file input con preview)
- Nombre de la firma
- Título/Cargo
- Válida desde (opcional)
- Válida hasta (opcional)
- Activa (checkbox)
- Marcar como defecto (checkbox)
```

**Al Editar:**
```
- Imagen (opcional - cambiar imagen actual)
- Nombre de la firma
- Título/Cargo
- Válida desde
- Válida hasta
- Activa
- Marcar como defecto
```

> **Nota:** Al editar, los campos `signatureUrl` y `publicId` se calculan automáticamente si cambias la imagen.

## 🚀 Uso

### 1. En un Componente

```tsx
import { useSignatures } from '@/hooks/useSignatures';

export default function MyComponent() {
  const { 
    signatures, 
    loading, 
    error,
    fetchSignatures,
    createSignature,
    updateSignature,
    deleteSignature,
    setDefaultSignature
  } = useSignatures();

  // Cargar firmas al montar
  useEffect(() => {
    fetchSignatures();
  }, []);

  // Crear firma (con imagen)
  const handleCreate = async (data) => {
    try {
      await createSignature({
        type: 'TEACHER',
        userId: 5,
        signatureName: 'María García',
        title: 'Docente',
        signatureFile: fileFromInput, // ✅ El hook maneja Cloudinary
        isActive: true
      });
    } catch (error) {
    }
  };

  // Actualizar firma (imagen opcional)
  const handleUpdate = async (data) => {
    try {
      await updateSignature(signatureId, {
        title: 'Nuevo título',
        signatureFile: newFileIfChanged // ✅ Optional
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // Tu JSX aquí
  );
}
```

### 2. Acceder a la Página de Gestión

Navigate to: `/signatures`

## 📊 Componentes

### SignaturesTable

Tabla que muestra todas las firmas con opciones para editar, eliminar y marcar como defecto.

**Props:**
- `signatures: Signature[]` - Lista de firmas
- `loading: boolean` - Estado de carga
- `onEdit: (signature: Signature) => void` - Callback para editar
- `onDelete: (id: number) => void` - Callback para eliminar
- `onSetDefault: (id: number) => void` - Callback para marcar defecto

### SignatureFormModal

Modal con formulario para crear o editar firmas. **Actualizado en v2.0**.

**Props:**
- `isOpen: boolean` - Control de visibilidad
- `signature: Signature | null` - Firma a editar (null para crear)
- `onClose: () => void` - Callback de cierre
- `onSubmit: (data, isEdit) => Promise<void>` - Callback de envío
- `loading: boolean` - Estado de carga

**Cambios en v2.0:**
- ✅ Selector automático de usuarios
- ✅ Upload de imagen con preview
- ✅ Eliminación de campos URL/publicId (se calculan automáticamente)
- ✅ Mejor validación y feedback visual

## 🔧 Servicio API

El servicio `signaturesService` proporciona los siguientes métodos:

```typescript
// Obtener todas
signaturesService.getAllSignatures(filters?)

// Crear
signaturesService.createSignature(data)

// Obtener por ID
signaturesService.getSignatureById(id)

// Obtener por tipo
signaturesService.getSignaturesByType(type, schoolCycleId?, isDefault?)

// Para carta de notas
signaturesService.getSignaturesForCarta(schoolCycleId?)

// Actualizar
signaturesService.updateSignature(id, data)

// Marcar como defecto
signaturesService.setDefaultSignature(id)

// Eliminar
signaturesService.deleteSignature(id)

// ✨ NUEVO: Obtener usuarios disponibles
signaturesService.getAvailableUsers()
```

### getAvailableUsers() - ✨ NUEVO

**Descripción:** Obtiene lista de usuarios disponibles (excepto tutores) para asignar firmas.

**Retorno:**
```typescript
{
  data: [
    {
      id: 5,
      givenNames: "María",
      lastNames: "García López",
      email: "maria.garcia@escuela.edu.gt",
      role: {
        id: 3,
        name: "Docente"
      }
    },
    // ... más usuarios
  ],
  total: 10
}
```

**Usado por:** SignatureFormModal para llenar el dropdown de usuarios

## 📝 Tipos de Datos

### Signature

```typescript
interface Signature {
  id: number;
  type: SignatureType; // TEACHER, DIRECTOR, COORDINATOR, PRINCIPAL, CUSTOM
  userId: number;
  user?: SignatureUser;
  schoolCycleId: number | null;
  schoolCycle?: SignatureSchoolCycle | null;
  signatureName: string;
  title: string;
  signatureUrl: string;      // ✅ Se calcula automáticamente
  publicId: string;          // ✅ Se calcula automáticamente
  isActive: boolean;
  isDefault: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### CreateSignatureRequest - ✨ ACTUALIZADO

```typescript
interface CreateSignatureRequest {
  type: SignatureType;
  userId: number;
  schoolCycleId?: number | null;
  signatureName: string;
  title: string;
  signatureFile?: File;        // ✨ NUEVO: Image file (Cloudinary)
  // signatureUrl: NO INCLUIR
  // publicId: NO INCLUIR
  isDefault?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
}
```

### UpdateSignatureRequest - ✨ ACTUALIZADO

```typescript
interface UpdateSignatureRequest {
  signatureName?: string;
  title?: string;
  signatureFile?: File;        // ✨ NUEVO: Image file (optional)
  // signatureUrl: NO INCLUIR
  // publicId: NO INCLUIR
  isActive?: boolean;
  isDefault?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
}
```

## 🎯 Casos de Uso

### Crear firma de docente

```tsx
// En el componente
const { createSignature } = useSignatures();

const handleCreateTeacher = async () => {
  const formData = {
    type: SignatureType.TEACHER,
    userId: 5,  // Seleccionado del dropdown
    signatureName: "María García López",
    title: "Docente de Matemáticas",
    signatureFile: fileInputValue,  // ✅ El hook maneja Cloudinary
    isDefault: true
  };

  try {
    await createSignature(formData);
    // ✅ Imagen subida a Cloudinary automáticamente
    // ✅ Firma creada con URLs generadas
  } catch (error) {
    console.error(error);
  }
};
```

### Actualizar firma con nueva imagen

```tsx
const { updateSignature } = useSignatures();

const handleUpdateWithNewImage = async (signatureId: number) => {
  const updateData = {
    title: "Coordinadora de Matemáticas",
    signatureFile: newFileFromInput  // ✅ Se sube a Cloudinary
  };

  try {
    await updateSignature(signatureId, updateData);
    // ✅ Nueva imagen en Cloudinary
    // ✅ URLs actualizadas automáticamente
  } catch (error) {
    console.error(error);
  }
};
```

### Obtener firmas para carta de notas

```tsx
const { getSignaturesForCarta } = useSignatures();

const result = await getSignaturesForCarta(1); // schoolCycleId = 1
console.log(result.teacher);    // Firma del docente
console.log(result.director);   // Firma del director
```

### Obtener usuarios para dropdown

```tsx
import { signaturesService } from '@/services/signatures.service';

const users = await signaturesService.getAvailableUsers();
// users.data contiene lista de usuarios
// Ya filtrada: activos, sin tutores, con info de rol
```

## 🔄 Flujo de Datos - Crear Firma

```
Usuario selecciona imagen
           ↓
        Preview
           ↓
  Usuario hace clic "Crear"
           ↓
  useSignatures.createSignature()
           ↓
  uploadImageToCloudinary()
           ↓
  Obtiene URL y publicId
           ↓
  signaturesService.createSignature()
           ↓
  Backend crea firma
           ↓
  Toast de éxito
           ↓
  Tabla se actualiza
```

## 🔄 Flujo de Datos - Editar Firma

```
Abrir modal con datos
           ↓
  Mostrar preview imagen actual
           ↓
  Usuario puede cambiar imagen (opcional)
           ↓
  Usuario hace clic "Actualizar"
           ↓
  ¿Cambió imagen?
    ├─ SÍ: uploadImageToCloudinary()
    └─ NO: Mantener URLs actuales
           ↓
  useSignatures.updateSignature()
           ↓
  signaturesService.updateSignature()
           ↓
  Backend actualiza firma
           ↓
  Toast de éxito
           ↓
  Tabla se actualiza
```

## ✅ Validaciones

### Cliente
- ✅ Imagen obligatoria al crear
- ✅ Usuario obligatorio
- ✅ Nombre y título obligatorios
- ✅ Tamaño máximo 5MB
- ✅ Solo formato imagen (JPG, PNG, etc.)
- ✅ Feedback visual de errores

### Servidor
- ✅ Validación de CreateSignatureRequest
- ✅ Validación de UpdateSignatureRequest
- ✅ Verificación de usuario existe
- ✅ Prevención de duplicados
- ✅ Validación de URLs Cloudinary

## 🎨 Theming

Todos los componentes soportan dark mode y utilizan las clases de Tailwind CSS:

- Colores primarios: `bg-blue-*`, `text-blue-*`
- Colores de estado: `bg-green-*`, `bg-red-*`, etc.
- Modo oscuro: `dark:*`
- Gradientes: `bg-gradient-to-br`

## 📱 Responsive Design

Componentes optimizados para todos los tamaños:

- **Mobile**: Diseño apilado, botones grandes, dropdown accesible
- **Tablet**: Layout flexible, spacing apropiado
- **Desktop**: Vista expandida, columnas de formulario

## ⚠️ Errores Comunes

### Error: "Debes seleccionar una imagen de firma"
**Causa:** Intentaste crear sin imagen
**Solución:** Haz clic en el icono de cámara para seleccionar imagen

### Error: "La imagen no debe exceder 5MB"
**Causa:** Archivo muy grande
**Solución:** Comprime la imagen o elige una más pequeña

### Error: "El archivo debe ser una imagen"
**Causa:** Seleccionaste archivo que no es imagen
**Solución:** Selecciona JPG, PNG, GIF, etc.

### Error: "Variables de entorno Cloudinary no configuradas"
**Causa:** Faltan env vars
**Solución:** Verifica `.env.local` tiene `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## 🔐 Permisos Requeridos

- `signatures:create` - Crear firmas
- `signatures:read` - Ver firmas
- `signatures:update` - Actualizar firmas
- `signatures:delete` - Eliminar firmas

## 🚀 Mejoras Futuras

- [ ] Drag & drop para imágenes
- [ ] Crop/editor de imágenes
- [ ] Importación de firmas desde CSV
- [ ] Exportación a PDF
- [ ] Historial de cambios con versiones
- [ ] Validación de imágenes mejorada
- [ ] Caché de firmas
- [ ] Integración automática con cartas de notas

## 📞 Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

---

**Versión**: 2.0.0  
**Última Actualización**: 30 de Noviembre de 2025  
**Status**: ✅ Production Ready  
**Cambios Principales**: Carga automática Cloudinary + Selector usuarios


## 🚀 Uso

### 1. En un Componente

```tsx
import { useSignatures } from '@/hooks/useSignatures';

export default function MyComponent() {
  const { 
    signatures, 
    loading, 
    error,
    fetchSignatures,
    createSignature,
    updateSignature,
    deleteSignature,
    setDefaultSignature
  } = useSignatures();

  // Cargar firmas al montar
  useEffect(() => {
    fetchSignatures();
  }, []);

  // Crear firma
  const handleCreate = async (data) => {
    try {
      await createSignature(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // Tu JSX aquí
  );
}
```

### 2. Acceder a la Página de Gestión

Navigate to: `/signatures`

## 📊 Componentes

### SignaturesTable

Tabla que muestra todas las firmas con opciones para editar, eliminar y marcar como defecto.

**Props:**
- `signatures: Signature[]` - Lista de firmas
- `loading: boolean` - Estado de carga
- `onEdit: (signature: Signature) => void` - Callback para editar
- `onDelete: (id: number) => void` - Callback para eliminar
- `onSetDefault: (id: number) => void` - Callback para marcar defecto

### SignatureFormModal

Modal con formulario para crear o editar firmas.

**Props:**
- `isOpen: boolean` - Control de visibilidad
- `signature: Signature | null` - Firma a editar (null para crear)
- `onClose: () => void` - Callback de cierre
- `onSubmit: (data, isEdit) => Promise<void>` - Callback de envío
- `loading: boolean` - Estado de carga

## 🔧 Servicio API

El servicio `signaturesService` proporciona los siguientes métodos:

```typescript
// Obtener todas
signaturesService.getAllSignatures(filters?)

// Crear
signaturesService.createSignature(data)

// Obtener por ID
signaturesService.getSignatureById(id)

// Obtener por tipo
signaturesService.getSignaturesByType(type, schoolCycleId?, isDefault?)

// Para carta de notas
signaturesService.getSignaturesForCarta(schoolCycleId?)

// Actualizar
signaturesService.updateSignature(id, data)

// Marcar como defecto
signaturesService.setDefaultSignature(id)

// Eliminar
signaturesService.deleteSignature(id)

// Obtener defecto por tipo
signaturesService.getDefaultSignatureByType(type, schoolCycleId?)

// Obtener activas de usuario
signaturesService.getUserActiveSignatures(userId)
```

## 📝 Tipos de Datos

### Signature

```typescript
interface Signature {
  id: number;
  type: SignatureType; // TEACHER, DIRECTOR, COORDINATOR, PRINCIPAL, CUSTOM
  userId: number;
  user?: SignatureUser;
  schoolCycleId: number | null;
  schoolCycle?: SignatureSchoolCycle | null;
  signatureName: string;
  title: string;
  signatureUrl: string;
  publicId: string;
  isActive: boolean;
  isDefault: boolean;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### CreateSignatureRequest

```typescript
interface CreateSignatureRequest {
  type: SignatureType;
  userId: number;
  schoolCycleId?: number | null;
  signatureName: string;
  title: string;
  signatureUrl: string;
  publicId: string;
  isDefault?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
}
```

## 🎯 Casos de Uso

### Obtener firma para carta de notas

```tsx
const { getSignaturesForCarta } = useSignatures();

useEffect(() => {
  getSignaturesForCarta(1) // schoolCycleId = 1
    .then(result => {
      console.log('Docente:', result.teacher);
      console.log('Director:', result.director);
    });
}, []);
```

### Filtrar por tipo

```tsx
const { getSignaturesByType } = useSignatures();

// Obtener todos los directores
getSignaturesByType('DIRECTOR', 1, true) // Solo por defecto del ciclo 1
  .then(result => {
    console.log(result.data); // Array de firmas de directores
  });
```

### Actualizar y marcar como defecto

```tsx
const { updateSignature, setDefaultSignature } = useSignatures();

// Actualizar
await updateSignature(1, {
  title: 'Nuevo título'
});

// Marcar como defecto
await setDefaultSignature(1);
```

## 🔐 Permisos Requeridos

- `signatures:create` - Crear firmas
- `signatures:read` - Ver firmas
- `signatures:update` - Actualizar firmas
- `signatures:delete` - Eliminar firmas

## 📱 Responsive Design

Todos los componentes son responsive y adaptan su layout a diferentes tamaños de pantalla:

- **Mobile**: Diseño apilado, tabla con scroll horizontal
- **Tablet/Desktop**: Diseño expandido, tabla completa visible

## 🎨 Theming

Todos los componentes soportan dark mode y utilizan las clases de Tailwind CSS:

- Colores de marca: `bg-brand-*`, `text-brand-*`
- Colores de estado: `bg-green-*`, `bg-red-*`, etc.
- Modo oscuro: `dark:*`

## ⚠️ Errores Comunes

### Error: "Firma ya existe"
Significa que ya existe una firma del mismo tipo para ese usuario en ese ciclo escolar.

### Error: "No se encontraron firmas"
Verifica que existan firmas creadas y que los filtros aplicados sean correctos.

### Error: "Sin autenticación"
Asegúrate de tener un token JWT válido. Recarga la página o inicia sesión nuevamente.

## 🚀 Mejoras Futuras

- [ ] Importación de firmas desde CSV
- [ ] Editor visual de firmas
- [ ] Previsualización en tiempo real
- [ ] Historial de cambios
- [ ] Validación de imágenes
- [ ] Caché de firmas

## 📞 Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

---

**Last Updated**: 30 de Noviembre de 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
