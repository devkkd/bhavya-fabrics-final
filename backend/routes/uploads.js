const express = require("express");
const multer = require("multer");

const {
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

const adminAuth =
  require("../middleware/adminAuth");

const {
  r2Client,
  R2_BUCKET,
  R2_PUBLIC_URL,
} = require("../config/r2");

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| Allowed Upload Contexts
|--------------------------------------------------------------------------
*/

const allowedTypes = [
  "product",
  "category",
  "subcategory",
  "review",
  "sale",
];

/*
|--------------------------------------------------------------------------
| Multer Configuration
|--------------------------------------------------------------------------
|
| Image backend par memory me receive hogi
| aur directly Cloudflare R2 me upload hogi.
|
|--------------------------------------------------------------------------
*/

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ];

    if (
      allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP and AVIF images are allowed"
      )
    );
  },
});

/*
|--------------------------------------------------------------------------
| Generate Safe File Name
|--------------------------------------------------------------------------
*/

function createSafeFileName(
  originalName
) {
  const extension =
    originalName.includes(".")
      ? originalName
          .substring(
            originalName.lastIndexOf(".")
          )
          .toLowerCase()
      : "";

  const baseName =
    originalName
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

  return `${
    baseName || "image"
  }-${Date.now()}${extension}`;
}

/*
|--------------------------------------------------------------------------
| Build Public R2 URL
|--------------------------------------------------------------------------
*/

function getPublicUrl(key) {
  return (
    `${R2_PUBLIC_URL}/` +
    key
      .split("/")
      .map((part) =>
        encodeURIComponent(part)
      )
      .join("/")
  );
}

/*
|--------------------------------------------------------------------------
| POST /api/uploads/direct
|--------------------------------------------------------------------------
|
| This keeps the SAME endpoint name used by
| your current frontend.
|
| Frontend can send:
|
| FormData:
| file = actual image
| type = product/category/subcategory/review
|
|--------------------------------------------------------------------------
*/

