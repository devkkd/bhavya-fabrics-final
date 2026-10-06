"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { products as fallbackProducts } from "../data/product";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");

const PAGE_SIZE = 8;
const FALLBACK_IMAGE = "/images/home/products/1.png";

/* =======================================================
   HELPERS
======================================================= */

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

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function optionName(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();

  return String(
    value?.name ||
      value?.value ||
      value?.color ||
      value?.colour ||
      value?.code ||
      ""
  ).trim();
}

function normalizeColorOption(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const name = value.trim();
    if (!name) return null;
    return { name, value: name, hex: name };
  }

  const name = optionName(value);
  const optionValue = String(
    value?.value || value?.name || value?.color || value?.colour || ""
  ).trim();
  const hex = String(value?.hex || "").trim();

  if (!name && !optionValue) return null;

  return {
    name: name || optionValue,
    value: optionValue || name,
    hex: hex || optionValue || name,
  };
}

function normalizeSizeOption(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const name = value.trim();
    return name ? { name, value: name } : null;
  }

  const name = optionName(value);
  if (!name) return null;

  return {
    name,
    value: String(value?.value || value?.name || "").trim() || name,
  };
}

function normalizeVariant(value) {
  if (!value) return null;

  const color = value?.color ?? value?.colour ?? value?.selectedColor ?? "";
  const size = value?.size ?? value?.selectedSize ?? "";

  return {
    id: String(value?._id || value?.id || ""),
    colorOption: normalizeColorOption(color),
    sizeOption: normalizeSizeOption(size),
    color: optionName(color),
    size: optionName(size),
    regularPrice: Number(value?.regularPrice ?? 0) || 0,
    salePrice: Number(value?.salePrice ?? 0) || 0,
    sku: value?.sku || "",
    stock: Number(value?.stock ?? 0) || 0,
    active: value?.active !== false,
    images: Array.isArray(value?.images)
      ? value.images.map(imageValue).filter(Boolean)
      : [],
  };
}

function optionCandidates(value) {
  if (!value) return [];

  if (typeof value === "string" || typeof value === "number") {
    const normalized = String(value).trim().toLowerCase();
    return normalized ? [normalized] : [];
  }

  return [
    value?.name,
    value?.value,
    value?.hex,
    value?.color,
    value?.colour,
    value?.code,
  ]
    .filter(Boolean)
    .map((item) => String(item).trim().toLowerCase())
    .filter(Boolean);
}

function optionMatches(a, b) {
  const aValues = new Set(optionCandidates(a));
  const bValues = optionCandidates(b);

  if (!aValues.size || !bValues.length) return false;

  return bValues.some((value) => aValues.has(value));
}

function colorSelectionKey(color) {
  if (!color) return "";

  if (typeof color === "string") return color.trim().toLowerCase();

  const name = String(color?.name || "").trim().toLowerCase();
  const value = String(color?.value || "").trim().toLowerCase();
  const hex = String(color?.hex || "").trim().toLowerCase();

  return [name, value, hex].join("|");
}

function getSpecification(specifications, name) {
  if (!Array.isArray(specifications)) return "";

  const target = String(name).trim().toLowerCase();

  const found = specifications.find(
    (item) =>
      String(item?.name || item?.label || item?.key || "")
        .trim()
        .toLowerCase() === target
  );

  return found?.value || "";
}

function isEnabledFlag(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    String(value).trim().toLowerCase() === "true"
  );
}

function extractProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  return [];
}

function normalizeProduct(item) {
  const regularPrice =
    Number(item?.pricing?.regularPrice ?? item?.regularPrice ?? item?.price ?? 0) || 0;

  const salePrice =
    Number(item?.pricing?.salePrice ?? item?.salePrice ?? 0) || 0;

  const hasSale =
    Boolean(item?.showOnSale) && salePrice > 0 && salePrice < regularPrice;

  const category =
    item?.category && typeof item.category === "object" ? item.category : null;

  const specifications = Array.isArray(item?.specifications)
    ? item.specifications
    : [];

  const imageArray = Array.isArray(item?.images) ? item.images : [];
  const gallery = Array.isArray(item?.gallery) ? item.gallery : [];

  const images = [
    imageValue(item?.mainImage),
    imageValue(item?.image),
    imageValue(item?.imageUrl),
    ...imageArray.map(imageValue),
    ...gallery.map(imageValue),
  ].filter(Boolean);

  const rawVariants = Array.isArray(item?.variants) ? item.variants : [];

  const variantColorSource = rawVariants
    .map((variant) => variant?.color ?? variant?.colour ?? variant?.selectedColor ?? "")
    .filter(Boolean);

  const variantSizeSource = rawVariants
    .map((variant) => variant?.size ?? variant?.selectedSize ?? "")
    .filter(Boolean);

  const colorSource =
    Array.isArray(item?.options?.colors) && item.options.colors.length > 0
      ? item.options.colors
      : Array.isArray(item?.colors) && item.colors.length > 0
      ? item.colors
      : variantColorSource;

  const sizeSource =
    Array.isArray(item?.options?.sizes) && item.options.sizes.length > 0
      ? item.options.sizes
      : Array.isArray(item?.sizes) && item.sizes.length > 0
      ? item.sizes
      : variantSizeSource;

  const colorOptions = colorSource.map(normalizeColorOption).filter(Boolean);
  const sizeOptions = sizeSource.map(normalizeSizeOption).filter(Boolean);

  const variants = rawVariants
    .map(normalizeVariant)
    .filter(Boolean)
    .filter((variant) => variant.active !== false);

  return {
    id:
      item?._id ||
      item?.id ||
      item?.slug ||
      `${item?.title || item?.name || "product"}-${item?.sku || ""}`,

    slug:
      item?.slug ||
      slugify(item?.title || item?.name || item?.productName),

    name: item?.title || item?.name || item?.productName || "Untitled Product",

    sku: item?.sku || "—",

    category:
      category?.slug ||
      category?._id ||
      category?.id ||
      item?.categorySlug ||
      item?.category ||
      "",

    categoryLabel: category?.name || category?.label || item?.categoryName || "—",

    price: hasSale ? salePrice : regularPrice,
    regularPrice,
    salePrice: hasSale ? salePrice : 0,

    priceUnit: item?.priceUnit || item?.pricing?.unit || "Per Meter",

    badge:
      item?.badge ||
      (Boolean(item?.showOnSale) && hasSale ? "Sale" : "New Arrival"),

    gsm:
      item?.details?.gsm ||
      item?.gsm ||
      getSpecification(specifications, "GSM") ||
      "—",

    width:
      item?.details?.width ||
      item?.width ||
      getSpecification(specifications, "Width") ||
      "—",

    composition:
      item?.details?.material ||
      item?.details?.fabric ||
      item?.composition ||
      getSpecification(specifications, "Composition") ||
      "—",

    moq:
      Number(
        item?.moq ?? item?.minimumOrderQuantity ?? item?.minimumOrderQty ?? 1
      ) || 1,

    colorOptions,
    sizeOptions,
    variants,

    variantsEnabled: Boolean(item?.variantsEnabled || variants.length > 0),

    colors:
      colorOptions.length > 0
        ? colorOptions
        : colorSource.map(normalizeColorOption).filter(Boolean),

    images: images.length > 0 ? [...new Set(images)] : [FALLBACK_IMAGE],

    status: item?.status || "published",

    showInNewArrivals: isEnabledFlag(item?.showInNewArrivals),
  };
}

