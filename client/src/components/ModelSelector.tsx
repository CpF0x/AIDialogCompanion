import { useState } from "react";
import { useAvailableModels, useSelectedModel } from "@/lib/hooks";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModelSelector() {
  const { data: models = [], isLoading } = useAvailableModels();
  const { selectedModelId, setSelectedModelId } = useSelectedModel();
  const [isOpen, setIsOpen] = useState(false);

  // 获取当前选定的模型
  const selectedModel = models.find(model => model.id === selectedModelId);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 px-2 py-1 h-auto text-xs rounded-md"
        >
          <Sparkles className="h-3 w-3" />
          <span className="truncate max-w-[100px]">
            {selectedModel?.name || "选择模型"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        {models.map(model => (
          <DropdownMenuItem
            key={model.id}
            className={cn(
              "flex items-center justify-between py-2", 
              model.id === selectedModelId ? "bg-muted/50" : ""
            )}
            onClick={() => {
              setSelectedModelId(model.id);
              setIsOpen(false);
            }}
          >
            <div className="flex flex-col">
              <span className="font-medium">{model.name}</span>
              {model.description && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {model.description}
                </span>
              )}
            </div>
            {model.id === selectedModelId && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}