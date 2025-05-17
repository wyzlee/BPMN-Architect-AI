"use client";

import { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAvailableModels, type ModelInfo } from '@/ai/actions/list-models';
import { Loader2 } from 'lucide-react';

interface ModelSelectorProps {
  onModelChange: (modelId: string) => void;
  defaultModelId?: string;
  className?: string;
}

export function ModelSelector({ onModelChange, defaultModelId, className }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>(defaultModelId || '');
  const [error, setError] = useState<string | null>(null);

  // Group models by provider
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelInfo[]>);

  useEffect(() => {
    async function loadModels() {
      try {
        setLoading(true);
        const availableModels = await getAvailableModels();
        setModels(availableModels);
        
        // If we have models and no selection yet, select the first one
        if (availableModels.length > 0) {
          // If there's a default model and it's in the available models, use it
          if (defaultModelId && availableModels.some(model => model.id === defaultModelId)) {
            setSelectedModel(defaultModelId);
            onModelChange(defaultModelId);
          } 
          // If no selection yet or the selected model is not available, use the first available model
          else if (!selectedModel || !availableModels.some(model => model.id === selectedModel)) {
            setSelectedModel(availableModels[0].id);
            onModelChange(availableModels[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load models:', error);
        setError('Impossible de charger la liste des modèles');
      } finally {
        setLoading(false);
      }
    }

    loadModels();
  }, [onModelChange, selectedModel, defaultModelId]);

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    onModelChange(value);
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Chargement des modèles...</span>
      </div>
    );
  }

  if (error) {
    return <div className={`text-sm text-destructive ${className}`}>{error}</div>;
  }

  if (models.length === 0) {
    return <div className={`text-sm text-muted-foreground ${className}`}>Aucun modèle disponible</div>;
  }

  return (
    <Select value={selectedModel} onValueChange={handleModelChange}>
      <SelectTrigger className={`w-[220px] ${className}`}>
        <SelectValue placeholder="Sélectionner un modèle" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedModels).map(([provider, providerModels]) => (
          <SelectGroup key={provider}>
            <SelectLabel className="capitalize">{provider}</SelectLabel>
            {providerModels.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.displayName}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
