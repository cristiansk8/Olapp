import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/sync-user'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    // Verificar que sea superusuario
    if (!currentUser?.isSuperUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { hero, sliderItems, featuredCategories } = body

    // Obtener o crear el contenido de home
    let homeContent = await prisma.homePageContent.findFirst({
      where: { isActive: true },
    })

    if (!homeContent) {
      // Crear nuevo contenido
      homeContent = await prisma.homePageContent.create({
        data: {
          heroTitle: hero.title,
          heroSubtitle: hero.subtitle,
          heroCtaText: hero.ctaText,
          heroCtaLink: hero.ctaLink,
        },
      })
    } else {
      // Actualizar existente
      homeContent = await prisma.homePageContent.update({
        where: { id: homeContent.id },
        data: {
          heroTitle: hero.title,
          heroSubtitle: hero.subtitle,
          heroCtaText: hero.ctaText,
          heroCtaLink: hero.ctaLink,
        },
      })
    }

    // Eliminar slider items antiguos y crear nuevos
    await prisma.sliderItem.deleteMany({
      where: { homePageId: homeContent.id },
    })

    for (const item of sliderItems) {
      await prisma.sliderItem.create({
        data: {
          homePageId: homeContent.id,
          title: item.title,
          description: item.description,
          imageUrl: item.imageUrl,
          link: item.link,
          buttonText: item.buttonText,
          order: item.order || 0,
        },
      })
    }

    // Eliminar categorías antiguas y crear nuevas
    await prisma.featuredCategory.deleteMany({
      where: { homePageId: homeContent.id },
    })

    for (const cat of featuredCategories) {
      await prisma.featuredCategory.create({
        data: {
          homePageId: homeContent.id,
          wooCategoryId: cat.wooCategoryId,
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          order: cat.order || 0,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Contenido guardado exitosamente',
    })
  } catch (error: any) {
    console.error('Error saving home content:', error)
    return NextResponse.json(
      { error: error.message || 'Error al guardar el contenido' },
      { status: 500 }
    )
  }
}
