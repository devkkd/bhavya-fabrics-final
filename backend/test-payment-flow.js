#!/usr/bin/env node

/**
 * Complete Payment Flow Test
 * Tests: Create Razorpay Order → Simulate Payment → Verify Payment → Create Order
 */

const http = require("http");
const crypto = require("crypto");

const API_URL = "http://localhost:5001/api";
const TEST_CUSTOMER_ID = "67014f39b42d0c4f6c6d7f3a"; // Replace with actual customer ID from DB
const TEST_ADDRESS_ID = "67014f39b42d0c4f6c6d7f4b"; // Replace with actual address ID

// Helper: Make HTTP request
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
        "Cookie": `token=${process.env.CUSTOMER_TOKEN || ""}`,
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testPaymentFlow() {
  console.log("\n" + "=".repeat(60));
  console.log("TESTING COMPLETE PAYMENT FLOW");
  console.log("=".repeat(60) + "\n");

  try {
    // Step 1: Create Razorpay Order
    console.log("📍 STEP 1: Creating Razorpay Order...");
    const createOrderRes = await makeRequest("POST", "/payments/create-order", {
      addressId: TEST_ADDRESS_ID,
      shippingMethod: "standard",
    });

    if (createOrderRes.status !== 200 || !createOrderRes.body.success) {
      console.error("❌ Create Order Failed:");
      console.error(JSON.stringify(createOrderRes.body, null, 2));
      return;
    }

    console.log("✅ Order Created:");
    const {
      razorpayOrderId,
      amount,
      cartData,
      addressData,
    } = createOrderRes.body;
    console.log(`   Razorpay Order ID: ${razorpayOrderId}`);
    console.log(`   Amount: ₹${amount}`);
    console.log(`   Cart Items: ${cartData.items.length}`);
    console.log(`   Subtotal: ₹${cartData.subtotal}`);
    console.log(`   Shipping: ₹${cartData.shippingCharges}`);
    console.log(`   Tax: ₹${cartData.tax}`);
    console.log(`   Total: ₹${cartData.total}`);

    // Step 2: Simulate Razorpay Response
    console.log("\n📍 STEP 2: Simulating Razorpay Payment Response...");
    const paymentId = `pay_${Date.now()}`;
    const signature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET || "test_secret"
      )
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest("hex");

    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Signature: ${signature}`);

    // Step 3: Verify Payment
    console.log("\n📍 STEP 3: Verifying Payment & Creating Order...");
    const verifyRes = await makeRequest("POST", "/payments/verify", {
      razorpayOrderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      cartData,
      addressData,
      shippingMethod: "standard",
    });

    if (verifyRes.status !== 200 || !verifyRes.body.success) {
      console.error("❌ Payment Verification Failed:");
      console.error(`   Status: ${verifyRes.status}`);
      console.error(JSON.stringify(verifyRes.body, null, 2));
      return;
    }

    console.log("✅ Payment Verified & Order Created:");
    console.log(`   Order ID: ${verifyRes.body.orderId}`);
    console.log(`   Order Number: ${verifyRes.body.orderNumber}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ COMPLETE FLOW SUCCESSFUL!");
    console.log("=".repeat(60) + "\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  }
}

// Run test
testPaymentFlow();
