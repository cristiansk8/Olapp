import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/sync-user'
import { getParentCategories } from '@/lib/woocommerce'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    // Verificar que sea superusuario
    if (!currentUser?.isSuperUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Traer solo categorías padre (principales), incluyendo las vacías
    const categories = await getParentCategories({ hide_empty: false })

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener categorías' },
      { status: 500 }
    )
  }
}
