const CLOUDFLARE_API_BASE =
  "https://api.cloudflare.com/client/v4";

/*
|--------------------------------------------------------------------------
| Environment Validation
|--------------------------------------------------------------------------
*/

const getCloudflareConfig = () => {
  const accountId =
    process.env.CLOUDFLARE_ACCOUNT_ID;

  const apiToken =
    process.env.CLOUDFLARE_API_TOKEN;

  const accountHash =
    process.env.CLOUDFLARE_ACCOUNT_HASH;

  const variant =
    process.env.CLOUDFLARE_IMAGE_VARIANT ||
    "public";

  if (!accountId) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_ID is missing in .env"
    );
  }

  if (!apiToken) {
    throw new Error(
      "CLOUDFLARE_API_TOKEN is missing in .env"
    );
  }

  if (!accountHash) {
    throw new Error(
      "CLOUDFLARE_ACCOUNT_HASH is missing in .env"
    );
  }

  return {
    accountId,
    apiToken,
    accountHash,
    variant
  };
};

/*
|--------------------------------------------------------------------------
| Create Direct Upload URL
|--------------------------------------------------------------------------
|
| POST:
| /accounts/:accountId/images/v2/direct_upload
|
|--------------------------------------------------------------------------
*/

const createDirectUpload = async ({
  metadata = {},
  creator = "admin"
} = {}) => {
  const {
    accountId,
    apiToken
  } = getCloudflareConfig();

  const formData = new FormData();

  /*
  |--------------------------------------------------------------------------
  | Creator
  |--------------------------------------------------------------------------
  */

  if (creator) {
    formData.append(
      "creator",
      String(creator)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Metadata
  |--------------------------------------------------------------------------
  */

  if (
    metadata &&
    typeof metadata === "object"
  ) {
    formData.append(
      "metadata",
      JSON.stringify(metadata)
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Require Signed URLs
  |--------------------------------------------------------------------------
  |
  | Public ecommerce product images ke liye false.
  |
  */

  formData.append(
    "requireSignedURLs",
    "false"
  );

  /*
  |--------------------------------------------------------------------------
  | Request
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiToken}`
        },

        body: formData
      }
    );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.success
  ) {
    const cloudflareMessage =
      data?.errors
        ?.map(
          (error) =>
            error.message
        )
        ?.join(", ");

    throw new Error(
      cloudflareMessage ||
        "Failed to create Cloudflare upload URL"
    );
  }

  const imageId =
    data?.result?.id;

  const uploadURL =
    data?.result?.uploadURL;

  if (!imageId || !uploadURL) {
    throw new Error(
      "Cloudflare returned an invalid upload response"
    );
  }

  return {
    imageId,
    uploadURL
  };
};

/*
|--------------------------------------------------------------------------
| Get Image Details
|--------------------------------------------------------------------------
*/

const getImageDetails =
  async (imageId) => {
    const {
      accountId,
      apiToken
    } = getCloudflareConfig();

    if (!imageId) {
      throw new Error(
        "Cloudflare image ID is required"
      );
    }

    const response =
      await fetch(
        `${CLOUDFLARE_API_BASE}/accounts/${accountId}/images/v1/${encodeURIComponent(imageId)}`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${apiToken}`
          }
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      const message =
        data?.errors
          ?.map(
            (error) =>
              error.message
          )
          ?.join(", ");

      throw new Error(
        message ||
          "Failed to get Cloudflare image details"
      );
    }

    return data.result;
  };

/*
|--------------------------------------------------------------------------
| Delete Image
|--------------------------------------------------------------------------
*/

const deleteImage =
  async (imageId) => {
    const {
      accountId,
      apiToken
    } = getCloudflareConfig();

    if (!imageId) {
      throw new Error(
        "Cloudflare image ID is required"
      );
    }

    const response =
      await fetch(
        `${CLOUDFLARE_API_BASE}/accounts/${accountId}/images/v1/${encodeURIComponent(imageId)}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${apiToken}`
          }
        }
      );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.success
    ) {
      const message =
        data?.errors
          ?.map(
            (error) =>
              error.message
          )
          ?.join(", ");

      throw new Error(
        message ||
          "Failed to delete Cloudflare image"
      );
    }

    return true;
  };

/*
|--------------------------------------------------------------------------
| Build Delivery URL
|--------------------------------------------------------------------------
*/

const getDeliveryUrl =
  (imageId, variant = null) => {
    const {
      accountHash,
      variant:
        defaultVariant
    } = getCloudflareConfig();

    if (!imageId) {
      return "";
    }

    const selectedVariant =
      variant ||
      defaultVariant ||
      "public";

    return (
      `https://imagedelivery.net/` +
      `${accountHash}/` +
      `${imageId}/` +
      `${selectedVariant}`
    );
  };

/*
|--------------------------------------------------------------------------
| Upload to Cloudflare (Buffer Upload)
|--------------------------------------------------------------------------
*/

const uploadToCloudflare = async (buffer, filename) => {
  const { accountId, apiToken } = getCloudflareConfig();

  if (!buffer) {
    throw new Error("Buffer is required for upload");
  }

  try {
    // Use fetch with blob/stream for Node.js 18+
    const response = await fetch(
      `${CLOUDFLARE_API_BASE}/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body: buffer,
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      const message = data?.errors
        ?.map((error) => error.message)
        ?.join(", ");

      throw new Error(
        message || "Failed to upload to Cloudflare"
      );
    }

    const imageId = data?.result?.id;
    const url = getDeliveryUrl(imageId);

    if (!imageId) {
      throw new Error("Cloudflare returned invalid upload response");
    }

    return {
      imageId,
      url,
    };
  } catch (error) {
    console.error("Cloudflare upload error:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| Delete from Cloudflare
|--------------------------------------------------------------------------
*/

const deleteFromCloudflare = async (imageId) => {
  return deleteImage(imageId);
};

module.exports = {
  createDirectUpload,
  getImageDetails,
  deleteImage,
  getDeliveryUrl,
  uploadToCloudflare,
  deleteFromCloudflare
};