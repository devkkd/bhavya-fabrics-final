const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const adminAuth = require("../middleware/adminAuth");
const Product = require("../models/Product");
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

const router = express.Router();

// In-memory storage for upload progress (in production, use Redis)
const uploadProgress = new Map();

// Configure multer for file uploads
const upload = multer({
  dest: path.join(__dirname, "../temp"),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files are allowed"));
    }
  },
});

/**
 * Parse Excel file and extract product data
 */
function parseExcelFile(filePath, templateType) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      throw new Error("Excel file is empty");
    }

    return data.map((row, index) => ({
      ...row,
      _rowNumber: index + 2,
    }));
  } catch (error) {
    throw new Error(`Error parsing Excel file: ${error.message}`);
  }
}

/**
 * Validate product data
 */
async function validateProductRow(row, templateType) {
  const errors = [];

  if (!row.SKU || typeof row.SKU !== "string") {
    errors.push("SKU is required");
  } else if (row.SKU.trim().length === 0) {
    errors.push("SKU cannot be empty");
  }

  if (!row["Product Name"]) errors.push("Product Name is required");
  if (!row.Category) errors.push("Category is required");
  if (!row["Sub Category"]) errors.push("Sub Category is required");
  if (!row.Description) errors.push("Description is required");

  const priceCol = `Regular Price (Per ${templateType === "raw" ? "Meter" : "Piece"})`;
  const regularPrice = Number(row[priceCol]);
  if (isNaN(regularPrice) || regularPrice <= 0) {
    errors.push(`Regular Price must be a positive number`);
  }

  const salePriceCol = `Sale Price (Per ${templateType === "raw" ? "Meter" : "Piece"})`;
  if (row[salePriceCol]) {
    const salePrice = Number(row[salePriceCol]);
    if (isNaN(salePrice) || salePrice <= 0) {
      errors.push("Sale Price must be a positive number");
    }
  }

  if (row.Status && !["draft", "published"].includes(row.Status.toLowerCase())) {
    errors.push("Status must be 'draft' or 'published'");
  }

  if (templateType === "raw") {
    const minMeters = Number(row["Meter Config: Min Meters"]);
    const maxMeters = Number(row["Meter Config: Max Meters"]);
    const increment = Number(row["Meter Config: Increment Meters"]);

    if (isNaN(minMeters) || minMeters <= 0) errors.push("Min Meters must be a positive number");
    if (isNaN(maxMeters) || maxMeters <= 0) errors.push("Max Meters must be a positive number");
    if (isNaN(increment) || increment <= 0) errors.push("Increment Meters must be a positive number");
    if (minMeters >= maxMeters) errors.push("Min Meters must be less than Max Meters");
  }

  if (row.Colors) {
    try {
      const colors = typeof row.Colors === "string" ? JSON.parse(row.Colors) : row.Colors;
      if (!Array.isArray(colors)) throw new Error("Colors must be an array");
    } catch (e) {
      errors.push(`Invalid Colors JSON: ${e.message}`);
    }
  }

  if (row["Variants JSON"]) {
    try {
      const variants = typeof row["Variants JSON"] === "string" ? JSON.parse(row["Variants JSON"]) : row["Variants JSON"];
      if (!Array.isArray(variants)) throw new Error("Variants must be an array");
    } catch (e) {
      errors.push(`Invalid Variants JSON: ${e.message}`);
    }
  }

  return errors;
}

/**
 * Find images for a product
 */
async function findProductImages(sku, imageFolder, templateType) {
  const images = [];

  try {
    if (!fs.existsSync(imageFolder)) {
      return images;
    }

    const files = fs.readdirSync(imageFolder);
    
    if (templateType === "raw") {
      const skuImages = files.filter((f) => {
        const lowerName = f.toLowerCase();
        const lowerSku = sku.toLowerCase();
        return lowerName.startsWith(lowerSku + "_") || lowerName.startsWith(lowerSku + "-");
      }).sort();
      
      images.push(...skuImages);
    } else {
      const productImages = files.filter((f) => {
        const lowerName = f.toLowerCase();
        const lowerSku = sku.toLowerCase();
        return lowerName.includes(lowerSku);
      }).sort();
      
      images.push(...productImages);
    }
  } catch (error) {
    console.error(`Error finding images for SKU ${sku}:`, error);
  }

  return images;
}

