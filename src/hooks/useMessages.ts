import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  model?: string;
  provider?: string;
  created_at: string;
  updated_at: string;
  column_index?: number;
  tool_call?: any;
  raw_output?: any;
  external_id?: string;
  input_tokens?: number;
  input_cached_tokens?: number;
  input_audio_tokens?: number;
  input_cached_audio_tokens?: number;
  input_image_tokens?: number;
  input_cached_image_tokens?: number;
  output_tokens?: number;
  output_audio_tokens?: number;
  output_image_tokens?: number;
  output_reasoning_tokens?: number;
  input_token_price?: number;
  input_cached_token_price?: number;
  input_audio_token_price?: number;
  input_cached_audio_token_price?: number;
  input_image_token_price?: number;
  input_cached_image_token_price?: number;
  output_token_price?: number;
  output_audio_token_price?: number;
  output_image_token_price?: number;
  output_reasoning_token_price?: number;
  other_cost?: number;
}

export const useMessages = (threadId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async (id: string) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (message: Omit<Message, 'id' | 'created_at'>) => {
    try {
      console.log('Adding message to database:', {
        threadId: message.thread_id,
        role: message.role,
        contentLength: message.content?.length
      });
      
      const { data, error } = await supabase
        .from('messages')
        .insert([message])
        .select()
        .single();

      console.log('Database insert result:', { data: !!data, error });
      if (error) throw error;
      if (data) {
        setMessages(prev => [...prev, data]);
        return data;
      }
    } catch (error) {
      console.error('=== ADD MESSAGE ERROR ===');
      console.error('Error type:', error.constructor?.name);
      console.error('Error message:', error.message);
      console.error('Error details:', error);
      console.error('========================');
      throw error;
    }
  };

  const updateMessage = async (id: string, updates: Partial<Message>) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      ));
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  useEffect(() => {
    if (threadId) {
      fetchMessages(threadId);
    } else {
      setMessages([]);
    }
  }, [threadId]);

  return {
    messages,
    loading,
    addMessage,
    updateMessage,
    refetch: () => threadId && fetchMessages(threadId)
  };
};