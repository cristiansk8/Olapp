import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/sync-user'
import { prisma } from '@/lib/prisma'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Sincronizar usuario con la BD
  const dbUser = await getCurrentUser()

  // Obtener estadísticas reales
  const [businessesCount, ordersCount] = await Promise.all([
    prisma.business.count(),
    prisma.order.count(),
  ])

  // Productos vienen de WooCommerce, no de Prisma
  // TODO: Implementar fetch a WooCommerce API cuando tengamos la URL
  const productsCount = 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 pt-20">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-primary-900 dark:text-white">
            ¡Bienvenido, {dbUser?.name || user.email?.split('@')[0]}! 👋
          </h2>
          <p className="text-primary-600 dark:text-primary-400 mt-2 text-lg">
            Tu marketplace local en Milagro, Ecuador
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-primary-900 rounded-xl p-6 shadow-lg border border-primary-100 dark:border-primary-800 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  Negocios
                </p>
                <p className="text-4xl font-bold text-primary-900 dark:text-white mt-2">
                  {businessesCount}
                </p>
              </div>
              <div className="text-5xl">🏪</div>
            </div>
          </div>

          <div className="bg-white dark:bg-primary-900 rounded-xl p-6 shadow-lg border border-primary-100 dark:border-primary-800 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  Productos
                </p>
                <p className="text-4xl font-bold text-primary-900 dark:text-white mt-2">
                  {productsCount}
                </p>
              </div>
              <div className="text-5xl">📦</div>
            </div>
          </div>

          <div className="bg-white dark:bg-primary-900 rounded-xl p-6 shadow-lg border border-primary-100 dark:border-primary-800 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                  Pedidos
                </p>
                <p className="text-4xl font-bold text-primary-900 dark:text-white mt-2">
                  {ordersCount}
                </p>
              </div>
              <div className="text-5xl">🛒</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-primary-900 rounded-xl p-6 shadow-lg border border-primary-100 dark:border-primary-800">
          <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/dashboard/negocios/nuevo"
              className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-primary-300 dark:border-primary-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition group"
            >
              <div className="text-3xl group-hover:scale-110 transition">➕</div>
              <div>
                <p className="font-semibold text-primary-900 dark:text-white">
                  Nuevo Negocio
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Registra tu local
                </p>
              </div>
            </a>

            <a
              href="/dashboard/negocios"
              className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-primary-300 dark:border-primary-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition group"
            >
              <div className="text-3xl group-hover:scale-110 transition">🏪</div>
              <div>
                <p className="font-semibold text-primary-900 dark:text-white">
                  Mis Negocios
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Gestiona tus locales
                </p>
              </div>
            </a>

            <a
              href="/dashboard/productos"
              className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-primary-300 dark:border-primary-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition group"
            >
              <div className="text-3xl group-hover:scale-110 transition">📦</div>
              <div>
                <p className="font-semibold text-primary-900 dark:text-white">
                  Mis Productos
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Gestiona tu catálogo
                </p>
              </div>
            </a>

            <a
              href="/dashboard/pedidos"
              className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-primary-300 dark:border-primary-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/50 transition group"
            >
              <div className="text-3xl group-hover:scale-110 transition">🛒</div>
              <div>
                <p className="font-semibold text-primary-900 dark:text-white">
                  Pedidos
                </p>
                <p className="text-sm text-primary-600 dark:text-primary-400">
                  Ventas realizadas
                </p>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
