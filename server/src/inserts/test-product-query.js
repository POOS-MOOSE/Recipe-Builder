const connectDB = require('../db');
const { findProductByWalmartId } = require('../queries/productQueries');

const run = async () => {
  await connectDB();

  const product = await findProductByWalmartId('jif12345');
  console.log('🔍 Product found:', product);

  process.exit();
};

run();
