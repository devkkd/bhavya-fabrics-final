"use strict";

const express = require("express");
const mongoose = require("mongoose");

const Product                = require("../models/Product");
const SaleSetting            = require("../models/SaleSetting");
const SaleNotifySubscriber   = require("../models/SaleNotifySubscriber");
const adminAuth              = require("../middleware/adminAuth");
const { sendCustomerOtp }    = require("../services/customerMailer"); // reuse transporter

const router = express.Router();

const SALE_SETTING_KEY = "main";

/* =========================================================
   EMAIL HELPER  —  reuses the same nodemailer transporter
========================================================= */

async function sendSaleEmail({ to, subject, html, text }) {
  const nodemailer = require("nodemailer");

  const host   = process.env.SMTP_HOST  || "";
  const port   = Number(process.env.SMTP_PORT || 587);
  const user   = process.env.SMTP_USER  || "";
  const pass   = process.env.SMTP_PASS  || "";
  const from   = process.env.SMTP_FROM  || user;
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true" || port === 465;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured in .env");
  }

  const transport = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return transport.sendMail({ from, to, subject, html, text });
}

/* =========================================================
   EMAIL TEMPLATES
========================================================= */

function buildSaleNotifyEmail({ saleDate, customMessage, type, saleTitle }) {
  const title = saleTitle || "Special Offer";
  const formattedDate = saleDate
    ? new Date(saleDate).toLocaleString("en-IN", {
        dateStyle: "long", timeStyle: "short",
      })
    : null;

  const autoBody = formattedDate
    ? `Our exclusive <strong>${title}</strong> goes live on <strong>${formattedDate}</strong>. Be the first to grab premium fabrics at unbeatable prices!`
    : `Our exclusive <strong>${title}</strong> is coming soon. Be the first to grab premium fabrics at unbeatable prices!`;

  const bodyHtml = type === "custom" && customMessage
    ? customMessage.replace(/\n/g, "<br>")
    : autoBody;

  const bodyText = type === "custom" && customMessage
    ? customMessage
    : `Our ${title} goes live on ${formattedDate || "soon"}. Visit bhavyafabrics.com/sale`;

  return {
    subject: `🎉 Bhavya Fabrics ${title} is Coming — You're on the List!`,
    text: bodyText,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,sans-serif;color:#2f2a25;">
<div style="max-width:620px;margin:40px auto;padding:20px;">
<div style="background:#ffffff;border:1px solid #e7e0d7;border-radius:18px;overflow:hidden;">

  <!-- header bar -->
  <div style="background:#295C65;padding:28px 36px;">
    <div style="font-family:Georgia,serif;font-size:26px;color:#fff;letter-spacing:1px;">BHAVYA FABRICS</div>
    <div style="font-size:11px;color:#a8d4d8;letter-spacing:2px;margin-top:4px;">PREMIUM TEXTILE MANUFACTURER</div>
  </div>

  <!-- body -->
  <div style="padding:36px;">

    <div style="display:inline-block;background:#BE9D6B22;border:1px solid #BE9D6B55;border-radius:999px;padding:5px 14px;font-size:11px;font-weight:700;color:#BE9D6B;letter-spacing:1.5px;margin-bottom:18px;">
      ${title.toUpperCase()}
    </div>

    <h1 style="font-family:Georgia,serif;font-weight:600;font-size:30px;color:#295C65;margin:0 0 14px;">
      ${title} is Coming Soon ✨
    </h1>

    <p style="font-size:15px;line-height:1.8;color:#5f5a54;margin:0 0 22px;">
      ${bodyHtml}
    </p>

    ${formattedDate ? `
    <div style="background:#FAF8F5;border:1px solid #E7E0D7;border-radius:12px;padding:18px 22px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#9aabae;letter-spacing:1px;margin-bottom:6px;">SALE STARTS</div>
      <div style="font-size:20px;font-weight:700;color:#295C65;font-family:Georgia,serif;">${formattedDate}</div>
    </div>` : ""}

    <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/sale"
       style="display:inline-block;background:#295C65;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-size:13px;font-weight:700;letter-spacing:0.5px;">
      View the Sale →
    </a>

    <p style="font-size:12px;color:#9aabae;margin-top:28px;line-height:1.6;">
      You're receiving this because you subscribed to sale alerts on Bhavya Fabrics.<br>
      If you didn't subscribe, please ignore this email.
    </p>

  </div>

  <!-- footer -->
  <div style="background:#F7F3EF;padding:16px 36px;border-top:1px solid #e7e0d7;">
    <p style="margin:0;font-size:11px;color:#aaa8a4;">Bhavya Fabrics — Premium Textile Manufacturer</p>
  </div>

</div>
</div>
</body>
</html>`,
  };
}

function buildSaleLiveEmail({ customMessage, type, productCount, saleTitle }) {
  const title    = saleTitle || "Special Offer";
  const autoBody = `🎉 The wait is over! Our <strong>${title}</strong> is <strong>LIVE right now</strong>. Shop ${productCount > 0 ? productCount + " sale products" : "exclusive deals"} on premium fabrics before they sell out!`;

  const bodyHtml = type === "custom" && customMessage
    ? customMessage.replace(/\n/g, "<br>")
    : autoBody;

  const bodyText = type === "custom" && customMessage
    ? customMessage
    : `The ${title} is LIVE! Visit bhavyafabrics.com/sale now.`;

  return {
    subject: `🔴 LIVE NOW — Bhavya Fabrics ${title} Has Started!`,
    text: bodyText,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,sans-serif;color:#2f2a25;">
<div style="max-width:620px;margin:40px auto;padding:20px;">
<div style="background:#ffffff;border:1px solid #e7e0d7;border-radius:18px;overflow:hidden;">

  <!-- header bar -->
  <div style="background:linear-gradient(135deg,#295C65,#1a3d43);padding:28px 36px;">
    <div style="font-family:Georgia,serif;font-size:26px;color:#fff;letter-spacing:1px;">BHAVYA FABRICS</div>
    <div style="font-size:11px;color:#a8d4d8;letter-spacing:2px;margin-top:4px;">PREMIUM TEXTILE MANUFACTURER</div>
  </div>

  <!-- live badge -->
  <div style="background:#b83c30;padding:10px 36px;display:flex;align-items:center;gap:10px;">
    <span style="display:inline-block;width:10px;height:10px;background:#fff;border-radius:50%;animation:pulse 1s infinite;"></span>
    <span style="font-size:13px;font-weight:700;color:#fff;letter-spacing:2px;">SALE IS LIVE NOW</span>
  </div>

  <!-- body -->
  <div style="padding:36px;">

    <h1 style="font-family:Georgia,serif;font-weight:600;font-size:30px;color:#295C65;margin:0 0 14px;">
      ${title} Has Started! 🎉
    </h1>

    <p style="font-size:15px;line-height:1.8;color:#5f5a54;margin:0 0 24px;">
      ${bodyHtml}
    </p>

    <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/sale"
       style="display:inline-block;background:#b83c30;color:#fff;text-decoration:none;padding:14px 36px;border-radius:999px;font-size:14px;font-weight:700;letter-spacing:0.5px;">
      Shop the Sale Now →
    </a>

    <p style="font-size:12px;color:#9aabae;margin-top:28px;line-height:1.6;">
      You're receiving this because you subscribed to sale alerts on Bhavya Fabrics.
    </p>
  </div>

  <div style="background:#F7F3EF;padding:16px 36px;border-top:1px solid #e7e0d7;">
    <p style="margin:0;font-size:11px;color:#aaa8a4;">Bhavya Fabrics — Premium Textile Manufacturer</p>
  </div>

</div>
</div>
</body>
</html>`,
  };
}

