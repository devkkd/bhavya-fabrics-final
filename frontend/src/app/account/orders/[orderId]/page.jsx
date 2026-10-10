"use client";



import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Link from "next/link";
import { StorefrontPrice } from "@/context/StorefrontPreferencesContext";

import { ArrowLeft, Loader, CheckCircle, AlertCircle, Truck, Package } from "lucide-react";



const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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

const getItemImage = (item) =>
  item?.productImage ||
  item?.productImages?.find?.((image) => image?.url)?.url ||
  item?.productImages?.[0]?.url ||
  item?.productImages?.[0] ||
  item?.variantSnapshot?.images?.[0]?.url ||
  item?.variantSnapshot?.images?.[0] ||
  "";

const getItemSku = (item) => item?.sku || item?.variantSnapshot?.sku || "";



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



export default function OrderDetailsPage() {

  const params = useParams();

  const router = useRouter();

  const orderId = params.orderId;



  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [trackingData, setTrackingData] = useState(null);

  const [showCancellationForm, setShowCancellationForm] = useState(false);

  const [cancellationReason, setCancellationReason] = useState("");

  const [submittingCancellation, setSubmittingCancellation] = useState(false);



  const [showReturnForm, setShowReturnForm] = useState(false);

  const [returnReason, setReturnReason] = useState("");

  const [submittingReturn, setSubmittingReturn] = useState(false);



  const [showReplacementForm, setShowReplacementForm] = useState(false);

  const [replacementReason, setReplacementReason] = useState("");

  const [submittingReplacement, setSubmittingReplacement] = useState(false);



  useEffect(() => {

    const fetchOrder = async () => {

      try {

        const res = await fetch(`${API_URL}/orders/${orderId}`, {

          credentials: "include",

        });



        const data = await res.json();



        if (data.success) {

          setOrder(data.order);

          if (data.order?.shipping?.awb || data.order?.shipping?.trackingNumber) {
            setTrackingLoading(true);
            try {
              const trackingRes = await fetch(`${API_URL}/orders/${orderId}/tracking`, { credentials: "include", cache: "no-store" });
              const trackingJson = await trackingRes.json().catch(() => ({}));
              if (trackingJson.success) {
                setTrackingData(trackingJson);
                if (trackingJson.order) setOrder(trackingJson.order);
                setTrackingError("");
              } else {
                setTrackingError(trackingJson.message || "Tracking is not available right now.");
              }
            } catch (trackingErr) {
              console.error("Error fetching tracking:", trackingErr);
              setTrackingError("Unable to refresh live tracking right now.");
            } finally {
              setTrackingLoading(false);
            }
          } else {
            setTrackingData(null);
            setTrackingError("");
          }

        } else {

          setError(data.message || "Failed to load order");

        }

      } catch (err) {

        console.error("Error fetching order:", err);

        setError("Failed to load order details");

      } finally {

        setLoading(false);

      }

    };



    fetchOrder();

  }, [orderId]);



  const handleCancellationRequest = async () => {

    if (!cancellationReason.trim()) {

      alert("Please provide a reason for cancellation");

      return;

    }



    setSubmittingCancellation(true);



    try {

      const res = await fetch(`${API_URL}/orders/${orderId}/request-cancellation`, {

        method: "POST",

        credentials: "include",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ reason: cancellationReason }),

      });



      const data = await res.json();



      if (data.success) {

        setOrder(data.order);

        setCancellationReason("");

        setShowCancellationForm(false);

        alert("Cancellation request submitted. Admin will review shortly.");

      } else {

        alert(data.message || "Failed to submit cancellation request");

      }

    } catch (err) {

      console.error("Error submitting cancellation:", err);

      alert("Failed to submit cancellation request");

    } finally {

      setSubmittingCancellation(false);

    }

  };



  const handleReturnRequest = async () => {

    if (!returnReason.trim()) {

      alert("Please provide a reason for return");

      return;

    }



    setSubmittingReturn(true);



    try {

      const res = await fetch(`${API_URL}/orders/${orderId}/request-return`, {

        method: "POST",

        credentials: "include",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ reason: returnReason }),

      });



      const data = await res.json();



      if (data.success) {

        setOrder(data.order);

        setReturnReason("");

        setShowReturnForm(false);

        alert("Return request submitted. Admin will review shortly.");

      } else {

        alert(data.message || "Failed to submit return request");

      }

    } catch (err) {

      console.error("Error submitting return:", err);

      alert("Failed to submit return request");

    } finally {

      setSubmittingReturn(false);

    }

  };



  const handleReplacementRequest = async () => {

    if (!replacementReason.trim()) {

      alert("Please provide a reason for replacement");

      return;

    }



    setSubmittingReplacement(true);



    try {

      const res = await fetch(`${API_URL}/orders/${orderId}/request-replacement`, {

        method: "POST",

        credentials: "include",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ reason: replacementReason }),

      });



      const data = await res.json();



      if (data.success) {

        setOrder(data.order);

        setReplacementReason("");

        setShowReplacementForm(false);

        alert("Replacement request submitted. Admin will review shortly.");

      } else {

        alert(data.message || "Failed to submit replacement request");

      }

    } catch (err) {

      console.error("Error submitting replacement:", err);

      alert("Failed to submit replacement request");

    } finally {

      setSubmittingReplacement(false);

    }

  };



  if (loading) {

    return (

      <div style={{ padding: "40px 20px", textAlign: "center", minHeight: "60vh" }}>

        <Loader size={40} style={{ margin: "0 auto", animation: "spin 1s linear infinite" }} />

        <p style={{ marginTop: "20px", color: "#696968" }}>Loading order details...</p>

      </div>

    );

  }



  if (error || !order) {

    return (

      <div style={{ padding: "40px 20px", minHeight: "60vh", background: "#FAF8F5" }}>

        <div style={{ maxWidth: "800px", margin: "0 auto" }}>

          <Link

            href="/account/orders"

            style={{

              display: "inline-flex",

              alignItems: "center",

              gap: "8px",

              color: "#295C65",

              textDecoration: "none",

              marginBottom: "30px",

              fontWeight: "600",

            }}

          >

            <ArrowLeft size={18} />

            Back to Orders

          </Link>



          <div

            style={{

              padding: "30px",

              background: "#FFFFFF",

              borderRadius: "8px",

              textAlign: "center",

              border: "1px solid #E4DCD4",

            }}

          >

            <AlertCircle size={40} style={{ margin: "0 auto 20px", color: "#DC143C" }} />

            <h2 style={{ color: "#1A1A1A", marginBottom: "10px" }}>Order Not Found</h2>

            <p style={{ color: "#696968" }}>{error || "This order could not be loaded"}</p>

          </div>

        </div>

      </div>

    );

  }



  const canCancelOrder = !["shipped", "delivered", "cancelled"].includes(order.status);



  return (

    <main style={{ padding: "40px 20px", minHeight: "80vh", background: "#FAF8F5" }}>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        <Link

          href="/account/orders"

          style={{

            display: "inline-flex",

            alignItems: "center",

            gap: "8px",

            color: "#295C65",

            textDecoration: "none",

            marginBottom: "30px",

            fontWeight: "600",

          }}

        >

          <ArrowLeft size={18} />

          Back to Orders

        </Link>



        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "30px" }}>

          <div>

            <h1 style={{ fontSize: "32px", fontWeight: "700", color: "#1A1A1A", marginBottom: "5px" }}>

              Order #{order.orderNumber}

            </h1>

            <p style={{ color: "#696968", fontSize: "14px" }}>

              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN")}

            </p>

          </div>

          <div

            style={{

              padding: "10px 20px",

              background: STATUS_COLORS[order.status],

              color: "#FFFFFF",

              borderRadius: "6px",

              fontWeight: "600",

              fontSize: "14px",

            }}

          >

            {STATUS_LABELS[order.status]}

          </div>

        </div>



        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px" }}>

          <div>

            {/* Shiprocket Tracking */}
            {(order.shipping?.awb || order.shipping?.trackingNumber || order.shipping?.shiprocketOrderId) && (
              <section style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "#295C65" }}>Shipment Tracking</h2>
                <div style={{ padding: "20px", background: "#FFFFFF", borderRadius: "8px", border: "1px solid #E4DCD4" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "16px" }}>
                    <div><div style={{ fontSize: "11px", color: "#777", marginBottom: "4px" }}>COURIER</div><div style={{ fontWeight: "700" }}>{order.shipping?.carrier || "Awaiting courier"}</div></div>
                    <div><div style={{ fontSize: "11px", color: "#777", marginBottom: "4px" }}>AWB / TRACKING</div><div style={{ fontWeight: "700", wordBreak: "break-all" }}>{order.shipping?.awb || order.shipping?.trackingNumber || "Not assigned yet"}</div></div>
                    <div><div style={{ fontSize: "11px", color: "#777", marginBottom: "4px" }}>SHIPROCKET ORDER</div><div style={{ fontWeight: "600" }}>{order.shipping?.shiprocketOrderId || "—"}</div></div>
                    <div><div style={{ fontSize: "11px", color: "#777", marginBottom: "4px" }}>SHIPMENT STATUS</div><div style={{ fontWeight: "700", color: "#295C65", textTransform: "capitalize" }}>{order.shipping?.shiprocketStatus || "Created"}</div></div>
                  </div>
                  {order.shipping?.estimatedDelivery && <div style={{ fontSize: "13px", color: "#696968", marginBottom: "14px" }}>Estimated delivery: <strong>{new Date(order.shipping.estimatedDelivery).toLocaleDateString("en-IN")}</strong></div>}
                  {trackingError && <div style={{ fontSize: "12px", color: "#A64C40", marginBottom: "12px" }}>{trackingError}</div>}
                  {trackingLoading && <div style={{ fontSize: "12px", color: "#696968", marginBottom: "12px" }}>Refreshing live tracking...</div>}
                  {order.shipping?.awb && <a href={`https://www.shiprocket.in/shipment-tracking/`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", background: "#295C65", color: "#FFFFFF", borderRadius: "6px", textDecoration: "none", fontWeight: "600", fontSize: "12px" }}>Track Shipment</a>}
                  {trackingData?.tracking?.tracking_data?.shipment_track?.length > 0 && (
                    <div style={{ marginTop: "18px", borderTop: "1px solid #F0EBE5", paddingTop: "14px" }}>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#295C65", marginBottom: "10px" }}>Latest Tracking Events</div>
                      {trackingData.tracking.tracking_data.shipment_track.slice(0, 5).map((event, index) => (
                        <div key={index} style={{ padding: "8px 0", borderBottom: index < Math.min(4, trackingData.tracking.tracking_data.shipment_track.length - 1) ? "1px solid #F2EEE9" : "none", fontSize: "12px" }}>
                          <strong>{event.activity || event.status || "Shipment update"}</strong>
                          {event.date && <span style={{ color: "#777", marginLeft: "8px" }}>{event.date}</span>}
                          {event.location && <div style={{ color: "#777", marginTop: "3px" }}>{event.location}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Status Timeline */}

            <section style={{ marginBottom: "40px" }}>

              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "#295C65" }}>

                Order Status

              </h2>

              <div

                style={{

                  padding: "20px",

                  background: "#FFFFFF",

                  borderRadius: "8px",

                  border: "1px solid #E4DCD4",

                }}

              >

                {["pending_approval", "confirmed", "packed", "shipped", "delivered"].map((status, idx, arr) => {

                  const statusOrder = ["pending_approval", "confirmed", "packed", "shipped", "delivered"];

                  const currentIdx = statusOrder.indexOf(order.status);

                  const isCompleted = statusOrder.indexOf(status) < currentIdx;

                  const isCurrent = status === order.status;



                  return (

                    <div key={status} style={{ position: "relative" }}>

                      {idx > 0 && (

                        <div

                          style={{

                            position: "absolute",

                            left: "24px",

                            top: "-20px",

                            width: "2px",

                            height: "20px",

                            background: isCompleted ? "#228B22" : "#E4DCD4",

                          }}

                        />

                      )}

                      <div style={{ display: "flex", gap: "15px", paddingBottom: idx < arr.length - 1 ? "30px" : 0 }}>

                        <div

                          style={{

                            width: "50px",

                            height: "50px",

                            borderRadius: "50%",

                            background: isCurrent ? STATUS_COLORS[status] : isCompleted ? "#228B22" : "#E4DCD4",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            flexShrink: 0,

                            color: "#FFFFFF",

                          }}

                        >

                          {isCompleted ? (

                            <CheckCircle size={24} />

                          ) : status === "shipped" ? (

                            <Truck size={24} />

                          ) : (

                            <Package size={24} />

                          )}

                        </div>

                        <div>

                          <div style={{ fontWeight: "700", color: isCurrent ? "#295C65" : "#1A1A1A" }}>

                            {STATUS_LABELS[status]}

                          </div>

                          {isCurrent && (

                            <div style={{ fontSize: "12px", color: "#696968", marginTop: "5px" }}>

                              Current status

                            </div>

                          )}

                        </div>

                      </div>

                    </div>

                  );

                })}

              </div>

            </section>



            {/* Items */}

            <section style={{ marginBottom: "40px" }}>

              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "#295C65" }}>

                Items ({order.items.length})

              </h2>

              <div

                style={{

                  background: "#FFFFFF",

                  borderRadius: "8px",

                  border: "1px solid #E4DCD4",

                  overflow: "hidden",

                }}

              >

                {order.items.map((item, idx) => (

                  <div

                    key={idx}

                    style={{

                      padding: "15px",

                      borderBottom: idx < order.items.length - 1 ? "1px solid #F2EEE9" : "none",

                      display: "flex",

                      gap: "15px",

                    }}

                  >

                    {getItemImage(item) && (

                      <img

                        src={getItemImage(item)}

                        alt={item.productName}

                        style={{

                          width: "80px",

                          height: "80px",

                          borderRadius: "6px",

                          objectFit: "cover",

                        }}

                      />

                    )}

                    <div style={{ flex: 1 }}>

                      <div style={{ fontWeight: "600", color: "#1A1A1A", marginBottom: "5px" }}>

                        {item.productName}

                      </div>

                      <div style={{ fontSize: "14px", color: "#696968", marginBottom: "8px" }}>

                        Qty: {item.quantity} × <StorefrontPrice amount={item.price} />

                      </div>

                      {(getColorName(item.selectedColor) || getColorName(item.variantSnapshot?.color) || getSizeName(item.selectedSize) || getSizeName(item.variantSnapshot?.size) || getItemSku(item)) && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                          {(getColorName(item.selectedColor) || getColorName(item.variantSnapshot?.color)) && <span style={{ padding: "4px 7px", background: "#F5F3F0", borderRadius: "4px", fontSize: "11px" }}>Color: {getColorName(item.selectedColor) || getColorName(item.variantSnapshot?.color)}</span>}
                          {(getSizeName(item.selectedSize) || getSizeName(item.variantSnapshot?.size)) && <span style={{ padding: "4px 7px", background: "#F5F3F0", borderRadius: "4px", fontSize: "11px" }}>Size: {getSizeName(item.selectedSize) || getSizeName(item.variantSnapshot?.size)}</span>}
                          {getItemSku(item) && <span style={{ padding: "4px 7px", background: "#F5F3F0", borderRadius: "4px", fontSize: "11px" }}>SKU: {getItemSku(item)}</span>}
                        </div>
                      )}

                      <div style={{ fontWeight: "700", color: "#295C65" }}>

                        <StorefrontPrice amount={item.total} />

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </section>



            {/* Shipping Address */}

            <section>

              <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "#295C65" }}>

                Shipping Address

              </h2>

              <div

                style={{

                  padding: "15px",

                  background: "#FFFFFF",

                  borderRadius: "8px",

                  border: "1px solid #E4DCD4",

                }}

              >

                <div style={{ fontWeight: "600", marginBottom: "10px" }}>{order.shippingAddress.fullName}</div>

                <div style={{ fontSize: "14px", color: "#696968", lineHeight: "1.6" }}>

                  {order.shippingAddress.addressLine1}

                  {order.shippingAddress.addressLine2 && <>{", " + order.shippingAddress.addressLine2}</>}

                  <br />

                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}

                  <br />

                  {order.shippingAddress.country}

                  <br />

                  <strong>Phone:</strong> {order.shippingAddress.phone}

                  <br />

                  <strong>Email:</strong> {order.shippingAddress.email}

                </div>

              </div>

            </section>

          </div>



          {/* Right: Summary & Actions */}

          <div>

            {/* Pricing Summary */}

            <div

              style={{

                padding: "20px",

                background: "#FFFFFF",

                borderRadius: "8px",

                border: "1px solid #E4DCD4",

                marginBottom: "20px",

              }}

            >

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "15px", color: "#295C65" }}>

                Order Summary

              </h3>

              <div style={{ fontSize: "14px" }}>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>

                  <span>Subtotal</span>

                  <span><StorefrontPrice amount={order.pricing.subtotal} /></span>

                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>

                  <span>Shipping</span>

                  <span><StorefrontPrice amount={order.pricing.shippingCharges} /></span>

                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>

                  <span>Tax</span>

                  <span><StorefrontPrice amount={order.pricing.taxAmount} /></span>

                </div>

                <div

                  style={{

                    display: "flex",

                    justifyContent: "space-between",

                    padding: "10px",

                    background: "#F5F3F0",

                    borderRadius: "4px",

                    fontWeight: "700",

                    fontSize: "16px",

                  }}

                >

                  <span>Total</span>

                  <span style={{ color: "#BE9D6B" }}><StorefrontPrice amount={order.pricing.total} /></span>

                </div>

              </div>

            </div>



            {/* Payment Info */}

            <div

              style={{

                padding: "20px",

                background: "#FFFFFF",

                borderRadius: "8px",

                border: "1px solid #E4DCD4",

                marginBottom: "20px",

              }}

            >

              <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "15px", color: "#295C65" }}>

                Payment Details

              </h3>

              <div style={{ fontSize: "14px", color: "#696968" }}>

                <div style={{ marginBottom: "10px" }}>

                  <strong>Method:</strong> {order.payment.method}

                </div>

                <div style={{ marginBottom: "10px" }}>

                  <strong>Status:</strong>{" "}

                  <span style={{ color: "#228B22", fontWeight: "600" }}>{order.payment.status}</span>

                </div>

                <div style={{ marginBottom: "10px" }}>

                  <strong>ID:</strong> {order.payment.razorpayPaymentId?.substring(0, 12)}...

                </div>

              </div>

            </div>



            {/* Cancellation */}

            {canCancelOrder && !order.cancellation && (

              <button

                onClick={() => setShowCancellationForm(true)}

                style={{

                  width: "100%",

                  padding: "12px",

                  background: "#DC143C",

                  color: "#FFFFFF",

                  border: "none",

                  borderRadius: "6px",

                  fontWeight: "600",

                  cursor: "pointer",

                }}

              >

                Request Cancellation

              </button>

            )}



            {showCancellationForm && (

              <div

                style={{

                  padding: "15px",

                  background: "#FFF5F5",

                  border: "1px solid #DC143C",

                  borderRadius: "6px",

                  marginBottom: "20px",

                }}

              >

                <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", fontSize: "14px" }}>

                  Reason for Cancellation

                </label>

                <textarea

                  value={cancellationReason}

                  onChange={(e) => setCancellationReason(e.target.value)}

                  placeholder="Please tell us why you want to cancel this order"

                  style={{

                    width: "100%",

                    padding: "10px",

                    border: "1px solid #DC143C",

                    borderRadius: "4px",

                    fontFamily: "Poppins",

                    fontSize: "14px",

                    marginBottom: "10px",

                    minHeight: "80px",

                  }}

                />

                <div style={{ display: "flex", gap: "10px" }}>

                  <button

                    onClick={handleCancellationRequest}

                    disabled={submittingCancellation}

                    style={{

                      flex: 1,

                      padding: "10px",

                      background: "#DC143C",

                      color: "#FFFFFF",

                      border: "none",

                      borderRadius: "4px",

                      fontWeight: "600",

                      cursor: submittingCancellation ? "not-allowed" : "pointer",

                      opacity: submittingCancellation ? 0.7 : 1,

                    }}

                  >

                    {submittingCancellation ? "Submitting..." : "Submit Request"}

                  </button>

                  <button

                    onClick={() => {

                      setShowCancellationForm(false);

                      setCancellationReason("");

                    }}

                    style={{

                      flex: 1,

                      padding: "10px",

                      background: "#E8DCCF",

                      color: "#295C65",

                      border: "none",

                      borderRadius: "4px",

                      fontWeight: "600",

                      cursor: "pointer",

                    }}

                  >

                    Cancel

                  </button>

                </div>

              </div>

            )}



            {order.cancellation && (

              <div

                style={{

                  padding: "15px",

                  background: "#FFF5F5",

                  border: "1px solid #DC143C",

                  borderRadius: "6px",

                  marginBottom: "20px",

                }}

              >

                <div style={{ fontWeight: "700", color: "#DC143C", marginBottom: "10px" }}>

                  Cancellation Request

                </div>

                <div style={{ fontSize: "14px", color: "#696968", marginBottom: "10px" }}>

                  <strong>Status:</strong>{" "}

                  <span style={{ textTransform: "capitalize", fontWeight: "600", color: order.cancellation.status === "approved" ? "#228B22" : "#DC143C" }}>

                    {order.cancellation.status}

                  </span>

                </div>

                <div style={{ fontSize: "14px", color: "#696968" }}>

                  <strong>Reason:</strong> {order.cancellation.requestReason || "N/A"}

                </div>

              </div>

            )}



            {/* Return Request */}

            {order.status === "delivered" && !order.return && (

              <button

                onClick={() => setShowReturnForm(true)}

                style={{

                  width: "100%",

                  padding: "12px",

                  background: "#FF8C00",

                  color: "#FFFFFF",

                  border: "none",

                  borderRadius: "6px",

                  fontWeight: "600",

                  cursor: "pointer",

                  marginBottom: "20px",

                }}

              >

                Request Return

              </button>

            )}



            {showReturnForm && (

              <div

                style={{

                  padding: "15px",

                  background: "#FFF8DC",

                  border: "1px solid #FF8C00",

                  borderRadius: "6px",

                  marginBottom: "20px",

                }}

              >

                <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", fontSize: "14px" }}>

                  Reason for Return

                </label>

                <textarea

                  value={returnReason}

                  onChange={(e) => setReturnReason(e.target.value)}

                  placeholder="Please tell us why you want to return this order"

                  style={{

                    width: "100%",

                    padding: "10px",

                    border: "1px solid #FF8C00",

                    borderRadius: "4px",

                    fontFamily: "Poppins",

                    fontSize: "14px",

                    marginBottom: "10px",

                    minHeight: "80px",

                  }}

                />

                <div style={{ display: "flex", gap: "10px" }}>

                  <button

                    onClick={handleReturnRequest}

                    disabled={submittingReturn}

                    style={{

                      flex: 1,

                      padding: "10px",

                      background: "#FF8C00",

                      color: "#FFFFFF",

                      border: "none",

                      borderRadius: "4px",

                      fontWeight: "600",

                      cursor: submittingReturn ? "not-allowed" : "pointer",

                      opacity: submittingReturn ? 0.7 : 1,

                    }}

                  >

                    {submittingReturn ? "Submitting..." : "Submit Return Request"}

                  </button>

                  <button

                    onClick={() => {

                      setShowReturnForm(false);

                      setReturnReason("");

                    }}

                    style={{

                      flex: 1,

                      padding: "10px",

                      background: "#E8DCCF",

                      color: "#295C65",

                      border: "none",

                      borderRadius: "4px",

                      fontWeight: "600",

                      cursor: "pointer",

                    }}

                  >

                    Cancel

                  </button>

                </div>

              </div>

            )}



            {order.return && (

              <div

                style={{

                  padding: "15px",

                  background: "#FFF8DC",

                  border: "1px solid #FF8C00",

                  borderRadius: "6px",

                  marginBottom: "20px",

                }}

              >

                <div style={{ fontWeight: "700", color: "#FF8C00", marginBottom: "10px" }}>

                  Return Request

                </div>

                <div style={{ fontSize: "14px", color: "#696968", marginBottom: "10px" }}>

                  <strong>Status:</strong>{" "}

                  <span style={{ textTransform: "capitalize", fontWeight: "600", color: order.return.status === "approved" ? "#228B22" : "#FF8C00" }}>

                    {order.return.status}

                  </span>

                </div>

                <div style={{ fontSize: "14px", color: "#696968" }}>

                  <strong>Reason:</strong> {order.return.reason || "N/A"}

                </div>

              </div>

            )}



            {/* Replacement Request */}

            {order.status === "delivered" && !order.replacement && (

              <button

                onClick={() => setShowReplacementForm(true)}

                style={{

                  width: "100%",

                  padding: "12px",

                  background: "#9370DB",

                  color: "#FFFFFF",

                  border: "none",

                  borderRadius: "6px",

                  fontWeight: "600",

                  cursor: "pointer",

                  marginBottom: "20px",

                }}

              >

                Request Replacement

              </button>

            )}



            {showReplacementForm && (

              <div

                style={{

                  padding: "15px",

                  background: "#F0E6FF",

                  border: "1px solid #9370DB",

                  borderRadius: "6px",

                  marginBottom: "20px",

                }}

              >

                <label style={{ display: "block", marginBottom: "10px", fontWeight: "600", fontSize: "14px" }}>

                  Reason for Replacement

                </label>

                <textarea

                  value={replacementReason}

                  onChange={(e) => setReplacementReason(e.target.value)}

                  placeholder="Please tell us why you want to replace this order"

                  style={{

                    width: "100%",

                    padding: "10px",

                    border: "1px solid #9370DB",

                    borderRadius: "4px",

                    fontFamily: "Poppins",

                    fontSize: "14px",

                    marginBottom: "10px",

                    minHeight: "80px",

                  }}

                />

                <div style={{ display: "flex", gap: "10px" }}>

                  <button

                    onClick={handleReplacementRequest}

                    disabled={submittingReplacement}

                    style={{

                      flex: 1,

                      padding: "10px",

                      background: "#9370DB",

                      color: "#FFFFFF",

                      border: "none",

                      borderRadius: "4px",

                      fontWeight: "600",

                      cursor: submittingReplacement ? "not-allowed" : "pointer",

                      opacity: submittingReplacement ? 0.7 : 1,

                    }}

                  >

                    {submittingReplacement ? "Submitting..." : "Submit Replacement Request"}

                  </button>

                  <button

                    onClick={() => {

                      setShowReplacementForm(false);

                      setReplacementReason("");

                    }}

                    style={{

                      flex: 1,

                      padding: "10px",

                      background: "#E8DCCF",

                      color: "#295C65",

                      border: "none",

                      borderRadius: "4px",

                      fontWeight: "600",

                      cursor: "pointer",

                    }}

                  >

                    Cancel

                  </button>

                </div>

              </div>

            )}



            {order.replacement && (

              <div

                style={{

                  padding: "15px",

                  background: "#F0E6FF",

                  border: "1px solid #9370DB",

                  borderRadius: "6px",

                  marginBottom: "20px",

                }}

              >

                <div style={{ fontWeight: "700", color: "#9370DB", marginBottom: "10px" }}>

                  Replacement Request

                </div>

                <div style={{ fontSize: "14px", color: "#696968", marginBottom: "10px" }}>

                  <strong>Status:</strong>{" "}

                  <span style={{ textTransform: "capitalize", fontWeight: "600", color: order.replacement.status === "approved" ? "#228B22" : "#9370DB" }}>

                    {order.replacement.status}

                  </span>

                </div>

                <div style={{ fontSize: "14px", color: "#696968" }}>

                  <strong>Reason:</strong> {order.replacement.reason || "N/A"}

                </div>

              </div>

            )}

          </div>

        </div>

      </div>



      <style>{`

        @keyframes spin {

          to { transform: rotate(360deg); }

        }

      `}</style>

    </main>

  );

}
