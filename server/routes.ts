import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema } from "@shared/schema";
import { generateDeepSeekResponse } from "./deepseek";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  
  // Feature cards
  app.get("/api/feature-cards", async (_req, res) => {
    try {
      const cards = await storage.getFeatureCards();
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feature cards" });
    }
  });
  
  // Chats
  app.get("/api/chats", async (_req, res) => {
    try {
      // For demo purposes, we're using userId 1
      const userId = 1;
      const chats = await storage.getChatsByUserId(userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });
  
  app.post("/api/chats", async (req, res) => {
    try {
      // For demo purposes, we're using userId 1
      const userId = 1;
      const result = insertChatSchema.safeParse({ ...req.body, userId });
      
      if (!result.success) {
        return res.status(400).json({ error: "Invalid chat data" });
      }
      
      const chat = await storage.createChat(result.data);
      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ error: "Failed to create chat" });
    }
  });
  
  app.get("/api/chats/:id", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      if (isNaN(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      
      const chat = await storage.getChatById(chatId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      
      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat" });
    }
  });
  
  // Messages
  app.get("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      if (isNaN(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      
      const messages = await storage.getMessagesByChatId(chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  
  app.post("/api/chats/:id/messages", async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      if (isNaN(chatId)) {
        return res.status(400).json({ error: "Invalid chat ID" });
      }
      
      const result = insertMessageSchema.safeParse({ ...req.body, chatId });
      
      if (!result.success) {
        return res.status(400).json({ error: "Invalid message data" });
      }
      
      // Create user message
      const userMessage = await storage.createMessage(result.data);
      
      try {
        // 使用 DeepSeek API 生成回复
        const aiResponse = await generateDeepSeekResponse(req.body.content);
        
        // 保存 AI 回复消息
        const aiMessage = await storage.createMessage({
          chatId,
          content: aiResponse,
          isUser: false
        });
        
        res.status(201).json({ userMessage, aiMessage });
      } catch (error) {
        console.error('生成 AI 回复时出错:', error);
        // 即使 AI 回复生成失败，仍然返回用户消息
        res.status(201).json({ 
          userMessage, 
          aiMessage: await storage.createMessage({
            chatId,
            content: "抱歉，生成回复时出现问题。请稍后再试。",
            isUser: false
          })
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}


