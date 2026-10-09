require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const categoryRoutes = require("./routes/categories");
const subCategoryRoutes = require("./routes/subcategories");
const productRoutes = require("./routes/products");
const uploadRoutes =
  require("./routes/uploads");
  const saleRoutes =
  require("./routes/sale");
  const customerAuthRoutes =
  require("./routes/customerAuth");

const customerRoutes =
  require("./routes/customers");

const cartRoutes =
  require("./routes/cart");

const wishlistRoutes =
  require("./routes/wishlist");

const addressRoutes =
  require("./routes/addresses");

const orderRoutes =
  require("./routes/orders");

const paymentRoutes =
  require("./routes/payments");

  const contactInquiryRoutes =
  require("./routes/contactInquiries.routes");

const {
  verifyMailer
} = require("./services/mailer");

const { startSaleExpiryWatcher } =
  require("./services/saleExpiryWatcher");

const { startProductSaleExpiryWatcher } =
  require("./services/productSaleExpiryWatcher");

  const heroSettingsRoutes = require("./routes/heroSettings");
const blogRoutes = require("./routes/blogs");
const catalogueRoutes = require("./routes/catalogue");

const app = express();

const PORT = process.env.PORT || 5001;

/*
|--------------------------------------------------------------------------
| Environment Validation
|--------------------------------------------------------------------------
*/

const requiredEnv = [
  "MONGODB_URI",
  "FRONTEND_URL",
  "JWT_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",

  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS"
];

const missingEnv = requiredEnv.filter(
  (key) => !process.env[key]
);

if (missingEnv.length > 0) {
  console.error("");
  console.error(
    "❌ Missing environment variables:"
  );
  console.error(missingEnv.join(", "));
  console.error("");
  console.error(
    "Please check your .env file."
  );
  console.error("");

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| Security Headers
|--------------------------------------------------------------------------
*/

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

/*
|--------------------------------------------------------------------------
| Body Parser
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

/*
|--------------------------------------------------------------------------
| Cookie Parser
|--------------------------------------------------------------------------
*/

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| Root API
|--------------------------------------------------------------------------
*/

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Bhavya Fabrics API",
    version: "1.0.0"
  });
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Bhavya Fabrics backend is running",
    environment:
      process.env.NODE_ENV || "development",
    time: new Date().toISOString()
  });
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/auth",
  authRoutes
);
app.use(
  "/api/customer-auth",
  customerAuthRoutes
);

/*
|--------------------------------------------------------------------------
| Category Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/categories",
  categoryRoutes
);

/*
|--------------------------------------------------------------------------
| Subcategory Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/subcategories",
  subCategoryRoutes
);

/*
|--------------------------------------------------------------------------
| Product Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/products",
  productRoutes
);
app.use(
  "/api/uploads",
  uploadRoutes
);

app.use(
  "/api/sale",
  saleRoutes
);
app.use(
  "/api/customers",
  customerRoutes
);

app.use(
  "/api/cart",
  cartRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/addresses",
  addressRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/contact-inquiries",
  contactInquiryRoutes
);
app.use(
  "/api/hero-settings",
  heroSettingsRoutes
);

app.use("/api/blogs", blogRoutes);
app.use("/api/catalogue", catalogueRoutes);


/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message:
      `Route not found: ${req.method} ${req.originalUrl}`
  });
});

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(
  (error, req, res, next) => {
    console.error("");
    console.error(
      "========================================"
    );
    console.error(
      "❌ UNHANDLED SERVER ERROR"
    );
    console.error(
      "========================================"
    );
    console.error(error);
    console.error(
      "========================================"
    );
    console.error("");

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error"
    });
  }
);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const startServer = async () => {
  try {
    /*
    |--------------------------------------------------------------------------
    | Connect MongoDB First
    |--------------------------------------------------------------------------
    */

    await connectDB();


    /*
|--------------------------------------------------------------------------
| Verify SMTP
|--------------------------------------------------------------------------
*/

await verifyMailer();
    /*
    |--------------------------------------------------------------------------
    | Start Sale Expiry Watcher
    |--------------------------------------------------------------------------
    */

    /* Existing Sale Timer + Subscribe/Notify watcher — unchanged. */
    startSaleExpiryWatcher();

    /* Separate watcher for individual product-sale expiry. */
    startProductSaleExpiryWatcher();

    /*
    |--------------------------------------------------------------------------
    | Start Express Server
    |--------------------------------------------------------------------------
    */

    app.listen(PORT, () => {
      console.log("");

      console.log(
        "========================================"
      );

      console.log(
        "🚀 BHAVYA FABRICS BACKEND"
      );

      console.log(
        "========================================"
      );

      console.log(
        `📡 Server       : http://localhost:${PORT}`
      );

      console.log(
        `❤️  Health       : http://localhost:${PORT}/api/health`
      );

      console.log(
        `🔐 Auth         : http://localhost:${PORT}/api/auth`
      );

      console.log(
        `🏷️  Categories   : http://localhost:${PORT}/api/categories`
      );

      console.log(
        `📂 Subcategories: http://localhost:${PORT}/api/subcategories`
      );

      console.log(
        `📦 Products     : http://localhost:${PORT}/api/products`
      );

      console.log(
        "========================================"
      );

      console.log(
        `🌐 Frontend     : ${process.env.FRONTEND_URL}`
      );

      console.log(
        `🗄️  MongoDB      : ${process.env.MONGODB_URI}`
      );

      console.log(
        "========================================"
      );

      console.log("");
    });
  } catch (error) {
    console.error("");
    console.error(
      "❌ Failed to start Bhavya Fabrics backend"
    );
    console.error(error.message);
    console.error("");

    process.exit(1);
  }
};

/*
|--------------------------------------------------------------------------
| Run Server
|--------------------------------------------------------------------------
*/

startServer();