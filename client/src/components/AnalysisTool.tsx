import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function AnalysisTool() {
  return (
    <Card className="mb-8 bg-gray-50 rounded-xl p-4 border border-border relative">
      <div className="absolute top-3 right-3">
        <button className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <CardContent className="p-0">
        <div className="flex items-center">
          <Badge variant="outline" className="bg-orange-100 text-orange-500 rounded-md mr-2">NEW</Badge>
          <h3 className="font-semibold">Analysis tool</h3>
        </div>
        
        <p className="mt-2 text-sm text-gray-600">
          Upload CSVs for AI to analyze quantitative data with high accuracy and create interactive data visualizations.
          <a href="#" className="text-orange-500 hover:underline ml-1">Try it out</a>
        </p>
      </CardContent>
    </Card>
  );
}
