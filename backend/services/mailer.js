"use strict";

const nodemailer = require("nodemailer");

/* =====================================================
   SMTP HELPERS
===================================================== */

function envBool(value, fallback = false) {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return [
    "1",
    "true",
    "yes",
    "on",
  ].includes(
    String(value)
      .trim()
      .toLowerCase()
  );
}

function getTransporter() {
  const host =
    process.env.SMTP_HOST;

  const port = Number(
    process.env.SMTP_PORT || 587
  );

  const secure = envBool(
    process.env.SMTP_SECURE,
    false
  );

  const user =
    process.env.SMTP_USER;

  const pass =
    process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration is incomplete"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
  });
}

function getFromAddress() {
  return (
    process.env.SMTP_FROM ||
    process.env.SMTP_USER
  );
}

/* =====================================================
   SECURITY / HTML
===================================================== */

function escapeHtml(value = "") {
  return String(value)
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#39;"
    );
}

/* =====================================================
   DISPLAY HELPERS
===================================================== */

function getRequestTypeLabel(
  inquiry
) {
  return inquiry?.requestType ===
    "quote"
    ? "Quote Request"
    : "Contact Enquiry";
}

function renderProductRows(
  inquiry
) {
  const product =
    inquiry?.product;

  if (
    !product ||
    typeof product !== "object"
  ) {
    return "";
  }

  const rows = [
    [
      "Product",
      product.name || "—",
    ],
    [
      "SKU",
      product.sku || "—",
    ],
    [
      "Selected Colour",
      product.selectedColor ||
        "—",
    ],
    [
      "Selected Size",
      product.selectedSize ||
        "—",
    ],
    [
      "Variant ID",
      product.variantId ||
        "—",
    ],
  ];

  return `
    <div
      style="
        margin-top:20px;
        padding:16px;
        background:#f7faf9;
        border:1px solid #e1ebe8;
        border-radius:10px;
      "
    >
      <div
        style="
          margin-bottom:10px;
          font-size:11px;
          color:#295c65;
          font-weight:700;
          letter-spacing:1.2px;
          text-transform:uppercase;
        "
      >
        Product Details
      </div>

      <table
        style="
          width:100%;
          border-collapse:collapse;
        "
      >
        ${rows
          .map(
            ([label, value]) => `
              <tr>
                <td
                  style="
                    width:180px;
                    padding:6px 0;
                    color:#778082;
                    font-size:12px;
                    vertical-align:top;
                  "
                >
                  ${escapeHtml(label)}
                </td>

                <td
                  style="
                    padding:6px 0;
                    color:#1f3438;
                    font-size:12px;
                    font-weight:600;
                    vertical-align:top;
                  "
                >
                  ${escapeHtml(
                    value || "—"
                  )}
                </td>
              </tr>
            `
          )
          .join("")}
      </table>
    </div>
  `;
}

