import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSchema, insertMessageSchema, MessageWithModel } from "@shared/schema";
import { generateDeepSeekResponse, getAvailableModels } from "./deepseek";
import { WebSocketServer, WebSocket } from 'ws';
import axios from 'axios';
import url from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/config';

// 在ES模块中获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从配置文件中获取Python API服务的地址
const PYTHON_API_URL = config.pythonApi.url;

// 定义流式响应类型
interface StreamChatResponse {
  content: string;
  model?: {
    id: string;
    name: string;
  };
}

// 定义普通响应类型
interface ChatResponse {
  content: string;
  model?: {
    id: string;
    name: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // 创建HTTP服务器
  const server = createServer(app);

  // 创建WebSocket服务器
  const wss = new WebSocketServer({
    server,
    path: '/ws' // 指定WebSocket路径为/ws
  });

  console.log('WebSocket服务器已启动，路径: /ws');

  // 存储活跃连接
  const clients = new Map<string, WebSocket>();

  // WebSocket处理
  wss.on('connection', (ws: WebSocket, req: Request) => {
    console.log('WebSocket连接建立');

    // 使用查询参数或cookie获取用户ID
    const parsedUrl = url.parse(req.url || '', true);
    const userId = parsedUrl.query.userId as string;

    if (!userId) {
      console.log('未提供用户ID，关闭连接');
      ws.close();
      return;
    }

    // 存储客户端连接
    clients.set(userId, ws);
    console.log(`用户 ${userId} 的WebSocket连接已注册`);

    // 如果用户已订阅新闻，将WebSocket客户端注册到后端服务
    try {
      axios.post(`${PYTHON_API_URL}/api/register-client`, {
        user_id: userId
      }).then(() => {
        console.log(`用户 ${userId} 的WebSocket客户端已注册到Python服务`);
      }).catch(error => {
        console.error(`注册WebSocket客户端失败: ${error.message}`);
      });
    } catch (error) {
      console.error(`注册WebSocket客户端失败: ${error}`);
    }

    // 处理客户端消息
    ws.on('message', (message: Buffer) => {
      const msgString = message.toString();
      console.log(`收到客户端消息: ${msgString}`);

      try {
        const data = JSON.parse(msgString);

        // 处理订阅新闻请求
        if (data.type === 'subscribe_news') {
          axios.post(`${PYTHON_API_URL}/api/subscribe-news`, {
            user_id: userId
          }).then(response => {
            const result = response.data;
            ws.send(JSON.stringify({
              type: 'news_subscription',
              status: 'success',
              message: result.message,
              next_update: result.next_update
            }));
          }).catch(error => {
            ws.send(JSON.stringify({
              type: 'news_subscription',
              status: 'error',
              message: error.message
            }));
          });
        }

        // 处理取消订阅新闻请求
        else if (data.type === 'unsubscribe_news') {
          axios.post(`${PYTHON_API_URL}/api/unsubscribe-news`, {
            user_id: userId
          }).then(response => {
            const result = response.data;
            ws.send(JSON.stringify({
              type: 'news_unsubscription',
              status: 'success',
              message: result.message
            }));
          }).catch(error => {
            ws.send(JSON.stringify({
              type: 'news_unsubscription',
              status: 'error',
              message: error.message
            }));
          });
        }
      } catch (error) {
        console.error(`处理WebSocket消息失败: ${error}`);
      }
    });

    // 处理连接关闭
    ws.on('close', () => {
      console.log(`用户 ${userId} 的WebSocket连接已关闭`);
      clients.delete(userId);

      // 通知Python服务客户端已断开连接
      try {
        axios.post(`${PYTHON_API_URL}/api/unregister-client`, {
          user_id: userId
        }).catch(error => {
          console.error(`注销WebSocket客户端失败: ${error.message}`);
        });
      } catch (error) {
        console.error(`注销WebSocket客户端失败: ${error}`);
      }
    });

    // 发送初始连接确认消息
    ws.send(JSON.stringify({ type: 'connection', status: 'connected', userId }));
  });

  // API routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // 添加广播新闻API
  app.post("/api/broadcast-news", async (req, res) => {
    try {
      const { user_ids, message } = req.body;
      console.log(`广播新闻消息到用户: ${user_ids.join(", ")}`);

      if (!user_ids || !Array.isArray(user_ids) || !message) {
        return res.status(400).json({ error: "无效的请求参数" });
      }

      let sentCount = 0;

      // 向指定用户发送消息
      for (const userId of user_ids) {
        const client = clients.get(userId.toString());
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
          sentCount++;
        }
      }

      res.json({
        status: "success",
        message: `已发送消息到${sentCount}个活跃用户`
      });
    } catch (error) {
      console.error("广播消息失败:", error);
      res.status(500).json({ error: "广播消息失败" });
    }
  });

