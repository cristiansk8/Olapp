'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SliderItem {
  id?: string
  title: string
  description: string | null
  imageUrl: string
  link: string | null
  buttonText: string | null
  order: number
}

interface FeaturedCategory {
  id?: string
  wooCategoryId: number
  name: string
  slug: string
  icon: string | null
  order: number
}

interface WooCategory {
  id: number
  name: string
  slug: string
  count: number
}

// Iconos predefinidos por categoría
const CATEGORY_ICONS: Record<string, string> = {
  'comida-bebidas': '🍽️',
  'ropa-accesorios': '👕',
  'artesanias-arte': '🎨',
  'servicios': '💼',
  'salud-bienestar': '🏥',
  'hogar': '🏠',
  'educacion': '📚',
  'entretenimiento': '🎮',
  'tecnologia': '📱',
  'belleza': '💄',
  'regalos': '🎁',
  'infantil': '👶',
  'mascotas': '🐾',
  'deportes': '⚽',
  'negocios': '💼',
  'agricultura': '🌱',
}

interface HomeContent {
  id: string
  logoUrl?: string | null
  heroTitle: string
  heroSubtitle: string
  heroCtaText: string
  heroCtaLink: string
  sliderItems: SliderItem[]
  featuredCategories: FeaturedCategory[]
}

interface HomeFormProps {
  homeContent: HomeContent | null
}

