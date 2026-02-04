import 'dotenv/config'
import prisma from '../lib/prisma'

async function main() {
  console.log('🧹 Limpiando contenido duplicado de home page...')

  // Obtener todos los HomePageContent
  const allHomeContents = await prisma.homePageContent.findMany({
    include: {
      sliderItems: true,
      featuredCategories: true,
    },
  })

  console.log(`📊 Encontrados ${allHomeContents.length} registros de home page content`)

  if (allHomeContents.length <= 1) {
    console.log('✅ No hay duplicados. Todo está bien.')
    return
  }

  // Mantener solo el primero (más antiguo)
  const toKeep = allHomeContents[0]
  const toDelete = allHomeContents.slice(1)

  console.log(`\n📝 Manteniendo: ID ${toKeep.id} (creado: ${toKeep.createdAt})`)
  console.log(`📝 Manteniendo ${toKeep.sliderItems.length} slider items`)
  console.log(`📝 Manteniendo ${toKeep.featuredCategories.length} categorías`)

  // Marcar otros como inactivos
  for (const homeContent of toDelete) {
    console.log(`\n❌ Desactivando: ID ${homeContent.id} (creado: ${homeContent.createdAt})`)

    await prisma.homePageContent.update({
      where: { id: homeContent.id },
      data: { isActive: false },
    })
  }

  // Verificar que solo queda uno activo
  const activeCount = await prisma.homePageContent.count({
    where: { isActive: true },
  })

  console.log(`\n✅ Listo! Ahora hay ${activeCount} registro(s) activo(s)`)

  // Mostrar categorías activas
  const activeHome = await prisma.homePageContent.findFirst({
    where: { isActive: true },
    include: {
      featuredCategories: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (activeHome) {
    console.log('\n📂 Categorías activas:')
    for (const cat of activeHome.featuredCategories) {
      console.log(`  ${cat.icon || '📁'} ${cat.name} (wooCategoryId: ${cat.wooCategoryId})`)
    }
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
