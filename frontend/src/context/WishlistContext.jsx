"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AUTH_CHANGED_EVENT,
  AUTH_SYNC_KEY,
  WISHLIST_SYNC_KEY,
  broadcastStorefrontChange,
  requestCustomerLogin,
} from "@/utils/storefrontSync";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");

/* ─────────────────────────────────────────
   Context
───────────────────────────────────────── */
const WishlistContext = createContext(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be inside WishlistProvider");
  return ctx;
}

/* ─────────────────────────────────────────
   Provider
───────────────────────────────────────── */
export function WishlistProvider({ children }) {
  const [items,     setItems]     = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [customer,  setCustomer]  = useState(null);
  const [pendingProductIds, setPendingProductIds] = useState([]);
  const [busyProductIds, setBusyProductIds] = useState([]);

  const initialised = useRef(false);
  const toggleSaveRef = useRef(null);

  /* ── 2. Load wishlist from server ── */
  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await fetch(`${API_URL}/wishlist`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setItems(data.wishlist.items     || []);
        setItemCount(data.wishlist.itemCount || 0);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAuthAndLoad = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/customer-auth/me`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setCustomer(false);
        setItems([]);
        setItemCount(0);
        return false;
      }

      const data = await res.json();
      const user = data?.user || null;
      setCustomer(user);
      if (user) {
        await loadWishlist();
      } else {
        setItems([]);
        setItemCount(0);
      }
      return user;
    } catch {
      setCustomer(false);
      setItems([]);
      setItemCount(0);
      return false;
    }
  }, [loadWishlist]);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    checkAuthAndLoad();
  }, [checkAuthAndLoad]);

  useEffect(() => {
    const syncVisibleWishlist = () => {
      if (document.visibilityState === "visible") {
        checkAuthAndLoad();
      }
    };

    const handleStorage = (event) => {
      if (event.key === AUTH_SYNC_KEY) {
        checkAuthAndLoad();
      } else if (event.key === WISHLIST_SYNC_KEY) {
        loadWishlist();
      }
    };

    window.addEventListener("focus", checkAuthAndLoad);
    window.addEventListener("pageshow", checkAuthAndLoad);
    window.addEventListener(AUTH_CHANGED_EVENT, checkAuthAndLoad);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", syncVisibleWishlist);

    return () => {
      window.removeEventListener("focus", checkAuthAndLoad);
      window.removeEventListener("pageshow", checkAuthAndLoad);
      window.removeEventListener(AUTH_CHANGED_EVENT, checkAuthAndLoad);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", syncVisibleWishlist);
    };
  }, [checkAuthAndLoad, loadWishlist]);

  /* ── 3. Toggle save (add if not saved, remove if saved) ── */
  const toggleSave = useCallback(async (productId) => {
    if (!productId) return { success: false };

    /* login guard */
    let activeCustomer = customer;
    if (!activeCustomer) {
      activeCustomer = await checkAuthAndLoad();
    }
    if (!activeCustomer) {
      requestCustomerLogin(() =>
        toggleSaveRef.current?.(productId)
      );
      return { success: false, loginRequired: true, message: "Please login to save products" };
    }

    const normalizedId = String(productId);
    const alreadySaved =
      items.some(
        (i) =>
          String(i.productId?._id || i.productId?.id || i.productId) ===
          normalizedId
      );
    if (busyProductIds.includes(normalizedId)) {
      return { success: false, message: "Wishlist update is already in progress" };
    }

    setBusyProductIds((prev) => [...prev, normalizedId]);
    try {
      if (alreadySaved) {
        /* optimistic remove */
        setItems((prev) =>
          prev.filter(
            (i) =>
              String(i.productId?._id || i.productId?.id || i.productId) !==
              normalizedId
          )
        );
        setItemCount((c) => Math.max(0, c - 1));

        const res  = await fetch(`${API_URL}/wishlist/items/${productId}`, {
          method:      "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setItems(data.wishlist.items     || []);
          setItemCount(data.wishlist.itemCount || 0);
          broadcastStorefrontChange(WISHLIST_SYNC_KEY);
        } else {
          /* rollback */
          await loadWishlist();
        }
        return {
          success: res.ok && data.success,
          saved: false,
          message: data?.message,
        };
      } else {
        /* optimistic add — snapshot not known yet, real data comes from server */
        setPendingProductIds((prev) => [...prev, normalizedId]);
        setItemCount((c) => c + 1);

        try {
          const res = await fetch(`${API_URL}/wishlist/items`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setItems(data.wishlist.items || []);
            setItemCount(data.wishlist.itemCount || 0);
            broadcastStorefrontChange(WISHLIST_SYNC_KEY);
            return { success: true, saved: true };
          }
          setItemCount((c) => Math.max(0, c - 1));
          return { success: false, message: data.message };
        } finally {
          setPendingProductIds((prev) =>
            prev.filter((id) => id !== normalizedId)
          );
        }
      }
    } catch {
      await loadWishlist(); // re-sync on error
      return { success: false, message: "Network error" };
    } finally {
      setBusyProductIds((prev) =>
        prev.filter((id) => id !== normalizedId)
      );
    }
  }, [
    customer,
    items,
    loadWishlist,
    busyProductIds,
    checkAuthAndLoad,
  ]);

  useEffect(() => {
    toggleSaveRef.current = toggleSave;
  }, [toggleSave]);

  /* ── 4. Is product saved? ── */
  const isSaved = useCallback((productId) => {
    const normalizedId = String(productId);
    return (
      pendingProductIds.includes(normalizedId) ||
      items.some(
        (i) =>
          String(i.productId?._id || i.productId?.id || i.productId) ===
          normalizedId
      )
    );
  }, [items, pendingProductIds]);

  /* ── 5. Re-check auth ── */
  const refreshAuth = useCallback(async () => {
    initialised.current = true;
    setItems([]);
    setItemCount(0);
    setCustomer(null);
    setPendingProductIds([]);
    setBusyProductIds([]);
    await checkAuthAndLoad();
  }, [checkAuthAndLoad]);

  const value = {
    items,
    itemCount,
    loading,
    customer,
    isLoggedIn: !!customer,
    toggleSave,
    isSaved,
    loadWishlist,
    refreshAuth,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
