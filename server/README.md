# Scrap Chat Server

A Node.js server for the Scrap Chat application built with Express.js.

## Features

- Express.js server with security middleware
- CORS enabled for cross-origin requests
- Request logging with Morgan
- Security headers with Helmet
- Health check endpoints
- Error handling middleware
- Modular route structure

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the server directory:

```bash
cd server
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp config.env .env
```

4. Update the `.env` file with your configuration values.

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on port 3001 (or the port specified in your environment variables).

## API Endpoints

- `GET /` - Server status and information
- `GET /health` - Health check endpoint
- `GET /api/status` - API status information

## Project Structure

```
server/
├── package.json       # Dependencies and scripts
├── config.env         # Environment configuration
├── README.md          # This file
└── src/
    ├── index.js       # Main server file
    ├── routes/        # API routes
    │   └── index.js   # Route definitions
    └── middleware/    # Custom middleware
        └── index.js   # Middleware functions
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## Development

The server uses nodemon for development, which automatically restarts when files change.

## Security

- Helmet.js for security headers
- CORS configuration
- Request logging
- Error handling

## Next Steps

- Add authentication routes
- Implement chat functionality
- Add scraping endpoints
- Database integration
- WebSocket support for real-time chat
