"use client";



import { useCallback, useEffect, useState, Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";

import Script from "next/script";

import {

  ArrowLeft,

  Plus,

  Loader,

  AlertCircle,

} from "lucide-react";

import { useCart } from "@/context/CartContext";



const API_URL = (

  process.env.NEXT_PUBLIC_API_URL ||

  "http://localhost:5001/api"

).replace(/\/$/, "");



const SHIPPING_RATES = {

  standard: 150,

  express: 300,

};



const TAX_RATE = 0.05;



const INITIAL_FORM = {

  fullName: "",

  phone: "",

  email: "",

  addressLine1: "",

  addressLine2: "",

  city: "",

  state: "",

  pincode: "",

};



function getColorName(color) {

  if (!color) return "";



  if (typeof color === "string") {

    return color;

  }



  return color?.name || color?.value || "";

}



function getColorHex(color) {

  if (!color || typeof color === "string") {

    return "";

  }



  return color?.hex || "";

}



function getSizeName(size) {

  if (!size) return "";



  if (typeof size === "string") {

    return size;

  }



  return size?.name || size?.value || "";

}



function getItemPrice(item) {

  /*

   * IMPORTANT:

   * The cart API already returns `price` resolved

   * against the selected variant. Use that first.

   */

  const serverPrice = Number(item?.price);



  if (

    Number.isFinite(serverPrice) &&

    serverPrice >= 0

  ) {

    return serverPrice;

  }



  /*

   * Fallback for older cart entries / cached items.

   */

  const snapshot =

    item?.snapshot || {};



  const variantSalePrice = Number(

    snapshot?.variantSalePrice

  );



  const variantRegularPrice = Number(

    snapshot?.variantRegularPrice

  );



  const salePrice = Number(

    snapshot?.salePrice

  );



  const regularPrice = Number(

    snapshot?.regularPrice ??

      item?.regularPrice ??

      0

  );



  if (

    Number.isFinite(variantSalePrice) &&

    variantSalePrice > 0 &&

    Number.isFinite(variantRegularPrice) &&

    variantRegularPrice > variantSalePrice

  ) {

    return variantSalePrice;

  }



  if (

    Number.isFinite(variantRegularPrice) &&

    variantRegularPrice > 0

  ) {

    return variantRegularPrice;

  }



  if (

    Number.isFinite(salePrice) &&

    salePrice > 0 &&

    salePrice < regularPrice

  ) {

    return salePrice;

  }



  return Number.isFinite(regularPrice)

    ? regularPrice

    : 0;

}



function getItemTitle(item) {

  return (

    item?.product?.title ||

    item?.snapshot?.title ||

    item?.title ||

    "Product"

  );

}



function getItemImage(item) {

  return (

    item?.product?.imageUrl ||

    item?.snapshot?.imageUrl ||

    item?.product?.images?.[0]?.url ||

    item?.snapshot?.images?.[0]?.url ||

    "/images/home/products/1.png"

  );

}



function formatINR(value) {

  return Number(value || 0).toLocaleString(

    "en-IN"

  );

}



export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}

