'use client'

import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface HeaderClientProps {
  logoUrl: string
}

export default function HeaderClient({ logoUrl }: HeaderClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [isSuperUser, setIsSuperUser] = useState<boolean>(false)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Verificar si es superusuario
      if (user) {
        try {
          const response = await fetch('/api/user/me')
          if (response.ok) {
            const userData = await response.json()
            setIsSuperUser(userData.isSuperUser || false)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }
    checkUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white dark:bg-primary-900 border-b border-primary-200 dark:border-primary-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1">
            <img
              src={logoUrl}
              alt="OLA"
              className="h-14 w-auto object-contain"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              APP
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {isSuperUser && (
                  <Link
                    href="/admin"
                    className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium px-3 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-primary-700 dark:text-primary-300 hover:text-primary-900 dark:hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-800 transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
