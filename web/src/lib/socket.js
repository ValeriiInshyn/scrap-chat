import { io } from "socket.io-client";
import authService from "./auth";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const token = authService.getToken();
    if (!token) {
      throw new Error("No authentication token available");
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log("🔌 Connecting to socket URL:", socketUrl);

    this.socket = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to WebSocket server");
      this.isConnected = true;
      this.emit("socket:connected");
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from WebSocket server");
      this.isConnected = false;
      this.emit("socket:disconnected");
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 WebSocket connection error:", error);
      this.isConnected = false;
      this.emit("socket:error", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join a specific chat room
  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      console.log("🔌 Joining chat room:", chatId);
      this.socket.emit("join-chat", chatId);
    } else {
      console.log("❌ Cannot join chat - socket not connected");
    }
  }

  // Leave a specific chat room
  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("leave-chat", chatId);
    }
  }

  // Send typing indicator
  sendTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing", { chatId });
    }
  }

  // Stop typing indicator
  stopTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("stop-typing", { chatId });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("new-message", callback);
    }
  }

  // Listen for chat updates
  onChatUpdate(callback) {
    if (this.socket) {
      this.socket.on("chat-updated", callback);
    }
  }

  // Listen for user typing
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user-typing", callback);
    }
  }

  // Listen for user stop typing
  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on("user-stop-typing", callback);
    }
  }

  // Listen for notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on("notification", callback);
    }
  }

  // Listen for user status changes
  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.on("user-status-change", callback);
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Emit custom events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Reconnect with new token
  reconnect() {
    this.disconnect();
    return this.connect();
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