function renderInfoRows(
  inquiry
) {
  const rows = [
    [
      "Request Type",
      getRequestTypeLabel(
        inquiry
      ),
    ],

    [
      "Name",
      inquiry?.name,
    ],

    [
      "Company",
      inquiry?.company ||
        "—",
    ],

    [
      "Phone",
      inquiry?.phone,
    ],

    [
      "Email",
      inquiry?.email,
    ],

    [
      "Fabric Requirement",
      inquiry?.fabric,
    ],

    [
      "City",
      inquiry?.city,
    ],

    [
      "Source",
      inquiry?.source ||
        "website",
    ],
  ];

  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td
            style="
              padding:7px 0;
              width:180px;
              color:#747b7c;
              font-size:13px;
              vertical-align:top;
            "
          >
            ${escapeHtml(label)}
          </td>

          <td
            style="
              padding:7px 0;
              color:#1b2d35;
              font-size:13px;
              font-weight:600;
              vertical-align:top;
            "
          >
            ${escapeHtml(
              value || "—"
            )}
          </td>
        </tr>
      `
    )
    .join("");
}

/* =====================================================
   BASE EMAIL TEMPLATE
===================================================== */

function baseEmail(
  title,
  bodyHtml,
  previewText = ""
) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  />
  <title>
    ${escapeHtml(title)}
  </title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#f6f3ee;
    font-family:Arial,Helvetica,sans-serif;
    color:#1a1a1a;
  "
>

  <div
    style="
      display:none;
      max-height:0;
      overflow:hidden;
      opacity:0;
    "
  >
    ${escapeHtml(
      previewText
    )}
  </div>

  <div
    style="
      padding:32px 16px;
    "
  >

    <div
      style="
        width:100%;
        max-width:700px;
        margin:0 auto;
        overflow:hidden;
        background:#ffffff;
        border:1px solid rgba(41,92,101,.10);
        border-radius:16px;
      "
    >

      <!-- HEADER -->

      <div
        style="
          padding:24px 28px;
          background:#295c65;
          color:#ffffff;
        "
      >

        <div
          style="
            font-size:12px;
            font-weight:700;
            letter-spacing:2px;
          "
        >
          BHAVYA FABRICS
        </div>

        <div
          style="
            margin-top:7px;
            font-size:24px;
            line-height:1.2;
            font-weight:700;
          "
        >
          ${escapeHtml(title)}
        </div>

      </div>

      <!-- BODY -->

      <div
        style="
          padding:28px;
          line-height:1.65;
        "
      >
        ${bodyHtml}
      </div>

      <!-- FOOTER -->

      <div
        style="
          padding:18px 28px;
          background:#faf8f5;
          border-top:1px solid #ebe5dd;
          color:#717878;
          font-size:12px;
        "
      >
        Bhavya Fabrics · Jaipur, Rajasthan
      </div>

    </div>

  </div>

</body>
</html>`;
}

/* =====================================================
   ADMIN: NEW ENQUIRY EMAIL
===================================================== */

async function sendNewInquiryAdminMail(
  inquiry
) {
  const adminEmail =
    process.env.ADMIN_EMAIL ||
    process.env.SMTP_USER;

  if (!adminEmail) {
    throw new Error(
      "ADMIN_EMAIL or SMTP_USER is required"
    );
  }

  const adminPanelUrl =
    process.env.ADMIN_PANEL_URL
      ? `${String(
          process.env.ADMIN_PANEL_URL
        ).replace(
          /\/$/,
          ""
        )}/admin/enquiries/${inquiry._id}`
      : "";

  const requestLabel =
    getRequestTypeLabel(
      inquiry
    );

  const html =
    baseEmail(
      `New ${requestLabel}`,
      `
        <p
          style="
            margin:0 0 18px;
            font-size:15px;
            color:#394648;
          "
        >
          A new
          <strong>
            ${escapeHtml(
              requestLabel
            )}
          </strong>
          has been submitted from the Bhavya Fabrics website.
        </p>

        <table
          style="
            width:100%;
            border-collapse:collapse;
          "
        >
          ${renderInfoRows(
            inquiry
          )}
        </table>

        ${renderProductRows(
          inquiry
        )}

        <div
          style="
            margin-top:20px;
            padding:16px;
            background:#faf8f5;
            border:1px solid #ece7df;
            border-radius:10px;
          "
        >

          <div
            style="
              margin-bottom:7px;
              color:#8b8178;
              font-size:11px;
              font-weight:700;
              letter-spacing:1px;
              text-transform:uppercase;
            "
          >
            Customer Message
          </div>

          <div
            style="
              white-space:pre-wrap;
              color:#374345;
              font-size:14px;
            "
          >
            ${escapeHtml(
              inquiry?.message ||
                "No additional message"
            )}
          </div>

        </div>

        ${
          adminPanelUrl
            ? `
              <p
                style="
                  margin:22px 0 0;
                "
              >
                <a
                  href="${escapeHtml(
                    adminPanelUrl
                  )}"
                  style="
                    display:inline-block;
                    padding:12px 18px;
                    background:#295c65;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                    font-size:13px;
                    font-weight:700;
                  "
                >
                  Open in Admin Panel
                </a>
              </p>
            `
            : ""
        }
      `,
      `${inquiry?.name || "Customer"} submitted a new ${requestLabel}.`
    );

  const text = [
    `New Bhavya Fabrics ${requestLabel}`,
    "",
    `Name: ${inquiry?.name || "—"}`,
    `Company: ${inquiry?.company || "—"}`,
    `Phone: ${inquiry?.phone || "—"}`,
    `Email: ${inquiry?.email || "—"}`,
    `Fabric: ${inquiry?.fabric || "—"}`,
    `City: ${inquiry?.city || "—"}`,
    `Source: ${inquiry?.source || "website"}`,
    "",
    inquiry?.product?.name
      ? `Product: ${inquiry.product.name}`
      : "",
    inquiry?.product?.sku
      ? `SKU: ${inquiry.product.sku}`
      : "",
    inquiry?.product?.selectedColor
      ? `Colour: ${inquiry.product.selectedColor}`
      : "",
    inquiry?.product?.selectedSize
      ? `Size: ${inquiry.product.selectedSize}`
      : "",
    inquiry?.product?.variantId
      ? `Variant ID: ${inquiry.product.variantId}`
      : "",
    "",
    `Message: ${inquiry?.message || "—"}`,
  ]
    .filter(Boolean)
    .join("\n");

  return getTransporter().sendMail({
    from: getFromAddress(),

    to: adminEmail,

    replyTo:
      inquiry?.email ||
      getFromAddress(),

    subject:
      `Bhavya Fabrics — ${requestLabel} — ${
        inquiry?.name || "Customer"
      }`,

    html,

    text,
  });
}

