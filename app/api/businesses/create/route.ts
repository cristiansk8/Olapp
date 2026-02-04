import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/sync-user'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const wooCategoryId = formData.get('wooCategoryId') as string
    const address = formData.get('address') as string
    const neighborhood = formData.get('neighborhood') as string
    const phone = formData.get('phone') as string
    const whatsapp = formData.get('whatsapp') as string
    const countryCode = formData.get('countryCode') as string
    const email = formData.get('email') as string
    const website = formData.get('website') as string
    const facebook = formData.get('facebook') as string
    const instagram = formData.get('instagram') as string
    const tiktok = formData.get('tiktok') as string
    const logo = formData.get('logo') as string
    const coverImage = formData.get('coverImage') as string
    const acceptsCash = formData.get('acceptsCash') === 'on'
    const acceptsTransfer = formData.get('acceptsTransfer') === 'on'
    const acceptsCard = formData.get('acceptsCard') === 'on'

    // Validaciones básicas
    if (!name || !address || !neighborhood || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Generar slug a partir del nombre
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Verificar si el usuario ya tiene un negocio (solo para no superusuarios)
    if (!currentUser.isSuperUser) {
      const existingBusinessCount = await prisma.business.count({
        where: { ownerId: currentUser.id },
      })

      if (existingBusinessCount > 0) {
        return NextResponse.json(
          { error: 'Solo puedes tener 1 negocio registrado' },
          { status: 400 }
        )
      }
    }

    // Crear negocio
    try {
      await prisma.business.create({
        data: {
          name,
          description,
          slug,
          wooCategoryId: wooCategoryId ? parseInt(wooCategoryId) : null,
          address,
          neighborhood,
          phone,
          whatsapp: whatsapp && countryCode ? `${countryCode} ${whatsapp}` : null,
          email: email || null,
          website: website || null,
          facebook: facebook || null,
          instagram: instagram || null,
          tiktok: tiktok || null,
          logo: logo || null,
          coverImage: coverImage || null,
          acceptsCash,
          acceptsTransfer,
          acceptsCard,
          ownerId: currentUser.id,
          status: 'PENDING',
          requiredConfirmations: 3,
        },
      })
    } catch (error: any) {
      // Manejar error de slug duplicado
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Ya existe un negocio con ese nombre' },
          { status: 400 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Negocio registrado exitosamente',
    })
  } catch (error: any) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear el negocio' },
      { status: 500 }
    )
  }
}
