"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Check,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Poppins, Cormorant_Garamond } from "next/font/google";
import { useCart } from "@/context/CartContext";

/* =========================================================
   FONTS
========================================================= */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

/* =========================================================
   CONFIG
========================================================= */
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

const COLORS = {
  teal: "#295C65",
  tealDark: "#214D55",
  cream: "#FAF8F5",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  border: "#EAE3DA",
  text: "#1B1B1B",
};

const FALLBACK_IMAGE = "/images/home/products/1.png";
const EMPTY_LIST = [];

/* =========================================================
   FALLBACK HOME PRODUCTS
   Used only when backend request fails.
========================================================= */
const FALLBACK_PRODUCTS = [
  {
    id: "p1",
    title: "Premium Cotton Cambric",
    price: "₹180",
    image: "/images/home/products/1.png",
    hoverImage: "/images/home/products/2.png",
    colors: ["#F1EDE4", "#295C65", "#BE9D6B", "#C97A3D", "#1B1B1B"],
  },
  {
    id: "p2",
    title: "Ajrakh Block Print",
    price: "₹320",
    image: "/images/home/products/3.png",
    hoverImage: "/images/home/products/4.png",
    colors: ["#2D3142", "#8A4B32", "#C6A15B", "#F1EDE4", "#295C65"],
  },
  {
    id: "p3",
    title: "Premium Linen",
    price: "₹450",
    image: "/images/home/products/5.png",
    hoverImage: "/images/home/products/6.png",
    colors: ["#F1EDE4", "#8A6A4B", "#4A4A4A", "#BE9D6B", "#FFFFFF"],
  },
  {
    id: "p4",
    title: "Rayon Voile",
    price: "₹210",
    image: "/images/home/products/7.png",
    hoverImage: "/images/home/products/8.png",
    colors: ["#E4D3B0", "#295C65", "#1B1B1B", "#C97A3D", "#F1EDE4"],
  },
  {
    id: "p5",
    title: "Mulmul Cotton",
    price: "₹150",
    image: "/images/home/products/9.png",
    hoverImage: "/images/home/products/10.png",
    colors: [],
  },
  {
    id: "p6",
    title: "Classic Muslin",
    price: "₹165",
    image: "/images/home/products/11.png",
    hoverImage: "/images/home/products/12.png",
    colors: ["#F1EDE4", "#295C65", "#BE9D6B"],
  },
];

/* =========================================================
   HELPERS
========================================================= */
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

function extractProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  return [];
}

function getOptionName(value = "") {
  if (value && typeof value === "object") {
    return String(
      value?.name || value?.label || value?.value || value?.hex || ""
    ).trim();
  }
  return String(value || "").trim();
}

function getOptionValue(value = "") {
  if (value && typeof value === "object") {
    return String(
      value?.value || value?.name || value?.label || value?.hex || ""
    ).trim();
  }
  return String(value || "").trim();
}

function getOptionHex(value = "") {
  if (value && typeof value === "object") {
    return String(value?.hex || value?.value || "").trim();
  }
  return String(value || "").trim();
}

function optionMatches(a, b) {
  const left = [getOptionName(a), getOptionValue(a), getOptionHex(a)]
    .map((value) => String(value).toLowerCase())
    .filter(Boolean);

  const right = [getOptionName(b), getOptionValue(b), getOptionHex(b)]
    .map((value) => String(value).toLowerCase())
    .filter(Boolean);

  return left.some((value) => right.includes(value));
}

function firstSizeValue(sizes) {
  return sizes?.[0]?.value || sizes?.[0]?.name || "";
}

function toNumber(value) {
  return Number(String(value ?? "0").replace(/[^\d.]/g, "")) || 0;
}

