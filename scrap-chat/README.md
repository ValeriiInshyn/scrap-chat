# Scrap Chat Project Structure

This project is a chat application with the following tech stack:

- **Web:** React
- **Mobile:** React Native (Expo)
- **Backend:** Node.js

## Folder Structure

```
scrap-chat/
│
├── backend/                # Node.js backend (API, WebSocket, DB, etc.)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
├── web/                    # React web app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── README.md
│
├── mobile/                 # React Native (Expo) mobile app
│   ├── assets/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── app.json
│   ├── package.json
│   └── README.md
│
└── README.md               # Project overview (this file)
```

## Getting Started

- See each subfolder's README for setup instructions.
