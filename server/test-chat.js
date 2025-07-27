// Test script for chat functionality
const axios = require("axios");

const BASE_URL = "http://localhost:3001/api";
let authToken = "";

async function testChatAPI() {
  console.log("🧪 Testing Chat API...\n");

  try {
    // Test 1: Register a user (or skip if exists)
    console.log("1️⃣ Registering test user...");
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        name: "TestUser",
        email: "test@example.com",
        password: "password123",
      });
      console.log("✅ User registered:", registerResponse.data.name);
    } catch (error) {
      if (error.response?.data?.error?.includes("already exists")) {
        console.log("ℹ️ User already exists, continuing with login...");
      } else {
        throw error;
      }
    }

    // Test 2: Login
    console.log("\n2️⃣ Logging in...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: "test@example.com",
      password: "password123",
    });
    authToken = loginResponse.data.token;
    console.log("✅ Login successful");

    // Test 3: Create a chat
    console.log("\n3️⃣ Creating a chat...");
    const chatResponse = await axios.post(
      `${BASE_URL}/chats`,
      {
        name: "Test Chat",
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    const chatId = chatResponse.data._id;
    console.log("✅ Chat created:", chatResponse.data.name);

    // Test 4: Send a message
    console.log("\n4️⃣ Sending a message...");
    const messageResponse = await axios.post(
      `${BASE_URL}/chats/${chatId}/messages`,
      {
        content: "Hello, this is a test message!",
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log("✅ Message sent:", messageResponse.data.content);

    // Test 5: Get chat messages
    console.log("\n5️⃣ Getting chat messages...");
    const messagesResponse = await axios.get(`${BASE_URL}/chats/${chatId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log(
      "✅ Messages retrieved:",
      messagesResponse.data.messages.length,
      "messages"
    );

    console.log("\n🎉 All tests passed! Chat API is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await axios.get("http://localhost:3001/health");
    console.log("✅ Server is running:", response.data);
    return true;
  } catch (error) {
    console.error("❌ Server is not running. Please start the server first:");
    console.error("   cd server && npm run dev");
    return false;
  }
}

async function runTests() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testChatAPI();
  }
}

runTests();
