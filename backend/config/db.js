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

    const connection =
      await mongoose.connect(
        mongoURI
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

    process.exit(1);
  }
};

module.exports = connectDB;