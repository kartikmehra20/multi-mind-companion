import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Thread {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useThreads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
        .from('threads')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setThreads(data || []);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const createThread = async (title?: string) => {
    try {
      const { data, error } = await supabase
        .from('threads')
        .insert([{ title: title || 'New Chat' }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setThreads(prev => [data, ...prev]);
        return data.id;
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  };

  const updateThread = async (id: string, updates: Partial<Thread>) => {
    try {
      const { error } = await supabase
        .from('threads')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setThreads(prev => prev.map(thread => 
        thread.id === id ? { ...thread, ...updates } : thread
      ));
    } catch (error) {
      console.error('Error updating thread:', error);
    }
  };

  const deleteThread = async (id: string) => {
    try {
      const { error } = await supabase
        .from('threads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setThreads(prev => prev.filter(thread => thread.id !== id));
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  useEffect(() => {
    fetchThreads();
  }, []);

  return {
    threads,
    loading,
    createThread,
    updateThread,
    deleteThread,
    refetch: fetchThreads
  };
};