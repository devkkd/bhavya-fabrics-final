"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  X,
  Save,
  Loader2,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* =====================================================
   CONFIG
===================================================== */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api"
).replace(/\/$/, "");

const PAGE_SIZE = 10;

/* =====================================================
   EMPTY PRODUCT
===================================================== */

const EMPTY_PRODUCT = {
  title: "",
  slug: "",
  sku: "",

  shortDescription: "",
  description: "",

  category: "",
  subCategory: "",

  mainImage: {
    url: "",
    cloudflareId: "",
    alt: "",
    position: 0,
  },

  gallery: [],

  sellingMode: "piece",
  bulkOrderNote: "Contact us for bulk orders.",

  meterConfig: {
    enabled: false,
    foldLength: "",
    minMeters: "",
    maxMeters: "",
    incrementMeters: "",
  },

  shippingRules: [],

  pricing: {
    regularPrice: "",
    salePrice: "",
  },

  variantsEnabled: false,

  options: {
    colors: [],
    sizes: [],
  },

  variants: [],

  inventory: {
    trackStock: true,
    mode: "single",
    stock: 1,
    maxQuantityPerOrder: 1,
  },

  details: {
    material: "",
    fabric: "",
    pattern: "",
    careInstructions: "",
  },

  specifications: [],

  tags: [],

  showOnHome: false,
  showInNewArrivals: false,
  showOnSale: false,
  featured: false,

  status: "draft",

  metaTitle: "",
  metaDescription: "",
};

/* =====================================================
   HELPERS
===================================================== */

function createId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cloneEmptyProduct() {
  return {
    ...EMPTY_PRODUCT,

    mainImage: {
      ...EMPTY_PRODUCT.mainImage,
    },

    pricing: {
      ...EMPTY_PRODUCT.pricing,
    },

    meterConfig: {
      ...EMPTY_PRODUCT.meterConfig,
    },

    shippingRules: [],

    options: {
      colors: [],
      sizes: [],
    },

    variants: [],

    inventory: {
      ...EMPTY_PRODUCT.inventory,
    },

    details: {
      ...EMPTY_PRODUCT.details,
    },

    gallery: [],
    specifications: [],
    tags: [],
  };
}

function getApiError(
  response,
  payload,
  fallback
) {
  if (payload?.message) {
    return payload.message;
  }

  if (response?.status === 401) {
    return "Your admin session has expired. Please log in again.";
  }

  if (response?.status === 403) {
    return "You do not have access to this admin section.";
  }

  return fallback;
}

function getId(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return String(
      value?._id ||
        value?.id ||
        value?.slug ||
        ""
    );
  }

  return String(value);
}

function getName(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return (
      value?.name ||
      value?.label ||
      value?.title ||
      ""
    );
  }

  return String(value);
}

/* =====================================================
   STABLE FORM COMPONENTS
===================================================== */

function Toggle({
  value,
  onChange,
}) {
  return (
    <button
      type="button"
      className={`admin-toggle ${
        value ? "is-on" : ""
      }`}
      onClick={() =>
        onChange(!value)
      }
      aria-pressed={value}
      title={value ? "On" : "Off"}
    >
      <span className="admin-toggle-knob" />
    </button>
  );
}

