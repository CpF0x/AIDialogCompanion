import { 
  users, featureCards, chats, messages,
  type User, type InsertUser,
  type Chat, type InsertChat,
  type Message, type InsertMessage,
  type FeatureCard, type InsertFeatureCard
} from "@shared/schema";

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
    this.createFeatureCard({ title: "Extract insights from report", active: true });
    this.createFeatureCard({ title: "Polish your prose", active: true });
    this.createFeatureCard({ title: "Generate interview questions", active: true });
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
    const now = new Date();
    const chat: Chat = { 
      ...insertChat, 
      id,
      createdAt: now
    };
    this.chats.set(id, chat);
    return chat;
  }
  
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    return Array.from(this.chats.values())
      .filter(chat => chat.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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
    const now = new Date();
    const message: Message = {
      ...insertMessage,
      id,
      createdAt: now
    };
    this.messages.set(id, message);
    
    // Update chat title based on first user message
    if (insertMessage.isUser) {
      const chatMessages = await this.getMessagesByChatId(insertMessage.chatId);
      if (chatMessages.length === 1) {
        const titlePreview = insertMessage.content.substring(0, 50);
        await this.updateChatTitle(insertMessage.chatId, titlePreview);
      }
    }
    
    return message;
  }
  
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  
  // Feature card methods
  async getFeatureCards(): Promise<FeatureCard[]> {
    return Array.from(this.featureCards.values());
  }
  
  async createFeatureCard(insertCard: InsertFeatureCard): Promise<FeatureCard> {
    const id = this.featureCardId++;
    const card: FeatureCard = { ...insertCard, id };
    this.featureCards.set(id, card);
    return card;
  }
}

export const storage = new MemStorage();
