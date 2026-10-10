
const express = require("express");
const axios = require("axios");

const router = express.Router();

const MANDI_API =
  "https://mandi-api.onrender.com/v1/prices";

const STATES = [
  "Karnataka",
  "Maharashtra",
  "Uttar Pradesh",
  "Punjab",
  "Madhya Pradesh",
];

function dateValue(value) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

router.get("/", async (req, res) => {
  try {
    // Fetch the latest available prices from each supported state.
    const responses = await Promise.all(
      STATES.map((state) =>
        axios.get(MANDI_API, {
          params: { state },
          timeout: 25000,
        })
      )
    );

    const allRecords = responses.flatMap((response) => {
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    });

    // Exclude records with missing or invalid prices.
    const validRecords = allRecords.filter((item) => {
      const min = Number(item.min_price);
      const max = Number(item.max_price);
      const modal = Number(item.modal_price);

      return (
        item.commodity &&
        item.market &&
        item.arrival_date &&
        Number.isFinite(min) &&
        Number.isFinite(max) &&
        Number.isFinite(modal) &&
        min > 0 &&
        max > 0 &&
        modal > 0
      );
    });

    // Sort the latest reported records first.
    validRecords.sort(
      (a, b) =>
        dateValue(b.arrival_date) -
        dateValue(a.arrival_date)
    );

    // Keep one record per distinct commodity name.
    const uniqueCommodities = new Map();

    for (const item of validRecords) {
      const key = item.commodity.trim().toLowerCase();

      if (!uniqueCommodities.has(key)) {
        uniqueCommodities.set(key, {
          state: item.state || "",
          district: item.district || "",
          market: item.market,
          commodity: item.commodity.trim(),
          variety: item.variety || "",
          arrivalDate: item.arrival_date,
          minPricePerQuintal: Number(item.min_price),
          maxPricePerQuintal: Number(item.max_price),
          modalPricePerQuintal: Number(item.modal_price),
          modalPricePerKg: Number(item.modal_price) / 100,
        });
      }
    }

    const records = Array.from(
      uniqueCommodities.values()
    ).slice(0, 50);

    res.json({
      success: true,
      source: "Mandi Price API",
      priceType: "Agricultural wholesale mandi prices",
      fetchedAt: new Date().toISOString(),
      count: records.length,
      records,
      message:
        records.length < 50
          ? `The source returned ${records.length} distinct eligible commodities. No prices were invented.`
          : "",
    });
  } catch (error) {
    console.error(
      "Mandi API request failed:",
      error.response?.data || error.message
    );

    res.status(502).json({
      success: false,
      message:
        "Unable to fetch market prices. Check the API status and try again.",
    });
  }
});

module.exports = router;
