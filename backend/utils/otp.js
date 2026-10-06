const crypto = require("crypto");

function generateOtp() {
  return String(
    crypto.randomInt(100000, 1000000)
  );
}

function hashOtp(otp) {
  return crypto
    .createHash("sha256")
    .update(String(otp))
    .digest("hex");
}

function isOtpMatch(otp, storedHash) {
  const candidate = Buffer.from(
    hashOtp(otp),
    "utf8"
  );

  const stored = Buffer.from(
    String(storedHash || ""),
    "utf8"
  );

  if (candidate.length !== stored.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    candidate,
    stored
  );
}

module.exports = {
  generateOtp,
  hashOtp,
  isOtpMatch,
};