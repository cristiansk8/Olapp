import { NextRequest, NextResponse } from 'next/server'
import { getParentCategories } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  try {
    // Traer solo categorías padre (principales), incluyendo las vacías
    const categories = await getParentCategories({ hide_empty: false })

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.count,
        image: cat.image,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        error: error.message || 'Error al obtener categorías',
        details: error.toString(),
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
