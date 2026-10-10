"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Zap,
} from "lucide-react";

import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { StorefrontPrice } from "@/context/StorefrontPreferencesContext";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");

const PAGE_SIZE = 8;

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};

const FALLBACK_IMAGE = "/images/home/products/1.png";

function imageValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return (
    value?.url ||
    value?.src ||
    value?.secure_url ||
    value?.deliveryUrl ||
    value?.imageUrl ||
    ""
  );
}

function optionName(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return String(
    value?.name ||
      value?.value ||
      value?.color ||
      value?.colour ||
      value?.size ||
      value?.code ||
      ""
  ).trim();
}

function optionValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return String(
    value?.value ||
      value?.name ||
      value?.color ||
      value?.colour ||
      value?.size ||
      value?.code ||
      ""
  ).trim();
}

function optionHex(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return String(value?.hex || value?.value || value?.name || "").trim();
}

function normalizeColor(value) {
  const name = optionName(value);
  if (!name) return null;
  return {
    name,
    value: optionValue(value) || name,
    hex: optionHex(value) || optionValue(value) || name,
  };
}

function normalizeSize(value) {
  const name = optionName(value);
  if (!name) return null;
  return {
    name,
    value: optionValue(value) || name,
  };
}

function normalizeVariant(value) {
  if (!value) return null;

  const colorRaw =
    value?.color ??
    value?.colour ??
    value?.selectedColor ??
    "";

  const sizeRaw =
    value?.size ??
    value?.selectedSize ??
    "";

  return {
    id: String(value?._id || value?.id || ""),
    colorOption: normalizeColor(colorRaw),
    sizeOption: normalizeSize(sizeRaw),
    color: optionName(colorRaw),
    size: optionName(sizeRaw),
    regularPrice: Number(value?.regularPrice || 0) || 0,
    salePrice: Number(value?.salePrice || 0) || 0,
    sku: value?.sku || "",
    stock:
      value?.stock === undefined || value?.stock === null
        ? null
        : Number(value.stock),
    active: value?.active !== false,
    images: Array.isArray(value?.images)
      ? value.images.map(imageValue).filter(Boolean)
      : [],
  };
}

function getColorOptions(item) {
  const source = Array.isArray(item?.options?.colors)
    ? item.options.colors
    : Array.isArray(item?.colorOptions)
    ? item.colorOptions
    : Array.isArray(item?.colors)
    ? item.colors
    : [];

  return source.map(normalizeColor).filter(Boolean);
}

function getSizeOptions(item) {
  const source = Array.isArray(item?.options?.sizes)
    ? item.options.sizes
    : Array.isArray(item?.sizeOptions)
    ? item.sizeOptions
    : Array.isArray(item?.sizes)
    ? item.sizes
    : [];

  return source.map(normalizeSize).filter(Boolean);
}

function normalizeProduct(item, fallbackItem = {}) {
  if (!item && !fallbackItem) return null;

  const source = item || fallbackItem;

  const variants = Array.isArray(source?.variants)
    ? source.variants.map(normalizeVariant).filter(Boolean)
    : [];

  const colorOptions = getColorOptions(source);
  const sizeOptions = getSizeOptions(source);

  const mergedColors = [
    ...colorOptions,
    ...variants.map((variant) => variant.colorOption).filter(Boolean),
  ].filter(
    (value, index, array) =>
      index ===
      array.findIndex(
        (other) =>
          String(other.name).toLowerCase() ===
            String(value.name).toLowerCase() &&
          String(other.hex).toLowerCase() ===
            String(value.hex).toLowerCase()
      )
  );

  const mergedSizes = [
    ...sizeOptions,
    ...variants.map((variant) => variant.sizeOption).filter(Boolean),
  ].filter(
    (value, index, array) =>
      index ===
      array.findIndex(
        (other) =>
          String(other.name).toLowerCase() ===
          String(value.name).toLowerCase()
      )
  );

  const regularPrice = Number(
    source?.pricing?.regularPrice ??
      source?.regularPrice ??
      fallbackItem?.regularPrice ??
      source?.price ??
      0
  );

  const salePrice = Number(
    source?.pricing?.salePrice ??
      source?.salePrice ??
      fallbackItem?.salePrice ??
      0
  );

  const hasSale = Boolean(source?.showOnSale) && salePrice > 0 && salePrice < regularPrice;

  const images = [
    imageValue(source?.mainImage),
    imageValue(source?.image),
    imageValue(source?.imageUrl),
    ...(Array.isArray(source?.gallery)
      ? source.gallery.map(imageValue)
      : []),
    ...(Array.isArray(source?.images)
      ? source.images.map(imageValue)
      : []),
    imageValue(fallbackItem?.imageUrl),
  ].filter(Boolean);

  const uniqueImages = [...new Set(images)];

  const category =
    typeof source?.category === "object"
      ? source.category?.name || source.category?.slug || ""
      : source?.category || "";

  const details = source?.details || {};

  return {
    id: String(source?._id || source?.id || fallbackItem?.productId || ""),
    slug:
      source?.slug ||
      fallbackItem?.slug ||
      String(source?._id || source?.id || fallbackItem?.productId || ""),
    title:
      source?.title ||
      source?.name ||
      fallbackItem?.title ||
      "Product",
    sku:
      source?.sku ||
      fallbackItem?.sku ||
      "",
    regularPrice,
    salePrice,
    hasSale,
    finalPrice: hasSale ? salePrice : regularPrice,
    imageUrl:
      uniqueImages[0] ||
      fallbackItem?.imageUrl ||
      FALLBACK_IMAGE,
    images:
      uniqueImages.length > 0 ? uniqueImages : [FALLBACK_IMAGE],
    gsm:
      details?.gsm ??
      source?.gsm ??
      fallbackItem?.gsm ??
      "—",
    width:
      details?.width ??
      source?.width ??
      fallbackItem?.width ??
      "—",
    material:
      details?.material ??
      details?.fabric ??
      source?.composition ??
      source?.material ??
      fallbackItem?.material ??
      "—",
    moq:
      Number(source?.moq ?? fallbackItem?.moq ?? 1) || 1,
    colors: mergedColors,
    colorOptions: mergedColors,
    sizeOptions: mergedSizes,
    variants,
    variantsEnabled:
      Boolean(source?.variantsEnabled) || variants.length > 0,
    category,
    status: source?.status || fallbackItem?.productStatus || "unavailable",
  };
}

