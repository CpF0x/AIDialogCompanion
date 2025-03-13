import { cn } from "@/lib/utils";
import { Chat } from "@/lib/types";
import ChatHistory from "@/components/ChatHistory";
import { Link } from "wouter";

interface SidebarProps {
  chats: Chat[];
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onNewChat: () => void;
  selectedChatId: number;
}

export default function Sidebar({ 
  chats, 
  isMobileOpen, 
  onCloseMobile, 
  onNewChat,
  selectedChatId
}: SidebarProps) {
  return (
    <div 
      className={cn(
        "w-64 bg-gray-50 border-r border-border sidebar-height overflow-y-auto md:block",
        isMobileOpen ? "fixed inset-0 z-50" : "hidden"
      )}
      style={{ height: "calc(100vh - 2rem)" }}
    >
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h1 className="text-lg font-semibold">AI Assistant</h1>
        <button 
          className="text-gray-400 hover:text-primary md:hidden" 
          aria-label="Close sidebar"
          onClick={onCloseMobile}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="p-4">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 border border-border rounded-lg py-2 px-4 text-sm font-medium transition-all"
          onClick={onNewChat}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Start new chat
        </button>
      </div>
      
      {/* Chat History */}
      <ChatHistory chats={chats} selectedChatId={selectedChatId} />
      
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-border bg-gray-50">
        <div className="flex items-center text-sm">
          <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div className="ml-2 truncate">user@example.com</div>
        </div>
      </div>
    </div>
  );
}
