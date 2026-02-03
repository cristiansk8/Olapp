import { NextRequest, NextResponse } from 'next/server';
import { getProducts, getCategories } from '@/lib/woocommerce';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const businessSlug = searchParams.get('business');
    const category = searchParams.get('category');

    if (businessSlug) {
      // Obtener productos de un negocio específico
      const business = await prisma.business.findUnique({
        where: { slug: businessSlug },
        select: { wooCategoryId: true }
      });

      if (!business?.wooCategoryId) {
        return NextResponse.json(
          { error: 'Negocio no encontrado o no tiene categoría de WooCommerce' },
          { status: 404 }
        );
      }

      const products = await getProducts({ category: business.wooCategoryId });
      return NextResponse.json(products);
    }

    if (category) {
      // Filtrar por categoría de WooCommerce
      const categories = await getCategories();
      const targetCategory = categories.find(c => c.slug === category);

      if (!targetCategory) {
        return NextResponse.json(
          { error: 'Categoría no encontrada' },
          { status: 404 }
        );
      }

      const products = await getProducts({ category: targetCategory.id });
      return NextResponse.json(products);
    }

    // Retornar todos los productos
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error en API de productos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
