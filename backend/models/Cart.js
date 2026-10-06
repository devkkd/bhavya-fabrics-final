"use strict";

const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Selected Colour Snapshot
|--------------------------------------------------------------------------
*/

const selectedColorSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    value: { type: String, trim: true, default: "" },
    hex: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

/*
|--------------------------------------------------------------------------
| Selected Size Snapshot
|--------------------------------------------------------------------------
*/

const selectedSizeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

/*
|--------------------------------------------------------------------------
| Cart Item
|--------------------------------------------------------------------------
*/

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    selectedColor: {
      type: selectedColorSchema,
      default: null,
    },

    selectedSize: {
      type: selectedSizeSchema,
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 1,
    },

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
    },
  },
  {
    _id: true,
    timestamps: {
      createdAt: "addedAt",
      updatedAt: false,
    },
  }
);

/*
|--------------------------------------------------------------------------
| Cart Schema
|--------------------------------------------------------------------------
*/

const cartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      unique: true,
      index: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ customerId: 1 });

module.exports = mongoose.model("Cart", cartSchema);