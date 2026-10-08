const express = require("express");

const Product =
  require("../models/Product");

const Category =
  require("../models/Category");

const SubCategory =
  require("../models/SubCategory");

const adminAuth =
  require("../middleware/adminAuth");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Normalize product variants/specifications
|--------------------------------------------------------------------------
| Keeps legacy frontend payloads compatible:
| - color/size may arrive as strings or objects
| - size is optional
| - duplicate color + size combinations are removed
| - blank specification rows are removed
|--------------------------------------------------------------------------
*/
const normalizeOption = (option, type = "color") => {
  if (option === null || option === undefined) return undefined;

  if (typeof option === "string") {
    const name = option.trim();
    if (!name) return undefined;
    return type === "color"
      ? { name, value: name }
      : { name };
  }

  if (typeof option === "object") {
    const name = String(
      option.name ?? option.label ?? option.value ?? ""
    ).trim();

    if (!name) return undefined;

    if (type === "color") {
      const value = String(
        option.value ?? option.name ?? option.label ?? ""
      ).trim();

      const hex = String(option.hex ?? "").trim();

      return {
        name,
        value: value || name,
        hex,
        isCustom: Boolean(option.isCustom),
        regularPrice:
          option.regularPrice === "" ||
          option.regularPrice === null ||
          option.regularPrice === undefined
            ? null
            : Number(option.regularPrice),
        salePrice:
          option.salePrice === "" ||
          option.salePrice === null ||
          option.salePrice === undefined
            ? null
            : Number(option.salePrice),
        images: Array.isArray(option.images) ? option.images : [],
      };
    }

    return {
      name,
      isCustom: Boolean(option.isCustom),
      details: String(option.details ?? "").trim(),
      regularPrice:
        option.regularPrice === "" ||
        option.regularPrice === null ||
        option.regularPrice === undefined
          ? null
          : Number(option.regularPrice),
      salePrice:
        option.salePrice === "" ||
        option.salePrice === null ||
        option.salePrice === undefined
          ? null
          : Number(option.salePrice),
      shippingCharge:
        option.shippingCharge === "" ||
        option.shippingCharge === null ||
        option.shippingCharge === undefined
          ? null
          : Number(option.shippingCharge),
      meters:
        option.meters === "" ||
        option.meters === null ||
        option.meters === undefined
          ? null
          : Number(option.meters),
    };
  }

  return undefined;
};

const normalizeProductPayload = (body = {}) => {
  const payload = { ...body };

  if (Array.isArray(body.variants)) {
    const seen = new Set();

    payload.variants = body.variants
      .map((rawVariant) => {
        if (!rawVariant || typeof rawVariant !== "object") return null;

        const color = normalizeOption(rawVariant.color, "color");
        const size = normalizeOption(rawVariant.size, "size");

        /*
         * Also support the flattened format used by older frontend builds.
         */
        const fallbackColor =
          color ||
          normalizeOption(
            rawVariant.colorName ||
              rawVariant.colorValue ||
              rawVariant.colorHex,
            "color"
          );

        const fallbackSize =
          size ||
          normalizeOption(
            rawVariant.sizeName || rawVariant.sizeValue,
            "size"
          );

        const normalized = {
          ...rawVariant,
          color: fallbackColor,
          size: fallbackSize,
          images:
            Array.isArray(rawVariant.images) && rawVariant.images.length
              ? rawVariant.images
              : Array.isArray(fallbackColor?.images)
                ? fallbackColor.images
                : [],
        };

        /*
         * A variant must have at least one real option.
         * Empty placeholder rows are not useful and can trigger
         * required-field validation errors elsewhere.
         */
        if (!normalized.color && !normalized.size) return null;

        const colorKey = String(
          normalized.color?.name ||
            normalized.color?.value ||
            ""
        )
          .trim()
          .toLowerCase();

        const sizeKey = String(
          normalized.size?.name ||
            ""
        )
          .trim()
          .toLowerCase();

        const key = `${colorKey}__${sizeKey}`;

        if (seen.has(key)) return null;

        seen.add(key);
        return normalized;
      })
      .filter(Boolean);
  }

  if (Array.isArray(body.specifications)) {
    payload.specifications = body.specifications
      .map((spec) => ({
        name: String(
          spec?.name ?? spec?.label ?? ""
        ).trim(),
        value: String(
          spec?.value ?? spec?.text ?? ""
        ).trim(),
      }))
      .filter((spec) => spec.name && spec.value);
  }

  if (Array.isArray(body.shippingRules)) {
    payload.shippingRules = body.shippingRules
      .map((rule) => ({
        ...rule,
        type: ["meter", "size", "quantity"].includes(String(rule?.type || ""))
          ? String(rule.type)
          : "size",
        label: String(rule?.label ?? "").trim(),
        sizeName: String(rule?.sizeName ?? "").trim(),
        minMeters:
          rule?.minMeters === "" || rule?.minMeters == null
            ? null
            : Number(rule.minMeters),
        maxMeters:
          rule?.maxMeters === "" || rule?.maxMeters == null
            ? null
            : Number(rule.maxMeters),
        minQuantity:
          rule?.minQuantity === "" || rule?.minQuantity == null
            ? null
            : Number(rule.minQuantity),
        maxQuantity:
          rule?.maxQuantity === "" || rule?.maxQuantity == null
            ? null
            : Number(rule.maxQuantity),
        standardCharge:
          rule?.standardCharge === "" || rule?.standardCharge == null
            ? 0
            : Number(rule.standardCharge),
        expressCharge:
          rule?.expressCharge === "" || rule?.expressCharge == null
            ? 0
            : Number(rule.expressCharge),
      }))
      .filter((rule) => Number.isFinite(rule.standardCharge) && Number.isFinite(rule.expressCharge));
  }

  if (body.options && typeof body.options === "object") {
    payload.options = {
      ...body.options,
      colors: Array.isArray(body.options.colors)
        ? body.options.colors
            .map((color) => normalizeOption(color, "color"))
            .filter(Boolean)
        : [],
      sizes: Array.isArray(body.options.sizes)
        ? body.options.sizes
            .map((size) => normalizeOption(size, "size"))
            .filter(Boolean)
        : [],
    };
  }

  return payload;
};



