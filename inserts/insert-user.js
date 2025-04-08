const connectDB = require('./db');
const User = require('./models/User');

const run = async () => {
  await connectDB();

  const user = new User({
    username: "FrankiePookie123",
    email: "UwU@example.com",
    passwordHash: "hashed_password_here" // use bcrypt in real app!
  });

  await user.save();
  console.log("✅ User saved!");
  process.exit();
};

run();
