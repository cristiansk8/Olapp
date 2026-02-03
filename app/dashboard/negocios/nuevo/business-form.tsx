'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { WooCategory } from '@/lib/woocommerce'

interface BusinessFormProps {
  wooCategories: WooCategory[]
}

const COUNTRIES = [
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+57', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+34', name: 'España', flag: '🇪🇸' },
]

export function BusinessForm({ wooCategories }: BusinessFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])

  // Manejar subida de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    setError('')

    // Crear preview local
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/businesses/logo/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir el logo')
      }

      setLogoUrl(data.logoUrl)
    } catch (error: any) {
      setError('❌ ' + error.message)
      setLogoPreview(null)
    } finally {
      setUploadingLogo(false)
    }
  }

  // Manejar subida de imagen de portada
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setError('')

    // Crear preview local
    const reader = new FileReader()
    reader.onloadend = () => {
      setCoverPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/businesses/logo/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen de portada')
      }

      setCoverUrl(data.logoUrl)
    } catch (error: any) {
      setError('❌ ' + error.message)
      setCoverPreview(null)
    } finally {
      setUploadingCover(false)
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    // Agregar URLs de las imágenes subidas
    if (logoUrl) {
      formData.set('logo', logoUrl)
    }
    if (coverUrl) {
      formData.set('coverImage', coverUrl)
    }

    // Agregar código de país al WhatsApp
    formData.set('countryCode', selectedCountry.code)

    // Valores por defecto para campos obligatorios que eliminamos
    formData.set('address', 'Por actualizar')
    formData.set('neighborhood', 'Por actualizar')
    formData.set('phone', '0000000000')

    try {
      const response = await fetch('/api/businesses/create', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar el negocio')
      }

      router.push('/dashboard/negocios')
      router.refresh()
    } catch (error: any) {
      setError('❌ ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo del Negocio */}
      <div>
        <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-4 pb-2 border-b border-primary-200 dark:border-primary-700">
          Logo del Negocio (Opcional)
        </h3>
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <input
              type="file"
              id="logoFile"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleLogoUpload}
              disabled={uploadingLogo}
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800 cursor-pointer disabled:opacity-50"
            />
            <p className="text-xs text-primary-500 dark:text-primary-500 mt-1">
              Formatos: JPG, PNG, WebP, GIF. Máximo 5MB
            </p>
          </div>
          {logoPreview && (
            <div className="w-32 h-32 flex-shrink-0 border-2 border-primary-200 dark:border-primary-700 rounded-lg overflow-hidden bg-primary-50 dark:bg-primary-950">
              <img
                src={logoPreview}
                alt="Vista previa del logo"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
        {uploadingLogo && (
          <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
            Subiendo logo...
          </p>
        )}
      </div>

      {/* Imagen de Portada */}
      <div>
        <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-4 pb-2 border-b border-primary-200 dark:border-primary-700">
          Imagen de Portada (Opcional)
        </h3>
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <input
              type="file"
              id="coverFile"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleCoverUpload}
              disabled={uploadingCover}
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-800 cursor-pointer disabled:opacity-50"
            />
            <p className="text-xs text-primary-500 dark:text-primary-500 mt-1">
              Formatos: JPG, PNG, WebP, GIF. Máximo 5MB
            </p>
          </div>
          {coverPreview && (
            <div className="w-48 h-32 flex-shrink-0 border-2 border-primary-200 dark:border-primary-700 rounded-lg overflow-hidden bg-primary-50 dark:bg-primary-950">
              <img
                src={coverPreview}
                alt="Vista previa de la portada"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        {uploadingCover && (
          <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
            Subiendo imagen de portada...
          </p>
        )}
      </div>

      {/* Información Básica */}
      <div>
        <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-4 pb-2 border-b border-primary-200 dark:border-primary-700">
          Información Básica
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              placeholder="Ej: Mi Tienda"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              placeholder="Describe brevemente tu negocio..."
            />
          </div>

          <div>
            <label htmlFor="wooCategoryId" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Categoría *
            </label>
            <select
              id="wooCategoryId"
              name="wooCategoryId"
              required
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
            >
              <option value="">Selecciona una categoría</option>
              {wooCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Redes Sociales */}
      <div>
        <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-4 pb-2 border-b border-primary-200 dark:border-primary-700">
          Redes Sociales (Opcional)
        </h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Facebook 📘
            </label>
            <input
              type="url"
              id="facebook"
              name="facebook"
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              placeholder="https://facebook.com/tu-negocio"
            />
          </div>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Instagram 📸
            </label>
            <input
              type="url"
              id="instagram"
              name="instagram"
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              placeholder="https://instagram.com/tu-negocio"
            />
          </div>

          <div>
            <label htmlFor="tiktok" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              TikTok 🎵
            </label>
            <input
              type="url"
              id="tiktok"
              name="tiktok"
              className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
              placeholder="https://tiktok.com/@tu-negocio"
            />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              WhatsApp 💬
            </label>
            <div className="flex gap-2">
              <select
                value={selectedCountry.code}
                onChange={(e) => setSelectedCountry(COUNTRIES.find(c => c.code === e.target.value) || COUNTRIES[0])}
                className="px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white font-medium"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                className="flex-1 px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-950 text-primary-900 dark:text-white"
                placeholder="99 123 4567"
              />
            </div>
            <p className="text-xs text-primary-500 dark:text-primary-500 mt-1">
              Ej: {selectedCountry.flag} {selectedCountry.code} 99 123 4567
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Info de Validación */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
          <span>✓</span> Validación Comunitaria
        </h4>
        <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
          Tu negocio será revisado por la comunidad. Necesita 3 confirmaciones de otros usuarios
          para ser verificado y aparecer públicamente.
        </p>
        <p className="text-amber-700 dark:text-amber-300 text-xs">
          💡 Puedes completar la información restante más tarde desde el panel de tu negocio.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading || uploadingLogo || uploadingCover}
          className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrar Negocio'}
        </button>
        <a
          href="/dashboard/negocios"
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-primary-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          Cancelar
        </a>
      </div>
    </form>
  )
}
