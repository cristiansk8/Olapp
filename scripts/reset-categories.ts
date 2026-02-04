import 'dotenv/config'
import prisma from '../lib/prisma'

// IDs correctos de las categorías padre en WooCommerce
const VALID_CATEGORY_IDS = [
  21, // Comida y Bebidas
  28, // Ropa y Accesorios
  34, // Artesanías y Arte
  39, // Servicios
  43, // Salud y Bienestar
  47, // Hogar
  52, // Educación
  56, // Entretenimiento
  60, // Tecnología
  64, // Belleza
  68, // Regalos
  72, // Infantil
  76, // Mascotas
  80, // Deportes
  84, // Negocios
  87, // Agricultura
]

const CATEGORY_ICONS: Record<number, string> = {
  21: '🍽️', // Comida y Bebidas
  28: '👕', // Ropa y Accesorios
  34: '🎨', // Artesanías y Arte
  39: '💼', // Servicios
  43: '🏥', // Salud y Bienestar
  47: '🏠', // Hogar
  52: '📚', // Educación
  56: '🎮', // Entretenimiento
  60: '📱', // Tecnología
  64: '💄', // Belleza
  68: '🎁', // Regalos
  72: '👶', // Infantil
  76: '🐾', // Mascotas
  80: '⚽', // Deportes
  84: '💼', // Negocios
  87: '🌱', // Agricultura
}

async function main() {
  console.log('🔄 Reseteando categorías a las 16 principales...\n')

  const homeContent = await prisma.homePageContent.findFirst({
    where: { isActive: true },
  })

  if (!homeContent) {
    console.log('❌ No hay contenido de home page activo')
    return
  }

  // Obtener todas las categorías actuales
  const currentCategories = await prisma.featuredCategory.findMany({
    where: { homePageId: homeContent.id },
  })

  console.log(`📊 Categorías actuales: ${currentCategories.length}`)

  // Categorías a eliminar (no están en la lista de válidas)
  const toDelete = currentCategories.filter(cat => !VALID_CATEGORY_IDS.includes(cat.wooCategoryId))

  console.log(`🗑️  Categorías obsoletas a eliminar: ${toDelete.length}\n`)

  if (toDelete.length > 0) {
    console.log('Eliminando:')
    for (const cat of toDelete) {
      console.log(`  - ${cat.name} (wooCategoryId: ${cat.wooCategoryId})`)
      await prisma.featuredCategory.delete({
        where: { id: cat.id },
      })
    }
    console.log()
  }

  // Actualizar iconos de las categorías válidas
  const validCategories = currentCategories.filter(cat => VALID_CATEGORY_IDS.includes(cat.wooCategoryId))

  console.log(`✅ Categorías válidas: ${validCategories.length}\n`)

  for (const cat of validCategories) {
    const correctIcon = CATEGORY_ICONS[cat.wooCategoryId]

    if (cat.icon !== correctIcon) {
      console.log(`📝 Actualizando icono de "${cat.name}": ${cat.icon} → ${correctIcon}`)

      await prisma.featuredCategory.update({
        where: { id: cat.id },
        data: { icon: correctIcon },
      })
    }
  }

  // Recargar para mostrar resultado final
  const final = await prisma.homePageContent.findFirst({
    where: { id: homeContent.id },
    include: {
      featuredCategories: {
        orderBy: { order: 'asc' },
      },
    },
  })

  console.log('\n✅ Listo! Categorías finales:\n')
  console.log('┌────┬───────────────────────┬──────────────┬──────────┬──────────────────────────┐')
  console.log('│ #  │ Nombre                 │ wooCategoryId│ Icono    │ Slug                      │')
  console.log('├────┼───────────────────────┼──────────────┼──────────┼──────────────────────────┤')

  final?.featuredCategories.forEach((cat, index) => {
    console.log(
      `│ ${String(index + 1).padStart(2)} │ ${cat.name.padEnd(23)} │ ${String(cat.wooCategoryId).padStart(12)} │ ${(cat.icon || '').padEnd(8)} │ ${cat.slug.padEnd(24)} │`
    )
  })

  console.log('└────┴───────────────────────┴──────────────┴──────────┴──────────────────────────┘')
  console.log(`\n📊 Total: ${final?.featuredCategories.length || 0} categorías`)
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
