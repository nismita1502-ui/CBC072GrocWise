
require("dotenv").config({
  path: require("path").join(__dirname, ".env")
});

const mongoose = require("mongoose");
const Product = require("./models/Product");


const mongoose = require("mongoose");
const Product = require("./models/Product");

// Temporary image URLs for testing the product-image layout.
// These use Unsplash's image service.
const imageByProduct = {
    
  "Green Grapes": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=500",
  "Mangoes": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500",
  "Fresh Strawberries": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500",
  "Watermelon": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500",
  "Pineapple": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=500",
  "Papaya": "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=500",
  "Pomegranates": "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=500",
  "Potatoes": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500",
  "Onions": "https://images.unsplash.com/photo-1508747703725-719777637510?w=500",
  "Green Capsicum": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500",
  "Cucumber": "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=500",
  "Fresh Spinach": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500",
  "Cauliflower": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=500",
  "Green Beans": "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=500",
  
  "Fresh Ginger": "https://images.unsplash.com/photo-1615485500704-8e990f9900f3?w=500",
  "Salt": "https://images.unsplash.com/photo-1518110925495-5fe2fda0442a?w=500",
  "Burger Buns": "https://images.unsplash.com/photo-1608198093002-ad4e005484df?w=500",

  "Fresh Garlic": "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=500",
  "Butter": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500",
  "Plain Yogurt": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500",
  "Paneer": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
  "Buttermilk": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500",
  "Fresh Cream": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500",
  
  "Chocolate Muffins": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500",
  "Croissants": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500",
  "Cookies": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500",
  "Plain Cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
  "Pizza Base": "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=500",
  "Wheat Flour": "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=500",
  "Toor Dal": "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500",
  "Chickpeas": "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=500",
  "Sugar": "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500",
  
  "Cooking Oil": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
  "Peanut Butter": "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=500",
  "Corn Flakes": "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=500",
  "Green Tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
  "Pasta": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=500",
  "Tomato Ketchup": "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=500",
  "Mixed Nuts": "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=500",

  
  "Bananas": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500",
  "Fresh Carrots": "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=500",
  "Broccoli": "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500",
  "Farm Milk": "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500",
  "Farm Eggs": "https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=500",
  "Whole Wheat Bread": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
  "Rolled Oats": "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500",
  "Fresh Tomatoes": "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500",
  "Sweet Oranges": "https://images.unsplash.com/photo-1547514701-42782101795e?w=500",
  "Cheddar Cheese": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500",
  "Basmati Rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500"
};

async function addProductImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    let updated = 0;

    for (const [name, image] of Object.entries(imageByProduct)) {
      const result = await Product.updateOne(
        { name },
        { $set: { image } }
      );

      if (result.matchedCount > 0) {
        updated++;
      } else {
        console.log(`Product not found: ${name}`);
      }
    }

    console.log(`Products updated with images: ${updated}`);
    console.log("Run complete.");
  } catch (error) {
    console.error("Failed to add images:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

addProductImages();
