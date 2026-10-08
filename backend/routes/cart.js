"use strict";



const express = require("express");

const mongoose = require("mongoose");

const Cart = require("../models/Cart");

const Product = require("../models/Product");

const customerAuth = require("../middleware/customerAuth");



const router = express.Router();



/* =====================================================

   OPTION HELPERS

\===================================================== */



function normalizeOption(value) {

  if (!value) {

    return {

      name: "",

      value: "",

      hex: "",

    };

  }



  if (typeof value === "string") {

    const clean = value.trim();

    return {

      name: clean,

      value: clean,

      hex: clean.startsWith("#") ? clean : "",

    };

  }



  return {

    name: String(

      value.name ||

      value.label ||

      value.value ||

      value.hex ||

      ""

    ).trim(),

    value: String(

      value.value ||

      value.name ||

      value.label ||

      value.hex ||

      ""

    ).trim(),

    hex: String(

      value.hex ||

      (typeof value.value === "string" && value.value.startsWith("#")

        ? value.value

        : "") ||

      ""

    ).trim(),

  };

}



function optionTokens(value) {

  const normalized = normalizeOption(value);

  const raw = [normalized.name, normalized.value, normalized.hex]

    .map((v) => String(v || "").trim().toLowerCase())

    .filter(Boolean);

  const tokens = [];

  raw.forEach((v) => {

    tokens.push(v);

    tokens.push(v.replace(/\s+/g, ""));

    tokens.push(v.replace(/[^a-z0-9.#]+/g, ""));

  });

  return [...new Set(tokens.filter(Boolean))];

}



function optionMatches(value, input) {

  const left = optionTokens(value);

  const right = optionTokens(input);

  return left.some((v) => right.includes(v));

}



function getSelectedVariant(product, { variantId, selectedColor, selectedSize }) {

  const variants = Array.isArray(product?.variants)

    ? product.variants.filter((variant) => variant?.active !== false)

    : [];

  if (!variants.length) return null;



  /* variantId is authoritative. Never silently select another variant. */
  if (variantId) {
    if (!mongoose.Types.ObjectId.isValid(String(variantId))) return null;
    return (
      variants.find((variant) => String(variant?._id) === String(variantId)) ||
      null
    );
  }

  const hasColor = Boolean(String(selectedColor || "").trim());

  const hasSize = Boolean(String(selectedSize || "").trim());

  if (!hasColor && !hasSize) return null;



  return variants.find((variant) => {

    const colorOk = hasColor

      ? optionMatches(

          variant?.color || {

            name: variant?.colorName,

            value: variant?.colorValue,

            hex: variant?.colorHex,

          },

          selectedColor

        )

      : true;

    const sizeOk = hasSize

      ? optionMatches(

          variant?.size || {

            name: variant?.sizeName,

            value: variant?.sizeValue,

          },

          selectedSize

        )

      : true;

    return colorOk && sizeOk;

  }) || null;

}



/* =====================================================

   IMAGE HELPERS

\===================================================== */



function getImageUrl(image) {

  if (!image) return "";

  if (typeof image === "string") return image.trim();

  return String(image?.url || "").trim();

}



function getProductImages(product) {

  const images = [

    getImageUrl(product?.mainImage),

    ...(Array.isArray(product?.gallery)

      ? product.gallery.map(getImageUrl)

      : []),

  ].filter(Boolean);



  return Array.from(new Set(images));

}



function getVariantImages(variant) {

  if (!Array.isArray(variant?.images)) return [];

  return variant.images.map(getImageUrl).filter(Boolean);

}



/* =====================================================

   SNAPSHOT

\===================================================== */



function makeSnapshot(product, variant, selectedColor, selectedSize) {

  const variantImages = getVariantImages(variant);



  const selectedColorName = String(

    selectedColor?.name ||

      selectedColor?.value ||

      selectedColor ||

      ""

  ).trim().toLowerCase();



  const colorOption = Array.isArray(product?.options?.colors)

    ? product.options.colors.find((color) => {

        const a = String(

          color?.name || color?.value || ""

        ).trim().toLowerCase();



        return (

          selectedColorName &&

          (a === selectedColorName ||

            a.includes(selectedColorName) ||

            selectedColorName.includes(a))

        );

      })

    : null;



  const selectedSizeName = String(

    selectedSize?.name ||

      selectedSize?.value ||

      selectedSize ||

      ""

  ).trim().toLowerCase();



  const configuredSizeOption = Array.isArray(product?.options?.sizes)

    ? product.options.sizes.find((size) => {

        const a = String(size?.name || size?.value || "").trim().toLowerCase();

        return (

          selectedSizeName &&

          (a === selectedSizeName ||

            a.replace(/\s+/g, "") === selectedSizeName.replace(/\s+/g, "") ||

            a.includes(selectedSizeName) ||

            selectedSizeName.includes(a))

        );

      })

    : null;



  const sizeOption = {

    ...(variant?.size || {}),

    ...(configuredSizeOption || {}),

  };



  const colorImages = Array.isArray(colorOption?.images)

    ? colorOption.images.map(getImageUrl).filter(Boolean)

    : [];



  const productImages = getProductImages(product);



  const images =

    variantImages.length > 0

      ? variantImages

      : colorImages.length > 0

        ? colorImages

        : productImages;



  const imageUrl = images[0] || "";



  const variantRegularPrice =

    variant?.regularPrice !== null &&

    variant?.regularPrice !== undefined

      ? Number(variant.regularPrice)

      : null;



  const colorRegularPrice =

    colorOption?.regularPrice !== null &&

    colorOption?.regularPrice !== undefined

      ? Number(colorOption.regularPrice)

      : null;



  const sizeRegularPrice =

    sizeOption?.regularPrice !== null &&

    sizeOption?.regularPrice !== undefined

      ? Number(sizeOption.regularPrice)

      : null;



  const regularPrice =

    variantRegularPrice ??

    colorRegularPrice ??

    sizeRegularPrice ??

    Number(product?.pricing?.regularPrice || 0);



  const variantSalePrice =

    product?.showOnSale &&

    variant?.salePrice !== null &&

    variant?.salePrice !== undefined

      ? Number(variant.salePrice)

      : null;



  const colorSalePrice =

    product?.showOnSale &&

    colorOption?.salePrice !== null &&

    colorOption?.salePrice !== undefined

      ? Number(colorOption.salePrice)

      : null;



  const sizeSalePrice =

    product?.showOnSale &&

    sizeOption?.salePrice !== null &&

    sizeOption?.salePrice !== undefined

      ? Number(sizeOption.salePrice)

      : null;



  const salePrice =

    variantSalePrice ??

    colorSalePrice ??

    sizeSalePrice ??

    (product?.showOnSale &&

    product?.pricing?.salePrice !== null &&

    product?.pricing?.salePrice !== undefined

      ? Number(product.pricing.salePrice)

      : null);



  const finalPrice =

    salePrice !== null &&

    Number.isFinite(salePrice) &&

    salePrice > 0 &&

    salePrice < regularPrice

      ? salePrice

      : regularPrice;



  return {

    title: product?.title || "",

    slug: product?.slug || "",

    imageUrl,

    images: images.map((url, index) => ({

      url,

      alt: product?.title || "",

      position: index,

    })),

    selectedColor:

      colorOption || normalizeOption(selectedColor),

    selectedSize:

      sizeOption || (selectedSize ? normalizeOption(selectedSize, "size") : null),

    colorImages,

    sizeMeters: sizeOption?.meters ?? null,

    sizeShippingCharge: sizeOption?.shippingCharge ?? null,

    sizeRegularPrice: sizeOption?.regularPrice ?? null,

    sizeSalePrice: sizeOption?.salePrice ?? null,

    sizeFoldLength: sizeOption?.foldLength ?? null,

    sizeDetails: sizeOption?.details || sizeOption?.description || "",

    regularPrice,

    salePrice:

      salePrice !== null && salePrice < regularPrice

        ? salePrice

        : null,

    variantRegularPrice,

    variantSalePrice,

    finalPrice,

    sellingMode: product?.sellingMode || "piece",

    priceUnit: product?.priceUnit || "",

    shippingRules: Array.isArray(product?.shippingRules)
      ? product.shippingRules
      : [],
    meterConfig: product?.meterConfig || null,
    bulkOrderNote: product?.bulkOrderNote || "Contact us for bulk orders.",
  };

}

async function serializeCart(cart) {
  const productIds = [
    ...new Set(cart.items.map((item) => String(item.productId))),
  ];
  const products = productIds.length
    ? await Product.find({ _id: { $in: productIds } })
        .select("_id status")
        .lean()
    : [];
  const productStatuses = new Map(
    products.map((product) => [String(product._id), product.status])
  );

  return {

    _id: cart._id,

    items: cart.items.map((item) => ({

      _id: item._id,

      productId: item.productId,

      productStatus:
        productStatuses.get(String(item.productId)) || "unavailable",
      productAvailable:
        productStatuses.get(String(item.productId)) === "published",

      variantId: item.variantId || null,

      sku: item.sku || "",

      quantity: item.quantity,

      addedAt: item.addedAt,

      selectedColor: item.selectedColor || null,

      selectedSize: item.selectedSize || null,

      snapshot: item.snapshot || {},



      /* Backward-compatible flat fields for current frontend */

      title: item.snapshot?.title || "Product",

      slug: item.snapshot?.slug || "",

      imageUrl: item.snapshot?.imageUrl || "",

      images: item.snapshot?.images || [],

      regularPrice: item.snapshot?.regularPrice || 0,

      salePrice: item.snapshot?.salePrice ?? null,

      price:

        item.snapshot?.finalPrice ??

        item.snapshot?.salePrice ??

        item.snapshot?.regularPrice ??

        0,

      sellingMode: item.snapshot?.sellingMode || "piece",

      priceUnit: item.snapshot?.priceUnit || "",

    })),

    itemCount: cart.items.reduce(

      (sum, item) => sum + Number(item.quantity || 0),

      0

    ),

    updatedAt: cart.updatedAt,

  };

}



async function getOrCreateCart(customerId) {

  let cart = await Cart.findOne({ customerId });



  if (!cart) {

    cart = new Cart({

      customerId,

      items: [],

    });

    await cart.save();

  }



  return cart;

}



/* =====================================================

   GET /api/cart

\===================================================== */



router.get("/", customerAuth, async (req, res) => {

  try {

    const cart = await getOrCreateCart(req.customerId);



    return res.json({

      success: true,

      cart: await serializeCart(cart),

    });

  } catch (error) {

    console.error("GET /cart error:", error);



    return res.status(500).json({

      success: false,

      message: "Failed to load cart",

    });

  }

});



/* =====================================================

   POST /api/cart/items



   Body:

   {

     productId,

     quantity,

     selectedColor,

     selectedSize,

     variantId

   }

\===================================================== */



router.post("/items", customerAuth, async (req, res) => {

  try {

    const productId = String(req.body?.productId || "").trim();

    const requestedQuantity = Number(req.body?.quantity ?? 1);
    if (!Number.isFinite(requestedQuantity) || requestedQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1.",
      });
    }

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
    }

    const product = await Product.findById(productId).lean();

    if (!product || product.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "Product not found or unavailable",
      });
    }

    const isMeterProduct =
      product.sellingMode === "meter" ||
      product.meterConfig?.enabled === true;

    const configuredMax = isMeterProduct
      ? Number(product.meterConfig?.maxMeters ?? 100)
      : 100;

    const quantity = Math.min(
      Number.isFinite(configuredMax) && configuredMax > 0
        ? configuredMax
        : 100,
      Math.round(requestedQuantity * 100) / 100
    );

    const selectedColor = String(

      typeof req.body?.selectedColor === "object"

        ? (

            req.body?.selectedColor?.name ||

            req.body?.selectedColor?.value ||

            ""

          )

        : req.body?.selectedColor || ""

    ).trim();



    const selectedSize = String(

      typeof req.body?.selectedSize === "object"

        ? (

            req.body?.selectedSize?.name ||

            req.body?.selectedSize?.value ||

            ""

          )

        : req.body?.selectedSize || ""

    ).trim();



    const variantId = String(

      req.body?.variantId || ""

    ).trim();



    if (isMeterProduct) {
      const config = product.meterConfig || {};
      const min = Number(config.minMeters ?? 1);
      const max = config.maxMeters == null ? 100 : Number(config.maxMeters);
      const increment = Number(config.incrementMeters ?? 1);

      if (quantity < min) {
        return res.status(400).json({
          success: false,
          message: `Minimum order is ${min} meter${min === 1 ? "" : "s"}.`,
          code: "METER_MINIMUM",
          minMeters: min,
        });
      }
      if (quantity > max) {
        return res.status(400).json({
          success: false,
          message: product.bulkOrderNote || "Please contact our team for bulk orders.",
          code: "METER_BULK",
          maxMeters: max,
        });
      }
      const steps = Math.round((quantity - min) / increment);
      if (Math.abs(quantity - (min + steps * increment)) > 0.000001) {
        return res.status(400).json({
          success: false,
          message: `Please order in increments of ${increment} meter${increment === 1 ? "" : "s"}.`,
          code: "METER_INCREMENT",
          incrementMeters: increment,
        });
      }
    }

    const variant = getSelectedVariant(product, {

      variantId,

      selectedColor,

      selectedSize,

    });



    const activeVariants = Array.isArray(product?.variants)
      ? product.variants.filter((variant) => variant?.active !== false)
      : [];
    const hasColorOptions =
      Array.isArray(product?.options?.colors) &&
      product.options.colors.length > 0;
    const hasSizeOptions =
      Array.isArray(product?.options?.sizes) &&
      product.options.sizes.length > 0;
    const hasVariantOptions = activeVariants.some((variant) =>
      Boolean(
        (typeof variant?.color === "string" && variant.color.trim()) ||
        variant?.color?.name ||
          variant?.color?.value ||
          variant?.colorName ||
          variant?.colorValue ||
          (typeof variant?.size === "string" && variant.size.trim()) ||
          variant?.size?.name ||
          variant?.size?.value ||
          variant?.sizeName ||
          variant?.sizeValue
      )
    );
    const hasSizeVariantOptions = activeVariants.some((variant) =>
      Boolean(
        (typeof variant?.size === "string" && variant.size.trim()) ||
          variant?.size?.name ||
          variant?.size?.value ||
          variant?.sizeName ||
          variant?.sizeValue
      )
    );
    const hasColorVariantOptions = activeVariants.some((variant) =>
      Boolean(
        (typeof variant?.color === "string" && variant.color.trim()) ||
          variant?.color?.name ||
          variant?.color?.value ||
          variant?.colorName ||
          variant?.colorValue
      )
    );
    const variantsEnabled =
      !isMeterProduct &&
      (
        Boolean(product?.variantsEnabled) ||
        activeVariants.length > 0
      ) &&
      (hasColorOptions || hasSizeOptions || hasVariantOptions);



    // Ready-made products use colour/size variants.
    // Raw Fabric is meter-based and must NEVER require a variant/size.
    if (!isMeterProduct && !product.meterConfig?.enabled) {

      if ((hasColorOptions || hasColorVariantOptions) && !selectedColor) {

        return res.status(400).json({

          success: false,

          message: "Please select a color",

        });

      }
      if ((hasSizeOptions || hasSizeVariantOptions) && !selectedSize) {
        return res.status(400).json({
          success: false,
          message: "Please select a size",
        });
      }

      if (hasVariantOptions && !variant) {

        return res.status(400).json({

          success: false,

          message: "Selected color and size combination is unavailable",

        });

      }



      if (variant && Number(variant.stock || 0) <= 0) {

        return res.status(400).json({

          success: false,

          message: "Selected variant is out of stock",

        });

      }

    }



    const cart = await getOrCreateCart(req.customerId);



    const normalizedSelectedColor = selectedColor

      ? normalizeOption(

          variant?.color ||

          product?.options?.colors?.find((color) => optionMatches(color, selectedColor)) ||

          selectedColor

        )

      : null;



    const normalizedSelectedSize = selectedSize

      ? {

          name: normalizeOption(

            variant?.size ||

            product?.options?.sizes?.find((size) => optionMatches(size, selectedSize)) ||

            selectedSize

          ).name,

        }

      : null;



    const normalizedVariantId = variant?._id || null;

    const normalizedSku = variant?.sku || product?.sku || "";



    const existing = cart.items.find((item) => {

      if (String(item.productId) !== productId) return false;

      if (String(item.variantId || "") !== String(normalizedVariantId || "")) return false;



      const existingColor = item.selectedColor?.name || item.selectedColor?.value || "";

      const existingSize = item.selectedSize?.name || "";



      return (

        String(existingColor).toLowerCase() ===

          String(normalizedSelectedColor?.name || normalizedSelectedColor?.value || "").toLowerCase() &&

        String(existingSize).toLowerCase() ===

          String(normalizedSelectedSize?.name || "").toLowerCase()

      );

    });



    if (existing) {

      const oldQty = Number(existing.quantity || 0);

      const maxStock = variantsEnabled

        ? Number(variant?.stock || 0)

        : Number(product?.inventory?.stock || 100);



      const nextQty = oldQty + quantity;



      if (variantsEnabled && maxStock > 0 && nextQty > maxStock) {

        return res.status(400).json({

          success: false,

          message: `Only ${maxStock} units are available for the selected variant`,

        });

      }



      existing.quantity = Math.min(100, nextQty);

    } else {

      cart.items.push({

        productId,

        variantId: normalizedVariantId,

        sku: normalizedSku,

        quantity,

        selectedColor: normalizedSelectedColor,

        selectedSize: normalizedSelectedSize,

        snapshot: makeSnapshot(product, variant, selectedColor, selectedSize),

      });

    }



    await cart.save();



    return res.json({

      success: true,

      message: "Added to cart",

      cart: await serializeCart(cart),

    });

  } catch (error) {

    console.error("POST /cart/items error:", error);



    return res.status(500).json({

      success: false,

      message: error.message || "Failed to add to cart",

    });

  }

});



