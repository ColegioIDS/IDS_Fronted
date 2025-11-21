# 🔗 CAMBIOS REQUERIDOS EN BACKEND

Este documento describe qué debe revisar/modificar en su backend para que las cookies funcionen correctamente con el frontend.

---

## ✅ Verificar CORS

### Archivo: `main.ts` o punto de entrada de NestJS

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CRÍTICO: CORS con credentials
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://127.0.0.1:3000',
    credentials: true,  // ✅ IMPORTANTE: Permite cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  });

  await app.listen(process.env.PORT || 5000);
}

bootstrap();
```

### Variables de Entorno (`.env` backend)

```env
FRONTEND_URL=http://127.0.0.1:3000
NODE_ENV=development
PORT=5000
```

---

## ✅ Verificar Cookie Parser

### Archivo: `main.ts`

```typescript
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ IMPORTANTE: cookieParser debe estar ANTES de CORS
  app.use(cookieParser());

  app.enableCors({
    origin: 'http://127.0.0.1:3000',
    credentials: true,
    // ... resto
  });

  await app.listen(5000);
}
```

**Instalar si no está:**
```bash
npm install cookie-parser
npm install --save-dev @types/cookie-parser
```

---

## ✅ Revisar Configuración de Cookies

### Archivo: `auth.controller.ts`

```typescript
import { Controller, Post, Body, Res, Get, UseGuards, Req } from '@nestjs/common';
import { Response, Request } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, token } = await this.authService.login(loginDto);

    const isProduction = process.env.NODE_ENV === 'production';

    // ✅ Configuración correcta de cookies
    res.cookie('authToken', token, {
      httpOnly: true,              // ✅ No accesible desde JS
      secure: isProduction,        // ❌ false en desarrollo, true en producción
      sameSite: isProduction ? 'strict' : 'lax',  // ✅ 'lax' en dev, 'strict' en prod
      maxAge: 24 * 60 * 60 * 1000, // ✅ 24 horas
      path: '/',                   // ✅ Accesible en todas las rutas
      domain: isProduction ? undefined : '127.0.0.1',  // ✅ Especificar en dev
    });

    return {
      success: true,
      user: new UserBasicResponseDto(user),
      // ✅ No retornar token en producción (está en cookie)
      token: isProduction ? undefined : token,
    };
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Req() req: Request) {
    // ✅ JWT Strategy debe extraer cookie correctamente
    console.log('🔍 Cookies:', req.cookies);
    console.log('👤 User:', req.user);

    if (!req.user) {
      throw new UnauthorizedException({
        success: false,
        message: 'No autenticado',
      });
    }

    return {
      success: true,
      data: req.user,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    // ✅ Limpiar cookie
    res.cookie('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 0,  // ✅ Esto elimina la cookie
      path: '/',
    });

    return {
      success: true,
      message: 'Sesión cerrada',
    };
  }
}
```

---

## ✅ JWT Strategy Correcta

### Archivo: `jwt.strategy.ts`

```typescript
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      // ✅ IMPORTANTE: Extraer JWT desde cookies
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // 1. Primero intenta extraer de cookies
          const token = request?.cookies?.authToken;
          if (token) {
            console.log('✅ Token extraído de cookie');
            return token;
          }

          // 2. Si no, intenta de header Authorization
          const authHeader = request?.headers?.authorization;
          if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts[0] === 'Bearer' && parts[1]) {
              console.log('✅ Token extraído de header');
              return parts[1];
            }
          }

          console.log('❌ No se encontró token');
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.id);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return user;
  }
}
```

---

## ✅ Variables de Entorno Backend

### Archivo: `.env` (backend)

```env
# AUTENTICACIÓN
JWT_SECRET=tu_secreto_super_seguro_minimo_32_caracteres_aqui
JWT_EXPIRATION=24h

# FRONTEND
FRONTEND_URL=http://127.0.0.1:3000

# COOKIES
NODE_ENV=development

# PUERTO
PORT=5000

# BASE DE DATOS
DATABASE_URL=postgresql://user:password@localhost:5432/ids_db
```

---

## 🧪 Test en Backend

### Verificar que cookies se envían

```bash
# 1. Test de login (debe retornar Set-Cookie)
curl -v -X POST http://127.0.0.1:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@colegioids.com","password":"password"}' \
  2>&1 | grep -i "set-cookie"

# Debe retornar algo como:
# Set-Cookie: authToken=eyJ...abc123...; HttpOnly; Path=/; Max-Age=86400; ...

# 2. Test con cookie (luego de obtener la cookie)
curl -v -X GET http://127.0.0.1:5000/api/auth/verify \
  -H "Cookie: authToken=eyJ...abc123..." \
  2>&1 | grep -i "success"

# Debe retornar:
# {"success":true,"data":{...}}
```

---

## ❌ Errores Comunes y Soluciones

### Error 1: "CORS policy: The value of the 'Access-Control-Allow-Credentials' header"

**Causa:** Faltan `credentials: true` en CORS o `withCredentials: true` en frontend

**Solución:**
```typescript
// Backend
app.enableCors({
  credentials: true,  // ✅ IMPORTANTE
});
```

---

### Error 2: "Cookie ... rejected because it has the SameSite=none attribute but is missing the required secure attribute"

**Causa:** Estás usando `sameSite: 'none'` sin `secure: true` en desarrollo

**Solución:**
```typescript
// Backend - Desarrollo
res.cookie('authToken', token, {
  secure: false,
  sameSite: 'lax',  // ✅ Cambiar a 'lax' en desarrollo
});
```

---

### Error 3: Frontend no recibe cookies

**Causa:** El backend no está enviando `Set-Cookie`

**Verificación:**
```bash
# En terminal, hacer curl con -v para ver headers
curl -v -X POST http://127.0.0.1:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass"}' 2>&1

# Buscar "Set-Cookie:" en el output
```

---

## ✅ Checklist Final (Backend)

- [ ] `app.enableCors({ credentials: true })` en main.ts
- [ ] `app.use(cookieParser())` en main.ts
- [ ] `res.cookie()` usa `httpOnly: true`
- [ ] `res.cookie()` usa `path: '/'`
- [ ] `res.cookie()` usa `sameSite: 'lax'` en desarrollo
- [ ] JWT Strategy extrae token desde cookies
- [ ] `verifyToken` endpoint retorna `{ success: true, data: {...} }`
- [ ] `.env` tiene `FRONTEND_URL` correcto
- [ ] `.env` tiene `NODE_ENV=development`
- [ ] JWT se limpia en logout (`maxAge: 0`)

---

## 📞 Referencia

### Documentos útiles:
- `COOKIES_DIAGNOSIS.md` - Guía de debugging
- `FIXES_SUMMARY.md` - Resumen de cambios
- `test-auth.sh` - Script de test automático

### Comandos útiles:
```bash
# Ver logs del backend
docker logs <container_name> -f

# Ver cookies guardadas en navegador
# DevTools → Application → Cookies

# Verificar que el middleware CORS está funcionando
curl -i -X OPTIONS http://127.0.0.1:5000/api/auth/signin \
  -H "Origin: http://127.0.0.1:3000" \
  -H "Access-Control-Request-Method: POST"
```

---

**Última actualización:** Noviembre 20, 2025