/* =========================================================
   HELPERS
========================================================= */

async function getSaleSetting() {
  const setting = await SaleSetting.findOne({ key: SALE_SETTING_KEY }).lean();
  if (setting) return setting;
  return {
    key: SALE_SETTING_KEY,
    countdownEnabled: false,
    countdownDate: null,
    desktopHeroImage: "",
    mobileHeroImage: "",
    notifyMessageType: "auto",
    notifyMessage: "",
    saleTitle: "",
    autoBlastOnExpiry: false,
    autoBlastFiredFor: "",
  };
}

async function getActiveSaleProducts() {
  const now = new Date();
  return Product.find({
    status: "published",
    showOnSale: true,
    $or: [
      { "saleManagement.expiresAt": null },
      { "saleManagement.expiresAt": { $exists: false } },
      { "saleManagement.expiresAt": { $gt: now } },
    ],
  })
    .populate("category",    "name slug")
    .populate("subCategory", "name slug")
    .sort({ createdAt: -1 })
    .lean();
}

function buildSaleState(setting, products) {
  const now           = new Date();
  const hasProducts   = products.length > 0;
  const countdownDate = setting?.countdownDate ? new Date(setting.countdownDate) : null;

  const countdownActive =
    !hasProducts &&
    Boolean(setting?.countdownEnabled) &&
    countdownDate &&
    countdownDate.getTime() > now.getTime();

  const isLive  = hasProducts;
  let state     = "empty";
  if (isLive)            state = "live";
  else if (countdownActive) state = "countdown";

  const remainingSeconds = countdownActive
    ? Math.max(0, Math.ceil((countdownDate.getTime() - now.getTime()) / 1000))
    : 0;

  return {
    state, isLive, hasProducts,
    productCount: products.length,
    countdownActive: Boolean(countdownActive),
    countdownDate: countdownActive ? countdownDate : null,
    remainingSeconds,
    serverTime: now,
  };
}

