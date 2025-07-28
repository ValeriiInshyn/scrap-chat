"use client";

import { Chat, Message } from "../../types/chat";
import ChatTitle from "./ChatTitle";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  selectedChat: Chat | null;
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
  socketConnected: boolean;
  forceUpdateCount: number;
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onTestSocket: () => void;
  onForceUpdate: () => void;
}

export default function ChatWindow({
  selectedChat,
  messages,
  currentUserId,
  typingUsers,
  socketConnected,
  forceUpdateCount,
  onSendMessage,
  onTyping,
  onStopTyping,
  onTestSocket,
  onForceUpdate,
}: ChatWindowProps) {
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a chat
          </h3>
          <p className="text-gray-500">
            Choose a chat from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatTitle
        chat={selectedChat}
        socketConnected={socketConnected}
        onTestSocket={onTestSocket}
        onForceUpdate={onForceUpdate}
        forceUpdateCount={forceUpdateCount}
      />

      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        forceUpdateCount={forceUpdateCount}
      />

      <MessageInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
      />
    </div>
  );
}
