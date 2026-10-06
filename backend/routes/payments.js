"use strict";



const express = require("express");

const crypto = require("crypto");

const Razorpay = require("razorpay");

const mongoose = require("mongoose");



const Order = require("../models/Order");

const Cart = require("../models/Cart");

const Product = require("../models/Product");

const Address = require("../models/Address");

const Customer = require("../models/Customer");



const customerAuth = require("../middleware/customerAuth");



const router = express.Router();



/*

|--------------------------------------------------------------------------

| RAZORPAY SETUP

|--------------------------------------------------------------------------

*/



if (

  !process.env.RAZORPAY_KEY_ID ||

  !process.env.RAZORPAY_KEY_SECRET

) {

  console.warn(

    "WARNING: Razorpay environment variables are missing."

  );

}



const razorpay = new Razorpay({

  key_id: process.env.RAZORPAY_KEY_ID,

  key_secret: process.env.RAZORPAY_KEY_SECRET,

});



/*

|--------------------------------------------------------------------------

| CONSTANTS

|--------------------------------------------------------------------------

*/



const SHIPPING_RATES = {

  standard: 150,

  express: 300,

};



const TAX_RATE = 0.05;



/*

|--------------------------------------------------------------------------

| HELPERS

|--------------------------------------------------------------------------

*/



/**

 * Safely convert to number.

 */

const toNumber = (value, fallback = 0) => {

  const number = Number(value);



  return Number.isFinite(number)

    ? number

    : fallback;

};



/**

 * Safely convert to string.

 */

const cleanString = (value) => {

  if (

    value === undefined ||

    value === null

  ) {

    return "";

  }



  return String(value).trim();

};



/**

 * Generate unique order number.

 */

const generateOrderNumber = () => {

  const date = new Date();



  const dateStr = date

    .toISOString()

    .split("T")[0]

    .replace(/-/g, "");



  const random = Math.floor(

    Math.random() * 100000

  )

    .toString()

    .padStart(5, "0");



  return `ORD-${dateStr}-${random}`;

};



/**

 * Timing-safe string comparison.

 */

const safeCompare = (

  valueA,

  valueB

) => {

  try {

    if (

      typeof valueA !== "string" ||

      typeof valueB !== "string"

    ) {

      return false;

    }



    const bufferA =

      Buffer.from(valueA, "utf8");



    const bufferB =

      Buffer.from(valueB, "utf8");



    if (

      bufferA.length !==

      bufferB.length

    ) {

      return false;

    }



    return crypto.timingSafeEqual(

      bufferA,

      bufferB

    );

  } catch {

    return false;

  }

};



/*

|--------------------------------------------------------------------------

| PRODUCT IMAGE HELPER

|--------------------------------------------------------------------------

*/



