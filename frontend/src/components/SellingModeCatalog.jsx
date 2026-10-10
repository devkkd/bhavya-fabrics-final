"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  Zap,
} from "lucide-react";


import { useCart } from "@/context/CartContext";
import { StorefrontPrice } from "@/context/StorefrontPreferencesContext";
import { useWishlist } from "@/context/WishlistContext";
import { requestCustomerLogin } from "@/utils/storefrontSync";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");

const PAGE_SIZE = 12;

const COLORS = {
  teal: "#295C65",
  tealDark: "#214D55",
  cream: "#FAF8F5",
  warm: "#F4EFE9",
  border: "#E5DDD4",
  borderSoft: "#EEE7DF",
  gold: "#BE9D6B",
  ink: "#1D2527",
  muted: "#77736D",
  white: "#FFFFFF",
  success: "#2F775B",
  danger: "#A64D4D",
};

function imageUrl(value) {
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
      value?.label ||
      value?.color ||
      value?.colour ||
      value?.code ||
      ""
  ).trim();
}

function optionKey(value) {
  return optionName(value).toLowerCase();
}

function optionMatches(a, b) {
  const left = optionKey(a);
  const right = optionKey(b);
  return Boolean(left && right && left === right);
}

function getProductId(product) {
  return String(product?._id || product?.id || product?.productId || "");
}

function getProductTitle(product) {
  return product?.title || product?.name || product?.productName || "Product";
}

function getColorImages(color) {
  if (!color) return [];

  const sources = [
    ...(Array.isArray(color?.images) ? color.images : []),
    ...(Array.isArray(color?.gallery) ? color.gallery : []),
    color?.image,
    color?.imageUrl,
    color?.imageURL,
    color?.mainImage,
  ];

  return [...new Set(sources.map(imageUrl).filter(Boolean))];
}

function getImage(product, selectedColor = null) {
  const colorImages = getColorImages(selectedColor);
  if (colorImages[0]) return colorImages[0];

  const main = imageUrl(product?.mainImage);
  if (main) return main;

  const gallery = Array.isArray(product?.gallery)
    ? product.gallery.map(imageUrl).filter(Boolean)
    : [];

  if (gallery[0]) return gallery[0];

  const images = Array.isArray(product?.images)
    ? product.images.map(imageUrl).filter(Boolean)
    : [];

  return images[0] || "/images/home/products/1.png";
}

function getAllImages(product, selectedColor = null) {
  const colorImages = getColorImages(selectedColor);
  const values = [
    ...colorImages,
    imageUrl(product?.mainImage),
    ...(Array.isArray(product?.gallery)
      ? product.gallery.map(imageUrl)
      : []),
    ...(Array.isArray(product?.images)
      ? product.images.map(imageUrl)
      : []),
  ].filter(Boolean);

  return [...new Set(values)];
}

function getColors(product) {
  const variantColors = Array.isArray(product?.variants)
    ? product.variants
        .filter((variant) => variant?.active !== false)
        .map((variant) =>
          variant?.colorOption ||
          variant?.color ||
          variant?.colour ||
          variant?.selectedColor ||
          (variant?.colorName || variant?.colorValue
            ? {
                name: variant.colorName || variant.colorValue,
                value: variant.colorValue || variant.colorName,
                hex: variant.colorHex || "",
              }
            : "") ||
          ""
        )
        .filter(Boolean)
    : [];

  const sourceCandidates = [
    product?.options?.colors,
    product?.colorOptions,
    product?.colors,
    variantColors,
  ];

  const source = sourceCandidates.find(
    (value) => Array.isArray(value) && value.length > 0
  ) || [];

  const normalized = source
    .map((item) => {
      if (typeof item === "string") {
        return {
          name: item.trim(),
          value: item.trim(),
          hex: item.trim(),
          images: [],
        };
      }

      const name =
        item?.name ||
        item?.value ||
        item?.color ||
        item?.colour ||
        item?.label ||
        item?.code ||
        "";

      return {
        ...item,
        name: String(name).trim(),
        value: String(
          item?.value ||
            item?.name ||
            item?.color ||
            item?.colour ||
            item?.label ||
            ""
        ).trim(),
        hex:
          item?.hex ||
          item?.colorCode ||
          item?.colourCode ||
          item?.value ||
          item?.color ||
          item?.colour ||
          "",
        images: getColorImages(item),
      };
    })
    .filter((item) => optionName(item));

  return normalized.reduce((list, item) => {
    const key = optionKey(item);
    const existing = list.find((entry) => optionKey(entry) === key);

    if (!existing) {
      list.push(item);
      return list;
    }

    existing.images = [
      ...(existing.images || []),
      ...(item.images || []),
    ].filter(Boolean);

    if (!existing.hex && item.hex) existing.hex = item.hex;
    if (!existing.value && item.value) existing.value = item.value;

    return list;
  }, []);
}

function getSizes(product, selectedColor = null) {
  const variantSizes = Array.isArray(product?.variants)
    ? product.variants
        .filter((variant) => variant?.active !== false)
        .filter((variant) => {
          if (!selectedColor) return true;

          return optionMatches(
            variant?.colorOption ||
              variant?.color ||
              variant?.colour ||
            variant?.selectedColor ||
            variant?.colorName ||
            variant?.colorValue,
            selectedColor
          );
        })
        .map((variant) =>
          variant?.sizeOption ||
          variant?.size ||
          variant?.selectedSize ||
          variant?.sizeName ||
          variant?.sizeValue ||
          ""
        )
        .filter(Boolean)
    : [];

  const sourceCandidates = [
    product?.options?.sizes,
    product?.sizeOptions,
    product?.sizes,
    variantSizes,
  ];

  const source = sourceCandidates.find(
    (value) => Array.isArray(value) && value.length > 0
  ) || [];

  return source
    .map((item) => {
      if (typeof item === "string") {
        return { name: item.trim(), value: item.trim() };
      }

      return {
        ...item,
        name:
          item?.name ||
          item?.value ||
          item?.label ||
          item?.size ||
          "",
        value:
          item?.value ||
          item?.name ||
          item?.label ||
          item?.size ||
          "",
      };
    })
    .filter((item) => optionName(item))
    .reduce((list, item) => {
      if (!list.some((entry) => optionKey(entry) === optionKey(item))) {
        list.push(item);
      }
      return list;
    }, []);
}

