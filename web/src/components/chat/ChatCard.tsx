"use client";

import { Chat } from "../../types/chat";

interface ChatCardProps {
  chat: Chat;
  isSelected: boolean;
  onSelect: (chat: Chat) => void;
}

export default function ChatCard({
  chat,
  isSelected,
  onSelect,
}: ChatCardProps) {
  return (
    <div
      onClick={() => onSelect(chat)}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
      }`}
    >
      <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
      <p className="text-sm text-gray-500">
        {chat.participants.length} participant
        {chat.participants.length !== 1 ? "s" : ""}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        Created {new Date(chat.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