/* =========================================================
   NORMALIZE BACKEND PRODUCT
========================================================= */
function normalizeBackendProduct(item) {
  if (!item) return null;

  const regularPrice =
    Number(item?.pricing?.regularPrice ?? item?.regularPrice ?? item?.price ?? 0) || 0;

  const salePrice =
    Number(item?.pricing?.salePrice ?? item?.salePrice ?? 0) || 0;

  const mainImage =
    imageValue(item?.mainImage) ||
    imageValue(item?.image) ||
    imageValue(item?.imageUrl);

  const gallery = Array.isArray(item?.gallery) ? item.gallery : [];
  const imageArray = Array.isArray(item?.images) ? item.images : [];

  const uniqueImages = [
    ...new Set(
      [mainImage, ...imageArray.map(imageValue), ...gallery.map(imageValue)].filter(Boolean)
    ),
  ];

  const rawVariants = Array.isArray(item?.variants) ? item.variants : [];

  const colorSource =
    Array.isArray(item?.options?.colors) && item.options.colors.length > 0
      ? item.options.colors
      : rawVariants.map((variant) => variant?.color).filter(Boolean);

  const colorOptions = Array.from(
    new Map(
      colorSource.map((color, index) => {
        const name = getOptionName(color) || `Color ${index + 1}`;
        const value = getOptionValue(color) || name;
        const hex = getOptionHex(color) || "#D9D1C7";

        return [
          `${name.toLowerCase()}|${value.toLowerCase()}|${hex.toLowerCase()}`,
          { index, name, value, hex },
        ];
      })
    ).values()
  );

  const variants = rawVariants
    .map((variant) => ({
      id: variant?._id || variant?.id || "",
      color: variant?.color || "",
      colorName: variant?.colorName || getOptionName(variant?.color),
      colorValue: variant?.colorValue || getOptionValue(variant?.color),
      colorHex: variant?.colorHex || getOptionHex(variant?.color),
      size: variant?.size || "",
      sizeName: variant?.sizeName || getOptionName(variant?.size),
      sizeValue: variant?.sizeValue || getOptionValue(variant?.size),
      regularPrice: Number(variant?.regularPrice ?? 0) || 0,
      salePrice: Number(variant?.salePrice ?? 0) || 0,
      sku: variant?.sku || "",
      stock: Number(variant?.stock ?? 0) || 0,
      active: variant?.active !== false,
      images: Array.isArray(variant?.images)
        ? variant.images.map(imageValue).filter(Boolean)
        : [],
    }))
    .filter((variant) => variant.active);

  const rawSizes = [
    ...(Array.isArray(item?.options?.sizes) ? item.options.sizes : []),
    ...variants.map((variant) => variant?.size).filter(Boolean),
  ];

  const sizeOptions = Array.from(
    new Map(
      rawSizes.map((size, index) => {
        const name = getOptionName(size) || `Size ${index + 1}`;
        const value = getOptionValue(size) || name;

        return [value.toLowerCase(), { index, name, value }];
      })
    ).values()
  );

  const hasSale = salePrice > 0 && salePrice < regularPrice;

  return {
    id: item?._id || item?.id || item?.slug || item?.sku || slugify(item?.title || ""),
    title: item?.title || item?.name || item?.productName || "Untitled Product",
    slug: item?.slug || slugify(item?.title || ""),
    sku: item?.sku || "—",
    regularPrice,
    salePrice,
    hasSale,
    price: `₹${(hasSale ? salePrice : regularPrice).toLocaleString("en-IN")}`,
    image: uniqueImages[0] || FALLBACK_IMAGE,
    hoverImage: uniqueImages[1] || uniqueImages[0] || FALLBACK_IMAGE,
    colorOptions,
    colors: colorOptions.map((color) => color.hex),
    sizeOptions,
    variants,
    variantsEnabled: Boolean(item?.variantsEnabled || variants.length > 0),
  };
}

