"use client";

import { usePathname } from "next/navigation";

import Header       from "@/components/Header";
import Footer       from "@/components/Footer";
import JoinSection  from "@/components/Joinsection";

import { CartProvider,     useCart     } from "@/context/CartContext";
import { WishlistProvider, useWishlist } from "@/context/WishlistContext";
import { StorefrontPreferencesProvider } from "@/context/StorefrontPreferencesContext";

/* Inner shell reads counts from context and passes them to Header */
function ShellInner({ children }) {
  const pathname      = usePathname();
  const isAdminRoute  = pathname?.startsWith("/admin");

  const { itemCount: cartCount     } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  return (
    <>
      {!isAdminRoute && (
        <Header
          cartCount={cartCount}
          wishlistCount={wishlistCount}
        />
      )}
      {children}
      {!isAdminRoute && <JoinSection />}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default function SiteShell({ children }) {
  const isAdminRoute = usePathname()?.startsWith("/admin");
  const site = (
    <StorefrontPreferencesProvider>
      <CartProvider>
        <WishlistProvider>
          <ShellInner>{children}</ShellInner>
        </WishlistProvider>
      </CartProvider>
    </StorefrontPreferencesProvider>
  );

  if (isAdminRoute) {
    return (
      <CartProvider>
        <WishlistProvider>
          <ShellInner>{children}</ShellInner>
        </WishlistProvider>
      </CartProvider>
    );
  }

  return site;
}
