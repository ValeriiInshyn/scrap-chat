"use client";

import { Chat, Message } from "../../types/chat";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";

interface ChatContainerProps {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
  socketConnected: boolean;
  forceUpdateCount: number;
  onSelectChat: (chat: Chat) => void;
  onCreateChat: (name: string) => void;
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onTestSocket: () => void;
  onForceUpdate: () => void;
}

export default function ChatContainer({
  chats,
  selectedChat,
  messages,
  currentUserId,
  typingUsers,
  socketConnected,
  forceUpdateCount,
  onSelectChat,
  onCreateChat,
  onSendMessage,
  onTyping,
  onStopTyping,
  onTestSocket,
  onForceUpdate,
}: ChatContainerProps) {
  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow">
      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={onSelectChat}
        onCreateChat={onCreateChat}
      />

      <ChatWindow
        selectedChat={selectedChat}
        messages={messages}
        currentUserId={currentUserId}
        typingUsers={typingUsers}
        socketConnected={socketConnected}
        forceUpdateCount={forceUpdateCount}
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
        onTestSocket={onTestSocket}
        onForceUpdate={onForceUpdate}
      />
    </div>
  );
}
