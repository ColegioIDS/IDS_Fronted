# 🔐 RESUMEN DE CORRECCIONES - Problema de Cookies Desapareciendo

## 📋 Problema Original

Las cookies de autenticación se estaban eliminando al recargar la página, causando que el usuario perdiera la sesión.

---

## ✅ Cambios Realizados

### 1. **Variables de Entorno** (`.env`)
```env
# ANTES
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
COOKIE_DOMAIN=.127.0.0.1

# DESPUÉS (CORRECTO)
NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
COOKIE_DOMAIN=127.0.0.1  # ✅ Sin el punto al inicio
```

**Por qué:** Consistencia en nombres de variables y dominio correcto para cookies en localhost.

---

### 2. **API Client** (`src/config/api.ts`)
```typescript
// AGREGADO: Exportar API_BASE_URL para otros servicios
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,  // ✅ Usar la variable exportada
  timeout: 30000,
  withCredentials: true,  // ✅ CRÍTICO para cookies
  headers: { 'Content-Type': 'application/json' },
  validateStatus: () => true,
});
```

**Por qué:** `withCredentials: true` es OBLIGATORIO para que Axios envíe y reciba cookies.

---

### 3. **Servicio de Autenticación** (`src/services/authService.ts`)
```typescript
export const verifySession = async () => {
  try {
    const response = await api.get('/api/auth/verify');
    
    // ✅ ANTES: No validaba response.data.success
    // AHORA: Verifica correctamente
    if (!response.data.success || !response.data.data) {
      throw new Error('Sesión inválida');
    }
    
    const user = response.data.data;
    // ... resto del código
  } catch (error) {
    console.error("❌ verifySession error:", error);
    throw new Error('Sesión inválida');
  }
};
```

**Por qué:** Validación correcta de respuestas para evitar falsos positivos.

---

### 4. **Middleware** (`src/middleware.ts`)
```typescript
// ANTES: Solo verificaba rutas protegidas
// AHORA: Maneja todo el flujo de autenticación

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const pathname = request.nextUrl.pathname;

  // ✅ Si está en ruta auth sin token, permitir
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token) {
      // Redirigir a dashboard si ya está autenticado
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ✅ Si está en ruta protegida sin token, redirigir a signin
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/signin';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
```

**Por qué:** Middleware más robusto que valida cookies en ambas direcciones.

---

### 5. **AuthContext** (`src/context/AuthContext.tsx`)
```typescript
const checkAuth = useCallback(
  async (force = false) => {
    // ... código existente ...
    try {
      console.log('🔐 Verificando autenticación...');
      const userData = await verifySession();
      setUser(userData);
      setLastCheck(Date.now());
      await loadPermissions();
    } catch (error) {
      console.error("❌ Verificación fallida:", error);
      setUser(null);
      
      // ✅ NUEVO: Limpiar cookie inválida
      if (typeof window !== 'undefined') {
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  },
  [user, lastCheck, loadPermissions]
);

// ✅ NUEVO: Usar force = true al montar
useEffect(() => {
  checkAuth(true);
}, []);
```

**Por qué:** Fuerza verificación al cargar y limpia cookies inválidas.

---

## 🧪 Cómo Verificar que Funciona

### **Opción 1: Test Automático**
```bash
cd /workspaces/IDS_Fronted
bash test-auth.sh
```

### **Opción 2: Test Manual**
1. Abre DevTools (F12)
2. Tab "Application" → "Cookies" → `http://127.0.0.1:3000`
3. Login con tus credenciales
4. Verifica que ves `authToken` con un valor
5. **Recarga la página (F5)**
6. ¿Sigue ahí la cookie? → ✅ Funciona
7. ¿Se fue la cookie? → ❌ Verifica logs

---

## 🔍 Debugging

### **En el Navegador (DevTools)**

**Console Tab:**
```
Busca mensajes como:
✅ "🔐 Verificando autenticación..."
✅ "✅ Usuario verificado: {...}"
❌ "❌ Verificación fallida:" (problema)
```

**Network Tab:**
```
1. Recarga página (F5)
2. Busca request a "/api/auth/verify"
3. Headers:
   - REQUEST: ¿Ves "Cookie: authToken=..."?
   - RESPONSE: ¿Ves "Set-Cookie: authToken=..."?
```

**Application → Cookies:**
```
Verifica:
✅ authToken existe
✅ Domain: 127.0.0.1
✅ Path: /
✅ HttpOnly: checked
✅ Expires: fecha futura
```

### **En el Backend**

Busca logs que digan:
```
✅ "CORS verified with credentials"
✅ "Cookie set: authToken"
❌ "CORS error" (problema)
```

---

## 📋 Checklist de Verificación

- [x] `.env` tiene ambas variables API
- [x] `API_BASE_URL` se exporta desde `config/api.ts`
- [x] Axios client tiene `withCredentials: true`
- [x] `verifySession()` valida respuestas
- [x] Middleware protege rutas
- [x] AuthContext fuerza verificación al montar
- [x] Se limpia cookies inválidas
- [ ] Backend envía `Set-Cookie` headers
- [ ] Backend tiene `credentials: true` en CORS
- [ ] Backend usa `sameSite: 'lax'` en desarrollo

**⚠️ Nota:** Los dos últimos puntos deben estar en el backend.

---

## 🚀 Próximos Pasos

1. **Reinicia el frontend:**
   ```bash
   # Mata el proceso de Next.js y reinicia
   npm run dev
   ```

2. **Test en navegador:**
   - Login
   - Recarga página
   - Verifica DevTools

3. **Si sigue sin funcionar:**
   - Verifica que el backend tiene CORS correcto
   - Ejecuta `test-auth.sh`
   - Comparte logs del backend

---

## 📞 Soporte

Si aún tienes problemas:

1. Verifica `COOKIES_DIAGNOSIS.md` para debugging avanzado
2. Ejecuta `test-auth.sh` para diagnóstico automático
3. Usa el hook `useDebugAuth()` en cualquier página para ver logs
4. Comparte los logs del backend

---

## 🎯 Resultado Esperado

**Después de los cambios:**
- ✅ Cookie persiste después de F5
- ✅ Usuario no se desautentica al recargar
- ✅ Permisos se cargan correctamente
- ✅ No hay errores de autenticación

**Before (problema):**
```
1. Login → ✅ Funciona
2. F5 (Reload) → ❌ Se va a /signin
3. Cookie desaparece
```

**After (solucionado):**
```
1. Login → ✅ Funciona
2. F5 (Reload) → ✅ Sigue en /dashboard
3. Cookie persiste
4. Se verifica sesión automáticamente
```

---

## 📁 Archivos Modificados

```
/workspaces/IDS_Fronted/
├── .env (variable names fixed)
├── src/
│   ├── config/api.ts (export API_BASE_URL)
│   ├── context/AuthContext.tsx (checkAuth improvements)
│   ├── middleware.ts (router protection)
│   ├── services/authService.ts (verifySession validation)
│   └── hooks/useDebugAuth.ts (NEW - debugging hook)
├── COOKIES_DIAGNOSIS.md (NEW - diagnosis guide)
└── test-auth.sh (NEW - automated test)
```

---

**Última actualización:** Noviembre 20, 2025
