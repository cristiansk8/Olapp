import prisma from '@/lib/prisma'

/**
 * Obtiene la URL del logo desde la base de datos
 * Si no existe, retorna la URL por defecto
 */
export async function getLogoUrl(): Promise<string> {
  try {
    const homeContent = await prisma.homePageContent.findFirst({
      where: { isActive: true },
      select: { logoUrl: true },
    })

    return homeContent?.logoUrl || '/ola-logo.JPG'
  } catch (error) {
    console.error('Error fetching logo URL:', error)
    return '/ola-logo.JPG'
  }
}
