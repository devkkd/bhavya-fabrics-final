const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");

const Customer =
  require("../models/Customer");

const CustomerOtp =
  require("../models/CustomerOtp");

const customerAuth =
  require("../middleware/customerAuth");

const {
  CUSTOMER_COOKIE_NAME,
  CUSTOMER_JWT_EXPIRES_IN,
  OTP_EXPIRES_MINUTES,
  OTP_RESEND_SECONDS,
  OTP_MAX_ATTEMPTS,
  COOKIE_SECURE,
  COOKIE_SAME_SITE,
} =
  require("../config/customerAuth");

const {
  generateOtp,
  hashOtp,
  isOtpMatch,
} =
  require("../utils/otp");

const {
  normalizeEmail,
  normalizePhone,
  parseBirthday,
  sanitizeCustomer,
} =
  require("../utils/customer");

const {
  validatePassword,
} =
  require("../utils/password");

const {
  sendCustomerOtp,
} =
  require("../services/customerMailer");

const router =
  express.Router();

/*
|--------------------------------------------------------------------------
| RATE LIMITERS
|--------------------------------------------------------------------------
*/

const otpLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 10,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      success: false,
      message:
        "Too many OTP requests. Please try again later.",
    },
  });

const loginLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 10,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      success: false,
      message:
        "Too many login attempts. Please try again later.",
    },
  });

/*
|--------------------------------------------------------------------------
| CREATE CUSTOMER TOKEN
|--------------------------------------------------------------------------
*/

function createCustomerToken(
  customer
) {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is missing"
    );
  }

  return jwt.sign(
    {
      sub:
        customer._id.toString(),

      email:
        customer.email,

      role:
        "customer",

      type:
        "customer-session",
    },

    process.env.JWT_SECRET,

    {
      expiresIn:
        CUSTOMER_JWT_EXPIRES_IN,
    }
  );
}

/*
|--------------------------------------------------------------------------
| SET CUSTOMER COOKIE
|--------------------------------------------------------------------------
*/

function setCustomerCookie(
  res,
  customer
) {
  const token =
    createCustomerToken(
      customer
    );

  res.cookie(
    CUSTOMER_COOKIE_NAME,
    token,
    {
      httpOnly: true,

      secure:
        COOKIE_SECURE,

      sameSite:
        COOKIE_SAME_SITE,

      maxAge:
        7 *
        24 *
        60 *
        60 *
        1000,

      path: "/",
    }
  );

  return token;
}

/*
|--------------------------------------------------------------------------
| CLEAR CUSTOMER COOKIE
|--------------------------------------------------------------------------
*/

function clearCustomerCookie(
  res
) {
  res.clearCookie(
    CUSTOMER_COOKIE_NAME,
    {
      httpOnly: true,

      secure:
        COOKIE_SECURE,

      sameSite:
        COOKIE_SAME_SITE,

      path: "/",
    }
  );
}

/*
|--------------------------------------------------------------------------
| ISSUE OTP
|--------------------------------------------------------------------------
*/

