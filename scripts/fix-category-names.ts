import 'dotenv/config'
import prisma from '../lib/prisma'

// Mapeo correcto de wooCategoryId a nombre
const CORRECT_NAMES: Record<number, string> = {
  21: 'Comida y Bebidas',
  28: 'Ropa y Accesorios',
  34: 'Artesanías y Arte',
  39: 'Servicios',
  43: 'Salud y Bienestar',
  47: 'Hogar', // Corregir: era "Arte"
  52: 'Educación',
  56: 'Entretenimiento',
  60: 'Tecnología',
  64: 'Belleza',
  68: 'Regalos',
  72: 'Infantil',
  76: 'Mascotas',
  80: 'Deportes',
  84: 'Negocios',
  87: 'Agricultura',
}

const CORRECT_SLUGS: Record<number, string> = {
  21: 'comida-bebidas',
  28: 'ropa-accesorios',
  34: 'artesanias-arte',
  39: 'servicios',
  43: 'salud-bienestar',
  47: 'hogar',
  52: 'educacion',
  56: 'entretenimiento',
  60: 'tecnologia',
  64: 'belleza',
  68: 'regalos',
  72: 'infantil',
  76: 'mascotas',
  80: 'deportes',
  84: 'negocios',
  87: 'agricultura',
}

const CATEGORY_ICONS: Record<number, string> = {
  21: '🍽️',
  28: '👕',
  34: '🎨',
  39: '💼',
  43: '🏥',
  47: '🏠', // Hogar
  52: '📚',
  56: '🎮',
  60: '📱',
  64: '💄',
  68: '🎁',
  72: '👶',
  76: '🐾',
  80: '⚽',
  84: '💼',
  87: '🌱',
}

async function main() {
  console.log('🔧 Corrigiendo nombres de categorías...\n')

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

  let updated = 0

  for (const cat of homeContent.featuredCategories) {
    const correctName = CORRECT_NAMES[cat.wooCategoryId]
    const correctSlug = CORRECT_SLUGS[cat.wooCategoryId]
    const correctIcon = CATEGORY_ICONS[cat.wooCategoryId]

    const needsUpdate =
      cat.name !== correctName ||
      cat.slug !== correctSlug ||
      cat.icon !== correctIcon

    if (needsUpdate) {
      console.log(`📝 Actualizando ${cat.name} (ID: ${cat.wooCategoryId}):`)
      console.log(`   Nombre: ${cat.name} → ${correctName}`)
      if (cat.slug !== correctSlug) {
        console.log(`   Slug: ${cat.slug} → ${correctSlug}`)
      }
      if (cat.icon !== correctIcon) {
        console.log(`   Icono: ${cat.icon} → ${correctIcon}`)
      }

      await prisma.featuredCategory.update({
        where: { id: cat.id },
        data: {
          name: correctName,
          slug: correctSlug,
          icon: correctIcon,
        },
      })

      updated++
      console.log()
    }
  }

  console.log(`✅ ${updated} categorías actualizadas\n`)

  // Recargar para mostrar resultado final
  const final = await prisma.homePageContent.findFirst({
    where: { id: homeContent.id },
    include: {
      featuredCategories: {
        orderBy: { order: 'asc' },
      },
    },
  })

  console.log('📂 Categorías finales:\n')
  console.log('┌────┬───────────────────────┬──────────────┬──────────┬──────────────────────────┐')
  console.log('│ #  │ Nombre                 │ wooCategoryId│ Icono    │ Slug                      │')
  console.log('├────┼───────────────────────┼──────────────┼──────────┼──────────────────────────┤')

  final?.featuredCategories.forEach((cat, index) => {
    console.log(
      `│ ${String(index + 1).padStart(2)} │ ${cat.name.padEnd(23)} │ ${String(cat.wooCategoryId).padStart(12)} │ ${(cat.icon || '').padEnd(8)} │ ${cat.slug.padEnd(24)} │`
    )
  })

  console.log('└────┴───────────────────────┴──────────────┴──────────┴──────────────────────────┘')
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
