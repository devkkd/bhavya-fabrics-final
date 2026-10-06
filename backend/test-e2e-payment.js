#!/usr/bin/env node

/**
 * End-to-End Payment Flow Test
 * Tests complete flow: Get Cart → Create Order → Verify Payment → Check Order Created
 * 
 * Usage:
 * node test-e2e-payment.js <CUSTOMER_TOKEN> <CUSTOMER_ID> <ADDRESS_ID>
 * 
 * Or set via env:
 * CUSTOMER_TOKEN=xxx CUSTOMER_ID=yyy ADDRESS_ID=zzz node test-e2e-payment.js
 */

const http = require("http");
const crypto = require("crypto");

const API_URL = "http://localhost:5001/api";
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET || "1lbxN27GUrVZvBn6bRe18CFe";

// Get credentials from args or env
const CUSTOMER_TOKEN = process.argv[2] || process.env.CUSTOMER_TOKEN;
const CUSTOMER_ID = process.argv[3] || process.env.CUSTOMER_ID;
const ADDRESS_ID = process.argv[4] || process.env.ADDRESS_ID;

if (!CUSTOMER_TOKEN || !CUSTOMER_ID || !ADDRESS_ID) {
  console.error("\n❌ Missing required parameters:");
  console.error("   CUSTOMER_TOKEN:", CUSTOMER_TOKEN ? "✓" : "✗");
  console.error("   CUSTOMER_ID:", CUSTOMER_ID ? "✓" : "✗");
  console.error("   ADDRESS_ID:", ADDRESS_ID ? "✓" : "✗");
  console.error("\nUsage: node test-e2e-payment.js <TOKEN> <CUSTOMER_ID> <ADDRESS_ID>");
  process.exit(1);
}

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
        "Cookie": `${process.env.CUSTOMER_COOKIE_NAME || "bf_cust_2026"}=${CUSTOMER_TOKEN}`,
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

async function testE2EFlow() {
  console.log("\n" + "═".repeat(70));
  console.log("     🛒 END-TO-END PAYMENT FLOW TEST");
  console.log("═".repeat(70) + "\n");

  let createdOrderId = null;
  let createdOrderNumber = null;

  try {
    // Step 1: Get Cart
    console.log("📍 STEP 1: Fetching Cart...");
    const cartRes = await makeRequest("GET", "/cart");

    if (cartRes.status !== 200 || !cartRes.body.success) {
      console.error("❌ Cart Fetch Failed:");
      console.error(JSON.stringify(cartRes.body, null, 2));
      return;
    }

    const cartItems = cartRes.body.cart?.items || [];
    console.log(`✅ Cart has ${cartItems.length} items`);
    cartItems.forEach((item, i) => {
      const price = item.snapshot?.salePrice || item.snapshot?.regularPrice || 0;
      console.log(`   ${i + 1}. ${item.snapshot?.title} - ₹${price} × ${item.quantity}`);
    });

    if (cartItems.length === 0) {
      console.warn("⚠️  Cart is empty! Cannot test payment flow.");
      return;
    }

    // Step 2: Create Razorpay Order
    console.log("\n📍 STEP 2: Creating Razorpay Order...");
    const createOrderRes = await makeRequest("POST", "/payments/create-order", {
      addressId: ADDRESS_ID,
      shippingMethod: "standard",
    });

    if (createOrderRes.status !== 200 || !createOrderRes.body.success) {
      console.error("❌ Create Order Failed:");
      console.error(JSON.stringify(createOrderRes.body, null, 2));
      return;
    }

    const {
      razorpayOrderId,
      amount,
      cartData,
      addressData,
    } = createOrderRes.body;

    console.log("✅ Razorpay Order Created:");
    console.log(`   Order ID: ${razorpayOrderId}`);
    console.log(`   Amount: ₹${amount}`);
    console.log(`   Items: ${cartData.items.length}`);
    console.log(`   Subtotal: ₹${cartData.subtotal}`);
    console.log(`   Shipping: ₹${cartData.shippingCharges}`);
    console.log(`   Tax: ₹${cartData.tax}`);
    console.log(`   Total: ₹${cartData.total}`);

    // Step 3: Simulate Razorpay Payment Response
    console.log("\n📍 STEP 3: Simulating Razorpay Payment...");
    const paymentId = `pay_Test${Date.now()}`;
    const signature = crypto
      .createHmac("sha256", RAZORPAY_SECRET)
      .update(`${razorpayOrderId}|${paymentId}`)
      .digest("hex");

    console.log(`✅ Payment Simulated:`);
    console.log(`   Payment ID: ${paymentId}`);
    console.log(`   Signature: ${signature.substring(0, 20)}...`);

    // Step 4: Verify Payment & Create Order
    console.log("\n📍 STEP 4: Verifying Payment & Creating Order...");
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

    createdOrderId = verifyRes.body.orderId;
    createdOrderNumber = verifyRes.body.orderNumber;

    console.log("✅ Payment Verified & Order Created:");
    console.log(`   Order ID: ${createdOrderId}`);
    console.log(`   Order Number: ${createdOrderNumber}`);

    // Step 5: Fetch Order to Verify
    console.log("\n📍 STEP 5: Fetching Order Details...");
    const orderRes = await makeRequest("GET", `/orders/${createdOrderId}`);

    if (orderRes.status !== 200 || !orderRes.body.success) {
      console.error("❌ Order Fetch Failed:");
      console.error(JSON.stringify(orderRes.body, null, 2));
      return;
    }

    const order = orderRes.body.order;
    console.log("✅ Order Retrieved:");
    console.log(`   Status: ${order.status}`);
    console.log(`   Total: ₹${order.pricing.total}`);
    console.log(`   Items: ${order.items.length}`);
    console.log(`   Payment Status: ${order.payment.status}`);
    console.log(`   Razorpay Payment ID: ${order.payment.razorpayPaymentId}`);

    // Step 6: Verify Cart was Cleared
    console.log("\n📍 STEP 6: Verifying Cart Cleared...");
    const cartCheckRes = await makeRequest("GET", "/cart");
    const remainingItems = cartCheckRes.body.cart?.items?.length || 0;

    if (remainingItems === 0) {
      console.log("✅ Cart successfully cleared");
    } else {
      console.warn(`⚠️  Cart still has ${remainingItems} items (expected 0)`);
    }

    console.log("\n" + "═".repeat(70));
    console.log("✅ COMPLETE END-TO-END FLOW SUCCESSFUL!");
    console.log("═".repeat(70) + "\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run test
testE2EFlow();
