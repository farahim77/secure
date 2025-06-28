
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, Eye, EyeOff, Users, Clock, Code, Key } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ClipboardItemProps {
  item: {
    id: string;
    content: string;
    type: string;
    timestamp: string;
    encrypted: boolean;
    sharedWith: string[];
    classification: string;
  };
}

export function ClipboardItem({ item }: ClipboardItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "code":
        return <Code className="w-4 h-4" />;
      case "password":
        return <Key className="w-4 h-4" />;
      default:
        return <Copy className="w-4 h-4" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "restricted":
        return "bg-red-100 text-red-800 border-red-200";
      case "confidential":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "sensitive":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const maskContent = (content: string, type: string) => {
    if (type === "password") {
      return "••••••••••••••••";
    }
    if (content.length > 50) {
      return content.substring(0, 50) + "...";
    }
    return content;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getTypeIcon(item.type)}
              <Badge className={getClassificationColor(item.classification)}>
                {item.classification.toUpperCase()}
              </Badge>
              {item.encrypted && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Encrypted
                </Badge>
              )}
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg font-mono text-sm mb-3">
              {isVisible || item.type !== "password" 
                ? item.content 
                : maskContent(item.content, item.type)
              }
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-slate-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{item.timestamp}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Shared with {item.sharedWith.length} team(s)</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            {item.type === "password" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(!isVisible)}
                className="p-2"
              >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="p-2" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
