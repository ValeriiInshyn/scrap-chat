"use client";

import { useState } from "react";
import { Chat } from "../../types/chat";
import ChatCard from "./ChatCard";

interface ChatListProps {
  chats: Chat[];
  selectedChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: (name: string) => void;
}

export default function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  onCreateChat,
}: ChatListProps) {
  const [newChatName, setNewChatName] = useState("");

  const handleCreateChat = () => {
    if (newChatName.trim()) {
      onCreateChat(newChatName.trim());
      setNewChatName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateChat();
    }
  };

  return (
    <div className="w-1/3 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chats</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="New chat name"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateChat}
            disabled={!newChatName.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No chats yet</p>
            <p className="text-sm">Create a new chat to get started</p>
          </div>
        ) : (
          chats.map((chat) => (
            <ChatCard
              key={chat._id}
              chat={chat}
              isSelected={selectedChat?._id === chat._id}
              onSelect={onSelectChat}
            />
          ))
        )}
      </div>
    </div>
  );
}
