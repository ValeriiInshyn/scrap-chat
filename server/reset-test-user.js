// Reset test user password to plain text
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

async function resetTestUser() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://valeriiinshyn:valeri12358@scrapchatcluster.es1when.mongodb.net/?retryWrites=true&w=majority&appName=ScrapChatCluster";
  const dbName = process.env.DB_NAME || "scrap_chat_db";

  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    // Find and update the test user
    const result = await usersCollection.updateOne(
      { email: "test@example.com" },
      {
        $set: {
          password: "password123",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount > 0) {
      console.log("✅ Test user password reset successfully");
    } else {
      console.log("❌ Test user not found");
    }

    await client.close();
  } catch (error) {
    console.error("❌ Error resetting user:", error);
  }
}

resetTestUser();