function getMeterConfig(product) {
  const config = product?.meterConfig || {};
  const min = Math.max(
    0.01,
    Number(
      config?.minMeters ??
        config?.min ??
        product?.minMeters ??
        1
    ) || 1
  );
  const max = Math.max(
    min,
    Number(
      config?.maxMeters ??
        config?.max ??
        product?.maxMeters ??
        100
    ) || 100
  );
  const step = Math.max(
    0.01,
    Number(
      config?.incrementMeters ??
        config?.stepMeters ??
        config?.step ??
        product?.meterIncrement ??
        1
    ) || 1
  );

  return { min, max, step };
}

function formatMeters(value) {
  const number = Number(value || 0);
  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2).replace(/\.?0+$/, "");
}

function getPrice(product, selectedVariant = null) {
  const regular = Number(
    selectedVariant?.regularPrice ??
      product?.pricing?.regularPrice ??
      product?.regularPrice ??
      product?.price ??
      0
  ) || 0;

  const sale = Number(
    selectedVariant?.salePrice ??
      product?.pricing?.salePrice ??
      product?.salePrice ??
      0
  ) || 0;

  const showSale =
    Boolean(
      selectedVariant?.showOnSale ??
        product?.showOnSale
    ) && sale > 0 && sale < regular;

  return {
    regular,
    final: showSale ? sale : regular,
    isSale: showSale,
    discount:
      showSale && regular > 0
        ? Math.max(
            1,
            Math.round(((regular - sale) / regular) * 100)
          )
        : 0,
  };
}

function getSelectedVariant(product, selectedColor, selectedSize) {
  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  if (!variants.length) return null;

  const needsColor = getColors(product).length > 0;
  const needsSize = getSizes(product).length > 0;

  if (!needsColor && !needsSize) return null;
  if (needsColor && !selectedColor) return null;
  if (needsSize && !selectedSize) return null;

  return (
    variants.find((variant) => {
      const variantColor =
        variant?.colorOption ||
        variant?.color ||
        variant?.colour ||
        variant?.selectedColor ||
        variant?.colorName ||
        variant?.colorValue;
      const variantSize =
        variant?.sizeOption ||
        variant?.size ||
        variant?.selectedSize ||
        variant?.sizeName ||
        variant?.sizeValue;

      const colorMatches = needsColor
        ? optionMatches(variantColor, selectedColor)
        : true;

      const sizeMatches = needsSize
        ? optionMatches(variantSize, selectedSize)
        : true;

      return colorMatches && sizeMatches;
    }) || null
  );
}

function hasSelectableVariants(product) {
  return Array.isArray(product?.variants) &&
    product.variants.some((variant) => {
      if (variant?.active === false) return false;

      return Boolean(
        variant?.colorOption ||
          variant?.color ||
          variant?.colour ||
          variant?.selectedColor ||
          variant?.colorName ||
          variant?.colorValue ||
          variant?.sizeOption ||
          variant?.size ||
          variant?.selectedSize ||
          variant?.sizeName ||
          variant?.sizeValue
      );
    });
}

