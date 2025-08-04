import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AppSettings {
  id: string;
  default_model: string;
  chat_using: string;
  system_prompt: string;
  default_temperature: number;
  max_output_tokens: number;
  budget_max_24h: number;
  budget_input_token_cost: number;
  budget_output_token_cost: number;
  use_keys_from: string;
  dangerous_openai_api_key?: string;
  dangerous_openrouter_api_key?: string;
  dangerous_huggingface_api_key?: string;
  utility_transcription_enabled: boolean;
  utility_transcription_model: string;
  utility_transcription_provider: string;
  utility_title_model: string;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          default_model: 'anthropic/claude-3-haiku',
          chat_using: 'openrouter',
          system_prompt: "You are a helpful assistant who's always eager to help & be proactive. Keep language crisp and to the point. Use bullets & sub-sections whenever helpful. Avoid overusing emojis.",
          default_temperature: 0.5,
          max_output_tokens: 0,
          budget_max_24h: 0,
          budget_input_token_cost: 0.000002,
          budget_output_token_cost: 0.000004,
          use_keys_from: 'localstorage',
          utility_transcription_enabled: false,
          utility_transcription_model: 'gpt-4o-mini-transcribe',
          utility_transcription_provider: 'openai',
          utility_title_model: 'anthropic/claude-3-haiku'
        };

        const { data: newData, error: insertError } = await supabase
          .from('app_settings')
          .insert([defaultSettings])
          .select()
          .single();

        if (insertError) throw insertError;
        setSettings(newData);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('app_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;
      
      setSettings(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
};