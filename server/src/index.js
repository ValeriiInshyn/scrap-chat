const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const database = require("./config/database");
const socketService = require("./services/socketService");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan("combined")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Import routes
const apiRoutes = require("./routes");

// Mount API routes
app.use("/api", apiRoutes);

// Routes
/**
 * @swagger
 * /:
 *   get:
 *     summary: Get server status
 *     description: Returns server information and status
 *     tags: [Server]
 *     responses:
 *       200:
 *         description: Server status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Scrap Chat Server is running!"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/", (req, res) => {
  res.json({
    message: "Scrap Chat Server is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns server health status and uptime
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /api/status:
 *   get:
 *     summary: Get API status
 *     description: Returns API status and available endpoints
 *     tags: [API]
 *     responses:
 *       200:
 *         description: API status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API is working"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     health:
 *                       type: string
 *                       description: Health check endpoint
 *                     status:
 *                       type: string
 *                       description: Status endpoint
 */
app.get("/api/status", (req, res) => {
  res.json({
    message: "API is working",
    endpoints: {
      health: "/health",
      status: "/api/status",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await database.connect();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API status: http://localhost:${PORT}/api/status`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
    });

    // Initialize WebSocket service
    socketService.initialize(server);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  await database.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down server...");
  await database.disconnect();
  process.exit(0);
});

startServer();
