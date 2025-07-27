# MongoDB Setup Guide

## Prerequisites

1. **Install MongoDB Community Edition:**

   - Download from: https://www.mongodb.com/try/download/community
   - Or use Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`

2. **Install MongoDB Compass (Optional but recommended):**
   - Download from: https://www.mongodb.com/try/download/compass
   - This is a GUI for managing your MongoDB databases

## Local Setup

### Option 1: Local MongoDB Installation

1. **Start MongoDB service:**

   ```bash
   # Windows
   net start MongoDB

   # macOS/Linux
   sudo systemctl start mongod
   ```

2. **Verify MongoDB is running:**
   ```bash
   mongosh
   # or
   mongo
   ```

### Option 2: Docker (Recommended for development)

1. **Pull and run MongoDB:**

   ```bash
   docker pull mongo
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Connect to MongoDB:**
   ```bash
   docker exec -it mongodb mongosh
   ```

## Environment Configuration

1. **Copy the environment file:**

   ```bash
   cp config.env .env
   ```

2. **Update the `.env` file with your MongoDB settings:**

   ```env
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=scrap-chat

   # For MongoDB Atlas (cloud)
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   # DB_NAME=scrap-chat
   ```

## Testing the Connection

1. **Start the server:**

   ```bash
   npm run dev
   ```

2. **Check the console output:**
   You should see:

   ```
   ✅ Connected to MongoDB successfully
   📊 Database: scrap-chat
   🚀 Server is running on port 3001
   ```

3. **Test the API endpoints:**
   - Visit: http://localhost:3001/api-docs (Swagger documentation)
   - Test user endpoints: http://localhost:3001/api/users

## MongoDB Atlas (Cloud) Setup

1. **Create a free account:** https://www.mongodb.com/atlas
2. **Create a new cluster**
3. **Get your connection string**
4. **Update your `.env` file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   DB_NAME=scrap-chat
   ```

## Database Collections

The application will automatically create these collections:

- `users` - User data
- `chats` - Chat messages (future)
- `scraped_data` - Scraped content (future)

## Troubleshooting

### Connection Issues

- Make sure MongoDB is running
- Check if port 27017 is available
- Verify your connection string in `.env`

### Permission Issues

- Ensure MongoDB has write permissions to the data directory
- Check firewall settings

### Docker Issues

- Make sure Docker is running
- Check if the MongoDB container is up: `docker ps`
- Restart container: `docker restart mongodb`
