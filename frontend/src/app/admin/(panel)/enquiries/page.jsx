"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Mail,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  RefreshCw,
  Search,
  Send,
  UserRound,
  X,
  AlertCircle,
  Building2,
  MapPin,
  Package,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5001/api"
).replace(/\/$/, "");

/* =========================================================
   STATUS
========================================================= */

const STATUS_META = {
  new: {
    label: "New",
    tone: "#C1502C",
    background: "#FCEDE7",
  },

  in_progress: {
    label: "In Progress",
    tone: "#8A6A2F",
    background: "#FBF3DF",
  },

  replied: {
    label: "Replied",
    tone: "#295C65",
    background: "#E9F1EF",
  },

  closed: {
    label: "Closed",
    tone: "#687274",
    background: "#EEF0EF",
  },
};

/* =========================================================
   HELPERS
========================================================= */

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function getRequestType(item) {
  return item?.requestType === "quote"
    ? "Quote Request"
    : "Contact Enquiry";
}

function getRequestTypeStyle(item) {
  if (item?.requestType === "quote") {
    return {
      background: "#FBF3DF",
      color: "#8A6A2F",
    };
  }

  return {
    background: "#E9F2F3",
    color: "#295C65",
  };
}

function getStatusStyle(status) {
  const meta =
    STATUS_META[status] ||
    STATUS_META.new;

  return {
    padding: "5px 9px",
    borderRadius: "999px",
    background: meta.background,
    color: meta.tone,
    fontSize: "9px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  };
}

/* =========================================================
   TOAST
========================================================= */

function Toast({
  toast,
  onClose,
}) {
  if (!toast.visible) {
    return null;
  }

  const success =
    toast.type === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: "22px",
        right: "22px",
        zIndex: 99999,
        width:
          "min(390px, calc(100vw - 32px))",
        display: "flex",
        alignItems: "flex-start",
        gap: "11px",
        padding: "14px 15px",
        borderRadius: "11px",
        background: "#FFFFFF",
        border: `1px solid ${
          success
            ? "rgba(31,157,98,0.20)"
            : "rgba(201,75,75,0.20)"
        }`,
        borderLeft: `4px solid ${
          success
            ? "#1F9D62"
            : "#C94B4B"
        }`,
        boxShadow:
          "0 15px 40px rgba(0,0,0,0.14)",
        boxSizing: "border-box",
        animation:
          "adminToastIn 0.25s ease",
      }}
    >
      {success ? (
        <CheckCircle2
          size={21}
          color="#1F9D62"
          strokeWidth={2}
        />
      ) : (
        <AlertCircle
          size={21}
          color="#C94B4B"
          strokeWidth={2}
        />
      )}

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            color: "#21383D",
            fontSize: "12px",
            fontWeight: 800,
          }}
        >
          {success
            ? "Success"
            : "Something went wrong"}
        </div>

        <div
          style={{
            marginTop: "3px",
            color: "#6E7778",
            fontSize: "10.5px",
            lineHeight: 1.5,
          }}
        >
          {toast.message}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        style={{
          border: 0,
          background: "transparent",
          padding: 2,
          color: "#899192",
          cursor: "pointer",
        }}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>

      <style jsx>{`
        @keyframes adminToastIn {
          from {
            opacity: 0;
            transform: translate3d(20px, -6px, 0);
          }

          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminEnquiriesPage() {
  /* -------------------------------------------------------
     LIST
  ------------------------------------------------------- */

  const [items, setItems] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [unreadCount, setUnreadCount] =
    useState(0);

  /* -------------------------------------------------------
     STATES
  ------------------------------------------------------- */

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* -------------------------------------------------------
     FILTERS
  ------------------------------------------------------- */

  const [query, setQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [typeFilter, setTypeFilter] =
    useState("all");

  /* -------------------------------------------------------
     DETAIL
  ------------------------------------------------------- */

  const [selectedId, setSelectedId] =
    useState(null);

  const [selected, setSelected] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  /* -------------------------------------------------------
     REPLY
  ------------------------------------------------------- */

  const [reply, setReply] =
    useState("");

  const [replySending, setReplySending] =
    useState(false);

  /* -------------------------------------------------------
     STATUS / NOTE
  ------------------------------------------------------- */

  const [actionLoading, setActionLoading] =
    useState(false);

  const [adminNote, setAdminNote] =
    useState("");

  const [noteSaving, setNoteSaving] =
    useState(false);

  /* -------------------------------------------------------
     MOBILE
  ------------------------------------------------------- */

  const [isMobile, setIsMobile] =
    useState(false);

  const [mobileDetailOpen, setMobileDetailOpen] =
    useState(false);

  /* -------------------------------------------------------
     TOAST
  ------------------------------------------------------- */

  const [toast, setToast] =
    useState({
      visible: false,
      type: "success",
      message: "",
    });

  /* =======================================================
     RESPONSIVE
  ======================================================= */

  useEffect(() => {
    const onResize = () => {
      setIsMobile(
        window.innerWidth <= 900
      );
    };

    onResize();

    window.addEventListener(
      "resize",
      onResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        onResize
      );
    };
  }, []);

  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = useCallback(
    (type, message) => {
      setToast({
        visible: true,
        type,
        message,
      });

      window.setTimeout(() => {
        setToast((previous) => ({
          ...previous,
          visible: false,
        }));
      }, 4500);
    },
    []
  );

  const hideToast = () => {
    setToast((previous) => ({
      ...previous,
      visible: false,
    }));
  };

  /* =======================================================
     LOAD ENQUIRIES
  ======================================================= */

  const loadEnquiries = useCallback(
    async (showSpinner = false) => {
      if (showSpinner) {
        setRefreshing(true);
      }

      setError("");

      try {
        const params =
          new URLSearchParams();

        if (query.trim()) {
          params.set(
            "search",
            query.trim()
          );
        }

        if (
          statusFilter !== "all"
        ) {
          params.set(
            "status",
            statusFilter
          );
        }

        if (
          typeFilter !== "all"
        ) {
          params.set(
            "requestType",
            typeFilter
          );
        }

        params.set("page", "1");
        params.set("limit", "100");

        const response =
          await fetch(
            `${API_URL}/contact-inquiries/admin?${params.toString()}`,
            {
              method: "GET",
              headers: JSON_HEADERS,
              credentials: "include",
              cache: "no-store",
            }
          );

        const payload =
          await response
            .json()
            .catch(
              () => ({})
            );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            "Admin session expired. Please login again."
          );
        }

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              "Failed to load enquiries."
          );
        }

        setItems(
          Array.isArray(
            payload?.data
          )
            ? payload.data
            : []
        );

        setTotal(
          Number(
            payload?.pagination
              ?.total || 0
          )
        );

        setUnreadCount(
          Number(
            payload?.unreadCount ||
              0
          )
        );
      } catch (requestError) {
        console.error(
          "Admin enquiries load error:",
          requestError
        );

        const message =
          requestError?.message ||
          "Failed to load enquiries.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      query,
      statusFilter,
      typeFilter,
    ]
  );

  /* =======================================================
     INITIAL + FILTER LOAD
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        loadEnquiries(false);
      }, 250);

    return () =>
      window.clearTimeout(
        timer
      );
  }, [loadEnquiries]);

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        loadEnquiries(false);
      }, 15000);

    return () =>
      window.clearInterval(
        timer
      );
  }, [loadEnquiries]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(
    () => [
      {
        title: "All Enquiries",
        value: String(total),
        text: "Customer queries",
        icon: MessageSquareText,
      },
      {
        title: "New",
        value: String(
          unreadCount
        ),
        text: "Unread messages",
        icon: Mail,
      },
      {
        title: "Follow Up",
        value: String(
          items.filter(
            (item) =>
              item.status ===
                "in_progress"
          ).length
        ),
        text: "Need response",
        icon: PhoneCall,
      },
      {
        title: "Pending",
        value: String(
          items.filter(
            (item) =>
              item.status ===
              "new"
          ).length
        ),
        text: "Awaiting action",
        icon: Clock3,
      },
    ],
    [
      total,
      unreadCount,
      items,
    ]
  );

  /* =======================================================
     OPEN DETAIL
  ======================================================= */

  const openInquiry = async (
    id,
    wasUnread = false
  ) => {
    if (!id) {
      return;
    }

    setSelectedId(id);
    setSelected(null);
    setDetailLoading(true);
    setMobileDetailOpen(true);
    setReply("");
    setAdminNote("");

    try {
      const response =
        await fetch(
          `${API_URL}/contact-inquiries/admin/${id}`,
          {
            method: "GET",
            headers: JSON_HEADERS,
            credentials: "include",
            cache: "no-store",
          }
        );

      const payload =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "Admin session expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            "Failed to load enquiry."
        );
      }

      const enquiry =
        payload?.data || null;

      setSelected(
        enquiry
      );

      setAdminNote(
        enquiry?.adminNote ||
          ""
      );

      setItems(
        (current) =>
          current.map(
            (item) =>
              String(item._id) ===
              String(id)
                ? {
                    ...item,
                    isRead:
                      true,
                  }
                : item
          )
      );

      if (wasUnread) {
        setUnreadCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );
      }
    } catch (requestError) {
      console.error(
        "Open enquiry error:",
        requestError
      );

      setError(
        requestError?.message ||
          "Failed to open enquiry."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /* =======================================================
     STATUS UPDATE
  ======================================================= */

  const updateStatus =
    async (nextStatus) => {
      if (
        !selectedId ||
        actionLoading
      ) {
        return;
      }

      setActionLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/contact-inquiries/admin/${selectedId}/status`,
            {
              method: "PATCH",
              headers: JSON_HEADERS,
              credentials: "include",
              body: JSON.stringify({
                status:
                  nextStatus,
              }),
            }
          );

        const payload =
          await response
            .json()
            .catch(
              () => ({})
            );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            "Admin session expired. Please login again."
          );
        }

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              "Failed to update status."
          );
        }

        const updated =
          payload?.data ||
          null;

        setSelected(
          updated
            ? {
                ...selected,
                ...updated,
              }
            : {
                ...selected,
                status:
                  nextStatus,
              }
        );

        setItems(
          (current) =>
            current.map(
              (item) =>
                String(item._id) ===
                String(selectedId)
                  ? {
                      ...item,
                      status:
                        nextStatus,
                    }
                  : item
            )
        );

        showToast(
          "success",
          `Enquiry status changed to ${
            STATUS_META[
              nextStatus
            ]?.label ||
            nextStatus
          }.`
        );
      } catch (requestError) {
        console.error(
          "Update status error:",
          requestError
        );

        setError(
          requestError?.message ||
            "Failed to update status."
        );

        showToast(
          "error",
          requestError?.message ||
            "Failed to update status."
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* =======================================================
     SAVE ADMIN NOTE
  ======================================================= */

  const saveAdminNote =
    async () => {
      if (
        !selectedId ||
        noteSaving
      ) {
        return;
      }

      setNoteSaving(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/contact-inquiries/admin/${selectedId}/note`,
            {
              method: "PATCH",
              headers: JSON_HEADERS,
              credentials: "include",
              body: JSON.stringify({
                adminNote:
                  adminNote.trim(),
              }),
            }
          );

        const payload =
          await response
            .json()
            .catch(
              () => ({})
            );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            "Admin session expired. Please login again."
          );
        }

        if (!response.ok) {
          throw new Error(
            payload?.message ||
              "Failed to save admin note."
          );
        }

        const updated =
          payload?.data ||
          null;

        if (updated) {
          setSelected(
            updated
          );
        }

        showToast(
          "success",
          "Admin note saved successfully."
        );
      } catch (requestError) {
        console.error(
          "Save admin note error:",
          requestError
        );

        setError(
          requestError?.message ||
            "Failed to save admin note."
        );

        showToast(
          "error",
          requestError?.message ||
            "Failed to save admin note."
        );
      } finally {
        setNoteSaving(false);
      }
    };

  /* =======================================================
     SEND REPLY
  ======================================================= */

  const sendReply = async (
    event
  ) => {
    event.preventDefault();

    const message =
      reply.trim();

    if (
      !selectedId ||
      !message ||
      replySending
    ) {
      return;
    }

    setReplySending(true);
    setError("");

    try {
      const response =
        await fetch(
          `${API_URL}/contact-inquiries/admin/${selectedId}/reply`,
          {
            method: "POST",
            headers: JSON_HEADERS,
            credentials: "include",
            body: JSON.stringify({
              message,
            }),
          }
        );

      const payload =
        await response
          .json()
          .catch(
            () => ({})
          );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "Admin session expired. Please login again."
        );
      }

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            "Failed to send reply."
        );
      }

      const updated =
        payload?.data ||
        null;

      if (updated) {
        setSelected(
          updated
        );
      }

      setReply("");

      setItems(
        (current) =>
          current.map(
            (item) =>
              String(item._id) ===
              String(selectedId)
                ? {
                    ...item,
                    status:
                      "replied",
                    isRead:
                      true,
                    lastReplyAt:
                      new Date().toISOString(),
                  }
                : item
          )
      );

      showToast(
        "success",
        "Reply sent successfully to the customer."
      );
    } catch (requestError) {
      console.error(
        "Send reply error:",
        requestError
      );

      setError(
        requestError?.message ||
          "Failed to send reply."
      );

      showToast(
        "error",
        requestError?.message ||
          "Failed to send reply."
      );
    } finally {
      setReplySending(false);
    }
  };

  /* =======================================================
     CLOSE MOBILE DETAIL
  ======================================================= */

  const closeDetail = () => {
    setMobileDetailOpen(
      false
    );
  };

  /* =======================================================
     STYLES
  ======================================================= */

  const pageStyle = {
    width: "100%",
    minHeight:
      "calc(100vh - 140px)",
    boxSizing: "border-box",
    fontFamily:
      "Poppins, Arial, Helvetica, sans-serif",
    color: "#1A1A1A",
  };

  const panelStyle = {
    background: "#FFFFFF",
    border:
      "1px solid rgba(41,92,101,0.10)",
    borderRadius: "14px",
    boxShadow:
      "0 8px 28px rgba(20,40,42,0.05)",
  };

  return (
    <div style={pageStyle}>
      <Toast
        toast={toast}
        onClose={hideToast}
      />

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div
        style={{
          display: "flex",
          alignItems: isMobile
            ? "flex-start"
            : "center",
          justifyContent:
            "space-between",
          gap: "18px",
          marginBottom: "20px",
          flexDirection: isMobile
            ? "column"
            : "row",
        }}
      >
        <div>
          <div
            style={{
              color: "#BE9D6B",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing:
                "2px",
              textTransform:
                "uppercase",
              marginBottom:
                "6px",
            }}
          >
            CUSTOMER COMMUNICATION
          </div>

          <div
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "10px",
              flexWrap:
                "wrap",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontFamily:
                  "Cormorant Garamond, Georgia, serif",
                fontSize:
                  isMobile
                    ? "32px"
                    : "40px",
                lineHeight: 1,
                color: "#173E44",
                fontWeight: 600,
              }}
            >
              Enquiries
            </h1>

            <span
              style={{
                padding:
                  "5px 9px",
                borderRadius:
                  "999px",
                background:
                  unreadCount >
                  0
                    ? "#FCEDE7"
                    : "#EEF0EF",
                color:
                  unreadCount >
                  0
                    ? "#C1502C"
                    : "#687274",
                fontSize: "10px",
                fontWeight: 800,
              }}
            >
              {unreadCount} new
            </span>
          </div>

          <p
            style={{
              margin:
                "8px 0 0",
              color:
                "#707878",
              fontSize: "12px",
              lineHeight: 1.5,
            }}
          >
            Manage contact enquiries and quote requests.
            Replies are sent directly to the customer by email.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadEnquiries(
              true
            )
          }
          disabled={
            refreshing
          }
          style={{
            display: "inline-flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            gap: "7px",
            minHeight:
              "40px",
            padding:
              "0 14px",
            border:
              "1px solid #D8E1DF",
            borderRadius: "9px",
            background:
              "#FFFFFF",
            color: "#295C65",
            fontSize: "11px",
            fontWeight: 800,
            cursor:
              refreshing
                ? "wait"
                : "pointer",
            alignSelf:
              isMobile
                ? "stretch"
                : "auto",
          }}
        >
          <RefreshCw
            size={14}
            style={{
              animation:
                refreshing
                  ? "adminSpin 0.8s linear infinite"
                  : "none",
            }}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      <style jsx>{`
        @keyframes adminSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns:
            isMobile
              ? "1fr 1fr"
              : "repeat(4, minmax(0, 1fr))",
          gap: "14px",
        }}
      >
        {summary.map(
          (item) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.title
                }
                style={{
                  minHeight:
                    isMobile
                      ? "125px"
                      : "145px",
                  boxSizing:
                    "border-box",
                  padding:
                    isMobile
                      ? "15px"
                      : "20px",
                  background:
                    "#FAF8F5",
                  border:
                    "1px solid #E1DAD2",
                  borderRadius:
                    "13px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "flex-start",
                    justifyContent:
                      "space-between",
                    gap: "10px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color:
                          "#7C7872",
                        fontSize:
                          "9px",
                        fontWeight:
                          700,
                        letterSpacing:
                          "0.8px",
                        textTransform:
                          "uppercase",
                      }}
                    >
                      {item.title}
                    </p>

                    <h3
                      style={{
                        margin:
                          "8px 0 0",
                        color:
                          "#295C65",
                        fontFamily:
                          "Georgia, 'Times New Roman', serif",
                        fontSize:
                          isMobile
                            ? "25px"
                            : "29px",
                        fontWeight:
                          600,
                      }}
                    >
                      {item.value}
                    </h3>
                  </div>

                  <div
                    style={{
                      width:
                        isMobile
                          ? "34px"
                          : "39px",
                      height:
                        isMobile
                          ? "34px"
                          : "39px",
                      flexShrink: 0,
                      borderRadius:
                        "9px",
                      background:
                        "#F2EEE9",
                      color:
                        "#295C65",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    <Icon
                      size={
                        isMobile
                          ? 16
                          : 18
                      }
                    />
                  </div>
                </div>

                <p
                  style={{
                    margin:
                      "17px 0 0",
                    color:
                      "#88847E",
                    fontSize:
                      "9px",
                  }}
                >
                  {item.text}
                </p>
              </div>
            );
          }
        )}
      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error ? (
        <div
          style={{
            marginTop:
              "14px",
            padding:
              "11px 13px",
            display:
              "flex",
            alignItems:
              "center",
            gap: "8px",
            borderRadius:
              "9px",
            background:
              "#FCEDE7",
            border:
              "1px solid #F0CFC4",
            color:
              "#8F3B2D",
            fontSize:
              "11px",
          }}
        >
          <AlertCircle
            size={15}
          />
          <span>
            {error}
          </span>
        </div>
      ) : null}

      {/* ===================================================
          MAIN ENQUIRY AREA
      =================================================== */}

      <div
        style={{
          marginTop:
            "18px",
          display:
            "grid",
          gridTemplateColumns:
            isMobile
              ? "1fr"
              : "minmax(0, 0.95fr) minmax(0, 1.35fr)",
          gap: "16px",
          alignItems:
            "start",
        }}
      >
        {/* =================================================
            LIST
        ================================================= */}

        <section
          style={{
            ...panelStyle,
            overflow:
              "hidden",
          }}
        >
          <div
            style={{
              padding:
                "14px",
              borderBottom:
                "1px solid #ECE8E3",
              display:
                "grid",
              gridTemplateColumns:
                isMobile
                  ? "1fr"
                  : "minmax(0, 1fr) 145px 125px",
              gap: "8px",
            }}
          >
            {/* SEARCH */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "8px",
                height:
                  "38px",
                padding:
                  "0 11px",
                border:
                  "1px solid #E0E5E4",
                borderRadius:
                  "8px",
                background:
                  "#FBFAF8",
              }}
            >
              <Search
                size={15}
                color="#899192"
              />

              <input
                value={
                  query
                }
                onChange={(
                  event
                ) =>
                  setQuery(
                    event.target
                      .value
                  )
                }
                placeholder="Search name, email, phone, fabric..."
                style={{
                  width:
                    "100%",
                  border:
                    0,
                  outline:
                    0,
                  background:
                    "transparent",
                  font:
                    "inherit",
                  fontSize:
                    "11px",
                  color:
                    "#26383C",
                }}
              />
            </div>

            {/* STATUS */}

            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              style={{
                width:
                  "100%",
                height:
                  "38px",
                border:
                  "1px solid #E0E5E4",
                borderRadius:
                  "8px",
                background:
                  "#FBFAF8",
                padding:
                  "0 10px",
                font:
                  "inherit",
                fontSize:
                  "11px",
                color:
                  "#26383C",
                outline:
                  0,
              }}
            >
              <option value="all">
                All status
              </option>
              <option value="new">
                New
              </option>
              <option value="in_progress">
                In Progress
              </option>
              <option value="replied">
                Replied
              </option>
              <option value="closed">
                Closed
              </option>
            </select>

            {/* TYPE */}

            <select
              value={
                typeFilter
              }
              onChange={(
                event
              ) =>
                setTypeFilter(
                  event.target
                    .value
                )
              }
              style={{
                width:
                  "100%",
                height:
                  "38px",
                border:
                  "1px solid #E0E5E4",
                borderRadius:
                  "8px",
                background:
                  "#FBFAF8",
                padding:
                  "0 10px",
                font:
                  "inherit",
                fontSize:
                  "11px",
                color:
                  "#26383C",
                outline:
                  0,
              }}
            >
              <option value="all">
                All requests
              </option>
              <option value="contact">
                Contact
              </option>
              <option value="quote">
                Quote
              </option>
            </select>
          </div>

          <div
            style={{
              maxHeight:
                isMobile
                  ? "none"
                  : "calc(100vh - 340px)",
              overflowY:
                "auto",
            }}
          >
            {loading ? (
              <div
                style={{
                  padding:
                    "35px 20px",
                  textAlign:
                    "center",
                  color:
                    "#7B8384",
                  fontSize:
                    "12px",
                }}
              >
                Loading enquiries...
              </div>
            ) : items.length ===
              0 ? (
              <div
                style={{
                  padding:
                    "50px 20px",
                  textAlign:
                    "center",
                }}
              >
                <MessageCircle
                  size={26}
                  color="#A6AEAE"
                />

                <div
                  style={{
                    marginTop:
                      "10px",
                    fontSize:
                      "14px",
                    fontWeight:
                      700,
                    color:
                      "#314043",
                  }}
                >
                  No enquiries found
                </div>

                <div
                  style={{
                    marginTop:
                      "5px",
                    fontSize:
                      "11px",
                    color:
                      "#7C8384",
                  }}
                >
                  New website contact requests and quote requests will appear here.
                </div>
              </div>
            ) : (
              items.map(
                (item) => {
                  const active =
                    String(
                      selectedId
                    ) ===
                    String(
                      item._id
                    );

                  const requestTypeStyle =
                    getRequestTypeStyle(
                      item
                    );

                  return (
                    <button
                      key={
                        item._id
                      }
                      type="button"
                      onClick={() =>
                        openInquiry(
                          item._id,
                          !item.isRead
                        )
                      }
                      style={{
                        width:
                          "100%",
                        border:
                          0,
                        borderBottom:
                          "1px solid #EEEAE4",
                        background:
                          active
                            ? "#F2F7F6"
                            : "#FFFFFF",
                        padding:
                          "14px",
                        textAlign:
                          "left",
                        cursor:
                          "pointer",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap:
                            "10px",
                          alignItems:
                            "flex-start",
                        }}
                      >
                        <div
                          style={{
                            minWidth:
                              0,
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "7px",
                            }}
                          >
                            {!item.isRead ? (
                              <span
                                style={{
                                  width:
                                    "7px",
                                  height:
                                    "7px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    "#C1502C",
                                  flexShrink:
                                    0,
                                }}
                              />
                            ) : null}

                            <span
                              style={{
                                fontSize:
                                  "13px",
                                fontWeight:
                                  800,
                                color:
                                  "#21383D",
                                overflow:
                                  "hidden",
                                textOverflow:
                                  "ellipsis",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {item.name}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop:
                                "5px",
                              color:
                                "#6E7677",
                              fontSize:
                                "10px",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {item.email}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              color:
                                "#8D9494",
                              fontSize:
                                "10px",
                              overflow:
                                "hidden",
                              textOverflow:
                                "ellipsis",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {item.fabric}
                            {" · "}
                            {item.city}
                          </div>
                        </div>

                        <div
                          style={{
                            display:
                              "flex",
                            flexDirection:
                              "column",
                            alignItems:
                              "flex-end",
                            gap:
                              "5px",
                          }}
                        >
                          <span
                            style={{
                              ...getStatusStyle(
                                item.status
                              ),
                            }}
                          >
                            {STATUS_META[
                              item.status
                            ]?.label ||
                              item.status}
                          </span>

                          <span
                            style={{
                              padding:
                                "4px 7px",
                              borderRadius:
                                "999px",
                              background:
                                requestTypeStyle.background,
                              color:
                                requestTypeStyle.color,
                              fontSize:
                                "8px",
                              fontWeight:
                                800,
                            }}
                          >
                            {item.requestType ===
                            "quote"
                              ? "QUOTE"
                              : "CONTACT"}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop:
                            "9px",
                          color:
                            "#9A9F9F",
                          fontSize:
                            "9px",
                        }}
                      >
                        {formatDate(
                          item.createdAt
                        )}
                      </div>
                    </button>
                  );
                }
              )
            )}
          </div>
        </section>

        {/* =================================================
            DETAIL
        ================================================= */}

        {(!isMobile ||
          mobileDetailOpen) ? (
          <section
            style={{
              ...panelStyle,
              minHeight:
                isMobile
                  ? "100vh"
                  : "550px",
              overflow:
                "hidden",
              position:
                isMobile
                  ? "fixed"
                  : "relative",
              inset:
                isMobile
                  ? 0
                  : "auto",
              zIndex:
                isMobile
                  ? 2000
                  : "auto",
              borderRadius:
                isMobile
                  ? 0
                  : "14px",
              display:
                "flex",
              flexDirection:
                "column",
              background:
                "#FFFFFF",
            }}
          >
            {/* MOBILE HEADER */}

            {isMobile ? (
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  padding:
                    "14px 16px",
                  borderBottom:
                    "1px solid #ECE8E3",
                }}
              >
                <strong
                  style={{
                    fontSize:
                      "13px",
                    color:
                      "#21383D",
                  }}
                >
                  Enquiry Details
                </strong>

                <button
                  type="button"
                  onClick={
                    closeDetail
                  }
                  style={{
                    border:
                      0,
                    background:
                      "transparent",
                    padding:
                      "4px",
                    color:
                      "#617071",
                    cursor:
                      "pointer",
                  }}
                >
                  <X
                    size={18}
                  />
                </button>
              </div>
            ) : null}

            {detailLoading ? (
              <div
                style={{
                  padding:
                    "50px",
                  textAlign:
                    "center",
                  color:
                    "#7B8384",
                  fontSize:
                    "12px",
                }}
              >
                Loading enquiry...
              </div>
            ) : !selected ? (
              <div
                style={{
                  padding:
                    "80px 30px",
                  textAlign:
                    "center",
                }}
              >
                <Mail
                  size={29}
                  color="#A6AEAE"
                />

                <div
                  style={{
                    marginTop:
                      "12px",
                    color:
                      "#314043",
                    fontWeight:
                      700,
                    fontSize:
                      "15px",
                  }}
                >
                  Select an enquiry
                </div>

                <div
                  style={{
                    marginTop:
                      "6px",
                    color:
                      "#7C8384",
                    fontSize:
                      "11px",
                  }}
                >
                  Customer details, message history and reply controls will appear here.
                </div>
              </div>
            ) : (
              <>
                {/* DETAIL HEADER */}

                <div
                  style={{
                    padding:
                      "18px",
                    borderBottom:
                      "1px solid #ECE8E3",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      gap:
                        "12px",
                      alignItems:
                        "flex-start",
                    }}
                  >
                    <div
                      style={{
                        minWidth:
                          0,
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "8px",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <h2
                          style={{
                            margin:
                              0,
                            color:
                              "#173E44",
                            fontFamily:
                              "Cormorant Garamond, Georgia, serif",
                            fontSize:
                              "30px",
                            fontWeight:
                              600,
                          }}
                        >
                          {
                            selected.name
                          }
                        </h2>

                        <span
                          style={getStatusStyle(
                            selected.status
                          )}
                        >
                          {
                            STATUS_META[
                              selected.status
                            ]?.label
                          }
                        </span>

                        <span
                          style={{
                            padding:
                              "5px 8px",
                            borderRadius:
                              "999px",
                            background:
                              selected.requestType ===
                              "quote"
                                ? "#FBF3DF"
                                : "#E9F2F3",
                            color:
                              selected.requestType ===
                              "quote"
                                ? "#8A6A2F"
                                : "#295C65",
                            fontSize:
                              "9px",
                            fontWeight:
                              800,
                          }}
                        >
                          {getRequestType(
                            selected
                          )}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop:
                            "5px",
                          color:
                            "#778081",
                          fontSize:
                            "10px",
                        }}
                      >
                        {formatDate(
                          selected.createdAt
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CUSTOMER INFO */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        isMobile
                          ? "1fr"
                          : "repeat(2, minmax(0, 1fr))",
                      gap:
                        "9px",
                      marginTop:
                        "15px",
                    }}
                  >
                    {[
                      {
                        label:
                          "Email",
                        value:
                          selected.email,
                        icon:
                          Mail,
                      },
                      {
                        label:
                          "Phone",
                        value:
                          selected.phone,
                        icon:
                          PhoneCall,
                      },
                      {
                        label:
                          "Company",
                        value:
                          selected.company ||
                          "—",
                        icon:
                          Building2,
                      },
                      {
                        label:
                          "Fabric",
                        value:
                          selected.fabric ||
                          "—",
                        icon:
                          Package,
                      },
                      {
                        label:
                          "Country / City",
                        value:
                          selected.city ||
                          "—",
                        icon:
                          MapPin,
                      },
                      {
                        label:
                          "Source",
                        value:
                          selected.source ||
                          "website",
                        icon:
                          MessageSquareText,
                      },
                    ].map(
                      ({
                        label,
                        value,
                        icon: Icon,
                      }) => (
                        <div
                          key={
                            label
                          }
                          style={{
                            padding:
                              "10px 11px",
                            borderRadius:
                              "8px",
                            background:
                              "#FAF8F5",
                            border:
                              "1px solid #EEEAE4",
                          }}
                        >
                          <div
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap:
                                "5px",
                              color:
                                "#9A9F9F",
                              fontSize:
                                "8px",
                              letterSpacing:
                                "0.7px",
                              fontWeight:
                                800,
                              textTransform:
                                "uppercase",
                            }}
                          >
                            <Icon
                              size={
                                10
                              }
                            />

                            {label}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",
                              color:
                                "#304246",
                              fontSize:
                                "11px",
                              fontWeight:
                                650,
                              wordBreak:
                                "break-word",
                            }}
                          >
                            {value}
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  {/* PRODUCT DETAILS */}

                  {selected.product &&
                  (
                    selected.product
                      .name ||
                    selected.product
                      .sku ||
                    selected.product
                      .variantId ||
                    selected.product
                      .selectedColor ||
                    selected.product
                      .selectedSize
                  ) ? (
                    <div
                      style={{
                        marginTop:
                          "12px",
                        padding:
                          "12px",
                        border:
                          "1px solid #E3D9C9",
                        borderRadius:
                          "9px",
                        background:
                          "#FCF9F4",
                      }}
                    >
                      <div
                        style={{
                          color:
                            "#8A6A2F",
                          fontSize:
                            "8px",
                          fontWeight:
                            800,
                          letterSpacing:
                            "1px",
                          textTransform:
                            "uppercase",
                        }}
                      >
                        Product / Variant
                      </div>

                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            isMobile
                              ? "1fr"
                              : "repeat(2, minmax(0, 1fr))",
                          gap:
                            "8px",
                          marginTop:
                            "8px",
                        }}
                      >
                        {[
                          [
                            "Product",
                            selected
                              .product
                              .name,
                          ],
                          [
                            "SKU",
                            selected
                              .product
                              .sku ||
                              "—",
                          ],
                          [
                            "Colour",
                            selected
                              .product
                              .selectedColor ||
                              "—",
                          ],
                          [
                            "Size",
                            selected
                              .product
                              .selectedSize ||
                              "—",
                          ],
                          [
                            "Variant ID",
                            selected
                              .product
                              .variantId ||
                              "—",
                          ],
                        ].map(
                          ([
                            label,
                            value,
                          ]) => (
                            <div
                              key={
                                label
                              }
                              style={{
                                padding:
                                  "7px 8px",
                                border:
                                  "1px solid #E9E1D7",
                                borderRadius:
                                  "7px",
                                background:
                                  "#FFFFFF",
                              }}
                            >
                              <div
                                style={{
                                  color:
                                    "#9A9187",
                                  fontSize:
                                    "7px",
                                  fontWeight:
                                    800,
                                  textTransform:
                                    "uppercase",
                                  letterSpacing:
                                    "0.6px",
                                }}
                              >
                                {
                                  label
                                }
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "3px",
                                  color:
                                    "#3B4547",
                                  fontSize:
                                    "10px",
                                  fontWeight:
                                    650,
                                  wordBreak:
                                    "break-word",
                                }}
                              >
                                {
                                  value ||
                                  "—"
                                }
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* STATUS */}

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "8px",
                      alignItems:
                        "center",
                      flexWrap:
                        "wrap",
                      marginTop:
                        "12px",
                    }}
                  >
                    <label
                      style={{
                        fontSize:
                          "10px",
                        color:
                          "#6F7778",
                        fontWeight:
                          700,
                      }}
                    >
                      Status:
                    </label>

                    <select
                      value={
                        selected.status
                      }
                      onChange={(
                        event
                      ) =>
                        updateStatus(
                          event
                            .target
                            .value
                        )
                      }
                      disabled={
                        actionLoading
                      }
                      style={{
                        height:
                          "32px",
                        border:
                          "1px solid #DCE4E2",
                        borderRadius:
                          "7px",
                        padding:
                          "0 8px",
                        fontSize:
                          "10px",
                        background:
                          "#FFFFFF",
                        color:
                          "#304246",
                        outline:
                          0,
                      }}
                    >
                      <option value="new">
                        New
                      </option>

                      <option value="in_progress">
                        In Progress
                      </option>

                      <option value="replied">
                        Replied
                      </option>

                      <option value="closed">
                        Closed
                      </option>
                    </select>

                    {actionLoading ? (
                      <span
                        style={{
                          color:
                            "#8A9292",
                          fontSize:
                            "9px",
                        }}
                      >
                        Updating...
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* CONVERSATION */}

                <div
                  style={{
                    flex:
                      1,
                    padding:
                      "16px 18px",
                    overflowY:
                      "auto",
                    minHeight:
                      "190px",
                  }}
                >
                  <div
                    style={{
                      marginBottom:
                        "12px",
                      color:
                        "#8A9292",
                      fontSize:
                        "9px",
                      fontWeight:
                        800,
                      letterSpacing:
                        "1px",
                      textTransform:
                        "uppercase",
                    }}
                  >
                    Conversation
                  </div>

                  {Array.isArray(
                    selected.messages
                  ) &&
                  selected.messages
                    .length > 0 ? (
                    selected.messages.map(
                      (
                        message
                      ) => {
                        const admin =
                          message.sender ===
                          "admin";

                        return (
                          <div
                            key={
                              message._id ||
                              `${message.createdAt}-${message.body}`
                            }
                            style={{
                              display:
                                "flex",
                              justifyContent:
                                admin
                                  ? "flex-end"
                                  : "flex-start",
                              marginBottom:
                                "10px",
                            }}
                          >
                            <div
                              style={{
                                maxWidth:
                                  isMobile
                                    ? "92%"
                                    : "78%",
                                padding:
                                  "11px 12px",
                                borderRadius:
                                  admin
                                    ? "12px 12px 4px 12px"
                                    : "12px 12px 12px 4px",
                                background:
                                  admin
                                    ? "#EAF2F0"
                                    : "#FAF8F5",
                                border:
                                  `1px solid ${
                                    admin
                                      ? "#D5E4E0"
                                      : "#ECE6DE"
                                  }`,
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap:
                                    "6px",
                                  color:
                                    admin
                                      ? "#295C65"
                                      : "#6E7778",
                                  fontSize:
                                    "9px",
                                  fontWeight:
                                    800,
                                }}
                              >
                                {admin ? (
                                  <CheckCircle2
                                    size={
                                      11
                                    }
                                  />
                                ) : (
                                  <UserRound
                                    size={
                                      11
                                    }
                                  />
                                )}

                                {admin
                                  ? "Admin"
                                  : selected.name}

                                <span
                                  style={{
                                    fontWeight:
                                      500,
                                    color:
                                      "#9BA1A1",
                                  }}
                                >
                                  {formatDate(
                                    message.createdAt
                                  )}
                                </span>
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "6px",
                                  whiteSpace:
                                    "pre-wrap",
                                  color:
                                    "#304246",
                                  fontSize:
                                    "11px",
                                  lineHeight:
                                    1.6,
                                }}
                              >
                                {
                                  message.body
                                }
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div
                      style={{
                        color:
                          "#7A8384",
                        fontSize:
                          "11px",
                      }}
                    >
                      No conversation messages available.
                    </div>
                  )}

                  {/* FALLBACK ORIGINAL MESSAGE */}

                  {selected.message &&
                  Array.isArray(
                    selected.messages
                  ) &&
                  !selected.messages.some(
                    (
                      message
                    ) =>
                      message.sender ===
                        "customer" &&
                      message.body ===
                        selected.message
                  ) ? (
                    <div
                      style={{
                        marginTop:
                          "10px",
                        padding:
                          "11px 12px",
                        borderRadius:
                          "10px",
                        background:
                          "#FAF8F5",
                        border:
                          "1px solid #ECE6DE",
                        color:
                          "#3A4A4E",
                        fontSize:
                          "11px",
                        lineHeight:
                          1.6,
                      }}
                    >
                      <strong
                        style={{
                          display:
                            "block",
                          marginBottom:
                            "5px",
                          color:
                            "#6B7475",
                          fontSize:
                            "9px",
                        }}
                      >
                        Original Message
                      </strong>

                      {
                        selected.message
                      }
                    </div>
                  ) : null}
                </div>

                {/* ADMIN NOTE */}

                <div
                  style={{
                    padding:
                      "12px 18px",
                    borderTop:
                      "1px solid #ECE8E3",
                    background:
                      "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap:
                        "8px",
                      marginBottom:
                        "7px",
                    }}
                  >
                    <label
                      htmlFor="admin-note"
                      style={{
                        color:
                          "#304246",
                        fontSize:
                          "10px",
                        fontWeight:
                          800,
                      }}
                    >
                      Private Admin Note
                    </label>

                    <span
                      style={{
                        color:
                          "#9A9F9F",
                        fontSize:
                          "8px",
                      }}
                    >
                      Only visible in admin
                    </span>
                  </div>

                  <textarea
                    id="admin-note"
                    value={
                      adminNote
                    }
                    onChange={(
                      event
                    ) =>
                      setAdminNote(
                        event.target
                          .value
                      )
                    }
                    placeholder="Add an internal note..."
                    rows={3}
                    disabled={
                      noteSaving
                    }
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      resize:
                        "vertical",
                      border:
                        "1px solid #DDE4E2",
                      borderRadius:
                        "8px",
                      background:
                        "#FBFAF8",
                      padding:
                        "9px 10px",
                      outline:
                        0,
                      font:
                        "inherit",
                      fontSize:
                        "10px",
                      color:
                        "#2D3C40",
                      lineHeight:
                        1.5,
                    }}
                  />

                  <button
                    type="button"
                    onClick={
                      saveAdminNote
                    }
                    disabled={
                      noteSaving
                    }
                    style={{
                      marginTop:
                        "7px",
                      width:
                        "100%",
                      minHeight:
                        "34px",
                      border:
                        "1px solid #D4DFDD",
                      borderRadius:
                        "8px",
                      background:
                        "#FFFFFF",
                      color:
                        "#295C65",
                      fontSize:
                        "10px",
                      fontWeight:
                        800,
                      cursor:
                        noteSaving
                          ? "wait"
                          : "pointer",
                    }}
                  >
                    {noteSaving
                      ? "Saving Note..."
                      : "Save Admin Note"}
                  </button>
                </div>

                {/* REPLY */}

                <form
                  onSubmit={
                    sendReply
                  }
                  style={{
                    padding:
                      "14px 18px 18px",
                    borderTop:
                      "1px solid #ECE8E3",
                    background:
                      "#FCFBF9",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      marginBottom:
                        "8px",
                      gap:
                        "8px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <label
                      htmlFor="admin-reply"
                      style={{
                        color:
                          "#304246",
                        fontSize:
                          "11px",
                        fontWeight:
                          800,
                      }}
                    >
                      Reply to{" "}
                      {
                        selected.email
                      }
                    </label>

                    <span
                      style={{
                        color:
                          "#8B9393",
                        fontSize:
                          "9px",
                      }}
                    >
                      Customer will receive this by email
                    </span>
                  </div>

                  <textarea
                    id="admin-reply"
                    value={
                      reply
                    }
                    onChange={(
                      event
                    ) =>
                      setReply(
                        event.target
                          .value
                      )
                    }
                    placeholder="Write your reply..."
                    rows={
                      isMobile
                        ? 5
                        : 4
                    }
                    disabled={
                      replySending
                    }
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      resize:
                        "vertical",
                      border:
                        "1px solid #DDE4E2",
                      borderRadius:
                        "9px",
                      background:
                        "#FFFFFF",
                      padding:
                        "11px",
                      outline:
                        0,
                      font:
                        "inherit",
                      fontSize:
                        "11px",
                      color:
                        "#2D3C40",
                      lineHeight:
                        1.55,
                    }}
                  />

                  <button
                    type="submit"
                    disabled={
                      !reply.trim() ||
                      replySending
                    }
                    style={{
                      marginTop:
                        "9px",
                      width:
                        "100%",
                      minHeight:
                        "40px",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap:
                        "7px",
                      border:
                        0,
                      borderRadius:
                        "8px",
                      background:
                        !reply.trim() ||
                        replySending
                          ? "#AEBDBA"
                          : "#295C65",
                      color:
                        "#FFFFFF",
                      fontSize:
                        "11px",
                      fontWeight:
                        800,
                      cursor:
                        !reply.trim() ||
                        replySending
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {replySending ? (
                      <RefreshCw
                        size={14}
                        style={{
                          animation:
                            "adminSpin 0.8s linear infinite",
                        }}
                      />
                    ) : (
                      <Send
                        size={14}
                      />
                    )}

                    {replySending
                      ? "Sending Reply..."
                      : "Send Reply"}
                  </button>
                </form>
              </>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}