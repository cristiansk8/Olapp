#!/usr/bin/env tsx
/**
 * Script para sincronizar el schema de Prisma con la base de datos de producción
 *
 * USO:
 * 1. Configura DATABASE_URL_PRODUCTION en .env con la URL de connection pooling de Supabase
 * 2. Ejecuta: pnpm db:push:prod
 */

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

// Leer el archivo .env
function parseEnvFile(): Record<string, string> {
  try {
    const envPath = join(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    const envVars: Record<string, string> = {}

    for (const line of envContent.split('\n')) {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        const value = valueParts.join('=').trim()
        if (key && value) {
          // Remover comillas si existen
          envVars[key] = value.replace(/^["']|["']$/g, '')
        }
      }
    }

    return envVars
  } catch (error) {
    console.error('Error al leer .env:', error)
    return {}
  }
}

// Main
console.log('🚀 Sincronizando schema con base de datos de producción...\n')

const env = parseEnvFile()
const prodUrl = env.DATABASE_URL_PRODUCTION

if (!prodUrl) {
  console.error('❌ ERROR: No se encontró DATABASE_URL_PRODUCTION en .env')
  console.error('\n📝 Pasos para configurar:')
  console.error('1. Ve a Supabase Dashboard → Settings → Database')
  console.error('2. Copia la URL de "Connection pooling" (Transaction mode)')
  console.error('3. Agrega esta línea a tu .env:')
  console.error('   DATABASE_URL_PRODUCTION="postgresql://postgres:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres"')
  process.exit(1)
}

// Validar que sea URL de pooling
if (!prodUrl.includes('pooler.supabase.com') && !prodUrl.includes(':6543')) {
  console.warn('⚠️  WARNING: La URL no parece ser de connection pooling')
  console.warn('   Debería usar pooler.supabase.com:6543 para evitar problemas de conexión\n')
}

try {
  // Establecer la variable de entorno temporalmente
  process.env.DATABASE_URL = prodUrl

  console.log('📡 URL de producción:', prodUrl.replace(/:[^:@]+@/, ':****@'))
  console.log('🔧 Ejecutando: prisma db push\n')

  // Ejecutar prisma db push
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: prodUrl }
  })

  console.log('\n✅ ¡Schema sincronizado exitosamente con producción!')
} catch (error) {
  console.error('\n❌ Error al sincronizar schema:', error)
  process.exit(1)
}