/*
|--------------------------------------------------------------------------
| Slug Helper
|--------------------------------------------------------------------------
*/

const slugify = (text) => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/*
|--------------------------------------------------------------------------
| Build Slug
|--------------------------------------------------------------------------
*/

const createUniqueSlug = async (
  title,
  currentId = null
) => {
  const baseSlug =
    slugify(title);

  let finalSlug =
    baseSlug;

  let count = 1;

  while (true) {
    const query = {
      slug: finalSlug
    };

    if (currentId) {
      query._id = {
        $ne: currentId
      };
    }

    const exists =
      await Product.exists(
        query
      );

    if (!exists) {
      return finalSlug;
    }

    count += 1;

    finalSlug =
      `${baseSlug}-${count}`;
  }
};

/*
|--------------------------------------------------------------------------
| Resolve Category
|--------------------------------------------------------------------------
*/

const resolveCategory =
  async (value) => {
    if (!value) {
      return null;
    }

    const isObjectId =
      /^[a-f\d]{24}$/i.test(
        value
      );

    return Category.findOne(
      isObjectId
        ? {
            _id: value
          }
        : {
            slug:
              value
                .toLowerCase()
          }
    );
  };

/*
|--------------------------------------------------------------------------
| Resolve Subcategory
|--------------------------------------------------------------------------
*/

const resolveSubCategory =
  async (value) => {
    if (!value) {
      return null;
    }

    const isObjectId =
      /^[a-f\d]{24}$/i.test(
        value
      );

    return SubCategory.findOne(
      isObjectId
        ? {
            _id: value
          }
        : {
            slug:
              value
                .toLowerCase()
          }
    );
  };

/*
|--------------------------------------------------------------------------
| GET /api/products
|--------------------------------------------------------------------------
|
| Public products only by default
|
| ?category=cotton
| ?subcategory=cotton-cambric
| ?home=true
| ?newArrivals=true
| ?featured=true
| ?search=cotton
| ?page=1
| ?limit=12
|--------------------------------------------------------------------------
*/

