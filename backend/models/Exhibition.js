const mongoose = require("mongoose");

const exhibitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    time: {
      type: String, // "10:00 AM - 6:00 PM"
      required: false,
      default: null,
    },
    image: {
      url: String,
      alt: String,
    },
    imageId: String, // Cloudflare image ID
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "past"],
      default: "upcoming",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    boothDetails: String,
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exhibition", exhibitionSchema);
