"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
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

import { products as fallbackProducts } from "../data/product";
import { useCart }     from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api"
).replace(/\/$/, "");

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  teal: "#295C65",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  navGray: "#696968",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};

/* =========================================================
   HERO IMAGES
========================================================= */

const SALE_IMAGES = {
  desktop:
    "/images/contact/desktopHero.png",

  mobile:
    "/images/contact/mobileHero.png",
};

function normalizeHeroImage(value) {
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

/* =========================================================
   SALE SETTINGS
========================================================= */

/*
  IMPORTANT:
  Countdown ki actual ending date yahan change kar sakte ho.

  Format:
  YYYY-MM-DDTHH:mm:ss+05:30
*/



const PAGE_SIZE = 8;

function normalizeImageValue(value) {
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

function normalizeColor(value) {
  if (!value) return "";

  if (typeof value === "string") return value.trim();

  return (
    value?.hex ||
    value?.value ||
    value?.color ||
    value?.name ||
    value?.code ||
    ""
  );
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
    value?.value ||
      value?.name ||
      value?.color ||
      value?.colour ||
      ""
  ).trim();
  const hex = String(value?.hex || "").trim();

  if (!name && !optionValue) return null;

  return {
    name: name || optionValue,
    value: optionValue || name,
    hex: hex || optionValue || name,
    regularPrice: Number(value?.regularPrice ?? 0) || 0,
    salePrice: Number(value?.salePrice ?? 0) || 0,
    images: Array.isArray(value?.images)
      ? value.images.map(normalizeImageValue).filter(Boolean)
      : [],
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

  const color =
    value?.color ??
    value?.colour ??
    value?.selectedColor ??
    "";
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
      ? value.images.map(normalizeImageValue).filter(Boolean)
      : [],
  };
}

function sameOption(a, b) {
  if (!a || !b) return false;

  const av = optionName(a).trim().toLowerCase();
  const bv = optionName(b).trim().toLowerCase();
  if (!av || !bv || av !== bv) return false;

  const aObj = typeof a === "object" ? a : null;
  const bObj = typeof b === "object" ? b : null;

  const aValue = String(aObj?.value || "").trim().toLowerCase();
  const bValue = String(bObj?.value || "").trim().toLowerCase();
  const aHex = String(aObj?.hex || "").trim().toLowerCase();
  const bHex = String(bObj?.hex || "").trim().toLowerCase();

  return (
    (!aValue || !bValue || aValue === bValue) &&
    (!aHex || !bHex || aHex === bHex)
  );
}

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
    regularPrice > salePrice;

  const finalPrice =
    hasSale && salePrice > 0
      ? salePrice
      : regularPrice;

  const list = [
    normalizeImageValue(item?.mainImage),
    normalizeImageValue(item?.image),
    normalizeImageValue(item?.imageUrl),
    ...(Array.isArray(item?.gallery)
      ? item.gallery.map(normalizeImageValue)
      : []),
    ...(Array.isArray(item?.images)
      ? item.images.map(normalizeImageValue)
      : []),
  ].filter(Boolean);

  const uniqueImages = [
    ...new Set(list),
  ];

  const colorSource =
    Array.isArray(item?.options?.colors)
      ? item.options.colors
      : Array.isArray(item?.colors)
      ? item.colors
      : [];

  const sizeSource =
    Array.isArray(item?.options?.sizes)
      ? item.options.sizes
      : Array.isArray(item?.sizes)
      ? item.sizes
      : [];

  const colorOptions = colorSource
    .map(normalizeColorOption)
    .filter(Boolean);

  const sizeOptions = sizeSource
    .map(normalizeSizeOption)
    .filter(Boolean);

  const variants = Array.isArray(item?.variants)
    ? item.variants
        .map(normalizeVariant)
        .filter(Boolean)
        .filter((variant) => variant.active !== false)
    : [];

  const colors = colorOptions
    .map((color) => color.hex || color.value || color.name)
    .filter(Boolean);

  const discount =
    hasSale && regularPrice > 0
      ? Math.max(
          5,
          Math.round(
            ((regularPrice - finalPrice) /
              regularPrice) *
              100
          )
        )
      : 0;

  return {
    id:
      item?._id ||
      item?.id ||
      item?.slug ||
      item?.title ||
      "product",

    slug:
      item?.slug ||
      String(
        item?.title ||
          item?.name ||
          "product"
      )
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),

    name:
      item?.title ||
      item?.name ||
      item?.productName ||
      "Untitled Product",

    price: finalPrice,
    originalPrice: regularPrice,
    discount,

    gsm:
      item?.details?.gsm ||
      item?.gsm ||
      "—",

    width:
      item?.details?.width ||
      item?.width ||
      "—",

    composition:
      item?.details?.material ||
      item?.details?.fabric ||
      item?.composition ||
      "—",

    moq:
      Number(
        item?.moq ??
          item?.minimumOrderQuantity ??
          item?.minimumOrderQty ??
          1
      ) || 1,

    images:
      uniqueImages.length > 0
        ? uniqueImages
        : [
            "/images/home/products/1.png",
          ],

    colors:
      colors.length > 0
        ? colors
        : [
            "#F1EDE4",
            "#295C65",
            "#BE9D6B",
          ],

    colorOptions,
    sizeOptions,
    variants,
    sellingMode:
      item?.sellingMode === "meter"
        ? "meter"
        : "piece",
    meterConfig:
      item?.meterConfig || {},
    bulkOrderNote:
      item?.bulkOrderNote || "",
    showOnSale: Boolean(item?.showOnSale),
    variantsEnabled: Boolean(item?.variantsEnabled || variants.length > 0),
  };
}

function extractProducts(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.products)) {
    return payload.data.products;
  }

  return [];
}

/* =========================================================
   HELPERS
========================================================= */

function getOriginalPrice(price, discount) {
  if (!price || !discount) {
    return price;
  }

  return Math.round(
    price / (1 - discount / 100)
  );
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(
    value
  );
}

/* =========================================================
   COUNTDOWN
========================================================= */

function useCountdown(targetDate) {
  const getTimeLeft = () => {
    if (!targetDate) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        finished: false,
      };
    }

    const targetTime =
      new Date(targetDate).getTime();

    if (!Number.isFinite(targetTime)) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        finished: false,
      };
    }

    const now = Date.now();

    const distance = Math.max(
      0,
      targetTime - now
    );

    return {
      days: Math.floor(
        distance /
          (1000 * 60 * 60 * 24)
      ),

      hours: Math.floor(
        (distance /
          (1000 * 60 * 60)) %
          24
      ),

      minutes: Math.floor(
        (distance /
          (1000 * 60)) %
          60
      ),

      seconds: Math.floor(
        (distance / 1000) % 60
      ),

      finished:
        distance <= 0,
    };
  };

  const [mounted, setMounted] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      finished: false,
    });

  useEffect(() => {
    setMounted(true);

    const update =
      () => {
        setTimeLeft(
          getTimeLeft()
        );
      };

    update();

    const timer =
      window.setInterval(
        update,
        1000
      );

    return () => {
      window.clearInterval(timer);
    };
  }, [targetDate]);

  return {
    ...timeLeft,
    mounted,
  };
}

/* =========================================================
   ANIMATED BUTTON
========================================================= */

