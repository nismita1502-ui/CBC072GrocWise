
const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Place a new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    if (
      !deliveryAddress ||
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a delivery address.",
      });
    }

    // Validate product IDs and quantities.
    const quantityByProduct = new Map();

    for (const item of items) {
      if (
        !item ||
        typeof item.productId !== "string" ||
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isSafeInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "A product ID or quantity is invalid.",
        });
      }

      const id = item.productId;
      quantityByProduct.set(
        id,
        (quantityByProduct.get(id) || 0) + item.quantity
      );
    }

    const productIds = [...quantityByProduct.keys()];
    const products = await Product.find({
      _id: { $in: productIds },
    });

    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more products could not be found.",
      });
    }

    // Build order items using prices stored in MongoDB.
    const orderItems = [];

    for (const product of products) {
      const quantity = quantityByProduct.get(product._id.toString());

      if (product.inStock === false) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable.`,
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      });
    }

    const totalAmount = Number(
      orderItems
        .reduce((total, item) => total + item.price * item.quantity, 0)
        .toFixed(2)
    );

    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to place your order.",
    });
  }
});

// Get the logged-in customer's orders
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your orders.",
    });
  }
});

// Get one order belonging to the logged-in customer
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    return res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Fetch order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch the order.",
    });
  }
});

module.exports = router;
