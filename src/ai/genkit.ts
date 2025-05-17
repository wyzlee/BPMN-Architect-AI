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
 * Lists all available models across all initialized providers
 * @returns Array of model identifiers in the format 'provider/model-name'
 */
export function listAvailableModels() {
  const models = [];
  
  // Since ai.getRegisteredModels() is not available, we'll use a hardcoded list based on initialized plugins
  try {
    // Google AI models
    if (process.env.GOOGLE_API_KEY) {
      models.push('googleai/gemini-2.0-flash');
      models.push('googleai/gemini-2.0-pro');
      models.push('googleai/gemini-1.5-pro');
      models.push('googleai/gemini-1.5-flash');
    }
    
    // Vertex AI models
    if (process.env.VERTEX_AI_PROJECT && process.env.VERTEX_AI_LOCATION) {
      models.push('vertexai/gemini-2.0-pro');
      models.push('vertexai/gemini-1.5-pro');
    }
    
    // OpenAI models
    if (process.env.OPENAI_API_KEY) {
      models.push('openai/gpt-4o');
      models.push('openai/gpt-4-turbo');
      models.push('openai/gpt-3.5-turbo');
    }
    
    // Anthropic models
    if (process.env.ANTHROPIC_API_KEY) {
      models.push('anthropic/claude-3-opus');
      models.push('anthropic/claude-3-sonnet');
      models.push('anthropic/claude-3-haiku');
    }
    
    // Mistral models
    if (process.env.MISTRAL_API_KEY) {
      // Use correct Mistral model names
      models.push('mistral/mistral-large-latest');
      models.push('mistral/mistral-medium-latest');
      models.push('mistral/mistral-small-latest');
      models.push('mistral/open-mistral-7b');
    }
    
    // Cohere models
    if (process.env.COHERE_API_KEY) {
      models.push('cohere/command-r');
      models.push('cohere/command-r-plus');
    }
    
    // Ollama models
    if (process.env.OLLAMA_HOST) {
      models.push('ollama/llama3');
      models.push('ollama/mistral');
      models.push('ollama/gemma');
      models.push('ollama/codellama');
    }
    
    return models;
  } catch (error) {
    console.error('Error listing available models:', error);
    return [];
  }
}

