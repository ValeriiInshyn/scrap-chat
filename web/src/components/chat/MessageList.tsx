"use client";

import { useRef, useEffect } from "react";
import { Message } from "../../types/chat";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
  forceUpdateCount: number;
}

export default function MessageList({
  messages,
  currentUserId,
  typingUsers,
  forceUpdateCount,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Debug info */}
      <div className="text-xs text-gray-500 mb-2">
        Messages count: {messages.length} | Force update: {forceUpdateCount}
      </div>

      {messages.map((message) => (
        <MessageItem
          key={message._id}
          message={message}
          isOwnMessage={message.sender === currentUserId}
        />
      ))}

      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
            <p className="text-sm italic">
              {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
              typing...
            </p>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
