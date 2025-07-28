"use client";

import { Chat } from "../../types/chat";

interface ChatTitleProps {
  chat: Chat;
  socketConnected: boolean;
  onTestSocket: () => void;
  onForceUpdate: () => void;
  forceUpdateCount: number;
}

export default function ChatTitle({
  chat,
  socketConnected,
  onTestSocket,
  onForceUpdate,
  forceUpdateCount,
}: ChatTitleProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900">{chat.name}</h2>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                socketConnected ? "bg-green-500" : "bg-red-500"
              }`}
              title={socketConnected ? "Connected" : "Disconnected"}
            />
            <span className="text-sm text-gray-500">
              {socketConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onTestSocket}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Test Socket
          </button>
          <button
            onClick={onForceUpdate}
            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            Force Update ({forceUpdateCount})
          </button>
        </div>
      </div>
    </div>
  );
}
