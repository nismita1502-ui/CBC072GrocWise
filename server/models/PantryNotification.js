
const mongoose = require("mongoose");

const pantryNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    pantryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PantryItem",
      default: null,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["low_stock", "empty"],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Supports quick retrieval of a user's newest notifications.
pantryNotificationSchema.index({
  user: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "PantryNotification",
  pantryNotificationSchema
);
