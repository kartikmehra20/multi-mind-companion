import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, ExternalLink } from 'lucide-react';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: 'openai' | 'openrouter' | 'huggingface';
  onSave: (provider: 'openai' | 'openrouter' | 'huggingface', key: string) => void;
}

const providerInfo = {
  openai: {
    name: 'OpenAI',
    description: 'Access GPT models including GPT-4, GPT-3.5-turbo',
    placeholder: 'sk-...',
    url: 'https://platform.openai.com/api-keys'
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Access Claude, GPT, Llama and many other models',
    placeholder: 'sk-or-...',
    url: 'https://openrouter.ai/keys'
  },
  huggingface: {
    name: 'Hugging Face',
    description: 'Access open-source models and transcription services',
    placeholder: 'hf_...',
    url: 'https://huggingface.co/settings/tokens'
  }
};

export const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({
  open,
  onOpenChange,
  provider,
  onSave
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const info = providerInfo[provider];

  const handleSave = async () => {
    if (!apiKey.trim()) return;

    setIsSaving(true);
    try {
      await onSave(provider, apiKey.trim());
      setApiKey('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setApiKey('');
    setShowKey(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add {info.name} API Key</DialogTitle>
          <DialogDescription>
            {info.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              Your API key will be stored securely in your browser's local storage and never sent to our servers.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={info.placeholder}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open(info.url, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Get {info.name} API Key
          </Button>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!apiKey.trim() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Key'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};