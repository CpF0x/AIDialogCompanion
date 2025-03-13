import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";
import { Chat, Message } from "./types";

// Hook for handling sidebar visibility on mobile
export function useSidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  return { isSidebarOpen, toggleSidebar };
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
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/chats/${chatId}/messages`, {
        content,
        isUser: true
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chats/${chatId}/messages`] });
    },
  });
  
  return sendMessageMutation;
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
