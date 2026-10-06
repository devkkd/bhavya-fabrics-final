"use strict";

/*
|--------------------------------------------------------------------------
| SALE EXPIRY WATCHER
|--------------------------------------------------------------------------
| Runs every 60 seconds.
| When countdownDate expires AND autoBlastOnExpiry = true AND the blast
| hasn't been fired yet for this sale → sends the "Sale is Live" email
| to all subscribers who signed up for this exact sale.
|--------------------------------------------------------------------------
*/

const SaleSetting          = require("../models/SaleSetting");
const SaleNotifySubscriber = require("../models/SaleNotifySubscriber");
const nodemailer           = require("nodemailer");

const POLL_INTERVAL_MS = 60 * 1000; // check every 60 seconds

/* ── lazy SMTP transporter ── */
function getTransporter() {
  const host   = process.env.SMTP_HOST  || "";
  const port   = Number(process.env.SMTP_PORT || 587);
  const user   = process.env.SMTP_USER  || "";
  const pass   = process.env.SMTP_PASS  || "";
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true" || port === 465;

  if (!host || !user || !pass) {
    throw new Error("SMTP not configured — skipping sale expiry blast");
  }

  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
}

/* ── email template ── */
function buildLiveEmail({ customMessage, type, productCount, saleTitle }) {
  const title    = saleTitle || "Special Offer";
  const autoBody =
    `🎉 The wait is over! Our <strong>${title}</strong> is <strong>LIVE right now</strong>. ` +
    `Shop ${productCount > 0 ? productCount + " sale products" : "exclusive deals"} ` +
    `on premium fabrics before they sell out!`;

  const bodyHtml = type === "custom" && customMessage
    ? customMessage.replace(/\n/g, "<br>")
    : autoBody;

  const bodyText = type === "custom" && customMessage
    ? customMessage
    : `The ${title} is LIVE! Visit us now.`;

  const siteUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  return {
    subject: `🔴 LIVE NOW — Bhavya Fabrics ${title} Has Started!`,
    text: bodyText,
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,sans-serif;color:#2f2a25;">
<div style="max-width:620px;margin:40px auto;padding:20px;">
<div style="background:#fff;border:1px solid #e7e0d7;border-radius:18px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#295C65,#1a3d43);padding:28px 36px;">
    <div style="font-family:Georgia,serif;font-size:26px;color:#fff;letter-spacing:1px;">BHAVYA FABRICS</div>
    <div style="font-size:11px;color:#a8d4d8;letter-spacing:2px;margin-top:4px;">PREMIUM TEXTILE MANUFACTURER</div>
  </div>
  <div style="background:#b83c30;padding:10px 36px;">
    <span style="font-size:13px;font-weight:700;color:#fff;letter-spacing:2px;">● SALE IS LIVE NOW</span>
  </div>
  <div style="padding:36px;">
    <h1 style="font-family:Georgia,serif;font-weight:600;font-size:30px;color:#295C65;margin:0 0 14px;">The Sale Has Started! 🎉</h1>
    <p style="font-size:15px;line-height:1.8;color:#5f5a54;margin:0 0 24px;">${bodyHtml}</p>
    <a href="${siteUrl}/sale" style="display:inline-block;background:#b83c30;color:#fff;text-decoration:none;padding:14px 36px;border-radius:999px;font-size:14px;font-weight:700;">
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

/* ── main checker ── */
async function checkAndBlast() {
  try {
    const setting = await SaleSetting.findOne({ key: "main" }).lean();
    if (!setting) return;

    /* must have autoBlastOnExpiry enabled */
    if (!setting.autoBlastOnExpiry) return;

    /* must have a countdownDate that has now passed */
    if (!setting.countdownDate) return;
    const saleKey = new Date(setting.countdownDate).toISOString();

    const now = Date.now();
    if (new Date(setting.countdownDate).getTime() > now) return; // not expired yet

    /* must not have already blasted for this exact sale */
    if (setting.autoBlastFiredFor === saleKey) return;

    /* find subscribers for this sale */
    const subscribers = await SaleNotifySubscriber.find({
      subscribedForSale: saleKey,
    }).lean();

    if (!subscribers.length) {
      /* no subscribers — mark as fired anyway to avoid repeat checks */
      await SaleSetting.updateOne(
        { key: "main" },
        { $set: { autoBlastFiredFor: saleKey } }
      );
      return;
    }

    /* mark fired BEFORE sending so a server restart doesn't double-send */
    await SaleSetting.updateOne(
      { key: "main" },
      { $set: { autoBlastFiredFor: saleKey } }
    );

    console.log(`[SaleExpiryWatcher] Countdown expired. Blasting ${subscribers.length} subscriber(s)...`);

    const transport = getTransporter();
    const from      = process.env.SMTP_FROM || process.env.SMTP_USER || "";
    const template  = buildLiveEmail({
      customMessage: setting.notifyMessage || "",
      type:          setting.notifyMessageType || "auto",
      productCount:  0,
      saleTitle:     setting.saleTitle || "",
    });

    let sent = 0, failed = 0;

    await Promise.allSettled(
      subscribers.map(async (sub) => {
        try {
          await transport.sendMail({ from, to: sub.email, ...template });
          await SaleNotifySubscriber.updateOne(
            { _id: sub._id },
            { $set: { notifiedAt: new Date(), notifiedForSale: saleKey } }
          );
          sent++;
        } catch (err) {
          console.error(`[SaleExpiryWatcher] Failed to send to ${sub.email}:`, err.message);
          failed++;
        }
      })
    );

    console.log(`[SaleExpiryWatcher] Blast complete. Sent: ${sent}, Failed: ${failed}`);
  } catch (err) {
    console.error("[SaleExpiryWatcher] Error:", err.message);
  }
}

/* ── start watcher ── */
function startSaleExpiryWatcher() {
  console.log("[SaleExpiryWatcher] Started — checking every 60 seconds.");
  // run once immediately on startup, then on interval
  checkAndBlast();
  setInterval(checkAndBlast, POLL_INTERVAL_MS);
}

module.exports = { startSaleExpiryWatcher };
