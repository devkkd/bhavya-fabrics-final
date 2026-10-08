"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";
import { notifyCustomerAuthChanged } from "@/utils/storefrontSync";

import {

  UserRound,

  Package,

  MapPin,

  LogOut,

  ArrowLeft,

  Loader,

  ChevronRight,

} from "lucide-react";



const COLORS = {

  teal: "#295C65",

  cream: "#FAF8F5",

  darkCream: "#F2EEE9",

  gold: "#BE9D6B",

  navGray: "#696968",

  white: "#FFFFFF",

  ink: "#1A1A1A",

};



const API_URL = (

  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

).replace(/\/$/, "");



const STATUS_COLORS = {

  pending_approval: "#BE9D6B",

  pending: "#808080",

  confirmed: "#FFA500",

  packed: "#9370DB",

  shipped: "#3CB371",

  delivered: "#228B22",

  cancelled: "#DC143C",

  returned: "#FF6347",

};



const STATUS_LABELS = {

  pending_approval: "Waiting for Approval",

  pending: "Pending",

  confirmed: "Order Confirmed",

  packed: "Packed",

  shipped: "Shipped",

  delivered: "Delivered",

  cancelled: "Cancelled",

  returned: "Returned",

};



function money(value) {

  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN")}`;

}



function getImage(item) {

  return (

    item?.productImage ||

    item?.productImages?.[0]?.url ||

    item?.productImages?.[0] ||

    item?.variantSnapshot?.images?.[0]?.url ||

    item?.variantSnapshot?.images?.[0] ||

    item?.snapshot?.imageUrl ||

    ""

  );

}



function getColor(item) {

  const color = item?.selectedColor;

  if (!color) return "";

  if (typeof color === "string") return color;

  return color.name || color.value || "";

}



function getSize(item) {

  const size = item?.selectedSize;

  if (!size) return "";

  if (typeof size === "string") return size;

  return size.name || "";

}



function getSku(item) {

  return item?.sku || item?.variantSnapshot?.sku || "";

}



function formatDate(value, withTime = false) {

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

    ...(withTime

      ? { hour: "2-digit", minute: "2-digit" }

      : {}),

  });

}



function AccountSidebar({ router, active = "orders" }) {

  return (

    <>

      <nav className="mobile-account-nav" aria-label="Account navigation">

        <button

          type="button"

          className={`mobile-account-nav-button ${active === "profile" ? "active" : ""}`}

          onClick={() => router.push("/account?tab=profile")}

        >

          <UserRound />

          Profile

        </button>



        <button

          type="button"

          className={`mobile-account-nav-button ${active === "orders" ? "active" : ""}`}

          onClick={() => router.push("/account/orders")}

        >

          <Package />

          My Orders

        </button>



        <button

          type="button"

          className={`mobile-account-nav-button ${active === "addresses" ? "active" : ""}`}

          onClick={() => router.push("/account?tab=addresses")}

        >

          <MapPin />

          Addresses

        </button>



        <button

          type="button"

          className="mobile-account-nav-button"

          onClick={async () => {

            try {

              await fetch(`${API_URL}/customer-auth/logout`, {

                method: "POST",

                credentials: "include",

              });

            } finally {

              notifyCustomerAuthChanged();
              router.replace("/");

              router.refresh();

            }

          }}

        >

          <LogOut />

          Logout

        </button>

      </nav>



      <aside className="account-sidebar">

        <button

          type="button"

          className={`account-nav-button ${active === "profile" ? "active" : ""}`}

          onClick={() => router.push("/account?tab=profile")}

        >

          <UserRound className="account-nav-icon" />

          <span>Profile</span>

        </button>



        <button

          type="button"

          className={`account-nav-button ${active === "orders" ? "active" : ""}`}

          onClick={() => router.push("/account/orders")}

        >

          <Package className="account-nav-icon" />

          <span>My Orders</span>

        </button>



        <button

          type="button"

          className={`account-nav-button ${active === "addresses" ? "active" : ""}`}

          onClick={() => router.push("/account?tab=addresses")}

        >

          <MapPin className="account-nav-icon" />

          <span>Addresses</span>

        </button>



        <button

          type="button"

          className="account-nav-button"

          onClick={async () => {

            try {

              await fetch(`${API_URL}/customer-auth/logout`, {

                method: "POST",

                credentials: "include",

              });

            } finally {

              notifyCustomerAuthChanged();
              router.replace("/");

              router.refresh();

            }

          }}

        >

          <LogOut className="account-nav-icon" />

          <span>Logout</span>

        </button>

      </aside>

    </>

  );

}



