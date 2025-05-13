'use server';
import { generateBPMNXml, type GenerateBPMNXmlInput, type GenerateBPMNXmlOutput } from '@/ai/flows/generate-bpmn-xml';

interface GenerationResult {
  bpmnXml: string | null;
  error: string | null;
}

export async function getGeneratedBPMNXml(userInput: string): Promise<GenerationResult> {
  if (!userInput.trim()) {
    return { bpmnXml: null, error: "L'entrée utilisateur ne peut pas être vide." };
  }
  
  try {
    const input: GenerateBPMNXmlInput = { userInput };
    const result: GenerateBPMNXmlOutput = await generateBPMNXml(input); 

    if (result && result.bpmnXml) {
      return { bpmnXml: result.bpmnXml, error: null };
    } else {
      // This case means the flow executed but the output structure was not as expected, or bpmnXml was empty/null.
      console.warn("AI flow returned an unexpected result or no BPMN XML:", result);
      return { bpmnXml: null, error: "L'IA n'a pas retourné de XML BPMN valide." };
    }

  } catch (error) {
    console.error("Error fetching BPMN XML from AI flow:", error);
    // Check if the error is from our flow's explicit throw for no output
    if (error instanceof Error && error.message === "L'IA n'a pas réussi à générer le contenu XML BPMN.") {
        return { bpmnXml: null, error: error.message };
    }
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la communication avec l'IA.";
    return { bpmnXml: null, error: `Échec de la génération du XML BPMN par l'IA: ${errorMessage}` };
  }
}
