const connectDB = require('../db');
const { findUserByEmail } = require('../queries/userQueries');

const run = async () => {
  await connectDB();

  const user = await findUserByEmail('xander@example.com');
  console.log('🔍 Found user:', user);

  process.exit();
};

run();
