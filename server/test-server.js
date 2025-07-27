// Simple test script to check server functionality
require("dotenv").config();

const { MongoClient } = require("mongodb");

async function testConnection() {
  console.log("🔍 Testing MongoDB connection...");

  const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://valeriiinshyn:valeri12358@scrapchatcluster.es1when.mongodb.net/?retryWrites=true&w=majority&appName=ScrapChatCluster";
  const dbName = process.env.DB_NAME || "scrap_chat_db";

  console.log("📊 Database URI:", uri ? "✅ Set" : "❌ Missing");
  console.log("📊 Database Name:", dbName);

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log("✅ MongoDB connection successful!");

    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    console.log(
      "📚 Collections:",
      collections.map((c) => c.name)
    );

    await client.close();
    console.log("✅ Test completed successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }
}

testConnection();
