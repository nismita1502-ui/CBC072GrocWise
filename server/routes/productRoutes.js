
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET all grocery products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    console.log("API database:", Product.db.name);
console.log("API collection:", Product.collection.name);

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
});

module.exports = router;
