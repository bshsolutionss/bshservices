/**
 * WooCommerce REST API Client for Next.js / Node.js
 * Uses WooCommerce REST API v3 (/wp-json/wc/v3)
 */

const WOOCOMMERCE_URL =
  process.env.WOOCOMMERCE_URL ||
  process.env.WORDPRESS_URL ||
  "https://darkgrey-pelican-916395.hostingersite.com";

const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";

// ==========================================
// TYPES
// ==========================================

export interface WCImage {
  id: number;
  date_created?: string;
  src: string;
  name?: string;
  alt?: string;
}

export interface WCCategoryRef {
  id: number;
  name: string;
  slug: string;
}

export interface WCTagRef {
  id: number;
  name: string;
  slug: string;
}

export interface WCDimensions {
  length: string;
  width: string;
  height: string;
}

export interface WCAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WCProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: "simple" | "grouped" | "external" | "variable";
  status: "draft" | "pending" | "private" | "publish";
  featured: boolean;
  catalog_visibility: "visible" | "catalog" | "search" | "hidden";
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: "instock" | "outofstock" | "onbackorder";
  backorders: "no" | "notify" | "yes";
  backorders_allowed: boolean;
  backordered: boolean;
  weight: string;
  dimensions: WCDimensions;
  categories: WCCategoryRef[];
  tags: WCTagRef[];
  images: WCImage[];
  attributes: WCAttribute[];
  default_attributes: Array<{ id: number; name: string; option: string }>;
  variations: number[];
  grouped_products: number[];
  related_ids: number[];
  meta_data: Array<{ id: number; key: string; value: unknown }>;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: "default" | "products" | "subcategories" | "both";
  image: WCImage | null;
  menu_order: number;
  count: number;
}

export interface WCBillingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface WCShippingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface WCOrderLineItem {
  id?: number;
  name?: string;
  product_id: number;
  variation_id?: number;
  quantity: number;
  subtotal?: string;
  total?: string;
  price?: number;
  sku?: string;
  image?: { id: string | number; src: string };
}

export interface WCOrder {
  id: number;
  parent_id: number;
  number: string;
  order_key: string;
  status:
    | "pending"
    | "processing"
    | "on-hold"
    | "completed"
    | "cancelled"
    | "refunded"
    | "failed"
    | "trash";
  currency: string;
  date_created: string;
  date_modified: string;
  discount_total: string;
  shipping_total: string;
  total: string;
  total_tax: string;
  prices_include_tax: boolean;
  customer_id: number;
  customer_ip_address: string;
  customer_user_agent: string;
  customer_note: string;
  billing: WCBillingAddress;
  shipping: WCShippingAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  date_paid: string | null;
  date_completed: string | null;
  line_items: WCOrderLineItem[];
  meta_data: Array<{ id?: number; key: string; value: unknown }>;
}

export interface WCCustomer {
  id: number;
  date_created: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: WCBillingAddress;
  shipping: WCShippingAddress;
  is_paying_customer: boolean;
  avatar_url: string;
}

export interface GetProductsParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  tag?: string;
  status?: "any" | "draft" | "pending" | "private" | "publish";
  type?: "simple" | "grouped" | "external" | "variable";
  sku?: string;
  featured?: boolean;
  on_sale?: boolean;
  min_price?: string;
  max_price?: string;
  stock_status?: "instock" | "outofstock" | "onbackorder";
  orderby?: "date" | "id" | "include" | "title" | "slug" | "price" | "popularity" | "rating";
  order?: "asc" | "desc";
  slug?: string;
}

export interface GetCategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
  parent?: number;
  hide_empty?: boolean;
  orderby?: "id" | "include" | "name" | "slug" | "term_group" | "description" | "count";
  order?: "asc" | "desc";
  slug?: string;
}

export interface GetOrdersParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  customer?: number;
  product?: number;
  orderby?: "date" | "id" | "include" | "title" | "slug";
  order?: "asc" | "desc";
}

// ==========================================
// CORE API CLIENT
// ==========================================

export async function wooCommerceFetch<T>(
  endpoint: string,
  options: RequestInit & {
    params?: Record<string, string | number | boolean | undefined>;
    revalidate?: number | false;
  } = {}
): Promise<T> {
  const baseUrl = WOOCOMMERCE_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseUrl}/wp-json/wc/v3${cleanEndpoint}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  // WooCommerce REST API Basic Auth over HTTPS
  if (CONSUMER_KEY && CONSUMER_SECRET) {
    const authString = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
    headers.set("Authorization", `Basic ${authString}`);
  }

  const { revalidate = 60, params: _p, ...fetchOptions } = options;

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
    next: revalidate !== false ? { revalidate } : undefined,
    cache: revalidate === false ? "no-store" : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    let errorJson: { message?: string; code?: string } = {};
    try {
      errorJson = JSON.parse(errorText);
    } catch {
      // not JSON
    }
    const message = errorJson.message || res.statusText || "WooCommerce API Request Failed";
    throw new Error(`WooCommerce API Error (${res.status}): ${message}`);
  }

  return res.json();
}

