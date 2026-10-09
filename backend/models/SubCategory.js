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

const subCategorySchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [
          true,
          "Subcategory name is required"
        ],
        trim: true,
        maxlength: 100
      },

      slug: {
        type: String,
        required: [
          true,
          "Subcategory slug is required"
        ],
        trim: true,
        lowercase: true
      },

      /*
      |--------------------------------------------------------------------------
      | Parent Category
      |--------------------------------------------------------------------------
      */

      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [
          true,
          "Parent category is required"
        ],
        index: true
      },

      image: {
        type: imageSchema,
        default: () => ({
          url: "",
          cloudflareId: "",
          alt: ""
        })
      },

      heroImage: {
        type: imageSchema,
        default: () => ({
          url: "",
          cloudflareId: "",
          alt: ""
        })
      },

      homeImage: {
        type: imageSchema,
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

      status: {
        type: String,
        enum: [
          "draft",
          "published",
          "archived"
        ],
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

subCategorySchema.index(
  {
    category: 1,
    slug: 1
  },
  {
    unique: true
  }
);

subCategorySchema.index({
  status: 1,
  showOnHome: 1
});

module.exports =
  mongoose.model(
    "SubCategory",
    subCategorySchema
  );