router.post(
  "/direct",
  adminAuth,
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      console.log("");
      console.log(
        "========================================"
      );
      console.log(
        "        CLOUDFLARE R2 IMAGE UPLOAD"
      );
      console.log(
        "========================================"
      );

      /*
      |--------------------------------------------------------------------------
      | Get File
      |--------------------------------------------------------------------------
      */

      const file =
        req.files?.file?.[0] ||
        req.files?.image?.[0];

      if (!file) {
        console.log(
          "❌ No image file received"
        );

        return res.status(400).json({
          success: false,
          message:
            "No image file received",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Upload Type
      |--------------------------------------------------------------------------
      */

      const type =
        req.body?.type ||
        "product";

      if (
        !allowedTypes.includes(type)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid upload type",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Filename
      |--------------------------------------------------------------------------
      */

      const filename =
        req.body?.filename ||
        file.originalname ||
        "image";

      /*
      |--------------------------------------------------------------------------
      | Create R2 Key
      |--------------------------------------------------------------------------
      */

      const safeName =
        createSafeFileName(
          filename
        );

      const imageKey =
        `${type}s/${safeName}`;

      /*
      |--------------------------------------------------------------------------
      | Logs
      |--------------------------------------------------------------------------
      */

      console.log(
        "Upload Type:",
        type
      );

      console.log(
        "Original Filename:",
        file.originalname
      );

      console.log(
        "MIME Type:",
        file.mimetype
      );

      console.log(
        "File Size:",
        file.size
      );

      console.log(
        "R2 Bucket:",
        R2_BUCKET
      );

      console.log(
        "R2 Key:",
        imageKey
      );

      /*
      |--------------------------------------------------------------------------
      | Upload To R2
      |--------------------------------------------------------------------------
      */

      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET,

          Key: imageKey,

          Body: file.buffer,

          ContentType:
            file.mimetype,

          CacheControl:
            "public, max-age=31536000",
        })
      );

      /*
      |--------------------------------------------------------------------------
      | Public URL
      |--------------------------------------------------------------------------
      */

      const deliveryUrl =
        getPublicUrl(imageKey);

      console.log(
        "✅ R2 Upload Successful"
      );

      console.log(
        "Delivery URL:",
        deliveryUrl
      );

      /*
      |--------------------------------------------------------------------------
      | Response
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,

        message:
          "Image uploaded successfully",

        upload: {
          imageId:
            imageKey,

          key:
            imageKey,

          url:
            deliveryUrl,

          imageUrl:
            deliveryUrl,

          deliveryUrl:
            deliveryUrl,

         
        },

        imageId:
          imageKey,

        url:
          deliveryUrl,

        imageUrl:
          deliveryUrl,

        deliveryUrl:
          deliveryUrl,

        cloudflareId:
          imageKey,
      });
   } catch (error) {
  console.error("\n========== R2 UPLOAD ERROR ==========");
  console.error("Name:", error?.name);
  console.error("Message:", error?.message);
  console.error("Code:", error?.code);
  console.error(
    "Status:",
    error?.$metadata?.httpStatusCode
  );
  console.error(
    "Request ID:",
    error?.$metadata?.requestId
  );
  console.error("Full Error:", error);
  console.error("=====================================\n");

  return res.status(500).json({
    success: false,
    message:
      error?.message ||
      "Failed to upload image to R2",
    code: error?.code || null,
    status:
      error?.$metadata?.httpStatusCode ||
      null,
  });
}
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/uploads/:imageId
|--------------------------------------------------------------------------
|
| Check whether R2 object exists.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/*imageId",
  adminAuth,
  async (req, res) => {
    try {
      const imageId =
        req.params.imageId;

      if (!imageId) {
        return res.status(400).json({
          success: false,
          message:
            "Image ID is required",
        });
      }

      console.log(
        "Checking R2 image:",
        imageId
      );

      /*
      |--------------------------------------------------------------------------
      | Check Object
      |--------------------------------------------------------------------------
      */

      const image =
        await r2Client.send(
          new HeadObjectCommand({
            Bucket: R2_BUCKET,
            Key: imageId,
          })
        );

      const deliveryUrl =
        getPublicUrl(imageId);

      return res.status(200).json({
        success: true,

        image: {
          id:
            imageId,

          filename:
            imageId
              .split("/")
              .pop() || "",

          uploaded:
            true,

          draft:
            false,

          contentType:
            image?.ContentType ||
            "",

          size:
            image?.ContentLength ||
            0,

          variants: [],

          deliveryUrl,

          url:
            deliveryUrl,

          imageUrl:
            deliveryUrl,
        },
      });
    } catch (error) {
      /*
      |--------------------------------------------------------------------------
      | Object Not Found
      |--------------------------------------------------------------------------
      */

      const statusCode =
        error?.$metadata
          ?.httpStatusCode;

      if (
        statusCode === 404 ||
        error?.name ===
          "NotFound"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Image not found in R2",
        });
      }

      console.error(
        "Get R2 image error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to get image details",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| DELETE /api/uploads/:imageId
|--------------------------------------------------------------------------
|
| Delete image from R2.
|
|--------------------------------------------------------------------------
*/

router.delete(
  "/:imageId",
  adminAuth,
  async (req, res) => {
    try {
      const imageId =
        req.params.imageId;

      if (!imageId) {
        return res.status(400).json({
          success: false,
          message:
            "Image ID is required",
        });
      }

      console.log(
        "Deleting R2 image:",
        imageId
      );

      /*
      |--------------------------------------------------------------------------
      | Delete
      |--------------------------------------------------------------------------
      */

      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET,

          Key: imageId,
        })
      );

      console.log(
        "✅ R2 image deleted"
      );

      return res.status(200).json({
        success: true,

        message:
          "Image deleted successfully",

        imageId,
      });
    } catch (error) {
      console.error(
        "Delete R2 image error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to delete image",
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| Multer Error Handler
|--------------------------------------------------------------------------
|
| Handles file-size and invalid-format errors
| before they appear as generic 500 responses.
|
|--------------------------------------------------------------------------
*/

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Upload middleware error:",
      error
    );

    if (
      error instanceof
      multer.MulterError
    ) {
      return res.status(400).json({
        success: false,
        message:
          error.code ===
          "LIMIT_FILE_SIZE"
            ? "Image size must be less than 10MB"
            : error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Image upload error",
      });
    }

    next();
  }
);

module.exports =
  router;