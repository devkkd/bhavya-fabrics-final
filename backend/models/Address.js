const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    type: {
      type: String,
      enum: ["shipping", "billing"],
      default: "shipping",
    },

    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Invalid email"],
    },

    addressLine1: {
      type: String,
      required: [true, "Address line 1 is required"],
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      match: [/^[0-9]{6}$/, "Pincode must be 6 digits"],
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure only one default address per type per customer
addressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose.model("Address").updateMany(
      {
        customerId: this.customerId,
        type: this.type,
        _id: { $ne: this._id },
      },
      { isDefault: false }
    );
  }
  next();
});

module.exports = mongoose.model("Address", addressSchema);
