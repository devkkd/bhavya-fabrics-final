"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

/**
 * CartStatusButton - Universal Add to Cart / Quantity Control Button
 * 
 * Props:
 * - productId: Product ID to add/update in cart
 * - onAdded: Callback when item is added
 * - compact: Show compact quantity controls (for product cards)
 * - showLabel: Show text label (true by default)
 */

const STYLES = `
/* =====================================================
   CART STATUS BUTTON - UNIVERSAL STYLES
===================================================== */

/* Full version (product details, expanded view) */
.cart-status-full {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-qty-control {
  display: flex;
  align-items: center;
  height: 44px;
  background: #F5F3F0;
  border: 1px solid #E4DCD4;
  border-radius: 8px;
  padding: 0 4px;
  gap: 4px;
}

.cart-qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: #295C65;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.2s ease;
  font-weight: 600;
}

.cart-qty-btn:hover:not(:disabled) {
  background: #EDE8E1;
}

.cart-qty-btn:disabled {
  color: #D4CCBF;
  cursor: not-allowed;
}

.cart-qty-display {
  display: inline-block;
  min-width: 24px;
  text-align: center;
  font-weight: 700;
  color: #295C65;
}

.cart-remove-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  height: 44px;
  background: #E8DCCF;
  border: 1px solid #D4CCBF;
  border-radius: 8px;
  color: #8B6F54;
  font-family: "Poppins", Arial, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cart-remove-btn:hover {
  background: #D4CCBF;
  color: #5D4A38;
}

/* Compact version (product cards) */
.cart-qty-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #E4DCD4;
  border-radius: 5px;
  padding: 2px;
  backdrop-filter: blur(4px);
}

.cart-qty-compact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  background: transparent;
  color: #295C65;
  cursor: pointer;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.cart-qty-compact-btn:hover:not(:disabled) {
  background: #F5F3F0;
}

.cart-qty-compact-btn:disabled {
  color: #D4CCBF;
  cursor: not-allowed;
}

.cart-qty-compact-display {
  display: inline-block;
  min-width: 16px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #295C65;
}

/* Action button (Add to Cart) */
.cart-action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #295C65;
  background: #FFFFFF;
  color: #295C65;
  border-radius: 8px;
  font-family: "Poppins", Arial, sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cart-action-button:hover:not(:disabled) {
  background: #295C65;
  color: #FFFFFF;
}

.cart-action-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cart-action-button.is-added {
  background: #1a7a45;
  border-color: #1a7a45;
  color: #FFFFFF;
}

.cart-action-button.is-animating {
  animation: pulse 0.6s ease-in-out infinite;
}

/* Compact action button (for product cards) */
.cart-action-button.cart-action-compact {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 6px;
}

.cart-action-button.cart-action-compact svg {
  margin: 0;
}

/* Animation */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .cart-status-full {
    gap: 6px;
  }

  .cart-qty-control {
    height: 38px;
    padding: 0 2px;
    gap: 2px;
  }

  .cart-qty-btn {
    width: 28px;
    height: 28px;
    font-size: 13px;
  }

  .cart-remove-btn {
    height: 38px;
    padding: 0 10px;
    font-size: 11px;
  }

  .cart-action-button {
    height: 38px;
    padding: 0 12px;
    font-size: 12px;
    gap: 6px;
  }

  .cart-action-button.cart-action-compact {
    width: 36px;
    height: 36px;
  }

  .cart-qty-compact {
    gap: 1px;
    padding: 1px;
  }

  .cart-qty-compact-btn {
    width: 20px;
    height: 20px;
  }

  .cart-qty-compact-display {
    font-size: 10px;
    min-width: 14px;
  }
}
`;

