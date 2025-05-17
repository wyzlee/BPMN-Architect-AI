'use server';

import { listAvailableModels } from '@/ai/genkit';

export interface ModelInfo {
  id: string;
  provider: string;
  name: string;
  displayName: string;
}

// Fallback models to use if no models are available from the API
const fallbackModels: ModelInfo[] = [
  {
    id: 'googleai/gemini-2.0-flash',
    provider: 'googleai',
    name: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash'
  },
  {
    id: 'openai/gpt-3.5-turbo',
    provider: 'openai',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo'
  }
];

/**
 * Format a model ID into a structured ModelInfo object
 */
function formatModelInfo(id: string): ModelInfo {
  // Model IDs are in the format 'provider/model-name'
  const [provider, ...modelNameParts] = id.split('/');
  const name = modelNameParts.join('/');
  
  // Create a more readable display name
  let displayName = name;
  if (name.includes('-')) {
    // Convert kebab-case to Title Case
    displayName = name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  
  return {
    id,
    provider,
    name,
    displayName
  };
}

/**
 * Lists all available LLM models across all initialized providers
 * @returns Array of model information objects
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
  try {
    // Get raw model IDs from genkit
    const modelIds = listAvailableModels();
    
    // If no models are available, return fallback models
    if (!modelIds || modelIds.length === 0) {
      console.log('No models available from API, using fallback models');
      return fallbackModels;
    }
    
    // Transform raw IDs into structured model info objects
    return modelIds.map(formatModelInfo);
  } catch (error) {
    console.error('Error listing available models:', error);
    // Return fallback models in case of error
    return fallbackModels;
  }
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