/* =========================================================
   BLAST HELPER  —  send to all un-notified subscribers
   emailType: "notify" (coming-soon) | "live" (sale started)
========================================================= */

async function blastSubscribers({ setting, emailType, productCount = 0 }) {
  const currentSaleKey = setting?.countdownDate
    ? new Date(setting.countdownDate).toISOString()
    : "open";

  /* only blast subscribers who signed up for this exact sale */
  const subscribers = await SaleNotifySubscriber.find({
    subscribedForSale: currentSaleKey,
  }).lean();

  if (!subscribers.length) return { sent: 0, failed: 0, total: 0 };

  const type    = setting?.notifyMessageType || "auto";
  const message = setting?.notifyMessage     || "";
  const title   = setting?.saleTitle         || "";

  const template =
    emailType === "live"
      ? buildSaleLiveEmail({ customMessage: message, type, productCount, saleTitle: title })
      : buildSaleNotifyEmail({
          saleDate:      setting?.countdownDate || null,
          customMessage: message,
          type,
          saleTitle:     title,
        });

  let sent = 0, failed = 0;
  const saleKey = setting?.countdownDate
    ? new Date(setting.countdownDate).toISOString()
    : new Date().toISOString();

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      try {
        await sendSaleEmail({ to: sub.email, ...template });
        await SaleNotifySubscriber.updateOne(
          { _id: sub._id },
          { $set: { notifiedAt: new Date(), notifiedForSale: saleKey } }
        );
        sent++;
      } catch {
        failed++;
      }
    })
  );

  return { sent, failed, total: subscribers.length };
}

/* =========================================================
   PUBLIC — GET /api/sale
========================================================= */

router.get("/", async (req, res) => {
  try {
    const [setting, products] = await Promise.all([getSaleSetting(), getActiveSaleProducts()]);
    const saleState = buildSaleState(setting, products);

    return res.json({
      success: true,
      sale: {
        state:              saleState.state,
        isLive:             saleState.isLive,
        hasProducts:        saleState.hasProducts,
        productCount:       saleState.productCount,
        countdownActive:    saleState.countdownActive,
        countdownDate:      saleState.countdownDate,
        remainingSeconds:   saleState.remainingSeconds,
        countdownEnabled:   Boolean(setting?.countdownEnabled),
        desktopHeroImage:   setting?.desktopHeroImage || "",
        mobileHeroImage:    setting?.mobileHeroImage  || "",
        saleTitle:          setting?.saleTitle         || "",
        serverTime:         saleState.serverTime,
      },
      products,
    });
  } catch (error) {
    console.error("GET /api/sale error:", error);
    return res.status(500).json({ success: false, message: "Failed to load sale data" });
  }
});

/* =========================================================
   PUBLIC — POST /api/sale/notify-subscribe
   Body: { email }
   Per-sale duplicate protection — same email can re-subscribe
   when a new sale (different countdownDate) is set.
========================================================= */