function parseColors(colorData) {
  if (!colorData) return [];

  try {
    const colors = typeof colorData === "string" ? JSON.parse(colorData) : colorData;
    return Array.isArray(colors) ? colors : [];
  } catch (error) {
    console.error("Error parsing colors:", error);
    return [];
  }
}

function parseVariants(variantData) {
  if (!variantData) return [];

  try {
    const variants = typeof variantData === "string" ? JSON.parse(variantData) : variantData;
    return Array.isArray(variants) ? variants : [];
  } catch (error) {
    console.error("Error parsing variants:", error);
    return [];
  }
}

/**
 * POST /api/bulk-upload/validate
 */
router.post("/validate", adminAuth, upload.single("file"), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const { templateType } = req.body;
    if (!["raw", "ready-made"].includes(templateType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid templateType. Use 'raw' or 'ready-made'",
      });
    }

    filePath = req.file.path;
    const rows = parseExcelFile(filePath, templateType);

    const validation = {
      totalRows: rows.length,
      validRows: 0,
      invalidRows: [],
      warnings: [],
    };

    for (const row of rows) {
      const errors = await validateProductRow(row, templateType);

      if (errors.length > 0) {
        validation.invalidRows.push({
          rowNumber: row._rowNumber,
          sku: row.SKU,
          errors,
        });
      } else {
        validation.validRows++;
      }
    }

    const skus = new Set();
    for (const row of rows) {
      if (skus.has(row.SKU?.toLowerCase())) {
        validation.warnings.push(`Duplicate SKU found: ${row.SKU} (row ${row._rowNumber})`);
      }
      skus.add(row.SKU?.toLowerCase());
    }

    return res.json({
      success: true,
      validation,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Validation failed",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

/**
 * POST /api/bulk-upload/process
 */
router.post("/process", adminAuth, upload.single("file"), async (req, res) => {
  let filePath = null;
  const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file provided",
      });
    }

    const { templateType, imageFolder } = req.body;
    if (!["raw", "ready-made"].includes(templateType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid templateType",
      });
    }

    filePath = req.file.path;
    const rows = parseExcelFile(filePath, templateType);

    // Initialize progress tracking
    uploadProgress.set(uploadId, {
      uploadId,
      status: "processing",
      totalRows: rows.length,
      processedRows: 0,
      successfulProducts: [],
      failedProducts: [],
      startTime: Date.now(),
    });

    const results = uploadProgress.get(uploadId);

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const errors = await validateProductRow(row, templateType);
        if (errors.length > 0) {
          results.failedProducts.push({
            rowNumber: row._rowNumber,
            sku: row.SKU,
            errors,
          });
          results.processedRows++;
          continue;
        }

        const category = await Category.findOne({
          name: new RegExp(`^${row.Category}$`, "i"),
        });
        if (!category) {
          results.failedProducts.push({
            rowNumber: row._rowNumber,
            sku: row.SKU,
            errors: [`Category not found: ${row.Category}`],
          });
          results.processedRows++;
          continue;
        }

        const subCategory = await SubCategory.findOne({
          name: new RegExp(`^${row["Sub Category"]}$`, "i"),
          category: category._id,
        });
        if (!subCategory) {
          results.failedProducts.push({
            rowNumber: row._rowNumber,
            sku: row.SKU,
            errors: [`Sub-category not found: ${row["Sub Category"]}`],
          });
          results.processedRows++;
          continue;
        }

        const images = await findProductImages(row.SKU, imageFolder || "", templateType);

        const productData = {
          title: row["Product Name"],
          slug: row["Product Name"].toLowerCase().replace(/\s+/g, "-"),
          description: row.Description,
          category: category._id,
          subCategory: subCategory._id,
          sku: row.SKU,
          status: row.Status?.toLowerCase() || "draft",
          sellingMode: templateType === "raw" ? "meter" : "piece",
          images: images.map((img) => ({
            url: img,
            alt: row["Product Name"],
          })),
        };

        if (templateType === "raw") {
          productData.price = Number(row["Regular Price (Per Meter)"]);
          productData.salePrice = row["Sale Price (Per Meter)"]
            ? Number(row["Sale Price (Per Meter)"])
            : null;
          productData.priceUnit = "Per Meter";
          productData.meterConfig = {
            enabled: true,
            minMeters: Number(row["Meter Config: Min Meters"]),
            maxMeters: Number(row["Meter Config: Max Meters"]),
            incrementMeters: Number(row["Meter Config: Increment Meters"]),
          };
          productData.bulkOrderNote = row["Bulk Order Note"] || "";

          const colors = parseColors(row.Colors);
          if (colors.length > 0) {
            productData.colorOptions = colors;
          }
        } else {
          productData.price = Number(row["Regular Price (Per Piece)"]);
          productData.salePrice = row["Sale Price (Per Piece)"]
            ? Number(row["Sale Price (Per Piece)"])
            : null;
          productData.priceUnit = "Per Piece";

          const variants = parseVariants(row["Variants JSON"]);
          if (variants.length > 0) {
            productData.variants = variants;
            productData.variantsEnabled = true;
          }
        }

        let product = await Product.findOne({ sku: row.SKU });
        if (product) {
          Object.assign(product, productData);
        } else {
          product = new Product(productData);
        }

        await product.save();

        results.successfulProducts.push({
          rowNumber: row._rowNumber,
          sku: row.SKU,
          title: row["Product Name"],
          _id: product._id,
        });

        results.processedRows++;
      } catch (error) {
        console.error(`Error processing row ${row._rowNumber}:`, error);
        results.failedProducts.push({
          rowNumber: row._rowNumber,
          sku: row.SKU,
          errors: [error.message],
        });
        results.processedRows++;
      }
    }

    results.status = "completed";
    results.endTime = Date.now();
    results.duration = results.endTime - results.startTime;

    // Clean up progress after 1 hour
    setTimeout(() => {
      uploadProgress.delete(uploadId);
    }, 3600000);

    return res.json({
      success: true,
      uploadId,
      results,
    });
  } catch (error) {
    console.error("Processing error:", error);
    uploadProgress.delete(uploadId);
    return res.status(500).json({
      success: false,
      message: error.message || "Processing failed",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

/**
 * GET /api/bulk-upload/progress/:uploadId
 */
router.get("/progress/:uploadId", adminAuth, (req, res) => {
  try {
    const { uploadId } = req.params;
    const progress = uploadProgress.get(uploadId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Upload not found or already completed",
      });
    }

    // Calculate progress percentage
    const percentage = progress.totalRows > 0 
      ? Math.round((progress.processedRows / progress.totalRows) * 100)
      : 0;

    res.json({
      success: true,
      progress: {
        ...progress,
        percentage,
      },
    });
  } catch (error) {
    console.error("Progress error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching progress",
    });
  }
});

/**
 * GET /api/bulk-upload/template/:type
 */
router.get("/template/:type", adminAuth, (req, res) => {
  try {
    const { type } = req.params;

    if (!["raw", "readyMade"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid template type. Use 'raw' or 'readyMade'",
      });
    }

    const templateName = type === "raw" ? "rawMaterials_template.xlsx" : "readyMade_template.xlsx";
    const templatePath = path.join(__dirname, "../templates", templateName);

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({
        success: false,
        message: `Template not found: ${templateName}`,
      });
    }

    // Send file
    res.download(templatePath, templateName);
  } catch (error) {
    console.error("Template download error:", error);
    res.status(500).json({
      success: false,
      message: "Error downloading template",
    });
  }
});

module.exports = router;
