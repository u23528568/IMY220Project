=================================================================
IMY 220 Project - D2 Submission
RepoFox: Developer Collaboration Platform
=================================================================

PROJECT OVERVIEW:
----------------
RepoFox is a full-stack developer collaboration platform similar to GitHub, 
built with React, Node.js, Express, and MongoDB. The application supports 
user authentication, project management, file collaboration, friend systems, 
and real-time activity feeds.

DOCKER SETUP AND COMMANDS:
--------------------------

1. BUILD DOCKER IMAGE:
   docker build -t repofox .

2. RUN WITH DOCKER COMPOSE (Recommended):
   docker-compose up --build

3. RUN WITH DOCKER COMPOSE IN BACKGROUND:
   docker-compose up --build -d

4. STOP CONTAINERS:
   docker-compose down

5. VIEW RUNNING CONTAINERS:
   docker ps

6. VIEW CONTAINER LOGS:
   docker logs d1-app-1
   docker logs d1-mongodb-1

7. REBUILD AFTER CODE CHANGES:
   docker-compose down
   docker-compose up --build

DATABASE SETUP:
--------------

OPTION 1 - DOCKER MONGODB (Included in docker-compose):
The project uses a self-hosted MongoDB container that starts automatically
with docker-compose up. No additional setup required.

Database: repofox
Collections: users, projects, checkins
Connection: mongodb://mongodb:27017/repofox (internal Docker network)

OPTION 2 - LOCAL MONGODB:
If running without Docker, install MongoDB locally:
Connection String: mongodb://localhost:27017/repofox

APPLICATION ACCESS:
------------------
After starting containers:
- Frontend Application: http://localhost:5000
- API Endpoints: http://localhost:5000/api
- MongoDB: localhost:27017 (internal to Docker)

PROJECT STRUCTURE:
-----------------
D1/
├── backend/                 # Node.js/Express server
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── seedData.js        # Database seeding
│   └── server.js          # Main server file
├── frontend/               # React application
│   ├── public/            # Static assets
│   ├── src/               # React components and pages
│   └── tailwind.config.js # Styling configuration
├── Dockerfile             # Docker build instructions
├── docker-compose.yml     # Multi-container setup
├── package.json          # Dependencies and scripts
└── webpack.config.js     # Build configuration

DEVELOPMENT COMMANDS:
--------------------

1. INSTALL DEPENDENCIES:
   npm install

2. RUN IN DEVELOPMENT MODE (without Docker):
   npm run dev

3. BUILD PRODUCTION VERSION:
   npm run build

4. RUN BACKEND ONLY:
   npm run backend

5. RUN FRONTEND ONLY:
   npm run frontend


-------------------
Student: Ronan Smart
Student Number: u23528568
=================================================================