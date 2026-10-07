"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BadgePercent,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Package,
  Search,
  Settings2,
  TimerReset,
  XCircle,
  Save,
  Loader2,
  Power,
  RefreshCw,
  ChevronDown,
  Upload,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api"
).replace(/\/$/, "");

/* =========================================================
   HELPERS
========================================================= */

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

  if (
    Array.isArray(
      payload?.data?.products
    )
  ) {
    return payload.data.products;
  }

  return [];
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
    value?.imageUrl ||
    ""
  );
}

function getProductImage(product) {
  return (
    imageValue(
      product?.mainImage
    ) ||
    imageValue(
      product?.image
    ) ||
    imageValue(
      product?.gallery?.[0]
    ) ||
    "/images/home/products/1.png"
  );
}

function getProductCategory(product) {
  if (
    product?.category &&
    typeof product.category ===
      "object"
  ) {
    return (
      product.category.name ||
      product.category.label ||
      "—"
    );
  }

  return "—";
}

function getProductPrice(product) {
  const salePrice =
    Number(
      product?.pricing?.salePrice
    );

  const regularPrice =
    Number(
      product?.pricing?.regularPrice
    );

  if (
    salePrice > 0 &&
    salePrice < regularPrice
  ) {
    return {
      sale: salePrice,
      regular: regularPrice,
      hasSale: true,
    };
  }

  return {
    sale: regularPrice,
    regular: regularPrice,
    hasSale: false,
  };
}

/*
 * MongoDB ISO date -> datetime-local value
 * Example:
 * 2026-09-30T18:30:00
 */
