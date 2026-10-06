"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ShoppingCart,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Poppins,
  Cormorant_Garamond,
} from "next/font/google";

import { useCart }     from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import CartStatusButton from "@/components/CartStatusButton";

/* =========================================================
   FONTS
========================================================= */

const poppins = Poppins({
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
    "700",
  ],
  variable:
    "--font-poppins",
  display: "swap",
});

const cormorant =
  Cormorant_Garamond({
    subsets: ["latin"],
    weight: [
      "600",
      "700",
    ],
    variable:
      "--font-cormorant",
    display: "swap",
  });

/* =========================================================
   CONFIG
========================================================= */

const API_URL = (
  process.env
    .NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api"
).replace(/\/$/, "");

const COLORS = {
  teal: "#295C65",
  tealDark: "#214D55",
  cream: "#FAF8F5",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  border: "#E8E0D7",
  text: "#1B1B1B",
};

const FALLBACK_IMAGE =
  "/images/home/products/1.png";

/* =========================================================
   FALLBACK HOME PRODUCTS

   Used only when backend request fails.
========================================================= */

const FALLBACK_PRODUCTS = [
  {
    id: "p1",
    title:
      "Premium Cotton Cambric",
    price: "₹180",
    image:
      "/images/home/products/1.png",
    hoverImage:
      "/images/home/products/2.png",
    gsm: "90–120 GSM",
    width: '44" / 58"',
    composition:
      "100% Cotton",
    moq: "500 Metres",
    colors: [
      "#F1EDE4",
      "#295C65",
      "#BE9D6B",
      "#C97A3D",
      "#1B1B1B",
    ],
  },

  {
    id: "p2",
    title:
      "Ajrakh Block Print",
    price: "₹320",
    image:
      "/images/home/products/3.png",
    hoverImage:
      "/images/home/products/4.png",
    gsm: "130–160 GSM",
    width: '44"',
    composition:
      "Cotton / Mulmul",
    moq: "300 Metres",
    colors: [
      "#2D3142",
      "#8A4B32",
      "#C6A15B",
      "#F1EDE4",
      "#295C65",
    ],
  },

  {
    id: "p3",
    title:
      "Premium Linen",
    price: "₹450",
    image:
      "/images/home/products/5.png",
    hoverImage:
      "/images/home/products/6.png",
    gsm: "150–200 GSM",
    width: '58"',
    composition:
      "100% Linen",
    moq: "200 Metres",
    colors: [
      "#F1EDE4",
      "#8A6A4B",
      "#4A4A4A",
      "#BE9D6B",
      "#FFFFFF",
    ],
  },

  {
    id: "p4",
    title:
      "Rayon Voile",
    price: "₹210",
    image:
      "/images/home/products/7.png",
    hoverImage:
      "/images/home/products/8.png",
    gsm: "60–80 GSM",
    width: '44" / 54"',
    composition:
      "100% Rayon",
    moq: "400 Metres",
    colors: [
      "#E4D3B0",
      "#295C65",
      "#1B1B1B",
      "#C97A3D",
      "#F1EDE4",
    ],
  },

  {
    id: "p5",
    title:
      "Mulmul Cotton",
    price: "₹150",
    image:
      "/images/home/products/9.png",
    hoverImage:
      "/images/home/products/10.png",
    gsm: "40–60 GSM",
    width: '44"',
    composition:
      "100% Cotton",
    moq: "600 Metres",
    colors: [],
  },

  {
    id: "p6",
    title:
      "Classic Muslin",
    price: "₹165",
    image:
      "/images/home/products/11.png",
    hoverImage:
      "/images/home/products/12.png",
    gsm: "50–70 GSM",
    width: '44" / 58"',
    composition:
      "100% Cotton",
    moq: "500 Metres",
    colors: [
      "#F1EDE4",
      "#295C65",
      "#BE9D6B",
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

function imageValue(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value ===
    "string"
  ) {
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

function normalizeColor(
  value
) {
  if (!value) {
    return "";
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  return (
    value?.hex ||
    value?.value ||
    value?.color ||
    value?.code ||
    ""
  );
}

function getSpec(
  specifications,
  targetName
) {
  if (
    !Array.isArray(
      specifications
    )
  ) {
    return "";
  }

  const target =
    String(targetName)
      .trim()
      .toLowerCase();

  const found =
    specifications.find(
      (item) =>
        String(
          item?.name ||
            item?.label ||
            item?.key ||
            ""
        )
          .trim()
          .toLowerCase() ===
        target
    );

  return (
    found?.value || ""
  );
}

function slugify(
  value = ""
) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(
      /&/g,
      "and"
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      "");
}

function extractProducts(
  payload
) {
  if (
    Array.isArray(payload)
  ) {
    return payload;
  }

  if (
    Array.isArray(
      payload?.products
    )
  ) {
    return payload.products;
  }

  if (
    Array.isArray(
      payload?.data
    )
  ) {
    return payload.data;
  }

  if (
    Array.isArray(
      payload?.data?.products
    )
  ) {
    return payload.data.products;
  }

  return [];
}

/* =========================================================
   NORMALIZE BACKEND PRODUCT

   Converts backend product shape into
   exactly the shape ProductCard needs.
========================================================= */

function normalizeBackendProduct(
  item
) {
  const regularPrice =
    Number(
      item?.pricing
        ?.regularPrice ??
        item?.regularPrice ??
        item?.price ??
        0
    );

  const salePrice =
    Number(
      item?.pricing
        ?.salePrice ??
        item?.salePrice ??
        0
    );

  const hasSale =
    Boolean(item?.showOnSale) &&
    salePrice > 0 &&
    salePrice <
      regularPrice;

  const mainImage =
    imageValue(
      item?.mainImage
    ) ||
    imageValue(
      item?.image
    ) ||
    imageValue(
      item?.imageUrl
    );

  const gallery =
    Array.isArray(
      item?.gallery
    )
      ? item.gallery
      : [];

  const imageArray =
    Array.isArray(
      item?.images
    )
      ? item.images
      : [];

  const images = [
    mainImage,

    ...imageArray.map(
      imageValue
    ),

    ...gallery.map(
      imageValue
    ),
  ].filter(Boolean);

  const uniqueImages =
    [
      ...new Set(
        images
      ),
    ];

  const colorsSource =
    Array.isArray(
      item?.options?.colors
    )
      ? item.options.colors
      : Array.isArray(
          item?.colors
        )
      ? item.colors
      : [];

  const colors =
    colorsSource
      .map(
        normalizeColor
      )
      .filter(Boolean);

  const specifications =
    Array.isArray(
      item?.specifications
    )
      ? item.specifications
      : [];

  const title =
    item?.title ||
    item?.name ||
    item?.productName ||
    "Untitled Product";

  const slug =
    item?.slug ||
    slugify(
      title
    );

  return {
    id:
      item?._id ||
      item?.id ||
      item?.slug ||
      item?.sku ||
      slug,

    title,

    slug,

    price:
      `₹${Number(
        hasSale
          ? salePrice
          : regularPrice
      ).toLocaleString(
        "en-IN"
      )}`,

    image:
      uniqueImages[0] ||
      FALLBACK_IMAGE,

    hoverImage:
      uniqueImages[1] ||
      uniqueImages[0] ||
      FALLBACK_IMAGE,

    gsm:
      item?.details
        ?.gsm ||
      item?.gsm ||
      getSpec(
        specifications,
        "GSM"
      ) ||
      "—",

    width:
      item?.details
        ?.width ||
      item?.width ||
      getSpec(
        specifications,
        "Width"
      ) ||
      "—",

    composition:
      item?.details
        ?.material ||
      item?.details
        ?.fabric ||
      item?.composition ||
      getSpec(
        specifications,
        "Composition"
      ) ||
      "—",

    moq:
      item?.moq ??
      item?.minimumOrderQuantity ??
      item?.minimumOrderQty
        ? `${Number(
            item?.moq ??
              item?.minimumOrderQuantity ??
              item?.minimumOrderQty
          )} Metres`
        : "—",

    colors:
      [
        ...new Set(
          colors
        ),
      ],
  };
}

/* =========================================================
   SKELETON CARD
========================================================= */

function ProductSkeleton() {
  return (
    <article
      className="pc-card pc-skeleton-card"
      style={
        styles.card
      }
    >
      <div
        style={{
          ...styles.imageWrap,
          background:
            "#EEE7DE",
        }}
      >
        <div className="pc-skeleton-image" />
      </div>

      <div
        style={{
          ...styles.body,
          gap: 0,
        }}
      >
        <div className="pc-skeleton-title" />

        <div
          style={{
            ...styles.specGrid,
            marginTop: 8,
          }}
        >
          {Array.from({
            length: 4,
          }).map(
            (
              _,
              index
            ) => (
              <div
                key={
                  index
                }
                style={
                  styles.specCell
                }
              >
                <div className="pc-skeleton-label" />
                <div className="pc-skeleton-value" />
              </div>
            )
          )}
        </div>

        <div
          style={{
            ...styles.colorsRow,
            marginTop: 14,
          }}
        >
          <div className="pc-skeleton-color-label" />

          <div
            className="pc-skeleton-dots"
          >
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        <div
          style={{
            ...styles.buttonRow,
            marginTop:
              "auto",
          }}
        >
          <div className="pc-skeleton-button" />
          <div className="pc-skeleton-button" />
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
}) {
  const [
    added,
    setAdded,
  ] = useState(false);

  const [
    flyId,
    setFlyId,
  ] = useState(0);

  const [
    mobileHover,
    setMobileHover,
  ] = useState(false);

  const timeoutRef =
    useRef(null);

  useEffect(() => {
    return () => {
      if (
        timeoutRef.current
      ) {
        clearTimeout(
          timeoutRef.current
        );
      }
    };
  }, []);

  const handleAddToCart =
    () => {
      setAdded(true);

      setFlyId(
        (value) =>
          value + 1
      );

      if (
        timeoutRef.current
      ) {
        clearTimeout(
          timeoutRef.current
        );
      }

      timeoutRef.current =
        window.setTimeout(
          () => {
            setAdded(false);
          },
          1800
        );
    };

  const hasSecondImage =
    Boolean(
      product?.hoverImage &&
        product.hoverImage !==
          product.image
    );

  return (
    <article
      className="pc-card"
      style={styles.card}
      onTouchStart={() => {
        if (
          hasSecondImage
        ) {
          setMobileHover(
            (current) =>
              !current
          );
        }
      }}
    >
      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="pc-image-wrap"
        style={
          styles.imageWrap
        }
      >
        {/* PRIMARY */}

        <img
          src={
            product.image ||
            FALLBACK_IMAGE
          }
          alt={
            product.title
          }
          loading="lazy"
          draggable="false"
          className="pc-product-image pc-product-image-primary"
          style={{
            ...styles.image,
            opacity:
              mobileHover
                ? 0
                : undefined,
          }}
        />

        {/* SECOND */}

        {hasSecondImage && (
          <img
            src={
              product.hoverImage
            }
            alt=""
            aria-hidden="true"
            loading="lazy"
            draggable="false"
            className="pc-product-image pc-product-image-hover"
            style={{
              ...styles.image,
              opacity:
                mobileHover
                  ? 1
                  : undefined,
            }}
          />
        )}

        {/* PRICE */}

        <span
          style={
            styles.priceBadge
          }
        >
          {
            product.price
          }
        </span>
      </div>

      {/* =================================================
          BODY
      ================================================= */}

      <div
        className="pc-body"
        style={
          styles.body
        }
      >
        {/* TITLE */}

        <h3
          className="pc-title"
          style={
            styles.title
          }
        >
          {
            product.title
          }
        </h3>

        {/* SPECS */}

        <div
          className="pc-spec-grid"
          style={
            styles.specGrid
          }
        >
          <div
            style={
              styles.specCell
            }
          >
            <span
              style={
                styles.specLabel
              }
            >
              GSM
            </span>

            <span
              style={
                styles.specValue
              }
            >
              {
                product.gsm ||
                "—"
              }
            </span>
          </div>

          <div
            style={
              styles.specCell
            }
          >
            <span
              style={
                styles.specLabel
              }
            >
              WIDTH
            </span>

            <span
              style={
                styles.specValue
              }
            >
              {
                product.width ||
                "—"
              }
            </span>
          </div>

          <div
            style={
              styles.specCell
            }
          >
            <span
              style={
                styles.specLabel
              }
            >
              COMPOSITION
            </span>

            <span
              style={
                styles.specValue
              }
            >
              {
                product.composition ||
                "—"
              }
            </span>
          </div>

          <div
            style={
              styles.specCell
            }
          >
            <span
              style={
                styles.specLabel
              }
            >
              MOQ
            </span>

            <span
              style={
                styles.specValue
              }
            >
              {
                product.moq ||
                "—"
              }
            </span>
          </div>
        </div>

        {/* COLORS */}

        <div
          className="pc-colors-row"
          style={
            styles.colorsRow
          }
        >
          <span
            style={
              styles.specLabel
            }
          >
            COLORS
          </span>

          <div
            className="pc-colors-dots"
            style={
              styles.colorsDots
            }
          >
            {product.colors
                ?.length >
            0 ? (
              product.colors
                .slice(
                  0,
                  5
                )
                .map(
                  (
                    color,
                    index
                  ) => (
                    <span
                      key={`${product.id}-color-${index}`}
                      className="pc-color-dot"
                      style={{
                        ...styles.colorDot,
                        background:
                          color,
                      }}
                    />
                  )
                )
            ) : (
              <span
                style={
                  styles.colorsEmpty
                }
              >
                On request
              </span>
            )}
          </div>
        </div>

        {/* BUTTONS */}

        <div
          className="pc-button-row"
          style={
            styles.buttonRow
          }
        >
          {/* CART */}

            <CartStatusButton
              productId={product.id}
              compact={true}
              showLabel={true}
            />

          {/* QUOTE */}

          <button
            type="button"
            className="pc-quote-btn"
            style={
              styles.secondaryBtn
            }
          >
            Request Quote
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   FEATURED / HOME PRODUCTS
========================================================= */

export default function FeaturedProducts() {
  const scrollRef =
    useRef(null);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    backendFailed,
    setBackendFailed,
  ] = useState(false);

  const [
    canScrollLeft,
    setCanScrollLeft,
  ] = useState(false);

  const [
    canScrollRight,
    setCanScrollRight,
  ] = useState(false);

  /* =======================================================
     FETCH HOME PRODUCTS
  ======================================================= */

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadHomeProducts() {
      setLoading(true);
      setBackendFailed(false);

      try {
        const response =
          await fetch(
            `${API_URL}/products?limit=1000`,
            {
              method: "GET",
              cache: "no-store",
              signal:
                controller.signal,
            }
          );

        let payload = {};

        try {
          payload =
            await response.json();
        } catch {
          payload = {};
        }

        if (
          !response.ok
        ) {
          throw new Error(
            payload?.message ||
              "Failed to load home products"
          );
        }

        const rawProducts =
          extractProducts(
            payload
          );

        /*
         * Only admin products having:
         *
         * showOnHome === true
         *
         * are displayed here.
         */

        const homeProducts =
          rawProducts
            .filter(
              (product) =>
                product?.status ===
                  "published" ||
                !product?.status
            )
            .filter(
              (product) =>
                product?.showOnHome ===
                true
            )
            .map(
              normalizeBackendProduct
            );

        if (
          homeProducts.length ===
          0
        ) {
          setProducts(
            FALLBACK_PRODUCTS
          );
          setBackendFailed(
            true
          );
          return;
        }

        setProducts(
          homeProducts
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Home Products API Error:",
          error
        );

        /*
         * Backend unavailable:
         * show existing dummy products.
         */

        setProducts(
          FALLBACK_PRODUCTS
        );

        setBackendFailed(
          true
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadHomeProducts();

    return () =>
      controller.abort();
  }, []);

  /* =======================================================
     CHECK SLIDER POSITION
  ======================================================= */

  const updateScrollState =
    () => {
      const element =
        scrollRef.current;

      if (!element) {
        return;
      }

      const maxScroll =
        element.scrollWidth -
        element.clientWidth;

      setCanScrollLeft(
        element.scrollLeft >
          4
      );

      setCanScrollRight(
        element.scrollLeft <
          maxScroll - 4
      );
    };

  /* =======================================================
     SLIDER LISTENERS
  ======================================================= */

  useEffect(() => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    updateScrollState();

    element.addEventListener(
      "scroll",
      updateScrollState,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateScrollState
    );

    return () => {
      element.removeEventListener(
        "scroll",
        updateScrollState
      );

      window.removeEventListener(
        "resize",
        updateScrollState
      );
    };
  }, [
    products.length,
    loading,
  ]);

  /* =======================================================
     SCROLL AMOUNT
  ======================================================= */

  const scrollSlider = (
    direction
  ) => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    const firstCard =
      element.querySelector(
        ".pc-card"
      );

    if (!firstCard) {
      return;
    }

    const gap = 24;

    const cardWidth =
      firstCard
        .getBoundingClientRect()
        .width;

    element.scrollBy({
      left:
        (cardWidth + gap) *
        direction,
      behavior: "smooth",
    });
  };

  /* =======================================================
     BACKEND PRODUCTS MEMO
  ======================================================= */

  const displayProducts =
    useMemo(() => {
      return Array.isArray(
        products
      )
        ? products
        : [];
    }, [products]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={`${poppins.variable} ${cormorant.variable}`}
      style={
        styles.section
      }
    >
      <div
        className="pc-container"
        style={
          styles.container
        }
      >
        {/* =================================================
            EYEBROW
        ================================================= */}

        <div
          style={
            styles.eyebrow
          }
        >
          <span
            style={
              styles.eyebrowLine
            }
          />

          <span
            style={
              styles.eyebrowText
            }
          >
            Wholesale Catalogue
          </span>
        </div>

        {/* =================================================
            HEADING
        ================================================= */}

        <h2
          className="pc-heading"
          style={
            styles.heading
          }
        >
          Featured Wholesale
          Fabrics
        </h2>

        {/* =================================================
            SUBTEXT
        ================================================= */}

        <p
          className="pc-subtext"
          style={
            styles.subtext
          }
        >
          Request a quote for bulk
          orders. No retail. No
          readymade. Only premium
          fabric yardage.
        </p>

        {/* =================================================
            SLIDER WRAPPER
        ================================================= */}

        <div
          className="pc-slider-shell"
        >
          {/* LEFT ARROW */}

          {canScrollLeft && (
            <button
              type="button"
              className="pc-slider-arrow pc-slider-arrow-left"
              onClick={() =>
                scrollSlider(
                  -1
                )
              }
              aria-label="Previous products"
            >
              <ChevronLeft
                size={19}
              />
            </button>
          )}

          {/* SLIDER */}

          <div
            ref={scrollRef}
            className="pc-scroll"
            style={
              styles.scrollRow
            }
          >
            {loading ? (
              Array.from({
                length: 6,
              }).map(
                (
                  _,
                  index
                ) => (
                  <ProductSkeleton
                    key={
                      index
                    }
                  />
                )
              )
            ) : displayProducts
                .length > 0 ? (
              displayProducts.map(
                (
                  product
                ) => (
                  <ProductCard
                    key={
                      product.id
                    }
                    product={
                      product
                    }
                  />
                )
              )
            ) : (
              <div
                className="pc-empty"
              >
                No home products
                available.
              </div>
            )}
          </div>

          {/* RIGHT ARROW */}

          {canScrollRight && (
            <button
              type="button"
              className="pc-slider-arrow pc-slider-arrow-right"
              onClick={() =>
                scrollSlider(
                  1
                )
              }
              aria-label="Next products"
            >
              <ChevronRight
                size={19}
              />
            </button>
          )}
        </div>

        {/* FALLBACK NOTICE */}

        {backendFailed &&
          !loading && (
            <p
              style={{
                margin:
                  "13px 0 0",
                textAlign:
                  "center",
                color:
                  "#8A8178",
                fontFamily:
                  "var(--font-poppins), sans-serif",
                fontSize: 9,
              }}
            >
              Live products could not
              be loaded. Showing
              catalogue fallback.
            </p>
          )}
      </div>

      {/* =====================================================
          CSS
      ===================================================== */}

      <style>{`

        /* =====================================================
           SLIDER
        ===================================================== */

        .pc-slider-shell {
          position: relative;
          width: 100%;
        }

        .pc-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;

          overflow-x: auto;
          overflow-y: hidden;

          scroll-snap-type: x mandatory;

          -webkit-overflow-scrolling:
            touch;

          overscroll-behavior-x:
            contain;

          scroll-behavior:
            smooth;

          scrollbar-gutter:
            stable;

          touch-action:
            pan-x;

          width:
            100%;

          display:
            flex;

          gap:
            24px;

          box-sizing:
            border-box;
        }

        .pc-scroll::-webkit-scrollbar {
          display: none;
        }

        /* =====================================================
           CARD
        ===================================================== */

        .pc-card {
          position: relative;

          flex:
            0 0 300px;

          width:
            300px;

          min-width:
            300px;

          max-width:
            300px;

          scroll-snap-align:
            start;

          border:
            1px solid
            transparent;

          transition:
            transform .35s ease,
            box-shadow .35s ease,
            border-color .35s ease;
        }

        /* =====================================================
           DESKTOP HOVER
        ===================================================== */

        @media (
          hover: hover
        ) and (
          pointer: fine
        ) {

          .pc-card:hover {
            transform:
              translateY(-8px);

            border-color:
              rgba(
                41,
                92,
                101,
                .12
              );

            box-shadow:
              0 16px 34px
              rgba(
                41,
                92,
                101,
                .14
              );
          }

          .pc-card:hover
          .pc-product-image-hover {
            opacity: 1;
          }

          .pc-card:hover
          .pc-product-image-primary {
            opacity: 0;
          }

          .pc-card:hover
          .pc-product-image {
            transform:
              scale(1.045);
          }
        }

        /* =====================================================
           IMAGE
        ===================================================== */

        .pc-image-wrap {
          overflow:
            hidden;

          isolation:
            isolate;
        }

        .pc-product-image {
          transition:
            opacity .35s ease,
            transform .45s ease;
        }

        .pc-product-image-primary {
          opacity:
            1;

          z-index:
            1;
        }

        .pc-product-image-hover {
          opacity:
            0;

          z-index:
            2;
        }

        /* =====================================================
           CART
        ===================================================== */

        .pc-cart-btn {
          position:
            relative;

          overflow:
            visible;
        }

        .pc-fly-icon {
          position:
            absolute;

          top:
            -6px;

          right:
            10px;

          width:
            22px;

          height:
            22px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            ${COLORS.gold};

          background:
            #FFFFFF;

          border-radius:
            999px;

          animation:
            pc-fly-up
            .9s
            ease
            forwards;

          pointer-events:
            none;

          z-index:
            10;
        }

        @keyframes pc-fly-up {

          0% {
            opacity:
              1;

            transform:
              translateY(0)
              scale(.6);
          }

          30% {
            opacity:
              1;

            transform:
              translateY(-18px)
              scale(1.15);
          }

          100% {
            opacity:
              0;

            transform:
              translateY(-48px)
              scale(.8);
          }
        }

        @keyframes pc-btn-pop {

          0% {
            transform:
              scale(1);
          }

          40% {
            transform:
              scale(1.04);
          }

          100% {
            transform:
              scale(1);
          }
        }

        .pc-cart-btn:active {
          animation:
            pc-btn-pop
            .3s
            ease;
        }

        /* =====================================================
           SLIDER ARROWS
        ===================================================== */

        .pc-slider-arrow {
          position:
            absolute;

          top:
            50%;

          transform:
            translateY(-50%);

          z-index:
            20;

          width:
            38px;

          height:
            38px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            0;

          border:
            1px solid
            rgba(
              41,
              92,
              101,
              .15
            );

          border-radius:
            50%;

          background:
            rgba(
              255,
              255,
              255,
              .96
            );

          color:
            ${COLORS.teal};

          cursor:
            pointer;

          box-shadow:
            0 5px 18px
            rgba(
              0,
              0,
              0,
              .10
            );

          backdrop-filter:
            blur(6px);

          -webkit-backdrop-filter:
            blur(6px);
        }

        .pc-slider-arrow-left {
          left:
            -19px;
        }

        .pc-slider-arrow-right {
          right:
            -19px;
        }

        .pc-slider-arrow:hover {
          background:
            ${COLORS.teal};

          color:
            #FFFFFF;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .pc-empty {
          min-height:
            500px;

          flex:
            1;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          color:
            ${COLORS.navGray};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            12px;
        }

        /* =====================================================
           SKELETON
        ===================================================== */

        .pc-skeleton-card {
          pointer-events:
            none;

          transform:
            none !important;

          box-shadow:
            none !important;
        }

        .pc-skeleton-image,
        .pc-skeleton-title,
        .pc-skeleton-label,
        .pc-skeleton-value,
        .pc-skeleton-color-label,
        .pc-skeleton-button {
          background:
            linear-gradient(
              90deg,
              #E8E1D9 20%,
              #F4EFEA 40%,
              #E8E1D9 60%
            );

          background-size:
            200% 100%;

          animation:
            pc-skeleton
            1.35s
            ease-in-out
            infinite;
        }

        .pc-skeleton-image {
          width:
            100%;

          height:
            100%;
        }

        .pc-skeleton-title {
          width:
            72%;

          height:
            20px;

          margin-bottom:
            14px;

          border-radius:
            5px;
        }

        .pc-skeleton-label {
          width:
            42%;

          height:
            8px;

          margin-bottom:
            6px;

          border-radius:
            5px;
        }

        .pc-skeleton-value {
          width:
            78%;

          height:
            11px;

          border-radius:
            5px;
        }

        .pc-skeleton-color-label {
          width:
            48px;

          height:
            8px;

          border-radius:
            5px;
        }

        .pc-skeleton-dots {
          display:
            flex;

          gap:
            7px;
        }

        .pc-skeleton-dots span {
          width:
            17px;

          height:
            17px;

          border-radius:
            50%;

          background:
            #E8E1D9;

          animation:
            pc-skeleton
            1.35s
            ease-in-out
            infinite;
        }

        .pc-skeleton-button {
          height:
            40px;

          border-radius:
            999px;
        }

        @keyframes pc-skeleton {

          0% {
            background-position:
              200% 0;
          }

          100% {
            background-position:
              -200% 0;
          }
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {

          .pc-container {
            padding:
              80px 32px !important;
          }

          .pc-scroll {
            gap:
              20px !important;
          }

          .pc-card {
            flex:
              0 0 285px;

            width:
              285px;

            min-width:
              285px;

            max-width:
              285px;
          }

          .pc-slider-arrow-left {
            left:
              -16px;
          }

          .pc-slider-arrow-right {
            right:
              -16px;
          }
        }

        /* =====================================================
           MOBILE HEADING
        ===================================================== */

        @media (max-width: 768px) {

          .pc-heading {
            font-size:
              38px !important;

            line-height:
              1.15 !important;
          }

          .pc-subtext {
            font-size:
              15px !important;

            line-height:
              1.55 !important;
          }

          .pc-scroll {
            gap:
              14px !important;
          }

          .pc-slider-arrow {
            display:
              none;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 560px) {

          .pc-container {
            padding:
              50px 16px !important;
          }

          .pc-heading {
            font-size:
              29px !important;

            line-height:
              1.15 !important;

            margin-bottom:
              14px !important;
          }

          .pc-subtext {
            font-size:
              13.5px !important;

            line-height:
              1.55 !important;

            margin-bottom:
              30px !important;
          }

          .pc-scroll {
            margin:
              0 -16px !important;

            padding:
              4px 16px 10px 16px !important;

            gap:
              12px !important;

            overflow-x:
              auto !important;

            scroll-snap-type:
              x mandatory !important;

            -webkit-overflow-scrolling:
              touch !important;
          }

          /*
           * EXACTLY 2 CARDS ON SCREEN
           */
          .pc-card {
            flex:
              0 0 calc(
                (100vw - 44px) / 2
              ) !important;

            width:
              calc(
                (100vw - 44px) / 2
              ) !important;

            min-width:
              calc(
                (100vw - 44px) / 2
              ) !important;

            max-width:
              calc(
                (100vw - 44px) / 2
              ) !important;

            height:
              405px !important;

            min-height:
              405px !important;

            max-height:
              405px !important;

            border-radius:
              12px !important;

            transform:
              none !important;
          }

          .pc-card:hover {
            transform:
              none !important;

            box-shadow:
              0 1px 3px
              rgba(
                0,
                0,
                0,
                .06
              ) !important;
          }

          .pc-image-wrap {
            height:
              138px !important;
          }

          .pc-body {
            padding:
              10px 10px 11px !important;
          }

          .pc-title {
            font-size:
              15px !important;

            line-height:
              1.15 !important;

            margin-bottom:
              9px !important;

            min-height:
              34px;

            display:
              -webkit-box;

            -webkit-line-clamp:
              2;

            -webkit-box-orient:
              vertical;

            overflow:
              hidden;
          }

          .pc-spec-grid {
            row-gap:
              6px !important;

            column-gap:
              6px !important;

            margin-bottom:
              7px !important;
          }

          .pc-spec-label {
            font-size:
              6.5px !important;

            letter-spacing:
              .6px !important;
          }

          .pc-spec-value {
            font-size:
              7.8px !important;

            line-height:
              1.25 !important;

            max-height:
              20px;

            overflow:
              hidden;
          }

          .pc-colors-row {
            min-height:
              19px !important;

            margin-bottom:
              8px !important;

            gap:
              5px !important;
          }

          .pc-colors-dots {
            gap:
              3px !important;
          }

          .pc-color-dot {
            width:
              10px !important;

            height:
              10px !important;
          }

          .pc-button-row {
            gap:
              4px !important;
          }

          .pc-cart-btn,
          .pc-quote-btn {
            font-size:
              6.8px !important;

            height:
              29px !important;

            min-height:
              29px !important;

            padding:
              0 4px !important;

            gap:
              3px !important;
          }

          .pc-cart-btn svg {
            width:
              10px !important;

            height:
              10px !important;
          }

          .pc-fly-icon {
            right:
              5px;

            width:
              17px;

            height:
              17px;
          }

          .pc-fly-icon svg {
            width:
              11px;

            height:
              11px;
          }

          .pc-price-mobile {
            font-size:
              8px;
          }
        }

        /* =====================================================
           VERY SMALL MOBILE
        ===================================================== */

        @media (max-width: 380px) {

          .pc-card {
            flex:
              0 0 calc(
                (100vw - 40px) / 2
              ) !important;

            width:
              calc(
                (100vw - 40px) / 2
              ) !important;

            min-width:
              calc(
                (100vw - 40px) / 2
              ) !important;

            max-width:
              calc(
                (100vw - 40px) / 2
              ) !important;

            height:
              382px !important;

            min-height:
              382px !important;

            max-height:
              382px !important;
          }

          .pc-image-wrap {
            height:
              126px !important;
          }

          .pc-body {
            padding:
              9px !important;
          }

          .pc-title {
            font-size:
              14px !important;
          }

          .pc-spec-value {
            font-size:
              7.2px !important;
          }

          .pc-cart-btn,
          .pc-quote-btn {
            font-size:
              6.3px !important;
          }
        }

        /* =====================================================
           TOUCH DEVICES
        ===================================================== */

        @media (
          hover: none
        ) and (
          pointer: coarse
        ) {

          .pc-product-image {
            transition:
              opacity .22s ease;
          }

          .pc-card {
            -webkit-tap-highlight-color:
              transparent;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (
          prefers-reduced-motion:
            reduce
        ) {

          .pc-card,
          .pc-product-image,
          .pc-fly-icon,
          .pc-cart-btn,
          .pc-slider-arrow,
          .pc-skeleton-image,
          .pc-skeleton-title,
          .pc-skeleton-label,
          .pc-skeleton-value,
          .pc-skeleton-color-label,
          .pc-skeleton-button,
          .pc-skeleton-dots span {
            transition:
              none !important;

            animation:
              none !important;
          }
        }

      `}</style>
    </section>
  );
}

/* =========================================================
   INLINE STYLES
========================================================= */

const styles = {

  section: {
    width:
      "100%",

    background:
      COLORS.cream,

    boxSizing:
      "border-box",
  },

  container: {
    width:
      "100%",

    maxWidth:
      1400,

    margin:
      "0 auto",

    padding:
      "96px 32px",

    boxSizing:
      "border-box",

    textAlign:
      "center",
  },

  eyebrow: {
    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "flex-start",

    gap:
      14,

    marginBottom:
      20,
  },

  eyebrowLine: {
    width:
      36,

    height:
      1,

    background:
      COLORS.gold,

    display:
      "inline-block",
  },

  eyebrowText: {
    fontFamily:
      "var(--font-poppins), sans-serif",

    color:
      COLORS.gold,

    fontWeight:
      500,

    letterSpacing:
      2,

    fontSize:
      13,

    textTransform:
      "uppercase",
  },

  heading: {
    fontFamily:
      "var(--font-cormorant), serif",

    color:
      "#1B1B1B",

    fontWeight:
      600,

    fontSize:
      40,

    lineHeight:
      1.15,

    margin:
      "0 0 20px 0",
  },

  subtext: {
    fontFamily:
      "var(--font-poppins), sans-serif",

    color:
      COLORS.navGray,

    fontWeight:
      400,

    fontSize:
      14,

    lineHeight:
      1.7,

    margin:
      "0 auto 56px auto",

    maxWidth:
      460,
  },

  scrollRow: {
    display:
      "flex",

    gap:
      24,

    width:
      "100%",

    overflowX:
      "auto",

    scrollSnapType:
      "x mandatory",

    WebkitOverflowScrolling:
      "touch",

    scrollbarWidth:
      "none",

    msOverflowStyle:
      "none",

    boxSizing:
      "border-box",

    textAlign:
      "left",

    paddingBottom:
      4,
  },

  card: {
    flex:
      "0 0 auto",

    width:
      300,

    minWidth:
      300,

    height:
      500,

    scrollSnapAlign:
      "start",

    background:
      COLORS.white,

    borderRadius:
      18,

    overflow:
      "hidden",

    boxSizing:
      "border-box",

    boxShadow:
      "0 1px 3px rgba(0,0,0,0.06)",

    display:
      "flex",

    flexDirection:
      "column",
  },

  imageWrap: {
    position:
      "relative",

    width:
      "100%",

    height:
      220,

    flexShrink:
      0,

    overflow:
      "hidden",

    boxSizing:
      "border-box",
  },

  image: {
    position:
      "absolute",

    inset:
      0,

    width:
      "100%",

    height:
      "100%",

    objectFit:
      "contain",

    display:
      "block",

    backgroundColor:
      COLORS.cream,
  },

  priceBadge: {
    position:
      "absolute",

    top:
      14,

    right:
      14,

    zIndex:
      5,

    background:
      COLORS.teal,

    color:
      COLORS.white,

    fontFamily:
      "var(--font-poppins), sans-serif",

    fontWeight:
      600,

    fontSize:
      12.5,

    padding:
      "7px 14px",

    borderRadius:
      999,

    whiteSpace:
      "nowrap",

    boxShadow:
      "0 2px 8px rgba(0,0,0,0.12)",
  },

  body: {
    padding:
      "16px 18px 18px 18px",

    boxSizing:
      "border-box",

    display:
      "flex",

    flexDirection:
      "column",

    flex:
      1,

    minHeight:
      0,
  },

  title: {
    fontFamily:
      "var(--font-cormorant), serif",

    color:
      "#1B1B1B",

    fontWeight:
      600,

    fontSize:
      18,

    lineHeight:
      1.2,

    margin:
      "0 0 12px 0",
  },

  specGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "1fr 1fr",

    rowGap:
      10,

    columnGap:
      10,

    marginBottom:
      12,
  },

  specCell: {
    display:
      "flex",

    flexDirection:
      "column",

    gap:
      4,

    minWidth:
      0,
  },

  specLabel: {
    fontFamily:
      "var(--font-poppins), sans-serif",

    color:
      COLORS.gold,

    fontWeight:
      500,

    fontSize:
      11,

    letterSpacing:
      1,

    textTransform:
      "uppercase",
  },

  specValue: {
    fontFamily:
      "var(--font-poppins), sans-serif",

    color:
      "#1B1B1B",

    fontWeight:
      400,

    fontSize:
      13,

    lineHeight:
      1.3,

    overflow:
      "hidden",

    textOverflow:
      "ellipsis",
  },

  colorsRow: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      12,

    minHeight:
      28,

    marginBottom:
      20,

    minWidth:
      0,
  },

  colorsDots: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      8,

    minWidth:
      0,

    overflow:
      "hidden",
  },

  colorDot: {
    width:
      18,

    height:
      18,

    flexShrink:
      0,

    border:
      "1px solid rgba(0,0,0,0.12)",

    borderRadius:
      "50%",

    display:
      "inline-block",

    boxSizing:
      "border-box",
  },

  colorsEmpty: {
    fontFamily:
      "var(--font-poppins), sans-serif",

    color:
      COLORS.navGray,

    fontSize:
      13,

    fontStyle:
      "italic",
  },

  buttonRow: {
    display:
      "flex",

    gap:
      10,

    marginTop:
      "auto",

    width:
      "100%",
  },

  primaryBtn: {
    flex:
      1,

    minWidth:
      0,

    height:
      42,

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      8,

    fontFamily:
      "var(--font-poppins), sans-serif",

    fontWeight:
      500,

    fontSize:
      13.5,

    color:
      COLORS.white,

    border:
      "none",

    borderRadius:
      999,

    padding:
      "0 14px",

    cursor:
      "pointer",

    whiteSpace:
      "nowrap",

    transition:
      "background .25s ease",
  },

  secondaryBtn: {
    flex:
      1,

    minWidth:
      0,

    height:
      42,

    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    fontFamily:
      "var(--font-poppins), sans-serif",

    fontWeight:
      500,

    fontSize:
      13.5,

    color:
      COLORS.teal,

    background:
      "transparent",

    border:
      `1.5px solid ${COLORS.teal}`,

    borderRadius:
      999,

    padding:
      "0 14px",

    cursor:
      "pointer",

    whiteSpace:
      "nowrap",
  },

};