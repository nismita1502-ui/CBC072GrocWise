
const mongoose = require("mongoose");
const Product = require("../models/Product");
const PriceHistory = require("../models/PriceHistory");

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

async function updatePrices() {
  const feedUrl = process.env.PRICE_FEED_URL;

  if (!feedUrl) {
    console.log("Price updater skipped: PRICE_FEED_URL is not configured.");
    return;
  }

  const response = await fetch(feedUrl, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Price feed returned HTTP ${response.status}`);
  }

  const feed = await response.json();

  if (!Array.isArray(feed)) {
    throw new Error("Price feed must return a JSON array.");
  }

  const products = await Product.find({});
  const productMap = new Map(
    products.map((product) => [
      normalizeName(product.name),
      product,
    ])
  );

  let updated = 0;
  let skipped = 0;

  for (const item of feed) {
    const name = normalizeName(item.name);
    const newPrice = Number(item.price);

    if (!name || !Number.isFinite(newPrice) || newPrice <= 0) {
      skipped++;
      continue;
    }

    const product = productMap.get(name);

    if (!product) {
      skipped++;
      continue;
    }

    const oldPrice = Number(product.price);

    if (!Number.isFinite(oldPrice)) {
      skipped++;
      continue;
    }

    if (oldPrice === newPrice) {
      continue;
    }

    // Save the change before modifying the product.
    await PriceHistory.create({
      productId: product._id,
      productName: product.name,
      oldPrice,
      newPrice,
      currency: item.currency || "INR",
      source: String(item.source || "Configured price feed"),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    });

    // Change only the price field.
    await Product.updateOne(
      { _id: product._id },
      { $set: { price: newPrice } }
    );

    updated++;
  }

  console.log(
    `Price update complete: ${updated} updated, ${skipped} skipped.`
  );

  return { updated, skipped };
}

module.exports = { updatePrices };
