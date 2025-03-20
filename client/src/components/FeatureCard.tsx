
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: IconType;
  className?: string;
  onClick?: () => void;
}

export default function FeatureCard({ title, description, icon: Icon, className, onClick }: FeatureCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-gray-600" />}
        <h3 className="font-medium">{title}</h3>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      )}
    </div>
  );
}
