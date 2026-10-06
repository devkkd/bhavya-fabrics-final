const mongoose = require("mongoose");

const customerOtpSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    purpose: {
      type: String,
      enum: [
        "signup",
        "login",
        "forgot-password",
      ],
      required: true,
      index: true,
    },

    codeHash: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    lastSentAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

customerOtpSchema.index(
  {
    customerId: 1,
    purpose: 1,
  },
  {
    unique: true,
  }
);

customerOtpSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

module.exports =
  mongoose.model(
    "CustomerOtp",
    customerOtpSchema
  );