const mongoose = require("mongoose");

const buyNowSessionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },

    selectedColor: {
      type: String,
      default: "",
    },

    selectedSize: {
      type: String,
      default: "",
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    /* Snapshot of product/variant data at time of Buy Now */
    snapshot: {
      title: { type: String, default: "" },
      slug: { type: String, default: "" },
      imageUrl: { type: String, default: "" },
      images: {
        type: [
          {
            url: { type: String, default: "" },
            alt: { type: String, default: "" },
            position: { type: Number, default: 0 },
          },
        ],
        default: [],
      },
      regularPrice: { type: Number, default: 0 },
      salePrice: { type: Number, default: null },
      variantRegularPrice: { type: Number, default: null },
      variantSalePrice: { type: Number, default: null },
      finalPrice: { type: Number, default: 0 },
      showOnSale: { type: Boolean, default: false },
      sellingMode: { type: String, default: "piece" },
      priceUnit: { type: String, default: "" },
      bulkOrderNote: { type: String, default: "" },
      selectedColor: { type: String, default: "" },
      selectedSize: { type: String, default: "" },
      colorImages: { type: [String], default: [] },
      colorSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
      sizeSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
      variant: { type: mongoose.Schema.Types.Mixed, default: null },
      shippingRules: { type: Array, default: [] },
      specifications: { type: Array, default: [] },
    },

    /* Expiry - Buy Now session is temporary and refresh-safe. */
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 45 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BuyNowSession", buyNowSessionSchema);