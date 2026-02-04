import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/sync-user'
import prisma from '@/lib/prisma'
import Link from 'next/link'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

export default async function NegociosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()

  // Obtener negocios del usuario actual directamente desde Prisma
  const businesses = await prisma.business.findMany({
    where: currentUser?.isSuperUser
      ? undefined
      : { ownerId: currentUser?.id },
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
      logo: true,
      coverImage: true,
      facebook: true,
      instagram: true,
      tiktok: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Verificar si el usuario ya tiene un negocio (solo aplica a no superusuarios)
  const hasBusiness = businesses.length > 0
  const canCreateMore = currentUser?.isSuperUser || !hasBusiness

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">
              Mis Negocios
            </h1>
            <p className="text-primary-600 dark:text-primary-400">
              Gestiona tus locales y configúralos para el bot de Telegram
            </p>
          </div>
          {canCreateMore ? (
            <Link
              href="/dashboard/negocios/nuevo"
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              + Nuevo Negocio
            </Link>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                ℹ️ Solo puedes tener 1 negocio. Contacta a soporte para más información.
              </p>
            </div>
          )}
        </div>

        {/* Instrucciones para Telegram */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
            <span>📱</span>
            Configurar Bot de Telegram
          </h2>
          <div className="text-amber-800 dark:text-amber-200 space-y-2">
            <p>
              Para conectar tu negocio con el bot de Telegram:
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Copia el <strong>slug</strong> de tu negocio (ver abajo)</li>
              <li>Envía un mensaje al bot de Telegram con el formato:</li>
            </ol>
            <code className="block bg-amber-100 dark:bg-amber-900/40 px-4 py-2 rounded-lg mt-2 text-sm">
              /connect {`<slug>`}
            </code>
            <p className="text-sm mt-2">
              O usa la API: <code>POST /api/business/by-telegram</code> con <code>{"{{businessSlug, chatId}}"}</code>
            </p>
          </div>
        </div>

        {/* Lista de negocios */}
        {businesses.length === 0 ? (
          <div className="bg-white dark:bg-primary-900 rounded-xl p-12 shadow-lg text-center border border-primary-100 dark:border-primary-800">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
              No tienes negocios registrados
            </h3>
            <p className="text-primary-600 dark:text-primary-400 mb-6">
              Registra tu primer negocio para empezar a vender
            </p>
            {canCreateMore && (
              <Link
                href="/dashboard/negocios/nuevo"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition"
              >
                + Crear Negocio
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business: any) => (
              <div
                key={business.id}
                className="bg-white dark:bg-primary-900 rounded-xl shadow-lg hover:shadow-xl transition border border-primary-100 dark:border-primary-800 overflow-hidden"
              >
                {/* Cover Image or Status Badge */}
                {business.coverImage ? (
                  <div className="relative h-32 bg-primary-100 dark:bg-primary-800">
                    <img
                      src={business.coverImage}
                      alt="Portada"
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-2 right-2 px-3 py-1 text-xs font-semibold rounded-full ${
                      business.status === 'VERIFIED'
                        ? 'bg-green-500 text-white'
                        : business.status === 'REJECTED'
                        ? 'bg-red-500 text-white'
                        : 'bg-amber-500 text-white'
                    }`}>
                      {business.status === 'VERIFIED' ? '✅ Verificado' : business.status === 'REJECTED' ? '❌ Rechazado' : '⏳ Pendiente'}
                    </div>
                  </div>
                ) : (
                  <div className={`px-4 py-2 text-sm font-semibold text-center ${
                    business.status === 'VERIFIED'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : business.status === 'REJECTED'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  }`}>
                    {business.status === 'VERIFIED' ? '✅ Verificado' : business.status === 'REJECTED' ? '❌ Rechazado' : '⏳ Pendiente de validación'}
                  </div>
                )}

                <div className="p-6">
                  {/* Logo and Name */}
                  <div className="flex items-start gap-4 mb-4">
                    {business.logo ? (
                      <img
                        src={business.logo}
                        alt={business.name}
                        className="w-16 h-16 rounded-lg object-contain border border-primary-200 dark:border-primary-700 bg-primary-50 dark:bg-primary-950 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-800 flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">🏪</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-1 truncate">
                        {business.name}
                      </h3>
                      {business.description && (
                        <p className="text-sm text-primary-600 dark:text-primary-400 line-clamp-2">
                          {business.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm text-primary-700 dark:text-primary-300 mb-4">
                    {business.neighborhood && business.neighborhood !== 'Por actualizar' && (
                      <p className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{business.neighborhood}</span>
                      </p>
                    )}
                    {business.phone && business.phone !== '0000000000' && (
                      <p className="flex items-center gap-2">
                        <span>📞</span>
                        <span>{business.phone}</span>
                      </p>
                    )}
                    {business.whatsapp && (
                      <p className="flex items-center gap-2">
                        <span>💬</span>
                        <span>{business.whatsapp}</span>
                      </p>
                    )}
                    {business.wooCategoryId && (
                      <p className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <span>🛒</span>
                        <span>WooCommerce conectado</span>
                      </p>
                    )}
                  </div>

                  {/* Social Media */}
                  {(business.facebook || business.instagram || business.tiktok) && (
                    <div className="flex gap-2 mb-4">
                      {business.facebook && (
                        <a
                          href={business.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          title="Facebook"
                        >
                          📘
                        </a>
                      )}
                      {business.instagram && (
                        <a
                          href={business.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-700 dark:text-pink-400"
                          title="Instagram"
                        >
                          📸
                        </a>
                      )}
                      {business.tiktok && (
                        <a
                          href={business.tiktok}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-800 hover:text-gray-900 dark:text-gray-300"
                          title="TikTok"
                        >
                          🎵
                        </a>
                      )}
                    </div>
                  )}

                  {/* Slug para conectar con Telegram */}
                  <div className="bg-primary-50 dark:bg-primary-900/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-primary-600 dark:text-primary-400 mb-1">Slug (para conectar Telegram):</p>
                    <code className="text-sm font-mono text-primary-900 dark:text-white block break-all">
                      {business.slug}
                    </code>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/negocios/${business.slug}`}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center font-semibold py-2 px-4 rounded-lg transition"
                    >
                      Ver
                    </Link>
                    {business.wooCategoryId && (
                      <Link
                        href={`/dashboard/productos`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Productos
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
