import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Chat (conversation) table
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull().default("New chat"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatSchema = createInsertSchema(chats).pick({
  userId: true,
  title: true,
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chats.id),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: text("metadata"), // 存储模型信息的JSON字符串
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  content: true,
  isUser: true,
  metadata: true,
});

// AI Models
export const aiModels = pgTable("ai_models", {
  id: serial("id").primaryKey(),
  modelId: text("model_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
});

export const insertAiModelSchema = createInsertSchema(aiModels).pick({
  modelId: true,
  name: true,
  description: true,
  active: true,
});

// Feature cards
export const featureCards = pgTable("feature_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  active: boolean("active").notNull().default(true),
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