const getProductImages = (

  product,

  variant = null

) => {

  const images = [];



  /*

  |--------------------------------------------------------------------------

  | Variant Images First

  |--------------------------------------------------------------------------

  */



  if (

    variant &&

    Array.isArray(variant.images)

  ) {

    variant.images.forEach(

      (image, index) => {

        if (!image) {

          return;

        }



        if (

          typeof image === "string" &&

          image.trim()

        ) {

          images.push({

            url: image.trim(),

            alt:

              product?.title || "",

            position: index,

          });



          return;

        }



        if (image.url) {

          images.push({

            url: image.url,

            alt:

              image.alt ||

              product?.title ||

              "",

            position:

              typeof image.position ===

              "number"

                ? image.position

                : index,

          });

        }

      }

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Product Main Image

  |--------------------------------------------------------------------------

  */



  if (

    images.length === 0 &&

    product?.mainImage?.url

  ) {

    images.push({

      url:

        product.mainImage.url,

      alt:

        product.mainImage.alt ||

        product.title ||

        "",

      position:

        typeof product.mainImage

          .position === "number"

          ? product.mainImage.position

          : 0,

    });

  }



  /*

  |--------------------------------------------------------------------------

  | Product Gallery

  |--------------------------------------------------------------------------

  */



  if (

    Array.isArray(

      product?.gallery

    )

  ) {

    product.gallery.forEach(

      (image, index) => {

        if (!image) {

          return;

        }



        const imageUrl =

          typeof image ===

          "string"

            ? image

            : image.url;



        if (!imageUrl) {

          return;

        }



        const exists =

          images.some(

            (existing) =>

              existing.url ===

              imageUrl

          );



        if (exists) {

          return;

        }



        images.push({

          url: imageUrl,

          alt:

            typeof image ===

            "object"

              ? image.alt ||

                product?.title ||

                ""

              : product?.title ||

                "",

          position:

            typeof image ===

              "object" &&

            typeof image.position ===

              "number"

              ? image.position

              : index + 1,

        });

      }

    );

  }



  return images;

};



/*

|--------------------------------------------------------------------------

| FIND PRODUCT VARIANT

|--------------------------------------------------------------------------

*/



const findVariant = (

  product,

  cartItem

) => {

  const variants =

    Array.isArray(

      product?.variants

    )

      ? product.variants

      : [];



  if (variants.length === 0) {

    return null;

  }



  /*

  |--------------------------------------------------------------------------

  | Variant ID

  |--------------------------------------------------------------------------

  */



  if (

    cartItem?.variantId &&

    mongoose.Types.ObjectId.isValid(

      cartItem.variantId

    )

  ) {

    const variantById =

      variants.find(

        (variant) =>

          variant?._id &&

          String(

            variant._id

          ) ===

            String(

              cartItem.variantId

            )

      );



    if (variantById) {

      return variantById;

    }

  }



  /*

  |--------------------------------------------------------------------------

  | Selected Colour

  |--------------------------------------------------------------------------

  */



  const selectedColorName =

    cleanString(

      cartItem?.selectedColor

        ?.name ||

        cartItem?.selectedColor

          ?.value

    ).toLowerCase();



  const selectedColorValue =

    cleanString(

      cartItem?.selectedColor

        ?.value ||

        cartItem?.selectedColor

          ?.name

    ).toLowerCase();



  /*

  |--------------------------------------------------------------------------

  | Selected Size

  |--------------------------------------------------------------------------

  */



  const selectedSizeName =

    cleanString(

      cartItem?.selectedSize

        ?.name

    ).toLowerCase();



  /*

  |--------------------------------------------------------------------------

  | Find Combination

  |--------------------------------------------------------------------------

  */



  return (

    variants.find(

      (variant) => {

        if (!variant) {

          return false;

        }



        let colorMatches =

          true;



        let sizeMatches =

          true;



        /*

        |--------------------------------------------------------------------------

        | Color Match

        |--------------------------------------------------------------------------

        */



        if (

          cartItem?.selectedColor

        ) {

          const variantColor =

            variant.color;



          if (

            !variantColor

          ) {

            colorMatches =

              false;

          } else {

            const variantName =

              cleanString(

                variantColor.name

              ).toLowerCase();



            const variantValue =

              cleanString(

                variantColor.value

              ).toLowerCase();



            colorMatches =

              variantName ===

                selectedColorName ||

              variantName ===

                selectedColorValue ||

              variantValue ===

                selectedColorName ||

              variantValue ===

                selectedColorValue;

          }

        }



        /*

        |--------------------------------------------------------------------------

        | Size Match

        |--------------------------------------------------------------------------

        */



        if (

          cartItem?.selectedSize

        ) {

          const variantSize =

            variant.size;



          if (

            !variantSize

          ) {

            sizeMatches =

              false;

          } else {

            const variantSizeName =

              cleanString(

                variantSize.name

              ).toLowerCase();



            sizeMatches =

              variantSizeName ===

              selectedSizeName;

          }

        }



        return (

          colorMatches &&

          sizeMatches

        );

      }

    ) || null

  );

};



/*

|--------------------------------------------------------------------------

| RESOLVE ITEM PRICE

|--------------------------------------------------------------------------

*/



const resolveItemPrice = (

  product,

  variant

) => {

  /*

  |--------------------------------------------------------------------------

  | Variant Sale Price

  |--------------------------------------------------------------------------

  */



  if (

    variant?.salePrice !==

      null &&

    variant?.salePrice !==

      undefined

  ) {

    return toNumber(

      variant.salePrice

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Variant Regular Price

  |--------------------------------------------------------------------------

  */



  if (

    variant?.regularPrice !==

      null &&

    variant?.regularPrice !==

      undefined

  ) {

    return toNumber(

      variant.regularPrice

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Product Sale Price

  |--------------------------------------------------------------------------

  */



  if (

    product?.pricing

      ?.salePrice !== null &&

    product?.pricing

      ?.salePrice !== undefined

  ) {

    return toNumber(

      product.pricing.salePrice

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Product Regular Price

  |--------------------------------------------------------------------------

  */



  return toNumber(

    product?.pricing

      ?.regularPrice

  );

};



/*

|--------------------------------------------------------------------------

| BUILD ORDER ITEM

|--------------------------------------------------------------------------

*/



const buildOrderItem = async (

  cartItem

) => {

  /*

  |--------------------------------------------------------------------------

  | Product ID

  |--------------------------------------------------------------------------

  */



  if (

    !cartItem?.productId ||

    !mongoose.Types.ObjectId.isValid(

      cartItem.productId

    )

  ) {

    throw new Error(

      "Invalid product in cart."

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Fetch Actual Product

  |--------------------------------------------------------------------------

  */



  const product =

    await Product.findById(

      cartItem.productId

    );



  if (!product) {

    throw new Error(

      "One of the products in your cart no longer exists."

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Variant

  |--------------------------------------------------------------------------

  */



  const variant =

    findVariant(

      product,

      cartItem

    );



  /*

  |--------------------------------------------------------------------------

  | If Variant ID was selected

  |--------------------------------------------------------------------------

  */



  if (

    cartItem.variantId &&

    !variant

  ) {

    throw new Error(

      `Selected product variant is no longer available for "${product.title}".`

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Validate Colour

  |--------------------------------------------------------------------------

  */



  if (

    cartItem.selectedColor

  ) {

    const selectedColor =

      cartItem.selectedColor;



    const availableColors =

      product?.options

        ?.colors || [];



    if (

      availableColors.length >

      0

    ) {

      const selectedName =

        cleanString(

          selectedColor.name ||

            selectedColor.value

        ).toLowerCase();



      const exists =

        availableColors.some(

          (color) => {

            const name =

              cleanString(

                color?.name

              ).toLowerCase();



            const value =

              cleanString(

                color?.value

              ).toLowerCase();



            return (

              name ===

                selectedName ||

              value ===

                selectedName

            );

          }

        );



      if (!exists) {

        throw new Error(

          `Selected colour is no longer available for "${product.title}".`

        );

      }

    }

  }



  /*

  |--------------------------------------------------------------------------

  | Validate Size

  |--------------------------------------------------------------------------

  */



  if (

    cartItem.selectedSize

  ) {

    const selectedSize =

      cleanString(

        cartItem.selectedSize

          ?.name

      ).toLowerCase();



    const availableSizes =

      product?.options

        ?.sizes || [];



    if (

      availableSizes.length >

      0

    ) {

      const exists =

        availableSizes.some(

          (size) => {

            const name =

              cleanString(

                size?.name

              ).toLowerCase();



            return (

              name ===

              selectedSize

            );

          }

        );



      if (!exists) {

        throw new Error(

          `Selected size is no longer available for "${product.title}".`

        );

      }

    }

  }



  /*

  |--------------------------------------------------------------------------

  | Active Variant

  |--------------------------------------------------------------------------

  */



  if (

    variant &&

    variant.active === false

  ) {

    throw new Error(

      `Selected variant of "${product.title}" is no longer available.`

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Quantity

  |--------------------------------------------------------------------------

  */



  const quantity =

    Number(

      cartItem.quantity

    );



  if (

    !Number.isInteger(

      quantity

    ) ||

    quantity < 1

  ) {

    throw new Error(

      `Invalid quantity for "${product.title}".`

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Stock Validation

  |--------------------------------------------------------------------------

  */



  if (variant) {

    const stock =

      toNumber(

        variant.stock,

        0

      );



    if (

      quantity > stock

    ) {

      throw new Error(

        `Only ${stock} item(s) of "${product.title}" are available for the selected variant.`

      );

    }

  } else if (

    product?.inventory

      ?.trackStock

  ) {

    const stock =

      toNumber(

        product.inventory.stock,

        0

      );



    if (

      quantity > stock

    ) {

      throw new Error(

        `Only ${stock} item(s) of "${product.title}" are available.`

      );

    }

  }



  /*

  |--------------------------------------------------------------------------

  | Price

  |--------------------------------------------------------------------------

  */



  const price =

    resolveItemPrice(

      product,

      variant

    );



  if (

    price < 0

  ) {

    throw new Error(

      `Invalid price for "${product.title}".`

    );

  }



  /*

  |--------------------------------------------------------------------------

  | Total

  |--------------------------------------------------------------------------

  */



  const total =

    price * quantity;



  /*

  |--------------------------------------------------------------------------

  | Images

  |--------------------------------------------------------------------------

  */



  const productImages =

    getProductImages(

      product,

      variant

    );



  const productImage =

    productImages[0]?.url ||

    "";



  /*

  |--------------------------------------------------------------------------

  | Colour Snapshot

  |--------------------------------------------------------------------------

  */



  const selectedColor =

    cartItem.selectedColor

      ? {

          name:

            cleanString(

              cartItem

                .selectedColor

                .name

            ),



          value:

            cleanString(

              cartItem

                .selectedColor

                .value

            ),



          hex:

            cleanString(

              cartItem

                .selectedColor

                .hex

            ),

        }

      : null;



  /*

  |--------------------------------------------------------------------------

  | Size Snapshot

  |--------------------------------------------------------------------------

  */



  const selectedSize =

    cartItem.selectedSize

      ? {

          name:

            cleanString(

              cartItem

                .selectedSize

                .name

            ),

        }

      : null;



  /*

  |--------------------------------------------------------------------------

  | Variant Snapshot

  |--------------------------------------------------------------------------

  */



  const variantSnapshot =

    variant

      ? {

          color:

            variant.color

              ? {

                  name:

                    cleanString(

                      variant

                        .color

                        .name

                    ),



                  value:

                    cleanString(

                      variant

                        .color

                        .value

                    ),



                  hex:

                    cleanString(

                      variant

                        .color

                        .hex

                    ),

                }

              : selectedColor,



          size:

            variant.size

              ? {

                  name:

                    cleanString(

                      variant

                        .size

                        .name

                    ),

                }

              : selectedSize,



          sku:

            cleanString(

              variant.sku

            ),



          stockAtOrder:

            toNumber(

              variant.stock,

              0

            ),



          active:

            variant.active !==

            false,

        }

      : {

          color:

            selectedColor,



          size:

            selectedSize,



          sku:

            cleanString(

              cartItem.sku

            ),



          stockAtOrder:

            product?.inventory

              ?.stock !==

            undefined

              ? toNumber(

                  product

                    .inventory

                    .stock,

                  0

                )

              : null,



          active: true,

        };



  /*

  |--------------------------------------------------------------------------

  | Return Complete Order Item

  |--------------------------------------------------------------------------

  */



  return {

    productId:

      product._id,
   variantId:

     mongoose.Types.ObjectId.isValid(variant?._id)

       ? variant._id

       : mongoose.Types.ObjectId.isValid(cartItem?.variantId)

         ? cartItem.variantId

         : null,



    sku:

      cleanString(

        variant?.sku ||

          cartItem.sku

      ),



    productName:

      product.title ||

      "",



    productImage,



    productImages,



    slug:

      product.slug ||

      "",



    selectedColor,



    selectedSize,



    quantity,



    price,



    total,



    regularPrice:

      variant?.regularPrice !==

        null &&

      variant?.regularPrice !==

        undefined

        ? toNumber(

            variant.regularPrice

          )

        : toNumber(

            product?.pricing

              ?.regularPrice

          ),



    salePrice:

      variant?.salePrice !==

        null &&

      variant?.salePrice !==

        undefined

        ? toNumber(

            variant.salePrice

          )

        : product?.pricing

              ?.salePrice !==

            null &&

          product?.pricing

            ?.salePrice !==

            undefined

          ? toNumber(

              product.pricing

                .salePrice

            )

          : null,



    variantSnapshot,

  };

};



/*

|--------------------------------------------------------------------------

| CALCULATE CART

|--------------------------------------------------------------------------

|

| IMPORTANT:

| Frontend totals are NOT trusted.

|--------------------------------------------------------------------------

*/



const buildValidatedCart = async (

  cart

) => {

  if (

    !cart ||

    !Array.isArray(

      cart.items

    ) ||

    cart.items.length === 0

  ) {

    throw new Error(

      "Cart is empty."

    );

  }



  const orderItems = [];



  let subtotal = 0;



  for (

    const cartItem of cart.items

  ) {

    const orderItem =

      await buildOrderItem(

        cartItem

      );



    orderItems.push(

      orderItem

    );



    subtotal +=

      orderItem.total;

  }



  return {

    orderItems,

    subtotal,

  };

};



/*

|--------------------------------------------------------------------------

| CREATE RAZORPAY ORDER

|--------------------------------------------------------------------------

|

| POST /api/payments/create-order

|--------------------------------------------------------------------------

*/



router.post(

  "/create-order",

  customerAuth,

  async (req, res) => {

    try {

      const {

        addressId,

        shippingMethod,

      } = req.body;



      const customerId =

        req.customer._id;



      /*

      |--------------------------------------------------------------------------

      | Validate Shipping Method

      |--------------------------------------------------------------------------

      */



      if (

        ![

          "standard",

          "express",

        ].includes(

          shippingMethod

        )

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Valid shipping method is required.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Address

      |--------------------------------------------------------------------------

      */



      if (

        !addressId ||

        !mongoose.Types.ObjectId.isValid(

          addressId

        )

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Valid address is required.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Cart

      |--------------------------------------------------------------------------

      */



      const cart =

        await Cart.findOne({

          customerId,

        });



      if (

        !cart ||

        cart.items.length === 0

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Cart is empty.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Address From Database

      |--------------------------------------------------------------------------

      */



      const address =

        await Address.findOne({

          _id: addressId,

          customerId,

        });



      if (!address) {

        return res.status(404).json({

          success: false,

          message:

            "Address not found.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Validate Cart Against Products

      |--------------------------------------------------------------------------

      */



      const {

        orderItems,

        subtotal,

      } =

        await buildValidatedCart(

          cart

        );



      /*

      |--------------------------------------------------------------------------

      | Shipping

      |--------------------------------------------------------------------------

      */



      const shippingCharges =

        SHIPPING_RATES[

          shippingMethod

        ];



      /*

      |--------------------------------------------------------------------------

      | Tax

      |--------------------------------------------------------------------------

      */



      const taxAmount =

        Math.round(

          subtotal *

            TAX_RATE

        );



      /*

      |--------------------------------------------------------------------------

      | Final Total

      |--------------------------------------------------------------------------

      */



      const total =

        subtotal +

        shippingCharges +

        taxAmount;



      /*

      |--------------------------------------------------------------------------

      | Razorpay Order

      |--------------------------------------------------------------------------

      */



      const razorpayOrder =

        await razorpay.orders.create(

          {

            amount:

              Math.round(

                total * 100

              ),



            currency: "INR",



            receipt:

              `rcpt_${Date.now()}`,



            notes: {

              customerId:

                String(

                  customerId

                ),



              cartSubtotal:

                String(

                  subtotal

                ),



              shippingMethod:

                shippingMethod,

            },

          }

        );



      /*

      |--------------------------------------------------------------------------

      | Response

      |--------------------------------------------------------------------------

      */



      return res.json({

        success: true,



        razorpayOrderId:

          razorpayOrder.id,



        amount:

          total,



        currency: "INR",



        keyId:

          process.env

            .RAZORPAY_KEY_ID,



        pricing: {

          subtotal,



          shippingCharges,



          tax:

            taxAmount,



          total,

        },



        shippingMethod,



        address: {

          fullName:

            address.fullName ||

            "",



          phone:

            address.phone ||

            "",



          email:

            address.email ||

            "",



          addressLine1:

            address.addressLine1 ||

            "",



          addressLine2:

            address.addressLine2 ||

            "",



          city:

            address.city ||

            "",



          state:

            address.state ||

            "",



          pincode:

            address.pincode ||

            "",



          country:

            address.country ||

            "India",

        },



        /*

        |--------------------------------------------------------------------------

        | Cart Preview

        |--------------------------------------------------------------------------

        |

        | Frontend can use this for display only.

        | Server will recalculate everything again in /verify.

        |

        */



        cartPreview:

          orderItems.map(

            (item) => ({

              productId:

                item.productId,



              variantId:

                item.variantId,



              productName:

                item.productName,



              productImage:

                item.productImage,



              selectedColor:

                item.selectedColor,



              selectedSize:

                item.selectedSize,



              sku:

                item.sku,



              quantity:

                item.quantity,



              price:

                item.price,



              total:

                item.total,

            })

          ),

      });

    } catch (error) {

      console.error(

        "CREATE RAZORPAY ORDER ERROR:",

        error

      );



      return res.status(500).json({

        success: false,

        message:

          error.message ||

          "Failed to create payment order.",

      });

    }

  }

);



/*

|--------------------------------------------------------------------------

| VERIFY RAZORPAY PAYMENT

|--------------------------------------------------------------------------

|

| POST /api/payments/verify

|--------------------------------------------------------------------------

*/



router.post(

  "/verify",

  customerAuth,

  async (req, res) => {

    try {

      const {

        razorpayOrderId,

        razorpayPaymentId,

        razorpaySignature,

        shippingMethod,

        addressId,

      } = req.body;



      const customerId =

        req.customer._id;



      /*

      |--------------------------------------------------------------------------

      | Validate Payment Fields

      |--------------------------------------------------------------------------

      */



      if (

        !razorpayOrderId ||

        !razorpayPaymentId ||

        !razorpaySignature

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Missing Razorpay payment details.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Validate Shipping Method

      |--------------------------------------------------------------------------

      */



      if (

        ![

          "standard",

          "express",

        ].includes(

          shippingMethod

        )

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Invalid shipping method.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Verify Razorpay Signature

      |--------------------------------------------------------------------------

      */



      const signaturePayload =

        `${razorpayOrderId}|${razorpayPaymentId}`;



      const expectedSignature =

        crypto

          .createHmac(

            "sha256",

            process.env

              .RAZORPAY_KEY_SECRET

          )

          .update(

            signaturePayload

          )

          .digest("hex");



      const signatureValid =

        safeCompare(

          expectedSignature,

          razorpaySignature

        );



      if (!signatureValid) {

        console.error(

          "RAZORPAY SIGNATURE INVALID"

        );



        return res.status(400).json({

          success: false,

          message:

            "Invalid payment signature.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Fetch Razorpay Order

      |--------------------------------------------------------------------------

      */



      const razorpayOrder =

        await razorpay.orders.fetch(

          razorpayOrderId

        );



      if (

        !razorpayOrder

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Razorpay order not found.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Fetch Razorpay Payment

      |--------------------------------------------------------------------------

      */



      const razorpayPayment =

        await razorpay.payments.fetch(

          razorpayPaymentId

        );



      if (

        !razorpayPayment

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Razorpay payment not found.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Payment Must Be Captured

      |--------------------------------------------------------------------------

      */



      if (

        razorpayPayment.status !==

          "captured" &&

        razorpayPayment.status !==

          "authorized"

      ) {

        return res.status(400).json({

          success: false,

          message:

            `Payment is not successful. Current status: ${razorpayPayment.status}`,

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Fetch Current Cart

      |--------------------------------------------------------------------------

      */



      const cart =

        await Cart.findOne({

          customerId,

        });



      if (

        !cart ||

        cart.items.length === 0

      ) {

        /*

        |--------------------------------------------------------------------------

        | Idempotency:

        | Payment may already have been processed.

        |--------------------------------------------------------------------------

        */



        const existingOrder =

          await Order.findOne({

            "payment.razorpayOrderId":

              razorpayOrderId,



            customerId,

          });



        if (existingOrder) {

          return res.json({

            success: true,

            message:

              "Payment already processed.",

            orderId:

              existingOrder._id,

            orderNumber:

              existingOrder.orderNumber,

          });

        }



        return res.status(400).json({

          success: false,

          message:

            "Cart is empty.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Validate Address From Database

      |--------------------------------------------------------------------------

      */



      if (

        addressId &&

        mongoose.Types.ObjectId.isValid(

          addressId

        )

      ) {

        const address =

          await Address.findOne({

            _id: addressId,

            customerId,

          });



        if (!address) {

          return res.status(404).json({

            success: false,

            message:

              "Address not found.",

          });

        }

      }



      /*

      |--------------------------------------------------------------------------

      | Rebuild Cart From Actual DB

      |--------------------------------------------------------------------------

      */



      const {

        orderItems,

        subtotal,

      } =

        await buildValidatedCart(

          cart

        );



      /*

      |--------------------------------------------------------------------------

      | Shipping

      |--------------------------------------------------------------------------

      */



      const shippingCharges =

        SHIPPING_RATES[

          shippingMethod

        ];



      /*

      |--------------------------------------------------------------------------

      | Tax

      |--------------------------------------------------------------------------

      */



      const taxAmount =

        Math.round(

          subtotal *

            TAX_RATE

        );



      /*

      |--------------------------------------------------------------------------

      | Final Server Total

      |--------------------------------------------------------------------------

      */



      const total =

        subtotal +

        shippingCharges +

        taxAmount;



      /*

      |--------------------------------------------------------------------------

      | IMPORTANT:

      | Razorpay Amount Must Match Our Server Total

      |--------------------------------------------------------------------------

      */



      const razorpayAmount =

        toNumber(

          razorpayOrder.amount

        );



      const expectedAmount =

        Math.round(

          total * 100

        );



      if (

        razorpayAmount !==

        expectedAmount

      ) {

        console.error(

          "RAZORPAY AMOUNT MISMATCH",

          {

            razorpayAmount,

            expectedAmount,

            total,

          }

        );



        return res.status(400).json({

          success: false,

          message:

            "Payment amount does not match the current order total.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Customer

      |--------------------------------------------------------------------------

      */



      const customer =

        await Customer.findById(

          customerId

        );



      if (!customer) {

        return res.status(404).json({

          success: false,

          message:

            "Customer not found.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Get Address

      |--------------------------------------------------------------------------

      */



      let address = null;



      if (

        addressId &&

        mongoose.Types.ObjectId.isValid(

          addressId

        )

      ) {

        address =

          await Address.findOne({

            _id: addressId,

            customerId,

          });

      }



      /*

      |--------------------------------------------------------------------------

      | Fallback:

      | Razorpay order may have been created before

      | addressId was returned in frontend.

      |--------------------------------------------------------------------------

      */



      if (!address) {

        return res.status(400).json({

          success: false,

          message:

            "Shipping address is required.",

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Shipping Address Snapshot

      |--------------------------------------------------------------------------

      */



      const shippingAddress = {

        fullName:

          address.fullName ||

          "",



        phone:

          address.phone ||

          "",



        email:

          address.email ||

          "",



        addressLine1:

          address.addressLine1 ||

          "",



        addressLine2:

          address.addressLine2 ||

          "",



        city:

          address.city ||

          "",



        state:

          address.state ||

          "",



        pincode:

          address.pincode ||

          "",



        country:

          address.country ||

          "India",

      };



      /*

      |--------------------------------------------------------------------------

      | Check Duplicate Order

      |--------------------------------------------------------------------------

      */



      const existingOrder =

        await Order.findOne({

          "payment.razorpayOrderId":

            razorpayOrderId,



          customerId,

        });



      if (existingOrder) {

        return res.json({

          success: true,

          message:

            "Payment already processed.",

          orderId:

            existingOrder._id,

          orderNumber:

            existingOrder.orderNumber,

        });

      }



      /*

      |--------------------------------------------------------------------------

      | Create Order

      |--------------------------------------------------------------------------

      |

      | IMPORTANT:

      |

      | Payment successful

      |        ↓

      | pending_approval

      |

      | Shiprocket is NOT called here.

      |--------------------------------------------------------------------------

      */



      const order =

        new Order({

          customerId,



          orderNumber:

            generateOrderNumber(),



          customerDetails: {

            name:

              customer.name ||

              shippingAddress.fullName ||

              "Customer",



            email:

              customer.email ||

              shippingAddress.email ||

              "",



            phone:

              customer.phone ||

              shippingAddress.phone ||

              "",

          },



          shippingAddress,



          items:

            orderItems,



          pricing: {

            subtotal,



            shippingCharges,



            taxAmount,



            discount: 0,



            total,

          },



          shippingMethod,



          payment: {

            method:

              "razorpay",



            razorpayOrderId,



            razorpayPaymentId,



            razorpaySignature,



            status:

              "paid",



            paidAt:

              new Date(),



            failureReason:

              "",

          },



          /*

          |--------------------------------------------------------------------------

          | ADMIN APPROVAL REQUIRED

          |--------------------------------------------------------------------------

          */



          status:

            "pending_approval",



          approval: {

            status:

              "pending",



            approvedAt:

              null,



            approvedBy:

              "",



            rejectionReason:

              "",

          },



          /*

          |--------------------------------------------------------------------------

          | SHIPROCKET NOT CREATED YET

          |--------------------------------------------------------------------------

          */



          shipping: {

            shiprocketOrderId:

              "",



            shiprocketShipmentId:

              "",



            shiprocketStatus:

              "",



            awb:

              "",



            trackingNumber:

              "",



            carrier:

              "",



            courierCompanyId:

              "",



            estimatedDelivery:

              null,



            shippedAt:

              null,



            deliveredAt:

              null,



            creationStatus:

              "not_created",



            creationError:

              "",



            createdAt:

              null,

          },

        });



      /*

      |--------------------------------------------------------------------------

      | Save Order

      |--------------------------------------------------------------------------

      */



      await order.save();



      /*

      |--------------------------------------------------------------------------

      | Clear Cart

      |--------------------------------------------------------------------------

      */



      await Cart.findByIdAndDelete(

        cart._id

      );



      /*

      |--------------------------------------------------------------------------

      | Success

      |--------------------------------------------------------------------------

      */



      return res.json({

        success: true,



        message:

          "Payment verified and order created successfully.",



        orderId:

          order._id,



        orderNumber:

          order.orderNumber,



        status:

          order.status,



        approvalStatus:

          order.approval.status,



        paymentStatus:

          order.payment.status,

      });

    } catch (error) {

      console.error(

        "RAZORPAY VERIFY ERROR:",

        error

      );



      if (

        error?.name ===

        "ValidationError"

      ) {

        console.error(

          "MONGOOSE VALIDATION ERRORS:"

        );



        Object.keys(

          error.errors || {}

        ).forEach(

          (field) => {

            console.error(

              field,

              error.errors[

                field

              ]?.message

            );

          }

        );

      }



      return res.status(500).json({

        success: false,

        message:

          error.message ||

          "Payment verification failed.",

      });

    }

  }

);



/*

|--------------------------------------------------------------------------

| RAZORPAY WEBHOOK

|--------------------------------------------------------------------------

|

| POST /api/payments/webhook

|--------------------------------------------------------------------------

*/



router.post(

  "/webhook",

  express.raw({

    type: "application/json",

  }),

  async (req, res) => {

    try {

      const webhookSecret =

        process.env

          .RAZORPAY_WEBHOOK_SECRET;



      const signature =

        req.headers[

          "x-razorpay-signature"

        ];



      if (

        !webhookSecret

      ) {

        console.warn(

          "RAZORPAY_WEBHOOK_SECRET is not configured."

        );



        return res.status(200).json({

          success: true,

        });

      }



      if (

        !signature

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Webhook signature missing.",

        });

      }



      const body =

        Buffer.isBuffer(

          req.body

        )

          ? req.body

          : Buffer.from(

              JSON.stringify(

                req.body

              )

            );



      const expectedSignature =

        crypto

          .createHmac(

            "sha256",

            webhookSecret

          )

          .update(body)

          .digest("hex");



      if (

        !safeCompare(

          expectedSignature,

          signature

        )

      ) {

        return res.status(400).json({

          success: false,

          message:

            "Invalid webhook signature.",

        });

      }



      const event =

        JSON.parse(

          body.toString()

        );



      console.log(

        "RAZORPAY WEBHOOK:",

        event.event

      );



      /*

      |--------------------------------------------------------------------------

      | Payment Captured

      |--------------------------------------------------------------------------

      */



      if (

        event.event ===

        "payment.captured"

      ) {

        const payment =

          event.payload

            ?.payment?.entity;



        if (

          payment?.order_id

        ) {

          await Order.findOneAndUpdate(

            {

              "payment.razorpayOrderId":

                payment.order_id,

            },

            {

              $set: {

                "payment.status":

                  "paid",



                "payment.razorpayPaymentId":

                  payment.id,



                "payment.paidAt":

                  new Date(),

              },

            }

          );

        }

      }



      /*

      |--------------------------------------------------------------------------

      | Payment Failed

      |--------------------------------------------------------------------------

      */



      if (

        event.event ===

        "payment.failed"

      ) {

        const payment =

          event.payload

            ?.payment?.entity;



        if (

          payment?.order_id

        ) {

          await Order.findOneAndUpdate(

            {

              "payment.razorpayOrderId":

                payment.order_id,

            },

            {

              $set: {

                "payment.status":

                  "failed",



                "payment.failureReason":

                  payment.error_description ||

                  "Payment failed.",

              },

            }

          );

        }

      }



      return res.status(200).json({

        success: true,

      });

    } catch (error) {

      console.error(

        "RAZORPAY WEBHOOK ERROR:",

        error

      );



      return res.status(500).json({

        success: false,

        message:

          "Webhook processing failed.",

      });

    }

  }

);



module.exports = router;