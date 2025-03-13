import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperclipIcon, ImageIcon, SendIcon, FileTextIcon } from "lucide-react";
import ModelSelector from "./ModelSelector";
import { useSelectedModel } from "@/lib/hooks";

interface MessageInputProps {
  onSendMessage: (params: { content: string; modelId?: string }) => void;
  isLoading: boolean;
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { selectedModelId } = useSelectedModel();
  
  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    onSendMessage({ content: message, modelId: selectedModelId });
    setMessage("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 当按下Ctrl+Enter或Command+Enter时提交表单
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        handleSubmit(e);
      }
    }
  };
  
  return (
    <div className="border-t border-border p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Textarea
              id="message-input"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full border border-border rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="输入消息，或按 Ctrl+Enter 发送..."
              rows={1}
              disabled={isLoading}
            />
            
            <div className="absolute bottom-3 right-3">
              <button 
                type="submit"
                className="rounded-md p-1 text-gray-400 hover:text-orange-500 transition-all disabled:opacity-50"
                disabled={!message.trim() || isLoading}
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-orange-500" />
                ) : (
                  <SendIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-2">
            <div className="flex items-center justify-center">
              <div className="flex mr-4 items-center">
                <ModelSelector />
              </div>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center">
              <div className="text-gray-500 hidden sm:block">
                支持文档、图片等多种文件类型
              </div>
              <div className="flex items-center ml-2">
                <button type="button" className="p-1 text-gray-400 hover:text-gray-600" title="上传文件">
                  <PaperclipIcon className="h-5 w-5" />
                </button>
                <button type="button" className="p-1 text-gray-400 hover:text-gray-600 ml-1" title="插入图片">
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button type="button" className="p-1 text-gray-400 hover:text-gray-600 ml-1" title="格式化文本">
                  <FileTextIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
