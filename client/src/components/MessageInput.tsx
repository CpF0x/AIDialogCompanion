import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PaperclipIcon, ImageIcon, SendIcon, FileTextIcon } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
    
    onSendMessage(message);
    setMessage("");
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
              className="w-full border border-border rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="How can I help you today?"
              rows={1}
              maxRows={5}
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
                <span>AI: 1.7 Sonnet</span>
                <span className="mx-2">|</span>
                <button type="button" className="text-gray-500 hover:text-gray-700 flex items-center">
                  <span>Choose style</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center">
              <div className="text-gray-500 hidden sm:block">
                Collaborate with AI using documents, images, and more
              </div>
              <div className="flex items-center ml-2">
                <button type="button" className="p-1 text-gray-400 hover:text-gray-600" title="Upload files">
                  <PaperclipIcon className="h-5 w-5" />
                </button>
                <button type="button" className="p-1 text-gray-400 hover:text-gray-600 ml-1" title="Insert image">
                  <ImageIcon className="h-5 w-5" />
                </button>
                <button type="button" className="p-1 text-gray-400 hover:text-gray-600 ml-1" title="Format text">
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
