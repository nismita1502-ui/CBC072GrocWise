
require("dotenv").config({
  path: require("path").join(__dirname, ".env")
});

const mongoose = require("mongoose");
const Product = require("./models/Product");

async function deleteProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const names = [
      "Sugar",
      "Rolled Oats",
      "Burger Buns",
      "Fresh Ginger",
      "Salt"
    ];

    for (const name of names) {
      const result = await Product.deleteOne({ name });
      console.log(
        `${name}: ${result.deletedCount ? "Deleted" : "Not found"}`
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

deleteProducts();
