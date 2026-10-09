const express = require("express");
const multer = require("multer");
const {
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const adminAuth = require("../middleware/adminAuth");
const {
  r2Client,
  R2_BUCKET,
  R2_PUBLIC_URL,
} = require("../config/r2");

const router = express.Router();

/**
 * Allowed upload contexts.
 * "blog" stores files under the "blogs/" prefix in Cloudflare R2.
 * Keep existing contexts because other parts of the site use this endpoint.
 */
const allowedTypes = [
  "product",
  "category",
  "subcategory",
  "review",
  "sale",
  "hero",
  "blog",
];

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error("Only JPG, JPEG, PNG, WEBP and AVIF images are allowed")
    );
  },
});

function createSafeFileName(originalName = "image") {
  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${baseName || "image"}-${Date.now()}${extension}`;
}

function getPublicUrl(key) {
  const baseUrl = String(R2_PUBLIC_URL || "").replace(/\/+$/, "");
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${baseUrl}/${encodedKey}`;
}

/**
 * Convert wildcard route parameters into an R2 key.
 * Express versions may provide wildcard parameters as a string or array.
 */
function getImageKeyFromParams(params) {
  const value = params?.imageId;
  if (Array.isArray(value)) return value.join("/");
  return typeof value === "string" ? value : "";
}

/**
 * POST /api/uploads/direct
 *
 * Authenticated admin upload endpoint.
 * FormData:
 *   file = image file (or "image" for compatibility)
 *   type = product | category | subcategory | review | sale | hero | blog
 *
 * Blog images are stored at blogs/<safe-filename>.
 */
router.post(
  "/direct",
  adminAuth,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const file = req.files?.file?.[0] || req.files?.image?.[0];

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No image file received",
        });
      }

      const type = String(req.body?.type || "product").toLowerCase();

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: `Invalid upload type. Allowed types: ${allowedTypes.join(", ")}`,
        });
      }

      const filename = req.body?.filename || file.originalname || "image";
      const safeName = createSafeFileName(filename);
      const imageKey = `${type}s/${safeName}`;

      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,
          Key: imageKey,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: "public, max-age=31536000",
        })
      );

      const deliveryUrl = getPublicUrl(imageKey);

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        upload: {
          imageId: imageKey,
          key: imageKey,
          url: deliveryUrl,
          imageUrl: deliveryUrl,
          deliveryUrl,
        },
        imageId: imageKey,
        url: deliveryUrl,
        imageUrl: deliveryUrl,
        deliveryUrl,
        cloudflareId: imageKey,
      });
    } catch (error) {
      console.error("R2 image upload error:", {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        status: error?.$metadata?.httpStatusCode,
        requestId: error?.$metadata?.requestId,
      });

      return res.status(500).json({
        success: false,
        message: error?.message || "Failed to upload image to R2",
        code: error?.code || null,
        status: error?.$metadata?.httpStatusCode || null,
      });
    }
  }
);

/**
 * GET /api/uploads/*imageId
 * Authenticated admin endpoint to verify an R2 object exists.
 */
router.get("/*imageId", adminAuth, async (req, res) => {
  try {
    const imageId = getImageKeyFromParams(req.params);

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    const image = await r2Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: imageId,
      })
    );

    const deliveryUrl = getPublicUrl(imageId);

    return res.status(200).json({
      success: true,
      image: {
        id: imageId,
        filename: imageId.split("/").pop() || "",
        uploaded: true,
        draft: false,
        contentType: image?.ContentType || "",
        size: image?.ContentLength || 0,
        variants: [],
        deliveryUrl,
        url: deliveryUrl,
        imageUrl: deliveryUrl,
      },
    });
  } catch (error) {
    const statusCode = error?.$metadata?.httpStatusCode;

    if (statusCode === 404 || error?.name === "NotFound") {
      return res.status(404).json({
        success: false,
        message: "Image not found in R2",
      });
    }

    console.error("Get R2 image error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to get image details",
    });
  }
});

/**
 * DELETE /api/uploads/*imageId
 * Authenticated admin endpoint to delete an R2 object.
 * The image key can include folders, e.g. blogs/example-123.png.
 */
router.delete("/*imageId", adminAuth, async (req, res) => {
  try {
    const imageId = getImageKeyFromParams(req.params);

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required",
      });
    }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: imageId,
      })
    );

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      imageId,
    });
  } catch (error) {
    console.error("Delete R2 image error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete image",
    });
  }
});

/**
 * Multer error handler.
 */
router.use((error, req, res, next) => {
  console.error("Upload middleware error:", error);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Image size must be less than 10MB"
          : error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Image upload error",
    });
  }

  return next();
});

module.exports = router;