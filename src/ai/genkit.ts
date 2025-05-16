import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Logs pour déboguer les variables d'environnement
console.log('Initializing Genkit with Google AI');
console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
console.log('GOOGLE_API_KEY length:', process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length : 0);

// Liste des variables d'environnement possibles pour Google AI
const possibleEnvVars = [
  'GOOGLE_API_KEY',
  'GEMINI_API_KEY',
  'GOOGLEAI_API_KEY',
  'GENKIT_GOOGLEAI_API_KEY',
  'VERTEX_AI_PROJECT',
  'VERTEX_AI_LOCATION',
];

for (const varName of possibleEnvVars) {
  console.log(`${varName} exists:`, !!process.env[varName]);
}

// Configuration explicite du plugin Google AI
const googleAIPlugin = googleAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const ai = genkit({
  plugins: [googleAIPlugin],
  model: 'googleai/gemini-2.0-flash',
});
