import 'dotenv/config'
import prisma from '../lib/prisma'

async function main() {
  console.log('🔍 Revisando categorías destacadas...\n')

  const homeContent = await prisma.homePageContent.findFirst({
    where: { isActive: true },
    include: {
      featuredCategories: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!homeContent) {
    console.log('❌ No hay contenido de home page activo')
    return
  }

  console.log(`📊 Total categorías: ${homeContent.featuredCategories.length}\n`)

  // Buscar duplicados por wooCategoryId
  const seen = new Map<number, number[]>()
  const duplicates: number[] = []

  homeContent.featuredCategories.forEach((cat, index) => {
    if (seen.has(cat.wooCategoryId)) {
      duplicates.push(cat.wooCategoryId)
      seen.get(cat.wooCategoryId)!.push(index)
    } else {
      seen.set(cat.wooCategoryId, [index])
    }
  })

  if (duplicates.length > 0) {
    console.log('⚠️  Categorías duplicadas por wooCategoryId:')
    duplicates.forEach(id => {
      console.log(`  - wooCategoryId ${id}: índices ${seen.get(id)!.join(', ')}`)
    })
    console.log()
  }

  // Mostrar todas las categorías
  console.log('📂 Categorías guardadas:')
  console.log('┌────┬───────────────────────┬──────────────┬──────────┬──────────────────────────┐')
  console.log('│ #  │ Nombre                 │ wooCategoryId│ Icono    │ Slug                      │')
  console.log('├────┼───────────────────────┼──────────────┼──────────┼──────────────────────────┤')

  homeContent.featuredCategories.forEach((cat, index) => {
    const icon = cat.icon || '⚠️ '
    const isDup = duplicates.includes(cat.wooCategoryId) ? ' ⚠️ DUPLICADO' : ''
    const hasIcon = cat.icon ? '✅' : '❌'

    console.log(
      `│ ${String(index + 1).padStart(2)} │ ${(cat.name + isDup).padEnd(23)} │ ${String(cat.wooCategoryId).padStart(12)} │ ${icon.padEnd(8)} │ ${cat.slug.padEnd(24)} │`
    )
  })

  console.log('└────┴───────────────────────┴──────────────┴──────────┴──────────────────────────┘')
  console.log()

  // Contar sin icono
  const withoutIcon = homeContent.featuredCategories.filter(cat => !cat.icon)
  if (withoutIcon.length > 0) {
    console.log(`❌ Categorías sin icono: ${withoutIcon.length}`)
    withoutIcon.forEach(cat => {
      console.log(`  - ${cat.name} (slug: ${cat.slug})`)
    })
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
