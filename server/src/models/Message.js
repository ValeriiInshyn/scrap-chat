const database = require("../config/database");
const { ObjectId } = require("mongodb");

class Message {
  constructor() {
    this.collectionName = "messages";
  }

  getCollection() {
    return database.getCollection(this.collectionName);
  }

  async create(messageData) {
    try {
      const result = await this.getCollection().insertOne({
        ...messageData,
        sender: new ObjectId(messageData.sender),
        chatId: new ObjectId(messageData.chatId),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return result;
    } catch (error) {
      throw new Error(`Error creating message: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const message = await this.getCollection().findOne({
        _id: new ObjectId(id),
      });
      return message;
    } catch (error) {
      throw new Error(`Error finding message: ${error.message}`);
    }
  }

  async findByChatId(chatId, limit = 50, skip = 0) {
    try {
      const messages = await this.getCollection()
        .find({ chatId: new ObjectId(chatId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      throw new Error(`Error finding messages by chat: ${error.message}`);
    }
  }

  async findBySender(senderId) {
    try {
      const messages = await this.getCollection()
        .find({ sender: new ObjectId(senderId) })
        .sort({ createdAt: -1 })
        .toArray();
      return messages;
    } catch (error) {
      throw new Error(`Error finding messages by sender: ${error.message}`);
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
      throw new Error(`Error updating message: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const result = await this.getCollection().deleteOne({
        _id: new ObjectId(id),
      });
      return result;
    } catch (error) {
      throw new Error(`Error deleting message: ${error.message}`);
    }
  }

  async deleteByChatId(chatId) {
    try {
      const result = await this.getCollection().deleteMany({
        chatId: new ObjectId(chatId),
      });
      return result;
    } catch (error) {
      throw new Error(`Error deleting messages by chat: ${error.message}`);
    }
  }
}

module.exports = Message;