/* =====================================================
   CUSTOMER: ACKNOWLEDGEMENT EMAIL
===================================================== */

async function sendCustomerAcknowledgement(
  inquiry
) {
  const isQuote =
    inquiry?.requestType ===
    "quote";

  const title = isQuote
    ? "Quote Request Received"
    : "We Received Your Enquiry";

  const subject = isQuote
    ? "Bhavya Fabrics — Your Quote Request Has Been Received"
    : "Bhavya Fabrics — We Received Your Enquiry";

  const html =
    baseEmail(
      title,
      `
        <p
          style="
            margin:0 0 12px;
            font-size:15px;
            color:#26383c;
          "
        >
          Hello
          <strong>
            ${escapeHtml(
              inquiry?.name ||
                "Customer"
            )}
          </strong>,
        </p>

        <p
          style="
            margin:0 0 18px;
            font-size:14px;
            color:#4b5557;
          "
        >
          Thank you for contacting Bhavya Fabrics.
          Your
          ${
            isQuote
              ? "quote request"
              : "enquiry"
          }
          has been received successfully.
        </p>

        ${renderProductRows(
          inquiry
        )}

        <div
          style="
            margin-top:20px;
            padding:16px;
            background:#faf8f5;
            border:1px solid #ece7df;
            border-radius:10px;
          "
        >

          <div
            style="
              margin-bottom:8px;
              color:#8b8178;
              font-size:11px;
              font-weight:700;
              letter-spacing:1px;
              text-transform:uppercase;
            "
          >
            Your Requirement
          </div>

          <div
            style="
              color:#1f3134;
              font-size:14px;
              font-weight:700;
            "
          >
            ${escapeHtml(
              inquiry?.fabric ||
                "—"
            )}
          </div>

          <div
            style="
              margin-top:6px;
              color:#6c7475;
              font-size:13px;
            "
          >
            ${escapeHtml(
              inquiry?.city ||
                "—"
            )}
          </div>

        </div>

        <div
          style="
            margin-top:20px;
            padding:15px 16px;
            background:#f7faf9;
            border-left:4px solid #295c65;
            border-radius:8px;
            color:#445255;
            font-size:13px;
          "
        >
          Our team will review your request and reply to this email address.
        </div>
      `,
      "Your Bhavya Fabrics request has been received."
    );

  const text = [
    `Hello ${inquiry?.name || "Customer"},`,
    "",
    `Your ${
      isQuote
        ? "quote request"
        : "enquiry"
    } has been received successfully.`,
    "",
    `Fabric: ${inquiry?.fabric || "—"}`,
    `City: ${inquiry?.city || "—"}`,
    inquiry?.product?.name
      ? `Product: ${inquiry.product.name}`
      : "",
    inquiry?.product?.sku
      ? `SKU: ${inquiry.product.sku}`
      : "",
    inquiry?.product?.selectedColor
      ? `Colour: ${inquiry.product.selectedColor}`
      : "",
    inquiry?.product?.selectedSize
      ? `Size: ${inquiry.product.selectedSize}`
      : "",
    "",
    "Our team will review your request and reply shortly.",
  ]
    .filter(Boolean)
    .join("\n");

  return getTransporter().sendMail({
    from: getFromAddress(),

    to: inquiry.email,

    replyTo:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    subject,

    html,

    text,
  });
}

