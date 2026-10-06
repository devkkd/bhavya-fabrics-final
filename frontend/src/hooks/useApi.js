'use client';

import { useState, useCallback } from 'react';

// Generic API hook for handling API calls with loading and error states
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiFunction(...args);
        if (response.success) {
          setData(response.data);
          return response;
        } else {
          const err = response.error || 'An error occurred';
          setError(err);
          return response;
        }
      } catch (err) {
        const errorMessage = err.message || 'An unexpected error occurred';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { data, isLoading, error, execute, reset };
};

// Specialized cart hook
export const useCart = (cartAPI) => {
  const [cart, setCart] = useState({
    items: [],
    totalPrice: 0,
    totalQuantity: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartAPI.get();
      if (response.success) {
        setCart(response.data || { items: [], totalPrice: 0, totalQuantity: 0 });
      } else {
        setError(response.error || 'Failed to fetch cart');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [cartAPI]);

  const addItem = useCallback(
    async (productId, quantity, selectedColor, selectedSize, selectedVariantId) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await cartAPI.addItem(
          productId,
          quantity,
          selectedColor,
          selectedSize,
          selectedVariantId
        );
        if (response.success) {
          setCart(response.data);
        } else {
          setError(response.error || 'Failed to add item');
        }
        return response;
      } catch (err) {
        setError(err.message || 'An error occurred');
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [cartAPI]
  );

  const removeItem = useCallback(
    async (itemId) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await cartAPI.removeItem(itemId);
        if (response.success) {
          setCart(response.data);
        } else {
          setError(response.error || 'Failed to remove item');
        }
        return response;
      } catch (err) {
        setError(err.message || 'An error occurred');
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [cartAPI]
  );

  const updateItem = useCallback(
    async (itemId, quantity, selectedColor, selectedSize) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await cartAPI.updateItem(itemId, quantity, selectedColor, selectedSize);
        if (response.success) {
          setCart(response.data);
        } else {
          setError(response.error || 'Failed to update item');
        }
        return response;
      } catch (err) {
        setError(err.message || 'An error occurred');
        return { success: false, error: err.message };
      } finally {
        setIsLoading(false);
      }
    },
    [cartAPI]
  );

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartAPI.clear();
      if (response.success) {
        setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
      } else {
        setError(response.error || 'Failed to clear cart');
      }
      return response;
    } catch (err) {
      setError(err.message || 'An error occurred');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [cartAPI]);

  return {
    cart,
    isLoading,
    error,
    getCart,
    addItem,
    removeItem,
    updateItem,
    clearCart,
  };
};
