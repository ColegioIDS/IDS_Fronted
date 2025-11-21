# 🔍 GUÍA DE DIAGNÓSTICO - Cookies Desapareciendo en Reload

## ✅ Cambios Realizados en el Frontend

### 1. **Variables de Entorno (.env)**
- ✅ Agregado `NEXT_PUBLIC_API_BASE_URL` (consistencia)
- ✅ Cambiado `COOKIE_DOMAIN` de `.127.0.0.1` a `127.0.0.1`

### 2. **API Client (src/config/api.ts)**
- ✅ Corregido `baseURL` para usar `NEXT_PUBLIC_API_URL`
- ✅ Confirmado `withCredentials: true` (crítico para cookies)

### 3. **Servicio de Autenticación (src/services/authService.ts)**
- ✅ Mejorado `verifySession()` para validar correctamente las respuestas

### 4. **Middleware (src/middleware.ts)**
- ✅ Ahora verifica cookies y redirige adecuadamente
- ✅ Protege rutas `/dashboard`, `/profile`, `/admin`

### 5. **AuthContext (src/context/AuthContext.tsx)**
- ✅ `checkAuth()` ahora limpia cookies inválidas
- ✅ `useEffect` fuerza verificación al montar (`force = true`)

---

## 🧪 Verificación Paso a Paso

### **Paso 1: Abre DevTools (F12)**

```
Pasos:
1. F12 para abrir DevTools
2. Tab "Application"
3. Sección "Cookies"
4. Selecciona http://127.0.0.1:3000
```

### **Paso 2: Login**

```
1. Ve a http://127.0.0.1:3000/signin
2. Ingresa credenciales
3. Haz clic en "Iniciar Sesión"
4. En DevTools → Application → Cookies:
   - ¿Ves "authToken"?
   - ¿Tiene un valor (no vacío)?
```

### **Paso 3: Recarga la Página**

```
1. Presiona F5 o Ctrl+R
2. En DevTools → Application → Cookies:
   - ¿Está "authToken" TODAVÍA ahí?
   - ¿Sin el token, se redirige a /signin?
   - ¿CON el token, te mantiene en /dashboard?
```

### **Paso 4: Verifica los Logs**

```
1. Abre DevTools → Console
2. Busca logs que digan:
   - "🔐 Verificando autenticación..."
   - "✅ Usuario verificado:"
   - "❌ Verificación fallida:" (malo)
```

### **Paso 5: Verifica Network**

```
1. DevTools → Network
2. Recarga la página (F5)
3. Busca una petición a /api/auth/verify
4. En los Headers de REQUEST:
   - ¿Ves "Cookie: authToken=..."?
   - Si no → PROBLEMA en frontend
5. En los Headers de RESPONSE:
   - ¿Ves "Set-Cookie: authToken=..."?
   - Si no → PROBLEMA en backend
```

---

## 🚨 Troubleshooting

### **Problema 1: Cookie desaparece al recargar**

**Checklist:**
```
☐ Cookie tiene httpOnly: true (backend)
☐ Cookie tiene path: / (backend)
☐ Cookie tiene maxAge > 0 (backend)
☐ sameSite: 'lax' en desarrollo (backend)
☐ withCredentials: true en axios (frontend) ✅ Ya hecho
```

**Solución rápida (Backend):**
```typescript
res.cookie('authToken', token, {
  httpOnly: true,
  secure: false,           // En desarrollo
  sameSite: 'lax',         // En desarrollo
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
});
```

### **Problema 2: Cookie no se envía en requests posteriores**

**Causa:** Frontend no está enviando `credentials: 'include'`

**Verificación:**
- En DevTools → Network → Request Headers
- ¿Ves `Cookie: authToken=...`?
- Si NO → Problema en frontend

**Ya está arreglado:**
```typescript
// src/config/api.ts
const api = axios.create({
  withCredentials: true,  // ✅ Esto envía cookies automáticamente
  // ...
});
```

### **Problema 3: "Cannot set SameSite=none without Secure"**

**Causa:** Estás usando `sameSite: 'none'` en desarrollo

**Solución (Backend):**
```typescript
sameSite: isProduction ? 'none' : 'lax',  // 'lax' en dev, 'none' en prod
secure: isProduction,                      // false en dev
```

---

## 📝 Checklist de Configuración

### **Backend** (API)
- [ ] CORS tiene `credentials: true`
- [ ] Usa `cookieParser()`
- [ ] Cookie tiene `httpOnly: true`
- [ ] Cookie tiene `path: '/'`
- [ ] `sameSite` es `'lax'` en desarrollo
- [ ] `secure` es `false` en desarrollo

### **Frontend** (Next.js)
- [x] `.env` tiene `NEXT_PUBLIC_API_URL`
- [x] API client tiene `withCredentials: true`
- [x] `verifySession()` valida respuestas correctamente
- [x] `AuthContext` verifica sesión al montar
- [x] Middleware protege rutas

---

## 🎯 Próximos Pasos

1. **Recarga tu aplicación** (hot reload puede cachear cosas)
2. **Limpia cookies del navegador** (Settings → Cookies → Eliminar todo)
3. **Login nuevamente**
4. **Recarga la página**
5. **Abre DevTools y verifica que la cookie persiste**

---

## 📊 Debugging Avanzado

### **Usar el hook de debug:**

```tsx
// En cualquier página protegida, agrega:
import { useDebugAuth } from '@/hooks/useDebugAuth';

export default function YourPage() {
  useDebugAuth();  // Mostrará info en console
  // ...
}
```

**Output esperado en Console:**
```
🔐 DEBUG AUTH
📍 URL: http://127.0.0.1:3000/dashboard
🍪 Cookies: { authToken: "eyJ..." }
👤 User: { id: "1", fullName: "Juan Pérez", ... }
✅ Is Authenticated: true
⏳ Is Loading: false
📦 LocalStorage authToken: null (es OK si usas cookies)
🌐 Origin: http://127.0.0.1:3000
📡 API URL: http://127.0.0.1:5000
```

---

## ❌ Si Aún No Funciona

Comparte en terminal:
```bash
# Ver logs del backend
docker logs <nombre_contenedor_backend>

# O si no usas docker:
tail -f <archivo_logs_backend>
```

Busca mensajes de error sobre cookies o CORS en los logs.
