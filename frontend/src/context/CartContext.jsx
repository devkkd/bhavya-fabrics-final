"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");

const CartContext = createContext(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be inside CartProvider");
  }
  return ctx;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);

  const initialised = useRef(false);

  const applyCartResponse = useCallback((data) => {
    if (data?.success && data?.cart) {
      setItems(Array.isArray(data.cart.items) ? data.cart.items : []);
      setItemCount(Number(data.cart.itemCount || 0));
      return true;
    }
    return false;
  }, []);

  const fetchCustomer = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/customer-auth/me`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        setCustomer(false);
        return null;
      }

      const payload = await response.json();
      const user = payload?.user || null;
      setCustomer(user || false);
      return user;
    } catch {
      setCustomer(false);
      return null;
    }
  }, []);

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/cart`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        setCustomer(false);
        setItems([]);
        setItemCount(0);
        return false;
      }

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return applyCartResponse(data);
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [applyCartResponse]);

  const checkAuthAndLoad = useCallback(async () => {
    const user = await fetchCustomer();

    if (user) {
      await loadCart();
    } else {
      setItems([]);
      setItemCount(0);
      setLoading(false);
    }
  }, [fetchCustomer, loadCart]);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    checkAuthAndLoad();
  }, [checkAuthAndLoad]);

  const addToCart = useCallback(
    async (productId, quantity = 1, options = {}) => {
      if (!productId) {
        return {
          success: false,
          message: "No product ID",
        };
      }

      /*
       * Do not trust the cached auth state forever.
       * This also fixes the common case where the user logs in
       * after CartProvider initially saw them as logged out.
       */
      let activeCustomer = customer;

      if (!activeCustomer) {
        activeCustomer = await fetchCustomer();
      }

      if (!activeCustomer) {
        return {
          success: false,
          loginRequired: true,
          message: "Please login to add items to cart",
        };
      }

      try {
        const response = await fetch(`${API_URL}/cart/items`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity,
            selectedColor: options?.selectedColor || "",
            selectedSize: options?.selectedSize || "",
            variantId: options?.variantId || "",
          }),
        });

        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.status === 401) {
          const refreshedCustomer = await fetchCustomer();

          if (!refreshedCustomer) {
            return {
              success: false,
              loginRequired: true,
              message: "Please login to add items to cart",
            };
          }

          return {
            success: false,
            message:
              data?.message ||
              "Your session changed. Please try adding again.",
          };
        }

        if (response.status === 404) {
          return {
            success: false,
            message:
              data?.message ||
              "Product not found or unavailable",
          };
        }

        if (response.ok && applyCartResponse(data)) {
          return {
            success: true,
            message: data?.message || "Added to cart",
          };
        }

        return {
          success: false,
          message: data?.message || "Failed to add to cart",
        };
      } catch {
        return {
          success: false,
          message: "Network error",
        };
      }
    },
    [customer, fetchCustomer, applyCartResponse]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (!itemId) return;

      if (quantity < 1) {
        await removeItem(itemId);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity,
          }),
        });

        if (response.status === 401) {
          setCustomer(false);
          setItems([]);
          setItemCount(0);
          return;
        }

        const data = await response.json();
        applyCartResponse(data);
      } catch {
        /* silent */
      }
    },
    [applyCartResponse]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!itemId) return;

      try {
        const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.status === 401) {
          setCustomer(false);
          setItems([]);
          setItemCount(0);
          return;
        }

        const data = await response.json();
        applyCartResponse(data);
      } catch {
        /* silent */
      }
    },
    [applyCartResponse]
  );

  const clearCart = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        setCustomer(false);
      }

      setItems([]);
      setItemCount(0);
    } catch {
      setItems([]);
      setItemCount(0);
    }
  }, []);

  const isInCart = useCallback(
    (productId) => {
      return items.some(
        (item) =>
          item.productId?.toString() === productId?.toString()
      );
    },
    [items]
  );

  const refreshAuth = useCallback(async () => {
    initialised.current = true;
    setItems([]);
    setItemCount(0);
    setCustomer(null);
    setLoading(true);
    await checkAuthAndLoad();
  }, [checkAuthAndLoad]);

  const value = {
    items,
    itemCount,
    loading,
    customer,
    isLoggedIn: Boolean(customer),
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    isInCart,
    loadCart,
    refreshAuth,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
