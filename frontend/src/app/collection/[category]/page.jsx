"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useParams,
  useSearchParams,
  useRouter,
} from "next/navigation";

import {
  categories as fallbackCategoriesData,
  products as fallbackProductsData,
} from "../../data/product";

import Link from "next/link";

import {
  Heart,
  ShoppingCart,
  Check,
  ChevronRight,
  ChevronLeft,
  Layers3,
  Shirt,
  Scissors,
  Sparkles,
  Leaf,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";

import { useCart }     from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api";

const PAGE_SIZE = 8;

/* =====================================================
   BASIC HELPERS
===================================================== */

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractArray(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  if (Array.isArray(payload?.categories)) {
    return payload.categories;
  }

  if (Array.isArray(payload?.subcategories)) {
    return payload.subcategories;
  }

  if (Array.isArray(payload?.subCategories)) {
    return payload.subCategories;
  }

  if (Array.isArray(payload?.data?.products)) {
    return payload.data.products;
  }

  if (Array.isArray(payload?.data?.categories)) {
    return payload.data.categories;
  }

  if (Array.isArray(payload?.data?.subcategories)) {
    return payload.data.subcategories;
  }

  return [];
}

function relationSlug(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value?.slug ||
        value?.id ||
        value?._id ||
        slugify(
          value?.name ||
            value?.label ||
            value?.title
        ) ||
        ""
    );
  }

  return String(value);
}

function relationLabel(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.label ||
      value?.title ||
      value?.category ||
      value?.subcategory ||
      ""
    );
  }

  return String(value);
}

function relationCandidates(...values) {
  const candidates = [];

  const add = (value) => {
    if (value === null || value === undefined || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }

    if (typeof value === "object") {
      add(value?.slug);
      add(value?.id);
      add(value?._id);
      add(value?.name);
      add(value?.label);
      add(value?.title);
      add(value?.category);
      add(value?.subcategory);
      add(value?.categorySlug);
      add(value?.subcategorySlug);
      return;
    }

    const raw = String(value).trim();
    if (!raw) return;

    const normalized = slugify(raw);
    if (normalized) {
      candidates.push(normalized);
    }

    // Keep raw lowercase too for IDs/legacy values that are not slug-like.
    candidates.push(raw.toLowerCase());
  };

  values.forEach(add);

  return [...new Set(candidates.filter(Boolean))];
}

function imageValue(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

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

  if (typeof value === "string") {
    return value.trim();
  }

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

function normalizeColorOption(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const name = value.trim();
    return name
      ? {
          name,
          value: name,
          hex: name,
        }
      : null;
  }

  const name = optionName(value);
  const rawValue = String(
    value?.value ||
      value?.name ||
      value?.color ||
      value?.colour ||
      value?.code ||
      ""
  ).trim();

  const hex = String(
    value?.hex ||
      ""
  ).trim();

  if (!name && !rawValue) return null;

  return {
    name: name || rawValue,
    value: rawValue || name,
    hex: hex || rawValue || name,
    regularPrice:
      value?.regularPrice !== null &&
      value?.regularPrice !== undefined
        ? Number(value.regularPrice)
        : null,
    salePrice:
      value?.salePrice !== null &&
      value?.salePrice !== undefined
        ? Number(value.salePrice)
        : null,
    images: Array.isArray(value?.images)
      ? value.images
          .map(imageValue)
          .filter(Boolean)
      : [],
  };
}

function normalizeSizeOption(value) {
  if (!value) return null;

  if (typeof value === "string") {
    const name = value.trim();
    return name
      ? {
          name,
          value: name,
        }
      : null;
  }

  const name = optionName(value);
  const rawValue = String(
    value?.value ||
      value?.name ||
      value?.size ||
      ""
  ).trim();

  if (!name && !rawValue) return null;

  return {
    name: name || rawValue,
    value: rawValue || name,
    details:
      value?.details ||
      value?.description ||
      "",
    shippingCharge:
      value?.shippingCharge !== null &&
      value?.shippingCharge !== undefined
        ? Number(value.shippingCharge)
        : null,
    meters:
      value?.meters !== null &&
      value?.meters !== undefined
        ? Number(value.meters)
        : null,
    regularPrice:
      value?.regularPrice !== null &&
      value?.regularPrice !== undefined
        ? Number(value.regularPrice)
        : null,
    salePrice:
      value?.salePrice !== null &&
      value?.salePrice !== undefined
        ? Number(value.salePrice)
        : null,
  };
}

function normalizeColor(value) {
  return normalizeColorOption(value)?.hex || "";
}

function normalizeVariant(value) {
  if (!value) return null;

  const rawColor =
    value?.color ??
    value?.colour ??
    value?.selectedColor ??
    "";

  const rawSize =
    value?.size ??
    value?.selectedSize ??
    "";

  return {
    id: String(
      value?._id ||
        value?.id ||
        ""
    ),
    colorOption: normalizeColorOption(rawColor),
    sizeOption: normalizeSizeOption(rawSize),
    color: optionName(rawColor),
    size: optionName(rawSize),
    regularPrice:
      Number(value?.regularPrice ?? 0) || 0,
    salePrice:
      Number(value?.salePrice ?? 0) || 0,
    stock:
      Number(value?.stock ?? 0) || 0,
    sku: value?.sku || "",
    images: Array.isArray(value?.images)
      ? value.images
          .map(imageValue)
          .filter(Boolean)
      : [],
    active: value?.active !== false,
  };
}

function sameOption(a, b) {
  const av = optionName(a).toLowerCase();
  const bv = optionName(b).toLowerCase();

  if (!av || !bv) return false;
  if (av === bv) return true;

  const aValue = String(a?.value || "").trim().toLowerCase();
  const aHex = String(a?.hex || "").trim().toLowerCase();
  const bValue = String(b?.value || "").trim().toLowerCase();
  const bHex = String(b?.hex || "").trim().toLowerCase();

  return (
    (aValue && (aValue === bv || aValue === bValue || aValue === bHex)) ||
    (aHex && (aHex === bv || aHex === bValue || aHex === bHex))
  );
}

function cartOptionObject(value, type = "color") {
  if (!value) return null;

  if (typeof value === "object") {
    return type === "color"
      ? normalizeColorOption(value)
      : normalizeSizeOption(value);
  }

  return type === "color"
    ? normalizeColorOption(value)
    : normalizeSizeOption(value);
}

function getSpecification(product, name) {
  const specifications = Array.isArray(
    product?.specifications
  )
    ? product.specifications
    : [];

  const target = String(name)
    .trim()
    .toLowerCase();

  const found = specifications.find(
    (item) =>
      String(
        item?.name ||
          item?.label ||
          item?.key ||
          ""
      )
        .trim()
        .toLowerCase() === target
  );

  return found?.value || "";
}

/* =====================================================
   CATEGORY NORMALIZER
===================================================== */

function normalizeSubcategory(item) {
  const label =
    item?.name ||
    item?.label ||
    item?.title ||
    item?.subcategory ||
    "Untitled Subcategory";

  const slug = String(
    item?.slug ||
      slugify(label) ||
      item?.id ||
      item?._id ||
      ""
  );

  const categoryValue =
    item?.category ||
    item?.parentCategory ||
    item?.categoryId;

  const imageUrl =
    imageValue(item?.image) ||
    imageValue(item?.heroImage) ||
    imageValue(item?.homeImage) ||
    "";

  return {
    id: slug,
    slug,
    mongoId: item?._id
      ? String(item._id)
      : "",
    label: String(label),
    categoryId:
      relationSlug(categoryValue),
    imageUrl,
    image:
      item?.image ||
      item?.heroImage ||
      item?.homeImage ||
      null,
  };
}

function normalizeCategory(item) {
  const label =
    item?.name ||
    item?.label ||
    item?.title ||
    item?.category ||
    "Untitled Category";

  const slug = String(
    item?.slug ||
      slugify(label) ||
      item?.id ||
      item?._id ||
      ""
  );

  const imageUrl =
    imageValue(item?.heroImage) ||
    imageValue(item?.collectionImage) ||
    imageValue(item?.image) ||
    imageValue(item?.categoryImage) ||
    imageValue(item?.featuredImage) ||
    "";

  const homeImageUrl =
    imageValue(item?.homeImage) ||
    imageValue(item?.image) ||
    imageValue(item?.categoryImage) ||
    "";

  return {
    id: slug,
    slug,
    mongoId: item?._id
      ? String(item._id)
      : "",
    label: String(label),
    imageUrl,
    homeImageUrl,
    image:
      item?.heroImage ||
      item?.collectionImage ||
      item?.image ||
      item?.categoryImage ||
      item?.featuredImage ||
      null,
    subcategories: Array.isArray(
      item?.subcategories
    )
      ? item.subcategories.map(
          normalizeSubcategory
        )
      : [],
  };
}

function normalizeCategoryWithSubcategories(
  item
) {
  const category =
    normalizeCategory(item);

  const embedded = Array.isArray(
    item?.subCategories
  )
    ? item.subCategories
    : Array.isArray(
        item?.subcategories
      )
    ? item.subcategories
    : [];

  return {
    ...category,
    subcategories:
      embedded.map(
        normalizeSubcategory
      ),
  };
}

/* =====================================================
   PRODUCT NORMALIZER
===================================================== */