/* =========================================================
   SKELETON CARD
========================================================= */
function ProductSkeleton() {
  return (
    <article className="pc-card pc-skeleton-card" aria-hidden="true">
      <div className="pc-image-wrap">
        <div className="pc-sk pc-sk-image" />
      </div>

      <div className="pc-body">
        <div className="pc-sk pc-sk-title" />
        <div className="pc-sk pc-sk-price" />
        <div className="pc-sk pc-sk-line" />
        <div className="pc-sk pc-sk-line short" />
        <div className="pc-sk-actions">
          <div className="pc-sk pc-sk-btn" />
          <div className="pc-sk pc-sk-btn" />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */
function ProductCard({ product }) {
  const router = useRouter();

  const { addToCart, items: cartItems = [], updateQuantity, removeItem } =
    useCart();

  const [activeColor, setActiveColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    firstSizeValue(product?.sizeOptions)
  );
  const [mobileHover, setMobileHover] = useState(false);
  const [cartState, setCartState] = useState("idle"); // idle | loading | added | updating | removing
  const [message, setMessage] = useState("");
  const messageTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (messageTimer.current) window.clearTimeout(messageTimer.current);
    };
  }, []);

  const flashMessage = (text) => {
    setMessage(text);

    if (messageTimer.current) window.clearTimeout(messageTimer.current);

    messageTimer.current = window.setTimeout(() => setMessage(""), 2600);
  };

  /* ---------- colour options ---------- */
  const productColorOptions = useMemo(() => {
    if (Array.isArray(product?.colorOptions) && product.colorOptions.length > 0) {
      return product.colorOptions;
    }

    if (Array.isArray(product?.colors)) {
      return product.colors.map((color, index) => ({
        index,
        name: String(color),
        value: String(color),
        hex: String(color),
      }));
    }

    return EMPTY_LIST;
  }, [product]);

  const selectedColorOption =
    productColorOptions[activeColor] || productColorOptions[0] || null;

  const selectedColor =
    selectedColorOption?.name || selectedColorOption?.value || "";

  /* ---------- sizes valid for the chosen colour ---------- */
  const availableSizes = useMemo(() => {
    if (!Array.isArray(product?.sizeOptions)) return EMPTY_LIST;

    if (
      !product?.variantsEnabled ||
      !Array.isArray(product?.variants) ||
      product.variants.length === 0
    ) {
      return product.sizeOptions;
    }

    const filtered = product.sizeOptions.filter((size) =>
      product.variants.some((variant) => {
        const colorMatches = selectedColor
          ? optionMatches(
              {
                name: variant?.colorName,
                value: variant?.colorValue,
                hex: variant?.colorHex,
              },
              selectedColorOption
            )
          : true;

        const sizeMatches = optionMatches(
          { name: variant?.sizeName, value: variant?.sizeValue },
          size
        );

        return colorMatches && sizeMatches;
      })
    );

    return filtered.length > 0 ? filtered : product.sizeOptions;
  }, [product, selectedColor, selectedColorOption]);

  useEffect(() => {
    const firstSize = firstSizeValue(availableSizes);

    if (!firstSize) {
      setSelectedSize("");
      return;
    }

    const stillValid = availableSizes.some(
      (size) =>
        String(size?.value || size?.name || "").toLowerCase() ===
        String(selectedSize).toLowerCase()
    );

    if (!stillValid) setSelectedSize(firstSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeColor, availableSizes]);

  useEffect(() => {
    setActiveColor(0);
    setSelectedSize(firstSizeValue(product?.sizeOptions));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  /* ---------- selected variant ---------- */
  const selectedVariant = useMemo(() => {
    if (
      !product?.variantsEnabled ||
      !Array.isArray(product?.variants) ||
      product.variants.length === 0
    ) {
      return null;
    }

    return (
      product.variants.find((variant) => {
        const colorMatches = selectedColor
          ? optionMatches(
              {
                name: variant?.colorName,
                value: variant?.colorValue,
                hex: variant?.colorHex,
              },
              selectedColorOption
            )
          : true;

        const sizeMatches = selectedSize
          ? optionMatches(
              { name: variant?.sizeName, value: variant?.sizeValue },
              selectedSize
            )
          : true;

        return colorMatches && sizeMatches;
      }) || null
    );
  }, [product, selectedColor, selectedSize, selectedColorOption]);

  /* ---------- pricing ---------- */
  const regularPrice =
    Number(
      selectedVariant?.regularPrice ||
        product?.regularPrice ||
        toNumber(product?.price)
    ) || 0;

  const salePrice =
    Number(selectedVariant?.salePrice || product?.salePrice || 0) || 0;

  const hasSale = salePrice > 0 && salePrice < regularPrice;
  const finalPrice = hasSale ? salePrice : regularPrice;

  const discountPercent = hasSale
    ? Math.max(1, Math.round(((regularPrice - salePrice) / regularPrice) * 100))
    : 0;

  const selectedSku = selectedVariant?.sku || product?.sku || "";
  const showSku = Boolean(selectedSku) && selectedSku !== "—";

  /* ---------- images ---------- */
  const displayImage =
    selectedVariant?.images?.[0] || product?.image || FALLBACK_IMAGE;

  const displayHoverImage =
    selectedVariant?.images?.[1] || product?.hoverImage || displayImage;

  const hasSecondImage = Boolean(
    displayHoverImage && displayHoverImage !== displayImage
  );

  /* ---------- cart item (live from backend cart) ---------- */
  const cartItem = useMemo(() => {
    if (!Array.isArray(cartItems)) return null;

    const productId = String(product.id);

    return (
      cartItems.find((item) => {
        if (String(item?.productId || "") !== productId) return false;

        const itemVariantId = String(item?.variantId || "");

        if (selectedVariant?.id && itemVariantId) {
          return itemVariantId === String(selectedVariant.id);
        }

        const wantsColor = Boolean(selectedColorOption);
        const wantsSize = Boolean(selectedSize);

        if (wantsColor || wantsSize) {
          const colorOk = wantsColor
            ? optionMatches(item?.selectedColor, selectedColorOption)
            : !getOptionName(item?.selectedColor);

          const sizeOk = wantsSize
            ? optionMatches(item?.selectedSize, selectedSize)
            : !getOptionName(item?.selectedSize);

          return colorOk && sizeOk;
        }

        return (
          !itemVariantId &&
          !getOptionName(item?.selectedColor) &&
          !getOptionName(item?.selectedSize)
        );
      }) || null
    );
  }, [cartItems, product.id, selectedVariant, selectedColorOption, selectedSize]);

  const inCart = Boolean(cartItem);
  const quantity = Math.max(1, Number(cartItem?.quantity) || 1);
  const busy =
    cartState === "loading" ||
    cartState === "updating" ||
    cartState === "removing";

  /* ---------- handlers ---------- */
  const handleColorChange = (colorIndex) => {
    setActiveColor(colorIndex);

    const color = productColorOptions[colorIndex] || null;

    const firstSize =
      product?.variantsEnabled &&
      Array.isArray(product?.variants) &&
      product.variants.length > 0
        ? product?.sizeOptions?.find((size) =>
            product.variants.some(
              (variant) =>
                optionMatches(
                  {
                    name: variant?.colorName,
                    value: variant?.colorValue,
                    hex: variant?.colorHex,
                  },
                  color
                ) &&
                optionMatches(
                  { name: variant?.sizeName, value: variant?.sizeValue },
                  size
                )
            )
          )
        : product?.sizeOptions?.[0];

    setSelectedSize(firstSize?.value || firstSize?.name || "");
  };

  const handleAddToCart = async () => {
    if (busy) return;

    if (
      product?.variantsEnabled &&
      product?.variants?.length > 0 &&
      !selectedVariant
    ) {
      flashMessage("Please select a valid colour and size");
      return;
    }

    if (selectedVariant && Number(selectedVariant.stock) <= 0) {
      flashMessage("Selected variant is out of stock");
      return;
    }

    setCartState("loading");

    try {
      const result = await addToCart(String(product.id), 1, {
        selectedColor: selectedColor || "",
        selectedSize: selectedSize || "",
        variantId: selectedVariant?.id || "",
      });

      if (result?.loginRequired) {
        setCartState("idle");
        flashMessage("Please login to add this product");
        return;
      }

      if (result?.success === false) {
        setCartState("idle");
        flashMessage(result?.message || "Failed to add to cart");
        return;
      }

      setCartState("added");

      window.setTimeout(() => setCartState("idle"), 850);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      setCartState("idle");
      flashMessage("Failed to add to cart");
    }
  };

  const handleChangeQuantity = async (direction) => {
    if (busy || !cartItem) return;

    if (direction === "decrease" && quantity <= 1) return;

    const nextQty = direction === "increase" ? quantity + 1 : quantity - 1;

    setCartState("updating");

    try {
      await updateQuantity(cartItem._id, nextQty);
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      flashMessage("Failed to update quantity");
    } finally {
      setCartState("idle");
    }
  };

  /* Cart se permanently remove (backend cart data se delete) */
  const handleRemove = async () => {
    if (busy || !cartItem) return;

    setCartState("removing");

    try {
      await removeItem(cartItem._id);
    } catch (error) {
      console.error("Failed to remove cart item:", error);
      flashMessage("Failed to remove item");
    } finally {
      window.setTimeout(() => setCartState("idle"), 320);
    }
  };

  const handleRequestQuote = () => {
    router.push("/contact");
  };

  return (
    <article className="pc-card">
      {/* ======================= IMAGE ======================= */}
      <div
        className="pc-image-wrap"
        onTouchStart={() => {
          if (hasSecondImage) setMobileHover((current) => !current);
        }}
      >
        <img
          src={displayImage}
          alt={product?.title || "Product"}
          loading="lazy"
          draggable="false"
          className="pc-product-image pc-product-image-primary"
          style={{ opacity: mobileHover ? 0 : undefined }}
        />

        {hasSecondImage ? (
          <img
            src={displayHoverImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            draggable="false"
            className="pc-product-image pc-product-image-hover"
            style={{ opacity: mobileHover ? 1 : undefined }}
          />
        ) : null}

        {/* Discount: sirf image par */}
        {hasSale ? (
          <span className="pc-off-badge">{discountPercent}% OFF</span>
        ) : null}
      </div>

      {/* ======================= BODY ======================= */}
      <div className="pc-body">
        <h3 className="pc-title">{product?.title}</h3>

        {/* Price: card section mein */}
        <div className="pc-price-row">
          <span className="pc-price-new">
            ₹{finalPrice.toLocaleString("en-IN")}
          </span>

          {hasSale ? (
            <span className="pc-price-old">
              ₹{regularPrice.toLocaleString("en-IN")}
            </span>
          ) : null}
        </div>

        {showSku ? <div className="pc-sku">SKU: {selectedSku}</div> : null}

        {productColorOptions.length > 0 ||
        (Array.isArray(product?.sizeOptions) && product.sizeOptions.length > 0) ? (
          <div className="pc-options">
            {productColorOptions.length > 0 ? (
              <div className="pc-option-row">
                <span className="pc-option-label">Color</span>

                <div className="pc-swatches">
                  {productColorOptions.map((color, index) => {
                    const active = activeColor === index;

                    return (
                      <button
                        key={`${product.id}-color-${index}`}
                        type="button"
                        className={`pc-color-dot ${active ? "is-active" : ""}`}
                        style={{
                          background: color?.hex || color?.value || "#D9D1C7",
                        }}
                        onClick={() => handleColorChange(index)}
                        aria-label={`Select ${color?.name || "color"}`}
                        aria-pressed={active}
                        title={color?.name || color?.value || "Color"}
                      />
                    );
                  })}
                </div>

                <span className="pc-selected-value">
                  {selectedColor || "Select"}
                </span>
              </div>
            ) : null}

            {Array.isArray(product?.sizeOptions) &&
            product.sizeOptions.length > 0 ? (
              <div className="pc-option-row">
                <span className="pc-option-label">Size</span>

                <div className="pc-sizes">
                  {availableSizes.map((size) => {
                    const sizeValue = size?.value || size?.name || "";
                    const active =
                      String(selectedSize).toLowerCase() ===
                      String(sizeValue).toLowerCase();

                    return (
                      <button
                        key={`${product.id}-size-${sizeValue}`}
                        type="button"
                        className={`pc-size-btn ${active ? "is-active" : ""}`}
                        onClick={() => setSelectedSize(sizeValue)}
                        aria-pressed={active}
                      >
                        {size?.name || sizeValue}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ======================= ACTIONS ======================= */}
        <div className="pc-foot">
          {message ? <div className="pc-msg">{message}</div> : null}

          <div className="pc-actions">
            {inCart ? (
              <div className="pc-qty" aria-label={`Cart quantity for ${product?.title}`}>
                {cartState === "updating" ? (
                  <span className="pc-qty-status">
                    <ShoppingCart size={13} strokeWidth={2} />
                    Updating
                  </span>
                ) : cartState === "removing" ? (
                  <span className="pc-qty-status">
                    <Trash2 size={13} strokeWidth={2} />
                    Removing
                  </span>
                ) : cartState === "added" ? (
                  <span className="pc-qty-status">
                    <Check size={13} strokeWidth={2.5} />
                    Added
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      className="pc-qty-btn"
                      onClick={() => handleChangeQuantity("decrease")}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span className="pc-qty-num">{quantity}</span>

                    <button
                      type="button"
                      className="pc-qty-btn"
                      onClick={() => handleChangeQuantity("increase")}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                    <button
                      type="button"
                      className="pc-qty-remove"
                      onClick={handleRemove}
                      aria-label={`Remove ${product?.title} from cart`}
                      title="Remove from cart"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="pc-btn pc-cart-btn"
                onClick={handleAddToCart}
                disabled={cartState === "loading"}
                aria-label={`Add ${product?.title} to cart`}
              >
                <ShoppingCart size={14} strokeWidth={2} />
                <span>{cartState === "loading" ? "Adding..." : "Add to Cart"}</span>
              </button>
            )}

            <button
              type="button"
              className="pc-btn pc-quote-btn"
              onClick={handleRequestQuote}
            >
              Request Quote
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   FEATURED / HOME PRODUCTS
========================================================= */
export default function FeaturedProducts() {
  const scrollRef = useRef(null);
  const { loadCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendFailed, setBackendFailed] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* =======================================================
     KEEP CART IN SYNC WITH BACKEND
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

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshCart();
    };

    const eventNames = [
      "bf:cart-updated",
      "bf:order-completed",
      "bf:payment-success",
      "cart-updated",
      "order-completed",
      "payment-success",
      "order-placed",
    ];

    refreshCart();

    eventNames.forEach((name) => window.addEventListener(name, refreshCart));
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      eventNames.forEach((name) => window.removeEventListener(name, refreshCart));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadCart]);

  /* =======================================================
     FETCH HOME PRODUCTS (showOnHome === true)
  ======================================================= */
  useEffect(() => {
    const controller = new AbortController();

    async function loadHomeProducts() {
      setLoading(true);
      setBackendFailed(false);

      try {
        const response = await fetch(`${API_URL}/products?limit=1000`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        let payload = {};

        try {
          payload = await response.json();
        } catch {
          payload = {};
        }

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load home products");
        }

        const homeProducts = extractProducts(payload)
          .filter((product) => product?.status === "published" || !product?.status)
          .filter((product) => product?.showOnHome === true)
          .map(normalizeBackendProduct)
          .filter(Boolean);

        if (homeProducts.length === 0) {
          setProducts(FALLBACK_PRODUCTS);
          setBackendFailed(true);
          return;
        }

        setProducts(homeProducts);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Home Products API Error:", error);

        setProducts(FALLBACK_PRODUCTS);
        setBackendFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadHomeProducts();

    return () => controller.abort();
  }, []);

  /* =======================================================
     SLIDER STATE
  ======================================================= */
  const updateScrollState = () => {
    const element = scrollRef.current;

    if (!element) return;

    const maxScroll = element.scrollWidth - element.clientWidth;

    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(element.scrollLeft < maxScroll - 4);
  };

  useEffect(() => {
    const element = scrollRef.current;

    if (!element) return;

    updateScrollState();

    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products.length, loading]);

  const scrollSlider = (direction) => {
    const element = scrollRef.current;

    if (!element) return;

    const firstCard = element.querySelector(".pc-card");

    if (!firstCard) return;

    const gap =
      parseFloat(getComputedStyle(element).columnGap || "24") || 24;

    element.scrollBy({
      left: (firstCard.getBoundingClientRect().width + gap) * direction,
      behavior: "smooth",
    });
  };

  const displayProducts = useMemo(
    () => (Array.isArray(products) ? products : []),
    [products]
  );

  /* =======================================================
     RENDER
  ======================================================= */
  return (
    <section
      className={`${poppins.variable} ${cormorant.variable}`}
      style={styles.section}
    >
      <div className="pc-container" style={styles.container}>
        <div style={styles.eyebrow}>
          <span style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>Wholesale Catalogue</span>
        </div>

        <h2 className="pc-heading" style={styles.heading}>
          Featured Wholesale Fabrics
        </h2>

        <p className="pc-subtext" style={styles.subtext}>
          Request a quote for bulk orders. No retail. No readymade. Only
          premium fabric yardage.
        </p>

        <div className="pc-slider-shell">
          {canScrollLeft && (
            <button
              type="button"
              className="pc-slider-arrow pc-slider-arrow-left"
              onClick={() => scrollSlider(-1)}
              aria-label="Previous products"
            >
              <ChevronLeft size={19} />
            </button>
          )}

          <div ref={scrollRef} className="pc-scroll">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : displayProducts.length > 0 ? (
              displayProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="pc-empty">No home products available.</div>
            )}
          </div>

          {canScrollRight && (
            <button
              type="button"
              className="pc-slider-arrow pc-slider-arrow-right"
              onClick={() => scrollSlider(1)}
              aria-label="Next products"
            >
              <ChevronRight size={19} />
            </button>
          )}
        </div>

        {backendFailed && !loading && (
          <p style={styles.fallbackNote}>
            Live products could not be loaded. Showing catalogue fallback.
          </p>
        )}
      </div>

      <style>{`
        /* =====================================================
           SLIDER
        ===================================================== */
        .pc-slider-shell { position: relative; width: 100%; }

        .pc-scroll {
          display: flex;
          gap: 24px;
          width: 100%;
          padding: 10px 2px 18px;
          box-sizing: border-box;
          text-align: left;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-x: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .pc-scroll::-webkit-scrollbar { display: none; }

        .pc-slider-arrow {
          position: absolute;
          top: 50%;
          z-index: 20;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 1px solid rgba(41, 92, 101, .15);
          border-radius: 50%;
          background: rgba(255, 255, 255, .96);
          color: ${COLORS.teal};
          cursor: pointer;
          box-shadow: 0 5px 18px rgba(0, 0, 0, .1);
          transform: translateY(-50%);
          transition: transform .25s ease, background-color .25s ease, color .25s ease;
        }
        .pc-slider-arrow-left { left: -19px; }
        .pc-slider-arrow-right { right: -19px; }
        .pc-slider-arrow:hover {
          background: ${COLORS.teal};
          color: #fff;
          transform: translateY(-50%) scale(1.06);
        }

        .pc-empty {
          min-height: 300px;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${COLORS.navGray};
          font-family: var(--font-poppins), Arial, sans-serif;
          font-size: 13px;
        }

        /* =====================================================
           CARD
        ===================================================== */
        .pc-card {
          position: relative;
          flex: 0 0 300px;
          width: 300px;
          min-width: 300px;
          max-width: 300px;
          display: flex;
          flex-direction: column;
          scroll-snap-align: start;
          background: #fff;
          border: 1px solid ${COLORS.border};
          border-radius: 16px;
          overflow: hidden;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(0, 0, 0, .05);
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
        }

        @media (hover: hover) and (pointer: fine) {
          .pc-card:hover {
            transform: translateY(-5px);
            border-color: #D8CBB8;
            box-shadow: 0 16px 34px rgba(41, 92, 101, .12);
          }
          .pc-card:hover .pc-product-image-hover { opacity: 1; }
          .pc-card:hover .pc-product-image-primary { opacity: 0; }
        }

        /* ---------- image: pura dikhe (contain) ---------- */
        .pc-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 1 / .92;
          flex-shrink: 0;
          overflow: hidden;
          isolation: isolate;
          background: #F6F2EC;
          border-bottom: 1px solid #F0EAE2;
        }
        .pc-product-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          object-position: center;
          background: #F6F2EC;
          transition: opacity .35s ease;
        }
        .pc-product-image-primary { opacity: 1; z-index: 1; }
        .pc-product-image-hover { opacity: 0; z-index: 2; }

        .pc-off-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 5;
          padding: 7px 12px;
          border-radius: 999px;
          background: ${COLORS.gold};
          color: #fff;
          font: 600 11px/1 var(--font-poppins), Arial, sans-serif;
          letter-spacing: .3px;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, .14);
        }

        /* ---------- body ---------- */
        .pc-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 16px;
          box-sizing: border-box;
        }

        .pc-title {
          margin: 0;
          min-height: 2.3em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: ${COLORS.text};
          font-family: var(--font-cormorant), Georgia, serif;
          font-weight: 600;
          font-size: 21px;
          line-height: 1.15;
        }

        .pc-price-row {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 2px 9px;
          margin-top: 8px;
        }
        .pc-price-new {
          color: ${COLORS.teal};
          font-family: var(--font-cormorant), Georgia, serif;
          font-weight: 700;
          font-size: 26px;
          line-height: 1;
        }
        .pc-price-old {
          color: #9A9A9A;
          font: 500 12px/1 var(--font-poppins), Arial, sans-serif;
          text-decoration: line-through;
        }

        .pc-sku {
          margin-top: 6px;
          color: #8A8A87;
          font: 500 10.5px/1.3 var(--font-poppins), Arial, sans-serif;
          letter-spacing: .2px;
        }

        /* ---------- options ---------- */
        .pc-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid #F0EAE2;
        }
        .pc-option-row {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 28px;
        }
        .pc-option-label {
          width: 38px;
          flex-shrink: 0;
          color: ${COLORS.gold};
          font: 600 9px/1 var(--font-poppins), Arial, sans-serif;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }
        .pc-swatches,
        .pc-sizes {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          min-width: 0;
        }
        .pc-selected-value {
          margin-left: auto;
          max-width: 34%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #8A8A87;
          font: 500 10px/1 var(--font-poppins), Arial, sans-serif;
        }
        .pc-color-dot {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          padding: 0;
          border: 1px solid rgba(0, 0, 0, .15);
          border-radius: 50%;
          box-sizing: border-box;
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .pc-color-dot:hover { transform: scale(1.1); }
        .pc-color-dot.is-active {
          box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px ${COLORS.teal};
          transform: scale(1.05);
        }
        .pc-size-btn {
          min-width: 36px;
          height: 28px;
          padding: 0 10px;
          border: 1px solid #DCD4CB;
          border-radius: 7px;
          background: #fff;
          color: ${COLORS.teal};
          font: 600 10.5px/1 var(--font-poppins), Arial, sans-serif;
          cursor: pointer;
          transition: background-color .2s ease, color .2s ease, border-color .2s ease;
        }
        .pc-size-btn:hover { border-color: ${COLORS.teal}; }
        .pc-size-btn.is-active {
          background: ${COLORS.teal};
          border-color: ${COLORS.teal};
          color: #fff;
        }

        /* ---------- actions ---------- */
        .pc-foot { margin-top: auto; padding-top: 16px; }

        .pc-msg {
          margin: -4px 0 8px;
          color: #A24D4D;
          font: 500 10.5px/1.35 var(--font-poppins), Arial, sans-serif;
        }

        .pc-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .pc-btn {
          min-width: 0;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0 8px;
          border-radius: 999px;
          box-sizing: border-box;
          font: 600 12px/1 var(--font-poppins), Arial, sans-serif;
          white-space: nowrap;
          cursor: pointer;
          transition: transform .2s ease, background-color .2s ease, color .2s ease, box-shadow .2s ease;
        }
        .pc-btn:active { transform: scale(.97); }

        .pc-cart-btn {
          border: 1px solid ${COLORS.teal};
          background: ${COLORS.teal};
          color: #fff;
        }
        .pc-cart-btn:hover:not(:disabled) { background: ${COLORS.tealDark}; }
        .pc-cart-btn:disabled { opacity: .7; cursor: wait; }

        .pc-quote-btn {
          border: 1.5px solid ${COLORS.teal};
          background: transparent;
          color: ${COLORS.teal};
        }
        .pc-quote-btn:hover { background: ${COLORS.teal}; color: #fff; }

        /* quantity + remove */
        .pc-qty {
          min-width: 0;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2px;
          padding: 0 5px;
          border: 1px solid ${COLORS.gold};
          border-radius: 999px;
          background: #FBF7F0;
          box-sizing: border-box;
          color: ${COLORS.teal};
        }
        .pc-qty-btn {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: ${COLORS.teal};
          color: #fff;
          font: 600 15px/1 var(--font-poppins), Arial, sans-serif;
          cursor: pointer;
          transition: background-color .2s ease, opacity .2s ease;
        }
        .pc-qty-btn:hover:not(:disabled) { background: ${COLORS.tealDark}; }
        .pc-qty-btn:disabled { opacity: .35; cursor: not-allowed; }
        .pc-qty-num {
          min-width: 16px;
          text-align: center;
          font: 700 12.5px/1 var(--font-poppins), Arial, sans-serif;
        }
        .pc-qty-remove {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          border-left: 1px solid rgba(190, 157, 107, .5);
          border-radius: 0;
          background: transparent;
          color: #A24D4D;
          cursor: pointer;
          transition: transform .2s ease, opacity .2s ease;
        }
        .pc-qty-remove:hover { transform: scale(1.12); }
        .pc-qty-status {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font: 600 11.5px/1 var(--font-poppins), Arial, sans-serif;
        }

        /* =====================================================
           SKELETON
        ===================================================== */
        .pc-skeleton-card { pointer-events: none; }
        .pc-sk {
          background: linear-gradient(90deg, #E8E1D9 20%, #F4EFEA 40%, #E8E1D9 60%);
          background-size: 200% 100%;
          animation: pc-skeleton 1.35s ease-in-out infinite;
        }
        .pc-sk-image { width: 100%; height: 100%; }
        .pc-sk-title { width: 70%; height: 20px; border-radius: 5px; }
        .pc-sk-price { width: 90px; height: 24px; margin-top: 12px; border-radius: 5px; }
        .pc-sk-line { width: 100%; height: 12px; margin-top: 16px; border-radius: 5px; }
        .pc-sk-line.short { width: 60%; margin-top: 10px; }
        .pc-sk-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: auto;
          padding-top: 22px;
        }
        .pc-sk-btn { height: 40px; border-radius: 999px; }

        @keyframes pc-skeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* =====================================================
           TABLET
        ===================================================== */
        @media (max-width: 1024px) {
          .pc-container { padding: 80px 32px !important; }
          .pc-scroll { gap: 20px; }
          .pc-card {
            flex-basis: 285px;
            width: 285px;
            min-width: 285px;
            max-width: 285px;
          }
          .pc-slider-arrow-left { left: -16px; }
          .pc-slider-arrow-right { right: -16px; }
        }

        @media (max-width: 768px) {
          .pc-heading { font-size: 38px !important; line-height: 1.15 !important; }
          .pc-subtext { font-size: 15px !important; line-height: 1.55 !important; }
          .pc-scroll { gap: 14px; }
          .pc-slider-arrow { display: none; }
        }

        /* =====================================================
           MOBILE: exactly 2 cards on screen
        ===================================================== */
        @media (max-width: 560px) {
          .pc-container { padding: 50px 16px !important; }
          .pc-heading {
            font-size: 29px !important;
            line-height: 1.15 !important;
            margin-bottom: 14px !important;
          }
          .pc-subtext {
            font-size: 13.5px !important;
            line-height: 1.55 !important;
            margin-bottom: 30px !important;
          }

          .pc-scroll {
            gap: 10px;
            margin: 0 -16px;
            width: auto;
            padding: 6px 16px 14px;
            scroll-padding: 0 16px;
          }

          .pc-card {
            flex-basis: calc((100vw - 42px) / 2);
            width: calc((100vw - 42px) / 2);
            min-width: calc((100vw - 42px) / 2);
            max-width: calc((100vw - 42px) / 2);
            border-radius: 12px;
          }

          .pc-image-wrap { aspect-ratio: 1 / 1; }
          .pc-off-badge {
            top: 7px;
            right: 7px;
            padding: 5px 8px;
            font-size: 9px;
          }

          .pc-body { padding: 11px 10px 10px; }
          .pc-title { font-size: 15.5px; line-height: 1.18; }
          .pc-price-row { margin-top: 6px; gap: 2px 6px; }
          .pc-price-new { font-size: 19px; }
          .pc-price-old { font-size: 10px; }
          .pc-sku { margin-top: 4px; font-size: 8.5px; }

          .pc-options { gap: 8px; margin-top: 10px; padding-top: 10px; }
          .pc-option-row { gap: 6px; min-height: 22px; }
          .pc-option-label { width: 28px; font-size: 7.5px; letter-spacing: .9px; }
          .pc-selected-value { display: none; }
          .pc-swatches, .pc-sizes { gap: 6px; }
          .pc-color-dot { width: 17px; height: 17px; flex-basis: 17px; }
          .pc-size-btn { min-width: 28px; height: 23px; padding: 0 7px; font-size: 9px; border-radius: 6px; }

          .pc-foot { padding-top: 12px; }
          .pc-msg { font-size: 9px; }

          /* buttons stacked, full width */
          .pc-actions { grid-template-columns: 1fr; gap: 6px; }
          .pc-btn, .pc-qty { height: 34px; }
          .pc-btn { font-size: 10.5px; padding: 0 6px; }
          .pc-qty { padding: 0 4px; }
          .pc-qty-btn { width: 22px; height: 22px; font-size: 14px; }
          .pc-qty-num { font-size: 11.5px; }
          .pc-qty-remove { width: 26px; height: 26px; }
          .pc-qty-status { font-size: 10px; }

          .pc-sk-btn { height: 34px; }
          .pc-sk-actions { grid-template-columns: 1fr; gap: 6px; }
        }

        @media (max-width: 380px) {
          .pc-card {
            flex-basis: calc((100vw - 38px) / 2);
            width: calc((100vw - 38px) / 2);
            min-width: calc((100vw - 38px) / 2);
            max-width: calc((100vw - 38px) / 2);
          }
          .pc-body { padding: 10px 8px 9px; }
          .pc-title { font-size: 14.5px; }
          .pc-price-new { font-size: 17px; }
          .pc-btn { font-size: 10px; }
        }

        /* =====================================================
           TOUCH + REDUCED MOTION
        ===================================================== */
        @media (hover: none) and (pointer: coarse) {
          .pc-card { -webkit-tap-highlight-color: transparent; }
          .pc-product-image { transition: opacity .22s ease; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pc-card, .pc-product-image, .pc-btn, .pc-qty-btn, .pc-qty-remove,
          .pc-slider-arrow, .pc-color-dot, .pc-size-btn, .pc-sk {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

/* =========================================================
   INLINE STYLES (section header)
========================================================= */
const styles = {
  section: {
    width: "100%",
    background: COLORS.cream,
    boxSizing: "border-box",
  },
  container: {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    padding: "96px 32px",
    boxSizing: "border-box",
    textAlign: "center",
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 14,
    marginBottom: 20,
  },
  eyebrowLine: {
    width: 36,
    height: 1,
    background: COLORS.gold,
    display: "inline-block",
  },
  eyebrowText: {
    fontFamily: "var(--font-poppins), sans-serif",
    color: COLORS.gold,
    fontWeight: 500,
    letterSpacing: 2,
    fontSize: 13,
    textTransform: "uppercase",
  },
  heading: {
    fontFamily: "var(--font-cormorant), serif",
    color: "#1B1B1B",
    fontWeight: 600,
    fontSize: 40,
    lineHeight: 1.15,
    margin: "0 0 20px 0",
  },
  subtext: {
    fontFamily: "var(--font-poppins), sans-serif",
    color: COLORS.navGray,
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 1.7,
    margin: "0 auto 56px auto",
    maxWidth: 460,
  },
  fallbackNote: {
    margin: "13px 0 0",
    textAlign: "center",
    color: "#8A8178",
    fontFamily: "var(--font-poppins), sans-serif",
    fontSize: 9,
  },
};