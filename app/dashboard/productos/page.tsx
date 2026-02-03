import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/sync-user'
import Link from 'next/link'

async function getBusinessProducts() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/business/products`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return { products: [], business: null }
  }

  return response.json()
}

export default async function DashboardProductosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const currentUser = await getCurrentUser()
  const { products, business } = await getBusinessProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">
              📦 Mis Productos
            </h1>
            <p className="text-primary-600 dark:text-primary-400">
              {business?.name || 'Mis productos'} ({products.length} productos)
            </p>
          </div>
          <Link
            href="/dashboard/productos/nuevo"
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nuevo Producto
          </Link>
        </div>

        {/* Mensaje si no hay negocio */}
        {!business && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
              ⚠️ Negocio no configurado
            </h3>
            <p className="text-amber-800 dark:text-amber-200 mb-4">
              Necesitas crear un negocio antes de agregar productos.
            </p>
            <Link
              href="/dashboard/negocios/nuevo"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Crear Negocio
            </Link>
          </div>
        )}

        {/* Lista de productos */}
        {products.length === 0 ? (
          <div className="bg-white dark:bg-primary-900 rounded-xl p-12 shadow-lg text-center border border-primary-100 dark:border-primary-800">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
              No tienes productos
            </h3>
            <p className="text-primary-600 dark:text-primary-400 mb-6">
              Agrega tu primer producto para empezar a vender
            </p>
            <Link
              href="/dashboard/productos/nuevo"
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              + Crear Producto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white dark:bg-primary-900 rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden border border-primary-100 dark:border-primary-800 group"
              >
                {product.images && product.images[0] && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.images[0].src}
                      alt={product.images[0].alt || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    {product.on_sale && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        OFERTA
                      </span>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-primary-900 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition">
                    {product.name}
                  </h3>
                  <p className="text-sm text-primary-600 dark:text-primary-400 mb-3 line-clamp-2">
                    {product.short_description?.replace(/<[^>]*>/g, '') || product.description?.replace(/<[^>]*>/g, '')}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {product.on_sale ? (
                        <>
                          <span className="text-xl font-bold text-red-600 dark:text-red-400">
                            ${product.price}
                          </span>
                          <span className="text-sm text-primary-500 line-through ml-2">
                            ${product.regular_price}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-primary-900 dark:text-white">
                          ${product.regular_price}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock_status === 'instock'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {product.stock_quantity > 0
                        ? `✓ ${product.stock_quantity} en stock`
                        : '✗ Agotado'}
                    </span>
                    <div className="flex gap-2">
                      <a
                        href={product.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:text-primary-700 underline"
                      >
                        Ver en Woo →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link de regreso */}
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
