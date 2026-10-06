"use client";







import { useEffect, useState } from "react";



import { Loader, Eye, ShoppingBag, PackageCheck, Truck, IndianRupee } from "lucide-react";







const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";







const STATUS_COLORS = {



  confirmed: "#FFA500",



  packed: "#9370DB",



  shipped: "#3CB371",



  delivered: "#228B22",



  cancelled: "#DC143C",



};









const formatMoney = (value) => {

  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN")}`;

};



const getColorName = (color) => {

  if (!color) return "";

  if (typeof color === "string") return color;

  return color.name || color.value || "";

};



const getSizeName = (size) => {

  if (!size) return "";

  if (typeof size === "string") return size;

  return size.name || size.value || "";

};



const getItemImage = (item) => {

  if (item?.productImage) return item.productImage;



  const firstImage = Array.isArray(item?.productImages)

    ? item.productImages.find((image) => image?.url)?.url

    : "";



  return firstImage || "";

};



const getItemColor = (item) => {

  return getColorName(item?.selectedColor) || getColorName(item?.variantSnapshot?.color);

};



const getItemSize = (item) => {

  return getSizeName(item?.selectedSize) || getSizeName(item?.variantSnapshot?.size);

};



const getItemSku = (item) => {

  return (

    item?.sku ||

    item?.variantSnapshot?.sku ||

    ""

  );

};



