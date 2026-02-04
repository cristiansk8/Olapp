import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/sync-user';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeAll = searchParams.get('all') === 'true';

    // Si es admin o se pide todos, retornar todos
    // Si no, solo retornar los negocios del usuario
    const businesses = await prisma.business.findMany({
      where: includeAll || currentUser.role === 'ADMIN'
        ? undefined
        : { ownerId: currentUser.id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        neighborhood: true,
        phone: true,
        whatsapp: true,
        status: true,
        wooCategoryId: true,
        wooVendorId: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(businesses);
  } catch (error) {
    console.error('Error al obtener negocios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

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
      slug,
      description,
      address,
      neighborhood,
      phone,
      whatsapp,
      email,
      website,
    } = body;

    // Validaciones básicas
    if (!name || !slug || !address || !neighborhood || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Crear negocio
    const business = await prisma.business.create({
      data: {
        name,
        slug,
        description,
        address,
        neighborhood,
        phone,
        whatsapp,
        email,
        website,
        ownerId: currentUser.id,
        status: 'PENDING', // Requiere validación comunitaria
      },
    });

    return NextResponse.json({
      businessId: business.id,
      name: business.name,
      slug: business.slug,
      message: 'Negocio creado exitosamente. Pendiente de validación comunitaria.',
    });
  } catch (error) {
    console.error('Error al crear negocio:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
