import React from 'react';
import { Plus, MessageSquare, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  threads: Thread[];
  currentThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onSettingsClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  threads,
  currentThreadId,
  onThreadSelect,
  onNewThread,
  onDeleteThread,
  onSettingsClick
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-border w-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewThread}
          className="w-full justify-start gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Threads List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className={cn(
                "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                currentThreadId === thread.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
              onClick={() => onThreadSelect(thread.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {thread.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(thread.updated_at)}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteThread(thread.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          onClick={onSettingsClick}
          variant="ghost"
          className="w-full justify-start gap-2"
          size="sm"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  );
};