/* =====================================================

   PATCH /api/cart/items/:itemId

\===================================================== */



router.patch("/items/:itemId", customerAuth, async (req, res) => {

  try {

    const qty = Number(req.body?.quantity);



    if (!Number.isFinite(qty) || qty < 1) {

      return res.status(400).json({

        success: false,

        message: "quantity must be >= 1",

      });

    }



    const cart = await getOrCreateCart(req.customerId);

    const item = cart.items.id(req.params.itemId);



    if (!item) {

      return res.status(404).json({

        success: false,

        message: "Cart item not found",

      });

    }



    const product = await Product.findById(item.productId).lean();



    if (!product) {

      return res.status(404).json({

        success: false,

        message: "Product not found",

      });

    }



    if (item.variantId) {

      const variant = product.variants?.find(

        (v) => String(v?._id) === String(item.variantId)

      );



      if (variant) {

        const stock = Number(variant.stock || 0);

        if (stock <= 0) {

          return res.status(400).json({

            success: false,

            message: "Selected variant is out of stock",

          });

        }



        if (qty > stock) {

          return res.status(400).json({

            success: false,

            message: `Only ${stock} units are available for the selected variant`,

          });

        }

      }

    }



    const isMeterProduct =
      product.sellingMode === "meter" ||
      product.meterConfig?.enabled === true;

    const configuredMax = isMeterProduct
      ? Number(product.meterConfig?.maxMeters ?? 100)
      : 100;

    const nextQuantity = Math.min(
      Number.isFinite(configuredMax) && configuredMax > 0
        ? configuredMax
        : 100,
      Math.round(qty * 100) / 100
    );

    if (isMeterProduct) {
      const config = product.meterConfig || {};
      const min = Number(config.minMeters ?? 1);
      const max = config.maxMeters == null ? 100 : Number(config.maxMeters);
      const increment = Number(config.incrementMeters ?? 1);

      if (nextQuantity < min) {
        return res.status(400).json({
          success: false,
          message: `Minimum order is ${min} meter${min === 1 ? "" : "s"}.`,
        });
      }
      if (nextQuantity > max) {
        return res.status(400).json({
          success: false,
          message: product.bulkOrderNote || "Please contact our team for bulk orders.",
          code: "METER_BULK",
          maxMeters: max,
        });
      }
      const steps = Math.round((nextQuantity - min) / increment);
      if (Math.abs(nextQuantity - (min + steps * increment)) > 0.000001) {
        return res.status(400).json({
          success: false,
          message: `Please order in increments of ${increment} meter${increment === 1 ? "" : "s"}.`,
          code: "METER_INCREMENT",
          incrementMeters: increment,
        });
      }
    }

    item.quantity = nextQuantity;

    await cart.save();



    return res.json({

      success: true,

      message: "Quantity updated",

      cart: await serializeCart(cart),

    });

  } catch (error) {

    console.error("PATCH /cart/items error:", error);



    return res.status(500).json({

      success: false,

      message: "Failed to update quantity",

    });

  }

});



