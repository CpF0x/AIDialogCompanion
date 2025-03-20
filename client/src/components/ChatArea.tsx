import { Message, Chat, FeatureCard as FeatureCardType } from "@/lib/types";
import AnalysisTool from "@/components/AnalysisTool";
import FeatureCard from "@/components/FeatureCard";
import RecentChats from "@/components/RecentChats";
import ChatMessage from "@/components/ChatMessage";
import NewsSubscription from "@/components/NewsSubscription";
import { SunIcon, NewspaperIcon, MessageCircleIcon } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  featureCards: FeatureCardType[];
  recentChats: Chat[];
  greeting: string;
  streamingMessage?: { id: number; content: string } | null;
}

export default function ChatArea({
  messages,
  isLoading,
  featureCards,
  recentChats,
  greeting,
  streamingMessage,
}: ChatAreaProps) {
  const showWelcomeView = messages.length === 0 && !isLoading;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-8.5rem)] overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <FeatureCard
            title="AI 聊天助手"
            description="与AI进行一般性对话，获取帮助和建议"
            icon={MessageCircleIcon}
          />
          <FeatureCard
            title="新闻总结助手"
            description="询问今日要闻，获取AI分析的新闻总结"
            icon={NewspaperIcon}
          />
          {featureCards.map((card) => (
            <FeatureCard key={card.id} title={card.title} />
          ))}
        </div>
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
                <h2 className="text-2xl font-medium text-gray-700">
                  {greeting}, User
                </h2>
                <p className="text-gray-500 mt-2">How can I help you today?</p>
              </div>
            </div>
            
            {/* 新闻订阅组件 */}
            <NewsSubscription />

            {/* Analysis Tool Card */}
            <AnalysisTool />

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
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                
                {/* 显示流式生成的消息 */}
                {streamingMessage && (
                  <div className="flex items-start mb-6">
                    <div className="mr-3 flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                        <SunIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 p-4 rounded-lg bg-white border border-gray-100">
                      <p className="text-gray-700 whitespace-pre-wrap break-words">{streamingMessage.content}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}