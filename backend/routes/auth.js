const express = require("express");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const adminAuth =
  require("../middleware/adminAuth");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Login Rate Limiter
|--------------------------------------------------------------------------
*/

const loginLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many login attempts. Please try again later."
    }
  });

/*
|--------------------------------------------------------------------------
| POST /api/auth/login
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  loginLimiter,
  (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      /*
      |--------------------------------------------------------------------------
      | Validation
      |--------------------------------------------------------------------------
      */

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required"
        });
      }

      /*
      |--------------------------------------------------------------------------
      | ENV Credentials
      |--------------------------------------------------------------------------
      */

      const adminEmail =
        process.env.ADMIN_EMAIL;

      const adminPassword =
        process.env.ADMIN_PASSWORD;

      if (
        !adminEmail ||
        !adminPassword
      ) {
        console.error(
          "ADMIN_EMAIL or ADMIN_PASSWORD missing in .env"
        );

        return res.status(500).json({
          success: false,
          message:
            "Admin configuration error"
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Match
      |--------------------------------------------------------------------------
      */

      const emailMatched =
        email
          .trim()
          .toLowerCase() ===
        adminEmail
          .trim()
          .toLowerCase();

      const passwordMatched =
        password ===
        adminPassword;

      if (
        !emailMatched ||
        !passwordMatched
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password"
        });
      }

      /*
      |--------------------------------------------------------------------------
      | JWT
      |--------------------------------------------------------------------------
      */

      const jwtSecret =
        process.env.JWT_SECRET;

      if (!jwtSecret) {
        return res.status(500).json({
          success: false,
          message:
            "JWT_SECRET is missing"
        });
      }

      const token =
        jwt.sign(
          {
            email:
              adminEmail,
            role: "admin"
          },
          jwtSecret,
          {
            expiresIn:
              process.env.JWT_EXPIRES_IN ||
              "8h"
          }
        );

      /*
      |--------------------------------------------------------------------------
      | Cookie
      |--------------------------------------------------------------------------
      */

      const isProduction =
        process.env.NODE_ENV ===
        "production";

      const cookieName =
        process.env.COOKIE_NAME ||
        "bhavya_admin";

      res.cookie(
        cookieName,
        token,
        {
          httpOnly: true,
          secure:
            isProduction,
          sameSite:
            "lax",
          maxAge:
            8 *
            60 *
            60 *
            1000,
          path: "/"
        }
      );

      /*
      |--------------------------------------------------------------------------
      | Success
      |--------------------------------------------------------------------------
      */

      return res.status(200).json({
        success: true,
        message:
          "Login successful",
        admin: {
          email:
            adminEmail,
          role:
            "admin"
        }
      });
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Internal server error"
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/auth/me
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  adminAuth,
  (req, res) => {
    return res.status(200).json({
      success: true,
      admin: {
        email:
          req.admin.email,
        role:
          req.admin.role
      }
    });
  }
);

/*
|--------------------------------------------------------------------------
| GET /api/auth/check
|--------------------------------------------------------------------------
*/

router.get(
  "/check",
  adminAuth,
  (req, res) => {
    return res.status(200).json({
      success: true,
      authenticated:
        true,
      admin: {
        email:
          req.admin.email,
        role:
          req.admin.role
      }
    });
  }
);

/*
|--------------------------------------------------------------------------
| POST /api/auth/logout
|--------------------------------------------------------------------------
*/

router.post(
  "/logout",
  (req, res) => {
    const cookieName =
      process.env.COOKIE_NAME ||
      "bhavya_admin";

    const isProduction =
      process.env.NODE_ENV ===
      "production";

    res.clearCookie(
      cookieName,
      {
        httpOnly: true,
        secure:
          isProduction,
        sameSite:
          "lax",
        path: "/"
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Logged out successfully"
    });
  }
);

module.exports = router;