router.post("/notify-subscribe", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email address is required." });
    }

    /* current sale key = countdownDate ISO (or "open" if no date set) */
    const setting = await getSaleSetting();
    const currentSaleKey = setting?.countdownDate
      ? new Date(setting.countdownDate).toISOString()
      : "open";

    /* find existing subscriber */
    const existing = await SaleNotifySubscriber.findOne({ email });

    if (existing) {
      if (existing.subscribedForSale === currentSaleKey) {
        /* already subscribed for THIS exact sale */
        return res.json({
          success:            true,
          alreadySubscribed:  true,
          message:            "You're already subscribed for this sale! We'll notify you when it goes live.",
        });
      }

      /* subscriber exists but for a different/old sale → re-subscribe for new sale */
      existing.subscribedForSale = currentSaleKey;
      existing.notifiedAt        = null;   // reset so they get the new blast too
      existing.notifiedForSale   = "";
      await existing.save();
    } else {
      /* brand new subscriber */
      await SaleNotifySubscriber.create({ email, subscribedForSale: currentSaleKey });
    }

    return res.json({
      success:           true,
      alreadySubscribed: false,
      message:           "You're on the list! We'll notify you when the sale goes live.",
      saleKey:           currentSaleKey,
    });
  } catch (error) {
    console.error("notify-subscribe error:", error);
    return res.status(500).json({ success: false, message: "Failed to subscribe. Please try again." });
  }
});

/* =========================================================
   PUBLIC — GET /api/sale/notify-status?email=xxx
   Returns whether this email is already subscribed for current sale.
========================================================= */

router.get("/notify-status", async (req, res) => {
  try {
    const email = String(req.query?.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({ success: true, subscribed: false, saleKey: "" });
    }

    const setting        = await getSaleSetting();
    const currentSaleKey = setting?.countdownDate
      ? new Date(setting.countdownDate).toISOString()
      : "open";

    const existing = await SaleNotifySubscriber.findOne({ email });

    const subscribed =
      !!existing && existing.subscribedForSale === currentSaleKey;

    return res.json({
      success:   true,
      subscribed,
      saleKey:   currentSaleKey,
    });
  } catch (error) {
    console.error("notify-status error:", error);
    return res.status(500).json({ success: false, subscribed: false });
  }
});

/* =========================================================
   ADMIN — GET /api/sale/admin
========================================================= */

router.get("/admin", adminAuth, async (req, res) => {
  try {
    const [setting, products] = await Promise.all([getSaleSetting(), getActiveSaleProducts()]);
    const saleState = buildSaleState(setting, products);

    /* subscriber stats */
    const [subscriberCount, notifiedCount] = await Promise.all([
      SaleNotifySubscriber.countDocuments({}),
      SaleNotifySubscriber.countDocuments({ notifiedAt: { $ne: null } }),
    ]);

    return res.json({
      success: true,
      settings: {
        countdownEnabled:   Boolean(setting?.countdownEnabled),
        countdownDate:      setting?.countdownDate || null,
        desktopHeroImage:   setting?.desktopHeroImage || "",
        mobileHeroImage:    setting?.mobileHeroImage  || "",
        notifyMessageType:  setting?.notifyMessageType || "auto",
        notifyMessage:      setting?.notifyMessage     || "",
        autoBlastOnExpiry:  Boolean(setting?.autoBlastOnExpiry),
        saleTitle:          setting?.saleTitle         || "",
      },
      sale: {
        state:            saleState.state,
        isLive:           saleState.isLive,
        hasProducts:      saleState.hasProducts,
        productCount:     saleState.productCount,
        countdownActive:  saleState.countdownActive,
        countdownDate:    saleState.countdownDate,
        remainingSeconds: saleState.remainingSeconds,
        serverTime:       saleState.serverTime,
      },
      subscribers: {
        total:    subscriberCount,
        notified: notifiedCount,
        pending:  subscriberCount - notifiedCount,
      },
      products,
    });
  } catch (error) {
    console.error("GET /api/sale/admin error:", error);
    return res.status(500).json({ success: false, message: "Failed to load sale admin data" });
  }
});

