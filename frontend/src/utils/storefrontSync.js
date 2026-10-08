export const CART_SYNC_KEY = "bf-storefront-cart-sync";
export const WISHLIST_SYNC_KEY = "bf-storefront-wishlist-sync";
export const AUTH_SYNC_KEY = "bf-storefront-auth-sync";
export const AUTH_CHANGED_EVENT = "bf:customer-auth-changed";

export function broadcastStorefrontChange(key) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, `${Date.now()}-${Math.random()}`);
  } catch {
    // The current tab already updates from the API response.
  }
}

export function notifyCustomerAuthChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  broadcastStorefrontChange(AUTH_SYNC_KEY);
}
