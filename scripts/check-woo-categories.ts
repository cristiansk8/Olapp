import 'dotenv/config'
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || '',
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || '',
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || '',
  version: "wc/v3"
})

async function main() {
  console.log('🔍 Verificando categorías padre en WooCommerce...\n')

  const response = await api.get('products/categories', {
    per_page: 100,
    parent: 0,
    hide_empty: false,
  })

  const categories = response.data

  console.log('┌────┬───────────────────────┬──────────────────────────┬──────────┐')
  console.log('│ ID │ Nombre                 │ Slug                      │ Productos│')
  console.log('├────┼───────────────────────┼──────────────────────────┼──────────┤')

  categories.forEach((cat: any) => {
    console.log(
      `│ ${String(cat.id).padStart(2)} │ ${cat.name.padEnd(23)} │ ${cat.slug.padEnd(24)} │ ${String(cat.count).padStart(8)} │`
    )
  })

  console.log('└────┴───────────────────────┴──────────────────────────┴──────────┘')
  console.log(`\n📊 Total: ${categories.length} categorías padre`)
}

main()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
