# 🔍 GUÍA DE DevTools - Debugging de Cookies

## 📍 Navegación en DevTools

### Abrir DevTools
- **Windows/Linux:** F12 o Ctrl+Shift+I
- **Mac:** Cmd+Option+I

---

## 🍪 Tab 1: Application → Cookies

### Verificar que la cookie persiste

**Antes de Login:**
```
Cookies para http://127.0.0.1:3000
(vacío - no hay cookies)
```

**Después de Login:**
```
Cookies para http://127.0.0.1:3000:

Name: authToken
Value: eyJ0eXAiOiJKV1QiLCJhbGc... (long JWT token)
Domain: 127.0.0.1
Path: /
Expires: [fecha futura]
HttpOnly: ✓ (checked)
Secure: ✗ (unchecked - normal en desarrollo)
SameSite: Lax
```

**Después de Reload (F5):**
```
La cookie "authToken" debe SEGUIR AQUÍ
(Si desaparece → PROBLEMA)
```

### Qué buscar:

| Campo | Esperado | Problema |
|-------|----------|----------|
| **Name** | `authToken` | ❌ Otro nombre o vacío |
| **Value** | `eyJ...` (JWT) | ❌ Vacío o muy corto |
| **Domain** | `127.0.0.1` | ❌ `.127.0.0.1` o `localhost` |
| **Path** | `/` | ❌ Otro valor |
| **HttpOnly** | ✓ Checked | ❌ Unchecked = vulnerable |
| **Secure** | ✗ En desarrollo | ⚠️ Checked en desarrollo = problema |
| **SameSite** | `Lax` | ❌ `Strict` o `None` sin Secure |

---

## 📡 Tab 2: Network

### Verificar que se envían cookies

**Paso 1: Abrir Network tab**
- DevTools → Network
- Limpiar (⚠️ icon)

**Paso 2: Hacer Login**
- Escribir credenciales
- Click en "Iniciar Sesión"

**Paso 3: Buscar `/api/auth/signin`**

#### En el REQUEST:
```
GET /api/auth/signin HTTP/1.1
Host: 127.0.0.1:5000
Origin: http://127.0.0.1:3000
Content-Type: application/json

(Body con email y password)
```

**Debe haber:**
```
General tab:
- Status: 200 OK ✅

Request Headers:
- Origin: http://127.0.0.1:3000 ✅
- Content-Type: application/json ✅
```

#### En el RESPONSE:
```
HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: authToken=eyJ...; Path=/; HttpOnly; SameSite=Lax
Access-Control-Allow-Credentials: true

{
  "success": true,
  "user": {...},
  "token": "eyJ..." (opcional en desarrollo)
}
```

**Debe haber:**
```
Response Headers:
- Set-Cookie: authToken=... ✅
- Access-Control-Allow-Credentials: true ✅
- Access-Control-Allow-Origin: http://127.0.0.1:3000 ✅
```

---

### Verificar que se ENVÍA la cookie después

**Paso 1: Recargar página (F5)**

**Paso 2: Network → Buscar `/api/auth/verify`**

#### En el REQUEST:
```
GET /api/auth/verify HTTP/1.1
Host: 127.0.0.1:5000
Origin: http://127.0.0.1:3000

Headers:
- Cookie: authToken=eyJ... ✅ (LA COOKIE SE ENVÍA)
```

**SI NO VES "Cookie:" → PROBLEMA**
- El frontend no está enviando `withCredentials: true`
- O la cookie se eliminó

#### En el RESPONSE:
```
HTTP/1.1 200 OK
{
  "success": true,
  "data": {
    "id": "1",
    "email": "user@test.com",
    ...
  }
}
```

---

## 📝 Tab 3: Console

### Buscar errores de autenticación

**Logs esperados:**
```
🔐 Verificando autenticación...
✅ Usuario verificado: {id: "1", fullName: "Juan Pérez", ...}
✅ Session verified: {...}
```

**Si ves errores como:**
```
❌ Verificación fallida: Error: Sesión inválida
❌ verifySession error: Error: Sesión inválida
⚠️ CORS policy error
```

**Qué buscar:**
- `Error` (rojo) = Problema
- `❌` (emoji) = Fallo
- `✅` (emoji) = Éxito
- `🔐` (emoji) = Log de verificación

### Debugging con el hook

**Si agregaste en una página:**
```tsx
import { useDebugAuth } from '@/hooks/useDebugAuth';

export default function YourPage() {
  useDebugAuth();  // Muestra info en console
  // ...
}
```

