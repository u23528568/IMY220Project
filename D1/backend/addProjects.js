const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');

// Use environment variable for MongoDB URI (Docker) or fallback to localhost
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/repofox';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const addProjects = async () => {
  try {
    // Get existing users
    const users = await User.find({});
    
    if (users.length < 10) {
      console.log('⚠️  Warning: Less than 10 users found. Some projects may not be created.');
    }

    console.log(`Found ${users.length} existing users`);

    // Check existing project count
    const existingCount = await Project.countDocuments();
    console.log(`Currently ${existingCount} projects in database`);

    // Create new projects
    const newProjects = [
      {
        name: 'Social Media Analytics Tool',
        description: 'Analytics dashboard for tracking social media metrics across multiple platforms with data visualization and export features.',
        owner: users[4]?._id || users[0]._id,
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
            createdBy: users[4]?._id || users[0]._id
          }
        ],
        members: users[5] ? [{ user: users[5]._id, role: 'collaborator' }] : []
      },
      {
        name: 'Recipe Sharing Platform',
        description: 'Community-driven recipe sharing platform where users can post, rate, and save their favorite recipes with step-by-step instructions.',
        owner: users[5]?._id || users[0]._id,
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
            createdBy: users[5]?._id || users[0]._id
          }
        ]
      },
      {
        name: 'Fitness Tracking App',
        description: 'Mobile-first fitness tracker with workout logging, progress charts, and personalized fitness goals.',
        owner: users[6]?._id || users[0]._id,
        visibility: 'public',
        type: 'react',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Fitness Tracker\n\nTrack your workouts and achieve your fitness goals.\n\n## Features\n- Log workouts and exercises\n- Track progress with charts\n- Set and monitor goals\n- Calculate calories burned\n- Weekly/monthly reports',
            mimeType: 'text/markdown',
            createdBy: users[6]?._id || users[0]._id
          }
        ]
      },
      {
        name: 'Budget Manager',
        description: 'Personal finance management tool for tracking expenses, creating budgets, and generating financial reports.',
        owner: users[7]?._id || users[0]._id,
        visibility: 'public',
        type: 'web',
        license: 'gpl',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Budget Manager\n\nManage your personal finances effectively.\n\n## Features\n- Track income and expenses\n- Create monthly budgets\n- Categorize transactions\n- Generate financial reports\n- Set savings goals',
            mimeType: 'text/markdown',
            createdBy: users[7]?._id || users[0]._id
          }
        ]
      },
      {
        name: 'Markdown Blog Engine',
        description: 'Lightweight blog engine that uses Markdown files for content with built-in syntax highlighting and SEO optimization.',
        owner: users[8]?._id || users[0]._id,
        visibility: 'public',
        type: 'javascript',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Markdown Blog Engine\n\nSimple, fast, and SEO-friendly blog engine.\n\n## Features\n- Write posts in Markdown\n- Syntax highlighting\n- SEO optimized\n- RSS feed generation\n- Tag-based categorization\n- Static site generation',
            mimeType: 'text/markdown',
            createdBy: users[8]?._id || users[0]._id
          }
        ]
      },
      {
        name: 'Real-time Chat Application',
        description: 'WebSocket-based chat application with private messaging, group chats, file sharing, and emoji support.',
        owner: users[9]?._id || users[0]._id,
        visibility: 'public',
        type: 'web',
        license: 'apache',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Real-time Chat\n\nModern chat application with real-time messaging.\n\n## Features\n- Real-time messaging with WebSockets\n- Private and group chats\n- File sharing\n- Emoji support\n- Read receipts\n- Typing indicators',
            mimeType: 'text/markdown',
            createdBy: users[9]?._id || users[0]._id
          }
        ]
      },
      {
        name: 'Portfolio Website Generator',
        description: 'Automated portfolio website generator with customizable themes, project showcases, and contact forms.',
        owner: users[10]?._id || users[0]._id,
        visibility: 'public',
        type: 'react',
        license: 'mit',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# Portfolio Generator\n\nCreate stunning portfolio websites in minutes.\n\n## Features\n- Multiple professional themes\n- Project showcase sections\n- Contact form integration\n- Responsive design\n- SEO optimized\n- Easy customization',
            mimeType: 'text/markdown',
            createdBy: users[10]?._id || users[0]._id
          }
        ]
      },
      {
        name: 'API Documentation Generator',
        description: 'Automatic API documentation generator from OpenAPI/Swagger specifications with interactive testing features.',
        owner: users[11]?._id || users[0]._id,
        visibility: 'public',
        type: 'javascript',
        license: 'apache',
        files: [
          {
            name: 'README.md',
            path: '/',
            type: 'file',
            content: '# API Documentation Generator\n\nGenerate beautiful API documentation automatically.\n\n## Features\n- Parse OpenAPI/Swagger specs\n- Interactive API testing\n- Code examples in multiple languages\n- Authentication support\n- Export to PDF/HTML',
            mimeType: 'text/markdown',
            createdBy: users[11]?._id || users[0]._id
          }
        ]
      }
    ];

    // Only add projects that don't already exist (check by name)
    const projectsToAdd = [];
    for (const proj of newProjects) {
      const exists = await Project.findOne({ name: proj.name });
      if (!exists) {
        projectsToAdd.push(proj);
      } else {
        console.log(`⏭️  Skipping "${proj.name}" - already exists`);
      }
    }

    if (projectsToAdd.length === 0) {
      console.log('\n✅ All projects already exist. No new projects added.');
    } else {
      const created = await Project.insertMany(projectsToAdd);
      console.log(`\n✅ Added ${created.length} new projects!`);
      
      const newCount = await Project.countDocuments();
      console.log(`📊 Total projects in database: ${newCount}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error adding projects:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await addProjects();
};

run();
