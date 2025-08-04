import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: string;
  content: string;
  model?: string;
  provider?: string;
  created_at: string;
  input_tokens?: number;
  output_tokens?: number;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={cn(
      "flex gap-3 p-4",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className={cn(
          isUser 
            ? "bg-chat-bubble-user text-primary-foreground" 
            : "bg-chat-bubble-assistant text-foreground"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2 break-words",
          isUser 
            ? "bg-chat-bubble-user text-primary-foreground" 
            : "bg-chat-bubble-assistant text-foreground border border-border"
        )}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 mt-1 text-xs text-muted-foreground",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span>{formatTime(message.created_at)}</span>
          
          {!isUser && message.model && (
            <Badge variant="secondary" className="text-xs">
              {message.model.split('/').pop()}
            </Badge>
          )}
          
          {!isUser && (message.input_tokens || message.output_tokens) && (
            <Badge variant="outline" className="text-xs">
              {message.input_tokens || 0}→{message.output_tokens || 0}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};