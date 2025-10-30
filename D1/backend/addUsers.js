const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    // Use environment variable or fallback to localhost
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/repofox';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected to:', mongoUri);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Add users without deleting existing data
const addUsers = async () => {
  try {
    const usersToAdd = [
      {
        username: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'John Doe',
          bio: 'Full-stack developer passionate about modern web technologies',
          avatar: ''
        }
      },
      {
        username: 'janedoe',
        email: 'jane@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Jane Doe',
          bio: 'Frontend specialist with expertise in React and Vue.js',
          avatar: ''
        }
      },
      {
        username: 'mikecoder',
        email: 'mike@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Mike Johnson',
          bio: 'Backend engineer specializing in Node.js and databases',
          avatar: ''
        }
      },
      {
        username: 'sarahdev',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Sarah Williams',
          bio: 'UI/UX Designer and Frontend Developer',
          avatar: ''
        }
      },
      {
        username: 'alexchen',
        email: 'alex@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Alex Chen',
          bio: 'DevOps Engineer & Cloud Infrastructure Specialist',
          avatar: ''
        }
      },
      {
        username: 'emilypark',
        email: 'emily@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Emily Park',
          bio: 'Mobile App Developer | iOS & Android',
          avatar: ''
        }
      },
      {
        username: 'davidsmith',
        email: 'david@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'David Smith',
          bio: 'Data Scientist & Machine Learning Engineer',
          avatar: ''
        }
      },
      {
        username: 'lisabrown',
        email: 'lisa@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Lisa Brown',
          bio: 'Cybersecurity Analyst & Ethical Hacker',
          avatar: ''
        }
      },
      {
        username: 'tomwilson',
        email: 'tom@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Tom Wilson',
          bio: 'Game Developer & 3D Graphics Programmer',
          avatar: ''
        }
      },
      {
        username: 'mariag',
        email: 'maria@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Maria Garcia',
          bio: 'Blockchain Developer & Smart Contract Specialist',
          avatar: ''
        }
      },
      {
        username: 'kevinlee',
        email: 'kevin@example.com',
        password: await bcrypt.hash('password123', 12),
        profile: {
          name: 'Kevin Lee',
          bio: 'QA Engineer & Test Automation Expert',
          avatar: ''
        }
      }
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const userData of usersToAdd) {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });

      if (existingUser) {
        console.log(`⏭️  Skipped: ${userData.username} (already exists)`);
        skippedCount++;
      } else {
        await User.create(userData);
        console.log(`✅ Added: ${userData.username}`);
        addedCount++;
      }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`✅ Users added: ${addedCount}`);
    console.log(`⏭️  Users skipped: ${skippedCount}`);
    console.log(`📊 Total users in database: ${await User.countDocuments()}`);
    
    if (addedCount > 0) {
      console.log('\n📝 New user credentials (password: password123):');
      const newUsers = usersToAdd.filter((_, i) => i < addedCount);
      newUsers.forEach(u => console.log(`   - ${u.username}`));
    }

  } catch (error) {
    console.error('Error adding users:', error);
  }
};

// Main execution
const run = async () => {
  await connectDB();
  await addUsers();
  
  console.log('\n🎉 Users added successfully! Your existing data is safe.');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  run();
}

module.exports = { addUsers };
