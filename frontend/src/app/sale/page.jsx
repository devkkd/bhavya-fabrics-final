"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
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
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { requestCustomerLogin } from "@/utils/storefrontSync";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"
).replace(/\/$/, "");

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  teal: "#295C65",
  tealDeep: "#1E4850",
  cream: "#FAF8F5",
  darkCream: "#F2EEE9",
  gold: "#BE9D6B",
  goldDeep: "#A8844F",
  white: "#FFFFFF",
  ink: "#1A1A1A",
};

/* =========================================================
   HERO IMAGES
========================================================= */

const SALE_IMAGES = {
  desktop: "/images/contact/desktopHero.png",
  mobile: "/images/contact/mobileHero.png",
};

const PAGE_SIZE = 8;

function normalizeImageValue(value) {
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
    item?.pricing?.regularPrice ?? item?.regularPrice ?? item?.price ?? 0
  );

  const salePrice = Number(item?.pricing?.salePrice ?? item?.salePrice ?? 0);

  const hasSale =
    Boolean(item?.showOnSale) && salePrice > 0 && regularPrice > salePrice;

  const finalPrice = hasSale && salePrice > 0 ? salePrice : regularPrice;

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

  const uniqueImages = [...new Set(list)];

  /*
   * Colours come only from the backend. Supported shapes:
   *   options.colors / options.colorOptions / colorOptions / colors
   *   variant.color / variant.colour
   */
  const colorSourceCandidates = [
    item?.options?.colors,
    item?.options?.colorOptions,
    item?.colorOptions,
    item?.colors,
  ];

  const colorSource =
    colorSourceCandidates.find(
      (source) => Array.isArray(source) && source.length > 0
    ) || [];

  const sizeSource =
    Array.isArray(item?.options?.sizes) && item.options.sizes.length > 0
      ? item.options.sizes
      : Array.isArray(item?.sizes) && item.sizes.length > 0
      ? item.sizes
      : [];

  const variants = Array.isArray(item?.variants)
    ? item.variants
        .map(normalizeVariant)
        .filter(Boolean)
        .filter((variant) => variant.active !== false)
    : [];

  const variantColorOptions = variants
    .filter((variant) => optionName(variant?.colorOption || variant?.color))
    .map((variant) => {
      const colorOption =
        normalizeColorOption(variant?.colorOption || variant?.color) || {};

      return {
        ...colorOption,
        images: [
          ...(Array.isArray(colorOption?.images) ? colorOption.images : []),
          ...(Array.isArray(variant?.images) ? variant.images : []),
        ].filter(Boolean),
      };
    });

  const mergedColorOptions = [
    ...colorSource.map(normalizeColorOption).filter(Boolean),
    ...variantColorOptions,
  ];

  const colorOptions = mergedColorOptions.reduce((acc, color) => {
    const key = optionName(color).trim().toLowerCase();
    if (!key) return acc;

    const existing = acc.find(
      (entry) => optionName(entry).trim().toLowerCase() === key
    );

    if (!existing) {
      acc.push({
        ...color,
        images: Array.isArray(color?.images)
          ? color.images.filter(Boolean)
          : [],
      });
      return acc;
    }

    const mergedImages = [
      ...(Array.isArray(existing.images) ? existing.images : []),
      ...(Array.isArray(color.images) ? color.images : []),
    ].filter(Boolean);

    existing.images = [...new Set(mergedImages)];

    if (!existing.hex && color.hex) existing.hex = color.hex;
    if (!existing.value && color.value) existing.value = color.value;

    return acc;
  }, []);

  const sizeOptions = sizeSource.map(normalizeSizeOption).filter(Boolean);

  const colors = colorOptions
    .map((color) => color.hex || color.value || color.name)
    .filter(Boolean);

  const discount =
    hasSale && regularPrice > 0
      ? Math.max(
          5,
          Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
        )
      : 0;

  return {
    id: item?._id || item?.id || item?.slug || item?.title || "product",

    slug:
      item?.slug ||
      String(item?.title || item?.name || "product")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),

    name: item?.title || item?.name || item?.productName || "Untitled Product",

    price: finalPrice,
    originalPrice: regularPrice,
    discount,

    gsm: item?.details?.gsm || item?.gsm || "—",
    width: item?.details?.width || item?.width || "—",
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
      uniqueImages.length > 0 ? uniqueImages : ["/images/home/products/1.png"],

    colors,
    colorOptions,
    sizeOptions,
    variants,
    sellingMode: item?.sellingMode === "meter" ? "meter" : "piece",
    meterConfig: item?.meterConfig || {},
    bulkOrderNote: item?.bulkOrderNote || "",
    showOnSale: Boolean(item?.showOnSale),
    variantsEnabled: Boolean(item?.variantsEnabled || variants.length > 0),
  };
}

function extractProducts(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  return [];
}

function normalizeHeroImage(value) {
  return normalizeImageValue(value);
}

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

/* =========================================================
   COUNTDOWN
========================================================= */

const EMPTY_TIME = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  finished: false,
};