// ==========================================
// PRODUCT METHODS
// ==========================================

/**
 * Fetch a list of products with optional filters
 */
export async function getProducts(params?: GetProductsParams, revalidate: number | false = 60): Promise<WCProduct[]> {
  try {
    return await wooCommerceFetch<WCProduct[]>("/products", {
      params: params as Record<string, string | number | boolean | undefined>,
      revalidate,
    });
  } catch (error) {
    console.error("Error fetching WooCommerce products:", error);
    return [];
  }
}

/**
 * Fetch a single product by its numerical ID
 */
export async function getProductById(id: number | string, revalidate: number | false = 60): Promise<WCProduct | null> {
  try {
    return await wooCommerceFetch<WCProduct>(`/products/${id}`, { revalidate });
  } catch (error) {
    console.error(`Error fetching WooCommerce product ID ${id}:`, error);
    return null;
  }
}

/**
 * Fetch a single product by its URL slug
 */
export async function getProductBySlug(slug: string, revalidate: number | false = 60): Promise<WCProduct | null> {
  try {
    const products = await wooCommerceFetch<WCProduct[]>("/products", {
      params: { slug },
      revalidate,
    });
    return products.length > 0 ? products[0] : null;
  } catch (error) {
    console.error(`Error fetching WooCommerce product slug "${slug}":`, error);
    return null;
  }
}

// ==========================================
// CATEGORY METHODS
// ==========================================

/**
 * Fetch product categories
 */
export async function getCategories(
  params?: GetCategoriesParams,
  revalidate: number | false = 120
): Promise<WCCategory[]> {
  try {
    return await wooCommerceFetch<WCCategory[]>("/products/categories", {
      params: params as Record<string, string | number | boolean | undefined>,
      revalidate,
    });
  } catch (error) {
    console.error("Error fetching WooCommerce categories:", error);
    return [];
  }
}

/**
 * Fetch a category by its URL slug
 */
export async function getCategoryBySlug(slug: string, revalidate: number | false = 120): Promise<WCCategory | null> {
  try {
    const categories = await wooCommerceFetch<WCCategory[]>("/products/categories", {
      params: { slug },
      revalidate,
    });
    return categories.length > 0 ? categories[0] : null;
  } catch (error) {
    console.error(`Error fetching WooCommerce category slug "${slug}":`, error);
    return null;
  }
}

// ==========================================
// ORDER METHODS
// ==========================================

/**
 * Fetch orders with optional filters
 */
export async function getOrders(params?: GetOrdersParams): Promise<WCOrder[]> {
  try {
    return await wooCommerceFetch<WCOrder[]>("/orders", {
      params: params as Record<string, string | number | boolean | undefined>,
      revalidate: false,
    });
  } catch (error) {
    console.error("Error fetching WooCommerce orders:", error);
    return [];
  }
}

/**
 * Fetch a single order by ID
 */
export async function getOrderById(id: number | string): Promise<WCOrder | null> {
  try {
    return await wooCommerceFetch<WCOrder>(`/orders/${id}`, { revalidate: false });
  } catch (error) {
    console.error(`Error fetching WooCommerce order ID ${id}:`, error);
    return null;
  }
}

/**
 * Create a new order
 */
export async function createOrder(orderData: Partial<WCOrder>): Promise<WCOrder> {
  return await wooCommerceFetch<WCOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
    revalidate: false,
  });
}

// ==========================================
// CUSTOMER METHODS
// ==========================================

/**
 * Fetch customers with optional filters
 */
export async function getCustomers(params?: { page?: number; per_page?: number; search?: string }): Promise<WCCustomer[]> {
  try {
    return await wooCommerceFetch<WCCustomer[]>("/customers", {
      params: params as Record<string, string | number | boolean | undefined>,
      revalidate: false,
    });
  } catch (error) {
    console.error("Error fetching WooCommerce customers:", error);
    return [];
  }
}

/**
 * Fetch customer by ID
 */
export async function getCustomerById(id: number | string): Promise<WCCustomer | null> {
  try {
    return await wooCommerceFetch<WCCustomer>(`/customers/${id}`, { revalidate: false });
  } catch (error) {
    console.error(`Error fetching WooCommerce customer ID ${id}:`, error);
    return null;
  }
}
