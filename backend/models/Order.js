"use strict";

const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Order Item Image
|--------------------------------------------------------------------------
*/

const orderItemImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: "",
    },

    alt: {
      type: String,
      trim: true,
      default: "",
    },

    position: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Selected Colour Snapshot
|--------------------------------------------------------------------------
|
| Product ke waqt selected colour ka exact snapshot.
|
*/

const selectedColorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    value: {
      type: String,
      trim: true,
      default: "",
    },

    hex: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Selected Size Snapshot
|--------------------------------------------------------------------------
*/

const selectedSizeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Order Item
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Yahan product ka complete snapshot save hota hai.
|
| Iska matlab:
|
| Product baad mein delete/update ho jaye,
| phir bhi old order ke andar:
|
| Product photo
| Colour
| Size
| SKU
| Price
| Quantity
|
| safe rahega.
|
*/

const orderItemSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Product Reference
    |--------------------------------------------------------------------------
    */

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Variant Reference
    |--------------------------------------------------------------------------
    */

    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | SKU
    |--------------------------------------------------------------------------
    */

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Product Snapshot
    |--------------------------------------------------------------------------
    */

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    productImage: {
      type: String,
      default: "",
      trim: true,
    },

    productImages: {
      type: [orderItemImageSchema],
      default: [],
    },

    slug: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Selected Colour
    |--------------------------------------------------------------------------
    */

    selectedColor: {
      type: selectedColorSchema,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Selected Size
    |--------------------------------------------------------------------------
    */

    selectedSize: {
      type: selectedSizeSchema,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | Quantity
    |--------------------------------------------------------------------------
    */

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | Price
    |--------------------------------------------------------------------------
    */

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Line Total
    |--------------------------------------------------------------------------
    */

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Variant Price Snapshot
    |--------------------------------------------------------------------------
    */

    regularPrice: {
      type: Number,
      default: null,
      min: 0,
    },

    salePrice: {
      type: Number,
      default: null,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Product Variant Snapshot
    |--------------------------------------------------------------------------
    |
    | Useful for admin/debugging/order history.
    |
    */

    variantSnapshot: {
      color: {
        type: selectedColorSchema,
        default: null,
      },

      size: {
        type: selectedSizeSchema,
        default: null,
      },

      sku: {
        type: String,
        default: "",
        trim: true,
      },

      stockAtOrder: {
        type: Number,
        default: null,
      },

      active: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| Order Schema
|--------------------------------------------------------------------------
*/

const orderSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | Customer
    |--------------------------------------------------------------------------
    */

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Order Number
    |--------------------------------------------------------------------------
    */

    orderNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | Customer Snapshot
    |--------------------------------------------------------------------------
    */

    customerDetails: {
      name: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Shipping Address
    |--------------------------------------------------------------------------
    */

    shippingAddress: {
      fullName: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      addressLine1: {
        type: String,
        default: "",
      },

      addressLine2: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "India",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Billing Address
    |--------------------------------------------------------------------------
    */

    billingAddress: {
      fullName: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      addressLine1: {
        type: String,
        default: "",
      },

      addressLine2: {
        type: String,
        default: "",
      },

      city: {
        type: String,
        default: "",
      },

      state: {
        type: String,
        default: "",
      },

      pincode: {
        type: String,
        default: "",
      },

      country: {
        type: String,
        default: "India",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | ORDER ITEMS
    |--------------------------------------------------------------------------
    */

    items: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Pricing
    |--------------------------------------------------------------------------
    */

    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      shippingCharges: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      taxAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },

      discount: {
        type: Number,
        min: 0,
        default: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Shipping Method
    |--------------------------------------------------------------------------
    */

    shippingMethod: {
      type: String,
      enum: [
        "standard",
        "express",
      ],
      default: "standard",
    },

    /*
    |--------------------------------------------------------------------------
    | Payment
    |--------------------------------------------------------------------------
    */

    payment: {
      method: {
        type: String,
        enum: [
          "razorpay",
          "cod",
        ],
        default: "razorpay",
      },

      razorpayOrderId: {
        type: String,
        default: "",
      },

      razorpayPaymentId: {
        type: String,
        default: "",
      },

      razorpaySignature: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
          "cancelled",
        ],
        default: "pending",
      },

      paidAt: {
        type: Date,
        default: null,
      },

      failureReason: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | ORDER STATUS
    |--------------------------------------------------------------------------
    |
    | VERY IMPORTANT:
    |
    | Payment successful
    |        ↓
    | pending_approval
    |        ↓
    | Admin approves
    |        ↓
    | confirmed
    |
    */

    status: {
      type: String,
      enum: [
        "pending_approval",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending_approval",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ADMIN APPROVAL
    |--------------------------------------------------------------------------
    */

    approval: {
      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: "pending",
        index: true,
      },

      approvedAt: {
        type: Date,
        default: null,
      },

      approvedBy: {
        type: String,
        default: "",
      },

      rejectionReason: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | SHIPROCKET
    |--------------------------------------------------------------------------
    |
    | Shiprocket details are ONLY populated after admin approval.
    |
    */

    shipping: {
      shiprocketOrderId: {
        type: String,
        default: "",
        index: true,
      },

      shiprocketShipmentId: {
        type: String,
        default: "",
      },

      shiprocketStatus: {
        type: String,
        default: "",
      },

      awb: {
        type: String,
        default: "",
      },

      trackingNumber: {
        type: String,
        default: "",
      },

      carrier: {
        type: String,
        default: "",
      },

      courierCompanyId: {
        type: String,
        default: "",
      },

      estimatedDelivery: {
        type: Date,
        default: null,
      },

      shippedAt: {
        type: Date,
        default: null,
      },

      deliveredAt: {
        type: Date,
        default: null,
      },

      /*
      |--------------------------------------------------------------------------
      | Shiprocket creation state
      |--------------------------------------------------------------------------
      */

      creationStatus: {
        type: String,
        enum: [
          "not_created",
          "pending",
          "created",
          "failed",
        ],
        default: "not_created",
      },

      creationError: {
        type: String,
        default: "",
      },

      createdAt: {
        type: Date,
        default: null,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Admin Notes
    |--------------------------------------------------------------------------
    */

    adminNotes: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Customer Notes
    |--------------------------------------------------------------------------
    */

    customerNotes: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | Cancellation
    |--------------------------------------------------------------------------
    */

    cancellation: {
      requestedAt: {
        type: Date,
        default: null,
      },

      requestReason: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
        ],
        default: undefined,
      },

      approvedAt: {
        type: Date,
        default: null,
      },

      refundAmount: {
        type: Number,
        default: 0,
      },

      refundStatus: {
        type: String,
        enum: [
          "pending",
          "processed",
          "failed",
        ],
        default: undefined,
      },

      razorpayRefundId: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Return Request
    |--------------------------------------------------------------------------
    */

    return: {
      requestedAt: {
        type: Date,
        default: null,
      },

      reason: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
          "completed",
        ],
        default: undefined,
      },

      approvedAt: {
        type: Date,
        default: null,
      },

      refundAmount: {
        type: Number,
        default: 0,
      },

      pickupStatus: {
        type: String,
        default: "",
      },

      pickupDate: {
        type: Date,
        default: null,
      },

      refundDate: {
        type: Date,
        default: null,
      },

      adminNotes: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | Replacement / Exchange
    |--------------------------------------------------------------------------
    */

    replacement: {
      requestedAt: {
        type: Date,
        default: null,
      },

      reason: {
        type: String,
        default: "",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "approved",
          "rejected",
          "shipped",
          "completed",
        ],
        default: undefined,
      },

      approvedAt: {
        type: Date,
        default: null,
      },

      newOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null,
      },

      shipmentDate: {
        type: Date,
        default: null,
      },

      expectedDelivery: {
        type: Date,
        default: null,
      },

      adminNotes: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| Indexes
|--------------------------------------------------------------------------
*/

orderSchema.index({
  customerId: 1,
  createdAt: -1,
});

orderSchema.index({
  orderNumber: 1,
});

orderSchema.index({
  status: 1,
  createdAt: -1,
});

orderSchema.index({
  approval: 1,
});

orderSchema.index({
  "approval.status": 1,
  createdAt: -1,
});

orderSchema.index({
  "payment.status": 1,
});

orderSchema.index({
  "shipping.shiprocketOrderId": 1,
});

module.exports = mongoose.model("Order", orderSchema);