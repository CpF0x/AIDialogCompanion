import { 
  users, featureCards, chats, messages,
  type User, type InsertUser,
  type Chat, type InsertChat,
  type Message, type InsertMessage,
  type FeatureCard, type InsertFeatureCard,
  toBoolean
} from "@shared/schema";
import { SQLiteStorage } from "../shared/sqlite-storage";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat methods
  createChat(chat: InsertChat): Promise<Chat>;
  getChatsByUserId(userId: number): Promise<Chat[]>;
  getChatById(id: number): Promise<Chat | undefined>;
  updateChatTitle(id: number, title: string): Promise<Chat | undefined>;
  
  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChatId(chatId: number): Promise<Message[]>;
  updateMessage(id: number, updates: Partial<Omit<Message, 'id' | 'chatId' | 'createdAt'>>): Promise<Message | undefined>;
  
  // Feature card methods
  getFeatureCards(): Promise<FeatureCard[]>;
  createFeatureCard(card: InsertFeatureCard): Promise<FeatureCard>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chats: Map<number, Chat>;
  private messages: Map<number, Message>;
  private featureCards: Map<number, FeatureCard>;
  
  private userId: number;
  private chatId: number;
  private messageId: number;
  private featureCardId: number;
  
  constructor() {
    this.users = new Map();
    this.chats = new Map();
    this.messages = new Map();
    this.featureCards = new Map();
    
    this.userId = 1;
    this.chatId = 1;
    this.messageId = 1;
    this.featureCardId = 1;
    
    // Initialize with default feature cards
    this.createFeatureCard({ title: "Extract insights from report", active: 1 });
    this.createFeatureCard({ title: "Polish your prose", active: 1 });
    this.createFeatureCard({ title: "Generate interview questions", active: 1 });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Chat methods
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const id = this.chatId++;
    const now = new Date().toISOString(); // 使用ISO日期字符串
    const chat: Chat = { 
      id,
      userId: insertChat.userId || null,
      title: insertChat.title || 'New chat',
      createdAt: now
    };
    this.chats.set(id, chat);
    return chat;
  }
  
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values())
      .filter(chat => chat.userId === userId)
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || '').getTime();
        const timeB = new Date(b.createdAt || '').getTime();
        return timeB - timeA;
      });
  }
  
  async getChatById(id: number): Promise<Chat | undefined> {
    return this.chats.get(id);
  }
  
  async updateChatTitle(id: number, title: string): Promise<Chat | undefined> {
    const chat = this.chats.get(id);
    if (!chat) return undefined;
    
    const updatedChat: Chat = { ...chat, title };
    this.chats.set(id, updatedChat);
    
    return updatedChat;
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date().toISOString(); // 使用ISO日期字符串
    // 处理布尔值
    const isUser = insertMessage.isUser === undefined ? 1 : (insertMessage.isUser ? 1 : 0);
    
    const message: Message = {
      id,
      chatId: insertMessage.chatId || null,
      content: insertMessage.content,
      isUser: isUser,
      metadata: insertMessage.metadata || null,
      createdAt: now
    };
    this.messages.set(id, message);
    
    // Update chat title based on first user message
    if (toBoolean(isUser) && message.chatId) {
      const chatMessages = await this.getMessagesByChatId(message.chatId);
      if (chatMessages.length === 1) {
        const titlePreview = message.content.substring(0, 50);
        await this.updateChatTitle(message.chatId, titlePreview);
      }
    }
    
    return message;
  }
  
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || '').getTime();
        const timeB = new Date(b.createdAt || '').getTime();
        return timeA - timeB;
      });
  }
  
  async updateMessage(id: number, updates: Partial<Omit<Message, 'id' | 'chatId' | 'createdAt'>>): Promise<Message | undefined> {
    const message = this.messages.get(id);
    if (!message) return undefined;
    
    // 处理布尔值
    const processedUpdates = {...updates};
    if (updates.isUser !== undefined) {
      processedUpdates.isUser = updates.isUser ? 1 : 0;
    }
    
    const updatedMessage: Message = { ...message, ...processedUpdates };
    this.messages.set(id, updatedMessage);
    
    return updatedMessage;
  }
  
  // Feature card methods
  async getFeatureCards(): Promise<FeatureCard[]> {
    return Array.from(this.featureCards.values());
  }
  
  async createFeatureCard(insertCard: InsertFeatureCard): Promise<FeatureCard> {
    const id = this.featureCardId++;
    // 处理布尔值
    const active = insertCard.active === undefined ? 1 : (typeof insertCard.active === 'boolean' ? (insertCard.active ? 1 : 0) : insertCard.active);
    
    const card: FeatureCard = { 
      title: insertCard.title,
      active,
      id 
    };
    this.featureCards.set(id, card);
    
    return card;
  }
}

export const storage = new SQLiteStorage();