export default function OrdersListPage() {

  const router = useRouter();



  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [selectedStatus, setSelectedStatus] = useState("all");



  useEffect(() => {

    let cancelled = false;



    async function fetchOrders() {

      try {

        setLoading(true);

        setError("");



        const params = new URLSearchParams({

          page: String(page),

          limit: "10",

        });



        if (selectedStatus !== "all") {

          params.set("status", selectedStatus);

        }



        const response = await fetch(`${API_URL}/orders?${params.toString()}`, {

          method: "GET",

          credentials: "include",

          cache: "no-store",

        });



        const data = await response.json().catch(() => ({}));



        if (!response.ok) {

          throw new Error(data.message || "Failed to load orders");

        }



        if (!cancelled) {

          setOrders(Array.isArray(data.orders) ? data.orders : []);

          setTotalPages(Math.max(1, Number(data.totalPages || 1)));

        }

      } catch (err) {

        if (!cancelled) {

          console.error("Error fetching customer orders:", err);

          setError(err.message || "Failed to load orders");

          setOrders([]);

        }

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    fetchOrders();



    return () => {

      cancelled = true;

    };

  }, [page, selectedStatus]);



  const filters = [

    { value: "all", label: "All Orders" },

    { value: "pending_approval", label: "Waiting Approval" },

    { value: "confirmed", label: "Confirmed" },

    { value: "packed", label: "Packed" },

    { value: "shipped", label: "Shipped" },

    { value: "delivered", label: "Delivered" },

    { value: "cancelled", label: "Cancelled" },

  ];



  return (

    <main className="account-page">

      <style>{`

        .account-page {

          width: 100%;

          min-height: 100vh;

          background: ${COLORS.cream};

          color: ${COLORS.ink};

          padding: 42px 0 70px;

          box-sizing: border-box;

          overflow-x: hidden;

        }



        .account-container {

          width: 100%;

          max-width: 1400px;

          margin: 0 auto;

          padding: 0 32px;

          box-sizing: border-box;

        }



        .account-header {

          width: 100%;

          max-width: 820px;

          margin: 0 auto 28px;

          text-align: left;

        }



        .account-title {

          margin: 0 0 7px;

          color: ${COLORS.teal};

          font-family: "Cormorant Garamond", Georgia, serif;

          font-size: 40px;

          font-weight: 500;

          line-height: 1;

        }



        .account-subtitle {

          margin: 0;

          color: ${COLORS.navGray};

          font-family: "Poppins", Arial, sans-serif;

          font-size: 13px;

          line-height: 1.5;

        }



        .account-layout {

          width: 100%;

          display: grid;

          grid-template-columns: 240px minmax(0, 1fr);

          gap: 28px;

          align-items: start;

        }



        .account-sidebar {

          width: 100%;

          display: flex;

          flex-direction: column;

          gap: 5px;

        }



        .account-nav-button {

          width: 100%;

          min-height: 54px;

          display: flex;

          align-items: center;

          gap: 15px;

          padding: 0 18px;

          border: none;

          border-left: 3px solid transparent;

          border-radius: 4px;

          background: transparent;

          color: ${COLORS.navGray};

          font-family: "Poppins", Arial, sans-serif;

          font-size: 13px;

          font-weight: 500;

          text-align: left;

          cursor: pointer;

          transition: background .2s ease, color .2s ease, border-color .2s ease;

        }



        .account-nav-button:hover {

          background: rgba(41, 92, 101, .05);

          color: ${COLORS.teal};

        }



        .account-nav-button.active {

          background: #E7EFED;

          color: ${COLORS.teal};

          border-left-color: ${COLORS.teal};

          font-weight: 600;

        }



        .account-nav-icon {

          width: 22px;

          height: 22px;

          flex-shrink: 0;

        }



        .account-content {

          width: 100%;

          min-width: 0;

          display: flex;

          flex-direction: column;

          gap: 18px;

        }



        .account-card {

          width: 100%;

          background: ${COLORS.white};

          border: 1px solid #E8E1DA;

          border-radius: 8px;

          padding: 18px 24px;

          box-sizing: border-box;

        }



        .account-card-header {

          width: 100%;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          margin-bottom: 18px;

        }



        .account-card-title {

          margin: 0;

          color: #173C46;

          font-family: "Cormorant Garamond", Georgia, serif;

          font-size: 22px;

          font-weight: 500;

          line-height: 1;

        }



        .back-link {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          color: ${COLORS.teal};

          text-decoration: none;

          font-family: "Poppins", Arial, sans-serif;

          font-size: 11px;

          font-weight: 600;

          margin-bottom: 15px;

        }



        .status-filter {

          display: flex;

          gap: 8px;

          flex-wrap: wrap;

          margin-bottom: 18px;

        }



        .status-filter button {

          min-height: 36px;

          padding: 0 13px;

          border: 1px solid #E1D9D1;

          border-radius: 5px;

          background: #fff;

          color: ${COLORS.navGray};

          font-family: "Poppins", Arial, sans-serif;

          font-size: 10px;

          cursor: pointer;

        }



        .status-filter button.active {

          background: #E7EFED;

          border-color: ${COLORS.teal};

          color: ${COLORS.teal};

          font-weight: 600;

        }



        .order-row {

          width: 100%;

          display: grid;

          grid-template-columns: 1.1fr 1.1fr 2.5fr 1fr auto;

          gap: 18px;

          align-items: center;

          padding: 18px 0;

          border-bottom: 1px solid #EFE9E2;

        }



        .order-row:last-child {

          border-bottom: 0;

        }



        .order-meta-label {

          display: block;

          margin-bottom: 5px;

          color: #858585;

          font-family: "Poppins", Arial, sans-serif;

          font-size: 9px;

          text-transform: uppercase;

          letter-spacing: .04em;

        }



        .order-meta-value {

          color: #24363A;

          font-family: "Poppins", Arial, sans-serif;

          font-size: 11px;

          line-height: 1.5;

        }



        .product-preview-list {

          display: flex;

          flex-direction: column;

          gap: 8px;

        }



        .product-preview {

          display: flex;

          align-items: center;

          gap: 10px;

          min-width: 0;

        }



        .product-image {

          width: 48px;

          height: 58px;

          flex: 0 0 48px;

          object-fit: cover;

          border-radius: 5px;

          background: #F2EEE9;

          border: 1px solid #E8E1DA;

        }



        .product-placeholder {

          width: 48px;

          height: 58px;

          flex: 0 0 48px;

          border-radius: 5px;

          background: #F2EEE9;

          border: 1px solid #E8E1DA;

          display: grid;

          place-items: center;

          color: #9C9994;

          font-size: 8px;

        }



        .product-preview-name {

          color: #25383D;

          font-family: "Poppins", Arial, sans-serif;

          font-size: 11px;

          font-weight: 600;

          line-height: 1.35;

        }



        .product-preview-details {

          margin-top: 3px;

          color: #777;

          font-family: "Poppins", Arial, sans-serif;

          font-size: 9px;

          line-height: 1.5;

        }



        .status-badge {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          min-height: 26px;

          padding: 0 9px;

          border-radius: 999px;

          color: #fff;

          font-family: "Poppins", Arial, sans-serif;

          font-size: 8px;

          font-weight: 600;

          white-space: nowrap;

        }



        .view-order-button {

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 4px;

          min-height: 34px;

          padding: 0 11px;

          border: 1px solid ${COLORS.teal};

          border-radius: 5px;

          background: ${COLORS.teal};

          color: #fff;

          font-family: "Poppins", Arial, sans-serif;

          font-size: 9px;

          font-weight: 600;

          text-decoration: none;

          white-space: nowrap;

        }



        .empty-state,

        .error-state,

        .loading-state {

          min-height: 180px;

          display: flex;

          align-items: center;

          justify-content: center;

          flex-direction: column;

          text-align: center;

          color: ${COLORS.navGray};

          font-family: "Poppins", Arial, sans-serif;

          font-size: 12px;

        }



        .error-state {

          color: #A64C40;

        }



        .pagination {

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          margin-top: 18px;

        }



        .pagination button {

          min-width: 34px;

          height: 34px;

          padding: 0 9px;

          border: 1px solid #E1D9D1;

          border-radius: 5px;

          background: #fff;

          color: ${COLORS.navGray};

          cursor: pointer;

          font-family: "Poppins", Arial, sans-serif;

          font-size: 10px;

        }



        .pagination button.active {

          background: ${COLORS.teal};

          border-color: ${COLORS.teal};

          color: #fff;

        }



        .pagination button:disabled {

          opacity: .45;

          cursor: not-allowed;

        }



        .mobile-account-nav {

          display: none;

        }



        @media (max-width: 900px) {

          .account-container {

            padding: 0 20px;

          }



          .account-layout {

            grid-template-columns: 210px minmax(0, 1fr);

            gap: 20px;

          }



          .order-row {

            grid-template-columns: 1fr 1fr;

            gap: 14px;

          }



          .order-row > :nth-child(3) {

            grid-column: 1 / -1;

          }

        }



        @media (max-width: 680px) {

          .account-page {

            padding: 28px 0 55px;

          }



          .account-container {

            padding: 0 14px;

          }



          .account-header {

            margin-bottom: 18px;

          }



          .account-title {

            font-size: 34px;

          }



          .account-subtitle {

            font-size: 11px;

          }



          .account-layout {

            display: block;

          }



          .account-sidebar {

            display: none;

          }



          .mobile-account-nav {

            width: 100%;

            display: grid;

            grid-template-columns: repeat(4, minmax(0, 1fr));

            gap: 5px;

            margin-bottom: 16px;

          }



          .mobile-account-nav-button {

            min-width: 0;

            min-height: 54px;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 4px;

            padding: 6px 2px;

            border: 1px solid #E8E1DA;

            border-radius: 5px;

            background: #fff;

            color: ${COLORS.navGray};

            font-family: "Poppins", Arial, sans-serif;

            font-size: 8px;

            cursor: pointer;

          }



          .mobile-account-nav-button svg {

            width: 18px;

            height: 18px;

          }



          .mobile-account-nav-button.active {

            background: #E7EFED;

            border-color: ${COLORS.teal};

            color: ${COLORS.teal};

            font-weight: 600;

          }



          .account-card {

            padding: 15px;

          }



          .order-row {

            display: block;

            padding: 16px 0;

          }



          .order-row > div {

            margin-bottom: 12px;

          }



          .order-row > div:last-child {

            margin-bottom: 0;

          }



          .product-preview {

            align-items: flex-start;

          }



          .view-order-button {

            width: 100%;

          }



          .status-filter {

            overflow-x: auto;

            flex-wrap: nowrap;

            padding-bottom: 4px;

          }



          .status-filter button {

            flex: 0 0 auto;

          }

        }

      `}</style>



      <div className="account-container">

        <header className="account-header">

          <h1 className="account-title">My Orders</h1>

          <p className="account-subtitle">

            View your live order history, products, variants and delivery status.

          </p>

        </header>



        <div className="account-layout">

          <AccountSidebar router={router} active="orders" />



          <section className="account-content">

            <div className="account-card">

              <Link href="/account?tab=profile" className="back-link">

                <ArrowLeft size={14} />

                Back to Account

              </Link>



              <div className="account-card-header">

                <h2 className="account-card-title">Order History</h2>

              </div>



              <div className="status-filter">

                {filters.map((filter) => (

                  <button

                    key={filter.value}

                    type="button"

                    className={selectedStatus === filter.value ? "active" : ""}

                    onClick={() => {

                      setSelectedStatus(filter.value);

                      setPage(1);

                    }}

                  >

                    {filter.label}

                  </button>

                ))}

              </div>



              {loading ? (

                <div className="loading-state">

                  <Loader

                    size={30}

                    style={{ animation: "spin 1s linear infinite" }}

                  />

                  <div style={{ marginTop: 12 }}>Loading your orders...</div>

                </div>

              ) : error ? (

                <div className="error-state">

                  <div>{error}</div>

                  <button

                    type="button"

                    onClick={() => window.location.reload()}

                    style={{

                      marginTop: 12,

                      border: "1px solid #A64C40",

                      background: "#fff",

                      color: "#A64C40",

                      borderRadius: 5,

                      padding: "8px 13px",

                      cursor: "pointer",

                    }}

                  >

                    Retry

                  </button>

                </div>

              ) : orders.length === 0 ? (

                <div className="empty-state">

                  <Package size={34} style={{ marginBottom: 10, color: "#BE9D6B" }} />

                  <div>

                    {selectedStatus === "all"

                      ? "You haven't placed any orders yet."

                      : `No orders found with status "${selectedStatus}".`}

                  </div>

                  <Link

                    href="/products"

                    style={{

                      marginTop: 13,

                      color: COLORS.teal,

                      fontSize: 10,

                      fontWeight: 600,

                      textDecoration: "none",

                    }}

                  >

                    Start Shopping

                  </Link>

                </div>

              ) : (

                <>

                  {orders.map((order) => (

                    <div className="order-row" key={order._id}>

                      <div>

                        <span className="order-meta-label">Order</span>

                        <div className="order-meta-value">

                          \#{order.orderNumber || order._id}

                        </div>

                      </div>



                      <div>

                        <span className="order-meta-label">Placed</span>

                        <div className="order-meta-value">

                          {formatDate(order.createdAt)}

                        </div>

                      </div>



                      <div>

                        <span className="order-meta-label">Products</span>

                        <div className="product-preview-list">

                          {(order.items || []).map((item, index) => {

                            const image = getImage(item);

                            const color = getColor(item);

                            const size = getSize(item);

                            const sku = getSku(item);



                            return (

                              <div

                                className="product-preview"

                                key={`${order._id}-${item._id || index}`}

                              >

                                {image ? (

                                  <img

                                    className="product-image"

                                    src={image}

                                    alt={item.productName || "Product"}

                                  />

                                ) : (

                                  <div className="product-placeholder">

                                    No image

                                  </div>

                                )}



                                <div style={{ minWidth: 0 }}>

                                  <div className="product-preview-name">

                                    {item.productName || "Product"}

                                  </div>

                                  <div className="product-preview-details">

                                    Qty: {item.quantity || 1}

                                    {color ? ` • Color: ${color}` : ""}

                                    {size ? ` • Size: ${size}` : ""}

                                    {sku ? ` • SKU: ${sku}` : ""}

                                  </div>

                                </div>

                              </div>

                            );

                          })}

                        </div>

                      </div>



                      <div>

                        <span className="order-meta-label">Total</span>

                        <div className="order-meta-value" style={{ fontWeight: 600 }}>

                          {money(order?.pricing?.total)}

                        </div>

                      </div>



                      <div>

                        <span className="order-meta-label">Status</span>

                        <span

                          className="status-badge"

                          style={{

                            background:

                              STATUS_COLORS[order.status] || COLORS.teal,

                          }}

                        >

                          {STATUS_LABELS[order.status] || order.status}

                        </span>

                      </div>



                      <div>

                        <Link

                          className="view-order-button"

                          href={`/account/orders/${order._id}`}

                        >

                          View

                          <ChevronRight size={13} />

                        </Link>

                      </div>

                    </div>

                  ))}



                  {totalPages > 1 && (

                    <div className="pagination">

                      <button

                        type="button"

                        disabled={page <= 1}

                        onClick={() => setPage((current) => Math.max(1, current - 1))}

                      >

                        Prev

                      </button>



                      {Array.from({ length: totalPages }, (_, index) => index + 1).map(

                        (pageNumber) => (

                          <button

                            type="button"

                            key={pageNumber}

                            className={page === pageNumber ? "active" : ""}

                            onClick={() => setPage(pageNumber)}

                          >

                            {pageNumber}

                          </button>

                        )

                      )}



                      <button

                        type="button"

                        disabled={page >= totalPages}

                        onClick={() =>

                          setPage((current) => Math.min(totalPages, current + 1))

                        }

                      >

                        Next

                      </button>

                    </div>

                  )}

                </>

              )}

            </div>

          </section>

        </div>

      </div>



      <style jsx global>{`

        @keyframes spin {

          to { transform: rotate(360deg); }

        }

      `}</style>

    </main>

  );

}
