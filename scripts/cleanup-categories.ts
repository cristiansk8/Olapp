import 'dotenv/config'
import { prisma } from '../lib/prisma'

async function main() {
  console.log('🧹 Limpiando categorías duplicadas...\n')

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

  const categories = homeContent.featuredCategories
  console.log(`📊 Total categorías antes: ${categories.length}\n`)

  // Encontrar duplicados por wooCategoryId
  const seen = new Set<number>()
  const toKeep: string[] = [] // IDs a mantener
  const toDelete: string[] = [] // IDs a eliminar

  categories.forEach((cat) => {
    if (seen.has(cat.wooCategoryId)) {
      // Ya existe uno con este wooCategoryId, marcar para eliminar
      toDelete.push(cat.id)
    } else {
      // Primera vez que vemos este wooCategoryId
      seen.add(cat.wooCategoryId)
      toKeep.push(cat.id)
    }
  })

  console.log(`📝 Manteniendo: ${toKeep.length} categorías`)
  console.log(`🗑️  Eliminando: ${toDelete.length} categorías duplicadas\n`)

  if (toDelete.length > 0) {
    console.log('Eliminando categorías duplicadas:')
    for (const id of toDelete) {
      const cat = categories.find(c => c.id === id)
      console.log(`  - ${cat?.name} (ID: ${id}, wooCategoryId: ${cat?.wooCategoryId})`)

      await prisma.featuredCategory.delete({
        where: { id },
      })
    }
  }

  // Recargar para verificar
  const updated = await prisma.homePageContent.findFirst({
    where: { id: homeContent.id },
    include: {
      featuredCategories: {
        orderBy: { order: 'asc' },
      },
    },
  })

  console.log(`\n✅ Total categorías después: ${updated?.featuredCategories.length || 0}\n`)

  // Mostrar categorías finales
  console.log('📂 Categorías finales:')
  console.log('┌────┬───────────────────────┬──────────────┬──────────┬──────────────────────────┐')
  console.log('│ #  │ Nombre                 │ wooCategoryId│ Icono    │ Slug                      │')
  console.log('├────┼───────────────────────┼──────────────┼──────────┼──────────────────────────┤')

  updated?.featuredCategories.forEach((cat, index) => {
    const icon = cat.icon || '⚠️ '
    const hasIcon = cat.icon ? '✅' : '❌'

    console.log(
      `│ ${String(index + 1).padStart(2)} │ ${cat.name.padEnd(23)} │ ${String(cat.wooCategoryId).padStart(12)} │ ${icon.padEnd(8)} │ ${cat.slug.padEnd(24)} │`
    )
  })

  console.log('└────┴───────────────────────┴──────────────┴──────────┴──────────────────────────┘')

  // Contar sin icono
  const withoutIcon = updated?.featuredCategories.filter(cat => !cat.icon) || []
  if (withoutIcon.length > 0) {
    console.log(`\n⚠️  Categorías sin icono: ${withoutIcon.length}`)
    withoutIcon.forEach(cat => {
      console.log(`  - ${cat.name} (slug: ${cat.slug}, wooCategoryId: ${cat.wooCategoryId})`)
    })
  } else {
    console.log('\n✅ Todas las categorías tienen icono')
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
