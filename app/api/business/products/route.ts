import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/sync-user';
import { createCategory, createProduct, getCategories } from '@/lib/woocommerce';
import api from '@/lib/woocommerce';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    if (currentUser.role !== 'BUSINESS' && currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      short_description,
      description,
      regular_price,
      sale_price,
      stock_quantity,
      image,
    } = body;

    // Validaciones
    if (!name || !regular_price) {
      return NextResponse.json(
        { error: 'Nombre y precio regular son obligatorios' },
        { status: 400 }
      );
    }

    // Buscar el negocio del usuario
    const business = await prisma.business.findFirst({
      where: {
        ownerId: currentUser.id,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'No tienes un negocio registrado. Crea uno primero.' },
        { status: 400 }
      );
    }

    // Verificar si tiene wooCategoryId, si no, crear la categoría
    let wooCategoryId = business.wooCategoryId;

    if (!wooCategoryId) {
      // Crear categoría en WooCommerce
      const newCategory = await createCategory(
        business.name,
        {
          description: business.description || `Productos de ${business.name}`,
          slug: business.slug,
        }
      );

      if (!newCategory) {
        return NextResponse.json(
          { error: 'Error al crear la categoría en WooCommerce' },
          { status: 500 }
        );
      }

      wooCategoryId = newCategory.id;

      // Actualizar el negocio con el wooCategoryId
      await prisma.business.update({
        where: { id: business.id },
        data: { wooCategoryId },
      });
    }

    // Crear el producto en WooCommerce
    const productData: any = {
      name,
      type: 'simple',
      regular_price: regular_price.toString(),
      stock_quantity: stock_quantity || 100,
      manage_stock: true,
      stock_status: stock_quantity > 0 ? 'instock' : 'outofstock',
      categories: [{ id: wooCategoryId }],
      status: 'publish',
    };

    // Agregar campos opcionales
    if (short_description) {
      productData.short_description = short_description;
    }

    if (description) {
      productData.description = description;
    }

    if (sale_price && parseFloat(sale_price) < parseFloat(regular_price)) {
      productData.sale_price = sale_price.toString();
    }

    if (image) {
      // Por ahora usamos la imagen tal cual viene (data URL o URL)
      // TODO: Implementar upload a Cloudinary o S3
      productData.images = [
        {
          src: image,
        }
      ];
    }

    // Crear el producto
    const response = await api.post('products', productData);
    const wooProduct = response.data;

    return NextResponse.json({
      success: true,
      product: {
        id: wooProduct.id,
        name: wooProduct.name,
        price: wooProduct.regular_price,
      },
      message: 'Producto creado exitosamente',
    });
  } catch (error: any) {
    console.error('Error al crear producto:', error);

    // Proporcionar más detalles del error para debugging
    const errorMessage = error.response?.data?.message || error.message || 'Error al crear el producto';

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Buscar el negocio del usuario
    const business = await prisma.business.findFirst({
      where: {
        ownerId: currentUser.id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        wooCategoryId: true,
      },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'No tienes un negocio registrado' },
        { status: 404 }
      );
    }

    // Obtener productos del negocio desde WooCommerce
    if (!business.wooCategoryId) {
      return NextResponse.json({
        products: [],
        business: business,
        message: 'El negocio no tiene categoría de WooCommerce asignada',
      });
    }

    const response = await api.get('products', {
      category: business.wooCategoryId,
      per_page: 100,
      status: 'publish',
    });

    const products = response.data || [];

    return NextResponse.json({
      products,
      business,
      count: products.length,
    });
  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      {
        error: error.response?.data?.message || error.message || 'Error al obtener productos',
      },
      { status: 500 }
    );
  }
}