  // 模型API
  app.get("/api/models", async (_req, res) => {
    try {
      const models = await getAvailableModels();
      res.json(models);
    } catch (error) {
      console.error("获取模型出错:", error);
      res.status(500).json({ error: "Failed to fetch AI models" });
    }
  });

  // Feature cards
  app.get("/api/feature-cards", async (_req, res) => {
    try {
      const cards = await storage.getFeatureCards();
      res.json(cards);
    } catch (error) {
      console.error("获取功能卡片出错:", error);
      res.status(500).json({ error: "Failed to fetch feature cards" });
    }
  });

  // 通用代理函数，用于将请求转发到Python API服务
  const proxyToPythonApi = async (req: Request, res: Response, endpoint: string, method: 'GET' | 'POST' = 'GET') => {
    try {
      const url = `${PYTHON_API_URL}${endpoint}`;
      console.log(`代理请求到Python API: ${method} ${url}`);

      // 构建请求配置
      const config: any = {
        headers: {
          'Content-Type': 'application/json',
        }
      };

      // 复制原始请求的所有头部
      const headersToForward = ['authorization', 'x-api-key'];
      headersToForward.forEach(header => {
        if (req.headers[header]) {
          config.headers[header] = req.headers[header];
        }
      });

      // 根据方法发送请求
      let response;
      if (method === 'GET') {
        // 将查询参数添加到URL
        const queryString = new URLSearchParams(req.query as any).toString();
        const urlWithQuery = queryString ? `${url}?${queryString}` : url;
        response = await axios.get(urlWithQuery, config);
      } else {
        response = await axios.post(url, req.body, config);
      }

      // 返回响应
      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`代理请求失败 (${endpoint}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(500).json({ status: 'error', message: `Failed to proxy request to ${endpoint}` });
    }
  };

  // 代理新闻触发API
  app.post("/api/trigger-news-summary", (req, res) => {
    return proxyToPythonApi(req, res, '/api/trigger-news-summary', 'POST');
  });

  // 代理新闻状态API
  app.get("/api/news-status", (req, res) => {
    return proxyToPythonApi(req, res, '/api/news-status', 'GET');
  });

  // 代理订阅新闻API
  app.post("/api/subscribe-news", (req, res) => {
    return proxyToPythonApi(req, res, '/api/subscribe-news', 'POST');
  });

  // 代理取消订阅新闻API
  app.post("/api/unsubscribe-news", (req, res) => {
    return proxyToPythonApi(req, res, '/api/unsubscribe-news', 'POST');
  });

  // 代理测试新闻API
  app.get("/api/test-news", (req, res) => {
    return proxyToPythonApi(req, res, '/api/test-news', 'GET');
  });

  // Chats
  app.get("/api/chats", async (_req, res) => {
    try {
      // For demo purposes, we're using userId 1
      const userId = 1;

      // 确保用户存在
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({ username: "demo_user", password: "password" });
        console.log("自动创建了演示用户:", user);
      }

      const chats = await storage.getChatsByUserId(userId);
      res.json(chats);
    } catch (error) {
      console.error("获取聊天记录出错:", error);
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  app.post("/api/chats", async (req, res) => {
    try {
      // For demo purposes, we're using userId 1
      const userId = 1;

      // 确保用户存在
      let user = await storage.getUser(userId);
      if (!user) {
        user = await storage.createUser({ username: "demo_user", password: "password" });
        console.log("自动创建了演示用户:", user);
      }

      console.log("创建聊天请求数据:", req.body);
      const result = insertChatSchema.safeParse({ ...req.body, userId });

      if (!result.success) {
        console.error("聊天数据验证失败:", result.error);
        return res.status(400).json({ error: "Invalid chat data", details: result.error.format() });
      }

      console.log("准备创建聊天:", result.data);
      const chat = await storage.createChat(result.data);
      console.log("聊天创建成功:", chat);
      res.status(201).json(chat);
    } catch (error) {
      console.error("创建聊天出错:", error);
      res.status(500).json({ error: "Failed to create chat", details: String(error) });
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

      // 解析消息元数据，提取模型信息
      const messagesWithModel: MessageWithModel[] = messages.map(message => {
        if (message.metadata) {
          try {
            const metadata = JSON.parse(message.metadata);
            return {
              ...message,
              model: metadata.model
            };
          } catch (e) {
            return message;
          }
        }
        return message;
      });

      res.json(messagesWithModel);
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

      const { content, modelId, stream } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      // 创建用户消息
      const userMessage = await storage.createMessage({
        chatId,
        content,
        isUser: 1 // 使用整数代替布尔值
      });

      // 如果是流式输出
      if (stream) {
        // 设置响应头，支持SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no'); // 禁用Nginx缓冲

        try {
          // 使用选定的模型生成流式AI回复
          const streamResponse = await generateDeepSeekResponse(content, modelId, true) as ReadableStream<StreamChatResponse>;

          // 创建一个空的AI消息，后续会更新内容
          const aiMessage = await storage.createMessage({
            chatId,
            content: "", // 初始为空
            isUser: 0, // 使用整数代替布尔值
            metadata: JSON.stringify({ model: { id: modelId || "unknown", name: "处理中..." } })
          });

          // 发送用户消息和初始AI消息ID
          res.write(`data: ${JSON.stringify({ type: 'init', userMessage, aiMessageId: aiMessage.id })}\n\n`);

          // 用于累积完整的AI回复
          let fullContent = "";
          let modelInfo = { id: modelId || "unknown", name: "未知模型" };

          // 处理流式响应
          const reader = streamResponse.getReader();

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            if (value) {
              // 累积内容
              fullContent += value.content;
              // 更新模型信息
              if (value.model) {
                modelInfo = value.model;
              }

              // 发送增量更新
              res.write(`data: ${JSON.stringify({ type: 'update', content: value.content, model: modelInfo })}\n\n`);
            }
          }

          // 更新数据库中的AI消息
          await storage.updateMessage(aiMessage.id, {
            content: fullContent,
            metadata: JSON.stringify({ model: modelInfo })
          });

          // 发送完成信号
          res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
          res.end();
        } catch (error) {
          console.error('生成流式 AI 回复时出错:', error);

          // 发送错误信息
          res.write(`data: ${JSON.stringify({ type: 'error', message: "生成回复时出现问题。请稍后再试。" })}\n\n`);
          res.end();

          // 更新数据库中的AI消息为错误信息
          await storage.createMessage({
            chatId,
            content: "抱歉，生成回复时出现问题。请稍后再试。",
            isUser: 0 // 使用整数代替布尔值
          });
        }
      } else {
        // 非流式输出
        try {
          // 使用选定的模型生成AI回复
          const response = await generateDeepSeekResponse(content, modelId, false);
          if ('response' in response) {
            // 创建AI消息
            const aiMessage = await storage.createMessage({
              chatId,
              content: response.response,
              isUser: 0, // 使用整数代替布尔值
              metadata: JSON.stringify({ model: response.model })
            });

            // 返回用户消息和AI消息
            res.json({
              userMessage,
              aiMessage
            });
          } else {
            throw new Error('Unexpected response type');
          }
        } catch (error) {
          console.error('生成 AI 回复时出错:', error);

          // 创建错误消息
          const aiMessage = await storage.createMessage({
            chatId,
            content: "抱歉，生成回复时出现问题。请稍后再试。",
            isUser: 0 // 使用整数代替布尔值
          });

          res.json({
            userMessage,
            aiMessage
          });
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  return server;
}

