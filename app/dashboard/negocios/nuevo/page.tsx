import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/sync-user'
import { prisma } from '@/lib/prisma'
import { getParentCategories } from '@/lib/woocommerce'
import { BusinessForm } from './business-form'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export default async function NuevoNegocioPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()

  // Verificar si el usuario ya tiene un negocio (solo para no superusuarios)
  if (currentUser && !currentUser.isSuperUser) {
    const existingBusinessCount = await prisma.business.count({
      where: { ownerId: currentUser.id },
    })

    if (existingBusinessCount > 0) {
      redirect('/dashboard/negocios')
    }
  }

  // Obtener categorías padre de WooCommerce
  const wooCategories = await getParentCategories({ hide_empty: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 pt-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">
            Registrar Nuevo Negocio
          </h1>
          <p className="text-primary-600 dark:text-primary-400">
            Completa el formulario para registrar un negocio en OLAPP.
            El negocio será verificado por la comunidad antes de hacerse visible.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg p-8 border border-primary-100 dark:border-primary-800">
          <BusinessForm wooCategories={wooCategories} />
        </div>
      </main>
    </div>
  )
}
