import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";
import MessageInput from "@/components/MessageInput";
import { useSidebar, useCreateChat, useSendMessage } from "@/lib/hooks";
import { getGreeting } from "@/lib/utils";

export default function Home() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id?: string }>();
  const chatId = params.id ? parseInt(params.id) : null;
  
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const createChatMutation = useCreateChat();
  
  // Get chats
  const { data: chats = [] } = useQuery({
    queryKey: ["/api/chats"],
  });
  
  // Get current chat messages if a chat is selected
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: chatId ? [`/api/chats/${chatId}/messages`] : null,
    enabled: !!chatId,
  });
  
  // Get feature cards
  const { data: featureCards = [] } = useQuery({
    queryKey: ["/api/feature-cards"],
  });
  
  // Create a new chat and navigate to it
  const handleNewChat = async () => {
    try {
      const chat = await createChatMutation.mutateAsync();
      setLocation(`/chat/${chat.id}`);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };
  
  // If no chat is selected and chats exist, select the first one
  useEffect(() => {
    if (!chatId && chats.length > 0) {
      setLocation(`/chat/${chats[0].id}`);
    }
  }, [chatId, chats, setLocation]);
  
  // Send message handler
  const { sendMessageMutation, streamingMessage } = useSendMessage(chatId || 0);
  
  const handleSendMessage = async ({ content, modelId }: { content: string; modelId?: string }) => {
    if (!content.trim() || !chatId) return;
    
    try {
      // 使用流式输出
      await sendMessageMutation.mutateAsync({ content, modelId, stream: true });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  
  // Get selected chat
  const selectedChat = chatId ? chats.find(c => c.id === chatId) : null;
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        chats={chats}
        isMobileOpen={isSidebarOpen}
        onCloseMobile={() => toggleSidebar()}
        onNewChat={handleNewChat}
        selectedChatId={chatId || 0}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border p-4 flex justify-between items-center">
          <div className="flex items-center md:hidden">
            <button 
              className="text-gray-500 hover:text-gray-700 mr-2" 
              aria-label="Menu"
              onClick={toggleSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm text-gray-500 bg-gray-100">
              <span>Using limited free plan</span>
              <a href="#" className="ml-2 text-orange-500 hover:underline">Upgrade</a>
            </div>
          </div>
          
          <div className="w-6"></div>
        </header>
        
        {/* Chat Area */}
        <ChatArea 
          messages={messages}
          isLoading={messagesLoading}
          featureCards={featureCards}
          recentChats={chats.slice(0, 3)}
          greeting={getGreeting()}
          streamingMessage={streamingMessage}
        />
        
        {/* Message Input */}
        <MessageInput 
          onSendMessage={handleSendMessage} 
          isLoading={sendMessageMutation.isPending}
        />
      </div>
    </div>
  );
}
