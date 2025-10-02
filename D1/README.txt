Project: Repofox

[Build and Run Commands]
1. Navigate to the project root directory (the 'D1' folder).
2. Build the Docker image using the following command:
   docker build -t repofox-app .
3. Run the application using the following command:
   docker run -p 3000:3000 repofox-app
4. Open a web browser and go to http://localhost:3000 to view the application.

[Directory Structure]
- /backend: Contains the Node.js server files (server.js, routes).
- /frontend: Contains all the React application source code.
  - /frontend/public: Public assets like index.html and images.
  - /frontend/src: The main React source code, including components, pages, and CSS.
- /node_modules: (Not submitted) Contains all installed npm packages.
- Dockerfile: Instructions for Docker to build the application image.
- docker-compose.yml: Defines the multi-container Docker application.
- package.json: Defines the project's npm dependencies and scripts.
- webpack.config.js: Configuration file for Webpack, which bundles the frontend