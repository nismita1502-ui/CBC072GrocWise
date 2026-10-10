const marketPriceRoutes = require("./routes/marketPriceRoutes");
const priceRoutes = require("./routes/priceRoutes");
const { updatePrices } = require("./services/priceUpdater");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"]
}));
app.use(express.json());

// API routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const pantryRoutes = require("./routes/pantryRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/market-prices", marketPriceRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/pantry", pantryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "GrocWise backend is running",
  });
});
const authMiddleware = require("./middleware/authMiddleware");

app.get("/api/protected-test", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "You are authenticated successfully!",
    userId: req.userId,
  });
});
// Start server
async function startServer() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is missing from server/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from server/.env");
    }

    await mongoose.connect(mongoUri);
    // Run once at startup, without preventing the API from starting.
updatePrices().catch((error) => {
  console.error("Initial price update failed:", error.message);
});

// Repeat at the configured interval.
const updateIntervalMinutes = Math.max(
  5,
  Number(process.env.PRICE_UPDATE_INTERVAL_MINUTES) || 360
);

setInterval(() => {
  updatePrices().catch((error) => {
    console.error("Scheduled price update failed:", error.message);
  });
}, updateIntervalMinutes * 60 * 1000);

    console.log("Connected database:", mongoose.connection.name);
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`GrocWise server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
