
const express = require("express");
const mongoose = require("mongoose");
const PriceHistory = require("../models/PriceHistory");

const router = express.Router();

router.get("/history/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const history = await PriceHistory.find({ productId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Price history error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not retrieve price history",
    });
  }
});

module.exports = router;
