import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface RecentChatsProps {
  chats: { id: string; title: string }[];
}

export default function RecentChats({ chats }: RecentChatsProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Your recent chats</h2>
      <div className="flex flex-col gap-1">
        {chats.map((chat) => (
          <Link 
            key={chat.id} 
            href={`/chat/${chat.id}`}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg",
              "hover:bg-accent transition-colors",
              "text-sm text-muted-foreground"
            )}
          >
            {chat.title || "New chat"}
          </Link>
        ))}
      </div>
    </div>
  );
}