function CheckoutPageContent() {

  const router = useRouter();

  const searchParams = useSearchParams();



const {

  items: cartItems,

  itemCount,

  isLoggedIn,

  loading: cartLoading,



  // BUY NOW

  buyNowItems,

  buyNowLoading,

  restoreBuyNowSession,

  clearBuyNowItems,



  // NORMAL CART

  clearCart,

} = useCart();



  /* =====================================================

     STATE

  \===================================================== */



  const [addresses, setAddresses] =

    useState([]);



  const [selectedAddress, setSelectedAddress] =

    useState(null);



  const [shippingMethod, setShippingMethod] =

    useState("standard");


  const [shippingLoading, setShippingLoading] =

    useState(false);


  const [shippingQuotes, setShippingQuotes] =

    useState({

      standard: null,

      express: null,

    });



  const [showAddressForm, setShowAddressForm] =

    useState(false);



  const [loading, setLoading] =

    useState(false);



  const [error, setError] =

    useState(null);



  const [formData, setFormData] =

    useState(INITIAL_FORM);



  /* =====================================================

     DETERMINE ITEMS TO DISPLAY

     If buyNowItems exist, use them. Otherwise use cartItems

  \===================================================== */



  /* Get sessionId from URL if available */

  const urlSessionId = searchParams.get("buyNowSessionId");



  /*

   * URL only contains the session ID.

   * The actual product/colour/size/images/price are restored

   * from the authenticated backend session by CartContext.

   */

  const effectiveBuyNowItems =

    Array.isArray(buyNowItems) && buyNowItems.length > 0

      ? buyNowItems

      : [];



  const itemsToDisplay =

    (Array.isArray(effectiveBuyNowItems) &&

    effectiveBuyNowItems.length > 0

      ? effectiveBuyNowItems

      : cartItems).filter(item => !item?.unavailable);



  const isBuyNowMode =

    Array.isArray(effectiveBuyNowItems) &&

    effectiveBuyNowItems.length > 0;



  const loadAddresses =

    useCallback(async () => {

      try {

        setError(null);



        const res = await fetch(

          `${API_URL}/addresses`,

          {

            method: "GET",

            credentials: "include",

            cache: "no-store",

          }

        );



        let data = {};



        try {

          data = await res.json();

        } catch {

          data = {};

        }



        if (res.status === 401) {

          window.location.href =

            `/account?redirect=${encodeURIComponent(

              "/checkout"

            )}`;



          return;

        }



        if (!res.ok) {

          throw new Error(

            data?.message ||

              "Failed to load addresses"

          );

        }



        if (!data?.success) {

          throw new Error(

            data?.message ||

              "Failed to load addresses"

          );

        }



        const shippingAddresses =

          Array.isArray(data?.addresses)

            ? data.addresses.filter(

                (address) =>

                  address?.type ===

                  "shipping"

              )

            : [];



        setAddresses(

          shippingAddresses

        );



        if (

          shippingAddresses.length >

          0

        ) {

          const defaultAddress =

            shippingAddresses.find(

              (address) =>

                address?.isDefault

            );



          setSelectedAddress(

            defaultAddress?._id ||

              shippingAddresses[0]?._id ||

              null

          );

        } else {

          setSelectedAddress(null);

        }

      } catch (err) {

        console.error(

          "Error loading addresses:",

          err

        );



        setError(

          err?.message ||

            "Failed to load addresses"

        );

      }

    }, []);



  /* =====================================================

     LOAD PAGE DATA

  \===================================================== */



  useEffect(() => {

    let cancelled = false;



    const restoreAndLoad = async () => {

      if (cartLoading || buyNowLoading) {

        return;

      }



      if (isLoggedIn === false) {

        window.location.href =

          `/account?redirect=${encodeURIComponent(

            `/checkout${urlSessionId ? `?buyNowSessionId=${encodeURIComponent(urlSessionId)}` : ""}`

          )}`;

        return;

      }



      if (isLoggedIn && urlSessionId) {

        const alreadyRestored =
          Array.isArray(buyNowItems) &&
          buyNowItems.some(
            (item) =>
              String(
                item?.sessionId ||
                item?._id
              ) === String(urlSessionId) &&
              Boolean(item?.productId) &&
              Boolean(
                item?.title ||
                item?.snapshot?.title
              ) &&
              Boolean(
                item?.imageUrl ||
                item?.snapshot?.imageUrl
              )
          );



        if (!alreadyRestored) {

          const restored = await restoreBuyNowSession(urlSessionId);

          if (cancelled) return;



          if (!restored?.success) {

            setError(

              restored?.message ||

                "This Buy Now session has expired. Please select Buy Now again."

            );

            return;

          }

        }



        await loadAddresses();

        return;

      }



      if (

        isLoggedIn &&

        itemsToDisplay.length === 0

      ) {

        router.push("/cart");

        return;

      }



      if (

        isLoggedIn &&

        itemsToDisplay.length > 0

      ) {

        loadAddresses();

      }

    };



    restoreAndLoad();



    return () => {

      cancelled = true;

    };

  }, [

    cartLoading,

    buyNowLoading,

    isLoggedIn,

    urlSessionId,

    buyNowItems,

    itemsToDisplay.length,

    router,

    loadAddresses,

    restoreBuyNowSession,

  ]);



  /* =====================================================

     ADD NEW ADDRESS

  \===================================================== */



  const useCurrentLocation = useCallback(async () => {

    setError(null);



    if (typeof window === "undefined" || !navigator.geolocation) {

      setError("Your browser does not support current location.");

      return;

    }



    setLoading(true);



    try {

      const position = await new Promise((resolve, reject) => {

        navigator.geolocation.getCurrentPosition(

          resolve,

          reject,

          {

            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 0,

          }

        );

      });



      const { latitude, longitude } = position.coords;



      const response = await fetch(

        `${API_URL}/addresses/reverse-geocode?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`,

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



      if (!response.ok || !data?.success || !data?.address) {

        throw new Error(

          data?.message ||

            "Unable to fetch address from current location."

        );

      }



      const locationAddress = data.address;



      setFormData((current) => ({

        ...current,

        addressLine1:

          locationAddress.addressLine1 || current.addressLine1,

        addressLine2:

          locationAddress.addressLine2 || current.addressLine2,

        city: locationAddress.city || current.city,

        state: locationAddress.state || current.state,

        pincode: locationAddress.pincode || current.pincode,

        country: locationAddress.country || "India",

      }));

    } catch (err) {

      console.error("Current location error:", err);



      let message = "Unable to fetch current location.";



      if (err?.code === 1) {

        message = "Location permission denied. Please allow location access in your browser.";

      } else if (err?.code === 2) {

        message = "Your current location could not be determined.";

      } else if (err?.code === 3) {

        message = "Location request timed out. Please try again.";

      } else if (err?.message) {

        message = err.message;

      }



      setError(message);

    } finally {

      setLoading(false);

    }

  }, []);
/* =====================================================

     ADD NEW ADDRESS

  \===================================================== */



  const handleAddAddress =

    useCallback(

      async (event) => {

        event.preventDefault();



        setLoading(true);

        setError(null);



        try {

          const res = await fetch(

            `${API_URL}/addresses`,

            {

              method: "POST",

              credentials: "include",

              headers: {

                "Content-Type":

                  "application/json",

              },

              body: JSON.stringify({

                type: "shipping",

                ...formData,

              }),

            }

          );



          let data = {};



          try {

            data = await res.json();

          } catch {

            data = {};

          }



          if (res.status === 401) {

            window.location.href =

              `/account?redirect=${encodeURIComponent(

                "/checkout"

              )}`;



            return;

          }



          if (!res.ok) {

            throw new Error(

              data?.message ||

                "Failed to add address"

            );

          }



          if (!data?.success) {

            throw new Error(

              data?.message ||

                "Failed to add address"

            );

          }



          const newAddress =

            data?.address;



          if (!newAddress) {

            throw new Error(

              "Address was saved but no address data was returned."

            );

          }



          setAddresses(

            (current) => [

              ...current,

              newAddress,

            ]

          );



          setSelectedAddress(

            newAddress._id

          );



          setShowAddressForm(false);

          setFormData({

            ...INITIAL_FORM,

          });

        } catch (err) {

          console.error(

            "Error adding address:",

            err

          );



          setError(

            err?.message ||

              "Failed to add address"

          );

        } finally {

          setLoading(false);

        }

      },

      [formData]

    );



  /* =====================================================

     LIVE SHIPPING PREVIEW

     Shipping is always calculated by the backend so the
     checkout matches the product/admin configuration.

  \===================================================== */

  useEffect(() => {

    let cancelled = false;

    const loadShippingQuotes = async () => {

      if (cartLoading || buyNowLoading || isLoggedIn !== true) {

        return;

      }

      if (!Array.isArray(itemsToDisplay) || itemsToDisplay.length === 0) {

        setShippingQuotes({ standard: 0, express: 0 });

        setShippingLoading(false);

        return;

      }

      setShippingLoading(true);

      setShippingQuotes({ standard: null, express: null });

      try {

        const response = await fetch(
          `${API_URL}/payments/shipping-preview`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              buyNowSessionId: isBuyNowMode
                ? urlSessionId || effectiveBuyNowItems?.[0]?.sessionId || ""
                : "",
            }),
            cache: "no-store",
          }
        );

        let data = {};
        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (cancelled) return;

        if (response.status === 401) {
          window.location.href =
            `/account?redirect=${encodeURIComponent(
              urlSessionId
                ? `/checkout?buyNowSessionId=${encodeURIComponent(urlSessionId)}`
                : "/checkout"
            )}`;
          return;
        }

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message || "Unable to calculate shipping charges."
          );
        }

        setShippingQuotes({
          standard: Number(data?.shipping?.standard ?? 0),
          express: Number(data?.shipping?.express ?? 0),
        });
      } catch (err) {

        if (cancelled) return;

        console.error("Shipping preview error:", err);
        setShippingQuotes({ standard: null, express: null });
        setError(
          err?.message ||
            "Unable to calculate shipping charges. Please try again."
        );
      } finally {

        if (!cancelled) {
          setShippingLoading(false);
        }
      }
    };

    loadShippingQuotes();

    return () => {
      cancelled = true;
    };
  }, [
    API_URL,
    cartLoading,
    buyNowLoading,
    isLoggedIn,
    isBuyNowMode,
    urlSessionId,
    effectiveBuyNowItems,
    itemsToDisplay.length,
  ]);


  /* =====================================================

     TOTALS

  \===================================================== */



  const subtotal =

    itemsToDisplay.reduce(

      (sum, item) => {

        const price =

          getItemPrice(item);



        const quantity =

          Number(item?.quantity) || 0;



        return (

          sum +

          price * quantity

        );

      },

      0

    );



  const shippingCharges =

    Number(shippingQuotes?.[shippingMethod] ?? 0);



  const tax =

    Math.round(

      subtotal * TAX_RATE

    );



  const total =

    subtotal +

    shippingCharges +

    tax;



  /* =====================================================

     PAYMENT

  \===================================================== */



  const handlePayment =

    useCallback(async () => {

      setError(null);



      if (!selectedAddress) {

        setError(

          "Please select a shipping address."

        );

        return;

      }



      if (

        !Array.isArray(itemsToDisplay) ||

        itemsToDisplay.length === 0

      ) {

        setError(

          "Your cart is empty."

        );

        router.push("/cart");

        return;

      }



      const selectedAddr =

        addresses.find(

          (address) =>

            String(address?._id) ===

            String(selectedAddress)

        );



      if (!selectedAddr) {

        setError(

          "Selected address was not found."

        );

        return;

      }



      if (

        !["standard", "express"].includes(

          shippingMethod

        )

      ) {

        setError(

          "Please select a valid shipping method."

        );

        return;

      }



      setLoading(true);



      try {

        /* =============================================

           STEP 1

           CREATE RAZORPAY ORDER

        \============================================= */



        const createOrderRes =

          await fetch(

            `${API_URL}/payments/create-order`,

            {

              method: "POST",

              credentials: "include",

              headers: {

                "Content-Type":

                  "application/json",

              },

              body: JSON.stringify({

                addressId:

                  selectedAddress,

                shippingMethod,

                sessionId:

                  isBuyNowMode

                    ? effectiveBuyNowItems?.[0]?.sessionId

                    : undefined,

              }),

            }

          );



        let orderData = {};



        try {

          orderData =

            await createOrderRes.json();

        } catch {

          orderData = {};

        }



        if (

          createOrderRes.status ===

          401

        ) {

          window.location.href =

            `/account?redirect=${encodeURIComponent(

              "/checkout"

            )}`;



          return;

        }



        if (!createOrderRes.ok) {

          throw new Error(

            orderData?.message ||

              `Unable to create payment order (${createOrderRes.status}).`

          );

        }



        if (!orderData?.success) {

          throw new Error(

            orderData?.message ||

              "Failed to create payment order."

          );

        }



        const razorpayOrderId =

          orderData?.razorpayOrderId;



        const keyId =

          orderData?.keyId;



        const serverAmount =

          Number(orderData?.amount);



        if (!razorpayOrderId) {

          throw new Error(

            "Razorpay order ID was not returned by the server."

          );

        }



        if (!keyId) {

          throw new Error(

            "Razorpay key was not returned by the server."

          );

        }



        if (

          !Number.isFinite(

            serverAmount

          ) ||

          serverAmount <= 0

        ) {

          throw new Error(

            "Invalid payment amount received from the server."

          );

        }



        /* =============================================

           STEP 2

           MAKE SURE RAZORPAY SCRIPT EXISTS

        \============================================= */



        if (

          typeof window ===

            "undefined" ||

          !window.Razorpay

        ) {

          throw new Error(

            "Razorpay is still loading. Please wait a moment and try again."

          );

        }



        /* =============================================

           STEP 3

           RAZORPAY OPTIONS

        \============================================= */



        const cartPreviewCount =

          Array.isArray(

            orderData?.cartPreview

          )

            ? orderData

                .cartPreview.length

            : Array.isArray(

                orderData?.cartData

                  ?.items

              )

            ? orderData.cartData.items

                .length

            : cartItems.length;



        const razorpayOptions = {

          key: keyId,



          /*

           * Backend `amount` is INR.

           * Razorpay expects paise.

           */

          amount: Math.round(

            serverAmount * 100

          ),



          currency:

            orderData?.currency ||

            "INR",



          name: "Bhavya Fabrics",



          description:

            `Order for ${cartPreviewCount} ${

              cartPreviewCount === 1

                ? "item"

                : "items"

            }`,



          order_id:

            razorpayOrderId,



          prefill: {

            name:

              selectedAddr?.fullName ||

              "",



            email:

              selectedAddr?.email ||

              "",



            contact:

              selectedAddr?.phone ||

              "",

          },



          theme: {

            color: "#295C65",

          },



          handler:

            async function (

              response

            ) {

              try {

                /*

                 * Razorpay returns all three

                 * values only after a successful payment.

                 */

                if (

                  !response

                    ?.razorpay_order_id ||

                  !response

                    ?.razorpay_payment_id ||

                  !response

                    ?.razorpay_signature

                ) {

                  throw new Error(

                    "Incomplete payment response received from Razorpay."

                  );

                }



                /* =====================================

                   STEP 4

                   VERIFY PAYMENT



                   IMPORTANT:

                   Backend now recalculates cart,

                   pricing, variant, stock and address.

                   Do NOT send frontend cart totals

                   as the source of truth.

                \===================================== */



                const verifyRes =

                  await fetch(

                    `${API_URL}/payments/verify`,

                    {

                      method: "POST",

                      credentials:

                        "include",

                      headers: {

                        "Content-Type":

                          "application/json",

                      },

                      body:

                        JSON.stringify({

                          razorpayOrderId:

                            response.razorpay_order_id,



                          razorpayPaymentId:

                            response.razorpay_payment_id,



                          razorpaySignature:

                            response.razorpay_signature,



                          /*

                           * Backend expects the

                           * selected address ID.

                           */

                          addressId:

                            selectedAddress,



                          shippingMethod,



                          sessionId:

                            isBuyNowMode

                              ? effectiveBuyNowItems?.[0]?.sessionId

                              : undefined,

                        }),

                    }

                  );



                let verifyData =

                  {};



                try {

                  verifyData =

                    await verifyRes.json();

                } catch {

                  verifyData =

                    {};

                }



                if (

                  verifyRes.status ===

                  401

                ) {

                  window.location.href =

                    `/account?redirect=${encodeURIComponent(

                      "/checkout"

                    )}`;



                  return;

                }



                if (!verifyRes.ok) {

                  throw new Error(

                    verifyData?.message ||

                      `Payment verification failed (${verifyRes.status}).`

                  );

                }



                if (

                  !verifyData?.success

                ) {

                  throw new Error(

                    verifyData?.message ||

                      "Payment verification failed."

                  );

                }



                /*

                 * Order was successfully created.

                 * Go directly to order details.

                 */

                const orderId =

                  verifyData?.orderId;



                if (!orderId) {

                  throw new Error(

                    "Payment was successful but order ID was not returned."

                  );

                }



                router.push(

                  `/account/orders/${orderId}?status=success`

                );



                /* Clear buyNowItems and cart after successful order */

                clearBuyNowItems();

              } catch (err) {

                console.error(

                  "Payment verification error:",

                  err

                );



                setError(

                  err?.message ||

                    "Payment verification failed. Please contact support if money was deducted."

                );



                setLoading(false);

              }

            },



          modal: {

            ondismiss:

              function () {

                setLoading(false);

              },

          },

        };



        /* =============================================

           STEP 5

           OPEN RAZORPAY

        \============================================= */



        const razorpay =

          new window.Razorpay(

            razorpayOptions

          );



        razorpay.on(

          "payment.failed",

          function (response) {

            console.error(

              "Payment failed:",

              response?.error

            );



            setError(

              response?.error

                ?.description ||

                "Payment failed. Please try again."

            );



            setLoading(false);

          }

        );



        razorpay.open();

      } catch (err) {

        console.error(

          "Payment error:",

          err

        );



        setError(

          err?.message ||

            "Payment failed. Please try again."

        );



        setLoading(false);

      }

    }, [

      selectedAddress,

      addresses,

      shippingMethod,

      itemsToDisplay,

      router,

    ]);



  /* =====================================================

     LOADING SCREEN

  \===================================================== */



  if (cartLoading) {

    return (

      <>

        <main className="checkout-page checkout-loading">

          <Loader

            size={40}

            className="checkout-spinner"

          />



          <p>

            Loading checkout...

          </p>

        </main>



        <style>{`

          .checkout-loading {

            min-height: 70vh;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            background: #FAF8F5;

            color: #696968;

          }



          .checkout-spinner {

            animation: checkout-spin 1s linear infinite;

          }



          .checkout-loading p {

            margin-top: 20px;

          }



          @keyframes checkout-spin {

            to {

              transform: rotate(360deg);

            }

          }

        `}</style>

      </>

    );

  }



  if (isLoggedIn === false) {

    return (

      <main className="checkout-page checkout-loading">

        <Loader

          size={40}

          className="checkout-spinner"

        />



        <p>

          Redirecting to login...

        </p>



        <style>{`

          .checkout-loading {

            min-height: 70vh;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            background: #FAF8F5;

            color: #696968;

          }



          .checkout-spinner {

            animation: checkout-spin 1s linear infinite;

          }



          @keyframes checkout-spin {

            to {

              transform: rotate(360deg);

            }

          }

        `}</style>

      </main>

    );

  }



  /* =====================================================

     MAIN PAGE

  \===================================================== */



  return (

    <main className="checkout-page">

      <div className="checkout-container">

        {/* ===============================================

           BACK TO CART

        \=============================================== */}



        <Link

          href="/cart"

          className="checkout-back"

        >

          <ArrowLeft size={18} />

          Back to Cart

        </Link>



        <h1 className="checkout-title">

          Checkout

        </h1>



        {/* ===============================================

           ERROR

        \=============================================== */}



        {error && (

          <div className="checkout-error">

            <AlertCircle

              size={20}

              className="checkout-error-icon"

            />



            <div>

              {error}

            </div>

          </div>

        )}



        {/* ===============================================

           MAIN GRID

        \=============================================== */}



        <div className="checkout-grid">

          {/* =============================================

             LEFT

          \============================================= */}



          <div className="checkout-left">

            {/* ===========================================

               SHIPPING ADDRESS

            \=========================================== */}



            <section className="checkout-section">

              <h2 className="checkout-section-title">

                Shipping Address

              </h2>



              {addresses.length >

                0 && (

                <div className="address-list">

                  {addresses.map(

                    (address) => {

                      const isSelected =

                        String(

                          selectedAddress

                        ) ===

                        String(

                          address?._id

                        );



                      return (

                        <label

                          key={

                            address._id

                          }

                          className={`address-card ${

                            isSelected

                              ? "address-card-selected"

                              : ""

                          }`}

                        >

                          <input

                            type="radio"

                            name="address"

                            value={

                              address._id

                            }

                            checked={

                              isSelected

                            }

                            onChange={(

                              event

                            ) =>

                              setSelectedAddress(

                                event

                                  .target

                                  .value

                              )

                            }

                          />



                          <div className="address-content">

                            <strong>

                              {

                                address.fullName

                              }

                            </strong>



                            <div className="address-text">

                              {

                                address.addressLine1

                              }



                              {address.addressLine2 ? (

                                <>

                                  ,{" "}

                                  {

                                    address.addressLine2

                                  }

                                </>

                              ) : null}



                              <br />



                              {

                                address.city

                              }

                              ,{" "}

                              {

                                address.state

                              }{" "}

                              {

                                address.pincode

                              }



                              <br />



                              {address.country ||

                                "India"}



                              <br />



                              <span className="address-phone">

                                📱{" "}

                                {

                                  address.phone

                                }

                              </span>



                              {address.email ? (

                                <>

                                  <br />

                                  <span className="address-email">

                                    ✉️{" "}

                                    {

                                      address.email

                                    }

                                  </span>

                                </>

                              ) : null}

                            </div>

                          </div>

                        </label>

                      );

                    }

                  )}

                </div>

              )}



              {!showAddressForm && (

                <button

                  type="button"

                  onClick={() =>

                    setShowAddressForm(

                      true

                    )

                  }

                  className="add-address-button"

                >

                  <Plus size={18} />

                  Add New Address

                </button>

              )}



              {/* =======================================

                 ADDRESS FORM

              \======================================= */}



              {showAddressForm && (

                <form

                  onSubmit={

                    handleAddAddress

                  }

                  className="address-form"

                >

                  <button

                    type="button"

                    onClick={useCurrentLocation}

                    disabled={loading}

                    className="add-address-button"

                    style={{ marginBottom: "16px" }}

                  >

                    {loading ? "Fetching location..." : "📍 Use Current Location"}

                  </button>



                  <div className="form-grid-two">

                    <div className="form-field">

                      <label>

                        Full Name

                      </label>



                      <input

                        type="text"

                        placeholder="Full Name"

                        value={

                          formData.fullName

                        }

                        onChange={(event) =>

                          setFormData(

                            (

                              current

                            ) => ({

                              ...current,

                              fullName:

                                event

                                  .target

                                  .value,

                            })

                          )

                        }

                        required

                      />

                    </div>



                    <div className="form-field">

                      <label>

                        Phone

                      </label>



                      <input

                        type="tel"

                        placeholder="Phone (10 digits)"

                        value={

                          formData.phone

                        }

                        onChange={(event) =>

                          setFormData(

                            (

                              current

                            ) => ({

                              ...current,

                              phone:

                                event

                                  .target

                                  .value,

                            })

                          )

                        }

                        required

                      />

                    </div>

                  </div>



                  <div className="form-field">

                    <label>

                      Email

                    </label>



                    <input

                      type="email"

                      placeholder="Email"

                      value={

                        formData.email

                      }

                      onChange={(event) =>

                        setFormData(

                          (current) => ({

                            ...current,

                            email:

                              event

                                .target

                                .value,

                          })

                        )

                      }

                      required

                    />

                  </div>



                  <div className="form-field">

                    <label>

                      Address Line 1

                    </label>



                    <input

                      type="text"

                      placeholder="Street Address"

                      value={

                        formData.addressLine1

                      }

                      onChange={(event) =>

                        setFormData(

                          (current) => ({

                            ...current,

                            addressLine1:

                              event

                                .target

                                .value,

                          })

                        )

                      }

                      required

                    />

                  </div>



                  <div className="form-field">

                    <label>

                      Address Line 2

                      (Optional)

                    </label>



                    <input

                      type="text"

                      placeholder="Apartment, Suite, etc."

                      value={

                        formData.addressLine2

                      }

                      onChange={(event) =>

                        setFormData(

                          (current) => ({

                            ...current,

                            addressLine2:

                              event

                                .target

                                .value,

                          })

                        )

                      }

                    />

                  </div>



                  <div className="form-grid-two">

                    <div className="form-field">

                      <label>

                        City

                      </label>



                      <input

                        type="text"

                        placeholder="City"

                        value={

                          formData.city

                        }

                        onChange={(

                          event

                        ) =>

                          setFormData(

                            (

                              current

                            ) => ({

                              ...current,

                              city:

                                event

                                  .target

                                  .value,

                            })

                          )

                        }

                        required

                      />

                    </div>



                    <div className="form-field">

                      <label>

                        State

                      </label>



                      <input

                        type="text"

                        placeholder="State"

                        value={

                          formData.state

                        }

                        onChange={(

                          event

                        ) =>

                          setFormData(

                            (

                              current

                            ) => ({

                              ...current,

                              state:

                                event

                                  .target

                                  .value,

                            })

                          )

                        }

                        required

                      />

                    </div>

                  </div>



                  <div className="form-field">

                    <label>

                      Pincode

                    </label>



                    <input

                      type="text"

                      inputMode="numeric"

                      placeholder="Pincode (6 digits)"

                      value={

                        formData.pincode

                      }

                      onChange={(event) =>

                        setFormData(

                          (current) => ({

                            ...current,

                            pincode:

                              event

                                .target

                                .value,

                          })

                        )

                      }

                      required

                    />

                  </div>



                  <div className="address-form-actions">

                    <button

                      type="submit"

                      disabled={

                        loading

                      }

                      className="save-address-button"

                    >

                      {loading

                        ? "Saving..."

                        : "Save Address"}

                    </button>



                    <button

                      type="button"

                      onClick={() => {

                        setShowAddressForm(

                          false

                        );

                        setError(null);

                      }}

                      className="cancel-address-button"

                    >

                      Cancel

                    </button>

                  </div>

                </form>

              )}

            </section>



            {/* ===========================================

               SHIPPING METHOD

            \=========================================== */}



            <section className="checkout-section">

              <h2 className="checkout-section-title">

                Shipping Method

              </h2>



              <label

                className={`shipping-option ${

                  shippingMethod ===

                  "standard"

                    ? "shipping-option-selected"

                    : ""

                }`}

              >

                <input

                  type="radio"

                  name="shipping"

                  value="standard"

                  checked={

                    shippingMethod ===

                    "standard"

                  }

                  onChange={(event) =>

                    setShippingMethod(

                      event.target

                        .value

                    )

                  }

                />



                <div>

                  <strong>

                    Standard Delivery

                    (3-5 days)

                  </strong>



                  <div className="shipping-price">

                    ₹

                    {formatINR(

                      shippingQuotes?.standard ?? 0

                    )}

                  </div>

                </div>

              </label>



              <label

                className={`shipping-option ${

                  shippingMethod ===

                  "express"

                    ? "shipping-option-selected"

                    : ""

                }`}

              >

                <input

                  type="radio"

                  name="shipping"

                  value="express"

                  checked={

                    shippingMethod ===

                    "express"

                  }

                  onChange={(event) =>

                    setShippingMethod(

                      event.target

                        .value

                    )

                  }

                />



                <div>

                  <strong>

                    Express Delivery

                    (1-2 days)

                  </strong>



                  <div className="shipping-price">

                    ₹

                    {formatINR(

                      shippingQuotes?.express ?? 0

                    )}

                  </div>

                </div>

              </label>

            </section>

          </div>



          {/* =============================================

             RIGHT - ORDER SUMMARY

          \============================================= */}



          <aside className="order-summary">

            <h2 className="order-summary-title">

              Order Summary

            </h2>



            <div className="summary-items">

              {itemsToDisplay.map(

                (item) => {

                  const price =

                    getItemPrice(

                      item

                    );



                  const quantity =

                    Number(

                      item?.quantity

                    ) || 0;



                  const colorName =

                    getColorName(

                      item?.selectedColor

                    );



                  const colorHex =

                    getColorHex(

                      item?.selectedColor

                    );



                  const sizeName =

                    getSizeName(

                      item?.selectedSize

                    );



                  const sku =

                    item?.sku ||

                    "";



                  return (

                    <div

                      key={

                        item?._id ||

                        `${item?.productId}-${item?.variantId}-${sizeName}-${colorName}`

                      }

                      className="summary-item"

                    >

                      <img

                        src={getItemImage(

                          item

                        )}

                        alt={getItemTitle(

                          item

                        )}

                        className="summary-item-image"

                        onError={(

                          event

                        ) => {

                          if (

                            event

                              .currentTarget

                              .dataset

                              .fallbackApplied

                          ) {

                            return;

                          }



                          event.currentTarget.dataset.fallbackApplied =

                            "true";



                          event.currentTarget.src =

                            "/images/home/products/1.png";

                        }}

                      />



                      <div className="summary-item-info">

                        <div className="summary-item-top">

                          <div className="summary-item-title">

                            {getItemTitle(

                              item

                            )}

                          </div>



                          <div className="summary-item-total">

                            ₹

                            {formatINR(

                              price *

                                quantity

                            )}

                          </div>

                        </div>



                        <div className="summary-item-qty">
                          {item?.sellingMode === "meter"
                            ? `Quantity: ${quantity}m`
                            : `Quantity: ${quantity} unit${quantity === 1 ? "" : "s"}`}
                        </div>



                        {colorName ? (

                          <div className="summary-variant">

                            <span>

                              Color:

                            </span>



                            <span className="summary-variant-value">

                              {colorHex ? (

                                <span

                                  className="summary-color-dot"

                                  style={{

                                    background:

                                      colorHex,

                                  }}

                                />

                              ) : null}



                              {

                                colorName

                              }

                            </span>

                          </div>

                        ) : null}



                        {sizeName ? (

                          <div className="summary-variant">

                            <span>

                              Size:

                            </span>



                            <span className="summary-variant-value">

                              {

                                sizeName

                              }

                            </span>

                          </div>

                        ) : null}



                        {sku ? (

                          <div className="summary-sku">

                            SKU:{" "}

                            {

                              sku

                            }

                          </div>

                        ) : null}

                      </div>

                    </div>

                  );

                }

              )}

            </div>



            <div className="summary-divider" />



            <div className="summary-row">

              <span>

                Subtotal

              </span>



              <span>

                ₹

                {formatINR(

                  subtotal

                )}

              </span>

            </div>



            <div className="summary-row">

              <span>

                Shipping

              </span>



              <span>

                ₹

                {formatINR(

                  shippingCharges

                )}

              </span>

            </div>



            <div className="summary-row summary-row-tax">

              <span>

                Tax (5%)

              </span>



              <span>

                ₹

                {formatINR(tax)}

              </span>

            </div>



            <div className="summary-total">

              <span>

                Total

              </span>



              <span>

                ₹

                {formatINR(

                  total

                )}

              </span>

            </div>



            <button

              type="button"

              onClick={

                handlePayment

              }

              disabled={

                loading ||

                shippingLoading ||

                shippingQuotes?.[shippingMethod] === null ||

                shippingQuotes?.[shippingMethod] === undefined ||

                !selectedAddress ||

                itemsToDisplay.length ===

                  0

              }

              className="payment-button"

            >

              {loading

                ? "Processing..."

                : "Proceed to Payment"}

            </button>



            <p className="payment-note">

              Your final amount is

              verified securely on the

              server before the order is

              created.

            </p>

          </aside>

        </div>

      </div>



      {/* ===============================================

         RAZORPAY SCRIPT

      \=============================================== */}



      <Script

        src="https://checkout.razorpay.com/v1/checkout.js"

        strategy="afterInteractive"

      />



      {/* ===============================================

         STYLES

      \=============================================== */}



      <style>{`

        .checkout-page {

          width: 100%;

          min-height: 80vh;

          padding: 40px 20px 70px;

          box-sizing: border-box;

          background: #FAF8F5;

          color: #1A1A1A;

          overflow-x: hidden;

        }



        .checkout-container {

          width: 100%;

          max-width: 1200px;

          margin: 0 auto;

        }



        .checkout-back {

          display: inline-flex;

          align-items: center;

          gap: 8px;

          color: #295C65;

          text-decoration: none;

          margin-bottom: 30px;

          font-size: 14px;

          font-weight: 600;

        }



        .checkout-title {

          margin: 0 0 40px;

          color: #1A1A1A;

          font-size: 36px;

          line-height: 1.2;

          font-weight: 700;

        }



        .checkout-error {

          width: 100%;

          box-sizing: border-box;

          padding: 15px;

          margin-bottom: 24px;

          display: flex;

          align-items: flex-start;

          gap: 10px;

          border: 1px solid #DC143C;

          border-radius: 8px;

          background: #FFF5F5;

          color: #DC143C;

          font-size: 14px;

          line-height: 1.5;

        }



        .checkout-error-icon {

          flex-shrink: 0;

          margin-top: 1px;

        }



        .checkout-grid {

          display: grid;

          grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);

          gap: 40px;

          align-items: start;

        }



        .checkout-left {

          min-width: 0;

        }



        .checkout-section {

          margin-bottom: 40px;

        }



        .checkout-section-title {

          margin: 0 0 20px;

          color: #295C65;

          font-size: 20px;

          line-height: 1.3;

          font-weight: 700;

        }



        .address-list {

          width: 100%;

          margin-bottom: 20px;

        }



        .address-card {

          width: 100%;

          box-sizing: border-box;

          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding: 15px;

          margin-bottom: 10px;

          border: 1px solid #E4DCD4;

          border-radius: 8px;

          background: #FFFFFF;

          cursor: pointer;

          transition: all 0.2s ease;

        }



        .address-card-selected {

          border: 2px solid #295C65;

          padding: 14px;

          background: #F5F3F0;

        }



        .address-card input {

          flex-shrink: 0;

          margin-top: 3px;

        }



        .address-content {

          min-width: 0;

        }



        .address-content strong {

          display: block;

          color: #1A1A1A;

          font-size: 15px;

          line-height: 1.4;

        }



        .address-text {

          margin-top: 5px;

          color: #696968;

          font-size: 14px;

          line-height: 1.6;

        }



        .address-phone,

        .address-email {

          font-size: 12px;

        }



        .add-address-button {

          min-height: 46px;

          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding: 12px 16px;

          border: 2px dashed #295C65;

          border-radius: 8px;

          background: transparent;

          color: #295C65;

          cursor: pointer;

          font-size: 14px;

          font-weight: 600;

        }



        .address-form {

          box-sizing: border-box;

          padding: 20px;

          border: 1px solid #E4DCD4;

          border-radius: 8px;

          background: #FFFFFF;

        }



        .form-grid-two {

          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 15px;

          margin-bottom: 15px;

        }



        .form-field {

          margin-bottom: 15px;

        }



        .form-field label {

          display: block;

          margin-bottom: 5px;

          color: #1A1A1A;

          font-size: 13px;

          font-weight: 600;

        }



        .form-field input {

          width: 100%;

          box-sizing: border-box;

          min-height: 42px;

          padding: 10px;

          border: 1px solid #E4DCD4;

          border-radius: 6px;

          background: #FFFFFF;

          color: #1A1A1A;

          font-family: inherit;

          font-size: 14px;

        }



        .form-field input:focus {

          outline: none;

          border-color: #295C65;

          box-shadow: 0 0 0 3px rgba(41, 92, 101, 0.1);

        }



        .address-form-actions {

          display: flex;

          gap: 10px;

        }



        .save-address-button,

        .cancel-address-button {

          flex: 1;

          min-height: 44px;

          border: none;

          border-radius: 6px;

          font-weight: 600;

        }



        .save-address-button {

          background: #295C65;

          color: #FFFFFF;

          cursor: pointer;

        }



        .cancel-address-button {

          background: #E8DCCF;

          color: #295C65;

          cursor: pointer;

        }



        .save-address-button:disabled {

          cursor: not-allowed;

          opacity: 0.7;

        }



        .shipping-option {

          width: 100%;

          box-sizing: border-box;

          display: flex;

          align-items: flex-start;

          gap: 10px;

          padding: 15px;

          margin-bottom: 10px;

          border: 1px solid #E4DCD4;

          border-radius: 8px;

          background: #FFFFFF;

          cursor: pointer;

          transition: all 0.2s ease;

        }



        .shipping-option-selected {

          border: 2px solid #295C65;

          padding: 14px;

          background: #F5F3F0;

        }



        .shipping-option input {

          flex-shrink: 0;

          margin-top: 3px;

        }



        .shipping-option strong {

          color: #1A1A1A;

          font-size: 14px;

          line-height: 1.5;

        }



        .shipping-price {

          margin-top: 5px;

          color: #696968;

          font-size: 14px;

        }



        .order-summary {

          position: sticky;

          top: 20px;

          height: fit-content;

          box-sizing: border-box;

          padding: 25px;

          border: 1px solid #E4DCD4;

          border-radius: 12px;

          background: #FFFFFF;

        }



        .order-summary-title {

          margin: 0 0 20px;

          color: #295C65;

          font-size: 18px;

          font-weight: 700;

        }



        .summary-items {

          max-height: 420px;

          margin-bottom: 20px;

          overflow-y: auto;

        }



        .summary-item {

          display: flex;

          align-items: flex-start;

          gap: 12px;

          padding-bottom: 15px;

          margin-bottom: 15px;

          border-bottom: 1px solid #F2EEE9;

        }



        .summary-item-image {

          width: 64px;

          height: 64px;

          flex-shrink: 0;

          object-fit: cover;

          border-radius: 6px;

          background: #F2EEE9;

        }



        .summary-item-info {

          min-width: 0;

          flex: 1;

        }



        .summary-item-top {

          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 10px;

        }



        .summary-item-title {

          min-width: 0;

          color: #1A1A1A;

          font-size: 14px;

          line-height: 1.45;

          font-weight: 600;

        }



        .summary-item-total {

          flex-shrink: 0;

          color: #295C65;

          font-size: 14px;

          line-height: 1.4;

          font-weight: 700;

        }



        .summary-item-qty {

          margin-top: 3px;

          color: #696968;

          font-size: 12px;

        }



        .summary-variant {

          display: flex;

          flex-wrap: wrap;

          gap: 5px;

          margin-top: 4px;

          color: #696968;

          font-size: 12px;

        }



        .summary-variant-value {

          display: inline-flex;

          align-items: center;

          gap: 5px;

          color: #1A1A1A;

          font-weight: 500;

        }



        .summary-color-dot {

          width: 11px;

          height: 11px;

          display: inline-block;

          border: 1px solid rgba(0, 0, 0, 0.12);

          border-radius: 50%;

          box-sizing: border-box;

        }



        .summary-sku {

          margin-top: 4px;

          color: #999999;

          font-size: 10px;

          letter-spacing: 0.02em;

        }



        .summary-divider {

          height: 2px;

          margin-bottom: 20px;

          background: #F2EEE9;

        }



        .summary-row {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-bottom: 10px;

          color: #4D4D4D;

          font-size: 14px;

        }



        .summary-row-tax {

          margin-bottom: 20px;

        }



        .summary-total {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          padding: 15px;

          border-radius: 6px;

          background: #F5F3F0;

          color: #1A1A1A;

          font-size: 18px;

          font-weight: 700;

        }



        .summary-total span:last-child {

          color: #BE9D6B;

        }



        .payment-button {

          width: 100%;

          min-height: 52px;

          margin-top: 20px;

          padding: 15px;

          border: none;

          border-radius: 8px;

          background: #295C65;

          color: #FFFFFF;

          cursor: pointer;

          font-size: 15px;

          font-weight: 700;

          transition: opacity 0.2s ease;

        }



        .payment-button:hover:not(:disabled) {

          opacity: 0.94;

        }



        .payment-button:disabled {

          cursor: not-allowed;

          opacity: 0.65;

        }



        .payment-note {

          margin: 12px 0 0;

          color: #888888;

          font-size: 11px;

          line-height: 1.5;

          text-align: center;

        }



        @media (max-width: 900px) {

          .checkout-grid {

            grid-template-columns: 1fr;

            gap: 30px;

          }



          .order-summary {

            position: static;

          }

        }



        @media (max-width: 640px) {

          .checkout-page {

            padding: 30px 14px 50px;

          }



          .checkout-title {

            margin-bottom: 28px;

            font-size: 30px;

          }



          .checkout-section {

            margin-bottom: 30px;

          }



          .checkout-section-title {

            font-size: 18px;

          }



          .form-grid-two {

            grid-template-columns: 1fr;

            gap: 0;

            margin-bottom: 0;

          }



          .address-form {

            padding: 16px;

          }



          .address-form-actions {

            flex-direction: column;

          }



          .order-summary {

            padding: 18px;

            border-radius: 10px;

          }



          .summary-item-image {

            width: 58px;

            height: 58px;

          }



          .summary-item-top {

            gap: 8px;

          }



          .summary-item-title {

            font-size: 13px;

          }



          .summary-item-total {

            font-size: 13px;

          }



          .payment-button {

            min-height: 50px;

          }

        }

      `}</style>

    </main>

  );

}
