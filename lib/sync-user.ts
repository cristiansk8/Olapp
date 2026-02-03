import { prisma } from './prisma'
import { createClient } from './supabase/server'

/**
 * Sincroniza el usuario de Supabase Auth con la base de datos Prisma
 * Crea el registro si no existe, actualiza si es necesario
 */
export async function syncUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Buscar usuario existente por email
  let dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
  })

  // Si no existe, crearlo
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email!.split('@')[0],
        role: (user.user_metadata?.role || 'CUSTOMER') as 'CUSTOMER' | 'BUSINESS' | 'ADMIN',
        phone: user.user_metadata?.phone,
        avatar: user.user_metadata?.avatar_url,
        address: user.user_metadata?.address,
        neighborhood: user.user_metadata?.neighborhood,
      },
    })
  } else {
    // Actualizar si cambió el nombre u otros datos
    const needsUpdate =
      dbUser.name !== (user.user_metadata?.name || user.email!.split('@')[0]) ||
      dbUser.avatar !== user.user_metadata?.avatar_url

    if (needsUpdate) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          name: user.user_metadata?.name || user.email!.split('@')[0],
          avatar: user.user_metadata?.avatar_url,
        },
      })
    }
  }

  return dbUser
}

/**
 * Obtiene el usuario actual sincronizado con la BD
 */
export async function getCurrentUser() {
  return await syncUser()
}
