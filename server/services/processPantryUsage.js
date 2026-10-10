
const PantryItem = require("../models/PantryItem");
const PantryUsage = require("../models/PantryUsage");
const PantryNotification = require("../models/PantryNotification");

const TIME_ZONE = "Asia/Kolkata";

function dateKey(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dayNumber(key) {
  const [year, month, day] = key.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

async function createAlert(item, type) {
  // Keep one alert of each type per item per day.
  const today = dateKey(new Date());

  const existing = await PantryNotification.findOne({
    user: item.user,
    pantryItem: item._id,
    type,
  }).sort({ createdAt: -1 });

  if (existing && dateKey(existing.createdAt) === today) {
    return;
  }

  const empty = type === "empty";

  await PantryNotification.create({
    user: item.user,
    pantryItem: item._id,
    itemName: item.name,
    type,
    title: empty
      ? `${item.name} is empty`
      : `${item.name} is running low`,
    message: empty
      ? `Your ${item.name} stock has reached zero. Please refill it.`
      : `Only ${item.quantity} ${item.unit} of ${item.name} remains.`,
  });
}

async function processOneItem(item, today) {
  if (!item.lastAutoDeductAt) {
    item.lastAutoDeductAt = new Date();
    await item.save();
    return;
  }

  const lastDay = dateKey(item.lastAutoDeductAt);
  const elapsedDays = dayNumber(today) - dayNumber(lastDay);

  if (elapsedDays <= 0) {
    return;
  }

  // A zero daily usage means no automatic deduction.
  if (item.dailyUsage <= 0) {
    item.lastAutoDeductAt = new Date();
    await item.save();
    return;
  }

  // Prevent an unreasonable catch-up loop if the stored date is invalid.
  if (elapsedDays > 3660) {
    throw new Error(`Too many elapsed days for pantry item ${item._id}`);
  }

  for (let index = 1; index <= elapsedDays; index++) {
    const previousQuantity = item.quantity;

    if (previousQuantity <= 0) {
      item.quantity = 0;
      continue;
    }

    const used = Math.min(item.dailyUsage, previousQuantity);

    item.quantity = Number(
      Math.max(0, previousQuantity - used).toFixed(6)
    );

    // Save each day's usage, including a partial final day's consumption.
    await PantryUsage.create({
      user: item.user,
      pantryItem: item._id,
      itemName: item.name,
      quantityUsed: used,
      unit: item.unit,
      entryDate: new Date(`${addDays(lastDay, index)}T12:00:00.000Z`),
      entryType: "automatic",
      notes: "Planned daily household consumption",
    });

    if (
      previousQuantity > item.lowStockThreshold &&
      item.quantity <= item.lowStockThreshold &&
      item.quantity > 0
    ) {
      await createAlert(item, "low_stock");
    }

    if (previousQuantity > 0 && item.quantity <= 0) {
      await createAlert(item, "empty");
    }
  }

  item.lastAutoDeductAt = new Date();
  await item.save();
}

function addDays(key, amount) {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

async function processPantryForUser(userId) {
  const today = dateKey(new Date());

  const items = await PantryItem.find({
    user: userId,
    isActive: true,
  });

  for (const item of items) {
    await processOneItem(item, today);
  }
}

module.exports = { processPantryForUser };

