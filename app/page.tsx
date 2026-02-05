import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/sync-user'
import Link from 'next/link'
import { HomeSlider } from '@/components/HomeSlider'
import { CategoryCarousel } from '@/components/CategoryCarousel'

// Forzar renderizado dinámico para evitar errores de build
export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentUser = null
  if (user) {
    currentUser = await getCurrentUser()
  }

  // Obtener contenido de home page
  const homeContent = await prisma.homePageContent.findFirst({
    where: { isActive: true },
    include: {
      sliderItems: { where: { isActive: true }, orderBy: { order: 'asc' } },
      featuredCategories: { where: { isActive: true }, orderBy: { order: 'asc' } },
    },
  })

  // Obtener negocios pendientes de verificación
  const pendingBusinesses = await prisma.business.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      owner: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950">
      {/* Slider Section */}
      {homeContent?.sliderItems && homeContent.sliderItems.length > 0 ? (
        <HomeSlider slides={homeContent.sliderItems} />
      ) : (
        /* Fallback Hero Section */
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <img
                src={homeContent?.logoUrl || '/ola-logo.JPG'}
                alt="OLAPP"
                className="h-32 w-auto object-contain"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-4">
              Tu marketplace local en Milagro, Ecuador 🇪🇨
            </h1>
            <p className="text-xl md:text-2xl text-primary-700 dark:text-primary-300 font-medium mb-8">
              {homeContent?.heroSubtitle || 'Descubre y compra en los mejores negocios locales. Desde la comodidad de tu hogar, apoya a los emprendedores de tu comunidad.'}
            </p>
            <p className="text-lg text-primary-600 dark:text-primary-400 max-w-2xl mx-auto mb-8">
              {homeContent?.heroTitle || 'Descubre y compra en los mejores negocios locales. Desde la comodidad de tu hogar, apoya a los emprendedores de tu comunidad.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!user ? (
                <>
                  <Link
                    href="/register"
                    className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition text-lg"
                  >
                    Únete Gratis
                  </Link>
                  <Link
                    href="/login"
                    className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50 font-semibold px-8 py-4 rounded-xl transition text-lg"
                  >
                    Iniciar Sesión
                  </Link>
                </>
              ) : currentUser?.role === 'BUSINESS' ? (
                <Link
                  href="/dashboard/negocios/nuevo"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition text-lg"
                >
                  Registrar Mi Negocio
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition text-lg"
                >
                  Ir al Dashboard
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Pending Businesses Banner */}
      {pendingBusinesses.length > 0 && (
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 border-2 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-4xl animate-pulse">✨</div>
                <div>
                  <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    Negocios Nuevos
                  </h2>
                  <p className="text-amber-700 dark:text-amber-300">
                    Ayuda a tu comunidad confirmando que estos negocios existen
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className="bg-white dark:bg-primary-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition border border-amber-100 dark:border-amber-800/50"
                  >
                    {/* Logo del negocio */}
                    <div className="h-40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center p-4">
                      {business.logo ? (
                        <img
                          src={business.logo}
                          alt={business.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-5xl">🏪</div>
                      )}
                    </div>

                    {/* Información del negocio */}
                    <div className="p-4">
                      <h3 className="font-bold text-primary-900 dark:text-white text-lg mb-4">
                        {business.name}
                      </h3>

                      {user && user.id !== business.ownerId && (
                        <form
                          action={async () => {
                            'use server'
                            const { default: prisma } = await import('@/lib/prisma')
                            const { getCurrentUser } = await import('@/lib/sync-user')

                            const currentUser = await getCurrentUser()
                            if (!currentUser) return

                            // Verificar si ya confirmó
                            const existing = await prisma.businessVerification.findFirst({
                              where: {
                                businessId: business.id,
                                userId: currentUser.id,
                              },
                            })

                            if (existing) return

                            // Crear confirmación
                            await prisma.businessVerification.create({
                              data: {
                                businessId: business.id,
                                userId: currentUser.id,
                              },
                            })

                            // Actualizar contador
                            const confirmations = await prisma.businessVerification.count({
                              where: { businessId: business.id },
                            })

                            // Si alcanza el umbral, verificar el negocio
                            if (confirmations >= business.requiredConfirmations) {
                              await prisma.business.update({
                                where: { id: business.id },
                                data: { status: 'VERIFIED', confirmationsCount: confirmations },
                              })
                            } else {
                              await prisma.business.update({
                                where: { id: business.id },
                                data: { confirmationsCount: confirmations },
                              })
                            }
                          }}
                        >
                          <button
                            type="submit"
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                          >
                            <span>✓</span> Confirmar que existe
                          </button>
                        </form>
                      )}

                      {!user && (
                        <div className="text-center text-sm text-amber-700 dark:text-amber-300 py-2">
                          <Link href="/login" className="underline font-semibold">
                            Inicia sesión
                          </Link>{' '}
                          para confirmar
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      {homeContent?.featuredCategories && homeContent.featuredCategories.length > 0 && (
        <CategoryCarousel categories={homeContent.featuredCategories} />
      )}

      {/* Features Section */}
      <section className="px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-6 text-center">
            ¿Por qué OLAPP?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-primary-900 rounded-xl p-6 shadow-lg border border-primary-100 dark:border-primary-800">
              <div className="text-4xl mb-4">🏘️</div>
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">
                100% Local
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Descubre negocios exclusivamente de Milagro. Apoya a tu comunidad y compra cerca de casa.
              </p>
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-xl p-6 shadow-lg border border-primary-100 dark:border-primary-800">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">
                Verificación Comunitaria
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Los negocios son validados por la comunidad. Si existe, tú mismo puedes confirmarlo.
              </p>
            </div>

            <div className="bg-white dark:bg-primary-900 rounded-xl p-6 shadow-lg border border-primary-100 dark:border-primary-800">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">
                Fácil y Rápido
              </h3>
              <p className="text-primary-600 dark:text-primary-400">
                Navega, ordena y recibe. Simple como debe ser. Sin complicaciones ni pasos extra.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
