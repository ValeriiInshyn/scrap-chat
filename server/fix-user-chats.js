// Fix user chats - add test user to existing chats
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

async function fixUserChats() {
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

    console.log("🔧 Fixing user chats...\n");

    // Get the test user
    const testUser = await usersCollection.findOne({
      email: "test@example.com",
    });
    if (!testUser) {
      console.log("❌ Test user not found");
      return;
    }

    console.log(`👤 Found test user: ${testUser.name} (${testUser._id})`);

    // Get all existing chats
    const allChats = await chatsCollection.find({}).toArray();
    console.log(`📋 Found ${allChats.length} existing chats`);

    if (allChats.length === 0) {
      // Create a new chat for the test user
      console.log("📝 Creating new chat for test user...");
      const newChat = {
        name: "My First Chat",
        participants: [testUser._id],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await chatsCollection.insertOne(newChat);
      console.log("✅ Created new chat:", newChat.name);
    } else {
      // Add test user to the first existing chat
      const firstChat = allChats[0];
      console.log(`📝 Adding test user to existing chat: ${firstChat.name}`);

      const result = await chatsCollection.updateOne(
        { _id: firstChat._id },
        {
          $addToSet: { participants: testUser._id },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.modifiedCount > 0) {
        console.log("✅ Added test user to existing chat");
      } else {
        console.log("ℹ️ User already in chat or no changes made");
      }
    }

    // Verify the fix
    const userChats = await chatsCollection
      .find({
        participants: testUser._id,
      })
      .toArray();

    console.log(
      `\n✅ Test user is now a participant in ${userChats.length} chats:`
    );
    userChats.forEach((chat) => {
      console.log(`  - ${chat.name} (${chat._id})`);
    });

    await client.close();
  } catch (error) {
    console.error("❌ Error fixing user chats:", error);
  }
}

fixUserChats();
