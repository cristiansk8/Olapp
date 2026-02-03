import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/sync-user'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getPendingBusinesses() {
  return await prisma.business.findMany({
    where: { status: 'PENDING' },
    include: { owner: true },
    orderBy: { createdAt: 'desc' },
  })
}

async function getVerifiedBusinesses() {
  return await prisma.business.findMany({
    where: { status: 'VERIFIED' },
    include: { owner: true },
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()

  // Verificar que sea superusuario
  if (!currentUser?.isSuperUser) {
    redirect('/dashboard')
  }

  const pendingBusinesses = await getPendingBusinesses()
  const verifiedBusinesses = await getVerifiedBusinesses()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">
            👨‍💼 Panel de Administración
          </h1>
          <p className="text-primary-600 dark:text-primary-400">
            Gestiona OLAPP y aprueba nuevos negocios
          </p>
        </div>

        {/* Admin Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin"
            className="bg-primary-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition"
          >
            <div className="text-3xl mb-2">🏪</div>
            <h3 className="font-bold text-lg">Negocios Pendientes</h3>
            <p className="text-sm opacity-90">{pendingBusinesses.length} por revisar</p>
          </Link>

          <Link
            href="/admin"
            className="bg-white dark:bg-primary-900 text-primary-900 dark:text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-primary-100 dark:border-primary-800"
          >
            <div className="text-3xl mb-2">✅</div>
            <h3 className="font-bold text-lg">Negocios Verificados</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400">{verifiedBusinesses.length} activos</p>
          </Link>

          <Link
            href="/admin/home"
            className="bg-white dark:bg-primary-900 text-primary-900 dark:text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition border border-primary-100 dark:border-primary-800"
          >
            <div className="text-3xl mb-2">🏠</div>
            <h3 className="font-bold text-lg">Editar Home Page</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400">Slider y categorías</p>
          </Link>
        </div>

        {/* Pending Businesses */}
        <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-100 dark:border-primary-800 p-6">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
            Negocios por Aprobar ({pendingBusinesses.length})
          </h2>

          {pendingBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-primary-600 dark:text-primary-400">
                No hay negocios pendientes de aprobación
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBusinesses.map((business: any) => (
                <div
                  key={business.id}
                  className="border border-primary-200 dark:border-primary-700 rounded-lg p-6 hover:border-primary-400 dark:hover:border-primary-600 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">
                        {business.name}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 mb-3">
                        {business.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-primary-500 dark:text-primary-500">Dueño:</p>
                          <p className="text-primary-900 dark:text-white font-medium">
                            {business.owner.name || business.owner.email}
                          </p>
                          <p className="text-xs text-primary-500">{business.owner.email}</p>
                        </div>

                        <div>
                          <p className="text-primary-500 dark:text-primary-500">Ubicación:</p>
                          <p className="text-primary-900 dark:text-white font-medium">
                            {business.address}
                          </p>
                          <p className="text-xs text-primary-500">{business.neighborhood}</p>
                        </div>

                        <div>
                          <p className="text-primary-500 dark:text-primary-500">Contacto:</p>
                          <p className="text-primary-900 dark:text-white font-medium">
                            {business.phone}
                          </p>
                          {business.whatsapp && (
                            <p className="text-xs text-primary-500">WhatsApp: {business.whatsapp}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-primary-500 dark:text-primary-500">Slug:</p>
                          <code className="text-xs bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded">
                            {business.slug}
                          </code>
                        </div>
                      </div>

                      {business.images && business.images.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm text-primary-500 dark:text-primary-500 mb-2">Imágenes:</p>
                          <div className="flex gap-2">
                            {business.images.slice(0, 3).map((img: string, idx: number) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Imagen ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg border border-primary-200 dark:border-primary-700"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <form action={`/api/admin/businesses/${business.id}/approve`} method="POST" className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      name="action"
                      value="approve"
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                      ✅ Aprobar
                    </button>
                    <button
                      type="submit"
                      name="action"
                      value="reject"
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                      ❌ Rechazar
                    </button>
                    <Link
                      href={`/negocios/${business.slug}`}
                      target="_blank"
                      className="bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 text-primary-700 dark:text-primary-300 font-semibold px-6 py-2 rounded-lg transition"
                    >
                      Ver vista previa
                    </Link>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verified Businesses */}
        <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-100 dark:border-primary-800 p-6 mt-8">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
            Negocios Verificados ({verifiedBusinesses.length})
          </h2>

          {verifiedBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-primary-600 dark:text-primary-400">
                No hay negocios verificados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {verifiedBusinesses.map((business: any) => (
                <div
                  key={business.id}
                  className="border border-green-200 dark:border-green-900 rounded-lg p-6 hover:border-green-400 dark:hover:border-green-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                          {business.name}
                        </h3>
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded-full">
                          ✓ Verificado
                        </span>
                      </div>
                      <p className="text-primary-600 dark:text-primary-400 mb-3">
                        {business.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-primary-500 dark:text-primary-500">Dueño:</p>
                          <p className="text-primary-900 dark:text-white font-medium">
                            {business.owner.name || business.owner.email}
                          </p>
                          <p className="text-xs text-primary-500">{business.owner.email}</p>
                        </div>

                        <div>
                          <p className="text-primary-500 dark:text-primary-500">Ubicación:</p>
                          <p className="text-primary-900 dark:text-white font-medium">
                            {business.address}
                          </p>
                          <p className="text-xs text-primary-500">{business.neighborhood}</p>
                        </div>

                        <div>
                          <p className="text-primary-500 dark:text-primary-500">Contacto:</p>
                          <p className="text-primary-900 dark:text-white font-medium">
                            {business.phone}
                          </p>
                          {business.whatsapp && (
                            <p className="text-xs text-primary-500">WhatsApp: {business.whatsapp}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-primary-500 dark:text-primary-500">Slug:</p>
                          <code className="text-xs bg-primary-100 dark:bg-primary-900 px-2 py-1 rounded">
                            {business.slug}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form action={`/api/admin/businesses/${business.id}/approve`} method="POST" className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      name="action"
                      value="reject"
                      onClick={() => {
                        if (!confirm(`¿Estás seguro de que quieres desvalidar el negocio "${business.name}"? Esta acción lo marcará como rechazado.`)) {
                          return false
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                      ❌ Desvalidar
                    </button>
                    <Link
                      href={`/negocios/${business.slug}`}
                      target="_blank"
                      className="bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 text-primary-700 dark:text-primary-300 font-semibold px-6 py-2 rounded-lg transition"
                    >
                      Ver vista previa
                    </Link>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back link */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