export function HomeForm({ homeContent }: HomeFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [wooCategories, setWooCategories] = useState<WooCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Logo upload states
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoMessage, setLogoMessage] = useState('')
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(
    homeContent?.logoUrl || null
  )

  const [hero, setHero] = useState({
    title: homeContent?.heroTitle || 'Descubre lo mejor de Milagro',
    subtitle: homeContent?.heroSubtitle || 'Tu marketplace local',
    ctaText: homeContent?.heroCtaText || 'Explorar ahora',
    ctaLink: homeContent?.heroCtaLink || '/negocios',
  })

  const [sliderItems, setSliderItems] = useState<SliderItem[]>(
    homeContent?.sliderItems || []
  )

  const [categories, setCategories] = useState<FeaturedCategory[]>(
    homeContent?.featuredCategories || []
  )

  // Cargar categorías de WooCommerce
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/woocommerce/categories')
        if (response.ok) {
          const data = await response.json()
          setWooCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  // Manejar subida de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    setLogoMessage('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/admin/logo/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el logo')
      }

      setCurrentLogoUrl(data.logoUrl)
      setLogoMessage('✅ Logo actualizado exitosamente')
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setLogoMessage('❌ ' + error.message)
    } finally {
      setUploadingLogo(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hero,
          sliderItems,
          featuredCategories: categories,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      setMessage('✅ Contenido guardado exitosamente')
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error: any) {
      setMessage('❌ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addSliderItem = () => {
    setSliderItems([
      ...sliderItems,
      {
        title: 'Nuevo Slide',
        description: 'Descripción',
        imageUrl: '',
        link: '',
        buttonText: 'Ver más',
        order: sliderItems.length,
      },
    ])
  }

  const removeSliderItem = (index: number) => {
    setSliderItems(sliderItems.filter((_, i) => i !== index))
  }

  const updateSliderItem = (index: number, field: keyof SliderItem, value: any) => {
    const newItems = [...sliderItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setSliderItems(newItems)
  }

  const updateCategory = (index: number, field: keyof FeaturedCategory, value: any) => {
    const newCategories = [...categories]
    newCategories[index] = { ...newCategories[index], [field]: value }
    setCategories(newCategories)
  }

  const toggleCategory = (wooCat: WooCategory) => {
    const existingIndex = categories.findIndex(c => c.wooCategoryId === wooCat.id)
    if (existingIndex >= 0) {
      // Remover si ya está seleccionada
      setCategories(categories.filter(c => c.wooCategoryId !== wooCat.id))
    } else {
      // Agregar nueva categoría con icono predefinido
      const icon = CATEGORY_ICONS[wooCat.slug] || '📁'
      setCategories([
        ...categories,
        {
          wooCategoryId: wooCat.id,
          name: wooCat.name,
          slug: wooCat.slug,
          icon,
          order: categories.length,
        },
      ])
    }
  }

  const isCategorySelected = (wooCatId: number) => {
    return categories.some(c => c.wooCategoryId === wooCatId)
  }

  const getCategoryIcon = (wooCatId: number) => {
    const cat = categories.find(c => c.wooCategoryId === wooCatId)
    return cat?.icon || '📁'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Logo Management */}
      <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-100 dark:border-primary-800 p-6">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
          🖼️ Logo del Sitio
        </h2>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo actual */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-primary-50 dark:bg-primary-950 rounded-lg border-2 border-primary-200 dark:border-primary-700 flex items-center justify-center overflow-hidden">
              {currentLogoUrl ? (
                <img
                  src={currentLogoUrl}
                  alt="Logo actual"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23ddd" width="128" height="128"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin logo%3C/text%3E%3C/svg%3E'
                  }}
                />
              ) : (
                <span className="text-4xl text-primary-300 dark:text-primary-700">🖼️</span>
              )}
            </div>
            {currentLogoUrl && (
              <p className="text-xs text-primary-500 dark:text-primary-500 mt-2 text-center">
                Logo actual
              </p>
            )}
          </div>

          {/* Upload form */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                Cambiar Logo
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800 cursor-pointer disabled:opacity-50"
              />
              <p className="text-xs text-primary-500 dark:text-primary-500 mt-1">
                Formatos aceptados: JPG, PNG, WebP, GIF. Máximo 5MB
              </p>
            </div>

            {logoMessage && (
              <div className={`p-3 rounded-lg text-sm ${logoMessage.includes('✅')
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                {logoMessage}
              </div>
            )}

            {uploadingLogo && (
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm">Subiendo logo...</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            ℹ️ El logo se almacenará en Supabase Storage y se mostrará en el header de todas las páginas.
            Asegúrate de crear el bucket <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">logos</code> en Supabase Storage antes de subir.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-100 dark:border-primary-800 p-6">
        <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
          🎯 Sección Hero
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={hero.title}
              onChange={(e) => setHero({ ...hero, title: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Subtítulo
            </label>
            <input
              type="text"
              value={hero.subtitle}
              onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Texto del Botón
            </label>
            <input
              type="text"
              value={hero.ctaText}
              onChange={(e) => setHero({ ...hero, ctaText: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Link del Botón
            </label>
            <input
              type="text"
              value={hero.ctaLink}
              onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              required
            />
          </div>
        </div>
      </div>

      {/* Slider */}
      <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-100 dark:border-primary-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
              🖼️ Slider Principal
            </h2>
            <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
              {sliderItems.length} {sliderItems.length === 1 ? 'slide' : 'slides'}
            </p>
          </div>
          <button
            type="button"
            onClick={addSliderItem}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Agregar Slide
          </button>
        </div>

        <div className="space-y-6">
          {sliderItems.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-primary-200 dark:border-primary-700 rounded-lg">
              <div className="text-5xl mb-3">🖼️</div>
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                No hay slides. Agrega el primero.
              </p>
            </div>
          ) : (
            sliderItems.map((item, index) => (
              <div
                key={index}
                className="border border-primary-200 dark:border-primary-700 rounded-lg p-6 relative hover:border-primary-400 dark:hover:border-primary-600 transition"
              >
                {/* Header del slide */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-primary-200 dark:border-primary-700">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold px-3 py-1 rounded-full text-sm">
                      #{index + 1}
                    </span>
                    <h3 className="font-semibold text-primary-900 dark:text-white">
                      {item.title || 'Slide sin título'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Mover arriba */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...sliderItems]
                          ;[newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]]
                          setSliderItems(newItems)
                        }}
                        className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg transition"
                        title="Mover hacia arriba"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    )}
                    {/* Mover abajo */}
                    {index < sliderItems.length - 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newItems = [...sliderItems]
                          ;[newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]]
                          setSliderItems(newItems)
                        }}
                        className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900 rounded-lg transition"
                        title="Mover hacia abajo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                    {/* Eliminar */}
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('¿Eliminar este slide?')) {
                          removeSliderItem(index)
                        }
                      }}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      title="Eliminar slide"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateSliderItem(index, 'title', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
                      required
                      placeholder="Ej: Comida Artesanal"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => updateSliderItem(index, 'description', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
                      placeholder="Ej: Sabores auténticos de nuestra tierra"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                      URL de Imagen
                    </label>
                    <input
                      type="url"
                      value={item.imageUrl}
                      onChange={(e) => updateSliderItem(index, 'imageUrl', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
                      required
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                      Link
                    </label>
                    <input
                      type="text"
                      value={item.link || ''}
                      onChange={(e) => updateSliderItem(index, 'link', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
                      placeholder="/negocios?category=comida"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                      Texto del Botón
                    </label>
                    <input
                      type="text"
                      value={item.buttonText || ''}
                      onChange={(e) => updateSliderItem(index, 'buttonText', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
                      placeholder="Ver restaurantes"
                    />
                  </div>
                </div>

                {item.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-primary-500 dark:text-primary-500 mb-2">Vista previa:</p>
                    <div className="relative rounded-lg overflow-hidden border border-primary-200 dark:border-primary-700">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23ddd" width="400" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError cargando imagen%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Botón adicional al final */}
        {sliderItems.length > 0 && (
          <div className="mt-6 pt-6 border-t border-primary-200 dark:border-primary-700">
            <button
              type="button"
              onClick={addSliderItem}
              className="w-full bg-primary-50 dark:bg-primary-900/50 hover:bg-primary-100 dark:hover:bg-primary-900/70 text-primary-700 dark:text-primary-300 font-semibold px-6 py-3 rounded-lg border-2 border-dashed border-primary-300 dark:border-primary-700 transition flex items-center justify-center gap-2"
            >
              <span className="text-xl">+</span>
              Agregar otro Slide al final
            </button>
          </div>
        )}
      </div>

      {/* Categorías Destacadas */}
      <div className="bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-100 dark:border-primary-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
              📂 Categorías Destacadas
            </h2>
            <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
              {categories.length} {categories.length === 1 ? 'categoría seleccionada' : 'categorías seleccionadas'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (wooCategories.length > 0) {
                const cat = wooCategories[0]
                toggleCategory(cat)
              }
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
            <span className="text-xl">+</span>
            Agregar Categoría
          </button>
        </div>

        {loadingCategories ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-primary-600 dark:text-primary-400">
              Cargando categorías de WooCommerce...
            </p>
          </div>
        ) : wooCategories.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-primary-200 dark:border-primary-700 rounded-lg">
            <div className="text-5xl mb-3">📂</div>
            <p className="text-primary-600 dark:text-primary-400 mb-4">
              No hay categorías disponibles en WooCommerce
            </p>
            <p className="text-sm text-primary-500 dark:text-primary-500">
              Crea categorías en tu tienda WooCommerce primero
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wooCategories.map((wooCat) => {
              const selected = isCategorySelected(wooCat.id)
              return (
                <div
                  key={wooCat.id}
                  className={`border-2 rounded-lg p-4 transition cursor-pointer ${
                    selected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-primary-200 dark:border-primary-700 hover:border-primary-400 dark:hover:border-primary-600'
                  }`}
                  onClick={() => toggleCategory(wooCat)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleCategory(wooCat)}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary-900 dark:text-white">
                          {wooCat.name}
                        </h3>
                        <p className="text-xs text-primary-500 dark:text-primary-500 mt-1">
                          {wooCat.count} productos
                        </p>
                      </div>
                    </div>
                    {selected && (
                      <span className="text-2xl">{getCategoryIcon(wooCat.id)}</span>
                    )}
                  </div>

                  {selected && (
                    <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-700 flex items-center gap-2">
                      <span className="text-sm text-primary-600 dark:text-primary-400">
                        Icono asignado:
                      </span>
                      <span className="text-2xl">{getCategoryIcon(wooCat.id)}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Mensaje */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
          {message}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50"
        >
          {loading ? 'Guardando...' : '💾 Guardar Cambios'}
        </button>
        <Link
          href="/admin"
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-primary-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
