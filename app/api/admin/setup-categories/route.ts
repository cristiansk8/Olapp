import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/sync-user'
import api from '@/lib/woocommerce'

const CATEGORIES = [
  { name: 'Comida y Bebidas', slug: 'comida-bebidas', icon: '🍽️' },
  { name: 'Restaurantes', slug: 'restaurantes', icon: '🍽️', parent: 'comida-bebidas' },
  { name: 'Cafeterías', slug: 'cafeterias', icon: '☕', parent: 'comida-bebidas' },
  { name: 'Comida Rápida', slug: 'comida-rapida', icon: '🍔', parent: 'comida-bebidas' },
  { name: 'Panaderías', slug: 'panaderias', icon: '🍞', parent: 'comida-bebidas' },
  { name: 'Heladerías', slug: 'heladerias', icon: '🍦', parent: 'comida-bebidas' },
  { name: 'Bebidas', slug: 'bebidas', icon: '🥤', parent: 'comida-bebidas' },

  { name: 'Ropa y Accesorios', slug: 'ropa-accesorios', icon: '👕' },
  { name: 'Ropa Dama', slug: 'ropa-dama', icon: '👗', parent: 'ropa-accesorios' },
  { name: 'Ropa Caballero', slug: 'ropa-caballero', icon: '👔', parent: 'ropa-accesorios' },
  { name: 'Ropa Niños', slug: 'ropa-ninos', icon: '👶', parent: 'ropa-accesorios' },
  { name: 'Calzado', slug: 'calzado', icon: '👟', parent: 'ropa-accesorios' },
  { name: 'Accesorios', slug: 'accesorios', icon: '👜', parent: 'ropa-accesorios' },
  { name: 'Bolsos', slug: 'bolsos', icon: '👜', parent: 'ropa-accesorios' },

  { name: 'Artesanías y Arte', slug: 'artesanias-arte', icon: '🎨' },
  { name: 'Artesanías Locales', slug: 'artesanias-locales', icon: '🎨', parent: 'artesanias-arte' },
  { name: 'Arte y Decoración', slug: 'arte-decoracion', icon: '🖼️', parent: 'artesanias-arte' },
  { name: 'Manualidades', slug: 'manualidades', icon: '✂️', parent: 'artesanias-arte' },
  { name: 'Joyería', slug: 'joyeria', icon: '💍', parent: 'artesanias-arte' },

  { name: 'Servicios', slug: 'servicios', icon: '💼' },
  { name: 'Servicios Profesionales', slug: 'servicios-profesionales', icon: '💼', parent: 'servicios' },
  { name: 'Tecnología y Reparaciones', slug: 'tecnologia-reparaciones', icon: '🔧', parent: 'servicios' },
  { name: 'Servicios Personales', slug: 'servicios-personales', icon: '💇', parent: 'servicios' },

  { name: 'Salud y Bienestar', slug: 'salud-bienestar', icon: '🏥' },
  { name: 'Farmacias', slug: 'farmacias', icon: '💊', parent: 'salud-bienestar' },
  { name: 'Salud Natural', slug: 'salud-natural', icon: '🌿', parent: 'salud-bienestar' },
  { name: 'Fitness y Deporte', slug: 'fitness-deporte', icon: '🏃', parent: 'salud-bienestar' },

  { name: 'Hogar', slug: 'hogar', icon: '🏠' },
  { name: 'Ferreterías', slug: 'ferreterias', icon: '🔨', parent: 'hogar' },
  { name: 'Decoración', slug: 'decoracion', icon: '🏺', parent: 'hogar' },
  { name: 'Muebles', slug: 'muebles', icon: '🛋️', parent: 'hogar' },
  { name: 'Jardín', slug: 'jardin', icon: '🌱', parent: 'hogar' },

  { name: 'Educación', slug: 'educacion', icon: '📚' },
  { name: 'Librerías', slug: 'librerias', icon: '📚', parent: 'educacion' },
  { name: 'Material Escolar', slug: 'material-escolar', icon: '✏️', parent: 'educacion' },
  { name: 'Papelerías', slug: 'papelerias', icon: '📝', parent: 'educacion' },

  { name: 'Entretenimiento', slug: 'entretenimiento', icon: '🎮' },
  { name: 'Eventos', slug: 'eventos', icon: '🎉', parent: 'entretenimiento' },
  { name: 'Música e Instrumentos', slug: 'musica-instrumentos', icon: '🎸', parent: 'entretenimiento' },
  { name: 'Juegos', slug: 'juegos', icon: '🎲', parent: 'entretenimiento' },

  { name: 'Tecnología', slug: 'tecnologia', icon: '📱' },
  { name: 'Celulares y Accesorios', slug: 'celulares-accesorios', icon: '📱', parent: 'tecnologia' },
  { name: 'Computadoras', slug: 'computadoras', icon: '💻', parent: 'tecnologia' },
  { name: 'Electrónicos', slug: 'electronicos', icon: '📺', parent: 'tecnologia' },

  { name: 'Belleza', slug: 'belleza', icon: '💄' },
  { name: 'Cosméticos', slug: 'cosmeticos', icon: '💄', parent: 'belleza' },
  { name: 'Peluquerías', slug: 'peluquerias', icon: '💇', parent: 'belleza' },
  { name: 'Cuidado Personal', slug: 'cuidado-personal', icon: '🧴', parent: 'belleza' },

  { name: 'Regalos', slug: 'regalos', icon: '🎁' },
  { name: 'Detalles', slug: 'detalles', icon: '🎁', parent: 'regalos' },
  { name: 'Flores', slug: 'flores', icon: '💐', parent: 'regalos' },
  { name: 'Artesanías', slug: 'artesanias-regalos', icon: '🎨', parent: 'regalos' },

  { name: 'Infantil', slug: 'infantil', icon: '👶' },
  { name: 'Juguetes', slug: 'juguetes', icon: '🧸', parent: 'infantil' },
  { name: 'Ropa Bebé', slug: 'ropa-bebe', icon: '👶', parent: 'infantil' },
  { name: 'Maternidad', slug: 'maternidad', icon: '🤱', parent: 'infantil' },

  { name: 'Mascotas', slug: 'mascotas', icon: '🐾' },
  { name: 'Alimentos', slug: 'alimentos-mascotas', icon: '🍖', parent: 'mascotas' },
  { name: 'Accesorios', slug: 'accesorios-mascotas', icon: '🦴', parent: 'mascotas' },
  { name: 'Veterinarias', slug: 'veterinarias', icon: '🏥', parent: 'mascotas' },

  { name: 'Deportes', slug: 'deportes', icon: '⚽' },
  { name: 'Artículos Deportivos', slug: 'articulos-deportivos', icon: '⚽', parent: 'deportes' },
  { name: 'Equipos', slug: 'equipos', icon: '🥎', parent: 'deportes' },
  { name: 'Calzado Deportivo', slug: 'calzado-deportivo', icon: '👟', parent: 'deportes' },

  { name: 'Negocios', slug: 'negocios', icon: '💼' },
  { name: 'Suministros de Oficina', slug: 'suministros-oficina', icon: '📎', parent: 'negocios' },
  { name: 'Tecnología Empresarial', slug: 'tecnologia-empresarial', icon: '💻', parent: 'negocios' },

  { name: 'Agricultura', slug: 'agricultura', icon: '🌱' },
  { name: 'Agroquímicos', slug: 'agroquimicos', icon: '🧪', parent: 'agricultura' },
  { name: 'Herramientas', slug: 'herramientas', icon: '🔧', parent: 'agricultura' },
  { name: 'Semillas', slug: 'semillas', icon: '🌱', parent: 'agricultura' },
]

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    // Verificar que sea superusuario
    if (!currentUser?.isSuperUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results: {
      created: Array<{ name: string; id: number; icon: string }>
      errors: Array<{ name: string; error: string }>
      existing: string[]
    } = {
      created: [],
      errors: [],
      existing: []
    }

    // Crear categorías una por una
    for (const cat of CATEGORIES) {
      try {
        // Verificar si la categoría ya existe
        const existingCheck = await api.get('products/categories', {
          slug: cat.slug
        })

        if (existingCheck.data && existingCheck.data.length > 0) {
          results.existing.push(cat.name)
          continue
        }

        // Crear la categoría
        const categoryData: any = {
          name: cat.name,
          slug: cat.slug,
        }

        // Si tiene padre, primero encontrar el ID del padre
        if (cat.parent) {
          const parentCheck = await api.get('products/categories', {
            slug: cat.parent
          })

          if (parentCheck.data && parentCheck.data.length > 0) {
            categoryData.parent = parentCheck.data[0].id
          }
        }

        const response = await api.post('products/categories', categoryData)

        if (response.data) {
          results.created.push({
            name: cat.name,
            id: response.data.id,
            icon: cat.icon
          })
        }
      } catch (error: any) {
        console.error(`Error creating category ${cat.name}:`, error)
        results.errors.push({
          name: cat.name,
          error: error.message || 'Error desconocido'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Categorías creadas: ${results.created.length}, Existían: ${results.existing.length}, Errores: ${results.errors.length}`,
      results
    })
  } catch (error: any) {
    console.error('Error setting up categories:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear categorías' },
      { status: 500 }
    )
  }
}
