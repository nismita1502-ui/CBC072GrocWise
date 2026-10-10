
const express = require("express");
const mongoose = require("mongoose");

const PantryItem = require("../models/PantryItem");
const PantryUsage = require("../models/PantryUsage");
const PantryNotification = require("../models/PantryNotification");
const authMiddleware = require("../middleware/authMiddleware");
const {
  processPantryForUser,
} = require("../services/processPantryUsage");

const router = express.Router();

router.use(authMiddleware);

function validNumber(value, allowZero = true) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    (allowZero ? value >= 0 : value > 0)
  );
}

function validDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const parsed = new Date(`${date}T00:00:00.000Z`);

  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

async function createStockAlert(item, previousQuantity) {
  let type = null;

  if (item.quantity <= 0 && previousQuantity > 0) {
    type = "empty";
  } else if (
    previousQuantity > item.lowStockThreshold &&
    item.quantity <= item.lowStockThreshold &&
    item.quantity > 0
  ) {
    type = "low_stock";
  }

  if (!type) return;

  const existing = await PantryNotification.findOne({
    user: item.user,
    pantryItem: item._id,
    type,
    createdAt: {
      $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  if (existing) return;

  const isEmpty = type === "empty";

  await PantryNotification.create({
    user: item.user,
    pantryItem: item._id,
    itemName: item.name,
    type,
    title: isEmpty
      ? `${item.name} is empty`
      : `${item.name} is running low`,
    message: isEmpty
      ? `Your ${item.name} stock has reached zero. Please refill it.`
      : `Only ${item.quantity} ${item.unit} of ${item.name} remains.`,
  });
}

// GET /api/pantry
// Automatically processes missed days, then returns pantry items.
router.get("/", async (req, res) => {
  try {
    await processPantryForUser(req.userId);

    const items = await PantryItem.find({
      user: req.userId,
      isActive: true,
    }).sort({ name: 1 });

    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Fetch pantry error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch pantry items.",
    });
  }
});

// POST /api/pantry
// Add a pantry item.
router.post("/", async (req, res) => {
  try {
    const {
      name,
      category,
      unit,
      quantity,
      dailyUsage,
      lowStockThreshold,
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof unit !== "string" ||
      !unit.trim() ||
      !validNumber(quantity) ||
      !validNumber(dailyUsage) ||
      !validNumber(lowStockThreshold ?? 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a name, unit, quantity, daily usage and threshold.",
      });
    }

    const item = await PantryItem.create({
      user: req.userId,
      name: name.trim(),
      category:
        typeof category === "string" && category.trim()
          ? category.trim()
          : "Other",
      unit: unit.trim(),
      quantity,
      dailyUsage,
      lowStockThreshold: lowStockThreshold ?? 1,
      lastAutoDeductAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Pantry item added successfully.",
      item,
    });
  } catch (error) {
    console.error("Add pantry item error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to add pantry item.",
    });
  }
});

// POST /api/pantry/:id/consume
// Record actual consumption and deduct the quantity.
router.post("/:id/consume", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pantry item ID.",
      });
    }

    const { quantity, notes, entryDate } = req.body;

    if (!validNumber(quantity, false)) {
      return res.status(400).json({
        success: false,
        message: "Consumption must be greater than zero.",
      });
    }

    if (entryDate !== undefined && !validDate(entryDate)) {
      return res.status(400).json({
        success: false,
        message: "Date must use YYYY-MM-DD format.",
      });
    }

    if (notes !== undefined && typeof notes !== "string") {
      return res.status(400).json({
        success: false,
        message: "Notes must be text.",
      });
    }

    const item = await PantryItem.findOne({
      _id: req.params.id,
      user: req.userId,
      isActive: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found.",
      });
    }

    if (quantity > item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${item.quantity} ${item.unit} remains.`,
      });
    }

    const previousQuantity = item.quantity;
    const nextQuantity = Number(
      Math.max(0, previousQuantity - quantity).toFixed(6)
    );

    const usage = await PantryUsage.create({
      user: req.userId,
      pantryItem: item._id,
      itemName: item.name,
      quantityUsed: quantity,
      unit: item.unit,
      entryDate: entryDate
        ? new Date(`${entryDate}T12:00:00.000Z`)
        : new Date(),
      entryType: "manual",
      notes: (notes || "").trim(),
    });

    try {
      item.quantity = nextQuantity;
      await item.save();
      await createStockAlert(item, previousQuantity);
    } catch (error) {
      await PantryUsage.deleteOne({ _id: usage._id });
      throw error;
    }

    res.status(201).json({
      success: true,
      message: "Daily usage recorded successfully.",
      item,
      usage,
    });
  } catch (error) {
    console.error("Record usage error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to record usage.",
    });
  }
});

// POST /api/pantry/:id/refill
router.post("/:id/refill", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pantry item ID.",
      });
    }

    const { quantity } = req.body;

    if (!validNumber(quantity, false)) {
      return res.status(400).json({
        success: false,
        message: "Refill quantity must be greater than zero.",
      });
    }

    const item = await PantryItem.findOne({
      _id: req.params.id,
      user: req.userId,
      isActive: true,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found.",
      });
    }

    item.quantity = Number((item.quantity + quantity).toFixed(6));
    await item.save();

    res.json({
      success: true,
      message: "Pantry stock refilled successfully.",
      item,
    });
  } catch (error) {
    console.error("Refill error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to refill pantry stock.",
    });
  }
});

// GET /api/pantry/usage/history
router.get("/usage/history", async (req, res) => {
  try {
    const history = await PantryUsage.find({
      user: req.userId,
    })
      .sort({ entryDate: -1, createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Usage history error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch usage history.",
    });
  }
});

// GET /api/pantry/notifications
router.get("/notifications", async (req, res) => {
  try {
    const notifications = await PantryNotification.find({
      user: req.userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: notifications.length,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      notifications,
    });
  } catch (error) {
    console.error("Notifications error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch notifications.",
    });
  }
});

// PATCH /api/pantry/notifications/:id/read
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    const notification = await PantryNotification.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
});

module.exports = router;