function normalizeProduct(item) {
  const regularPrice = Number(
    item?.pricing?.regularPrice ??
      item?.regularPrice ??
      item?.price ??
      0
  );

  const salePrice = Number(
    item?.pricing?.salePrice ??
      item?.salePrice ??
      0
  );

  const hasSale =
    Boolean(item?.showOnSale) &&
    salePrice > 0 &&
    salePrice < regularPrice;

  const finalPrice = hasSale
    ? salePrice
    : regularPrice;

  const categoryObject =
    item?.category &&
    typeof item.category === "object"
      ? item.category
      : null;

  const subcategoryObject =
    item?.subcategory &&
    typeof item.subcategory ===
      "object"
      ? item.subcategory
      : null;

  const category =
    item?.categorySlug ||
    categoryObject?.slug ||
    relationSlug(
      item?.category
    );

  const categoryLabel =
    item?.categoryName ||
    categoryObject?.name ||
    categoryObject?.label ||
    relationLabel(
      item?.category
    );

  const subcategory =
    item?.subcategorySlug ||
    subcategoryObject?.slug ||
    relationSlug(
      item?.subcategory
    );

  const subcategoryKey =
    slugify(subcategory);

  /* ---------- Images ---------- */

  const gallery = Array.isArray(
    item?.gallery
  )
    ? item.gallery
    : [];

  const imageArray = Array.isArray(
    item?.images
  )
    ? item.images
    : [];

  const images = [
    imageValue(item?.mainImage),
    imageValue(item?.image),
    imageValue(item?.imageUrl),
    ...imageArray.map(
      imageValue
    ),
    ...gallery.map(
      imageValue
    ),
  ].filter(Boolean);

  /* ---------- Colors ---------- */

  const optionColors =
    Array.isArray(
      item?.options?.colors
    )
      ? item.options.colors
      : [];

  const productColors =
    Array.isArray(item?.colors)
      ? item.colors
      : [];

  const variantColors =
    Array.isArray(item?.variants)
      ? item.variants
          .map((variant) =>
            normalizeColor(
              variant?.color
            )
          )
          .filter(Boolean)
      : [];

  const rawVariants = Array.isArray(item?.variants)
    ? item.variants
    : [];

  const variants = rawVariants
    .map(normalizeVariant)
    .filter(Boolean)
    .filter((variant) => variant.active !== false);

  const optionSizes =
    Array.isArray(item?.options?.sizes)
      ? item.options.sizes
      : [];

  const productSizes =
    Array.isArray(item?.sizes)
      ? item.sizes
      : [];

  const colors = [
    ...optionColors,
    ...productColors,
    ...variantColors,
  ]
    .map(normalizeColor)
    .filter(Boolean);

  const colorOptions = [
    ...optionColors,
    ...productColors.map(normalizeColorOption),
    ...variants.map((variant) => variant.colorOption),
  ]
    .map(normalizeColorOption)
    .filter(Boolean)
    .filter(
      (option, index, array) =>
        index ===
        array.findIndex(
          (other) =>
            sameOption(other, option)
        )
    );

  const sizeOptions = [
    ...optionSizes,
    ...productSizes,
    ...variants.map((variant) => variant.sizeOption),
  ]
    .map(normalizeSizeOption)
    .filter(Boolean)
    .filter(
      (option, index, array) =>
        index ===
        array.findIndex(
          (other) =>
            sameOption(other, option)
        )
    );

  /* ---------- Details ---------- */

  const pattern =
    item?.details?.pattern ||
    item?.pattern ||
    item?.type ||
    getSpecification(
      item,
      "Pattern"
    ) ||
    "";

  const gsm =
    item?.details?.gsm ||
    item?.gsm ||
    getSpecification(
      item,
      "GSM"
    ) ||
    "—";

  const width =
    item?.details?.width ||
    item?.width ||
    getSpecification(
      item,
      "Width"
    ) ||
    "—";

  const composition =
    item?.details?.material ||
    item?.details?.fabric ||
    item?.composition ||
    getSpecification(
      item,
      "Composition"
    ) ||
    "—";

  const moq =
    Number(
      item?.moq ??
        item?.minimumOrderQuantity ??
        item?.minimumOrderQty ??
        item?.inventory
          ?.minimumOrderQuantity ??
        1
    ) || 1;

  return {
    id:
      item?._id ||
      item?.id ||
      item?.slug ||
      Math.random(),

    slug:
      item?.slug ||
      slugify(
        item?.name ||
          item?.productName ||
          item?.title
      ),

    name:
      item?.name ||
      item?.productName ||
      item?.title ||
      "Untitled Product",

    sku:
      item?.sku ||
      "—",

    category: slugify(
      category
    ),

    categoryLabel:
      categoryLabel ||
      category ||
      "",

    categoryKeys: relationCandidates(
      category,
      item?.category,
      item?.categorySlug,
      item?.categoryId,
      item?.categoryName,
      categoryObject?.slug,
      categoryObject?.name,
      categoryObject?.label,
      categoryObject?._id,
      categoryObject?.id
    ),

    subcategory:
      subcategoryKey,

    subcategoryLabel:
      subcategoryObject?.name ||
      subcategoryObject?.label ||
      item?.subcategoryName ||
      item?.subCategoryName ||
      "",

    subcategoryKeys: relationCandidates(
      subcategory,
      item?.subcategory,
      item?.subcategorySlug,
      item?.subcategoryId,
      item?.subcategoryName,
      item?.subCategory,
      item?.subCategorySlug,
      item?.subCategoryId,
      item?.subCategoryName,
      subcategoryObject?.slug,
      subcategoryObject?.name,
      subcategoryObject?.label,
      subcategoryObject?._id,
      subcategoryObject?.id
    ),

    type: slugify(pattern),

    pattern,

    price: finalPrice,

    regularPrice,

    salePrice:
      hasSale
        ? salePrice
        : 0,

    priceUnit:
      item?.priceUnit ||
      item?.pricing?.unit ||
      (item?.sellingMode === "meter"
        ? "Per Meter"
        : "Per Piece"),

    sellingMode:
      item?.sellingMode === "meter"
        ? "meter"
        : "piece",

    badge:
      item?.badge ||
      (Boolean(item?.showOnSale) && hasSale
        ? "Sale"
        : item?.showInNewArrivals
        ? "New Arrival"
        : item?.featured
        ? "Featured"
        : ""),

    gsm,
    width,
    composition,
    moq,

    colors: [
      ...new Set(colors),
    ],

    images:
      images.length > 0
        ? [
            ...new Set(
              images
            ),
          ]
        : [
            "/images/home/products/1.png",
          ],

    description:
      item?.description ||
      item?.details
        ?.description ||
      item?.excerpt ||
      "",

    variants,
    colorOptions,
    sizeOptions:
      item?.sellingMode === "meter"
        ? []
        : sizeOptions,
    variantsEnabled:
      item?.sellingMode === "meter"
        ? false
        : Boolean(
            item?.variantsEnabled ||
              variants.length > 0
          ),

    meterConfig:
      item?.meterConfig || {
        enabled: false,
        minMeters: null,
        maxMeters: null,
        incrementMeters: null,
      },

    inventory:
      item?.inventory ||
      {},

    status:
      item?.status ||
      "published",

    showOnSale:
      Boolean(
        item?.showOnSale
      ),
  };
}

/* =====================================================
   DUMMY FALLBACK DATA
===================================================== */

const DUMMY_CATEGORIES =
  fallbackCategoriesData.map(
    normalizeCategoryWithSubcategories
  );

const normalizedFallbackProducts =
  fallbackProductsData.map(
    normalizeProduct
  );

const DUMMY_PRODUCTS =
  normalizedFallbackProducts.length > 0
    ? Array.from(
        {
          length: Math.max(
            16,
            normalizedFallbackProducts.length
          ),
        },
        (_, index) => {
          const base =
            normalizedFallbackProducts[
              index %
                normalizedFallbackProducts.length
            ];

          return {
            ...base,
            id: `dummy-${index}-${base.id}`,
            dummy: true,
          };
        }
      )
    : [];

/* =====================================================
   SKELETON COMPONENTS
===================================================== */

function SkeletonBox({
  className = "",
}) {
  return (
    <div
      className={`skeleton-box ${className}`}
      aria-hidden="true"
    />
  );
}

function SkeletonSidebar() {
  return (
    <aside className="collection-sidebar skeleton-sidebar">
      <SkeletonBox className="skeleton-sidebar-title" />

      <div className="sidebar-list">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <SkeletonBox
            key={`cat-${index}`}
            className="skeleton-sidebar-item"
          />
        ))}
      </div>

      <div className="sidebar-divider" />

      <SkeletonBox className="skeleton-subtitle" />

      <div className="sidebar-list">
        {Array.from({
          length: 5,
        }).map((_, index) => (
          <SkeletonBox
            key={`sub-${index}`}
            className="skeleton-sidebar-item"
          />
        ))}
      </div>
    </aside>
  );
}

function SkeletonFilterPills() {
  return (
    <div className="filter-scroll skeleton-filter-row">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <SkeletonBox
          key={index}
          className="skeleton-filter-pill"
        />
      ))}
    </div>
  );
}

function SkeletonProductCard({
  index,
}) {
  return (
    <article
      className="product-card skeleton-product-card"
      aria-hidden="true"
    >
      <SkeletonBox className="skeleton-product-image" />

      <div className="product-body skeleton-product-body">
        <SkeletonBox className="skeleton-name" />

        <div className="skeleton-spec-row">
          <SkeletonBox className="skeleton-spec" />
          <SkeletonBox className="skeleton-spec" />
        </div>

        <SkeletonBox className="skeleton-colors" />

        <div className="skeleton-actions">
          <SkeletonBox className="skeleton-action" />
          <SkeletonBox className="skeleton-action" />
        </div>
      </div>
    </article>
  );
}

function SkeletonProductsGrid() {
  return (
    <div className="products-grid">
      {Array.from({
        length: PAGE_SIZE,
      }).map((_, index) => (
        <SkeletonProductCard
          key={index}
          index={index}
        />
      ))}
    </div>
  );
}

/* =====================================================
   PAGE
===================================================== */

