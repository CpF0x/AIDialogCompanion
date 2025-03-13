import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  className?: string;
}

export default function FeatureCard({ title, className }: FeatureCardProps) {
  return (
    <div 
      className={cn(
        "bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-all",
        className
      )}
    >
      <h3 className="font-medium mb-2">{title}</h3>
    </div>
  );
}
