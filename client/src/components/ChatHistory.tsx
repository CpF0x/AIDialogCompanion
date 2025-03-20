import { Link } from "wouter";
import { Chat } from "@/lib/types";
import { formatRelativeTime, truncateText, cn } from "@/lib/utils";

interface ChatHistoryProps {
  chats: Chat[];
  selectedChatId: number;
}

export default function ChatHistory({ chats, selectedChatId }: ChatHistoryProps) {
  if (chats.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-gray-500">
        <p className="text-sm">No chat history yet</p>
      </div>
    );
  }

  return (
    <div className="px-2">
      <h2 className="text-xs uppercase text-gray-400 font-semibold px-2 pt-4 pb-2">Recent</h2>

      {chats.map(chat => (
        <Link key={chat.id} href={`/chat/${chat.id}`}>
          <a className={cn(
            "chat-item hover:bg-gray-100 rounded-lg px-3 py-3 mb-2 cursor-pointer block transition-all duration-200 border border-transparent",
            selectedChatId === chat.id && "bg-white border-gray-200 shadow-sm"
          )}>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 000-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 flex-1">
                <p className="text-sm truncate">{truncateText(chat.title, 30)}</p>
                <p className="text-xs text-gray-400">{formatRelativeTime(chat.createdAt)}</p>
              </div>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
}