// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH_REGISTER: `${API_BASE_URL}/auth/register`,
  AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
  AUTH_VERIFY_OTP: `${API_BASE_URL}/auth/verify-otp`,
  AUTH_RESEND_OTP: `${API_BASE_URL}/auth/resend-otp`,
  AUTH_ME: `${API_BASE_URL}/auth/me`,

  // Products
  PRODUCTS_LIST: `${API_BASE_URL}/products`,
  PRODUCT_DETAIL: (slug) => `${API_BASE_URL}/products/${slug}`,
  PRODUCTS_CREATE: `${API_BASE_URL}/products`,
  PRODUCT_UPDATE: (id) => `${API_BASE_URL}/products/${id}`,
  PRODUCT_DELETE: (id) => `${API_BASE_URL}/products/${id}`,

  // Cart
  CART_GET: `${API_BASE_URL}/cart`,
  CART_ADD_ITEM: `${API_BASE_URL}/cart/add-item`,
  CART_UPDATE_ITEM: (itemId) => `${API_BASE_URL}/cart/update-item/${itemId}`,
  CART_REMOVE_ITEM: (itemId) => `${API_BASE_URL}/cart/remove-item/${itemId}`,
  CART_CLEAR: `${API_BASE_URL}/cart/clear`,

  // Orders
  ORDERS_LIST: `${API_BASE_URL}/orders`,
  ORDER_DETAIL: (orderId) => `${API_BASE_URL}/orders/${orderId}`,
  ORDER_CREATE: `${API_BASE_URL}/orders/create`,
  ORDER_CANCEL: (orderId) => `${API_BASE_URL}/orders/${orderId}/cancel`,

  // Payments
  PAYMENT_INITIATE: (orderId) => `${API_BASE_URL}/payments/initiate/${orderId}`,
  PAYMENT_CALLBACK: `${API_BASE_URL}/payments/callback`,
  PAYMENT_STATUS: (orderId) => `${API_BASE_URL}/payments/status/${orderId}`,

  // Customers
  CUSTOMER_PROFILE: `${API_BASE_URL}/customers/profile`,
  CUSTOMER_UPDATE_PROFILE: `${API_BASE_URL}/customers/profile`,
  CUSTOMER_ADDRESSES: `${API_BASE_URL}/customers/addresses`,
  CUSTOMER_ADDRESS_DETAIL: (addressId) => `${API_BASE_URL}/customers/addresses/${addressId}`,
  CUSTOMER_ADD_ADDRESS: `${API_BASE_URL}/customers/addresses`,
  CUSTOMER_UPDATE_ADDRESS: (addressId) => `${API_BASE_URL}/customers/addresses/${addressId}`,
  CUSTOMER_DELETE_ADDRESS: (addressId) => `${API_BASE_URL}/customers/addresses/${addressId}`,

  // Wishlist
  WISHLIST_GET: `${API_BASE_URL}/wishlist`,
  WISHLIST_ADD: (productId) => `${API_BASE_URL}/wishlist/add/${productId}`,
  WISHLIST_REMOVE: (productId) => `${API_BASE_URL}/wishlist/remove/${productId}`,
  WISHLIST_CHECK: (productId) => `${API_BASE_URL}/wishlist/check/${productId}`,

  // Categories
  CATEGORIES_LIST: `${API_BASE_URL}/categories`,
  CATEGORY_DETAIL: (slug) => `${API_BASE_URL}/categories/${slug}`,
  SUBCATEGORY_DETAIL: (subSlug) => `${API_BASE_URL}/categories/subcategory/${subSlug}`,

  // Search
  SEARCH_PRODUCTS: `${API_BASE_URL}/search`,
  SEARCH_FILTERS: `${API_BASE_URL}/search/filters/available`,

  // Contact
  CONTACT_SUBMIT: `${API_BASE_URL}/contact`,

  // Admin
  ADMIN_ORDERS: `${API_BASE_URL}/admin/orders`,
  ADMIN_ORDER_UPDATE_STATUS: (orderId) => `${API_BASE_URL}/admin/orders/${orderId}/status`,
  ADMIN_CATEGORIES: `${API_BASE_URL}/admin/categories`,
  ADMIN_CATEGORY_CREATE: `${API_BASE_URL}/admin/categories`,
  ADMIN_CATEGORY_UPDATE: (categoryId) => `${API_BASE_URL}/admin/categories/${categoryId}`,
  ADMIN_CATEGORY_DELETE: (categoryId) => `${API_BASE_URL}/admin/categories/${categoryId}`,
  ADMIN_SUBCATEGORIES_CREATE: `${API_BASE_URL}/admin/subcategories`,
  ADMIN_PRODUCTS: `${API_BASE_URL}/admin/products`,
  ADMIN_PRODUCT_DELETE: (productId) => `${API_BASE_URL}/admin/products/${productId}`,
};

// Token storage keys
export const TOKEN_KEY = 'bhavya_auth_token';
export const CUSTOMER_KEY = 'bhavya_customer';
