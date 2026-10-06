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
        page = 1,
        limit = 12
      } = req.query;

      const filter = {
        status: "published"
      };

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
        req.body || {};

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
        req.body || {};

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