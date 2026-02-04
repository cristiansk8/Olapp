import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/sync-user'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const currentUser = await getCurrentUser()

    // Verificar que sea superusuario
    if (!currentUser?.isSuperUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId } = await params
    const formData = await request.formData()
    const action = formData.get('action') as string

    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: { owner: true },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (action === 'approve') {
      // Aprobar negocio
      await prisma.business.update({
        where: { id: businessId },
        data: { status: 'VERIFIED' },
      })

      // TODO: Enviar email de notificación al dueño
      // await sendEmail(business.owner.email, 'Tu negocio ha sido aprobado', ...)

      return NextResponse.json({
        success: true,
        message: 'Negocio aprobado exitosamente',
      })
    } else if (action === 'reject') {
      // Rechazar negocio
      await prisma.business.update({
        where: { id: businessId },
        data: { status: 'REJECTED' },
      })

      // TODO: Enviar email de notificación al dueño
      // await sendEmail(business.owner.email, 'Tu negocio ha sido rechazado', ...)

      return NextResponse.json({
        success: true,
        message: 'Negocio rechazado',
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Error approving business:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