export default function CartStatusButton({
  productId,
  onAdded,
  onAdd,
  quantity = 1,
  selectedColor = "",
  selectedSize = "",
  variantId = "",
  compact = false,
  showLabel = true,
}) {
  const { addToCart, isInCart, items: cartItems, updateQuantity, removeItem } =
    useCart();

  const [state, setState] = useState("idle");
  const timeoutRef = useRef(null);

  /* Helper: Get cart item for this product */
  const getCartItem = useCallback(() => {
    return cartItems.find(
      (item) => item.productId?.toString() === productId?.toString()
    );
  }, [cartItems, productId]);

  /* Main Add to Cart handler */
  const handleAddToCart = useCallback(async () => {
    /* Prevent duplicate requests */
    if (state === "animating" || isInCart(productId)) {
      return;
    }

    setState("animating");

    const result = onAdd
      ? await onAdd()
      : await addToCart(String(productId), quantity, {
          selectedColor,
          selectedSize,
          variantId,
        });

    if (result?.loginRequired) {
      setState("idle");
      return;
    }

    if (result?.success) {
      setState("added");

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setState("idle");
      }, 1800);

      onAdded?.();
    } else {
      setState("idle");
    }
  }, [
    state,
    productId,
    isInCart,
    addToCart,
    onAdd,
    quantity,
    selectedColor,
    selectedSize,
    variantId,
    onAdded,
  ]);

  /* Decrease quantity handler */
  const handleDecreaseQty = useCallback(() => {
    const cartItem = getCartItem();
    if (cartItem && cartItem.quantity > 1) {
      updateQuantity(cartItem._id, cartItem.quantity - 1);
    }
  }, [getCartItem, updateQuantity]);

  /* Increase quantity handler */
  const handleIncreaseQty = useCallback(() => {
    const cartItem = getCartItem();
    if (cartItem) {
      updateQuantity(cartItem._id, cartItem.quantity + 1);
    }
  }, [getCartItem, updateQuantity]);

  /* Remove from cart handler */
  const handleRemove = useCallback(() => {
    const cartItem = getCartItem();
    if (cartItem) {
      removeItem(cartItem._id);
    }
  }, [getCartItem, removeItem]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      
      {/* Product is in cart - show quantity controls */}
      {isInCart(productId) ? (
        (() => {
          const cartItem = getCartItem();

          if (compact) {
            /* Compact version for product cards */
            return (
              <div className="cart-qty-compact">
                <button
                  type="button"
                  className="cart-qty-compact-btn"
                  onClick={handleDecreaseQty}
                  disabled={!cartItem || cartItem.quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={11} />
                </button>

                <span className="cart-qty-compact-display">{cartItem?.quantity || 1}</span>

                <button
                  type="button"
                  className="cart-qty-compact-btn"
                  onClick={handleIncreaseQty}
                  aria-label="Increase quantity"
                >
                  <Plus size={11} />
                </button>
              </div>
            );
          }

          /* Full version for product details page */
          return (
            <div className="cart-status-full">
              <div className="cart-qty-control">
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={handleDecreaseQty}
                  disabled={!cartItem || cartItem.quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>

                <span className="cart-qty-display">{cartItem?.quantity || 1}</span>

                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={handleIncreaseQty}
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                type="button"
                className="cart-remove-btn"
                onClick={handleRemove}
                aria-label="Remove from cart"
              >
                Remove
              </button>
            </div>
          );
        })()
      ) : (
        /* Not in cart - show Add to Cart button */
        <button
          type="button"
          className={`cart-action-button ${state === "added" ? "is-added" : ""} ${
            state === "animating" ? "is-animating" : ""
          } ${compact ? "cart-action-compact" : ""}`}
          onClick={handleAddToCart}
          disabled={state === "animating"}
          aria-label={
            state === "added"
              ? "Added to cart"
              : state === "animating"
              ? "Adding to cart..."
              : "Add to cart"
          }
        >
          {state === "added" ? (
            <>
              <Check size={compact ? 14 : 17} strokeWidth={2.5} />
              {showLabel && !compact && <span>Added</span>}
            </>
          ) : state === "animating" ? (
            <>
              <ShoppingCart size={compact ? 14 : 17} strokeWidth={2} />
              {showLabel && !compact && <span>Adding...</span>}
            </>
          ) : (
            <>
              <ShoppingCart size={compact ? 14 : 17} strokeWidth={2} />
              {showLabel && !compact && <span>Add to Cart</span>}
            </>
          )}
        </button>
      )}
    </>
  );
}
