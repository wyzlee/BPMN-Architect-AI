import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { vertexAI } from '@genkit-ai/vertexai';
import { openAI } from 'genkitx-openai';
import { anthropic } from 'genkitx-anthropic';
import { mistral } from 'genkitx-mistral';
import { cohere } from 'genkitx-cohere';
import { ollama } from 'genkitx-ollama';

// Logging initialization
console.log('Initializing Genkit with multiple LLM providers');

// Initialize active plugins array
const activePlugins = [];

// Google AI Plugin
if (process.env.GOOGLE_API_KEY) {
  console.log('Initializing Google AI plugin');
  const googleAIPlugin = googleAI({
    apiKey: process.env.GOOGLE_API_KEY,
  });
  activePlugins.push(googleAIPlugin);
} else {
  console.log('Skipping Google AI plugin: No API key found');
}

// Vertex AI Plugin
if (process.env.VERTEX_AI_PROJECT && process.env.VERTEX_AI_LOCATION) {
  console.log('Initializing Vertex AI plugin');
  const vertexAIPlugin = vertexAI({
    projectId: process.env.VERTEX_AI_PROJECT, // Fixed property name to projectId
    location: process.env.VERTEX_AI_LOCATION,
  });
  activePlugins.push(vertexAIPlugin);
} else {
  console.log('Skipping Vertex AI plugin: Missing project or location');
}

// OpenAI Plugin
if (process.env.OPENAI_API_KEY) {
  console.log('Initializing OpenAI plugin');
  const openAIPlugin = openAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  activePlugins.push(openAIPlugin);
} else {
  console.log('Skipping OpenAI plugin: No API key found');
}

// Anthropic Plugin
if (process.env.ANTHROPIC_API_KEY) {
  console.log('Initializing Anthropic plugin');
  const anthropicPlugin = anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  activePlugins.push(anthropicPlugin);
} else {
  console.log('Skipping Anthropic plugin: No API key found');
}

// Mistral Plugin
if (process.env.MISTRAL_API_KEY) {
  console.log('Initializing Mistral plugin');
  const mistralPlugin = mistral({
    apiKey: process.env.MISTRAL_API_KEY,
  });
  activePlugins.push(mistralPlugin);
} else {
  console.log('Skipping Mistral plugin: No API key found');
}

// Cohere Plugin
if (process.env.COHERE_API_KEY) {
  console.log('Initializing Cohere plugin');
  const coherePlugin = cohere({
    apiKey: process.env.COHERE_API_KEY,
  });
  activePlugins.push(coherePlugin);
} else {
  console.log('Skipping Cohere plugin: No API key found');
}

// Ollama Plugin
// List of locally available models for Ollama
// Define models with proper type for Ollama
const ollamaModels = [
  { id: 'llama3', name: 'Llama 3' },
  { id: 'mistral', name: 'Mistral' },
  { id: 'gemma', name: 'Gemma' },
  { id: 'codellama', name: 'Code Llama' }
];
const ollamaServerAddress = process.env.OLLAMA_HOST || 'http://localhost:11434';

// Enable Ollama if OLLAMA_HOST is set
if (process.env.OLLAMA_HOST) {
  console.log('Initializing Ollama plugin with server:', ollamaServerAddress);
  try {
    const ollamaPlugin = ollama({
      models: ollamaModels,
      serverAddress: ollamaServerAddress,
    });
    activePlugins.push(ollamaPlugin);
  } catch (error) {
    console.error('Error initializing Ollama plugin:', error);
  }
} else {
  console.log('Skipping Ollama plugin: No host configured');
}

// Determine the best default model based on available API keys
function getDefaultModel() {
  // Try OpenAI first as it's generally more reliable
  if (process.env.OPENAI_API_KEY) {
    return 'openai/gpt-3.5-turbo';
  }
  // Fall back to Google AI if available
  if (process.env.GOOGLE_API_KEY) {
    return 'googleai/gemini-2.0-flash';
  }
  // Fall back to other providers
  if (process.env.MISTRAL_API_KEY) {
    return 'mistral/mistral-small-latest';
  }
  if (process.env.COHERE_API_KEY) {
    return 'cohere/command-r';
  }
  // Last resort - use the environment variable or a hardcoded default
  return process.env.DEFAULT_MODEL || 'googleai/gemini-2.0-flash';
}

// Initialize Genkit with all active plugins
export const ai = genkit({
  plugins: activePlugins,
  // Default model if none specified
  model: getDefaultModel(),
});

/**
 * Interface for detailed model information
 */
export interface AvailableModelInfo {
  id: string;         // e.g., 'googleai/gemini-2.0-flash'
  name: string;       // e.g., 'Gemini 2.0 Flash'
  provider: string;   // e.g., 'Google AI', 'OpenAI', 'Ollama'
  status: 'available' | 'configured_no_key' | 'not_configured';
  description?: string; // Optional description of the model
  type?: string;      // Optional type (chat, completion, etc.)
}

