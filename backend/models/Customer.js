const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    birthday: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["", "Male", "Female", "Other"],
      default: "",
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["customer"],
      default: "customer",
    },

    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
      index: true,
    },

    marketingOptIn: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({
  status: 1,
  createdAt: -1,
});

customerSchema.index({
  emailVerified: 1,
  status: 1,
});

module.exports =
  mongoose.model("Customer", customerSchema);