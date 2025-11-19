#!/bin/bash

# 🔍 Script de Verificación del Módulo User Profile

echo "🔍 Verificando implementación del módulo User Profile..."
echo ""

# 1. Verificar estructura de archivos
echo "1️⃣ Verificando estructura de archivos..."
echo ""

FILES_TO_CHECK=(
  "src/app/(admin)/user-profile/page.tsx"
  "src/components/features/user-profile/UserProfileForm.tsx"
  "src/components/features/user-profile/UserProfilePageContent.tsx"
  "src/components/features/user-profile/UserProfileCard.tsx"
  "src/components/features/user-profile/UserNav.tsx"
  "src/components/features/user-profile/index.ts"
  "src/hooks/user-profile/useUserProfile.ts"
  "src/hooks/user-profile/index.ts"
  "src/services/user-profile.service.ts"
  "src/schemas/user-profile.schema.ts"
  "src/types/user-profile.types.ts"
)

missing_files=0
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file"
    missing_files=$((missing_files + 1))
  fi
done

echo ""
echo "Archivos encontrados: $((${#FILES_TO_CHECK[@]} - missing_files))/${#FILES_TO_CHECK[@]}"
echo ""

# 2. Verificar importaciones
echo "2️⃣ Verificando importaciones principales..."
echo ""

echo "Verificando useUserProfile hook..."
if grep -q "useUserProfile" src/components/features/user-profile/UserProfilePageContent.tsx; then
  echo "✅ useUserProfile importado correctamente"
else
  echo "❌ useUserProfile no encontrado"
fi

echo ""
echo "Verificando userProfileService..."
if grep -q "userProfileService" src/hooks/user-profile/useUserProfile.ts; then
  echo "✅ userProfileService importado correctamente"
else
  echo "❌ userProfileService no encontrado"
fi

echo ""

# 3. Verificar no haya emojis en componentes visibles
echo "3️⃣ Verificando que NO haya emojis en componentes..."
echo ""

EMOJI_PATTERN="[📀-🙏✏️➕❌⚠️]"
EMOJI_FILES=$(grep -r "$EMOJI_PATTERN" src/components/features/user-profile/ --include="*.tsx" 2>/dev/null | grep -v "node_modules" | grep -v "//" | wc -l)

if [ "$EMOJI_FILES" -eq 0 ]; then
  echo "✅ No se encontraron emojis en los componentes"
else
  echo "⚠️ Se encontraron $EMOJI_FILES líneas con posibles emojis"
fi

echo ""

# 4. Verificar validación Zod
echo "4️⃣ Verificando schema de validación..."
echo ""

if grep -q "updateUserProfileSchema" src/schemas/user-profile.schema.ts; then
  echo "✅ Schema de validación definido"
else
  echo "❌ Schema no encontrado"
fi

if grep -q "givenNames\|lastNames\|email" src/schemas/user-profile.schema.ts; then
  echo "✅ Campos de validación configurados"
else
  echo "❌ Campos no encontrados"
fi

echo ""

# 5. Verificar tipos TypeScript
echo "5️⃣ Verificando tipos TypeScript..."
echo ""

if grep -q "interface UserProfile" src/types/user-profile.types.ts; then
  echo "✅ Tipos UserProfile definidos"
else
  echo "❌ Tipos no encontrados"
fi

echo ""

# 6. Verificar servicio API
echo "6️⃣ Verificando servicio API..."
echo ""

if grep -q "getProfile\|updateProfile" src/services/user-profile.service.ts; then
  echo "✅ Métodos de servicio implementados"
else
  echo "❌ Métodos no encontrados"
fi

echo ""

# 7. Resumen
echo "================================"
echo "✅ VERIFICACIÓN COMPLETADA"
echo "================================"
echo ""
echo "Próximos pasos:"
echo "1. npm run dev - Iniciar servidor de desarrollo"
echo "2. Navegar a /user-profile - Probar página"
echo "3. Verificar consola - No debe haber errores"
echo ""