function useCountdown(targetDate) {
  const getTimeLeft = () => {
    if (!targetDate) return EMPTY_TIME;

    const targetTime = new Date(targetDate).getTime();
    if (!Number.isFinite(targetTime)) return EMPTY_TIME;

    const distance = Math.max(0, targetTime - Date.now());

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((distance / (1000 * 60)) % 60),
      seconds: Math.floor((distance / 1000) % 60),
      finished: distance <= 0,
    };
  };

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EMPTY_TIME);

  useEffect(() => {
    setMounted(true);

    const update = () => setTimeLeft(getTimeLeft());
    update();

    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  return { ...timeLeft, mounted };
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
   *   live      -> products available
   *   countdown -> no products, countdown active
   *   empty     -> no products, no countdown
   */
  const [saleMode, setSaleMode] = useState("countdown");
  const [saleEndDate, setSaleEndDate] = useState(null);
  const countdown = useCountdown(saleEndDate);

  const [currentPage, setCurrentPage] = useState(1);
  const [cartStates, setCartStates] = useState({});
  const [selectedColors, setSelectedColors] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({});
  const [selectedMeters, setSelectedMeters] = useState({});
  const [cartMessages, setCartMessages] = useState({});
  const [buyingProduct, setBuyingProduct] = useState(null);
  const [saleItems, setSaleItems] = useState([]);
  const [saleHeroImages, setSaleHeroImages] = useState({
    desktop: SALE_IMAGES.desktop,
    mobile: SALE_IMAGES.mobile,
  });
  const [saleTitle, setSaleTitle] = useState("");
  const [loading, setLoading] = useState(true);

  /* =======================================================
     SYNC VARIANT SELECTION FROM CART
  ======================================================= */

  useEffect(() => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return;
    if (!Array.isArray(saleItems) || saleItems.length === 0) return;

    const findLine = (product) => {
      const productId = String(product.id);
      const lines = cartItems.filter(
        (item) => String(item?.productId || "") === productId
      );
      if (lines.length === 0) return null;

      return (
        [...lines]
          .reverse()
          .find(
            (item) =>
              item?.variantId || item?.selectedColor || item?.selectedSize
          ) || lines[lines.length - 1]
      );
    };

    setSelectedColors((current) => {
      const next = { ...current };
      let changed = false;

      saleItems.forEach((product) => {
        const line = findLine(product);
        if (!line?.selectedColor) return;

        const cartColorName = optionName(line.selectedColor)
          .trim()
          .toLowerCase();

        const matchedColor =
          product.colorOptions?.find(
            (color) =>
              String(optionName(color)).trim().toLowerCase() === cartColorName
          ) || line.selectedColor;

        const productId = String(product.id);
        if (!sameOption(next[productId], matchedColor)) {
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
        const line = findLine(product);
        if (!line?.selectedSize) return;

        const cartSizeName = optionName(line.selectedSize)
          .trim()
          .toLowerCase();

        const matchedSize =
          product.sizeOptions?.find(
            (size) =>
              String(optionName(size)).trim().toLowerCase() === cartSizeName
          ) || line.selectedSize;

        const productId = String(product.id);
        if (!sameOption(next[productId], matchedSize)) {
          next[productId] = matchedSize;
          changed = true;
        }
      });

      return changed ? next : current;
    });

    setSelectedMeters((current) => {
      const next = { ...current };
      let changed = false;

      saleItems.forEach((product) => {
        if (product?.sellingMode !== "meter") return;

        const productId = String(product.id);
        const matchingLines = cartItems.filter(
          (item) => String(item?.productId || "") === productId
        );
        if (!matchingLines.length) return;

        const quantity = Number(
          matchingLines[matchingLines.length - 1]?.quantity
        );
        if (!Number.isFinite(quantity) || quantity <= 0) return;

        const config = product?.meterConfig || {};
        const min = Math.max(0.01, Number(config?.minMeters ?? 1) || 1);
        const max = Math.max(min, Number(config?.maxMeters ?? min) || min);
        const step = Math.max(0.01, Number(config?.incrementMeters ?? 1) || 1);
        const clamped = Math.min(max, Math.max(min, quantity));
        const snapped = min + Math.round((clamped - min) / step) * step;
        const nextQuantity = Number(
          Math.min(max, Math.max(min, snapped)).toFixed(4)
        );

        if (Number(next[productId]) !== nextQuantity) {
          next[productId] = nextQuantity;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [cartItems, saleItems]);

  /* ── Notify Me state ── */
  const [notifyStatus, setNotifyStatus] = useState("idle");
  const [notifyMsg, setNotifyMsg] = useState("");

  useEffect(() => {
    let mounted = true;

    async function checkNotifyStatus() {
      try {
        const meRes = await fetch(`${API_URL}/customer-auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!meRes.ok || !mounted) return;

        const meData = await meRes.json();
        const email = meData?.user?.email || "";
        if (!email || !mounted) return;

        const statusRes = await fetch(
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
        /* silent */
      }
    }

    checkNotifyStatus();
    return () => {
      mounted = false;
    };
  }, []);

  /* Dummy products — only used when the backend fails */
  const fallbackSaleProducts = useMemo(() => {
    return fallbackProducts.map(normalizeProduct).filter((product) => {
      const regular = Number(product.originalPrice || 0);
      const finalPrice = Number(product.price || 0);
      return finalPrice > 0 && regular > finalPrice;
    });
  }, []);

  /*
   * SALE API  ->  GET /api/sale
   *   products found            -> live
   *   no products + countdown   -> countdown
   *   no products, no countdown -> empty
   *   backend fail              -> dummy products
   */
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadSaleData() {
      try {
        const response = await fetch(`${API_URL}/sale`, {
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
          throw new Error(payload?.message || "Failed to load sale data");
        }

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
          ) || SALE_IMAGES.desktop;

        const mobileHeroImage =
          normalizeHeroImage(
            saleRoot?.mobileHeroImage ||
              saleRoot?.mobileHero ||
              saleRoot?.heroImage?.mobile ||
              saleRoot?.heroImage?.mobileHero
          ) || SALE_IMAGES.mobile;

        if (!isMounted) return;

        setSaleHeroImages({
          desktop: desktopHeroImage,
          mobile: mobileHeroImage,
        });

        setSaleTitle(
          saleRoot?.saleTitle || saleRoot?.title || payload?.saleTitle || ""
        );

        const rawProducts = Array.isArray(payload?.products)
          ? payload.products
          : Array.isArray(payload?.data?.products)
          ? payload.data.products
          : Array.isArray(payload?.sale?.products)
          ? payload.sale.products
          : Array.isArray(payload?.data?.sale?.products)
          ? payload.data.sale.products
          : Array.isArray(payload?.saleSettings?.products)
          ? payload.saleSettings.products
          : extractProducts(payload);

        /*
         * /api/sale is already the source of truth, so we do NOT
         * filter by price again (a sale can live on a variant only).
         */
        const backendProducts = rawProducts
          .filter(
            (product) => product?.status === "published" || !product?.status
          )
          .map(normalizeProduct);

        const countdownActive = Boolean(
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

        /* CASE 1 — products available */
        if (backendProducts.length > 0) {
          setSaleItems(backendProducts);
          setSaleMode("live");
          setSaleEndDate(null);
          setLoading(false);
          return;
        }

        /* CASE 2 — no products + countdown active */
        if (countdownActive && countdownDate) {
          setSaleItems([]);
          setSaleMode("countdown");
          setSaleEndDate(countdownDate);
          setCurrentPage(1);
          setLoading(false);
          return;
        }

        /* CASE 3 — nothing */
        setSaleItems([]);
        setSaleMode("empty");
        setSaleEndDate(null);
        setCurrentPage(1);
        setLoading(false);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Sale API error:", error);

        if (!isMounted) return;

        setSaleItems(fallbackSaleProducts);
        setSaleHeroImages({
          desktop: SALE_IMAGES.desktop,
          mobile: SALE_IMAGES.mobile,
        });
        setSaleMode("live");
        setSaleEndDate(null);
        setLoading(false);
      }
    }

    loadSaleData();

    /* Poll every 10s so admin changes show without a manual refresh */
    const refreshInterval = window.setInterval(loadSaleData, 10000);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearInterval(refreshInterval);
    };
  }, [fallbackSaleProducts]);

  /* Countdown finished -> temporary empty mode until next poll */
  useEffect(() => {
    if (saleMode === "countdown" && countdown.mounted && countdown.finished) {
      setSaleMode("empty");
      setSaleEndDate(null);
      setSaleItems([]);
      setCurrentPage(1);
    }
  }, [saleMode, countdown.mounted, countdown.finished]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const saleProducts = saleItems;

  const totalPages = Math.max(1, Math.ceil(saleProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const visibleProducts = saleProducts.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  /*
   * Slots are reserved per page: if ANY visible card has a meter box /
   * colours / sizes / specs, every card gets an equally tall slot, so
   * price + buttons line up across the whole grid.
   */
  const hasValue = (value) => {
    const text = String(value ?? "").trim();
    return text !== "" && text !== "—";
  };

  const showMeterSlot = visibleProducts.some(
    (product) => product?.sellingMode === "meter"
  );
  const showColorSlot = visibleProducts.some(
    (product) => product?.colorOptions?.length > 0
  );
  const showSizeSlot = visibleProducts.some(
    (product) =>
      product?.sellingMode !== "meter" && product?.sizeOptions?.length > 0
  );
  const showSpecs = visibleProducts.some(
    (product) =>
      hasValue(product?.gsm) ||
      hasValue(product?.width) ||
      hasValue(product?.composition)
  );

  /* =======================================================
     VARIANT SELECTION + CART
  ======================================================= */

  const getSelectedColor = (product) =>
    selectedColors[String(product.id)] || product?.colorOptions?.[0] || null;

  const getSelectedSize = (product) =>
    selectedSizes[String(product.id)] || null;

  const getMeterConfig = (product) => {
    const config = product?.meterConfig || {};
    const min = Math.max(0.01, Number(config?.minMeters ?? 1) || 1);
    const max = Math.max(min, Number(config?.maxMeters ?? min) || min);
    const step = Math.max(0.01, Number(config?.incrementMeters ?? 1) || 1);
    return { min, max, step };
  };

  const getSelectedMeters = (product) => {
    if (product?.sellingMode !== "meter") return 1;

    const { min, max } = getMeterConfig(product);
    const raw = Number(selectedMeters[String(product.id)] ?? min);

    return Math.min(max, Math.max(min, Number.isFinite(raw) ? raw : min));
  };

  const formatMeterValue = (value) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return "1";
    return Number.isInteger(number)
      ? String(number)
      : number.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  };

  const setMeterQuantity = (product, value) => {
    if (product?.sellingMode !== "meter") return;

    const { min, max, step } = getMeterConfig(product);
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;

    const steps = Math.round((numeric - min) / step);
    const next = Math.min(max, Math.max(min, min + steps * step));

    setSelectedMeters((current) => ({
      ...current,
      [String(product.id)]: Number(next.toFixed(4)),
    }));
  };

  const getAvailableSizes = (product) => {
    const sizes = Array.isArray(product?.sizeOptions) ? product.sizeOptions : [];

    if (!product?.variantsEnabled || !product?.variants?.length) return sizes;

    const selectedColor = getSelectedColor(product);
    if (!selectedColor) return sizes;

    const filtered = sizes.filter((size) =>
      product.variants.some(
        (variant) =>
          sameOption(variant?.colorOption || variant?.color, selectedColor) &&
          sameOption(variant?.sizeOption || variant?.size, size)
      )
    );

    return filtered.length > 0 ? filtered : sizes;
  };

  const getSelectedVariant = (product) => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    if (!variants.length) return null;

    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);
    const isMeterProduct = product?.sellingMode === "meter";
    const needsColor = product?.colorOptions?.length > 0;
    const needsSize = !isMeterProduct && product?.sizeOptions?.length > 0;

    if (!needsColor && !needsSize) return null;
    if (needsColor && !selectedColor) return null;
    if (needsSize && !selectedSize) return null;

    return (
      variants.find((variant) => {
        const colorMatches = needsColor
          ? sameOption(variant?.colorOption || variant?.color, selectedColor)
          : true;

        const sizeMatches = needsSize
          ? sameOption(variant?.sizeOption || variant?.size, selectedSize)
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

      if (regular > 0 || sale > 0) {
        return {
          original: onSale ? regular : 0,
          sale: onSale ? sale : regular || sale,
          discount: onSale
            ? Math.max(1, Math.round(((regular - sale) / regular) * 100))
            : 0,
        };
      }
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
          sale: onSale ? sale : regular || sale,
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

    setSelectedColors((current) => ({ ...current, [id]: color }));

    const currentSize = getSelectedSize(product);
    if (!currentSize || !product?.variants?.length) return;

    const stillValid = product.variants.some(
      (variant) =>
        sameOption(variant?.colorOption || variant?.color, color) &&
        sameOption(variant?.sizeOption || variant?.size, currentSize)
    );

    if (!stillValid) {
      setSelectedSizes((current) => ({ ...current, [id]: null }));
    }
  };

  const handleSelectSize = (product, size) => {
    const id = String(product.id);
    setSelectedSizes((current) => ({ ...current, [id]: size }));
  };

  const getCartItemForProduct = (product) => {
    const productId = String(product?.id || "");
    if (!productId || !Array.isArray(cartItems)) return null;

    const selectedVariant = getSelectedVariant(product);
    const selectedColor = getSelectedColor(product);
    const selectedSize = getSelectedSize(product);

    const sameProduct = cartItems.filter(
      (item) => String(item?.productId || "") === productId
    );

    if (sameProduct.length === 0) return null;

    if (selectedVariant?.id) {
      const byVariant = sameProduct.find(
        (item) => String(item?.variantId || "") === String(selectedVariant.id)
      );
      if (byVariant) return byVariant;
    }

    const wantedColor = String(optionName(selectedColor) || "")
      .trim()
      .toLowerCase();
    const wantedSize = String(optionName(selectedSize) || "")
      .trim()
      .toLowerCase();

    if (wantedColor || wantedSize) {
      const byOptions = sameProduct.find((item) => {
        const itemColor = String(optionName(item?.selectedColor) || "")
          .trim()
          .toLowerCase();
        const itemSize = String(optionName(item?.selectedSize) || "")
          .trim()
          .toLowerCase();

        return itemColor === wantedColor && itemSize === wantedSize;
      });

      if (byOptions) return byOptions;
    }

    if (product?.sellingMode === "meter") {
      const byMeterColor = wantedColor
        ? sameProduct.find((item) => {
            const itemColor = String(optionName(item?.selectedColor) || "")
              .trim()
              .toLowerCase();
            return itemColor === wantedColor;
          })
        : null;

      return byMeterColor || sameProduct[sameProduct.length - 1];
    }

    if (
      product?.colorOptions?.length === 0 &&
      product?.sizeOptions?.length === 0
    ) {
      return sameProduct[sameProduct.length - 1];
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
    const isMeter = product?.sellingMode === "meter";
    const cartQuantity = isMeter ? getSelectedMeters(product) : 1;

    if (!isMeter && product?.colorOptions?.length > 0 && !selectedColor) {
      setCardMessage(id, "Please select colour");
      return { success: false, message: "Please select colour" };
    }

    if (!isMeter && product?.sizeOptions?.length > 0 && !selectedSize) {
      setCardMessage(id, "Please select size");
      return { success: false, message: "Please select size" };
    }

    if (
      !isMeter &&
      product?.variantsEnabled &&
      (product?.colorOptions?.length > 0 ||
        product?.sizeOptions?.length > 0) &&
      !selectedVariant
    ) {
      setCardMessage(id, "Please select a valid colour and size");
      return {
        success: false,
        message: "Please select a valid colour and size",
      };
    }

    if (selectedVariant && Number(selectedVariant.stock) <= 0) {
      setCardMessage(id, "Selected variant is out of stock");
      return { success: false, message: "Selected variant is out of stock" };
    }

    setCartStates((current) => ({ ...current, [id]: "loading" }));

    try {
      const result = await addToCart(String(product.id), cartQuantity, {
        selectedColor:
          selectedColor?.name || selectedColor?.value || selectedColor || "",
        selectedSize:
          selectedSize?.name || selectedSize?.value || selectedSize || "",
        variantId: selectedVariant?.id || "",
      });

      if (result?.loginRequired) {
        setCartStates((current) => ({ ...current, [id]: "idle" }));
        return result;
      }

      if (result?.success === false) {
        setCartStates((current) => ({ ...current, [id]: "idle" }));
        setCardMessage(id, result?.message || "Failed to add to cart");
        return result;
      }

      setCartStates((current) => ({ ...current, [id]: "added" }));

      window.setTimeout(() => {
        setCartStates((current) => ({ ...current, [id]: "idle" }));
      }, 900);

      return result;
    } catch (error) {
      console.error("Failed to add sale product to cart:", error);
      setCartStates((current) => ({ ...current, [id]: "idle" }));
      setCardMessage(id, "Failed to add to cart");
      return { success: false, message: "Failed to add to cart" };
    }
  };

  const handleIncreaseCartQuantity = async (product) => {
    const id = String(product.id);
    const cartItem = getCartItemForProduct(product);
    if (!cartItem) return;

    setCartStates((current) => ({ ...current, [id]: "updating" }));

    try {
      const isMeter = product?.sellingMode === "meter";
      const { min, max, step } = getMeterConfig(product);
      const current = Number(cartItem.quantity || (isMeter ? min : 1));

      const nextQuantity = isMeter
        ? Math.min(max, Number((current + step).toFixed(4)))
        : Math.min(100, Math.max(1, current + 1));

      if (nextQuantity !== current) {
        await updateQuantity(cartItem._id, nextQuantity);
      }
    } catch (error) {
      console.error("Failed to increase cart quantity:", error);
      setCardMessage(id, "Failed to update quantity");
    } finally {
      setCartStates((current) => ({ ...current, [id]: "idle" }));
    }
  };

  const handleDecreaseCartQuantity = async (product) => {
    const id = String(product.id);
    const cartItem = getCartItemForProduct(product);
    if (!cartItem) return;

    const isMeter = product?.sellingMode === "meter";
    const { min, step } = getMeterConfig(product);

    const quantity = Math.max(
      isMeter ? min : 1,
      Number(cartItem.quantity || (isMeter ? min : 1))
    );

    if (quantity <= (isMeter ? min : 1)) return;

    setCartStates((current) => ({ ...current, [id]: "updating" }));

    try {
      const nextQuantity = isMeter
        ? Math.max(min, Number((quantity - step).toFixed(4)))
        : quantity - 1;

      await updateQuantity(cartItem._id, nextQuantity);
    } catch (error) {
      console.error("Failed to decrease cart quantity:", error);
      setCardMessage(id, "Failed to update quantity");
    } finally {
      setCartStates((current) => ({ ...current, [id]: "idle" }));
    }
  };

  const handleRemoveFromCart = async (product) => {
    const id = String(product.id);
    const cartItem = getCartItemForProduct(product);
    if (!cartItem) return;

    setCartStates((current) => ({ ...current, [id]: "removing" }));

    try {
      await removeItem(cartItem._id);
    } catch (error) {
      console.error("Failed to remove cart item:", error);
      setCardMessage(id, "Failed to remove item");
    } finally {
      setCartStates((current) => ({ ...current, [id]: "idle" }));
    }
  };

  /* =======================================================
     BUY NOW
  ======================================================= */

  const handleBuyNow = async (id) => {
    if (buyingProduct) return;

    const item = saleItems.find((product) => String(product.id) === String(id));
    if (!item) return;

    const isMeter = item?.sellingMode === "meter";
    const selectedColor = getSelectedColor(item);
    const selectedSize = getSelectedSize(item);
    const selectedVariant = getSelectedVariant(item);

    if (!isMeter) {
      if (item?.colorOptions?.length > 0 && !selectedColor) {
        setCardMessage(id, "Please select colour");
        return;
      }

      if (item?.sizeOptions?.length > 0 && !selectedSize) {
        setCardMessage(id, "Please select size");
        return;
      }

      if (
        item?.variantsEnabled &&
        (item?.colorOptions?.length > 0 ||
          item?.sizeOptions?.length > 0) &&
        !selectedVariant
      ) {
        setCardMessage(id, "Please select a valid colour and size");
        return;
      }

      if (selectedVariant && Number(selectedVariant.stock || 0) <= 0) {
        setCardMessage(id, "Selected variant is out of stock");
        return;
      }
    }

    const quantity = isMeter ? getSelectedMeters(item) : 1;

    setBuyingProduct(id);

    try {
      const result = await prepareBuyNow(item, quantity, {
        selectedColor: isMeter
          ? ""
          : selectedColor?.name || selectedColor?.value || selectedColor || "",
        selectedSize: isMeter
          ? ""
          : selectedSize?.name || selectedSize?.value || selectedSize || "",
        variantId: isMeter ? "" : selectedVariant?.id || "",
      });

      if (result?.loginRequired) {
        setBuyingProduct(null);
        setCardMessage(id, "Please login to buy now");
        requestCustomerLogin(() => handleBuyNow(id));
        return;
      }

      if (result?.success && result?.sessionId) {
        router.push(`/checkout?buyNowSessionId=${result.sessionId}`);
        return;
      }

      setBuyingProduct(null);
      setCardMessage(id, result?.message || "Unable to buy now");
    } catch (error) {
      console.error("Sale Buy Now error:", error);
      setBuyingProduct(null);
      setCardMessage(id, "Unable to buy now. Please try again.");
    }
  };

  /* =======================================================
     NOTIFY ME — uses logged-in customer's email
  ======================================================= */

  async function handleNotifyClick() {
    if (
      notifyStatus === "loading" ||
      notifyStatus === "success" ||
      notifyStatus === "already"
    ) {
      return;
    }

    setNotifyStatus("loading");
    setNotifyMsg("");

    const resetLater = (ms) =>
      setTimeout(() => {
        setNotifyStatus("idle");
        setNotifyMsg("");
      }, ms);

    try {
      const meRes = await fetch(`${API_URL}/customer-auth/me`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!meRes.ok) {
        setNotifyStatus("login-required");
        setNotifyMsg("Please login to get notified when the sale goes live.");
        resetLater(4000);
        return;
      }

      const meData = await meRes.json();
      const email = meData?.user?.email || "";

      if (!email) {
        setNotifyStatus("error");
        setNotifyMsg("Could not find your email. Please login again.");
        resetLater(3500);
        return;
      }

      const res = await fetch(`${API_URL}/sale/notify-subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        if (data.alreadySubscribed) {
          setNotifyStatus("already");
          setNotifyMsg("You're already subscribed for this sale!");
        } else {
          setNotifyStatus("success");
          setNotifyMsg(
            "You're on the list! We'll email you when the sale goes live."
          );
          setTimeout(() => {
            setNotifyStatus("already");
            setNotifyMsg("You're already subscribed for this sale!");
          }, 3000);
        }
      } else {
        setNotifyStatus("error");
        setNotifyMsg(data.message || "Something went wrong. Please try again.");
        resetLater(3500);
      }
    } catch {
      setNotifyStatus("error");
      setNotifyMsg("Network error. Please try again.");
      resetLater(3500);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="sale-page">
      <style>{`
        /* =================================================
           TOKENS + PAGE
        ================================================= */

        .sale-page {
          --teal: ${COLORS.teal};
          --teal-deep: ${COLORS.tealDeep};
          --cream: ${COLORS.cream};
          --cream-dark: ${COLORS.darkCream};
          --gold: ${COLORS.gold};
          --gold-deep: ${COLORS.goldDeep};
          --ink: ${COLORS.ink};
          --line: #ECE4DB;
          --muted: #7A746C;

          width: 100%;
          min-height: 100vh;
          background: var(--cream);
          color: var(--ink);
          overflow-x: hidden;
          box-sizing: border-box;
          font-family: "Poppins", Arial, sans-serif;
        }

        .sale-page *,
        .sale-page *::before,
        .sale-page *::after {
          box-sizing: border-box;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* =================================================
           HERO
        ================================================= */

        .sale-hero {
          position: relative;
          width: 100%;
          min-height: 450px;
          overflow: hidden;
          background: var(--cream-dark);
        }

        .sale-hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .sale-hero-mobile { display: none; }

        .sale-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            rgba(250,248,245,.98) 0%,
            rgba(250,248,245,.94) 28%,
            rgba(250,248,245,.73) 49%,
            rgba(250,248,245,.15) 76%,
            rgba(250,248,245,.03) 100%
          );
        }

        .sale-hero-content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px 32px 36px;
        }

        .sale-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 10px;
          color: var(--gold);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .sale-eyebrow-line {
          width: 34px;
          height: 1px;
          display: inline-block;
          background: var(--gold);
        }

        .sale-hero-title {
          max-width: 600px;
          margin: 0;
          color: var(--teal);
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 58px;
          font-weight: 600;
          line-height: .98;
        }

        .sale-hero-subtitle {
          max-width: 570px;
          margin: 12px 0 20px;
          color: #696968;
          font-size: 14px;
          line-height: 1.6;
        }

        /* COUNTDOWN */

        .sale-countdown {
          display: grid;
          grid-template-columns: repeat(4, 86px);
          gap: 10px;
          margin-bottom: 21px;
        }

        .sale-count-box {
          height: 74px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(242,238,233,.92);
          border: 1px solid rgba(190,157,107,.18);
          border-radius: 11px;
        }

        .sale-count-number {
          color: #171717;
          font-size: 27px;
          font-weight: 600;
          line-height: 1;
        }

        .sale-count-label {
          margin-top: 6px;
          color: #555;
          font-size: 10px;
          line-height: 1;
        }

        /* NOTIFY */

        .sale-notify-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .sale-notify-button {
          position: relative;
          height: 46px;
          min-width: 181px;
          padding: 0 24px;
          border: none;
          border-radius: 999px;
          background: var(--gold);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          overflow: hidden;
        }

        .sale-notify-button:hover .sale-notify-icon {
          animation: bell-drop .45s ease;
        }

        @keyframes bell-drop {
          0% { transform: translateY(-100%); opacity: 0; }
          60% { transform: translateY(7%); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .sale-notify-copy {
          position: relative;
          padding-left: 18px;
          color: #696968;
          font-size: 12px;
          line-height: 1.35;
        }

        .sale-notify-copy::before {
          content: "";
          position: absolute;
          left: 0;
          top: 2px;
          width: 1px;
          height: 35px;
          background: rgba(190,157,107,.65);
        }

        /* =================================================
           SALE LIVE BANNER
        ================================================= */

        .sale-live {
          width: 100%;
          background: var(--cream-dark);
          padding: 32px 0;
          border-top: 1px solid rgba(190,157,107,.12);
          border-bottom: 1px solid rgba(190,157,107,.12);
        }

        .sale-live-inner {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 230px minmax(0, 1fr) 280px;
          align-items: center;
          gap: 40px;
        }

        .sale-discount-circle {
          width: 145px;
          height: 145px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--teal);
          outline: 1px solid rgba(41,92,101,.3);
          outline-offset: 5px;
          background: #fff;
          color: var(--teal);
        }

        .sale-discount-small {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
        }

        .sale-discount-number {
          margin: 2px 0;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 47px;
          font-weight: 700;
          line-height: .9;
        }

        .sale-discount-off {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 1px;
        }

        .sale-live-copy { text-align: center; }

        .sale-live-eyebrow {
          margin: 0 0 6px;
          color: var(--gold);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .sale-live-title {
          margin: 0;
          color: var(--teal);
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 48px;
          font-weight: 600;
          line-height: .95;
        }

        .sale-live-description {
          max-width: 440px;
          margin: 10px auto 0;
          color: #696968;
          font-size: 13px;
          line-height: 1.55;
        }

        .sale-benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .sale-benefit {
          text-align: center;
          padding: 0 10px;
          border-left: 1px solid #DED5CB;
        }

        .sale-benefit:first-child { border-left: none; }

        .sale-benefit svg {
          color: var(--teal);
          margin-bottom: 8px;
        }

        .sale-benefit-title {
          display: block;
          color: #394346;
          font-size: 9px;
          font-weight: 600;
          line-height: 1.25;
        }

        /* =================================================
           PRODUCTS SECTION
        ================================================= */

        .sale-products-section {
          width: 100%;
          padding: 34px 0 64px;
        }

        .sale-products-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 32px;
        }

        .sale-products-head {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .sale-product-count {
          color: #455055;
          font-size: 12px;
        }

        .sale-sort {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #696968;
          font-size: 11px;
        }

        .sale-sort-select {
          height: 34px;
          padding: 0 13px;
          border: 1px solid #E1DAD2;
          border-radius: 999px;
          background: #fff;
          color: #26383D;
          font-family: inherit;
          font-size: 10px;
          outline: none;
        }

        .sale-products-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          align-items: stretch;
        }

        .sale-empty-state {
          grid-column: 1 / -1;
          padding: 60px 20px;
          text-align: center;
          color: var(--muted);
          font-size: 13px;
        }

        /* =================================================
           PREMIUM PRODUCT CARD
           Fixed rows: image / name / unit / specs / options / price / actions
           Slots reserve the same height in every card on the page,
           so price + buttons always line up.
        ================================================= */

        .sale-products-grid { align-items: stretch; }

        .sale-card {
          position: relative;
          width: 100%;
          min-width: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(41,92,101,.04);
          transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
        }

        .sale-card:hover {
          transform: translateY(-5px);
          border-color: rgba(190,157,107,.6);
          box-shadow: 0 22px 40px -14px rgba(41,92,101,.22);
        }

        /* ---------- IMAGE ---------- */

        .sale-card-image {
          position: relative;
          width: 100%;
          flex: 0 0 auto;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--cream-dark);
        }

        .sale-card-image > a { display: block; width: 100%; height: 100%; }

        .sale-card-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform .7s cubic-bezier(.2,.7,.2,1);
        }

        .sale-card:hover .sale-card-image > a:first-child img { transform: scale(1.05); }

        .sale-card-second-image {
          position: absolute !important;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity .35s ease;
        }

        .sale-card:hover .sale-card-second-image { opacity: 1; }

        .sale-card-image::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 35%;
          background: linear-gradient(180deg, rgba(0,0,0,0), rgba(20,40,44,.12));
          pointer-events: none;
          z-index: 1;
        }

        /* ---------- BADGE (left) + HEART (right) ---------- */

        .sale-discount-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          right: auto;
          bottom: auto;
          z-index: 5;
          width: auto;
          height: 26px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--gold), var(--gold-deep));
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .8px;
          line-height: 1;
          text-transform: uppercase;
          white-space: nowrap;
          box-shadow: 0 6px 14px -4px rgba(168,132,79,.55);
        }

        .sale-save {
          position: absolute;
          top: 10px;
          right: 10px;
          left: auto;
          z-index: 6;
          width: 34px;
          height: 34px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255,255,255,.9);
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          color: var(--teal);
          cursor: pointer;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: transform .2s ease, background .2s ease, color .2s ease;
        }

        .sale-save:hover { transform: scale(1.08); }

        .sale-save.is-saved { background: var(--teal); border-color: var(--teal); color: #fff; }

        /* ---------- BODY ---------- */

        .sale-card-body {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          padding: 16px 16px 16px;
          min-height: 0;
        }

        .sale-card-name {
          display: block;
          width: 100%;
          height: 26px;
          margin: 0;
          color: var(--ink);
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 22px;
          font-weight: 600;
          line-height: 26px;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color .2s ease;
        }

        .sale-card-name:hover { color: var(--teal); }

        .sale-card-unit {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 16px;
          margin: 4px 0 12px;
          color: var(--gold-deep);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 1.6px;
          line-height: 16px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .sale-card-unit::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(190,157,107,.5), rgba(190,157,107,0));
        }

        /* ---------- SPECS (GSM / Width / Material) ---------- */

        .sale-specs {
          flex: 0 0 auto;
          height: 40px;
          margin-bottom: 12px;
          display: grid;
          grid-template-columns: 1fr 1fr 1.4fr;
          gap: 0;
          border: 1px solid #F0EAE3;
          border-radius: 10px;
          background: #FBF9F6;
          overflow: hidden;
        }

        .sale-spec {
          min-width: 0;
          padding: 0 10px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3px;
          border-left: 1px solid #F0EAE3;
        }

        .sale-spec:first-child { border-left: none; }

        .sale-spec-label {
          color: var(--gold-deep);
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: 1.1px;
          line-height: 1;
          text-transform: uppercase;
        }

        .sale-spec-value {
          color: #283438;
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ---------- OPTIONS (meter / colour / size) ---------- */

        .sale-options {
          position: relative;
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 12px;
        }

        .sale-slot { flex: 0 0 auto; min-width: 0; }
        .sale-slot-meter { height: 80px; }
        .sale-slot-color { height: 46px; }
        .sale-slot-size  { height: 50px; }

        .sale-variant-group {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .sale-variant-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-height: 14px;
        }

        .sale-colors-label {
          color: var(--muted);
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 1.3px;
          line-height: 1;
          text-transform: uppercase;
        }

        .sale-selected-option {
          min-width: 0;
          max-width: 70%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--teal);
          font-size: 10.5px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .sale-swatches {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 9px;
          padding: 4px 3px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .sale-swatches::-webkit-scrollbar { display: none; }

        .sale-swatch {
          width: 20px;
          height: 20px;
          flex: 0 0 auto;
          border: 1px solid rgba(0,0,0,.14);
          border-radius: 50%;
        }

        .sale-swatch-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          color: #fff;
          cursor: pointer;
          transition: transform .18s ease;
        }

        .sale-swatch-button:hover { transform: scale(1.12); }

        .sale-swatch-button.is-selected {
          box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px var(--teal);
        }

        .sale-size-options {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 6px;
          padding: 2px 1px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .sale-size-options::-webkit-scrollbar { display: none; }

        .sale-size-button {
          flex: 0 0 auto;
          min-width: 34px;
          height: 26px;
          padding: 0 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #DDD4C9;
          border-radius: 999px;
          background: #fff;
          color: var(--teal);
          font-family: inherit;
          font-size: 10.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all .18s ease;
        }

        .sale-size-button:hover { border-color: var(--teal); }

        .sale-size-button.is-selected { background: var(--teal); border-color: var(--teal); color: #fff; }

        /* meter selector */

        .sale-meter-box {
          height: 100%;
          padding: 9px 12px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border: 1px solid #E8E0D8;
          border-radius: 12px;
          background: #FBF9F6;
        }

        .sale-meter-control {
          display: grid;
          grid-template-columns: 28px 1fr 28px;
          align-items: center;
          gap: 8px;
        }

        .sale-meter-control button {
          width: 28px;
          height: 28px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #DCD3CA;
          border-radius: 50%;
          background: #fff;
          color: var(--teal);
          cursor: pointer;
          transition: background .18s ease, color .18s ease;
        }

        .sale-meter-control button:hover:not(:disabled) { background: var(--teal); color: #fff; }
        .sale-meter-control button:disabled { opacity: .4; cursor: not-allowed; }

        .sale-meter-control strong { text-align: center; color: #222; font-size: 14px; font-weight: 600; }

        .sale-meter-range {
          color: #8A837C;
          font-size: 9.5px;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
        }

        /* validation message: floats over the options, never shifts layout */

        .sale-cart-message {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 4;
          margin: 0;
          padding: 7px 10px;
          border-radius: 10px;
          background: #FFF1F0;
          border: 1px solid #F3CFCB;
          color: #A24D4D;
          font-size: 10.5px;
          font-weight: 500;
          line-height: 1.25;
          text-align: center;
          box-shadow: 0 8px 18px -8px rgba(162,77,77,.35);
          animation: saleMsgIn .25s ease both;
        }

        @keyframes saleMsgIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ---------- PRICE ---------- */

        .sale-price-row {
          flex: 0 0 auto;
          height: 40px;
          margin-top: auto;
          margin-bottom: 12px;
          padding-top: 12px;
          display: flex;
          align-items: baseline;
          flex-wrap: nowrap;
          gap: 8px;
          border-top: 1px solid #F0EAE3;
          overflow: hidden;
          white-space: nowrap;
        }

        .sale-new-price {
          color: var(--teal);
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 28px;
          font-weight: 700;
          line-height: 1;
        }

        .sale-old-price {
          color: #A39C93;
          font-size: 12.5px;
          font-weight: 500;
          text-decoration: line-through;
        }

        .sale-price-unit {
          margin-left: auto;
          color: var(--muted);
          font-size: 11px;
          font-weight: 500;
        }

        /* ---------- ACTIONS ---------- */

        .sale-actions {
          flex: 0 0 auto;
          width: 100%;
          height: 42px;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 8px;
        }

        .sale-actions > * { min-width: 0; }

        .sale-action-button {
          position: relative;
          width: 100%;
          height: 42px;
          min-width: 0;
          padding: 0 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border-radius: 999px;
          font-family: inherit;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          overflow: hidden;
          transition: background .22s ease, color .22s ease, box-shadow .22s ease;
        }

        .sale-cart-button { border: 1px solid var(--teal); background: var(--teal); color: #fff; }

        .sale-cart-button:hover:not(:disabled) {
          background: var(--teal-deep);
          box-shadow: 0 10px 20px -8px rgba(41,92,101,.6);
        }

        .sale-buy-button { border: 1px solid var(--teal); background: #fff; color: var(--teal); }

        .sale-buy-button:hover:not(:disabled) { background: var(--teal); color: #fff; }

        .sale-button-added {
          background: var(--gold) !important;
          border-color: var(--gold) !important;
          color: #fff !important;
        }

        .sale-action-button:disabled { cursor: not-allowed; }

        .sale-action-stage {
          position: relative;
          width: 100%;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .sale-action-state {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .sale-action-state-enter { animation: saleButtonEnter .42s cubic-bezier(.2,.8,.25,1) both; }

        @keyframes saleButtonEnter {
          0% { opacity: 0; transform: translateY(-120%); }
          55% { opacity: 1; transform: translateY(8%); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* inline cart controls (same size as the Add to Cart button) */

        .sale-cart-controls {
          width: 100%;
          height: 42px;
          min-width: 0;
          display: grid;
          grid-template-columns: 30px minmax(18px, 1fr) 30px 34px;
          align-items: center;
          gap: 2px;
          padding: 2px 6px;
          border: 1px solid #E4DCD4;
          border-radius: 999px;
          background: #fff;
          color: var(--teal);
          overflow: hidden;
          animation: saleCartControlsEnter .35s cubic-bezier(.2,.8,.25,1) both;
        }

        .sale-cart-controls.is-removing { animation: saleCartControlsRemove .28s cubic-bezier(.2,.8,.25,1) both; }

        .sale-cart-qty-button,
        .sale-cart-remove-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          padding: 0;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: var(--teal);
          cursor: pointer;
          transition: background .18s ease, transform .15s ease, opacity .18s ease;
        }

        .sale-cart-qty-button:hover:not(:disabled) { background: #F1ECE6; transform: scale(1.06); }

        .sale-cart-remove-button {
          width: 34px;
          height: 30px;
          border-left: 1px solid #E4DCD4;
          border-radius: 0;
          padding-left: 4px;
        }

        .sale-cart-remove-button:hover:not(:disabled) { color: #A24D4D; }

        .sale-cart-qty-button:disabled,
        .sale-cart-remove-button:disabled { opacity: .42; cursor: not-allowed; }

        .sale-cart-qty-number {
          min-width: 18px;
          text-align: center;
          color: var(--teal);
          font: 700 12px/1 "Poppins", Arial, sans-serif;
          white-space: nowrap;
        }

        @keyframes saleCartControlsEnter {
          0% { opacity: 0; transform: translateY(-40%); }
          70% { opacity: 1; transform: translateY(5%); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes saleCartControlsRemove {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(40%); }
        }

        /* ---------- SKELETON ---------- */

        .skeleton-box,
        .skeleton-line {
          background: linear-gradient(90deg, #F2EEE9 25%, #F8F5F1 50%, #F2EEE9 75%);
          background-size: 200% 100%;
          animation: saleShimmer 1.4s linear infinite;
        }

        .skeleton-line {
          height: 12px;
          margin-bottom: 10px;
          border-radius: 6px;
        }

        .skeleton-line-title { height: 20px; width: 70%; }
        .skeleton-line-short { width: 45%; }

        @keyframes saleShimmer {
          to { background-position: -200% 0; }
        }

        /* =================================================
           PAGINATION
        ================================================= */

        .sale-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 38px;
        }

        .sale-page-button {
          width: 38px;
          height: 38px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #E4DDD5;
          border-radius: 50%;
          background: #fff;
          color: var(--teal);
          font-family: inherit;
          font-size: 11px;
          cursor: pointer;
          transition: border-color .2s ease;
        }

        .sale-page-button:hover { border-color: var(--teal); }

        .sale-page-button.active {
          background: var(--teal);
          border-color: var(--teal);
          color: #fff;
        }

        .sale-page-button:disabled { opacity: .4; cursor: not-allowed; }

        /* =================================================
           FOOT DECOR
        ================================================= */

        .sale-foot-decor {
          width: 100%;
          min-height: 70px;
          margin-top: 40px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          color: #7D776F;
        }

        .sale-foot-text {
          max-width: 180px;
          color: #807B74;
          font-size: 9px;
          letter-spacing: 3px;
          line-height: 1.7;
          text-transform: uppercase;
        }

        .sale-foot-right {
          max-width: 170px;
          color: #8A847B;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 20px;
          font-style: italic;
          line-height: 1.05;
          text-align: right;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1100px) {
          .sale-hero { min-height: 420px; }
          .sale-hero-title { font-size: 51px; }
          .sale-live-inner { grid-template-columns: 180px minmax(0, 1fr); gap: 28px; }
          .sale-benefits { display: none; }
          .sale-products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        }

        @media (max-width: 900px) {
          .sale-card-second-image { display: none !important; }
        }

        @media (max-width: 800px) {
          .sale-hero-image { display: none; }
          .sale-hero-mobile { display: block; }

          .sale-hero-overlay {
            background: linear-gradient(
              180deg,
              rgba(250,248,245,.82) 0%,
              rgba(250,248,245,.84) 45%,
              rgba(250,248,245,.22) 100%
            );
          }

          .sale-hero-content { padding: 34px 24px 28px; }
          .sale-hero-title { font-size: 48px; }

          .sale-live-inner { grid-template-columns: 1fr; justify-items: center; text-align: center; }

          .sale-products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }

          .sale-card { border-radius: 15px; }
          .sale-card-body { padding: 12px; }
          .sale-card-name { font-size: 18px; height: 22px; line-height: 22px; }
          .sale-card-unit { margin-bottom: 10px; font-size: 8.5px; letter-spacing: 1.3px; }

          .sale-specs { height: 38px; margin-bottom: 10px; }
          .sale-spec { padding: 0 8px; }
          .sale-spec-value { font-size: 9.5px; }

          .sale-options { gap: 8px; margin-bottom: 10px; }
          .sale-slot-meter { height: 74px; }
          .sale-slot-color { height: 42px; }
          .sale-slot-size { height: 46px; }

          .sale-price-row { height: 34px; padding-top: 9px; margin-bottom: 10px; }
          .sale-new-price { font-size: 23px; }
          .sale-old-price { font-size: 11px; }
          .sale-price-unit { font-size: 10px; }

          .sale-actions, .sale-action-button, .sale-cart-controls { height: 38px; }
          .sale-action-button { font-size: 10px; }

          .sale-cart-controls { grid-template-columns: 26px minmax(15px, 1fr) 26px 28px; padding: 1px 4px; }
          .sale-cart-qty-button { width: 26px; height: 26px; }
          .sale-cart-remove-button { width: 28px; height: 26px; }
          .sale-cart-qty-number { font-size: 11px; }
        }

        @media (max-width: 600px) {
          .sale-products-container { padding: 0 14px; }
          .sale-hero { min-height: 610px; }
          .sale-hero-content { padding: 30px 16px 24px; }
          .sale-eyebrow { font-size: 9px; letter-spacing: 3px; }
          .sale-eyebrow-line { width: 27px; }
          .sale-hero-title { max-width: 320px; font-size: 42px; line-height: 1; }
          .sale-hero-subtitle { max-width: 330px; margin: 10px 0 17px; font-size: 11px; line-height: 1.55; }

          .sale-countdown { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; width: 100%; max-width: 360px; }
          .sale-count-box { height: 64px; border-radius: 9px; }
          .sale-count-number { font-size: 22px; }
          .sale-count-label { font-size: 8px; margin-top: 5px; }

          .sale-notify-row { width: 100%; align-items: flex-start; gap: 12px; }
          .sale-notify-button { min-width: 150px; height: 42px; padding: 0 15px; font-size: 10px; }
          .sale-notify-copy { max-width: 135px; font-size: 9px; }
          .sale-notify-copy::before { height: 29px; }

          .sale-live { padding: 26px 0; }
          .sale-live-inner { padding: 0 16px; gap: 24px; }
          .sale-discount-circle { width: 116px; height: 116px; }
          .sale-discount-small, .sale-discount-off { font-size: 8px; }
          .sale-discount-number { font-size: 37px; }
          .sale-live-eyebrow { font-size: 8px; letter-spacing: 3px; }
          .sale-live-title { font-size: 39px; }
          .sale-live-description { max-width: 330px; font-size: 10px; }

          .sale-products-section { padding: 24px 0 42px; }
          .sale-product-count { font-size: 10px; }
          .sale-sort { font-size: 10px; }
          .sale-sort-select { height: 30px; padding: 0 10px; font-size: 9px; }
          .sale-products-head { margin-bottom: 15px; }
          .sale-products-grid { gap: 10px; }

          .sale-card { border-radius: 13px; }
          .sale-card-body { padding: 9px; }
          .sale-card-name { font-size: 16px; height: 20px; line-height: 20px; }
          .sale-card-unit { height: 14px; line-height: 14px; margin: 3px 0 8px; font-size: 7.5px; letter-spacing: 1px; gap: 6px; }

          .sale-specs { height: 34px; margin-bottom: 8px; border-radius: 8px; }
          .sale-spec { padding: 0 6px; gap: 2px; }
          .sale-spec-label { font-size: 6.5px; }
          .sale-spec-value { font-size: 8.5px; }

          .sale-options { gap: 7px; margin-bottom: 8px; }
          .sale-slot-meter { height: 68px; }
          .sale-slot-color { height: 38px; }
          .sale-slot-size { height: 42px; }

          .sale-colors-label { font-size: 8px; letter-spacing: 1px; }
          .sale-selected-option { font-size: 9px; }
          .sale-swatches { gap: 7px; padding: 3px 2px; }
          .sale-swatch { width: 16px; height: 16px; }
          .sale-size-options { gap: 5px; }
          .sale-size-button { min-width: 28px; height: 22px; padding: 0 7px; font-size: 9px; }

          .sale-meter-box { padding: 6px 8px; border-radius: 10px; }
          .sale-meter-control { grid-template-columns: 24px 1fr 24px; gap: 5px; }
          .sale-meter-control button { width: 24px; height: 24px; }
          .sale-meter-control strong { font-size: 12px; }
          .sale-meter-range { font-size: 8px; }

          .sale-cart-message { font-size: 9px; padding: 5px 7px; }

          .sale-price-row { height: 30px; padding-top: 7px; gap: 5px; margin-bottom: 8px; }
          .sale-new-price { font-size: 20px; }
          .sale-old-price { font-size: 10px; }
          .sale-price-unit { font-size: 8.5px; }

          .sale-actions { gap: 5px; }
          .sale-actions, .sale-action-button, .sale-cart-controls { height: 34px; }
          .sale-action-button { font-size: 8.5px; padding: 0 3px; gap: 3px; }

          .sale-cart-controls { grid-template-columns: 22px minmax(14px, 1fr) 22px 24px; gap: 1px; }
          .sale-cart-qty-button { width: 22px; height: 22px; }
          .sale-cart-remove-button { width: 24px; height: 22px; padding-left: 3px; }
          .sale-cart-qty-number { font-size: 9.5px; }

          .sale-discount-badge { top: 8px; left: 8px; height: 22px; padding: 0 8px; font-size: 8.5px; }
          .sale-save { top: 7px; right: 7px; width: 28px; height: 28px; }

          .sale-pagination { margin-top: 26px; gap: 6px; }
          .sale-page-button { width: 32px; height: 32px; }

          .sale-foot-decor { min-height: 55px; }
          .sale-foot-text { font-size: 7px; max-width: 125px; }
          .sale-foot-right { font-size: 15px; max-width: 120px; }
        }

        @media (max-width: 380px) {
          .sale-hero { min-height: 570px; }
          .sale-hero-title { font-size: 38px; }
          .sale-hero-subtitle { font-size: 10px; }
          .sale-count-box { height: 60px; }
          .sale-count-number { font-size: 20px; }
          .sale-notify-button { min-width: 140px; }
          .sale-live-title { font-size: 35px; }

          .sale-products-grid { gap: 8px; }
          .sale-card-body { padding: 8px; }
          .sale-card-name { font-size: 15px; }
          .sale-new-price { font-size: 18px; }
          .sale-action-button { font-size: 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .sale-card,
          .sale-card-image img,
          .sale-action-state,
          .sale-notify-icon,
          .sale-cart-controls,
          .sale-cart-message,
          .skeleton-box,
          .skeleton-line {
            animation: none !important;
            transition: none !important;
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
              ? saleTitle
                ? `${saleTitle} is Live`
                : "Sale is Live"
              : saleTitle
              ? `${saleTitle} is Coming Soon`
              : "Sale is Coming Soon"}
          </h1>

          <p className="sale-hero-subtitle">
            {saleMode === "live"
              ? "Premium fabrics. Timeless designs. Special prices are now live."
              : "Premium fabrics. Timeless designs. Bigger savings ahead."}
          </p>

          {/* COUNTDOWN */}
          {saleMode === "countdown" && saleEndDate && !countdown.finished && (
            <div className="sale-countdown">
              {[
                ["days", "Days"],
                ["hours", "Hours"],
                ["minutes", "Minutes"],
                ["seconds", "Seconds"],
              ].map(([key, label]) => (
                <div className="sale-count-box" key={key}>
                  <span className="sale-count-number">
                    {countdown.mounted
                      ? String(countdown[key]).padStart(2, "0")
                      : "00"}
                  </span>
                  <span className="sale-count-label">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* NOTIFY */}
          {saleMode === "countdown" && saleEndDate && !countdown.finished && (
            <div className="sale-notify-row">
              <button
                type="button"
                className="sale-notify-button"
                onClick={handleNotifyClick}
                disabled={
                  notifyStatus === "loading" ||
                  notifyStatus === "success" ||
                  notifyStatus === "already"
                }
                style={{
                  opacity: notifyStatus === "loading" ? 0.8 : 1,
                  background:
                    notifyStatus === "success"
                      ? "#1a7a45"
                      : notifyStatus === "already"
                      ? "#4a5c60"
                      : notifyStatus === "login-required"
                      ? "#7a5c3d"
                      : notifyStatus === "error"
                      ? "#b83c30"
                      : undefined,
                  cursor: notifyStatus === "already" ? "default" : undefined,
                }}
              >
                {notifyStatus === "loading" ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: "2px solid rgba(255,255,255,0.45)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                        flexShrink: 0,
                      }}
                    />
                    Subscribing…
                  </>
                ) : notifyStatus === "success" ? (
                  <>✓ You&apos;re on the list!</>
                ) : notifyStatus === "already" ? (
                  <>✓ Already Subscribed</>
                ) : (
                  <>
                    <span className="sale-notify-icon">
                      <Bell size={15} />
                    </span>
                    Notify Me
                  </>
                )}
              </button>

              <span className="sale-notify-copy">
                {notifyStatus === "login-required" ? (
                  <span style={{ color: "#7a5c3d", fontWeight: 600 }}>
                    {notifyMsg}
                  </span>
                ) : notifyStatus === "error" ? (
                  <span style={{ color: "#b83c30", fontWeight: 600 }}>
                    {notifyMsg}
                  </span>
                ) : notifyStatus === "success" ? (
                  <span style={{ color: "#1a7a45", fontWeight: 600 }}>
                    {notifyMsg}
                  </span>
                ) : notifyStatus === "already" ? (
                  <span style={{ color: "#4a5c60" }}>
                    You&apos;ll be notified
                    <br />
                    when the sale goes live!
                  </span>
                ) : (
                  <>
                    Be the first to know
                    <br />
                    when the sale goes live!
                  </>
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
            <div className="sale-discount-circle">
              <span className="sale-discount-small">UP TO</span>
              <span className="sale-discount-number">50%</span>
              <span className="sale-discount-off">OFF</span>
            </div>

            <div className="sale-live-copy">
              <p className="sale-live-eyebrow">
                {saleTitle ? saleTitle.toUpperCase() : "SPECIAL OFFER"}
              </p>

              <h2 className="sale-live-title">
                {saleTitle ? `${saleTitle} is Live` : "Sale is Live"}
              </h2>

              <p className="sale-live-description">
                Shop premium fabrics at unbeatable prices. Limited time only!
              </p>
            </div>

            <div className="sale-benefits">
              <div className="sale-benefit">
                <ShoppingCart size={22} strokeWidth={1.5} />
                <span className="sale-benefit-title">
                  Worldwide
                  <br />
                  Shipping
                </span>
              </div>

              <div className="sale-benefit">
                <Check size={22} strokeWidth={1.8} />
                <span className="sale-benefit-title">
                  Secure
                  <br />
                  Payments
                </span>
              </div>

              <div className="sale-benefit">
                <Heart size={22} strokeWidth={1.5} />
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
                <span>Sort by:</span>

                <select className="sale-sort-select" defaultValue="newest">
                  <option value="newest">Newest First</option>
                  <option value="discount">Biggest Discount</option>
                  <option value="price">Price Low to High</option>
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
                  const cartState = cartStates[product.id] || "idle";
                  const isProductSavedState = isProductSaved(product.id);
                  const isBuying = buyingProduct === product.id;

                  const selectedColor = getSelectedColor(product);
                  const selectedSize = getSelectedSize(product);
                  const selectedVariant = getSelectedVariant(product);
                  const selectedColorImages = selectedColor?.images || [];

                  const image =
                    selectedVariant?.images?.[0] ||
                    selectedColorImages?.[0] ||
                    product.images?.[0] ||
                    "/images/home/products/1.png";

                  const secondImage =
                    selectedVariant?.images?.[1] ||
                    selectedColorImages?.[1] ||
                    product.images?.find((entry) => entry !== image) ||
                    "";

                  const displayPricing = getDisplayPricing(product);
                  const availableSizes = getAvailableSizes(product);
                  const selectedMeter = getSelectedMeters(product);
                  const meterConfig = getMeterConfig(product);
                  const isMeter = product?.sellingMode === "meter";
                  const cardMessage = cartMessages[String(product.id)] || "";

                  const cartItem = getCartItemForProduct(product);
                  const cartQuantity = Math.max(
                    1,
                    Number(cartItem?.quantity || 1)
                  );
                  const cartBusy =
                    cartState === "loading" ||
                    cartState === "updating" ||
                    cartState === "removing";

                  return (
                    <article key={product.id} className="sale-card">
                      {/* ---------- IMAGE ---------- */}
                      <div className="sale-card-image">
                        <Link href={`/products/${product.slug}`}>
                          <img src={image} alt={product.name} loading="lazy" />
                        </Link>

                        {secondImage ? (
                          <Link
                            href={`/products/${product.slug}`}
                            className="sale-card-second-image"
                            aria-hidden="true"
                            tabIndex={-1}
                          >
                            <img src={secondImage} alt="" loading="lazy" />
                          </Link>
                        ) : null}

                        {displayPricing.discount > 0 ? (
                          <span className="sale-discount-badge">
                            {displayPricing.discount}% OFF
                          </span>
                        ) : null}

                        <button
                          type="button"
                          className={`sale-save ${
                            isProductSavedState ? "is-saved" : ""
                          }`}
                          onClick={() => toggleSave(product.id)}
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
                            fill={isProductSavedState ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      {/* ---------- BODY ---------- */}
                      <div className="sale-card-body">
                        <Link
                          href={`/products/${product.slug}`}
                          className="sale-card-name"
                          title={product.name}
                        >
                          {product.name}
                        </Link>

                        <div className="sale-card-unit">
                          {isMeter ? "Price per Meter" : "Price per Piece"}
                        </div>

                        {/* ---------- SPECS (backend: gsm / width / material) ---------- */}
                        {showSpecs ? (
                          <div className="sale-specs">
                            <div className="sale-spec">
                              <span className="sale-spec-label">GSM</span>
                              <span className="sale-spec-value">{product.gsm}</span>
                            </div>
                            <div className="sale-spec">
                              <span className="sale-spec-label">Width</span>
                              <span className="sale-spec-value">{product.width}</span>
                            </div>
                            <div className="sale-spec">
                              <span className="sale-spec-label">Material</span>
                              <span
                                className="sale-spec-value"
                                title={String(product.composition)}
                              >
                                {product.composition}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {/* ---------- OPTIONS: meter + colour + size ---------- */}
                        <div className="sale-options">
                          {showMeterSlot ? (
                            <div className="sale-slot sale-slot-meter">
                              {isMeter ? (
                                <div className="sale-meter-box">
                                  <div className="sale-variant-header">
                                    <span className="sale-colors-label">
                                      Quantity
                                    </span>
                                    <span className="sale-selected-option">
                                      {formatMeterValue(selectedMeter)} m
                                    </span>
                                  </div>

                                  <div className="sale-meter-control">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setMeterQuantity(
                                          product,
                                          selectedMeter - meterConfig.step
                                        )
                                      }
                                      disabled={selectedMeter <= meterConfig.min}
                                      aria-label="Decrease meters"
                                    >
                                      <Minus size={13} />
                                    </button>

                                    <strong>
                                      {formatMeterValue(selectedMeter)} m
                                    </strong>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setMeterQuantity(
                                          product,
                                          selectedMeter + meterConfig.step
                                        )
                                      }
                                      disabled={selectedMeter >= meterConfig.max}
                                      aria-label="Increase meters"
                                    >
                                      <Plus size={13} />
                                    </button>
                                  </div>

                                  <div className="sale-meter-range">
                                    {formatMeterValue(meterConfig.min)}–
                                    {formatMeterValue(meterConfig.max)} m · step{" "}
                                    {formatMeterValue(meterConfig.step)} m
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {showColorSlot ? (
                            <div className="sale-slot sale-slot-color">
                              {product.colorOptions?.length > 0 ? (
                                <div className="sale-variant-group">
                                  <div className="sale-variant-header">
                                    <span className="sale-colors-label">
                                      Color
                                    </span>
                                    <span className="sale-selected-option">
                                      {selectedColor?.name || "Select"}
                                    </span>
                                  </div>

                                  <div className="sale-swatches">
                                    {product.colorOptions
                                      .slice(0, 6)
                                      .map((color, index) => {
                                        const active = sameOption(
                                          selectedColor,
                                          color
                                        );

                                        return (
                                          <button
                                            key={`${product.id}-color-${index}`}
                                            type="button"
                                            className={`sale-swatch sale-swatch-button ${
                                              active ? "is-selected" : ""
                                            }`}
                                            style={{
                                              backgroundColor:
                                                color.hex ||
                                                color.value ||
                                                color.name ||
                                                "#D9D9D9",
                                            }}
                                            onClick={() =>
                                              handleSelectColor(product, color)
                                            }
                                            title={color.name || color.value}
                                            aria-label={`Select ${
                                              color.name || color.value
                                            }`}
                                            aria-pressed={active}
                                          >
                                            {active ? (
                                              <Check size={10} strokeWidth={3} />
                                            ) : null}
                                          </button>
                                        );
                                      })}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : null}

                          {showSizeSlot ? (
                            <div className="sale-slot sale-slot-size">
                              {!isMeter && product.sizeOptions?.length > 0 ? (
                                <div className="sale-variant-group">
                                  <div className="sale-variant-header">
                                    <span className="sale-colors-label">
                                      Size
                                    </span>
                                    <span className="sale-selected-option">
                                      {selectedSize?.name || "Select"}
                                    </span>
                                  </div>

                                  <div className="sale-size-options">
                                    {availableSizes.map((size, index) => {
                                      const active = sameOption(
                                        selectedSize,
                                        size
                                      );

                                      return (
                                        <button
                                          key={`${product.id}-size-${index}`}
                                          type="button"
                                          className={`sale-size-button ${
                                            active ? "is-selected" : ""
                                          }`}
                                          onClick={() =>
                                            handleSelectSize(product, size)
                                          }
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
                          ) : null}

                          {cardMessage ? (
                            <div className="sale-cart-message" role="alert">
                              {cardMessage}
                            </div>
                          ) : null}
                        </div>

                        {/* ---------- PRICE ---------- */}
                        <div className="sale-price-row">
                          <span className="sale-new-price">
                            ₹{formatNumber(displayPricing.sale)}
                          </span>

                          {displayPricing.original > displayPricing.sale ? (
                            <span className="sale-old-price">
                              ₹{formatNumber(displayPricing.original)}
                            </span>
                          ) : null}

                          <span className="sale-price-unit">
                            / {isMeter ? "Meter" : "Piece"}
                          </span>
                        </div>

                        {/* ---------- ACTIONS ---------- */}
                        <div className="sale-actions">
                          <button
                            type="button"
                            className={`sale-action-button sale-buy-button ${
                              isBuying ? "sale-button-added" : ""
                            }`}
                            onClick={() => handleBuyNow(product.id)}
                            disabled={isBuying}
                          >
                            <span className="sale-action-stage">
                              {isBuying ? (
                                <span
                                  className="sale-action-state sale-action-state-enter"
                                  key="buying"
                                >
                                  <Zap size={13} strokeWidth={2.2} />
                                  <span>Opening...</span>
                                </span>
                              ) : (
                                <span
                                  className="sale-action-state sale-action-state-enter"
                                  key="buy"
                                >
                                  <Zap size={13} strokeWidth={2.2} />
                                  <span>Buy Now</span>
                                </span>
                              )}
                            </span>
                          </button>

                          {cartItem ? (
                            <div
                              className={`sale-cart-controls ${
                                cartState === "removing" ? "is-removing" : ""
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
                                  cartQuantity <=
                                    (isMeter ? meterConfig.min : 1)
                                }
                                aria-label="Decrease quantity"
                              >
                                <Minus size={12} />
                              </button>

                              <span className="sale-cart-qty-number">
                                {isMeter
                                  ? `${formatMeterValue(cartQuantity)} m`
                                  : cartQuantity}
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
                                <Plus size={12} />
                              </button>

                              <button
                                type="button"
                                className="sale-cart-remove-button"
                                onClick={() => handleRemoveFromCart(product)}
                                disabled={cartBusy}
                                aria-label="Remove from cart"
                                title="Remove from cart"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className={`sale-action-button sale-cart-button ${
                                cartState === "added" ? "sale-button-added" : ""
                              }`}
                              onClick={() => handleVariantCartAdd(product)}
                              disabled={cartBusy}
                            >
                              <span className="sale-action-stage">
                                {cartState === "added" ? (
                                  <span
                                    className="sale-action-state sale-action-state-enter"
                                    key="added"
                                  >
                                    <Check size={13} strokeWidth={2.7} />
                                    <span>Added</span>
                                  </span>
                                ) : cartState === "loading" ? (
                                  <span
                                    className="sale-action-state sale-action-state-enter"
                                    key="loading"
                                  >
                                    <ShoppingCart size={13} strokeWidth={2} />
                                    <span>Adding...</span>
                                  </span>
                                ) : (
                                  <span
                                    className="sale-action-state sale-action-state-enter"
                                    key="idle"
                                  >
                                    <ShoppingCart size={13} strokeWidth={2} />
                                    <span>Add to Cart</span>
                                  </span>
                                )}
                              </span>
                            </button>
                          )}
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

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="sale-pagination">
                <button
                  type="button"
                  className="sale-page-button"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      className={`sale-page-button ${
                        page === safePage ? "active" : ""
                      }`}
                      onClick={() => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="sale-page-button"
                  disabled={safePage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* BOTTOM DECOR */}
            <div className="sale-foot-decor">
              <span className="sale-foot-text">
                FABRICS
                <br />
                THAT FEEL LIKE HOME
              </span>

              <span className="sale-foot-right">
                Crafted for
                <br />a Brighter Tomorrow
              </span>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}