/* =========================================================
   ADMIN — PUT /api/sale/admin/settings
   Body: { countdownEnabled, countdownDate, desktopHeroImage,
           mobileHeroImage, notifyMessageType, notifyMessage,
           sendNotifyNow }   ← sendNotifyNow = boolean
========================================================= */

router.put("/admin/settings", adminAuth, async (req, res) => {
  try {
    const {
      countdownEnabled,
      countdownDate,
      desktopHeroImage,
      mobileHeroImage,
      notifyMessageType,
      notifyMessage,
      sendNotifyNow,    // admin ne checkbox tikaya
      saleTitle,
    } = req.body || {};

    const enabled = Boolean(countdownEnabled);

    let parsedDate = null;
    if (countdownDate !== null && countdownDate !== undefined && countdownDate !== "") {
      parsedDate = new Date(countdownDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid countdown date/time." });
      }
    }

    if (enabled && !parsedDate) {
      return res.status(400).json({ success: false, message: "Countdown date/time is required when timer is enabled." });
    }

    if (enabled && parsedDate && parsedDate.getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: "Countdown date/time must be in the future." });
    }

    const msgType = ["auto", "custom"].includes(notifyMessageType) ? notifyMessageType : "auto";
    const cleanTitle = String(saleTitle || "").trim().slice(0, 120);

    /* ── detect if countdownDate changed → auto-reset subscribers ── */
    const prevSetting = await SaleSetting.findOne({ key: SALE_SETTING_KEY }).lean();
    const prevDateISO = prevSetting?.countdownDate
      ? new Date(prevSetting.countdownDate).toISOString()
      : "";
    const newDateISO = parsedDate ? parsedDate.toISOString() : "";
    const dateChanged = newDateISO && newDateISO !== prevDateISO;

    if (dateChanged) {
      /* New sale → reset all subscribers so they can re-subscribe */
      await SaleNotifySubscriber.updateMany(
        {},
        { $set: { subscribedForSale: "", notifiedAt: null, notifiedForSale: "" } }
      );
      console.log(`[Sale] New countdownDate set (${newDateISO}) — all subscribers reset.`);
    }

    const setting = await SaleSetting.findOneAndUpdate(
      { key: SALE_SETTING_KEY },
      {
        $set: {
          countdownEnabled: enabled,
          countdownDate:    parsedDate,
          desktopHeroImage: typeof desktopHeroImage === "string" ? desktopHeroImage.trim() : "",
          mobileHeroImage:  typeof mobileHeroImage  === "string" ? mobileHeroImage.trim()  : "",
          notifyMessageType: msgType,
          notifyMessage:     String(notifyMessage || "").trim(),
          saleTitle:         cleanTitle,
          /* save the admin's intent — watcher will fire when timer expires */
          autoBlastOnExpiry: Boolean(sendNotifyNow),
          /* reset firedFor when date changes so watcher can re-fire */
          ...(dateChanged ? { autoBlastFiredFor: "" } : {}),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).lean();

    /* ── Auto-blast if admin checked "Send notify now" ── */
    let blastResult = null;
    if (sendNotifyNow) {
      try {
        blastResult = await blastSubscribers({ setting, emailType: "notify" });
      } catch (blastErr) {
        console.error("Blast error:", blastErr);
      }
    }

    return res.json({
      success: true,
      message: dateChanged
        ? "New sale created. All subscribers reset — they can re-subscribe for this sale."
        : "Sale settings saved successfully.",
      settings: {
        countdownEnabled:  Boolean(setting?.countdownEnabled),
        countdownDate:     setting?.countdownDate || null,
        desktopHeroImage:  setting?.desktopHeroImage || "",
        mobileHeroImage:   setting?.mobileHeroImage  || "",
        notifyMessageType: setting?.notifyMessageType || "auto",
        notifyMessage:     setting?.notifyMessage     || "",
        saleTitle:         setting?.saleTitle         || "",
        autoBlastOnExpiry: Boolean(setting?.autoBlastOnExpiry),
      },
      subscribersReset: dateChanged,
      blast: blastResult,
    });
  } catch (error) {
    console.error("PUT /api/sale/admin/settings error:", error);
    return res.status(500).json({ success: false, message: "Failed to update sale settings" });
  }
});

