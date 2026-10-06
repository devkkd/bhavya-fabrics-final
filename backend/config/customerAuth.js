const CUSTOMER_COOKIE_NAME =
  process.env.CUSTOMER_COOKIE_NAME ||
  "bhavya_customer";

const CUSTOMER_JWT_EXPIRES_IN =
  process.env.CUSTOMER_JWT_EXPIRES_IN ||
  process.env.JWT_EXPIRES_IN ||
  "8h";

const OTP_EXPIRES_MINUTES = Number(
  process.env.CUSTOMER_OTP_EXPIRES_MINUTES ||
  10
);

const OTP_RESEND_SECONDS = Number(
  process.env.CUSTOMER_OTP_RESEND_SECONDS ||
  60
);

const OTP_MAX_ATTEMPTS = Number(
  process.env.CUSTOMER_OTP_MAX_ATTEMPTS ||
  5
);

const COOKIE_SECURE =
  String(
    process.env.CUSTOMER_COOKIE_SECURE ||
      "false"
  ).toLowerCase() === "true";

const COOKIE_SAME_SITE =
  process.env.CUSTOMER_COOKIE_SAMESITE ||
  (COOKIE_SECURE ? "none" : "lax");

module.exports = {
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_JWT_EXPIRES_IN,
  OTP_EXPIRES_MINUTES,
  OTP_RESEND_SECONDS,
  OTP_MAX_ATTEMPTS,
  COOKIE_SECURE,
  COOKIE_SAME_SITE,
};