function valueMatches(a, b) {
  const left = String(optionName(a) || optionValue(a)).trim().toLowerCase();
  const right = String(optionName(b) || optionValue(b)).trim().toLowerCase();

  if (!left || !right) return false;
  if (left === right) return true;

  const leftHex = String(optionHex(a)).trim().toLowerCase();
  const rightHex = String(optionHex(b)).trim().toLowerCase();

  return (
    (leftHex && leftHex === right) ||
    (rightHex && rightHex === left) ||
    (leftHex && rightHex && leftHex === rightHex)
  );
}

function findVariant(product, selectedColor, selectedSize) {
  if (!product?.variants?.length) return null;

  const colorRequired = product.colorOptions.length > 0;
  const sizeRequired = product.sizeOptions.length > 0;

  return (
    product.variants.find((variant) => {
      if (variant.active === false) return false;

      const colorOk = colorRequired
        ? valueMatches(variant.colorOption || variant.color, selectedColor)
        : true;

      const sizeOk = sizeRequired
        ? valueMatches(variant.sizeOption || variant.size, selectedSize)
        : true;

      return colorOk && sizeOk;
    }) || null
  );
}

function cartOptionText(value) {
  if (!value) return "";
  return optionName(value) || optionValue(value) || "";
}

function cartItemMatches(
  cartItem,
  productId,
  variantId = "",
  selectedColor = "",
  selectedSize = ""
) {
  const cartProductId =
    cartItem?.productId ||
    cartItem?.product?._id ||
    cartItem?.product?.id ||
    "";

  if (String(cartProductId) !== String(productId)) return false;

  const cartVariantId = String(cartItem?.variantId || "");
  const wantedVariantId = String(variantId || "");

  if (wantedVariantId && cartVariantId) {
    return wantedVariantId === cartVariantId;
  }

  const cartColor = cartOptionText(
    cartItem?.selectedColor || cartItem?.color
  );

  const cartSize = cartOptionText(
    cartItem?.selectedSize || cartItem?.size
  );

  return (
    cartColor.toLowerCase() === String(selectedColor || "").toLowerCase() &&
    cartSize.toLowerCase() === String(selectedSize || "").toLowerCase()
  );
}

function getDiscountPercent(regularPrice, salePrice) {
  const regular = Number(regularPrice || 0);
  const sale = Number(salePrice || 0);

  if (!regular || !sale || sale >= regular) return 0;
  return Math.round(((regular - sale) / regular) * 100);
}

