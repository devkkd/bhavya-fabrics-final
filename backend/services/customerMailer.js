const nodemailer = require("nodemailer");

/*
|--------------------------------------------------------------------------
| LAZY TRANSPORTER
| Transporter is created on first use so .env values are always fresh
| after a server restart.
|--------------------------------------------------------------------------
*/

let _transporter = null;

function getTransporter() {
  if (_transporter) {
    return _transporter;
  }

  const host  = process.env.SMTP_HOST || "";
  const port  = Number(process.env.SMTP_PORT || 587);
  const user  = process.env.SMTP_USER || "";
  const pass  = process.env.SMTP_PASS || "";
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true" ||
    port === 465;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in backend .env"
    );
  }

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return _transporter;
}

/*
|--------------------------------------------------------------------------
| EMAIL TEMPLATES
|--------------------------------------------------------------------------
*/

function getOtpEmail({ otp, purpose }) {
  const titles = {
    signup:           "Verify your Bhavya Fabrics account",
    login:            "Your Bhavya Fabrics login OTP",
    "forgot-password": "Reset your Bhavya Fabrics password",
  };

  const expiresIn =
    process.env.CUSTOMER_OTP_EXPIRES_MINUTES || 10;

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Arial,sans-serif;color:#2f2a25;">

<div style="max-width:620px;margin:40px auto;padding:20px;">
<div style="background:#ffffff;border:1px solid #e7e0d7;border-radius:18px;padding:36px;">

  <div style="font-family:Georgia,serif;font-size:30px;color:#295C65;letter-spacing:1px;">
    BHAVYA FABRICS
  </div>

  <h1 style="font-family:Georgia,serif;font-weight:500;font-size:26px;color:#295C65;margin-top:28px;">
    ${titles[purpose] || "Verification Code"}
  </h1>

  <p style="font-size:15px;line-height:1.7;color:#5f5a54;">
    Your one-time verification code is:
  </p>

  <div style="margin:28px 0;padding:20px;text-align:center;background:#FAF8F5;border:1px solid #E7E0D7;border-radius:12px;">
    <div style="font-size:40px;letter-spacing:12px;font-weight:700;color:#295C65;">
      ${otp}
    </div>
  </div>

  <p style="font-size:13px;line-height:1.7;color:#77716b;">
    This OTP expires in <strong>${expiresIn} minutes</strong>. Do not share it with anyone.
  </p>

  <hr style="border:none;border-top:1px solid #e7e0d7;margin:24px 0;">

  <p style="font-size:11px;color:#aaa8a4;margin:0;">
    Bhavya Fabrics &mdash; Premium Textile Manufacturer
  </p>

</div>
</div>

</body>
</html>`;
}

/*
|--------------------------------------------------------------------------
| SEND OTP
|--------------------------------------------------------------------------
*/

async function sendCustomerOtp({ to, otp, purpose }) {
  const transport = getTransporter();

  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "";

  return transport.sendMail({
    from,
    to,
    subject: "Bhavya Fabrics — Verification Code",
    text: `Your OTP is ${otp}. It expires in ${process.env.CUSTOMER_OTP_EXPIRES_MINUTES || 10} minutes.`,
    html: getOtpEmail({ otp, purpose }),
  });
}

module.exports = {
  sendCustomerOtp,
  get transporter() { return getTransporter(); },
};
