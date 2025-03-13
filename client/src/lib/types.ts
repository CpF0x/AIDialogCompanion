export interface User {
  id: number;
  username: string;
}

export interface Chat {
  id: number;
  userId: number;
  title: string;
  createdAt: Date;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface Message {
  id: number;
  chatId: number;
  content: string;
  isUser: boolean;
  createdAt: Date;
  metadata?: string;
  model?: {
    id: string;
    name: string;
  };
}

export interface FeatureCard {
  id: number;
  title: string;
  active: boolean;
}
