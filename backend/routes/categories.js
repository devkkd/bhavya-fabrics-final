const express = require("express");

const Category =
  require("../models/Category");

const SubCategory =
  require("../models/SubCategory");

const Product =
  require("../models/Product");

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
| GET /api/categories
| Public
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const {
      home,
      navigation,
      all
    } = req.query;

    const filter = {};

    /*
    |--------------------------------------------------------------------------
    | Public Only
    |--------------------------------------------------------------------------
    */

    if (all !== "true") {
      filter.status = "published";
    }

    if (home === "true") {
      filter.showOnHome = true;
    }

    if (navigation === "true") {
      filter.showInNavigation = true;
    }

    const categories =
      await Category.find(filter)
        .sort({
          createdAt: -1
        })
        .lean();

    const subCategories =
      await SubCategory.find({
        status: "published"
      })
        .sort({
          createdAt: -1
        })
        .lean();

    const categoriesWithSubCategories =
      categories.map((category) => ({
        ...category,
        subCategories:
          subCategories.filter(
            (subCategory) =>
              String(
                subCategory.category
              ) ===
              String(
                category._id
              )
          ),
        subcategories:
          subCategories.filter(
            (subCategory) =>
              String(
                subCategory.category
              ) ===
              String(
                category._id
              )
          )
      }));

    return res.status(200).json({
      success: true,
      count:
        categoriesWithSubCategories.length,
      categories:
        categoriesWithSubCategories
    });
  } catch (error) {
    console.error(
      "Get categories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch categories"
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/categories/admin/all
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  adminAuth,
  async (req, res) => {
    try {
      const categories =
        await Category.find({})
          .sort({
            createdAt: -1
          })
          .lean();

      const subCategories =
        await SubCategory.find({})
          .populate(
            "category",
            "name slug"
          )
          .sort({
            createdAt: -1
          })
          .lean();

      const categoriesWithSubCategories =
        categories.map((category) => ({
          ...category,
          subCategories:
            subCategories.filter(
              (subCategory) =>
                String(
                  subCategory.category?._id ||
                    subCategory.category
                ) ===
                String(category._id)
            ),
          subcategories:
            subCategories.filter(
              (subCategory) =>
                String(
                  subCategory.category?._id ||
                    subCategory.category
                ) ===
                String(category._id)
            )
        }));

      return res.status(200).json({
        success: true,
        count:
          categoriesWithSubCategories.length,
        categories:
          categoriesWithSubCategories
      });
    } catch (error) {
      console.error(
        "Admin categories error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch categories"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/categories/:slug
|--------------------------------------------------------------------------
*/

router.get(
  "/:slug",
  async (req, res) => {
    try {
      const category =
        await Category.findOne({
          slug:
            req.params.slug
              .toLowerCase()
        }).lean();

      if (!category) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found"
        });
      }

      const subCategories =
        await SubCategory.find({
          category:
            category._id,
          status:
            "published"
        })
          .sort({
            createdAt: -1
          })
          .lean();

      return res.status(200).json({
        success: true,
        category,
        subCategories
      });
    } catch (error) {
      console.error(
        "Get category error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch category"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| POST /api/categories
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  adminAuth,
  async (req, res) => {
    try {
      const {
        name,
        slug,
        image,
        heroImage,
        homeImage,
        description,
        metaTitle,
        metaDescription,
        showOnHome,
        showInNavigation,
        status
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Category name is required"
        });
      }

      const finalSlug =
        slugify(
          slug || name
        );

      const existing =
        await Category.findOne({
          slug: finalSlug
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Category with this slug already exists"
        });
      }

      const category =
        await Category.create({
          name,
          slug: finalSlug,
          image: image || undefined,
          heroImage: heroImage || undefined,
          homeImage: homeImage || undefined,
          description:
            description || "",
          metaTitle:
            metaTitle || "",
          metaDescription:
            metaDescription || "",
          showOnHome:
            Boolean(showOnHome),
          showInNavigation:
            showInNavigation !==
            undefined
              ? Boolean(
                  showInNavigation
                )
              : true,
          status:
            status || "published"
        });

      return res.status(201).json({
        success: true,
        message:
          "Category created successfully",
        category
      });
    } catch (error) {
      console.error(
        "Create category error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create category"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| PUT /api/categories/:id
|--------------------------------------------------------------------------
*/

router.put(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const {
        name,
        slug,
        image,
        heroImage,
        homeImage,
        description,
        metaTitle,
        metaDescription,
        showOnHome,
        showInNavigation,
        status
      } = req.body;

      const updateData = {};

      if (name !== undefined) {
        updateData.name =
          name;
      }

      if (slug !== undefined) {
        updateData.slug =
          slugify(slug);
      }

      if (image !== undefined) {
        updateData.image =
          image;
      }

      if (
        heroImage !== undefined
      ) {
        updateData.heroImage =
          heroImage;
      }

      if (
        homeImage !== undefined
      ) {
        updateData.homeImage =
          homeImage;
      }

      if (
        description !==
        undefined
      ) {
        updateData.description =
          description;
      }

      if (
        metaTitle !==
        undefined
      ) {
        updateData.metaTitle =
          metaTitle;
      }

      if (
        metaDescription !==
        undefined
      ) {
        updateData.metaDescription =
          metaDescription;
      }

      if (
        showOnHome !==
        undefined
      ) {
        updateData.showOnHome =
          Boolean(showOnHome);
      }

      if (
        showInNavigation !==
        undefined
      ) {
        updateData.showInNavigation =
          Boolean(
            showInNavigation
          );
      }

      if (status !== undefined) {
        updateData.status =
          status;
      }

      const category =
        await Category.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true
          }
        );

      if (!category) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found"
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Category updated successfully",
        category
      });
    } catch (error) {
      console.error(
        "Update category error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update category"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE /api/categories/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res.status(404).json({
          success: false,
          message:
            "Category not found"
        });
      }

      const subCategoryCount =
        await SubCategory.countDocuments({
          category:
            category._id
        });

      const productCount =
        await Product.countDocuments({
          category:
            category._id
        });

      if (
        subCategoryCount > 0 ||
        productCount > 0
      ) {
        return res.status(409).json({
          success: false,
          message:
            "Category cannot be deleted while subcategories or products are linked to it"
        });
      }

      await category.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Category deleted successfully"
      });
    } catch (error) {
      console.error(
        "Delete category error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete category"
      });
    }
  }
);

module.exports = router;