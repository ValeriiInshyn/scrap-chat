export interface Message {
  _id: string;
  content: string;
  sender: string;
  chatId: string;
  createdAt: string;
}

export interface Chat {
  _id: string;
  name: string;
  participants: string[];
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}
