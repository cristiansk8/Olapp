import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Configurar WooCommerce API
const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL || process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || '',
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY || '',
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET || '',
  version: "wc/v3"
});

export default api;

// Tipos de TypeScript para WooCommerce
export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity?: number;
  categories?: WooCategory[];
  images?: WooProductImage[];
  attributes?: WooProductAttribute[];
  permalink?: string;
  status: string;
  meta_data?: Array<{
    key: string;
    value: any;
  }>;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
  description?: string;
  display?: 'default' | 'products' | 'subcategories' | 'both';
  image?: {
    id: number;
    src: string;
  };
}

export interface WooProductImage {
  id: number;
  src: string;
  alt?: string;
  name?: string;
}

export interface WooProductAttribute {
  id: number;
  name: string;
  slug: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

// Funciones helper para WooCommerce
export async function getProducts(params?: {
  category?: number;
  search?: string;
  per_page?: number;
  page?: number;
  status?: string;
}): Promise<WooProduct[]> {
  try {
    const response = await api.get('products', {
      per_page: 100,
      status: 'publish',
      ...params
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching products from WooCommerce:', error);
    return [];
  }
}

export async function getProductsByCategory(categoryId: number): Promise<WooProduct[]> {
  return getProducts({ category: categoryId });
}

export async function getCategories(params?: {
  per_page?: number;
  hide_empty?: boolean;
}): Promise<WooCategory[]> {
  try {
    const response = await api.get('products/categories', {
      per_page: 100,
      hide_empty: true,
      ...params
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories from WooCommerce:', error);
    return [];
  }
}

export async function getParentCategories(params?: {
  per_page?: number;
  hide_empty?: boolean;
}): Promise<WooCategory[]> {
  try {
    const response = await api.get('products/categories', {
      per_page: 100,
      hide_empty: true,
      parent: 0, // Solo categorías padre
      ...params
    });
    return response.data || [];
  } catch (error) {
    console.error('Error fetching parent categories from WooCommerce:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<WooProduct | null> {
  try {
    const response = await api.get('products', { slug });
    return response.data?.[0] || null;
  } catch (error) {
    console.error('Error fetching product from WooCommerce:', error);
    return null;
  }
}

export async function createProduct(data: Partial<WooProduct>): Promise<WooProduct | null> {
  try {
    const response = await api.post('products', data);
    return response.data || null;
  } catch (error) {
    console.error('Error creating product in WooCommerce:', error);
    return null;
  }
}

export async function createCategory(name: string, data?: {
  description?: string;
  slug?: string;
  image?: { src: string };
}): Promise<WooCategory | null> {
  try {
    const response = await api.post('products/categories', {
      name,
      ...data
    });
    return response.data || null;
  } catch (error) {
    console.error('Error creating category in WooCommerce:', error);
    return null;
  }
}
