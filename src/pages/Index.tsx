import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Sidebar } from '@/components/Sidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useThreads } from '@/hooks/useThreads';
import { useMessages } from '@/hooks/useMessages';
import { useSettings } from '@/hooks/useSettings';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Index = () => {
  const [currentThreadId, setCurrentThreadId] = useState<string>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const { threads, createThread, updateThread, deleteThread } = useThreads();
  const { messages, addMessage, updateMessage } = useMessages(currentThreadId);
  const { settings, updateSettings } = useSettings();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewThread = async () => {
    try {
      const threadId = await createThread();
      setCurrentThreadId(threadId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create new thread',
        variant: 'destructive',
      });
    }
  };

  const handleThreadSelect = (threadId: string) => {
    setCurrentThreadId(threadId);
    setIsSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteThread(threadId);
      if (currentThreadId === threadId) {
        setCurrentThreadId(undefined);
      }
      toast({
        title: 'Thread deleted',
        description: 'Thread has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete thread',
        variant: 'destructive',
      });
    }
  };

  const generateTitle = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-title', {
        body: { message }
      });

      if (error) throw error;
      return data?.title || 'New Chat';
    } catch (error) {
      console.error('Error generating title:', error);
      return 'New Chat';
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentThreadId) {
      await handleNewThread();
      return;
    }

    setIsLoading(true);
    try {
      // Add user message
      const userMessage = await addMessage({
        thread_id: currentThreadId,
        role: 'user',
        content,
        updated_at: new Date().toISOString()
      });

      // Update thread title if this is the first message
      if (messages.length === 0) {
        const title = await generateTitle(content);
        await updateThread(currentThreadId, { 
          title,
          updated_at: new Date().toISOString()
        });
      }

      // Prepare messages for API
      const chatMessages = [
        ...(settings?.system_prompt ? [{
          role: 'system',
          content: settings.system_prompt
        }] : []),
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content
        }
      ];

      // Call AI API
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: chatMessages,
          threadId: currentThreadId,
          model: settings?.default_model || 'anthropic/claude-3-haiku',
          provider: settings?.chat_using || 'openrouter',
          temperature: settings?.default_temperature || 0.7,
          maxTokens: settings?.max_output_tokens || 0
        }
      });

      if (error) throw error;

      // Add assistant message
      await addMessage({
        thread_id: currentThreadId,
        role: 'assistant',
        content: data.content,
        model: data.model,
        provider: data.provider,
        input_tokens: data.usage?.prompt_tokens || 0,
        output_tokens: data.usage?.completion_tokens || 0,
        input_token_price: settings?.budget_input_token_cost || 0,
        output_token_price: settings?.budget_output_token_cost || 0,
        updated_at: new Date().toISOString()
      });

      // Update thread timestamp
      await updateThread(currentThreadId, {
        updated_at: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 lg:z-0 transition-transform duration-200 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <Sidebar
          threads={threads}
          currentThreadId={currentThreadId}
          onThreadSelect={handleThreadSelect}
          onNewThread={handleNewThread}
          onDeleteThread={handleDeleteThread}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <h1 className="text-lg font-semibold">
              {currentThreadId 
                ? threads.find(t => t.id === currentThreadId)?.title || 'Chat'
                : 'Multi-Mind Companion'
              }
            </h1>
          </div>
          
          {settings && (
            <div className="text-sm text-muted-foreground">
              {settings.default_model.split('/').pop()} via {settings.chat_using}
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-0">
          <div className="min-h-full flex flex-col">
            {!currentThreadId ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <h2 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                    Welcome to Multi-Mind Companion
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Your intelligent multi-model AI assistant. Start a conversation with any of the supported AI models.
                  </p>
                  <Button onClick={handleNewThread} className="bg-primary hover:bg-primary/90">
                    Start New Chat
                  </Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <h3 className="text-lg font-semibold mb-2">Ready to chat!</h3>
                  <p className="text-muted-foreground">
                    Send a message to start the conversation.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex gap-3 p-4">
                    <div className="w-8 h-8 bg-chat-bubble-assistant rounded-full flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-chat-bubble-assistant border border-border rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        {currentThreadId && (
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSave={updateSettings}
      />
    </div>
  );
};

export default Index;
