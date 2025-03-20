import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { Chat, Message, Model } from "./types";

// Hook for handling sidebar visibility on mobile
export function useSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  return { isSidebarOpen, toggleSidebar };
}

// Hook for fetching available AI models
export function useAvailableModels() {
  return useQuery<Model[]>({
    queryKey: ["/api/models"],
    staleTime: 3600000, // 1 hour
  });
}

// Hook for stored selected model
export function useSelectedModel() {
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    // 从本地存储中恢复上次选择的模型（如果有）
    const savedModel = localStorage.getItem("selectedModelId");
    return savedModel || "deepseek-r1-250120"; // 使用默认模型
  });
  
  useEffect(() => {
    // 当选择的模型ID改变时，保存到本地存储
    localStorage.setItem("selectedModelId", selectedModelId);
  }, [selectedModelId]);
  
  return { selectedModelId, setSelectedModelId };
}

// Hook for chat creation
export function useCreateChat() {
  const createChatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chats", { title: "New chat" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chats"] });
    },
  });
  
  return createChatMutation;
}

// Hook for sending messages
export function useSendMessage(chatId: number) {
  const [streamingMessage, setStreamingMessage] = useState<{ id: number; content: string } | null>(null);
  
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, modelId, stream = false }: { content: string; modelId?: string; stream?: boolean }) => {
      if (stream) {
        // 使用流式输出
        const response = await apiRequest("POST", `/api/chats/${chatId}/messages`, {
          content,
          modelId,
          stream: true
        }, { noJson: true });
        
        // 创建事件源
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          throw new Error('无法创建流式响应读取器');
        }
        
        let aiMessageId: number | null = null;
        
        // 处理流式响应
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.substring(6);
              
              try {
                const parsedData = JSON.parse(data);
                
                if (parsedData.type === 'init') {
                  // 初始化消息
                  aiMessageId = parsedData.aiMessageId;
                  setStreamingMessage({ id: aiMessageId, content: '' });
                  
                  // 立即更新查询缓存，添加用户消息
                  queryClient.setQueryData(
                    [`/api/chats/${chatId}/messages`],
                    (oldData: any) => {
                      if (!oldData) return [parsedData.userMessage];
                      return [...oldData, parsedData.userMessage];
                    }
                  );
                } else if (parsedData.type === 'update' && aiMessageId) {
                  // 更新流式内容
                  setStreamingMessage(prev => {
                    if (!prev) return { id: aiMessageId!, content: parsedData.content };
                    return { id: prev.id, content: prev.content + parsedData.content };
                  });
                  
                  // 更新查询缓存中的AI消息
                  queryClient.setQueryData(
                    [`/api/chats/${chatId}/messages`],
                    (oldData: any) => {
                      if (!oldData) return [];
                      
                      const newData = [...oldData];
                      const aiMessageIndex = newData.findIndex(msg => msg.id === aiMessageId);
                      
                      if (aiMessageIndex === -1) {
                        // 如果AI消息不存在，添加它
                        newData.push({
                          id: aiMessageId,
                          chatId,
                          content: streamingMessage?.content || '' + parsedData.content,
                          isUser: false,
                          createdAt: new Date(),
                          model: parsedData.model
                        });
                      } else {
                        // 更新现有AI消息
                        newData[aiMessageIndex] = {
                          ...newData[aiMessageIndex],
                          content: streamingMessage?.content || '',
                          model: parsedData.model
                        };
                      }
                      
                      return newData;
                    }
                  );
                } else if (parsedData.type === 'done') {
                  // 流式响应结束，清理状态
                  setStreamingMessage(null);
                  
                  // 刷新消息列表
                  queryClient.invalidateQueries({ queryKey: [`/api/chats/${chatId}/messages`] });
                }
              } catch (e) {
                console.error('解析流式数据失败:', e, data);
              }
            }
          }
        }
        
        return { success: true };
      } else {
        // 非流式输出，使用原有的处理方式
        const response = await apiRequest("POST", `/api/chats/${chatId}/messages`, {
          content,
          modelId
        });
        return response.json();
      }
    },
    onSuccess: () => {
      // 非流式输出时刷新消息列表
      if (!streamingMessage) {
        queryClient.invalidateQueries({ queryKey: [`/api/chats/${chatId}/messages`] });
      }
    },
  });
  
  return { sendMessageMutation, streamingMessage };
}

// Hook for getting formatted time ago
export function useTimeAgo(date?: Date | string | null) {
  const [timeAgo, setTimeAgo] = useState<string>("");
  
  useEffect(() => {
    if (!date) {
      setTimeAgo("");
      return;
    }
    
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      setTimeAgo("just now");
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      setTimeAgo(`${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`);
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      setTimeAgo(`${hours} ${hours === 1 ? "hour" : "hours"} ago`);
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      setTimeAgo(`${days} ${days === 1 ? "day" : "days"} ago`);
    }
  }, [date]);
  
  return timeAgo;
}
