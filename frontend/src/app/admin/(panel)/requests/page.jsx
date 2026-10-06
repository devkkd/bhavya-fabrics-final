"use client";
import { useEffect, useState } from "react";
import { Loader, AlertCircle, CheckCircle, XCircle, Package, MessageSquare, Calendar } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const REQUEST_TYPE_COLORS = {
  cancellation: { bg: "#FFF3E0", border: "#FFB74D", text: "#E65100" },
  return: { bg: "#E3F2FD", border: "#64B5F6", text: "#1565C0" },
  replacement: { bg: "#F3E5F5", border: "#BA68C8", text: "#6A1B9A" },
};

const REQUEST_ICONS = {
  cancellation: "🚫",
  return: "↩️",
  replacement: "🔄",
};

export default function RequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filterType, setFilterType] = useState("all"); // all, cancellation, return, replacement
  const [stats, setStats] = useState({
    total: 0,
    cancellations: 0,
    returns: 0,
    replacements: 0,
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [decision, setDecision] = useState("approved");
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [page, filterType]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(filterType !== "all" && { type: filterType }),
      });

      const res = await fetch(`${API_URL}/orders/admin/requests?${params}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setRequests(data.requests);
        setTotalPages(data.totalPages);

        // Calculate stats - count requests across all pages
        let totalCount = 0;
        let cancellationCount = 0;
        let returnCount = 0;
        let replacementCount = 0;

        data.requests.forEach((order) => {
          order.requests?.forEach((req) => {
            if (req.status === "pending") {
              totalCount++;
              if (req.type === "cancellation") cancellationCount++;
              if (req.type === "return") returnCount++;
              if (req.type === "replacement") replacementCount++;
            }
          });
        });

        setStats({
          total: totalCount,
          cancellations: cancellationCount,
          returns: returnCount,
          replacements: replacementCount,
        });
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (orderData, requestData) => {
    setSelectedRequest({
      order: orderData,
      request: requestData,
    });
    setDecision("approved");
    setAdminNotes("");
    setShowModal(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;
    setProcessing(true);

    try {
      const { order, request } = selectedRequest;
      const endpoint = `${API_URL}/orders/${order._id}/${request.type}-decision`;

      const payload = {
        decision,
        adminNotes,
      };

      // For return/replacement requests, include refundAmount or newOrderId if approved
      if (request.type === "return" && decision === "approved") {
        payload.refundAmount = order.pricing?.total || 0;
      }

      const res = await fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setSelectedRequest(null);
        setDecision("approved");
        setAdminNotes("");
        fetchRequests(); // Refresh the list
      } else {
        alert(data.message || "Error processing request");
      }
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Error processing request");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "17px",
    },
    card: {
      minHeight: "130px",
      boxSizing: "border-box",
      padding: "20px",
      background: "#FAF8F5",
      border: "1px solid #E1DAD2",
      borderRadius: "13px",
    },
    statValue: {
      margin: 0,
      color: "#295C65",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "28px",
      fontWeight: "600",
    },
    statLabel: {
      margin: "8px 0 0",
      color: "#7C7872",
      fontSize: "11px",
      fontWeight: "600",
    },
    statText: {
      margin: "8px 0 0",
      color: "#88847E",
      fontSize: "9px",
    },
    filters: {
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },
    filterBtn: {
      padding: "8px 16px",
      border: "1px solid #D4C9BA",
      background: "#FAF8F5",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
      transition: "all 0.2s",
    },
    filterBtnActive: {
      background: "#295C65",
      color: "#FFFFFF",
      border: "1px solid #295C65",
    },
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
    requestCard: {
      marginBottom: "16px",
      padding: "16px",
      border: "1px solid #E1DAD2",
      borderLeft: "4px solid #FF6B6B",
      borderRadius: "8px",
      background: "#FFFFFF",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
    },
    requestContent: {
      flex: 1,
    },
    requestHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "8px",
    },
    requestType: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
    },
    requestMeta: {
      display: "flex",
      gap: "20px",
      fontSize: "11px",
      color: "#77736D",
      marginBottom: "8px",
    },
    requestReason: {
      fontSize: "12px",
      color: "#494744",
      marginTop: "8px",
      padding: "8px 12px",
      background: "#F5F3F0",
      borderRadius: "6px",
      borderLeft: "3px solid #295C65",
    },
    requestActions: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    actionBtn: {
      padding: "8px 12px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "11px",
      fontWeight: "600",
      whiteSpace: "nowrap",
    },
    approveBtn: {
      background: "#4CAF50",
      color: "#FFFFFF",
    },
    rejectBtn: {
      background: "#F44336",
      color: "#FFFFFF",
    },
  };

  const statItems = [
    { label: "Pending Requests", value: stats.total, text: "Awaiting approval" },
    { label: "Cancellations", value: stats.cancellations, text: "Cancel requests" },
    { label: "Returns", value: stats.returns, text: "Return requests" },
    { label: "Replacements", value: stats.replacements, text: "Replacement requests" },
  ];

  if (loading && requests.length === 0) {
    return (
      <div style={{ ...styles.page, textAlign: "center", padding: "40px 20px" }}>
        <Loader size={40} style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: "20px", color: "#696968" }}>Loading requests...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Heading */}
      <div style={styles.heading}>
        <h2 style={styles.headingTitle}>Customer Requests</h2>
        <p style={styles.headingText}>Manage cancellations, returns, and replacements.</p>
      </div>

      {/* Stats Cards */}
      <div style={styles.stats}>
        {statItems.map((item) => (
          <div key={item.label} style={styles.card}>
            <p style={styles.statValue}>{item.value}</p>
            <p style={styles.statLabel}>{item.label}</p>
            <p style={styles.statText}>{item.text}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {["all", "cancellation", "return", "replacement"].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilterType(type);
              setPage(1);
            }}
            style={{
              ...styles.filterBtn,
              ...(filterType === type && styles.filterBtnActive),
            }}
          >
            {type === "all"
              ? "All Requests"
              : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Requests Panel */}
      <div style={styles.panel}>
        <div style={styles.panelHeader}>
          <h3 style={styles.panelTitle}>Pending Approvals</h3>
          <span style={styles.badge}>{requests.reduce((sum, r) => sum + (r.requests?.length || 0), 0)} Requests</span>
        </div>

        {requests.length === 0 ? (
          <div style={styles.empty}>
            <div>
              <CheckCircle size={32} style={{ margin: "0 auto 12px", color: "#4CAF50" }} />
              <div>No pending requests to review.</div>
            </div>
          </div>
        ) : (
          <div>
            {requests.map((order) =>
              order.requests?.map((request, idx) => {
                const colors = REQUEST_TYPE_COLORS[request.type] || REQUEST_TYPE_COLORS.cancellation;
                return (
                  <div
                    key={`${order._id}-${request.type}-${idx}`}
                    style={{
                      ...styles.requestCard,
                      borderLeftColor: colors.border,
                    }}
                  >
                    <div style={styles.requestContent}>
                      <div style={styles.requestHeader}>
                        <span
                          style={{
                            fontSize: "18px",
                          }}
                        >
                          {REQUEST_ICONS[request.type]}
                        </span>
                        <span
                          style={{
                            ...styles.requestType,
                            background: colors.bg,
                            color: colors.text,
                          }}
                        >
                          {request.type.toUpperCase()}
                        </span>
                        <span style={{ color: "#77736D", fontSize: "12px", fontWeight: "600" }}>
                          Order #{order.orderNumber}
                        </span>
                      </div>

                      <div style={styles.requestMeta}>
                        <div>
                          <strong>Customer:</strong> {order.customerDetails?.name}
                        </div>
                        <div>
                          <strong>Requested:</strong> {formatDate(request.requestedAt)}
                        </div>
                        <div>
                          <strong>Amount:</strong> ₹{order.pricing?.total?.toLocaleString("en-IN") || "0"}
                        </div>
                      </div>

                      {request.reason && (
                        <div style={styles.requestReason}>
                          <strong>Reason:</strong> {request.reason}
                        </div>
                      )}
                    </div>

                    <div style={styles.requestActions}>
                      <button
                        onClick={() => handleOpenModal(order, request)}
                        style={{
                          ...styles.actionBtn,
                          ...styles.approveBtn,
                        }}
                      >
                        Review Request
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
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
            {totalPages > 5 && <span style={{ color: "#77736D" }}>...</span>}
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

      {/* Modal for Processing Request */}
      {showModal && selectedRequest && (
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
              Review {selectedRequest.request.type.toUpperCase()} Request
            </h2>

            {/* Request Details */}
            <div style={{ marginBottom: "25px", padding: "16px", background: "#F5F3F0", borderRadius: "8px" }}>
              <div style={{ marginBottom: "12px" }}>
                <strong>Order Number:</strong> #{selectedRequest.order.orderNumber}
              </div>
              <div style={{ marginBottom: "12px" }}>
                <strong>Customer:</strong> {selectedRequest.order.customerDetails?.name}
              </div>
              <div style={{ marginBottom: "12px" }}>
                <strong>Requested On:</strong> {formatDate(selectedRequest.request.requestedAt)}
              </div>
              <div style={{ marginBottom: "12px" }}>
                <strong>Order Total:</strong> ₹{selectedRequest.order.pricing?.total?.toLocaleString("en-IN") || "0"}
              </div>
              {selectedRequest.request.reason && (
                <div>
                  <strong>Reason:</strong>
                  <div style={{ marginTop: "6px", padding: "8px", background: "#FFFFFF", borderRadius: "6px", fontSize: "13px" }}>
                    {selectedRequest.request.reason}
                  </div>
                </div>
              )}
            </div>

            {/* Decision */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px" }}>
                Decision
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="decision"
                    value="approved"
                    checked={decision === "approved"}
                    onChange={(e) => setDecision(e.target.value)}
                  />
                  <span style={{ fontWeight: "600", color: "#4CAF50" }}>Approve</span>
                </label>
                <label style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="decision"
                    value="rejected"
                    checked={decision === "rejected"}
                    onChange={(e) => setDecision(e.target.value)}
                  />
                  <span style={{ fontWeight: "600", color: "#F44336" }}>Reject</span>
                </label>
              </div>
            </div>

            {/* Admin Notes */}
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "13px" }}>
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this decision..."
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
                onClick={handleProcessRequest}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: decision === "approved" ? "#4CAF50" : "#F44336",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "700",
                  cursor: processing ? "not-allowed" : "pointer",
                  opacity: processing ? 0.7 : 1,
                }}
              >
                {processing ? "Processing..." : `${decision.toUpperCase()} REQUEST`}
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
