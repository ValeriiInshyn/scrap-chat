"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import socketService from "../../lib/socket";

export default function TestSocketPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [socketConnected, setSocketConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [testMessage, setTestMessage] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔐 User authenticated, testing socket...");
      testSocketConnection();
    }
  }, [isAuthenticated]);

  const testSocketConnection = () => {
    try {
      console.log("🔌 Testing socket connection...");
      const socket = socketService.connect();

      socket.on("connect", () => {
        console.log("✅ Socket connected in test page");
        setSocketConnected(true);
        addMessage("✅ Socket connected!");
      });

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected in test page");
        setSocketConnected(false);
        addMessage("❌ Socket disconnected!");
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error in test page:", error);
        setSocketConnected(false);
        addMessage("❌ Socket connection error: " + error.message);
      });

      socket.on("new-message", (data) => {
        console.log("📨 Received message in test page:", data);
        addMessage("📨 Received: " + data.message.content);
      });

      socket.on("test-response", (data) => {
        console.log("🧪 Test response in test page:", data);
        addMessage("🧪 Test response: " + data.message);
      });
    } catch (error) {
      console.error("❌ Socket test failed:", error);
      addMessage(
        "❌ Socket test failed: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  const addMessage = (message: string) => {
    setMessages((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const sendTestEvent = () => {
    if (socketConnected) {
      console.log("🧪 Sending test event...");
      socketService.emit("test-event", {
        message: testMessage || "Test message",
      });
      addMessage("🧪 Sent test event: " + (testMessage || "Test message"));
    } else {
      addMessage("❌ Socket not connected");
    }
  };

  const sendTestMessage = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/chats/688672855f92a9c57d26ce45/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            content: testMessage || "Test message from test page",
          }),
        }
      );

      const data = await response.json();
      if (data._id) {
        addMessage("✅ Message sent via API: " + data.content);
      } else {
        addMessage("❌ Failed to send message: " + data.error);
      }
    } catch (error) {
      addMessage(
        "❌ API error: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Socket Test Page</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div
              className={`w-4 h-4 rounded-full ${
                socketConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span>{socketConnected ? "Connected" : "Disconnected"}</span>
          </div>

          <div className="space-x-4">
            <button
              onClick={testSocketConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Connection
            </button>
            <button
              onClick={sendTestEvent}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Send Test Event
            </button>
            <button
              onClick={sendTestMessage}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Send Test Message
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Message</h2>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Enter test message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Event Log</h2>
          <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500">No events yet...</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="mb-2 text-sm">
                  {message}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
