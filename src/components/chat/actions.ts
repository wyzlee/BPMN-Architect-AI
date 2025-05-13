'use server';
import { suggestBPMNElements, type SuggestBPMNElementsInput } from '@/ai/flows/suggest-bpmn-elements';

interface SuggestionResult {
  suggestions: string[] | null;
  error: string | null;
}

export async function getBPMNSuggestions(userInput: string): Promise<SuggestionResult> {
  if (!userInput.trim()) {
    return { suggestions: null, error: "User input cannot be empty." };
  }
  
  try {
    const input: SuggestBPMNElementsInput = { userInput };
    // Assuming suggestBPMNElements is robust enough not to throw on typical errors, 
    // but to return structured error or empty suggestions.
    // If it can throw, the try-catch here is appropriate.
    const result = await suggestBPMNElements(input); 

    if (result && result.suggestions) {
      return { suggestions: result.suggestions, error: null };
    } else {
      // This case might indicate an issue with the AI flow not returning expected structure
      // or an intentional empty result.
      console.warn("AI flow returned no suggestions or unexpected result:", result);
      return { suggestions: [], error: "L'IA n'a pas retourné de suggestions." };
    }

  } catch (error) {
    console.error("Error fetching BPMN suggestions from AI flow:", error);
    // Provide a user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la communication avec l'IA.";
    return { suggestions: null, error: `Échec de l'obtention des suggestions de l'IA: ${errorMessage}` };
  }
}
