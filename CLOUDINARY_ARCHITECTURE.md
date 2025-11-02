# 📈 DIAGRAMA - Arquitectura de Upload de Fotos

## FLUJO COMPLETO

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  🖼️  USUARIO SUBE FOTO                                       │
│                                                                │
│  UserForm.tsx → handleFileSelect()                            │
│    • Valida tipo (image/*)                                    │
│    • Valida tamaño (< 5MB)                                    │
│    • Muestra preview                                          │
│                                                                │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ Usuario hace click "Crear Usuario"
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ⚙️  UsersPageContent.tsx → handleFormSubmit()               │
│                                                                │
│  1. uploadPicture(userId, file, 'profile')                   │
│  2. Llama al hook useUsers                                   │
│                                                                │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  🔗 useUsers hook → uploadPicture()                           │
│                                                                │
│  PASO 1: Upload a Cloudinary                                  │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ await uploadImageToCloudinary(file)                      │ │
│  │   ├─ Valida env vars ✅                                  │ │
│  │   ├─ Valida archivo ✅                                   │ │
│  │   ├─ Prepara FormData                                    │ │
│  │   └─ POST https://api.cloudinary.com/...                │ │
│  │       Response: { secure_url, public_id }               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  PASO 2: Registra en Backend                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ await uploadPicture(userId, url, publicId, kind)        │ │
│  │   └─ POST /api/users/:id/pictures                       │ │
│  │       Body: { url, publicId, kind, description }        │ │
│  │       Content-Type: application/json                    │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ☁️  CLOUDINARY                                              │
│                                                                │
│  https://api.cloudinary.com/v1_1/{cloud_name}/image/upload   │
│                                                                │
│  Response:                                                     │
│  {                                                             │
│    secure_url: "https://res.cloudinary.com/.../img.jpg",    │
│    public_id: "ids_usuarios/abc123"                         │
│  }                                                             │
│                                                                │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 │ (url, publicId)
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  🖥️  BACKEND                                                 │
│                                                                │
│  POST http://localhost:5000/api/users/14/pictures            │
│                                                                │
│  Headers:                                                      │
│    Content-Type: application/json                            │
│    Authorization: Bearer <JWT>                               │
│                                                                │
│  Body:                                                         │
│  {                                                             │
│    "url": "https://res.cloudinary.com/.../img.jpg",         │
│    "publicId": "ids_usuarios/abc123",                       │
│    "kind": "profile",                                         │
│    "description": "Mi foto de perfil"                        │
│  }                                                             │
│                                                                │
│  Response:                                                     │
│  {                                                             │
│    "success": true,                                           │
│    "data": {                                                  │
│      "id": 1,                                                 │
│      "userId": 14,                                            │
│      "url": "https://res.cloudinary.com/.../img.jpg",       │
│      "publicId": "ids_usuarios/abc123",                     │
│      "kind": "profile"                                        │
│    }                                                           │
│  }                                                             │
│                                                                │
└────────────────┬─────────────────────────────────────────────┘
                 │
                 ↓
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  💾 BASE DE DATOS                                            │
│                                                                │
│  Tabla: pictures                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ id       │ 1                                              │ │
│  │ userId   │ 14                                             │ │
│  │ url      │ https://res.cloudinary.com/.../img.jpg       │ │
│  │ publicId │ ids_usuarios/abc123                          │ │
│  │ kind     │ profile                                        │ │
│  │ createdAt│ 2025-01-15T10:30:00Z                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ✅ FOTO REGISTRADA                                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## ARQUITECTURA DE ARCHIVOS

```
FRONTEND                          BACKEND                 CLOUDINARY
├── UserForm.tsx                  ├── /api/users/         ├── API v1.1
│   └─ handleFileSelect()         │   ├─ POST :id/pic     └─ /image/upload
│      • Preview                  │   │   └─ JSON
│      • Validación               │   │   ├─ url
├── UsersPageContent.tsx          │   │   ├─ publicId
│   └─ handleFormSubmit()         │   │   └─ kind
│      • Orquestar upload         │   │
├── useUsers hook                 │   └─ DB registra
│   ├─ uploadPicture()           │
│   │  ├─ uploadImageToCloudinary()
│   │  │  └─ Valida + Sube
│   │  └─ uploadPicture()
│   │     └─ Registra
│
└── src/lib/cloudinary.ts
    └─ uploadImageToCloudinary()
       ├─ Valida env vars
       ├─ Valida archivo
       ├─ Prepara FormData
       └─ POST a Cloudinary
```

---

## ARCHIVOS MODIFICADOS

```
src/
├── lib/
│   └── cloudinary.ts ..................... ✅ MEJORADO
│       • Validación de env vars
│       • Validación de archivo
│       • Manejo robusto de errores
│       • Documentación JSDoc
│
├── services/
│   └── users.service.ts ................. ✅ ACTUALIZADO
│       • uploadPicture(userId, url, publicId, kind, description?)
│       • Envía JSON, no FormData
│
├── hooks/data/
│   └── useUsers.ts ...................... ✅ INTEGRADO
│       • Importa uploadImageToCloudinary
│       • Flujo: Cloudinary → Backend
│
└── components/features/users/
    ├── UserForm.tsx ..................... ✅ SIN CAMBIOS
    └── UsersPageContent.tsx ............. ✅ SIN CAMBIOS
```

---

## VARIABLES DE ENTORNO

```env
.env.local
├─ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
│  └─ De: https://cloudinary.com dashboard
│
└─ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
   └─ De: Settings → Upload → Upload Presets
```

---

## VALIDACIONES EN CADA PASO

```
┌─ Validación Frontend
│  ├─ UserForm: tipo + tamaño
│  ├─ uploadImageToCloudinary():
│  │  ├─ Env vars configuradas
│  │  ├─ Archivo es imagen
│  │  └─ Tamaño < 5MB
│  └─ uploadPicture():
│     ├─ url válida
│     ├─ publicId válido
│     └─ kind válido (profile|document|evidence)
│
└─ Validación Backend
   ├─ JWT token válido
   ├─ Permisos suficientes
   ├─ Usuario existe
   └─ JSON valido (url, publicId, kind)
```

---

## FLOW DIAGRAM (ASCII)

```
┌────────┐
│ Archivo│
└───┬────┘
    │
    ├─→ Preview en UserForm ✅
    │
    ├─→ User clicks "Crear" 
    │
    ├─→ uploadImageToCloudinary()
    │   ├─ Valida
    │   ├─ POST a Cloudinary
    │   └─ Obtiene { url, publicId }
    │
    ├─→ uploadPicture()
    │   ├─ POST a Backend (JSON)
    │   └─ Registra en BD
    │
    └─→ ✅ FOTO LISTA
        Aparece en perfil usuario
```

---

## RESUMEN

```
ENTRADA:  archivo local (File)
   ↓
PASO 1:   uploadImageToCloudinary()
   ├─ Valida
   └─ Sube a Cloudinary → obtiene url + publicId
   ↓
PASO 2:   uploadPicture()
   ├─ Envía JSON al backend
   └─ Backend registra en BD
   ↓
SALIDA:   Foto registrada ✅
```

---

## ESTADO

✅ Arquitectura clara
✅ Validaciones en cada paso
✅ Manejo de errores robusto
✅ Documentación completa
✅ LISTO PARA PRODUCCIÓN
