import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/sync-user'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    // Verificar que sea superusuario
    if (!currentUser?.isSuperUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan JPG, PNG, WebP y GIF' },
        { status: 400 }
      )
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo es muy grande. Máximo 5MB' },
        { status: 400 }
      )
    }

    // Crear nombre único para el archivo
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const fileName = `logo-${timestamp}.${ext}`

    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Supabase Storage
    const supabase = await createClient()

    // Intentar subir al bucket 'logos'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading to Supabase Storage:', uploadError)

      // Si el bucket no existe, intentar crearlo
      if (uploadError.message.includes('The resource was not found')) {
        return NextResponse.json(
          {
            error: 'Bucket de logos no existe. Por favor crea el bucket "logos" en Supabase Storage',
            details: 'Ve a tu panel de Supabase > Storage > Create a new bucket > Name: logos > Public bucket: false',
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: 'Error al subir el archivo: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Obtener la URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName)

    const logoUrl = urlData.publicUrl

    // Obtener o crear el HomePageContent
    let homePage = await prisma.homePageContent.findFirst({
      where: { isActive: true },
    })

    if (homePage) {
      // Actualizar el logo
      homePage = await prisma.homePageContent.update({
        where: { id: homePage.id },
        data: { logoUrl },
      })
    } else {
      // Crear nuevo HomePageContent
      homePage = await prisma.homePageContent.create({
        data: { logoUrl, isActive: true },
      })
    }

    return NextResponse.json({
      success: true,
      logoUrl,
      message: 'Logo actualizado exitosamente',
    })
  } catch (error: any) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
