import { db } from './db';
import { 
  users, featureCards, chats, messages,
  type User, type InsertUser,
  type Chat, type InsertChat,
  type Message, type InsertMessage,
  type FeatureCard, type InsertFeatureCard,
  parseDate, toBoolean
} from "./schema";
import { eq, desc } from 'drizzle-orm';
import { IStorage } from '../server/storage';

export class SQLiteStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Chat methods
  async createChat(insertChat: InsertChat): Promise<Chat> {
    const now = new Date().toISOString();
    const result = await db.insert(chats).values({
      userId: insertChat.userId || null,
      title: insertChat.title || 'New chat',
      createdAt: now
    }).returning();
    
    return result[0];
  }
  
  async getChatsByUserId(userId: number): Promise<Chat[]> {
    const results = await db.select()
      .from(chats)
      .where(eq(chats.userId, userId));
      
    return results.sort((a, b) => 
      new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
    );
  }
  
  async getChatById(id: number): Promise<Chat | undefined> {
    const result = await db.select().from(chats).where(eq(chats.id, id));
    return result[0];
  }
  
  async updateChatTitle(id: number, title: string): Promise<Chat | undefined> {
    const result = await db.update(chats)
      .set({ title })
      .where(eq(chats.id, id))
      .returning();
      
    return result[0];
  }
  
  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const now = new Date().toISOString();
    const result = await db.insert(messages).values({
      chatId: insertMessage.chatId || null,
      content: insertMessage.content,
      isUser: insertMessage.isUser || 1,
      metadata: insertMessage.metadata || null,
      createdAt: now
    }).returning();
    
    const message = result[0];
    
    // 根据第一条用户消息更新聊天标题
    if (message.isUser === 1 && message.chatId) {
      const chatMessages = await this.getMessagesByChatId(message.chatId);
      if (chatMessages.length === 1) {
        const titlePreview = message.content.substring(0, 50);
        await this.updateChatTitle(message.chatId, titlePreview);
      }
    }
    
    return message;
  }
  
  async getMessagesByChatId(chatId: number): Promise<Message[]> {
    const results = await db.select()
      .from(messages)
      .where(eq(messages.chatId, chatId));
      
    return results.sort((a, b) => 
      new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime()
    );
  }
  
  async updateMessage(id: number, updates: Partial<Omit<Message, 'id' | 'chatId' | 'createdAt'>>): Promise<Message | undefined> {
    const result = await db.update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning();
      
    return result[0];
  }
  
  // Feature card methods
  async getFeatureCards(): Promise<FeatureCard[]> {
    const results = await db.select().from(featureCards);
    return results;
  }
  
  async createFeatureCard(insertCard: InsertFeatureCard): Promise<FeatureCard> {
    const result = await db.insert(featureCards).values({
      title: insertCard.title,
      active: insertCard.active || 1
    }).returning();
    
    return result[0];
  }
} 