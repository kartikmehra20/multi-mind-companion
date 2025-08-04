import { useState, useEffect } from 'react';

interface ApiKeys {
  openai?: string;
  openrouter?: string;
  huggingface?: string;
}

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [loading, setLoading] = useState(true);

  const loadApiKeys = () => {
    try {
      const openai = localStorage.getItem('openai_api_key');
      const openrouter = localStorage.getItem('openrouter_api_key');
      const huggingface = localStorage.getItem('huggingface_api_key');

      setApiKeys({
        openai: openai || undefined,
        openrouter: openrouter || undefined,
        huggingface: huggingface || undefined
      });
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const setApiKey = (provider: keyof ApiKeys, key: string) => {
    try {
      localStorage.setItem(`${provider}_api_key`, key);
      setApiKeys(prev => ({ ...prev, [provider]: key }));
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  };

  const removeApiKey = (provider: keyof ApiKeys) => {
    try {
      localStorage.removeItem(`${provider}_api_key`);
      setApiKeys(prev => ({ ...prev, [provider]: undefined }));
    } catch (error) {
      console.error('Error removing API key:', error);
    }
  };

  const hasApiKey = (provider: keyof ApiKeys): boolean => {
    return !!apiKeys[provider];
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  return {
    apiKeys,
    loading,
    setApiKey,
    removeApiKey,
    hasApiKey,
    refetch: loadApiKeys
  };
};