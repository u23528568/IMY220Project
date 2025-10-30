const mongoose = require('mongoose');
const User = require('./models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/repofox', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Make a user admin
const makeAdmin = async (emailOrUsername) => {
  try {
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      console.log('❌ User not found with email/username:', emailOrUsername);
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log('✅ User is already an admin!');
      console.log('User:', user.username, `(${user.email})`);
      process.exit(0);
    }

    user.isAdmin = true;
    await user.save();

    console.log('✅ User promoted to admin successfully!');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Name:', user.profile?.name || 'N/A');
    console.log('\n🎉 You can now login and access /admin');

  } catch (error) {
    console.error('Error making user admin:', error);
  } finally {
    process.exit(0);
  }
};

// Run the script
const run = async () => {
  await connectDB();
  
  // Get email/username from command line argument
  const emailOrUsername = process.argv[2];
  
  if (!emailOrUsername) {
    console.log('❌ Please provide an email or username');
    console.log('\nUsage: node makeAdmin.js <email-or-username>');
    console.log('Example: node makeAdmin.js john@example.com');
    console.log('Example: node makeAdmin.js johndoe');
    process.exit(1);
  }
  
  await makeAdmin(emailOrUsername);
};

run();