router.get(
  "/",
  async (req, res) => {
    try {
      const {
        category,
        subcategory,
        home,
        newArrivals,
        sale,
        featured,
        search,
        sellingMode,
        page = 1,
        limit = 12
      } = req.query;

      const filter = {
        status: "published"
      };

      if (sellingMode === "meter" || sellingMode === "piece") {
        filter.sellingMode = sellingMode;
      }

      /*
      |--------------------------------------------------------------------------
      | Category
      |--------------------------------------------------------------------------
      */

      if (category) {
        const categoryDoc =
          await resolveCategory(
            category
          );

        if (!categoryDoc) {
          return res.status(404).json({
            success: false,
            message:
              "Category not found"
          });
        }

        filter.category =
          categoryDoc._id;
      }

      /*
      |--------------------------------------------------------------------------
      | Subcategory
      |--------------------------------------------------------------------------
      */

      if (subcategory) {
        const subCategoryDoc =
          await resolveSubCategory(
            subcategory
          );

        if (!subCategoryDoc) {
          return res.status(404).json({
            success: false,
            message:
              "Subcategory not found"
          });
        }

        filter.subCategory =
          subCategoryDoc._id;
      }

      /*
      |--------------------------------------------------------------------------
      | Homepage
      |--------------------------------------------------------------------------
      */

      if (home === "true") {
        filter.showOnHome = true;
      }

      /*
      |--------------------------------------------------------------------------
      | New Arrivals
      |--------------------------------------------------------------------------
      */

      if (
        newArrivals ===
        "true"
      ) {
        filter.showInNewArrivals =
          true;
      }

      /*
      |--------------------------------------------------------------------------
      | Sale Products
      |--------------------------------------------------------------------------
      */

      if (
        sale === "true" ||
        req.query.showOnSale === "true"
      ) {
        filter.showOnSale = true;
      }

      /*
      |--------------------------------------------------------------------------
      | Featured
      |--------------------------------------------------------------------------
      */

      if (
        featured ===
        "true"
      ) {
        filter.featured =
          true;
      }

      /*
      |--------------------------------------------------------------------------
      | Search
      |--------------------------------------------------------------------------
      */

      if (search) {
        filter.$or = [
          {
            title: {
              $regex:
                search,
              $options:
                "i"
            }
          },
          {
            shortDescription: {
              $regex:
                search,
              $options:
                "i"
            }
          },
          {
            tags: {
              $regex:
                search,
              $options:
                "i"
            }
          }
        ];
      }

      const currentPage =
        Math.max(
          Number(page) || 1,
          1
        );

      const perPage =
        Math.min(
          Math.max(
            Number(limit) || 12,
            1
          ),
          100
        );

      const skip =
        (currentPage - 1) *
        perPage;

      const [
        products,
        total
      ] = await Promise.all([
        Product.find(filter)
          .populate(
            "category",
            "name slug"
          )
          .populate(
            "subCategory",
            "name slug"
          )
          .sort({
            createdAt: -1
          })
          .skip(skip)
          .limit(perPage)
          .lean(),

        Product.countDocuments(
          filter
        )
      ]);

      return res.status(200).json({
        success: true,
        products,
        pagination: {
          page:
            currentPage,
          limit:
            perPage,
          total,
          totalPages:
            Math.ceil(
              total / perPage
            )
        }
      });
    } catch (error) {
      console.error(
        "Get products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch products"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/products/admin/all
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  adminAuth,
  async (req, res) => {
    try {
      const {
        status,
        category,
        search
      } = req.query;

      const filter = {};

      if (status) {
        filter.status =
          status;
      }

      if (category) {
        const categoryDoc =
          await resolveCategory(
            category
          );

        if (!categoryDoc) {
          return res.status(404).json({
            success: false,
            message:
              "Category not found"
          });
        }

        filter.category =
          categoryDoc._id;
      }

      if (search) {
        filter.$or = [
          {
            title: {
              $regex:
                search,
              $options:
                "i"
            }
          },
          {
            sku: {
              $regex:
                search,
              $options:
                "i"
            }
          }
        ];
      }

      const products =
        await Product.find(
          filter
        )
          .populate(
            "category",
            "name slug"
          )
          .populate(
            "subCategory",
            "name slug"
          )
          .sort({
            createdAt: -1
          })
          .lean();

      return res.status(200).json({
        success: true,
        count:
          products.length,
        products
      });
    } catch (error) {
      console.error(
        "Admin products error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch admin products"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/products/:slug
|--------------------------------------------------------------------------
*/

router.get(
  "/:slug",
  async (req, res) => {
    try {
      const product =
        await Product.findOne({
          slug:
            req.params.slug
              .toLowerCase(),
          status:
            "published"
        })
          .populate(
            "category",
            "name slug metaTitle metaDescription"
          )
          .populate(
            "subCategory",
            "name slug metaTitle metaDescription"
          )
          .lean();

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found"
        });
      }

      return res.status(200).json({
        success: true,
        product
      });
    } catch (error) {
      console.error(
        "Get single product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch product"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| POST /api/products
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  adminAuth,
  async (req, res) => {
    try {
      const body =
        normalizeProductPayload(req.body || {});

      /*
      |--------------------------------------------------------------------------
      | Required
      |--------------------------------------------------------------------------
      */

      if (!body.title) {
        return res.status(400).json({
          success: false,
          message:
            "Product title is required"
        });
      }

      if (
        body.pricing?.regularPrice ===
        undefined ||
        body.pricing?.regularPrice ===
        null ||
        body.pricing?.regularPrice ===
        ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Regular price is required"
        });
      }

      if (!body.category) {
        return res.status(400).json({
          success: false,
          message:
            "Category is required"
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Category
      |--------------------------------------------------------------------------
      */

      const categoryDoc =
        await resolveCategory(
          body.category
        );

      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found"
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Subcategory
      |--------------------------------------------------------------------------
      */

      let subCategoryId =
        null;

      if (body.subCategory) {
        const subCategoryDoc =
          await resolveSubCategory(
            body.subCategory
          );

        if (!subCategoryDoc) {
          return res.status(404).json({
            success: false,
            message:
              "Subcategory not found"
          });
        }

        if (
          subCategoryDoc.category.toString() !==
          categoryDoc._id.toString()
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Subcategory does not belong to selected category"
          });
        }

        subCategoryId =
          subCategoryDoc._id;
      }

      /*
      |--------------------------------------------------------------------------
      | Slug
      |--------------------------------------------------------------------------
      */

      const slug =
        await createUniqueSlug(
          body.slug ||
            body.title
        );

      /*
      |--------------------------------------------------------------------------
      | Create Product
      |--------------------------------------------------------------------------
      */

      const product =
        await Product.create({
          ...body,

          slug,

          category:
            categoryDoc._id,

          subCategory:
            subCategoryId,

          status:
            body.status ||
            "draft"
        });

      const populated =
        await product.populate([
          {
            path:
              "category",
            select:
              "name slug"
          },
          {
            path:
              "subCategory",
            select:
              "name slug"
          }
        ]);

      return res.status(201).json({
        success: true,
        message:
          "Product created successfully",
        product:
          populated
      });
    } catch (error) {
      console.error(
        "Create product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create product"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| PUT /api/products/:id
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const existing =
        await Product.findById(
          req.params.id
        );

      if (!existing) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found"
        });
      }

      const body =
        normalizeProductPayload(req.body || {});

      /*
      |--------------------------------------------------------------------------
      | Category
      |--------------------------------------------------------------------------
      */

      if (
        body.category !==
        undefined
      ) {
        const categoryDoc =
          await resolveCategory(
            body.category
          );

        if (!categoryDoc) {
          return res.status(404).json({
            success: false,
            message:
              "Category not found"
          });
        }

        body.category =
          categoryDoc._id;
      }

      /*
      |--------------------------------------------------------------------------
      | Subcategory
      |--------------------------------------------------------------------------
      */

      if (
        body.subCategory !==
        undefined
      ) {
        if (
          body.subCategory ===
          null ||
          body.subCategory ===
          ""
        ) {
          body.subCategory =
            null;
        } else {
          const subCategoryDoc =
            await resolveSubCategory(
              body.subCategory
            );

          if (!subCategoryDoc) {
            return res.status(404).json({
              success: false,
              message:
                "Subcategory not found"
            });
          }

          const selectedCategory =
            body.category ||
            existing.category;

          if (
            subCategoryDoc.category.toString() !==
            selectedCategory.toString()
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Subcategory does not belong to selected category"
            });
          }

          body.subCategory =
            subCategoryDoc._id;
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Slug
      |--------------------------------------------------------------------------
      */

      if (
        body.slug !==
        undefined
      ) {
        body.slug =
          await createUniqueSlug(
            body.slug,
            existing._id
          );
      }

      /*
      |--------------------------------------------------------------------------
      | Update
      |--------------------------------------------------------------------------
      */

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          body,
          {
            new: true,
            runValidators: true
          }
        )
          .populate(
            "category",
            "name slug"
          )
          .populate(
            "subCategory",
            "name slug"
          );

      return res.status(200).json({
        success: true,
        message:
          "Product updated successfully",
        product
      });
    } catch (error) {
      console.error(
        "Update product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update product"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE /api/products/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found"
        });
      }

      await product.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Product deleted successfully"
      });
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete product"
      });
    }
  }
);

module.exports = router;