/* =====================================================
   ADMIN: REPLY TO CUSTOMER
===================================================== */

async function sendAdminReplyToCustomer(
  inquiry,
  replyMessage
) {
  const safeReply =
    String(
      replyMessage || ""
    ).trim();

  if (!safeReply) {
    throw new Error(
      "Reply message is required"
    );
  }

  const html =
    baseEmail(
      "Reply from Bhavya Fabrics",
      `
        <p
          style="
            margin:0 0 12px;
            font-size:15px;
            color:#26383c;
          "
        >
          Hello
          <strong>
            ${escapeHtml(
              inquiry?.name ||
                "Customer"
            )}
          </strong>,
        </p>

        <p
          style="
            margin:0 0 14px;
            font-size:14px;
            color:#4b5557;
          "
        >
          Our team has replied to your enquiry:
        </p>

        <div
          style="
            padding:18px;
            background:#f7faf9;
            border-left:4px solid #295c65;
            border-radius:8px;
            white-space:pre-wrap;
            color:#26383c;
            font-size:14px;
            line-height:1.65;
          "
        >
          ${escapeHtml(
            safeReply
          )}
        </div>

        ${renderProductRows(
          inquiry
        )}

        <p
          style="
            margin:18px 0 0;
            color:#717878;
            font-size:13px;
          "
        >
          You can reply directly to this email to continue the conversation.
        </p>
      `,
      "Bhavya Fabrics has replied to your enquiry."
    );

  const text = [
    `Hello ${inquiry?.name || "Customer"},`,
    "",
    "Bhavya Fabrics reply:",
    "",
    safeReply,
    "",
    inquiry?.product?.name
      ? `Product: ${inquiry.product.name}`
      : "",
    inquiry?.product?.selectedColor
      ? `Colour: ${inquiry.product.selectedColor}`
      : "",
    inquiry?.product?.selectedSize
      ? `Size: ${inquiry.product.selectedSize}`
      : "",
    "",
    "You can reply directly to this email to continue the conversation.",
  ]
    .filter(Boolean)
    .join("\n");

  return getTransporter().sendMail({
    from: getFromAddress(),

    to: inquiry.email,

    replyTo:
      process.env.SMTP_FROM ||
      process.env.SMTP_USER,

    subject:
      "Bhavya Fabrics — Reply to Your Enquiry",

    html,

    text,
  });
}

/* =====================================================
   SMTP VERIFY
===================================================== */

async function verifyMailer() {
  try {
    await getTransporter().verify();

    console.log(
      "✉️  SMTP       : connected"
    );

    return true;
  } catch (error) {
    console.error(
      "⚠️  SMTP verify failed:",
      error?.message ||
        error
    );

    return false;
  }
}

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  getTransporter,
  verifyMailer,
  sendNewInquiryAdminMail,
  sendCustomerAcknowledgement,
  sendAdminReplyToCustomer,
};