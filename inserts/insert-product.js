const connectDB = require('../db');
const Product = require('../models/Product');

const run = async () => {
  await connectDB();

  const testProduct = new Product({
    name: "JIF Creamy Peanut Butter, 16 oz",
    walmartItemId: "jif12345",
    price: 3.49,
    imageUrl: "https://example.com/jif.jpg",
    availability: true
  });

  await testProduct.save();
  console.log("✅ Product saved!");
  process.exit();
};

run();
