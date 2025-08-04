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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ApiKeyDialog } from '@/components/ApiKeyDialog';
import { CustomModelDialog } from '@/components/CustomModelDialog';
import { useApiKeys } from '@/hooks/useApiKeys';
import { Plus, Key, Trash2, Check, X, Zap } from 'lucide-react';

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
  dangerous_together_api_key?: string;
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
    // Free models
    'meta-llama/llama-3.2-3b-instruct:free',
    'meta-llama/llama-3.2-1b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'google/gemma-2-9b-it:free',
    // Paid models
    'anthropic/claude-3-haiku',
    'anthropic/claude-3-sonnet',
    'anthropic/claude-3-opus',
    'openai/gpt-4',
    'openai/gpt-4-turbo',
    'openai/gpt-3.5-turbo',
    'meta-llama/llama-3-8b-instruct',
    'meta-llama/llama-3-70b-instruct',
  ],
  together: [
    // Free models (Together AI offers some free tier usage)
    'meta-llama/Llama-3.2-3B-Instruct-Turbo',
    'meta-llama/Llama-3.2-1B-Instruct-Turbo',
    'microsoft/DialoGPT-medium',
    'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
    // Popular models
    'meta-llama/Llama-3-8b-chat-hf',
    'meta-llama/Llama-3-70b-chat-hf',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'NousResearch/Nous-Hermes-2-Yi-34B',
    'teknium/OpenHermes-2.5-Mistral-7B',
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
  const [customModels, setCustomModels] = useState<{[key: string]: string[]}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'openrouter' | 'huggingface' | 'together'>('openrouter');
  const [customModelDialogOpen, setCustomModelDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { apiKeys, hasApiKey, setApiKey, removeApiKey } = useApiKeys();

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
    // Load custom models from localStorage
    try {
      const saved = localStorage.getItem('custom_models');
      if (saved) {
        setCustomModels(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading custom models:', error);
    }
  }, [settings]);

  const saveCustomModels = (models: {[key: string]: string[]}) => {
    try {
      localStorage.setItem('custom_models', JSON.stringify(models));
      setCustomModels(models);
    } catch (error) {
      console.error('Error saving custom models:', error);
    }
  };

  const handleAddCustomModel = (provider: string, modelId: string) => {
    const updated = { ...customModels };
    if (!updated[provider]) {
      updated[provider] = [];
    }
    if (!updated[provider].includes(modelId)) {
      updated[provider].push(modelId);
      saveCustomModels(updated);
      toast({
        title: "Model added",
        description: `${modelId} has been added to ${provider}`,
      });
    }
  };

  const handleRemoveCustomModel = (provider: string, modelId: string) => {
    const updated = { ...customModels };
    if (updated[provider]) {
      updated[provider] = updated[provider].filter(m => m !== modelId);
      saveCustomModels(updated);
    }
  };

  const getAllModels = (provider: string) => {
    const defaultModels = models[provider as keyof typeof models] || [];
    const custom = customModels[provider] || [];
    return [...defaultModels, ...custom];
  };

  const handleApiKeySave = async (provider: 'openai' | 'openrouter' | 'huggingface', key: string) => {
    await setApiKey(provider, key);
    toast({
      title: "API Key saved",
      description: `${provider} API key has been saved successfully.`,
    });

    // If transcription was just enabled and this is huggingface, enable it
    if (provider === 'huggingface' && formData.utility_transcription_enabled) {
      toast({
        title: "Transcription ready",
        description: "Voice transcription is now available with your Hugging Face API key.",
      });
    }
  };

  const checkTranscriptionRequirements = () => {
    if (formData.utility_transcription_enabled) {
      const provider = formData.utility_transcription_provider;
      if (provider === 'huggingface' && !hasApiKey('huggingface')) {
        setSelectedProvider('huggingface');
        setApiKeyDialogOpen(true);
        return false;
      } else if (provider === 'openai' && !hasApiKey('openai')) {
        setSelectedProvider('openai');
        setApiKeyDialogOpen(true);
        return false;
      }
    }
    return true;
  };

  const checkChatRequirements = () => {
    const provider = formData.chat_using as 'openai' | 'openrouter' | 'huggingface' | 'together';
    if (provider && !hasApiKey(provider)) {
      setSelectedProvider(provider);
      setApiKeyDialogOpen(true);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    // Check if required API keys are present
    if (!checkTranscriptionRequirements() || !checkChatRequirements()) {
      return;
    }

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

  const handleTranscriptionToggle = (enabled: boolean) => {
    updateField('utility_transcription_enabled', enabled);
    if (enabled && !checkTranscriptionRequirements()) {
      // Will be handled by checkTranscriptionRequirements
      return;
    }
  };

  const handleProviderChange = (provider: string) => {
    updateField('chat_using', provider);
    // Reset model when provider changes
    const availableModels = getAllModels(provider);
    if (availableModels.length > 0) {
      updateField('default_model', availableModels[0]);
    }
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
                    onCheckedChange={handleTranscriptionToggle}
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
                          <SelectItem value="together">Together AI</SelectItem>
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
                  onValueChange={handleProviderChange}
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
                <div className="flex items-center justify-between">
                  <Label>Default Model</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomModelDialogOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Model
                  </Button>
                </div>
                <Select
                  value={formData.default_model || ''}
                  onValueChange={(value) => updateField('default_model', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllModels(formData.chat_using || 'openrouter').map((model) => (
                      <SelectItem key={model} value={model}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span>{model}</span>
                            {(model.includes(':free') || 
                              (formData.chat_using === 'together' && 
                               ['meta-llama/Llama-3.2-3B-Instruct-Turbo', 'meta-llama/Llama-3.2-1B-Instruct-Turbo'].includes(model))) && (
                              <Zap className="w-3 h-3 text-green-500" title="Free model" />
                            )}
                          </div>
                          {customModels[formData.chat_using || 'openrouter']?.includes(model) && (
                            <Badge variant="secondary" className="ml-2 text-xs">Custom</Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Custom Models</Label>
                <div className="space-y-2">
                  {Object.entries(customModels).map(([provider, models]) => (
                    <div key={provider}>
                      {models.length > 0 && (
                        <>
                          <div className="text-sm font-medium capitalize">{provider}</div>
                          <div className="flex flex-wrap gap-1">
                            {models.map((model) => (
                              <Badge key={model} variant="outline" className="text-xs">
                                {model}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="ml-1 h-3 w-3 p-0"
                                  onClick={() => handleRemoveCustomModel(provider, model)}
                                >
                                  <X className="w-2 h-2" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
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
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">API Key Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your API keys for different providers
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(['openrouter', 'together', 'openai', 'huggingface'] as const).map((provider) => (
                    <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Key className="w-4 h-4" />
                        <div>
                          <div className="font-medium capitalize">
                            {provider === 'together' ? 'Together AI' : provider}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {hasApiKey(provider) ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <Check className="w-3 h-3" />
                                API key configured
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <X className="w-3 h-3" />
                                No API key
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProvider(provider);
                            setApiKeyDialogOpen(true);
                          }}
                        >
                          {hasApiKey(provider) ? 'Update' : 'Add'} Key
                        </Button>
                        {hasApiKey(provider) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeApiKey(provider);
                              toast({
                                title: "API Key removed",
                                description: `${provider} API key has been removed.`,
                              });
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Security:</strong> API keys are stored securely in your browser's local storage 
                    and are never transmitted to our servers. They are only used to make direct API calls 
                    from your browser to the respective AI providers.
                  </p>
                </div>
              </div>
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

        {/* API Key Dialog */}
        <ApiKeyDialog
          open={apiKeyDialogOpen}
          onOpenChange={setApiKeyDialogOpen}
          provider={selectedProvider}
          onSave={handleApiKeySave}
        />

        {/* Custom Model Dialog */}
        <CustomModelDialog
          open={customModelDialogOpen}
          onOpenChange={setCustomModelDialogOpen}
          onAdd={handleAddCustomModel}
        />
      </DialogContent>
    </Dialog>
  );
};