**Verás en Console:**
```
🔐 DEBUG AUTH
📍 URL: http://127.0.0.1:3000/dashboard
🍪 Cookies: { authToken: "eyJ..." }
👤 User: { id: "1", fullName: "Juan Pérez", ... }
✅ Is Authenticated: true
⏳ Is Loading: false
📦 LocalStorage authToken: null
🌐 Origin: http://127.0.0.1:3000
📡 API URL: http://127.0.0.1:5000
```

---

## 🔄 Flujo Completo de Testing

### 1. Antes de Login
```
Network: (vacío)
Console: (sin logs)
Cookies: (vacío)
```

### 2. Durante Login
```
Network: POST /api/auth/signin
Response Headers: Set-Cookie: authToken=...
Console: ✅ Usuario autenticado
Cookies: authToken = eyJ...
```

### 3. Inmediatamente después (sin recargar)
```
Network: GET /api/auth/verify
Request Headers: Cookie: authToken=...
Console: ✅ Usuario verificado
Cookies: authToken = eyJ...
```

### 4. DESPUÉS DE RELOAD (F5) ← CRÍTICO
```
Network: GET /api/auth/verify (DEBE enviarse automáticamente)
Request Headers: Cookie: authToken=... (LA COOKIE DEBE ESTAR)
Console: 🔐 Verificando autenticación...
         ✅ Usuario verificado
Cookies: authToken = eyJ... (DEBE SEGUIR AQUÍ)
```

**Si en el paso 4 la cookie desaparece → PROBLEMA**

---

## 🚨 Problemas Comunes

### Problema 1: "Cookie: authToken=..." NO aparece en Request Headers

**Diagnóstico:**
- En Network → Request Headers
- No ves "Cookie: authToken=..."

**Causas:**
1. Frontend no tiene `withCredentials: true` ✅ Ya arreglado
2. Cookie se eliminó
3. Domain no coincide

**Solución:**
```javascript
// En browser console:
console.log(document.cookie);  // ¿Ves authToken?
```

---

### Problema 2: Set-Cookie NO aparece en Response Headers

**Diagnóstico:**
- En Network → Response Headers del /signin
- No ves "Set-Cookie: authToken=..."

**Causas:**
1. Backend no está configurando cookies
2. Backend no tiene `credentials: true` en CORS
3. Backend no tiene `cookieParser()`

**Solución:**
- Verificar backend según `BACKEND_COOKIES_GUIDE.md`

---

### Problema 3: Cookie desaparece después de F5

**Diagnóstico:**
- En Application → Cookies
- Antes de F5: ves authToken
- Después de F5: no ves authToken

**Causas:**
1. Cookie tiene `maxAge` muy corto
2. Cookie tiene `secure: true` pero estamos en HTTP
3. `sameSite: 'none'` sin `secure: true`

**Solución:**
```bash
# En backend, verifica que cookie tiene:
- httpOnly: true
- maxAge: 24 * 60 * 60 * 1000  (24 horas)
- sameSite: 'lax'               (en desarrollo)
- secure: false                 (en desarrollo)
- path: '/'
```

---

### Problema 4: CORS Error

**Error en Console:**
```
Access to XMLHttpRequest at 'http://127.0.0.1:5000/api/auth/signin' 
from origin 'http://127.0.0.1:3000' has been blocked by CORS policy
```

**Causas:**
1. Backend no tiene `enableCors()`
2. Backend no tiene `credentials: true`
3. Origins no coinciden

**Solución:**
```typescript
// Backend - main.ts
app.enableCors({
  origin: 'http://127.0.0.1:3000',
  credentials: true,  // ✅ CRÍTICO
});
```

---

## 📋 Checklist Rápido de DevTools

```
ANTES DE LOGIN:
☐ Application → Cookies: (vacío)
☐ Console: (sin errores)

DESPUÉS DE LOGIN:
☐ Application → Cookies: ves authToken
☐ Console: ✅ Usuario autenticado
☐ Network → signin: Response headers have Set-Cookie

DESPUÉS DE RELOAD (F5):
☐ Application → Cookies: authToken SIGUE AHÍ ✨ CRÍTICO
☐ Console: 🔐 Verificando autenticación...
☐ Console: ✅ Usuario verificado
☐ Network → verify: Request headers have Cookie: authToken=...
☐ URL: http://127.0.0.1:3000/dashboard (NO /signin)
```

---

## 🎯 Resultado Final

**✅ FUNCIONA CORRECTAMENTE:**
```
1. Login → Cookie creada ✅
2. F5 (Reload) → Cookie persiste ✅
3. /api/auth/verify se llama automáticamente ✅
4. Usuario sigue autenticado ✅
```

**❌ NO FUNCIONA:**
```
1. Login → Cookie creada ✅
2. F5 (Reload) → Cookie desaparece ❌
3. Redirige a /signin ❌
4. Error "Sesión inválida" ❌
```

---

**Última actualización:** Noviembre 20, 2025
