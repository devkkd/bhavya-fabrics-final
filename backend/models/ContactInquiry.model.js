"use strict";

const mongoose = require("mongoose");

/* =====================================================
   MESSAGE THREAD
   Customer + Admin conversation
===================================================== */

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    sentBy: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

/* =====================================================
   PRODUCT SNAPSHOT

   For quote requests coming from product cards:
   product + SKU + variant + selected color + size
   will be stored so admin knows exactly what customer
   asked about.
===================================================== */

const productSnapshotSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: 240,
    },

    slug: {
      type: String,
      default: "",
      trim: true,
      maxlength: 240,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    variantId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    selectedColor: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },

    selectedSize: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },
  },
  {
    _id: false,
  }
);

/* =====================================================
   CONTACT / QUOTE INQUIRY
===================================================== */

const contactInquirySchema = new mongoose.Schema(
  {
    /* -----------------------------------------------
       CONTACT or QUOTE
    ------------------------------------------------ */

    requestType: {
      type: String,
      enum: ["contact", "quote"],
      default: "contact",
      index: true,
    },

    /* -----------------------------------------------
       CUSTOMER
    ------------------------------------------------ */

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    company: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },

    /* -----------------------------------------------
       REQUIREMENT

       Quantity / MOQ intentionally NOT stored.
    ------------------------------------------------ */

    fabric: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    /* -----------------------------------------------
       SOURCE / PAGE
    ------------------------------------------------ */

    source: {
      type: String,
      default: "contact-form",
      trim: true,
      maxlength: 120,
      index: true,
    },

    pageUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    /* -----------------------------------------------
       PRODUCT DETAILS

       Used mainly for Request Quote from product card.
    ------------------------------------------------ */

    product: {
      type: productSnapshotSchema,
      default: null,
    },

    /* -----------------------------------------------
       ADMIN STATUS
    ------------------------------------------------ */

    status: {
      type: String,
      enum: [
        "new",
        "in_progress",
        "replied",
        "closed",
      ],
      default: "new",
      index: true,
    },

    /* -----------------------------------------------
       READ STATE
    ------------------------------------------------ */

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    /* -----------------------------------------------
       LAST ADMIN REPLY
    ------------------------------------------------ */

    lastReplyAt: {
      type: Date,
      default: null,
    },

    lastReplyBy: {
      type: String,
      default: "",
      trim: true,
      maxlength: 120,
    },

    /* -----------------------------------------------
       ADMIN INTERNAL NOTE
       Customer ko nahi dikhega.
    ------------------------------------------------ */

    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },

    /* -----------------------------------------------
       FULL CONVERSATION
    ------------------------------------------------ */

    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   INDEXES
===================================================== */

contactInquirySchema.index({
  createdAt: -1,
});

contactInquirySchema.index({
  requestType: 1,
  createdAt: -1,
});

contactInquirySchema.index({
  status: 1,
  createdAt: -1,
});

contactInquirySchema.index({
  isRead: 1,
  createdAt: -1,
});

/* =====================================================
   MODEL
===================================================== */

module.exports =
  mongoose.models.ContactInquiry ||
  mongoose.model(
    "ContactInquiry",
    contactInquirySchema
  );