function SaleActionButton({
  type = "cart",
  added = false,
  loading = false,
  onClick,
  href,
  children,
}) {
  const isCart = type === "cart";

  if (href) {
    return (
      <Link
        href={href}
        className={`sale-action-button ${
          isCart
            ? "sale-cart-button"
            : "sale-buy-button"
        }`}
      >
        <span className="sale-action-inner">
          {isCart ? (
            <ShoppingCart
              size={13}
              strokeWidth={2}
            />
          ) : (
            <Zap
              size={13}
              strokeWidth={2.2}
            />
          )}

          <span>{children}</span>
        </span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`sale-action-button ${
        isCart
          ? "sale-cart-button"
          : "sale-buy-button"
      } ${
        added
          ? "sale-button-added"
          : ""
      }`}
    >
      <span className="sale-action-stage">
        {added ? (
          <span
            className="sale-action-state sale-action-state-enter"
            key="added"
          >
            <Check
              size={13}
              strokeWidth={2.7}
            />

            <span>Added</span>
          </span>
        ) : loading ? (
          <span
            className="sale-action-state sale-action-state-enter"
            key="loading"
          >
            {isCart ? (
              <ShoppingCart
                size={13}
                strokeWidth={2}
              />
            ) : (
              <Zap
                size={13}
                strokeWidth={2.2}
              />
            )}

            <span>
              {isCart
                ? "Adding..."
                : "Opening..."}
            </span>
          </span>
        ) : (
          <span
            className="sale-action-state sale-action-state-enter"
            key="idle"
          >
            {isCart ? (
              <ShoppingCart
                size={13}
                strokeWidth={2}
              />
            ) : (
              <Zap
                size={13}
                strokeWidth={2.2}
              />
            )}

            <span>{children}</span>
          </span>
        )}
      </span>
    </button>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function SalePage() {
  const router = useRouter();
  const {
    addToCart,
    items: cartItems = [],
    updateQuantity,
    removeItem,
    prepareBuyNow,
  } = useCart();
  const { toggleSave, isSaved: isProductSaved } = useWishlist();
  /*
   * SALE MODES
   *
   * live:
   *   Sale products backend se available hain.
   *
   * countdown:
   *   Sale products abhi nahi hain,
   *   lekin admin ne countdown set kiya hai.
   *
   * empty:
   *   Na products hain,
   *   na active countdown.
   */
  const [saleMode, setSaleMode] =
    useState("countdown");

  const [saleEndDate, setSaleEndDate] =
    useState(null);

  const countdown =
    useCountdown(saleEndDate);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [cartStates, setCartStates] =
    useState({});

  const [selectedColors, setSelectedColors] =
    useState({});

  const [selectedSizes, setSelectedSizes] =
    useState({});

  const [cartMessages, setCartMessages] =
    useState({});

  const [buyingProduct, setBuyingProduct] =
    useState(null);

  const [saleItems, setSaleItems] =
    useState([]);

  const [saleHeroImages, setSaleHeroImages] =
    useState({
      desktop:
        SALE_IMAGES.desktop,
      mobile:
        SALE_IMAGES.mobile,
    });

  const [saleTitle, setSaleTitle] = useState("");

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     SYNC VARIANT SELECTION FROM CART
     If a product/variant is already in cart, every Sale card
     for that product starts with the same colour + size.
  ======================================================= */

  useEffect(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return;
    }

    if (!Array.isArray(saleItems) || saleItems.length === 0) {
      return;
    }

    setSelectedColors((current) => {
      const next = { ...current };
      let changed = false;

      saleItems.forEach((product) => {
        const productId = String(product.id);

        const matchingLines = cartItems.filter(
          (item) =>
            String(item?.productId || "") ===
            productId
        );

        if (matchingLines.length === 0) {
          return;
        }

        const line =
          [...matchingLines]
            .reverse()
            .find(
              (item) =>
                item?.variantId ||
                item?.selectedColor ||
                item?.selectedSize
            ) ||
          matchingLines[matchingLines.length - 1];

        if (!line?.selectedColor) {
          return;
        }

        const cartColorName =
          optionName(line.selectedColor);

        const matchedColor =
          product.colorOptions?.find(
            (color) =>
              String(optionName(color)).trim().toLowerCase() ===
              String(cartColorName).trim().toLowerCase()
          ) || line.selectedColor;

        const existing = next[productId];
        if (
          !sameOption(existing, matchedColor)
        ) {
          next[productId] = matchedColor;
          changed = true;
        }
      });

      return changed ? next : current;
    });

    setSelectedSizes((current) => {
      const next = { ...current };
      let changed = false;

      saleItems.forEach((product) => {
        const productId = String(product.id);

        const matchingLines = cartItems.filter(
          (item) =>
            String(item?.productId || "") ===
            productId
        );

        if (matchingLines.length === 0) {
          return;
        }

        const line =
          [...matchingLines]
            .reverse()
            .find(
              (item) =>
                item?.variantId ||
                item?.selectedColor ||
                item?.selectedSize
            ) ||
          matchingLines[matchingLines.length - 1];

        if (!line?.selectedSize) {
          return;
        }

        const cartSizeName =
          optionName(line.selectedSize);

        const matchedSize =
          product.sizeOptions?.find(
            (size) =>
              String(optionName(size)).trim().toLowerCase() ===
              String(cartSizeName).trim().toLowerCase()
          ) || line.selectedSize;

        const existing = next[productId];
        if (
          !sameOption(existing, matchedSize)
        ) {
          next[productId] = matchedSize;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [cartItems, saleItems]);

  /* ── Notify Me state ── */
  const [notifyStatus, setNotifyStatus] = useState("idle"); // idle | loading | success | already | error | login-required
  const [notifyMsg,    setNotifyMsg]    = useState("");

  /* check on load whether logged-in user is already subscribed for current sale */
  useEffect(() => {
    let mounted = true;
    async function checkNotifyStatus() {
      try {
        /* 1. get logged-in user */
        const meRes = await fetch(`${API_URL}/customer-auth/me`, {
          credentials: "include", cache: "no-store",
        });
        if (!meRes.ok || !mounted) return;
        const meData = await meRes.json();
        const email  = meData?.user?.email || "";
        if (!email || !mounted) return;

        /* 2. check subscription status for current sale */
        const statusRes  = await fetch(
          `${API_URL}/sale/notify-status?email=${encodeURIComponent(email)}`,
          { credentials: "include", cache: "no-store" }
        );
        if (!mounted) return;
        const statusData = await statusRes.json();
        if (statusData?.subscribed) {
          setNotifyStatus("already");
          setNotifyMsg("You're already subscribed for this sale!");
        }
      } catch {
        /* silent — don't break the page */
      }
    }
    checkNotifyStatus();
    return () => { mounted = false; };
  }, []);

  /*
   * Dummy products.
   * Ye sirf tab use honge jab backend/API
   * properly respond nahi karega.
   */
  const fallbackSaleProducts = useMemo(() => {
    return fallbackProducts
      .map(normalizeProduct)
      .filter((product) => {
        const regular = Number(
          product.originalPrice || 0
        );

        const finalPrice = Number(
          product.price || 0
        );

        return (
          finalPrice > 0 &&
          regular > finalPrice
        );
      });
  }, []);

  /*
   * SALE API
   *
   * Backend:
   * GET /api/sale
   *
   * Logic:
   *
   * 1. Products available
   *    -> Sale is Live
   *
   * 2. Products nahi hain + countdown active
   *    -> Coming Soon + countdown
   *
   * 3. Products nahi hain + countdown inactive
   *    -> Empty state
   *
   * 4. Backend fail
   *    -> Dummy sale products
   */
  useEffect(() => {
    let isMounted = true;

    const controller =
      new AbortController();

    async function loadSaleData() {
      try {
        const response =
          await fetch(
            `${API_URL}/sale`,
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

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              "Failed to load sale data"
          );
        }

        /*
         * ---------------------------------------------------
         * PRODUCTS
         * ---------------------------------------------------
         *
         * extractProducts already supports:
         *
         * payload.products
         * payload.data
         * payload.data.products
         * direct array
         */
       /*
 * =========================================================
 * SALE RESPONSE DATA
 * ========================================================= */

const saleRoot =
  payload?.sale ||
  payload?.saleSettings ||
  payload?.settings ||
  payload?.data?.sale ||
  payload?.data?.saleSettings ||
  payload?.data?.settings ||
  payload?.data ||
  payload;

const desktopHeroImage =
  normalizeHeroImage(
    saleRoot?.desktopHeroImage ||
      saleRoot?.desktopHero ||
      saleRoot?.heroImage?.desktop ||
      saleRoot?.heroImage?.desktopHero
  ) ||
  SALE_IMAGES.desktop;

const mobileHeroImage =
  normalizeHeroImage(
    saleRoot?.mobileHeroImage ||
      saleRoot?.mobileHero ||
      saleRoot?.heroImage?.mobile ||
      saleRoot?.heroImage?.mobileHero
  ) ||
  SALE_IMAGES.mobile;

setSaleHeroImages({
  desktop: desktopHeroImage,
  mobile: mobileHeroImage,
});

/* saleTitle */
const fetchedTitle =
  saleRoot?.saleTitle ||
  saleRoot?.title     ||
  payload?.saleTitle  ||
  "";
setSaleTitle(fetchedTitle);

/*
 * =========================================================
 * PRODUCTS
 * ========================================================= */

const rawProducts =
  Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload?.data?.products)
    ? payload.data.products
    : Array.isArray(payload?.sale?.products)
    ? payload.sale.products
    : Array.isArray(
        payload?.data?.sale?.products
      )
    ? payload.data.sale.products
    : Array.isArray(
        payload?.saleSettings?.products
      )
    ? payload.saleSettings.products
    : extractProducts(payload);

const backendProducts =
  rawProducts
    .filter(
      (product) =>
        product?.status ===
          "published" ||
        !product?.status
    )
    .map(normalizeProduct)
    .filter((product) => {
      const regular =
        Number(
          product?.originalPrice || 0
        );

      const sale =
        Number(
          product?.price || 0
        );

      return (
        sale > 0 &&
        regular > sale
      );
    });

/*
 * =========================================================
 * COUNTDOWN / SALE SETTINGS
 * ========================================================= */

console.log(
  "SALE BACKEND RESPONSE:",
  payload
);

console.log(
  "SALE SETTINGS:",
  saleRoot
);

const countdownActive =
  Boolean(
    saleRoot?.countdownActive ??
      saleRoot?.timerActive ??
      saleRoot?.countdownEnabled ??
      saleRoot?.enabled ??
      saleRoot?.active ??
      false
  );

const countdownDate =
  saleRoot?.countdownDate ??
  saleRoot?.countdownEndDate ??
  saleRoot?.endDate ??
  saleRoot?.endAt ??
  saleRoot?.saleEndDate ??
  saleRoot?.saleEndAt ??
  saleRoot?.expiresAt ??
  null;

console.log(
  "COUNTDOWN ACTIVE:",
  countdownActive
);

console.log(
  "COUNTDOWN DATE:",
  countdownDate
);

        /*
         * ===================================================
         * CASE 1
         * PRODUCTS MIL GAYE
         * ===================================================
         */
        if (
          backendProducts.length > 0
        ) {
          if (!isMounted) {
            return;
          }

          setSaleItems(
            backendProducts
          );

          setSaleMode("live");

          /*
           * Live hone par countdown hata do.
           */
          setSaleEndDate(null);

          setCurrentPage(1);

          setLoading(false);

          return;
        }

        /*
         * ===================================================
         * CASE 2
         * PRODUCTS NAHI HAIN
         * + COUNTDOWN ACTIVE
         * ===================================================
         */
        if (
          countdownActive &&
          countdownDate
        ) {
          if (!isMounted) {
            return;
          }

          setSaleItems([]);

          setSaleMode("countdown");

          setSaleEndDate(
            countdownDate
          );

          setCurrentPage(1);

          setLoading(false);

          return;
        }

        /*
         * ===================================================
         * CASE 3
         * NA PRODUCTS
         * NA COUNTDOWN
         * ===================================================
         */
        if (!isMounted) {
          return;
        }

        setSaleItems([]);

        setSaleMode("empty");

        setSaleEndDate(null);

        setCurrentPage(1);

        setLoading(false);
      } catch (error) {
        /*
         * Abort ko ignore karo.
         */
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Sale API error:",
          error
        );

        /*
         * ===================================================
         * BACKEND FAIL
         * ===================================================
         *
         * Backend response nahi aaya to
         * dummy sale products dikhao.
         */
        if (!isMounted) {
          return;
        }

        setSaleItems(
          fallbackSaleProducts
        );

        setSaleHeroImages({
          desktop:
            SALE_IMAGES.desktop,
          mobile:
            SALE_IMAGES.mobile,
        });

        setSaleMode("live");

        setSaleEndDate(null);

        setCurrentPage(1);

        setLoading(false);
      }
    }

    loadSaleData();

    /*
     * Har 10 sec backend check hoga.
     *
     * Example:
     * Admin ne abhi product ko Sale ON kiya.
     * Sale page ko manually refresh nahi karna padega.
     */
    const refreshInterval =
      window.setInterval(
        loadSaleData,
        10000
      );

    return () => {
      isMounted = false;

      controller.abort();

      window.clearInterval(
        refreshInterval
      );
    };
  }, [fallbackSaleProducts]);

  /*
   * Countdown khatam ho gaya to temporary
   * countdown screen ko empty mode mein le aao.
   *
   * Backend next 10 sec poll mein final state
   * dobara decide karega.
   */
  useEffect(() => {
    if (
      saleMode === "countdown" &&
      countdown.mounted &&
      countdown.finished
    ) {
      setSaleMode("empty");

      setSaleEndDate(null);

      setSaleItems([]);

      setCurrentPage(1);
    }
  }, [
    saleMode,
    countdown.mounted,
    countdown.finished,
  ]);

  /* =======================================================
     SALE PRODUCTS
  ======================================================= */

  const saleProducts = useMemo(() => {
    return saleItems;
  }, [saleItems]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      saleProducts.length /
        PAGE_SIZE
    )
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const visibleProducts =
    saleProducts.slice(
      (safePage - 1) * PAGE_SIZE,
      safePage * PAGE_SIZE
    );

  /* =======================================================
     VARIANT SELECTION + CART
  ======================================================= */

  const getSelectedColor = (product) =>
    selectedColors[String(product.id)] || null;

  const getSelectedSize = (product) =>
    selectedSizes[String(product.id)] || null;

  const getAvailableSizes = (product) => {
    const sizes = Array.isArray(product?.sizeOptions)
      ? product.sizeOptions
      : [];

    if (!product?.variantsEnabled || !product?.variants?.length) {
      return sizes;
    }

    const selectedColor = getSelectedColor(product);
    if (!selectedColor) return sizes;

    const filtered = sizes.filter((size) =>
      product.variants.some(
        (variant) =>
          sameOption(
            variant?.colorOption || variant?.color,
            selectedColor
          ) &&
          sameOption(
            variant?.sizeOption || variant?.size,
            size
          )
      )
    );

    return filtered.length > 0 ? filtered : sizes;
  };

  const getSelectedVariant = (product) => {
    const variants = Array.isArray(product?.variants)
      ? product.variants
      : [];

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
          ? sameOption(
              variant?.colorOption || variant?.color,
              selectedColor
            )
          : true;

        const sizeMatches = needsSize
          ? sameOption(
              variant?.sizeOption || variant?.size,
              selectedSize
            )
          : true;

        return colorMatches && sizeMatches;
      }) || null
    );
  };

  const getDisplayPricing = (product) => {
    const variant = getSelectedVariant(product);
    const selectedColor = getSelectedColor(product);

    if (variant) {
      const regular = Number(variant.regularPrice || 0);
      const sale = Number(variant.salePrice || 0);
      const onSale = sale > 0 && regular > 0 && sale < regular;

      return {
        original: onSale ? regular : 0,
        sale: onSale ? sale : regular || product.price || 0,
        discount: onSale
          ? Math.max(1, Math.round(((regular - sale) / regular) * 100))
          : 0,
      };
    }

    if (selectedColor) {
      const regular = Number(selectedColor.regularPrice || 0);
      const sale = Number(selectedColor.salePrice || 0);
      const onSale =
        Boolean(product?.showOnSale) &&
        sale > 0 &&
        regular > 0 &&
        sale < regular;

      if (regular > 0 || sale > 0) {
        return {
          original: onSale ? regular : 0,
          sale: onSale ? sale : regular || product.price || 0,
          discount: onSale
            ? Math.max(1, Math.round(((regular - sale) / regular) * 100))
            : 0,
        };
      }
    }

    return {
      original: product.originalPrice || 0,
      sale: product.price || 0,
      discount: product.discount || 0,
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

    setSelectedColors((current) => ({
      ...current,
      [id]: color,
    }));

    const currentSize = getSelectedSize(product);
    if (!currentSize || !product?.variants?.length) return;

    const stillValid = product.variants.some(
      (variant) =>
        sameOption(
          variant?.colorOption || variant?.color,
          color
        ) &&
        sameOption(
          variant?.sizeOption || variant?.size,
          currentSize
        )
    );

    if (!stillValid) {
      setSelectedSizes((current) => ({
        ...current,
        [id]: null,
      }));
    }
  };

  const handleSelectSize = (product, size) => {
    const id = String(product.id);
    setSelectedSizes((current) => ({
      ...current,
      [id]: size,
    }));
  };

  const getCartItemForProduct = (product) => {
    const productId = String(product?.id || "");
    if (!productId || !Array.isArray(cartItems)) {
      return null;
    }

    const selectedVariant = getSelectedVariant(product);
    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);

    const sameProduct = cartItems.filter(
      (item) =>
        String(item?.productId || "") ===
        productId
    );

    if (sameProduct.length === 0) {
      return null;
    }

    if (selectedVariant?.id) {
      const byVariant = sameProduct.find(
        (item) =>
          String(item?.variantId || "") ===
          String(selectedVariant.id)
      );

      if (byVariant) {
        return byVariant;
      }
    }

    const wantedColor = String(
      optionName(selectedColor) || ""
    ).trim().toLowerCase();
    const wantedSize = String(
      optionName(selectedSize) || ""
    ).trim().toLowerCase();

    if (wantedColor || wantedSize) {
      const byOptions = sameProduct.find(
        (item) => {
          const itemColor = String(
            optionName(item?.selectedColor) || ""
          ).trim().toLowerCase();
          const itemSize = String(
            optionName(item?.selectedSize) || ""
          ).trim().toLowerCase();

          return (
            itemColor === wantedColor &&
            itemSize === wantedSize
          );
        }
      );

      if (byOptions) {
        return byOptions;
      }
    }

    if (
      product?.colorOptions?.length === 0 &&
      product?.sizeOptions?.length === 0
    ) {
      return sameProduct[0];
    }

    return null;
  };

  const handleVariantCartAdd = async (product) => {
    const id = String(product.id);
    const currentState = cartStates[id] || "idle";

    if (
      currentState === "loading" ||
      currentState === "updating" ||
      currentState === "removing"
    ) {
      return { success: false };
    }

    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);
    const selectedVariant = getSelectedVariant(product);

    if (product?.colorOptions?.length > 0 && !selectedColor) {
      setCardMessage(id, "Please select colour");
      return { success: false, message: "Please select colour" };
    }

    if (product?.sizeOptions?.length > 0 && !selectedSize) {
      setCardMessage(id, "Please select size");
      return { success: false, message: "Please select size" };
    }

    if (product?.variantsEnabled && !selectedVariant) {
      setCardMessage(id, "Please select a valid colour and size");
      return {
        success: false,
        message: "Please select a valid colour and size",
      };
    }

    if (selectedVariant && Number(selectedVariant.stock) <= 0) {
      setCardMessage(id, "Selected variant is out of stock");
      return {
        success: false,
        message: "Selected variant is out of stock",
      };
    }

    setCartStates((current) => ({
      ...current,
      [id]: "loading",
    }));

    try {
      const result = await addToCart(String(product.id), 1, {
        selectedColor:
          selectedColor?.name ||
          selectedColor?.value ||
          selectedColor ||
          "",
        selectedSize:
          selectedSize?.name ||
          selectedSize?.value ||
          selectedSize ||
          "",
        variantId: selectedVariant?.id || "",
      });

      if (result?.loginRequired) {
        setCartStates((current) => ({
          ...current,
          [id]: "idle",
        }));
        return result;
      }

      if (result?.success === false) {
        setCartStates((current) => ({
          ...current,
          [id]: "idle",
        }));

        setCardMessage(
          id,
          result?.message || "Failed to add to cart"
        );

        return result;
      }

      setCartStates((current) => ({
        ...current,
        [id]: "added",
      }));

      window.setTimeout(() => {
        setCartStates((current) => ({
          ...current,
          [id]: "idle",
        }));
      }, 900);

      return result;
    } catch (error) {
      console.error(
        "Failed to add sale product to cart:",
        error
      );

      setCartStates((current) => ({
        ...current,
        [id]: "idle",
      }));

      setCardMessage(id, "Failed to add to cart");

      return {
        success: false,
        message: "Failed to add to cart",
      };
    }
  };

  const handleIncreaseCartQuantity = async (product) => {
    const id = String(product.id);
    const cartItem = getCartItemForProduct(product);
    if (!cartItem) return;

    setCartStates((current) => ({
      ...current,
      [id]: "updating",
    }));

    try {
      await updateQuantity(
        cartItem._id,
        Math.max(1, Number(cartItem.quantity || 1) + 1)
      );
    } catch (error) {
      console.error(
        "Failed to increase cart quantity:",
        error
      );
      setCardMessage(id, "Failed to update quantity");
    } finally {
      setCartStates((current) => ({
        ...current,
        [id]: "idle",
      }));
    }
  };

  const handleDecreaseCartQuantity = async (product) => {
    const id = String(product.id);
    const cartItem = getCartItemForProduct(product);
    if (!cartItem) return;

    const quantity = Math.max(
      1,
      Number(cartItem.quantity || 1)
    );

    if (quantity <= 1) return;

    setCartStates((current) => ({
      ...current,
      [id]: "updating",
    }));

    try {
      await updateQuantity(
        cartItem._id,
        quantity - 1
      );
    } catch (error) {
      console.error(
        "Failed to decrease cart quantity:",
        error
      );
      setCardMessage(id, "Failed to update quantity");
    } finally {
      setCartStates((current) => ({
        ...current,
        [id]: "idle",
      }));
    }
  };

  const handleRemoveFromCart = async (product) => {
    const id = String(product.id);
    const cartItem = getCartItemForProduct(product);
    if (!cartItem) return;

    setCartStates((current) => ({
      ...current,
      [id]: "removing",
    }));

    try {
      await removeItem(cartItem._id);
    } catch (error) {
      console.error(
        "Failed to remove cart item:",
        error
      );
      setCardMessage(id, "Failed to remove item");
    } finally {
      setCartStates((current) => ({
        ...current,
        [id]: "idle",
      }));
    }
  };

  /* =======================================================
     BUY NOW
  ======================================================= */

  const handleBuyNow = async (id) => {
    if (buyingProduct) {
      return;
    }

    setBuyingProduct(id);

    const item =
      saleItems.find(
        (product) =>
          product.id === id
      );

    if (!item) {
      setBuyingProduct(null);
      return;
    }

    const selectedColor = selectedColors[id] || "";
    const selectedSize = selectedSizes[id] || "";

    const result =
      await prepareBuyNow(
        item,
        1,
        {
          selectedColor,
          selectedSize,
          variantId: "",
        }
      );

    if (result?.loginRequired) {
      setBuyingProduct(null);
      setCartMessages((prev) => ({
        ...prev,
        [id]: "Please login to buy now",
      }));
      return;
    }

    if (result?.success) {
      router.push(`/checkout?buyNowSessionId=${result?.sessionId || ""}`);
    } else {
      setBuyingProduct(null);
      setCartMessages((prev) => ({
        ...prev,
        [id]: result?.message || "Unable to buy now",
      }));
    }
  };

  /* =======================================================
     NOTIFY ME — email subscribe
  ======================================================= */

  /* =======================================================
     NOTIFY ME — auto-use logged-in customer's email
  ======================================================= */

  async function handleNotifyClick() {
    if (notifyStatus === "loading" || notifyStatus === "success" || notifyStatus === "already") return;

    setNotifyStatus("loading");
    setNotifyMsg("");

    try {
      /* 1. Check if customer is logged in */
      const meRes = await fetch(`${API_URL}/customer-auth/me`, {
        credentials: "include", cache: "no-store",
      });

      if (!meRes.ok) {
        setNotifyStatus("login-required");
        setNotifyMsg("Please login to get notified when the sale goes live.");
        setTimeout(() => { setNotifyStatus("idle"); setNotifyMsg(""); }, 4000);
        return;
      }

      const meData = await meRes.json();
      const email  = meData?.user?.email || "";

      if (!email) {
        setNotifyStatus("error");
        setNotifyMsg("Could not find your email. Please login again.");
        setTimeout(() => { setNotifyStatus("idle"); setNotifyMsg(""); }, 3500);
        return;
      }

      /* 2. Subscribe */
      const res  = await fetch(`${API_URL}/sale/notify-subscribe`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.alreadySubscribed) {
          /* already on the list for this exact sale — stays permanently */
          setNotifyStatus("already");
          setNotifyMsg("You're already subscribed for this sale!");
        } else {
          setNotifyStatus("success");
          setNotifyMsg("You're on the list! We'll email you when the sale goes live.");
          /* after 3s settle into "already" so button stays disabled */
          setTimeout(() => {
            setNotifyStatus("already");
            setNotifyMsg("You're already subscribed for this sale!");
          }, 3000);
        }
      } else {
        setNotifyStatus("error");
        setNotifyMsg(data.message || "Something went wrong. Please try again.");
        setTimeout(() => { setNotifyStatus("idle"); setNotifyMsg(""); }, 3500);
      }
    } catch {
      setNotifyStatus("error");
      setNotifyMsg("Network error. Please try again.");
      setTimeout(() => { setNotifyStatus("idle"); setNotifyMsg(""); }, 3500);
    }
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="sale-page">

      <style>{`

        /* =================================================
           PAGE
        ================================================= */

        .sale-page {
          width: 100%;
          min-height: 100vh;

          background:
            ${COLORS.cream};

          color:
            ${COLORS.ink};

          overflow-x:
            hidden;

          box-sizing:
            border-box;
        }


        /* =================================================
           MAIN CONTAINER
        ================================================= */

        .sale-container {
          width: 100%;
          max-width: 1400px;

          margin:
            0 auto;

          padding:
            0 32px;

          box-sizing:
            border-box;
        }


        /* =================================================
           HERO
        ================================================= */

        .sale-hero {
          position:
            relative;

          width:
            100%;

          min-height:
            450px;

          overflow:
            hidden;

          background:
            ${COLORS.darkCream};
        }


        .sale-hero-image {
          position:
            absolute;

          inset:
            0;

          width:
            100%;

          height:
            100%;

          object-fit:
            cover;

          object-position:
            center;

          display:
            block;
        }


        .sale-hero-mobile {
          display:
            none;
        }


        .sale-hero-overlay {
          position:
            absolute;

          inset:
            0;

          background:
            linear-gradient(
              90deg,
              rgba(250,248,245,.98)
              0%,
              rgba(250,248,245,.94)
              28%,
              rgba(250,248,245,.73)
              49%,
              rgba(250,248,245,.15)
              76%,
              rgba(250,248,245,.03)
              100%
            );
        }


        .sale-hero-content {
          position:
            relative;

          z-index:
            2;

          width:
            100%;

          max-width:
            1400px;

          margin:
            0 auto;

          padding:
            30px 32px 36px;

          box-sizing:
            border-box;
        }


        .sale-eyebrow {
          display:
            flex;

          align-items:
            center;

          gap:
            12px;

          margin:
            0 0 10px;

          color:
            ${COLORS.gold};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            600;

          letter-spacing:
            4px;

          text-transform:
            uppercase;
        }


        .sale-eyebrow-line {
          width:
            34px;

          height:
            1px;

          display:
            inline-block;

          background:
            ${COLORS.gold};
        }


        .sale-hero-title {
          max-width:
            600px;

          margin:
            0;

          color:
            ${COLORS.teal};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            58px;

          font-weight:
            600;

          line-height:
            .98;
        }


        .sale-hero-subtitle {
          max-width:
            570px;

          margin:
            12px 0 20px;

          color:
            #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            14px;

          line-height:
            1.6;
        }


        /* =================================================
           COUNTDOWN
        ================================================= */

        .sale-countdown {
          display:
            grid;

          grid-template-columns:
            repeat(4,86px);

          gap:
            10px;

          margin-bottom:
            21px;
        }


        .sale-count-box {
          height:
            74px;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          background:
            rgba(
              242,
              238,
              233,
              .92
            );

          border:
            1px solid
            rgba(
              190,
              157,
              107,
              .18
            );

          border-radius:
            11px;

          box-sizing:
            border-box;
        }


        .sale-count-number {
          color:
            #171717;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            27px;

          font-weight:
            600;

          line-height:
            1;
        }


        .sale-count-label {
          margin-top:
            6px;

          color:
            #555555;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          line-height:
            1;
        }


        /* =================================================
           NOTIFY
        ================================================= */

        .sale-notify-row {
          display:
            flex;

          align-items:
            center;

          gap:
            18px;

          flex-wrap:
            wrap;
        }


        .sale-notify-button {
          position:
            relative;

          height:
            46px;

          min-width:
            181px;

          padding:
            0 24px;

          border:
            none;

          border-radius:
            999px;

          background:
            ${COLORS.gold};

          color:
            #FFFFFF;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            12px;

          font-weight:
            600;

          cursor:
            pointer;

          overflow:
            hidden;
        }


        .sale-notify-button:hover
        .sale-notify-icon {
          animation:
            bell-drop
            .45s
            ease;
        }


        @keyframes bell-drop {

          0% {
            transform:
              translateY(-100%);

            opacity:
              0;
          }

          60% {
            transform:
              translateY(7%);

            opacity:
              1;
          }

          100% {
            transform:
              translateY(0);

            opacity:
              1;
          }
        }


        .sale-notify-copy {
          position:
            relative;

          padding-left:
            18px;

          color:
            #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            12px;

          line-height:
            1.35;
        }


        .sale-notify-copy::before {
          content:
            "";

          position:
            absolute;

          left:
            0;

          top:
            2px;

          width:
            1px;

          height:
            35px;

          background:
            rgba(
              190,
              157,
              107,
              .65
            );
        }


        /* =================================================
           SALE LIVE BANNER
        ================================================= */

        .sale-live {
          width:
            100%;

          background:
            ${COLORS.darkCream};

          padding:
            32px 0;

          box-sizing:
            border-box;

          border-top:
            1px solid
            rgba(
              190,
              157,
              107,
              .12
            );

          border-bottom:
            1px solid
            rgba(
              190,
              157,
              107,
              .12
            );
        }


        .sale-live-inner {
          width:
            100%;

          max-width:
            1400px;

          margin:
            0 auto;

          padding:
            0 32px;

          box-sizing:
            border-box;

          display:
            grid;

          grid-template-columns:
            230px
            minmax(0,1fr)
            280px;

          align-items:
            center;

          gap:
            40px;
        }


        .sale-discount-circle {
          width:
            145px;

          height:
            145px;

          border-radius:
            50%;

          display:
            flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          border:
            2px solid
            ${COLORS.teal};

          outline:
            1px solid
            rgba(
              41,
              92,
              101,
              .3
            );

          outline-offset:
            5px;

          background:
            #FFFFFF;

          color:
            ${COLORS.teal};
        }


        .sale-discount-small {
          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            500;

          letter-spacing:
            2px;
        }


        .sale-discount-number {
          margin:
            2px 0;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            47px;

          font-weight:
            700;

          line-height:
            .9;
        }


        .sale-discount-off {
          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            500;

          letter-spacing:
            1px;
        }


        .sale-live-copy {
          text-align:
            center;
        }


        .sale-live-eyebrow {
          margin:
            0 0 6px;

          color:
            ${COLORS.gold};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          font-weight:
            600;

          letter-spacing:
            4px;

          text-transform:
            uppercase;
        }


        .sale-live-title {
          margin:
            0;

          color:
            ${COLORS.teal};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            48px;

          font-weight:
            600;

          line-height:
            .95;
        }


        .sale-live-description {
          max-width:
            440px;

          margin:
            10px auto 0;

          color:
            #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            13px;

          line-height:
            1.55;
        }


        .sale-benefits {
          display:
            grid;

          grid-template-columns:
            repeat(3,1fr);

          gap:
            18px;
        }


        .sale-benefit {
          text-align:
            center;

          padding:
            0 10px;

          border-left:
            1px solid
            #DED5CB;
        }


        .sale-benefit:first-child {
          border-left:
            none;
        }


        .sale-benefit svg {
          color:
            ${COLORS.teal};

          margin-bottom:
            8px;
        }


        .sale-benefit-title {
          display:
            block;

          color:
            #394346;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            9px;

          font-weight:
            600;

          line-height:
            1.25;
        }


        /* =================================================
           PRODUCTS HEADER
        ================================================= */

        .sale-products-section {
          width:
            100%;

          padding:
            30px 0 64px;

          box-sizing:
            border-box;
        }


        .sale-products-container {
          width:
            100%;

          max-width:
            1400px;

          margin:
            0 auto;

          padding:
            0 32px;

          box-sizing:
            border-box;
        }


        .sale-products-head {
          width:
            100%;

          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            15px;

          margin-bottom:
            20px;
        }


        .sale-product-count {
          color:
            #455055;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            12px;
        }


        .sale-sort {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            8px;

          color:
            #696968;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;
        }


        .sale-sort-select {
          height:
            34px;

          padding:
            0 13px;

          border:
            1px solid
            #E1DAD2;

          border-radius:
            999px;

          background:
            #FFFFFF;

          color:
            #26383D;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          outline:
            none;
        }


        /* =================================================
           GRID
        ================================================= */

        .sale-products-grid {
          width:
            100%;

          display:
            grid;

          grid-template-columns:
            repeat(
              4,
              minmax(
                0,
                1fr
              )
            );

          gap:
            16px;
        }


        /* =================================================
           CARD
        ================================================= */

        .sale-card {
          position:
            relative;

          width:
            100%;

          min-width:
            0;

          background:
            #FFFFFF;

          border:
            1px solid
            #ECE4DB;

          border-radius:
            11px;

          overflow:
            hidden;

          display:
            flex;

          flex-direction:
            column;

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }


        .sale-card:hover {
          transform:
            translateY(-4px);

          box-shadow:
            0 13px 26px
            rgba(
              41,
              92,
              101,
              .09
            );
        }


        /* =================================================
           IMAGE
        ================================================= */

        .sale-card-image {
          position:
            relative;

          width:
            100%;

          aspect-ratio:
            4 / 5;

          overflow:
            hidden;

          background:
            #F2EEE9;
        }


        .sale-card-image a {
          display:
            block;

          width:
            100%;

          height:
            100%;
        }


        .sale-card-image img {
          width:
            100%;

          height:
            100%;

          display:
            block;

          object-fit:
            cover;

          transition:
            transform .45s ease;
        }


        .sale-card:hover
        .sale-card-image img {
          transform:
            scale(
              1.035
            );
        }


        /* =================================================
           SAVE
        ================================================= */

        .sale-save {
          position:
            absolute;

          top:
            9px;

          left:
            9px;

          z-index:
            7;

          width:
            32px;

          height:
            32px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              .8
            );

          border-radius:
            50%;

          background:
            rgba(
              255,
              255,
              255,
              .95
            );

          color:
            ${COLORS.teal};

          cursor:
            pointer;

          backdrop-filter:
            blur(
              5px
            );

          -webkit-backdrop-filter:
            blur(
              5px
            );
        }


        .sale-save.is-saved {
          color:
            #FFFFFF;

          background:
            ${COLORS.teal};

          border-color:
            ${COLORS.teal};
        }


        /* =================================================
           DISCOUNT
        ================================================= */

        .sale-discount-badge {
          position:
            absolute;

          top:
            9px;

          right:
            9px;

          z-index:
            6;

          min-height:
            31px;

          padding:
            0 11px;

          display:
            inline-flex;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            999px;

          background:
            ${COLORS.teal};

          color:
            #FFFFFF;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            11px;

          font-weight:
            600;

          white-space:
            nowrap;
        }


        /* =================================================
           CARD BODY
        ================================================= */
.sale-card-body {
  width: 100%;

  height: 236px;
  min-height: 236px;

  display: flex;

  flex-direction: column;

  padding: 12px 12px 13px;

  box-sizing: border-box;

  overflow: hidden;
}


      .sale-card-name {
  display: block;

  width: 100%;

  margin: 0 0 11px;

  color: ${COLORS.ink};

  font-family:
    "Cormorant Garamond",
    Georgia,
    serif;

  font-size: 18px;

  font-weight: 600;

  line-height: 1.08;

  text-decoration: none;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  box-sizing: border-box;
}


        .sale-card-name:hover {
          color:
            ${COLORS.teal};
        }


        /* =================================================
           SPECS
        ================================================= */

        .sale-specs {
          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          column-gap:
            15px;

          row-gap:
            9px;

          padding-bottom:
            11px;

          border-bottom:
            1px solid
            #EEE8E1;
        }


        .sale-spec {
          min-width:
            0;

          display:
            flex;

          flex-direction:
            column;

          gap:
            3px;
        }


        .sale-spec-label {
          color:
            ${COLORS.gold};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            8.5px;

          font-weight:
            600;

          letter-spacing:
            1px;

          text-transform:
            uppercase;
        }


        .sale-spec-value {
          color:
            #283438;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10.5px;

          font-weight:
            500;

          line-height:
            1.25;
        }


        /* =================================================
           COLORS
        ================================================= */

        .sale-colors {
          display:
            flex;

          align-items:
            center;

          gap:
            7px;

          margin:
            11px 0 9px;
        }


        .sale-colors-label {
          color:
            ${COLORS.gold};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            8.5px;

          font-weight:
            600;

          letter-spacing:
            1px;
        }


        .sale-swatches {
          display:
            flex;

          align-items:
            center;

          flex-wrap:
            wrap;

          gap:
            5px;
        }


        .sale-swatch {
          width:
            15px;

          height:
            15px;

          border:
            1px solid
            rgba(
              0,
              0,
              0,
              .13
            );

          border-radius:
            50%;
        }


        /* =================================================
           VARIANT SELECTORS
        ================================================= */

        .sale-variant-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin: 8px 0 7px;
          padding: 7px 0 6px;
          border-top: 1px solid #EEE8E1;
          border-bottom: 1px solid #EEE8E1;
        }

        .sale-variant-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sale-variant-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .sale-selected-option {
          min-width: 0;
          max-width: 65%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #696968;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 7.5px;
          font-weight: 500;
        }

        .sale-swatches-selectable {
          gap: 6px;
        }

        .sale-swatch-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          color: #FFFFFF;
          cursor: pointer;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }

        .sale-swatch-button:hover {
          transform: scale(1.08);
        }

        .sale-swatch-button.is-selected {
          border: 2px solid ${COLORS.teal};
          box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 3px ${COLORS.teal};
        }

        .sale-size-options {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 4px;
        }

        .sale-size-button {
          min-width: 27px;
          height: 21px;
          padding: 0 7px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #DDD4C9;
          border-radius: 4px;
          background: #FFFFFF;
          color: ${COLORS.teal};
          font-family: "Poppins", Arial, sans-serif;
          font-size: 7.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s ease;
        }

        .sale-size-button:hover {
          border-color: ${COLORS.teal};
          transform: translateY(-1px);
        }

        .sale-size-button.is-selected {
          background: ${COLORS.teal};
          color: #FFFFFF;
          border-color: ${COLORS.teal};
        }

        .sale-cart-message {
          margin: -2px 0 6px;
          color: #A24D4D;
          font-family: "Poppins", Arial, sans-serif;
          font-size: 7.5px;
          line-height: 1.25;
        }

        /* =================================================
           PRICE
        ================================================= */

        .sale-price-row {
          display:
            flex;

          align-items:
            baseline;

          gap:
            7px;

          margin-bottom:
            11px;
        }


        .sale-old-price {
          color:
            #969696;

          text-decoration:
            line-through;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            12px;

          font-weight:
            500;
        }


        .sale-new-price {
          color:
            ${COLORS.gold};

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            23px;

          font-weight:
            700;

          line-height:
            1;
        }


        /* =================================================
           ACTIONS
        ================================================= */

        .sale-actions {
          width:
            100%;

          display:
            grid;

          grid-template-columns:
            1fr 1fr;

          gap:
            6px;

          margin-top:
            auto;
        }


        .sale-action-button {
          position:
            relative;

          min-width:
            0;

          height:
            37px;

          border-radius:
            999px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            5px;

          padding:
            0 7px;

          box-sizing:
            border-box;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            9px;

          font-weight:
            600;

          text-decoration:
            none;

          white-space:
            nowrap;

          cursor:
            pointer;

          overflow:
            hidden;
        }


        .sale-cart-button {
          border:
            1px solid
            ${COLORS.teal};

          background:
            ${COLORS.teal};

          color:
            #FFFFFF;
        }


        .sale-buy-button {
          border:
            1px solid
            ${COLORS.teal};

          background:
            #FFFFFF;

          color:
            ${COLORS.teal};
        }


        .sale-buy-button:hover {
          background:
            ${COLORS.teal};

          color:
            #FFFFFF;
        }


        .sale-button-added {
          background:
            ${COLORS.gold};

          border-color:
            ${COLORS.gold};
        }


        .sale-action-stage {
          position:
            relative;

          width:
            100%;

          height:
            16px;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          overflow:
            hidden;
        }


        .sale-action-state {
          position:
            absolute;

          inset:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            5px;
        }


        .sale-action-state-enter {
          animation:
            saleButtonEnter
            .42s
            cubic-bezier(
              .2,
              .8,
              .25,
              1
            )
            both;
        }


        @keyframes saleButtonEnter {

          0% {
            opacity:
              0;

            transform:
              translateY(
                -120%
              );
          }

          55% {
            opacity:
              1;

            transform:
              translateY(
                8%
              );
          }

          100% {
            opacity:
              1;

            transform:
              translateY(
                0
              );
          }
        }


        /* =================================================
           FOOT DECOR
        ================================================= */

        .sale-foot-decor {
          width:
            100%;

          min-height:
            70px;

          display:
            flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          padding:
            0 32px;

          box-sizing:
            border-box;

          color:
            #7D776F;
        }


        .sale-foot-text {
          max-width:
            180px;

          color:
            #807B74;

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            9px;

          letter-spacing:
            3px;

          line-height:
            1.7;

          text-transform:
            uppercase;
        }


        .sale-foot-right {
          max-width:
            170px;

          color:
            #8A847B;

          font-family:
            "Cormorant Garamond",
            Georgia,
            serif;

          font-size:
            20px;

          font-style:
            italic;

          line-height:
            1.05;

          text-align:
            right;
        }


        /* =================================================
           PAGINATION
        ================================================= */

        .sale-pagination {
          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          gap:
            8px;

          margin-top:
            34px;
        }


        .sale-page-button {
          width:
            37px;

          height:
            37px;

          padding:
            0;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          border:
            1px solid
            #E4DDD5;

          border-radius:
            50%;

          background:
            #FFFFFF;

          color:
            ${COLORS.teal};

          font-family:
            "Poppins",
            Arial,
            sans-serif;

          font-size:
            10px;

          cursor:
            pointer;
        }


        .sale-page-button:hover {
          border-color:
            ${COLORS.teal};
        }


        .sale-page-button.active {
          background:
            ${COLORS.teal};

          color:
            #FFFFFF;

          border-color:
            ${COLORS.teal};
        }


        .sale-page-button:disabled {
          opacity:
            .4;

          cursor:
            not-allowed;
        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1100px) {

          .sale-hero {
            min-height:
              420px;
          }


          .sale-hero-title {
            font-size:
              51px;
          }


          .sale-live-inner {
            grid-template-columns:
              180px
              minmax(
                0,
                1fr
              );

            gap:
              28px;
          }


          .sale-benefits {
            display:
              none;
          }


          .sale-products-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );
          }

        }


        /* =================================================
           TABLET / MOBILE
        ================================================= */

        @media (max-width: 800px) {

          .sale-hero {
            min-height:
              420px;
          }


          .sale-hero-image {
            display:
              none;
          }


          .sale-hero-mobile {
            display:
              block;
          }


          .sale-hero-overlay {
            background:
              linear-gradient(
                180deg,
                rgba(
                  250,
                  248,
                  245,
                  .82
                )
                0%,
                rgba(
                  250,
                  248,
                  245,
                  .84
                )
                45%,
                rgba(
                  250,
                  248,
                  245,
                  .22
                )
                100%
              );
          }


          .sale-hero-content {
            padding:
              34px 24px 28px;
          }


          .sale-hero-title {
            font-size:
              48px;
          }


          .sale-live-inner {
            grid-template-columns:
              1fr;

            justify-items:
              center;

            text-align:
              center;
          }


          .sale-products-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              11px;
          }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 600px) {

          .sale-container,
          .sale-products-container {
            padding:
              0 16px;
          }


          .sale-hero {
            min-height:
              610px;
          }


          .sale-hero-content {
            padding:
              30px 16px 24px;
          }


          .sale-eyebrow {
            font-size:
              9px;

            letter-spacing:
              3px;
          }


          .sale-eyebrow-line {
            width:
              27px;
          }


          .sale-hero-title {
            max-width:
              320px;

            font-size:
              42px;

            line-height:
              1;
          }


          .sale-hero-subtitle {
            max-width:
              330px;

            margin:
              10px 0 17px;

            font-size:
              11px;

            line-height:
              1.55;
          }


          .sale-countdown {
            grid-template-columns:
              repeat(
                4,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              7px;

            width:
              100%;

            max-width:
              360px;
          }


          .sale-count-box {
            height:
              64px;

            border-radius:
              9px;
          }


          .sale-count-number {
            font-size:
              22px;
          }


          .sale-count-label {
            font-size:
              8px;

            margin-top:
              5px;
          }


          .sale-notify-row {
            width:
              100%;

            align-items:
              flex-start;

            gap:
              12px;
          }


          .sale-notify-button {
            min-width:
              150px;

            height:
              42px;

            padding:
              0 15px;

            font-size:
              10px;
          }


          .sale-notify-copy {
            max-width:
              135px;

            font-size:
              9px;
          }


          .sale-notify-copy::before {
            height:
              29px;
          }


          /* LIVE */

          .sale-live {
            padding:
              26px 0;
          }


          .sale-live-inner {
            padding:
              0 16px;

            gap:
              24px;
          }


          .sale-discount-circle {
            width:
              116px;

            height:
              116px;
          }


          .sale-discount-small {
            font-size:
              8px;
          }


          .sale-discount-number {
            font-size:
              37px;
          }


          .sale-discount-off {
            font-size:
              8px;
          }


          .sale-live-eyebrow {
            font-size:
              8px;

            letter-spacing:
              3px;
          }


          .sale-live-title {
            font-size:
              39px;
          }


          .sale-live-description {
            max-width:
              330px;

            font-size:
              10px;
          }


          /* PRODUCTS */

          .sale-products-section {
            padding:
              24px 0 42px;
          }


          .sale-product-count {
            font-size:
              9px;
          }


          .sale-sort {
            font-size:
              9px;
          }


          .sale-sort-select {
            height:
              30px;

            padding:
              0 10px;

            font-size:
              8px;
          }


          .sale-products-head {
            margin-bottom:
              15px;
          }


          .sale-products-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );

            gap:
              9px;
          }


          .sale-card {
            border-radius:
              9px;
          }


         .sale-card-body {
  height: 225px;
  min-height: 225px;

  padding: 9px;

  overflow: hidden;
}


          .sale-card-name {
            font-size:
              14px;

            margin-bottom:
              8px;
          }


          .sale-save {
            top:
              7px;

            left:
              7px;

            width:
              28px;

            height:
              28px;
          }


          .sale-discount-badge {
            top:
              7px;

            right:
              7px;

            min-height:
              26px;

            padding:
              0 8px;

            font-size:
              8px;
          }


          .sale-specs {
            column-gap:
              7px;

            row-gap:
              7px;

            padding-bottom:
              8px;
          }


          .sale-spec-label {
            font-size:
              6.5px;
          }


          .sale-spec-value {
            font-size:
              8px;
          }


          .sale-colors {
            gap:
              5px;

            margin:
              8px 0 8px;
          }


          .sale-colors-label {
            font-size:
              6.5px;
          }


          .sale-swatches {
            gap:
              4px;
          }


          .sale-swatch {
            width:
              11px;

            height:
              11px;
          }


          .sale-variant-box {
            gap: 5px;
            margin: 7px 0 6px;
            padding: 6px 0 5px;
          }

          .sale-selected-option {
            font-size: 6.5px;
          }

          .sale-swatch-button {
            width: 11px;
            height: 11px;
          }

          .sale-size-button {
            min-width: 24px;
            height: 19px;
            padding: 0 5px;
            font-size: 6.5px;
          }

          .sale-cart-message {
            font-size: 6.5px;
          }

          .sale-price-row {
            gap:
              5px;

            margin-bottom:
              8px;
          }


          .sale-old-price {
            font-size:
              9px;
          }


          .sale-new-price {
            font-size:
              18px;
          }


          .sale-action-button {
            height:
              31px;

            font-size:
              7.5px;

            padding:
              0 4px;
          }


          .sale-pagination {
            margin-top:
              25px;

            gap:
              6px;
          }


          .sale-page-button {
            width:
              31px;

            height:
              31px;
          }


          .sale-foot-decor {
            min-height:
              55px;

            padding:
              0 16px;
          }


          .sale-foot-text {
            font-size:
              7px;

            max-width:
              125px;
          }


          .sale-foot-right {
            font-size:
              15px;

            max-width:
              120px;
          }

        }


        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 380px) {

          .sale-hero {
            min-height:
              570px;
          }


          .sale-hero-title {
            font-size:
              38px;
          }


          .sale-hero-subtitle {
            font-size:
              10px;
          }


          .sale-count-box {
            height:
              60px;
          }


          .sale-count-number {
            font-size:
              20px;
          }


          .sale-notify-button {
            min-width:
              140px;
          }


          .sale-live-title {
            font-size:
              35px;
          }

.sale-card-body {
  height: 198px;
  min-height: 198px;

  overflow: hidden;
}


          .sale-card-name {
            font-size:
              13px;
          }


          .sale-action-button {
            font-size:
              7px;
          }

        }


        /* =================================================
           COMPACT PRODUCT CARD OVERRIDE
           Keeps the same card layout, but reduces image/body
           height and option spacing so price + actions stay visible.
        ================================================= */

        .sale-card-image {
          aspect-ratio: 1 / 1;
        }

        .sale-card-body {
          height: 205px;
          min-height: 205px;
          padding: 10px;
        }

        .sale-card-name {
          font-size: 16px;
          margin-bottom: 8px;
        }

        .sale-specs {
          column-gap: 12px;
          row-gap: 6px;
          padding-bottom: 8px;
        }

        .sale-spec-label,
        .sale-colors-label {
          font-size: 8px;
        }

        .sale-spec-value {
          font-size: 9.5px;
        }

        .sale-variant-box {
          gap: 4px;
          margin: 6px 0 5px;
          padding: 5px 0 4px;
        }

        .sale-variant-group {
          gap: 3px;
        }

        .sale-selected-option {
          font-size: 7px;
        }

        .sale-swatches-selectable {
          gap: 5px;
        }

        .sale-swatch-button,
        .sale-swatch {
          width: 14px;
          height: 14px;
        }

        .sale-size-options {
          gap: 4px;
        }

        .sale-size-button {
          min-width: 26px;
          height: 20px;
          padding: 0 6px;
          font-size: 7px;
        }

        .sale-cart-message {
          margin: -1px 0 4px;
          font-size: 7px;
        }

        .sale-price-row {
          gap: 6px;
          margin-bottom: 7px;
        }

        .sale-old-price {
          font-size: 10px;
        }

        .sale-new-price {
          font-size: 21px;
        }

        .sale-action-button {
          height: 34px;
          font-size: 8.5px;
        }

        @media (max-width: 800px) {
          .sale-card-image {
            aspect-ratio: 1 / 1;
          }

          .sale-card-body {
            height: 190px;
            min-height: 190px;
            padding: 8px;
          }

          .sale-card-name {
            font-size: 14px;
            margin-bottom: 7px;
          }

          .sale-specs {
            column-gap: 8px;
            row-gap: 6px;
            padding-bottom: 7px;
          }

          .sale-spec-label,
          .sale-colors-label {
            font-size: 6.5px;
          }

          .sale-spec-value {
            font-size: 8px;
          }

          .sale-variant-box {
            gap: 4px;
            margin: 5px 0 4px;
            padding: 5px 0 4px;
          }

          .sale-selected-option,
          .sale-cart-message {
            font-size: 6px;
          }

          .sale-swatch-button,
          .sale-swatch {
            width: 11px;
            height: 11px;
          }

          .sale-size-button {
            min-width: 23px;
            height: 18px;
            padding: 0 5px;
            font-size: 6px;
          }

          .sale-price-row {
            gap: 4px;
            margin-bottom: 6px;
          }

          .sale-old-price {
            font-size: 8.5px;
          }

          .sale-new-price {
            font-size: 17px;
          }

          .sale-action-button {
            height: 30px;
            font-size: 7px;
          }
        }

        @media (max-width: 600px) {
          .sale-card-body {
            height: 176px;
            min-height: 176px;
            padding: 7px;
          }

          .sale-card-name {
            font-size: 12.5px;
            margin-bottom: 6px;
          }

          .sale-specs {
            column-gap: 7px;
            row-gap: 5px;
            padding-bottom: 6px;
          }

          .sale-spec-label,
          .sale-colors-label {
            font-size: 6px;
          }

          .sale-spec-value {
            font-size: 7.5px;
          }

          .sale-variant-box {
            gap: 3px;
            margin: 4px 0 3px;
            padding: 4px 0 3px;
          }

          .sale-variant-group {
            gap: 2px;
          }

          .sale-selected-option,
          .sale-cart-message {
            font-size: 5.8px;
          }

          .sale-swatch-button,
          .sale-swatch {
            width: 10px;
            height: 10px;
          }

          .sale-size-button {
            min-width: 22px;
            height: 17px;
            padding: 0 4px;
            font-size: 5.8px;
          }

          .sale-price-row {
            gap: 4px;
            margin-bottom: 5px;
          }

          .sale-old-price {
            font-size: 8px;
          }

          .sale-new-price {
            font-size: 16px;
          }

          .sale-action-button {
            height: 29px;
            font-size: 6.8px;
            padding: 0 3px;
          }
        }


        @media (max-width: 800px) {
          .sale-cart-controls {
            height: 30px;
            grid-template-columns: 21px minmax(15px, 1fr) 21px 24px;
            padding: 1px 3px;
          }

          .sale-cart-qty-button {
            width: 21px;
            height: 21px;
          }

          .sale-cart-remove-button {
            width: 23px;
            height: 23px;
          }

          .sale-cart-qty-number {
            min-width: 15px;
            font-size: 9px;
          }
        }

        @media (max-width: 600px) {
          .sale-cart-controls {
            height: 29px;
            grid-template-columns: 20px minmax(14px, 1fr) 20px 23px;
            gap: 1px;
          }

          .sale-cart-qty-button {
            width: 20px;
            height: 20px;
          }

          .sale-cart-remove-button {
            width: 22px;
            height: 22px;
            padding-left: 3px;
          }

          .sale-cart-qty-number {
            min-width: 14px;
            font-size: 8.5px;
          }
        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

          .sale-card,
          .sale-card-image img,
          .sale-action-state,
          .sale-notify-icon {
            animation:
              none !important;

            transition:
              none !important;
          }

        }


        /* =================================================
           INLINE CART CONTROLS
        ================================================= */

        .sale-cart-add-button {
          width: 100%;
        }

        .sale-cart-controls {
          width: 100%;
          min-width: 0;
          height: 34px;
          display: grid;
          grid-template-columns: 25px minmax(18px, 1fr) 25px 29px;
          align-items: center;
          gap: 2px;
          padding: 2px 4px;
          box-sizing: border-box;
          border: 1px solid #E4DCD4;
          border-radius: 999px;
          background: #FFFFFF;
          color: ${COLORS.teal};
          overflow: hidden;
          animation: saleCartControlsEnter .35s cubic-bezier(.2,.8,.25,1) both;
        }

        .sale-cart-controls.is-removing {
          animation: saleCartControlsRemove .28s cubic-bezier(.2,.8,.25,1) both;
        }

        .sale-cart-qty-button,
        .sale-cart-remove-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 25px;
          height: 25px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: ${COLORS.teal};
          cursor: pointer;
          transition: background .18s ease, transform .15s ease, opacity .18s ease;
        }

        .sale-cart-qty-button:hover:not(:disabled) {
          background: #F1ECE6;
          transform: scale(1.05);
        }

        .sale-cart-remove-button {
          width: 27px;
          height: 27px;
          border-left: 1px solid #E4DCD4;
          border-radius: 0;
          padding-left: 4px;
        }

        .sale-cart-remove-button:hover:not(:disabled) {
          color: #A24D4D;
          transform: scale(1.04);
        }

        .sale-cart-qty-button:disabled,
        .sale-cart-remove-button:disabled {
          opacity: .42;
          cursor: not-allowed;
        }

        .sale-cart-qty-number {
          min-width: 18px;
          text-align: center;
          color: ${COLORS.teal};
          font: 700 10px/1 "Poppins", Arial, sans-serif;
        }

        @keyframes saleCartControlsEnter {
          0% {
            opacity: 0;
            transform: translateY(-40%);
          }
          70% {
            opacity: 1;
            transform: translateY(5%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes saleCartControlsRemove {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(40%);
          }
        }

        /* =================================================
           FINAL CARD LAYOUT FIX
           Keeps the existing card design, but lets the
           content grow naturally so price + action buttons
           are ALWAYS visible on desktop and mobile.
        ================================================= */

        .sale-card {
          height: auto;
        }

        .sale-card-body {
          height: auto !important;
          min-height: 0 !important;
          overflow: visible !important;
          padding: 10px;
          flex: 0 0 auto;
          box-sizing: border-box;
        }

        .sale-card-name,
        .sale-specs,
        .sale-variant-box,
        .sale-price-row,
        .sale-actions {
          flex-shrink: 0;
        }

        .sale-card-name {
          line-height: 1.05;
        }

        .sale-specs {
          row-gap: 5px;
          padding-bottom: 8px;
        }

        .sale-variant-box {
          margin: 6px 0 6px;
          padding: 5px 0 5px;
          gap: 5px;
        }

        .sale-variant-group {
          gap: 3px;
        }

        .sale-price-row {
          margin: 0 0 7px;
          min-height: 24px;
          align-items: center;
        }

        .sale-actions {
          width: 100%;
          min-height: 34px;
          margin-top: 0 !important;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: stretch;
          gap: 7px;
          position: relative;
          z-index: 5;
        }

        .sale-actions > * {
          min-width: 0;
        }

        .sale-actions .sale-action-button {
          width: 100%;
          min-width: 0;
          flex-shrink: 0;
        }

        /* Make the compact CartStatusButton fill its card column */
        .sale-actions .cart-action-button.cart-action-compact {
          width: 100% !important;
          height: 34px !important;
          min-width: 0 !important;
          border-radius: 999px !important;
          padding: 0 8px !important;
        }

        /* When product is already in cart */
        .sale-actions .cart-qty-compact {
          width: 100% !important;
          min-width: 0 !important;
          height: 34px !important;
          box-sizing: border-box;
          border-radius: 999px !important;
          padding: 2px 5px !important;
          gap: 4px !important;
          flex-shrink: 0;
        }

        .sale-actions .cart-qty-compact-btn {
          width: 23px !important;
          height: 23px !important;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .sale-actions .cart-qty-compact-display {
          min-width: 18px !important;
          font-size: 10px !important;
        }

        @media (max-width: 800px) {
          .sale-card-body {
            padding: 8px !important;
          }

          .sale-card-name {
            font-size: 14px;
            margin-bottom: 6px;
          }

          .sale-specs {
            column-gap: 8px;
            row-gap: 5px;
            padding-bottom: 7px;
          }

          .sale-spec-label,
          .sale-colors-label {
            font-size: 6.5px;
          }

          .sale-spec-value {
            font-size: 8px;
          }

          .sale-variant-box {
            margin: 5px 0 5px;
            padding: 5px 0 4px;
            gap: 4px;
          }

          .sale-selected-option {
            font-size: 6.5px;
          }

          .sale-swatch-button,
          .sale-swatch {
            width: 11px;
            height: 11px;
          }

          .sale-size-button {
            min-width: 23px;
            height: 18px;
            font-size: 6px;
          }

          .sale-price-row {
            margin-bottom: 6px;
            min-height: 21px;
          }

          .sale-old-price {
            font-size: 8.5px;
          }

          .sale-new-price {
            font-size: 17px;
          }

          .sale-actions {
            min-height: 30px;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 6px;
          }

          .sale-actions .sale-action-button {
            height: 30px !important;
            font-size: 7px !important;
          }

          .sale-actions .cart-action-button.cart-action-compact {
            height: 30px !important;
          }

          .sale-actions .cart-qty-compact {
            height: 30px !important;
          }

          .sale-actions .cart-qty-compact-btn {
            width: 20px !important;
            height: 20px !important;
          }

          .sale-actions .cart-qty-compact-display {
            min-width: 16px !important;
            font-size: 9px !important;
          }
        }

        @media (max-width: 600px) {
          .sale-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .sale-card-body {
            padding: 7px !important;
          }

          .sale-card-name {
            font-size: 12.5px;
            margin-bottom: 6px;
          }

          .sale-specs {
            column-gap: 6px;
            row-gap: 4px;
            padding-bottom: 6px;
          }

          .sale-spec-label,
          .sale-colors-label {
            font-size: 6px;
          }

          .sale-spec-value {
            font-size: 7.5px;
          }

          .sale-variant-box {
            margin: 4px 0;
            padding: 4px 0 3px;
            gap: 3px;
          }

          .sale-variant-group {
            gap: 2px;
          }

          .sale-selected-option {
            font-size: 5.8px;
          }

          .sale-swatch-button,
          .sale-swatch {
            width: 10px;
            height: 10px;
          }

          .sale-size-button {
            min-width: 21px;
            height: 17px;
            padding: 0 4px;
            font-size: 5.8px;
          }

          .sale-price-row {
            margin-bottom: 5px;
            min-height: 20px;
          }

          .sale-old-price {
            font-size: 8px;
          }

          .sale-new-price {
            font-size: 16px;
          }

          .sale-actions {
            min-height: 29px;
            gap: 5px;
          }

          .sale-actions .sale-action-button,
          .sale-actions .cart-action-button.cart-action-compact {
            height: 29px !important;
            font-size: 6.8px !important;
          }

          .sale-actions .cart-qty-compact {
            height: 29px !important;
            padding: 1px 4px !important;
          }

          .sale-actions .cart-qty-compact-btn {
            width: 19px !important;
            height: 19px !important;
          }

          .sale-actions .cart-qty-compact-display {
            min-width: 15px !important;
            font-size: 8.5px !important;
          }
        }

        @media (max-width: 380px) {
          .sale-products-grid {
            gap: 8px;
          }

          .sale-card-body {
            padding: 6px !important;
          }

          .sale-card-name {
            font-size: 12px;
          }

          .sale-spec-value {
            font-size: 7px;
          }

          .sale-new-price {
            font-size: 15px;
          }

          .sale-actions {
            gap: 4px;
          }

          .sale-actions .sale-action-button,
          .sale-actions .cart-action-button.cart-action-compact {
            height: 28px !important;
            font-size: 6.5px !important;
          }

          .sale-actions .cart-qty-compact {
            height: 28px !important;
          }
        }

      `}</style>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="sale-hero">

        <img
          src={saleHeroImages.desktop}
          alt="Sale collection"
          className="sale-hero-image"
        />

        <img
          src={saleHeroImages.mobile}
          alt="Sale collection"
          className="sale-hero-image sale-hero-mobile"
        />

        <div className="sale-hero-overlay" />

        <div className="sale-hero-content">

          <div className="sale-eyebrow">
            <span className="sale-eyebrow-line" />
            {saleTitle ? saleTitle.toUpperCase() : "SPECIAL OFFER"}
          </div>


         <h1 className="sale-hero-title">
  {saleMode === "live"
    ? (saleTitle ? `${saleTitle} is Live` : "Sale is Live")
    : (saleTitle ? `${saleTitle} is Coming Soon` : "Sale is Coming Soon")}