async function issueOtp(
  customer,
  purpose
) {
  const now =
    Date.now();

  let record =
    await CustomerOtp.findOne({
      customerId:
        customer._id,

      purpose,
    });

  /*
  |--------------------------------------------------------------------------
  | RESEND COOLDOWN
  |--------------------------------------------------------------------------
  */

  if (record) {
    const elapsed =
      (
        now -
        new Date(
          record.lastSentAt
        ).getTime()
      ) / 1000;

    if (
      elapsed <
      OTP_RESEND_SECONDS
    ) {
      return {
        alreadySent: true,

        wait: Math.ceil(
          OTP_RESEND_SECONDS -
            elapsed
        ),
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | OTP
  |--------------------------------------------------------------------------
  */

  const otp =
    generateOtp();

  if (!record) {
    record =
      new CustomerOtp({
        customerId:
          customer._id,

        email:
          customer.email,

        purpose,
      });
  }

  record.email =
    customer.email;

  record.codeHash =
    hashOtp(otp);

  record.expiresAt =
    new Date(
      now +
        OTP_EXPIRES_MINUTES *
          60 *
          1000
    );

  record.lastSentAt =
    new Date(now);

  record.attempts =
    0;

  record.used =
    false;

  await record.save();

  /*
  |--------------------------------------------------------------------------
  | SEND EMAIL
  |--------------------------------------------------------------------------
  */

  try {
    await sendCustomerOtp({
      to:
        customer.email,

      otp,

      purpose,
    });
  } catch (error) {
    await CustomerOtp.deleteOne({
      _id:
        record._id,
    });

    throw error;
  }

  return {
    alreadySent:
      false,

    wait:
      OTP_RESEND_SECONDS,
  };
}

/*
|--------------------------------------------------------------------------
| VERIFY OTP
|--------------------------------------------------------------------------
*/

async function verifyOtp(
  customer,
  purpose,
  otp
) {
  if (
    !/^\d{6}$/.test(
      String(otp || "")
    )
  ) {
    return {
      ok: false,

      status: 400,

      message:
        "Enter a valid 6-digit OTP",
    };
  }

  const record =
    await CustomerOtp.findOne({
      customerId:
        customer._id,

      purpose,
    });

  if (
    !record ||
    record.used
  ) {
    return {
      ok: false,

      status: 400,

      message:
        "Invalid or expired OTP",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | EXPIRY
  |--------------------------------------------------------------------------
  */

  if (
    new Date(
      record.expiresAt
    ).getTime() <=
    Date.now()
  ) {
    await CustomerOtp.deleteOne({
      _id:
        record._id,
    });

    return {
      ok: false,

      status: 400,

      message:
        "OTP has expired",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | MAX ATTEMPTS
  |--------------------------------------------------------------------------
  */

  if (
    record.attempts >=
    OTP_MAX_ATTEMPTS
  ) {
    await CustomerOtp.deleteOne({
      _id:
        record._id,
    });

    return {
      ok: false,

      status: 429,

      message:
        "Too many incorrect OTP attempts. Please request a new OTP.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | MATCH
  |--------------------------------------------------------------------------
  */

  if (
    !isOtpMatch(
      otp,
      record.codeHash
    )
  ) {
    record.attempts +=
      1;

    await record.save();

    if (
      record.attempts >=
      OTP_MAX_ATTEMPTS
    ) {
      return {
        ok: false,

        status: 429,

        message:
          "Too many incorrect OTP attempts. Please request a new OTP.",
      };
    }

    return {
      ok: false,

      status: 400,

      message:
        "Invalid OTP",
    };
  }

  return {
    ok: true,

    record,
  };
}

/*
|--------------------------------------------------------------------------
| REGISTER VALIDATION
|--------------------------------------------------------------------------
*/

function validateRegistration(
  body
) {
  const name =
    String(
      body?.name || ""
    ).trim();

  const email =
    normalizeEmail(
      body?.email
    );

  const phone =
    normalizePhone(
      body?.phone
    );

  const password =
    String(
      body?.password || ""
    );

  const confirmPassword =
    String(
      body?.confirmPassword ||
        ""
    );

  const gender =
    String(
      body?.gender || ""
    );

  const birthday =
    parseBirthday(
      body?.birthday
    );

  if (
    name.length < 2
  ) {
    return {
      error:
        "Full name is required",
    };
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    )
  ) {
    return {
      error:
        "Valid email address is required",
    };
  }

  const phoneDigits =
    phone.replace(
      /\D/g,
      ""
    );

  if (
    phoneDigits.length < 7 ||
    phoneDigits.length > 15
  ) {
    return {
      error:
        "Valid mobile number is required",
    };
  }

  if (
    !validatePassword(
      password
    )
  ) {
    return {
      error:
        "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
    };
  }

  if (
    password !==
    confirmPassword
  ) {
    return {
      error:
        "Passwords do not match",
    };
  }

  if (
    gender &&
    ![
      "Male",
      "Female",
      "Other",
    ].includes(gender)
  ) {
    return {
      error:
        "Invalid gender value",
    };
  }

  if (
    body?.birthday &&
    !birthday
  ) {
    return {
      error:
        "Invalid birthday",
    };
  }

  return {
    value: {
      name,

      email,

      phone,

      password,

      birthday,

      gender,

      marketingOptIn:
        Boolean(
          body?.subscribe ??
            body?.marketingOptIn
        ),
    },
  };
}

/*
|--------------------------------------------------------------------------
| REGISTER - REQUEST OTP
|--------------------------------------------------------------------------
| POST /api/customer-auth/register/request-otp
|--------------------------------------------------------------------------
*/

router.post(
  "/register/request-otp",
  otpLimiter,
  async (
    req,
    res
  ) => {
    try {
      const validation =
        validateRegistration(
          req.body
        );

      if (
        validation.error
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              validation.error,
          });
      }

      const {
        name,
        email,
        phone,
        password,
        birthday,
        gender,
        marketingOptIn,
      } =
        validation.value;

      /*
      |--------------------------------------------------------------------------
      | ADMIN EMAIL PROTECTION
      |--------------------------------------------------------------------------
      */

      if (
        process.env.ADMIN_EMAIL &&
        email ===
          String(
            process.env
              .ADMIN_EMAIL
          )
            .trim()
            .toLowerCase()
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "This email is reserved for administration",
          });
      }

      /*
      |--------------------------------------------------------------------------
      | EXISTING CUSTOMER
      |--------------------------------------------------------------------------
      */

      let customer =
        await Customer.findOne({
          email,
        }).select(
          "+passwordHash"
        );

      /*
      |--------------------------------------------------------------------------
      | ACTIVE CUSTOMER
      |--------------------------------------------------------------------------
      */

      if (
        customer &&
        customer.emailVerified &&
        customer.status ===
          "active"
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "An account with this email already exists. Please login.",
          });
      }

      /*
      |--------------------------------------------------------------------------
      | PASSWORD HASH
      |--------------------------------------------------------------------------
      */

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      /*
      |--------------------------------------------------------------------------
      | CREATE
      |--------------------------------------------------------------------------
      */

      if (!customer) {
        customer =
          new Customer({
            name,

            email,

            phone,

            birthday,

            gender,

            passwordHash,

            role:
              "customer",

            emailVerified:
              false,

            status:
              "pending",

            marketingOptIn,
          });
      }

      /*
      |--------------------------------------------------------------------------
      | UPDATE PENDING ACCOUNT
      |--------------------------------------------------------------------------
      */

      else {
        customer.name =
          name;

        customer.phone =
          phone;

        customer.birthday =
          birthday;

        customer.gender =
          gender;

        customer.passwordHash =
          passwordHash;

        customer.emailVerified =
          false;

        customer.status =
          "pending";

        customer.marketingOptIn =
          marketingOptIn;
      }

      await customer.save();

      /*
      |--------------------------------------------------------------------------
      | SEND OTP
      |--------------------------------------------------------------------------
      */

      const otpResult =
        await issueOtp(
          customer,
          "signup"
        );

      return res.json({
        success: true,

        message:
          otpResult.alreadySent
            ? `OTP already sent. Please wait ${otpResult.wait} seconds.`
            : "Verification OTP sent to your email.",

        requiresOtp:
          true,

        email:
          customer.email,

        resendAfterSeconds:
          otpResult.wait,
      });
    } catch (error) {
      console.error(
        "Customer Register Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error.message ||
            "Unable to create customer account",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| REGISTER - VERIFY OTP
|--------------------------------------------------------------------------
| POST /api/customer-auth/register/verify-otp
|--------------------------------------------------------------------------
*/

router.post(
  "/register/verify-otp",
  loginLimiter,
  async (
    req,
    res
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      const otp =
        String(
          req.body?.otp ||
            ""
        ).trim();

      const customer =
        await Customer.findOne({
          email,
        });

      if (!customer) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Customer account not found",
          });
      }

      const result =
        await verifyOtp(
          customer,

          "signup",

          otp
        );

      if (
        !result.ok
      ) {
        return res
          .status(
            result.status
          )
          .json({
            success: false,

            message:
              result.message,
          });
      }

      /*
      |--------------------------------------------------------------------------
      | ACTIVATE
      |--------------------------------------------------------------------------
      */

      customer.emailVerified =
        true;

      customer.status =
        "active";

      customer.lastLoginAt =
        new Date();

      await customer.save();

      /*
      |--------------------------------------------------------------------------
      | DELETE OTP
      |--------------------------------------------------------------------------
      */

      await CustomerOtp.deleteOne({
        _id:
          result.record._id,
      });

      /*
      |--------------------------------------------------------------------------
      | AUTO LOGIN
      |--------------------------------------------------------------------------
      */

      setCustomerCookie(
        res,
        customer
      );

      return res.json({
        success: true,

        message:
          "Account verified successfully",

        user:
          sanitizeCustomer(
            customer
          ),
      });
    } catch (error) {
      console.error(
        "Register OTP Verify Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "OTP verification failed",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| PASSWORD LOGIN
|--------------------------------------------------------------------------
| POST /api/customer-auth/login
|--------------------------------------------------------------------------
*/

router.post(
  "/login",
  loginLimiter,
  async (
    req,
    res
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      const password =
        String(
          req.body?.password ||
            ""
        );

      if (
        !email ||
        !password
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email and password are required",
          });
      }

      const customer =
        await Customer.findOne({
          email,
        }).select(
          "+passwordHash"
        );

      if (!customer) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid email or password",
          });
      }

      if (
        customer.status ===
        "blocked"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Your account has been blocked",
          });
      }

      if (
        !customer.emailVerified ||
        customer.status !==
          "active"
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Please verify your account before login",
          });
      }

      const valid =
        await bcrypt.compare(
          password,

          customer.passwordHash
        );

      if (!valid) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid email or password",
          });
      }

      customer.lastLoginAt =
        new Date();

      await customer.save();

      setCustomerCookie(
        res,
        customer
      );

      return res.json({
        success: true,

        message:
          "Login successful",

        user:
          sanitizeCustomer(
            customer
          ),
      });
    } catch (error) {
      console.error(
        "Customer Login Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Customer login failed",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| OTP LOGIN - REQUEST OTP
|--------------------------------------------------------------------------
| POST /api/customer-auth/login/request-otp
|--------------------------------------------------------------------------
*/

router.post(
  "/login/request-otp",
  otpLimiter,
  async (
    req,
    res
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Valid email address is required",
          });
      }

      const customer =
        await Customer.findOne({
          email,
        });

      /*
      |--------------------------------------------------------------------------
      | GENERIC RESPONSE
      |--------------------------------------------------------------------------
      */

      if (
        !customer ||
        !customer.emailVerified ||
        customer.status !==
          "active"
      ) {
        return res.json({
          success: true,

          message:
            "If a verified account exists for this email, a login OTP has been sent.",
        });
      }

      if (
        customer.status ===
        "blocked"
      ) {
        return res.json({
          success: true,

          message:
            "If a verified account exists for this email, a login OTP has been sent.",
        });
      }

      const result =
        await issueOtp(
          customer,
          "login"
        );

      return res.json({
        success: true,

        message:
          result.alreadySent
            ? `OTP already sent. Please wait ${result.wait} seconds.`
            : "Login OTP sent to your email.",

        resendAfterSeconds:
          result.wait,
      });
    } catch (error) {
      console.error(
        "Login OTP Request Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to send login OTP",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| OTP LOGIN - VERIFY
|--------------------------------------------------------------------------
| POST /api/customer-auth/login/verify-otp
|--------------------------------------------------------------------------
*/

router.post(
  "/login/verify-otp",
  loginLimiter,
  async (
    req,
    res
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      const otp =
        String(
          req.body?.otp ||
            ""
        ).trim();

      const customer =
        await Customer.findOne({
          email,
        });

      if (
        !customer ||
        !customer.emailVerified ||
        customer.status !==
          "active"
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid or expired OTP",
          });
      }

      const result =
        await verifyOtp(
          customer,

          "login",

          otp
        );

      if (
        !result.ok
      ) {
        return res
          .status(
            result.status
          )
          .json({
            success: false,

            message:
              result.message,
          });
      }

      await CustomerOtp.deleteOne({
        _id:
          result.record._id,
      });

      customer.lastLoginAt =
        new Date();

      await customer.save();

      setCustomerCookie(
        res,
        customer
      );

      return res.json({
        success: true,

        message:
          "OTP login successful",

        user:
          sanitizeCustomer(
            customer
          ),
      });
    } catch (error) {
      console.error(
        "OTP Login Verify Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "OTP login failed",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD - REQUEST OTP
|--------------------------------------------------------------------------
| POST /api/customer-auth/forgot-password/request-otp
|--------------------------------------------------------------------------
*/

router.post(
  "/forgot-password/request-otp",
  otpLimiter,
  async (
    req,
    res
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      if (
        !email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Valid email address is required",
          });
      }

      const customer =
        await Customer.findOne({
          email,
        });

      /*
      |--------------------------------------------------------------------------
      | GENERIC RESPONSE
      |--------------------------------------------------------------------------
      */

      if (
        !customer ||
        !customer.emailVerified ||
        customer.status !==
          "active"
      ) {
        return res.json({
          success: true,

          message:
            "If a verified account exists for this email, a password reset OTP has been sent.",
        });
      }

      const result =
        await issueOtp(
          customer,

          "forgot-password"
        );

      return res.json({
        success: true,

        message:
          result.alreadySent
            ? `OTP already sent. Please wait ${result.wait} seconds.`
            : "Password reset OTP sent to your email.",

        resendAfterSeconds:
          result.wait,
      });
    } catch (error) {
      console.error(
        "Forgot Password OTP Request Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to send reset OTP",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD - VERIFY OTP
|--------------------------------------------------------------------------
| POST /api/customer-auth/forgot-password/verify-otp
|--------------------------------------------------------------------------
*/

router.post(
  "/forgot-password/verify-otp",
  loginLimiter,
  async (
    req,
    res
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      const otp =
        String(
          req.body?.otp ||
            ""
        ).trim();

      const customer =
        await Customer.findOne({
          email,
        });

      if (
        !customer ||
        !customer.emailVerified ||
        customer.status !==
          "active"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid or expired OTP",
          });
      }

      const result =
        await verifyOtp(
          customer,

          "forgot-password",

          otp
        );

      if (
        !result.ok
      ) {
        return res
          .status(
            result.status
          )
          .json({
            success: false,

            message:
              result.message,
          });
      }

      await CustomerOtp.deleteOne({
        _id:
          result.record._id,
      });

      /*
      |--------------------------------------------------------------------------
      | RESET TOKEN
      |--------------------------------------------------------------------------
      */

      const resetToken =
        jwt.sign(
          {
            sub:
              customer._id.toString(),

            role:
              "customer",

            type:
              "password-reset",
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "10m",
          }
        );

      return res.json({
        success: true,

        message:
          "OTP verified successfully",

        resetToken,
      });
    } catch (error) {
      console.error(
        "Forgot Password Verify Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to verify reset OTP",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| FORGOT PASSWORD - RESET
|--------------------------------------------------------------------------
| POST /api/customer-auth/forgot-password/reset
|--------------------------------------------------------------------------
*/

router.post(
  "/forgot-password/reset",
  loginLimiter,
  async (
    req,
    res
  ) => {
    try {
      const resetToken =
        String(
          req.body?.resetToken ||
            ""
        );

      const newPassword =
        String(
          req.body?.newPassword ||
            ""
        );

      const confirmPassword =
        String(
          req.body
            ?.confirmPassword ||
            ""
        );

      if (
        !resetToken
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Reset token is required",
          });
      }

      if (
        !validatePassword(
          newPassword
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Password must contain at least 8 characters, uppercase, lowercase, number and special character",
          });
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Passwords do not match",
          });
      }

      let payload;

      try {
        payload =
          jwt.verify(
            resetToken,

            process.env
              .JWT_SECRET
          );
      } catch {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Reset token is invalid or expired",
          });
      }

      if (
        payload?.type !==
          "password-reset" ||
        payload?.role !==
          "customer" ||
        !payload?.sub
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Invalid password reset token",
          });
      }

      const customer =
        await Customer.findById(
          payload.sub
        ).select(
          "+passwordHash"
        );

      if (
        !customer ||
        !customer.emailVerified ||
        customer.status !==
          "active"
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Customer account is not active",
          });
      }

      customer.passwordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      await customer.save();

      /*
      |--------------------------------------------------------------------------
      | LOGOUT OLD SESSION
      |--------------------------------------------------------------------------
      */

      clearCustomerCookie(
        res
      );

      return res.json({
        success: true,

        message:
          "Password updated successfully. Please login again.",
      });
    } catch (error) {
      console.error(
        "Reset Password Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to reset password",
        });
    }
  }
);

/*
|--------------------------------------------------------------------------
| CURRENT CUSTOMER
|--------------------------------------------------------------------------
| GET /api/customer-auth/me
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  customerAuth,
  async (
    req,
    res
  ) => {
    return res.json({
      success: true,

      user:
        sanitizeCustomer(
          req.customer
        ),
    });
  }
);

/*
|--------------------------------------------------------------------------
| CUSTOMER LOGOUT
|--------------------------------------------------------------------------
| POST /api/customer-auth/logout
|--------------------------------------------------------------------------
*/

router.post(
  "/logout",
  (
    req,
    res
  ) => {
    clearCustomerCookie(
      res
    );

    return res.json({
      success: true,

      message:
        "Logged out successfully",
    });
  }
);

module.exports = router;