function CollectionPageLoader() {
  return (
    <main className="collection-page collection-page--loading" style={{ minHeight: "50vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ height: 28, width: "30%", background: "#e7e0d6", borderRadius: 999, marginBottom: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} style={{ height: 320, borderRadius: 18, background: "#f3efe9", border: "1px solid #e9e0d4" }} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<CollectionPageLoader />}>
      <CollectionPageContent />
    </Suspense>
  );
}

function CollectionPageContent() {
  const params = useParams();

  const searchParams =
    useSearchParams();

  const router = useRouter();

  const {
    addToCart,
    items: cartItems = [],
    updateQuantity,
    removeItem,
  } = useCart();
  const {
    toggleSave: toggleWishlistProduct,
    isSaved: isProductSaved,
  } = useWishlist();

  /* ===================================================
     URL
  =================================================== */

  const categoryId =
    typeof params?.category ===
      "string"
      ? params.category
      : Array.isArray(
          params?.category
        )
      ? params.category[0]
      : "cotton";

  const activeSubcategory =
    searchParams.get(
      "subcategory"
    ) || "";

  const activeSubcategoryKey =
    slugify(
      activeSubcategory
    );

  const activePageRaw = parseInt(
    searchParams.get(
      "page"
    ) || "1",
    10
  );

  const activePage =
    Number.isFinite(
      activePageRaw
    ) &&
    activePageRaw > 0
      ? activePageRaw
      : 1;

  /* ===================================================
     STATES
  =================================================== */

  const [
    categories,
    setCategories,
  ] = useState(
    DUMMY_CATEGORIES
  );

  const [
    products,
    setProducts,
  ] = useState(
    DUMMY_PRODUCTS
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    usingFallback,
    setUsingFallback,
  ] = useState(false);

  const [
    hoveredProduct,
    setHoveredProduct,
  ] = useState(null);

  const [
    cartStates,
    setCartStates,
  ] = useState({});

  const [
    selectedColors,
    setSelectedColors,
  ] = useState({});

  const [
    selectedSizes,
    setSelectedSizes,
  ] = useState({});

  const [
    selectedMeterQuantities,
    setSelectedMeterQuantities,
  ] = useState({});

  const [
    cartMessages,
    setCartMessages,
  ] = useState({});

  const [
    liveCartItems,
    setLiveCartItems,
  ] = useState([]);

  const safeCategories =
    Array.isArray(
      categories
    )
      ? categories
      : DUMMY_CATEGORIES;

  const safeProducts =
    Array.isArray(
      products
    )
      ? products
      : DUMMY_PRODUCTS;

  /* ===================================================
     FETCH BACKEND DATA
  =================================================== */

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadCollection() {
      setLoading(true);

      try {
        const productQuery =
          new URLSearchParams();

        productQuery.set(
          "category",
          categoryId
        );

        productQuery.set(
          "limit",
          "1000"
        );

        /*
          IMPORTANT:
          Subcategory ko backend request me nahi bhej rahe.
          Pehle poori category load hogi.
          Uske baad frontend exact subcategory ke hisaab
          se filter karega.
        */

        const [
          categoryResponse,
          subcategoryResponse,
          productResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/categories`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            }
          ),

          fetch(
            `${API_URL}/subcategories`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            }
          ),

          fetch(
            `${API_URL}/products?${productQuery.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            }
          ),
        ]);

        /* =============================================
           CATEGORY DATA
        ============================================= */

        let mergedCategories =
          [];

        if (
          categoryResponse.ok
        ) {
          const categoryPayload =
            await categoryResponse.json();

          const categoryList =
            extractArray(
              categoryPayload
            ).map(
              normalizeCategoryWithSubcategories
            );

          let subcategoryList =
            [];

          if (
            subcategoryResponse.ok
          ) {
            const subcategoryPayload =
              await subcategoryResponse.json();

            subcategoryList =
              extractArray(
                subcategoryPayload
              ).map(
                normalizeSubcategory
              );
          }

          mergedCategories =
            categoryList.map(
              (category) => {
                const embedded =
                  Array.isArray(
                    category.subcategories
                  )
                    ? category.subcategories
                    : [];

                const external =
                  subcategoryList.filter(
                    (
                      subcategory
                    ) => {
                      if (
                        !subcategory.categoryId
                      ) {
                        return false;
                      }

                      const relation =
                        slugify(
                          subcategory.categoryId
                        );

                      return (
                        relation ===
                          slugify(
                            category.id
                          ) ||
                        relation ===
                          slugify(
                            category.slug
                          )
                      );
                    }
                  );

                const unique = [
                  ...embedded,
                  ...external,
                ].filter(
                  (
                    item,
                    index,
                    array
                  ) =>
                    index ===
                    array.findIndex(
                      (other) =>
                        other.id ===
                        item.id
                    )
                );

                return {
                  ...category,
                  subcategories:
                    unique,
                };
              }
            );
        }

        /* =============================================
           PRODUCT DATA
        ============================================= */

        let productList = [];

        if (
          productResponse.ok
        ) {
          const productPayload =
            await productResponse.json();

          productList =
            extractArray(
              productPayload
            )
              .map(
                normalizeProduct
              )
              .filter(
                (product) =>
                  !product.status ||
                  product.status ===
                    "published"
              );
        }

        /* =============================================
           FALLBACK LOGIC
        ============================================= */

        const hasRealCategories =
          mergedCategories.length >
          0;

        const hasRealProductResponse =
          productResponse.ok;

        const finalCategories =
          hasRealCategories
            ? mergedCategories
            : DUMMY_CATEGORIES;

        const finalProducts =
          hasRealProductResponse
            ? productList
            : DUMMY_PRODUCTS;

        setCategories(
          finalCategories
        );

        setProducts(
          finalProducts
        );

        setUsingFallback(
          !hasRealCategories ||
            !hasRealProductResponse
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Collection API error:",
          error
        );

        /*
          Backend unavailable:
          keep/show dummy data.
        */

        setCategories(
          DUMMY_CATEGORIES
        );

        setProducts(
          DUMMY_PRODUCTS
        );

        setUsingFallback(true);
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadCollection();

    return () =>
      controller.abort();

    /*
      IMPORTANT:
      Only category change refetches.
      Subcategory/page click does NOT
      create layout jump.
    */
  }, [categoryId]);

  /* ===================================================
     ACTIVE CATEGORY
  =================================================== */

  const routeCategoryKeys =
    relationCandidates(categoryId);

  const findCategoryForRoute =
    (list) =>
      list.find((category) =>
        relationCandidates(
          category?.id,
          category?.slug,
          category?.mongoId,
          category?.label,
          category?.name
        ).some((key) =>
          routeCategoryKeys.includes(key)
        )
      );

  const activeCategory =
    findCategoryForRoute(
      safeCategories
    ) ||
    findCategoryForRoute(
      DUMMY_CATEGORIES
    ) ||
    {
      id: categoryId,
      slug: categoryId,
      label: categoryId
        .replace(
          /-/g,
          " "
        )
        .replace(
          /\b\w/g,
          (char) =>
            char.toUpperCase()
        ),
      imageUrl: "",
      image: null,
      homeImageUrl: "",
      subcategories: [],
    };

  /* ===================================================
     SUBCATEGORY KEY
  =================================================== */

  const getSubcategoryKey =
    (subcategory) => {
      if (!subcategory) {
        return "";
      }

      return slugify(
        subcategory.slug ||
          subcategory.id ||
          subcategory._id ||
          subcategory.label ||
          subcategory.name ||
          subcategory.title ||
          ""
      );
    };

  /* ===================================================
     FILTER PRODUCTS
  =================================================== */

  const filteredProducts =
    useMemo(() => {
      const currentCategoryKeys =
        relationCandidates(
          activeCategory?.slug,
          activeCategory?.id,
          activeCategory?.mongoId,
          activeCategory?.label,
          activeCategory?.name
        );

      return safeProducts.filter(
        (product) => {
          /* -------------------------------------------------
             CATEGORY
             Match slug + name + Mongo id + legacy fields.
             A product belongs to the selected category if
             ANY of its known category identifiers matches.
          ------------------------------------------------- */

          const productCategoryKeys =
            relationCandidates(
              ...(Array.isArray(product?.categoryKeys)
                ? product.categoryKeys
                : []),
              product?.category,
              product?.categorySlug,
              product?.categoryId,
              product?.categoryName
            );

          const categoryMatches =
            currentCategoryKeys.length === 0 ||
            productCategoryKeys.some(
              (key) =>
                currentCategoryKeys.includes(key)
            );

          if (!categoryMatches) {
            return false;
          }

          /* -------------------------------------------------
             SUBCATEGORY
             First category must match. Then, when a
             subcategory is selected, require the product's
             subcategory identifiers to match it.
          ------------------------------------------------- */

          if (activeSubcategoryKey) {
            const selectedSubcategoryKeys =
              relationCandidates(
                activeSubcategoryKey
              );

            const productSubcategoryKeys =
              relationCandidates(
                ...(Array.isArray(
                  product?.subcategoryKeys
                )
                  ? product.subcategoryKeys
                  : []),
                product?.subcategory,
                product?.subcategorySlug,
                product?.subcategoryId,
                product?.subcategoryName,
                product?.subCategory,
                product?.subCategorySlug,
                product?.subCategoryId,
                product?.subCategoryName
              );

            const subcategoryMatches =
              selectedSubcategoryKeys.some(
                (key) =>
                  productSubcategoryKeys.includes(
                    key
                  )
              );

            if (!subcategoryMatches) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      safeProducts,
      activeCategory?.id,
      activeCategory?.slug,
      activeCategory?.mongoId,
      activeCategory?.label,
      activeCategory?.name,
      activeSubcategoryKey,
    ]);

  /* ===================================================
     PAGINATION
  =================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredProducts.length /
          PAGE_SIZE
      )
    );

  const safePage = Math.min(
    activePage,
    totalPages
  );

  const pageProducts =
    filteredProducts.slice(
      (safePage - 1) *
        PAGE_SIZE,
      safePage *
        PAGE_SIZE
    );

  /* ===================================================
     PAGINATION ITEMS
  =================================================== */

  const paginationItems =
    useMemo(() => {
      if (
        totalPages <= 7
      ) {
        return Array.from(
          {
            length:
              totalPages,
          },
          (_, index) =>
            index + 1
        );
      }

      if (
        safePage <= 4
      ) {
        return [
          1,
          2,
          3,
          4,
          5,
          "dots",
          totalPages,
        ];
      }

      if (
        safePage >=
        totalPages - 3
      ) {
        return [
          1,
          "dots",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      }

      return [
        1,
        "dots",
        safePage - 1,
        safePage,
        safePage + 1,
        "dots",
        totalPages,
      ];
    }, [
      totalPages,
      safePage,
    ]);

  /* ===================================================
     URL
  =================================================== */

  const buildUrl = ({
    category =
      activeCategory.id,
    subcategory = "",
    page = 1,
  } = {}) => {
    const query =
      new URLSearchParams();

    if (
      subcategory
    ) {
      query.set(
        "subcategory",
        slugify(subcategory)
      );
    }

    if (
      page > 1
    ) {
      query.set(
        "page",
        String(page)
      );
    }

    const queryString =
      query.toString();

    return `/collection/${category}${
      queryString
        ? `?${queryString}`
        : ""
    }`;
  };

  /* ===================================================
     SUBCATEGORY ACTIVE
  =================================================== */

  const isSubcategoryActive =
    (subcategory) => {
      const key =
        getSubcategoryKey(
          subcategory
        );

      return (
        activeSubcategoryKey !==
          "" &&
        activeSubcategoryKey ===
          key
      );
    };

  const toggleSave =
    async (product) => {
      const result = await toggleWishlistProduct(product?.id);
      if (result?.loginRequired) {
        setCardMessage(
          normalizeProductId(product?.id),
          "Please login to save this product"
        );
      } else if (!result?.success) {
        setCardMessage(
          normalizeProductId(product?.id),
          result?.message || "Unable to update saved products"
        );
      } else {
        setCardMessage(normalizeProductId(product?.id), "");
      }
    };

  /* ===================================================
     SECOND IMAGE
  =================================================== */

  const showSecondImage =
    (product) => {
      const images = getDisplayImages(product);
      return (
        hoveredProduct === product.id &&
        Array.isArray(images) &&
        images.length > 1 &&
        images[1]
      );
    };

  /* ===================================================
     MOBILE IMAGE TOGGLE
  =================================================== */

  const handleMobileImageToggle =
    (
      product,
      event
    ) => {
      if (
        typeof window !==
          "undefined" &&
        window
          .matchMedia(
            "(max-width: 900px)"
          )
          .matches &&
        product.images?.length >
          1
      ) {
        event.preventDefault();

        setHoveredProduct(
          (current) =>
            current ===
              product.id
              ? null
              : product.id
        );
      }
    };

  /* ===================================================
     VARIANT + LIVE CART
  =================================================== */

  const normalizeProductId = (value) =>
    String(value || "");

  const getSelectedColor = (product) =>
    selectedColors[
      normalizeProductId(product?.id)
    ] || null;

  const getSelectedSize = (product) =>
    selectedSizes[
      normalizeProductId(product?.id)
    ] || null;

  const getAvailableSizes = (product) => {
    const sizes = Array.isArray(
      product?.sizeOptions
    )
      ? product.sizeOptions
      : [];

    if (
      !product?.variantsEnabled ||
      !product?.variants?.length
    ) {
      return sizes;
    }

    const selectedColor =
      getSelectedColor(product);

    if (!selectedColor) {
      return sizes;
    }

    const filtered = sizes.filter(
      (size) =>
        product.variants.some(
          (variant) =>
            sameOption(
              variant?.colorOption ||
                variant?.color,
              selectedColor
            ) &&
            sameOption(
              variant?.sizeOption ||
                variant?.size,
              size
            )
        )
    );

    return filtered.length > 0
      ? filtered
      : sizes;
  };

  const getSelectedVariant = (product) => {
    const variants = Array.isArray(
      product?.variants
    )
      ? product.variants
      : [];

    if (!variants.length) {
      return null;
    }

    const selectedColor =
      getSelectedColor(product);

    const selectedSize =
      getSelectedSize(product);

    const needsColor =
      product?.colorOptions?.length > 0;

    const needsSize =
      product?.sizeOptions?.length > 0;

    if (!needsColor && !needsSize) return null;

    if (needsColor && !selectedColor) {
      return null;
    }

    if (needsSize && !selectedSize) {
      return null;
    }

    return (
      variants.find((variant) => {
        const colorMatches = needsColor
          ? sameOption(
              variant?.colorOption ||
                variant?.color,
              selectedColor
            )
          : true;

        const sizeMatches = needsSize
          ? sameOption(
              variant?.sizeOption ||
                variant?.size,
              selectedSize
            )
          : true;

        return (
          colorMatches &&
          sizeMatches
        );
      }) || null
    );
  };

  const getProductCartItems = (product) => {
    const productId =
      normalizeProductId(product?.id);

    return (
      Array.isArray(liveCartItems)
        ? liveCartItems
        : Array.isArray(cartItems)
        ? cartItems
        : []
    ).filter(
      (item) =>
        normalizeProductId(
          item?.productId
        ) === productId
    );
  };

  const getCartItemForProduct = (product) => {
    const items =
      getProductCartItems(product);

    if (!items.length) {
      return null;
    }

    const selectedVariant =
      getSelectedVariant(product);

    const wantedColor =
      optionName(
        getSelectedColor(product)
      ).toLowerCase();

    const wantedSize =
      optionName(
        getSelectedSize(product)
      ).toLowerCase();

    if (selectedVariant?.id) {
      const exactVariant =
        items.find(
          (item) =>
            String(
              item?.variantId || ""
            ) ===
            String(selectedVariant.id)
        );

      if (exactVariant) {
        return exactVariant;
      }
    }

    if (
      wantedColor ||
      wantedSize
    ) {
      const matchingLine =
        items.find((item) => {
          const itemColor =
            optionName(
              item?.selectedColor
            ).toLowerCase();

          const itemSize =
            optionName(
              item?.selectedSize
            ).toLowerCase();

          return (
            itemColor === wantedColor &&
            itemSize === wantedSize
          );
        });

      if (matchingLine) {
        return matchingLine;
      }
    }

    return items[0] || null;
  };

  const getCartSelectionForProduct =
    (product) => {
      const items =
        getProductCartItems(product);

      if (!items.length) {
        return null;
      }

      const current =
        getCartItemForProduct(product);

      if (current) {
        return current;
      }

      return items[0];
    };

  const getDisplayPrice = (product) => {
    const variant =
      getSelectedVariant(product);

    if (variant) {
      const regular =
        Number(
          variant.regularPrice || 0
        );

      const sale =
        Number(
          variant.salePrice || 0
        );

      return sale > 0 &&
        regular > 0 &&
        sale < regular
        ? sale
        : regular ||
            product?.price ||
            0;
    }

    return (
      Number(product?.price || 0)
    );
  };

  const getCardPricing = (product) => {
    const variant = getSelectedVariant(product);
    const selectedColor = getSelectedColor(product);

    const regularFromColor =
      selectedColor?.regularPrice != null
        ? Number(selectedColor.regularPrice)
        : 0;

    const saleFromColor =
      selectedColor?.salePrice != null
        ? Number(selectedColor.salePrice)
        : 0;

    const regularFromVariant =
      Number(variant?.regularPrice || 0);

    const saleFromVariant =
      Number(variant?.salePrice || 0);

    const regularPrice =
      regularFromVariant > 0
        ? regularFromVariant
        : regularFromColor > 0
        ? regularFromColor
        : Number(
            product?.regularPrice ||
              product?.price ||
              0
          );

    const salePrice =
      saleFromVariant > 0
        ? saleFromVariant
        : saleFromColor > 0
        ? saleFromColor
        : Number(product?.salePrice || 0);

    const hasSale =
      salePrice > 0 &&
      regularPrice > 0 &&
      salePrice < regularPrice;

    const finalPrice =
      hasSale ? salePrice : regularPrice;

    const discount = hasSale
      ? Math.round(
          ((regularPrice - salePrice) /
            regularPrice) *
            100
        )
      : 0;

    return {
      regularPrice,
      salePrice,
      finalPrice,
      hasSale,
      discount,
    };
  };

  const getMeterConfig = (product) => {
    const config = product?.meterConfig || {};

    const min = Math.max(
      0.01,
      Number(config?.minMeters ?? 1) || 1
    );

    const max = Math.max(
      min,
      Number(config?.maxMeters ?? min) || min
    );

    const step = Math.max(
      0.01,
      Number(config?.incrementMeters ?? 1) || 1
    );

    return { min, max, step };
  };

  const getMeterOptions = (product) => {
    if (product?.sellingMode !== "meter") {
      return [];
    }

    const { min, max, step } =
      getMeterConfig(product);

    const options = [];
    let value = min;
    let guard = 0;

    while (
      value <= max + 0.000001 &&
      guard < 1000
    ) {
      options.push(
        Number(value.toFixed(2))
      );
      value += step;
      guard += 1;
    }

    if (
      options.length === 0 ||
      options[options.length - 1] !==
        Number(max.toFixed(2))
    ) {
      options.push(Number(max.toFixed(2)));
    }

    return [...new Set(options)];
  };

  const getSelectedMeterQuantity = (product) => {
    const id =
      normalizeProductId(product?.id);

    const options =
      getMeterOptions(product);

    const current =
      Number(selectedMeterQuantities[id]);

    if (
      Number.isFinite(current) &&
      options.includes(
        Number(current.toFixed(2))
      )
    ) {
      return current;
    }

    return options[0] || 1;
  };

  const getDisplayImages = (product) => {
    const variant = getSelectedVariant(product);

    if (Array.isArray(variant?.images) && variant.images.length > 0) {
      return variant.images;
    }

    const selectedColor = getSelectedColor(product);
    const colorImages = Array.isArray(selectedColor?.images)
      ? selectedColor.images
          .map((image) =>
            typeof image === "string" ? image : image?.url
          )
          .filter(Boolean)
      : [];

    if (colorImages.length > 0) {
      return colorImages;
    }

    return Array.isArray(product?.images) && product.images.length > 0
      ? product.images
      : ["/images/home/products/1.png"];
  };

  const setCardMessage = (
    productId,
    message
  ) => {
    const id =
      normalizeProductId(
        productId
      );

    setCartMessages(
      (current) => ({
        ...current,
        [id]: message,
      })
    );

    window.setTimeout(() => {
      setCartMessages(
        (current) => {
          if (
            current[id] !==
            message
          ) {
            return current;
          }

          const next = {
            ...current,
          };

          delete next[id];

          return next;
        }
      );
    }, 2600);
  };

  const refreshLiveCart =
    async () => {
      try {
        const response =
          await fetch(
            `${API_URL}/cart`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

        if (response.status === 401) {
          setLiveCartItems([]);
          return;
        }

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        const nextItems =
          Array.isArray(
            data?.items
          )
            ? data.items
            : Array.isArray(
                data?.cart?.items
              )
            ? data.cart.items
            : Array.isArray(
                data?.data?.items
              )
            ? data.data.items
            : [];

        setLiveCartItems(
          nextItems
        );
      } catch {
        /* Keep current CartContext state if live fetch fails. */
      }
    };

  useEffect(() => {
    refreshLiveCart();

    const events = [
      "bf:cart-updated",
      "cart-updated",
      "bf:order-completed",
      "bf:payment-success",
      "order-completed",
      "payment-success",
      "order-placed",
    ];

    const handleCartEvent = () => {
      refreshLiveCart();
    };

    events.forEach(
      (eventName) =>
        window.addEventListener(
          eventName,
          handleCartEvent
        )
    );

    const handleVisibility =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          refreshLiveCart();
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    const interval =
      window.setInterval(
        refreshLiveCart,
        5000
      );

    return () => {
      events.forEach(
        (eventName) =>
          window.removeEventListener(
            eventName,
            handleCartEvent
          )
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

      window.clearInterval(
        interval
      );
    };
  }, []);

  useEffect(() => {
    if (
      !Array.isArray(
        liveCartItems
      ) ||
      !liveCartItems.length
    ) {
      return;
    }

    setSelectedColors(
      (current) => {
        const next = {
          ...current,
        };

        safeProducts.forEach(
          (product) => {
            const cartLines =
              liveCartItems.filter(
                (item) =>
                  normalizeProductId(
                    item?.productId
                  ) ===
                  normalizeProductId(
                    product?.id
                  )
              );

            if (!cartLines.length) {
              return;
            }

            const cartLine =
              cartLines[0];

            const cartColor =
              cartOptionObject(
                cartLine?.selectedColor,
                "color"
              );

            if (cartColor) {
              next[
                normalizeProductId(
                  product?.id
                )
              ] = cartColor;
            }
          }
        );

        return next;
      }
    );

    setSelectedSizes(
      (current) => {
        const next = {
          ...current,
        };

        safeProducts.forEach(
          (product) => {
            const cartLines =
              liveCartItems.filter(
                (item) =>
                  normalizeProductId(
                    item?.productId
                  ) ===
                  normalizeProductId(
                    product?.id
                  )
              );

            if (!cartLines.length) {
              return;
            }

            const cartLine =
              cartLines[0];

            const cartSize =
              cartOptionObject(
                cartLine?.selectedSize,
                "size"
              );

            if (cartSize) {
              next[
                normalizeProductId(
                  product?.id
                )
              ] = cartSize;
            }
          }
        );

        return next;
      }
    );
  }, [
    liveCartItems,
    safeProducts,
  ]);

  const handleSelectColor = (
    product,
    color
  ) => {
    const id =
      normalizeProductId(
        product?.id
      );

    setSelectedColors(
      (current) => ({
        ...current,
        [id]: color,
      })
    );

    const currentSize =
      getSelectedSize(product);

    if (!currentSize) {
      return;
    }

    const valid =
      product?.variants?.some(
        (variant) =>
          sameOption(
            variant?.colorOption ||
              variant?.color,
            color
          ) &&
          sameOption(
            variant?.sizeOption ||
              variant?.size,
            currentSize
          )
      );

    if (!valid) {
      setSelectedSizes(
        (current) => ({
          ...current,
          [id]: null,
        })
      );
    }
  };

  const handleSelectSize = (
    product,
    size
  ) => {
    const id =
      normalizeProductId(
        product?.id
      );

    setSelectedSizes(
      (current) => ({
        ...current,
        [id]: size,
      })
    );
  };

  const handleVariantCartAdd =
    async (product) => {
      const id =
        normalizeProductId(
          product?.id
        );

      if (
        cartStates[id] ===
          "loading" ||
        cartStates[id] ===
          "updating" ||
        cartStates[id] ===
          "removing"
      ) {
        return;
      }

      const selectedColor =
        getSelectedColor(product);

      const selectedSize =
        getSelectedSize(product);

      if (
        product?.colorOptions
          ?.length > 0 &&
        !selectedColor
      ) {
        setCardMessage(
          id,
          "Please select a colour"
        );
        return;
      }

      if (
        product?.sizeOptions
          ?.length > 0 &&
        !selectedSize
      ) {
        setCardMessage(
          id,
          "Please select a size"
        );
        return;
      }

      const selectedVariant =
        getSelectedVariant(
          product
        );

      const isMeter =
        product?.sellingMode === "meter";

      const meterQuantity =
        isMeter
          ? getSelectedMeterQuantity(product)
          : 1;

      if (
        !isMeter &&
        product?.variantsEnabled &&
        (product?.colorOptions?.length > 0 ||
          product?.sizeOptions?.length > 0) &&
        !selectedVariant
      ) {
        setCardMessage(
          id,
          "Please select a valid colour and size"
        );
        return;
      }

      if (
        selectedVariant &&
        Number(
          selectedVariant.stock
        ) <= 0
      ) {
        setCardMessage(
          id,
          "Selected variant is out of stock"
        );
        return;
      }

      setCartStates(
        (current) => ({
          ...current,
          [id]: "loading",
        })
      );

      try {
        const result =
          await addToCart(
            id,
            isMeter
              ? meterQuantity
              : 1,
            {
              selectedColor:
                selectedColor ||
                "",
              selectedSize:
                selectedSize ||
                "",
              variantId:
                selectedVariant?.id ||
                "",
            }
          );

        if (
          result?.loginRequired
        ) {
          setCartStates(
            (current) => ({
              ...current,
              [id]: "idle",
            })
          );

          setCardMessage(
            id,
            "Please login to add this product"
          );

          return;
        }

        if (
          result?.success ===
          false
        ) {
          setCartStates(
            (current) => ({
              ...current,
              [id]: "idle",
            })
          );

          setCardMessage(
            id,
            result?.message ||
              "Failed to add to cart"
          );

          return;
        }

        setCartStates(
          (current) => ({
            ...current,
            [id]: "added",
          })
        );

        await refreshLiveCart();

        window.setTimeout(
          () => {
            setCartStates(
              (current) => ({
                ...current,
                [id]: "idle",
              })
            );
          },
          1200
        );
      } catch (error) {
        console.error(
          "Collection cart add error:",
          error
        );

        setCartStates(
          (current) => ({
            ...current,
            [id]: "idle",
          })
        );

        setCardMessage(
          id,
          "Failed to add to cart"
        );
      }
    };

  const changeCartQuantity =
    async (
      product,
      direction
    ) => {
      const id =
        normalizeProductId(
          product?.id
        );

      const item =
        getCartItemForProduct(
          product
        );

      if (!item) return;

      const isMeter =
        product?.sellingMode === "meter";

      const { min, max, step } =
        isMeter
          ? getMeterConfig(product)
          : {
              min: 1,
              max: Number.POSITIVE_INFINITY,
              step: 1,
            };

      const currentQuantity =
        Math.max(
          min,
          Number(item?.quantity) || min
        );

      if (
        direction === "decrease" &&
        currentQuantity <= min
      ) {
        return;
      }

      const rawNext =
        direction === "increase"
          ? currentQuantity + step
          : currentQuantity - step;

      const nextQuantity = Math.min(
        max,
        Math.max(
          min,
          Number(rawNext.toFixed(2))
        )
      );

      setCartStates(
        (current) => ({
          ...current,
          [id]: "updating",
        })
      );

      try {
        await updateQuantity(
          item?._id,
          nextQuantity
        );

        await refreshLiveCart();

        setCartStates(
          (current) => ({
            ...current,
            [id]: "idle",
          })
        );
      } catch (error) {
        console.error(
          "Collection quantity update error:",
          error
        );

        setCartStates(
          (current) => ({
            ...current,
            [id]: "idle",
          })
        );
      }
    };

  const handleRemoveFromCart =
    async (product) => {
      const id =
        normalizeProductId(
          product?.id
        );

      const item =
        getCartItemForProduct(
          product
        );

      if (!item) return;

      setCartStates(
        (current) => ({
          ...current,
          [id]: "removing",
        })
      );

      try {
        await removeItem(
          item?._id
        );

        await refreshLiveCart();

        setCartStates(
          (current) => ({
            ...current,
            [id]: "idle",
          })
        );
      } catch (error) {
        console.error(
          "Collection cart remove error:",
          error
        );

        setCartStates(
          (current) => ({
            ...current,
            [id]: "idle",
          })
        );
      }
    };

  const getCartControlState =
    (product) => {
      const item =
        getCartItemForProduct(
          product
        );

      const id =
        normalizeProductId(
          product?.id
        );

      return {
        item,
        state:
          cartStates[id] ||
          "idle",
      };
    };

  /* ===================================================
     HERO IMAGE
  =================================================== */

  const heroImage =
    activeCategory.imageUrl ||
    imageValue(
      activeCategory.image
    ) ||
    activeCategory.homeImageUrl ||
    pageProducts[0]
      ?.images?.[0] ||
    "/images/home/products/1.png";

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <main className="collection-page">

      <style>{`

        /* =====================================================
           RESET / GLOBAL
        ===================================================== */

        .collection-page,
        .collection-page *,
        .collection-page *::before,
        .collection-page *::after {
          box-sizing: border-box;
        }

        .collection-page {
          width: 100%;
          min-height: 100vh;
          background: #FAF8F5;
          color: #1A1A1A;
          padding: 20px 0 64px;
          overflow-x: hidden;
        }

        /* =====================================================
           CONTAINER
        ===================================================== */

        .collection-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
        }

        /* =====================================================
           SKELETON
        ===================================================== */

        .skeleton-box {
          display: block;
          background: #ECE5DC;
          border-radius: 8px;
          animation: skeleton-pulse 1.25s ease-in-out infinite;
        }

        @keyframes skeleton-pulse {
          0%,
          100% {
            opacity: 0.55;
          }

          50% {
            opacity: 1;
          }
        }

        /* =====================================================
           BREADCRUMB
        ===================================================== */

        .collection-breadcrumb {
          width: 100%;
          height: 18px;

          display: flex;
          align-items: center;
          flex-wrap: wrap;

          gap: 7px;
          margin-bottom: 18px;

          color: #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 12px;
          line-height: 18px;

          overflow: hidden;
        }

        .collection-breadcrumb a {
          color: #696968;
          text-decoration: none;
          white-space: nowrap;
        }

        .collection-breadcrumb a:hover {
          color: #295C65;
        }

        .collection-breadcrumb-current {
          color: #295C65;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =====================================================
           HERO
        ===================================================== */

        .collection-hero {
          position: relative;
          width: 100%;
          height: 220px;

          overflow: hidden;

          border-radius: 14px;
          margin-bottom: 24px;

          background: #F2EEE9;
        }

        .collection-hero-bg {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;

          opacity: 0.23;
        }

        .collection-hero-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(
                250,
                248,
                245,
                0.97
              ) 0%,
              rgba(
                250,
                248,
                245,
                0.82
              ) 46%,
              rgba(
                250,
                248,
                245,
                0.28
              ) 100%
            );
        }

        .collection-hero-content {
          position: relative;
          z-index: 2;

          width: 100%;
          height: 100%;

          display: flex;
          align-items: center;

          padding: 0 38px;
        }

        .collection-hero-copy {
          width: 100%;
          max-width: 620px;
        }

        .collection-eyebrow {
          margin: 0 0 9px;

          color: #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;
          line-height: 14px;

          font-weight: 600;
          letter-spacing: 3px;

          text-transform: uppercase;
        }

        .collection-hero-title {
          width: 100%;

          margin: 0;

          color: #173C46;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 50px;
          line-height: 49px;
          font-weight: 600;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .collection-hero-rule {
          width: 52px;
          height: 2px;

          background: #BE9D6B;

          margin: 17px 0 15px;
        }

        .collection-hero-description {
          width: 100%;
          max-width: 500px;

          margin: 0;

          color: #646464;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 14px;
          line-height: 22px;
        }

        /* =====================================================
           MAIN LAYOUT
        ===================================================== */

        .collection-layout {
          width: 100%;

          display: grid;

          grid-template-columns:
            250px
            minmax(0, 1fr);

          gap: 24px;

          align-items: start;
        }

        /* =====================================================
           SIDEBAR
        ===================================================== */

        .collection-sidebar {
          width: 100%;
          height: 560px;

          background: #FFFFFF;

          border:
            1px solid
            #ECE6DE;

          border-radius: 13px;

          padding: 16px;

          position: sticky;
          top: 20px;

          overflow-y: auto;
          overflow-x: hidden;

          scrollbar-width: thin;
        }

        .collection-sidebar::-webkit-scrollbar {
          width: 5px;
        }

        .sidebar-title {
          height: 22px;

          margin: 0 0 12px;

          color: #1D3037;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 14px;
          line-height: 22px;

          font-weight: 600;
        }

        .sidebar-divider {
          width: 100%;
          height: 1px;

          margin: 16px 0;

          background: #EDE6DA;
        }

        .sidebar-label {
          height: 18px;

          margin: 0 0 9px;

          color: #1D3037;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 12px;
          line-height: 18px;

          font-weight: 600;
        }

        .sidebar-list {
          width: 100%;

          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .sidebar-link {
          width: 100%;
          height: 39px;
          min-height: 39px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 8px;

          padding: 8px 10px;

          border-radius: 9px;

          color: #5F5F5F;

          text-decoration: none;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 12px;
          line-height: 17px;

          font-weight: 500;

          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .sidebar-link:hover {
          background: #F7F3ED;
          color: #295C65;
        }

        .sidebar-link.active {
          background: #F1E9DF;
          color: #1D3037;
          font-weight: 600;
        }

        .sidebar-link-left {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 10px;
        }

        .sidebar-link-left > span:last-child {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sidebar-icon {
          width: 17px;
          height: 17px;

          color: #667174;

          flex: 0 0 17px;
        }

        .sidebar-link.active .sidebar-icon {
          color: #295C65;
        }

        /* =====================================================
           SIDEBAR SKELETON
        ===================================================== */

        .skeleton-sidebar {
          overflow: hidden;
        }

        .skeleton-sidebar-title {
          width: 110px;
          height: 22px;
          margin-bottom: 12px;
          border-radius: 7px;
        }

        .skeleton-sidebar-item {
          width: 100%;
          height: 39px;
          border-radius: 9px;
        }

        .skeleton-subtitle {
          width: 90px;
          height: 18px;
          margin-bottom: 9px;
          border-radius: 6px;
        }

        /* =====================================================
           MOBILE CATEGORY
        ===================================================== */

        .mobile-category-strip {
          display: none;
        }

        /* =====================================================
           PRODUCTS MAIN
        ===================================================== */

        .products-main {
          width: 100%;
          min-width: 0;
        }

        .products-head {
          width: 100%;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 16px;

          margin-bottom: 11px;
        }

        .products-heading {
          width: 100%;
          max-width: 75%;

          height: 32px;

          margin: 0;

          color: #183842;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 32px;
          line-height: 32px;

          font-weight: 600;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .products-count {
          width: 80px;
          height: 16px;

          flex: 0 0 80px;

          color: #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;
          line-height: 16px;

          text-align: right;
          white-space: nowrap;
        }

        /* =====================================================
           FILTERS
        ===================================================== */

        .filter-scroll {
          width: 100%;
          min-height: 39px;
          height: 39px;

          display: flex;
          align-items: center;

          gap: 9px;

          margin-bottom: 18px;

          overflow-x: auto;
          overflow-y: hidden;

          scrollbar-width: none;
        }

        .filter-scroll::-webkit-scrollbar {
          display: none;
        }

        .filter-pill {
          flex: 0 0 auto;

          min-width: 110px;
          height: 39px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0 18px;

          border:
            1px solid
            #E7DED4;

          border-radius: 999px;

          background: #F6F1EB;

          color: #27353A;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;
          line-height: 1;

          font-weight: 500;

          text-decoration: none;

          white-space: nowrap;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .filter-pill:hover {
          border-color: #BE9D6B;
        }

        .filter-pill.active {
          background: #C39B64;
          border-color: #C39B64;

          color: #FFFFFF;

          font-weight: 600;
        }

        /* =====================================================
           FILTER SKELETON
        ===================================================== */

        .skeleton-filter-row {
          overflow: hidden;
        }

        .skeleton-filter-pill {
          flex: 0 0 auto;

          width: 110px;
          height: 39px;

          border-radius: 999px;
        }

        /* =====================================================
           PRODUCT GRID
        ===================================================== */

        .products-grid {
          width: 100%;

          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap: 16px;
        }

        /* =====================================================
           PRODUCT CARD
        ===================================================== */

        .product-card {
          position: relative;

          width: 100%;
          height: auto;
          min-height: 520px;
          max-height: none;

          background: #FFFFFF;

          border:
            1px solid
            #E8E0D7;

          border-radius: 11px;

          overflow: hidden;

          display: flex;
          flex-direction: column;

          box-shadow: none;

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .product-card:hover {
          transform: translateY(-4px);

          border-color: #DDD2C6;

          box-shadow:
            0 12px 24px
            rgba(
              41,
              92,
              101,
              0.08
            );
        }

        /* =====================================================
           PRODUCT IMAGE
        ===================================================== */

        .product-image-wrap {
          position: relative;

          width: 100%;
          height: 300px;
          min-height: 300px;
          max-height: 300px;

          flex: 0 0 300px;

          overflow: hidden;

          background: #F2EEE9;
        }

        .product-image-wrap > a {
          display: block;

          width: 100%;
          height: 100%;
        }

        .product-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;
          object-position: center;

          transition:
            transform 0.4s ease;
        }

        .product-card:hover
        .product-image {
          transform: scale(1.035);
        }

        .product-image.secondary-image {
          position: absolute;
          inset: 0;

          z-index: 2;

          width: 100%;
          height: 100%;

          object-fit: cover;

          opacity: 1;

          transform: scale(1);

          animation:
            product-image-in
            0.35s
            ease
            both;
        }

        @keyframes product-image-in {
          0% {
            opacity: 0;
          }

          100% {
            opacity: 1;
          }
        }

        /* =====================================================
           SAVE BUTTON
        ===================================================== */

        .save-button {
          position: absolute;

          top: 9px;
          left: 9px;

          z-index: 5;

          width: 32px;
          height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.65
            );

          border-radius: 50%;

          background:
            rgba(
              255,
              255,
              255,
              0.92
            );

          color: #295C65;

          cursor: pointer;

          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .save-button:hover {
          transform: scale(1.08);
        }

        .save-button.is-saved {
          background: #295C65;
          color: #FFFFFF;
          border-color: #295C65;
        }

        /* =====================================================
           PRICE
        ===================================================== */

        .product-price {
          display: none;
        }

        .product-discount-badge {
          position: absolute;

          top: 9px;
          right: 9px;

          z-index: 5;

          height: 30px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          padding: 0 11px;

          border-radius: 999px;

          background: #D85C4A;
          color: #FFFFFF;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10px;
          line-height: 1;

          font-weight: 700;
          letter-spacing: 0.3px;

          white-space: nowrap;
        }

        /* =====================================================
           BADGE
        ===================================================== */

        .product-badge {
          position: absolute;

          left: 9px;
          bottom: 9px;

          z-index: 4;

          height: 25px;

          display: inline-flex;
          align-items: center;

          padding: 0 9px;

          border-radius: 999px;

          background:
            rgba(
              190,
              157,
              107,
              0.95
            );

          color: #FFFFFF;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 9px;
          line-height: 1;

          font-weight: 600;

          white-space: nowrap;
        }

        /* =====================================================
           PRODUCT BODY
        ===================================================== */

        .product-body {
          width: 100%;
          height: auto;
          min-height: 220px;
          max-height: none;

          flex: 1 1 auto;

          display: flex;
          flex-direction: column;

          padding: 12px;

          overflow: hidden;
        }

        .product-name {
          width: 100%;
          height: 40px;
          min-height: 40px;
          max-height: 40px;

          margin: 0 0 10px;

          color: #1A1A1A;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size: 18px;
          line-height: 20px;

          font-weight: 600;

          text-decoration: none;

          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;

          overflow: hidden;
        }

        .product-name:hover {
          color: #295C65;
        }

        .product-price-row {
          width: 100%;
          min-height: 31px;

          display: flex;
          align-items: baseline;
          flex-wrap: wrap;

          gap: 7px;

          margin: 0 0 10px;
        }

        .product-sale-price {
          color: #295C65;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 19px;
          line-height: 24px;
          font-weight: 700;
        }

        .product-actual-price {
          color: #929292;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;
          line-height: 16px;
          font-weight: 500;

          text-decoration: line-through;
        }

        .product-unit {
          color: #777777;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10px;
          line-height: 15px;
          font-weight: 500;
        }

        .product-meter-row {
          width: 100%;
          min-height: 39px;

          display: flex;
          align-items: center;

          gap: 9px;

          margin: 1px 0 9px;
        }

        .product-meter-select {
          min-width: 92px;
          height: 32px;

          padding: 0 28px 0 10px;

          border: 1px solid #295C65;
          border-radius: 7px;

          background: #FFFFFF;
          color: #295C65;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10px;
          font-weight: 600;

          outline: none;
          cursor: pointer;
        }

        .product-meter-select:focus {
          box-shadow:
            0 0 0 2px
            rgba(
              41,
              92,
              101,
              0.12
            );
        }

        /* =====================================================
           SPECS
        =====================================================

        .product-specs {
          width: 100%;
          height: 49px;
          min-height: 49px;
          max-height: 49px;

          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 10px;

          padding-bottom: 10px;

          border-bottom:
            1px solid
            #EEE8E1;
        }

        .product-spec {
          min-width: 0;

          display: flex;
          flex-direction: column;

          gap: 3px;
        }

        .product-spec-label {
          color: #BE9D6B;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 8.5px;
          line-height: 11px;

          font-weight: 600;

          letter-spacing: 1px;
        }

        .product-spec-value {
          color: #2D3538;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 10.5px;
          line-height: 13px;

          font-weight: 500;

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* =====================================================
           COLORS
        ===================================================== */

        .product-colors {
          width: 100%;
          height: 39px;
          min-height: 39px;
          max-height: 39px;

          display: flex;
          align-items: center;

          gap: 7px;

          margin: 9px 0 12px;

          overflow: hidden;
        }

        .product-colors-label {
          flex: 0 0 auto;

          color: #BE9D6B;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 8.5px;
          line-height: 11px;

          font-weight: 600;

          letter-spacing: 1px;
        }

        .product-swatches {
          min-width: 0;

          display: flex;
          align-items: center;

          gap: 5px;

          flex-wrap: nowrap;

          overflow: hidden;
        }

        .product-swatch {
          width: 15px;
          height: 15px;

          flex: 0 0 15px;

          border-radius: 50%;

          border:
            1px solid
            rgba(
              0,
              0,
              0,
              0.12
            );
        }

        /* =====================================================
           PRODUCT ACTIONS
        ===================================================== */

        .product-actions {
          width: 100%;
          height: 34px;
          min-height: 34px;
          max-height: 34px;

          margin-top: auto;

          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 6px;
        }

        .product-action {
          min-width: 0;

          height: 34px;
          min-height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 5px;

          border-radius: 999px;

          padding: 0 8px;

          box-sizing: border-box;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 9.5px;
          line-height: 1;

          font-weight: 600;

          text-decoration: none;

          cursor: pointer;

          white-space: nowrap;

          overflow: hidden;
          text-overflow: ellipsis;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        .product-action:hover {
          transform: translateY(-1px);
        }

        /* =====================================================
           VARIANT SELECTORS
        ===================================================== */

        .product-variant-box {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin: 6px 0 6px;
          padding: 5px 0;
          border-top: 1px solid #EEE8E1;
          border-bottom: 1px solid #EEE8E1;
        }

        .product-variant-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .product-variant-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .product-selected-option {
          min-width: 0;
          max-width: 62%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #696968;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 7px;
          font-weight: 500;
        }

        .product-swatches-selectable {
          gap: 5px;
        }

        .product-swatch-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          color: #FFFFFF;
          cursor: pointer;
          transition:
            transform .18s ease,
            box-shadow .18s ease,
            border-color .18s ease;
        }

        .product-swatch-button:hover {
          transform: scale(1.08);
        }

        .product-swatch-button.is-selected {
          border: 2px solid #295C65;
          box-shadow:
            0 0 0 2px #FFFFFF,
            0 0 0 3px #295C65;
        }

        .product-size-options {
          width: 100%;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
        }

        .product-size-button {
          min-width: 25px;
          height: 20px;
          padding: 0 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #DDD4C9;
          border-radius: 4px;
          background: #FFFFFF;
          color: #295C65;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 7px;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s ease;
        }

        .product-size-button:hover {
          border-color: #295C65;
          transform: translateY(-1px);
        }

        .product-size-button.is-selected {
          background: #295C65;
          color: #FFFFFF;
          border-color: #295C65;
        }

        .product-cart-message {
          position: absolute;
          left: 0;
          bottom: calc(100% + 6px);
          max-width: 100%;
          padding: 5px 8px;
          border-radius: 6px;
          background: #1D3037;
          color: #FFFFFF;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 7px;
          line-height: 1.25;
          white-space: nowrap;
          z-index: 20;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0,0,0,.12);
        }

        /* =====================================================
           CART
        ===================================================== */

        .product-cart {
          position: relative;

          border:
            1px solid
            #295C65;

          background: #295C65;

          color: #FFFFFF;

          overflow: hidden;
        }

        .product-cart:hover {
          background: #214D55;
        }

        .product-cart.is-added {
          background: #BE9D6B;

          border-color: #BE9D6B;
        }

        .product-cart-control {
          position: relative;
          width: 100%;
          min-width: 0;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 2px 5px;
          border: 1px solid #295C65;
          border-radius: 999px;
          background: #295C65;
          color: #FFFFFF;
          overflow: hidden;
        }

        .product-cart-control.is-removing {
          background: #A98755;
          border-color: #A98755;
        }

        .cart-inline-btn,
        .cart-inline-remove {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.16);
          color: #FFFFFF;
          cursor: pointer;
          transition:
            background .18s ease,
            transform .15s ease,
            opacity .18s ease;
        }

        .cart-inline-btn:hover:not(:disabled),
        .cart-inline-remove:hover {
          background: rgba(255,255,255,.28);
          transform: scale(1.06);
        }

        .cart-inline-btn:disabled {
          opacity: .4;
          cursor: not-allowed;
        }

        .cart-inline-number {
          min-width: 17px;
          text-align: center;
          color: #FFFFFF;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 9px;
          font-weight: 700;
        }

        .cart-inline-divider {
          width: 1px;
          height: 17px;
          background: rgba(255,255,255,.28);
          margin: 0 1px;
        }

        .cart-inline-remove {
          background: transparent;
        }


        .cart-button-stage {
          position: relative;

          width: 100%;
          height: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;
        }

        .cart-button-state {
          width: 100%;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 5px;

          white-space: nowrap;
        }

        .cart-button-state.in {
          animation:
            cart-state-in
            0.38s
            cubic-bezier(
              0.2,
              0.8,
              0.25,
              1
            )
            both;
        }

        @keyframes cart-state-in {
          0% {
            opacity: 0;
            transform:
              translateY(
                -110%
              );
          }

          60% {
            opacity: 1;
            transform:
              translateY(8%);
          }

          100% {
            opacity: 1;
            transform:
              translateY(0);
          }
        }

        /* =====================================================
           QUOTE
        ===================================================== */

        .product-quote {
          border:
            1px solid
            #295C65;

          background: #FFFFFF;

          color: #295C65;
        }

        .product-quote:hover {
          background: #295C65;
          color: #FFFFFF;
        }

        /* =====================================================
           SKELETON PRODUCT
        ===================================================== */

        .skeleton-product-card {
          cursor: default;
          transform: none !important;
          box-shadow: none !important;
        }

        .skeleton-product-image {
          width: 100%;
          height: 300px;
          min-height: 300px;
          max-height: 300px;

          border-radius: 0;
        }

        .skeleton-product-body {
          padding: 12px;
        }

        .skeleton-name {
          width: 78%;
          height: 40px;

          margin-bottom: 10px;
          border-radius: 6px;
        }

        .skeleton-spec-row {
          width: 100%;
          height: 49px;

          display: grid;
          grid-template-columns: 1fr 1fr;

          gap: 10px;

          padding-bottom: 10px;

          border-bottom:
            1px solid
            #EEE8E1;
        }

        .skeleton-spec {
          height: 30px;
          border-radius: 6px;
        }

        .skeleton-colors {
          width: 65%;
          height: 20px;

          margin:
            18px 0 21px;

          border-radius: 999px;
        }

        .skeleton-actions {
          width: 100%;
          height: 34px;

          margin-top: auto;

          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 6px;
        }

        .skeleton-action {
          height: 34px;
          border-radius: 999px;
        }

        /* =====================================================
           EMPTY STATE
        ===================================================== */

        .products-empty {
          width: 100%;
          height: 240px;
          min-height: 240px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 30px;

          border:
            1px dashed
            #DCCFC1;

          border-radius: 12px;

          color: #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 13px;
          line-height: 20px;

          text-align: center;
        }

        /* =====================================================
           PAGINATION
        ===================================================== */

        .pagination {
          width: 100%;
          height: 35px;
          min-height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          margin-top: 32px;
        }

        .pagination-button {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 0;

          border:
            1px solid
            #E5DDD4;

          border-radius: 50%;

          background: #FFFFFF;

          color: #295C65;

          cursor: pointer;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 11px;
          line-height: 1;
        }

        .pagination-button.active {
          background: #295C65;
          color: #FFFFFF;
          border-color: #295C65;
        }

        .pagination-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-ellipsis {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size: 12px;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1100px) {

          .collection-layout {
            grid-template-columns:
              220px
              minmax(0, 1fr);

            gap: 18px;
          }

          .products-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .product-card {
            height: 520px;
            min-height: 520px;
            max-height: 520px;
          }

          .collection-hero-title {
            font-size: 44px;
            line-height: 44px;
          }
        }

        /* =====================================================
           SMALL TABLET / MOBILE NAV
        ===================================================== */

        @media (max-width: 900px) {

          .collection-sidebar {
            display: none;
          }

          .collection-layout {
            display: block;
          }

          .mobile-category-strip {
            display: block;

            width: 100%;

            margin-bottom: 18px;
          }

          .mobile-category-scroll {
            width: 100%;

            height: 39px;

            display: flex;

            align-items: center;

            gap: 8px;

            overflow-x: auto;
            overflow-y: hidden;

            padding-bottom: 0;

            scrollbar-width: none;
          }

          .mobile-category-scroll::-webkit-scrollbar {
            display: none;
          }

          .mobile-category-item {
            flex: 0 0 auto;

            height: 34px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            padding: 0 14px;

            border:
              1px solid
              #E7DED4;

            border-radius: 999px;

            background: #FFFFFF;

            color: #5F5F5F;

            font-family:
              "Poppins",
              Arial,
              sans-serif;

            font-size: 10px;
            line-height: 1;

            text-decoration: none;

            white-space: nowrap;
          }

          .mobile-category-item.active {
            background: #295C65;

            border-color: #295C65;

            color: #FFFFFF;
          }

          .products-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap: 10px;
          }

          .product-card {
            height: auto;
            min-height: 430px;
            max-height: none;
          }

          .product-image-wrap {
            height: 230px;
            min-height: 230px;
            max-height: 230px;

            flex-basis: 230px;
          }

          .product-body {
            height: 200px;
            min-height: 200px;
            max-height: 200px;

            flex-basis: 200px;

            padding: 9px;
          }

          .skeleton-product-image {
            height: 230px;
            min-height: 230px;
            max-height: 230px;
          }

          .products-heading {
            font-size: 27px;
            line-height: 32px;
          }

          .products-count {
            width: 70px;
            flex-basis: 70px;
            font-size: 9px;
          }

          .filter-pill {
            min-width: auto;

            height: 32px;

            padding: 0 12px;

            font-size: 9px;
          }

          .filter-scroll {
            height: 32px;
            min-height: 32px;
          }

          .skeleton-filter-pill {
            height: 32px;
            width: 95px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .collection-page {
            padding: 14px 0 40px;
          }

          .collection-container {
            width: 100%;
            max-width: 100%;

            margin: 0;

            padding: 0 16px;
          }

          .collection-breadcrumb {
            height: 15px;

            margin-bottom: 13px;

            font-size: 10px;
            line-height: 15px;
          }

          .collection-hero {
            height: 165px;

            margin-bottom: 18px;

            border-radius: 11px;
          }

          .collection-hero-content {
            padding: 0 19px;
          }

          .collection-eyebrow {
            margin-bottom: 6px;

            font-size: 8px;
            line-height: 10px;

            letter-spacing: 2.2px;
          }

          .collection-hero-title {
            max-width: 90%;

            font-size: 33px;
            line-height: 34px;
          }

          .collection-hero-rule {
            width: 38px;
            height: 1px;

            margin: 10px 0;
          }

          .collection-hero-description {
            max-width: 280px;

            font-size: 10px;
            line-height: 14px;
          }

          .mobile-category-strip {
            margin-bottom: 14px;
          }

          .products-head {
            height: 27px;
            margin-bottom: 9px;
          }

          .products-heading {
            height: 27px;

            font-size: 25px;
            line-height: 27px;
          }

          .products-count {
            height: 14px;

            width: 60px;
            flex-basis: 60px;

            font-size: 9px;
            line-height: 14px;
          }

          .filter-scroll {
            gap: 6px;

            margin-bottom: 13px;
          }

          .products-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap: 10px;
          }

          .product-card {
            height: 430px;
            min-height: 430px;
            max-height: 430px;

            border-radius: 10px;
          }

          .product-image-wrap {
            height: 230px;
            min-height: 230px;
            max-height: 230px;
          }

          .product-body {
            height: auto;
            min-height: 200px;
            max-height: none;

            padding: 9px;
          }

          .save-button {
            top: 7px;
            left: 7px;

            width: 28px;
            height: 28px;
          }

          .product-badge {
            left: 7px;
            bottom: 7px;

            height: 22px;

            padding: 0 7px;

            font-size: 7.5px;
          }

          .product-discount-badge {
            top: 7px;
            right: 7px;

            height: 27px;
            padding: 0 8px;

            font-size: 8.5px;
          }

          .product-name {
            height: 34px;
            min-height: 34px;
            max-height: 34px;

            margin-bottom: 8px;

            font-size: 14px;
            line-height: 17px;
          }

          .product-price-row {
            min-height: 27px;
            gap: 5px;
            margin-bottom: 7px;
          }

          .product-sale-price {
            font-size: 17px;
            line-height: 21px;
          }

          .product-actual-price {
            font-size: 9px;
            line-height: 13px;
          }

          .product-unit {
            font-size: 8.5px;
            line-height: 12px;
          }

          .product-meter-row {
            min-height: 34px;
            gap: 6px;
            margin: 0 0 7px;
          }

          .product-meter-select {
            min-width: 78px;
            height: 29px;

            padding-left: 8px;
            padding-right: 22px;

            font-size: 9px;
          }

          .product-specs {
            height: 42px;
            min-height: 42px;
            max-height: 42px;

            gap: 6px;

            padding-bottom: 8px;
          }

          .product-spec-label {
            font-size: 7px;
            line-height: 9px;
          }

          .product-spec-value {
            font-size: 8.5px;
            line-height: 11px;
          }

          .product-colors {
            height: 33px;
            min-height: 33px;
            max-height: 33px;

            gap: 5px;

            margin:
              7px
              0
              9px;
          }

          .product-colors-label {
            font-size: 7px;
          }

          .product-swatches {
            gap: 4px;
          }

          .product-swatch {
            width: 12px;
            height: 12px;

            flex-basis: 12px;
          }

          .product-actions {
            height: 30px;
            min-height: 30px;
            max-height: 30px;

            gap: 5px;
          }

          .product-action {
            height: 30px;
            min-height: 30px;

            padding: 0 5px;

            font-size: 8px;
          }

          .cart-button-stage {
            height: 13px;
          }

          .pagination {
            height: 31px;
            min-height: 31px;

            margin-top: 24px;

            gap: 6px;
          }

          .pagination-button,
          .pagination-ellipsis {
            width: 31px;
            height: 31px;
          }
        }

        @media (max-width: 600px) {

          .product-variant-box {
            gap: 3px;
            margin: 4px 0 4px;
            padding: 4px 0 3px;
          }

          .product-variant-group {
            gap: 2px;
          }

          .product-selected-option {
            font-size: 5.8px;
          }

          .product-size-button {
            min-width: 21px;
            height: 17px;
            padding: 0 4px;
            font-size: 5.8px;
          }

          .product-swatch-button {
            width: 10px;
            height: 10px;
          }

          .product-cart-control {
            height: 29px;
            gap: 3px;
            padding: 1px 4px;
          }

          .cart-inline-btn,
          .cart-inline-remove {
            width: 19px;
            height: 19px;
            flex-basis: 19px;
          }

          .cart-inline-number {
            min-width: 15px;
            font-size: 8.5px;
          }

          .cart-inline-divider {
            height: 16px;
          }

        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 400px) {

          .collection-container {
            padding: 0 16px;
          }

          .collection-hero {
            height: 150px;
          }

          .collection-hero-title {
            font-size: 29px;
            line-height: 30px;
          }

          .collection-hero-description {
            font-size: 9px;
            line-height: 13px;
          }

          .products-grid {
            gap: 8px;
          }

          .product-card {
            height: auto;
            min-height: 410px;
            max-height: none;
          }

          .product-image-wrap {
            height: 210px;
            min-height: 210px;
            max-height: 210px;
          }

          .product-body {
            height: 200px;
            min-height: 200px;
            max-height: 200px;
          }

          .skeleton-product-image {
            height: 210px;
            min-height: 210px;
            max-height: 210px;
          }

          .product-name {
            font-size: 13px;
            line-height: 16px;
          }

          .product-action {
            font-size: 7.5px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

          .skeleton-box,
          .product-card,
          .product-image,
          .product-image.secondary-image,
          .save-button,
          .product-action,
          .cart-button-state,
          .filter-pill,
          .sidebar-link {
            animation: none !important;
            transition: none !important;
          }
        }

      `}</style>

      {/* ===================================================
          CONTAINER
      =================================================== */}

      <div className="collection-container">

        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <div className="collection-breadcrumb">

          <Link href="/">
            Home
          </Link>

          <span>
            ›
          </span>

          <span>
            Collections
          </span>

          <span>
            ›
          </span>

          <span className="collection-breadcrumb-current">
            {activeCategory.label}
          </span>

        </div>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="collection-hero">

          <div
            className="collection-hero-bg"
            style={{
              backgroundImage:
                `url("${heroImage}")`,
            }}
          />

          <div className="collection-hero-overlay" />

          <div className="collection-hero-content">

            <div className="collection-hero-copy">

              <p className="collection-eyebrow">
                Premium Collection
              </p>

              <h1 className="collection-hero-title">
                {activeCategory.label}
              </h1>

              <div className="collection-hero-rule" />

              <p className="collection-hero-description">
                Soft, breathable and versatile —
                our{" "}
                {String(
                  activeCategory.label ||
                    "fabrics"
                ).toLowerCase()}{" "}
                are perfect for everyday wear
                and premium fashion collections.
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            MOBILE CATEGORY NAV
        ================================================= */}

        <div className="mobile-category-strip">

          <div className="mobile-category-scroll">

            {safeCategories.map(
              (category) => {

                const isActive =
                  slugify(
                    category.id
                  ) ===
                  slugify(
                    activeCategory.id
                  );

                return (
                  <Link
                    key={
                      category.id
                    }
                    href={buildUrl({
                      category:
                        category.id,
                      subcategory:
                        "",
                      page: 1,
                    })}
                    className={
                      `mobile-category-item ${
                        isActive
                          ? "active"
                          : ""
                      }`
                    }
                  >
                    {
                      category.label
                    }
                  </Link>
                );
              }
            )}

          </div>

        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <div className="collection-layout">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          {loading ? (

            <SkeletonSidebar />

          ) : (

            <aside className="collection-sidebar">

              <h3 className="sidebar-title">
                Categories
              </h3>

              {/* CATEGORIES */}

              <div className="sidebar-list">

                {safeCategories.map(
                  (category) => {

                    const Icon =
                      category.id ===
                      "cotton"
                        ? Layers3
                        : category.id ===
                          "printed"
                        ? Sparkles
                        : category.id ===
                          "embroidered"
                        ? Scissors
                        : Shirt;

                    const isActive =
                      slugify(
                        category.id
                      ) ===
                      slugify(
                        activeCategory.id
                      );

                    return (
                      <Link
                        key={
                          category.id
                        }
                        href={buildUrl({
                          category:
                            category.id,
                          subcategory:
                            "",
                          page: 1,
                        })}
                        className={
                          `sidebar-link ${
                            isActive
                              ? "active"
                              : ""
                          }`
                        }
                      >

                        <span className="sidebar-link-left">

                          <Icon
                            className="sidebar-icon"
                          />

                          <span>
                            {
                              category.label
                            }
                          </span>

                        </span>

                        <ChevronRight
                          size={14}
                          className="sidebar-icon"
                        />

                      </Link>
                    );
                  }
                )}

              </div>

              <div className="sidebar-divider" />

              <p className="sidebar-label">
                Sub Categories
              </p>

              {/* SUBCATEGORIES */}

              <div className="sidebar-list">

                {/* ALL */}

                <Link
                  href={buildUrl({
                    category:
                      activeCategory.id,
                    subcategory:
                      "",
                    page: 1,
                  })}
                  className={
                    `sidebar-link ${
                      !activeSubcategoryKey
                        ? "active"
                        : ""
                    }`
                  }
                >

                  <span className="sidebar-link-left">

                    <Leaf
                      className="sidebar-icon"
                    />

                    <span>
                      All
                    </span>

                  </span>

                </Link>

                {/* REAL SUBCATEGORIES */}

                {Array.isArray(
                  activeCategory.subcategories
                ) &&
                  activeCategory.subcategories.map(
                    (subcategory) => {

                      const subcategoryKey =
                        getSubcategoryKey(
                          subcategory
                        );

                      return (
                        <Link
                          key={
                            subcategoryKey
                          }
                          href={buildUrl({
                            category:
                              activeCategory.id,
                            subcategory:
                              subcategoryKey,
                            page: 1,
                          })}
                          className={
                            `sidebar-link ${
                              isSubcategoryActive(
                                subcategory
                              )
                                ? "active"
                                : ""
                            }`
                          }
                        >

                          <span className="sidebar-link-left">

                            <Leaf
                              className="sidebar-icon"
                            />

                            <span>
                              {
                                subcategory.label
                              }
                            </span>

                          </span>

                        </Link>
                      );
                    }
                  )}

              </div>

            </aside>

          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <section className="products-main">

            {/* PRODUCT HEADER */}

            <div className="products-head">

              {loading ? (

                <SkeletonBox
                  className="products-heading"
                />

              ) : (

                <h2 className="products-heading">
                  {
                    activeCategory.label ||
                      "Collection"
                  }
                </h2>

              )}

              {loading ? (

                <SkeletonBox className="products-count" />

              ) : (

                <span className="products-count">
                  {
                    filteredProducts.length
                  }{" "}
                  Products
                </span>

              )}

            </div>

            {/* =================================================
                TOP SUBCATEGORY PILLS
            ================================================= */}

            {loading ? (

              <SkeletonFilterPills />

            ) : (

              <div className="filter-scroll">

                {/* ALL */}

                <Link
                  href={buildUrl({
                    category:
                      activeCategory.id,
                    subcategory:
                      "",
                    page: 1,
                  })}
                  className={
                    `filter-pill ${
                      !activeSubcategoryKey
                        ? "active"
                        : ""
                    }`
                  }
                >
                  {`All ${
                    activeCategory.label ||
                    "Collection"
                  }`}
                </Link>

                {/* REAL SUBCATEGORIES */}

                {Array.isArray(
                  activeCategory.subcategories
                ) &&
                  activeCategory.subcategories.map(
                    (subcategory) => {

                      const key =
                        getSubcategoryKey(
                          subcategory
                        );

                      return (
                        <Link
                          key={key}
                          href={buildUrl({
                            category:
                              activeCategory.id,
                            subcategory:
                              key,
                            page: 1,
                          })}
                          className={
                            `filter-pill ${
                              activeSubcategoryKey ===
                              key
                                ? "active"
                                : ""
                            }`
                          }
                        >
                          {
                            subcategory.label
                          }
                        </Link>
                      );
                    }
                  )}

              </div>

            )}

            {/* =================================================
                PRODUCTS / SKELETON
            ================================================= */}

            {loading ? (

              <SkeletonProductsGrid />

            ) : pageProducts.length ===
              0 ? (

              <div className="products-empty">
                No products found for this
                collection/filter.
              </div>

            ) : (

              <div className="products-grid">

                {pageProducts.map(
                  (product) => {

                    const isSaved =
                      isProductSaved(product.id);

                    const isCartAdded =
                      cartStates[
                        product.id
                      ] ===
                      "added";

                    const cardImages =
                      getDisplayImages(product);

                    const primaryImage =
                      cardImages?.[0] ||
                      "/images/home/products/1.png";

                    const secondaryImage =
                      cardImages?.[1];

                    return (
                      <article
                        key={
                          product.id
                        }
                        className="product-card"

                        onMouseEnter={() =>
                          setHoveredProduct(
                            product.id
                          )
                        }

                        onMouseLeave={() =>
                          setHoveredProduct(
                            null
                          )
                        }
                      >

                        {/* =====================================
                            IMAGE
                        ===================================== */}

                        <div className="product-image-wrap">

                          <Link
                            href={`/products/${product.slug}`}
                            onTouchStart={(
                              event
                            ) =>
                              handleMobileImageToggle(
                                product,
                                event
                              )
                            }
                          >

                            <img
                              src={
                                primaryImage
                              }
                              alt={
                                product.name
                              }
                              className="product-image"
                              loading="lazy"
                            />

                            {showSecondImage(
                              product
                            ) &&
                              secondaryImage && (

                                <img
                                  src={
                                    secondaryImage
                                  }
                                  alt={`${product.name} alternate view`}
                                  className="product-image secondary-image"
                                  loading="lazy"
                                />

                              )}

                          </Link>

                          {/* SAVE */}

                          <button
                            type="button"

                            className={
                              `save-button ${
                                isSaved
                                  ? "is-saved"
                                  : ""
                              }`
                            }

                            onClick={() => toggleSave(product)}

                            aria-label={
                              isSaved
                                ? `Remove ${product.name} from saved items`
                                : `Save ${product.name}`
                            }

                            aria-pressed={
                              isSaved
                            }
                          >

                            <Heart
                              size={15}
                              strokeWidth={2}
                              fill={
                                isSaved
                                  ? "currentColor"
                                  : "none"
                              }
                            />

                          </button>

                          {(() => {
                            const pricing =
                              getCardPricing(product);

                            return (
                              <>
                                {pricing.hasSale ? (
                                  <span className="product-discount-badge">
                                    {pricing.discount}% OFF
                                  </span>
                                ) : product.badge ? (
                                  <span className="product-badge">
                                    {product.badge}
                                  </span>
                                ) : null}
                              </>
                            );
                          })()}

                        </div>

                        {/* =====================================
                            BODY
                        ===================================== */}

                        <div className="product-body">

                          <Link
                            href={`/products/${product.slug}`}
                            className="product-name"
                          >
                            {
                              product.name
                            }
                          </Link>

                          {/* PRICE */}

                          {(() => {
                            const pricing =
                              getCardPricing(product);

                            return (
                              <div className="product-price-row">
                                <span className="product-sale-price">
                                  ₹
                                  {new Intl.NumberFormat(
                                    "en-IN"
                                  ).format(
                                    pricing.finalPrice
                                  )}
                                </span>

                                {pricing.hasSale ? (
                                  <span className="product-actual-price">
                                    ₹
                                    {new Intl.NumberFormat(
                                      "en-IN"
                                    ).format(
                                      pricing.regularPrice
                                    )}
                                  </span>
                                ) : null}

                                <span className="product-unit">
                                  {product.sellingMode === "meter"
                                    ? "/ Meter"
                                    : "/ Piece"}
                                </span>
                              </div>
                            );
                          })()}

                          {/* METER SELECTOR */}

                          {product?.sellingMode === "meter" ? (
                            <div className="product-meter-row">
                              <span className="product-colors-label">
                                METER
                              </span>

                              <select
                                className="product-meter-select"
                                value={getSelectedMeterQuantity(product)}
                                onChange={(event) => {
                                  const value =
                                    Number(event.target.value);

                                  setSelectedMeterQuantities(
                                    (current) => ({
                                      ...current,
                                      [normalizeProductId(product?.id)]:
                                        value,
                                    })
                                  );

                                  setCardMessage(
                                    normalizeProductId(product?.id),
                                    ""
                                  );
                                }}
                                aria-label={`Select meter quantity for ${product.name}`}
                              >
                                {getMeterOptions(product).map(
                                  (meters) => (
                                    <option
                                      key={`${product.id}-meter-${meters}`}
                                      value={meters}
                                    >
                                      {meters} m
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          ) : null}

                          {/* COLOR + SIZE SELECTORS */}

                          {(
                            product.colorOptions?.length > 0 ||
                            product.sizeOptions?.length > 0
                          ) ? (
                            <div className="product-variant-box">

                              {product.colorOptions?.length > 0 ? (
                                <div className="product-variant-group">

                                  <div className="product-variant-header">
                                    <span className="product-colors-label">
                                      COLOR
                                    </span>

                                    <span className="product-selected-option">
                                      {
                                        getSelectedColor(
                                          product
                                        )?.name ||
                                        "Select"
                                      }
                                    </span>
                                  </div>

                                  <div className="product-swatches product-swatches-selectable">
                                    {product.colorOptions
                                      .slice(0, 8)
                                      .map(
                                        (
                                          color,
                                          index
                                        ) => {
                                          const active =
                                            sameOption(
                                              getSelectedColor(
                                                product
                                              ),
                                              color
                                            );

                                          return (
                                            <button
                                              key={`${product.id}-color-${index}`}
                                              type="button"
                                              className={`product-swatch product-swatch-button ${
                                                active
                                                  ? "is-selected"
                                                  : ""
                                              }`}
                                              style={{
                                                backgroundColor:
                                                  color.hex ||
                                                  color.value ||
                                                  color.name ||
                                                  "#D9D9D9",
                                              }}
                                              onClick={() =>
                                                handleSelectColor(
                                                  product,
                                                  color
                                                )
                                              }
                                              title={
                                                color.name ||
                                                color.value
                                              }
                                              aria-label={`Select ${
                                                color.name ||
                                                color.value
                                              }`}
                                              aria-pressed={
                                                active
                                              }
                                            >
                                              {active ? (
                                                <Check
                                                  size={7}
                                                  strokeWidth={2.8}
                                                />
                                              ) : null}
                                            </button>
                                          );
                                        }
                                      )}
                                  </div>

                                </div>
                              ) : null}

                              {product.sellingMode !== "meter" &&
                              product.sizeOptions?.length > 0 ? (
                                <div className="product-variant-group">

                                  <div className="product-variant-header">
                                    <span className="product-colors-label">
                                      SIZE
                                    </span>

                                    <span className="product-selected-option">
                                      {
                                        getSelectedSize(
                                          product
                                        )?.name ||
                                        "Select"
                                      }
                                    </span>
                                  </div>

                                  <div className="product-size-options">
                                    {getAvailableSizes(
                                      product
                                    )
                                      .slice(0, 8)
                                      .map(
                                        (
                                          size,
                                          index
                                        ) => {
                                          const active =
                                            sameOption(
                                              getSelectedSize(
                                                product
                                              ),
                                              size
                                            );

                                          return (
                                            <button
                                              key={`${product.id}-size-${index}`}
                                              type="button"
                                              className={`product-size-button ${
                                                active
                                                  ? "is-selected"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                handleSelectSize(
                                                  product,
                                                  size
                                                )
                                              }
                                              aria-pressed={
                                                active
                                              }
                                            >
                                              {
                                                size.name ||
                                                size.value
                                              }
                                            </button>
                                          );
                                        }
                                      )}
                                  </div>

                                </div>
                              ) : null}

                            </div>
                          ) : (
                            <div className="product-colors">

                              <span className="product-colors-label">
                                COLORS
                              </span>

                              <div className="product-swatches">
                                {(
                                  product.colors ||
                                  []
                                )
                                  .slice(
                                    0,
                                    8
                                  )
                                  .map(
                                    (
                                      color,
                                      index
                                    ) => (
                                      <span
                                        key={`${product.id}-${index}`}
                                        className="product-swatch"
                                        style={{
                                          background:
                                            color,
                                        }}
                                      />
                                    )
                                  )}
                              </div>

                            </div>
                          )}

                          {/* ACTIONS */}

                          <div className="product-actions">

                            {(() => {
                              const {
                                item,
                                state,
                              } =
                                getCartControlState(
                                  product
                                );

                              if (item) {
                                return (
                                  <div
                                    className={`product-cart-control ${
                                      state ===
                                      "removing"
                                        ? "is-removing"
                                        : ""
                                    }`}
                                  >

                                    {state ===
                                    "updating" ? (
                                      <span className="cart-button-state in">
                                        <ShoppingCart
                                          size={11}
                                          strokeWidth={2}
                                        />
                                        Updating...
                                      </span>
                                    ) : state ===
                                      "removing" ? (
                                      <span className="cart-button-state in">
                                        <ShoppingCart
                                          size={11}
                                          strokeWidth={2}
                                        />
                                        Removing...
                                      </span>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          className="cart-inline-btn"
                                          onClick={() =>
                                            changeCartQuantity(
                                              product,
                                              "decrease"
                                            )
                                          }
                                          disabled={
                                            Number(
                                              item?.quantity
                                            ) <= 1
                                          }
                                          aria-label="Decrease quantity"
                                        >
                                          <Minus
                                            size={11}
                                          />
                                        </button>

                                        <span className="cart-inline-number">
                                          {product?.sellingMode === "meter"
                                            ? `${Number(item?.quantity || 1)
                                                .toFixed(2)
                                                .replace(/\.00$/, "")} m`
                                            : item?.quantity || 1}
                                        </span>

                                        <button
                                          type="button"
                                          className="cart-inline-btn"
                                          onClick={() =>
                                            changeCartQuantity(
                                              product,
                                              "increase"
                                            )
                                          }
                                          aria-label="Increase quantity"
                                        >
                                          <Plus
                                            size={11}
                                          />
                                        </button>

                                        <span className="cart-inline-divider" />

                                        <button
                                          type="button"
                                          className="cart-inline-remove"
                                          onClick={() =>
                                            handleRemoveFromCart(
                                              product
                                            )
                                          }
                                          aria-label="Remove from cart"
                                        >
                                          <Trash2
                                            size={11}
                                          />
                                        </button>
                                      </>
                                    )}

                                  </div>
                                );
                              }

                              return (
                                <button
                                  type="button"
                                  className={`product-action product-cart ${
                                    state ===
                                    "added"
                                      ? "is-added"
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleVariantCartAdd(
                                      product
                                    )
                                  }
                                  disabled={
                                    state ===
                                    "loading"
                                  }
                                >
                                  <span className="cart-button-stage">
                                    {state ===
                                    "added" ? (
                                      <span
                                        className="cart-button-state in"
                                        key="added"
                                      >
                                        <Check
                                          size={11}
                                          strokeWidth={2.7}
                                        />
                                        Added
                                      </span>
                                    ) : state ===
                                      "loading" ? (
                                      <span
                                        className="cart-button-state in"
                                        key="loading"
                                      >
                                        <ShoppingCart
                                          size={11}
                                          strokeWidth={2}
                                        />
                                        Adding...
                                      </span>
                                    ) : (
                                      <span
                                        className="cart-button-state in"
                                        key="idle"
                                      >
                                        <ShoppingCart
                                          size={11}
                                          strokeWidth={2}
                                        />
                                        Add to Cart
                                      </span>
                                    )}
                                  </span>
                                </button>
                              );
                            })()}

                            {cartMessages[
                              normalizeProductId(
                                product?.id
                              )
                            ] ? (
                              <span className="product-cart-message">
                                {
                                  cartMessages[
                                    normalizeProductId(
                                      product?.id
                                    )
                                  ]
                                }
                              </span>
                            ) : null}

                            {/* REQUEST QUOTE */}

                            <Link
                              href="/contact"
                              className="product-action product-quote"
                            >
                              Request Quote
                            </Link>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loading &&
              totalPages > 1 && (

                <div className="pagination">

                  {/* PREVIOUS */}

                  <button
                    type="button"

                    className="pagination-button"

                    disabled={
                      safePage === 1
                    }

                    onClick={() =>
                      router.push(
                        buildUrl({
                          category:
                            activeCategory.id,
                          subcategory:
                            activeSubcategoryKey,
                          page:
                            Math.max(
                              1,
                              safePage - 1
                            ),
                        })
                      )
                    }

                    aria-label="Previous page"
                  >
                    <ChevronLeft
                      size={16}
                    />
                  </button>

                  {/* PAGE NUMBERS */}

                  {paginationItems.map(
                    (
                      item,
                      index
                    ) => {

                      if (
                        item ===
                        "dots"
                      ) {
                        return (
                          <span
                            key={`dots-${index}`}
                            className="pagination-ellipsis"
                          >
                            …
                          </span>
                        );
                      }

                      return (
                        <button
                          type="button"
                          key={
                            item
                          }
                          className={
                            `pagination-button ${
                              safePage ===
                              item
                                ? "active"
                                : ""
                            }`
                          }
                          onClick={() =>
                            router.push(
                              buildUrl({
                                category:
                                  activeCategory.id,
                                subcategory:
                                  activeSubcategoryKey,
                                page:
                                  item,
                              })
                            )
                          }
                        >
                          {item}
                        </button>
                      );
                    }
                  )}

                  {/* NEXT */}

                  <button
                    type="button"

                    className="pagination-button"

                    disabled={
                      safePage ===
                      totalPages
                    }

                    onClick={() =>
                      router.push(
                        buildUrl({
                          category:
                            activeCategory.id,
                          subcategory:
                            activeSubcategoryKey,
                          page:
                            Math.min(
                              totalPages,
                              safePage + 1
                            ),
                        })
                      )
                    }

                    aria-label="Next page"
                  >
                    <ChevronRight
                      size={16}
                    />
                  </button>

                </div>

              )}

          </section>

        </div>

      </div>

    </main>
  );
}