const express = require("express");
const router = express.Router();

// Import route modules
const userRoutes = require("./users");
const authRoutes = require("./auth");
const chatRoutes = require("./chats");
// const scrapRoutes = require('./scrap');

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Get API routes information
 *     description: Returns information about available API routes
 *     tags: [API]
 *     responses:
 *       200:
 *         description: API routes information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "API Routes"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 availableRoutes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["/api/status", "/health"]
 */
// Route definitions
router.get("/", (req, res) => {
  res.json({
    message: "API Routes",
    version: "1.0.0",
    availableRoutes: [
      "/api/status",
      "/health",
      "/api/users",
      "/api/auth",
      "/api/chats",
    ],
  });
});

// Mount route modules
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/chats", chatRoutes);
// router.use('/scrap', scrapRoutes);

module.exports = router;