function toLocalDateTimeInput(
  value
) {
  if (!value) {
    return "";
  }

  const date = new Date(
    value
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(
      2,
      "0"
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
}

/*
 * datetime-local -> ISO
 */
function localInputToISO(
  value
) {
  if (!value) {
    return null;
  }

  const date = new Date(
    value
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}

function formatNumber(
  value
) {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN"
  );
}

/* =========================================================
   TIMER DISPLAY
========================================================= */

function CountdownBox({
  targetDate,
}) {
  const [remaining, setRemaining] =
    useState(0);

  useEffect(() => {
    const update = () => {
      if (!targetDate) {
        setRemaining(0);
        return;
      }

      const target =
        new Date(
          targetDate
        ).getTime();

      const now =
        Date.now();

      setRemaining(
        Math.max(
          0,
          Math.ceil(
            (target - now) /
              1000
          )
        )
      );
    };

    update();

    const interval =
      window.setInterval(
        update,
        1000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [targetDate]);

  const days = Math.floor(
    remaining / 86400
  );

  const hours = Math.floor(
    (remaining % 86400) /
      3600
  );

  const minutes = Math.floor(
    (remaining % 3600) /
      60
  );

  const seconds =
    remaining % 60;

  const unit = (
    value,
    label
  ) => (
    <div className="timer-unit">
      <strong>
        {String(
          value
        ).padStart(2, "0")}
      </strong>

      <span>{label}</span>
    </div>
  );

  return (
    <div className="countdown-preview">
      {unit(days, "Days")}
      <span className="timer-separator">
        :
      </span>
      {unit(hours, "Hours")}
      <span className="timer-separator">
        :
      </span>
      {unit(minutes, "Min")}
      <span className="timer-separator">
        :
      </span>
      {unit(seconds, "Sec")}
    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  state,
  count,
}) {
  if (state === "live") {
    return (
      <div className="status-card live">
        <div className="status-icon">
          <CheckCircle2
            size={19}
          />
        </div>

        <div>
          <span className="status-kicker">
            SALE STATUS
          </span>

          <strong>
            SALE IS LIVE
          </strong>

          <p>
            {count} sale{" "}
            {count === 1
              ? "product"
              : "products"}{" "}
            currently active.
          </p>
        </div>
      </div>
    );
  }

  if (
    state ===
    "countdown"
  ) {
    return (
      <div className="status-card countdown">
        <div className="status-icon">
          <Clock3
            size={19}
          />
        </div>

        <div>
          <span className="status-kicker">
            SALE STATUS
          </span>

          <strong>
            COUNTDOWN ACTIVE
          </strong>

          <p>
            Waiting for sale
            products to go live.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="status-card empty">
      <div className="status-icon">
        <XCircle
          size={19}
        />
      </div>

      <div>
        <span className="status-kicker">
          SALE STATUS
        </span>

        <strong>
          SALE INACTIVE
        </strong>

        <p>
          No active sale
          products or countdown.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT ROW
========================================================= */

function ProductRow({
  product,
  onToggle,
  updatingId,
  selected,
  onSelect,
}) {
  const prices =
    getProductPrice(
      product
    );

  const image =
    getProductImage(
      product
    );

  const saleActive =
    Boolean(
      product?.showOnSale
    );

  return (
    <div className="sale-product-row">

      <div style={{ width: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <input
          type="checkbox"
          checked={Boolean(selected)}
          onChange={(event) =>
            onSelect(product?._id, event.target.checked)
          }
          aria-label={`Select ${product?.title || "product"}`}
        />
      </div>

      <div className="sale-product-main">

        <div className="sale-product-image">
          <img
            src={image}
            alt={
              product?.title ||
              "Product"
            }
          />
        </div>

        <div className="sale-product-info">

          <strong className="sale-product-title">
            {
              product?.title ||
              "Untitled Product"
            }
          </strong>

          <span className="sale-product-meta">
            {product?.sku
              ? `SKU: ${product.sku}`
              : "No SKU"}

            <span className="meta-dot">
              •
            </span>

            {
              getProductCategory(
                product
              )
            }
          </span>

        </div>

      </div>

      <div className="sale-price-block">

        {prices.hasSale ? (
          <>
            <strong>
              ₹
              {formatNumber(
                prices.sale
              )}
            </strong>

            <span>
              ₹
              {formatNumber(
                prices.regular
              )}
            </span>
          </>
        ) : (
          <strong>
            ₹
            {formatNumber(
              prices.regular
            )}
          </strong>
        )}

      </div>

      <div className="sale-product-status">

        {saleActive ? (
          <span className="active-label">
            Active
          </span>
        ) : (
          <span className="inactive-label">
            Inactive
          </span>
        )}

      </div>

      <div className="sale-product-action">

        {updatingId ===
        product._id ? (
          <span className="toggle-loading">
            <Loader2
              size={15}
              className="spin"
            />
          </span>
        ) : (
          <button
            type="button"
            className={`sale-toggle ${
              saleActive
                ? "is-on"
                : ""
            }`}
            onClick={() =>
              onToggle(
                product,
                !saleActive
              )
            }
            title={
              saleActive
                ? "Remove from Sale"
                : "Add to Sale"
            }
            aria-pressed={
              saleActive
            }
          >
            <span />
          </button>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function SaleAdminPage() {
  /* =======================================================
     STATE
  ======================================================= */

  const [settings, setSettings] =
    useState({
      countdownEnabled: false,
      countdownDate: "",
      desktopHeroImage: "",
      mobileHeroImage: "",
      notifyMessageType: "auto",
      notifyMessage: "",
      saleTitle: "",
    });

  const [saleState, setSaleState] =
    useState({
      state: "empty",
      isLive: false,
      hasProducts: false,
      productCount: 0,
      countdownActive: false,
      countdownDate: null,
      remainingSeconds: 0,
      serverTime: null,
    });

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [savingSettings, setSavingSettings] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState("");

  const [selectedProductIds, setSelectedProductIds] =
    useState([]);

  const [bulkDiscount, setBulkDiscount] =
    useState("");

  const [bulkDuration, setBulkDuration] =
    useState("3");

  const [bulkWorking, setBulkWorking] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showAllProducts, setShowAllProducts] =
    useState(false);

  const PRODUCTS_PER_PAGE = 8;

  const [currentPage, setCurrentPage] =
    useState(1);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* notify / subscriber state */
  const [subscribers, setSubscribers] =
    useState({ total: 0, notified: 0, pending: 0 });

  const [blasting, setBlasting] =
    useState(false);

  const [sendOnSave, setSendOnSave] =
    useState(false);

  /* =======================================================
     SUCCESS
  ======================================================= */

  const showSuccess =
    (message) => {
      setSuccess(message);

      window.setTimeout(
        () => {
          setSuccess("");
        },
        2500
      );
    };

  /* =======================================================
     LOAD EVERYTHING
  ======================================================= */

  const loadSaleAdmin =
    async (
      showLoader = true
    ) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const [
          adminResponse,
          catalogResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/sale/admin`,
            {
              method: "GET",
              credentials:
                "include",
              cache:
                "no-store",
            }
          ),

          fetch(
            `${API_URL}/sale/admin/catalog`,
            {
              method: "GET",
              credentials:
                "include",
              cache:
                "no-store",
            }
          ),
        ]);

        let adminData = {};
        let catalogData = {};

        try {
          adminData =
            await adminResponse.json();
        } catch {
          adminData = {};
        }

        try {
          catalogData =
            await catalogResponse.json();
        } catch {
          catalogData = {};
        }

        if (
          !adminResponse.ok ||
          !adminData.success
        ) {
          throw new Error(
            adminData?.message ||
              "Failed to load sale settings."
          );
        }

        if (
          !catalogResponse.ok ||
          !catalogData.success
        ) {
          throw new Error(
            catalogData?.message ||
              "Failed to load sale products."
          );
        }

        setSettings({
          countdownEnabled:
            Boolean(
              adminData?.settings
                ?.countdownEnabled
            ),

          countdownDate:
            toLocalDateTimeInput(
              adminData?.settings
                ?.countdownDate
            ),

          desktopHeroImage:
            adminData?.settings
              ?.desktopHeroImage ||
            "",

          mobileHeroImage:
            adminData?.settings
              ?.mobileHeroImage ||
            "",

          notifyMessageType:
            adminData?.settings?.notifyMessageType || "auto",

          notifyMessage:
            adminData?.settings?.notifyMessage || "",

          saleTitle:
            adminData?.settings?.saleTitle || "",
        });

        /* subscriber stats */
        if (adminData?.subscribers) {
          setSubscribers(adminData.subscribers);
        }

        /* restore sendOnSave from saved setting */
        if (typeof adminData?.settings?.autoBlastOnExpiry === "boolean") {
          setSendOnSave(adminData.settings.autoBlastOnExpiry);
        }

        setSaleState({
          state:
            adminData?.sale
              ?.state ||
            "empty",

          isLive:
            Boolean(
              adminData?.sale
                ?.isLive
            ),

          hasProducts:
            Boolean(
              adminData?.sale
                ?.hasProducts
            ),

          productCount:
            Number(
              adminData?.sale
                ?.productCount ||
                0
            ),

          countdownActive:
            Boolean(
              adminData?.sale
                ?.countdownActive
            ),

          countdownDate:
            adminData?.sale
              ?.countdownDate ||
            null,

          remainingSeconds:
            Number(
              adminData?.sale
                ?.remainingSeconds ||
                0
            ),

          serverTime:
            adminData?.sale
              ?.serverTime ||
            null,
        });

        setProducts(
          extractProducts(
            catalogData
          )
        );
      } catch (loadError) {
        console.error(
          "Sale admin load error:",
          loadError
        );

        setError(
          loadError?.message ||
            "Failed to load sale admin."
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadSaleAdmin(true);
  }, []);

  /* =======================================================
     FILTERED PRODUCTS
  ======================================================= */

  const filteredProducts =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      let list =
        products;

      if (!showAllProducts) {
        list =
          products.filter(
            (product) =>
              product?.showOnSale ===
              true
          );
      }

      if (!keyword) {
        return list;
      }

      return list.filter(
        (product) => {
          const title =
            String(
              product?.title ||
                ""
            ).toLowerCase();

          const sku =
            String(
              product?.sku ||
                ""
            ).toLowerCase();

          return (
            title.includes(
              keyword
            ) ||
            sku.includes(
              keyword
            )
          );
        }
      );
    }, [
      products,
      search,
      showAllProducts,
    ]);

  /* =======================================================
     PRODUCT PAGINATION
  ======================================================= */

  const totalProductPages =
    Math.max(
      1,
      Math.ceil(
        filteredProducts.length /
          PRODUCTS_PER_PAGE
      )
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    showAllProducts,
  ]);

  useEffect(() => {
    if (
      currentPage >
      totalProductPages
    ) {
      setCurrentPage(
        totalProductPages
      );
    }
  }, [
    currentPage,
    totalProductPages,
  ]);

  const paginatedProducts =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PRODUCTS_PER_PAGE;

      return filteredProducts.slice(
        start,
        start +
          PRODUCTS_PER_PAGE
      );
    }, [
      filteredProducts,
      currentPage,
    ]);

  const paginationStart =
    filteredProducts.length === 0
      ? 0
      : (currentPage - 1) *
          PRODUCTS_PER_PAGE +
        1;

  const paginationEnd =
    Math.min(
      currentPage *
        PRODUCTS_PER_PAGE,
      filteredProducts.length
    );

  const visiblePageNumbers =
    useMemo(() => {
      const pages = [];

      const start = Math.max(
        1,
        Math.min(
          currentPage - 2,
          totalProductPages - 4
        )
      );

      const end = Math.min(
        totalProductPages,
        start + 4
      );

      for (
        let page = start;
        page <= end;
        page += 1
      ) {
        pages.push(page);
      }

      return pages;
    }, [
      currentPage,
      totalProductPages,
    ]);

  /* =======================================================
     ACTIVE PRODUCTS
  ======================================================= */

  const activeProducts =
    useMemo(() => {
      return products.filter(
        (product) =>
          product?.showOnSale ===
          true
      );
    }, [products]);

  /* =======================================================
     SAVE TIMER SETTINGS
  ======================================================= */

  const uploadSaleHeroImage = async (
    file,
    type = "sale"
  ) => {
    if (!file) {
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("filename", file.name);

    const response = await fetch(
      `${API_URL}/uploads/direct`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data?.message || "Image upload failed"
      );
    }

    return (
      data?.upload?.url ||
      data?.url ||
      data?.imageUrl ||
      data?.upload?.imageUrl ||
      ""
    );
  };

  const handleSaleHeroUpload = async (
    event,
    which
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setSavingSettings(true);
      setError("");

      const uploadedUrl = await uploadSaleHeroImage(
        file,
        "sale"
      );

      if (!uploadedUrl) {
        throw new Error("Sale image upload failed.");
      }

      setSettings((current) => ({
        ...current,
        [which]: uploadedUrl,
      }));

      showSuccess(
        which === "desktopHeroImage"
          ? "Desktop sale hero image uploaded."
          : "Mobile sale hero image uploaded."
      );
    } catch (uploadError) {
      setError(
        uploadError?.message ||
          "Failed to upload sale hero image."
      );
    } finally {
      setSavingSettings(false);
      event.target.value = "";
    }
  };

  const saveSettings =
    async (overrides = {}) => {
      const nextSettings = {
        ...settings,
        ...overrides,
      };

      if (
        nextSettings.countdownEnabled &&
        !nextSettings.countdownDate
      ) {
        setError(
          "Please select a countdown date and time."
        );

        return false;
      }

      const isoDate =
        localInputToISO(
          nextSettings.countdownDate
        );

      if (
        nextSettings.countdownEnabled &&
        !isoDate
      ) {
        setError(
          "Please enter a valid countdown date and time."
        );

        return false;
      }

      if (
        nextSettings.countdownEnabled &&
        new Date(
          isoDate
        ).getTime() <=
          Date.now()
      ) {
        setError(
          "Countdown date/time must be in the future."
        );

        return false;
      }

      setSavingSettings(
        true
      );

      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/sale/admin/settings`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                countdownEnabled:
                  Boolean(
                    nextSettings.countdownEnabled
                  ),

                countdownDate:
                  isoDate,

                desktopHeroImage:
                  nextSettings.desktopHeroImage ||
                  "",

                mobileHeroImage:
                  nextSettings.mobileHeroImage ||
                  "",

                notifyMessageType:
                  nextSettings.notifyMessageType || "auto",

                notifyMessage:
                  nextSettings.notifyMessage || "",

                saleTitle:
                  nextSettings.saleTitle || "",

                sendNotifyNow:
                  Boolean(sendOnSave),
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
              "Failed to save sale settings."
          );
        }

        setSettings(
          nextSettings
        );

        const removedDesktop =
          Object.prototype.hasOwnProperty.call(
            overrides,
            "desktopHeroImage"
          ) &&
          !nextSettings.desktopHeroImage;

        const removedMobile =
          Object.prototype.hasOwnProperty.call(
            overrides,
            "mobileHeroImage"
          ) &&
          !nextSettings.mobileHeroImage;

        if (removedDesktop) {
          showSuccess(
            "Desktop hero image removed."
          );
        } else if (removedMobile) {
          showSuccess(
            "Mobile hero image removed."
          );
        } else {
          const blastInfo   = data?.blast;
          const wasReset    = data?.subscribersReset;
          showSuccess(
            wasReset
              ? `New sale created${blastInfo ? ` & email sent to ${blastInfo.sent} subscriber${blastInfo.sent !== 1 ? "s" : ""}` : ""}. Subscribers reset for fresh signups.`
              : blastInfo
              ? `Sale settings saved. Email sent to ${blastInfo.sent} subscriber${blastInfo.sent !== 1 ? "s" : ""}.`
              : "Sale countdown settings saved."
          );
          setSendOnSave(false);
        }

        await loadSaleAdmin(
          false
        );

        return true;
      } catch (saveError) {
        setError(
          saveError?.message ||
            "Failed to save sale settings."
        );

        return false;
      } finally {
        setSavingSettings(
          false
        );
      }
    };

  const removeSaleHeroImage =
    async (which) => {
      const imageUrl =
        settings?.[which];

      if (!imageUrl) {
        return;
      }

      const label =
        which === "desktopHeroImage"
          ? "desktop"
          : "mobile";

      const confirmed =
        window.confirm(
          `Remove the ${label} sale hero image?`
        );

      if (!confirmed) {
        return;
      }

      await saveSettings({
        [which]: "",
      });
    };

  /* =======================================================
     MANUAL BLAST
  ======================================================= */

  const sendManualBlast = async (emailType) => {
    if (blasting) return;
    setBlasting(true);
    setError("");
    try {
      const res  = await fetch(`${API_URL}/sale/admin/send-notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emailType }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message);
        await loadSaleAdmin(false);
      } else {
        setError(data.message || "Failed to send emails.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBlasting(false);
    }
  };

  /* =======================================================
     RESET SUBSCRIBERS
  ======================================================= */

  const [resetConfirm,  setResetConfirm]  = useState(false);
  const [resetting,     setResetting]     = useState(false);

  const resetSubscribers = async () => {
    setResetting(true);
    setError("");
    try {
      const res  = await fetch(`${API_URL}/sale/admin/reset-subscribers`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showSuccess(data.message);
        setResetConfirm(false);
        await loadSaleAdmin(false);
      } else {
        setError(data.message || "Reset failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResetting(false);
    }
  };

  /* =======================================================
     PRODUCT SALE TOGGLE
  ======================================================= */

  const toggleSaleProduct =
    async (
      product,
      value
    ) => {
      if (
        !product?._id ||
        updatingId
      ) {
        return;
      }

      const id =
        product._id;

      setUpdatingId(id);
      setError("");

      /*
       * Optimistic update
       */
      setProducts(
        (current) =>
          current.map(
            (item) =>
              item._id === id
                ? {
                    ...item,
                    showOnSale:
                      value,
                  }
                : item
          )
      );

      try {
        const response =
          await fetch(
            `${API_URL}/sale/admin/products/${id}`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "include",

              body: JSON.stringify({
                showOnSale:
                  value,
                ...(value
                  ? {
                      durationDays:
                        Number(bulkDuration || 3),
                      ...(bulkDiscount !== ""
                        ? {
                            discountPercent:
                              Number(bulkDiscount),
                          }
                        : {}),
                    }
                  : {}),
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
              "Failed to update sale product."
          );
        }

        showSuccess(
          value
            ? "Product added to Sale."
            : "Product removed from Sale."
        );

        /*
         * Refresh sale state.
         *
         * This automatically changes:
         * COUNTDOWN -> LIVE
         * LIVE -> COUNTDOWN/EMPTY
         */
        await loadSaleAdmin(
          false
        );
      } catch (toggleError) {
        /*
         * Rollback
         */
        setProducts(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                id
                  ? {
                      ...item,
                      showOnSale:
                        !value,
                    }
                  : item
            )
        );

        setError(
          toggleError?.message ||
            "Failed to update sale product."
        );
      } finally {
        setUpdatingId("");
      }
    };

  /* =======================================================
     BULK SALE MANAGEMENT
  ======================================================= */

  const toggleProductSelection = (id, checked) => {
    setSelectedProductIds((current) =>
      checked
        ? Array.from(new Set([...current, String(id)]))
        : current.filter((item) => item !== String(id))
    );
  };

  const selectAllVisible = (checked) => {
    const ids = filteredProducts.map((product) => String(product._id));
    setSelectedProductIds((current) =>
      checked
        ? Array.from(new Set([...current, ...ids]))
        : current.filter((id) => !ids.includes(id))
    );
  };

  const runBulkSale = async () => {
    if (!selectedProductIds.length || bulkWorking) return;

    setBulkWorking(true);
    setError("");

    try {
      const body = {
        productIds: selectedProductIds,
        durationDays: Number(bulkDuration || 3),
      };

      if (bulkDiscount !== "") {
        body.discountPercent = Number(bulkDiscount);
      }

      const response = await fetch(
        `${API_URL}/sale/admin/products/bulk-add`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Failed to add selected products to sale."
        );
      }

      setSelectedProductIds([]);
      showSuccess(data.message || "Selected products added to sale.");
      await loadSaleAdmin(false);
    } catch (bulkError) {
      setError(bulkError?.message || "Bulk sale failed.");
    } finally {
      setBulkWorking(false);
    }
  };

  const runBulkRemove = async () => {
    if (!selectedProductIds.length || bulkWorking) return;

    setBulkWorking(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/sale/admin/products/bulk-remove`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productIds: selectedProductIds,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Failed to remove selected products from sale."
        );
      }

      setSelectedProductIds([]);
      showSuccess(data.message || "Selected products removed from sale.");
      await loadSaleAdmin(false);
    } catch (bulkError) {
      setError(bulkError?.message || "Bulk remove failed.");
    } finally {
      setBulkWorking(false);
    }
  };

  const removeAllSaleProducts = async () => {
    if (bulkWorking) return;

    const confirmed = window.confirm(
      "Remove every currently active product from Sale?"
    );

    if (!confirmed) return;

    setBulkWorking(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/sale/admin/products/remove-all`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message || "Failed to remove all sale products."
        );
      }

      setSelectedProductIds([]);
      showSuccess(data.message || "All sale products removed.");
      await loadSaleAdmin(false);
    } catch (bulkError) {
      setError(bulkError?.message || "Remove all failed.");
    } finally {
      setBulkWorking(false);
    }
  };

  /* =======================================================
     CLEAR SEARCH
  ======================================================= */

  const clearSearch =
    () => {
      setSearch("");
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="sale-admin-page"
      style={{
        width: "100%",
        minWidth: 0,
        minHeight: "100dvh",
        boxSizing: "border-box",
        overflowX: "hidden",
        background: "#F7F3EF",
        color: "#2E2C29",
      }}
    >

      {/* ── Reset Confirm Modal ── */}
      {resetConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 8000,
          background: "rgba(10,22,24,0.62)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: "32px 28px",
            maxWidth: 420, width: "100%",
            boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: "#fff8e6", border: "1.5px solid #f5dfa0",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, flexShrink: 0,
              }}>
                🔄
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1c2f33" }}>
                  Reset All Subscriptions?
                </div>
                <div style={{ fontSize: 12, color: "#7a8a8c", marginTop: 2 }}>
                  This action cannot be undone
                </div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "#4a5c60", lineHeight: 1.7, margin: "0 0 8px" }}>
              This will reset <strong>{subscribers.total} subscriber{subscribers.total !== 1 ? "s" : ""}</strong> so they can re-subscribe for the next sale campaign.
            </p>
            <p style={{ fontSize: 12, color: "#9aabae", lineHeight: 1.6, margin: "0 0 22px" }}>
              Use this when a sale is complete and you want to start fresh for the next one.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setResetConfirm(false)}
                disabled={resetting}
                style={{
                  flex: 1, height: 42, borderRadius: 8,
                  border: "1.5px solid #e2dbd2", background: "#fff",
                  color: "#4a5c60", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={resetSubscribers}
                disabled={resetting}
                style={{
                  flex: 1, height: 42, borderRadius: 8, border: "none",
                  background: "#295C65", color: "#fff",
                  fontSize: 13, fontWeight: 700,
                  cursor: resetting ? "not-allowed" : "pointer",
                  opacity: resetting ? 0.7 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {resetting
                  ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Resetting…</>
                  : "Yes, Reset All"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="sale-page-header">

        <div>
          <div className="sale-breadcrumb">
            Admin
            <span>/</span>
            Sale
          </div>

          <h1>
            Sale
          </h1>

          <p>
            Manage sale products,
            countdown and live sale
            status.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={() =>
            loadSaleAdmin(
              true
            )
          }
          disabled={loading}
        >
          {loading ? (
            <Loader2
              size={14}
              className="spin"
            />
          ) : (
            <RefreshCw
              size={14}
            />
          )}

          Refresh
        </button>

      </div>

      {/* =================================================
          ALERTS
      ================================================= */}

      {error && (
        <div className="sale-alert sale-alert-error">
          <XCircle size={15} />
          <span>
            {error}
          </span>
        </div>
      )}

      {success && (
        <div className="sale-alert sale-alert-success">
          <CheckCircle2
            size={15}
          />
          <span>
            {success}
          </span>
        </div>
      )}

      {/* =================================================
          STATUS + TIMER
      ================================================= */}

      <div className="top-grid">

        {/* STATUS */}

        <StatusCard
          state={
            saleState.state
          }
          count={
            saleState.productCount
          }
        />

        {/* CURRENT COUNTDOWN */}

        <div className="timer-current-card">

          <div className="timer-card-top">

            <div>
              <span className="section-kicker">
                CURRENT COUNTDOWN
              </span>

              <strong>
                {saleState.countdownActive
                  ? "Timer Running"
                  : "Timer Not Running"}
              </strong>
            </div>

            <div
              className={`timer-status-pill ${
                saleState.countdownActive
                  ? "on"
                  : "off"
              }`}
            >
              <TimerReset
                size={12}
              />

              {saleState.countdownActive
                ? "ACTIVE"
                : "OFF"}
            </div>

          </div>

          {saleState.countdownActive &&
          saleState.countdownDate ? (
            <>
              <CountdownBox
                targetDate={
                  saleState.countdownDate
                }
              />

              <span className="timer-target">
                Ends on{" "}
                {new Date(
                  saleState.countdownDate
                ).toLocaleString(
                  "en-IN",
                  {
                    dateStyle:
                      "medium",
                    timeStyle:
                      "short",
                  }
                )}
              </span>
            </>
          ) : (
            <div className="timer-empty">
              <Clock3
                size={22}
              />

              <span>
                No active countdown.
              </span>
            </div>
          )}

        </div>

      </div>

      {/* =================================================
          SETTINGS
      ================================================= */}

      <section className="settings-card">

        <div className="settings-header">

          <div className="settings-title">

            <div className="settings-icon">
              <Settings2
                size={17}
              />
            </div>

            <div>
              <h2>
                Sale Countdown Settings
              </h2>

              <p>
                When there are no sale
                products, this countdown
                will be displayed on the
                public Sale page.
              </p>
            </div>

          </div>

          <div
            className={`settings-enabled-pill ${
              settings.countdownEnabled
                ? "enabled"
                : "disabled"
            }`}
          >
            <Power
              size={12}
            />

            {settings.countdownEnabled
              ? "Timer Enabled"
              : "Timer Disabled"}
          </div>

        </div>

        <div className="settings-body">

          <div className="timer-enable-box">

            <div>

              <strong>
                Enable Countdown
              </strong>

              <span>
                Use the timer while no sale
                product is active.
              </span>

            </div>

            <button
              type="button"
              className={`large-toggle ${
                settings.countdownEnabled
                  ? "is-on"
                  : ""
              }`}
              onClick={() =>
                setSettings(
                  (current) => ({
                    ...current,
                    countdownEnabled:
                      !current.countdownEnabled,
                  })
                )
              }
              aria-pressed={
                settings.countdownEnabled
              }
            >
              <span />
            </button>

          </div>

          <div className="timer-input-area">

            {/* ── Sale Title — full width row ── */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#7a8a8c", letterSpacing: "0.5px", marginBottom: 6 }}>
                Sale Title <span style={{ fontWeight: 400, color: "#b0b8bc" }}>(optional)</span>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. Summer Sale, Super Sale, End of Season…"
                  value={settings.saleTitle || ""}
                  onChange={(e) =>
                    setSettings((c) => ({ ...c, saleTitle: e.target.value }))
                  }
                  style={{
                    width: "100%", height: 44, padding: "0 14px",
                    paddingRight: !settings.saleTitle ? "160px" : "14px",
                    border: "1.5px solid #e3dcd4", borderRadius: 9,
                    fontSize: 13, fontFamily: "inherit",
                    color: "#1c2f33", background: "#fff",
                    outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.18s",
                  }}
                />
                {!settings.saleTitle && (
                  <span style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 10, fontWeight: 600, color: "#c8c0b8",
                    pointerEvents: "none", letterSpacing: "0.3px",
                    whiteSpace: "nowrap",
                  }}>
                    Default: &quot;Special Offer&quot;
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, color: "#b0b8bc", marginTop: 4 }}>
                {(settings.saleTitle || "").length}/120 · Shown on sale page hero &amp; in notification emails
              </div>
            </div>

            {/* ── Countdown Date ── */}
            <label>
              <span>
                Sale Countdown Date &amp; Time
              </span>

              <div className="datetime-input-wrap">
                <CalendarClock size={15} />
                <input
                  type="datetime-local"
                  value={settings.countdownDate}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      countdownDate: event.target.value,
                    }))
                  }
                  disabled={!settings.countdownEnabled}
                />
              </div>
            </label>

            {/* ── Save button — aligned bottom ── */}
            <button
              type="button"
              className="save-settings-button"
              onClick={saveSettings}
              disabled={
                savingSettings
              }
            >
              {savingSettings ? (
                <Loader2
                  size={14}
                  className="spin"
                />
              ) : (
                <Save size={14} />
              )}

              Save Settings
            </button>

          </div>

          {/* ====================================================
              NOTIFICATION MESSAGE EDITOR
          ==================================================== */}

          <div style={{
            marginTop: 24,
            background: "#f7f3ef",
            border: "1.5px solid #e3dcd4",
            borderRadius: 14,
            overflow: "hidden",
          }}>

            {/* Header */}
            <div style={{
              padding: "14px 20px",
              borderBottom: "1.5px solid #e3dcd4",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "#faf8f5", flexWrap: "wrap", gap: 12,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#295C65" }}>
                  📧 Notification Email
                </div>
                <div style={{ fontSize: 11, color: "#7a8a8c", marginTop: 2 }}>
                  Sent to subscribers when sale timer is activated or you manually blast.
                </div>
              </div>

              {/* Subscriber stats */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Total",    value: subscribers.total,    bg: "#edf4f5", color: "#295C65"  },
                  { label: "Notified", value: subscribers.notified, bg: "#e6f4ec", color: "#1a7a45"  },
                  { label: "Pending",  value: subscribers.pending,  bg: "#fff8e6", color: "#976800"  },
                ].map((s) => (
                  <div key={s.label} style={{
                    padding: "5px 12px", borderRadius: 999,
                    background: s.bg, color: s.color,
                    fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
                  }}>
                    {s.value} {s.label}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Message type toggle */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8,
                background: "#ede7df", padding: 4, borderRadius: 10,
              }}>
                {[
                  { value: "auto",   label: "✨ Auto-Generated",  desc: "System writes the message" },
                  { value: "custom", label: "✏️ Custom Message",   desc: "You write your own text"   },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSettings((c) => ({ ...c, notifyMessageType: opt.value }))}
                    style={{
                      padding: "10px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: settings.notifyMessageType === opt.value ? "#295C65" : "transparent",
                      color:      settings.notifyMessageType === opt.value ? "#fff"    : "#7a8a8c",
                      transition: "all 0.18s", textAlign: "left",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{opt.label}</div>
                    <div style={{ fontSize: 10, marginTop: 2, opacity: 0.8 }}>{opt.desc}</div>
                  </button>
                ))}
              </div>

              {/* Auto preview */}
              {settings.notifyMessageType === "auto" && (
                <div style={{
                  background: "#fff", border: "1.5px dashed #ccdde0",
                  borderRadius: 10, padding: "14px 16px",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9aabae", letterSpacing: "0.8px", marginBottom: 8 }}>
                    AUTO-GENERATED PREVIEW
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#4a5c60", lineHeight: 1.7 }}>
                    Our exclusive sale goes live on{" "}
                    <strong>
                      {settings.countdownDate
                        ? new Date(settings.countdownDate).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })
                        : "[countdown date]"}
                    </strong>
                    . Be the first to grab premium fabrics at unbeatable prices!
                  </p>
                </div>
              )}

              {/* Custom textarea */}
              {settings.notifyMessageType === "custom" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#7a8a8c", letterSpacing: "0.6px", display: "block", marginBottom: 6 }}>
                    YOUR CUSTOM MESSAGE
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Write your sale announcement message here…"
                    value={settings.notifyMessage}
                    onChange={(e) => setSettings((c) => ({ ...c, notifyMessage: e.target.value }))}
                    style={{
                      width: "100%", padding: "12px 14px",
                      border: "1.5px solid #e2dbd2", borderRadius: 10,
                      fontSize: 13, fontFamily: "inherit", lineHeight: 1.7,
                      color: "#1c2f33", background: "#fdfcfa",
                      resize: "vertical", outline: "none", boxSizing: "border-box",
                    }}
                  />
                  <div style={{ fontSize: 10, color: "#9aabae", marginTop: 4 }}>
                    {(settings.notifyMessage || "").length}/2000 chars
                  </div>
                </div>
              )}

              {/* Send on save checkbox */}
              <label style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                cursor: "pointer", padding: "12px 14px",
                background: sendOnSave ? "#e6f4ec" : "#fff",
                border: `1.5px solid ${sendOnSave ? "#b2dfc0" : "#e2dbd2"}`,
                borderRadius: 10, transition: "all 0.18s",
              }}>
                <input
                  type="checkbox"
                  checked={sendOnSave}
                  onChange={(e) => setSendOnSave(e.target.checked)}
                  style={{ width: 16, height: 16, marginTop: 1, accentColor: "#295C65", cursor: "pointer", flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: sendOnSave ? "#1a7a45" : "#1c2f33" }}>
                    Auto-send email when countdown expires
                  </div>
                  <div style={{ fontSize: 11, color: "#7a8a8c", marginTop: 2 }}>
                    When the timer hits 0, automatically blast all {subscribers.total} subscriber{subscribers.total !== 1 ? "s" : ""} with the above message.
                  </div>
                </div>
              </label>

              {/* Manual blast buttons */}
              <div style={{
                display: "flex", gap: 10, flexWrap: "wrap",
                paddingTop: 4,
              }}>
                <button
                  type="button"
                  disabled={blasting || subscribers.total === 0}
                  onClick={() => sendManualBlast("notify")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "9px 18px", borderRadius: 8,
                    border: "1.5px solid #ccdde0", background: "#fff",
                    color: "#295C65", fontSize: 12, fontWeight: 700,
                    cursor: blasting || subscribers.total === 0 ? "not-allowed" : "pointer",
                    opacity: blasting || subscribers.total === 0 ? 0.55 : 1,
                  }}
                >
                  {blasting
                    ? <><span style={{ width: 12, height: 12, border: "2px solid #295C65", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Sending…</>
                    : <>📢 Send "Sale Coming Soon" Email</>
                  }
                </button>

                <button
                  type="button"
                  disabled={blasting || subscribers.total === 0}
                  onClick={() => sendManualBlast("live")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "9px 18px", borderRadius: 8,
                    border: "1.5px solid #f0c8c4", background: "#fdecea",
                    color: "#b83c30", fontSize: 12, fontWeight: 700,
                    cursor: blasting || subscribers.total === 0 ? "not-allowed" : "pointer",
                    opacity: blasting || subscribers.total === 0 ? 0.55 : 1,
                  }}
                >
                  🔴 Send "Sale is LIVE" Email
                </button>

                {subscribers.total === 0 && (
                  <span style={{ fontSize: 11, color: "#9aabae", alignSelf: "center" }}>
                    No subscribers yet.
                  </span>
                )}
              </div>

              {/* ── Reset subscribers ── */}
              {subscribers.total > 0 && (
                <div style={{
                  marginTop: 4,
                  paddingTop: 16,
                  borderTop: "1px dashed #e2dbd2",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", flexWrap: "wrap", gap: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#4a5c60" }}>
                      🔄 Reset for New Sale
                    </div>
                    <div style={{ fontSize: 11, color: "#9aabae", marginTop: 2 }}>
                      Clears all subscriptions so users can re-subscribe for the next sale campaign.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResetConfirm(true)}
                    disabled={resetting}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 16px", borderRadius: 8,
                      border: "1.5px solid #e8e1d9",
                      background: "#fff", color: "#7a8a8c",
                      fontSize: 12, fontWeight: 700,
                      cursor: resetting ? "not-allowed" : "pointer",
                      opacity: resetting ? 0.6 : 1,
                      flexShrink: 0,
                    }}
                  >
                    🔄 Reset All Subscriptions
                  </button>
                </div>
              )}

            </div>
          </div>

          <div className="hero-image-grid">

            {/* DESKTOP HERO */}
            <div className="hero-upload-card">

              <div className="hero-upload-card-header">
                <div className="hero-upload-heading">
                  <span className="hero-upload-label">
                    Desktop Hero Image
                  </span>

                  <small>
                    Recommended: 1600 × 700 px
                  </small>
                </div>

                <span className="hero-device-badge">
                  Desktop
                </span>
              </div>

              <div
                className={`hero-preview ${
                  settings.desktopHeroImage
                    ? "has-image"
                    : ""
                }`}
              >
                {settings.desktopHeroImage ? (
                  <img
                    src={
                      settings.desktopHeroImage
                    }
                    alt="Desktop sale hero preview"
                  />
                ) : (
                  <div className="hero-empty-preview">
                    <div className="hero-upload-icon">
                      <Upload size={18} />
                    </div>

                    <strong>
                      Upload desktop banner
                    </strong>

                    <span>
                      JPG, PNG or WEBP
                    </span>
                  </div>
                )}

                <label className="hero-upload-overlay">
                  <Upload size={14} />

                  <span>
                    {settings.desktopHeroImage
                      ? "Change Image"
                      : "Upload Image"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) =>
                      handleSaleHeroUpload(
                        event,
                        "desktopHeroImage"
                      )
                    }
                  />
                </label>
              </div>

              <div className="hero-url-row">
                <input
                  type="url"
                  value={
                    settings.desktopHeroImage ||
                    ""
                  }
                  onChange={(event) =>
                    setSettings(
                      (current) => ({
                        ...current,
                        desktopHeroImage:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Paste image URL"
                />

                {settings.desktopHeroImage && (
                  <button
                    type="button"
                    className="hero-remove-button"
                    onClick={() =>
                      removeSaleHeroImage(
                        "desktopHeroImage"
                      )
                    }
                    disabled={savingSettings}
                    title="Remove desktop hero image"
                  >
                    {savingSettings ? (
                      <Loader2
                        size={12}
                        className="spin"
                      />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    <span>Remove</span>
                  </button>
                )}
              </div>

            </div>

            {/* MOBILE HERO */}
            <div className="hero-upload-card">

              <div className="hero-upload-card-header">
                <div className="hero-upload-heading">
                  <span className="hero-upload-label">
                    Mobile Hero Image
                  </span>

                  <small>
                    Recommended: 750 × 1000 px
                  </small>
                </div>

                <span className="hero-device-badge">
                  Mobile
                </span>
              </div>

              <div
                className={`hero-preview ${
                  settings.mobileHeroImage
                    ? "has-image"
                    : ""
                }`}
              >
                {settings.mobileHeroImage ? (
                  <img
                    src={
                      settings.mobileHeroImage
                    }
                    alt="Mobile sale hero preview"
                  />
                ) : (
                  <div className="hero-empty-preview">
                    <div className="hero-upload-icon">
                      <Upload size={18} />
                    </div>

                    <strong>
                      Upload mobile banner
                    </strong>

                    <span>
                      JPG, PNG or WEBP
                    </span>
                  </div>
                )}

                <label className="hero-upload-overlay">
                  <Upload size={14} />

                  <span>
                    {settings.mobileHeroImage
                      ? "Change Image"
                      : "Upload Image"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) =>
                      handleSaleHeroUpload(
                        event,
                        "mobileHeroImage"
                      )
                    }
                  />
                </label>
              </div>

              <div className="hero-url-row">
                <input
                  type="url"
                  value={
                    settings.mobileHeroImage ||
                    ""
                  }
                  onChange={(event) =>
                    setSettings(
                      (current) => ({
                        ...current,
                        mobileHeroImage:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Paste image URL"
                />

                {settings.mobileHeroImage && (
                  <button
                    type="button"
                    className="hero-remove-button"
                    onClick={() =>
                      removeSaleHeroImage(
                        "mobileHeroImage"
                      )
                    }
                    disabled={savingSettings}
                    title="Remove mobile hero image"
                  >
                    {savingSettings ? (
                      <Loader2
                        size={12}
                        className="spin"
                      />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    <span>Remove</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* LOGIC INFO */}

        <div className="logic-info">

          <div>
            <CheckCircle2
              size={14}
            />

            <span>
              <strong>
                Products active
              </strong>
              {" \u2192 Sale is Live"}
            </span>
          </div>

          <div>
            <Clock3
              size={14}
            />

            <span>
              <strong>
                0 products
              </strong>
              {" \u2192 Countdown can show"}
            </span>
          </div>

          <div>
            <XCircle
              size={14}
            />

            <span>
              <strong>
                Timer expired + 0 products
              </strong>
              {" \u2192 Sale inactive"}
            </span>
          </div>

        </div>

      </section>

      {/* =================================================
          ACTIVE SALE SUMMARY
      ================================================= */}

      <section className="active-summary">

        <div>
          <span className="section-kicker">
            ACTIVE SALE
          </span>

          <h2>
            {activeProducts.length}{" "}
            Active Sale{" "}
            {activeProducts.length ===
            1
              ? "Product"
              : "Products"}
          </h2>
        </div>

        <div className="active-summary-icon">
          <BadgePercent
            size={20}
          />
        </div>

      </section>

      {/* =================================================
          PRODUCTS CARD
      ================================================= */}

      <section className="products-card">

        <div className="products-card-header">

          <div>
            <h2>
              Sale Products
            </h2>

            <p>
              Manage which products are
              currently visible on the Sale
              page.
            </p>
          </div>

          <button
            type="button"
            className={`catalog-switch ${
              showAllProducts
                ? "active"
                : ""
            }`}
            onClick={() =>
              setShowAllProducts(
                (value) =>
                  !value
              )
            }
          >
            <span>
              {showAllProducts
                ? "All Products"
                : "Active Only"}
            </span>

            <ChevronDown
              size={14}
            />
          </button>

        </div>

        {/* SEARCH */}

        <div className="products-toolbar">

          <div className="product-search">

            <Search
              size={14}
            />

            <input
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search sale products..."
            />

            {search && (
              <button
                type="button"
                onClick={
                  clearSearch
                }
              >
                <XCircle
                  size={14}
                />
              </button>
            )}

          </div>

          <span className="products-count">
            {filteredProducts.length > 0
              ? `${paginationStart}–${paginationEnd} of ${filteredProducts.length}`
              : "0 products"}
          </span>

        </div>

        {/* BULK SALE CONTROLS */}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
            padding: "10px 0 12px",
          }}
        >
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <input
              type="checkbox"
              checked={
                filteredProducts.length > 0 &&
                filteredProducts.every((product) =>
                  selectedProductIds.includes(String(product._id))
                )
              }
              onChange={(event) => selectAllVisible(event.target.checked)}
            />
            Select visible
          </label>

          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={bulkDiscount}
            onChange={(event) => setBulkDiscount(event.target.value)}
            placeholder="Discount %"
            style={{
              width: 105,
              height: 34,
              border: "1px solid #DDD5CC",
              borderRadius: 7,
              padding: "0 8px",
            }}
          />

          <select
            value={bulkDuration}
            onChange={(event) => setBulkDuration(event.target.value)}
            style={{
              width: 105,
              height: 34,
              border: "1px solid #DDD5CC",
              borderRadius: 7,
              padding: "0 8px",
              background: "#fff",
            }}
          >
            <option value="1">1 Day</option>
            <option value="3">3 Days</option>
            <option value="7">7 Days</option>
            <option value="10">10 Days</option>
            <option value="30">30 Days</option>
          </select>

          <button
            type="button"
            className="refresh-button"
            disabled={!selectedProductIds.length || bulkWorking}
            onClick={runBulkSale}
          >
            {bulkWorking ? "Working..." : `Apply Sale (${selectedProductIds.length})`}
          </button>

          <button
            type="button"
            className="refresh-button"
            disabled={!selectedProductIds.length || bulkWorking}
            onClick={runBulkRemove}
          >
            Remove Selected
          </button>

          <button
            type="button"
            className="refresh-button"
            disabled={bulkWorking}
            onClick={removeAllSaleProducts}
          >
            Remove All Sale
          </button>
        </div>

        {/* PRODUCTS */}

        <div className="sale-products-list">

          {loading ? (
            Array.from({
              length: 6,
            }).map(
              (
                _,
                index
              ) => (
                <div
                  key={index}
                  className="product-skeleton"
                >
                  <div className="skeleton-circle" />

                  <div className="skeleton-content">
                    <span />
                    <span />
                  </div>

                  <div className="skeleton-price" />

                  <div className="skeleton-toggle" />
                </div>
              )
            )
          ) : filteredProducts.length >
            0 ? (
            paginatedProducts.map(
              (product) => (
                <ProductRow
                  key={
                    product._id
                  }
                  product={
                    product
                  }
                  onToggle={
                    toggleSaleProduct
                  }
                  updatingId={
                    updatingId
                  }
                  selected={selectedProductIds.includes(
                    String(product._id)
                  )}
                  onSelect={toggleProductSelection}
                />
              )
            )
          ) : (
            <div className="no-products">

              <Package
                size={34}
              />

              <strong>
                {showAllProducts
                  ? "No products found"
                  : "No sale products yet"}
              </strong>

              <span>
                {showAllProducts
                  ? "Try another search."
                  : "Turn on a product below to add it to Sale."}
              </span>

              {!showAllProducts && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllProducts(
                      true
                    )
                  }
                >
                  View All Products
                </button>
              )}

            </div>
          )}

        </div>

        {filteredProducts.length > 0 &&
          totalProductPages > 1 && (
            <div className="products-pagination">

              <div className="pagination-info">
                Showing{" "}
                <strong>
                  {paginationStart}–{paginationEnd}
                </strong>{" "}
                of{" "}
                <strong>
                  {filteredProducts.length}
                </strong>{" "}
                products
              </div>

              <div className="pagination-controls">

                <button
                  type="button"
                  className="pagination-arrow"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                  disabled={
                    currentPage === 1
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft size={14} />
                </button>

                {visiblePageNumbers.map(
                  (page) => (
                    <button
                      type="button"
                      key={page}
                      className={`pagination-page ${
                        currentPage === page
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }
                      aria-current={
                        currentPage === page
                          ? "page"
                          : undefined
                      }
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  type="button"
                  className="pagination-arrow"
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalProductPages,
                          page + 1
                        )
                    )
                  }
                  disabled={
                    currentPage ===
                    totalProductPages
                  }
                  aria-label="Next page"
                >
                  <ChevronRight size={14} />
                </button>

              </div>

            </div>
          )}

      </section>

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`

        /* =========================================================
           INLINE CSS / REFRESH-STABLE LAYOUT
           Keep this stylesheet inside the component intentionally.
           It avoids styled-jsx hydration timing/layout shifts.
        ========================================================= */

        html {
          min-width: 0;
          overflow-y: scroll;
          scrollbar-gutter: stable;
        }

        body {
          margin: 0;
          min-width: 0;
          overflow-x: hidden;
          background: #F7F3EF;
        }

        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }

        img {
          max-width: 100%;
        }

        button,
        input,
        textarea,
        select {
          font: inherit;
        }

        .sale-admin-page {
          width: 100%;
          min-width: 0;
          min-height: 100vh;
          min-height: 100dvh;
          overflow-x: hidden;
          overflow-anchor: none;
          isolation: isolate;
          contain: layout style;
        }

        .sale-page-header,
        .sale-alert,
        .top-grid,
        .settings-card,
        .active-summary,
        .products-card {
          width: 100%;
          min-width: 0;
        }

        .top-grid {
          min-height: 142px;
        }

        .status-card,
        .timer-current-card {
          min-width: 0;
          height: 142px;
          min-height: 142px;
          max-height: 142px;
          overflow: hidden;
          contain: layout paint;
        }

        .settings-card,
        .products-card {
          contain: layout paint;
          overflow: hidden;
        }

        .settings-body {
          min-width: 0;
        }

        .hero-image-grid {
          min-width: 0;
        }

        .hero-upload-card {
          min-width: 0;
          width: 100%;
          overflow: hidden;
          contain: layout paint;
        }

        .hero-preview {
          width: 100% !important;
          height: 220px !important;
          min-height: 220px !important;
          max-height: 220px !important;
          flex: 0 0 220px !important;
          overflow: hidden;
          contain: strict;
        }

        .hero-preview img {
          display: block;
          width: 100% !important;
          height: 100% !important;
          min-width: 100%;
          min-height: 100%;
          max-width: none;
          object-fit: cover;
        }

        .sale-products-list {
          width: 100%;
          min-width: 0;
          overflow-anchor: none;
          contain: layout;
        }

        .sale-product-row,
        .product-skeleton {
          width: 100%;
          min-width: 0;
          height: 67px;
          min-height: 67px;
          max-height: 67px;
          overflow: hidden;
          overflow-anchor: none;
        }

        .sale-product-image {
          width: 43px;
          height: 43px;
          min-width: 43px;
          min-height: 43px;
          flex: 0 0 43px;
          overflow: hidden;
        }

        .sale-product-image img {
          display: block;
          width: 43px !important;
          height: 43px !important;
          min-width: 43px;
          min-height: 43px;
          max-width: none;
          object-fit: cover;
        }

        .sale-product-main,
        .sale-product-info {
          min-width: 0;
        }

        .sale-product-title,
        .sale-product-meta {
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .products-toolbar,
        .product-search {
          min-width: 0;
        }

        .product-search {
          flex: 1 1 auto;
        }

        .product-search input {
          min-width: 0;
          width: 100%;
        }

        .products-pagination,
        .pagination-controls,
        .pagination-page,
        .pagination-arrow {
          flex-shrink: 0;
        }

        .hero-url-row {
          min-width: 0;
        }

        .hero-url-row input {
          min-width: 0;
          width: 100%;
        }

        .hero-remove-button {
          flex: 0 0 auto;
        }

        /* Prevent unloaded/reloaded content from changing reserved space */
        .hero-preview.has-image,
        .hero-preview:not(.has-image) {
          contain: strict;
        }

        @media (max-width: 850px) {
          .hero-preview {
            height: 210px !important;
            min-height: 210px !important;
            max-height: 210px !important;
            flex-basis: 210px !important;
          }

          .sale-product-row,
          .product-skeleton {
            height: 67px;
            min-height: 67px;
            max-height: 67px;
          }
        }

        @media (max-width: 600px) {
          .sale-product-row,
          .product-skeleton {
            height: 78px;
            min-height: 78px;
            max-height: 78px;
          }

          .sale-product-image {
            width: 39px;
            height: 39px;
            min-width: 39px;
            min-height: 39px;
            flex-basis: 39px;
          }

          .sale-product-image img {
            width: 39px !important;
            height: 39px !important;
            min-width: 39px;
            min-height: 39px;
          }
        }

        @media (max-width: 400px) {
          .sale-admin-page {
            min-width: 0;
          }
        }



        .sale-admin-page {
          width: 100%;
          min-width: 0;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 20px;
          background: #F7F3EF;
          color: #2E2C29;
          overflow-x: hidden;
          overflow-anchor: none;
          isolation: isolate;
        }

        /* ===============================================
           PAGE HEADER
        =============================================== */

        .sale-page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
        }

        .sale-breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 5px;
          color: #8B857E;
          font-size: 9px;
          font-weight: 600;
        }

        .sale-page-header h1 {
          margin: 0;
          font-family:
            Georgia,
            "Times New Roman",
            serif;
          color: #2B2927;
          font-size: 28px;
          line-height: 32px;
          font-weight: 600;
        }

        .sale-page-header p {
          margin: 5px 0 0;
          color: #79736D;
          font-size: 10px;
          line-height: 15px;
        }

        .refresh-button {
          height: 37px;
          padding: 0 12px;
          border:
            1px solid
            #D8D0C8;
          border-radius: 8px;
          background: #FFFFFF;
          color: #295C65;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .refresh-button:hover {
          background: #F7F3ED;
        }

        .refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ===============================================
           ALERT
        =============================================== */

        .sale-alert {
          min-height: 38px;
          padding: 8px 11px;
          margin-bottom: 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 9px;
          line-height: 14px;
        }

        .sale-alert-error {
          background: #FCEEEE;
          border: 1px solid #ECCCCC;
          color: #A34A4A;
        }

        .sale-alert-success {
          background: #EDF5F1;
          border: 1px solid #CFE0D8;
          color: #356D58;
        }

        /* ===============================================
           TOP GRID
        =============================================== */

        .top-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1.5fr);
          gap: 12px;
          margin-bottom: 12px;
        }

        /* ===============================================
           STATUS CARD
        =============================================== */

        .status-card {
          min-height: 142px;
          padding: 17px;
          border: 1px solid;
          border-radius: 11px;
          background: #FFFFFF;
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }

        .status-card.live {
          border-color: #CFE0D8;
          background: #F9FCFA;
        }

        .status-card.countdown {
          border-color: #E6D8C3;
          background: #FFFDFC;
        }

        .status-card.empty {
          border-color: #E3DCD5;
          background: #FFFFFF;
        }

        .status-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          flex: 0 0 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-card.live .status-icon {
          background: #E8F3ED;
          color: #356D58;
        }

        .status-card.countdown .status-icon {
          background: #F6ECDD;
          color: #956F39;
        }

        .status-card.empty .status-icon {
          background: #F0ECE8;
          color: #77716B;
        }

        .status-card > div:last-child {
          min-width: 0;
        }

        .status-kicker,
        .section-kicker {
          display: block;
          margin-bottom: 4px;
          color: #A19A92;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .status-card strong {
          display: block;
          color: #35312E;
          font-size: 14px;
          line-height: 18px;
          font-weight: 800;
        }

        .status-card p {
          margin: 5px 0 0;
          color: #817B75;
          font-size: 9px;
          line-height: 14px;
        }

        /* ===============================================
           CURRENT TIMER
        =============================================== */

        .timer-current-card {
          min-height: 142px;
          padding: 15px 17px;
          border:
            1px solid
            #E2DBD4;
          border-radius: 11px;
          background: #FFFFFF;
        }

        .timer-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .timer-card-top strong {
          display: block;
          color: #383431;
          font-size: 13px;
          line-height: 17px;
        }

        .timer-status-pill {
          height: 24px;
          padding: 0 8px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 7px;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .timer-status-pill.on {
          background: #EDF5F1;
          color: #356D58;
        }

        .timer-status-pill.off {
          background: #F1EFED;
          color: #77716B;
        }

        .countdown-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 15px;
        }

        .timer-unit {
          min-width: 52px;
          height: 48px;
          padding: 6px 6px;
          border-radius: 8px;
          background: #F7F3EF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .timer-unit strong {
          color: #295C65;
          font-size: 18px;
          line-height: 19px;
          font-weight: 800;
        }

        .timer-unit span {
          margin-top: 2px;
          color: #99928A;
          font-size: 6px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .timer-separator {
          color: #C5B9AE;
          font-size: 15px;
          font-weight: 800;
        }

        .timer-target {
          display: block;
          margin-top: 8px;
          color: #88817A;
          font-size: 8px;
        }

        .timer-empty {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 6px;
          color: #99928A;
          font-size: 8px;
        }

        .timer-empty svg {
          color: #BE9D6B;
        }

        /* ===============================================
           SETTINGS
        =============================================== */

        .settings-card {
          margin-bottom: 12px;
          border:
            1px solid
            #E1D9D2;
          border-radius: 11px;
          background: #FFFFFF;
          overflow: hidden;
        }

        .settings-header {
          min-height: 67px;
          padding: 13px 15px;
          border-bottom:
            1px solid
            #ECE6DF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .settings-title {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .settings-icon {
          width: 33px;
          height: 33px;
          border-radius: 8px;
          background: #F1EAE1;
          color: #BE9D6B;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 33px;
        }

        .settings-title h2 {
          margin: 0;
          color: #393532;
          font-size: 12px;
          line-height: 16px;
          font-weight: 800;
        }

        .settings-title p {
          margin: 3px 0 0;
          color: #89827B;
          font-size: 8px;
          line-height: 12px;
        }

        .settings-enabled-pill {
          height: 25px;
          padding: 0 8px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          flex-shrink: 0;
          font-size: 7px;
          font-weight: 800;
        }

        .settings-enabled-pill.enabled {
          background: #EDF5F1;
          color: #356D58;
        }

        .settings-enabled-pill.disabled {
          background: #F1EFED;
          color: #77716B;
        }

        .settings-body {
          padding: 13px 15px;
          display: grid;
          grid-template-columns:
            minmax(240px, 0.8fr)
            minmax(320px, 1.4fr);
          gap: 12px;
        }

        .timer-enable-box {
          min-height: 62px;
          padding: 10px 11px;
          border:
            1px solid
            #E4DDD6;
          border-radius: 8px;
          background: #FBFAF8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .timer-enable-box strong {
          display: block;
          color: #44403B;
          font-size: 9px;
          line-height: 13px;
          font-weight: 800;
        }

        .timer-enable-box > div > span {
          display: block;
          margin-top: 3px;
          color: #938C84;
          font-size: 7px;
          line-height: 11px;
        }

        .large-toggle {
          position: relative;
          width: 43px;
          height: 24px;
          min-width: 43px;
          padding: 0;
          border:
            1px solid
            #CBC4BC;
          border-radius: 999px;
          background: transparent;
          cursor: pointer;
          flex: 0 0 43px;
        }

        .large-toggle span {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #98928A;
          transition:
            transform 0.16s ease,
            background 0.16s ease;
        }

        .large-toggle.is-on {
          background: #295C65;
          border-color: #295C65;
        }

        .large-toggle.is-on span {
          transform: translateX(19px);
          background: #FFFFFF;
        }

        .timer-input-area {
          display: grid;
          grid-template-columns: 1fr auto;
          grid-template-rows: auto auto;
          gap: 16px 14px;
          align-items: end;
        }

        /* Sale Title full-width row */
        .timer-input-area > div:first-child {
          grid-column: 1 / -1;
        }

        .timer-input-area label {
          min-width: 0;
        }

        .timer-input-area label > span {
          display: block;
          margin-bottom: 6px;
          color: #4D4945;
          font-size: 8px;
          line-height: 12px;
          font-weight: 800;
        }

        .datetime-input-wrap {
          height: 38px;
          padding: 0 9px;
          border:
            1px solid
            #D6CEC6;
          border-radius: 8px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #BE9D6B;
        }

        .datetime-input-wrap input {
          width: 100%;
          height: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #393532;
          font-size: 9px;
        }

        .datetime-input-wrap input:disabled {
          color: #A6A098;
          cursor: not-allowed;
        }

        .save-settings-button {
          height: 38px;
          padding: 0 12px;
          border: 0;
          border-radius: 8px;
          background: #295C65;
          color: #FFFFFF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 8px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
        }

        .save-settings-button:hover {
          background: #214D55;
        }

        .save-settings-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .logic-info {
          min-height: 43px;
          padding: 8px 15px;
          border-top:
            1px solid
            #ECE6DF;
          background: #FBFAF8;
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .logic-info > div {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #817A73;
          font-size: 7px;
        }

        .logic-info svg {
          color: #BE9D6B;
          flex-shrink: 0;
        }

        .logic-info strong {
          color: #4C4844;
        }

        /* ===============================================
           HERO IMAGE UPLOADS
        =============================================== */

        .hero-image-grid {
          grid-column: 1 / -1;
          width: 100%;
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          align-items: stretch;
          gap: 14px;
          margin-top: 2px;
        }

        .hero-upload-card {
          min-width: 0;
          min-height: 0;
          padding: 13px;
          border:
            1px solid
            #E2DBD4;
          border-radius: 11px;
          background: #FCFBF9;
          display: flex;
          flex-direction: column;
        }

        .hero-upload-card-header {
          min-height: 39px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 10px;
        }

        .hero-upload-heading {
          min-width: 0;
        }

        .hero-upload-label {
          display: block;
          color: #403B37;
          font-size: 9px;
          line-height: 13px;
          font-weight: 800;
        }

        .hero-upload-card-header small {
          display: block;
          margin-top: 3px;
          color: #948C84;
          font-size: 7px;
          line-height: 11px;
        }

        .hero-device-badge {
          height: 23px;
          padding: 0 9px;
          border:
            1px solid
            #E1D9D2;
          border-radius: 999px;
          background: #FFFFFF;
          color: #6E665F;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          font-size: 7px;
          font-weight: 800;
          white-space: nowrap;
        }

        .hero-preview {
          position: relative;
          width: 100%;
          height: 220px;
          flex: 0 0 220px;
          overflow: hidden;
          border:
            1px dashed
            #CFC6BC;
          border-radius: 9px;
          background: #F3EEE8;
        }

        .hero-preview::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          box-shadow:
            inset 0 0 0 1px
            rgba(255, 255, 255, 0.45);
        }

        .hero-preview img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .hero-empty-preview {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          color: #918980;
        }

        .hero-upload-icon {
          width: 38px;
          height: 38px;
          margin-bottom: 2px;
          border:
            1px solid
            #E8E1D9;
          border-radius: 10px;
          background: #FFFFFF;
          color: #BE9D6B;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 1px 5px
            rgba(45, 39, 34, 0.05);
        }

        .hero-empty-preview strong {
          color: #5A544E;
          font-size: 9px;
          line-height: 13px;
          font-weight: 800;
        }

        .hero-empty-preview span {
          color: #9B938B;
          font-size: 7px;
          line-height: 11px;
        }

        .hero-upload-overlay {
          position: absolute;
          left: 50%;
          bottom: 10px;
          transform:
            translate(-50%, 5px);
          height: 31px;
          padding: 0 12px;
          border:
            1px solid
            rgba(255, 255, 255, 0.45);
          border-radius: 7px;
          background:
            rgba(41, 92, 101, 0.96);
          color: #FFFFFF;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 7px;
          font-weight: 800;
          cursor: pointer;
          white-space: nowrap;
          opacity: 0;
          transition:
            opacity 0.16s ease,
            transform 0.16s ease;
          z-index: 2;
        }

        .hero-preview:hover .hero-upload-overlay,
        .hero-preview.has-image .hero-upload-overlay {
          opacity: 1;
          transform:
            translate(-50%, 0);
        }

        .hero-upload-overlay:hover {
          background: #214D55;
        }

        .hero-url-row {
          margin-top: 9px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .hero-url-row input {
          min-width: 0;
          flex: 1;
          width: 100%;
          height: 34px;
          padding: 0 9px;
          border:
            1px solid
            #D8D1C9;
          border-radius: 7px;
          outline: 0;
          background: #FFFFFF;
          color: #393532;
          font-size: 8px;
        }

        .hero-url-row input::placeholder {
          color: #AAA29A;
        }

        .hero-url-row input:focus {
          border-color: #295C65;
          box-shadow:
            0 0 0 2px
            rgba(41, 92, 101, 0.08);
        }

        .hero-remove-button {
          flex: 0 0 auto;
          height: 34px;
          padding: 0 10px;
          border:
            1px solid
            #E4CACA;
          border-radius: 7px;
          background: #FFF7F7;
          color: #A34A4A;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 8px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }

        .hero-remove-button:hover:not(:disabled) {
          background: #FCEEEE;
          border-color: #D9AFAF;
          color: #8E3E3E;
        }

        .hero-remove-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ===============================================
           PRODUCT PAGINATION
        =============================================== */

        .products-pagination {
          min-height: 58px;
          padding: 9px 15px;
          border-top:
            1px solid
            #ECE6DF;
          background: #FBFAF8;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .pagination-info {
          color: #918A82;
          font-size: 8px;
          line-height: 13px;
        }

        .pagination-info strong {
          color: #5B554F;
          font-weight: 800;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        }

        .pagination-page,
        .pagination-arrow {
          width: 29px;
          height: 29px;
          padding: 0;
          border:
            1px solid
            #D9D1C9;
          border-radius: 7px;
          background: #FFFFFF;
          color: #706960;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
          font-weight: 800;
          cursor: pointer;
          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }

        .pagination-page:hover:not(.active),
        .pagination-arrow:hover:not(:disabled) {
          border-color: #295C65;
          color: #295C65;
          background: #F4F9F8;
        }

        .pagination-page.active {
          border-color: #295C65;
          background: #295C65;
          color: #FFFFFF;
        }

        .pagination-arrow:disabled {
          opacity: 0.42;
          cursor: not-allowed;
          background: #F7F4F1;
        }

        @media (max-width: 560px) {
          .hero-url-row {
            align-items: stretch;
            flex-direction: column;
          }

          .hero-remove-button {
            width: 100%;
          }
        }

        @media (max-width: 850px) {
          .hero-image-grid {
            grid-template-columns: 1fr;
          }

          .products-pagination {
            align-items: flex-start;
            flex-direction: column;
          }

          .pagination-controls {
            width: 100%;
          }
        }

                /* ===============================================
           ACTIVE SUMMARY
        =============================================== */

        .active-summary {
          min-height: 70px;
          padding: 12px 15px;
          margin-bottom: 12px;
          border:
            1px solid
            #E1D9D2;
          border-radius: 11px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .active-summary h2 {
          margin: 0;
          color: #373330;
          font-size: 17px;
          line-height: 21px;
          font-weight: 800;
        }

        .active-summary-icon {
          width: 39px;
          height: 39px;
          border-radius: 10px;
          background: #F1EAE1;
          color: #BE9D6B;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ===============================================
           PRODUCTS CARD
        =============================================== */

        .products-card {
          border:
            1px solid
            #E1D9D2;
          border-radius: 11px;
          background: #FFFFFF;
          overflow: hidden;
        }

        .products-card-header {
          min-height: 73px;
          padding: 13px 15px;
          border-bottom:
            1px solid
            #ECE6DF;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .products-card-header h2 {
          margin: 0;
          color: #393532;
          font-size: 14px;
          line-height: 18px;
          font-weight: 800;
        }

        .products-card-header p {
          margin: 3px 0 0;
          color: #8C857E;
          font-size: 8px;
        }

        .catalog-switch {
          height: 32px;
          padding: 0 10px;
          border:
            1px solid
            #D7D0C8;
          border-radius: 8px;
          background: #FFFFFF;
          color: #56514C;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 8px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
        }

        .catalog-switch.active {
          border-color: #295C65;
          color: #295C65;
          background: #F4F9F8;
        }

        .products-toolbar {
          min-height: 54px;
          padding: 8px 15px;
          border-bottom:
            1px solid
            #ECE6DF;
          background: #FBFAF8;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .product-search {
          width: 310px;
          height: 34px;
          padding: 0 9px;
          border:
            1px solid
            #D8D1C9;
          border-radius: 7px;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          gap: 7px;
          color: #8D8780;
        }

        .product-search input {
          width: 100%;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          font-size: 8px;
          color: #373330;
          background: transparent;
        }

        .product-search button {
          width: 22px;
          height: 22px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #9A938B;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .products-count {
          margin-left: auto;
          color: #938C84;
          font-size: 8px;
          white-space: nowrap;
        }

        /* ===============================================
           SALE PRODUCT ROW
        =============================================== */

        .sale-products-list {
          width: 100%;
        }

        .sale-product-row {
          min-height: 67px;
          padding: 9px 15px;
          border-bottom:
            1px solid
            #EEE8E1;
          display: grid;
          grid-template-columns:
            minmax(300px, 1fr)
            125px
            90px
            60px;
          align-items: center;
          gap: 15px;
        }

        .sale-product-row:last-child {
          border-bottom: 0;
        }

        .sale-product-row:hover {
          background: #FCFAF8;
        }

        .sale-product-main {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .sale-product-image {
          width: 43px;
          height: 43px;
          flex: 0 0 43px;
          border:
            1px solid
            #DED7CF;
          border-radius: 7px;
          overflow: hidden;
          background: #F3EEE8;
        }

        .sale-product-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .sale-product-info {
          min-width: 0;
        }

        .sale-product-title {
          display: block;
          color: #393633;
          font-size: 9px;
          line-height: 13px;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sale-product-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
          color: #9A938B;
          font-size: 7px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .meta-dot {
          color: #C6BDB4;
        }

        .sale-price-block {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .sale-price-block strong {
          color: #295C65;
          font-size: 10px;
          font-weight: 800;
        }

        .sale-price-block span {
          color: #99928A;
          font-size: 7px;
          text-decoration: line-through;
        }

        .sale-product-status {
          text-align: center;
        }

        .active-label,
        .inactive-label {
          min-width: 48px;
          height: 22px;
          padding: 0 7px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 7px;
          font-weight: 800;
        }

        .active-label {
          background: #EDF5F1;
          color: #356D58;
        }

        .inactive-label {
          background: #F1EFED;
          color: #77716B;
        }

        .sale-product-action {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sale-toggle {
          position: relative;
          width: 38px;
          height: 21px;
          min-width: 38px;
          padding: 0;
          border:
            1px solid
            #CFC8C0;
          border-radius: 999px;
          background: transparent;
          cursor: pointer;
        }

        .sale-toggle span {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #9B948C;
          transition:
            transform 0.16s ease,
            background 0.16s ease;
        }

        .sale-toggle.is-on {
          border-color: #295C65;
          background: #295C65;
        }

        .sale-toggle.is-on span {
          transform: translateX(17px);
          background: #FFFFFF;
        }

        .toggle-loading {
          width: 38px;
          height: 21px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #295C65;
        }

        /* ===============================================
           SKELETON
        =============================================== */

        .product-skeleton {
          min-height: 67px;
          padding: 9px 15px;
          border-bottom:
            1px solid
            #EEE8E1;
          display: grid;
          grid-template-columns:
            1fr
            125px
            90px
            60px;
          align-items: center;
          gap: 15px;
        }

        .skeleton-circle {
          width: 43px;
          height: 43px;
          border-radius: 7px;
          background: #E9E3DD;
          animation:
            skeletonPulse
            1.15s
            ease-in-out
            infinite;
        }

        .skeleton-content {
          height: 31px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .skeleton-content span {
          width: 180px;
          height: 8px;
          border-radius: 4px;
          background: #E9E3DD;
          animation:
            skeletonPulse
            1.15s
            ease-in-out
            infinite;
        }

        .skeleton-content span:last-child {
          width: 100px;
        }

        .skeleton-price {
          width: 60px;
          height: 10px;
          border-radius: 4px;
          background: #E9E3DD;
        }

        .skeleton-toggle {
          width: 38px;
          height: 21px;
          border-radius: 999px;
          background: #E9E3DD;
        }

        @keyframes skeletonPulse {
          0%,
          100% {
            opacity: 0.5;
          }

          50% {
            opacity: 1;
          }
        }

        /* ===============================================
           EMPTY
        =============================================== */

        .no-products {
          min-height: 245px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 7px;
          color: #968F87;
        }

        .no-products svg {
          color: #BE9D6B;
        }

        .no-products strong {
          color: #4B4743;
          font-family:
            Georgia,
            serif;
          font-size: 15px;
        }

        .no-products span {
          font-size: 8px;
        }

        .no-products button {
          margin-top: 5px;
          height: 31px;
          padding: 0 11px;
          border:
            1px solid
            #295C65;
          border-radius: 7px;
          background: #FFFFFF;
          color: #295C65;
          font-size: 8px;
          font-weight: 700;
          cursor: pointer;
        }

        .no-products button:hover {
          background: #F4F9F8;
        }

        /* ===============================================
           MOBILE
        =============================================== */

        @media (max-width: 850px) {

          .sale-admin-page {
            padding: 14px;
          }

          .top-grid {
            grid-template-columns:
              1fr;
          }

          .settings-body {
            grid-template-columns:
              1fr;
          }

          .hero-preview {
            height: 210px;
            flex-basis: 210px;
          }

          .sale-product-row {
            grid-template-columns:
              minmax(0, 1fr)
              90px
              58px;
            gap: 10px;
          }

          .sale-product-status {
            display: none;
          }

          .product-skeleton {
            grid-template-columns:
              1fr
              90px
              58px;
          }

          .skeleton-price {
            grid-column: 2;
          }

          .skeleton-toggle {
            grid-column: 3;
          }

        }

        @media (max-width: 600px) {

          .sale-page-header {
            align-items: stretch;
            flex-direction: column;
          }

          .refresh-button {
            align-self: flex-start;
          }

          .settings-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-body {
            padding:
              10px;
          }

          .timer-input-area {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }

          .timer-input-area > div:first-child {
            grid-column: 1 / -1;
          }

          .save-settings-button {
            width: 100%;
          }

          .logic-info {
            gap: 9px;
          }

          .products-card-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .catalog-switch {
            width: 100%;
            justify-content: space-between;
          }

          .products-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .product-search {
            width: 100%;
          }

          .products-count {
            margin-left: 0;
          }

          .sale-product-row {
            min-height: 78px;
            padding: 9px 10px;
            grid-template-columns:
              minmax(0, 1fr)
              44px;
            gap: 8px;
          }

          .sale-price-block {
            display: none;
          }

          .sale-product-main {
            min-width: 0;
          }

          .sale-product-image {
            width: 39px;
            height: 39px;
            flex-basis: 39px;
          }

          .sale-product-action {
            grid-column: 2;
            grid-row: 1;
          }

          .countdown-preview {
            gap: 5px;
          }

          .timer-unit {
            min-width: 45px;
            height: 44px;
          }

          .timer-unit strong {
            font-size: 15px;
          }

        }

        @media (max-width: 400px) {

          .sale-admin-page {
            padding: 10px;
          }

          .sale-page-header h1 {
            font-size: 24px;
          }

          .timer-unit {
            min-width: 40px;
          }

          .timer-separator {
            font-size: 11px;
          }

          .settings-enabled-pill {
            display: none;
          }

        }

        .spin {
          animation:
            saleSpin
            1s
            linear
            infinite;
        }

        @keyframes saleSpin {
          from {
            transform:
              rotate(0deg);
          }

          to {
            transform:
              rotate(360deg);
          }
        }

      `}</style>

    </div>
  );
}