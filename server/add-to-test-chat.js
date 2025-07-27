// Add test user to the "Test Chat" that was created during API testing
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

async function addToTestChat() {
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

    // Get the test user
    const testUser = await usersCollection.findOne({
      email: "test@example.com",
    });
    if (!testUser) {
      console.log("❌ Test user not found");
      return;
    }

    // Find the "Test Chat" that was created during API testing
    const testChat = await chatsCollection.findOne({
      name: "Test Chat",
      participants: testUser._id,
    });

    if (testChat) {
      console.log(`✅ Test user already has access to: ${testChat.name}`);
    } else {
      // Find any "Test Chat" and add the user
      const anyTestChat = await chatsCollection.findOne({ name: "Test Chat" });
      if (anyTestChat) {
        const result = await chatsCollection.updateOne(
          { _id: anyTestChat._id },
          {
            $addToSet: { participants: testUser._id },
            $set: { updatedAt: new Date() },
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`✅ Added test user to: ${anyTestChat.name}`);
        } else {
          console.log(`ℹ️ User already in: ${anyTestChat.name}`);
        }
      }
    }

    // Show final status
    const userChats = await chatsCollection
      .find({
        participants: testUser._id,
      })
      .toArray();

    console.log(`\n📋 Test user now has access to ${userChats.length} chats:`);
    userChats.forEach((chat) => {
      console.log(`  - ${chat.name} (${chat._id})`);
    });

    await client.close();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

addToTestChat();