function WishlistProductCard({ wishlistItem, product, onRemoveSaved }) {
  const {
    addToCart,
    items: cartItems = [],
    updateQuantity,
    removeItem,
    loadCart,
  } = useCart();

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [pieces, setPieces] = useState(1);
  const [cartBusy, setCartBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [initialized, setInitialized] = useState(false);

  const colorOptions = product?.colorOptions || [];
  const sizeOptions = product?.sizeOptions || [];

  const selectedColorOption = useMemo(
    () =>
      colorOptions.find(
        (color) =>
          color.name === selectedColor ||
          color.value === selectedColor
      ) || null,
    [colorOptions, selectedColor]
  );

  const availableSizes = useMemo(() => {
    if (!product?.variantsEnabled || !product?.variants?.length) {
      return sizeOptions;
    }

    if (!selectedColor) return sizeOptions;

    const filtered = sizeOptions.filter((size) =>
      product.variants.some(
        (variant) =>
          variant.active !== false &&
          valueMatches(
            variant.colorOption || variant.color,
            selectedColorOption || selectedColor
          ) &&
          valueMatches(
            variant.sizeOption || variant.size,
            size
          )
      )
    );

    return filtered.length > 0 ? filtered : sizeOptions;
  }, [
    product,
    selectedColor,
    selectedColorOption,
    sizeOptions,
  ]);

  const selectedVariant = useMemo(
    () => {
      if (
        !product?.colorOptions?.length &&
        !product?.sizeOptions?.length
      ) {
        return null;
      }

      return findVariant(
        product,
        selectedColorOption || selectedColor,
        selectedSize
      );
    },
    [product, selectedColorOption, selectedColor, selectedSize]
  );

  const selectedSku = selectedVariant?.sku || product?.sku || "—";

  const selectedRegularPrice =
    selectedVariant?.regularPrice > 0
      ? selectedVariant.regularPrice
      : product?.regularPrice;

  const selectedSalePrice =
    selectedVariant?.salePrice > 0
      ? selectedVariant.salePrice
      : product?.salePrice;

  const selectedHasSale =
    Boolean(product?.hasSale || selectedSalePrice < selectedRegularPrice) &&
    Number(selectedSalePrice || 0) > 0 &&
    Number(selectedSalePrice || 0) < Number(selectedRegularPrice || 0);

  const selectedPrice = selectedHasSale
    ? selectedSalePrice
    : selectedRegularPrice;

  const discountPercent = selectedHasSale
    ? getDiscountPercent(selectedRegularPrice, selectedSalePrice)
    : 0;

  const matchingCartItem = useMemo(() => {
    if (!product?.id) return null;

    return (
      cartItems.find((item) =>
        cartItemMatches(
          item,
          product.id,
          selectedVariant?.id || "",
          selectedColor,
          selectedSize
        )
      ) || null
    );
  }, [
    cartItems,
    product?.id,
    selectedVariant?.id,
    selectedColor,
    selectedSize,
  ]);

  useEffect(() => {
    if (initialized) return;

    const firstColor = colorOptions[0]?.name || colorOptions[0]?.value || "";
    const firstSize = sizeOptions[0]?.name || sizeOptions[0]?.value || "";

    setSelectedColor(firstColor);
    setSelectedSize(firstSize);

    if (wishlistItem?.selectedColor) {
      setSelectedColor(
        cartOptionText(wishlistItem.selectedColor)
      );
    }

    if (wishlistItem?.selectedSize) {
      setSelectedSize(
        cartOptionText(wishlistItem.selectedSize)
      );
    }

    setPieces(
      Math.max(
        1,
        Number(wishlistItem?.quantity || product?.moq || 1)
      )
    );

    setInitialized(true);
  }, [
    initialized,
    wishlistItem,
    product,
    colorOptions,
    sizeOptions,
  ]);

  useEffect(() => {
    if (matchingCartItem) {
      setPieces(Math.max(1, Number(matchingCartItem.quantity) || 1));
    }
  }, [matchingCartItem?.quantity]);

  useEffect(() => {
    if (!selectedColor) return;

    const currentSizeStillAvailable = availableSizes.some(
      (size) =>
        size.name === selectedSize ||
        size.value === selectedSize
    );

    if (!currentSizeStillAvailable && availableSizes.length > 0) {
      setSelectedSize(
        availableSizes[0]?.name ||
          availableSizes[0]?.value ||
          ""
      );
    }
  }, [availableSizes, selectedColor, selectedSize]);

  const stockLimit =
    selectedVariant?.stock !== null &&
    selectedVariant?.stock !== undefined
      ? Number(selectedVariant.stock)
      : 100;

  const addDisabled =
    cartBusy ||
    (product?.variantsEnabled &&
      colorOptions.length > 0 &&
      !selectedColor) ||
    (product?.variantsEnabled &&
      availableSizes.length > 0 &&
      !selectedSize) ||
    (product?.variantsEnabled &&
      (colorOptions.length > 0 || availableSizes.length > 0) &&
      !selectedVariant) ||
    (selectedVariant &&
      Number.isFinite(stockLimit) &&
      stockLimit <= 0);

  const handleAddToCart = useCallback(async () => {
    if (!product?.id || addDisabled) return;

    if (
      product?.variantsEnabled &&
      colorOptions.length > 0 &&
      !selectedColor
    ) {
      setMessage("Please select a color.");
      return;
    }

    if (
      product?.variantsEnabled &&
      availableSizes.length > 0 &&
      !selectedSize
    ) {
      setMessage("Please select a size.");
      return;
    }

    if (
      product?.variantsEnabled &&
      (colorOptions.length > 0 || availableSizes.length > 0) &&
      !selectedVariant
    ) {
      setMessage("Selected color and size combination is unavailable.");
      return;
    }

    if (
      selectedVariant &&
      Number.isFinite(stockLimit) &&
      stockLimit <= 0
    ) {
      setMessage("Selected variant is out of stock.");
      return;
    }

    const quantity = Math.max(
      1,
      Number(pieces) || 1
    );

    if (
      selectedVariant &&
      Number.isFinite(stockLimit) &&
      quantity > stockLimit
    ) {
      setMessage(`Only ${stockLimit} units are available.`);
      return;
    }

    setCartBusy(true);
    setMessage("");

    try {
      const result = await addToCart(
        String(product.id),
        quantity,
        {
          selectedColor: selectedColor || "",
          selectedSize: selectedSize || "",
          variantId: selectedVariant?.id || "",
        }
      );

      if (result?.loginRequired) {
        setMessage("Please login to add this product to cart.");
        return;
      }

      if (!result?.success) {
        setMessage(
          result?.message || "Unable to add this product to cart."
        );
        return;
      }

      await loadCart?.();
      setMessage("Added to cart.");
    } catch (error) {
      console.error("Wishlist add to cart error:", error);
      setMessage("Unable to add this product to cart.");
    } finally {
      setCartBusy(false);
    }
  }, [
    product,
    addDisabled,
    colorOptions.length,
    selectedColor,
    availableSizes.length,
    selectedSize,
    selectedVariant,
    stockLimit,
    pieces,
    addToCart,
    loadCart,
  ]);

  const changeCartQuantity = useCallback(
    async (direction) => {
      if (!matchingCartItem || cartBusy) return;

      const cartId =
        matchingCartItem?._id ||
        matchingCartItem?.id ||
        "";

      if (!cartId) return;

      const currentQuantity = Math.max(
        1,
        Number(matchingCartItem.quantity) || 1
      );

      const nextQuantity =
        direction === "increase"
          ? currentQuantity + 1
          : currentQuantity - 1;

      if (nextQuantity < 1) return;

      if (
        selectedVariant?.stock !== null &&
        selectedVariant?.stock !== undefined &&
        nextQuantity > Number(selectedVariant.stock)
      ) {
        setMessage(
          `Only ${selectedVariant.stock} units are available.`
        );
        return;
      }

      setCartBusy(true);
      setMessage("");

      try {
        const result = await updateQuantity(
          cartId,
          nextQuantity
        );

        if (!result?.success) {
          setMessage(
            result?.message || "Unable to update quantity."
          );
          return;
        }

        await loadCart?.();
      } catch (error) {
        console.error("Wishlist quantity update error:", error);
        setMessage("Unable to update quantity.");
      } finally {
        setCartBusy(false);
      }
    },
    [
      matchingCartItem,
      cartBusy,
      selectedVariant?.stock,
      updateQuantity,
      loadCart,
    ]
  );

  const handleRemoveFromCart = useCallback(async () => {
    if (!matchingCartItem || cartBusy) return;

    const cartId =
      matchingCartItem?._id ||
      matchingCartItem?.id ||
      "";

    if (!cartId) return;

    setCartBusy(true);
    setMessage("");

    try {
      const result = await removeItem(cartId);

      if (!result?.success) {
        setMessage(
          result?.message || "Unable to remove this item."
        );
        return;
      }

      await loadCart?.();
      setMessage("Removed from cart.");
    } catch (error) {
      console.error("Wishlist remove cart error:", error);
      setMessage("Unable to remove this item.");
    } finally {
      setCartBusy(false);
    }
  }, [
    matchingCartItem,
    cartBusy,
    removeItem,
    loadCart,
  ]);

  return (
    <article className="wishlist-card">
      <div className="wishlist-image-wrap">
        <Link
          href={`/products/${product.slug}`}
          className="wishlist-image-link"
        >
          <img
            src={product.imageUrl || FALLBACK_IMAGE}
            alt={product.title}
            loading="lazy"
            draggable="false"
          />
        </Link>

        <span className="wishlist-badge">
          {selectedHasSale && discountPercent > 0
            ? `${discountPercent}% OFF`
            : "SAVED"}
        </span>

        <span className="wishlist-price-pill">
          <StorefrontPrice amount={selectedPrice} />
        </span>
        <button
          type="button"
          className="wishlist-save-heart"
          onClick={onRemoveSaved}
          aria-label={`Remove ${product.title} from saved products`}
          title="Remove from saved products"
        >
          <Heart size={19} fill="currentColor" />
        </button>
      </div>

      <div className="wishlist-card-body">
        <div className="wishlist-title-row">
          <Link
            href={`/products/${product.slug}`}
            className="wishlist-name"
          >
            {product.title}
          </Link>

          <span className="wishlist-sku">
            SKU: {selectedSku}
          </span>
        </div>

        <div className="wishlist-price-row">
          {selectedHasSale ? (
            <>
              <span className="wishlist-sale-price">
                <StorefrontPrice amount={selectedSalePrice} />
              </span>
              <span className="wishlist-old-price">
                <StorefrontPrice amount={selectedRegularPrice} />
              </span>
              <span className="wishlist-off-text">
                {discountPercent}% OFF
              </span>
            </>
          ) : (
            <span className="wishlist-sale-price">
              <StorefrontPrice amount={selectedPrice} />
            </span>
          )}
        </div>

        {/* <div className="wishlist-specs">
          <div className="wishlist-spec">
            <span className="wishlist-spec-label">GSM</span>
            <span className="wishlist-spec-value">
              {product.gsm || "—"}
            </span>
          </div>

          <div className="wishlist-spec">
            <span className="wishlist-spec-label">WIDTH</span>
            <span className="wishlist-spec-value">
              {product.width || "—"}
            </span>
          </div>

          <div className="wishlist-spec">
            <span className="wishlist-spec-label">MATERIAL</span>
            <span className="wishlist-spec-value">
              {product.material || "—"}
            </span>
          </div>

          <div className="wishlist-spec">
            <span className="wishlist-spec-label">MOQ</span>
            <span className="wishlist-spec-value">
              {product.moq || 1}
            </span>
          </div>
        </div> */}

        {colorOptions.length > 0 && (
          <div className="wishlist-option-block">
            <div className="wishlist-option-head">
              <span className="wishlist-option-label">
                COLOUR
              </span>
              <span className="wishlist-option-current">
                {selectedColor || "Select"}
              </span>
            </div>

            <div className="wishlist-color-list">
              {colorOptions.map((color, index) => {
                const colorKey =
                  `${color.name}-${color.value}-${index}`;

                const isSelected =
                  selectedColor === color.name ||
                  selectedColor === color.value;

                return (
                  <button
                    key={colorKey}
                    type="button"
                    title={color.name}
                    aria-label={`Select ${color.name}`}
                    className={`wishlist-color-button ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedColor(
                        color.name || color.value
                      );
                      setMessage("");
                    }}
                    disabled={cartBusy}
                  >
                    <span
                      className="wishlist-color-swatch"
                      style={{
                        background:
                          color.hex ||
                          color.value ||
                          "#D6D0C8",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {availableSizes.length > 0 && (
          <div className="wishlist-option-block">
            <div className="wishlist-option-head">
              <span className="wishlist-option-label">
                SIZE
              </span>
              <span className="wishlist-option-current">
                {selectedSize || "Select"}
              </span>
            </div>

            <div className="wishlist-size-list">
              {availableSizes.map((size, index) => {
                const sizeKey =
                  `${size.name}-${size.value}-${index}`;

                const isSelected =
                  selectedSize === size.name ||
                  selectedSize === size.value;

                return (
                  <button
                    key={sizeKey}
                    type="button"
                    className={`wishlist-size-button ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => {
                      setSelectedSize(
                        size.name || size.value
                      );
                      setMessage("");
                    }}
                    disabled={cartBusy}
                  >
                    {size.name || size.value}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="wishlist-bottom-row">
          <div className="wishlist-qty">
            <button
              type="button"
              onClick={() => {
                if (matchingCartItem) {
                  changeCartQuantity("decrease");
                } else {
                  setPieces((value) =>
                    Math.max(1, Number(value || 1) - 1)
                  );
                }
              }}
              disabled={cartBusy || (!matchingCartItem && pieces <= 1)}
              aria-label="Decrease quantity"
            >
              <Minus size={12} />
            </button>

            <span>
              {matchingCartItem
                ? Number(matchingCartItem.quantity) || 1
                : pieces}
            </span>

            <button
              type="button"
              onClick={() => {
                if (matchingCartItem) {
                  changeCartQuantity("increase");
                } else {
                  setPieces((value) =>
                    Math.min(
                      selectedVariant?.stock > 0
                        ? selectedVariant.stock
                        : 100,
                      Number(value || 1) + 1
                    )
                  );
                }
              }}
              disabled={
                cartBusy ||
                (!matchingCartItem &&
                  selectedVariant?.stock > 0 &&
                  pieces >= selectedVariant.stock)
              }
              aria-label="Increase quantity"
            >
              <Plus size={12} />
            </button>
          </div>

          {!matchingCartItem ? (
            <button
              type="button"
              className="wishlist-add-button"
              onClick={handleAddToCart}
              disabled={addDisabled}
            >
              {cartBusy ? (
                <span>Adding...</span>
              ) : (
                <>
                  <ShoppingCart size={13} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          ) : (
            <div className="wishlist-cart-state">
              <span className="wishlist-in-cart">
                <Check size={12} />
                In Cart
              </span>

              <button
                type="button"
                className="wishlist-remove-button"
                onClick={handleRemoveFromCart}
                disabled={cartBusy}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className="wishlist-message" role="status">
            {message}
          </div>
        )}

        <Link
          href={`/contact?requestType=quote&product=${encodeURIComponent(
            product.slug
          )}&productId=${encodeURIComponent(product.id)}&sku=${encodeURIComponent(
            selectedSku
          )}`}
          className="wishlist-quote-button"
        >
          <Zap size={13} />
          <span>Request Quote</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
}

export default function WishlistPage() {
  const {
    items: wishlistItems = [],
    itemCount = 0,
    loading: wishlistLoading,
    toggleSave,
  } = useWishlist();

  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemCount]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function hydrateWishlistProducts() {
      if (!wishlistItems.length) {
        setProducts({});
        setLoadingProducts(false);
        return;
      }

      setLoadingProducts(true);

      const nextProducts = {};

      await Promise.all(
        wishlistItems.map(async (wishlistItem) => {
          const productId = String(
            wishlistItem?.productId ||
              wishlistItem?.product?._id ||
              wishlistItem?.product?.id ||
              ""
          );

          const slug =
            wishlistItem?.slug ||
            wishlistItem?.product?.slug ||
            "";

          if (!productId && !slug) return;

          const fallback = normalizeProduct(
            wishlistItem?.product || wishlistItem,
            wishlistItem
          );

          if (wishlistItem?.productStatus !== "published") {
            nextProducts[productId || slug] = {
              ...fallback,
              status: wishlistItem?.productStatus || "unavailable",
            };
            return;
          }

          try {
            const endpointKey =
              slug || productId;

            const response = await fetch(
              `${API_URL}/products/${encodeURIComponent(endpointKey)}`,
              {
                method: "GET",
                cache: "no-store",
                signal: controller.signal,
              }
            );

            if (!response.ok) {
              nextProducts[productId || slug] =
                response.status === 404
                  ? { ...fallback, status: "unavailable" }
                  : fallback;
              return;
            }

            const payload = await response.json();

            const rawProduct =
              payload?.product ||
              payload?.data?.product ||
              payload;

            const liveProductId = String(
              rawProduct?._id || rawProduct?.id || ""
            );
            nextProducts[productId || slug] =
              liveProductId === productId
                ? normalizeProduct(rawProduct, wishlistItem)
                : {
                    ...fallback,
                    status: "unavailable",
                  };
          } catch (error) {
            if (error?.name === "AbortError") return;
            nextProducts[productId || slug] = {
              ...fallback,
              status: "unavailable",
            };
          }
        })
      );

      if (active) {
        setProducts(nextProducts);
        setLoadingProducts(false);
      }
    }

    hydrateWishlistProducts();

    return () => {
      active = false;
      controller.abort();
    };
  }, [wishlistItems]);

  const totalPages = Math.max(
    1,
    Math.ceil(wishlistItems.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleWishlistItems = useMemo(
    () =>
      wishlistItems.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
      ),
    [wishlistItems, safePage]
  );

  const changePage = (page) => {
    const nextPage = Math.max(
      1,
      Math.min(page, totalPages)
    );

    setCurrentPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getProductForWishlistItem = (item) => {
    const id = String(
      item?.productId ||
        item?.product?._id ||
        item?.product?.id ||
        ""
    );

    const slug =
      item?.slug ||
      item?.product?.slug ||
      "";

    return (
      products[id] ||
      products[slug] ||
      normalizeProduct(item?.product || item, item)
    );
  };

  return (
    <main className="wishlist-page">
      <style>{`
        .wishlist-page,
        .wishlist-page *,
        .wishlist-page *::before,
        .wishlist-page *::after {
          box-sizing: border-box;
        }

        .wishlist-page {
          width: 100%;
          min-height: 100vh;
          background: ${COLORS.cream};
          color: ${COLORS.ink};
          padding: 42px 0 64px;
          overflow-x: hidden;
        }

        .wishlist-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .wishlist-header {
          width: 100%;
          text-align: center;
          margin-bottom: 30px;
        }

        .wishlist-eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.gold};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .wishlist-title {
          margin: 0;
          color: ${COLORS.teal};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 46px;
          font-weight: 600;
          line-height: 1;
        }

        .wishlist-line {
          width: 72px;
          height: 1px;
          background: ${COLORS.gold};
          margin: 12px auto 12px;
          position: relative;
        }

        .wishlist-line::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${COLORS.gold};
          transform: translate(-50%, -50%);
        }

        .wishlist-subtitle {
          max-width: 640px;
          margin: 0 auto;
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 12px;
          line-height: 1.55;
        }

        .wishlist-top-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 18px;
        }

        .wishlist-count {
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 11px;
          font-weight: 500;
        }

        .wishlist-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .wishlist-card {
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: ${COLORS.white};
          border: 1px solid #E7DFD7;
          border-radius: 11px;
          transition: transform .22s ease, box-shadow .22s ease;
        }

        .wishlist-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(41, 92, 101, .08);
        }

        .wishlist-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 5;
          background: ${COLORS.darkCream};
          overflow: hidden;
        }

        .wishlist-image-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .wishlist-image-link img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          transition: transform .45s ease;
        }

        .wishlist-card:hover .wishlist-image-link img {
          transform: scale(1.035);
        }

        .wishlist-badge,
        .wishlist-price-pill {
          position: absolute;
          z-index: 3;
          top: 9px;
          min-height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 9px;
          border-radius: 999px;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }

        .wishlist-badge {
          left: 9px;
          background: ${COLORS.gold};
          color: #fff;
        }

        .wishlist-price-pill {
          right: 9px;
          background: ${COLORS.teal};
          color: #fff;
        }

        .wishlist-save-heart {
          position: absolute;
          z-index: 4;
          top: 44px;
          right: 9px;
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(184, 109, 101, .35);
          border-radius: 50%;
          background: #fff;
          color: #B86D65;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(0, 0, 0, .12);
          transition: transform .18s ease, background .18s ease, color .18s ease;
        }

        .wishlist-save-heart:hover {
          transform: scale(1.08);
          background: #B86D65;
          color: #fff;
        }

        .wishlist-save-heart:focus-visible,
        .wishlist-unavailable-remove:focus-visible {
          outline: 2px solid ${COLORS.teal};
          outline-offset: 3px;
        }

        .wishlist-unavailable-remove {
          min-height: 36px;
          margin-top: 12px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #B86D65;
          border-radius: 999px;
          background: #fff;
          color: #A64D4D;
          cursor: pointer;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          font-weight: 700;
        }

        .wishlist-unavailable-remove:hover {
          background: #A64D4D;
          color: #fff;
        }

        .wishlist-card-body {
          min-height: 275px;
          padding: 13px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .wishlist-title-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .wishlist-name {
          color: ${COLORS.ink};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 20px;
          font-weight: 600;
          line-height: 1.05;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wishlist-name:hover {
          color: ${COLORS.teal};
        }

        .wishlist-sku {
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8.5px;
          font-weight: 500;
          letter-spacing: .45px;
        }

        .wishlist-price-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 6px;
        }

        .wishlist-sale-price {
          color: ${COLORS.teal};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
        }

        .wishlist-old-price {
          color: #96918B;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          text-decoration: line-through;
        }

        .wishlist-off-text {
          color: ${COLORS.gold};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8.5px;
          font-weight: 700;
        }

        .wishlist-specs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 12px;
          padding: 9px 0;
          border-top: 1px solid #EEE8E1;
          border-bottom: 1px solid #EEE8E1;
        }

        .wishlist-spec {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .wishlist-spec-label,
        .wishlist-option-label {
          color: ${COLORS.gold};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .8px;
          text-transform: uppercase;
        }

        .wishlist-spec-value {
          color: #283438;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 9.5px;
          font-weight: 500;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wishlist-option-block {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .wishlist-option-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .wishlist-option-current {
          max-width: 60%;
          color: #40494C;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 9px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wishlist-color-list {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        .wishlist-color-button {
          width: 22px;
          height: 22px;
          padding: 2px;
          border: 1px solid #D9D1C9;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
        }

        .wishlist-color-button.selected {
          border: 2px solid ${COLORS.teal};
          padding: 1px;
        }

        .wishlist-color-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .wishlist-color-swatch {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,.12);
        }

        .wishlist-size-list {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
        }

        .wishlist-size-button {
          min-width: 34px;
          min-height: 25px;
          padding: 0 8px;
          border: 1px solid #D7D0C8;
          border-radius: 6px;
          background: #fff;
          color: #394246;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .wishlist-size-button.selected {
          border-color: ${COLORS.teal};
          background: ${COLORS.teal};
          color: #fff;
        }

        .wishlist-size-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .wishlist-bottom-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: auto;
        }

        .wishlist-qty {
          height: 35px;
          min-width: 90px;
          flex: 0 0 90px;
          display: grid;
          grid-template-columns: 28px 1fr 28px;
          align-items: center;
          border: 1px solid #DDD5CD;
          border-radius: 999px;
          overflow: hidden;
          background: #fff;
        }

        .wishlist-qty button {
          height: 100%;
          border: 0;
          background: transparent;
          color: ${COLORS.teal};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .wishlist-qty button:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .wishlist-qty span {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #273237;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          font-weight: 700;
        }

        .wishlist-add-button {
          flex: 1;
          height: 35px;
          min-width: 0;
          border: 1px solid ${COLORS.teal};
          border-radius: 999px;
          background: ${COLORS.teal};
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .wishlist-add-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .wishlist-cart-state {
          flex: 1;
          min-width: 0;
          height: 35px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .wishlist-in-cart {
          flex: 1;
          min-width: 0;
          height: 35px;
          padding: 0 8px;
          border: 1px solid ${COLORS.gold};
          border-radius: 999px;
          background: #FFFDF9;
          color: ${COLORS.gold};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8.5px;
          font-weight: 700;
        }

        .wishlist-remove-button {
          height: 35px;
          padding: 0 10px;
          border: 1px solid #B86D65;
          border-radius: 999px;
          background: #fff;
          color: #B86D65;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .wishlist-remove-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .wishlist-message {
          min-height: 14px;
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8.5px;
          line-height: 1.4;
        }

        .wishlist-quote-button {
          width: 100%;
          min-height: 33px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 0 9px;
          border: 1px solid #D8D1C9;
          border-radius: 999px;
          background: #fff;
          color: ${COLORS.teal};
          text-decoration: none;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 8.5px;
          font-weight: 700;
        }

        .wishlist-quote-button:hover {
          border-color: ${COLORS.teal};
          background: #F8FBFB;
        }

        .wishlist-empty {
          width: 100%;
          min-height: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px;
          background: ${COLORS.darkCream};
          border: 1px solid #E4DCD4;
          border-radius: 14px;
        }

        .wishlist-empty-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          border-radius: 50%;
          background: #EDE7DF;
          color: ${COLORS.teal};
        }

        .wishlist-empty-title {
          margin: 0 0 8px;
          color: ${COLORS.teal};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 30px;
          font-weight: 600;
        }

        .wishlist-empty-text {
          max-width: 420px;
          margin: 0 0 20px;
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 11px;
          line-height: 1.6;
        }

        .wishlist-empty-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-height: 40px;
          padding: 0 18px;
          border-radius: 999px;
          background: ${COLORS.teal};
          color: #fff;
          text-decoration: none;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
        }

        .wishlist-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 30px;
        }

        .wishlist-page-status {
          margin-left: 4px;
          color: ${COLORS.navGray};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
        }

        .wishlist-page-button {
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #E0D8D0;
          border-radius: 50%;
          background: #fff;
          color: ${COLORS.teal};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          cursor: pointer;
        }

        .wishlist-page-button.active {
          border-color: ${COLORS.teal};
          background: ${COLORS.teal};
          color: #fff;
        }

        .wishlist-page-button:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        @media (max-width: 1100px) {
          .wishlist-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 800px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .wishlist-card-body {
            min-height: 355px;
          }
        }

        @media (max-width: 600px) {
          .wishlist-page {
            padding: 30px 0 42px;
          }

          .wishlist-container {
            padding: 0 12px;
          }

          .wishlist-header {
            margin-bottom: 22px;
          }

          .wishlist-eyebrow {
            font-size: 8px;
            letter-spacing: 2.5px;
          }

          .wishlist-title {
            font-size: 34px;
          }

          .wishlist-subtitle {
            font-size: 9px;
          }

          .wishlist-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .wishlist-card {
            border-radius: 10px;
          }

          .wishlist-image-wrap {
            aspect-ratio: 4 / 5;
          }

          .wishlist-card-body {
            min-height: 0;
            padding: 11px;
          }

          .wishlist-name {
            font-size: 19px;
          }

          .wishlist-spec-label,
          .wishlist-option-label {
            font-size: 7.5px;
          }

          .wishlist-spec-value,
          .wishlist-option-current {
            font-size: 9px;
          }

          .wishlist-qty {
            min-width: 92px;
            flex-basis: 92px;
          }

          .wishlist-add-button,
          .wishlist-in-cart,
          .wishlist-remove-button,
          .wishlist-qty {
            height: 36px;
          }
        }
      `}</style>

      <div className="wishlist-container">
        <header className="wishlist-header">
          <div className="wishlist-eyebrow">
            SAVED PRODUCTS
          </div>

          <h1 className="wishlist-title">
            My Wishlist
          </h1>

          <div className="wishlist-line" />

          <p className="wishlist-subtitle">
            Your favorite fabrics in one place. Select colour,
            size and quantity, then add the exact variant directly
            to your real cart.
          </p>
        </header>

        <div className="wishlist-top-row">
          <div className="wishlist-count">
            {wishlistLoading
              ? "Loading..."
              : `${itemCount} ${
                  itemCount === 1 ? "Product" : "Products"
                }`}
          </div>
        </div>

        {wishlistLoading || loadingProducts ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <ShoppingCart size={30} />
            </div>

            <h2 className="wishlist-empty-title">
              Loading Wishlist
            </h2>

            <p className="wishlist-empty-text">
              Loading your saved products and their live
              variant information.
            </p>
          </div>
        ) : itemCount === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <Heart size={32} />
            </div>

            <h2 className="wishlist-empty-title">
              No Saved Items
            </h2>

            <p className="wishlist-empty-text">
              Your wishlist is empty. Browse our collection and
              save your favorite fabrics to get started.
            </p>

            <Link
              href="/newArrivals"
              className="wishlist-empty-button"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <>
            <div className="wishlist-grid">
              {visibleWishlistItems.map((wishlistItem) => {
                const product =
                  getProductForWishlistItem(wishlistItem);

                const isAvailable = product?.status === "published";

                if (!product) return null;

                const key =
                  wishlistItem?._id ||
                  `${product.id}-${product.slug}`;
                const productId = String(
                  wishlistItem?.productId?._id ||
                    wishlistItem?.productId?.id ||
                    wishlistItem?.productId ||
                    product.id
                );
                const removeSavedButton = (
                  <button
                    type="button"
                    className="wishlist-unavailable-remove"
                    onClick={() => toggleSave(productId)}
                    aria-label={`Remove ${product.title || "product"} from saved products`}
                  >
                    <Heart size={15} fill="currentColor" />
                    <span>Remove from Saved</span>
                  </button>
                );

                return (
                  <div key={key}>
                    {!isAvailable ? (
                      <div
                        style={{
                          padding: "20px",
                          background: "#fff5f5",
                          border: "1px solid #ffcccc",
                          borderRadius: "8px",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ color: "#ff6b6b", fontWeight: "700" }}>
                          ⚠️ Product Unavailable
                        </div>
                        <div style={{ color: "#888", fontSize: "12px", marginTop: "8px" }}>
                          {product?.title || "This product"} is no longer available
                        </div>
                        {removeSavedButton}
                      </div>
                    ) : (
                      <WishlistProductCard
                        wishlistItem={wishlistItem}
                        product={product}
                        onRemoveSaved={() => toggleSave(productId)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="wishlist-pagination">
                <button
                  type="button"
                  className="wishlist-page-button"
                  disabled={safePage === 1}
                  onClick={() =>
                    changePage(safePage - 1)
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`wishlist-page-button ${
                      page === safePage ? "active" : ""
                    }`}
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="wishlist-page-button"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    changePage(safePage + 1)
                  }
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
                <span className="wishlist-page-status" aria-live="polite">
                  Page {safePage} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
