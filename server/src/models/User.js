const database = require("../config/database");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class User {
  constructor() {
    this.collectionName = "users";
  }

  getCollection() {
    return database.getCollection(this.collectionName);
  }

  async create(userData) {
    try {
      // Store password as plain text for now (as per user's manual change)
      // In production, you should use bcrypt.hash(userData.password, 10)

      const result = await this.getCollection().insertOne({
        ...userData,
        chats: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return result;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async authenticate(email, password) {
    try {
      const user = await this.findByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = password == user.password;
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      return { user, token };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const user = await this.getCollection().findOne({
        _id: new ObjectId(id),
      });
      return user;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  async findByEmail(email) {
    try {
      const user = await this.getCollection().findOne({ email });
      return user;
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  async findAll() {
    try {
      const users = await this.getCollection().find({}).toArray();
      return users;
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
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
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const result = await this.getCollection().deleteOne({
        _id: new ObjectId(id),
      });
      return result;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}

module.exports = User;
