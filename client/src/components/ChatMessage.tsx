import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SunIcon, UserIcon } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.isUser;
  
  return (
    <div className={cn(
      "flex items-start mb-6",
      isUser && "flex-row-reverse"
    )}>
      <div className={cn(
        "flex-shrink-0",
        isUser ? "ml-3" : "mr-3"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-gray-300" : "bg-orange-500 text-white"
        )}>
          {isUser ? (
            <UserIcon className="h-5 w-5" />
          ) : (
            <SunIcon className="h-5 w-5" />
          )}
        </div>
      </div>
      
      <div className={cn(
        "flex-1 p-4 rounded-lg",
        isUser ? "bg-gray-100 text-left" : "bg-white border border-gray-100"
      )}>
        <p className="text-gray-700 whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}
