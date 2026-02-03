import { getProducts } from '@/lib/woocommerce'
import Link from 'next/link'

export default async function ProductosPage() {
  // Obtener todos los productos de WooCommerce
  const products = await getProducts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">
            📦 Todos los Productos
          </h1>
          <p className="text-primary-600 dark:text-primary-400">
            Mostrando {products.length} productos de WooCommerce
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-primary-600 hover:text-primary-700 underline"
          >
            ← Volver al inicio
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="bg-white dark:bg-primary-900 rounded-xl p-8 shadow-lg text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-primary-600 dark:text-primary-400 mb-4">
              Aún no hay productos en WooCommerce o no hay conexión.
            </p>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-left max-w-md mx-auto">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold mb-2">
                🔧 Verificación:
              </p>
              <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>WooCommerce URL: {process.env.WOOCOMMERCE_URL || 'no configurada'}</li>
                <li>Consumer Key: {process.env.WOOCOMMERCE_CONSUMER_KEY ? '✅ configurado' : '❌ no configurado'}</li>
                <li>Consumer Secret: {process.env.WOOCOMMERCE_CONSUMER_SECRET ? '✅ configurado' : '❌ no configurado'}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
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
                          ${product.price}
                        </span>
                      )}
                    </div>
                  </div>
                  {product.categories && product.categories.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {product.categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/productos?category=${cat.slug}`}
                          className="text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-800 dark:text-primary-300 dark:hover:bg-primary-700 px-2 py-1 rounded transition"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stock_status === 'instock'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {product.stock_status === 'instock' ? '✓ En stock' : '✗ Agotado'}
                    </span>
                    <a
                      href={product.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-700 underline"
                    >
                      Ver en WooCommerce →
                    </a>
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
