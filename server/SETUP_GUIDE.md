# Setup Guide - Troubleshooting

## Quick Fix Steps

### 1. Create Environment File

Create a `.env` file in the `server` folder with this content:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb+srv://valeriiinshyn:valeri12358@scrapchatcluster.es1when.mongodb.net/?retryWrites=true&w=majority&appName=ScrapChatCluster
DB_NAME=scrap_chat_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
```

### 2. Start the Server

```bash
cd server
npm run dev
```

### 3. Start the Web App

```bash
cd web
npm run dev
```

### 4. Test the System

1. Visit: http://localhost:3000
2. Register a new account
3. Login
4. Click "Open Chat" button
5. Create a chat and send messages

## Common Issues

### Issue 1: Server won't start

**Error:** `MongoDB connection error`
**Solution:** Check your `.env` file exists and has the correct MongoDB URI

### Issue 2: Login fails

**Error:** `Authentication failed`
**Solution:** Make sure the server is running on port 3001

### Issue 3: Chat page doesn't load

**Error:** `Failed to load chats`
**Solution:** Check if you're logged in and the server is running

### Issue 4: WebSocket connection fails

**Error:** `Socket connection failed`
**Solution:** Make sure both server and web app are running

## Testing Steps

1. **Test MongoDB Connection:**

   ```bash
   node test-server.js
   ```

2. **Test Server API:**

   - Visit: http://localhost:3001/health
   - Should show: `{"status":"OK"}`

3. **Test WebSocket:**
   - Check browser console for WebSocket connection messages

## Debug Information

- **Server Port:** 3001
- **Web App Port:** 3000
- **MongoDB:** Atlas cluster
- **WebSocket:** Socket.io with JWT authentication

## Need Help?

If you're still having issues, please provide:

1. The exact error message
2. At what step the error occurs
3. Browser console errors (if any)