export default function SellingModeCatalog({
  mode,
  title,
  eyebrow,
  description,
}) {
  const router = useRouter();

  const {
    addToCart,
    items: cartItems = [],
    updateQuantity,
    removeItem,
    prepareBuyNow,
  } = useCart();

  const {
    toggleSave,
    isSaved: isProductSaved,
  } = useWishlist();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedMeters, setSelectedMeters] = useState({});
  const [busy, setBusy] = useState({});
  const [messages, setMessages] = useState({});
  const [buyingId, setBuyingId] = useState("");

  useEffect(() => {
    setPage(1);
  }, [mode]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          sellingMode: mode,
          page: String(page),
          limit: String(PAGE_SIZE),
        });

        const response = await fetch(
          `${API_URL}/products?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Unable to load products."
          );
        }

        if (cancelled) return;

        setProducts(
          Array.isArray(data.products)
            ? data.products
            : []
        );

        setPagination(
          data.pagination || {
            page,
            totalPages: 1,
            total: 0,
          }
        );
      } catch (err) {
        if (err?.name === "AbortError") return;

        if (!cancelled) {
          setProducts([]);
          setError(
            err?.message || "Unable to load products."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [mode, page]);

  /*
   * IMPORTANT:
   * The card does not keep its own "saved" or "cart" truth.
   * WishlistContext and CartContext are the single source of truth.
   * Whenever cartItems changes, the card is re-rendered automatically.
   */
  useEffect(() => {
    if (!Array.isArray(products) || !products.length) return;
    if (!Array.isArray(cartItems) || !cartItems.length) return;

    setSelectedColors((current) => {
      const next = { ...current };
      let changed = false;

      products.forEach((product) => {
        const id = getProductId(product);
        const colors = getColors(product);
        const sizes = getSizes(product);

        const lines = cartItems.filter(
          (item) =>
            String(item?.productId || "") === id
        );

        if (!lines.length) return;

        const line = [...lines].reverse().find((item) => {
          return (
            item?.selectedColor ||
            item?.selectedSize ||
            item?.variantId
          );
        }) || lines[lines.length - 1];

        if (colors.length && line?.selectedColor) {
          const match =
            colors.find((color) =>
              optionMatches(color, line.selectedColor)
            ) || line.selectedColor;

          const key = optionKey(match);

          if (next[id] !== key) {
            next[id] = key;
            changed = true;
          }
        }
      });

      return changed ? next : current;
    });

    setSelectedSizes((current) => {
      const next = { ...current };
      let changed = false;

      products.forEach((product) => {
        const id = getProductId(product);
        const sizes = getSizes(product);

        if (!sizes.length) return;

        const lines = cartItems.filter(
          (item) =>
            String(item?.productId || "") === id
        );

        if (!lines.length) return;

        const line = [...lines].reverse().find(
          (item) => item?.selectedSize
        );

        if (!line?.selectedSize) return;

        const match =
          sizes.find((size) =>
            optionMatches(size, line.selectedSize)
          ) || line.selectedSize;

        const key = optionKey(match);

        if (next[id] !== key) {
          next[id] = key;
          changed = true;
        }
      });

      return changed ? next : current;
    });

    setSelectedMeters((current) => {
      const next = { ...current };
      let changed = false;

      products.forEach((product) => {
        if (mode !== "meter") return;

        const id = getProductId(product);
        const config = getMeterConfig(product);

        const lines = cartItems.filter(
          (item) =>
            String(item?.productId || "") === id
        );

        if (!lines.length) return;

        const line = [...lines].reverse()[0];
        const quantity = Number(line?.quantity);

        if (!Number.isFinite(quantity)) return;

        const safe = Math.min(
          config.max,
          Math.max(config.min, quantity)
        );

        if (next[id] !== safe) {
          next[id] = safe;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [cartItems, products, mode]);

  const pages = useMemo(() => {
    const totalPages = Number(
      pagination.totalPages || 1
    );
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    return Array.from(
      { length: Math.max(0, end - start + 1) },
      (_, index) => start + index
    );
  }, [pagination.totalPages, page]);

  const setMessage = (id, message) => {
    const key = String(id);

    setMessages((current) => ({
      ...current,
      [key]: message,
    }));

    window.setTimeout(() => {
      setMessages((current) => {
        if (!current[key]) return current;

        const next = { ...current };
        delete next[key];
        return next;
      });
    }, 2400);
  };

  const getSelectedColor = (product) => {
    const colors = getColors(product);
    const selected = selectedColors[getProductId(product)];

    if (!selected) return colors[0] || null;

    return (
      colors.find((color) => optionKey(color) === selected) ||
      colors[0] ||
      null
    );
  };

  const getSelectedSize = (product) => {
    const sizes = getSizes(product);
    const selected = selectedSizes[getProductId(product)];

    if (!selected) return null;

    return (
      sizes.find((size) => optionKey(size) === selected) ||
      null
    );
  };

  const getSelectedMeters = (product) => {
    const id = getProductId(product);
    const config = getMeterConfig(product);

    const value = Number(selectedMeters[id]);

    if (!Number.isFinite(value)) {
      return config.min;
    }

    return Math.min(
      config.max,
      Math.max(config.min, value)
    );
  };

  const snapMeters = (product, value) => {
    const config = getMeterConfig(product);
    const raw = Number(value);

    if (!Number.isFinite(raw)) {
      return config.min;
    }

    const steps = Math.round(
      (raw - config.min) / config.step
    );

    const snapped =
      config.min + steps * config.step;

    return Number(
      Math.min(
        config.max,
        Math.max(config.min, snapped)
      ).toFixed(4)
    );
  };

  const setMeterQuantity = (product, value) => {
    const id = getProductId(product);

    setSelectedMeters((current) => ({
      ...current,
      [id]: snapMeters(product, value),
    }));
  };

  const getCartItemForProduct = (product) => {
    const productId = getProductId(product);
    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);
    const selectedVariant =
      product?.sellingMode === "meter"
        ? null
        : getSelectedVariant(
            product,
            selectedColor,
            selectedSize
          );

    const wantedVariantId = String(
      selectedVariant?.id ||
        selectedVariant?._id ||
        ""
    );

    const wantedColor = optionKey(selectedColor);
    const wantedSize = optionKey(selectedSize);

    const lines = Array.isArray(cartItems)
      ? cartItems.filter(
          (item) =>
            String(item?.productId || "") ===
            productId
        )
      : [];

    if (!lines.length) return null;

    if (wantedVariantId) {
      const variantLine = lines.find(
        (item) =>
          String(item?.variantId || "") ===
          wantedVariantId
      );

      if (variantLine) return variantLine;
    }

    const optionLine = lines.find((item) => {
      const itemColor = optionKey(item?.selectedColor);
      const itemSize = optionKey(item?.selectedSize);

      if (wantedColor || wantedSize) {
        return (
          itemColor === wantedColor &&
          itemSize === wantedSize
        );
      }

      return !itemColor && !itemSize;
    });

    return optionLine || lines[0];
  };

  const handleColorSelect = (product, color) => {
    const id = getProductId(product);
    const key = optionKey(color);

    setSelectedColors((current) => ({
      ...current,
      [id]: key,
    }));

    /*
     * Changing colour may change the valid variant/size.
     * If the current size is no longer valid, clear it.
     */
    const sizes = getSizes(product);
    const variants = Array.isArray(product?.variants)
      ? product.variants
      : [];

    if (
      product?.variantsEnabled &&
      sizes.length &&
      variants.length
    ) {
      const validSizes = sizes.filter((size) =>
        variants.some((variant) =>
          optionMatches(
            variant?.colorOption ||
              variant?.color ||
              variant?.colour,
            color
          ) &&
          optionMatches(
            variant?.sizeOption || variant?.size,
            size
          )
        )
      );

      const currentSize = getSelectedSize(product);

      if (
        currentSize &&
        !validSizes.some((size) =>
          optionMatches(size, currentSize)
        )
      ) {
        setSelectedSizes((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      }
    }
  };

  const handleSizeSelect = (product, size) => {
    const id = getProductId(product);

    setSelectedSizes((current) => ({
      ...current,
      [id]: optionKey(size),
    }));
  };

  const handleAddToCart = async (product) => {
    const id = getProductId(product);
    if (!id) return;

    const isMeter = mode === "meter";
    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);
    const selectedVariant = isMeter
      ? null
      : getSelectedVariant(
          product,
          selectedColor,
          selectedSize
        );

    if (
      !isMeter &&
      getColors(product).length &&
      !selectedColor
    ) {
      setMessage(id, "Please select colour");
      return;
    }

    if (
      !isMeter &&
      getSizes(product).length &&
      !selectedSize
    ) {
      setMessage(id, "Please select size");
      return;
    }

    if (
      !isMeter &&
      hasSelectableVariants(product) &&
      (getColors(product).length || getSizes(product).length) &&
      !selectedVariant
    ) {
      setMessage(
        id,
        "Please select a valid colour and size"
      );
      return;
    }

    if (
      selectedVariant &&
      Number(selectedVariant.stock || 0) <= 0
    ) {
      setMessage(
        id,
        "Selected variant is out of stock"
      );
      return;
    }

    const quantity = isMeter
      ? getSelectedMeters(product)
      : 1;

    setBusy((current) => ({
      ...current,
      [id]: "adding",
    }));

    try {
      const result = await addToCart(
        id,
        quantity,
        {
          selectedColor:
            optionName(selectedColor),
          selectedSize:
            optionName(selectedSize),
          variantId:
            selectedVariant?.id ||
            selectedVariant?._id ||
            "",
        }
      );

      if (result?.loginRequired) {
        setMessage(
          id,
          "Please login to add this item to cart"
        );
        return;
      }

      if (result?.success === false) {
        setMessage(
          id,
          result?.message ||
            "Unable to add this item"
        );
        return;
      }

      setBusy((current) => ({
        ...current,
        [id]: "added",
      }));

      window.setTimeout(() => {
        setBusy((current) => ({
          ...current,
          [id]: "idle",
        }));
      }, 900);
    } catch (error) {
      console.error("Add to cart failed:", error);
      setMessage(
        id,
        "Unable to add this item"
      );
    } finally {
      setBusy((current) => {
        if (current[id] === "adding") {
          return {
            ...current,
            [id]: "idle",
          };
        }
        return current;
      });
    }
  };

  const handleBuyNow = async (product) => {
    const id = getProductId(product);
    if (!id || buyingId) return;

    const isMeter = mode === "meter";
    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);
    const selectedVariant = isMeter
      ? null
      : getSelectedVariant(
          product,
          selectedColor,
          selectedSize
        );

    if (
      !isMeter &&
      getColors(product).length &&
      !selectedColor
    ) {
      setMessage(id, "Please select colour");
      return;
    }

    if (
      !isMeter &&
      getSizes(product).length &&
      !selectedSize
    ) {
      setMessage(id, "Please select size");
      return;
    }

    if (
      !isMeter &&
      hasSelectableVariants(product) &&
      (getColors(product).length || getSizes(product).length) &&
      !selectedVariant
    ) {
      setMessage(
        id,
        "Please select a valid colour and size"
      );
      return;
    }

    if (
      selectedVariant &&
      Number(selectedVariant.stock || 0) <= 0
    ) {
      setMessage(
        id,
        "Selected variant is out of stock"
      );
      return;
    }

    const quantity = isMeter
      ? getSelectedMeters(product)
      : 1;

    setBuyingId(id);
    setMessage(id, "");

    try {
      const result = await prepareBuyNow(
        product,
        quantity,
        {
          selectedColor:
            optionName(selectedColor),
          selectedSize:
            optionName(selectedSize),
          variantId:
            selectedVariant?.id ||
            selectedVariant?._id ||
            "",
        }
      );

      if (result?.loginRequired) {
        setMessage(
          id,
          "Please login to continue with Buy Now"
        );
        requestCustomerLogin(() => handleBuyNow(product));
        return;
      }

      if (
        result?.success &&
        result?.sessionId
      ) {
        router.push(
          `/checkout?buyNowSessionId=${encodeURIComponent(
            result.sessionId
          )}`
        );
        return;
      }

      if (result?.success) {
        router.push("/checkout");
        return;
      }

      setMessage(
        id,
        result?.message ||
          "Unable to start checkout"
      );
    } catch (error) {
      console.error("Buy Now failed:", error);
      setMessage(
        id,
        "Unable to start checkout"
      );
    } finally {
      setBuyingId("");
    }
  };

  const handleIncrease = async (product) => {
    const id = getProductId(product);
    const cartItem = getCartItemForProduct(product);

    if (!cartItem) return;

    const isMeter = mode === "meter";
    const config = getMeterConfig(product);

    const current = Number(
      cartItem.quantity ||
        (isMeter ? config.min : 1)
    );

    const next = isMeter
      ? Math.min(
          config.max,
          Number(
            (current + config.step).toFixed(4)
          )
        )
      : Math.min(100, current + 1);

    if (next === current) return;

    setBusy((state) => ({
      ...state,
      [id]: "updating",
    }));

    try {
      await updateQuantity(
        cartItem._id,
        next
      );
    } catch (error) {
      console.error(
        "Increase quantity failed:",
        error
      );
      setMessage(
        id,
        "Unable to update quantity"
      );
    } finally {
      setBusy((state) => ({
        ...state,
        [id]: "idle",
      }));
    }
  };

  const handleDecrease = async (product) => {
    const id = getProductId(product);
    const cartItem = getCartItemForProduct(product);

    if (!cartItem) return;

    const isMeter = mode === "meter";
    const config = getMeterConfig(product);

    const current = Number(
      cartItem.quantity ||
        (isMeter ? config.min : 1)
    );

    const minimum = isMeter
      ? config.min
      : 1;

    if (current <= minimum) return;

    const next = isMeter
      ? Math.max(
          minimum,
          Number(
            (current - config.step).toFixed(4)
          )
        )
      : current - 1;

    setBusy((state) => ({
      ...state,
      [id]: "updating",
    }));

    try {
      await updateQuantity(
        cartItem._id,
        next
      );
    } catch (error) {
      console.error(
        "Decrease quantity failed:",
        error
      );
      setMessage(
        id,
        "Unable to update quantity"
      );
    } finally {
      setBusy((state) => ({
        ...state,
        [id]: "idle",
      }));
    }
  };

  const handleRemove = async (product) => {
    const id = getProductId(product);
    const cartItem = getCartItemForProduct(product);

    if (!cartItem) return;

    setBusy((state) => ({
      ...state,
      [id]: "removing",
    }));

    try {
      await removeItem(cartItem._id);
    } catch (error) {
      console.error(
        "Remove cart item failed:",
        error
      );
      setMessage(
        id,
        "Unable to remove item"
      );
    } finally {
      setBusy((state) => ({
        ...state,
        [id]: "idle",
      }));
    }
  };

  return (
    <main className="selling-catalog">
      <style>{`
        .selling-catalog {
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          background: ${COLORS.cream};
          color: ${COLORS.ink};
          padding: 34px 62px 78px;
        }

        .selling-catalog-inner {
          width: 100%;
          max-width: 1540px;
          margin: 0 auto;
        }

        .selling-catalog-header {
          margin-bottom: 28px;
        }

        .selling-catalog-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 9px;
          color: ${COLORS.gold};
          font: 600 10px/1 "Poppins", Arial, sans-serif;
          letter-spacing: 2.6px;
          text-transform: uppercase;
        }

        .selling-catalog-eyebrow::before {
          content: "";
          width: 27px;
          height: 1px;
          background: ${COLORS.gold};
          flex: 0 0 auto;
        }

        .selling-catalog-title {
          margin: 0;
          color: #173C46;
          font: 500 clamp(38px, 5vw, 62px)/.94 "Cormorant Garamond", Georgia, serif;
        }

        .selling-catalog-description {
          max-width: 670px;
          margin: 12px 0 0;
          color: ${COLORS.muted};
          font: 400 12px/1.7 "Poppins", Arial, sans-serif;
        }

        .selling-catalog-count {
          margin-top: 11px;
          color: #858079;
          font: 500 10px/1.4 "Poppins", Arial, sans-serif;
          letter-spacing: .4px;
        }

        .selling-catalog-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 392px));
          justify-content: start;
          align-items: start;
          gap: 24px;
        }

        .selling-card {
          position: relative;
          width: 100%;
          min-width: 0;
          background: #FFFFFF;
          border: 1px solid ${COLORS.border};
          border-radius: 17px;
          overflow: hidden;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 5px 18px rgba(35, 48, 50, .035);
          transition:
            transform .24s ease,
            box-shadow .24s ease,
            border-color .24s ease;
        }

        .selling-card:hover {
          transform: translateY(-4px);
          border-color: #D6C8B8;
          box-shadow: 0 18px 34px rgba(35, 48, 50, .09);
        }

        .selling-card-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 0.93;
          overflow: hidden;
          background: #EEE8E1;
        }

        .selling-card-image-link {
          display: block;
          width: 100%;
          height: 100%;
        }

        .selling-card-image,
        .selling-card-image-hover {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: opacity .35s ease, transform .5s ease;
        }

        .selling-card-image-hover {
          position: absolute;
          inset: 0;
          opacity: 0;
        }

        .selling-card:hover .selling-card-image-hover {
          opacity: 1;
        }

        .selling-card:hover .selling-card-image,
        .selling-card:hover .selling-card-image-hover {
          transform: scale(1.025);
        }

        .selling-save-button {
          position: absolute;
          top: 13px;
          left: 13px;
          z-index: 6;
          width: 42px;
          height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.72);
          border-radius: 50%;
          background: rgba(41,92,101,.98);
          color: #fff;
          cursor: pointer;
          box-shadow: 0 7px 16px rgba(20,40,43,.12);
          transition: transform .18s ease, background .18s ease;
        }

        .selling-save-button:hover {
          transform: scale(1.05);
        }

        .selling-save-button.is-saved {
          background: #1F4D56;
        }

        .selling-discount {
          position: absolute;
          top: 13px;
          right: 13px;
          z-index: 6;
          min-height: 34px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #C5A76C;
          color: #fff;
          font: 700 10px/1 "Poppins", Arial, sans-serif;
          letter-spacing: .55px;
          text-transform: uppercase;
        }

        .selling-sale-tag {
          position: absolute;
          left: 13px;
          bottom: 13px;
          z-index: 5;
          min-height: 29px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: rgba(255,255,255,.96);
          color: ${COLORS.teal};
          font: 700 9px/1 "Poppins", Arial, sans-serif;
          letter-spacing: .3px;
          box-shadow: 0 5px 12px rgba(0,0,0,.08);
        }

        .selling-card-content {
          min-height: 324px;
          padding: 18px 20px 19px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .selling-card-title-row {
          min-height: 42px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .selling-card-name {
          min-width: 0;
          margin: 0;
          color: #171F21;
          font: 600 25px/1.02 "Cormorant Garamond", Georgia, serif;
          letter-spacing: -.1px;
        }

        .selling-card-unit {
          margin-top: 7px;
          color: #8C877F;
          font: 600 9px/1.2 "Poppins", Arial, sans-serif;
          letter-spacing: 1.25px;
          text-transform: uppercase;
        }

        .selling-option-area {
          min-height: 91px;
          margin-top: 16px;
          padding: 12px 0 12px;
          border-top: 1px solid ${COLORS.borderSoft};
          border-bottom: 1px solid ${COLORS.borderSoft};
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 11px;
        }

        .selling-option-row {
          min-height: 25px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .selling-option-label {
          flex: 0 0 auto;
          color: ${COLORS.gold};
          font: 700 9px/1 "Poppins", Arial, sans-serif;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .selling-option-value {
          min-width: 0;
          max-width: 56%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #77736D;
          font: 500 9px/1.2 "Poppins", Arial, sans-serif;
        }

        .selling-swatches {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .selling-swatch {
          position: relative;
          width: 22px;
          height: 22px;
          flex: 0 0 22px;
          padding: 0;
          border: 1px solid rgba(20,30,30,.15);
          border-radius: 50%;
          cursor: pointer;
          box-sizing: border-box;
          transition: transform .18s ease, box-shadow .18s ease;
        }

        .selling-swatch:hover {
          transform: scale(1.08);
        }

        .selling-swatch.is-selected {
          outline: 1px solid ${COLORS.teal};
          outline-offset: 2px;
          box-shadow: inset 0 0 0 2px #fff;
        }

        .selling-swatch-check {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-shadow: 0 1px 2px rgba(0,0,0,.35);
        }

        .selling-size-list {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .selling-size-button {
          min-width: 34px;
          height: 27px;
          padding: 0 9px;
          border: 1px solid #DDD4CB;
          border-radius: 7px;
          background: #fff;
          color: #5E5B57;
          cursor: pointer;
          font: 600 9px/1 "Poppins", Arial, sans-serif;
          transition: all .18s ease;
        }

        .selling-size-button.is-selected {
          border-color: ${COLORS.teal};
          background: ${COLORS.teal};
          color: #fff;
        }

        .selling-meter-box {
          min-height: 58px;
          display: grid;
          grid-template-columns: 72px minmax(0, 1fr);
          align-items: center;
          gap: 12px;
        }

        .selling-meter-control {
          height: 39px;
          display: grid;
          grid-template-columns: 38px minmax(0,1fr) 38px;
          align-items: center;
          gap: 7px;
          padding: 3px;
          border: 1px solid #DDD5CD;
          border-radius: 9px;
          background: #FBF9F6;
        }

        .selling-meter-control button {
          width: 34px;
          height: 33px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 6px;
          background: #fff;
          color: ${COLORS.teal};
          cursor: pointer;
        }

        .selling-meter-control button:hover:not(:disabled) {
          background: #F0ECE7;
        }

        .selling-meter-control button:disabled {
          opacity: .38;
          cursor: not-allowed;
        }

        .selling-meter-value {
          text-align: center;
          color: #20292B;
          font: 700 12px/1 "Poppins", Arial, sans-serif;
        }

        .selling-meter-range {
          margin-top: 5px;
          color: #918B83;
          font: 500 8px/1.3 "Poppins", Arial, sans-serif;
          text-align: center;
        }

        .selling-price-area {
          min-height: 62px;
          margin-top: auto;
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .selling-price-line {
          min-height: 29px;
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 8px;
        }

        .selling-final-price {
          color: ${COLORS.teal};
          font: 700 25px/1 "Poppins", Arial, sans-serif;
          letter-spacing: -.5px;
        }

        .selling-original-price {
          color: #A29B93;
          font: 500 11px/1 "Poppins", Arial, sans-serif;
          text-decoration: line-through;
        }

        .selling-price-unit {
          color: #77736D;
          font: 500 10px/1 "Poppins", Arial, sans-serif;
        }

        .selling-message {
          min-height: 18px;
          margin-top: 4px;
          color: ${COLORS.danger};
          font: 600 8.5px/1.3 "Poppins", Arial, sans-serif;
        }

        .selling-actions {
          height: 43px;
          margin-top: 8px;
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(0,1fr);
          gap: 9px;
        }

        .selling-action-button {
          min-width: 0;
          height: 43px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 12px;
          cursor: pointer;
          box-sizing: border-box;
          font: 700 10px/1 "Poppins", Arial, sans-serif;
          transition: transform .18s ease, background .18s ease, border-color .18s ease;
        }

        .selling-action-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .selling-action-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .selling-buy-button {
          border: 1px solid ${COLORS.teal};
          background: #fff;
          color: ${COLORS.teal};
        }

        .selling-buy-button:hover:not(:disabled) {
          background: #F4F8F8;
        }

        .selling-cart-button {
          border: 1px solid ${COLORS.teal};
          background: ${COLORS.teal};
          color: #fff;
        }

        .selling-cart-button:hover:not(:disabled) {
          background: ${COLORS.tealDark};
        }

        .selling-cart-controls {
          height: 43px;
          min-width: 0;
          display: grid;
          grid-template-columns: 30px minmax(0,1fr) 30px 33px;
          align-items: center;
          gap: 2px;
          padding: 3px 5px;
          border: 1px solid #D9D0C7;
          border-radius: 999px;
          background: #fff;
          box-sizing: border-box;
        }

        .selling-qty-button,
        .selling-remove-button {
          width: 29px;
          height: 29px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: ${COLORS.teal};
          cursor: pointer;
        }

        .selling-qty-button:hover:not(:disabled) {
          background: #F0ECE7;
        }

        .selling-remove-button {
          border-left: 1px solid #E4DDD5;
          border-radius: 0;
          width: 32px;
        }

        .selling-remove-button:hover:not(:disabled) {
          color: ${COLORS.danger};
        }

        .selling-qty-button:disabled,
        .selling-remove-button:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        .selling-qty-number {
          min-width: 0;
          text-align: center;
          color: ${COLORS.teal};
          font: 700 9px/1 "Poppins", Arial, sans-serif;
          white-space: nowrap;
        }

        .selling-state {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid ${COLORS.border};
          border-radius: 16px;
          background: #fff;
          color: ${COLORS.muted};
          font: 500 12px/1.6 "Poppins", Arial, sans-serif;
          text-align: center;
          padding: 30px;
        }

        .selling-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 40px;
        }

        .selling-page-button {
          min-width: 38px;
          height: 38px;
          padding: 0 12px;
          border: 1px solid #DED7CF;
          border-radius: 999px;
          background: #fff;
          color: ${COLORS.teal};
          cursor: pointer;
          font: 600 10px/1 "Poppins", Arial, sans-serif;
        }

        .selling-page-button.active {
          border-color: ${COLORS.teal};
          background: ${COLORS.teal};
          color: #fff;
        }

        .selling-page-button:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        @media (max-width: 1100px) {
          .selling-catalog {
            padding-left: 20px;
            padding-right: 20px;
          }

          .selling-catalog-grid {
            grid-template-columns: repeat(3, minmax(0, 392px));
          }
        }

        @media (max-width: 900px) {
          .selling-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .selling-card-content {
            min-height: 318px;
          }
        }

        @media (max-width: 720px) {
          .selling-catalog {
            padding: 28px 14px 55px;
          }

          .selling-catalog-header {
            margin-bottom: 22px;
          }

          .selling-catalog-title {
            font-size: 42px;
          }

          .selling-catalog-grid {
            grid-template-columns: repeat(2, minmax(0,1fr));
            gap: 12px;
          }

          .selling-card {
            border-radius: 13px;
          }

          .selling-card-image-wrap {
            aspect-ratio: .91;
          }

          .selling-save-button {
            top: 8px;
            left: 8px;
            width: 32px;
            height: 32px;
          }

          .selling-discount {
            top: 8px;
            right: 8px;
            min-height: 27px;
            padding: 0 8px;
            font-size: 7px;
          }

          .selling-sale-tag {
            left: 8px;
            bottom: 8px;
            min-height: 23px;
            padding: 0 9px;
            font-size: 7px;
          }

          .selling-card-content {
            min-height: 270px;
            padding: 11px 10px 11px;
          }

          .selling-card-title-row {
            min-height: 34px;
          }

          .selling-card-name {
            font-size: 16px;
          }

          .selling-card-unit {
            margin-top: 5px;
            font-size: 6px;
            letter-spacing: .9px;
          }

          .selling-option-area {
            min-height: 70px;
            margin-top: 10px;
            padding: 8px 0;
            gap: 7px;
          }

          .selling-option-label {
            font-size: 6px;
            letter-spacing: .8px;
          }

          .selling-option-value {
            font-size: 6px;
          }

          .selling-swatch {
            width: 15px;
            height: 15px;
            flex-basis: 15px;
          }

          .selling-size-button {
            min-width: 24px;
            height: 20px;
            padding: 0 6px;
            font-size: 6px;
          }

          .selling-meter-box {
            min-height: 45px;
            grid-template-columns: 44px minmax(0,1fr);
            gap: 6px;
          }

          .selling-meter-control {
            height: 31px;
            grid-template-columns: 27px minmax(0,1fr) 27px;
            gap: 3px;
            padding: 2px;
          }

          .selling-meter-control button {
            width: 27px;
            height: 26px;
          }

          .selling-meter-value {
            font-size: 8px;
          }

          .selling-meter-range {
            font-size: 5.5px;
          }

          .selling-price-area {
            min-height: 49px;
            padding-top: 8px;
          }

          .selling-final-price {
            font-size: 17px;
          }

          .selling-original-price,
          .selling-price-unit {
            font-size: 7px;
          }

          .selling-message {
            min-height: 13px;
            font-size: 5.7px;
          }

          .selling-actions {
            height: 31px;
            gap: 5px;
            margin-top: 5px;
          }

          .selling-action-button {
            height: 31px;
            gap: 4px;
            padding: 0 5px;
            font-size: 6px;
          }

          .selling-cart-controls {
            height: 31px;
            grid-template-columns: 20px minmax(0,1fr) 20px 22px;
            gap: 1px;
            padding: 2px 3px;
          }

          .selling-qty-button {
            width: 20px;
            height: 20px;
          }

          .selling-remove-button {
            width: 21px;
            height: 21px;
          }

          .selling-qty-number {
            font-size: 6.5px;
          }

          .selling-pagination {
            margin-top: 30px;
          }
        }

        @media (max-width: 380px) {
          .selling-catalog-grid {
            gap: 8px;
          }

          .selling-card-content {
            padding-left: 8px;
            padding-right: 8px;
          }

          .selling-card-name {
            font-size: 14px;
          }

          .selling-final-price {
            font-size: 15px;
          }

          .selling-action-button {
            font-size: 5.7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .selling-card,
          .selling-card-image,
          .selling-card-image-hover,
          .selling-save-button,
          .selling-action-button,
          .selling-swatch {
            transition: none !important;
          }
        }
      `}</style>

      <div className="selling-catalog-inner">
        <header className="selling-catalog-header">
          <div className="selling-catalog-eyebrow">
            {eyebrow ||
              (mode === "meter"
                ? "Materials"
                : "Products")}
          </div>

          <h1 className="selling-catalog-title">
            {title}
          </h1>

          {description ? (
            <p className="selling-catalog-description">
              {description}
            </p>
          ) : null}

          <div className="selling-catalog-count">
            {pagination.total || 0} products
          </div>
        </header>

        {loading ? (
          <div className="selling-state">
            Loading products…
          </div>
        ) : error ? (
          <div className="selling-state">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="selling-state">
            No{" "}
            {mode === "meter"
              ? "materials"
              : "ready-made products"}{" "}
            found.
          </div>
        ) : (
          <>
            <section className="selling-catalog-grid">
              {products.map((product) => {
                const id = getProductId(product);
                const titleText =
                  getProductTitle(product);
                const isMeter = mode === "meter";

                const colors = getColors(product);

                const selectedColor =
                  getSelectedColor(product);

                const selectedSize =
                  getSelectedSize(product);

                const sizes = getSizes(product, selectedColor);

                const selectedVariant =
                  getSelectedVariant(
                    product,
                    selectedColor,
                    selectedSize
                  );

                const pricing =
                  getPrice(
                    product,
                    selectedVariant
                  );

                const images =
                  getAllImages(product, selectedColor);

                const cartItem =
                  getCartItemForProduct(product);

                const cartQuantity = cartItem
                  ? Number(
                      cartItem.quantity ||
                        (isMeter
                          ? getMeterConfig(product).min
                          : 1)
                    )
                  : 0;

                const meterValue =
                  getSelectedMeters(product);

                const meterConfig =
                  getMeterConfig(product);

                const isSaved =
                  isProductSaved(id);

                const currentBusy =
                  busy[id] || "idle";

                const isBuying =
                  buyingId === id;

                const cardMessage =
                  messages[id] || "";

                return (
                  <article
                    key={id || product.slug}
                    className="selling-card"
                  >
                    <div className="selling-card-image-wrap">
                      <Link
                        href={`/products/${product.slug}`}
                        className="selling-card-image-link"
                        aria-label={`View ${titleText}`}
                      >
                        <img
                          className="selling-card-image"
                          src={getImage(product, selectedColor)}
                          alt={
                            product?.mainImage?.alt ||
                            titleText
                          }
                          loading="lazy"
                        />

                        {images[1] ? (
                          <img
                            className="selling-card-image-hover"
                            src={images[1]}
                            alt=""
                            aria-hidden="true"
                            loading="lazy"
                          />
                        ) : null}
                      </Link>

                      <button
                        type="button"
                        className={`selling-save-button ${
                          isSaved ? "is-saved" : ""
                        }`}
                        onClick={() =>
                          toggleSave(id)
                        }
                        aria-label={
                          isSaved
                            ? "Remove from saved"
                            : "Save product"
                        }
                        aria-pressed={isSaved}
                      >
                        <Heart
                          size={18}
                          strokeWidth={2}
                          fill={
                            isSaved
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>

                      {pricing.discount > 0 ? (
                        <span className="selling-discount">
                          {pricing.discount}% OFF
                        </span>
                      ) : null}

                      {pricing.isSale ? (
                        <span className="selling-sale-tag">
                          Sale
                        </span>
                      ) : null}
                    </div>

                    <div className="selling-card-content">
                      <div className="selling-card-title-row">
                        <Link
                          href={`/products/${product.slug}`}
                          style={{
                            minWidth: 0,
                            textDecoration: "none",
                          }}
                        >
                          <h2 className="selling-card-name">
                            {titleText}
                          </h2>
                        </Link>
                      </div>

                      <div className="selling-card-unit">
                        {isMeter
                          ? "Price per Meter"
                          : "Price per Piece"}
                      </div>

                      <div className="selling-option-area">
                        {colors.length > 0 ? (
                          <div className="selling-option-row">
                            <span className="selling-option-label">
                              COLOR
                            </span>

                            <div
                              style={{
                                minWidth: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 10,
                              }}
                            >
                              <div className="selling-swatches">
                                {colors
                                  .slice(0, 7)
                                  .map(
                                    (color, index) => {
                                      const active =
                                        optionMatches(
                                          selectedColor,
                                          color
                                        );

                                      const background =
                                        color?.hex ||
                                        color?.colorCode ||
                                        color?.value ||
                                        "#D9D9D9";

                                      return (
                                        <button
                                          key={`${id}-color-${index}`}
                                          type="button"
                                          className={`selling-swatch ${
                                            active
                                              ? "is-selected"
                                              : ""
                                          }`}
                                          style={{
                                            backgroundColor:
                                              background,
                                          }}
                                          onClick={() =>
                                            handleColorSelect(
                                              product,
                                              color
                                            )
                                          }
                                          title={
                                            optionName(
                                              color
                                            )
                                          }
                                          aria-label={`Select ${optionName(
                                            color
                                          )}`}
                                          aria-pressed={
                                            active
                                          }
                                        >
                                          {active ? (
                                            <span className="selling-swatch-check">
                                              <Check
                                                size={11}
                                                strokeWidth={
                                                  3
                                                }
                                              />
                                            </span>
                                          ) : null}
                                        </button>
                                      );
                                    }
                                  )}
                              </div>

                              <span className="selling-option-value">
                                {optionName(
                                  selectedColor
                                ) || "Select"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="selling-option-row">
                            <span className="selling-option-label">
                              TYPE
                            </span>
                            <span className="selling-option-value">
                              {isMeter
                                ? "Raw Fabric"
                                : "Ready-made"}
                            </span>
                          </div>
                        )}

                        {isMeter ? (
                          <div className="selling-meter-box">
                            <span className="selling-option-label">
                              METER
                            </span>

                            <div>
                              <div className="selling-meter-control">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMeterQuantity(
                                      product,
                                      meterValue -
                                        meterConfig.step
                                    )
                                  }
                                  disabled={
                                    meterValue <=
                                    meterConfig.min
                                  }
                                  aria-label="Decrease meters"
                                >
                                  <Minus size={13} />
                                </button>

                                <span className="selling-meter-value">
                                  {formatMeters(
                                    meterValue
                                  )}{" "}
                                  m
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setMeterQuantity(
                                      product,
                                      meterValue +
                                        meterConfig.step
                                    )
                                  }
                                  disabled={
                                    meterValue >=
                                    meterConfig.max
                                  }
                                  aria-label="Increase meters"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <div className="selling-meter-range">
                                {formatMeters(
                                  meterConfig.min
                                )}
                                –
                                {formatMeters(
                                  meterConfig.max
                                )}{" "}
                                m · step{" "}
                                {formatMeters(
                                  meterConfig.step
                                )}{" "}
                                m
                              </div>
                            </div>
                          </div>
                        ) : sizes.length > 0 ? (
                          <div className="selling-option-row">
                            <span className="selling-option-label">
                              SIZE
                            </span>

                            <div className="selling-size-list">
                              {sizes
                                .slice(0, 7)
                                .map(
                                  (size, index) => {
                                    const active =
                                      optionMatches(
                                        selectedSize,
                                        size
                                      );

                                    return (
                                      <button
                                        key={`${id}-size-${index}`}
                                        type="button"
                                        className={`selling-size-button ${
                                          active
                                            ? "is-selected"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          handleSizeSelect(
                                            product,
                                            size
                                          )
                                        }
                                        aria-pressed={
                                          active
                                        }
                                      >
                                        {optionName(
                                          size
                                        )}
                                      </button>
                                    );
                                  }
                                )}
                            </div>
                          </div>
                        ) : null}
                      </div>

                      <div className="selling-price-area">
                        <div className="selling-price-line">
                          <span className="selling-final-price">
                            <StorefrontPrice amount={Number(pricing.final || 0)} />
                          </span>

                          {pricing.isSale ? (
                            <span className="selling-original-price">
                              <StorefrontPrice amount={Number(pricing.regular)} />
                            </span>
                          ) : null}

                          <span className="selling-price-unit">
                            /{" "}
                            {isMeter
                              ? "Meter"
                              : "Piece"}
                          </span>
                        </div>

                        <div className="selling-message">
                          {cardMessage}
                        </div>

                        <div className="selling-actions">
                          <button
                            type="button"
                            className="selling-action-button selling-buy-button"
                            onClick={() =>
                              handleBuyNow(
                                product
                              )
                            }
                            disabled={
                              isBuying ||
                              currentBusy ===
                                "adding" ||
                              currentBusy ===
                                "updating" ||
                              currentBusy ===
                                "removing"
                            }
                          >
                            {isBuying ? (
                              <>
                                <Zap size={13} />
                                Opening…
                              </>
                            ) : (
                              <>
                                <Zap size={13} />
                                Buy Now
                              </>
                            )}
                          </button>

                          {cartItem ? (
                            <div className="selling-cart-controls">
                              <button
                                type="button"
                                className="selling-qty-button"
                                onClick={() =>
                                  handleDecrease(
                                    product
                                  )
                                }
                                disabled={
                                  currentBusy !==
                                    "idle" ||
                                  cartQuantity <=
                                    (isMeter
                                      ? meterConfig.min
                                      : 1)
                                }
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>

                              <span className="selling-qty-number">
                                {isMeter
                                  ? `${formatMeters(
                                      cartQuantity
                                    )} m`
                                  : cartQuantity}
                              </span>

                              <button
                                type="button"
                                className="selling-qty-button"
                                onClick={() =>
                                  handleIncrease(
                                    product
                                  )
                                }
                                disabled={
                                  currentBusy !==
                                  "idle"
                                }
                                aria-label="Increase quantity"
                              >
                                <Plus size={12} />
                              </button>

                              <button
                                type="button"
                                className="selling-remove-button"
                                onClick={() =>
                                  handleRemove(
                                    product
                                  )
                                }
                                disabled={
                                  currentBusy !==
                                  "idle"
                                }
                                aria-label="Remove from cart"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="selling-action-button selling-cart-button"
                              onClick={() =>
                                handleAddToCart(
                                  product
                                )
                              }
                              disabled={
                                currentBusy !==
                                "idle"
                              }
                            >
                              {currentBusy ===
                              "adding" ? (
                                <>
                                  <ShoppingCart
                                    size={13}
                                  />
                                  Adding…
                                </>
                              ) : currentBusy ===
                                "added" ? (
                                <>
                                  <Check
                                    size={13}
                                  />
                                  Added
                                </>
                              ) : (
                                <>
                                  <ShoppingCart
                                    size={13}
                                  />
                                  Add to Cart
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {Number(
              pagination.totalPages || 1
            ) > 1 ? (
              <nav
                className="selling-pagination"
                aria-label="Product pagination"
              >
                <button
                  type="button"
                  className="selling-page-button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                >
                  <ChevronLeft size={14} />
                </button>

                {pages.map((number) => (
                  <button
                    key={number}
                    type="button"
                    className={`selling-page-button ${
                      number === page
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      setPage(number)
                    }
                  >
                    {number}
                  </button>
                ))}

                <button
                  type="button"
                  className="selling-page-button"
                  disabled={
                    page >=
                    Number(
                      pagination.totalPages || 1
                    )
                  }
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        Number(
                          pagination.totalPages || 1
                        ),
                        current + 1
                      )
                    )
                  }
                >
                  <ChevronRight size={14} />
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
