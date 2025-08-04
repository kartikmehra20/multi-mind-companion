import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CustomModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (provider: string, modelId: string) => void;
}

export const CustomModelDialog: React.FC<CustomModelDialogProps> = ({
  open,
  onOpenChange,
  onAdd
}) => {
  const [provider, setProvider] = useState<string>('');
  const [modelId, setModelId] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!provider || !modelId.trim()) return;

    setIsAdding(true);
    try {
      await onAdd(provider, modelId.trim());
      setProvider('');
      setModelId('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding model:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setProvider('');
    setModelId('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Model</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="huggingface">Hugging Face</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model-id">Model ID</Label>
            <Input
              id="model-id"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="e.g., anthropic/claude-3-opus, gpt-4-turbo"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Examples:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>OpenRouter:</strong> anthropic/claude-3-opus, meta-llama/llama-3-70b-instruct</li>
              <li><strong>OpenAI:</strong> gpt-4-turbo, gpt-3.5-turbo</li>
              <li><strong>Hugging Face:</strong> microsoft/DialoGPT-large</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!provider || !modelId.trim() || isAdding}
          >
            {isAdding ? 'Adding...' : 'Add Model'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};