</h1>


       <p className="sale-hero-subtitle">
  {saleMode === "live"
    ? "Premium fabrics. Timeless designs. Special prices are now live."
    : "Premium fabrics. Timeless designs. Bigger savings ahead."}
</p>


          {/* COUNTDOWN */}

     

{saleMode === "countdown" &&
  saleEndDate &&
  !countdown.finished && (
    <div className="sale-countdown">

      <div className="sale-count-box">
              <span className="sale-count-number">
                {countdown.mounted
                  ? String(countdown.days).padStart(2, "0")
                  : "00"}
              </span>

              <span className="sale-count-label">
                Days
              </span>
            </div>


            <div className="sale-count-box">
              <span className="sale-count-number">
                {countdown.mounted
                  ? String(countdown.hours).padStart(2, "0")
                  : "00"}
              </span>

              <span className="sale-count-label">
                Hours
              </span>
            </div>


            <div className="sale-count-box">
              <span className="sale-count-number">
                {countdown.mounted
                  ? String(countdown.minutes).padStart(2, "0")
                  : "00"}
              </span>

              <span className="sale-count-label">
                Minutes
              </span>
            </div>


            <div className="sale-count-box">
              <span className="sale-count-number">
                {countdown.mounted
                  ? String(countdown.seconds).padStart(2, "0")
                  : "00"}
              </span>

              <span className="sale-count-label">
                Seconds
              </span>
            </div>

          </div>
          )}


    

         {/* NOTIFY */}

