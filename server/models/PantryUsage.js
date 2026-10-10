
const mongoose = require("mongoose");

const pantryUsageSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    quantityUsed: {
      type: Number,
      required: true,
      min: 0.000001,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    entryType: {
      type: String,
      enum: ["manual", "automatic"],
      required: true,
      default: "manual",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
  },
  { timestamps: true }
);

pantryUsageSchema.index({
  user: 1,
  pantryItem: 1,
  entryDate: -1,
});

module.exports = mongoose.model("PantryUsage", pantryUsageSchema);
