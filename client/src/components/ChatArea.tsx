import { Message, Chat, FeatureCard as FeatureCardType } from "@/lib/types";
import AnalysisTool from "@/components/AnalysisTool";
import FeatureCard from "@/components/FeatureCard";
import RecentChats from "@/components/RecentChats";
import ChatMessage from "@/components/ChatMessage";
import { SunIcon } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  featureCards: FeatureCardType[];
  recentChats: Chat[];
  greeting: string;
}

export default function ChatArea({ 
  messages, 
  isLoading,
  featureCards,
  recentChats,
  greeting
}: ChatAreaProps) {
  const showWelcomeView = messages.length === 0 && !isLoading;
  
  return (
    <div 
      className="flex-1 overflow-y-auto p-6" 
      style={{ height: "calc(100vh - 16rem)" }}
    >
      <div className="max-w-4xl mx-auto">
        {showWelcomeView ? (
          <>
            {/* Welcome Message */}
            <div className="flex items-start mb-6">
              <div className="mr-3 flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  <SunIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-medium text-gray-700">{greeting}, User</h2>
                <p className="text-gray-500 mt-2">How can I help you today?</p>
              </div>
            </div>
            
            {/* Analysis Tool Card */}
            <AnalysisTool />
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {featureCards.map(card => (
                <FeatureCard 
                  key={card.id} 
                  title={card.title}
                />
              ))}
            </div>
            
            {/* Recent Chats */}
            {recentChats.length > 0 && (
              <RecentChats chats={recentChats} />
            )}
          </>
        ) : (
          <>
            {/* Chat Messages */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