export default function OrdersPage() {



  const [activeTab, setActiveTab] = useState("orders");



  const [orders, setOrders] = useState([]);



  const [loading, setLoading] = useState(true);



  const [page, setPage] = useState(1);



  const [totalPages, setTotalPages] = useState(0);



  const [stats, setStats] = useState({



    total: 0,



    packed: 0,



    shipped: 0,



    revenue: 0,



  });



  const [selectedOrder, setSelectedOrder] = useState(null);



  const [showModal, setShowModal] = useState(false);



  const [statusUpdate, setStatusUpdate] = useState("");



  const [notes, setNotes] = useState("");



  const [updating, setUpdating] = useState(false);
  const [shiprocketRetrying, setShiprocketRetrying] = useState(false);



  const [approvalOrders, setApprovalOrders] = useState([]);



  const [approvalPage, setApprovalPage] = useState(1);



  const [approvalTotalPages, setApprovalTotalPages] = useState(0);







  useEffect(() => {



    if (activeTab === "orders") {



      fetchOrders();



    } else if (activeTab === "approvals") {



      fetchApprovals();



    }



  }, [page, approvalPage, activeTab]);







  const fetchOrders = async () => {



    try {



      setLoading(true);



      const res = await fetch(`${API_URL}/orders/admin/pending?page=${page}&limit=10`, {



        credentials: "include",



      });







      const data = await res.json();







      if (data.success) {



        setOrders(data.orders);



        setTotalPages(data.totalPages);







        // Calculate stats



        let totalRevenue = 0;



        let packedCount = 0;



        let shippedCount = 0;







        data.orders.forEach((order) => {



          totalRevenue += order.pricing?.total || 0;



          if (order.status === "packed") packedCount++;



          if (order.status === "shipped") shippedCount++;



        });







        setStats({



          total: data.totalOrders || 0,



          packed: packedCount,



          shipped: shippedCount,



          revenue: totalRevenue,



        });



      }



    } catch (error) {



      console.error("Error fetching orders:", error);



    } finally {



      setLoading(false);



    }



  };







  const fetchApprovals = async () => {



    try {



      setLoading(true);



      const res = await fetch(`${API_URL}/orders/admin/approvals?page=${approvalPage}&limit=10`, {



        credentials: "include",



      });



      const data = await res.json();



      if (data.success) {



        setApprovalOrders(data.orders);



        setApprovalTotalPages(data.totalPages);



      }



    } catch (error) {



      console.error("Error fetching approval orders:", error);



    } finally {



      setLoading(false);



    }



  };







  const handleOpenModal = (order) => {



    setSelectedOrder(order);



    setStatusUpdate(order.status || "confirmed");



    setNotes(order.adminNotes || "");



    setShowModal(true);



  };







  const handleApproveOrder = async (orderId) => {



    try {



      const res = await fetch(`${API_URL}/orders/admin/${orderId}/approve`, {



        method: "PATCH",



        credentials: "include",



        headers: { "Content-Type": "application/json" },



        body: JSON.stringify({}),



      });



      const data = await res.json();



      if (data.success) {

        setShowModal(false);

        setSelectedOrder(null);

        await fetchApprovals();

        if (data.shiprocket?.orderId) {
          alert(`Order approved and sent to Shiprocket. Shiprocket Order ID: ${data.shiprocket.orderId}`);
        }

      } else {

        setShowModal(false);

        setSelectedOrder(null);

        await fetchApprovals();

        alert(data.message || "Order approval failed");

      }



    } catch (error) {



      console.error("Error approving order:", error);



      alert("Error approving order");



    }



  };







  const handleRejectOrder = async (orderId, reason) => {



    try {



      const res = await fetch(`${API_URL}/orders/admin/${orderId}/reject`, {



        method: "PATCH",



        credentials: "include",



        headers: { "Content-Type": "application/json" },



        body: JSON.stringify({ reason }),



      });



      const data = await res.json();



      if (data.success) {



        setShowModal(false);



        setSelectedOrder(null);



        fetchApprovals();



      } else {



        alert(data.message || "Error rejecting order");



      }



    } catch (error) {



      console.error("Error rejecting order:", error);



      alert("Error rejecting order");



    }



  };







  const handleRetryShiprocket = async () => {
    if (!selectedOrder?._id) return;

    setShiprocketRetrying(true);

    try {
      const res = await fetch(`${API_URL}/orders/admin/${selectedOrder._id}/shiprocket-retry`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await res.json().catch(() => ({}));

      if (data.success) {
        setSelectedOrder(data.order || selectedOrder);
        alert(data.message || "Shiprocket order created successfully.");
        fetchOrders();
      } else {
        alert(data.message || data.error || "Shiprocket retry failed.");
      }
    } catch (error) {
      console.error("Error retrying Shiprocket:", error);
      alert("Unable to retry Shiprocket right now.");
    } finally {
      setShiprocketRetrying(false);
    }
  };

  const handleUpdateStatus = async () => {



    if (!selectedOrder) return;







    setUpdating(true);







    try {



      const res = await fetch(`${API_URL}/orders/${selectedOrder._id}/status`, {



        method: "PATCH",



        credentials: "include",



        headers: { "Content-Type": "application/json" },



        body: JSON.stringify({



          status: statusUpdate,



          notes,



        }),



      });







      const data = await res.json();







      if (data.success) {



        setShowModal(false);



        setSelectedOrder(null);



        setStatusUpdate("");



        setNotes("");



        fetchOrders();



      }



    } catch (error) {



      console.error("Error updating order:", error);



    } finally {



      setUpdating(false);



    }



  };







  const styles = {



    page: { width: "100%" },



    heading: { marginBottom: "24px" },



    headingTitle: {



      margin: 0,



      color: "#292828",



      fontFamily: "Georgia, 'Times New Roman', serif",



      fontSize: "24px",



      fontWeight: "600",



    },



    headingText: {



      margin: "6px 0 0",



      color: "#77736D",



      fontSize: "11px",



    },



    stats: {



      width: "100%",



      display: "grid",



      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",



      gap: "17px",



    },



    card: {



      minHeight: "145px",



      boxSizing: "border-box",



      padding: "20px",



      background: "#FAF8F5",



      border: "1px solid #E1DAD2",



      borderRadius: "13px",



    },



    top: { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },



    label: {



      margin: 0,



      color: "#7C7872",



      fontSize: "9px",



      fontWeight: "700",



      letterSpacing: "0.8px",



      textTransform: "uppercase",



    },



    value: {



      margin: "8px 0 0",



      color: "#295C65",



      fontFamily: "Georgia, 'Times New Roman', serif",



      fontSize: "29px",



      fontWeight: "600",



    },



    icon: {



      width: "39px",



      height: "39px",



      borderRadius: "9px",



      background: "#F2EEE9",



      color: "#295C65",



      display: "flex",



      alignItems: "center",



      justifyContent: "center",



    },



    text: { margin: "17px 0 0", color: "#88847E", fontSize: "9px" },



    panel: {



      marginTop: "24px",



      background: "#FAF8F5",



      border: "1px solid #E1DAD2",



      borderRadius: "14px",



      padding: "25px 20px",



    },



    panelHeader: {



      display: "flex",



      alignItems: "center",



      justifyContent: "space-between",



      gap: "12px",



      marginBottom: "18px",



    },



    panelTitle: {



      margin: 0,



      color: "#292828",



      fontFamily: "Georgia, 'Times New Roman', serif",



      fontSize: "20px",



      fontWeight: "600",



    },



    badge: {



      display: "inline-flex",



      alignItems: "center",



      justifyContent: "center",



      background: "#E9F2F3",



      color: "#295C65",



      borderRadius: "999px",



      padding: "6px 10px",



      fontSize: "10px",



      fontWeight: "700",



    },



    empty: {



      minHeight: "170px",



      display: "flex",



      alignItems: "center",



      justifyContent: "center",



      textAlign: "center",



      border: "1px dashed #D4C9BA",



      borderRadius: "12px",



      color: "#7E7A74",



      background: "#F9F5F1",



      fontSize: "12px",



    },



    table: {



      width: "100%",



      borderCollapse: "collapse",



    },



    th: {



      padding: "15px",



      textAlign: "left",



      fontWeight: "700",



      color: "#295C65",



      fontSize: "12px",



      background: "#F2EEE9",



      borderBottom: "2px solid #E1DAD2",



    },



    td: {



      padding: "15px",



      borderBottom: "1px solid #E1DAD2",



      fontSize: "13px",



    },



    row: {



      transition: "background-color 0.2s",



    },



  };







  const summaryItems = [



    {



      title: "Total Orders",



      value: stats.total,



      text: "Orders received",



      icon: ShoppingBag,



    },



    {



      title: "Packed",



      value: stats.packed,



      text: "Ready for dispatch",



      icon: PackageCheck,



    },



    {



      title: "In Transit",



      value: stats.shipped,



      text: "Current shipments",



      icon: Truck,



    },



    {



      title: "Revenue",



      value: `₹${stats.revenue.toLocaleString("en-IN")}`,



      text: "Order value",



      icon: IndianRupee,



    },



  ];







  if (loading && orders.length === 0) {



    return (



      <div style={{ ...styles.page, textAlign: "center", padding: "40px 20px" }}>



        <Loader size={40} style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />



        <p style={{ marginTop: "20px", color: "#696968" }}>Loading orders...</p>



      </div>



    );



  }







  return (



    <div style={styles.page}>



      <div style={styles.heading}>



        <h2 style={styles.headingTitle}>Order Management</h2>



        <p style={styles.headingText}>Manage customer orders and update status.</p>



      </div>



      <div

        style={{

          display: "flex",

          gap: "8px",

          marginBottom: "20px",

          flexWrap: "wrap",

        }}

      >

        <button

          type="button"

          onClick={() => {

            setActiveTab("orders");

            setPage(1);

          }}

          style={{

            padding: "9px 16px",

            borderRadius: "7px",

            border: "1px solid #D9D0C7",

            background: activeTab === "orders" ? "#295C65" : "#F2EEE9",

            color: activeTab === "orders" ? "#FFFFFF" : "#295C65",

            cursor: "pointer",

            fontSize: "12px",

            fontWeight: "700",

          }}

        >

          Pending Orders

        </button>



        <button

          type="button"

          onClick={() => {

            setActiveTab("approvals");

            setApprovalPage(1);

          }}

          style={{

            padding: "9px 16px",

            borderRadius: "7px",

            border: "1px solid #D9D0C7",

            background: activeTab === "approvals" ? "#295C65" : "#F2EEE9",

            color: activeTab === "approvals" ? "#FFFFFF" : "#295C65",

            cursor: "pointer",

            fontSize: "12px",

            fontWeight: "700",

          }}

        >

          Approvals

        </button>

      </div>







      {/* Stats Cards */}



      <div className="orders-page-stats" style={styles.stats}>



        {summaryItems.map((item) => {



          const Icon = item.icon;







          return (



            <div key={item.title} style={styles.card}>



              <div style={styles.top}>



                <div>



                  <p style={styles.label}>{item.title}</p>



                  <h3 style={styles.value}>{item.value}</h3>



                </div>



                <div style={styles.icon}>



                  <Icon size={18} />



                </div>



              </div>



              <p style={styles.text}>{item.text}</p>



            </div>



          );



        })}



      </div>







      {/* Orders Panel */}



      {activeTab === "orders" && (

      <div className="orders-page-panel" style={styles.panel}>



        <div style={styles.panelHeader}>



          <h3 style={styles.panelTitle}>Pending Orders</h3>



          <span style={styles.badge}>{orders.length} Orders</span>



        </div>







        {orders.length === 0 ? (



          <div style={styles.empty}>No pending orders to review.</div>



        ) : (



          <div style={{ overflowX: "auto" }}>



            <table style={styles.table}>



              <thead>



                <tr style={{ background: "#F2EEE9" }}>



                  <th style={styles.th}>Order ID</th>



                  <th style={styles.th}>Customer</th>



                  <th style={styles.th}>Items</th>



                  <th style={styles.th}>Total</th>



                  <th style={styles.th}>Phone</th>



                  <th style={styles.th}>Status</th>



                  <th style={styles.th}>Action</th>



                </tr>



              </thead>



              <tbody>



                {orders.map((order) => (



                  <tr key={order._id} style={styles.row}>



                    <td style={styles.td}>



                      <strong>#{order.orderNumber}</strong>



                    </td>



                    <td style={styles.td}>



                      <div style={{ fontWeight: "600" }}>



                        {order.customerDetails?.name || "N/A"}



                      </div>



                      <div style={{ fontSize: "11px", color: "#696968" }}>



                        {order.customerDetails?.email}



                      </div>



                    </td>



                    <td style={styles.td}>{order.items?.length || 0}</td>



                    <td style={{ ...styles.td, fontWeight: "600" }}>



                      ₹{order.pricing?.total?.toLocaleString("en-IN") || "0"}



                    </td>



                    <td style={styles.td}>{order.shippingAddress?.phone || "N/A"}</td>



                    <td style={styles.td}>



                      <span



                        style={{



                          display: "inline-block",



                          padding: "4px 10px",



                          background: STATUS_COLORS[order.status] || "#808080",



                          color: "#FFFFFF",



                          borderRadius: "4px",



                          fontSize: "11px",



                          fontWeight: "600",



                          textTransform: "capitalize",



                        }}



                      >



                        {order.status}



                      </span>



                    </td>



                    <td style={styles.td}>



                      <button



                        onClick={() => handleOpenModal(order)}



                        style={{



                          display: "inline-flex",



                          alignItems: "center",



                          gap: "6px",



                          padding: "6px 12px",



                          background: "#295C65",



                          color: "#FFFFFF",



                          border: "none",



                          borderRadius: "4px",



                          cursor: "pointer",



                          fontSize: "11px",



                          fontWeight: "600",



                        }}



                      >



                        <Eye size={14} />



                        Review



                      </button>



                    </td>



                  </tr>



                ))}



              </tbody>



            </table>



          </div>



        )}







        {/* Pagination */}



        {totalPages > 1 && (



          <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>



            <button



              onClick={() => setPage(Math.max(1, page - 1))}



              disabled={page === 1}



              style={{



                padding: "8px 12px",



                background: page === 1 ? "#E8DCCF" : "#295C65",



                color: page === 1 ? "#696968" : "#FFFFFF",



                border: "none",



                borderRadius: "4px",



                cursor: page === 1 ? "not-allowed" : "pointer",



                fontSize: "12px",



              }}



            >



              Prev



            </button>



            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (



              <button



                key={p}



                onClick={() => setPage(p)}



                style={{



                  padding: "8px 12px",



                  background: page === p ? "#295C65" : "#E8DCCF",



                  color: page === p ? "#FFFFFF" : "#696968",



                  border: "none",



                  borderRadius: "4px",



                  cursor: "pointer",



                  fontSize: "12px",



                  fontWeight: page === p ? "700" : "400",



                }}



              >



                {p}



              </button>



            ))}



            <button



              onClick={() => setPage(Math.min(totalPages, page + 1))}



              disabled={page === totalPages}



              style={{



                padding: "8px 12px",



                background: page === totalPages ? "#E8DCCF" : "#295C65",



                color: page === totalPages ? "#696968" : "#FFFFFF",



                border: "none",



                borderRadius: "4px",



                cursor: page === totalPages ? "not-allowed" : "pointer",



                fontSize: "12px",



              }}



            >



              Next



            </button>



          </div>



        )}



      </div>

      )}







      {activeTab === "approvals" && (

        <div className="orders-page-panel" style={styles.panel}>

          <div style={styles.panelHeader}>

            <h3 style={styles.panelTitle}>Order Approvals</h3>

            <span style={styles.badge}>

              {approvalOrders.length} Orders

            </span>

          </div>



          {approvalOrders.length === 0 ? (

            <div style={styles.empty}>No orders waiting for approval.</div>

          ) : (

            <div style={{ overflowX: "auto" }}>

              <table style={styles.table}>

                <thead>

                  <tr>

                    <th style={styles.th}>Order ID</th>

                    <th style={styles.th}>Customer</th>

                    <th style={styles.th}>Items</th>

                    <th style={styles.th}>Total</th>

                    <th style={styles.th}>Action</th>

                  </tr>

                </thead>

                <tbody>

                  {approvalOrders.map((order) => (

                    <tr key={order._id} style={styles.row}>

                      <td style={styles.td}>

                        <strong>#{order.orderNumber}</strong>

                      </td>

                      <td style={styles.td}>

                        <div style={{ fontWeight: "600" }}>

                          {order.customerDetails?.name || "N/A"}

                        </div>

                        <div style={{ fontSize: "11px", color: "#696968" }}>

                          {order.customerDetails?.email || ""}

                        </div>

                      </td>

                      <td style={styles.td}>{order.items?.length || 0}</td>

                      <td style={{ ...styles.td, fontWeight: "600" }}>

                        {formatMoney(order.pricing?.total)}

                      </td>

                      <td style={styles.td}>

                        <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>

                          <button

                            type="button"

                            onClick={() => handleOpenModal(order)}

                            style={{

                              display: "inline-flex",

                              alignItems: "center",

                              gap: "6px",

                              padding: "6px 12px",

                              background: "#295C65",

                              color: "#FFFFFF",

                              border: "none",

                              borderRadius: "4px",

                              cursor: "pointer",

                              fontSize: "11px",

                              fontWeight: "600",

                            }}

                          >

                            <Eye size={14} />

                            Review

                          </button>

                          <button

                            type="button"

                            onClick={() => handleApproveOrder(order._id)}

                            style={{

                              padding: "6px 12px",

                              background: "#228B22",

                              color: "#FFFFFF",

                              border: "none",

                              borderRadius: "4px",

                              cursor: "pointer",

                              fontSize: "11px",

                              fontWeight: "600",

                            }}

                          >

                            Approve

                          </button>

                          <button

                            type="button"

                            onClick={() => {

                              const reason = window.prompt("Enter rejection reason:");

                              if (reason !== null) {

                                handleRejectOrder(order._id, reason);

                              }

                            }}

                            style={{

                              padding: "6px 12px",

                              background: "#DC143C",

                              color: "#FFFFFF",

                              border: "none",

                              borderRadius: "4px",

                              cursor: "pointer",

                              fontSize: "11px",

                              fontWeight: "600",

                            }}

                          >

                            Reject

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}



          {approvalTotalPages > 1 && (

            <div

              style={{

                marginTop: "20px",

                display: "flex",

                justifyContent: "center",

                gap: "10px",

                flexWrap: "wrap",

              }}

            >

              <button

                type="button"

                onClick={() => setApprovalPage(Math.max(1, approvalPage - 1))}

                disabled={approvalPage === 1}

                style={{

                  padding: "8px 12px",

                  background: approvalPage === 1 ? "#E8DCCF" : "#295C65",

                  color: approvalPage === 1 ? "#696968" : "#FFFFFF",

                  border: "none",

                  borderRadius: "4px",

                  cursor: approvalPage === 1 ? "not-allowed" : "pointer",

                  fontSize: "12px",

                }}

              >

                Prev

              </button>



              {Array.from({ length: approvalTotalPages }, (_, i) => i + 1).map((p) => (

                <button

                  type="button"

                  key={p}

                  onClick={() => setApprovalPage(p)}

                  style={{

                    padding: "8px 12px",

                    background: approvalPage === p ? "#295C65" : "#E8DCCF",

                    color: approvalPage === p ? "#FFFFFF" : "#696968",

                    border: "none",

                    borderRadius: "4px",

                    cursor: "pointer",

                    fontSize: "12px",

                    fontWeight: approvalPage === p ? "700" : "400",

                  }}

                >

                  {p}

                </button>

              ))}



              <button

                type="button"

                onClick={() =>

                  setApprovalPage(Math.min(approvalTotalPages, approvalPage + 1))

                }

                disabled={approvalPage === approvalTotalPages}

                style={{

                  padding: "8px 12px",

                  background:

                    approvalPage === approvalTotalPages ? "#E8DCCF" : "#295C65",

                  color:

                    approvalPage === approvalTotalPages ? "#696968" : "#FFFFFF",

                  border: "none",

                  borderRadius: "4px",

                  cursor:

                    approvalPage === approvalTotalPages ? "not-allowed" : "pointer",

                  fontSize: "12px",

                }}

              >

                Next

              </button>

            </div>

          )}

        </div>

      )}



      {/* Modal for updating order status */}



      {showModal && selectedOrder && (



        <div



          style={{



            position: "fixed",



            top: 0,



            left: 0,



            right: 0,



            bottom: 0,



            background: "rgba(0, 0, 0, 0.5)",



            display: "flex",



            alignItems: "center",



            justifyContent: "center",



            zIndex: 1000,



          }}



          onClick={() => setShowModal(false)}



        >



          <div



            style={{



              background: "#FFFFFF",



              borderRadius: "12px",



              padding: "40px",



              maxWidth: "600px",



              width: "90%",



              maxHeight: "90vh",



              overflowY: "auto",



            }}



            onClick={(e) => e.stopPropagation()}



          >



            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>



              Review Order #{selectedOrder.orderNumber}



            </h2>







            {/* Customer Details */}



            <div style={{ marginBottom: "25px" }}>



              <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#295C65" }}>



                Customer Details



              </h3>



              <div style={{ padding: "12px", background: "#F5F3F0", borderRadius: "6px", fontSize: "13px" }}>



                <div>



                  <strong>Name:</strong> {selectedOrder.customerDetails?.name}



                </div>



                <div>



                  <strong>Email:</strong> {selectedOrder.customerDetails?.email}



                </div>



                <div>



                  <strong>Phone:</strong> {selectedOrder.customerDetails?.phone}



                </div>



              </div>



            </div>







            {/* Shipping Address */}



            <div style={{ marginBottom: "25px" }}>



              <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#295C65" }}>



                Shipping Address



              </h3>



              <div style={{ padding: "12px", background: "#F5F3F0", borderRadius: "6px", fontSize: "12px", lineHeight: "1.6" }}>



                {selectedOrder.shippingAddress?.fullName}



                <br />



                {selectedOrder.shippingAddress?.addressLine1}



                {selectedOrder.shippingAddress?.addressLine2 && (



                  <>



                    <br />



                    {selectedOrder.shippingAddress?.addressLine2}



                  </>



                )}



                <br />



                {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{" "}



                {selectedOrder.shippingAddress?.pincode}



              </div>



            </div>







            {/* Order Items */}



            <div style={{ marginBottom: "25px" }}>



              <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#295C65" }}>



                Items



              </h3>



              <div style={{ padding: "12px", background: "#F5F3F0", borderRadius: "6px", fontSize: "12px" }}>



                {selectedOrder.items?.map((item, idx) => (



                  <div

                    key={idx}

                    style={{

                      display: "flex",

                      justifyContent: "space-between",

                      gap: "16px",

                      paddingBottom: "12px",

                      marginBottom: "12px",

                      borderBottom:

                        idx < selectedOrder.items.length - 1

                          ? "1px solid #E4DCD4"

                          : "none",

                    }}

                  >

                    <div

                      style={{

                        display: "flex",

                        gap: "12px",

                        minWidth: 0,

                        flex: 1,

                      }}

                    >

                      {getItemImage(item) ? (

                        <img

                          src={getItemImage(item)}

                          alt={item.productName || "Product"}

                          style={{

                            width: "58px",

                            height: "70px",

                            objectFit: "cover",

                            borderRadius: "6px",

                            border: "1px solid #E4DCD4",

                            flexShrink: 0,

                          }}

                        />

                      ) : (

                        <div

                          style={{

                            width: "58px",

                            height: "70px",

                            borderRadius: "6px",

                            background: "#E8E1D9",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            flexShrink: 0,

                            color: "#77736D",

                            fontSize: "9px",

                          }}

                        >

                          No Image

                        </div>

                      )}



                      <div style={{ minWidth: 0 }}>

                        <div style={{ fontWeight: "700", marginBottom: "5px" }}>

                          {item.productName || "Product"}

                        </div>



                        <div

                          style={{

                            color: "#77736D",

                            fontSize: "11px",

                            lineHeight: "1.7",

                          }}

                        >

                          Quantity: {item.quantity || 0}

                          {getItemColor(item) ? (

                            <>

                              <br />

                              Color: {getItemColor(item)}

                            </>

                          ) : null}

                          {getItemSize(item) ? (

                            <>

                              <br />

                              Size: {getItemSize(item)}

                            </>

                          ) : null}

                          {getItemSku(item) ? (

                            <>

                              <br />

                              SKU: {getItemSku(item)}

                            </>

                          ) : null}

                          {item.variantId ? (

                            <>

                              <br />

                              Variant ID: {String(item.variantId)}

                            </>

                          ) : null}

                        </div>

                      </div>

                    </div>



                    <div

                      style={{

                        fontWeight: "700",

                        whiteSpace: "nowrap",

                        alignSelf: "flex-start",

                      }}

                    >

                      {formatMoney(item.total)}

                    </div>

                  </div>



                ))}



              </div>



            </div>







            <div style={{ marginBottom: "25px" }}>

              <h3

                style={{

                  fontSize: "14px",

                  fontWeight: "700",

                  marginBottom: "12px",

                  color: "#295C65",

                }}

              >

                Order Summary

              </h3>



              <div

                style={{

                  padding: "12px",

                  background: "#F5F3F0",

                  borderRadius: "6px",

                  fontSize: "12px",

                  lineHeight: "1.8",

                }}

              >

                <div>

                  <strong>Subtotal:</strong>{" "}

                  {formatMoney(selectedOrder.pricing?.subtotal)}

                </div>

                <div>

                  <strong>Shipping:</strong>{" "}

                  {formatMoney(selectedOrder.pricing?.shipping)}

                </div>

                <div>

                  <strong>Tax:</strong>{" "}

                  {formatMoney(selectedOrder.pricing?.tax)}

                </div>

                <div style={{ fontSize: "14px", marginTop: "4px" }}>

                  <strong>Total:</strong>{" "}

                  {formatMoney(selectedOrder.pricing?.total)}

                </div>

                <div>

                  <strong>Payment:</strong>{" "}

                  {selectedOrder.payment?.method || "N/A"}{" "}

                  {selectedOrder.payment?.status

                    ? `(${selectedOrder.payment.status})`

                    : ""}

                </div>

                <div>

                  <strong>Shipping Method:</strong>{" "}

                  {selectedOrder.shippingMethod || "N/A"}

                </div>

              </div>

            </div>



            {selectedOrder.shipping?.creationStatus === "failed" && (
              <div style={{ marginBottom: "25px", padding: "14px", background: "#FFF5F5", border: "1px solid #E6B8B8", borderRadius: "7px" }}>
                <div style={{ fontWeight: "700", color: "#A64C40", fontSize: "13px", marginBottom: "6px" }}>Shiprocket creation failed</div>
                <div style={{ fontSize: "11px", color: "#696968", lineHeight: "1.6", marginBottom: "10px" }}>
                  {selectedOrder.shipping?.creationError || "Shiprocket could not create the shipment."}
                </div>
                <button
                  type="button"
                  onClick={handleRetryShiprocket}
                  disabled={shiprocketRetrying}
                  style={{ padding: "9px 14px", background: "#295C65", color: "#FFFFFF", border: "none", borderRadius: "5px", fontWeight: "700", fontSize: "11px", cursor: shiprocketRetrying ? "not-allowed" : "pointer", opacity: shiprocketRetrying ? 0.7 : 1 }}
                >
                  {shiprocketRetrying ? "Retrying Shiprocket..." : "Retry Shiprocket"}
                </button>
              </div>
            )}

            {/* Update Status */}





            <div style={{ marginBottom: "25px" }}>



              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px" }}>



                Update Status



              </label>



              <select



                value={statusUpdate}



                onChange={(e) => setStatusUpdate(e.target.value)}



                style={{



                  width: "100%",



                  padding: "10px",



                  border: "1px solid #E4DCD4",



                  borderRadius: "6px",



                  fontSize: "13px",



                }}



              >



                <option value="confirmed">Confirmed</option>



                <option value="packed">Packed</option>



                <option value="shipped">Shipped</option>



                <option value="delivered">Delivered</option>



                <option value="cancelled">Cancelled</option>



              </select>



            </div>







            {/* Admin Notes */}



            <div style={{ marginBottom: "25px" }}>



              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px" }}>



                Admin Notes



              </label>



              <textarea



                value={notes}



                onChange={(e) => setNotes(e.target.value)}



                placeholder="Add notes about this order..."



                style={{



                  width: "100%",



                  padding: "10px",



                  border: "1px solid #E4DCD4",



                  borderRadius: "6px",



                  fontSize: "13px",



                  minHeight: "80px",



                  fontFamily: "Poppins",



                  resize: "vertical",



                }}



              />



            </div>







            {/* Buttons */}



            <div style={{ display: "flex", gap: "10px" }}>



              <button



                onClick={handleUpdateStatus}



                disabled={updating}



                style={{



                  flex: 1,



                  padding: "12px",



                  background: "#295C65",



                  color: "#FFFFFF",



                  border: "none",



                  borderRadius: "6px",



                  fontWeight: "700",



                  cursor: updating ? "not-allowed" : "pointer",



                  opacity: updating ? 0.7 : 1,



                }}



              >



                {updating ? "Updating..." : "Update Order"}



              </button>



              <button



                onClick={() => setShowModal(false)}



                style={{



                  flex: 1,



                  padding: "12px",



                  background: "#E8DCCF",



                  color: "#295C65",



                  border: "none",



                  borderRadius: "6px",



                  fontWeight: "700",



                  cursor: "pointer",



                }}



              >



                Cancel



              </button>



            </div>



          </div>



        </div>

      )}





      <style>{`



        @keyframes spin {



          to { transform: rotate(360deg); }



        }



      `}</style>



    </div>



  );



}
