"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import socketService from "../../lib/socket";
import authService from "../../lib/auth";
import ChatContainer from "../../components/chat/ChatContainer";
import { Chat, Message } from "../../types/chat";

export default function ChatPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

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
      socketService.joinChat(selectedChat._id);
    }
  }, [socketConnected, selectedChat]);

  // Update ref when selectedChat changes
  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const initializeSocket = () => {
    try {
      const socket = socketService.connect();

      socket.on("connect", () => {
        setSocketConnected(true);
      });

      socket.on("disconnect", () => {
        setSocketConnected(false);
      });

      socket.on("connect_error", (error) => {
        setSocketConnected(false);
      });

      socket.on("new-message", (data: { chatId: string; message: Message }) => {
        if (
          selectedChatRef.current &&
          data.chatId === selectedChatRef.current._id
        ) {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg._id === data.message._id);

            if (!exists) {
              return [...prev, data.message];
            }
            return prev;
          });
        }
      });

      socket.on(
        "user-typing",
        (data: { userId: string; userName: string; chatId: string }) => {
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

      return () => {
        socketService.disconnect();
      };
    } catch (error) {
      console.error("Socket connection failed:", error);
    }
  };

  const loadChats = async () => {
    try {
      const response = await authService.apiRequest("/chats");
      setChats(response);
    } catch (error) {
      console.error("Failed to load chats:", error);
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
    setSelectedChat(chat);
    setTypingUsers([]);

    if (socketConnected) {
      socketService.joinChat(chat._id);
    }

    await loadMessages(chat._id);
  };

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !selectedChat) return;

    socketService.stopTyping(selectedChat._id);

    try {
      const response = await authService.apiRequest(
        `/chats/${selectedChat._id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: messageContent }),
        }
      );
      // Message will appear via WebSocket broadcast
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const createChat = async (chatName: string) => {
    if (!chatName.trim()) return;

    try {
      const response = await authService.apiRequest("/chats", {
        method: "POST",
        body: JSON.stringify({ name: chatName }),
      });

      await loadChats();
      setSelectedChat(response);
      socketService.joinChat(response._id);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const handleTyping = () => {
    if (selectedChat) {
      socketService.sendTyping(selectedChat._id);
    }
  };

  const handleStopTyping = () => {
    if (selectedChat) {
      socketService.stopTyping(selectedChat._id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const testSocketConnection = () => {
    if (socketConnected && selectedChat) {
      socketService.emit("test-event", {
        chatId: selectedChat._id,
        message: "Test from client",
      });
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
        <ChatContainer
          chats={chats}
          selectedChat={selectedChat}
          messages={messages}
          currentUserId={user?._id || ""}
          typingUsers={typingUsers}
          socketConnected={socketConnected}
          forceUpdateCount={forceUpdate}
          onSelectChat={selectChat}
          onCreateChat={createChat}
          onSendMessage={sendMessage}
          onTyping={handleTyping}
          onStopTyping={handleStopTyping}
          onTestSocket={testSocketConnection}
          onForceUpdate={() => setForceUpdate((prev) => prev + 1)}
        />
      </div>
    </div>
  );
}
