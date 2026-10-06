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

  const initialised = useRef(false);

  /* ── 1. Check auth on mount ── */
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    checkAuthAndLoad();
  }, []);

  async function checkAuthAndLoad() {
    try {
      const res  = await fetch(`${API_URL}/customer-auth/me`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) { setCustomer(false); return; }
      const data = await res.json();
      const user = data?.user || null;
      setCustomer(user);
      if (user) await loadWishlist();
    } catch {
      setCustomer(false);
    }
  }

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

  /* ── 3. Toggle save (add if not saved, remove if saved) ── */
  const toggleSave = useCallback(async (productId) => {
    if (!productId) return { success: false };

    /* login guard */
    if (customer === false || customer === null) {
      return { success: false, loginRequired: true, message: "Please login to save products" };
    }

    const alreadySaved = items.some(
      (i) => i.productId?.toString() === productId?.toString()
    );

    try {
      if (alreadySaved) {
        /* optimistic remove */
        setItems((prev) => prev.filter((i) => i.productId?.toString() !== productId?.toString()));
        setItemCount((c) => Math.max(0, c - 1));

        const res  = await fetch(`${API_URL}/wishlist/items/${productId}`, {
          method:      "DELETE",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setItems(data.wishlist.items     || []);
          setItemCount(data.wishlist.itemCount || 0);
        } else {
          /* rollback */
          await loadWishlist();
        }
        return { success: true, saved: false };
      } else {
        /* optimistic add — snapshot not known yet, real data comes from server */
        setItemCount((c) => c + 1);

        const res  = await fetch(`${API_URL}/wishlist/items`, {
          method:      "POST",
          credentials: "include",
          headers:     { "Content-Type": "application/json" },
          body:        JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (data.success) {
          setItems(data.wishlist.items     || []);
          setItemCount(data.wishlist.itemCount || 0);
          return { success: true, saved: true };
        }
        setItemCount((c) => Math.max(0, c - 1)); // rollback count
        return { success: false, message: data.message };
      }
    } catch {
      await loadWishlist(); // re-sync on error
      return { success: false, message: "Network error" };
    }
  }, [customer, items, loadWishlist]);

  /* ── 4. Is product saved? ── */
  const isSaved = useCallback((productId) => {
    return items.some((i) => i.productId?.toString() === productId?.toString());
  }, [items]);

  /* ── 5. Re-check auth ── */
  const refreshAuth = useCallback(async () => {
    initialised.current = false;
    setItems([]);
    setItemCount(0);
    setCustomer(null);
    await checkAuthAndLoad();
  }, []);

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
