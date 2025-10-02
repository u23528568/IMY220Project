const { MongoClient } = require('mongodb');

let db = null;
let client = null;

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/repofox';
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Get database name from URI or use default
    const dbName = MONGODB_URI.split('/').pop().split('?')[0] || 'repofox';
    db = client.db(dbName);
    
    console.log('✅ Connected to MongoDB using native driver');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
};

// Helper function to generate ObjectId
const { ObjectId } = require('mongodb');

// Collection helpers
const getCollection = (collectionName) => {
  return getDB().collection(collectionName);
};

// Common database operations
const dbOperations = {
  // Users collection
  users: () => getCollection('users'),
  
  // Projects collection  
  projects: () => getCollection('projects'),
  
  // Check-ins collection
  checkins: () => getCollection('checkins'),
  
  // Friend requests collection
  friendrequests: () => getCollection('friendrequests'),
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
  ObjectId,
  getCollection,
  dbOperations
};