const {
  S3Client,
} = require("@aws-sdk/client-s3");

require("dotenv").config();

const required = [
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_R2_ACCESS_KEY_ID",
  "CLOUDFLARE_R2_SECRET_ACCESS_KEY",
  "CLOUDFLARE_R2_BUCKET_NAME",
  "CLOUDFLARE_R2_PUBLIC_URL",
];

const missing =
  required.filter(
    (key) =>
      !process.env[key]
  );

if (missing.length) {
  throw new Error(
    `Missing Cloudflare R2 env variables: ${missing.join(", ")}`
  );
}

const r2Client =
  new S3Client({
    region: "auto",

    endpoint:
      `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,

    credentials: {
      accessKeyId:
        process.env
          .CLOUDFLARE_R2_ACCESS_KEY_ID,

      secretAccessKey:
        process.env
          .CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    },
  });

const R2_BUCKET =
  process.env
    .CLOUDFLARE_R2_BUCKET_NAME;

const R2_PUBLIC_URL =
  process.env
    .CLOUDFLARE_R2_PUBLIC_URL
    .replace(/\/$/, "");

console.log(
  "================================="
);

console.log(
  "Cloudflare R2 Configuration"
);

console.log(
  "================================="
);

console.log(
  "Bucket:",
  R2_BUCKET
);

console.log(
  "Public URL:",
  R2_PUBLIC_URL
);

console.log(
  "Account:",
  process.env
    .CLOUDFLARE_ACCOUNT_ID
    ? "Loaded ✅"
    : "Missing ❌"
);

module.exports = {
  r2Client,
  R2_BUCKET,
  R2_PUBLIC_URL,
};