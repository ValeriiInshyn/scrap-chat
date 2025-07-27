// Test WebSocket functionality
const io = require("socket.io-client");

async function testWebSocket() {
  console.log("🧪 Testing WebSocket connection...\n");

  // First, get a token by logging in
  const axios = require("axios");

  try {
    // Login to get token
    const loginResponse = await axios.post(
      "http://localhost:3001/api/auth/login",
      {
        email: "test@example.com",
        password: "password123",
      }
    );

    const token = loginResponse.data.token;
    console.log("✅ Got authentication token");

    // Connect to WebSocket
    const socket = io("http://localhost:3001", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket server");

      // Join a test chat room
      socket.emit("join-chat", "688672855f92a9c57d26ce45"); // Test chat ID
      console.log("📱 Joined test chat room");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from WebSocket server");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ WebSocket connection error:", error);
    });

    socket.on("new-message", (data) => {
      console.log("📨 Received new message:", data);
    });

    socket.on("user-typing", (data) => {
      console.log("⌨️ User typing:", data);
    });

    socket.on("user-stop-typing", (data) => {
      console.log("⏹️ User stopped typing:", data);
    });

    // Wait a bit for connection to establish
    setTimeout(() => {
      console.log("\n📤 Sending a test message via API...");

      // Send a message via API to trigger WebSocket broadcast
      axios
        .post(
          "http://localhost:3001/api/chats/688672855f92a9c57d26ce45/messages",
          {
            content: "Test message from WebSocket test script!",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          console.log("✅ Message sent via API:", response.data.content);
        })
        .catch((error) => {
          console.error(
            "❌ Failed to send message:",
            error.response?.data || error.message
          );
        });

      // Wait a bit more to see if WebSocket receives the message
      setTimeout(() => {
        console.log(
          "\n🏁 Test completed. Check if WebSocket received the message above."
        );
        socket.disconnect();
        process.exit(0);
      }, 2000);
    }, 2000);
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

testWebSocket();
