import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/sync-user'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { HomeForm } from './home-form'

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic'

async function getHomeContent() {
  const content = await prisma.homePageContent.findFirst({
    where: { isActive: true },
    include: {
      sliderItems: { orderBy: { order: 'asc' } },
      featuredCategories: { orderBy: { order: 'asc' } },
    },
  })

  return content
}

export default async function AdminHomePage() {
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

  const homeContent = await getHomeContent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-black dark:to-secondary-950 pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-primary-600 hover:text-primary-700 mb-4 inline-block"
            >
              ← Volver al Admin
            </Link>
            <h1 className="text-4xl font-bold text-primary-900 dark:text-white mb-2">
              🏠 Editar Home Page
            </h1>
            <p className="text-primary-600 dark:text-primary-400">
              Configura el contenido principal de OLAPP
            </p>
          </div>
        </div>

        <HomeForm homeContent={homeContent} />
      </main>
    </div>
  )
}
