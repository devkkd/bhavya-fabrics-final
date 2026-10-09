const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: ""
    },

    cloudflareId: {
      type: String,
      trim: true,
      default: ""
    },

    alt: {
      type: String,
      trim: true,
      default: ""
    }
  },
  {
    _id: false
  }
);

const collectionImageSchema = imageSchema;

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 100
    },

    slug: {
      type: String,
      required: [true, "Category slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },

    image: {
      type: collectionImageSchema,
      default: () => ({
        url: "",
        cloudflareId: "",
        alt: ""
      })
    },

    heroImage: {
      type: collectionImageSchema,
      default: () => ({
        url: "",
        cloudflareId: "",
        alt: ""
      })
    },

    homeImage: {
      type: collectionImageSchema,
      default: () => ({
        url: "",
        cloudflareId: "",
        alt: ""
      })
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    /*
    |--------------------------------------------------------------------------
    | Optional SEO
    |--------------------------------------------------------------------------
    */

    metaTitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: 160
    },

    metaDescription: {
      type: String,
      trim: true,
      default: "",
      maxlength: 320
    },

    /*
    |--------------------------------------------------------------------------
    | Visibility
    |--------------------------------------------------------------------------
    */

    showOnHome: {
      type: Boolean,
      default: false
    },

    showInNavigation: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true
    },

    order: {
      type: Number,
      default: 0,
      index: true
    }
  },
  {
    timestamps: true
  }
);

categorySchema.index({
  status: 1,
  showOnHome: 1
});

categorySchema.index({
  status: 1,
  showInNavigation: 1
});

module.exports =
  mongoose.model(
    "Category",
    categorySchema
  );