/**
 * Lists all available models across all initialized providers with detailed information
 * @returns Promise<Array<AvailableModelInfo>> Array of model information objects
 */
export async function listAvailableModels(): Promise<AvailableModelInfo[]> {
  const models: AvailableModelInfo[] = [];
  
  try {
    // Google AI models
    const googleModels = [
      { id: 'googleai/gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Fast, efficient model for most tasks' },
      { id: 'googleai/gemini-2.0-pro', name: 'Gemini 2.0 Pro', description: 'Advanced model with higher quality' },
      { id: 'googleai/gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Previous generation pro model' },
      { id: 'googleai/gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Previous generation fast model' }
    ];
    
    if (process.env.GOOGLE_API_KEY) {
      googleModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Google AI',
          status: 'available',
          type: 'chat'
        });
      });
    } else {
      googleModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Google AI',
          status: 'configured_no_key',
          type: 'chat'
        });
      });
    }
    
    // Vertex AI models
    const vertexModels = [
      { id: 'vertexai/gemini-2.0-pro', name: 'Vertex Gemini 2.0 Pro', description: 'Google Cloud Vertex AI version' },
      { id: 'vertexai/gemini-1.5-pro', name: 'Vertex Gemini 1.5 Pro', description: 'Previous generation Vertex AI model' }
    ];
    
    if (process.env.VERTEX_AI_PROJECT && process.env.VERTEX_AI_LOCATION) {
      vertexModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Vertex AI',
          status: 'available',
          type: 'chat'
        });
      });
    } else {
      vertexModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Vertex AI',
          status: 'configured_no_key',
          type: 'chat'
        });
      });
    }
    
    // OpenAI models
    const openaiModels = [
      { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'Latest multimodal model with optimal performance' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Fast version of GPT-4' },
      { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Efficient model with good performance' }
    ];
    
    if (process.env.OPENAI_API_KEY) {
      openaiModels.forEach(model => {
        models.push({
          ...model,
          provider: 'OpenAI',
          status: 'available',
          type: 'chat'
        });
      });
    } else {
      openaiModels.forEach(model => {
        models.push({
          ...model,
          provider: 'OpenAI',
          status: 'configured_no_key',
          type: 'chat'
        });
      });
    }
    
    // Anthropic models
    const anthropicModels = [
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful Claude model' },
      { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and efficiency' },
      { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast, efficient Claude model' }
    ];
    
    if (process.env.ANTHROPIC_API_KEY) {
      anthropicModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Anthropic',
          status: 'available',
          type: 'chat'
        });
      });
    } else {
      anthropicModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Anthropic',
          status: 'configured_no_key',
          type: 'chat'
        });
      });
    }
    
    // Mistral models
    const mistralModels = [
      { id: 'mistral/mistral-large-latest', name: 'Mistral Large', description: 'Most powerful Mistral model' },
      { id: 'mistral/mistral-medium-latest', name: 'Mistral Medium', description: 'Balanced performance and efficiency' },
      { id: 'mistral/mistral-small-latest', name: 'Mistral Small', description: 'Fast, efficient Mistral model' },
      { id: 'mistral/open-mistral-7b', name: 'Open Mistral 7B', description: 'Open source 7B parameter model' }
    ];
    
    if (process.env.MISTRAL_API_KEY) {
      mistralModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Mistral AI',
          status: 'available',
          type: 'chat'
        });
      });
    } else {
      mistralModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Mistral AI',
          status: 'configured_no_key',
          type: 'chat'
        });
      });
    }
    
    // Cohere models
    const cohereModels = [
      { id: 'cohere/command-r', name: 'Command R', description: 'Standard Command model' },
      { id: 'cohere/command-r-plus', name: 'Command R+', description: 'Enhanced Command model with better performance' }
    ];
    
    if (process.env.COHERE_API_KEY) {
      cohereModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Cohere',
          status: 'available',
          type: 'chat'
        });
      });
    } else {
      cohereModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Cohere',
          status: 'configured_no_key',
          type: 'chat'
        });
      });
    }
    
    // Ollama models
    const ollamaModels = [
      { id: 'ollama/llama3', name: 'Llama 3', description: 'Meta\'s Llama 3 model running locally' },
      { id: 'ollama/mistral', name: 'Mistral', description: 'Mistral model running locally' },
      { id: 'ollama/gemma', name: 'Gemma', description: 'Google\'s Gemma model running locally' },
      { id: 'ollama/codellama', name: 'Code Llama', description: 'Specialized code generation model' }
    ];
    
    if (process.env.OLLAMA_HOST) {
      ollamaModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Ollama',
          status: 'available',
          type: 'chat'
        });
      });
    } else {
      ollamaModels.forEach(model => {
        models.push({
          ...model,
          provider: 'Ollama',
          status: 'configured_no_key',
          type: 'chat'
        });
      });
    }
    
    console.log('Available models:', models);
    return models;
  } catch (error) {
    console.error('Error listing available models:', error);
    return [];
  }
}

