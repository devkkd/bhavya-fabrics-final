import { ENDPOINTS, TOKEN_KEY } from '@/lib/constants';

// API Client wrapper
class ApiClient {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  }

  // Get stored token
  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  // Set token
  setToken(token) {
    if (typeof window === 'undefined') return;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // Build headers with auth token
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Generic request method
  async request(method, url, data = null, customHeaders = {}) {
    try {
      const options = {
        method,
        headers: this.getHeaders(customHeaders),
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          // Redirect to login
          window.location.href = '/auth/login';
        }
      }

      return {
        status: response.status,
        success: result.success,
        data: result.data,
        message: result.message,
        error: result.error,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        status: 0,
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // GET request
  get(url) {
    return this.request('GET', url);
  }

  // POST request
  post(url, data) {
    return this.request('POST', url, data);
  }

  // PUT request
  put(url, data) {
    return this.request('PUT', url, data);
  }

  // DELETE request
  delete(url) {
    return this.request('DELETE', url);
  }
}

export const apiClient = new ApiClient();

// Auth API
export const authAPI = {
  register: (email, password, confirmPassword, firstName, lastName) =>
    apiClient.post(ENDPOINTS.AUTH_REGISTER, {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
    }),

  login: (email, password) =>
    apiClient.post(ENDPOINTS.AUTH_LOGIN, { email, password }),

  logout: () => apiClient.post(ENDPOINTS.AUTH_LOGOUT),

  verifyOTP: (email, otp) =>
    apiClient.post(ENDPOINTS.AUTH_VERIFY_OTP, { email, otp }),

  resendOTP: (email) =>
    apiClient.post(ENDPOINTS.AUTH_RESEND_OTP, { email }),

  getMe: () => apiClient.get(ENDPOINTS.AUTH_ME),
};

// Products API
export const productsAPI = {
  getAll: (limit = 10, skip = 0, category = '') =>
    apiClient.get(`${ENDPOINTS.PRODUCTS_LIST}?limit=${limit}&skip=${skip}&category=${category}`),

  getBySlug: (slug) =>
    apiClient.get(ENDPOINTS.PRODUCT_DETAIL(slug)),

  create: (productData) =>
    apiClient.post(ENDPOINTS.PRODUCTS_CREATE, productData),

  update: (id, productData) =>
    apiClient.put(ENDPOINTS.PRODUCT_UPDATE(id), productData),

  delete: (id) =>
    apiClient.delete(ENDPOINTS.PRODUCT_DELETE(id)),
};

// Cart API
export const cartAPI = {
  get: () => apiClient.get(ENDPOINTS.CART_GET),

  addItem: (productId, quantity, selectedColor, selectedSize, selectedVariantId) =>
    apiClient.post(ENDPOINTS.CART_ADD_ITEM, {
      productId,
      quantity,
      selectedColor,
      selectedSize,
      selectedVariantId,
    }),

  updateItem: (itemId, quantity, selectedColor, selectedSize) =>
    apiClient.put(ENDPOINTS.CART_UPDATE_ITEM(itemId), {
      quantity,
      selectedColor,
      selectedSize,
    }),

  removeItem: (itemId) =>
    apiClient.delete(ENDPOINTS.CART_REMOVE_ITEM(itemId)),

  clear: () => apiClient.delete(ENDPOINTS.CART_CLEAR),
};

// Orders API
export const ordersAPI = {
  getAll: (limit = 10, skip = 0) =>
    apiClient.get(`${ENDPOINTS.ORDERS_LIST}?limit=${limit}&skip=${skip}`),

  getById: (orderId) =>
    apiClient.get(ENDPOINTS.ORDER_DETAIL(orderId)),

  create: (shippingAddress, paymentMethod) =>
    apiClient.post(ENDPOINTS.ORDER_CREATE, {
      ...shippingAddress,
      paymentMethod,
    }),

  cancel: (orderId, reason) =>
    apiClient.put(ENDPOINTS.ORDER_CANCEL(orderId), { reason }),
};

// Payments API
export const paymentsAPI = {
  initiate: (orderId) =>
    apiClient.post(ENDPOINTS.PAYMENT_INITIATE(orderId)),

  getStatus: (orderId) =>
    apiClient.get(ENDPOINTS.PAYMENT_STATUS(orderId)),

  handleCallback: (paymentId, orderId, status, transactionId) =>
    apiClient.post(ENDPOINTS.PAYMENT_CALLBACK, {
      paymentId,
      orderId,
      status,
      transactionId,
    }),
};

// Customers API
export const customersAPI = {
  getProfile: () =>
    apiClient.get(ENDPOINTS.CUSTOMER_PROFILE),

  updateProfile: (profileData) =>
    apiClient.put(ENDPOINTS.CUSTOMER_UPDATE_PROFILE, profileData),

  getAddresses: () =>
    apiClient.get(ENDPOINTS.CUSTOMER_ADDRESSES),

  getAddress: (addressId) =>
    apiClient.get(ENDPOINTS.CUSTOMER_ADDRESS_DETAIL(addressId)),

  addAddress: (addressData) =>
    apiClient.post(ENDPOINTS.CUSTOMER_ADD_ADDRESS, addressData),

  updateAddress: (addressId, addressData) =>
    apiClient.put(ENDPOINTS.CUSTOMER_UPDATE_ADDRESS(addressId), addressData),

  deleteAddress: (addressId) =>
    apiClient.delete(ENDPOINTS.CUSTOMER_DELETE_ADDRESS(addressId)),
};

// Wishlist API
export const wishlistAPI = {
  get: () => apiClient.get(ENDPOINTS.WISHLIST_GET),

  add: (productId) =>
    apiClient.post(ENDPOINTS.WISHLIST_ADD(productId)),

  remove: (productId) =>
    apiClient.delete(ENDPOINTS.WISHLIST_REMOVE(productId)),

  check: (productId) =>
    apiClient.get(ENDPOINTS.WISHLIST_CHECK(productId)),
};

// Categories API
export const categoriesAPI = {
  getAll: () => apiClient.get(ENDPOINTS.CATEGORIES_LIST),

  getBySlug: (slug) =>
    apiClient.get(ENDPOINTS.CATEGORY_DETAIL(slug)),

  getSubcategory: (subSlug) =>
    apiClient.get(ENDPOINTS.SUBCATEGORY_DETAIL(subSlug)),
};

// Search API
export const searchAPI = {
  search: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get(`${ENDPOINTS.SEARCH_PRODUCTS}?${queryString}`);
  },

  getFilters: (category = '') =>
    apiClient.get(`${ENDPOINTS.SEARCH_FILTERS}${category ? `?category=${category}` : ''}`),
};

// Contact API
export const contactAPI = {
  submit: (contactData) =>
    apiClient.post(ENDPOINTS.CONTACT_SUBMIT, contactData),
};
