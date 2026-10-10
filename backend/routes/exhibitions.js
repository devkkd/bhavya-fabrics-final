const express = require("express");
const multer = require("multer");
const {
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const path = require("path");
const Exhibition = require("../models/Exhibition");
const adminAuth = require("../middleware/adminAuth");
const {
  r2Client,
  R2_BUCKET,
  R2_PUBLIC_URL,
} = require("../config/r2");

const router = express.Router();

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
  },
});

// Helper function to create safe filename
function createSafeFileName(originalName = "exhibition") {
  const extension = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase()
    : "";

  const baseName = originalName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${baseName || "exhibition"}-${Date.now()}${extension}`;
}

// Helper function to get public URL
function getPublicUrl(key) {
  const baseUrl = String(R2_PUBLIC_URL || "").replace(/\/+$/, "");
  const encodedKey = key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  return `${baseUrl}/${encodedKey}`;
}

const withCurrentStatus = (exhibitions) => {
  const now = new Date();
  return exhibitions.map((exhibition) => {
    let status = "past";
    if (new Date(exhibition.startDate) > now) {
      status = "upcoming";
    } else if (
      new Date(exhibition.startDate) <= now &&
      new Date(exhibition.endDate) >= now
    ) {
      status = "ongoing";
    }
    return { ...exhibition, status };
  });
};

/**
 * GET /api/exhibitions
 * Get all exhibitions (public)
 */
router.get("/", async (req, res) => {
  try {
    const exhibitions = await Exhibition.find()
      .sort({ startDate: -1 })
      .lean();

    res.json({
      success: true,
      exhibitions: withCurrentStatus(exhibitions),
    });
  } catch (error) {
    console.error("Error fetching exhibitions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exhibitions",
    });
  }
});

/**
 * GET /api/exhibitions/admin
 * Get all exhibitions for the admin panel
 */
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const exhibitions = await Exhibition.find()
      .sort({ startDate: -1 })
      .lean();

    res.json({
      success: true,
      exhibitions: withCurrentStatus(exhibitions),
    });
  } catch (error) {
    console.error("Error fetching exhibitions for admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch exhibitions",
    });
  }
});

/**
 * POST /api/exhibitions/admin
 * Create new exhibition (admin)
 */
router.post("/admin", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, time, boothDetails, featured, order } = req.body;

    if (!title || !description || !location || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, description, location, startDate, endDate",
      });
    }

    // Time is required for upcoming exhibitions (startDate in future), optional for past
    const now = new Date();
    const isUpcoming = new Date(startDate) > now;
    
    if (isUpcoming && !time) {
      return res.status(400).json({
        success: false,
        message: "Time is required for upcoming exhibitions",
      });
    }

    let imageData = {};
    let imageKey = null;
    
    if (req.file) {
      try {
        const filename = title || "exhibition";
        const safeName = createSafeFileName(filename);
        imageKey = `exhibitions/${safeName}`;

        await r2Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: imageKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            CacheControl: "public, max-age=31536000",
          })
        );

        const deliveryUrl = getPublicUrl(imageKey);
        imageData = {
          url: deliveryUrl,
          alt: title,
          imageId: imageKey,
        };
      } catch (uploadError) {
        console.error("R2 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to R2",
        });
      }
    }

    const exhibition = new Exhibition({
      title,
      description,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      time,
      image: imageData,
      imageId: imageKey,
      boothDetails: boothDetails || "",
      featured: featured === "true" || featured === true,
      order: parseInt(order) || 0,
    });

    await exhibition.save();

    res.json({
      success: true,
      message: "Exhibition created successfully",
      exhibition,
    });
  } catch (error) {
    console.error("Error creating exhibition:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create exhibition",
    });
  }
});

/**
 * PUT /api/exhibitions/admin/:id
 * Update exhibition (admin)
 */
router.put("/admin/:id", adminAuth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, time, boothDetails, featured, order } = req.body;
    
    const exhibition = await Exhibition.findById(req.params.id);
    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: "Exhibition not found",
      });
    }

    // Update image if new one provided
    if (req.file) {
      try {
        // Delete old image from R2
        if (exhibition.imageId) {
          try {
            await r2Client.send(
              new DeleteObjectCommand({
                Bucket: R2_BUCKET,
                Key: exhibition.imageId,
              })
            );
          } catch (deleteError) {
            console.error("Error deleting old image:", deleteError);
          }
        }

        // Upload new image
        const filename = title || exhibition.title || "exhibition";
        const safeName = createSafeFileName(filename);
        const imageKey = `exhibitions/${safeName}`;

        await r2Client.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET,
            Key: imageKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            CacheControl: "public, max-age=31536000",
          })
        );

        const deliveryUrl = getPublicUrl(imageKey);
        exhibition.image = {
          url: deliveryUrl,
          alt: title || exhibition.title,
          imageId: imageKey,
        };
        exhibition.imageId = imageKey;
      } catch (uploadError) {
        console.error("R2 upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to R2",
        });
      }
    }

    exhibition.title = title || exhibition.title;
    exhibition.description = description || exhibition.description;
    exhibition.location = location || exhibition.location;
    exhibition.startDate = startDate ? new Date(startDate) : exhibition.startDate;
    exhibition.endDate = endDate ? new Date(endDate) : exhibition.endDate;
    exhibition.time = time || exhibition.time;
    exhibition.boothDetails = boothDetails !== undefined ? boothDetails : exhibition.boothDetails;
    exhibition.featured = featured !== undefined ? (featured === "true" || featured === true) : exhibition.featured;
    exhibition.order = order !== undefined ? parseInt(order) : exhibition.order;

    await exhibition.save();

    res.json({
      success: true,
      message: "Exhibition updated successfully",
      exhibition,
    });
  } catch (error) {
    console.error("Error updating exhibition:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update exhibition",
    });
  }
});

/**
 * DELETE /api/exhibitions/admin/:id
 * Delete exhibition (admin)
 */
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    const exhibition = await Exhibition.findByIdAndDelete(req.params.id);

    if (!exhibition) {
      return res.status(404).json({
        success: false,
        message: "Exhibition not found",
      });
    }

    // Delete image from R2
    if (exhibition.imageId) {
      try {
        await r2Client.send(
          new DeleteObjectCommand({
            Bucket: R2_BUCKET,
            Key: exhibition.imageId,
          })
        );
      } catch (deleteError) {
        console.error("Error deleting image from R2:", deleteError);
      }
    }

    res.json({
      success: true,
      message: "Exhibition deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting exhibition:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete exhibition",
    });
  }
});

module.exports = router;
