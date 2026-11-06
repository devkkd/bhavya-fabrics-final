const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        "MONGODB_URI is missing in .env"
      );
    }

    // Force IPv4 DNS resolution for SRV records
    const dns = require("dns");
    dns.setDefaultResultOrder("ipv4first");

    const connection =
      await mongoose.connect(
        mongoURI,
        {
          retryWrites: true,
          serverSelectionTimeoutMS: 30000,
          socketTimeoutMS: 45000,
          connectTimeoutMS: 30000,
          family: 4, // Force IPv4
        }
      );

    console.log(
      "========================================"
    );
    console.log(
      "✅ MongoDB Connected"
    );
    console.log(
      `📦 Database: ${connection.connection.name}`
    );
    console.log(
      `🖥️ Host: ${connection.connection.host}`
    );
    console.log(
      "========================================"
    );
  } catch (error) {
    console.error(
      "========================================"
    );
    console.error(
      "❌ MongoDB Connection Failed"
    );
    console.error(
      error.message
    );
    console.error(
      "========================================"
    );
    console.error("");
    console.error(
      "⚠️  WORKAROUND: Starting backend without MongoDB"
    );
    console.error(
      "⚠️  Note: Database operations will fail"
    );
    console.error("");

    // Don't exit - allow backend to start
    // process.exit(1);
  }
};

module.exports = connectDB;