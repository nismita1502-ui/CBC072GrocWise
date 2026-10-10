
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/Product");


const products = [
  // Fruits
  { name: "Fresh Apples", category: "Fruits", price: 140, unit: "1 kg", emoji: "🍎", color: "#fff0e9", tag: "Popular" },
  { name: "Bananas", category: "Fruits", price: 50, unit: "1 dozen", emoji: "🍌", color: "#fff8d9", tag: "Fresh pick" },
  { name: "Sweet Oranges", category: "Fruits", price: 90, unit: "1 kg", emoji: "🍊", color: "#fff0d9" },
  { name: "Green Grapes", category: "Fruits", price: 80, unit: "500 g", emoji: "🍇", color: "#f0e9ff" },
  { name: "Mangoes", category: "Fruits", price: 120, unit: "1 kg", emoji: "🥭", color: "#fff1d6", tag: "Seasonal" },
  { name: "Fresh Strawberries", category: "Fruits", price: 150, unit: "250 g", emoji: "🍓", color: "#ffe9ed" },
  { name: "Watermelon", category: "Fruits", price: 60, unit: "1 piece", emoji: "🍉", color: "#e8f5e9" },
  { name: "Pineapple", category: "Fruits", price: 70, unit: "1 piece", emoji: "🍍", color: "#fff4ce" },
  { name: "Papaya", category: "Fruits", price: 55, unit: "1 piece", emoji: "🍈", color: "#fff0df" },
  { name: "Pomegranates", category: "Fruits", price: 130, unit: "500 g", emoji: "🍎", color: "#ffe9e5" },

  // Vegetables
  { name: "Fresh Carrots", category: "Vegetables", price: 40, unit: "500 g", emoji: "🥕", color: "#fff0df" },
  { name: "Broccoli", category: "Vegetables", price: 65, unit: "1 piece", emoji: "🥦", color: "#e8f5e9" },
  { name: "Fresh Tomatoes", category: "Vegetables", price: 35, unit: "500 g", emoji: "🍅", color: "#ffe9e5" },
  { name: "Potatoes", category: "Vegetables", price: 30, unit: "1 kg", emoji: "🥔", color: "#f3efe5" },
  { name: "Onions", category: "Vegetables", price: 35, unit: "1 kg", emoji: "🧅", color: "#f8eadb" },
  { name: "Green Capsicum", category: "Vegetables", price: 40, unit: "500 g", emoji: "🫑", color: "#e8f5e9" },
  { name: "Cucumber", category: "Vegetables", price: 25, unit: "500 g", emoji: "🥒", color: "#edf7df" },
  { name: "Fresh Spinach", category: "Vegetables", price: 30, unit: "1 bunch", emoji: "🥬", color: "#e8f5e9" },
  { name: "Cauliflower", category: "Vegetables", price: 45, unit: "1 piece", emoji: "🥦", color: "#f4eddf" },
  { name: "Green Beans", category: "Vegetables", price: 40, unit: "500 g", emoji: "🫛", color: "#edf7df" },
  { name: "Fresh Ginger", category: "Vegetables", price: 25, unit: "100 g", emoji: "🫚", color: "#f8eadb" },
  { name: "Fresh Garlic", category: "Vegetables", price: 35, unit: "250 g", emoji: "🧄", color: "#f3efe5" },

  // Dairy
  { name: "Farm Milk", category: "Dairy", price: 32, unit: "500 ml", emoji: "🥛", color: "#eaf3ff" },
  { name: "Farm Eggs", category: "Dairy", price: 78, unit: "6 pieces", emoji: "🥚", color: "#fff0d8" },
  { name: "Cheddar Cheese", category: "Dairy", price: 110, unit: "200 g", emoji: "🧀", color: "#fff4ce" },
  { name: "Butter", category: "Dairy", price: 55, unit: "100 g", emoji: "🧈", color: "#fff8d9" },
  { name: "Plain Yogurt", category: "Dairy", price: 40, unit: "400 g", emoji: "🥣", color: "#eaf3ff" },
  { name: "Paneer", category: "Dairy", price: 90, unit: "200 g", emoji: "🧀", color: "#fff4ce" },
  { name: "Buttermilk", category: "Dairy", price: 25, unit: "500 ml", emoji: "🥛", color: "#eaf3ff" },
  { name: "Fresh Cream", category: "Dairy", price: 65, unit: "200 ml", emoji: "🥛", color: "#fff0e9" },

  // Bakery
  { name: "Whole Wheat Bread", category: "Bakery", price: 45, unit: "1 loaf", emoji: "🍞", color: "#f8eadb" },
  { name: "Burger Buns", category: "Bakery", price: 35, unit: "4 pieces", emoji: "🍔", color: "#f8eadb" },
  { name: "Chocolate Muffins", category: "Bakery", price: 60, unit: "2 pieces", emoji: "🧁", color: "#f4eddf" },
  { name: "Croissants", category: "Bakery", price: 75, unit: "2 pieces", emoji: "🥐", color: "#fff0df" },
  { name: "Cookies", category: "Bakery", price: 50, unit: "200 g", emoji: "🍪", color: "#f8eadb" },
  { name: "Plain Cake", category: "Bakery", price: 120, unit: "250 g", emoji: "🍰", color: "#ffe9ed" },
  { name: "Pizza Base", category: "Bakery", price: 40, unit: "2 pieces", emoji: "🍕", color: "#f8eadb" },

  // Pantry
  { name: "Rolled Oats", category: "Pantry", price: 120, unit: "500 g", emoji: "🥣", color: "#f4eddf", tag: "Good value" },
  { name: "Basmati Rice", category: "Pantry", price: 85, unit: "1 kg", emoji: "🍚", color: "#f3efe5" },
  { name: "Wheat Flour", category: "Pantry", price: 55, unit: "1 kg", emoji: "🌾", color: "#f4eddf" },
  { name: "Toor Dal", category: "Pantry", price: 95, unit: "500 g", emoji: "🫘", color: "#fff0d9" },
  { name: "Chickpeas", category: "Pantry", price: 70, unit: "500 g", emoji: "🫘", color: "#f4eddf" },
  { name: "Sugar", category: "Pantry", price: 45, unit: "1 kg", emoji: "🍚", color: "#f3efe5" },
  { name: "Salt", category: "Pantry", price: 25, unit: "1 kg", emoji: "🧂", color: "#eaf3ff" },
  { name: "Cooking Oil", category: "Pantry", price: 150, unit: "1 litre", emoji: "🫒", color: "#fff4ce" },
  { name: "Peanut Butter", category: "Pantry", price: 130, unit: "340 g", emoji: "🥜", color: "#f8eadb" },
  { name: "Corn Flakes", category: "Pantry", price: 110, unit: "500 g", emoji: "🥣", color: "#fff4ce" },
  { name: "Green Tea", category: "Pantry", price: 90, unit: "25 bags", emoji: "🍵", color: "#edf7df" },
  { name: "Pasta", category: "Pantry", price: 60, unit: "500 g", emoji: "🍝", color: "#fff0d9" },
  { name: "Tomato Ketchup", category: "Pantry", price: 75, unit: "500 g", emoji: "🍅", color: "#ffe9e5" },
  { name: "Mixed Nuts", category: "Pantry", price: 180, unit: "200 g", emoji: "🥜", color: "#f4eddf" }
];


async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Avoid duplicating products if the script is run again.
    for (const product of products) {
      await Product.updateOne(
        { name: product.name },
        { $set: product },
        { upsert: true, runValidators: true }
      );
    }

    console.log("12 GrocWise products added or updated successfully");

    const count = await Product.countDocuments();
    console.log("Total products in collection:", count);
  } catch (error) {
    console.error("Product seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
