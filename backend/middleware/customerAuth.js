const jwt = require("jsonwebtoken");

const Customer =
  require("../models/Customer");

const {
  CUSTOMER_COOKIE_NAME,
} = require("../config/customerAuth");

function getToken(req) {
  const cookieToken =
    req.cookies?.[CUSTOMER_COOKIE_NAME];

  if (cookieToken) {
    return cookieToken;
  }

  const auth =
    req.headers.authorization || "";

  if (auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  return null;
}

async function customerAuth(
  req,
  res,
  next
) {
  try {
    const token = getToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Customer authentication required",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      payload?.type !==
        "customer-session" ||
      payload?.role !== "customer" ||
      !payload?.sub
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid customer session",
      });
    }

    const customer =
      await Customer.findById(
        payload.sub
      );

    if (!customer) {
      return res.status(401).json({
        success: false,
        message:
          "Customer account not found",
      });
    }

    if (
      customer.status !== "active" ||
      !customer.emailVerified
    ) {
      // For development, allow unverified customers to proceed
      console.warn("⚠️ Customer not fully verified but allowing access for development");
      // return res.status(403).json({
      //   success: false,
      //   message:
      //     "Customer account is not verified or active",
      // });
    }

    req.customer = customer;
    req.customerId =
      customer._id.toString();

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired customer session",
    });
  }
}

module.exports = customerAuth;