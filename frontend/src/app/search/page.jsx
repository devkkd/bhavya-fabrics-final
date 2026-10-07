"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";

import { useCart } from "@/context/CartContext";
import CustomerLoginModal from "@/components/CustomerLoginModal";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");

const PAGE_SIZE = 100;

const COLORS = {
  teal: "#295C65",
  tealDark: "#214D55",
  cream: "#FAF8F5",
  white: "#FFFFFF",
  ink: "#1B1B1B",
  muted: "#6D6A66",
  border: "#E7E0D8",
  soft: "#F3EFE9",
  sale: "#B64B32",
};

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

function getOptionName(value = "") {
  if (value && typeof value === "object") {
    return String(
      value?.name ||
        value?.label ||
        value?.value ||
        value?.hex ||
        ""
    ).trim();
  }
  return String(value || "").trim();
}

function getOptionValue(value = "") {
  if (value && typeof value === "object") {
    return String(
      value?.value ||
        value?.name ||
        value?.label ||
        value?.hex ||
        ""
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
  const left = [
    getOptionName(a),
    getOptionValue(a),
    getOptionHex(a),
  ]
    .map((value) => String(value).toLowerCase())
    .filter(Boolean);

  const right = [
    getOptionName(b),
    getOptionValue(b),
    getOptionHex(b),
  ]
    .map((value) => String(value).toLowerCase())
    .filter(Boolean);

  return left.some((value) => right.includes(value));
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

function normalizeProduct(item) {
  if (!item) return null;

  const regularPrice =
    Number(
      item?.pricing?.regularPrice ??
        item?.regularPrice ??
        item?.price ??
        0
    ) || 0;

  const salePrice =
    Number(
      item?.pricing?.salePrice ??
        item?.salePrice ??
        0
    ) || 0;

  const rawVariants = Array.isArray(item?.variants)
    ? item.variants
    : [];

  const colorSource =
    Array.isArray(item?.options?.colors) && item.options.colors.length
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
          {
            index,
            name,
            value,
            hex,
            images: Array.isArray(color?.images)
              ? color.images.map(imageValue).filter(Boolean)
              : [],
          },
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
        return [
          value.toLowerCase(),
          {
            index,
            name,
            value,
            details: size?.details || "",
            meters: size?.meters ?? null,
            shippingCharge: size?.shippingCharge ?? null,
            regularPrice: size?.regularPrice ?? null,
            salePrice: size?.salePrice ?? null,
          },
        ];
      })
    ).values()
  );

  const imageList = [
    imageValue(item?.mainImage),
    imageValue(item?.image),
    imageValue(item?.imageUrl),
    ...(Array.isArray(item?.gallery)
      ? item.gallery.map(imageValue)
      : []),
    ...(Array.isArray(item?.images)
      ? item.images.map(imageValue)
      : []),
  ].filter(Boolean);

  const uniqueImages = [...new Set(imageList)];

  const id =
    item?._id ||
    item?.id ||
    item?.slug ||
    item?.sku ||
    slugify(item?.title || item?.productName || "product");

  const title =
    item?.title ||
    item?.name ||
    item?.productName ||
    "Untitled Product";

  return {
    id: String(id),
    title: String(title),
    slug: item?.slug || slugify(title),
    sku: item?.sku || "—",
    regularPrice,
    salePrice,
    image: uniqueImages[0] || "/images/home/products/1.png",
    hoverImage: uniqueImages[1] || uniqueImages[0] || "/images/home/products/1.png",
    colorOptions,
    sizeOptions,
    variants,
    variantsEnabled: Boolean(item?.variantsEnabled || variants.length),
    sellingMode: item?.sellingMode === "meter" ? "meter" : "piece",
    priceUnit:
      item?.priceUnit ||
      (item?.sellingMode === "meter" ? "Per Meter" : "Per Piece"),
  };
}

function SearchSkeleton() {
  return (
    <div className="sr-grid">
      {Array.from({ length: 8 }).map((_, index) => (
        <article className="sr-card sr-skeleton" key={index}>
          <div className="sr-skeleton-image" />
          <div className="sr-skeleton-line sr-skeleton-line-lg" />
          <div className="sr-skeleton-line" />
          <div className="sr-skeleton-line sr-skeleton-line-sm" />
          <div className="sr-skeleton-pill-row">
            <span />
            <span />
            <span />
          </div>
          <div className="sr-skeleton-buttons">
            <span />
            <span />
          </div>
        </article>
      ))}
    </div>
  );
}

