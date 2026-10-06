"use strict";

const express = require("express");
const mongoose = require("mongoose");

const ContactInquiry = require("../models/ContactInquiry.model");
const adminAuth = require("../middleware/adminAuth");

const {
  sendNewInquiryAdminMail,
  sendCustomerAcknowledgement,
  sendAdminReplyToCustomer,
} = require("../services/mailer");

const router = express.Router();

/* =====================================================
   HELPERS
===================================================== */

function cleanString(value, max = 10000) {
  return String(value ?? "")
    .trim()
    .replace(/\u0000/g, "")
    .slice(0, max);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

function normalizeRequestType(value) {
  const type = cleanString(value, 30).toLowerCase();

  return type === "quote"
    ? "quote"
    : "contact";
}

function sanitizeProduct(product) {
  if (!product || typeof product !== "object") {
    return undefined;
  }

  const productId = cleanString(
    product.productId,
    100
  );

  const name = cleanString(
    product.name,
    250
  );

  const slug = cleanString(
    product.slug,
    250
  );

  const sku = cleanString(
    product.sku,
    150
  );

  const variantId = cleanString(
    product.variantId,
    150
  );

  const selectedColor = cleanString(
    product.selectedColor,
    150
  );

  const selectedSize = cleanString(
    product.selectedSize,
    150
  );

  const cleanProduct = {
    productId,
    name,
    slug,
    sku,
    variantId,
    selectedColor,
    selectedSize,
  };

  const hasAnyValue = Object.values(
    cleanProduct
  ).some(Boolean);

  return hasAnyValue
    ? cleanProduct
    : undefined;
}

/* =====================================================
   POST /
   PUBLIC CONTACT / QUOTE FORM
===================================================== */

router.post("/", async (req, res) => {
  try {
    const body = req.body || {};

    const requestType =
      normalizeRequestType(
        body.requestType
      );

    const name = cleanString(
      body.name,
      120
    );

    const company = cleanString(
      body.company,
      160
    );

    const phone = cleanString(
      body.phone,
      40
    );

    const email = cleanString(
      body.email,
      254
    ).toLowerCase();

    const fabric = cleanString(
      body.fabric,
      200
    );

    const city = cleanString(
      body.city,
      160
    );

    const message = cleanString(
      body.message,
      5000
    );

    const source = cleanString(
      body.source || "website",
      100
    );

    const pageUrl = cleanString(
      body.pageUrl,
      1000
    );

    const product = sanitizeProduct(
      body.product
    );

    /* ===============================================
       VALIDATION
    =============================================== */

    if (
      !name ||
      !phone ||
      !email ||
      !fabric ||
      !city
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, phone, email, fabric requirement and city are required.",
      });
    }

    if (!isEmail(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    /* ===============================================
       CREATE INQUIRY
    =============================================== */

    const initialMessage =
      message ||
      (
        requestType === "quote"
          ? `Quote request for ${fabric}`
          : `Contact enquiry for ${fabric}`
      );

    const inquiryData = {
      requestType,

      name,
      company,
      phone,
      email,

      fabric,
      city,
      message,

      source,
      pageUrl,

      status: "new",
      isRead: false,

      messages: [
        {
          sender: "customer",
          body: initialMessage,
          sentBy: name,
        },
      ],
    };

    if (product) {
      inquiryData.product =
        product;
    }

    const inquiry =
      await ContactInquiry.create(
        inquiryData
      );

    /* ===============================================
       SEND ADMIN EMAIL
    =============================================== */

    let adminMailSent = false;

    try {
      await sendNewInquiryAdminMail(
        inquiry
      );

      adminMailSent = true;
    } catch (mailError) {
      console.error(
        "New inquiry admin email failed:",
        mailError?.message ||
          mailError
      );
    }

    /* ===============================================
       SEND CUSTOMER ACKNOWLEDGEMENT
    =============================================== */

    let customerMailSent =
      false;

    try {
      await sendCustomerAcknowledgement(
        inquiry
      );

      customerMailSent = true;
    } catch (mailError) {
      console.error(
        "Customer acknowledgement email failed:",
        mailError?.message ||
          mailError
      );
    }

    /* ===============================================
       RESPONSE
    =============================================== */

    return res.status(201).json({
      success: true,

      message:
        requestType === "quote"
          ? "Your quote request has been sent successfully."
          : "Your enquiry has been sent successfully.",

      data: {
        id: inquiry._id,
        requestType:
          inquiry.requestType,
        status: inquiry.status,
      },

      mail: {
        adminMailSent,
        customerMailSent,
      },
    });
  } catch (error) {
    console.error(
      "Create contact inquiry error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit enquiry. Please try again.",
    });
  }
});

/* =====================================================
   GET /admin
   ADMIN LIST
===================================================== */