function Section({
  id,
  title,
  open,
  onToggle,
  children,
}) {
  return (
    <section
      className={`product-section ${
        open ? "is-open" : ""
      }`}
    >
      <button
        type="button"
        className="product-section-header"
        onClick={() =>
          onToggle(id)
        }
      >
        <span>{title}</span>

        {open ? (
          <ChevronUp size={17} />
        ) : (
          <ChevronDown size={17} />
        )}
      </button>

      {open && (
        <div className="product-section-body">
          {children}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div className="form-field">
      <label className="form-label">
        {label}

        {required && (
          <span className="required-mark">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
  required = false,
  disabled = false,
}) {
  return (
    <input
      className="admin-input"
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      min={min}
      step={step}
      required={required}
      disabled={disabled}
    />
  );
}

function SelectInput({
  value,
  onChange,
  children,
  disabled = false,
  required = false,
}) {
  return (
    <select
      className="admin-input admin-select"
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      required={required}
    >
      {children}
    </select>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}) {
  return (
    <textarea
      className="admin-input admin-textarea"
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

/* =====================================================
   SKELETON
===================================================== */

function SkeletonRow() {
  return (
    <tr className="skeleton-row">
      <td>
        <div className="skeleton-product-cell">
          <div className="skeleton-box skeleton-image-sm" />

          <div className="skeleton-text-group">
            <div className="skeleton-box skeleton-line wide" />
            <div className="skeleton-box skeleton-line small" />
          </div>
        </div>
      </td>

      <td>
        <div className="skeleton-box skeleton-line medium" />
      </td>

      <td>
        <div className="skeleton-box skeleton-line small" />
      </td>

      <td>
        <div className="skeleton-box skeleton-line small" />
      </td>

      <td>
        <div className="skeleton-box skeleton-pill" />
      </td>

      <td>
        <div className="skeleton-box skeleton-pill" />
      </td>

      <td>
        <div className="skeleton-box skeleton-pill" />
      </td>

      <td>
        <div className="skeleton-box skeleton-pill" />
      </td>

      <td>
        <div className="skeleton-box skeleton-status" />
      </td>

      <td>
        <div className="skeleton-box skeleton-actions" />
      </td>
    </tr>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function ProductsPage() {
  /* ===================================================
     DATA
  =================================================== */

  const [products, setProducts] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [subCategories, setSubCategories] =
    useState([]);

  /* ===================================================
     LOADING
  =================================================== */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState("");

  /* ===================================================
     TOOLBAR
  =================================================== */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [categoryFilter, setCategoryFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);

  /* ===================================================
     FORM
  =================================================== */

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [form, setForm] =
    useState(
      cloneEmptyProduct()
    );

  /* ===================================================
     UPLOAD
  =================================================== */

  const [uploadingMain, setUploadingMain] =
    useState(false);

  const [uploadingGallery, setUploadingGallery] =
    useState(false);

  /* ===================================================
     UI
  =================================================== */

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [openSections, setOpenSections] =
    useState({
      basic: true,
      images: true,
      pricing: true,
      selling: true,
      variants: true,
      inventory: true,
      details: false,
      specifications: false,
      visibility: true,
      seo: false,
    });

  /* ===================================================
     LOCK PAGE SCROLL WHEN MODAL OPEN
  =================================================== */

  useEffect(() => {
    if (!formOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [formOpen]);

  /* ===================================================
     SUCCESS
  =================================================== */

  const showSuccess = (message) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 2500);
  };

  /* ===================================================
     LOAD PRODUCTS
  =================================================== */

  const loadProducts = async () => {
    const response = await fetch(
      `${API_URL}/products/admin/all`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        getApiError(
          response,
          data,
          "Failed to fetch products"
        )
      );
    }

    setProducts(
      Array.isArray(data.products)
        ? data.products
        : []
    );
  };

  /* ===================================================
     LOAD CATEGORIES
  =================================================== */

  const loadCategories = async () => {
    const response = await fetch(
      `${API_URL}/categories/admin/all`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        getApiError(
          response,
          data,
          "Failed to fetch categories"
        )
      );
    }

    setCategories(
      Array.isArray(data.categories)
        ? data.categories
        : []
    );
  };

  /* ===================================================
     LOAD SUBCATEGORIES
  =================================================== */

  const loadSubCategories = async () => {
    const response = await fetch(
      `${API_URL}/subcategories/admin/all`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        getApiError(
          response,
          data,
          "Failed to fetch subcategories"
        )
      );
    }

    setSubCategories(
      Array.isArray(
        data.subCategories
      )
        ? data.subCategories
        : []
    );
  };

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      setError("");

      try {
        await Promise.all([
          loadProducts(),
          loadCategories(),
          loadSubCategories(),
        ]);
      } catch (loadError) {
        if (mounted) {
          setError(
            loadError?.message ||
              "Failed to load products"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================================================
     AVAILABLE SUBCATEGORIES
  =================================================== */

  const availableSubCategories =
    useMemo(() => {
      if (!form.category) {
        return [];
      }

      const selectedCategory =
        categories.find(
          (category) =>
            category._id ===
            form.category
        );

      return subCategories.filter(
        (item) => {
          const relation =
            item?.category;

          const relationId =
            getId(relation);

          const relationSlug =
            typeof relation ===
            "object"
              ? relation?.slug
              : "";

          return (
            relationId ===
              form.category ||
            relationSlug ===
              selectedCategory?.slug
          );
        }
      );
    }, [
      form.category,
      categories,
      subCategories,
    ]);

  /* ===================================================
     FILTER PRODUCTS
  =================================================== */

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
          const title =
            product?.title ||
            "";

          const sku =
            product?.sku ||
            "";

          const matchesSearch =
            !keyword ||
            title
              .toLowerCase()
              .includes(keyword) ||
            sku
              .toLowerCase()
              .includes(keyword);

          const matchesStatus =
            statusFilter ===
              "all" ||
            product.status ===
              statusFilter;

          const productCategory =
            getId(
              product?.category
            );

          const matchesCategory =
            categoryFilter ===
              "all" ||
            productCategory ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
          );
        }
      );
    }, [
      products,
      search,
      statusFilter,
      categoryFilter,
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
    currentPage,
    totalPages
  );

  const pageProducts =
    filteredProducts.slice(
      (safePage - 1) *
        PAGE_SIZE,
      safePage *
        PAGE_SIZE
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    categoryFilter,
  ]);

  /* ===================================================
     CREATE
  =================================================== */

  const openCreate = () => {
    setEditingProduct(null);

    setForm(
      cloneEmptyProduct()
    );

    setError("");

    setOpenSections({
      basic: true,
      images: true,
      pricing: true,
      selling: true,
      variants: true,
      inventory: true,
      details: false,
      specifications: false,
      visibility: true,
      seo: false,
    });

    setFormOpen(true);
  };

  /* ===================================================
     EDIT
  =================================================== */

  const openEdit = (product) => {
    setEditingProduct(product);

    setForm({
      ...cloneEmptyProduct(),

      ...product,

      category:
        getId(
          product?.category
        ),

      subCategory:
        getId(
          product?.subCategory ||
            product?.subcategory
        ),

      mainImage: {
        ...EMPTY_PRODUCT.mainImage,
        ...(product?.mainImage ||
          {}),
      },

      gallery:
        Array.isArray(
          product?.gallery
        )
          ? product.gallery.map(
              (image, index) => ({
                ...image,
                _uiId:
                  image?.cloudflareId ||
                  image?.url ||
                  createId(
                    `gallery-${index}`
                  ),
                position:
                  Number.isFinite(
                    image?.position
                  )
                    ? image.position
                    : index,
              })
            )
          : [],

      pricing: {
        ...EMPTY_PRODUCT.pricing,
        ...(product?.pricing ||
          {}),
      },

      sellingMode:
        product?.sellingMode ||
        "piece",

      bulkOrderNote:
        product?.bulkOrderNote ||
        "Contact us for bulk orders.",

      meterConfig: {
        ...EMPTY_PRODUCT.meterConfig,
        ...(product?.meterConfig ||
          {}),
      },

      shippingRules:
        Array.isArray(
          product?.shippingRules
        )
          ? product.shippingRules.map((rule, index) => ({
              ...rule,
              _uiId:
                rule?._uiId ||
                createId(`shipping-${index}`),
            }))
          : [],

      options: {
        colors:
          Array.isArray(
            product?.options?.colors
          )
            ? product.options.colors.map(
                (color, index) => ({
                  ...color,
                  _uiId:
                    color?._uiId ||
                    createId(
                      `color-${index}`
                    ),
                })
              )
            : [],

        sizes:
          Array.isArray(
            product?.options?.sizes
          )
            ? product.options.sizes.map(
                (size, index) => ({
                  ...size,
                  _uiId:
                    size?._uiId ||
                    createId(
                      `size-${index}`
                    ),
                })
              )
            : [],
      },

      variants:
        Array.isArray(
          product?.variants
        )
          ? product.variants.map(
              (
                variant,
                index
              ) => ({
                ...variant,
                _uiId:
                  variant?._uiId ||
                  variant?._id ||
                  createId(
                    `variant-${index}`
                  ),
              })
            )
          : [],

      inventory: {
        ...EMPTY_PRODUCT.inventory,
        ...(product?.inventory ||
          {}),
      },

      details: {
        ...EMPTY_PRODUCT.details,
        ...(product?.details ||
          {}),
      },

      specifications:
        Array.isArray(
          product?.specifications
        )
          ? product.specifications.map(
              (
                item,
                index
              ) => ({
                ...item,
                _uiId:
                  item?._uiId ||
                  createId(
                    `spec-${index}`
                  ),
              })
            )
          : [],

      tags:
        Array.isArray(
          product?.tags
        )
          ? product.tags
          : [],

      metaTitle:
        product?.metaTitle ||
        "",

      metaDescription:
        product?.metaDescription ||
        "",

      showOnHome:
        Boolean(
          product?.showOnHome
        ),

      showInNewArrivals:
        Boolean(
          product?.showInNewArrivals
        ),

      /*
        IMPORTANT:
        Sale toggle is loaded from backend.
      */
      showOnSale:
        Boolean(
          product?.showOnSale
        ),

      featured:
        Boolean(
          product?.featured
        ),
    });

    setError("");

    setOpenSections({
      basic: true,
      images: true,
      pricing: true,
      selling: true,
      variants: true,
      inventory: true,
      details: true,
      specifications: false,
      visibility: true,
      seo: false,
    });

    setFormOpen(true);
  };

  /* ===================================================
     CLOSE
  =================================================== */

  const closeForm = () => {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingProduct(null);
    setError("");
  };

  /* ===================================================
     UPDATE ROOT
  =================================================== */

  const updateForm = (
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,
        [key]: value,
      })
    );
  };

  /* ===================================================
     UPDATE PRICING
  =================================================== */

  const updatePricing = (
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        pricing: {
          ...prev.pricing,
          [key]: value,
        },
      })
    );
  };

  /* ===================================================
     UPDATE INVENTORY
  =================================================== */

  const updateInventory = (
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        inventory: {
          ...prev.inventory,
          [key]: value,
        },
      })
    );
  };

  /* ===================================================
     UPDATE DETAILS
  =================================================== */

  const updateDetails = (
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        details: {
          ...prev.details,
          [key]: value,
        },
      })
    );
  };

  /* ===================================================
     IMAGE UPLOAD
  =================================================== */

  const uploadImage = async (
    file,
    type = "product"
  ) => {
    if (!file) {
      return null;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "type",
      type
    );

    formData.append(
      "filename",
      file.name
    );

    const response =
      await fetch(
        `${API_URL}/uploads/direct`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

    let data = {};

    try {
      data =
        await response.json();
    } catch {
      data = {};
    }

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data?.message ||
          "Failed to upload image"
      );
    }

    const upload =
      data?.upload ||
      data;

    return {
      url:
        upload?.url ||
        upload?.imageUrl ||
        upload?.deliveryUrl ||
        "",

      cloudflareId:
        upload?.cloudflareId ||
        upload?.imageId ||
        data?.cloudflareId ||
        data?.imageId ||
        "",

      alt:
        file.name,

      position: 0,
    };
  };

  /* ===================================================
     MAIN IMAGE
  =================================================== */

  const handleMainImage = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      setUploadingMain(true);
      setError("");

      const image =
        await uploadImage(
          file,
          "product"
        );

      setForm(
        (prev) => ({
          ...prev,

          mainImage: {
            ...image,

            alt:
              prev.mainImage?.alt ||
              file.name,

            position: 0,
          },
        })
      );

      showSuccess(
        "Main image uploaded"
      );
    } catch (uploadError) {
      setError(
        uploadError?.message ||
          "Image upload failed"
      );
    } finally {
      setUploadingMain(false);
    }
  };

  /* ===================================================
     GALLERY
  =================================================== */

  const handleGalleryImages =
    async (event) => {
      const files =
        Array.from(
          event.target.files ||
            []
        );

      event.target.value = "";

      if (!files.length) {
        return;
      }

      try {
        setUploadingGallery(
          true
        );

        setError("");

        const uploaded = [];

        for (
          const file of files
        ) {
          const image =
            await uploadImage(
              file,
              "product"
            );

          uploaded.push({
            ...image,
            _uiId:
              createId(
                "gallery"
              ),
          });
        }

        setForm(
          (prev) => ({
            ...prev,

            gallery: [
              ...(prev.gallery ||
                []),

              ...uploaded.map(
                (
                  image,
                  index
                ) => ({
                  ...image,

                  position:
                    (prev.gallery
                      ?.length ||
                      0) +
                    index,
                })
              ),
            ],
          })
        );

        showSuccess(
          `${uploaded.length} gallery image${
            uploaded.length !== 1
              ? "s"
              : ""
          } uploaded`
        );
      } catch (uploadError) {
        setError(
          uploadError?.message ||
            "Gallery upload failed"
        );
      } finally {
        setUploadingGallery(
          false
        );
      }
    };

  /* ===================================================
     REMOVE GALLERY
  =================================================== */

  const removeGalleryImage = (
    index
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        gallery:
          prev.gallery
            .filter(
              (
                _,
                itemIndex
              ) =>
                itemIndex !==
                index
            )
            .map(
              (
                image,
                itemIndex
              ) => ({
                ...image,
                position:
                  itemIndex,
              })
            ),
      })
    );
  };

  /* ===================================================
     COLORS
  =================================================== */

  const addColor = (
    custom = false
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        options: {
          ...prev.options,

          colors: [
            ...(prev.options
              ?.colors || []),

            {
              _uiId:
                createId(
                  "color"
                ),

              name: custom
                ? ""
                : "New Color",

              value: "",
              hex: "",
              regularPrice: "",
              salePrice: "",
              images: [],

              isCustom: custom,
            },
          ],
        },
      })
    );
  };

  const updateColor = (
    index,
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        options: {
          ...prev.options,

          colors:
            prev.options.colors.map(
              (
                color,
                colorIndex
              ) =>
                colorIndex ===
                index
                  ? {
                      ...color,
                      [key]:
                        value,
                    }
                  : color
            ),
        },
      })
    );
  };

  const removeColor = (
    index
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        options: {
          ...prev.options,

          colors:
            prev.options.colors.filter(
              (
                _,
                colorIndex
              ) =>
                colorIndex !==
                index
            ),
        },
      })
    );
  };

  const uploadColorImages = async (index, files) => {
    const selectedFiles = Array.from(files || []).filter(Boolean);
    if (!selectedFiles.length) return;

    try {
      setUploadingGallery(true);
      setError("");

      const uploaded = [];
      for (const file of selectedFiles) {
        const image = await uploadImage(file, "product");
        uploaded.push({
          ...image,
          _uiId: createId("color-image"),
        });
      }

      setForm((prev) => ({
        ...prev,
        options: {
          ...prev.options,
          colors: prev.options.colors.map((color, colorIndex) =>
            colorIndex === index
              ? {
                  ...color,
                  images: [
                    ...(Array.isArray(color.images) ? color.images : []),
                    ...uploaded,
                  ],
                }
              : color
          ),
        },
        variants: (prev.variants || []).map((variant) => {
          const variantColor = String(
            variant?.color?.name || variant?.color?.value || ""
          ).trim().toLowerCase();
          const targetColor = String(
            prev.options.colors?.[index]?.name || ""
          ).trim().toLowerCase();
          return variantColor && variantColor === targetColor
            ? {
                ...variant,
                images: [
                  ...(Array.isArray(variant.images) ? variant.images : []),
                  ...uploaded,
                ],
              }
            : variant;
        }),
      }));

      showSuccess(`${uploaded.length} colour image${uploaded.length !== 1 ? "s" : ""} uploaded`);
    } catch (uploadError) {
      setError(uploadError?.message || "Colour image upload failed");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleColorDrop = (colorIndex, event) => {
    event.preventDefault();
    event.stopPropagation();
    uploadColorImages(colorIndex, event.dataTransfer?.files);
  };

  const removeColorImage = (colorIndex, imageIndex) => {
    setForm((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        colors: prev.options.colors.map((color, index) =>
          index === colorIndex
            ? {
                ...color,
                images: (color.images || []).filter(
                  (_, currentIndex) => currentIndex !== imageIndex
                ),
              }
            : color
        ),
      },
      variants: (prev.variants || []).map((variant) => {
        const variantColor = String(
          variant?.color?.name || variant?.color?.value || ""
        ).trim().toLowerCase();
        const targetColor = String(
          prev.options.colors?.[colorIndex]?.name || ""
        ).trim().toLowerCase();
        if (variantColor !== targetColor) return variant;
        return {
          ...variant,
          images: (variant.images || []).filter((image) => {
            const targetImage = prev.options.colors?.[colorIndex]?.images?.[imageIndex];
            return !targetImage || (image?.url || image) !== (targetImage?.url || targetImage);
          }),
        };
      }),
    }));
  };

  const updateShippingRule = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      shippingRules: (prev.shippingRules || []).map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [key]: value } : rule
      ),
    }));
  };

  const addShippingRule = (type = "size") => {
    setForm((prev) => ({
      ...prev,
      shippingRules: [
        ...(prev.shippingRules || []),
        {
          _uiId: createId("shipping"),
          type,
          label: "",
          sizeName: "",
          minMeters: "",
          maxMeters: "",
          minQuantity: "",
          maxQuantity: "",
          standardCharge: "",
          expressCharge: "",
        },
      ],
    }));
  };

  const removeShippingRule = (index) => {
    setForm((prev) => ({
      ...prev,
      shippingRules: (prev.shippingRules || []).filter(
        (_, ruleIndex) => ruleIndex !== index
      ),
    }));
  };

  /* ===================================================
     SIZES
  =================================================== */

  const addSize = (
    custom = false
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        options: {
          ...prev.options,

          sizes: [
            ...(prev.options
              ?.sizes || []),

            {
              _uiId:
                createId(
                  "size"
                ),

              name: custom
                ? ""
                : "M",

              isCustom: custom,
              details: "",
              shippingCharge: "",
              meters:
                form.sellingMode === "meter"
                  ? ""
                  : null,
            },
          ],
        },
      })
    );
  };

  const updateSize = (
    index,
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,
        options: {
          ...prev.options,
          sizes:
            prev.options.sizes.map(
              (
                size,
                sizeIndex
              ) =>
                sizeIndex === index
                  ? {
                      ...size,
                      [key]: value,
                    }
                  : size
            ),
        },
      })
    );
  };

  const removeSize = (
    index
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        options: {
          ...prev.options,

          sizes:
            prev.options.sizes.filter(
              (
                _,
                sizeIndex
              ) =>
                sizeIndex !==
                index
            ),
        },
      })
    );
  };

  /* ===================================================
     VARIANTS
  =================================================== */

  const generateVariants = () => {
    const colors = Array.isArray(form.options?.colors)
      ? form.options.colors.filter((color) => color?.name?.trim())
      : [];

    const sizes = Array.isArray(form.options?.sizes)
      ? form.options.sizes.filter((size) => size?.name?.trim())
      : [];

    if (!colors.length && !sizes.length) {
      setError("Add at least one colour or size first.");
      return;
    }

    const existing = new Map(
      (form.variants || []).map((variant) => {
        const colorKey = String(
          variant?.color?.name ||
            variant?.color?.value ||
            ""
        ).trim().toLowerCase();

        const sizeKey = String(
          variant?.size?.name ||
            variant?.size?.value ||
            ""
        ).trim().toLowerCase();

        return [`${colorKey}__${sizeKey}`, variant];
      })
    );

    const generated = [];

    if (colors.length && sizes.length) {
      colors.forEach((color) => {
        sizes.forEach((size) => {
          const key =
            `${String(color.name).trim().toLowerCase()}__` +
            `${String(size.name).trim().toLowerCase()}`;

          const old = existing.get(key);

          generated.push({
            ...(old || {}),
            _uiId: old?._uiId || createId("variant"),
            color: { ...color },
            size: { ...size },
            regularPrice:
              old?.regularPrice ??
              color?.regularPrice ??
              size?.regularPrice ??
              null,
            salePrice:
              old?.salePrice ??
              color?.salePrice ??
              size?.salePrice ??
              null,
            stock: old?.stock ?? 1,
            sku: old?.sku || "",
            images:
              Array.isArray(old?.images) && old.images.length
                ? old.images
                : Array.isArray(color?.images)
                  ? color.images
                  : [],
            active: old?.active !== false,
          });
        });
      });
    } else if (colors.length) {
      colors.forEach((color) => {
        const key =
          `${String(color.name).trim().toLowerCase()}__`;

        const old = existing.get(key);

        generated.push({
          ...(old || {}),
          _uiId: old?._uiId || createId("variant"),
          color: { ...color },
          size: undefined,
          regularPrice:
            old?.regularPrice ??
            color?.regularPrice ??
            null,
          salePrice:
            old?.salePrice ??
            color?.salePrice ??
            null,
          stock: old?.stock ?? 1,
          sku: old?.sku || "",
          images:
            Array.isArray(old?.images) && old.images.length
              ? old.images
              : Array.isArray(color?.images)
                ? color.images
                : [],
          active: old?.active !== false,
        });
      });
    } else {
      sizes.forEach((size) => {
        const key =
          `__${String(size.name).trim().toLowerCase()}`;

        const old = existing.get(key);

        generated.push({
          ...(old || {}),
          _uiId: old?._uiId || createId("variant"),
          color: undefined,
          size: { ...size },
          regularPrice:
            old?.regularPrice ??
            size?.regularPrice ??
            null,
          salePrice:
            old?.salePrice ??
            size?.salePrice ??
            null,
          stock: old?.stock ?? 1,
          sku: old?.sku || "",
          images:
            Array.isArray(old?.images) ? old.images : [],
          active: old?.active !== false,
        });
      });
    }

    setForm((prev) => ({
      ...prev,
      variants: generated,
      variantsEnabled: true,
    }));

    setError("");
    showSuccess(
      `${generated.length} variant combinations prepared.`
    );
  };

  const addVariant = () => {
    setForm(
      (prev) => ({
        ...prev,

        variants: [
          ...(prev.variants ||
            []),

          {
            _uiId:
              createId(
                "variant"
              ),

            color:
              prev.options?.colors
                ?.length
                ? {
                    ...prev
                      .options
                      .colors[0],
                  }
                : undefined,

            size:
              prev.options?.sizes
                ?.length
                ? {
                    ...prev
                      .options
                      .sizes[0],
                  }
                : undefined,

            regularPrice: null,
            salePrice: null,

            sku: "",

            stock: 1,

            images: [],

            active: true,
          },
        ],
      })
    );
  };

  const updateVariant = (
    index,
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        variants:
          prev.variants.map(
            (
              variant,
              variantIndex
            ) =>
              variantIndex ===
              index
                ? {
                    ...variant,
                    [key]:
                      value,
                  }
                : variant
          ),
      })
    );
  };

  const updateVariantColor = (
    index,
    colorIndex
  ) => {
    setForm((prev) => {
      const color =
        prev.options.colors[
          colorIndex
        ];

      return {
        ...prev,

        variants:
          prev.variants.map(
            (
              variant,
              variantIndex
            ) =>
              variantIndex ===
              index
                ? {
                    ...variant,

                    color: color
                      ? {
                          ...color,
                        }
                      : undefined,
                  }
                : variant
          ),
      };
    });
  };

  const updateVariantSize = (
    index,
    sizeIndex
  ) => {
    setForm((prev) => {
      const size =
        prev.options.sizes[
          sizeIndex
        ];

      return {
        ...prev,

        variants:
          prev.variants.map(
            (
              variant,
              variantIndex
            ) =>
              variantIndex ===
              index
                ? {
                    ...variant,

                    size: size
                      ? {
                          ...size,
                        }
                      : undefined,
                  }
                : variant
          ),
      };
    });
  };

  const removeVariant = (
    index
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        variants:
          prev.variants.filter(
            (
              _,
              variantIndex
            ) =>
              variantIndex !==
              index
          ),
      })
    );
  };

  /* ===================================================
     SPECIFICATIONS
  =================================================== */

  const addSpecification =
    () => {
      setForm(
        (prev) => ({
          ...prev,

          specifications: [
            ...(prev.specifications ||
              []),

            {
              _uiId:
                createId(
                  "spec"
                ),

              name: "",
              value: "",
            },
          ],
        })
      );
    };

  const updateSpecification = (
    index,
    key,
    value
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        specifications:
          prev.specifications.map(
            (
              item,
              itemIndex
            ) =>
              itemIndex ===
              index
                ? {
                    ...item,
                    [key]:
                      value,
                  }
                : item
          ),
      })
    );
  };

  const removeSpecification = (
    index
  ) => {
    setForm(
      (prev) => ({
        ...prev,

        specifications:
          prev.specifications.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          ),
      })
    );
  };

  /* ===================================================
     SECTION TOGGLE
  =================================================== */

  const toggleSection = (
    key
  ) => {
    setOpenSections(
      (prev) => ({
        ...prev,

        [key]:
          !prev[key],
      })
    );
  };

  /* ===================================================
     VALIDATION
  =================================================== */

  const validateForm = () => {
    if (
      !form.title.trim()
    ) {
      return "Product title is required.";
    }

    if (
      !form.category
    ) {
      return "Category is required.";
    }

    if (
      form.pricing
        .regularPrice ===
        "" ||
      form.pricing
        .regularPrice ===
        null ||
      form.pricing
        .regularPrice ===
        undefined
    ) {
      return "Regular price is required.";
    }

    const regularPrice =
      Number(
        form.pricing
          .regularPrice
      );

    if (
      Number.isNaN(
        regularPrice
      ) ||
      regularPrice < 0
    ) {
      return "Regular price is invalid.";
    }

    if (
      form.pricing
        .salePrice !==
        "" &&
      form.pricing
        .salePrice !==
        null &&
      form.pricing
        .salePrice !==
        undefined
    ) {
      const salePrice =
        Number(
          form.pricing
            .salePrice
        );

      if (
        Number.isNaN(
          salePrice
        ) ||
        salePrice < 0
      ) {
        return "Sale price is invalid.";
      }

      if (
        salePrice >
        regularPrice
      ) {
        return "Sale price cannot be greater than regular price.";
      }
    }

    for (
      let index = 0;
      index < form.options.sizes.length;
      index++
    ) {
      const size = form.options.sizes[index];

      if (
        size.salePrice !== "" &&
        size.salePrice !== null &&
        size.salePrice !== undefined &&
        size.regularPrice !== "" &&
        size.regularPrice !== null &&
        size.regularPrice !== undefined &&
        Number(size.salePrice) > Number(size.regularPrice)
      ) {
        return `Size ${index + 1}: sale price cannot be greater than regular price.`;
      }
    }

    if (
      form.variantsEnabled &&
      form.variants.length
    ) {
      for (
        let index = 0;
        index <
        form.variants.length;
        index++
      ) {
        const variant =
          form.variants[
            index
          ];

        if (
          variant.salePrice !==
            null &&
          variant.salePrice !==
            "" &&
          variant.regularPrice !==
            null &&
          variant.regularPrice !==
            ""
        ) {
          if (
            Number(
              variant.salePrice
            ) >
            Number(
              variant.regularPrice
            )
          ) {
            return `Variant ${
              index + 1
            }: sale price cannot be greater than regular price.`;
          }
        }
      }
    }

    return "";
  };

  /* ===================================================
     BUILD PAYLOAD
  =================================================== */

  const buildPayload = () => {
    return {
      ...form,

      slug:
        form.slug.trim() ||
        slugify(
          form.title
        ),

      shortDescription:
        form.shortDescription
          ?.trim() || "",

      excerpt:
        form.shortDescription
          ?.trim() || "",

      sellingMode:
        form.sellingMode === "meter"
          ? "meter"
          : "piece",

      bulkOrderNote:
        form.bulkOrderNote?.trim() ||
        "Contact us for bulk orders.",

      meterConfig: {
        enabled:
          form.sellingMode === "meter",
        foldLength:
          form.meterConfig?.foldLength?.trim() || "",
        minMeters:
          form.meterConfig?.minMeters === "" ||
          form.meterConfig?.minMeters == null
            ? null
            : Number(form.meterConfig.minMeters),
        maxMeters:
          form.meterConfig?.maxMeters === "" ||
          form.meterConfig?.maxMeters == null
            ? null
            : Number(form.meterConfig.maxMeters),
        incrementMeters:
          form.meterConfig?.incrementMeters === "" ||
          form.meterConfig?.incrementMeters == null
            ? null
            : Number(form.meterConfig.incrementMeters),
      },

      shippingRules:
        (form.shippingRules || []).map((rule) => ({
          type:
            rule.type === "meter"
              ? "meter"
              : rule.type === "quantity"
                ? "quantity"
                : "size",
          label: rule.label?.trim() || "",
          sizeName: rule.sizeName?.trim() || "",
          minMeters:
            rule.minMeters === "" || rule.minMeters == null
              ? null
              : Number(rule.minMeters),
          maxMeters:
            rule.maxMeters === "" || rule.maxMeters == null
              ? null
              : Number(rule.maxMeters),
          minQuantity:
            rule.minQuantity === "" || rule.minQuantity == null
              ? null
              : Number(rule.minQuantity),
          maxQuantity:
            rule.maxQuantity === "" || rule.maxQuantity == null
              ? null
              : Number(rule.maxQuantity),
          standardCharge: Number(rule.standardCharge || 0),
          expressCharge: Number(rule.expressCharge || 0),
        })),

      pricing: {
        regularPrice:
          Number(
            form.pricing
              .regularPrice
          ),

        salePrice:
          form.pricing
            .salePrice ===
            "" ||
          form.pricing
            .salePrice ===
            null
            ? null
            : Number(
                form.pricing
                  .salePrice
              ),
      },

      inventory: {
        ...form.inventory,

        stock: Number(
          form.inventory
            .stock || 0
        ),

        maxQuantityPerOrder:
          Number(
            form.inventory
              .maxQuantityPerOrder ||
              0
          ),
      },

      variants:
        form.variants.map(
          (variant) => ({
            ...variant,

            _uiId:
              undefined,

            regularPrice:
              variant.regularPrice ===
                "" ||
              variant.regularPrice ===
                null
                ? null
                : Number(
                    variant.regularPrice
                  ),

            salePrice:
              variant.salePrice ===
                "" ||
              variant.salePrice ===
                null
                ? null
                : Number(
                    variant.salePrice
                  ),

            stock: Number(
              variant.stock ||
                0
            ),
          })
        ),

      options: {
        colors:
          form.options.colors.map(
            (color) => ({
              ...color,
              _uiId:
                undefined,
              regularPrice:
                color.regularPrice === "" ||
                color.regularPrice == null
                  ? null
                  : Number(color.regularPrice),
              salePrice:
                color.salePrice === "" ||
                color.salePrice == null
                  ? null
                  : Number(color.salePrice),
              images:
                Array.isArray(color.images)
                  ? color.images.map((image, imageIndex) => ({
                      ...image,
                      _uiId: undefined,
                      position: imageIndex,
                    }))
                  : [],
            })
          ),

        sizes:
          form.sellingMode === "meter"
            ? []
            : form.options.sizes.map(
            (size) => ({
              ...size,
              _uiId:
                undefined,
              details: size.details?.trim() || "",
              regularPrice:
                size.regularPrice === "" ||
                size.regularPrice == null
                  ? null
                  : Number(size.regularPrice),
              salePrice:
                size.salePrice === "" ||
                size.salePrice == null
                  ? null
                  : Number(size.salePrice),
              shippingCharge:
                size.shippingCharge === "" ||
                size.shippingCharge == null
                  ? null
                  : Number(size.shippingCharge),
              meters:
                size.meters === "" ||
                size.meters == null
                  ? null
                  : Number(size.meters),
            })
          ),
      },

      gallery:
        form.gallery.map(
          (
            image,
            index
          ) => ({
            ...image,

            _uiId:
              undefined,

            position:
              index,
          })
        ),

      specifications:
        form.specifications.map(
          (item) => ({
            name:
              item.name
                ?.trim() ||
              "",

            value:
              item.value
                ?.trim() ||
              "",
          })
        ),

      category:
        form.category,

      subCategory:
        form.subCategory ||
        null,

      /*
        Explicit visibility values.
      */
      showOnHome:
        Boolean(
          form.showOnHome
        ),

      showInNewArrivals:
        Boolean(
          form.showInNewArrivals
        ),

      showOnSale:
        Boolean(
          form.showOnSale
        ),

      featured:
        Boolean(
          form.featured
        ),

      status:
        form.status ||
        "draft",
    };
  };

  /* ===================================================
     SAVE
  =================================================== */

  const saveProduct = async (
    event
  ) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const validation =
      validateForm();

    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const isEdit =
        Boolean(
          editingProduct
        );

      const payload =
        buildPayload();

      const url = isEdit
        ? `${API_URL}/products/${editingProduct._id}`
        : `${API_URL}/products`;

      const response =
        await fetch(url, {
          method: isEdit
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials:
            "include",

          body: JSON.stringify(
            payload
          ),
        });

      let data = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Failed to save product"
        );
      }

      await loadProducts();

      setFormOpen(false);

      setEditingProduct(
        null
      );

      showSuccess(
        isEdit
          ? "Product updated successfully."
          : "Product created successfully."
      );
    } catch (saveError) {
      setError(
        saveError?.message ||
          "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     DELETE
  =================================================== */

  const deleteProduct =
    async (id) => {
      if (!id) {
        return;
      }

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this product?"
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(id);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/products/${id}`,
            {
              method: "DELETE",
              credentials:
                "include",
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data?.message ||
              "Failed to delete product"
          );
        }

        await loadProducts();

        showSuccess(
          "Product deleted successfully."
        );
      } catch (deleteError) {
        setError(
          deleteError?.message ||
            "Failed to delete product."
        );
      } finally {
        setDeletingId("");
      }
    };

  /* ===================================================
     QUICK TOGGLE
  =================================================== */

  const updateProductToggle =
    async (
      product,
      key,
      value
    ) => {
      if (!product?._id) {
        return;
      }

      const previousValue =
        Boolean(
          product?.[key]
        );

      /* Optimistic UI */

      setProducts(
        (current) =>
          current.map(
            (item) =>
              item._id ===
              product._id
                ? {
                    ...item,
                    [key]:
                      value,
                  }
                : item
          )
      );

      try {
        const response =
          await fetch(
            `${API_URL}/products/${product._id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                [key]:
                  value,
              }),
            }
          );

        let data = {};

        try {
          data =
            await response.json();
        } catch {
          data = {};
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data?.message ||
              "Failed to update product"
          );
        }
      } catch (toggleError) {
        /* Rollback */

        setProducts(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                product._id
                  ? {
                      ...item,
                      [key]:
                        previousValue,
                    }
                  : item
            )
        );

        setError(
          toggleError?.message ||
            "Failed to update product."
        );
      }
    };

  /* ===================================================
     CATEGORY NAME
  =================================================== */

  const getProductCategoryName =
    (product) => {
      const relation =
        product?.category;

      if (
        typeof relation ===
        "object"
      ) {
        return (
          relation?.name ||
          relation?.label ||
          "—"
        );
      }

      return (
        categories.find(
          (category) =>
            category._id ===
            relation
        )?.name ||
        "—"
      );
    };

  /* ===================================================
     STOCK
  =================================================== */

  const getProductStock =
    (product) => {
      if (
        product?.variantsEnabled &&
        Array.isArray(
          product?.variants
        ) &&
        product.variants.length
      ) {
        return product.variants.reduce(
          (
            total,
            variant
          ) =>
            total +
            Number(
              variant?.stock ||
                0
            ),
          0
        );
      }

      return Number(
        product?.inventory
          ?.stock || 0
      );
    };

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="products-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            Products
          </h1>

          <p className="page-subtitle">
            Manage your Bhavya Fabrics
            product catalogue.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreate}
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="toolbar">

        <div className="search-box">
          <Search size={15} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search products..."
          />
        </div>

        <select
          className="toolbar-select"
          value={
            categoryFilter
          }
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Categories
          </option>

          {categories.map(
            (category) => (
              <option
                key={
                  category._id
                }
                value={
                  category._id
                }
              >
                {category.name}
              </option>
            )
          )}
        </select>

        <select
          className="toolbar-select status-select"
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="published">
            Published
          </option>

          <option value="draft">
            Draft
          </option>

          <option value="archived">
            Archived
          </option>
        </select>

        <span className="toolbar-count">
          {
            filteredProducts.length
          }{" "}
          products
        </span>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-card">

        <div className="table-scroll">

          <table className="products-table">

            <thead>
              <tr>
                {[
                  "Product",
                  "Category",
                  "Price",
                  "Stock",
                  "Home",
                  "New Arrivals",
                  "Sale",
                  "Featured",
                  "Status",
                  "Actions",
                ].map(
                  (heading) => (
                    <th
                      key={
                        heading
                      }
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>

              {loading ? (
                Array.from({
                  length: 8,
                }).map(
                  (_, index) => (
                    <SkeletonRow
                      key={
                        index
                      }
                    />
                  )
                )
              ) : pageProducts.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="empty-cell"
                  >
                    <Package
                      size={38}
                    />

                    <strong>
                      No Products
                    </strong>

                    <span>
                      No products match
                      your current filters.
                    </span>
                  </td>
                </tr>
              ) : (
                pageProducts.map(
                  (product) => {
                    const mainImage =
                      product
                        ?.mainImage
                        ?.url;

                    const regularPrice =
                      product
                        ?.pricing
                        ?.regularPrice;

                    const salePrice =
                      product
                        ?.pricing
                        ?.salePrice;

                    const stock =
                      getProductStock(
                        product
                      );

                    return (
                      <tr
                        key={
                          product._id
                        }
                      >

                        {/* PRODUCT */}

                        <td>
                          <div className="product-cell">

                            <div className="product-thumb">
                              {mainImage ? (
                                <img
                                  src={
                                    mainImage
                                  }
                                  alt={
                                    product
                                      ?.mainImage
                                      ?.alt ||
                                    product.title
                                  }
                                />
                              ) : (
                                <ImageIcon
                                  size={18}
                                />
                              )}
                            </div>

                            <div className="product-info">

                              <div className="product-title">
                                {
                                  product.title
                                }
                              </div>

                              <div className="product-meta">
                                {product.sku
                                  ? `SKU: ${product.sku}`
                                  : product.slug
                                  ? `/${product.slug}`
                                  : "No SKU"}
                              </div>

                            </div>

                          </div>
                        </td>

                        {/* CATEGORY */}

                        <td>
                          {
                            getProductCategoryName(
                              product
                            )
                          }
                        </td>

                        {/* PRICE */}

                        <td>
                          {salePrice !==
                            null &&
                          salePrice !==
                            undefined &&
                          Number(
                            salePrice
                          ) > 0 ? (
                            <div className="price-cell">

                              <strong>
                                ₹
                                {Number(
                                  salePrice
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </strong>

                              <span>
                                ₹
                                {Number(
                                  regularPrice ||
                                    0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                            </div>
                          ) : (
                            <strong className="regular-price">
                              ₹
                              {Number(
                                regularPrice ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </strong>
                          )}
                        </td>

                        {/* STOCK */}

                        <td>
                          <span
                            className={`stock-badge ${
                              stock > 0
                                ? "in-stock"
                                : "out-stock"
                            }`}
                          >
                            {stock}
                          </span>
                        </td>

                        {/* HOME */}

                        <td>
                          <Toggle
                            value={Boolean(
                              product.showOnHome
                            )}
                            onChange={(
                              value
                            ) =>
                              updateProductToggle(
                                product,
                                "showOnHome",
                                value
                              )
                            }
                          />
                        </td>

                        {/* NEW ARRIVALS */}

                        <td>
                          <Toggle
                            value={Boolean(
                              product.showInNewArrivals
                            )}
                            onChange={(
                              value
                            ) =>
                              updateProductToggle(
                                product,
                                "showInNewArrivals",
                                value
                              )
                            }
                          />
                        </td>

                        {/* SALE */}

                        <td>
                          <Toggle
                            value={Boolean(
                              product.showOnSale
                            )}
                            onChange={(
                              value
                            ) =>
                              updateProductToggle(
                                product,
                                "showOnSale",
                                value
                              )
                            }
                          />
                        </td>

                        {/* FEATURED */}

                        <td>
                          <Toggle
                            value={Boolean(
                              product.featured
                            )}
                            onChange={(
                              value
                            ) =>
                              updateProductToggle(
                                product,
                                "featured",
                                value
                              )
                            }
                          />
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`status-badge status-${product.status}`}
                          >
                            {
                              product.status
                            }
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="actions-cell">

                          <div className="table-actions action-group">

                            <button
                              type="button"
                              className="action-icon action-edit"
                              onClick={() =>
                                openEdit(
                                  product
                                )
                              }
                              title="Edit product"
                            >
                              <Pencil size={14} />
                            </button>

                            <span
                              className="action-divider"
                              aria-hidden="true"
                            />

                            <button
                              type="button"
                              className="action-icon action-delete"
                              onClick={() =>
                                deleteProduct(
                                  product._id
                                )
                              }
                              disabled={
                                deletingId ===
                                product._id
                              }
                              title="Delete product"
                            >
                              {deletingId ===
                              product._id ? (
                                <Loader2
                                  size={14}
                                  className="spin"
                                />
                              ) : (
                                <Trash2
                                  size={14}
                                />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* =================================================
          PAGINATION
      ================================================= */}

      {!loading &&
        totalPages > 1 && (
          <div className="pagination">

            <button
              type="button"
              className="pagination-button"
              disabled={
                safePage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
            >
              <ChevronLeft
                size={15}
              />
            </button>

            {Array.from(
              {
                length:
                  totalPages,
              },
              (_, index) =>
                index + 1
            ).map(
              (page) => (
                <button
                  type="button"
                  key={page}
                  className={`pagination-button ${
                    safePage ===
                    page
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setCurrentPage(
                      page
                    )
                  }
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              className="pagination-button"
              disabled={
                safePage ===
                totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages,
                      page + 1
                    )
                )
              }
            >
              <ChevronRight
                size={15}
              />
            </button>

          </div>
        )}

      {/* =================================================
          PRODUCT MODAL
      ================================================= */}

      {formOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >

          <div
            className="product-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="modal-header">

              <div>
                <h2>
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p>
                  Manage product information,
                  pricing, variants and visibility.
                </p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
              >
                <X size={17} />
              </button>

            </div>

            {/* FORM */}

            <form
              id="product-form"
              className="product-form"
              onSubmit={
                saveProduct
              }
            >

              {/* BASIC */}

              <Section
                id="basic"
                title="Basic Information"
                open={
                  openSections.basic
                }
                onToggle={
                  toggleSection
                }
              >
                <div className="form-grid">

                  <Field
                    label="Product Name"
                    required
                  >
                    <TextInput
                      required
                      value={
                        form.title
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "title",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Premium Cotton Cambric"
                    />
                  </Field>

                  <Field label="SKU">
                    <TextInput
                      value={
                        form.sku
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "sku",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="BF-COT-001"
                    />
                  </Field>

                  <Field
                    label="Category"
                    required
                  >
                    <SelectInput
                      required
                      value={
                        form.category
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (prev) => ({
                            ...prev,
                            category:
                              event
                                .target
                                .value,
                            subCategory:
                              "",
                          })
                        )
                      }
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map(
                        (
                          category
                        ) => (
                          <option
                            key={
                              category._id
                            }
                            value={
                              category._id
                            }
                          >
                            {
                              category.name
                            }
                          </option>
                        )
                      )}
                    </SelectInput>
                  </Field>

                  <Field label="Subcategory">
                    <SelectInput
                      value={
                        form.subCategory
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "subCategory",
                          event
                            .target
                            .value
                        )
                      }
                      disabled={
                        !form.category
                      }
                    >
                      <option value="">
                        No subcategory
                      </option>

                      {availableSubCategories.map(
                        (item) => (
                          <option
                            key={
                              item._id
                            }
                            value={
                              item._id
                            }
                          >
                            {
                              item.name
                            }
                          </option>
                        )
                      )}
                    </SelectInput>
                  </Field>

                  <Field label="Slug">
                    <TextInput
                      value={
                        form.slug
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "slug",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="premium-cotton-cambric"
                    />
                  </Field>

                  <Field label="Short Description">
                    <TextInput
                      value={
                        form.shortDescription
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "shortDescription",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Short product description..."
                    />
                  </Field>

                  <div className="form-field full-span">
                    <Field
                      label="Product Description"
                    >
                      <TextArea
                        rows={5}
                        value={
                          form.description
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "description",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Full product description..."
                      />
                    </Field>
                  </div>

                </div>
              </Section>

              {/* IMAGES */}

              <Section
                id="images"
                title="Product Images"
                open={
                  openSections.images
                }
                onToggle={
                  toggleSection
                }
              >
                <div className="image-manager-grid">

                  {/* MAIN IMAGE */}

                  <div className="main-image-card">

                    <div className="form-label">
                      Main Image
                    </div>

                    <div className="main-image-preview">

                      {form.mainImage?.url ? (
                        <img
                          src={
                            form.mainImage.url
                          }
                          alt={
                            form.mainImage
                              .alt ||
                            form.title
                          }
                        />
                      ) : (
                        <div className="image-placeholder">
                          <ImageIcon size={28} />

                          <span>
                            No main image
                          </span>
                        </div>
                      )}

                      <label className="upload-button">

                        {uploadingMain ? (
                          <Loader2
                            size={14}
                            className="spin"
                          />
                        ) : (
                          <Upload size={14} />
                        )}

                        {uploadingMain
                          ? "Uploading..."
                          : "Choose Image"}

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          onChange={
                            handleMainImage
                          }
                          disabled={
                            uploadingMain
                          }
                        />
                      </label>

                    </div>
                  </div>

                  {/* GALLERY */}

                  <div className="gallery-card">

                    <div className="gallery-header">

                      <div className="form-label">
                        Gallery
                      </div>

                      <label className="secondary-upload-button">

                        {uploadingGallery ? (
                          <Loader2
                            size={13}
                            className="spin"
                          />
                        ) : (
                          <Plus size={13} />
                        )}

                        Add Images

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif"
                          multiple
                          onChange={
                            handleGalleryImages
                          }
                          disabled={
                            uploadingGallery
                          }
                        />
                      </label>

                    </div>

                    <div className="gallery-grid">

                      {form.gallery.length >
                      0 ? (
                        form.gallery.map(
                          (
                            image,
                            index
                          ) => (
                            <div
                              key={
                                image._uiId ||
                                image.cloudflareId ||
                                image.url ||
                                index
                              }
                              className="gallery-item"
                            >
                              <img
                                src={
                                  image.url
                                }
                                alt=""
                              />

                              <button
                                type="button"
                                className="gallery-remove"
                                onClick={() =>
                                  removeGalleryImage(
                                    index
                                  )
                                }
                              >
                                <X
                                  size={12}
                                />
                              </button>
                            </div>
                          )
                        )
                      ) : (
                        <div className="gallery-empty">
                          <ImageIcon size={26} />

                          <span>
                            No gallery images
                          </span>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              </Section>

              {/* PRICING */}

              <Section
                id="pricing"
                title="Pricing"
                open={
                  openSections.pricing
                }
                onToggle={
                  toggleSection
                }
              >
                <div className="form-grid">

                  <Field
                    label={form.sellingMode === "meter" ? "Price per Meter (₹)" : "Regular Price (₹)"}
                    required
                  >
                    <TextInput
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.pricing
                          .regularPrice
                      }
                      onChange={(
                        event
                      ) =>
                        updatePricing(
                          "regularPrice",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder={form.sellingMode === "meter" ? "Example: 450 per meter" : "1800"}
                    />
                  </Field>

                  <Field label={form.sellingMode === "meter" ? "Sale Price per Meter (₹)" : "Sale Price"}>
                    <TextInput
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.pricing
                          .salePrice ?? ""
                      }
                      onChange={(
                        event
                      ) =>
                        updatePricing(
                          "salePrice",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="1500"
                    />
                  </Field>

                </div>
              </Section>

              {/* PRODUCT SELLING MODE */}

              <Section
                id="selling"
                title="Product Type & Selling"
                open={
                  openSections.selling
                }
                onToggle={
                  toggleSection
                }
              >
                <div className="form-grid">
                  <Field label="Choose Product Type">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                      {[
                        {
                          value: "meter",
                          title: "Raw Fabric",
                          text: "Sell by meter with minimum, maximum, increment and meter shipping slabs.",
                        },
                        {
                          value: "piece",
                          title: "Ready-made / Single",
                          text: "Sell bags or individual units with size, colour, stock and quantity shipping slabs.",
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              sellingMode: option.value,
                              ...(option.value === "meter"
                                ? {
                                    options: {
                                      ...prev.options,
                                      sizes: [],
                                    },
                                    variants: [],
                                    variantsEnabled: false,
                                  }
                                : {}),
                            }))
                          }
                          style={{
                            textAlign: "left",
                            padding: "16px",
                            borderRadius: 12,
                            border: form.sellingMode === option.value
                              ? "2px solid #8A5D38"
                              : "1px solid #ddd",
                            background: form.sellingMode === option.value ? "#FBF7F1" : "#fff",
                            cursor: "pointer",
                          }}
                        >
                          <strong style={{ display: "block", marginBottom: 6 }}>{option.title}</strong>
                          <span style={{ fontSize: 12, lineHeight: 1.5, color: "#666" }}>{option.text}</span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <Field label="Bulk Order Note">
                    <TextInput
                      value={form.bulkOrderNote}
                      onChange={(event) =>
                        updateForm(
                          "bulkOrderNote",
                          event.target.value
                        )
                      }
                      placeholder="Contact us for bulk orders."
                    />
                  </Field>
                </div>

                {form.sellingMode === "meter" && (
                  <div className="form-grid">
                    <Field label="Fold Length">
                      <TextInput
                        value={form.meterConfig?.foldLength || ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            meterConfig: {
                              ...prev.meterConfig,
                              enabled: true,
                              foldLength: event.target.value,
                            },
                          }))
                        }
                        placeholder="Example: 58 inches"
                      />
                    </Field>

                    <Field label="Meter Increment">
                      <TextInput
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.meterConfig?.incrementMeters ?? ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            meterConfig: {
                              ...prev.meterConfig,
                              enabled: true,
                              incrementMeters: event.target.value,
                            },
                          }))
                        }
                        placeholder="Example: 10"
                      />
                    </Field>

                    <Field label="Minimum Meters">
                      <TextInput
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.meterConfig?.minMeters ?? ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            meterConfig: {
                              ...prev.meterConfig,
                              enabled: true,
                              minMeters: event.target.value,
                            },
                          }))
                        }
                        placeholder="Example: 10"
                      />
                    </Field>

                    <Field label="Maximum Meters">
                      <TextInput
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.meterConfig?.maxMeters ?? ""}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            meterConfig: {
                              ...prev.meterConfig,
                              enabled: true,
                              maxMeters: event.target.value,
                            },
                          }))
                        }
                        placeholder="Example: 100"
                      />
                    </Field>
                  </div>
                )}

                <div className="option-card" style={{ marginTop: 12 }}>
                  <div className="option-header">
                    <strong>
                      {form.sellingMode === "meter"
                        ? "Meter Shipping Rules"
                        : "Bag / Size Shipping Rules"}
                    </strong>

                    <div className="option-buttons">
                      <button
                        type="button"
                        className="mini-button"
                        onClick={() =>
                          addShippingRule(
                            form.sellingMode === "meter"
                              ? "meter"
                              : "size"
                          )
                        }
                      >
                        + Shipping Rule
                      </button>
                    </div>
                  </div>

                  {(form.shippingRules || []).map((rule, index) => {
                    const ruleType = rule.type || (form.sellingMode === "meter" ? "meter" : "quantity");
                    const isMeterRule = ruleType === "meter";
                    const isQuantityRule = ruleType === "quantity";
                    return (
                      <div
                        key={rule._uiId || index}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.1fr 1fr 1fr 1fr 34px",
                          gap: 8,
                          marginBottom: 10,
                          alignItems: "end",
                        }}
                      >
                        <SelectInput
                          value={ruleType}
                          onChange={(event) =>
                            updateShippingRule(index, "type", event.target.value)
                          }
                        >
                          {form.sellingMode === "meter" ? (
                            <option value="meter">Meter range</option>
                          ) : (
                            <>
                              <option value="quantity">Piece range</option>
                              <option value="size">Specific size</option>
                            </>
                          )}
                        </SelectInput>

                        {isMeterRule ? (
                          <>
                            <TextInput
                              type="number"
                              min="0"
                              step="1"
                              value={rule.minMeters ?? ""}
                              onChange={(event) => updateShippingRule(index, "minMeters", event.target.value)}
                              placeholder="Min metres"
                            />
                            <TextInput
                              type="number"
                              min="0"
                              step="1"
                              value={rule.maxMeters ?? ""}
                              onChange={(event) => updateShippingRule(index, "maxMeters", event.target.value)}
                              placeholder="Max metres"
                            />
                          </>
                        ) : isQuantityRule ? (
                          <>
                            <TextInput
                              type="number"
                              min="1"
                              step="1"
                              value={rule.minQuantity ?? ""}
                              onChange={(event) => updateShippingRule(index, "minQuantity", event.target.value)}
                              placeholder="Min pieces"
                            />
                            <TextInput
                              type="number"
                              min="1"
                              step="1"
                              value={rule.maxQuantity ?? ""}
                              onChange={(event) => updateShippingRule(index, "maxQuantity", event.target.value)}
                              placeholder="Max pieces"
                            />
                          </>
                        ) : (
                          <>
                            <TextInput
                              value={rule.sizeName ?? ""}
                              onChange={(event) => updateShippingRule(index, "sizeName", event.target.value)}
                              placeholder="Size name"
                            />
                            <TextInput
                              value={rule.label ?? ""}
                              onChange={(event) => updateShippingRule(index, "label", event.target.value)}
                              placeholder="Label/details"
                            />
                          </>
                        )}

                        <TextInput
                          type="number"
                          min="0"
                          step="0.01"
                          value={rule.standardCharge ?? ""}
                          onChange={(event) => updateShippingRule(index, "standardCharge", event.target.value)}
                          placeholder="Standard ₹"
                        />

                        <button
                          type="button"
                          className="danger-icon-button"
                          onClick={() => removeShippingRule(index)}
                        >
                          <X size={13} />
                        </button>

                        <div style={{ gridColumn: "2 / -1" }}>
                          <TextInput
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.expressCharge ?? ""}
                            onChange={(event) => updateShippingRule(index, "expressCharge", event.target.value)}
                            placeholder="Express shipping ₹"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {!form.shippingRules?.length && (
                    <div className="option-empty">
                      No product-specific shipping rules added.
                    </div>
                  )}
                </div>
              </Section>

              {/* VARIANTS */}

              <Section
                id="variants"
                title="Variants"
                open={
                  openSections.variants
                }
                onToggle={
                  toggleSection
                }
              >

                <div className="setting-card">

                  <div>
                    <strong>
                      Enable Variants
                    </strong>

                    <span>
                      Use variants when colour,
                      size, stock or price differs.
                    </span>
                  </div>

                  <Toggle
                    value={
                      form.variantsEnabled
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "variantsEnabled",
                        value
                      )
                    }
                  />

                </div>

                {form.variantsEnabled && (
                  <div className="variant-area">

                    <div className="options-grid">

                      {/* COLORS */}

                      <div className="option-card">

                        <div className="option-header">

                          <strong>
                            Colors
                          </strong>

                          <div className="option-buttons">

                            <button
                              type="button"
                              className="mini-button"
                              onClick={() =>
                                addColor(
                                  false
                                )
                              }
                            >
                              + Color
                            </button>

                            <button
                              type="button"
                              className="mini-button primary"
                              onClick={() =>
                                addColor(
                                  true
                                )
                              }
                            >
                              + Custom
                            </button>

                          </div>
                        </div>

                        {form.options.colors.map(
                          (
                            color,
                            index
                          ) => (
                            <div
                              className="option-row"
                              key={
                                color._uiId ||
                                index
                              }
                            >

                              <TextInput
                                value={
                                  color.name
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateColor(
                                    index,
                                    "name",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="Color name"
                              />

                              <TextInput
                                value={
                                  color.hex
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateColor(
                                    index,
                                    "hex",
                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="#000000"
                              />

                              <TextInput
                                type="number"
                                min="0"
                                step="0.01"
                                value={color.regularPrice ?? ""}
                                onChange={(event) =>
                                  updateColor(
                                    index,
                                    "regularPrice",
                                    event.target.value
                                  )
                                }
                                placeholder="Price"
                              />

                              <TextInput
                                type="number"
                                min="0"
                                step="0.01"
                                value={color.salePrice ?? ""}
                                onChange={(event) =>
                                  updateColor(
                                    index,
                                    "salePrice",
                                    event.target.value
                                  )
                                }
                                placeholder="Sale"
                              />

                              <label
                                className="mini-button"
                                style={{ cursor: "pointer" }}
                              >
                                + Images
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  hidden
                                  onChange={(event) => {
                                    uploadColorImages(index, event.target.files);
                                    event.target.value = "";
                                  }}
                                />
                              </label>

                              <button
                                type="button"
                                className="danger-icon-button"
                                onClick={() =>
                                  removeColor(
                                    index
                                  )
                                }
                              >
                                <X size={13} />
                              </button>

                              <div
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => handleColorDrop(index, event)}
                                style={{
                                  gridColumn: "1 / -1",
                                  border: "1px dashed #C9B9A8",
                                  borderRadius: 8,
                                  padding: "8px 10px",
                                  color: "#777",
                                  fontSize: 12,
                                  textAlign: "center",
                                  background: "#FCFAF7",
                                }}
                              >
                                Drag & drop colour images here, or use + Images
                              </div>

                              {Array.isArray(color.images) &&
                                color.images.length > 0 && (
                                  <div
                                    style={{
                                      gridColumn: "1 / -1",
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: 6,
                                      marginTop: 4,
                                    }}
                                  >
                                    {color.images.map((image, imageIndex) => (
                                      <div
                                        key={image._uiId || image.url || imageIndex}
                                        style={{
                                          position: "relative",
                                          width: 54,
                                          height: 54,
                                        }}
                                      >
                                        <img
                                          src={image.url}
                                          alt={color.name || "Colour"}
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "cover",
                                            borderRadius: 6,
                                          }}
                                        />
                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeColorImage(index, imageIndex)
                                          }
                                          style={{
                                            position: "absolute",
                                            top: -5,
                                            right: -5,
                                            width: 18,
                                            height: 18,
                                            border: 0,
                                            borderRadius: "50%",
                                            background: "#9C4B37",
                                            color: "#fff",
                                            cursor: "pointer",
                                          }}
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}

                            </div>
                          )
                        )}

                        {!form.options.colors.length && (
                          <div className="option-empty">
                            No colors added.
                          </div>
                        )}
                      </div>

                      {/* SIZES */}

                      {form.sellingMode !== "meter" && (
                      <div className="option-card">

                        <div className="option-header">

                          <strong>
                            Sizes
                          </strong>

                          <div className="option-buttons">

                            <button
                              type="button"
                              className="mini-button"
                              onClick={() =>
                                addSize(
                                  false
                                )
                              }
                            >
                              + Size
                            </button>

                            <button
                              type="button"
                              className="mini-button primary"
                              onClick={() =>
                                addSize(
                                  true
                                )
                              }
                            >
                              + Custom
                            </button>

                          </div>
                        </div>

                        {form.options.sizes.map(
                          (
                            size,
                            index
                          ) => (
                            <div
                              className="option-row size-row"
                              key={
                                size._uiId ||
                                index
                              }
                            >

                              <TextInput
                                value={
                                  size.name
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateSize(
                                    index,
                                    "name",
                                    event.target.value
                                  )
                                }
                                placeholder="Size"
                              />

                              {form.sellingMode === "meter" ? (
                                <>
                                  <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={size.meters ?? ""}
                                    onChange={(event) =>
                                      updateSize(index, "meters", event.target.value)
                                    }
                                    placeholder="Meters"
                                  />
                                  <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={size.regularPrice ?? ""}
                                    onChange={(event) =>
                                      updateSize(index, "regularPrice", event.target.value)
                                    }
                                    placeholder="10m Total Price ₹"
                                  />
                                  <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={size.salePrice ?? ""}
                                    onChange={(event) =>
                                      updateSize(index, "salePrice", event.target.value)
                                    }
                                    placeholder="Sale Price ₹"
                                  />
                                  <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={size.shippingCharge ?? ""}
                                    onChange={(event) =>
                                      updateSize(index, "shippingCharge", event.target.value)
                                    }
                                    placeholder="Shipping ₹"
                                  />
                                </>
                              ) : (
                                <>
                                  <TextInput
                                    value={size.details ?? ""}
                                    onChange={(event) =>
                                      updateSize(index, "details", event.target.value)
                                    }
                                    placeholder="Size details"
                                  />
                                  <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={size.regularPrice ?? ""}
                                    onChange={(event) =>
                                      updateSize(index, "regularPrice", event.target.value)
                                    }
                                    placeholder="10m Total Price ₹"
                                  />
                                  <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={size.salePrice ?? ""}
                                    onChange={(event) =>
                                      updateSize(index, "salePrice", event.target.value)
                                    }
                                    placeholder="Sale Price ₹"
                                  />
                                  <TextInput
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={size.shippingCharge ?? ""}
                                    onChange={(event) =>
                                      updateSize(index, "shippingCharge", event.target.value)
                                    }
                                    placeholder="Shipping ₹"
                                  />
                                </>
                              )}

                              <button
                                type="button"
                                className="danger-icon-button"
                                onClick={() =>
                                  removeSize(
                                    index
                                  )
                                }
                              >
                                <X size={13} />
                              </button>

                            </div>
                          )
                        )}

                        {!form.options.sizes.length && (
                          <div className="option-empty">
                            No sizes added.
                          </div>
                        )}
                      </div>
                      )}

                    </div>

                    {/* VARIANT TABLE */}

                    <div className="variant-table-card">

                      <div className="variant-table-header">

                        <strong>
                          Variant Pricing & Stock
                        </strong>

                        <button
                          type="button"
                          className="mini-button primary"
                          onClick={
                            addVariant
                          }
                        >
                          <Plus size={13} />
                          Add Variant
                        </button> 
                        <button
                          type="button"
                          className="mini-button"
                          onClick={generateVariants}
                        >
                          Generate Combinations
                        </button>

                      </div>

                      {form.variants.length >
                      0 ? (
                        <div className="variant-table-scroll">

                          <table className="variant-table">

                            <thead>
                              <tr>
                                <th>
                                  Color
                                </th>
                                <th>
                                  Size
                                </th>
                                <th>
                                  Regular
                                </th>
                                <th>
                                  Sale
                                </th>
                                <th>
                                  Stock
                                </th>
                                <th>
                                  SKU
                                </th>
                                <th />
                              </tr>
                            </thead>

                            <tbody>

                              {form.variants.map(
                                (
                                  variant,
                                  index
                                ) => (
                                  <tr
                                    key={
                                      variant._uiId ||
                                      variant._id ||
                                      index
                                    }
                                  >

                                    <td>
                                      <select
                                        className="variant-input"
                                        value={
                                          variant
                                            .color
                                            ?.name ||
                                          ""
                                        }
                                        onChange={(
                                          event
                                        ) => {
                                          const selectedIndex =
                                            form.options.colors.findIndex(
                                              (
                                                color
                                              ) =>
                                                color.name ===
                                                event
                                                  .target
                                                  .value
                                            );

                                          updateVariantColor(
                                            index,
                                            selectedIndex
                                          );
                                        }}
                                      >
                                        <option value="">
                                          No Color
                                        </option>

                                        {form.options.colors.map(
                                          (
                                            color,
                                            colorIndex
                                          ) => (
                                            <option
                                              key={
                                                color._uiId ||
                                                colorIndex
                                              }
                                              value={
                                                color.name
                                              }
                                            >
                                              {
                                                color.name
                                              }
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </td>

                                    <td>
                                      <select
                                        className="variant-input"
                                        value={
                                          variant
                                            .size
                                            ?.name ||
                                          ""
                                        }
                                        onChange={(
                                          event
                                        ) => {
                                          const selectedIndex =
                                            form.options.sizes.findIndex(
                                              (
                                                size
                                              ) =>
                                                size.name ===
                                                event
                                                  .target
                                                  .value
                                            );

                                          updateVariantSize(
                                            index,
                                            selectedIndex
                                          );
                                        }}
                                      >
                                        <option value="">
                                          No Size
                                        </option>

                                        {form.options.sizes.map(
                                          (
                                            size,
                                            sizeIndex
                                          ) => (
                                            <option
                                              key={
                                                size._uiId ||
                                                sizeIndex
                                              }
                                              value={
                                                size.name
                                              }
                                            >
                                              {
                                                size.name
                                              }
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </td>

                                    <td>
                                      <input
                                        className="variant-input"
                                        type="number"
                                        min="0"
                                        value={
                                          variant.regularPrice ??
                                          ""
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateVariant(
                                            index,
                                            "regularPrice",
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        placeholder="Fallback"
                                      />
                                    </td>

                                    <td>
                                      <input
                                        className="variant-input"
                                        type="number"
                                        min="0"
                                        value={
                                          variant.salePrice ??
                                          ""
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateVariant(
                                            index,
                                            "salePrice",
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        placeholder="Fallback"
                                      />
                                    </td>

                                    <td>
                                      <input
                                        className="variant-input"
                                        type="number"
                                        min="0"
                                        value={
                                          variant.stock ??
                                          0
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateVariant(
                                            index,
                                            "stock",
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                      />
                                    </td>

                                    <td>
                                      <input
                                        className="variant-input"
                                        value={
                                          variant.sku ||
                                          ""
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateVariant(
                                            index,
                                            "sku",
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        placeholder="Variant SKU"
                                      />
                                    </td>

                                    <td>
                                      <button
                                        type="button"
                                        className="danger-icon-button"
                                        onClick={() =>
                                          removeVariant(
                                            index
                                          )
                                        }
                                      >
                                        <Trash2
                                          size={13}
                                        />
                                      </button>
                                    </td>

                                  </tr>
                                )
                              )}

                            </tbody>

                          </table>

                        </div>
                      ) : (
                        <div className="variant-empty">
                          No variants added yet.
                        </div>
                      )}

                    </div>

                  </div>
                )}

              </Section>

              {/* INVENTORY */}

              <Section
                id="inventory"
                title="Inventory"
                open={
                  openSections.inventory
                }
                onToggle={
                  toggleSection
                }
              >

                <div className="form-grid">

                  <div className="setting-card full-span">

                    <div>
                      <strong>
                        Track Stock
                      </strong>

                      <span>
                        Enable stock tracking
                        for this product.
                      </span>
                    </div>

                    <Toggle
                      value={
                        form.inventory
                          .trackStock
                      }
                      onChange={(
                        value
                      ) =>
                        updateInventory(
                          "trackStock",
                          value
                        )
                      }
                    />

                  </div>

                  <Field label="Inventory Mode">
                    <SelectInput
                      value={
                        form.inventory
                          .mode
                      }
                      onChange={(
                        event
                      ) =>
                        updateInventory(
                          "mode",
                          event
                            .target
                            .value
                        )
                      }
                    >
                      <option value="single">
                        Single
                      </option>

                      <option value="multiple">
                        Multiple
                      </option>
                    </SelectInput>
                  </Field>

                  {!form.variantsEnabled && (
                    <>
                      <Field label="Stock Quantity">
                        <TextInput
                          type="number"
                          min="0"
                          value={
                            form.inventory
                              .stock
                          }
                          onChange={(
                            event
                          ) =>
                            updateInventory(
                              "stock",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </Field>

                      <Field label="Max Quantity / Order">
                        <TextInput
                          type="number"
                          min="1"
                          value={
                            form.inventory
                              .maxQuantityPerOrder
                          }
                          onChange={(
                            event
                          ) =>
                            updateInventory(
                              "maxQuantityPerOrder",
                              event
                                .target
                                .value
                            )
                          }
                        />
                      </Field>
                    </>
                  )}

                </div>
              </Section>

              {/* DETAILS */}

              <Section
                id="details"
                title="Product Details"
                open={
                  openSections.details
                }
                onToggle={
                  toggleSection
                }
              >
                <div className="form-grid">

                  <Field label="Material">
                    <TextInput
                      value={
                        form.details
                          .material
                      }
                      onChange={(
                        event
                      ) =>
                        updateDetails(
                          "material",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="100% Cotton"
                    />
                  </Field>

                  <Field label="Fabric">
                    <TextInput
                      value={
                        form.details
                          .fabric
                      }
                      onChange={(
                        event
                      ) =>
                        updateDetails(
                          "fabric",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Cotton Cambric"
                    />
                  </Field>

                  <Field label="Pattern">
                    <TextInput
                      value={
                        form.details
                          .pattern
                      }
                      onChange={(
                        event
                      ) =>
                        updateDetails(
                          "pattern",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Plain"
                    />
                  </Field>

                  <Field label="Care Instructions">
                    <TextInput
                      value={
                        form.details
                          .careInstructions
                      }
                      onChange={(
                        event
                      ) =>
                        updateDetails(
                          "careInstructions",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Machine wash cold..."
                    />
                  </Field>

                </div>
              </Section>

              {/* SPECIFICATIONS */}

              <Section
                id="specifications"
                title="Specifications"
                open={
                  openSections.specifications
                }
                onToggle={
                  toggleSection
                }
              >

                {form.specifications.map(
                  (
                    specification,
                    index
                  ) => (
                    <div
                      className="spec-row"
                      key={
                        specification._uiId ||
                        index
                      }
                    >

                      <TextInput
                        value={
                          specification.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateSpecification(
                            index,
                            "name",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="GSM"
                      />

                      <TextInput
                        value={
                          specification.value
                        }
                        onChange={(
                          event
                        ) =>
                          updateSpecification(
                            index,
                            "value",
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="120"
                      />

                      <button
                        type="button"
                        className="danger-icon-button"
                        onClick={() =>
                          removeSpecification(
                            index
                          )
                        }
                      >
                        <Trash2
                          size={13}
                        />
                      </button>

                    </div>
                  )
                )}

                <button
                  type="button"
                  className="outline-button"
                  onClick={
                    addSpecification
                  }
                >
                  <Plus size={13} />
                  Add Specification
                </button>

              </Section>

              {/* =================================================
                  VISIBILITY
                  SALE TOGGLE INCLUDED
              ================================================= */}

              <Section
                id="visibility"
                title="Visibility"
                open={
                  openSections.visibility
                }
                onToggle={
                  toggleSection
                }
              >

                <div className="visibility-grid">

                  {[
                    [
                      "showOnHome",
                      "Show on Home",
                      "Display this product on homepage.",
                    ],
                    [
                      "showInNewArrivals",
                      "Show in New Arrivals",
                      "Display this product in new arrivals.",
                    ],
                    [
                      "showOnSale",
                      "Show on Sale",
                      "Display this product on the sale page.",
                    ],
                    [
                      "featured",
                      "Featured Product",
                      "Mark this product as featured.",
                    ],
                  ].map(
                    (item) => (
                      <div
                        className="visibility-card"
                        key={
                          item[0]
                        }
                      >

                        <div className="visibility-copy">

                          <span className="visibility-title">
                            {item[1]}
                          </span>

                          <span className="visibility-help">
                            {item[2]}
                          </span>

                        </div>

                        <Toggle
                          value={Boolean(
                            form[
                              item[0]
                            ]
                          )}
                          onChange={(
                            value
                          ) =>
                            updateForm(
                              item[0],
                              value
                            )
                          }
                        />

                      </div>
                    )
                  )}

                  <div className="visibility-card">

                    <div className="visibility-copy">

                      <span className="visibility-title">
                        Status
                      </span>

                      <span className="visibility-help">
                        Product publishing status.
                      </span>

                    </div>

                    <SelectInput
                      value={
                        form.status
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "status",
                          event
                            .target
                            .value
                        )
                      }
                    >
                      <option value="draft">
                        Draft
                      </option>

                      <option value="published">
                        Published
                      </option>

                      <option value="archived">
                        Archived
                      </option>
                    </SelectInput>

                  </div>

                </div>
              </Section>

              {/* SEO */}

              <Section
                id="seo"
                title="SEO"
                open={
                  openSections.seo
                }
                onToggle={
                  toggleSection
                }
              >

                <div className="form-grid">

                  <Field label="Meta Title">
                    <TextInput
                      value={
                        form.metaTitle
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "metaTitle",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Optional SEO title"
                    />
                  </Field>

                  <Field label="Meta Description">
                    <TextArea
                      rows={4}
                      value={
                        form.metaDescription
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          "metaDescription",
                          event
                            .target
                            .value
                        )
                      }
                      placeholder="Optional SEO description"
                    />
                  </Field>

                </div>
              </Section>

            </form>

            {/* FOOTER */}

            <div className="modal-footer">

              <button
                type="button"
                className="secondary-footer-button"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                form="product-form"
                className="save-footer-button"
                disabled={
                  saving
                }
              >

                {saving ? (
                  <Loader2
                    size={15}
                    className="spin"
                  />
                ) : (
                  <Save size={15} />
                )}

                {editingProduct
                  ? "Update Product"
                  : form.status ===
                    "published"
                  ? "Publish Product"
                  : "Save Product"}

              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          CSS
      ================================================= */}

      <style jsx global>{`

        * {
          box-sizing: border-box;
        }

        .products-page {
          width: 100%;
          min-height: 100%;
          padding: 18px;
          background: #F7F3EF;
          color: #292828;
        }

        /* =================================================
           HEADER
        ================================================= */

        .page-header {
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .page-title {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 26px;
          line-height: 30px;
          font-weight: 600;
          color: #292828;
        }

        .page-subtitle {
          margin: 5px 0 0;
          font-size: 11px;
          line-height: 16px;
          color: #7C7771;
        }

        .primary-button {
          height: 42px;
          padding: 0 17px;
          border: 0;
          border-radius: 9px;
          background: #295C65;
          color: #FFFFFF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
          box-shadow:
            0 8px 20px
            rgba(
              41,
              92,
              101,
              0.18
            );
        }

        .primary-button:hover {
          background: #214D55;
        }

        /* =================================================
           ALERTS
        ================================================= */

        .alert {
          min-height: 40px;
          padding: 10px 12px;
          margin-bottom: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 10px;
          line-height: 15px;
        }

        .alert button {
          width: 25px;
          height: 25px;
          border: 0;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .alert-error {
          background: #FBEDED;
          border: 1px solid #EAC8C8;
          color: #A33F3F;
        }

        .alert-success {
          background: #EDF5F1;
          border: 1px solid #CFE0D8;
          color: #356D58;
        }

        /* =================================================
           TOOLBAR
        ================================================= */

        .toolbar {
          min-height: 62px;
          padding: 12px 14px;
          margin-bottom: 12px;
          border:
            1px solid
            #E5DED6;
          border-radius: 11px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .search-box {
          width: 290px;
          height: 38px;
          padding: 0 11px;
          border:
            1px solid
            #D8D1C8;
          border-radius: 8px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8A8580;
          flex-shrink: 0;
        }

        .search-box input {
          width: 100%;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #30302E;
          font-size: 10px;
        }

        .toolbar-select {
          width: 175px;
          height: 38px;
          padding: 0 10px;
          border:
            1px solid
            #D8D1C8;
          border-radius: 8px;
          background: #FFFFFF;
          color: #4D4945;
          font-size: 10px;
          outline: 0;
          cursor: pointer;
        }

        .status-select {
          width: 140px;
        }

        .toolbar-count {
          margin-left: auto;
          color: #89847E;
          font-size: 10px;
          white-space: nowrap;
        }

        /* =================================================
           TABLE
        ================================================= */

        .table-card {
          width: 100%;
          border:
            1px solid
            #E5DED6;
          border-radius: 11px;
          background: #FFFFFF;
          overflow: hidden;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .products-table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .products-table th {
          height: 45px;
          padding: 0 10px;
          background: #F5F1EC;
          border-bottom:
            1px solid
            #E1D9D1;
          color: #7B766F;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.7px;
          text-align: left;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .products-table th:nth-child(1) {
          width: 26%;
        }

        .products-table th:nth-child(2) {
          width: 11%;
        }

        .products-table th:nth-child(3) {
          width: 9%;
        }

        .products-table th:nth-child(4) {
          width: 7%;
        }

        .products-table th:nth-child(5),
        .products-table th:nth-child(6),
        .products-table th:nth-child(7),
        .products-table th:nth-child(8) {
          width: 7.5%;
          text-align: center;
        }

        .products-table th:nth-child(9) {
          width: 8%;
        }

        .products-table th:nth-child(10) {
          width: 8.5%;
          text-align: center;
        }

        .products-table td {
          height: 74px;
          padding: 0 10px;
          border-bottom:
            1px solid
            #ECE6DF;
          color: #57524D;
          font-size: 9px;
          vertical-align: middle;
        }

        .products-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .products-table tbody tr:hover td {
          background: #FCFAF7;
        }

        .products-table td:nth-child(5),
        .products-table td:nth-child(6),
        .products-table td:nth-child(7),
        .products-table td:nth-child(8) {
          text-align: center;
          padding-left: 6px;
          padding-right: 6px;
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .product-thumb {
          width: 46px;
          height: 46px;
          flex: 0 0 46px;
          border:
            1px solid
            #DDD5CC;
          border-radius: 7px;
          background: #F3EEE8;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9A938B;
        }

        .product-thumb img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .product-info {
          min-width: 0;
        }

        .product-title {
          width: 100%;
          max-width: 240px;
          font-size: 10px;
          line-height: 14px;
          font-weight: 700;
          color: #34322F;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-meta {
          margin-top: 3px;
          font-size: 8px;
          line-height: 12px;
          color: #97918A;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .price-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .price-cell strong,
        .regular-price {
          color: #295C65;
          font-size: 10px;
          font-weight: 700;
        }

        .price-cell span {
          color: #99938C;
          font-size: 8px;
          text-decoration: line-through;
        }

        .stock-badge {
          min-width: 36px;
          height: 25px;
          padding: 0 7px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 700;
        }

        .in-stock {
          background: #EDF5F1;
          color: #356D58;
        }

        .out-stock {
          background: #FBEDED;
          color: #A33F3F;
        }

        .status-badge {
          min-width: 58px;
          height: 24px;
          padding: 0 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-published {
          background: #EDF5F1;
          color: #356D58;
        }

        .status-draft {
          background: #F7F0E6;
          color: #956F39;
        }

        .status-archived {
          background: #F1EFED;
          color: #77716B;
        }

        /* =================================================
           ACTIONS
        ================================================= */

        .actions-cell {
          width: 88px;
          min-width: 88px;
          text-align: center !important;
          white-space: nowrap;
          padding-left: 6px !important;
          padding-right: 6px !important;
        }

        .table-actions {
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .action-group {
          min-width: 68px;
          height: 36px;
          padding: 3px;
          gap: 2px;
          border:
            1px solid
            #DED6CE;
          border-radius: 10px;
          background: #FFFFFF;
          box-shadow:
            0 2px 7px
            rgba(
              41,
              92,
              101,
              0.06
            );
        }

        .action-icon {
          width: 30px;
          height: 30px;
          padding: 0;
          border: 0;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition:
            background-color
              0.16s ease,
            color 0.16s ease,
            transform
              0.16s ease;
        }

        .action-edit {
          background: #F5FAF9;
          color: #295C65;
        }

        .action-edit:hover {
          background: #E8F1EF;
          transform:
            translateY(-1px);
        }

        .action-delete {
          background: #FFF7F7;
          color: #A34A4A;
        }

        .action-delete:hover {
          background: #FCEBEC;
          transform:
            translateY(-1px);
        }

        .action-icon:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }

        .action-divider {
          width: 1px;
          height: 18px;
          background: #E6DED6;
          flex: 0 0 1px;
        }

        /* =================================================
           TOGGLE
        ================================================= */

        .admin-toggle {
          position: relative !important;

          width: 38px !important;
          min-width: 38px !important;
          max-width: 38px !important;

          height: 21px !important;
          min-height: 21px !important;
          max-height: 21px !important;

          margin: 0 !important;
          padding: 0 !important;

          border:
            1px solid
            #CFC8C0 !important;

          outline: 0 !important;

          border-radius:
            999px !important;

          /*
            OFF
          */
          background:
            transparent !important;

          display: block !important;

          flex:
            0 0 38px !important;

          cursor: pointer;

          box-shadow:
            none !important;

          appearance: none;
          -webkit-appearance: none;

          transition:
            background-color
              0.16s ease,
            border-color
              0.16s ease !important;
        }

        .admin-toggle.is-on {
          /*
            ON
          */
          background:
            #295C65 !important;

          border-color:
            #295C65 !important;
        }

        .admin-toggle-knob {
          position: absolute !important;

          top: 3px !important;
          left: 3px !important;

          width: 13px !important;
          min-width: 13px !important;
          max-width: 13px !important;

          height: 13px !important;
          min-height: 13px !important;
          max-height: 13px !important;

          margin: 0 !important;
          padding: 0 !important;

          display: block !important;

          border: 0 !important;

          border-radius:
            50% !important;

          /*
            OFF KNOB
          */
          background:
            #9F9890 !important;

          color: transparent !important;

          line-height: 0 !important;
          font-size: 0 !important;

          transform:
            translateX(0) !important;

          transition:
            transform
              0.16s ease,
            background-color
              0.16s ease !important;
        }

        .admin-toggle.is-on
        .admin-toggle-knob {
          transform:
            translateX(17px) !important;

          background:
            #FFFFFF !important;
        }

        .setting-card .admin-toggle,
        .visibility-card .admin-toggle {
          width: 38px !important;
          height: 21px !important;
          flex: 0 0 38px !important;
        }

        .visibility-card .admin-toggle span,
        .setting-card .admin-toggle span {
          width: 13px !important;
          height: 13px !important;
          margin: 0 !important;
          padding: 0 !important;
          display: block !important;
          color: transparent !important;
          line-height: 0 !important;
          font-size: 0 !important;
        }

        /* =================================================
           SKELETON
        ================================================= */

        .skeleton-box {
          background: #EAE4DD;
          animation:
            skeleton-pulse
            1.2s
            ease-in-out
            infinite;
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

        .skeleton-product-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .skeleton-image-sm {
          width: 46px;
          height: 46px;
          border-radius: 7px;
          flex: 0 0 46px;
        }

        .skeleton-text-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .skeleton-line {
          height: 9px;
          border-radius: 4px;
        }

        .skeleton-line.wide {
          width: 170px;
        }

        .skeleton-line.medium {
          width: 90px;
        }

        .skeleton-line.small {
          width: 50px;
        }

        .skeleton-pill {
          width: 40px;
          height: 22px;
          border-radius: 999px;
        }

        .skeleton-status {
          width: 55px;
          height: 23px;
          border-radius: 999px;
        }

        .skeleton-actions {
          width: 65px;
          height: 32px;
          border-radius: 8px;
        }

        /* =================================================
           EMPTY
        ================================================= */

        .empty-cell {
          height: 300px !important;
          text-align: center;
          color: #96908A !important;
        }

        .empty-cell svg {
          display: block;
          margin: 0 auto 12px;
          color: #BE9D6B;
        }

        .empty-cell strong {
          display: block;
          margin-bottom: 6px;
          font-family:
            Georgia,
            serif;
          font-size: 18px;
          color: #4A4642;
        }

        .empty-cell span {
          font-size: 10px;
        }

        /* =================================================
           PAGINATION
        ================================================= */

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 18px;
        }

        .pagination-button {
          width: 34px;
          height: 34px;
          border:
            1px solid
            #DDD6CF;
          border-radius: 50%;
          background: #FFFFFF;
          color: #295C65;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 10px;
          font-weight: 600;
        }

        .pagination-button:hover {
          border-color: #BE9D6B;
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

        /* =================================================
           MODAL
        ================================================= */

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          padding: 20px;
          background:
            rgba(
              25,
              35,
              37,
              0.52
            );
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-modal {
          width: 100%;
          max-width: 980px;
          height:
            calc(
              100vh - 40px
            );
          max-height: 920px;
          border-radius: 14px;
          overflow: hidden;
          background: #F7F4F0;
          display: flex;
          flex-direction: column;
          box-shadow:
            0 24px 70px
            rgba(
              0,
              0,
              0,
              0.22
            );
        }

        .modal-header {
          min-height: 68px;
          padding: 0 20px;
          flex:
            0 0 68px;
          background: #FAF8F5;
          border-bottom:
            1px solid
            #E0D9D1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .modal-header h2 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          font-size: 20px;
          line-height: 24px;
          color: #2F2D2A;
        }

        .modal-header p {
          margin: 4px 0 0;
          font-size: 9px;
          line-height: 13px;
          color: #85807A;
        }

        .modal-close {
          width: 34px;
          height: 34px;
          padding: 0;
          border:
            1px solid
            #D9D2CA;
          border-radius: 8px;
          background: #FFFFFF;
          color: #6A655F;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: 0 0 34px;
        }

        .modal-close:hover {
          background: #F4F0EB;
        }

        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* =================================================
           FORM
        ================================================= */

        .product-form {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 16px;
          overscroll-behavior: contain;
        }

        .product-form::-webkit-scrollbar {
          width: 7px;
        }

        .product-form::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: #D5CDC4;
        }

        .product-section {
          margin-bottom: 11px;
          border:
            1px solid
            #E2DBD3;
          border-radius: 10px;
          overflow: hidden;
          background: #FAF8F5;
        }

        .product-section-header {
          width: 100%;
          height: 52px;
          padding: 0 15px;
          border: 0;
          background: #FAF8F5;
          color: #34312E;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-family:
            Georgia,
            serif;
          font-size: 15px;
          line-height: 20px;
          font-weight: 600;
        }

        .product-section-header:hover {
          background: #F7F3EF;
        }

        .product-section-body {
          padding: 0 15px 15px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 12px;
        }

        .form-field {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          color: #4C4945;
          font-size: 9px;
          line-height: 13px;
          font-weight: 700;
        }

        .required-mark {
          color: #A34A4A;
          margin-left: 3px;
        }

        .admin-input {
          width: 100%;
          height: 40px;
          min-height: 40px;
          padding: 0 10px;
          border:
            1px solid
            #D6CEC6;
          border-radius: 8px;
          background: #FFFFFF;
          color: #30302E;
          outline: none;
          font-size: 10px;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .admin-input:hover {
          border-color: #C8BFB6;
        }

        .admin-input:focus {
          border-color: #295C65;
          box-shadow:
            0 0 0
            2px
            rgba(
              41,
              92,
              101,
              0.08
            );
        }

        .admin-input:disabled {
          background: #F1EEEA;
          color: #9A948D;
          cursor: not-allowed;
        }

        .admin-select {
          cursor: pointer;
        }

        .admin-textarea {
          height: auto;
          min-height: 110px;
          padding: 10px;
          resize: vertical;
          line-height: 17px;
        }

        .full-span {
          grid-column: 1 / -1;
        }

        /* =================================================
           IMAGE MANAGER
        ================================================= */

        .image-manager-grid {
          display: grid;
          grid-template-columns:
            260px
            minmax(
              0,
              1fr
            );
          gap: 16px;
        }

        .main-image-card,
        .gallery-card {
          min-width: 0;
        }

        .main-image-preview {
          position: relative;
          width: 100%;
          height: 260px;
          margin-top: 7px;
          border:
            1px dashed
            #CDC4BA;
          border-radius: 9px;
          background: #F3EFEA;
          overflow: hidden;
        }

        .main-image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #A69E95;
          font-size: 9px;
        }

        .upload-button {
          position: absolute;
          left: 8px;
          right: 8px;
          bottom: 8px;
          height: 35px;
          border-radius: 7px;
          background: #295C65;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .upload-button:hover {
          background: #214D55;
        }

        .upload-button input,
        .secondary-upload-button input {
          display: none;
        }

        .gallery-header {
          min-height: 29px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .secondary-upload-button {
          height: 30px;
          padding: 0 10px;
          border:
            1px solid
            #D7D0C8;
          border-radius: 7px;
          background: #FFFFFF;
          color: #55514D;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .secondary-upload-button:hover {
          background: #F7F3ED;
        }

        .gallery-grid {
          width: 100%;
          min-height: 260px;
          margin-top: 7px;
          padding: 10px;
          border:
            1px dashed
            #CDC4BA;
          border-radius: 9px;
          background: #F3EFEA;
          display: grid;
          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );
          align-content: start;
          gap: 8px;
        }

        .gallery-item {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: 7px;
          background: #EDE8E2;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .gallery-remove {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 23px;
          height: 23px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background:
            rgba(
              20,
              20,
              20,
              0.72
            );
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .gallery-remove:hover {
          background:
            rgba(
              20,
              20,
              20,
              0.9
            );
        }

        .gallery-empty {
          grid-column: 1 / -1;
          min-height: 235px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: #8E8881;
          font-size: 9px;
        }

        /* =================================================
           SETTING CARD
        ================================================= */

        .setting-card {
          min-height: 54px;
          padding: 9px 11px;
          border:
            1px solid
            #E0D9D1;
          border-radius: 8px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .setting-card strong {
          display: block;
          color: #45423F;
          font-size: 10px;
          line-height: 14px;
        }

        .setting-card > div > span {
          display: block;
          margin-top: 3px;
          color: #8B867F;
          font-size: 8px;
          line-height: 12px;
        }

        /* =================================================
           OPTIONS
        ================================================= */

        .variant-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .options-grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 12px;
        }

        .option-card,
        .variant-table-card {
          min-width: 0;
          border:
            1px solid
            #E1D9D1;
          border-radius: 8px;
          background: #FFFFFF;
          overflow: hidden;
        }

        .option-card {
          padding: 11px;
        }

        .option-header,
        .variant-table-header {
          min-height: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }

        .option-header strong,
        .variant-table-header strong {
          color: #4A4743;
          font-size: 10px;
          line-height: 14px;
        }

        .option-buttons {
          display: flex;
          gap: 5px;
        }

        .mini-button {
          height: 27px;
          padding: 0 8px;
          border:
            1px solid
            #D7D0C8;
          border-radius: 6px;
          background: #FFFFFF;
          color: #5D5853;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .mini-button:hover {
          background: #F7F3ED;
        }

        .mini-button.primary {
          border-color: #295C65;
          background: #295C65;
          color: #FFFFFF;
        }

        .mini-button.primary:hover {
          background: #214D55;
        }

        .option-row {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            100px
            28px;
          gap: 5px;
          margin-bottom: 6px;
        }

        .size-row {
          grid-template-columns:
            minmax(0, 1fr)
            28px;
        }

        .option-row .admin-input {
          height: 34px;
          min-height: 34px;
          padding: 0 7px;
          border-radius: 6px;
          font-size: 9px;
        }

        .danger-icon-button {
          width: 28px;
          height: 34px;
          padding: 0;
          border:
            1px solid
            #E2CCCC;
          border-radius: 6px;
          background: #FFF8F8;
          color: #A34A4A;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .danger-icon-button:hover {
          background: #FBEDED;
        }

        .option-empty,
        .variant-empty {
          min-height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #99938B;
          font-size: 8px;
        }

        .variant-table-header {
          min-height: 50px;
          padding: 0 10px;
          margin: 0;
          border-bottom:
            1px solid
            #E5DED6;
        }

        .variant-table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .variant-table {
          width: 100%;
          min-width: 780px;
          border-collapse: collapse;
        }

        .variant-table th {
          height: 36px;
          padding: 0 7px;
          background: #F6F2ED;
          color: #827C75;
          font-size: 8px;
          font-weight: 700;
          text-align: left;
          white-space: nowrap;
          border-bottom:
            1px solid
            #E3DBD3;
        }

        .variant-table td {
          padding: 7px;
          border-bottom:
            1px solid
            #EEE8E1;
        }

        .variant-input {
          width: 100%;
          height: 33px;
          padding: 0 6px;
          border:
            1px solid
            #D6CEC6;
          border-radius: 6px;
          background: #FFFFFF;
          color: #30302E;
          font-size: 8px;
          outline: 0;
        }

        .variant-input:focus {
          border-color: #295C65;
        }

        /* =================================================
           SPECIFICATION
        ================================================= */

        .spec-row {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr)
            34px;
          gap: 7px;
          margin-bottom: 7px;
        }

        .outline-button {
          height: 34px;
          padding: 0 11px;
          border:
            1px solid
            #D7D0C8;
          border-radius: 7px;
          background: #FFFFFF;
          color: #5A5651;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .outline-button:hover {
          background: #F7F3ED;
        }

        /* =================================================
           VISIBILITY
        ================================================= */

        .visibility-grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 10px;
        }

        .visibility-card {
          min-height: 54px;
          padding: 7px 10px;
          border:
            1px solid
            #E0D9D1;
          border-radius: 8px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .visibility-copy {
          min-width: 0;
          flex: 1;
        }

        .visibility-title {
          display: block;
          color: #4A4743;
          font-size: 9px;
          line-height: 13px;
          font-weight: 700;
        }

        .visibility-help {
          display: block;
          margin-top: 2px;
          color: #969089;
          font-size: 7.5px;
          line-height: 11px;
        }

        .visibility-card .admin-input {
          width: 130px;
          height: 32px;
          min-height: 32px;
          padding: 0 7px;
          font-size: 9px;
        }

        /* =================================================
           MODAL FOOTER
        ================================================= */

        .modal-footer {
          min-height: 66px;
          flex: 0 0 66px;
          padding: 0 16px;
          background: #FAF8F5;
          border-top:
            1px solid
            #E0D9D1;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .secondary-footer-button,
        .save-footer-button {
          height: 40px;
          padding: 0 15px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .secondary-footer-button {
          border:
            1px solid
            #D6CEC6;
          background: #FFFFFF;
          color: #55514D;
        }

        .secondary-footer-button:hover {
          background: #F7F3EF;
        }

        .save-footer-button {
          border: 0;
          background: #295C65;
          color: #FFFFFF;
        }

        .save-footer-button:hover {
          background: #214D55;
        }

        .secondary-footer-button:disabled,
        .save-footer-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* =================================================
           SPIN
        ================================================= */

        .spin {
          animation:
            product-spin
            1s
            linear
            infinite;
        }

        @keyframes product-spin {
          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1000px) {

          .toolbar {
            flex-wrap: wrap;
          }

          .search-box {
            width: 100%;
          }

          .toolbar-select {
            flex: 1;
          }

          .toolbar-count {
            margin-left: 0;
          }

          .image-manager-grid {
            grid-template-columns:
              1fr;
          }

          .main-image-preview {
            height: 300px;
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 700px) {

          .products-page {
            padding: 12px;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .primary-button {
            width: 100%;
          }

          .toolbar {
            padding: 10px;
          }

          .toolbar-select {
            width: 100%;
            flex: 1 1 100%;
          }

          .toolbar-count {
            width: 100%;
          }

          .actions-cell {
            width: 82px;
            min-width: 82px;
          }

          .action-group {
            min-width: 64px;
            height: 34px;
          }

          .action-icon {
            width: 28px;
            height: 28px;
          }

          .modal-backdrop {
            padding: 10px;
          }

          .product-modal {
            height:
              calc(
                100vh - 20px
              );
            max-height: none;
            border-radius: 11px;
          }

          .modal-header {
            min-height: 62px;
            flex-basis: 62px;
            padding: 0 13px;
          }

          .modal-header h2 {
            font-size: 18px;
          }

          .product-form {
            padding: 10px;
          }

          .product-section-body {
            padding:
              0 10px 10px;
          }

          .form-grid {
            grid-template-columns:
              1fr;
          }

          .full-span {
            grid-column: auto;
          }

          .image-manager-grid {
            grid-template-columns:
              1fr;
          }

          .options-grid {
            grid-template-columns:
              1fr;
          }

          .visibility-grid {
            grid-template-columns:
              1fr;
          }

          .option-row {
            grid-template-columns:
              minmax(0, 1fr)
              90px
              28px;
          }

          .spec-row {
            grid-template-columns:
              1fr
              1fr
              34px;
          }

          .modal-footer {
            min-height: 62px;
            flex-basis: 62px;
            padding: 0 10px;
          }

          .secondary-footer-button,
          .save-footer-button {
            flex: 1;
          }

        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 450px) {

          .page-title {
            font-size: 23px;
          }

          .product-section-header {
            height: 49px;
            font-size: 14px;
          }

          .gallery-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .main-image-preview {
            height: 250px;
          }

          .spec-row {
            grid-template-columns:
              1fr
              1fr
              30px;
          }

        }

        @media (max-width: 380px) {

          .visibility-card {
            gap: 7px;
          }

          .visibility-title {
            font-size: 8.5px;
          }

          .visibility-help {
            font-size: 7px;
          }

          .admin-toggle {
            width: 36px !important;
            min-width: 36px !important;
            flex-basis: 36px !important;
          }

          .admin-toggle.is-on
          .admin-toggle-knob {
            transform:
              translateX(15px) !important;
          }

        }

        @media (
          prefers-reduced-motion: reduce
        ) {

          .admin-toggle,
          .action-icon,
          .spin,
          .skeleton-box {
            transition: none !important;
            animation: none !important;
          }

        }

      `}</style>

    </div>
  );
}