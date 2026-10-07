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

const BuyNowSession = require("../models/BuyNowSession");



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

  variant = null,

  cartItem = null

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
  | Selected Colour Images
  |--------------------------------------------------------------------------
  */

  if (images.length === 0 && cartItem?.selectedColor) {
    const target = String(cartItem.selectedColor?.name || cartItem.selectedColor?.value || cartItem.selectedColor || "").trim().toLowerCase();
    const colorOption = Array.isArray(product?.options?.colors)
      ? product.options.colors.find((color) => {
          const a = String(color?.name || color?.value || "").trim().toLowerCase();
          return a === target || a.includes(target) || target.includes(a);
        })
      : null;

    if (Array.isArray(colorOption?.images)) {
      colorOption.images.forEach((image, index) => {
        const url = typeof image === "string" ? image.trim() : String(image?.url || "").trim();
        if (!url || images.some((existing) => existing.url === url)) return;
        images.push({
          url,
          alt: typeof image === "object" ? image.alt || product?.title || "" : product?.title || "",
          position: typeof image === "object" && Number.isFinite(Number(image.position)) ? Number(image.position) : index,
        });
      });
    }
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



const normalizeSelectedOptionName = (value) => {
  if (value === null || value === undefined) return "";
  const raw = typeof value === "object"
    ? value.name || value.value || value.label || ""
    : value;
  return cleanString(raw).toLowerCase().replace(/\s+/g, "");
};

const optionTokens = (value) => {
  const raw = typeof value === "object"
    ? [value?.name, value?.value, value?.label, value?.hex]
    : [value];
  const tokens = [];
  raw.map((v) => cleanString(v).toLowerCase()).filter(Boolean).forEach((v) => {
    tokens.push(v);
    tokens.push(v.replace(/\s+/g, ""));
    tokens.push(v.replace(/[^a-z0-9.#]+/g, ""));
  });
  return [...new Set(tokens.filter(Boolean))];
};

const optionMatches = (a, b) => {
  const left = optionTokens(a);
  const right = optionTokens(b);
  return left.some((v) => right.includes(v));
};

const findVariant = (product, cartItem) => {
  const variants = Array.isArray(product?.variants)
    ? product.variants.filter((variant) => variant?.active !== false)
    : [];
  if (!variants.length) return null;

  /* variantId is the canonical identity of a selected variant. */
  if (cartItem?.variantId) {
    if (!mongoose.Types.ObjectId.isValid(String(cartItem.variantId))) return null;
    return (
      variants.find(
        (variant) => String(variant?._id) === String(cartItem.variantId)
      ) || null
    );
  }

  const selectedColor = cartItem?.selectedColor || "";
  const selectedSize = cartItem?.selectedSize || "";
  if (!selectedColor && !selectedSize) return null;

  return variants.find((variant) => {
    const colorMatches = selectedColor
      ? optionMatches(
          variant?.color || {
            name: variant?.colorName,
            value: variant?.colorValue,
            hex: variant?.colorHex,
          },
          selectedColor
        )
      : true;
    const sizeMatches = selectedSize
      ? optionMatches(
          variant?.size || {
            name: variant?.sizeName,
            value: variant?.sizeValue,
          },
          selectedSize
        )
      : true;
    return colorMatches && sizeMatches;
  }) || null;
};

const resolveItemPrice = (
  product,
  variant,
  cartItem = null
) => {
  const sizeName = normalizeSelectedOptionName(
    cartItem?.selectedSize || variant?.size || ""
  );

  const sizeOption = Array.isArray(product?.options?.sizes)
    ? product.options.sizes.find(
        (size) => normalizeSelectedOptionName(size) === sizeName
      )
    : null;

  const variantRegular = Number(variant?.regularPrice);
  const variantSale = Number(variant?.salePrice);
  const sizeRegular = Number(sizeOption?.regularPrice ?? variant?.size?.regularPrice);
  const sizeSale = Number(sizeOption?.salePrice ?? variant?.size?.salePrice);

  const colorOption =
    cartItem?.selectedColor && Array.isArray(product?.options?.colors)
      ? product.options.colors.find((color) => optionMatches(color, cartItem.selectedColor))
      : null;

  const colorRegular = Number(colorOption?.regularPrice);
  const colorSale = Number(colorOption?.salePrice);

  const regular =
    Number.isFinite(variantRegular) && variantRegular > 0
      ? variantRegular
      : Number.isFinite(sizeRegular) && sizeRegular > 0
        ? sizeRegular
        : Number.isFinite(colorRegular) && colorRegular > 0
          ? colorRegular
          : toNumber(product?.pricing?.regularPrice, 0);

  const sale = product?.showOnSale
    ? (
        Number.isFinite(variantSale) && variantSale > 0
          ? variantSale
          : Number.isFinite(sizeSale) && sizeSale > 0
            ? sizeSale
            : Number.isFinite(colorSale) && colorSale > 0
              ? colorSale
              : toNumber(product?.pricing?.salePrice, 0)
      )
    : 0;

  return product?.showOnSale && sale > 0 && regular > sale
    ? sale
    : regular;
};

const getCustomProductShipping = (product, cartItem, shippingMethod) => {
  const rules = Array.isArray(product?.shippingRules) ? product.shippingRules : [];
  const selectedSizeName = normalizeSelectedOptionName(cartItem?.selectedSize || "");

  const variant =
    cartItem?.variantId && Array.isArray(product?.variants)
      ? product.variants.find((v) => String(v?._id) === String(cartItem.variantId))
      : null;

  const variantSize = variant?.size || null;

  const configuredSize = Array.isArray(product?.options?.sizes)
    ? product.options.sizes.find(
        (size) => normalizeSelectedOptionName(size) === selectedSizeName
      )
    : null;

  const directCharge =
    configuredSize?.shippingCharge ??
    variantSize?.shippingCharge ??
    cartItem?.snapshot?.sizeShippingCharge;

  if (
    directCharge !== null &&
    directCharge !== undefined &&
    Number.isFinite(Number(directCharge))
  ) {
    return Math.max(0, Number(directCharge));
  }

  if (product?.sellingMode === "meter") {
    const meters = Number(
      configuredSize?.meters ??
      variantSize?.meters ??
      cartItem?.snapshot?.sizeMeters
    );

    if (Number.isFinite(meters)) {
      const rule = rules.find((item) => {
        if (item?.type !== "meter") return false;
        const min = item?.minMeters == null ? 0 : Number(item.minMeters);
        const max = item?.maxMeters == null ? Infinity : Number(item.maxMeters);
        return meters >= min && meters <= max;
      });

      if (rule) {
        return shippingMethod === "express"
          ? Number(rule.expressCharge || 0)
          : Number(rule.standardCharge || 0);
      }
    }
  }

  if (selectedSizeName) {
    const rule = rules.find(
      (item) =>
        item?.type === "size" &&
        normalizeSelectedOptionName(item?.sizeName || item?.label || "") ===
          selectedSizeName
    );

    if (rule) {
      return shippingMethod === "express"
        ? Number(rule.expressCharge || 0)
        : Number(rule.standardCharge || 0);
    }
  }

  return null;
};

const calculateShippingCharges = async (cart, shippingMethod) => {
  if (!cart?.items?.length) return 0;

  let total = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.productId)
      .select(
        "title sellingMode shippingRules options.sizes options.colors variants pricing showOnSale"
      )
      .lean();

    if (!product) continue;

    const custom = getCustomProductShipping(product, item, shippingMethod);
    total +=
      custom === null
        ? Number(SHIPPING_RATES[shippingMethod] || 0)
        : custom;
  }

  return Math.max(0, Math.round(total * 100) / 100);
};

router.post("/shipping-preview", customerAuth, async (req, res) => {
  try {
    const customerId = req.customer._id;
    const sessionId = String(
      req.body?.buyNowSessionId || req.body?.sessionId || ""
    ).trim();

    let cart = null;

    if (sessionId) {
      const session = await BuyNowSession.findOne({
        _id: sessionId,
        customerId,
        expiresAt: { $gt: new Date() },
      });

      if (!session) {
        return res.status(400).json({
          success: false,
          message: "Buy Now session expired or invalid.",
        });
      }

      cart = {
        items: [
          {
            productId: session.productId,
            quantity: Number(session.quantity || 1),
            selectedColor: session.selectedColor || "",
            selectedSize: session.selectedSize || "",
            variantId: session.variantId || "",
            snapshot: session.snapshot || {},
          },
        ],
      };
    } else {
      cart = await Cart.findOne({ customerId }).lean();
    }

    if (!cart?.items?.length) {
      return res.json({
        success: true,
        shipping: { standard: 0, express: 0 },
      });
    }

    const [standard, express] = await Promise.all([
      calculateShippingCharges(cart, "standard"),
      calculateShippingCharges(cart, "express"),
    ]);

    return res.json({
      success: true,
      shipping: { standard, express },
    });
  } catch (error) {
    console.error("POST /payments/shipping-preview error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Unable to calculate shipping charges.",
    });
  }
});

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



  if (cartItem.selectedSize) {
    const selectedSize = normalizeSelectedOptionName(cartItem.selectedSize);
    const availableSizes = Array.isArray(product?.options?.sizes)
      ? product.options.sizes
      : [];

    // A generated variant is the authoritative source when it exists.
    // This also supports products where the admin saved the size only
    // inside the variant and not inside options.sizes.
    const variantSize = normalizeSelectedOptionName(variant?.size);

    const existsInOptions = availableSizes.some(
      (size) => normalizeSelectedOptionName(size) === selectedSize
    );

    const existsInVariant = variantSize && variantSize === selectedSize;

    if (!existsInOptions && !existsInVariant) {
      throw new Error(
        `Selected size is no longer available for "${product.title}".`
      );
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

      variant,

      cartItem

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

      variant,

      cartItem

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

      product?.showOnSale &&

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

        sessionId,

      } = req.body;



      const customerId =

        req.customer._id;

      
      /* Load Buy Now session if provided */
      let buyNowSession = null;
      if (sessionId) {
        buyNowSession = await BuyNowSession.findOne({
          _id: sessionId,
          customerId,
          expiresAt: { $gt: new Date() },
        });

        if (!buyNowSession) {
          return res.status(400).json({
            success: false,
            message: "Buy Now session expired or invalid.",
          });
        }
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

      | Cart or Buy Now Items

      |--------------------------------------------------------------------------

      */

      let cartToProcess = null;

      if (buyNowSession) {
        /* For Buy Now: create a cart-like object from session */
        cartToProcess = {
          items: [
            {
              productId: buyNowSession.productId,
              quantity: buyNowSession.quantity,
              selectedColor: buyNowSession.selectedColor || "",
              selectedSize: buyNowSession.selectedSize || "",
              variantId: buyNowSession.variantId || "",
            },
          ],
        };
      } else {
        /* For normal checkout: use actual cart from database */
        cartToProcess = await Cart.findOne({
          customerId,
        });
      }

      if (
        !cartToProcess ||
        cartToProcess.items.length === 0
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

          cartToProcess

        );



      /*

      |--------------------------------------------------------------------------

      | Shipping

      |--------------------------------------------------------------------------

      */



      const shippingCharges = await calculateShippingCharges(cartToProcess, shippingMethod);



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

        sessionId,

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

      let buyNowSession = null;
      if (sessionId) {
        buyNowSession = await BuyNowSession.findOne({
          _id: sessionId,
          customerId,
          expiresAt: { $gt: new Date() },
        });
      }

      let cartToProcess = null;

      if (buyNowSession) {
        /* For Buy Now: create a cart-like object from session */
        cartToProcess = {
          items: [
            {
              productId: buyNowSession.productId,
              quantity: buyNowSession.quantity,
              selectedColor: buyNowSession.selectedColor || "",
              selectedSize: buyNowSession.selectedSize || "",
              variantId: buyNowSession.variantId || "",
            },
          ],
        };
      } else {
        /* For normal checkout: use actual cart from database */
        cartToProcess = cart;
      }

      if (

        !cartToProcess ||

        cartToProcess.items.length === 0

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

          cartToProcess

        );



      /*

      |--------------------------------------------------------------------------

      | Shipping

      |--------------------------------------------------------------------------

      */



      const shippingCharges = await calculateShippingCharges(cartToProcess, shippingMethod);



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



      /* Only clear cart if NOT a Buy Now order */
      if (!buyNowSession) {
        await Cart.findByIdAndDelete(

          cart._id

        );
      } else {
        /* Delete the Buy Now session after successful order */
        await BuyNowSession.findByIdAndDelete(buyNowSession._id);
      }



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

/* =====================================================
   GET /api/payments/buy-now/:sessionId
===================================================== */

router.get(
  "/buy-now/:sessionId",
  customerAuth,
  async (req, res) => {
    try {
      const { sessionId } = req.params;
      const customerId = req.customer._id;
      if (!mongoose.Types.ObjectId.isValid(sessionId)) {
        return res.status(400).json({ success: false, message: "Invalid Buy Now session." });
      }
      const session = await BuyNowSession.findOne({
        _id: sessionId,
        customerId,
        expiresAt: { $gt: new Date() },
      }).lean();
      if (!session) {
        return res.status(404).json({ success: false, message: "Buy Now session expired or invalid." });
      }
      const snapshot = session.snapshot || {};
      const finalPrice = Number(snapshot.finalPrice) > 0
        ? Number(snapshot.finalPrice)
        : Number(
            snapshot.variantSalePrice ||
            snapshot.salePrice ||
            snapshot.variantRegularPrice ||
            snapshot.regularPrice ||
            0
          );

      return res.json({
        success: true,
        session: {
          id: String(session._id),
          productId: session.productId,
          quantity: Number(session.quantity || 1),
          selectedColor: session.selectedColor || "",
          selectedSize: session.selectedSize || "",
          variantId: session.variantId ? String(session.variantId) : "",
          snapshot: {
            ...snapshot,
            finalPrice,
          },
          expiresAt: session.expiresAt,
        },
      });
    } catch (error) {
      console.error("GET /api/payments/buy-now/:sessionId error:", error);
      return res.status(500).json({ success: false, message: "Failed to load Buy Now session." });
    }
  }
);

/* =====================================================
   POST /api/payments/buy-now
   
   Create a Buy Now session (single product, not from cart)
   Returns session ID for later use during checkout
===================================================== */

router.post(
  "/buy-now",
  customerAuth,
  async (req, res) => {
    try {
      const {
        productId,
        quantity,
        selectedColor,
        selectedSize,
        variantId,
      } = req.body;

      const customerId = req.customer._id;

      const normalizedSelectedColor =
        typeof selectedColor === "object" && selectedColor !== null
          ? String(selectedColor.name || selectedColor.value || "").trim()
          : String(selectedColor || "").trim();

      const normalizedSelectedSize =
        typeof selectedSize === "object" && selectedSize !== null
          ? String(selectedSize.name || selectedSize.value || "").trim()
          : String(selectedSize || "").trim();

      /* Validate product ID */
      if (
        !productId ||
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid product ID is required.",
        });
      }

      /* Fetch product with all details */
      const product = await Product.findById(productId);

      if (!product || product.status !== "published") {
        return res.status(404).json({
          success: false,
          message: "Product not found or unavailable.",
        });
      }

      /* Validate quantity */
      const qty = Math.max(
        1,
        Math.min(100, Math.floor(Number(quantity) || 1))
      );

      /* Handle variants if enabled */
      let selectedVariant = null;
      const variantsEnabled =
        Boolean(product?.variantsEnabled) ||
        (Array.isArray(product?.variants) &&
          product.variants.length > 0);

      if (variantsEnabled) {
        const activeVariants = Array.isArray(
          product?.variants
        )
          ? product.variants.filter(
              (v) => v?.active !== false
            )
          : [];

        /* Find variant by ID first */
        if (variantId && mongoose.Types.ObjectId.isValid(String(variantId))) {
          selectedVariant = activeVariants.find(
            (v) => String(v?._id) === String(variantId)
          );
        }

        /* If not found by ID, try to find by color/size */
        if (!selectedVariant && (normalizedSelectedColor || normalizedSelectedSize)) {
          selectedVariant = activeVariants.find((v) => {
            /* Normalize color comparison */
            let colorMatch = true;
            if (normalizedSelectedColor) {
              const variantColorName = String(v?.color?.name || v?.color?.value || "").toLowerCase().trim();
              const selectedColorLower = normalizedSelectedColor.toLowerCase();
              colorMatch = variantColorName === selectedColorLower || variantColorName.includes(selectedColorLower) || selectedColorLower.includes(variantColorName);
            }

            /* Normalize size comparison */
            let sizeMatch = true;
            if (normalizedSelectedSize) {
              const variantSizeName = String(v?.size?.name || v?.size?.value || "").toLowerCase().trim();
              const selectedSizeLower = normalizedSelectedSize.toLowerCase();
              sizeMatch = variantSizeName === selectedSizeLower || variantSizeName.includes(selectedSizeLower) || selectedSizeLower.includes(variantSizeName);
            }

            return colorMatch && sizeMatch;
          });
        }

        /* Validate variant selection if required */
        const hasColorOptions =
          Array.isArray(product?.options?.colors) &&
          product.options.colors.length > 0;
        const hasSizeOptions =
          Array.isArray(product?.options?.sizes) &&
          product.options.sizes.length > 0;

        if (hasColorOptions && !selectedColor) {
          return res.status(400).json({
            success: false,
            message: "Please select a color.",
          });
        }

        /* Size is optional. Do not block colour-only / No Size products. */

        if (!selectedVariant) {
          return res.status(400).json({
            success: false,
            message:
              "Selected color and size combination is unavailable.",
          });
        }

        /* Check stock */
        const variantStock = Number(selectedVariant.stock || 0);
        if (variantStock <= 0) {
          return res.status(400).json({
            success: false,
            message: "Selected variant is out of stock.",
          });
        }

        if (qty > variantStock) {
          return res.status(400).json({
            success: false,
            message: `Only ${variantStock} units available for this variant.`,
          });
        }
      }

      /* Colour/variant-aware images. */
      const images = [];
      const pushImage = (img, index) => {
        const url = typeof img === "string" ? img.trim() : String(img?.url || "").trim();
        if (!url || images.some((item) => item.url === url)) return;
        images.push({ url, alt: typeof img === "object" ? img.alt || product.title || "" : product.title || "", position: index });
      };
      if (selectedVariant?.images?.length) selectedVariant.images.forEach(pushImage);
      if (!images.length && selectedColor) {
        const color = (product?.options?.colors || []).find((item) => {
          const a = String(item?.name || item?.value || "").toLowerCase().trim();
          const b = String(selectedColor).toLowerCase().trim();
          return a === b || a.includes(b) || b.includes(a);
        });
        if (color?.images?.length) color.images.forEach(pushImage);
      }
      if (!images.length && product?.mainImage?.url) pushImage(product.mainImage, 0);
      if (Array.isArray(product?.gallery)) product.gallery.forEach((img, index) => pushImage(img, index + 1));
      const mainImageUrl = images[0]?.url || product?.mainImage?.url || "";

      const colorSnapshot = (() => {
        const target = String(selectedColor || "").trim().toLowerCase();
        const color = Array.isArray(product?.options?.colors)
          ? product.options.colors.find((item) => {
              const value = String(item?.name || item?.value || "").trim().toLowerCase();
              return value === target || value.includes(target) || target.includes(value);
            })
          : null;

        return color
          ? {
              name: color.name || "",
              value: color.value || "",
              hex: color.hex || "",
              images: Array.isArray(color.images) ? color.images : [],
              regularPrice: color.regularPrice ?? null,
              salePrice: product?.showOnSale ? (color.salePrice ?? null) : null,
            }
          : null;
      })();

      const sizeSnapshot = (() => {
        const target = normalizeSelectedOptionName(selectedSize);
        const configured = Array.isArray(product?.options?.sizes)
          ? product.options.sizes.find(
              (item) => normalizeSelectedOptionName(item) === target
            )
          : null;
        const variantSize = selectedVariant?.size || null;
        if (!configured && !variantSize) return null;

        const size = {
          ...(variantSize || {}),
          ...(configured || {}),
        };

        return {
          name: size.name || size.value || "",
          value: size.value || size.name || "",
          meters: size.meters ?? null,
          foldLength: size.foldLength ?? null,
          shippingCharge: size.shippingCharge ?? null,
          regularPrice: size.regularPrice ?? null,
          salePrice: size.salePrice ?? null,
          details: size.details || size.description || "",
        };
      })();

      const variantRegular = Number(selectedVariant?.regularPrice);
      const sizeRegular = Number(sizeSnapshot?.regularPrice);
      const colorRegular = Number(colorSnapshot?.regularPrice);

      const baseRegularPrice =
        (
          Number.isFinite(variantRegular) && variantRegular > 0
            ? variantRegular
            : Number.isFinite(sizeRegular) && sizeRegular > 0
              ? sizeRegular
              : Number.isFinite(colorRegular) && colorRegular > 0
                ? colorRegular
                : Number(product?.pricing?.regularPrice || 0)
        ) || 0;

      const variantSale = Number(selectedVariant?.salePrice);
      const sizeSale = Number(sizeSnapshot?.salePrice);
      const colorSale = Number(colorSnapshot?.salePrice);

      const activeSalePrice = product?.showOnSale
        ? (
            Number.isFinite(variantSale) && variantSale > 0
              ? variantSale
              : Number.isFinite(sizeSale) && sizeSale > 0
                ? sizeSale
                : Number.isFinite(colorSale) && colorSale > 0
                  ? colorSale
                  : Number(product?.pricing?.salePrice || 0)
          )
        : 0;

      const validSalePrice =
        Number.isFinite(activeSalePrice) &&
        activeSalePrice > 0 &&
        activeSalePrice < baseRegularPrice
          ? activeSalePrice
          : null;

      const finalPrice = validSalePrice ?? baseRegularPrice;

      /* Create and save Buy Now session */
      const buyNowSession = new BuyNowSession({
        customerId,
        productId: product._id,
        quantity: qty,
        selectedColor: normalizedSelectedColor,
        selectedSize: normalizedSelectedSize,
        variantId: selectedVariant?._id || null,
        snapshot: {
          title: product?.title || "Product",
          slug: product?.slug || "",
          imageUrl: mainImageUrl,
          images: images,
          regularPrice: baseRegularPrice,
          salePrice: validSalePrice,
          variantRegularPrice:
            selectedVariant?.regularPrice != null
              ? Number(selectedVariant.regularPrice)
              : null,
          variantSalePrice:
            selectedVariant?.salePrice != null && product?.showOnSale
              ? Number(selectedVariant.salePrice)
              : null,
          finalPrice,
          showOnSale: Boolean(product?.showOnSale),
          sellingMode: product?.sellingMode || "piece",
          priceUnit: product?.priceUnit || "",
          bulkOrderNote: product?.bulkOrderNote || "",
          selectedColor: normalizedSelectedColor,
          selectedSize: normalizedSelectedSize,
          variant: selectedVariant
            ? {
                id: String(selectedVariant._id || ""),
                name: selectedVariant.name || "",
                color: selectedVariant.color || null,
                size: selectedVariant.size || null,
              }
            : null,
          colorSnapshot,
          sizeSnapshot,
          specifications: Array.isArray(product?.specifications) ? product.specifications : [],
          shippingRules: Array.isArray(product?.shippingRules) ? product.shippingRules : [],
        },
      });

      await buyNowSession.save();

      /*
       * Do not depend on a custom Mongoose instance method here.
       * Some deployed versions of BuyNowSession do not register
       * toCheckoutJSON(), which caused Buy Now to return HTTP 500.
       */
      const snapshot =
        buyNowSession?.snapshot?.toObject
          ? buyNowSession.snapshot.toObject()
          : buyNowSession?.snapshot || {};

      return res.json({
        success: true,
        message: "Buy now session created successfully.",
        sessionId: String(buyNowSession._id),
        item: {
          _id: String(buyNowSession._id),
          isBuyNow: true,
          sessionId: String(buyNowSession._id),
          productId: String(buyNowSession.productId),
          quantity: Number(buyNowSession.quantity || 1),
          selectedColor: buyNowSession.selectedColor || "",
          selectedSize: buyNowSession.selectedSize || "",
          variantId: buyNowSession.variantId ? String(buyNowSession.variantId) : "",
          title: snapshot.title || "Product",
          slug: snapshot.slug || "",
          imageUrl: snapshot.imageUrl || "",
          images: Array.isArray(snapshot.images) ? snapshot.images : [],
          price: Number(snapshot.finalPrice || finalPrice),
          regularPrice: Number(snapshot.regularPrice || baseRegularPrice),
          salePrice: snapshot.salePrice ?? null,
          variantRegularPrice: snapshot.variantRegularPrice ?? null,
          variantSalePrice: snapshot.variantSalePrice ?? null,
          sellingMode: snapshot.sellingMode || "piece",
          priceUnit: snapshot.priceUnit || "",
          bulkOrderNote: snapshot.bulkOrderNote || "",
          specifications: Array.isArray(snapshot.specifications) ? snapshot.specifications : [],
          snapshot,
        },
      });
    } catch (error) {
      console.error("Buy now error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to prepare buy now order.",
      });
    }
  }
);

module.exports = router;