/* =========================================================
   ADMIN — POST /api/sale/admin/reset-subscribers
   Resets subscribedForSale + notifiedAt for ALL subscribers
   so they can re-subscribe for the next sale campaign.
========================================================= */

router.post("/admin/reset-subscribers", adminAuth, async (req, res) => {
  try {
    const result = await SaleNotifySubscriber.updateMany(
      {},
      {
        $set: {
          subscribedForSale: "",
          notifiedAt:        null,
          notifiedForSale:   "",
        },
      }
    );

    return res.json({
      success: true,
      message: `${result.modifiedCount} subscriber${result.modifiedCount !== 1 ? "s" : ""} reset. They can now subscribe for the next sale.`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("reset-subscribers error:", error);
    return res.status(500).json({ success: false, message: "Failed to reset subscribers." });
  }
});

/* =========================================================
   ADMIN — POST /api/sale/admin/send-notify
   Manual blast button — admin can send at any time
   Body: { emailType }  "notify" | "live"
========================================================= */

router.post("/admin/send-notify", adminAuth, async (req, res) => {
  try {
    const emailType = req.body?.emailType === "live" ? "live" : "notify";

    const setting  = await getSaleSetting();
    const products = emailType === "live" ? await getActiveSaleProducts() : [];

    const result = await blastSubscribers({
      setting,
      emailType,
      productCount: products.length,
    });

    return res.json({
      success: true,
      message: `Email sent to ${result.sent} subscriber${result.sent !== 1 ? "s" : ""}.${result.failed > 0 ? ` ${result.failed} failed.` : ""}`,
      result,
    });
  } catch (error) {
    console.error("send-notify error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to send notifications." });
  }
});

/* =========================================================
   ADMIN — GET /api/sale/admin/subscribers
   List all subscribers
========================================================= */

router.get("/admin/subscribers", adminAuth, async (req, res) => {
  try {
    const page  = Math.max(1, Number(req.query?.page  || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query?.limit || 50)));
    const skip  = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      SaleNotifySubscriber.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      SaleNotifySubscriber.countDocuments({}),
    ]);

    return res.json({
      success: true,
      subscribers,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    console.error("GET /api/sale/admin/subscribers error:", error);
    return res.status(500).json({ success: false, message: "Failed to load subscribers" });
  }
});

/* =========================================================
   PRODUCT-SALE MANAGEMENT HELPERS
   IMPORTANT: These helpers only manage individual product sales.
   The existing Sale Timer + Subscribe/Notify system above remains
   untouched.
========================================================= */

function cleanPercent(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return Math.round(n * 100) / 100;
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function salePriceFromPercent(actualPrice, percent) {
  const price = Number(actualPrice || 0);
  const discount = Number(percent || 0);
  return roundMoney(price - (price * discount) / 100);
}

function snapshotSalePricing(product) {
  return {
    pricing: {
      regularPrice: product?.pricing?.regularPrice ?? 0,
      salePrice: product?.pricing?.salePrice ?? null,
    },
    colors: Array.isArray(product?.options?.colors)
      ? product.options.colors.map((color) => ({
          name: color?.name || "",
          value: color?.value || "",
          regularPrice: color?.regularPrice ?? null,
          salePrice: color?.salePrice ?? null,
        }))
      : [],
    variants: Array.isArray(product?.variants)
      ? product.variants.map((variant) => ({
          id: String(variant?._id || ""),
          regularPrice: variant?.regularPrice ?? null,
          salePrice: variant?.salePrice ?? null,
        }))
      : [],
  };
}

function applyPercentSale(product, percent) {
  const update = {
    "pricing.salePrice": salePriceFromPercent(
      product?.pricing?.regularPrice,
      percent
    ),
  };

  if (Array.isArray(product?.options?.colors)) {
    update["options.colors"] = product.options.colors.map((color) => ({
      ...color,
      salePrice:
        color?.regularPrice !== null && color?.regularPrice !== undefined
          ? salePriceFromPercent(color.regularPrice, percent)
          : null,
    }));
  }

  if (Array.isArray(product?.variants)) {
    update.variants = product.variants.map((variant) => ({
      ...variant,
      salePrice:
        variant?.regularPrice !== null && variant?.regularPrice !== undefined
          ? salePriceFromPercent(variant.regularPrice, percent)
          : null,
    }));
  }

  return update;
}

function normalizeExpiry({ durationDays, expiresAt }) {
  if (expiresAt !== undefined && expiresAt !== null && expiresAt !== "") {
    const parsed = new Date(expiresAt);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid sale expiry date/time.");
    }
    if (parsed.getTime() <= Date.now()) {
      throw new Error("Sale expiry must be in the future.");
    }
    return parsed;
  }

  if (durationDays !== undefined && durationDays !== null && durationDays !== "") {
    const days = Number(durationDays);
    if (!Number.isFinite(days) || days <= 0 || days > 3650) {
      throw new Error("durationDays must be between 1 and 3650.");
    }
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }

  return null;
}

