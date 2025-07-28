"use client";

import { Message } from "../../types/chat";

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageItem({
  message,
  isOwnMessage,
}: MessageItemProps) {
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-900"
        }`}
      >
        <p className="text-sm">{message.content}</p>
        <p className="text-xs opacity-75 mt-1">
          {new Date(message.createdAt).toLocaleTimeString()} (ID:{" "}
          {message._id.substring(0, 8)}...)
        </p>
      </div>
    </div>
  );
}
