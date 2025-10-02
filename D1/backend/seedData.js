const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Project = require('./models/Project');
const Checkin = require('./models/Checkin');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/repofox', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Project.deleteMany({});
    await Checkin.deleteMany({});
    console.log('Existing data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Create seed data
const seedData = async () => {
  try {
    // Create Users
    const users = [
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
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers.length);

    // Create Projects
    const projects = [
      {
        name: 'E-Commerce Platform',
        description: 'A modern e-commerce platform built with React and Node.js featuring user authentication, product management, and payment integration.',
        owner: createdUsers[0]._id,
        visibility: 'public',
        type: 'web',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# E-Commerce Platform\n\nA comprehensive e-commerce solution built with modern web technologies.\n\n## Features\n- User authentication\n- Product catalog\n- Shopping cart\n- Payment processing\n\n## Tech Stack\n- React.js\n- Node.js\n- MongoDB\n- Express.js',
            mimeType: 'text/markdown',
            createdBy: createdUsers[0]._id
          },
          {
            name: 'package.json',
            path: '/',
            type: 'file',
            content: '{\n  "name": "ecommerce-platform",\n  "version": "1.0.0",\n  "description": "Modern e-commerce platform",\n  "main": "server.js",\n  "scripts": {\n    "start": "node server.js",\n    "dev": "nodemon server.js"\n  },\n  "dependencies": {\n    "express": "^4.18.0",\n    "react": "^18.0.0"\n  }\n}',
            mimeType: 'application/json',
            createdBy: createdUsers[0]._id
          }
        ],
        members: [
          { user: createdUsers[1]._id, role: 'collaborator' }
        ]
      },
      {
        name: 'Task Management App',
        description: 'A collaborative task management application with real-time updates, team collaboration features, and progress tracking.',
        owner: createdUsers[1]._id,
        visibility: 'public',
        type: 'react',
        license: 'apache',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Task Management App\n\nCollaborative task management with real-time updates.\n\n## Features\n- Create and assign tasks\n- Real-time collaboration\n- Progress tracking\n- Team management\n\n## Installation\n1. Clone the repository\n2. Run `npm install`\n3. Run `npm start`',
            mimeType: 'text/markdown',
            createdBy: createdUsers[1]._id
          },
          {
            name: 'src',
            path: '/',
            type: 'folder',
            createdBy: createdUsers[1]._id
          },
          {
            name: 'App.js',
            path: '/src',
            type: 'file',
            content: 'import React from "react";\nimport TaskList from "./components/TaskList";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Task Management</h1>\n      <TaskList />\n    </div>\n  );\n}\n\nexport default App;',
            mimeType: 'text/javascript',
            createdBy: createdUsers[1]._id
          }
        ],
        members: [
          { user: createdUsers[0]._id, role: 'collaborator' },
          { user: createdUsers[2]._id, role: 'admin' }
        ]
      },
      {
        name: 'Weather Dashboard',
        description: 'A beautiful weather dashboard application that displays current weather conditions and forecasts for multiple cities.',
        owner: createdUsers[2]._id,
        visibility: 'private',
        type: 'javascript',
        license: 'none',
        files: [
          {
            name: 'index.html',
            path: '/',
            type: 'file',
            content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Weather Dashboard</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <div id="app">\n        <h1>Weather Dashboard</h1>\n        <div id="weather-container"></div>\n    </div>\n    <script src="script.js"></script>\n</body>\n</html>',
            mimeType: 'text/html',
            createdBy: createdUsers[2]._id
          }
        ]
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('Projects created:', createdProjects.length);

    // Create Checkins
    const checkins = [
      {
        project: createdProjects[0]._id,
        user: createdUsers[0]._id,
        message: 'Initial project setup with basic structure and authentication',
        version: 1,
        changes: {
          added: ['server.js', 'package.json', 'README.md'],
          modified: [],
          deleted: []
        }
      },
      {
        project: createdProjects[0]._id,
        user: createdUsers[1]._id,
        message: 'Added product catalog functionality and API endpoints',
        version: 2,
        changes: {
          added: ['routes/products.js', 'models/Product.js'],
          modified: ['server.js'],
          deleted: []
        }
      },
      {
        project: createdProjects[0]._id,
        user: createdUsers[0]._id,
        message: 'Implemented shopping cart and user session management',
        version: 3,
        changes: {
          added: ['routes/cart.js', 'middleware/session.js'],
          modified: ['routes/products.js', 'server.js'],
          deleted: []
        }
      },
      {
        project: createdProjects[1]._id,
        user: createdUsers[1]._id,
        message: 'Created task management components and state management',
        version: 1,
        changes: {
          added: ['src/components/TaskList.js', 'src/components/TaskItem.js', 'src/context/TaskContext.js'],
          modified: [],
          deleted: []
        }
      },
      {
        project: createdProjects[1]._id,
        user: createdUsers[2]._id,
        message: 'Added real-time collaboration features with WebSocket integration',
        version: 2,
        changes: {
          added: ['src/services/websocket.js', 'server/socketHandlers.js'],
          modified: ['src/components/TaskList.js'],
          deleted: []
        }
      },
      {
        project: createdProjects[2]._id,
        user: createdUsers[2]._id,
        message: 'Initial weather dashboard with API integration and responsive design',
        version: 1,
        changes: {
          added: ['index.html', 'styles.css', 'script.js'],
          modified: [],
          deleted: []
        }
      }
    ];

    const createdCheckins = await Checkin.insertMany(checkins);
    console.log('Checkins created:', createdCheckins.length);

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`✅ Users: ${createdUsers.length}`);
    console.log(`✅ Projects: ${createdProjects.length}`);
    console.log(`✅ Checkins: ${createdCheckins.length}`);
    console.log('\nSample login credentials:');
    console.log('Username: johndoe, Password: password123');
    console.log('Username: janedoe, Password: password123');
    console.log('Username: mikecoder, Password: password123');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

// Main execution
const runSeed = async () => {
  await connectDB();
  await clearData();
  await seedData();
  
  console.log('\n🎉 Database seeded successfully!');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed, seedData, clearData };