async function enableProductSale(product, options = {}) {
  const discountPercent = cleanPercent(options.discountPercent);
  const expiry = normalizeExpiry(options);

  const update = {
    showOnSale: true,
    "saleManagement.startsAt": new Date(),
    "saleManagement.expiresAt": expiry,
    "saleManagement.discountPercent": discountPercent,
  };

  /* Capture actual/current pricing only when a product enters a sale. */
  if (!product.saleManagement?.pricingSnapshot) {
    update["saleManagement.pricingSnapshot"] = snapshotSalePricing(product);
  }

  if (discountPercent !== null) {
    Object.assign(update, applyPercentSale(product, discountPercent));
  } else if (options.salePrice !== undefined) {
    const salePrice =
      options.salePrice === null || options.salePrice === ""
        ? null
        : Number(options.salePrice);

    if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) {
      throw new Error("salePrice must be a valid positive number or empty.");
    }

    update["pricing.salePrice"] = salePrice;
  }

  return update;
}

async function disableProductSale(product) {
  const update = {
    showOnSale: false,
    "saleManagement.discountPercent": null,
    "saleManagement.startsAt": null,
    "saleManagement.expiresAt": null,
    "saleManagement.pricingSnapshot": null,
    "pricing.salePrice": null,
  };

  if (Array.isArray(product?.options?.colors)) {
    update["options.colors"] = product.options.colors.map((color) => ({
      ...color,
      salePrice: null,
    }));
  }

  if (Array.isArray(product?.variants)) {
    update.variants = product.variants.map((variant) => ({
      ...variant,
      salePrice: null,
    }));
  }

  return update;
}

/* =========================================================
   ADMIN — GET /api/sale/admin/catalog
========================================================= */

router.get("/admin/catalog", adminAuth, async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = { status: "published" };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { sku:   { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("category",    "name slug")
      .populate("subCategory", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      products: products.map((p) => ({ ...p, saleActive: Boolean(p.showOnSale) })),
    });
  } catch (error) {
    console.error("GET /api/sale/admin/catalog error:", error);
    return res.status(500).json({ success: false, message: "Failed to load sale catalog" });
  }
});

/* =========================================================
   ADMIN — PATCH /api/sale/admin/products/:id

   Body examples:
   { "showOnSale": true, "discountPercent": 15, "durationDays": 10 }
   { "showOnSale": true, "salePrice": 799 }
   { "showOnSale": false }

   IMPORTANT: This does NOT modify the Sale Timer or Subscribe system.
========================================================= */

router.patch("/admin/products/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id." });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const showOnSale = body.showOnSale;
    if (typeof showOnSale !== "boolean") {
      return res.status(400).json({ success: false, message: "showOnSale must be a boolean value." });
    }

    const update = showOnSale
      ? await enableProductSale(product, body)
      : await disableProductSale(product);

    const updated = await Product.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    )
      .populate("category", "name slug")
      .populate("subCategory", "name slug");

    let blastResult = null;
    if (showOnSale) {
      const activeCount = await Product.countDocuments({
        status: "published",
        showOnSale: true,
        $or: [
          { "saleManagement.expiresAt": null },
          { "saleManagement.expiresAt": { $exists: false } },
          { "saleManagement.expiresAt": { $gt: new Date() } },
        ],
      });

      /* Preserve the EXISTING live-sale notification behavior. */
      if (activeCount === 1) {
        try {
          const setting = await getSaleSetting();
          blastResult = await blastSubscribers({
            setting,
            emailType: "live",
            productCount: 1,
          });
        } catch (blastErr) {
          console.error("Auto live-blast error:", blastErr);
        }
      }
    }

    return res.json({
      success: true,
      message: showOnSale ? "Product added to sale." : "Product removed from sale.",
      product: updated,
      blast: blastResult,
    });
  } catch (error) {
    console.error("PATCH /api/sale/admin/products/:id error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update sale product",
    });
  }
});

