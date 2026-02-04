import 'dotenv/config'
import prisma from '../lib/prisma'

async function main() {
  console.log('🌱 Seeding OLAPP database...')

  // Crear superusuario cdpsk8
  const superAdminEmail = 'cdpsk8@gmail.com'
  const superAdmin = await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { role: 'ADMIN', isSuperUser: true },
    create: {
      email: superAdminEmail,
      name: 'Super Admin',
      role: 'ADMIN',
      isSuperUser: true,
    },
  })
  console.log(`✅ Created super admin: ${superAdminEmail}`)

  // Crear usuario admin por defecto
  const adminEmail = 'admin@olapp.ec'
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin OLAPP',
      role: 'ADMIN',
    },
  })
  console.log(`✅ Created admin user: ${adminEmail}`)

  // Crear contenido inicial de home page
  const homeContent = await prisma.homePageContent.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      heroTitle: 'Descubre lo mejor de Milagro',
      heroSubtitle: 'Tu marketplace local con los mejores negocios y productos',
      heroCtaText: 'Explorar ahora',
      heroCtaLink: '/negocios',
    },
  })
  console.log(`✅ Created home page content`)

  // Crear slider items
  await prisma.sliderItem.createMany({
    data: [
      {
        homePageId: homeContent.id,
        title: 'Comida Artesanal',
        description: 'Sabores auténticos de nuestra tierra',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
        link: '/negocios?category=comida',
        buttonText: 'Ver restaurantes',
        order: 0,
      },
      {
        homePageId: homeContent.id,
        title: 'Arte Local',
        description: 'Talento y creatividad milagreña',
        imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200',
        link: '/negocios?category=arte',
        buttonText: 'Explorar arte',
        order: 1,
      },
      {
        homePageId: homeContent.id,
        title: 'Moda y Estilo',
        description: 'La mejor ropa y accesorios',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
        link: '/negocios?category=ropa',
        buttonText: 'Ver tiendas',
        order: 2,
      },
    ],
    skipDuplicates: true,
  })
  console.log(`✅ Created slider items`)

  // Crear categorías destacadas
  await prisma.featuredCategory.createMany({
    data: [
      {
        homePageId: homeContent.id,
        wooCategoryId: 45,
        name: 'Comida',
        slug: 'comida',
        icon: '🍽️',
        order: 0,
      },
      {
        homePageId: homeContent.id,
        wooCategoryId: 46,
        name: 'Ropa',
        slug: 'ropa',
        icon: '👕',
        order: 1,
      },
      {
        homePageId: homeContent.id,
        wooCategoryId: 47,
        name: 'Arte',
        slug: 'arte',
        icon: '🎨',
        order: 2,
      },
      {
        homePageId: homeContent.id,
        wooCategoryId: 48,
        name: 'Entretenimiento',
        slug: 'entretenimiento',
        icon: '🎭',
        order: 3,
      },
      {
        homePageId: homeContent.id,
        wooCategoryId: 49,
        name: 'Cultura',
        slug: 'cultura',
        icon: '🏛️',
        order: 4,
      },
    ],
    skipDuplicates: true,
  })
  console.log(`✅ Created featured categories`)

  // Crear negocio de ejemplo
  const business1 = await prisma.business.upsert({
    where: { slug: 'cevicheria-el-marino' },
    update: {},
    create: {
      name: 'Cevichería El Marino',
      slug: 'cevicheria-el-marino',
      description: 'El mejor ceviche de Milagro. Especialidad en mariscos frescos.',
      ownerId: superAdmin.id,
      address: 'Calle Principal cerca del Estadio',
      neighborhood: 'Estadio',
      phone: '+593991234567',
      whatsapp: '+593991234567',
      wooCategoryId: 45,
      status: 'VERIFIED',
    },
  })

  console.log(`✅ Created business: ${business1.name}`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
