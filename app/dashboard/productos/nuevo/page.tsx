'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const [name, setName] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [regularPrice, setRegularPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [stockQuantity, setStockQuantity] = useState('100')
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name || !regularPrice) {
      setError('Nombre y precio son obligatorios')
      return
    }

    if (!image && !imageUrl) {
      setError('Debes subir una imagen')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/business/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          short_description: shortDescription,
          description,
          regular_price: regularPrice,
          sale_price: salePrice || undefined,
          stock_quantity: parseInt(stockQuantity) || 100,
          image: imageUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear producto')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/productos')
      }, 2000)
    } catch (error: any) {
      setError(error.message || 'Error al crear producto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 pt-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/productos"
            className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
          >
            ← Volver a Mis Productos
          </Link>
          <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">
            Nuevo Producto
          </h1>
          <p className="text-primary-600 dark:text-primary-400">
            Agrega un nuevo producto a tu catálogo
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-primary-900 rounded-xl shadow-lg p-8 border border-primary-100 dark:border-primary-800">
            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Foto del producto *
              </label>
              <div className="flex items-start gap-6">
                {imageUrl ? (
                  <div className="relative w-48 h-48">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border-2 border-primary-200 dark:border-primary-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null)
                        setImageUrl('')
                      }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-48 h-48 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📷</div>
                      <p className="text-sm text-primary-500 dark:text-primary-500">
                        Sube una foto
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg cursor-pointer transition"
                  >
                    Seleccionar imagen
                  </label>
                  <p className="text-sm text-primary-500 dark:text-primary-500 mt-2">
                    Formatos: JPG, PNG, WEBP (máx 5MB)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Ej: Ceviche Clásico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Precio regular *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 dark:text-primary-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Precio oferta (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 dark:text-primary-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                  Stock disponible
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Descripción corta
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                maxLength={150}
                className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="Una breve descripción del producto (máx 150 caracteres)"
              />
              <p className="text-xs text-primary-500 dark:text-primary-500 mt-1">
                {shortDescription.length}/150 caracteres
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Descripción completa
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                placeholder="Describe tu producto con más detalle..."
              />
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando producto...' : 'Crear Producto'}
              </button>
              <Link
                href="/dashboard/productos"
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-primary-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancelar
              </Link>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-primary-900 rounded-xl p-12 shadow-lg text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-primary-900 dark:text-white mb-2">
              ¡Producto creado exitosamente!
            </h3>
            <p className="text-primary-600 dark:text-primary-400">
              Redirigiendo a tus productos...
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
