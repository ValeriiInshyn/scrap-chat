const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/auth");
const socketService = require("../services/socketService");

const chatModel = new Chat();
const messageModel = new Message();
const userModel = new User();

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       required:
 *         - name
 *         - participants
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated chat ID
 *         name:
 *           type: string
 *           description: Chat room name
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs
 *         messages:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of message IDs
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/chats:
 *   get:
 *     summary: Get user's chats
 *     description: Get all chats where the current user is a participant
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", auth, async (req, res) => {
  try {
    const chats = await chatModel.findByParticipant(req.user._id);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/chats:
 *   post:
 *     summary: Create a new chat
 *     description: Create a new chat room with participants
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Chat room name
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to add to the chat
 *     responses:
 *       201:
 *         description: Chat created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", auth, async (req, res) => {
  try {
    const { name, participants = [] } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Chat name is required" });
    }

    // Add current user to participants
    const allParticipants = [
      ...new Set([...participants, req.user._id.toString()]),
    ];

    console.log("📝 Creating chat:", {
      name,
      allParticipants,
      userId: req.user._id,
    });

    const result = await chatModel.create({
      name,
      participants: allParticipants,
    });

    const chat = await chatModel.findById(result.insertedId);
    console.log("✅ Chat created:", {
      chatId: chat._id,
      participants: chat.participants,
    });
    res.status(201).json(chat);
  } catch (error) {
    console.error("❌ Error creating chat:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/chats/{id}:
 *   get:
 *     summary: Get chat by ID
 *     description: Get a specific chat with its messages
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat details with messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chat:
 *                   $ref: '#/components/schemas/Chat'
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.get("/:id", auth, async (req, res) => {
  try {
    const chat = await chatModel.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await messageModel.findByChatId(req.params.id);

    res.json({
      chat,
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/chats/{id}/messages:
 *   post:
 *     summary: Send a message to chat
 *     description: Send a new message to a specific chat
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.post("/:id/messages", auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const chat = await chatModel.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await messageModel.create({
      content,
      sender: req.user._id,
      chatId: req.params.id,
    });

    const message = await messageModel.findById(result.insertedId);

    // Broadcast message to all participants in real-time
    socketService.broadcastMessage(req.params.id, message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/chats/{id}/participants:
 *   post:
 *     summary: Add participant to chat
 *     description: Add a user to a chat room
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID to add to the chat
 *     responses:
 *       200:
 *         description: Participant added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Chat or user not found
 *       500:
 *         description: Server error
 */
router.post("/:id/participants", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const chat = await chatModel.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if current user is a participant
    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await chatModel.addParticipant(req.params.id, userId);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ message: "Participant added successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/chats/{id}:
 *   delete:
 *     summary: Delete chat
 *     description: Delete a chat room (only for chat creator)
 *     tags: [Chats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Chat ID
 *     responses:
 *       200:
 *         description: Chat deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Chat not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", auth, async (req, res) => {
  try {
    const chat = await chatModel.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // Check if user is a participant
    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete all messages in the chat
    await messageModel.deleteByChatId(req.params.id);

    // Delete the chat
    const result = await chatModel.delete(req.params.id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Chat not found" });
    }

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