router.get(
  "/admin",
  adminAuth,
  async (req, res) => {
    try {
      const page = Math.max(
        Number.parseInt(
          req.query.page,
          10
        ) || 1,
        1
      );

      const limit = Math.min(
        Math.max(
          Number.parseInt(
            req.query.limit,
            10
          ) || 20,
          1
        ),
        100
      );

      const skip =
        (page - 1) * limit;

      const status = cleanString(
        req.query.status,
        40
      );

      const requestType =
        cleanString(
          req.query.requestType,
          30
        ).toLowerCase();

      const search = cleanString(
        req.query.search,
        160
      );

      const filter = {};

      /* STATUS FILTER */

      if (
        [
          "new",
          "in_progress",
          "replied",
          "closed",
        ].includes(status)
      ) {
        filter.status = status;
      }

      /* CONTACT / QUOTE FILTER */

      if (
        ["contact", "quote"].includes(
          requestType
        )
      ) {
        filter.requestType =
          requestType;
      }

      /* SEARCH */

      if (search) {
        filter.$or = [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },

          {
            company: {
              $regex: search,
              $options: "i",
            },
          },

          {
            email: {
              $regex: search,
              $options: "i",
            },
          },

          {
            phone: {
              $regex: search,
              $options: "i",
            },
          },

          {
            fabric: {
              $regex: search,
              $options: "i",
            },
          },

          {
            city: {
              $regex: search,
              $options: "i",
            },
          },

          {
            "product.name": {
              $regex: search,
              $options: "i",
            },
          },

          {
            "product.sku": {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      const [
        items,
        total,
        unreadCount,
      ] = await Promise.all([
        ContactInquiry.find(filter)
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        ContactInquiry.countDocuments(
          filter
        ),

        ContactInquiry.countDocuments({
          isRead: false,
        }),
      ]);

      return res.json({
        success: true,

        data: items,

        pagination: {
          page,
          limit,
          total,
          totalPages:
            Math.max(
              Math.ceil(
                total / limit
              ),
              1
            ),
        },

        unreadCount,
      });
    } catch (error) {
      console.error(
        "List contact inquiries error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch enquiries.",
      });
    }
  }
);

/* =====================================================
   GET /admin/:id
   ADMIN DETAIL
===================================================== */

router.get(
  "/admin/:id",
  adminAuth,
  async (req, res) => {
    try {
      if (
        !isValidId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry id.",
        });
      }

      const inquiry =
        await ContactInquiry.findById(
          req.params.id
        ).lean();

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:
            "Enquiry not found.",
        });
      }

      await ContactInquiry.updateOne(
        {
          _id: inquiry._id,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        }
      );

      return res.json({
        success: true,

        data: {
          ...inquiry,
          isRead: true,
        },
      });
    } catch (error) {
      console.error(
        "Get contact inquiry error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch enquiry.",
      });
    }
  }
);

/* =====================================================
   PATCH /admin/:id/read
===================================================== */

router.patch(
  "/admin/:id/read",
  adminAuth,
  async (req, res) => {
    try {
      if (
        !isValidId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry id.",
        });
      }

      const inquiry =
        await ContactInquiry.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              isRead: true,
              readAt: new Date(),
            },
          },
          {
            new: true,
          }
        ).lean();

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:
            "Enquiry not found.",
        });
      }

      return res.json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      console.error(
        "Mark enquiry read error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update enquiry.",
      });
    }
  }
);

/* =====================================================
   PATCH /admin/:id/status
===================================================== */

router.patch(
  "/admin/:id/status",
  adminAuth,
  async (req, res) => {
    try {
      if (
        !isValidId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry id.",
        });
      }

      const status =
        cleanString(
          req.body?.status,
          30
        );

      const allowedStatuses = [
        "new",
        "in_progress",
        "replied",
        "closed",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry status.",
        });
      }

      const inquiry =
        await ContactInquiry.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              status,
            },
          },
          {
            new: true,
          }
        ).lean();

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:
            "Enquiry not found.",
        });
      }

      return res.json({
        success: true,
        data: inquiry,
      });
    } catch (error) {
      console.error(
        "Update enquiry status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update status.",
      });
    }
  }
);

/* =====================================================
   PATCH /admin/:id/note
   ADMIN NOTE
===================================================== */

router.patch(
  "/admin/:id/note",
  adminAuth,
  async (req, res) => {
    try {
      if (
        !isValidId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry id.",
        });
      }

      const adminNote =
        cleanString(
          req.body?.adminNote,
          5000
        );

      const inquiry =
        await ContactInquiry.findByIdAndUpdate(
          req.params.id,
          {
            $set: {
              adminNote,
            },
          },
          {
            new: true,
          }
        ).lean();

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:
            "Enquiry not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Admin note saved successfully.",
        data: inquiry,
      });
    } catch (error) {
      console.error(
        "Save admin note error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to save admin note.",
      });
    }
  }
);

/* =====================================================
   POST /admin/:id/reply
   ADMIN -> CUSTOMER EMAIL
===================================================== */

router.post(
  "/admin/:id/reply",
  adminAuth,
  async (req, res) => {
    try {
      if (
        !isValidId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry id.",
        });
      }

      const replyMessage =
        cleanString(
          req.body?.message,
          10000
        );

      if (!replyMessage) {
        return res.status(400).json({
          success: false,
          message:
            "Reply message is required.",
        });
      }

      const inquiry =
        await ContactInquiry.findById(
          req.params.id
        );

      if (!inquiry) {
        return res.status(404).json({
          success: false,
          message:
            "Enquiry not found.",
        });
      }

      if (!inquiry.email) {
        return res.status(400).json({
          success: false,
          message:
            "Customer email is missing.",
        });
      }

      /* SEND EMAIL FIRST */

      await sendAdminReplyToCustomer(
        inquiry,
        replyMessage
      );

      /* SAVE MESSAGE */

      const adminName =
        cleanString(
          req.user?.name ||
            req.user?.email ||
            "Admin",
          120
        );

      inquiry.messages.push({
        sender: "admin",
        body: replyMessage,
        sentBy: adminName,
      });

      inquiry.status =
        "replied";

      inquiry.isRead =
        true;

      inquiry.readAt =
        inquiry.readAt ||
        new Date();

      inquiry.lastReplyAt =
        new Date();

      inquiry.lastReplyBy =
        adminName;

      await inquiry.save();

      return res.json({
        success: true,
        message:
          "Reply sent successfully.",
        data: inquiry,
      });
    } catch (error) {
      console.error(
        "Reply to contact inquiry error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Unable to send reply. Please check SMTP configuration.",
      });
    }
  }
);

module.exports = router;