function ProductCard({ product, onLoginRequired }) {
  const router = useRouter();
  const { addToCart, items, updateQuantity, removeItem } = useCart();

  const [activeColor, setActiveColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(
    product?.sizeOptions?.[0]?.value ||
      product?.sizeOptions?.[0]?.name ||
      ""
  );
  const [desiredPieces, setDesiredPieces] = useState(1);
  const [busy, setBusy] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  // ✅ Product details page open (same route as search suggestion click)
  const goToProduct = useCallback(() => {
    const slug = String(product?.slug || "").trim();
    if (!slug) return;
    router.push(`/products/${encodeURIComponent(slug)}`);
  }, [router, product?.slug]);

  // ✅ Card ke khali area par click karne par bhi details page khule
  // (buttons / inputs par click ignore hoga)
  const handleCardClick = (event) => {
    if (event.target.closest("button, a, input, select, textarea")) return;
    goToProduct();
  };

  const colorOptions = Array.isArray(product?.colorOptions)
    ? product.colorOptions
    : [];

  const selectedColorOption =
    colorOptions[activeColor] || colorOptions[0] || null;

  const selectedColor =
    selectedColorOption?.name ||
    selectedColorOption?.value ||
    "";

  useEffect(() => {
    const first =
      product?.sizeOptions?.[0]?.value ||
      product?.sizeOptions?.[0]?.name ||
      "";

    if (!first) {
      setSelectedSize("");
      return;
    }

    const stillValid = product?.sizeOptions?.some(
      (size) =>
        String(size?.value || size?.name || "").toLowerCase() ===
        String(selectedSize || "").toLowerCase()
    );

    if (!stillValid) setSelectedSize(first);
  }, [product?.id, product?.sizeOptions, selectedSize]);

  const availableSizes = useMemo(() => {
    if (!product?.sizeOptions?.length) return [];

    if (!product?.variantsEnabled || !product?.variants?.length) {
      return product.sizeOptions;
    }

    return product.sizeOptions.filter((size) =>
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
          {
            name: variant?.sizeName,
            value: variant?.sizeValue,
          },
          size
        );

        return colorMatches && sizeMatches;
      })
    );
  }, [product, selectedColor, selectedColorOption]);

  useEffect(() => {
    const firstCompatible =
      availableSizes?.[0]?.value ||
      availableSizes?.[0]?.name ||
      "";

    if (
      firstCompatible &&
      !availableSizes.some(
        (size) =>
          String(size?.value || size?.name || "").toLowerCase() ===
          String(selectedSize || "").toLowerCase()
      )
    ) {
      setSelectedSize(firstCompatible);
    }
  }, [availableSizes, selectedSize]);

  const selectedVariant = useMemo(() => {
    if (
      !product?.variantsEnabled ||
      !Array.isArray(product?.variants) ||
      !product.variants.length
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
              {
                name: variant?.sizeName,
                value: variant?.sizeValue,
              },
              selectedSize
            )
          : true;

        return colorMatches && sizeMatches;
      }) || null
    );
  }, [product, selectedColor, selectedSize, selectedColorOption]);

  const displayRegularPrice =
    selectedVariant?.regularPrice > 0
      ? selectedVariant.regularPrice
      : Number(product?.regularPrice || 0);

  const displaySalePrice =
    selectedVariant?.salePrice > 0
      ? selectedVariant.salePrice
      : Number(product?.salePrice || 0);

  const hasSale =
    displayRegularPrice > 0 &&
    displaySalePrice > 0 &&
    displaySalePrice < displayRegularPrice;

  const discount = hasSale
    ? Math.round(
        ((displayRegularPrice - displaySalePrice) /
          displayRegularPrice) *
          100
      )
    : 0;

  const selectedSku =
    selectedVariant?.sku ||
    product?.sku ||
    "—";

  const selectedColorImages = Array.isArray(selectedColorOption?.images)
    ? selectedColorOption.images
        .map((image) => (typeof image === "string" ? image : image?.url))
        .filter(Boolean)
    : [];

  const displayImage =
    selectedVariant?.images?.[0] ||
    selectedColorImages?.[0] ||
    product?.image ||
    "/images/home/products/1.png";

  const displayHoverImage =
    selectedVariant?.images?.[1] ||
    selectedColorImages?.[1] ||
    product?.hoverImage ||
    displayImage;

  const cartItem = useMemo(() => {
    return (
      (items || []).find((item) => {
        if (
          String(item?.productId || "") !==
          String(product?.id || "")
        ) {
          return false;
        }

        const currentVariantId = String(
          selectedVariant?.id || ""
        );

        if (currentVariantId) {
          return (
            String(item?.variantId || "") ===
            currentVariantId
          );
        }

        const itemColor =
          item?.selectedColor?.name ||
          item?.selectedColor?.value ||
          item?.selectedColor ||
          "";

        const itemSize =
          item?.selectedSize?.name ||
          item?.selectedSize?.value ||
          item?.selectedSize ||
          "";

        return (
          String(itemColor).toLowerCase() ===
            String(selectedColor).toLowerCase() &&
          String(itemSize).toLowerCase() ===
            String(selectedSize).toLowerCase()
        );
      }) || null
    );
  }, [
    items,
    product?.id,
    selectedVariant?.id,
    selectedColor,
    selectedSize,
  ]);

  const stockLimit =
    selectedVariant?.stock > 0
      ? selectedVariant.stock
      : 999999;

  useEffect(() => {
    if (cartItem) {
      setDesiredPieces(Math.max(1, Number(cartItem.quantity) || 1));
    }
  }, [cartItem?._id, cartItem?.quantity]);

  const changeColor = (index) => {
    setActiveColor(index);

    const nextColor = colorOptions[index];

    if (
      product?.variantsEnabled &&
      product?.variants?.length
    ) {
      const firstSize =
        product.sizeOptions?.find((size) =>
          product.variants.some(
            (variant) =>
              optionMatches(
                {
                  name: variant?.colorName,
                  value: variant?.colorValue,
                  hex: variant?.colorHex,
                },
                nextColor
              ) &&
              optionMatches(
                {
                  name: variant?.sizeName,
                  value: variant?.sizeValue,
                },
                size
              )
          )
        );

      setSelectedSize(
        firstSize?.value ||
          firstSize?.name ||
          ""
      );
    }
  };

  const increaseDesiredPieces = () => {
    setDesiredPieces((current) =>
      Math.min(current + 1, stockLimit)
    );
  };

  const decreaseDesiredPieces = () => {
    setDesiredPieces((current) =>
      Math.max(1, current - 1)
    );
  };

  const handleAdd = useCallback(async () => {
    if (busy || cartItem) return;

    if (
      product?.variantsEnabled &&
      product?.colorOptions?.length > 0 &&
      !selectedColor
    ) {
      return;
    }

    if (
      product?.variantsEnabled &&
      product?.sizeOptions?.length > 0 &&
      !selectedSize
    ) {
      return;
    }

    if (
      selectedVariant &&
      selectedVariant.stock <= 0
    ) {
      return;
    }

    const quantity = Math.min(
      Math.max(1, desiredPieces),
      stockLimit
    );

    setBusy(true);

    try {
      const result = await addToCart(
        String(product.id),
        quantity,
        {
          selectedColor,
          selectedSize,
          variantId: selectedVariant?.id || "",
        }
      );

      if (result?.loginRequired) {
        onLoginRequired?.();
        return;
      }

      if (result?.success) {
        setAddedFlash(true);
        window.setTimeout(() => {
          setAddedFlash(false);
        }, 1400);
      }
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    cartItem,
    product?.id,
    product?.variantsEnabled,
    product?.colorOptions?.length,
    product?.sizeOptions?.length,
    selectedColor,
    selectedSize,
    selectedVariant,
    desiredPieces,
    stockLimit,
    addToCart,
    onLoginRequired,
  ]);

  const cartItemId =
    cartItem?._id ||
    cartItem?.id ||
    "";

  const handleCartDecrease = async () => {
    if (!cartItemId) return;

    if (Number(cartItem?.quantity || 1) <= 1) {
      return;
    }

    await updateQuantity(
      cartItemId,
      Number(cartItem.quantity) - 1
    );
  };

  const handleCartIncrease = async () => {
    if (!cartItemId) return;

    const current = Number(cartItem?.quantity || 1);

    if (
      selectedVariant?.stock > 0 &&
      current >= selectedVariant.stock
    ) {
      return;
    }

    await updateQuantity(
      cartItemId,
      Math.min(
        current + 1,
        selectedVariant?.stock > 0
          ? selectedVariant.stock
          : current + 1
      )
    );
  };

  const handleCartRemove = async () => {
    if (!cartItemId) return;
    await removeItem(cartItemId);
  };

  return (
    <article
      className={`sr-card${busy ? " is-busy" : ""}`}
      onClick={handleCardClick}
    >
      <button
        type="button"
        className="sr-image-wrap"
        onClick={goToProduct}
        aria-label={`View ${product.title}`}
      >
        <img
          src={displayImage}
          alt={product.title}
          className="sr-product-image sr-product-image-primary"
          width="600"
          height="600"
          loading="lazy"
          decoding="async"
          draggable="false"
        />

        {displayHoverImage &&
          displayHoverImage !== displayImage && (
            <img
              src={displayHoverImage}
              alt=""
              aria-hidden="true"
              className="sr-product-image sr-product-image-hover"
              width="600"
              height="600"
              loading="lazy"
              decoding="async"
              draggable="false"
            />
          )}

        {hasSale ? (
          <span className="sr-off-badge">
            {discount}% OFF
          </span>
        ) : null}
      </button>

      <div className="sr-card-body">
        <div className="sr-price-row">
          {hasSale ? (
            <>
              <span className="sr-price-old">
                ₹{displayRegularPrice.toLocaleString("en-IN")}
              </span>
              <span className="sr-price-new">
                ₹{displaySalePrice.toLocaleString("en-IN")}
              </span>
            </>
          ) : (
            <span className="sr-price-new">
              ₹{displayRegularPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        <button
          type="button"
          className="sr-product-title"
          onClick={goToProduct}
        >
          {product.title}
        </button>

        <div className="sr-meta-row">
          <span>SKU</span>
          <strong>{selectedSku}</strong>
        </div>

        {colorOptions.length > 0 ? (
          <div className="sr-option-block">
            <div className="sr-option-heading">
              <span>COLOR</span>
              <strong>{selectedColor || "Select"}</strong>
            </div>

            <div className="sr-color-row">
              {colorOptions.map((color, index) => {
                const active = activeColor === index;
                return (
                  <button
                    key={`${product.id}-color-${index}`}
                    type="button"
                    className={`sr-color-dot ${
                      active ? "is-active" : ""
                    }`}
                    style={{
                      background:
                        color?.hex ||
                        color?.value ||
                        "#D9D1C7",
                    }}
                    aria-label={`Select ${color?.name || "color"}`}
                    aria-pressed={active}
                    title={
                      color?.name ||
                      color?.value ||
                      "Color"
                    }
                    onClick={() => changeColor(index)}
                  />
                );
              })}
            </div>
          </div>
        ) : null}

        {availableSizes.length > 0 ? (
          <div className="sr-option-block">
            <div className="sr-option-heading">
              <span>{product.sellingMode === "meter" ? "METER / LENGTH" : "SIZE"}</span>
              <strong>{selectedSize || "Select"}</strong>
            </div>

            <div className="sr-size-row">
              {availableSizes.map((size) => {
                const sizeValue =
                  size?.value ||
                  size?.name ||
                  "";

                const active =
                  String(selectedSize).toLowerCase() ===
                  String(sizeValue).toLowerCase();

                return (
                  <button
                    key={`${product.id}-size-${sizeValue}`}
                    type="button"
                    className={`sr-size-btn ${
                      active ? "is-active" : ""
                    }`}
                    onClick={() =>
                      setSelectedSize(sizeValue)
                    }
                    aria-pressed={active}
                  >
                    {size?.name || sizeValue}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {!cartItem ? (
          <div className="sr-action-area">
            <div className="sr-pieces-control">
              <span className="sr-pieces-label">
                {product.sellingMode === "meter" ? "QUANTITY" : "PIECES"}
              </span>

              <div className="sr-qty-control">
                <button
                  type="button"
                  onClick={decreaseDesiredPieces}
                  disabled={desiredPieces <= 1}
                  aria-label="Decrease pieces"
                >
                  <Minus size={14} />
                </button>

                <span>{desiredPieces}</span>

                <button
                  type="button"
                  onClick={increaseDesiredPieces}
                  disabled={
                    selectedVariant?.stock > 0 &&
                    desiredPieces >= selectedVariant.stock
                  }
                  aria-label="Increase pieces"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <button
              type="button"
              className={`sr-add-btn ${
                addedFlash ? "is-added" : ""
              }`}
              onClick={handleAdd}
              disabled={
                busy ||
                (selectedVariant &&
                  selectedVariant.stock <= 0)
              }
            >
              {addedFlash ? (
                <>
                  <Check size={15} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingCart size={15} />
                  {busy ? "Adding..." : "Add to Cart"}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="sr-cart-area">
            <div className="sr-cart-qty">
              <button
                type="button"
                onClick={handleCartDecrease}
                disabled={
                  Number(cartItem?.quantity || 1) <= 1
                }
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <span>
                {Number(cartItem?.quantity || 1)}
              </span>

              <button
                type="button"
                onClick={handleCartIncrease}
                disabled={
                  selectedVariant?.stock > 0 &&
                  Number(cartItem?.quantity || 0) >=
                    selectedVariant.stock
                }
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              className="sr-remove-btn"
              onClick={handleCartRemove}
              aria-label="Remove from cart"
            >
              <Trash2 size={14} />
              Remove
            </button>
          </div>
        )}

        <button
          type="button"
          className="sr-quote-btn"
          onClick={() => router.push("/contact")}
        >
          Request Quote
        </button>
      </div>
    </article>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") || "").trim();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(Boolean(query));
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    if (!query) {
      setProducts([]);
      setLoading(false);
      setError("");
      return () => controller.abort();
    }

    (async () => {
      try {
        setLoading(true);
        setError("");

        const firstResponse = await fetch(
          `${API_URL}/products?search=${encodeURIComponent(
            query
          )}&page=1&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        let firstPayload = {};
        try {
          firstPayload = await firstResponse.json();
        } catch {
          firstPayload = {};
        }

        if (!firstResponse.ok) {
          throw new Error(
            firstPayload?.message ||
              "Unable to search products."
          );
        }

        const firstProducts = extractProducts(
          firstPayload
        );

        const totalPages = Math.max(
          Number(
            firstPayload?.pagination?.totalPages || 1
          ),
          1
        );

        if (totalPages <= 1) {
          setProducts(
            firstProducts
              .filter(
                (item) =>
                  item?.status === "published" ||
                  !item?.status
              )
              .map(normalizeProduct)
              .filter(Boolean)
          );
          return;
        }

        const remainingRequests = Array.from(
          { length: totalPages - 1 },
          (_, index) =>
            fetch(
              `${API_URL}/products?search=${encodeURIComponent(
                query
              )}&page=${index + 2}&limit=${PAGE_SIZE}`,
              {
                method: "GET",
                cache: "no-store",
                signal: controller.signal,
              }
            )
        );

        const responses = await Promise.all(
          remainingRequests
        );

        const payloads = await Promise.all(
          responses.map(async (response) => {
            let payload = {};
            try {
              payload = await response.json();
            } catch {
              payload = {};
            }
            if (!response.ok) {
              throw new Error(
                payload?.message ||
                  "Unable to load all search results."
              );
            }
            return payload;
          })
        );

        const merged = [
          firstProducts,
          ...payloads.map(extractProducts),
        ].flat();

        setProducts(
          merged
            .filter(
              (item) =>
                item?.status === "published" ||
                !item?.status
            )
            .map(normalizeProduct)
            .filter(Boolean)
        );
      } catch (fetchError) {
        if (fetchError?.name === "AbortError") return;

        console.error(
          "Search page API error:",
          fetchError
        );
        setError(
          fetchError?.message ||
            "Unable to load search results."
        );
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => controller.abort();
  }, [query]);

  return (
    <main className="sr-page">
      <div className="sr-container">
        <div className="sr-heading">
          <div className="sr-heading-text">
            <p className="sr-eyebrow">
              BHAVYA FABRICS
            </p>

            <h1>
              {query
                ? `Search results for “${query}”`
                : "Search Products"}
            </h1>

            <p className="sr-subtitle">
              {query
                ? loading
                  ? "Finding matching products..."
                  : `${products.length} related ${
                      products.length === 1
                        ? "product"
                        : "products"
                    } found`
                : "Search fabrics, product names, SKUs, tags and details from the live catalogue."}
            </p>
          </div>

          <div className="sr-heading-search">
            <Search size={18} />
            <span>{query || "Search products..."}</span>
          </div>
        </div>

        {!query ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">
              <Search size={24} />
            </div>
            <h2>Start your search</h2>
            <p>
              Use the search icon in the header, type a product,
              and open the results page.
            </p>
          </div>
        ) : loading ? (
          <SearchSkeleton />
        ) : error ? (
          <div className="sr-empty sr-error">
            <div className="sr-empty-icon">
              <Search size={24} />
            </div>
            <h2>Search could not be completed</h2>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">
              <Search size={24} />
            </div>
            <h2>No products found</h2>
            <p>
              Try another product name, fabric, SKU or tag.
            </p>
          </div>
        ) : (
          <div className="sr-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onLoginRequired={() => setLoginOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      <CustomerLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={() => {
          setLoginOpen(false);
        }}
      />

      <style jsx global>{`
        /* ✅ Scrollbar aane-jaane se page sideways na hile */
        html {
          scrollbar-gutter: stable;
        }

        .sr-page,
        .sr-page *,
        .sr-page *::before,
        .sr-page *::after {
          box-sizing: border-box;
        }

        .sr-page {
          width: 100%;
          min-height: 100vh;
          background: ${COLORS.cream};
          color: ${COLORS.ink};
          padding: 56px 0 90px;
          overflow-x: clip;
        }

        /* ✅ Desktop: max 1400px + 32px side padding */
        .sr-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding-left: 32px;
          padding-right: 32px;
        }

        .sr-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 30px;
          min-height: 118px;
        }

        .sr-heading-text {
          min-width: 0;
          flex: 1 1 auto;
        }

        .sr-eyebrow {
          margin: 0 0 7px;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          color: ${COLORS.teal};
        }

        .sr-heading h1 {
          margin: 0;
          max-width: 900px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: clamp(34px, 4vw, 50px);
          font-weight: 600;
          line-height: 1.02;
          color: ${COLORS.teal};
          overflow-wrap: anywhere;
        }

        .sr-subtitle {
          margin: 10px 0 0;
          max-width: 720px;
          min-height: 20px;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 13px;
          line-height: 1.5;
          color: ${COLORS.muted};
        }

        .sr-heading-search {
          flex: 0 0 auto;
          min-width: 240px;
          max-width: 340px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 12px 15px;
          border: 1px solid ${COLORS.border};
          border-radius: 999px;
          background: ${COLORS.white};
          color: ${COLORS.teal};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 8px 24px rgba(31, 91, 99, 0.05);
        }

        .sr-heading-search svg {
          flex: 0 0 auto;
        }

        .sr-heading-search span {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sr-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          align-items: start;
        }

        .sr-card {
          min-width: 0;
          display: flex;
          flex-direction: column;
          background: ${COLORS.white};
          border: 1px solid ${COLORS.border};
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(31, 30, 28, 0.05);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .sr-card:hover {
          transform: translateY(-4px);
          border-color: rgba(41, 92, 101, 0.23);
          box-shadow: 0 18px 38px rgba(31, 30, 28, 0.09);
        }

        .sr-image-wrap {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          padding: 8px;
          overflow: hidden;
          border: 0;
          background: #F7F3ED;
          cursor: pointer;
        }

        .sr-product-image {
          position: absolute;
          inset: 8px;
          width: calc(100% - 16px);
          height: calc(100% - 16px);
          object-fit: contain;
          display: block;
          transition:
            opacity 0.35s ease,
            transform 0.45s ease;
        }

        .sr-product-image-hover {
          opacity: 0;
        }

        .sr-card:hover .sr-product-image-primary {
          opacity: 0;
        }

        .sr-card:hover .sr-product-image-hover {
          opacity: 1;
        }

        .sr-image-wrap:hover .sr-product-image {
          transform: scale(1.025);
        }

        /* Hover image na ho to primary image gayab na ho */
        .sr-card:hover .sr-product-image-primary:only-of-type {
          opacity: 1;
        }

        .sr-off-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 2;
          padding: 7px 9px;
          border-radius: 999px;
          background: ${COLORS.sale};
          color: #fff;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.4px;
          box-shadow: 0 8px 18px rgba(182, 75, 50, 0.2);
        }

        .sr-card-body {
          display: flex;
          flex-direction: column;
          gap: 11px;
          padding: 16px 16px 17px;
        }

        .sr-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          min-height: 23px;
          font-family: "Poppins", Arial, sans-serif;
        }

        .sr-price-old {
          color: #8D8A84;
          font-size: 12px;
          text-decoration: line-through;
        }

        .sr-price-new {
          color: ${COLORS.teal};
          font-size: 18px;
          font-weight: 700;
          line-height: 1;
        }

        .sr-product-title {
          padding: 0;
          margin: 0;
          border: 0;
          background: transparent;
          text-align: left;
          color: ${COLORS.ink};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.3;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .sr-product-title:hover {
          color: ${COLORS.teal};
        }

        .sr-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 2px;
          font-family: "Poppins", Arial, sans-serif;
        }

        .sr-meta-row span {
          color: #9A968F;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.1px;
        }

        .sr-meta-row strong {
          min-width: 0;
          max-width: 70%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${COLORS.muted};
          font-size: 10px;
          font-weight: 600;
        }

        .sr-option-block {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .sr-option-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-family: "Poppins", Arial, sans-serif;
        }

        .sr-option-heading span {
          color: #9A968F;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .sr-option-heading strong {
          min-width: 0;
          max-width: 68%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${COLORS.ink};
          font-size: 10px;
          font-weight: 600;
          text-align: right;
        }

        .sr-color-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
        }

        .sr-color-dot {
          width: 22px;
          height: 22px;
          padding: 0;
          border: 2px solid #fff;
          outline: 1px solid #D9D0C5;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
          transition:
            transform 0.18s ease,
            outline-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .sr-color-dot:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .sr-color-dot.is-active {
          outline: 2px solid ${COLORS.teal};
          outline-offset: 1px;
          transform: scale(1.05);
        }

        .sr-size-row {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .sr-size-btn {
          min-width: 42px;
          min-height: 29px;
          padding: 5px 9px;
          border: 1px solid #DDD5CA;
          border-radius: 7px;
          background: #fff;
          color: ${COLORS.muted};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease,
            color 0.18s ease;
        }

        .sr-size-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(41, 92, 101, 0.35);
        }

        .sr-size-btn.is-active {
          border-color: ${COLORS.teal};
          background: ${COLORS.teal};
          color: #fff;
        }

        .sr-action-area {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 2px;
        }

        .sr-pieces-control {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .sr-pieces-label {
          color: #9A968F;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .sr-qty-control,
        .sr-cart-qty {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 3px;
          border: 1px solid ${COLORS.border};
          border-radius: 8px;
          background: ${COLORS.soft};
        }

        .sr-qty-control button,
        .sr-cart-qty button {
          width: 28px;
          height: 28px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: ${COLORS.teal};
          cursor: pointer;
          transition:
            background 0.18s ease,
            transform 0.18s ease;
        }

        .sr-qty-control button:hover:not(:disabled),
        .sr-cart-qty button:hover:not(:disabled) {
          background: #fff;
          transform: translateY(-1px);
        }

        .sr-qty-control button:disabled,
        .sr-cart-qty button:disabled {
          color: #C7C0B6;
          cursor: not-allowed;
        }

        .sr-qty-control span,
        .sr-cart-qty span {
          min-width: 28px;
          text-align: center;
          color: ${COLORS.ink};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 12px;
          font-weight: 700;
        }

        .sr-add-btn,
        .sr-quote-btn,
        .sr-remove-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 40px;
          border-radius: 9px;
          padding: 0 12px;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .sr-add-btn {
          width: 100%;
          border: 1px solid ${COLORS.teal};
          background: ${COLORS.teal};
          color: #fff;
        }

        .sr-add-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          background: ${COLORS.tealDark};
          border-color: ${COLORS.tealDark};
          box-shadow: 0 8px 18px rgba(41,92,101,0.16);
        }

        .sr-add-btn.is-added {
          background: #1D8050;
          border-color: #1D8050;
        }

        .sr-add-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .sr-cart-area {
          display: grid;
          grid-template-columns: 1fr 1.18fr;
          gap: 8px;
        }

        .sr-cart-qty {
          justify-content: center;
        }

        .sr-remove-btn {
          border: 1px solid #D9CFC3;
          background: #F0EAE2;
          color: #745F4F;
        }

        .sr-remove-btn:hover {
          transform: translateY(-1px);
          border-color: #C7B8A8;
          background: #E7DED4;
        }

        .sr-quote-btn {
          width: 100%;
          border: 1px solid ${COLORS.teal};
          background: #fff;
          color: ${COLORS.teal};
        }

        .sr-quote-btn:hover {
          transform: translateY(-1px);
          background: ${COLORS.teal};
          color: #fff;
          box-shadow: 0 8px 18px rgba(41,92,101,0.13);
        }

        .sr-card.is-busy {
          opacity: 0.92;
        }

        .sr-empty {
          min-height: 360px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 45px 20px;
          border: 1px solid ${COLORS.border};
          border-radius: 18px;
          background: #fff;
        }

        .sr-empty-icon {
          width: 54px;
          height: 54px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #F0EBE4;
          color: ${COLORS.teal};
        }

        .sr-empty h2 {
          margin: 0 0 7px;
          color: ${COLORS.teal};
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 31px;
          font-weight: 600;
        }

        .sr-empty p {
          max-width: 540px;
          margin: 0;
          color: ${COLORS.muted};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
        }

        .sr-error h2 {
          color: ${COLORS.sale};
        }

        .sr-skeleton {
          padding-bottom: 16px;
          cursor: default;
        }

        .sr-skeleton:hover {
          transform: none;
          box-shadow: 0 10px 30px rgba(31, 30, 28, 0.05);
          border-color: ${COLORS.border};
        }

        .sr-skeleton-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          background:
            linear-gradient(
              90deg,
              #F4EFE8 25%,
              #EAE3DA 37%,
              #F4EFE8 63%
            );
          background-size: 400% 100%;
          animation: sr-shimmer 1.35s ease infinite;
        }

        .sr-skeleton-line {
          height: 10px;
          margin: 13px 16px 0;
          border-radius: 999px;
          background: #EEE8E0;
        }

        .sr-skeleton-line-lg {
          width: 68%;
          height: 16px;
        }

        .sr-skeleton-line-sm {
          width: 42%;
        }

        .sr-skeleton-pill-row {
          display: flex;
          gap: 6px;
          margin: 14px 16px 0;
        }

        .sr-skeleton-pill-row span {
          width: 36px;
          height: 23px;
          border-radius: 7px;
          background: #EEE8E0;
        }

        .sr-skeleton-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin: 15px 16px 0;
        }

        .sr-skeleton-buttons span {
          height: 40px;
          border-radius: 9px;
          background: #EEE8E0;
        }

        @keyframes sr-shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: 0 0;
          }
        }

        @media (max-width: 1200px) {
          .sr-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        /* ✅ Mobile / tablet: 20px side padding */
        @media (max-width: 900px) {
          .sr-page {
            padding: 40px 0 70px;
          }

          .sr-container {
            max-width: 100%;
            padding-left: 20px;
            padding-right: 20px;
          }

          .sr-heading {
            align-items: flex-start;
            flex-direction: column;
            gap: 16px;
            min-height: 0;
          }

          .sr-heading-text {
            width: 100%;
          }

          .sr-heading-search {
            width: 100%;
            min-width: 0;
            max-width: none;
          }

          .sr-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .sr-card-body {
            padding: 13px 12px 14px;
            gap: 9px;
          }

          .sr-product-title {
            font-size: 13px;
          }

          .sr-price-new {
            font-size: 16px;
          }

          .sr-off-badge {
            top: 12px;
            left: 12px;
            font-size: 9px;
          }
        }

        @media (max-width: 560px) {
          .sr-container {
            padding-left: 20px;
            padding-right: 20px;
          }

          .sr-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .sr-heading h1 {
            font-size: 35px;
          }

          .sr-subtitle {
            font-size: 12px;
          }

          .sr-image-wrap {
            aspect-ratio: 1 / 1;
          }

          .sr-card-body {
            padding: 15px;
          }

          .sr-product-title {
            font-size: 14px;
          }

          .sr-cart-area {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="sr-page">
          <div className="sr-container">
            <SearchSkeleton />
          </div>
        </main>
      }
    >
      <SearchResults />
    </Suspense>
  );
}