/* =========================================================
   ADMIN — POST /api/sale/admin/products/bulk-add

   Body:
   {
     productIds: ["...", "..."],
     discountPercent: 10,
     durationDays: 3
   }

   discountPercent is optional. If omitted, existing/manual sale prices
   are kept and the products are simply placed on sale.
========================================================= */

router.post("/admin/products/bulk-add", adminAuth, async (req, res) => {
  try {
    const productIds = Array.isArray(req.body?.productIds)
      ? [...new Set(req.body.productIds.map(String))]
      : [];

    if (!productIds.length) {
      return res.status(400).json({ success: false, message: "Select at least one product." });
    }

    if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: "One or more product IDs are invalid." });
    }

    const discountPercent = cleanPercent(req.body?.discountPercent);
    if (req.body?.discountPercent !== undefined && discountPercent === null) {
      return res.status(400).json({ success: false, message: "discountPercent must be between 0 and 100." });
    }

    const expiry = normalizeExpiry({
      durationDays: req.body?.durationDays,
      expiresAt: req.body?.expiresAt,
    });

    const products = await Product.find({
      _id: { $in: productIds },
      status: "published",
    });

    if (!products.length) {
      return res.status(404).json({ success: false, message: "No published products found." });
    }

    const updatedProducts = [];

    for (const product of products) {
      const update = await enableProductSale(product, {
        discountPercent,
        expiresAt: expiry,
      });

      const updated = await Product.findByIdAndUpdate(
        product._id,
        { $set: update },
        { new: true, runValidators: true }
      ).lean();

      updatedProducts.push(updated);
    }

    return res.json({
      success: true,
      message: `${updatedProducts.length} product${updatedProducts.length !== 1 ? "s" : ""} added to sale.`,
      count: updatedProducts.length,
      discountPercent,
      expiresAt: expiry,
      products: updatedProducts,
    });
  } catch (error) {
    console.error("POST /api/sale/admin/products/bulk-add error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add products to sale",
    });
  }
});

/* =========================================================
   ADMIN — POST /api/sale/admin/products/bulk-remove
   Body: { productIds: [...] }
========================================================= */

router.post("/admin/products/bulk-remove", adminAuth, async (req, res) => {
  try {
    const productIds = Array.isArray(req.body?.productIds)
      ? [...new Set(req.body.productIds.map(String))]
      : [];

    if (!productIds.length) {
      return res.status(400).json({ success: false, message: "Select at least one sale product." });
    }

    if (productIds.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, message: "One or more product IDs are invalid." });
    }

    const products = await Product.find({
      _id: { $in: productIds },
      showOnSale: true,
    });

    for (const product of products) {
      await Product.findByIdAndUpdate(
        product._id,
        { $set: await disableProductSale(product) },
        { runValidators: true }
      );
    }

    return res.json({
      success: true,
      message: `${products.length} product${products.length !== 1 ? "s" : ""} removed from sale.`,
      count: products.length,
    });
  } catch (error) {
    console.error("POST /api/sale/admin/products/bulk-remove error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove products from sale" });
  }
});

/* =========================================================
   ADMIN — POST /api/sale/admin/products/remove-all
   Removes every product currently on sale.
========================================================= */

router.post("/admin/products/remove-all", adminAuth, async (req, res) => {
  try {
    const products = await Product.find({ showOnSale: true });

    for (const product of products) {
      await Product.findByIdAndUpdate(
        product._id,
        { $set: await disableProductSale(product) },
        { runValidators: true }
      );
    }

    return res.json({
      success: true,
      message: `${products.length} sale product${products.length !== 1 ? "s" : ""} removed from sale.`,
      count: products.length,
    });
  } catch (error) {
    console.error("POST /api/sale/admin/products/remove-all error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove all sale products" });
  }
});

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;