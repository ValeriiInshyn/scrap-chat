// Debug script to check chats and participants
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

async function debugChats() {
  const uri =
    process.env.MONGODB_URI ||
    "mongodb+srv://valeriiinshyn:valeri12358@scrapchatcluster.es1when.mongodb.net/?retryWrites=true&w=majority&appName=ScrapChatCluster";
  const dbName = process.env.DB_NAME || "scrap_chat_db";

  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const chatsCollection = db.collection("chats");
    const usersCollection = db.collection("users");

    console.log("🔍 Debugging chats and users...\n");

    // Get all users
    const users = await usersCollection.find({}).toArray();
    console.log("👥 Users in database:");
    users.forEach((user) => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`);
    });

    console.log("\n📋 All chats in database:");
    const allChats = await chatsCollection.find({}).toArray();
    if (allChats.length === 0) {
      console.log("  ❌ No chats found in database");
    } else {
      allChats.forEach((chat) => {
        console.log(`  - ${chat.name} (ID: ${chat._id})`);
        console.log(
          `    Participants: ${chat.participants
            .map((p) => p.toString())
            .join(", ")}`
        );
        console.log(`    Created: ${chat.createdAt}`);
      });
    }

    // Check if test user exists and find their chats
    const testUser = await usersCollection.findOne({
      email: "test@example.com",
    });
    if (testUser) {
      console.log(
        `\n🔍 Checking chats for user: ${testUser.name} (${testUser._id})`
      );

      const userChats = await chatsCollection
        .find({
          participants: testUser._id,
        })
        .toArray();

      if (userChats.length === 0) {
        console.log("  ❌ User is not a participant in any chats");
      } else {
        console.log(`  ✅ User is a participant in ${userChats.length} chats:`);
        userChats.forEach((chat) => {
          console.log(`    - ${chat.name} (${chat._id})`);
        });
      }
    } else {
      console.log("\n❌ Test user not found");
    }

    await client.close();
  } catch (error) {
    console.error("❌ Error debugging chats:", error);
  }
}

debugChats();
