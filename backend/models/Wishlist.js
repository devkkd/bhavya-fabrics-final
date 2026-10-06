const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    /* snapshot so wishlist remains useful even if product is archived */
    snapshot: {
      title:        { type: String, default: "" },
      slug:         { type: String, default: "" },
      imageUrl:     { type: String, default: "" },
      regularPrice: { type: Number, default: 0  },
      salePrice:    { type: Number, default: null },
    },
  },
  { _id: true, timestamps: { createdAt: "savedAt", updatedAt: false } }
);

const wishlistSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,   // one wishlist per customer
      index: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
