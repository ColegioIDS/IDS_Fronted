# Configuración de Timezone - Guatemala

## Descripción General

Toda la aplicación está configurada para usar automáticamente la zona horaria de **Guatemala (America/Guatemala, UTC-6)** para el manejo de fechas.

## ¿Por qué es importante?

- **Consistencia de datos**: Todas las fechas se envían y reciben en la misma zona horaria
- **Evita confusiones**: Eliminamos problemas de diferencias horarias entre cliente y servidor
- **Auditoría**: Todos los timestamps de creación/actualización están en hora Guatemala

## Configuración

### Variable de Entorno

```env
# .env.local o .env.production
NEXT_PUBLIC_TIMEZONE=America/Guatemala
```

### Valores Soportados

| Timezone | Offset | Uso |
|----------|--------|-----|
| `America/Guatemala` | UTC-6 | **RECOMENDADO** |
| `America/Mexico_City` | UTC-6 | Alternativa |
| `UTC` | UTC+0 | Solo si es necesario |

## Archivos Principales

### 1. `src/config/timezone.ts`
Funciones base para obtener fechas en la zona horaria configurada:
- `getTodayInConfiguredTimezone()` - Fecha actual (YYYY-MM-DD)
- `getNowTimeInConfiguredTimezone()` - Hora actual (HH:MM:SS)
- `getNowInConfiguredTimezone()` - Fecha y hora (YYYY-MM-DD HH:MM:SS)

### 2. `src/config/date-utils.ts`
Utilidades avanzadas para API:
- `formatDateForAPI(date)` - Convierte Date a YYYY-MM-DD
- `formatDateTimeForAPI(date)` - Convierte Date a ISO string
- `parseDateFromAPI(dateString)` - Parsea fecha del servidor
- `isValidDate(date)` - Valida que la fecha sea correcta
- `isDateOverdue(dueDate)` - Verifica si está vencida

## Cómo Usar

### En Componentes

```tsx
import { formatDateForAPI } from '@/config/date-utils';

// Enviar fecha al API
const dueDate = new Date('2025-12-25');
const formatted = formatDateForAPI(dueDate); // "2025-12-25"

await assignmentsService.createAssignment({
  dueDate: formatted,
  // ... otros campos
});
```

### En Servicios

```tsx
import { formatDateForAPI } from '@/config/date-utils';

async createAssignment(data: { dueDate: Date | string }): Promise<void> {
  const dueDateString = data.dueDate instanceof Date 
    ? formatDateForAPI(data.dueDate)
    : data.dueDate;

  await api.post('/assignments', {
    ...data,
    dueDate: dueDateString,
  });
}
```

### Para Fechas de Creación

```tsx
import { formatDateTimeForAPI } from '@/config/date-utils';

// Siempre que el servidor no lo haga automáticamente
const createdAt = formatDateTimeForAPI(); // "2025-12-10T14:30:45"
```

## Validación de Fechas

```tsx
import { isValidDate, isDateOverdue } from '@/config/date-utils';

const dueDate = new Date('2025-12-10');

// Validar
if (!isValidDate(dueDate)) {
  console.error('Fecha inválida');
}

// Verificar si está vencida
if (isDateOverdue(dueDate)) {
  console.log('La fecha de entrega ya pasó');
}
```

## Flujo de Datos

```
Cliente (Guatemala Time)
    ↓
formatDateForAPI() → Convierte a YYYY-MM-DD
    ↓
API Backend (Recibe en hora Guatemala)
    ↓
Almacena en BD (en hora Guatemala)
    ↓
API responde con fecha
    ↓
parseDateFromAPI() → Convierte a objeto Date
    ↓
Componente (muestra en hora Guatemala)
```

## Ejemplo Completo

### Crear Tarea

```tsx
import { formatDateForAPI } from '@/config/date-utils';
import { assignmentsService } from '@/services/assignments.service';

const handleCreateAssignment = async () => {
  const dueDateObj = new Date('2025-12-25');
  
  try {
    await assignmentsService.createAssignment({
      title: 'Examen Final',
      courseId: 5,
      bimesterId: 2,
      dueDate: dueDateObj, // El servicio lo convierte automáticamente
      maxScore: 100,
    });
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Notas Importantes

⚠️ **IMPORTANTE:**
- La variable `NEXT_PUBLIC_TIMEZONE` debe estar definida en `.env.local`
- Si no está definida, la app usa por defecto "America/Guatemala"
- Cambiar el timezone requiere reiniciar la aplicación

✅ **AUTOMATIZADO:**
- Los servicios de assignments ya usan `formatDateForAPI` automáticamente
- No necesitas hacer conversiones manuales en la mayoría de casos
- El componente `AssignmentDetailsDialog` valida fechas automáticamente

## Testing

Para verificar que la zona horaria está correcta:

```tsx
// En la consola del navegador
import { getNowInConfiguredTimezone } from '@/config/timezone';
console.log(getNowInConfiguredTimezone());
// Debería mostrar la hora actual en Guatemala
```

## Soporte

Si encuentras inconsistencias con fechas:
1. Verifica que `NEXT_PUBLIC_TIMEZONE` esté en `.env.local`
2. Reinicia el servidor de desarrollo (`npm run dev`)
3. Limpia el cache del navegador
4. Verifica los logs del backend para ver qué hora recibe

---

**Última actualización**: 10 de diciembre de 2025  
**Timezone**: America/Guatemala (UTC-6)
