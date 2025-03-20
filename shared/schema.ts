import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Chat (conversation) table
export const chats = sqliteTable("chats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull().default("New chat"),
  createdAt: text("created_at").default(String(new Date().toISOString())),
});

export const insertChatSchema = createInsertSchema(chats).pick({
  userId: true,
  title: true,
});

// Messages table
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: integer("chat_id").references(() => chats.id),
  content: text("content").notNull(),
  isUser: integer("is_user").notNull().default(1),
  createdAt: text("created_at").default(String(new Date().toISOString())),
  metadata: text("metadata"),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  content: true,
  isUser: true,
  metadata: true,
});

// AI Models
export const aiModels = sqliteTable("ai_models", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  modelId: text("model_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  active: integer("active").notNull().default(1),
});

export const insertAiModelSchema = createInsertSchema(aiModels).pick({
  modelId: true,
  name: true,
  description: true,
  active: true,
});

// Feature cards
export const featureCards = sqliteTable("feature_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  active: integer("active").notNull().default(1),
});

export const insertFeatureCardSchema = createInsertSchema(featureCards).pick({
  title: true,
  active: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Chat = typeof chats.$inferSelect;
export type InsertChat = z.infer<typeof insertChatSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type AiModel = typeof aiModels.$inferSelect;
export type InsertAiModel = z.infer<typeof insertAiModelSchema>;

export type FeatureCard = typeof featureCards.$inferSelect;
export type InsertFeatureCard = z.infer<typeof insertFeatureCardSchema>;

// 额外的接口定义
export interface ModelInfo {
  id: string;
  name: string;
}

export interface MessageWithModel extends Message {
  model?: ModelInfo;
}

// SQLite中日期处理辅助函数
export function parseDate(dateStr: string | null): Date {
  if (!dateStr) return new Date();
  try {
    return new Date(dateStr);
  } catch (e) {
    return new Date();
  }
}

// 布尔值转换辅助函数
export function toBoolean(value: number | null | undefined): boolean {
  return value === 1 || value === true;
}
