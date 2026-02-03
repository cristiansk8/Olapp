'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RegisterFormProps {
  logoUrl: string
}

export default function RegisterForm({ logoUrl }: RegisterFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<'CUSTOMER' | 'BUSINESS'>('CUSTOMER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role,
          }
        }
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 px-4 pt-20">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src={logoUrl}
            alt="OLAPP"
            className="h-24 w-auto mx-auto mb-4 object-contain"
          />
          <p className="text-primary-600 dark:text-primary-400 font-medium">
            Tu mercado local en Milagro
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white dark:bg-primary-900 rounded-2xl shadow-xl p-8 border border-primary-100 dark:border-primary-800">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-6">
            Crear Cuenta
          </h2>

          {!success ? (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2"
                >
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2"
                >
                  ¿Cómo quieres usar OLAPP?
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`p-4 rounded-lg border-2 transition ${
                      role === 'CUSTOMER'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-primary-200 dark:border-primary-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🛍️</div>
                    <p className="font-semibold text-primary-900 dark:text-white text-sm">
                      Cliente
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                      Comprar productos locales
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('BUSINESS')}
                    className={`p-4 rounded-lg border-2 transition ${
                      role === 'BUSINESS'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-primary-200 dark:border-primary-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">🏪</div>
                    <p className="font-semibold text-primary-900 dark:text-white text-sm">
                      Negocio
                    </p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                      Vender mis productos
                    </p>
                  </button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="tu@correo.com"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-primary-200 dark:border-primary-700 bg-white dark:bg-primary-900 text-primary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  placeholder="Repite tu contraseña"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">
                ¡Cuenta creada exitosamente!
              </h3>
              <p className="text-primary-600 dark:text-primary-400 mb-4">
                Revisa tu correo para confirmar tu cuenta. Serás redirigido al login en unos segundos...
              </p>
            </div>
          )}

          {/* Login Link */}
          {!success && (
            <div className="mt-6 text-center">
              <p className="text-primary-600 dark:text-primary-400">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 font-semibold underline"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-primary-500 dark:text-primary-500 text-sm mt-8">
          © 2026 OLAPP. Tu mercado local en Milagro, Ecuador 🇪🇨
        </p>
      </div>
    </div>
  )
}
