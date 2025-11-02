# 🔧 SETUP - Configuración de Cloudinary

## 1️⃣ Configurar Cloudinary

### Paso 1: Crear cuenta
1. Ve a https://cloudinary.com
2. Sign up (gratis)
3. Verifica email

### Paso 2: Obtener credenciales
1. Dashboard → Settings
2. Copia **Cloud Name**
3. Ve a **Upload** tab
4. En "Upload presets", haz click en "Add upload preset"
   - Nombre: `ids_usuarios` (o el que prefieras)
   - Unsigned: **ON**
   - Folder: `ids_usuarios`
   - Haz click Save
5. Copia el **Upload Preset name**

---

## 2️⃣ Configurar Variables de Entorno

### Archivo: `.env.local`

```env
# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_preset_name
```

**Ejemplo real:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dxxxxxxxxxxx
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ids_usuarios
```

---

## 3️⃣ Verificar Configuración

### En la consola del navegador (DevTools)

```javascript
// Ejecuta esto en la consola:
console.log(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
```

Deberías ver los valores, no `undefined`.

---

## 4️⃣ Probar Upload

### Test Manual en Postman

**1. Upload a Cloudinary:**
```bash
curl -X POST "https://api.cloudinary.com/v1_1/tu_cloud_name/image/upload" \
  -F "file=@C:/Users/nalex/Downloads/imagen.jpg" \
  -F "upload_preset=ids_usuarios" \
  -F "folder=ids_usuarios"
```

**Response exitoso:**
```json
{
  "secure_url": "https://res.cloudinary.com/dxxx/image/upload/v1234/ids_usuarios/abc.jpg",
  "public_id": "ids_usuarios/abc"
}
```

**2. Registra en Backend:**
```bash
curl -X POST "http://localhost:5000/api/users/1/pictures" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "url": "https://res.cloudinary.com/dxxx/image/upload/v1234/ids_usuarios/abc.jpg",
    "publicId": "ids_usuarios/abc",
    "kind": "profile",
    "description": "Mi foto"
  }'
```

---

## 5️⃣ Probar en la Aplicación

### Flujo Completo

1. Abre la app: `http://localhost:3000/users`
2. Click: "Crear Usuario"
3. Llena el formulario
4. Click Tab: "Foto"
5. Arrastra o selecciona una imagen
6. Verifica el preview
7. Click: "Crear Usuario"
8. Observa los toasts:
   - ✅ "Subiendo imagen a Cloudinary..."
   - ✅ "Foto subida exitosamente"
   - ✅ "Usuario creado exitosamente"

---

## ⚠️ Troubleshooting

### Error: "Variables de entorno Cloudinary no configuradas"
**Solución:**
1. Verifica `.env.local` existe en raíz del proyecto
2. Verifica que tiene: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
3. Reinicia el servidor: `npm run dev`
4. Limpia cache: `Ctrl+Shift+R` en navegador

### Error: "La imagen no debe exceder 5MB"
**Solución:** Usa una imagen más pequeña (máximo 5MB)

### Error: "El archivo debe ser una imagen"
**Solución:** Asegúrate de subir JPG, PNG, GIF o WebP

### Error en Backend: "Los campos url, publicId y kind son requeridos"
**Solución:** 
- Verifica que Cloudinary subió exitosamente
- Verifica que los parámetros se están pasando correctamente
- Revisa Network tab en DevTools

### Imagen no aparece en Cloudinary
**Solución:**
1. Verifica el `upload_preset` sea "Unsigned"
2. Verifica la carpeta `ids_usuarios` esté configurada
3. Intenta upload manual en dashboard de Cloudinary

---

## 📝 Checklist Final

- ✅ Cuenta de Cloudinary creada
- ✅ Cloud Name copiado
- ✅ Upload Preset creado (Unsigned)
- ✅ Variables de entorno configuradas
- ✅ Servidor reiniciado (`npm run dev`)
- ✅ `.env.local` en raíz del proyecto (no en `src/`)
- ✅ Variables visibles en DevTools console
- ✅ Probaste crear usuario con foto
- ✅ Foto aparece en Cloudinary dashboard

---

## 🎯 Archivos Actualizados

```
src/
├── lib/cloudinary.ts ← Mejorado
├── services/users.service.ts ← Actualizado
├── hooks/data/useUsers.ts ← Integrado
└── components/features/users/
    ├── UserForm.tsx (sin cambios)
    └── UsersPageContent.tsx (sin cambios)
```

---

## 📞 Quick Reference

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Tu cloud name de Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Tu upload preset (unsigned) |
| Folder en Cloudinary | `ids_usuarios` |
| Endpoint Backend | `POST /api/users/:id/pictures` |
| Campos requeridos | `url`, `publicId`, `kind` |
| Tipos de kind | `profile`, `document`, `evidence` |

---

## 🚀 ¡Listo!

Ahora cuando subas una foto:

```
Archivo local → Cloudinary → Backend → BD ✅
```

¡Disfruta! 🎉