function SkeletonCard() {
  return (
    <article className="arrival-card skeleton-card" aria-hidden="true">
      <div className="arrival-image-wrap">
        <div className="skeleton-image" />
      </div>

      <div className="arrival-body">
        <div className="skeleton-title" />

        <div className="arrival-spec-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="arrival-spec" key={index}>
              <div className="skeleton-label" />
              <div className="skeleton-value" />
            </div>
          ))}
        </div>

        <div className="arrival-options-skeleton">
          <div className="skeleton-color-label" />

          <div className="skeleton-swatches">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="arrival-actions">
          <div className="skeleton-action" />
          <div className="skeleton-action" />
        </div>
      </div>
    </article>
  );
}

/* =======================================================
   PAGE
======================================================= */

export default function NewArrivalsPage() {
  const {
    addToCart,
    items: cartItems = [],
    updateQuantity,
    removeItem,
    loadCart,
  } = useCart();

  const { toggleSave, isSaved: isProductSaved } = useWishlist();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cartStates, setCartStates] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [cartMessages, setCartMessages] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [mobileImageProduct, setMobileImageProduct] = useState(null);

  /* =======================================================
     LIVE CART FETCH + CROSS-PAGE SYNC
  ======================================================= */

  useEffect(() => {
    let disposed = false;

    const refreshCart = async () => {
      if (disposed) return;

      try {
        await loadCart?.();
      } catch {
        /* CartContext handles its own errors. */
      }
    };

    const handleCartEvent = () => {
      refreshCart();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshCart();
      }
    };

    refreshCart();

    const interval = window.setInterval(refreshCart, 4000);

    const eventNames = [
      "bf:cart-updated",
      "bf:order-completed",
      "bf:payment-success",
      "cart-updated",
      "order-completed",
      "payment-success",
      "order-placed",
    ];

    eventNames.forEach((name) => {
      window.addEventListener(name, handleCartEvent);
    });

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      window.clearInterval(interval);

      eventNames.forEach((name) => {
        window.removeEventListener(name, handleCartEvent);
      });

      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadCart]);

  /* =======================================================
     SYNC SELECTED COLOR / SIZE FROM REAL CART
  ======================================================= */

  useEffect(() => {
    if (
      !Array.isArray(cartItems) ||
      !Array.isArray(allProducts) ||
      allProducts.length === 0
    ) {
      return;
    }

    const nextColors = {};
    const nextSizes = {};

    allProducts.forEach((product) => {
      const productId = String(product.id);

      /* Use the latest cart line for this product. */
      let cartItem = null;

      for (let index = cartItems.length - 1; index >= 0; index -= 1) {
        const candidate = cartItems[index];

        if (String(candidate?.productId || "") === productId) {
          cartItem = candidate;
          break;
        }
      }

      if (!cartItem) return;

      const itemVariantId = String(cartItem?.variantId || "");

      let variant = null;

      if (itemVariantId) {
        variant =
          product.variants?.find(
            (item) => String(item?.id || "") === itemVariantId
          ) || null;
      }

      const color = variant?.colorOption
        ? normalizeColorOption(variant.colorOption)
        : normalizeColorOption(variant?.color || cartItem?.selectedColor);

      const size = variant?.sizeOption
        ? normalizeSizeOption(variant.sizeOption)
        : normalizeSizeOption(variant?.size || cartItem?.selectedSize);

      if (color) nextColors[productId] = color;
      if (size) nextSizes[productId] = size;
    });

    if (Object.keys(nextColors).length) {
      setSelectedColors((current) => ({ ...current, ...nextColors }));
    }

    if (Object.keys(nextSizes).length) {
      setSelectedSizes((current) => ({ ...current, ...nextSizes }));
    }
  }, [cartItems, allProducts]);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  useEffect(() => {
    const controller = new AbortController();

    async function loadNewArrivals() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          `${API_URL}/products?showInNewArrivals=true&limit=1000`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        let payload = {};

        try {
          payload = await response.json();
        } catch {
          payload = {};
        }

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to fetch products");
        }

        const products = extractProducts(payload)
          .filter((product) => product?.status === "published" || !product?.status)
          .filter((product) => isEnabledFlag(product?.showInNewArrivals))
          .map(normalizeProduct);

        setAllProducts(products);
        setCurrentPage(1);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("New Arrivals API Error:", error);

        setAllProducts(
          Array.isArray(fallbackProducts)
            ? fallbackProducts.map(normalizeProduct)
            : []
        );

        setLoadError(
          "Live products could not be loaded. Showing fallback products."
        );

        setCurrentPage(1);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadNewArrivals();

    return () => controller.abort();
  }, []);

  const totalPages = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const visibleProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return allProducts.slice(start, start + PAGE_SIZE);
  }, [allProducts, safePage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* =======================================================
     SELECTION HELPERS
  ======================================================= */

  const getSelectedColor = (product) =>
    selectedColors[String(product.id)] || null;

  const getSelectedSize = (product) =>
    selectedSizes[String(product.id)] || null;

  const getAvailableSizes = (product) => {
    const sizes = Array.isArray(product?.sizeOptions) ? product.sizeOptions : [];

    if (!product?.variantsEnabled || !product?.variants?.length) {
      return sizes;
    }

    const selectedColor = getSelectedColor(product);

    if (!selectedColor) return sizes;

    const filtered = sizes.filter((size) =>
      product.variants.some(
        (variant) =>
          optionMatches(variant?.colorOption || variant?.color, selectedColor) &&
          optionMatches(variant?.sizeOption || variant?.size, size)
      )
    );

    return filtered.length > 0 ? filtered : sizes;
  };

  const getSelectedVariant = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];

    if (!variants.length) return null;

    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);

    const needsColor = product?.colorOptions?.length > 0;
    const needsSize = product?.sizeOptions?.length > 0;

    if (needsColor && !selectedColor) return null;
    if (needsSize && !selectedSize) return null;

    return (
      variants.find((variant) => {
        const colorMatches = needsColor
          ? optionMatches(variant?.colorOption || variant?.color, selectedColor)
          : true;

        const sizeMatches = needsSize
          ? optionMatches(variant?.sizeOption || variant?.size, selectedSize)
          : true;

        return colorMatches && sizeMatches;
      }) || null
    );
  };

  const getCartItemForProduct = (product) => {
    const productId = String(product.id);
    const selectedVariant = getSelectedVariant(product);
    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);

    return Array.isArray(cartItems)
      ? cartItems.find((item) => {
          if (String(item?.productId || "") !== productId) return false;

          const itemVariantId = String(item?.variantId || "");

          if (selectedVariant?.id && itemVariantId) {
            return itemVariantId === String(selectedVariant.id);
          }

          const itemColor = optionName(item?.selectedColor).toLowerCase();
          const itemSize = optionName(item?.selectedSize).toLowerCase();
          const wantedColor = optionName(selectedColor).toLowerCase();
          const wantedSize = optionName(selectedSize).toLowerCase();

          if (wantedColor || wantedSize) {
            return itemColor === wantedColor && itemSize === wantedSize;
          }

          return !itemVariantId && !itemColor && !itemSize;
        })
      : null;
  };

  const getDisplayPricing = (product) => {
    const variant = getSelectedVariant(product);

    const regular =
      Number(variant?.regularPrice || product?.regularPrice || product?.price || 0) || 0;

    const sale = Number(variant?.salePrice || product?.salePrice || 0) || 0;

    const isSale = sale > 0 && regular > sale;
    const finalPrice = isSale ? sale : regular;

    const discount =
      isSale && regular > 0
        ? Math.max(1, Math.round(((regular - sale) / regular) * 100))
        : 0;

    return {
      variant,
      regular,
      sale: isSale ? sale : 0,
      final: finalPrice,
      isSale,
      discount,
      priceUnit: product?.priceUnit || "Per Meter",
    };
  };

  const setCardMessage = (productId, message) => {
    const id = String(productId);

    setCartMessages((current) => ({ ...current, [id]: message }));

    window.setTimeout(() => {
      setCartMessages((current) => {
        if (current[id] !== message) return current;

        const next = { ...current };
        delete next[id];
        return next;
      });
    }, 2600);
  };

  const handleSelectColor = (product, color) => {
    const id = String(product.id);

    setSelectedColors((current) => ({ ...current, [id]: color }));

    const currentSize = getSelectedSize(product);

    if (!currentSize) return;

    const valid = product?.variants?.some(
      (variant) =>
        optionMatches(variant?.colorOption || variant?.color, color) &&
        optionMatches(variant?.sizeOption || variant?.size, currentSize)
    );

    if (!valid) {
      setSelectedSizes((current) => ({ ...current, [id]: null }));
    }
  };

  const handleSelectSize = (product, size) => {
    const id = String(product.id);
    setSelectedSizes((current) => ({ ...current, [id]: size }));
  };

  /* =======================================================
     CART ACTIONS
  ======================================================= */

  const handleAddToCart = async (product) => {
    const id = String(product.id);
    const state = cartStates[id] || "idle";

    if (state === "loading" || state === "updating" || state === "removing") {
      return;
    }

    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);

    const hasColor = product?.colorOptions?.length > 0;
    const hasSize = product?.sizeOptions?.length > 0;

    if (hasColor && !selectedColor) {
      setCardMessage(id, "Please select a colour");
      return;
    }

    if (hasSize && !selectedSize) {
      setCardMessage(id, "Please select a size");
      return;
    }

    const selectedVariant = getSelectedVariant(product);

    if (product?.variantsEnabled && !selectedVariant) {
      setCardMessage(id, "Please select a valid colour and size");
      return;
    }

    if (selectedVariant && Number(selectedVariant.stock) <= 0) {
      setCardMessage(id, "Selected variant is out of stock");
      return;
    }

    setCartStates((current) => ({ ...current, [id]: "loading" }));

    try {
      const result = await addToCart(id, 1, {
        selectedColor: selectedColor || "",
        selectedSize: selectedSize || "",
        variantId: selectedVariant?.id || "",
      });

      if (result?.loginRequired) {
        setCartStates((current) => ({ ...current, [id]: "idle" }));
        setCardMessage(id, "Please login to add this product");
        return;
      }

      if (result?.success === false) {
        setCartStates((current) => ({ ...current, [id]: "idle" }));
        setCardMessage(id, result?.message || "Failed to add to cart");
        return;
      }

      setCartStates((current) => ({ ...current, [id]: "added" }));

      window.setTimeout(() => {
        setCartStates((current) => ({ ...current, [id]: "idle" }));
      }, 850);
    } catch (error) {
      console.error("Failed to add to cart:", error);

      setCartStates((current) => ({ ...current, [id]: "idle" }));
      setCardMessage(id, "Failed to add to cart");
    }
  };

  const changeCartQuantity = async (product, direction) => {
    const id = String(product.id);
    const state = cartStates[id] || "idle";

    if (state === "loading" || state === "updating" || state === "removing") {
      return;
    }

    const cartItem = getCartItemForProduct(product);

    if (!cartItem) return;

    const currentQty = Math.max(1, Number(cartItem.quantity) || 1);

    if (direction === "decrease" && currentQty <= 1) return;

    const nextQty = direction === "increase" ? currentQty + 1 : currentQty - 1;

    setCartStates((current) => ({ ...current, [id]: "updating" }));

    try {
      await updateQuantity(cartItem._id, nextQty);

      setCartStates((current) => ({ ...current, [id]: "idle" }));
    } catch (error) {
      console.error("Failed to update cart quantity:", error);

      setCartStates((current) => ({ ...current, [id]: "idle" }));
      setCardMessage(id, "Failed to update quantity");
    }
  };

  const handleRemoveProduct = async (product) => {
    const id = String(product.id);
    const state = cartStates[id] || "idle";

    if (state === "loading" || state === "updating" || state === "removing") {
      return;
    }

    const cartItem = getCartItemForProduct(product);

    if (!cartItem) return;

    setCartStates((current) => ({ ...current, [id]: "removing" }));

    try {
      await removeItem(cartItem._id);

      window.setTimeout(() => {
        setCartStates((current) => ({ ...current, [id]: "idle" }));
      }, 320);
    } catch (error) {
      console.error("Failed to remove cart item:", error);

      setCartStates((current) => ({ ...current, [id]: "idle" }));
      setCardMessage(id, "Failed to remove item");
    }
  };

  /* =======================================================
     PAGINATION + HOVER / TOUCH
  ======================================================= */

  const changePage = (page) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));

    setCurrentPage(nextPage);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMouseEnter = (product) => {
    if (product?.images?.length > 1) {
      setHoveredProduct(product.id);
    }
  };

  const handleMouseLeave = () => {
    setHoveredProduct(null);
  };

  const handleTouchStart = (event, product) => {
    const hasSecondImage = product?.images?.length > 1 && product?.images?.[1];

    if (!hasSecondImage) return;

    if (mobileImageProduct !== product.id) {
      event.preventDefault();
      setMobileImageProduct(product.id);
      return;
    }

    setMobileImageProduct(null);
  };

  return (
    <main className="new-arrivals-page">
      <style>{`
        .new-arrivals-page{width:100%;min-height:100vh;background:#FAF8F5;color:#1A1A1A;padding:42px 0 64px;box-sizing:border-box;overflow-x:hidden}
        .new-arrivals-container{width:100%;max-width:1400px;margin:0 auto;padding:0 32px;box-sizing:border-box}
        .new-arrivals-header{width:100%;text-align:center;margin-bottom:36px}
        .new-arrivals-eyebrow{display:inline-flex;margin:0 0 8px;color:#BE9D6B;font:600 11px "Poppins",Arial,sans-serif;letter-spacing:3px;text-transform:uppercase}
        .new-arrivals-title{margin:0;color:#295C65;font:600 54px/1 "Cormorant Garamond",Georgia,serif;letter-spacing:-.5px}
        .new-arrivals-line{width:58px;height:1px;margin:14px auto 13px;background:#BE9D6B}
        .new-arrivals-subtitle{max-width:760px;margin:0 auto;color:#696968;font:400 13px/1.6 "Poppins",Arial,sans-serif}
        .new-arrivals-count{display:flex;justify-content:flex-end;margin-bottom:22px;color:#696968;font:11px "Poppins",Arial,sans-serif}
        .new-arrivals-grid{width:100%;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;align-items:stretch}
        .new-arrivals-message{min-height:300px;display:flex;align-items:center;justify-content:center;text-align:center;color:#696968;font:13px/1.6 "Poppins",Arial,sans-serif}

        /* ---------- CARD ---------- */
        .arrival-card{position:relative;min-width:0;display:flex;flex-direction:column;background:#fff;border:1px solid #EAE3DA;border-radius:14px;overflow:hidden;box-sizing:border-box;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
        .arrival-card:hover{transform:translateY(-3px);box-shadow:0 16px 34px rgba(41,92,101,.1);border-color:#D8CBB8}

        .arrival-image-wrap{position:relative;width:100%;aspect-ratio:1/.95;overflow:hidden;background:#F2EEE9;flex-shrink:0;border-bottom:1px solid #F0EAE2}
        .arrival-image-link{position:absolute;inset:0;display:block;overflow:hidden}
        .arrival-image,.arrival-second-image{width:100%;height:100%;display:block;object-fit:cover;object-position:center}
        .arrival-image{transition:transform .5s ease}
        .arrival-image-wrap:hover .arrival-image{transform:scale(1.04)}
        .arrival-second-image{position:absolute;inset:0;pointer-events:none;transition:opacity .35s ease,transform .5s ease}

        .arrival-save{position:absolute;top:10px;left:10px;z-index:5;width:34px;height:34px;display:flex;align-items:center;justify-content:center;padding:0;border:1px solid rgba(255,255,255,.85);border-radius:50%;background:rgba(255,255,255,.94);color:#295C65;cursor:pointer;backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px);transition:transform .2s ease,background .2s ease,color .2s ease}
        .arrival-save:hover{transform:scale(1.07);background:#295C65;color:#fff}
        .arrival-save.is-saved{background:#295C65;color:#fff;border-color:#295C65}

        /* only ONE discount pill (top right) and ONE badge (bottom left) */
        .arrival-off{position:absolute;top:10px;right:10px;z-index:4;padding:8px 12px;border-radius:999px;background:#BE9D6B;color:#fff;font:600 11px/1 "Poppins",Arial,sans-serif;letter-spacing:.3px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.14)}
        .arrival-badge{position:absolute;left:10px;bottom:10px;z-index:4;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,.95);color:#295C65;font:600 10px/1 "Poppins",Arial,sans-serif;letter-spacing:.4px;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.08)}

        .arrival-body{flex:1;display:flex;flex-direction:column;padding:16px;box-sizing:border-box}
        .arrival-name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.3em;margin:0;color:#1A1A1A;font:600 21px/1.15 "Cormorant Garamond",Georgia,serif;text-decoration:none}
        .arrival-name:hover{color:#295C65}
        .arrival-sku{margin-top:4px;color:#8A8A87;font:500 10.5px/1.3 "Poppins",Arial,sans-serif;letter-spacing:.2px}

        .arrival-spec-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px 14px;margin-top:12px;padding:12px 0;border-top:1px solid #F0EAE2;border-bottom:1px solid #F0EAE2}
        .arrival-spec{min-width:0;display:flex;flex-direction:column}
        .arrival-spec-label,.arrival-option-label{color:#BE9D6B;font:600 9px/1 "Poppins",Arial,sans-serif;letter-spacing:1.2px;text-transform:uppercase}
        .arrival-spec-value{margin-top:4px;color:#2B363B;font:500 12px/1.3 "Poppins",Arial,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

        .arrival-options{display:flex;flex-direction:column;gap:9px;margin-top:12px}
        .arrival-option-row{display:flex;align-items:center;gap:10px;min-height:26px}
        .arrival-option-label{width:38px;flex-shrink:0}
        .arrival-swatches,.arrival-size-options{display:flex;align-items:center;flex-wrap:wrap;gap:7px;min-width:0}
        .arrival-selected-label{margin-left:auto;max-width:38%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#8A8A87;font:500 10px "Poppins",Arial,sans-serif}
        .arrival-swatch-button{width:20px;height:20px;padding:0;border:1px solid rgba(0,0,0,.16);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;transition:transform .18s ease,box-shadow .18s ease}
        .arrival-swatch-button:hover{transform:scale(1.1)}
        .arrival-swatch-button.is-selected{border:2px solid #295C65;box-shadow:0 0 0 2px #fff,0 0 0 3px #295C65}
        .arrival-size-option{min-width:34px;height:26px;padding:0 9px;display:inline-flex;align-items:center;justify-content:center;border:1px solid #DCD4CB;border-radius:6px;background:#fff;color:#295C65;font:600 10px/1 "Poppins",Arial,sans-serif;cursor:pointer;transition:background .18s ease,color .18s ease,border-color .18s ease}
        .arrival-size-option:hover{border-color:#295C65}
        .arrival-size-option.is-selected{background:#295C65;color:#fff;border-color:#295C65}

        .arrival-foot{margin-top:auto;padding-top:14px}
        .arrival-price-row{display:flex;align-items:baseline;flex-wrap:wrap;gap:2px 8px;margin-bottom:11px}
        .arrival-sale-price{color:#295C65;font:700 24px/1 "Cormorant Garamond",Georgia,serif}
        .arrival-mrp{color:#9A9A9A;text-decoration:line-through;font:500 11.5px/1 "Poppins",Arial,sans-serif}
        .arrival-unit{color:#8A8A87;font:500 10.5px/1 "Poppins",Arial,sans-serif}
        .arrival-cart-message{margin:-4px 0 8px;color:#A24D4D;font:500 10.5px/1.35 "Poppins",Arial,sans-serif}

        .arrival-actions{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .arrival-cart,.arrival-quote{min-width:0;height:40px;border-radius:999px;display:flex;align-items:center;justify-content:center;gap:5px;padding:0 8px;box-sizing:border-box;font:600 11.5px/1 "Poppins",Arial,sans-serif;white-space:nowrap}
        .arrival-cart{position:relative;overflow:hidden;border:1px solid #295C65;background:#295C65;color:#fff;cursor:pointer;transition:background .2s ease}
        .arrival-cart:hover{background:#214D55}
        .arrival-cart.is-added{background:#BE9D6B;border-color:#BE9D6B}
        .arrival-cart.is-added:hover{background:#A98755;border-color:#A98755}
        .arrival-cart:disabled{opacity:.7;cursor:wait}
        .arrival-cart-stage{position:relative;width:100%;height:16px;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .arrival-cart-state{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap}
        .arrival-cart-state.enter{animation:cartEnter .42s cubic-bezier(.2,.8,.25,1) both}
        .arrival-cart-state.remove{animation:cartRemove .32s cubic-bezier(.2,.8,.25,1) both}
        .arrival-cart-quantity{padding:0 5px}
        .arrival-quantity-inner{width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:4px}
        .arrival-qty-btn{width:22px;height:22px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.2);color:#fff;font:600 15px/1 "Poppins",Arial,sans-serif;cursor:pointer;transition:background .2s ease,transform .15s ease,opacity .2s ease}
        .arrival-qty-btn:hover:not(:disabled){background:rgba(255,255,255,.32);transform:scale(1.06)}
        .arrival-qty-btn:disabled{opacity:.42;cursor:not-allowed}
        .arrival-qty-number{min-width:18px;text-align:center;color:#fff;font:700 11px "Poppins",Arial,sans-serif}
        .arrival-remove-btn{width:22px;height:22px;margin-left:2px;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;padding:0;border:0;border-left:1px solid rgba(255,255,255,.28);background:transparent;color:#fff;cursor:pointer;transition:transform .2s ease,opacity .2s ease}
        .arrival-remove-btn:hover{transform:scale(1.08);opacity:.82}
        .arrival-quote{border:1px solid #295C65;background:#fff;color:#295C65;text-decoration:none;transition:background .2s ease,color .2s ease}
        .arrival-quote:hover{background:#295C65;color:#fff}
        .q-short{display:none}

        /* ---------- PAGINATION ---------- */
        .arrival-pagination{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;margin-top:32px}
        .arrival-page-btn{width:38px;height:38px;padding:0;display:flex;align-items:center;justify-content:center;border:1px solid #E5DDD4;border-radius:50%;background:#fff;color:#295C65;font:11px "Poppins",Arial,sans-serif;cursor:pointer;transition:background .2s ease,color .2s ease,border-color .2s ease}
        .arrival-page-btn:hover{border-color:#295C65}
        .arrival-page-btn.active{background:#295C65;color:#fff;border-color:#295C65}
        .arrival-page-btn:disabled{opacity:.4;cursor:not-allowed}

        /* ---------- SKELETON ---------- */
        .skeleton-card{transform:none!important;box-shadow:none!important}
        .skeleton-card .arrival-actions{margin-top:auto}
        .skeleton-image,.skeleton-title,.skeleton-label,.skeleton-value,.skeleton-color-label,.skeleton-action{background:linear-gradient(90deg,#E9E2DA 20%,#F4EFEA 40%,#E9E2DA 60%);background-size:200% 100%;animation:skeletonLoading 1.4s ease-in-out infinite}
        .skeleton-image{width:100%;height:100%}
        .skeleton-title{width:72%;height:19px;border-radius:5px;margin-bottom:13px}
        .skeleton-label{width:34%;height:8px;border-radius:5px;margin-bottom:6px}
        .skeleton-value{width:74%;height:12px;border-radius:5px}
        .skeleton-color-label{width:44px;height:8px;border-radius:5px}
        .skeleton-swatches{display:flex;align-items:center;gap:5px}
        .skeleton-swatches span{width:16px;height:16px;border-radius:50%;background:#ECE6DF}
        .arrival-options-skeleton{display:flex;align-items:center;gap:8px;margin:10px 0 13px}
        .skeleton-action{height:40px;border-radius:999px}

        @keyframes cartEnter{0%{transform:translateY(-120%);opacity:0}55%{transform:translateY(8%);opacity:1}100%{transform:translateY(0);opacity:1}}
        @keyframes cartRemove{0%{transform:translateY(120%);opacity:0}60%{transform:translateY(-6%);opacity:1}100%{transform:translateY(0);opacity:1}}
        @keyframes skeletonLoading{0%{background-position:200% 0}100%{background-position:-200% 0}}

        /* ---------- RESPONSIVE ---------- */
        @media (max-width:1100px){
          .new-arrivals-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
        }
        @media (max-width:800px){
          .new-arrivals-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
          .new-arrivals-title{font-size:48px}
        }
        @media (max-width:600px){
          .new-arrivals-page{padding:30px 0 42px}
          .new-arrivals-container{padding:0 14px}
          .new-arrivals-header{margin-bottom:26px}
          .new-arrivals-title{font-size:37px}
          .new-arrivals-eyebrow{font-size:9px;letter-spacing:2.5px}
          .new-arrivals-subtitle{max-width:330px;font-size:11px}
          .new-arrivals-count{margin-bottom:14px;font-size:10px}
          .new-arrivals-grid{gap:10px}

          .arrival-card{border-radius:12px}
          .arrival-image-wrap{aspect-ratio:1/1.1}
          .arrival-save{width:28px;height:28px;top:7px;left:7px}
          .arrival-off{top:7px;right:7px;padding:6px 8px;font-size:9px}
          .arrival-badge{left:7px;bottom:7px;padding:6px 8px;font-size:8px}

          .arrival-body{padding:11px 10px 10px}
          .arrival-name{font-size:15.5px;line-height:1.18}
          .arrival-sku{margin-top:3px;font-size:8.5px}
          .arrival-spec-grid{gap:7px 8px;margin-top:9px;padding:9px 0}
          .arrival-spec-label,.arrival-option-label{font-size:7.5px;letter-spacing:.9px}
          .arrival-spec-value{margin-top:3px;font-size:10px}

          .arrival-options{gap:7px;margin-top:9px}
          .arrival-option-row{gap:6px;min-height:22px}
          .arrival-option-label{width:30px}
          .arrival-selected-label{display:none}
          .arrival-swatches,.arrival-size-options{gap:5px}
          .arrival-swatch-button{width:17px;height:17px}
          .arrival-size-option{min-width:28px;height:22px;padding:0 6px;font-size:8.5px}

          .arrival-foot{padding-top:10px}
          .arrival-price-row{gap:2px 6px;margin-bottom:8px}
          .arrival-sale-price{font-size:19px}
          .arrival-mrp{font-size:10px}
          .arrival-unit{font-size:9px}
          .arrival-cart-message{font-size:9px}

          .arrival-actions{gap:5px}
          .arrival-cart,.arrival-quote{height:34px;padding:0 4px;font-size:9.5px}
          .arrival-cart-state svg{display:none}
          .q-long{display:none}
          .q-short{display:inline}
          .arrival-cart-quantity{padding:0 3px}
          .arrival-quantity-inner{gap:2px}
          .arrival-qty-btn{width:17px;height:17px;font-size:13px}
          .arrival-qty-number{min-width:14px;font-size:9px}
          .arrival-remove-btn{width:18px;height:18px;margin-left:1px}

          .skeleton-action{height:34px}
          .arrival-pagination{margin-top:24px;gap:6px}
          .arrival-page-btn{width:32px;height:32px;font-size:10px}
        }
        @media (max-width:380px){
          .new-arrivals-title{font-size:33px}
          .new-arrivals-grid{gap:8px}
          .arrival-body{padding:10px 8px 9px}
          .arrival-name{font-size:14.5px}
          .arrival-sale-price{font-size:17px}
          .arrival-cart,.arrival-quote{font-size:9px}
        }
        @media (prefers-reduced-motion:reduce){
          .arrival-card,.arrival-image,.arrival-second-image,.arrival-save,.arrival-cart,.arrival-quote,.arrival-qty-btn,.arrival-remove-btn,.arrival-cart-state,.arrival-swatch-button,.arrival-size-option,.skeleton-image,.skeleton-title,.skeleton-label,.skeleton-value,.skeleton-color-label,.skeleton-action{transition:none!important;animation:none!important}
        }
      `}</style>

      <div className="new-arrivals-container">
        <header className="new-arrivals-header">
          <div className="new-arrivals-eyebrow">NEW ARRIVALS</div>

          <h1 className="new-arrivals-title">New Arrivals</h1>

          <div className="new-arrivals-line" />

          <p className="new-arrivals-subtitle">
            Discover our latest collection of premium fabrics, crafted with
            tradition and care.
          </p>
        </header>

        <div className="new-arrivals-count">
          {loading ? "Loading..." : `${allProducts.length} Products`}
        </div>

        {loadError && !loading ? (
          <div
            className="new-arrivals-message"
            style={{ minHeight: 0, marginBottom: 18, fontSize: 10 }}
          >
            {loadError}
          </div>
        ) : null}

        {loading ? (
          <div className="new-arrivals-grid">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : allProducts.length === 0 ? (
          <div className="new-arrivals-message">No new arrivals available.</div>
        ) : (
          <div className="new-arrivals-grid">
            {visibleProducts.map((product) => {
              const id = String(product.id);
              const cartState = cartStates[id] || "idle";
              const cartItem = getCartItemForProduct(product);
              const inCart = Boolean(cartItem) && cartState !== "removed";
              const quantity = Math.max(1, Number(cartItem?.quantity) || 1);

              const selectedColor = getSelectedColor(product);
              const selectedSize = getSelectedSize(product);

              const displayPricing = getDisplayPricing(product);
              const selectedVariant = displayPricing.variant;

              const firstImage = product.images?.[0] || FALLBACK_IMAGE;

              const secondImage =
                product.images?.[1] && product.images[1] !== firstImage
                  ? product.images[1]
                  : null;

              const showSecondImage = Boolean(
                secondImage &&
                  (hoveredProduct === product.id ||
                    mobileImageProduct === product.id)
              );

              const isSaved = isProductSaved(product.id);

              return (
                  <article
                    key={id}
                    className="arrival-card"
                    onMouseEnter={() => handleMouseEnter(product)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="arrival-image-wrap">
                      <Link
                        href={`/products/${product.slug}`}
                        className="arrival-image-link"
                        onTouchStart={(event) => handleTouchStart(event, product)}
                      >
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="arrival-image"
                          loading="lazy"
                          draggable="false"
                        />

                        {secondImage ? (
                          <img
                            src={secondImage}
                            alt=""
                            aria-hidden="true"
                            className="arrival-second-image"
                            style={{
                              opacity: showSecondImage ? 1 : 0,
                              transform: showSecondImage ? "scale(1.04)" : "scale(1)",
                            }}
                            loading="lazy"
                            draggable="false"
                          />
                        ) : null}
                      </Link>

                      <button
                        type="button"
                        className={`arrival-save ${isSaved ? "is-saved" : ""}`}
                        onClick={() => toggleSave(product.id)}
                        aria-label={
                          isSaved
                            ? `Remove ${product.name} from saved`
                            : `Save ${product.name}`
                        }
                        aria-pressed={isSaved}
                      >
                        <Heart
                          size={15}
                          strokeWidth={2}
                          fill={isSaved ? "currentColor" : "none"}
                        />
                      </button>

                      {/* Discount: sirf yahin (image ke top-right) */}
                      {displayPricing.isSale ? (
                        <span className="arrival-off">
                          -{displayPricing.discount}% OFF
                        </span>
                      ) : null}

                      {/* Badge: sirf yahin (image ke bottom-left). Sale hai to "Sale" badge nahi dikhega, kyunki OFF pill already hai */}
                      {product.badge &&
                      !(displayPricing.isSale && /sale/i.test(product.badge)) ? (
                        <span className="arrival-badge">{product.badge}</span>
                      ) : null}
                    </div>

                    <div className="arrival-body">
                      <Link
                        href={`/products/${product.slug}`}
                        className="arrival-name"
                      >
                        {product.name}
                      </Link>

                      <span className="arrival-sku">
                        SKU: {selectedVariant?.sku || product.sku || "—"}
                      </span>

                      <div className="arrival-spec-grid">
                        {[
                          ["GSM", product.gsm],
                          ["Width", product.width],
                          ["Composition", product.composition],
                          ["MOQ", `${product.moq} Metres`],
                        ].map(([label, value]) => (
                          <div className="arrival-spec" key={label}>
                            <span className="arrival-spec-label">{label}</span>
                            <span className="arrival-spec-value" title={String(value)}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>

                      {product.colorOptions?.length > 0 ||
                      product.sizeOptions?.length > 0 ? (
                        <div className="arrival-options">
                          {product.colorOptions?.length > 0 ? (
                            <div className="arrival-option-row">
                              <span className="arrival-option-label">Color</span>

                              <div className="arrival-swatches">
                                {product.colorOptions.map((color, index) => {
                                  const active =
                                    colorSelectionKey(selectedColor) ===
                                    colorSelectionKey(color);

                                  return (
                                    <button
                                      key={`${id}-color-${index}`}
                                      type="button"
                                      className={`arrival-swatch-button ${
                                        active ? "is-selected" : ""
                                      }`}
                                      style={{
                                        backgroundColor:
                                          color.hex || color.value || "#D9D9D9",
                                      }}
                                      onClick={() => handleSelectColor(product, color)}
                                      title={color.name || color.value}
                                      aria-label={`Select ${color.name || color.value}`}
                                      aria-pressed={active}
                                    >
                                      {active ? (
                                        <Check size={10} strokeWidth={2.7} />
                                      ) : null}
                                    </button>
                                  );
                                })}
                              </div>

                              <span className="arrival-selected-label">
                                {selectedColor?.name || "Select"}
                              </span>
                            </div>
                          ) : null}

                          {product.sizeOptions?.length > 0 ? (
                            <div className="arrival-option-row">
                              <span className="arrival-option-label">Size</span>

                              <div className="arrival-size-options">
                                {getAvailableSizes(product).map((size, index) => {
                                  const active = optionMatches(selectedSize, size);

                                  return (
                                    <button
                                      key={`${id}-size-${index}-${size.name}`}
                                      type="button"
                                      className={`arrival-size-option ${
                                        active ? "is-selected" : ""
                                      }`}
                                      onClick={() => handleSelectSize(product, size)}
                                      aria-pressed={active}
                                    >
                                      {size.name}
                                    </button>
                                  );
                                })}
                              </div>

                              <span className="arrival-selected-label">
                                {selectedSize?.name || "Select"}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      <div className="arrival-foot">
                        <div className="arrival-price-row">
                          <span className="arrival-sale-price">
                            ₹{Number(displayPricing.final).toLocaleString("en-IN")}
                          </span>

                          {displayPricing.isSale ? (
                            <span className="arrival-mrp">
                              ₹{Number(displayPricing.regular).toLocaleString("en-IN")}
                            </span>
                          ) : null}

                          <span className="arrival-unit">
                            / {String(product.priceUnit || "Per Meter").replace(/^per\s+/i, "")}
                          </span>
                        </div>

                        {cartMessages[id] ? (
                          <div className="arrival-cart-message">{cartMessages[id]}</div>
                        ) : null}

                        <div className="arrival-actions">
                          {inCart ? (
                            <div
                              className="arrival-cart arrival-cart-quantity is-added"
                              aria-label={`Cart quantity for ${product.name}`}
                            >
                              {cartState === "updating" ? (
                                <span className="arrival-cart-stage">
                                  <span key="updating" className="arrival-cart-state enter">
                                    <ShoppingCart size={12} strokeWidth={2} />
                                    <span>Updating</span>
                                  </span>
                                </span>
                              ) : cartState === "removing" ? (
                                <span className="arrival-cart-stage">
                                  <span key="removing" className="arrival-cart-state remove">
                                    <Trash2 size={12} strokeWidth={2} />
                                    <span>Removing</span>
                                  </span>
                                </span>
                              ) : cartState === "added" ? (
                                <span className="arrival-cart-stage">
                                  <span key="added" className="arrival-cart-state enter">
                                    <Check size={12} strokeWidth={2.5} />
                                    <span>Added</span>
                                  </span>
                                </span>
                              ) : (
                                <span className="arrival-quantity-inner">
                                  <button
                                    type="button"
                                    className="arrival-qty-btn"
                                    onClick={() => changeCartQuantity(product, "decrease")}
                                    disabled={quantity <= 1}
                                    aria-label={`Decrease ${product.name} quantity`}
                                  >
                                    −
                                  </button>

                                  <span className="arrival-qty-number">{quantity}</span>

                                  <button
                                    type="button"
                                    className="arrival-qty-btn"
                                    onClick={() => changeCartQuantity(product, "increase")}
                                    aria-label={`Increase ${product.name} quantity`}
                                  >
                                    +
                                  </button>

                                  <button
                                    type="button"
                                    className="arrival-remove-btn"
                                    onClick={() => handleRemoveProduct(product)}
                                    aria-label={`Remove ${product.name} from cart`}
                                    title="Remove from cart"
                                  >
                                    <Trash2 size={12} strokeWidth={2} />
                                  </button>
                                </span>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="arrival-cart"
                              onClick={() => handleAddToCart(product)}
                              disabled={cartState === "loading"}
                              aria-label={`Add ${product.name} to cart`}
                            >
                              <span className="arrival-cart-stage">
                                {cartState === "loading" ? (
                                  <span key="loading" className="arrival-cart-state enter">
                                    <ShoppingCart size={12} strokeWidth={2} />
                                    <span>Adding</span>
                                  </span>
                                ) : (
                                  <span key="cart" className="arrival-cart-state enter">
                                    <ShoppingCart size={12} strokeWidth={2} />
                                    <span>Add to Cart</span>
                                  </span>
                                )}
                              </span>
                            </button>
                          )}

                          <Link href="/contact#contact-form" className="arrival-quote">
                            <span className="q-long">Request Quote</span>
                            <span className="q-short">Quote</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 ? (
          <div className="arrival-pagination">
            <button
              type="button"
              className="arrival-page-btn"
              disabled={safePage === 1}
              onClick={() => changePage(safePage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  type="button"
                  className={`arrival-page-btn ${safePage === page ? "active" : ""}`}
                  onClick={() => changePage(page)}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              className="arrival-page-btn"
              disabled={safePage === totalPages}
              onClick={() => changePage(safePage + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}