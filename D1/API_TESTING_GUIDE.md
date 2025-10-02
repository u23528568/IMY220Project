# API Testing Guide for Repofox

Your server is running at: `http://localhost:5000/api`

## 📋 Available Endpoints

### 🔐 Authentication Endpoints

#### 1. Sign Up
- **URL:** `POST /api/auth/signup`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "profile": {
    "name": "Test User",
    "bio": "This is a test user account"
  }
}
```

#### 2. Login
- **URL:** `POST /api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- **Response:** You'll get a JWT token - save this for authenticated requests!

---

### 👤 User Endpoints (Require Authentication)

#### 3. Get User Profile
- **URL:** `GET /api/users/profile`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

#### 4. Update User Profile
- **URL:** `PUT /api/users/profile`
- **Headers:** 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
  - `Content-Type: application/json`
- **Body:**
```json
{
  "profile": {
    "name": "Updated User Name",
    "bio": "Updated bio description"
  },
  "email": "newemail@example.com"
}
```

#### 5. Get All Users
- **URL:** `GET /api/users/`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

#### 6. Search Users
- **URL:** `GET /api/users/search?q=testuser`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

#### 7. Send Friend Request
- **URL:** `POST /api/users/friend-request/USER_ID`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

---

### 📁 Project Endpoints (Require Authentication)

#### 8. Create Project
- **URL:** `POST /api/projects/`
- **Headers:** 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
  - `Content-Type: multipart/form-data` (if uploading image)
- **Form Data:**
```
name: "My Test Project"
description: "A sample project for testing"
type: "Web Development"
hashtags: "#react,#nodejs,#mongodb"
image: [file upload - optional]
```

#### 9. Get All Projects
- **URL:** `GET /api/projects/`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

#### 10. Get Single Project
- **URL:** `GET /api/projects/PROJECT_ID`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

---

### ✅ Checkin Endpoints (Require Authentication)

#### 11. Create Checkin
- **URL:** `POST /api/checkins/PROJECT_ID/checkin`
- **Headers:** 
  - `Authorization: Bearer YOUR_JWT_TOKEN`
  - `Content-Type: multipart/form-data`
- **Form Data:**
```
message: "Added new features and fixed bugs"
files: [file uploads - optional]
```

#### 12. Get Project Checkins
- **URL:** `GET /api/checkins/project/PROJECT_ID`
- **Headers:** `Authorization: Bearer YOUR_JWT_TOKEN`

---

## 🧪 Testing Methods

### Method 1: Using Postman
1. Download Postman from https://www.postman.com/
2. Import the requests using the URLs and JSON above
3. Set up your Authorization header with the JWT token from login

### Method 2: Using VS Code REST Client Extension
1. Install "REST Client" extension in VS Code
2. Create a .http file with your requests

### Method 3: Using curl (Terminal)
```bash
# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123","profile":{"name":"Test User","bio":"Test account"}}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace YOUR_TOKEN with actual token)
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Method 4: Browser Testing (for GET requests)
- Open browser and go to: `http://localhost:5000/api/users/` (will show auth error, which is expected)

---

## 🔧 Testing Workflow

### Step 1: Create a User
1. Use signup endpoint to create a new user
2. Use login endpoint to get JWT token
3. Save the token for subsequent requests

### Step 2: Test User Endpoints
1. Get your profile
2. Update your profile
3. Search for users

### Step 3: Test Projects
1. Create a new project
2. Get all projects
3. Get specific project details

### Step 4: Test Checkins
1. Create checkins for your projects
2. Retrieve checkins for projects

---

## 📝 Sample Test Data

### Multiple Users for Testing:
```json
// User 1
{
  "username": "alice_dev",
  "email": "alice@example.com",
  "password": "alice123",
  "profile": {
    "name": "Alice Developer",
    "bio": "Experienced full-stack developer"
  }
}

// User 2
{
  "username": "bob_coder",
  "email": "bob@example.com",
  "password": "bob123",
  "profile": {
    "name": "Bob Coder",
    "bio": "Backend specialist and API developer"
  }
}
```

### Sample Projects:
```json
// Project 1
{
  "name": "E-commerce Website",
  "description": "Full-stack e-commerce platform with React and Node.js",
  "type": "Web Development",
  "hashtags": "#react,#nodejs,#ecommerce"
}

// Project 2
{
  "name": "Mobile Game",
  "description": "2D platformer game built with Unity",
  "type": "Game Development",
  "hashtags": "#unity,#csharp,#2d"
}
```

---

## ⚠️ Important Notes

1. **JWT Token:** After login, copy the token from the response and use it in the Authorization header for all protected routes
2. **File Uploads:** For endpoints with file uploads, use `multipart/form-data` content type
3. **MongoDB:** Make sure your MongoDB connection is working (you should see "✅ Connected to MongoDB" in your server logs)
4. **CORS:** Your server has CORS enabled, so you can test from browser tools

---

## 🐛 Common Issues

- **401 Unauthorized:** Check if you're including the JWT token in the Authorization header
- **500 Server Error:** Check your server console for detailed error messages
- **Connection Refused:** Make sure your server is running on port 5000