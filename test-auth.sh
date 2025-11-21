#!/bin/bash

# Script para testear la autenticación y cookies
# Uso: bash test-auth.sh

API_URL="http://127.0.0.1:5000"
FRONTEND_URL="http://127.0.0.1:3000"

echo "🔍 VERIFICANDO CONFIGURACIÓN DE COOKIES Y AUTENTICACIÓN"
echo "=================================================="
echo ""

# 1. Verificar que el backend está corriendo
echo "1️⃣ Verificando que el backend está corriendo en $API_URL..."
if curl -s "$API_URL/api/health" > /dev/null 2>&1 || curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ Backend está corriendo"
else
    echo "❌ Backend NO está disponible en $API_URL"
    echo "   Asegúrate de que el backend está corriendo"
    exit 1
fi
echo ""

# 2. Verificar CORS y cookies en login
echo "2️⃣ Verificando configuración de cookies en login..."
RESPONSE=$(curl -v -X POST "$API_URL/api/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@colegioids.com","password":"password"}' \
  2>&1)

# Buscar Set-Cookie en el response
if echo "$RESPONSE" | grep -q "Set-Cookie"; then
    echo "✅ Backend está enviando Set-Cookie headers"
    echo "   Detalles:"
    echo "$RESPONSE" | grep "Set-Cookie" | head -3
else
    echo "❌ Backend NO está enviando Set-Cookie headers"
    echo "   Verifica que el backend tiene:"
    echo "   - CORS con credentials: true"
    echo "   - cookieParser() middleware"
    echo "   - res.cookie() en auth.controller.ts"
fi
echo ""

# 3. Verificar que el frontend está corriendo
echo "3️⃣ Verificando que el frontend está corriendo en $FRONTEND_URL..."
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "✅ Frontend está corriendo"
else
    echo "❌ Frontend NO está disponible en $FRONTEND_URL"
    echo "   Asegúrate de que Next.js está corriendo"
    exit 1
fi
echo ""

# 4. Mostrar variables de entorno importantes
echo "4️⃣ Verificando variables de entorno..."
echo ""
echo "   Frontend:"
echo "   - NEXT_PUBLIC_API_URL debe ser: http://127.0.0.1:5000"
echo "   - Revisa en: /workspaces/IDS_Fronted/.env"
echo ""
echo "   Backend:"
echo "   - FRONTEND_URL debe ser: http://127.0.0.1:3000"
echo "   - NODE_ENV debe ser: development (para sameSite='lax')"
echo "   - Revisa en: .env del backend"
echo ""

# 5. Instrucciones finales
echo "5️⃣ PASOS PARA VERIFICAR:"
echo ""
echo "a) Abre DevTools (F12) en $FRONTEND_URL"
echo "b) Ve a Application → Cookies"
echo "c) Login con credenciales"
echo "d) ¿Ves la cookie 'authToken'? "
echo "   - SÍ: Recarga (F5) y verifica que aún está"
echo "   - NO: Verifica logs del backend"
echo ""

echo "6️⃣ DEBUGGING:"
echo ""
echo "En el navegador (DevTools):"
echo "- Network: Busca /api/auth/verify"
echo "- Headers: Verifica que se envía 'Cookie: authToken=...'"
echo "- Console: Busca 'ERROR' o '❌' messages"
echo ""
echo "En el backend:"
echo "- Busca logs de CORS"
echo "- Busca 'Set-Cookie' en responses"
echo ""
