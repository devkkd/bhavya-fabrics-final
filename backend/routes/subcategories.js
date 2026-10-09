const express = require("express");

const SubCategory =
  require("../models/SubCategory");

const Category =
  require("../models/Category");

const Product =
  require("../models/Product");

const adminAuth =
  require("../middleware/adminAuth");

const router = express.Router();

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
| GET /api/subcategories
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const {
      category,
      home,
      all
    } = req.query;

    const filter = {};

    if (all !== "true") {
      filter.status = "published";
    }

    if (home === "true") {
      filter.showOnHome = true;
    }

    if (category) {
      const categoryDoc =
        await Category.findOne({
          $or: [
            {
              _id:
                /^[a-f\d]{24}$/i.test(
                  category
                )
                  ? category
                  : undefined
            },
            {
              slug:
                category
                  .toLowerCase()
            }
          ]
        });

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

    const subCategories =
      await SubCategory.find(filter)
        .populate(
          "category",
          "name slug"
        )
        .sort({
          order: 1
        })
        .lean();

    return res.status(200).json({
      success: true,
      count:
        subCategories.length,
      subCategories
    });
  } catch (error) {
    console.error(
      "Get subcategories error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch subcategories"
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /api/subcategories/admin/all
|--------------------------------------------------------------------------
*/

router.get(
  "/admin/all",
  adminAuth,
  async (req, res) => {
    try {
      const subCategories =
        await SubCategory.find({})
          .populate(
            "category",
            "name slug"
          )
          .sort({
            order: 1
          })
          .lean();

      return res.status(200).json({
        success: true,
        count:
          subCategories.length,
        subCategories
      });
    } catch (error) {
      console.error(
        "Admin subcategories error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch subcategories"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/subcategories/:slug
|--------------------------------------------------------------------------
*/

router.get(
  "/:slug",
  async (req, res) => {
    try {
      const subCategory =
        await SubCategory.findOne({
          slug:
            req.params.slug
              .toLowerCase(),
          status:
            "published"
        })
          .populate(
            "category",
            "name slug"
          )
          .lean();

      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message:
            "Subcategory not found"
        });
      }

      return res.status(200).json({
        success: true,
        subCategory
      });
    } catch (error) {
      console.error(
        "Get subcategory error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch subcategory"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| POST /api/subcategories
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
        category,
        image,
        heroImage,
        homeImage,
        description,
        metaTitle,
        metaDescription,
        showOnHome,
        status,
        order
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Subcategory name is required"
        });
      }

      if (!category) {
        return res.status(400).json({
          success: false,
          message:
            "Parent category is required"
        });
      }

      const categoryDoc =
        await Category.findById(
          category
        );

      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message:
            "Parent category not found"
        });
      }

      const finalSlug =
        slugify(
          slug || name
        );

      const existing =
        await SubCategory.findOne({
          category,
          slug: finalSlug
        });

      if (existing) {
        return res.status(409).json({
          success: false,
          message:
            "Subcategory with this slug already exists in this category"
        });
      }

      const subCategory =
        await SubCategory.create({
          name,
          slug: finalSlug,
          category,
          image:
            image || undefined,
          heroImage:
            heroImage || undefined,
          homeImage:
            homeImage || undefined,
          description:
            description || "",
          metaTitle:
            metaTitle || "",
          metaDescription:
            metaDescription || "",
          showOnHome:
            Boolean(showOnHome),
          status:
            status || "published",
          order:
            Number(order) || 0
        });

      const populated =
        await subCategory.populate(
          "category",
          "name slug"
        );

      return res.status(201).json({
        success: true,
        message:
          "Subcategory created successfully",
        subCategory:
          populated
      });
    } catch (error) {
      console.error(
        "Create subcategory error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to create subcategory"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| PUT /api/subcategories/:id
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
        category,
        image,
        heroImage,
        homeImage,
        description,
        metaTitle,
        metaDescription,
        showOnHome,
        status,
        order
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

      if (category !== undefined) {
        const categoryExists =
          await Category.exists({
            _id: category
          });

        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            message:
              "Parent category not found"
          });
        }

        updateData.category =
          category;
      }

      if (image !== undefined) {
        updateData.image =
          image;
      }

      if (
        heroImage !==
        undefined
      ) {
        updateData.heroImage =
          heroImage;
      }

      if (
        homeImage !==
        undefined
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

      if (status !== undefined) {
        updateData.status =
          status;
      }

      if (order !== undefined) {
        updateData.order =
          Number(order);
      }

      const subCategory =
        await SubCategory.findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true
          }
        ).populate(
          "category",
          "name slug"
        );

      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message:
            "Subcategory not found"
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Subcategory updated successfully",
        subCategory
      });
    } catch (error) {
      console.error(
        "Update subcategory error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update subcategory"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE /api/subcategories/:id
|--------------------------------------------------------------------------
*/

router.delete(
  "/:id",
  adminAuth,
  async (req, res) => {
    try {
      const subCategory =
        await SubCategory.findById(
          req.params.id
        );

      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message:
            "Subcategory not found"
        });
      }

      const productCount =
        await Product.countDocuments({
          subCategory:
            subCategory._id
        });

      if (productCount > 0) {
        return res.status(409).json({
          success: false,
          message:
            "Subcategory cannot be deleted while products are linked to it"
        });
      }

      await subCategory.deleteOne();

      return res.status(200).json({
        success: true,
        message:
          "Subcategory deleted successfully"
      });
    } catch (error) {
      console.error(
        "Delete subcategory error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete subcategory"
      });
    }
  }
);

module.exports = router;