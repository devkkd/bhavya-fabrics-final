const jwt = require("jsonwebtoken");

const adminAuth = (
  req,
  res,
  next
) => {
  try {
    const cookieName =
      process.env.COOKIE_NAME ||
      "bhavya_admin";

    const token =
      req.cookies?.[cookieName];

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required"
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    if (
      !decoded ||
      decoded.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required"
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired session"
    });
  }
};

module.exports = adminAuth;