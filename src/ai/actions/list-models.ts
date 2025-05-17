'use server';

import { listAvailableModels, type AvailableModelInfo } from '@/ai/genkit';

export interface ModelInfo {
  id: string;
  provider: string;
  name: string;
  displayName: string;
  description?: string;
  status: 'available' | 'configured_no_key' | 'not_configured';
  type?: string;
}

// Fallback models to use if no models are available from the API
const fallbackModels: ModelInfo[] = [
  {
    id: 'googleai/gemini-2.0-flash',
    provider: 'Google AI',
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
    status: 'configured_no_key',
    description: 'Fast, efficient model for most tasks',
    type: 'chat'
  },
  {
    id: 'openai/gpt-3.5-turbo',
    provider: 'OpenAI',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    status: 'configured_no_key',
    description: 'Efficient model with good performance',
    type: 'chat'
  }
];

/**
 * Lists all available LLM models across all initialized providers
 * @returns Array of model information objects
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  try {
    // Get detailed model info from genkit
    const models = await listAvailableModels();
    
    // If no models are available, return fallback models
    if (!models || models.length === 0) {
      console.log('No models available from API, using fallback models');
      return fallbackModels;
    }
    
    // Transform AvailableModelInfo to ModelInfo (they're compatible but we keep both interfaces for flexibility)
    return models.map(model => ({
      id: model.id,
      provider: model.provider,
      name: model.name,
      displayName: model.name,
      description: model.description,
      status: model.status,
      type: model.type
    }));
  } catch (error) {
    console.error('Error listing available models:', error);
    // Return fallback models in case of error
    return fallbackModels;
  }
}

/**
 * Get only available models (those with API keys configured)
 * @returns Array of available model information objects
 */
export async function getOnlyAvailableModels(): Promise<ModelInfo[]> {
  const models = await getAvailableModels();
  return models.filter(model => model.status === 'available');
}

/**
 * Groups models by provider for better UI organization
 * @returns Object with provider names as keys and arrays of models as values
 */
export async function getGroupedModels(): Promise<Record<string, ModelInfo[]>> {
  const models = await getAvailableModels();
  
  return models.reduce((grouped, model) => {
    if (!grouped[model.provider]) {
      grouped[model.provider] = [];
    }
    grouped[model.provider].push(model);
    return grouped;
  }, {} as Record<string, ModelInfo[]>);
}

/**
 * Groups only available models by provider
 * @returns Object with provider names as keys and arrays of available models as values
 */
export async function getGroupedAvailableModels(): Promise<Record<string, ModelInfo[]>> {
  const models = await getOnlyAvailableModels();
  
  return models.reduce((grouped, model) => {
    if (!grouped[model.provider]) {
      grouped[model.provider] = [];
    }
    grouped[model.provider].push(model);
    return grouped;
  }, {} as Record<string, ModelInfo[]>);
}
