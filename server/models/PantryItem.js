
const mongoose = require("mongoose");

const pantryItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Other",
      trim: true,
    },

    // Examples: kg, g, L, ml, pieces.
    // Keep the same unit for stock and daily usage.
    unit: {
      type: String,
      required: true,
      trim: true,
    },

    // Quantity currently remaining.
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    // Expected quantity consumed each day.
    dailyUsage: {
      type: Number,
      required: true,
      min: 0,
    },

    // Notify the user when stock reaches this level.
    lowStockThreshold: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    // Used to avoid deducting the same day twice.
    lastAutoDeductAt: {
      type: Date,
      default: null,
    },

    // Allows users to archive an item without deleting its history.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

pantryItemSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model("PantryItem", pantryItemSchema);
