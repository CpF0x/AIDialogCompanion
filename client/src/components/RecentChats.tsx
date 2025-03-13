import { Link } from "wouter";
import { Chat } from "@/lib/types";
import { ChevronRightIcon, ClockIcon } from "lucide-react";
import { formatRelativeTime, truncateText } from "@/lib/utils";

interface RecentChatsProps {
  chats: Chat[];
}

export default function RecentChats({ chats }: RecentChatsProps) {
  if (chats.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium flex items-center">
          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
          Your recent chats
        </h3>
        <Link href="/">
          <a className="text-sm text-orange-500 hover:underline">View all</a>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {chats.map(chat => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <a className="border border-border rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-all">
              <div className="flex items-start mb-3">
                <div className="flex-shrink-0 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h.01a1 1 0 000-2H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2 flex-1">
                  <p className="text-sm font-medium">{truncateText(chat.title, 40)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">{formatRelativeTime(chat.createdAt)}</p>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
