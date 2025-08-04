import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';

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

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AppSettings | null;
  onSave: (settings: Partial<AppSettings>) => Promise<void>;
}

const models = {
  openrouter: [
    'anthropic/claude-3-haiku',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-opus',
    'openai/gpt-4',
    'openai/gpt-4-turbo',
    'openai/gpt-3.5-turbo',
    'meta-llama/llama-3-8b-instruct',
    'meta-llama/llama-3-70b-instruct',
  ],
  openai: [
    'gpt-4',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
  ],
  huggingface: [
    'microsoft/DialoGPT-medium',
    'microsoft/DialoGPT-large',
    'facebook/blenderbot-400M-distill',
  ]
};

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<AppSettings>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof AppSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!settings) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>
          
          <div className="overflow-y-auto max-h-[60vh] px-1">
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={formData.system_prompt || ''}
                  onChange={(e) => updateField('system_prompt', e.target.value)}
                  placeholder="Enter system prompt..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.default_temperature || 0.5}
                    onChange={(e) => updateField('default_temperature', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-tokens">Max Output Tokens</Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="0"
                    value={formData.max_output_tokens || 0}
                    onChange={(e) => updateField('max_output_tokens', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="transcription">Voice Transcription</Label>
                  <Switch
                    id="transcription"
                    checked={formData.utility_transcription_enabled || false}
                    onCheckedChange={(checked) => updateField('utility_transcription_enabled', checked)}
                  />
                </div>
                
                {formData.utility_transcription_enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Transcription Provider</Label>
                      <Select
                        value={formData.utility_transcription_provider || 'openai'}
                        onValueChange={(value) => updateField('utility_transcription_provider', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="huggingface">Hugging Face</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Transcription Model</Label>
                      <Input
                        value={formData.utility_transcription_model || 'gpt-4o-mini-transcribe'}
                        onChange={(e) => updateField('utility_transcription_model', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="models" className="space-y-4">
              <div className="space-y-2">
                <Label>Chat Provider</Label>
                <Select
                  value={formData.chat_using || 'openrouter'}
                  onValueChange={(value) => updateField('chat_using', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Default Model</Label>
                <Select
                  value={formData.default_model || ''}
                  onValueChange={(value) => updateField('default_model', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models[formData.chat_using as keyof typeof models]?.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Title Generation Model</Label>
                <Input
                  value={formData.utility_title_model || 'anthropic/claude-3-haiku'}
                  onChange={(e) => updateField('utility_title_model', e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4">
              <div className="space-y-2">
                <Label>API Key Storage</Label>
                <Select
                  value={formData.use_keys_from || 'localstorage'}
                  onValueChange={(value) => updateField('use_keys_from', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="localstorage">Local Storage</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.use_keys_from === 'database' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      value={formData.dangerous_openai_api_key || ''}
                      onChange={(e) => updateField('dangerous_openai_api_key', e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                    <Input
                      id="openrouter-key"
                      type="password"
                      value={formData.dangerous_openrouter_api_key || ''}
                      onChange={(e) => updateField('dangerous_openrouter_api_key', e.target.value)}
                      placeholder="sk-or-..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="huggingface-key">Hugging Face API Key</Label>
                    <Input
                      id="huggingface-key"
                      type="password"
                      value={formData.dangerous_huggingface_api_key || ''}
                      onChange={(e) => updateField('dangerous_huggingface_api_key', e.target.value)}
                      placeholder="hf_..."
                    />
                  </div>
                </>
              )}
              
              {formData.use_keys_from === 'localstorage' && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    API keys will be stored in your browser's local storage. 
                    You'll need to enter them when using the application.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="budget" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-budget">Max 24h Budget ($)</Label>
                <Input
                  id="max-budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget_max_24h || 0}
                  onChange={(e) => updateField('budget_max_24h', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="input-cost">Input Token Cost ($)</Label>
                  <Input
                    id="input-cost"
                    type="number"
                    min="0"
                    step="0.000001"
                    value={formData.budget_input_token_cost || 0.000002}
                    onChange={(e) => updateField('budget_input_token_cost', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="output-cost">Output Token Cost ($)</Label>
                  <Input
                    id="output-cost"
                    type="number"
                    min="0"
                    step="0.000001"
                    value={formData.budget_output_token_cost || 0.000004}
                    onChange={(e) => updateField('budget_output_token_cost', parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};