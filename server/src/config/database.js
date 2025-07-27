const { MongoClient } = require("mongodb");

class Database {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    try {
      const uri = process.env.MONGODB_URI;
      const dbName = process.env.DB_NAME;

      this.client = new MongoClient(uri);

      await this.client.connect();
      this.db = this.client.db(dbName);

      console.log("✅ Connected to MongoDB successfully");
      console.log(`📊 Database: ${dbName}`);

      return this.db;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        console.log("🔌 Disconnected from MongoDB");
      }
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error);
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error("Database not connected. Call connect() first.");
    }
    return this.db;
  }

  getCollection(collectionName) {
    return this.getDb().collection(collectionName);
  }
}

// Create a singleton instance
const database = new Database();

module.exports = database;
