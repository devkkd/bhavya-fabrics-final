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

  const [buyNowItems, setBuyNowItems] = useState([]);

  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const [buyNowSessionId, setBuyNowSessionId] = useState("");



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



  /*
   * BUY NOW
   * The server-side Buy Now session is the source of truth.
   * It stores the selected colour, size, variant, images and prices.
   */

  const restoreBuyNowSession = useCallback(
    async (sessionId) => {
      const id = String(sessionId || "").trim();

      if (!id) {
        return {
          success: false,
          message: "Buy Now session ID is missing",
        };
      }

      setBuyNowLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/payments/buy-now/${encodeURIComponent(id)}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (response.status === 401) {
          setCustomer(false);
          setBuyNowItems([]);
          setBuyNowSessionId("");

          return {
            success: false,
            loginRequired: true,
            message: "Please login to continue",
          };
        }

        if (!response.ok || !data?.success || !data?.session) {
          setBuyNowItems([]);
          setBuyNowSessionId("");

          return {
            success: false,
            message:
              data?.message ||
              "Buy Now session expired or invalid",
          };
        }

        const session = data.session;
        const snapshot = session.snapshot || {};

        const finalPrice = Number(snapshot.finalPrice);
        const variantSalePrice = Number(
          snapshot.variantSalePrice
        );
        const salePrice = Number(snapshot.salePrice);
        const variantRegularPrice = Number(
          snapshot.variantRegularPrice
        );
        const regularPrice = Number(snapshot.regularPrice);

        let resolvedPrice = 0;

        if (
          Number.isFinite(finalPrice) &&
          finalPrice > 0
        ) {
          resolvedPrice = finalPrice;
        } else if (
          snapshot.showOnSale &&
          Number.isFinite(variantSalePrice) &&
          variantSalePrice > 0
        ) {
          resolvedPrice = variantSalePrice;
        } else if (
          snapshot.showOnSale &&
          Number.isFinite(salePrice) &&
          salePrice > 0
        ) {
          resolvedPrice = salePrice;
        } else if (
          Number.isFinite(variantRegularPrice) &&
          variantRegularPrice > 0
        ) {
          resolvedPrice = variantRegularPrice;
        } else if (
          Number.isFinite(regularPrice) &&
          regularPrice > 0
        ) {
          resolvedPrice = regularPrice;
        }

        const restoredItem = {
          _id: String(session.id || id),
          isBuyNow: true,
          sessionId: String(session.id || id),
          productId: session.productId,
          quantity: Number(session.quantity || 1),

          selectedColor:
            session.selectedColor ||
            snapshot.selectedColor ||
            "",

          selectedSize:
            session.selectedSize ||
            snapshot.selectedSize ||
            "",

          variantId: session.variantId || "",

          sku: snapshot.sku || "",
          title: snapshot.title || "Product",
          slug: snapshot.slug || "",
          imageUrl: snapshot.imageUrl || "",

          images: Array.isArray(snapshot.images)
            ? snapshot.images
            : [],

          colorImages: Array.isArray(snapshot.colorImages)
            ? snapshot.colorImages
            : [],

          price: resolvedPrice,
          regularPrice:
            Number.isFinite(regularPrice)
              ? regularPrice
              : 0,

          salePrice:
            snapshot.salePrice == null
              ? null
              : Number(snapshot.salePrice),

          variantRegularPrice:
            snapshot.variantRegularPrice == null
              ? null
              : Number(snapshot.variantRegularPrice),

          variantSalePrice:
            snapshot.variantSalePrice == null
              ? null
              : Number(snapshot.variantSalePrice),

          showOnSale: Boolean(snapshot.showOnSale),
          finalPrice:
            Number.isFinite(finalPrice)
              ? finalPrice
              : 0,

          sellingMode: snapshot.sellingMode || "piece",
          priceUnit: snapshot.priceUnit || "",
          bulkOrderNote: snapshot.bulkOrderNote || "",

          sizeMeters:
            snapshot.sizeMeters ??
            snapshot.sizeSnapshot?.meters ??
            null,

          sizeShippingCharge:
            snapshot.sizeShippingCharge ??
            snapshot.sizeSnapshot?.shippingCharge ??
            null,

          sizeRegularPrice:
            snapshot.sizeRegularPrice ??
            snapshot.sizeSnapshot?.regularPrice ??
            null,

          sizeSalePrice:
            snapshot.sizeSalePrice ??
            snapshot.sizeSnapshot?.salePrice ??
            null,

          sizeFoldLength:
            snapshot.sizeFoldLength ??
            snapshot.sizeSnapshot?.foldLength ??
            null,

          specifications:
            Array.isArray(snapshot.specifications)
              ? snapshot.specifications
              : [],

          snapshot,
        };

        const restoredSessionId =
          String(session.id || id);

        setBuyNowSessionId(restoredSessionId);
        setBuyNowItems([restoredItem]);

        try {
          localStorage.setItem(
            "buyNowSessionId",
            restoredSessionId
          );
        } catch {
          /* optional persistence */
        }

        return {
          success: true,
          session,
          item: restoredItem,
        };
      } catch (error) {
        console.error(
          "restoreBuyNowSession error:",
          error
        );

        setBuyNowItems([]);
        setBuyNowSessionId("");

        return {
          success: false,
          message: "Failed to restore Buy Now session",
        };
      } finally {
        setBuyNowLoading(false);
      }
    },
    []
  );

  const prepareBuyNow = useCallback(
    async (
      productData,
      quantity = 1,
      options = {}
    ) => {
      setBuyNowLoading(true);

      if (
        !productData ||
        (!productData._id && !productData.id)
      ) {
        setBuyNowLoading(false);

        return {
          success: false,
          message: "Product not found",
        };
      }

      let activeCustomer = customer;

      if (!activeCustomer) {
        activeCustomer = await fetchCustomer();
      }

      if (!activeCustomer) {
        setBuyNowLoading(false);

        return {
          success: false,
          loginRequired: true,
          message: "Please login to buy now",
        };
      }

      try {
        const productId =
          productData._id ||
          productData.id;

        const response = await fetch(
          `${API_URL}/payments/buy-now`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: String(productId),
              quantity: Math.max(
                1,
                Math.min(
                  100,
                  Math.floor(quantity || 1)
                )
              ),
              selectedColor:
                options?.selectedColor || "",
              selectedSize:
                options?.selectedSize || "",
              variantId:
                options?.variantId || "",
            }),
          }
        );

        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok || !data?.success) {
          return {
            success: false,
            message:
              data?.message ||
              "Failed to prepare buy now",
          };
        }

        const sessionId = String(
          data?.sessionId || ""
        ).trim();

        if (!sessionId) {
          return {
            success: false,
            message:
              "Buy Now session ID was not returned by the server.",
          };
        }

        setBuyNowSessionId(sessionId);

        /*
         * POST only creates the session. GET returns the full authoritative
         * snapshot, so restore it immediately before routing to checkout.
         */
        const restored =
          await restoreBuyNowSession(sessionId);

        if (!restored?.success) {
          setBuyNowItems([]);
          setBuyNowSessionId("");

          return {
            success: false,
            message:
              restored?.message ||
              "Unable to load the Buy Now product details.",
          };
        }

        try {
          localStorage.setItem(
            "buyNowSessionId",
            sessionId
          );
        } catch {
          /* URL remains the source of truth */
        }

        return {
          success: true,
          message: "Ready for checkout",
          sessionId,
          item: restored?.item || null,
        };
      } catch (err) {
        console.error(
          "prepareBuyNow error:",
          err
        );

        return {
          success: false,
          message:
            err?.message ||
            "Failed to prepare buy now",
        };
      } finally {
        setBuyNowLoading(false);
      }
    },
    [
      customer,
      fetchCustomer,
      restoreBuyNowSession,
    ]
  );

  const clearBuyNowItems = useCallback(() => {
    setBuyNowItems([]);
    setBuyNowSessionId("");

    try {
      localStorage.removeItem("buyNowItem");
      localStorage.removeItem("buyNowSessionId");
    } catch (e) {
      console.warn(
        "Failed to clear Buy Now storage:",
        e
      );
    }
  }, []);



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

    buyNowItems,

    buyNowLoading,

    buyNowSessionId,

    prepareBuyNow,

    restoreBuyNowSession,

    clearBuyNowItems,

  };



  return (

    <CartContext.Provider value={value}>

      {children}

    </CartContext.Provider>

  );

}
