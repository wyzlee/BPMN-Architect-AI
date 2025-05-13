
'use server';
import { generateBPMNXml, type GenerateBPMNXmlInput, type GenerateBPMNXmlOutput } from '@/ai/flows/generate-bpmn-xml';
import { refineUserInput, type RefineUserInputInput, type RefineUserInputOutput } from '@/ai/flows/refine-user-input-flow';

interface RefinementResult {
  refinedInstructions: string | null;
  error: string | null;
}

export async function getRefinedInstructions(rawUserInput: string): Promise<RefinementResult> {
  if (!rawUserInput.trim()) {
    return { refinedInstructions: null, error: "L'entrée utilisateur brute ne peut pas être vide." };
  }

  try {
    const input: RefineUserInputInput = { rawUserInput };
    const result: RefineUserInputOutput = await refineUserInput(input);

    if (result && result.refinedInstructions) {
      return { refinedInstructions: result.refinedInstructions, error: null };
    } else {
      console.warn("AI refinement flow returned an unexpected result or no refined instructions:", result);
      return { refinedInstructions: null, error: "L'IA n'a pas retourné d'instructions raffinées valides." };
    }
  } catch (error) {
    console.error("Error fetching refined instructions from AI flow:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la communication avec l'IA pour le raffinement.";
    return { refinedInstructions: null, error: `Échec du raffinement des instructions par l'IA: ${errorMessage}` };
  }
}


interface GenerationResult {
  bpmnXml: string | null;
  error: string | null;
}

// This function now expects refined user input
export async function getGeneratedBPMNXml(refinedUserInput: string): Promise<GenerationResult> {
  if (!refinedUserInput.trim()) {
    return { bpmnXml: null, error: "Les instructions raffinées pour l'IA ne peuvent pas être vides." };
  }
  
  try {
    // The 'userInput' for generateBPMNXml is now the refined instructions
    const input: GenerateBPMNXmlInput = { userInput: refinedUserInput };
    const result: GenerateBPMNXmlOutput = await generateBPMNXml(input); 

    if (result && result.bpmnXml) {
      return { bpmnXml: result.bpmnXml, error: null };
    } else {
      console.warn("AI BPMN generation flow returned an unexpected result or no BPMN XML:", result);
      return { bpmnXml: null, error: "L'IA n'a pas retourné de XML BPMN valide à partir des instructions raffinées." };
    }

  } catch (error) {
    console.error("Error fetching BPMN XML from AI flow with refined input:", error);
    if (error instanceof Error && error.message === "L'IA n'a pas réussi à générer le contenu XML BPMN.") {
        return { bpmnXml: null, error: error.message };
    }
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la communication avec l'IA pour la génération BPMN.";
    return { bpmnXml: null, error: `Échec de la génération du XML BPMN par l'IA: ${errorMessage}` };
  }
}
