"use strict";

const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const customerAuth = require("../middleware/customerAuth");

const router = express.Router();

/* =====================================================
   OPTION HELPERS
===================================================== */

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

function optionMatches(value, input) {
  const left = normalizeOption(value);
  const right = normalizeOption(input);

  const leftValues = [left.name, left.value, left.hex]
    .map((v) => v.toLowerCase())
    .filter(Boolean);

  const rightValues = [right.name, right.value, right.hex]
    .map((v) => v.toLowerCase())
    .filter(Boolean);

  return leftValues.some((v) => rightValues.includes(v));
}

function getSelectedVariant(product, { variantId, selectedColor, selectedSize }) {
  const variants = Array.isArray(product?.variants)
    ? product.variants.filter((variant) => variant?.active !== false)
    : [];

  if (variantId && mongoose.Types.ObjectId.isValid(String(variantId))) {
    const byId = variants.find(
      (variant) => String(variant?._id) === String(variantId)
    );

    if (byId) return byId;
  }

  const hasColor = Boolean(String(selectedColor || "").trim());
  const hasSize = Boolean(String(selectedSize || "").trim());

  if (!hasColor && !hasSize) {
    return null;
  }

  return (
    variants.find((variant) => {
      const colorOk = hasColor
        ? optionMatches(variant?.color, selectedColor)
        : true;

      const sizeOk = hasSize
        ? optionMatches(variant?.size, selectedSize)
        : true;

      return colorOk && sizeOk;
    }) || null
  );
}

/* =====================================================
   IMAGE HELPERS
===================================================== */

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
===================================================== */

function makeSnapshot(product, variant) {
  const variantImages = getVariantImages(variant);
  const productImages = getProductImages(product);
  const images = variantImages.length > 0 ? variantImages : productImages;
  const imageUrl = images[0] || "";

  const regularPrice = Number(
    variant?.regularPrice ??
    product?.pricing?.regularPrice ??
    0
  ) || 0;

  const salePriceValue = Number(
    variant?.salePrice ??
    product?.pricing?.salePrice
  );

  const salePrice = Number.isFinite(salePriceValue)
    ? salePriceValue
    : null;

  return {
    title: product?.title || "",
    slug: product?.slug || "",
    imageUrl,
    images: images.map((url, index) => ({
      url,
      alt: product?.title || "",
      position: index,
    })),
    regularPrice,
    salePrice,
    variantRegularPrice:
      variant?.regularPrice != null
        ? Number(variant.regularPrice)
        : null,
    variantSalePrice:
      variant?.salePrice != null
        ? Number(variant.salePrice)
        : null,
  };
}

function serializeCart(cart) {
  return {
    _id: cart._id,
    items: cart.items.map((item) => ({
      _id: item._id,
      productId: item.productId,
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
===================================================== */

router.get("/", customerAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.customerId);

    return res.json({
      success: true,
      cart: serializeCart(cart),
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
===================================================== */

router.post("/items", customerAuth, async (req, res) => {
  try {
    const productId = String(req.body?.productId || "").trim();
    const requestedQuantity = Number(req.body?.quantity ?? 1);
    const quantity = Math.min(
      100,
      Math.max(1, Math.floor(requestedQuantity))
    );

    const selectedColor = String(
      req.body?.selectedColor || ""
    ).trim();

    const selectedSize = String(
      req.body?.selectedSize || ""
    ).trim();

    const variantId = String(
      req.body?.variantId || ""
    ).trim();

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

    const variant = getSelectedVariant(product, {
      variantId,
      selectedColor,
      selectedSize,
    });

    const variantsEnabled =
      Boolean(product?.variantsEnabled) ||
      (Array.isArray(product?.variants) && product.variants.length > 0);

    if (variantsEnabled) {
      const hasColorOptions =
        Array.isArray(product?.options?.colors) &&
        product.options.colors.length > 0;

      const hasSizeOptions =
        Array.isArray(product?.options?.sizes) &&
        product.options.sizes.length > 0;

      if (hasColorOptions && !selectedColor) {
        return res.status(400).json({
          success: false,
          message: "Please select a color",
        });
      }

      if (hasSizeOptions && !selectedSize) {
        return res.status(400).json({
          success: false,
          message: "Please select a size",
        });
      }

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: "Selected color and size combination is unavailable",
        });
      }

      if (Number(variant.stock || 0) <= 0) {
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
        snapshot: makeSnapshot(product, variant),
      });
    }

    await cart.save();

    return res.json({
      success: true,
      message: "Added to cart",
      cart: serializeCart(cart),
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
===================================================== */

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

    item.quantity = Math.min(100, Math.floor(qty));

    await cart.save();

    return res.json({
      success: true,
      message: "Quantity updated",
      cart: serializeCart(cart),
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
===================================================== */

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
      cart: serializeCart(cart),
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
===================================================== */

router.delete("/", customerAuth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.customerId);
    cart.items = [];

    await cart.save();

    return res.json({
      success: true,
      message: "Cart cleared",
      cart: serializeCart(cart),
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