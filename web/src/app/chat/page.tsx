"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import socketService from "../../lib/socket";
import authService from "../../lib/auth";

interface Message {
  _id: string;
  content: string;
  sender: string;
  chatId: string;
  createdAt: string;
}

interface Chat {
  _id: string;
  name: string;
  participants: string[];
  createdAt: string;
}

export default function ChatPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedChatRef = useRef<Chat | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log(
        "🔐 User authenticated, initializing socket and loading chats..."
      );
      initializeSocket();
      loadChats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-join selected chat when socket connects
  useEffect(() => {
    if (socketConnected && selectedChat) {
      console.log(
        "🔌 Socket connected, auto-joining selected chat:",
        selectedChat._id
      );
      socketService.joinChat(selectedChat._id);
    }
  }, [socketConnected, selectedChat]);

  // Update ref when selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  // Test effect to monitor messages state changes
  useEffect(() => {
    console.log("📋 Messages state updated:", messages.length, "messages");
    messages.forEach((msg, index) => {
      console.log(`  ${index + 1}. ${msg.content} (${msg._id})`);
    });
  }, [messages]);

  const initializeSocket = () => {
    try {
      console.log("🔌 Initializing socket connection...");
      const socket = socketService.connect();

      socket.on("connect", () => {
        console.log("✅ Connected to WebSocket");
        console.log("🔍 Socket ID:", socket.id);
        setSocketConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("❌ Disconnected from WebSocket");
        setSocketConnected(false);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ WebSocket connection error:", error);
        setSocketConnected(false);
      });

      socket.on("new-message", (data: { chatId: string; message: Message }) => {
        console.log("📨 Received new message:", data);
        console.log("📋 Current selected chat:", selectedChatRef.current?._id);
        console.log("🔍 Message chat ID:", data.chatId);
        console.log(
          "✅ IDs match:",
          selectedChatRef.current?._id === data.chatId
        );
        console.log("🔍 Message sender:", data.message.sender);
        console.log("🔍 Current user ID:", user?._id);
        console.log("🔍 Message ID:", data.message._id);

        if (
          selectedChatRef.current &&
          data.chatId === selectedChatRef.current._id
        ) {
          // Process all messages from WebSocket (including our own)
          console.log("📨 Processing message from WebSocket");

          setMessages((prev) => {
            console.log("🔄 Current messages in state:", prev.length);
            prev.forEach((msg, index) => {
              console.log(
                `  ${index + 1}. ID: ${msg._id}, Content: ${msg.content}`
              );
            });

            // Check if message already exists (to avoid duplicates)
            const exists = prev.some((msg) => msg._id === data.message._id);
            console.log("🔄 Message exists:", exists);
            console.log("🔄 Looking for ID:", data.message._id);

            if (!exists) {
              console.log("➕ Adding new message to state");
              const newMessages = [...prev, data.message];
              console.log("➕ New messages array length:", newMessages.length);
              return newMessages;
            }
            console.log("⏭️ Skipping duplicate message");
            return prev;
          });
        } else {
          console.log("❌ Message not for current chat or no chat selected");
        }
      });

      socket.on(
        "user-typing",
        (data: { userId: string; userName: string; chatId: string }) => {
          console.log("⌨️ User typing event:", data);
          if (
            selectedChatRef.current &&
            data.chatId === selectedChatRef.current._id
          ) {
            setTypingUsers((prev) => [
              ...prev.filter((u) => u !== data.userName),
              data.userName,
            ]);
          }
        }
      );

      socket.on(
        "user-stop-typing",
        (data: { userId: string; userName: string; chatId: string }) => {
          console.log("⏹️ User stop typing event:", data);
          if (
            selectedChatRef.current &&
            data.chatId === selectedChatRef.current._id
          ) {
            setTypingUsers((prev) => prev.filter((u) => u !== data.userName));
          }
        }
      );

      // Test response listener
      socket.on("test-response", (data) => {
        console.log("🧪 Test response received from server:", data);
      });

      return () => {
        console.log("🔌 Cleaning up socket connection...");
        socketService.disconnect();
      };
    } catch (error) {
      console.error("❌ Socket connection failed:", error);
    }
  };

  const loadChats = async () => {
    try {
      console.log("📋 Loading chats...");
      const response = await authService.apiRequest("/chats");
      console.log("✅ Chats loaded:", response);
      setChats(response);
    } catch (error) {
      console.error("❌ Failed to load chats:", error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const response = await authService.apiRequest(`/chats/${chatId}`);
      setMessages(response.messages || []);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const selectChat = async (chat: Chat) => {
    console.log("📱 Selecting chat:", chat.name, chat._id);
    setSelectedChat(chat);
    setTypingUsers([]);

    if (socketConnected) {
      console.log("🔌 Joining chat room:", chat._id);
      socketService.joinChat(chat._id);
    } else {
      console.log("❌ Socket not connected, cannot join chat");
    }

    await loadMessages(chat._id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageContent = newMessage.trim();
    console.log("📤 Starting to send message:", messageContent);
    console.log("📋 Selected chat:", selectedChat._id);
    console.log("👤 Current user:", user?._id);

    setNewMessage("");
    socketService.stopTyping(selectedChat._id);
    setIsTyping(false);

    // Don't add temporary message - wait for WebSocket response
    console.log("📤 Sending message, waiting for WebSocket response...");

    try {
      console.log("📤 Sending message to server:", messageContent);
      const response = await authService.apiRequest(
        `/chats/${selectedChat._id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: messageContent }),
        }
      );

      console.log("✅ Message sent successfully:", response);
      // Message will appear via WebSocket broadcast
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      // Restore the message content
      setNewMessage(messageContent);
    }
  };

  const createChat = async () => {
    if (!newChatName.trim()) return;

    try {
      console.log("📝 Creating new chat:", newChatName);
      const response = await authService.apiRequest("/chats", {
        method: "POST",
        body: JSON.stringify({ name: newChatName }),
      });

      console.log("✅ Chat created successfully:", response);
      setNewChatName("");
      await loadChats();
      setSelectedChat(response);
      socketService.joinChat(response._id);
    } catch (error) {
      console.error("❌ Failed to create chat:", error);
    }
  };

  const handleTyping = () => {
    if (!isTyping && selectedChat) {
      setIsTyping(true);
      socketService.sendTyping(selectedChat._id);
    }
  };

  const handleStopTyping = () => {
    if (isTyping && selectedChat) {
      setIsTyping(false);
      socketService.stopTyping(selectedChat._id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const testSocketConnection = () => {
    console.log("🧪 Testing socket connection...");
    console.log("🔍 Socket connected:", socketConnected);
    console.log("🔍 Selected chat:", selectedChat?._id);

    if (socketConnected && selectedChat) {
      console.log("🔌 Emitting test event...");
      socketService.emit("test-event", {
        chatId: selectedChat._id,
        message: "Test from client",
      });
    } else {
      console.log("❌ Cannot test - socket not connected or no chat selected");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Scrap Chat
              </h1>
              <div
                className={`ml-4 w-3 h-3 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <div
                className={`w-3 h-3 rounded-full ${
                  socketConnected ? "bg-green-500" : "bg-red-500"
                }`}
                title={socketConnected ? "Connected" : "Disconnected"}
              ></div>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow">
          {/* Chat List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Chats
              </h2>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="New chat name"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={createChat}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => selectChat(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?._id === chat._id
                      ? "bg-blue-50 border-r-2 border-blue-500"
                      : ""
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{chat.name}</h3>
                  <p className="text-sm text-gray-500">
                    {chat.participants.length} participants
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedChat.name}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={testSocketConnection}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                      >
                        Test Socket
                      </button>
                      <button
                        onClick={() => setForceUpdate((prev) => prev + 1)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        Force Update ({forceUpdate})
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Debug info */}
                  <div className="text-xs text-gray-500 mb-2">
                    Messages count: {messages.length} | Force update:{" "}
                    {forceUpdate}
                  </div>

                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender === user?._id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === user?._id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}{" "}
                          (ID: {message._id.substring(0, 8)}...)
                        </p>
                      </div>
                    </div>
                  ))}

                  {typingUsers.length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
                        <p className="text-sm italic">
                          {typingUsers.join(", ")}{" "}
                          {typingUsers.length === 1 ? "is" : "are"} typing...
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          sendMessage();
                        }
                      }}
                      onBlur={handleStopTyping}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a chat
                  </h3>
                  <p className="text-gray-500">
                    Choose a chat from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