{saleMode === "countdown" &&
  saleEndDate &&
  !countdown.finished && (
    <div className="sale-notify-row">

            <button
              type="button"
              className="sale-notify-button"
              onClick={handleNotifyClick}
              disabled={notifyStatus === "loading" || notifyStatus === "success" || notifyStatus === "already"}
              style={{
                opacity: notifyStatus === "loading" ? 0.8 : 1,
                background:
                  notifyStatus === "success"        ? "#1a7a45" :
                  notifyStatus === "already"        ? "#4a5c60" :
                  notifyStatus === "login-required" ? "#7a5c3d" :
                  notifyStatus === "error"          ? "#b83c30" :
                  undefined,
                cursor: notifyStatus === "already" ? "default" : undefined,
              }}
            >
              {notifyStatus === "loading" ? (
                <>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.45)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  Subscribing…
                </>
              ) : notifyStatus === "success" ? (
                <>✓ You&apos;re on the list!</>
              ) : notifyStatus === "already" ? (
                <>✓ Already Subscribed</>
              ) : (
                <>
                  <span className="sale-notify-icon"><Bell size={15} /></span>
                  Notify Me
                </>
              )}
            </button>

            <span className="sale-notify-copy">
              {notifyStatus === "login-required" ? (
                <span style={{ color: "#7a5c3d", fontWeight: 600 }}>{notifyMsg}</span>
              ) : notifyStatus === "error" ? (
                <span style={{ color: "#b83c30", fontWeight: 600 }}>{notifyMsg}</span>
              ) : notifyStatus === "success" ? (
                <span style={{ color: "#1a7a45", fontWeight: 600 }}>{notifyMsg}</span>
              ) : notifyStatus === "already" ? (
                <span style={{ color: "#4a5c60" }}>
                  You&apos;ll be notified<br />when the sale goes live!
                </span>
              ) : (
                <>Be the first to know<br />when the sale goes live!</>
              )}
            </span>

          </div>
           )}

        </div>

      </section>


      {/* =====================================================
          SALE LIVE
      ===================================================== */}

     {saleMode === "live" && (
  <section className="sale-live">

        <div className="sale-live-inner">

          {/* DISCOUNT */}

          <div className="sale-discount-circle">

            <span className="sale-discount-small">
              UP TO
            </span>

            <span className="sale-discount-number">
              50%
            </span>

            <span className="sale-discount-off">
              OFF
            </span>

          </div>


          {/* CENTER */}

          <div className="sale-live-copy">

            <p className="sale-live-eyebrow">
              {saleTitle ? saleTitle.toUpperCase() : "SPECIAL OFFER"}
            </p>

            <h2 className="sale-live-title">
              {saleTitle ? `${saleTitle} is Live` : "Sale is Live"}
            </h2>

            <p className="sale-live-description">
              Shop premium fabrics at
              unbeatable prices.
              Limited time only!
            </p>

          </div>


          {/* BENEFITS */}

          <div className="sale-benefits">

            <div className="sale-benefit">

              <ShoppingCart
                size={22}
                strokeWidth={1.5}
              />

              <span className="sale-benefit-title">
                Worldwide
                <br />
                Shipping
              </span>

            </div>


            <div className="sale-benefit">

              <Check
                size={22}
                strokeWidth={1.8}
              />

              <span className="sale-benefit-title">
                Secure
                <br />
                Payments
              </span>

            </div>


            <div className="sale-benefit">

              <Heart
                size={22}
                strokeWidth={1.5}
              />

              <span className="sale-benefit-title">
                Premium
                <br />
                Quality
              </span>

            </div>

          </div>

        </div>

      </section>
      )}


      {/* =====================================================
          PRODUCTS
      ===================================================== */}
{saleMode === "live" && (
  <section className="sale-products-section">

    <div className="sale-products-container">

          <div className="sale-products-head">

            <span className="sale-product-count">
              {saleProducts.length} Products
            </span>

            <div className="sale-sort">

              <span>
                Sort by:
              </span>

              <select
                className="sale-sort-select"
                defaultValue="newest"
              >
                <option value="newest">
                  Newest First
                </option>

                <option value="discount">
                  Biggest Discount
                </option>

                <option value="price">
                  Price Low to High
                </option>
              </select>

            </div>

          </div>


          {/* PRODUCT GRID */}

          <div className="sale-products-grid">

            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <article
                  key={`sale-skeleton-${index}`}
                  className="sale-card sale-card-skeleton"
                  aria-hidden="true"
                >
                  <div className="sale-card-image skeleton-box" />
                  <div className="sale-card-body">
                    <div className="skeleton-line skeleton-line-title" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line skeleton-line-short" />
                  </div>
                </article>
              ))
            ) : visibleProducts.length > 0 ? (
              visibleProducts.map((product) => {
                const cartState =
                  cartStates[product.id] || "idle";

                const isProductSavedState =
                  isProductSaved(product.id);

                const isBuying =
                  buyingProduct === product.id;

                const selectedColor = getSelectedColor(product);
                const selectedSize = getSelectedSize(product);
                const selectedVariant = getSelectedVariant(product);
                const selectedColorImages =
                  selectedColor?.images || [];
                const image =
                  selectedVariant?.images?.[0] ||
                  selectedColorImages?.[0] ||
                  product.images?.[0] ||
                  "/images/home/products/1.png";
                const displayPricing = getDisplayPricing(product);
                const availableSizes = getAvailableSizes(product);
                const cardMessage = cartMessages[String(product.id)] || "";

                return (
                  <article
                    key={product.id}
                    className="sale-card"
                  >
                    <div className="sale-card-image">
                      <Link href={`/products/${product.slug}`}>
                        <img
                          src={image}
                          alt={product.name}
                          loading="lazy"
                        />
                      </Link>

                      <button
                        type="button"
                        className={`sale-save ${
                          isProductSavedState ? "is-saved" : ""
                        }`}
                        onClick={() =>
                          toggleSave(product.id)
                        }
                        aria-label={
                          isProductSavedState
                            ? "Remove from saved"
                            : "Save product"
                        }
                        aria-pressed={isProductSavedState}
                      >
                        <Heart
                          size={15}
                          strokeWidth={2}
                          fill={
                            isProductSavedState ? "currentColor" : "none"
                          }
                        />
                      </button>

                      <span className="sale-discount-badge">
                        -{displayPricing.discount}%
                      </span>
                    </div>

                    <div className="sale-card-body">
                      <Link
                        href={`/products/${product.slug}`}
                        className="sale-card-name"
                      >
                        {product.name}
                      </Link>

                      <div className="sale-specs">
                        <div className="sale-spec">
                          <span className="sale-spec-label">
                            GSM
                          </span>
                          <span className="sale-spec-value">
                            {product.gsm}
                          </span>
                        </div>

                        <div className="sale-spec">
                          <span className="sale-spec-label">
                            WIDTH
                          </span>
                          <span className="sale-spec-value">
                            {product.width}
                          </span>
                        </div>

                        <div className="sale-spec">
                          <span className="sale-spec-label">
                            COMPOSITION
                          </span>
                          <span className="sale-spec-value">
                            {product.composition}
                          </span>
                        </div>

                        <div className="sale-spec">
                          <span className="sale-spec-label">
                            {product.sellingMode === "meter" ? "FOLD" : "TYPE"}
                          </span>
                          <span className="sale-spec-value">
                            {product.sellingMode === "meter"
                              ? product.meterConfig?.foldLength || "—"
                              : "Ready-made"}
                          </span>
                        </div>
                      </div>

                      {(product.colorOptions?.length > 0 ||
                        product.sizeOptions?.length > 0) ? (
                        <div className="sale-variant-box">
                          {product.colorOptions?.length > 0 ? (
                            <div className="sale-variant-group">
                              <div className="sale-variant-header">
                                <span className="sale-colors-label">
                                  COLOR
                                </span>
                                <span className="sale-selected-option">
                                  {selectedColor?.name || "Select"}
                                </span>
                              </div>

                              <div className="sale-swatches sale-swatches-selectable">
                                {product.colorOptions.slice(0, 6).map((color, index) => {
                                  const active = sameOption(selectedColor, color);

                                  return (
                                    <button
                                      key={`${product.id}-color-${index}`}
                                      type="button"
                                      className={`sale-swatch sale-swatch-button ${
                                        active ? "is-selected" : ""
                                      }`}
                                      style={{
                                        backgroundColor:
                                          color.hex || color.value || color.name || "#D9D9D9",
                                      }}
                                      onClick={() => handleSelectColor(product, color)}
                                      title={color.name || color.value}
                                      aria-label={`Select ${color.name || color.value}`}
                                      aria-pressed={active}
                                    >
                                      {active ? (
                                        <Check size={8} strokeWidth={2.8} />
                                      ) : null}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {product.sizeOptions?.length > 0 ? (
                            <div className="sale-variant-group">
                              <div className="sale-variant-header">
                                <span className="sale-colors-label">
                                  SIZE
                                </span>
                                <span className="sale-selected-option">
                                  {selectedSize?.name || "Select"}
                                </span>
                              </div>

                              <div className="sale-size-options">
                                {availableSizes.map((size, index) => {
                                  const active = sameOption(selectedSize, size);

                                  return (
                                    <button
                                      key={`${product.id}-size-${index}`}
                                      type="button"
                                      className={`sale-size-button ${
                                        active ? "is-selected" : ""
                                      }`}
                                      onClick={() => handleSelectSize(product, size)}
                                      aria-pressed={active}
                                    >
                                      {size.name || size.value}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="sale-colors sale-static-colors">
                          <span className="sale-colors-label">COLORS</span>
                          <div className="sale-swatches">
                            {(product.colors || []).slice(0, 5).map((color, index) => (
                              <span
                                key={`${product.id}-${index}`}
                                className="sale-swatch"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {cardMessage ? (
                        <div className="sale-cart-message">
                          {cardMessage}
                        </div>
                      ) : null}

                      <div className="sale-price-row">
                        {displayPricing.original > displayPricing.sale ? (
                          <span className="sale-old-price">
                            ₹{formatNumber(displayPricing.original)}
                          </span>
                        ) : null}
                        <span className="sale-new-price">
                          ₹{formatNumber(displayPricing.sale)}
                        </span>
                      </div>

                      <div className="sale-actions">
                        <button
                          type="button"
                          className={`
                            sale-action-button
                            sale-cart-button
                            ${isBuying ? "sale-button-added" : ""}
                          `}
                          onClick={() => handleBuyNow(product.id)}
                          disabled={isBuying}
                        >
                          <span className="sale-action-stage">
                            {isBuying ? (
                              <span
                                className="
                                  sale-action-state
                                  sale-action-state-enter
                                "
                                key="buying"
                              >
                                <Zap
                                  size={13}
                                  strokeWidth={2.2}
                                />
                                <span>Opening...</span>
                              </span>
                            ) : (
                              <span
                                className="
                                  sale-action-state
                                  sale-action-state-enter
                                "
                                key="buy"
                              >
                                <Zap
                                  size={13}
                                  strokeWidth={2.2}
                                />
                                <span>Buy Now</span>
                              </span>
                            )}
                          </span>
                        </button>

                        {(() => {
                          const cartItem =
                            getCartItemForProduct(product);
                          const cartQuantity = Math.max(
                            1,
                            Number(cartItem?.quantity || 1)
                          );
                          const cartBusy =
                            cartState === "loading" ||
                            cartState === "updating" ||
                            cartState === "removing";

                          if (cartItem) {
                            return (
                              <div
                                className={`sale-cart-controls ${
                                  cartState === "removing"
                                    ? "is-removing"
                                    : ""
                                }`}
                              >
                                <button
                                  type="button"
                                  className="sale-cart-qty-button"
                                  onClick={() =>
                                    handleDecreaseCartQuantity(product)
                                  }
                                  disabled={
                                    cartBusy ||
                                    cartQuantity <= 1
                                  }
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={11} />
                                </button>

                                <span className="sale-cart-qty-number">
                                  {cartQuantity}
                                </span>

                                <button
                                  type="button"
                                  className="sale-cart-qty-button"
                                  onClick={() =>
                                    handleIncreaseCartQuantity(product)
                                  }
                                  disabled={cartBusy}
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={11} />
                                </button>

                                <button
                                  type="button"
                                  className="sale-cart-remove-button"
                                  onClick={() =>
                                    handleRemoveFromCart(product)
                                  }
                                  disabled={cartBusy}
                                  aria-label="Remove from cart"
                                  title="Remove from cart"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              className={`sale-action-button sale-cart-button sale-cart-add-button ${
                                cartState === "added"
                                  ? "sale-button-added"
                                  : ""
                              }`}
                              onClick={() =>
                                handleVariantCartAdd(product)
                              }
                              disabled={cartBusy}
                            >
                              <span className="sale-action-stage">
                                {cartState === "added" ? (
                                  <span
                                    className="sale-action-state sale-action-state-enter"
                                    key="added"
                                  >
                                    <Check
                                      size={12}
                                      strokeWidth={2.7}
                                    />
                                    <span>Added</span>
                                  </span>
                                ) : cartState === "loading" ? (
                                  <span
                                    className="sale-action-state sale-action-state-enter"
                                    key="loading"
                                  >
                                    <ShoppingCart
                                      size={12}
                                      strokeWidth={2}
                                    />
                                    <span>Adding...</span>
                                  </span>
                                ) : (
                                  <span
                                    className="sale-action-state sale-action-state-enter"
                                    key="idle"
                                  >
                                    <ShoppingCart
                                      size={12}
                                      strokeWidth={2}
                                    />
                                    <span>Add to Cart</span>
                                  </span>
                                )}
                              </span>
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="sale-empty-state">
                <p>No sale products available right now.</p>
              </div>
            )}

          </div>


          {/* =================================================
              PAGINATION
          ================================================= */}

          {totalPages > 1 && (

            <div className="sale-pagination">

              <button
                type="button"
                className="sale-page-button"
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
                aria-label="Previous page"
              >

                <ChevronLeft
                  size={16}
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
                    key={page}
                    type="button"
                    className={
                      `sale-page-button ${
                        page ===
                        safePage
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() => {
                      setCurrentPage(
                        page
                      );

                      window.scrollTo({
                        top:
                          0,
                        behavior:
                          "smooth",
                      });
                    }}
                  >
                    {page}
                  </button>

                )
              )}


              <button
                type="button"
                className="sale-page-button"
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
                aria-label="Next page"
              >

                <ChevronRight
                  size={16}
                />

              </button>

            </div>

          )}


          {/* =================================================
              BOTTOM DECOR
          ================================================= */}

          <div className="sale-foot-decor">

            <span className="sale-foot-text">
              FABRICS
              <br />
              THAT FEEL LIKE HOME
            </span>

            <span className="sale-foot-right">
              Crafted for
              <br />
              a Brighter Tomorrow
            </span>

          </div>

        </div>

      </section>

  )}

    </main>
  );
}