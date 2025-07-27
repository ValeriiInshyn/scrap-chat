const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Chat = require("../models/Chat");

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
  }

  initialize(server) {
    this.io = require("socket.io")(server, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
      },
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error("Authentication error"));
        }

        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "your-secret-key"
        );
        const user = await new User().findById(decoded.userId);

        if (!user) {
          return next(new Error("User not found"));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`🔌 User connected: ${socket.user.name} (${socket.userId})`);

      this.handleConnection(socket);

      socket.on("disconnect", () => {
        this.handleDisconnection(socket);
      });

      socket.on("join-chat", (chatId) => {
        this.handleJoinChat(socket, chatId);
      });

      socket.on("leave-chat", (chatId) => {
        this.handleLeaveChat(socket, chatId);
      });

      socket.on("typing", (data) => {
        this.handleTyping(socket, data);
      });

      socket.on("stop-typing", (data) => {
        this.handleStopTyping(socket, data);
      });

      // Handle test events
      socket.on("test-event", (data) => {
        console.log("🧪 Test event received from client:", data);
        // Echo back to confirm communication
        socket.emit("test-response", {
          message: "Server received test event",
          data: data,
          timestamp: new Date().toISOString(),
        });
      });
    });

    console.log("🚀 WebSocket service initialized");
  }

  handleConnection(socket) {
    // Store user connection
    this.connectedUsers.set(socket.userId, socket.id);
    this.userSockets.set(socket.id, socket.userId);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Join user to all their chats
    this.joinUserToChats(socket);
  }

  handleDisconnection(socket) {
    console.log(`🔌 User disconnected: ${socket.user.name} (${socket.userId})`);

    // Remove from connected users
    this.connectedUsers.delete(socket.userId);
    this.userSockets.delete(socket.id);
  }

  async joinUserToChats(socket) {
    try {
      const chatModel = new Chat();
      const userChats = await chatModel.findByParticipant(socket.userId);

      userChats.forEach((chat) => {
        socket.join(`chat:${chat._id}`);
        console.log(`📱 User ${socket.user.name} joined chat: ${chat.name}`);
      });
    } catch (error) {
      console.error("Error joining user to chats:", error);
    }
  }

  handleJoinChat(socket, chatId) {
    socket.join(`chat:${chatId}`);
    console.log(`📱 User ${socket.user.name} joined chat: ${chatId}`);
  }

  handleLeaveChat(socket, chatId) {
    socket.leave(`chat:${chatId}`);
    console.log(`📱 User ${socket.user.name} left chat: ${chatId}`);
  }

  handleTyping(socket, data) {
    const { chatId } = data;
    socket.to(`chat:${chatId}`).emit("user-typing", {
      userId: socket.userId,
      userName: socket.user.name,
      chatId,
    });
  }

  handleStopTyping(socket, data) {
    const { chatId } = data;
    socket.to(`chat:${chatId}`).emit("user-stop-typing", {
      userId: socket.userId,
      userName: socket.user.name,
      chatId,
    });
  }

  // Broadcast new message to all participants in a chat
  broadcastMessage(chatId, message) {
    console.log(`📨 Broadcasting message to chat ${chatId}:`, message.content);
    console.log(`📡 Room: chat:${chatId}`);

    this.io.to(`chat:${chatId}`).emit("new-message", {
      chatId,
      message,
    });

    // Log connected users in this room
    this.io
      .in(`chat:${chatId}`)
      .fetchSockets()
      .then((sockets) => {
        console.log(
          `👥 ${sockets.length} users in chat ${chatId}:`,
          sockets.map((s) => s.user?.name || "Unknown").join(", ")
        );
      });
  }

  // Broadcast chat update to all participants
  broadcastChatUpdate(chatId, update) {
    this.io.to(`chat:${chatId}`).emit("chat-updated", {
      chatId,
      update,
    });
  }

  // Send notification to specific user
  sendNotification(userId, notification) {
    this.io.to(`user:${userId}`).emit("notification", notification);
  }

  // Broadcast user status change
  broadcastUserStatus(userId, status) {
    this.io.emit("user-status-change", {
      userId,
      status,
    });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();
