# Deployment con Supabase - Lecciones Aprendidas

## El Problema
Perdimos mucho tiempo intentando conectar Prisma a Supabase en Vercel/Netlify. El error era `Tenant or user not found` (Vercel) y `ENOTFOUND` (Netlify).

## La Solución
Las URLs de conexión de Supabase cambiaron. Estábamos usando el formato **antiguo**.

### ❌ FORMATO INCORRECTO (antiguo)
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### ✅ FORMATO CORRECTO (nuevo)
```
# Con pooling (Transaction mode) - Para DATABASE_URL
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Directo (Session mode) - Para DIRECT_URL
postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres
```

## Cambios Clave

1. **Usuario**: `postgres.zaphxqjjajrbemlvvfcw` (no solo `postgres`)
2. **Host**: `aws-1-sa-east-1.pooler.supabase.com` (regional pooler, no `db...supabase.co`)
3. **Puerto pooling**: `6543` con `?pgbouncer=true`
4. **Puerto directo**: `5432`

## Errores Comunes

| Error | Causa |
|-------|--------|
| `Tenant or user not found` | Usando `db...supabase.co` o formato antiguo |
| `ENOTFOUND` | Hostname incorrecto o no se puede resolver DNS |
| `getaddrinfo ENOTFOUND` | Usando host directo `db...supabase.co` en lugar de pooler regional |

## Cómo Obtener la URL Correcta

1. Ve a tu proyecto en **Supabase**
2. **Settings → Database**
3. Mira la sección **Connection String** o **Connection Pooling**
4. Copia la URL **Transaction mode** (para DATABASE_URL) y **Session mode** (para DIRECT_URL)
5. **IMPORTANTE**: El usuario incluye el project ref: `postgres.PROJECT_REF`

## Variables de Entorno Requeridas

Para Next.js con Prisma + Supabase:

```bash
# Base de datos
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-1-[REGION].pooler.supabase.com:5432/postgres"

# Autenticación
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
```

## Checklist para Deployment

Antes de hacer deploy a producción:

- [ ] Verificar que las URLs tengan el formato correcto
- [ ] Confirmar que el usuario sea `postgres.PROJECT_REF` (no solo `postgres`)
- [ ] Usar el host regional `pooler.supabase.com` (no `db...supabase.co`)
- [ ] Puerto 6543 con `?pgbouncer=true` para DATABASE_URL
- [ ] Puerto 5432 para DIRECT_URL
- [ ] Configurar variables en TODOS los entornos (Production, Preview, Development)
- [ ] Probar `/api/test-db` o endpoint similar antes de asumir que funciona

## Depuración

Si tienes problemas de conexión:

1. **Prueba primero en local** - Si funciona local pero no en producción, es un problema de configuración
2. **Usa `/api/check-env`** - Verifica que las variables se carguen correctamente
3. **Revisa el formato de la URL** - Copia directamente desde Supabase, no la escribas manualmente
4. **Verifica el proyecto de Supabase** - Asegúrate de estar en el proyecto correcto
5. **Región de Supabase** - La región en la URL debe coincidir con la de tu proyecto

## Recursos

- Supabase Docs: https://supabase.com/docs/guides/database/connecting-to-postgres
- Connection Pooling: https://supabase.com/docs/guides/database/connection-pooling
- Next.js Deployment: https://nextjs.org/docs/deployment

## Notas

- El formato antiguo (`db...supabase.co`) puede seguir funcionando en local porque tu máquina local puede resolverlo diferente
- Vercel/Netlify usan DNS diferente y pueden no encontrar el host antiguo
- Siempre usa las URLs que te muestra Supabase en su panel, no intentes construirlas manualmente
- Los project refs pueden ser necesarios para ciertas operaciones de conexión
