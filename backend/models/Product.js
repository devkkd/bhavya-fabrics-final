const mongoose = require("mongoose");

/*
|--------------------------------------------------------------------------
| Image
|--------------------------------------------------------------------------
*/

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      trim: true,
      default: "",
    },

    cloudflareId: {
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
      min: 0,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Color
|--------------------------------------------------------------------------
*/

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
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

    isCustom: {
      type: Boolean,
      default: false,
    },

    /* Optional colour-level pricing/images.
       Variant pricing/images still take precedence when a variant is selected. */
    regularPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    salePrice: {
      type: Number,
      min: 0,
      default: null,
    },

    images: {
      type: [imageSchema],
      default: [],
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Size
|--------------------------------------------------------------------------
*/

const sizeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    isCustom: {
      type: Boolean,
      default: false,
    },

    /* Bag/custom size details entered by admin. */
    details: {
      type: String,
      trim: true,
      default: "",
    },

    /* Optional fixed shipping charge for this bag/custom size. */
    shippingCharge: {
      type: Number,
      min: 0,
      default: null,
    },

    /* Useful when this size represents a meter length, e.g. 10m. */
    meters: {
      type: Number,
      min: 0,
      default: null,
    },

    /* Optional size/slab-level pricing.
       Useful for products where 10m, 20m etc. have different total prices. */
    regularPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    salePrice: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| Variant
|--------------------------------------------------------------------------
*/

const variantSchema = new mongoose.Schema(
  {
    color: {
      type: colorSchema,
      default: undefined,
    },

    size: {
      type: sizeSchema,
      default: undefined,
    },

    /*
    |--------------------------------------------------------------------------
    | Variant Pricing
    |--------------------------------------------------------------------------
    */

    regularPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    salePrice: {
      type: Number,
      min: 0,
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
    | Variant Stock
    |--------------------------------------------------------------------------
    */

    stock: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | Variant Images
    |--------------------------------------------------------------------------
    */

    images: {
      type: [imageSchema],
      default: [],
    },

    /*
    |--------------------------------------------------------------------------
    | Variant Active
    |--------------------------------------------------------------------------
    */

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: true,
  }
);

/*
|--------------------------------------------------------------------------
| Dynamic Specification
|--------------------------------------------------------------------------
*/

const specificationSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      value: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

/*
|--------------------------------------------------------------------------
| Product Schema
|--------------------------------------------------------------------------
*/

const productSchema =
  new mongoose.Schema(
    {
      /*
      |--------------------------------------------------------------------------
      | Basic Information
      |--------------------------------------------------------------------------
      */

      title: {
        type: String,
        required: [
          true,
          "Product title is required",
        ],
        trim: true,
        maxlength: 200,
      },

      slug: {
        type: String,
        required: [
          true,
          "Product slug is required",
        ],
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
      },

      sku: {
        type: String,
        trim: true,
        uppercase: true,
        default: "",
      },

      shortDescription: {
        type: String,
        trim: true,
        default: "",
      },

      description: {
        type: String,
        trim: true,
        default: "",
      },

      /*
      |--------------------------------------------------------------------------
      | Category
      |--------------------------------------------------------------------------
      */

      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [
          true,
          "Category is required",
        ],
        index: true,
      },

      subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        default: null,
        index: true,
      },

      /*
      |--------------------------------------------------------------------------
      | Product Images
      |--------------------------------------------------------------------------
      */

      mainImage: {
        type: imageSchema,
        default: () => ({
          url: "",
          cloudflareId: "",
          alt: "",
          position: 0,
        }),
      },

      gallery: {
        type: [imageSchema],
        default: [],
      },

      /*
      |--------------------------------------------------------------------------
      | Selling Mode
      |--------------------------------------------------------------------------
      |
      | piece = bags/custom-size products
      | meter = fabric sold by selectable meter-length sizes
      */

      sellingMode: {
        type: String,
        enum: ["piece", "meter"],
        default: "piece",
        index: true,
      },

      bulkOrderNote: {
        type: String,
        trim: true,
        default: "Contact us for bulk orders.",
        maxlength: 500,
      },

      meterConfig: {
        enabled: {
          type: Boolean,
          default: false,
        },

        foldLength: {
          type: String,
          trim: true,
          default: "",
        },

        minMeters: {
          type: Number,
          min: 0,
          default: null,
        },

        maxMeters: {
          type: Number,
          min: 0,
          default: null,
        },

        incrementMeters: {
          type: Number,
          min: 0,
          default: null,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Product-specific Shipping Rules
      |--------------------------------------------------------------------------
      |
      | Bag/custom sizes can have their own charge.
      | Meter sizes can have slab-based charges (10m, 20m, etc.).
      */

      shippingRules: {
        type: [{
          type: {
            type: String,
            enum: ["size", "meter", "quantity"],
            required: true,
          },
          label: {
            type: String,
            trim: true,
            default: "",
          },
          sizeName: {
            type: String,
            trim: true,
            default: "",
          },
          minMeters: {
            type: Number,
            min: 0,
            default: null,
          },
          maxMeters: {
            type: Number,
            min: 0,
            default: null,
          },
          minQuantity: {
            type: Number,
            min: 0,
            default: null,
          },
          maxQuantity: {
            type: Number,
            min: 0,
            default: null,
          },
          standardCharge: {
            type: Number,
            min: 0,
            default: 0,
          },
          expressCharge: {
            type: Number,
            min: 0,
            default: 0,
          },
        }],
        default: [],
      },

      /*
      |--------------------------------------------------------------------------
      | Pricing
      |--------------------------------------------------------------------------
      */

      pricing: {
        regularPrice: {
          type: Number,
          required: [
            true,
            "Regular price is required",
          ],
          min: 0,
        },

        salePrice: {
          type: Number,
          default: null,
          min: 0,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Variants
      |--------------------------------------------------------------------------
      */

      variantsEnabled: {
        type: Boolean,
        default: false,
      },

      options: {
        colors: {
          type: [colorSchema],
          default: [],
        },

        sizes: {
          type: [sizeSchema],
          default: [],
        },
      },

      variants: {
        type: [variantSchema],
        default: [],
      },

      /*
      |--------------------------------------------------------------------------
      | Inventory
      |--------------------------------------------------------------------------
      */

      inventory: {
        trackStock: {
          type: Boolean,
          default: true,
        },

        mode: {
          type: String,
          enum: [
            "single",
            "multiple",
          ],
          default: "single",
        },

        stock: {
          type: Number,
          min: 0,
          default: 1,
        },

        maxQuantityPerOrder: {
          type: Number,
          min: 1,
          default: 1,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Product Details
      |--------------------------------------------------------------------------
      */

      details: {
        material: {
          type: String,
          trim: true,
          default: "",
        },

        fabric: {
          type: String,
          trim: true,
          default: "",
        },

        pattern: {
          type: String,
          trim: true,
          default: "",
        },

        careInstructions: {
          type: String,
          trim: true,
          default: "",
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Shipping / Package Information
      |--------------------------------------------------------------------------
      |
      | Used by Shiprocket.
      |
      | weight  -> KG
      | length  -> CM
      | breadth -> CM
      | height  -> CM
      |
      */

      shipping: {
        weight: {
          type: Number,
          min: 0,
          default: 0.5,
        },

        length: {
          type: Number,
          min: 0,
          default: 10,
        },

        breadth: {
          type: Number,
          min: 0,
          default: 10,
        },

        height: {
          type: Number,
          min: 0,
          default: 10,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | Specifications
      |--------------------------------------------------------------------------
      */

      specifications: {
        type: [specificationSchema],
        default: [],
      },

      /*
      |--------------------------------------------------------------------------
      | Tags
      |--------------------------------------------------------------------------
      */

      tags: {
        type: [String],
        default: [],
      },

      /*
      |--------------------------------------------------------------------------
      | Website Placement
      |--------------------------------------------------------------------------
      */

      showOnHome: {
        type: Boolean,
        default: false,
        index: true,
      },

      showInNewArrivals: {
        type: Boolean,
        default: false,
        index: true,
      },

      showOnSale: {
        type: Boolean,
        default: false,
        index: true,
      },

      /*
      |--------------------------------------------------------------------------
      | Product Sale Management
      |--------------------------------------------------------------------------
      | Separate from the Sale page's existing countdown/subscriber system.
      */

      saleManagement: {
        discountPercent: {
          type: Number,
          min: 0,
          max: 100,
          default: null,
        },

        startsAt: {
          type: Date,
          default: null,
        },

        expiresAt: {
          type: Date,
          default: null,
          index: true,
        },

        pricingSnapshot: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
      },

      featured: {
        type: Boolean,
        default: false,
        index: true,
      },

      /*
      |--------------------------------------------------------------------------
      | Publishing
      |--------------------------------------------------------------------------
      */

      status: {
        type: String,
        enum: [
          "draft",
          "published",
          "archived",
        ],
        default: "draft",
        index: true,
      },

      /*
      |--------------------------------------------------------------------------
      | Reviews Summary
      |--------------------------------------------------------------------------
      */

      rating: {
        average: {
          type: Number,
          min: 0,
          max: 5,
          default: 0,
        },

        count: {
          type: Number,
          min: 0,
          default: 0,
        },
      },

      /*
      |--------------------------------------------------------------------------
      | SEO
      |--------------------------------------------------------------------------
      */

      metaTitle: {
        type: String,
        trim: true,
        default: "",
        maxlength: 160,
      },

      metaDescription: {
        type: String,
        trim: true,
        default: "",
        maxlength: 320,
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

productSchema.index({
  status: 1,
  createdAt: -1,
});

productSchema.index({
  status: 1,
  showOnHome: 1,
});

productSchema.index({
  status: 1,
  showInNewArrivals: 1,
});

productSchema.index({
  status: 1,
  showOnSale: 1,
});

productSchema.index({
  status: 1,
  featured: 1,
});

productSchema.index({
  category: 1,
  subCategory: 1,
});

/*
|--------------------------------------------------------------------------
| Validation
|--------------------------------------------------------------------------
*/

productSchema.pre(
  "validate",
  function () {
    /*
    |--------------------------------------------------------------------------
    | Product Sale Price
    |--------------------------------------------------------------------------
    */

    if (
      this.pricing &&
      this.pricing.salePrice !== null &&
      this.pricing.salePrice !== undefined
    ) {
      if (
        this.pricing.salePrice >
        this.pricing.regularPrice
      ) {
        throw new Error(
          "Sale price cannot be greater than regular price"
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Variant Validation
    |--------------------------------------------------------------------------
    */

    const variants =
      Array.isArray(this.variants)
        ? this.variants
        : [];

    if (
      this.variantsEnabled &&
      variants.length > 0
    ) {
      const seen = new Set();

      for (const variant of variants) {
        const color =
          variant.color?.name
            ?.trim()
            .toLowerCase() || "";

        const size =
          variant.size?.name
            ?.trim()
            .toLowerCase() || "";

        /*
         * Ignore completely empty placeholder variants. The API layer
         * normally removes these, but this keeps direct Product.create()
         * and older update payloads safe as well.
         */
        if (!color && !size) {
          continue;
        }

        const key =
          `${color}__${size}`;

        /*
        |--------------------------------------------------------------------------
        | Duplicate Variant
        |--------------------------------------------------------------------------
        */

        if (seen.has(key)) {
          throw new Error(
            `Duplicate variant combination: ${
              color || "No Color"
            } / ${
              size || "No Size"
            }`
          );
        }

        seen.add(key);

        /*
        |--------------------------------------------------------------------------
        | Variant Sale Price
        |--------------------------------------------------------------------------
        */

        if (
          variant.salePrice !== null &&
          variant.salePrice !== undefined &&
          variant.regularPrice !== null &&
          variant.regularPrice !== undefined
        ) {
          if (
            variant.salePrice >
            variant.regularPrice
          ) {
            throw new Error(
              "Variant sale price cannot be greater than variant regular price"
            );
          }
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Size Price Validation
    |--------------------------------------------------------------------------
    */
    const sizes =
      Array.isArray(this.options?.sizes)
        ? this.options.sizes
        : [];

    for (const size of sizes) {
      if (
        size.salePrice !== null &&
        size.salePrice !== undefined &&
        size.regularPrice !== null &&
        size.regularPrice !== undefined &&
        size.salePrice > size.regularPrice
      ) {
        throw new Error(
          `Size sale price cannot be greater than regular price: ${size.name || "Unknown size"}`
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Shipping Validation
    |--------------------------------------------------------------------------
    */

    if (
      this.shipping
    ) {
      if (
        this.shipping.weight !==
          undefined &&
        this.shipping.weight < 0
      ) {
        throw new Error(
          "Shipping weight cannot be negative"
        );
      }

      if (
        this.shipping.length !==
          undefined &&
        this.shipping.length < 0
      ) {
        throw new Error(
          "Shipping length cannot be negative"
        );
      }

      if (
        this.shipping.breadth !==
          undefined &&
        this.shipping.breadth < 0
      ) {
        throw new Error(
          "Shipping breadth cannot be negative"
        );
      }

      if (
        this.shipping.height !==
          undefined &&
        this.shipping.height < 0
      ) {
        throw new Error(
          "Shipping height cannot be negative"
        );
      }
    }
  }
);

/*
|--------------------------------------------------------------------------
| Virtual Discount Percentage
|--------------------------------------------------------------------------
*/

productSchema
  .virtual("discountPercent")
  .get(function () {
    const regular =
      this.pricing?.regularPrice;

    const sale =
      this.pricing?.salePrice;

    if (
      !regular ||
      sale === null ||
      sale === undefined ||
      sale >= regular
    ) {
      return 0;
    }

    return Math.round(
      ((regular - sale) /
        regular) *
        100
    );
  });

/*
|--------------------------------------------------------------------------
| JSON
|--------------------------------------------------------------------------
*/

productSchema.set(
  "toJSON",
  {
    virtuals: true,
  }
);

productSchema.set(
  "toObject",
  {
    virtuals: true,
  }
);

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

module.exports =
  mongoose.model(
    "Product",
    productSchema
  );