/* =====================================================

   DELETE /api/cart/items/:itemId

\===================================================== */



router.delete("/items/:itemId", customerAuth, async (req, res) => {

  try {

    const cart = await getOrCreateCart(req.customerId);

    const before = cart.items.length;



    cart.items = cart.items.filter(

      (item) => String(item._id) !== String(req.params.itemId)

    );



    if (cart.items.length === before) {

      return res.status(404).json({

        success: false,

        message: "Cart item not found",

      });

    }



    await cart.save();



    return res.json({

      success: true,

      message: "Item removed",

      cart: await serializeCart(cart),

    });

  } catch (error) {

    console.error("DELETE /cart/items error:", error);



    return res.status(500).json({

      success: false,

      message: "Failed to remove item",

    });

  }

});



/* =====================================================

   DELETE /api/cart

\===================================================== */



router.delete("/", customerAuth, async (req, res) => {

  try {

    const cart = await getOrCreateCart(req.customerId);

    cart.items = [];



    await cart.save();



    return res.json({

      success: true,

      message: "Cart cleared",

      cart: await serializeCart(cart),

    });

  } catch (error) {

    console.error("DELETE /cart error:", error);



    return res.status(500).json({

      success: false,

      message: "Failed to clear cart",

    });

  }

});



module.exports = router;