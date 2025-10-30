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
        username: 'admin',
        email: 'admin@repofox.com',
        password: await bcrypt.hash('admin123', 12),
        isAdmin: true,
        profile: {
          name: 'Admin User',
          bio: 'System Administrator',
          avatar: ''
        }
      },
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

    const createdUsers = await User.insertMany(users);
    console.log('Users created:', createdUsers.length);

    // Create Projects
    const projects = [
      {
        name: 'E-Commerce Platform',
        description: 'A modern e-commerce platform built with React and Node.js featuring user authentication, product management, and payment integration.',
        owner: createdUsers[1]._id,
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
            createdBy: createdUsers[1]._id
          },
          {
            name: 'package.json',
            path: '/',
            type: 'file',
            content: '{\n  "name": "ecommerce-platform",\n  "version": "1.0.0",\n  "description": "Modern e-commerce platform",\n  "main": "server.js",\n  "scripts": {\n    "start": "node server.js",\n    "dev": "nodemon server.js"\n  },\n  "dependencies": {\n    "express": "^4.18.0",\n    "react": "^18.0.0"\n  }\n}',
            mimeType: 'application/json',
            createdBy: createdUsers[1]._id
          }
        ],
        members: [
          { user: createdUsers[2]._id, role: 'collaborator' }
        ]
      },
      {
        name: 'Task Management App',
        description: 'A collaborative task management application with real-time updates, team collaboration features, and progress tracking.',
        owner: createdUsers[2]._id,
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
            createdBy: createdUsers[2]._id
          },
          {
            name: 'src',
            path: '/',
            type: 'folder',
            createdBy: createdUsers[2]._id
          },
          {
            name: 'App.js',
            path: '/src',
            type: 'file',
            content: 'import React from "react";\nimport TaskList from "./components/TaskList";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Task Management</h1>\n      <TaskList />\n    </div>\n  );\n}\n\nexport default App;',
            mimeType: 'text/javascript',
            createdBy: createdUsers[2]._id
          }
        ],
        members: [
          { user: createdUsers[1]._id, role: 'collaborator' },
          { user: createdUsers[3]._id, role: 'admin' }
        ]
      },
      {
        name: 'Weather Dashboard',
        description: 'A beautiful weather dashboard application that displays current weather conditions and forecasts for multiple cities.',
        owner: createdUsers[3]._id,
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
            createdBy: createdUsers[3]._id
          }
        ]
      },
      {
        name: 'Social Media Analytics Tool',
        description: 'Analytics dashboard for tracking social media metrics across multiple platforms with data visualization and export features.',
        owner: createdUsers[4]._id,
        visibility: 'public',
        type: 'react',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Social Media Analytics\n\nTrack and analyze your social media performance.\n\n## Features\n- Multi-platform support\n- Real-time metrics\n- Custom reports\n- Data export to CSV/PDF\n\n## Supported Platforms\n- Twitter\n- Instagram\n- Facebook\n- LinkedIn',
            mimeType: 'text/markdown',
            createdBy: createdUsers[4]._id
          }
        ],
        members: [
          { user: createdUsers[5]._id, role: 'collaborator' }
        ]
      },
      {
        name: 'Recipe Sharing Platform',
        description: 'Community-driven recipe sharing platform where users can post, rate, and save their favorite recipes with step-by-step instructions.',
        owner: createdUsers[5]._id,
        visibility: 'public',
        type: 'web',
        license: 'apache',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Recipe Sharing Platform\n\nShare and discover delicious recipes from around the world.\n\n## Features\n- Create and share recipes\n- Rate and review recipes\n- Save favorite recipes\n- Search by ingredients\n- Nutritional information\n\n## Tech Stack\n- Express.js\n- MongoDB\n- React.js',
            mimeType: 'text/markdown',
            createdBy: createdUsers[5]._id
          },
          {
            name: 'server.js',
            path: '/',
            type: 'file',
            content: 'const express = require("express");\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(express.json());\n\napp.get("/api/recipes", (req, res) => {\n  res.json({ message: "Recipes endpoint" });\n});\n\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});',
            mimeType: 'text/javascript',
            createdBy: createdUsers[5]._id
          }
        ]
      },
      {
        name: 'Fitness Tracking App',
        description: 'Mobile-first fitness tracker with workout logging, progress charts, and personalized fitness goals.',
        owner: createdUsers[6]._id,
        visibility: 'public',
        type: 'react',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Fitness Tracker\n\nTrack your workouts and achieve your fitness goals.\n\n## Features\n- Log workouts and exercises\n- Track progress with charts\n- Set and monitor goals\n- Calculate calories burned\n- Weekly/monthly reports\n\n## Installation\nnpm install\nnpm start',
            mimeType: 'text/markdown',
            createdBy: createdUsers[6]._id
          },
          {
            name: 'src',
            path: '/',
            type: 'folder',
            createdBy: createdUsers[6]._id
          },
          {
            name: 'App.js',
            path: '/src',
            type: 'file',
            content: 'import React, { useState } from "react";\nimport WorkoutLog from "./components/WorkoutLog";\nimport ProgressChart from "./components/ProgressChart";\n\nfunction App() {\n  const [workouts, setWorkouts] = useState([]);\n  \n  return (\n    <div className="App">\n      <h1>Fitness Tracker</h1>\n      <WorkoutLog workouts={workouts} setWorkouts={setWorkouts} />\n      <ProgressChart data={workouts} />\n    </div>\n  );\n}\n\nexport default App;',
            mimeType: 'text/javascript',
            createdBy: createdUsers[6]._id
          }
        ],
        members: [
          { user: createdUsers[7]._id, role: 'collaborator' }
        ]
      },
      {
        name: 'Budget Manager',
        description: 'Personal finance management tool for tracking expenses, creating budgets, and generating financial reports.',
        owner: createdUsers[7]._id,
        visibility: 'public',
        type: 'web',
        license: 'gpl',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Budget Manager\n\nManage your personal finances effectively.\n\n## Features\n- Track income and expenses\n- Create monthly budgets\n- Categorize transactions\n- Generate financial reports\n- Set savings goals\n\n## Security\n- All data encrypted\n- Secure authentication\n- Privacy-focused design',
            mimeType: 'text/markdown',
            createdBy: createdUsers[7]._id
          },
          {
            name: 'package.json',
            path: '/',
            type: 'file',
            content: '{\n  "name": "budget-manager",\n  "version": "2.1.0",\n  "description": "Personal finance management",\n  "main": "index.js",\n  "scripts": {\n    "start": "node server.js",\n    "test": "jest"\n  },\n  "dependencies": {\n    "express": "^4.18.0",\n    "bcrypt": "^5.1.0"\n  }\n}',
            mimeType: 'application/json',
            createdBy: createdUsers[7]._id
          }
        ]
      },
      {
        name: 'Markdown Blog Engine',
        description: 'Lightweight blog engine that uses Markdown files for content with built-in syntax highlighting and SEO optimization.',
        owner: createdUsers[8]._id,
        visibility: 'public',
        type: 'javascript',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Markdown Blog Engine\n\nSimple, fast, and SEO-friendly blog engine.\n\n## Features\n- Write posts in Markdown\n- Syntax highlighting\n- SEO optimized\n- RSS feed generation\n- Tag-based categorization\n- Static site generation\n\n## Quick Start\n1. Create a `.md` file in `/posts`\n2. Run `npm run build`\n3. Deploy to any static host',
            mimeType: 'text/markdown',
            createdBy: createdUsers[8]._id
          },
          {
            name: 'index.js',
            path: '/',
            type: 'file',
            content: 'const fs = require("fs");\nconst marked = require("marked");\nconst path = require("path");\n\nfunction buildBlog() {\n  const postsDir = path.join(__dirname, "posts");\n  const posts = fs.readdirSync(postsDir);\n  \n  posts.forEach(file => {\n    const content = fs.readFileSync(path.join(postsDir, file), "utf8");\n    const html = marked.parse(content);\n    console.log(`Built: ${file}`);\n  });\n}\n\nbuildBlog();',
            mimeType: 'text/javascript',
            createdBy: createdUsers[8]._id
          }
        ],
        members: [
          { user: createdUsers[2]._id, role: 'admin' }
        ]
      },
      {
        name: 'Real-time Chat Application',
        description: 'WebSocket-based chat application with private messaging, group chats, file sharing, and emoji support.',
        owner: createdUsers[9]._id,
        visibility: 'public',
        type: 'web',
        license: 'apache',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Real-time Chat\n\nModern chat application with real-time messaging.\n\n## Features\n- Real-time messaging with WebSockets\n- Private and group chats\n- File sharing\n- Emoji support\n- Read receipts\n- Typing indicators\n- Message encryption\n\n## Tech Stack\n- Socket.io\n- Express.js\n- MongoDB\n- React.js',
            mimeType: 'text/markdown',
            createdBy: createdUsers[9]._id
          },
          {
            name: 'server.js',
            path: '/',
            type: 'file',
            content: 'const express = require("express");\nconst http = require("http");\nconst socketIo = require("socket.io");\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = socketIo(server);\n\nio.on("connection", (socket) => {\n  console.log("User connected");\n  \n  socket.on("message", (msg) => {\n    io.emit("message", msg);\n  });\n  \n  socket.on("disconnect", () => {\n    console.log("User disconnected");\n  });\n});\n\nserver.listen(3000);',
            mimeType: 'text/javascript',
            createdBy: createdUsers[9]._id
          }
        ],
        members: [
          { user: createdUsers[1]._id, role: 'collaborator' },
          { user: createdUsers[4]._id, role: 'collaborator' }
        ]
      },
      {
        name: 'Portfolio Website Generator',
        description: 'Automated portfolio website generator with customizable themes, project showcases, and contact forms.',
        owner: createdUsers[10]._id,
        visibility: 'public',
        type: 'react',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Portfolio Generator\n\nCreate stunning portfolio websites in minutes.\n\n## Features\n- Multiple professional themes\n- Project showcase sections\n- Contact form integration\n- Responsive design\n- SEO optimized\n- Easy customization\n- Export to HTML/CSS\n\n## Usage\n1. Configure your portfolio in `config.json`\n2. Run `npm run generate`\n3. Deploy to GitHub Pages or Netlify',
            mimeType: 'text/markdown',
            createdBy: createdUsers[10]._id
          },
          {
            name: 'src',
            path: '/',
            type: 'folder',
            createdBy: createdUsers[10]._id
          }
        ]
      },
      {
        name: 'API Documentation Generator',
        description: 'Automatic API documentation generator from OpenAPI/Swagger specifications with interactive testing features.',
        owner: createdUsers[11]._id,
        visibility: 'public',
        type: 'javascript',
        license: 'apache',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# API Documentation Generator\n\nGenerate beautiful API documentation automatically.\n\n## Features\n- Parse OpenAPI/Swagger specs\n- Interactive API testing\n- Code examples in multiple languages\n- Authentication support\n- Export to PDF/HTML\n- Custom branding\n\n## Supported Formats\n- OpenAPI 3.0\n- Swagger 2.0\n- RAML\n\n## Installation\nnpm install -g api-doc-gen',
            mimeType: 'text/markdown',
            createdBy: createdUsers[11]._id
          },
          {
            name: 'index.js',
            path: '/',
            type: 'file',
            content: 'const SwaggerParser = require("@apidevtools/swagger-parser");\n\nasync function generateDocs(apiSpec) {\n  try {\n    const api = await SwaggerParser.validate(apiSpec);\n    console.log("API name: %s, Version: %s", api.info.title, api.info.version);\n    // Generate documentation HTML\n    return buildDocumentation(api);\n  } catch (err) {\n    console.error("Error parsing API spec:", err);\n  }\n}\n\nmodule.exports = { generateDocs };',
            mimeType: 'text/javascript',
            createdBy: createdUsers[11]._id
          }
        ],
        members: [
          { user: createdUsers[3]._id, role: 'collaborator' }
        ]
      },
      {
        name: 'Code Snippet Manager',
        description: 'Developer tool for organizing and managing code snippets with syntax highlighting, tags, and search functionality.',
        owner: createdUsers[4]._id,
        visibility: 'public',
        type: 'react',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Code Snippet Manager\n\nOrganize your code snippets efficiently.\n\n## Features\n- Save code snippets with syntax highlighting\n- Tag and categorize snippets\n- Full-text search\n- Export/import snippets\n- Share snippets with teams\n- Multiple language support\n\n## Supported Languages\n- JavaScript, TypeScript\n- Python, Java, C++\n- HTML, CSS, SQL\n- And 50+ more',
            mimeType: 'text/markdown',
            createdBy: createdUsers[4]._id
          },
          {
            name: 'package.json',
            path: '/',
            type: 'file',
            content: '{\n  "name": "snippet-manager",\n  "version": "1.3.0",\n  "description": "Code snippet organizer",\n  "main": "index.js",\n  "dependencies": {\n    "react": "^18.2.0",\n    "highlight.js": "^11.8.0",\n    "mongodb": "^5.6.0"\n  }\n}',
            mimeType: 'application/json',
            createdBy: createdUsers[4]._id
          }
        ],
        members: [
          { user: createdUsers[8]._id, role: 'admin' },
          { user: createdUsers[6]._id, role: 'collaborator' }
        ]
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('Projects created:', createdProjects.length);

    // Create Checkins
    const checkins = [
      {
        project: createdProjects[0]._id,
        user: createdUsers[1]._id,
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
        user: createdUsers[2]._id,
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
        user: createdUsers[1]._id,
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
        user: createdUsers[2]._id,
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
        user: createdUsers[3]._id,
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
        user: createdUsers[3]._id,
        message: 'Initial weather dashboard with API integration and responsive design',
        version: 1,
        changes: {
          added: ['index.html', 'styles.css', 'script.js'],
          modified: [],
          deleted: []
        }
      },
      {
        project: createdProjects[3]._id,
        user: createdUsers[4]._id,
        message: 'Set up analytics dashboard with chart components and data fetching',
        version: 1,
        changes: {
          added: ['src/components/Dashboard.js', 'src/services/analytics.js'],
          modified: [],
          deleted: []
        }
      },
      {
        project: createdProjects[4]._id,
        user: createdUsers[5]._id,
        message: 'Added recipe creation form and image upload functionality',
        version: 1,
        changes: {
          added: ['routes/recipes.js', 'middleware/upload.js'],
          modified: ['server.js'],
          deleted: []
        }
      },
      {
        project: createdProjects[4]._id,
        user: createdUsers[5]._id,
        message: 'Implemented recipe rating and review system',
        version: 2,
        changes: {
          added: ['models/Review.js', 'routes/reviews.js'],
          modified: ['routes/recipes.js'],
          deleted: []
        }
      },
      {
        project: createdProjects[5]._id,
        user: createdUsers[6]._id,
        message: 'Built workout logging interface with exercise database',
        version: 1,
        changes: {
          added: ['src/components/WorkoutLog.js', 'src/data/exercises.json'],
          modified: [],
          deleted: []
        }
      },
      {
        project: createdProjects[6]._id,
        user: createdUsers[7]._id,
        message: 'Created expense tracking module with category management',
        version: 1,
        changes: {
          added: ['routes/expenses.js', 'models/Expense.js', 'models/Category.js'],
          modified: [],
          deleted: []
        }
      },
      {
        project: createdProjects[7]._id,
        user: createdUsers[8]._id,
        message: 'Implemented markdown parser with syntax highlighting',
        version: 1,
        changes: {
          added: ['lib/parser.js', 'lib/highlighter.js'],
          modified: ['index.js'],
          deleted: []
        }
      },
      {
        project: createdProjects[8]._id,
        user: createdUsers[9]._id,
        message: 'Set up WebSocket server and real-time message broadcasting',
        version: 1,
        changes: {
          added: ['server.js', 'socket/handlers.js'],
          modified: [],
          deleted: []
        }
      },
      {
        project: createdProjects[8]._id,
        user: createdUsers[1]._id,
        message: 'Added file sharing and emoji picker components',
        version: 2,
        changes: {
          added: ['src/components/FileUpload.js', 'src/components/EmojiPicker.js'],
          modified: ['src/components/ChatWindow.js'],
          deleted: []
        }
      },
      {
        project: createdProjects[9]._id,
        user: createdUsers[10]._id,
        message: 'Created theme system with multiple professional templates',
        version: 1,
        changes: {
          added: ['themes/modern.js', 'themes/minimal.js', 'themes/creative.js'],
          modified: [],
          deleted: []
        }
      },
      {
        project: createdProjects[10]._id,
        user: createdUsers[11]._id,
        message: 'Implemented OpenAPI parser and documentation builder',
        version: 1,
        changes: {
          added: ['lib/parser.js', 'lib/builder.js', 'templates/api-doc.html'],
          modified: [],
          deleted: []
        }
      }
    ];

    const createdCheckins = await Checkin.insertMany(checkins);
    console.log('Checkins created:', createdCheckins.length);

    // Create friend relationships
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $push: { friends: { $each: [createdUsers[2]._id, createdUsers[3]._id, createdUsers[5]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $push: { friends: { $each: [createdUsers[1]._id, createdUsers[4]._id, createdUsers[6]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      $push: { friends: { $each: [createdUsers[1]._id, createdUsers[7]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[4]._id, {
      $push: { friends: { $each: [createdUsers[2]._id, createdUsers[8]._id, createdUsers[9]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[5]._id, {
      $push: { friends: { $each: [createdUsers[1]._id, createdUsers[6]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[6]._id, {
      $push: { friends: { $each: [createdUsers[2]._id, createdUsers[5]._id, createdUsers[10]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[7]._id, {
      $push: { friends: { $each: [createdUsers[3]._id, createdUsers[11]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[8]._id, {
      $push: { friends: { $each: [createdUsers[4]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[9]._id, {
      $push: { friends: { $each: [createdUsers[4]._id, createdUsers[10]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[10]._id, {
      $push: { friends: { $each: [createdUsers[6]._id, createdUsers[9]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[11]._id, {
      $push: { friends: { $each: [createdUsers[7]._id] } }
    });
    console.log('Friend relationships created');

    // Add favorite projects for users
    await User.findByIdAndUpdate(createdUsers[1]._id, {
      $push: { favorites: { $each: [createdProjects[1]._id, createdProjects[4]._id, createdProjects[8]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[2]._id, {
      $push: { favorites: { $each: [createdProjects[0]._id, createdProjects[7]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[3]._id, {
      $push: { favorites: { $each: [createdProjects[0]._id, createdProjects[5]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[4]._id, {
      $push: { favorites: { $each: [createdProjects[1]._id, createdProjects[8]._id, createdProjects[9]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[5]._id, {
      $push: { favorites: { $each: [createdProjects[3]._id, createdProjects[6]._id] } }
    });
    await User.findByIdAndUpdate(createdUsers[6]._id, {
      $push: { favorites: { $each: [createdProjects[4]._id, createdProjects[10]._id] } }
    });
    console.log('Favorite projects added');

    console.log('\n=== SEED DATA SUMMARY ===');
    console.log(`✅ Users: ${createdUsers.length}`);
    console.log(`✅ Projects: ${createdProjects.length}`);
    console.log(`✅ Checkins: ${createdCheckins.length}`);
    console.log('\nSample login credentials (all passwords: password123):');
    console.log('ADMIN - Username: admin, Password: admin123');
    console.log('Username: johndoe | janedoe | mikecoder');
    console.log('Username: sarahdev | alexchen | emilypark');
    console.log('Username: davidsmith | lisabrown | tomwilson');
    console.log('Username: mariag | kevinlee');

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
