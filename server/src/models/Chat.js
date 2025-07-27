const database = require("../config/database");
const { ObjectId } = require("mongodb");

class Chat {
  constructor() {
    this.collectionName = "chats";
  }

  getCollection() {
    return database.getCollection(this.collectionName);
  }

  async create(chatData) {
    try {
      // Convert participant IDs to ObjectIds
      const participants = (chatData.participants || []).map((id) =>
        typeof id === "string" ? new ObjectId(id) : id
      );

      const result = await this.getCollection().insertOne({
        ...chatData,
        participants: participants,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return result;
    } catch (error) {
      throw new Error(`Error creating chat: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const chat = await this.getCollection().findOne({
        _id: new ObjectId(id),
      });
      return chat;
    } catch (error) {
      throw new Error(`Error finding chat: ${error.message}`);
    }
  }

  async findByParticipant(userId) {
    try {
      const chats = await this.getCollection()
        .find({
          participants: new ObjectId(userId),
        })
        .toArray();
      return chats;
    } catch (error) {
      throw new Error(`Error finding chats by participant: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const chats = await this.getCollection().find({}).toArray();
      return chats;
    } catch (error) {
      throw new Error(`Error finding chats: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const result = await this.getCollection().updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Error updating chat: ${error.message}`);
    }
  }

  async addParticipant(chatId, userId) {
    try {
      const result = await this.getCollection().updateOne(
        { _id: new ObjectId(chatId) },
        {
          $addToSet: { participants: new ObjectId(userId) },
          $set: { updatedAt: new Date() },
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Error adding participant: ${error.message}`);
    }
  }

  async removeParticipant(chatId, userId) {
    try {
      const result = await this.getCollection().updateOne(
        { _id: new ObjectId(chatId) },
        {
          $pull: { participants: new ObjectId(userId) },
          $set: { updatedAt: new Date() },
        }
      );
      return result;
    } catch (error) {
      throw new Error(`Error removing participant: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const result = await this.getCollection().deleteOne({
        _id: new ObjectId(id),
      });
      return result;
    } catch (error) {
      throw new Error(`Error deleting chat: ${error.message}`);
    }
  }
}

module.exports = Chat;
