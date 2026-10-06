"use strict";

const express      = require("express");
const Wishlist     = require("../models/Wishlist");
const Product      = require("../models/Product");
const customerAuth = require("../middleware/customerAuth");

const router = express.Router();

/* ── helper: build product snapshot ── */
function makeSnapshot(product) {
  const img =
    product?.mainImage?.url ||
    product?.gallery?.[0]?.url ||
    "";

  return {
    title:        product?.title        || "",
    slug:         product?.slug         || "",
    imageUrl:     img,
    regularPrice: product?.pricing?.regularPrice || 0,
    salePrice:    product?.pricing?.salePrice    || null,
  };
}

/* ── helper: get or create wishlist ── */
async function getOrCreateWishlist(customerId) {
  let list = await Wishlist.findOne({ customerId });
  if (!list) {
    list = new Wishlist({ customerId, items: [] });
    await list.save();
  }
  return list;
}

/* ── serialize for frontend ── */
function serializeWishlist(list) {
  return {
    _id:       list._id,
    items:     list.items.map((item) => ({
      _id:       item._id,
      productId: item.productId,
      savedAt:   item.savedAt,
      ...item.snapshot,
    })),
    itemCount: list.items.length,
    updatedAt: list.updatedAt,
  };
}

/*
|--------------------------------------------------------------------------
| GET /api/wishlist
| Get current customer's wishlist
|--------------------------------------------------------------------------
*/
router.get("/", customerAuth, async (req, res) => {
  try {
    const list = await getOrCreateWishlist(req.customerId);
    return res.json({ success: true, wishlist: serializeWishlist(list) });
  } catch (err) {
    console.error("GET /wishlist error:", err);
    return res.status(500).json({ success: false, message: "Failed to load wishlist" });
  }
});

/*
|--------------------------------------------------------------------------
| POST /api/wishlist/items
| Add product to wishlist (idempotent — duplicate adds are silently ignored)
| Body: { productId }
|--------------------------------------------------------------------------
*/
router.post("/items", customerAuth, async (req, res) => {
  try {
    const { productId } = req.body || {};
    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const product = await Product.findById(productId).lean();
    if (!product || product.status !== "published") {
      return res.status(404).json({ success: false, message: "Product not found or unavailable" });
    }

    const list = await getOrCreateWishlist(req.customerId);

    const alreadyExists = list.items.some(
      (i) => i.productId.toString() === productId.toString()
    );

    if (alreadyExists) {
      return res.json({
        success:  true,
        message:  "Already in wishlist",
        wishlist: serializeWishlist(list),
      });
    }

    list.items.push({ productId, snapshot: makeSnapshot(product) });
    await list.save();

    return res.json({
      success:  true,
      message:  "Added to wishlist",
      wishlist: serializeWishlist(list),
    });
  } catch (err) {
    console.error("POST /wishlist/items error:", err);
    return res.status(500).json({ success: false, message: "Failed to add to wishlist" });
  }
});

/*
|--------------------------------------------------------------------------
| DELETE /api/wishlist/items/:productId
| Remove a product from wishlist by productId
|--------------------------------------------------------------------------
*/
router.delete("/items/:productId", customerAuth, async (req, res) => {
  try {
    const list   = await getOrCreateWishlist(req.customerId);
    const before = list.items.length;

    list.items = list.items.filter(
      (i) => i.productId.toString() !== req.params.productId
    );

    if (list.items.length === before) {
      return res.status(404).json({ success: false, message: "Product not in wishlist" });
    }

    await list.save();
    return res.json({ success: true, message: "Removed from wishlist", wishlist: serializeWishlist(list) });
  } catch (err) {
    console.error("DELETE /wishlist/items error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove from wishlist" });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/wishlist/check/:productId
| Check if a specific product is in the customer's wishlist
|--------------------------------------------------------------------------
*/
router.get("/check/:productId", customerAuth, async (req, res) => {
  try {
    const list  = await getOrCreateWishlist(req.customerId);
    const saved = list.items.some(
      (i) => i.productId.toString() === req.params.productId
    );
    return res.json({ success: true, saved });
  } catch (err) {
    console.error("GET /wishlist/check error:", err);
    return res.status(500).json({ success: false, saved: false });
  }
});

module.exports = router;
