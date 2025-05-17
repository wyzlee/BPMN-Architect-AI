
'use server';
import { generateBPMNXml, type GenerateBPMNXmlInput, type GenerateBPMNXmlOutput } from '@/ai/flows/generate-bpmn-xml';
import { refineUserInput, type RefineUserInputInput, type RefineUserInputOutput } from '@/ai/flows/refine-user-input-flow';
import { validateBPMNXml, type ValidateBPMNXmlInput, type ValidateBPMNXmlOutput } from '@/ai/flows/validate-bpmn-xml-flow';
import { correctBpmnXml, type CorrectBpmnXmlInput, type CorrectBpmnXmlOutput } from '@/ai/flows/correct-bpmn-xml-flow';
import { listAvailableModels, type AvailableModelInfo } from '@/ai/genkit';

interface RefinementResult {
  refinedInstructions: string | null;
  error: string | null;
}

export async function getRefinedInstructions(rawUserInput: string, modelId?: string): Promise<RefinementResult> {
  if (!rawUserInput.trim()) {
    return { refinedInstructions: null, error: "L'entrée utilisateur brute ne peut pas être vide." };
  }

  try {
    const input: RefineUserInputInput = { rawUserInput, modelId };
    const result: RefineUserInputOutput = await refineUserInput(input);

    if (result && result.refinedInstructions) {
      return { refinedInstructions: result.refinedInstructions, error: null };
    } else {
      console.warn("AI refinement flow returned an unexpected result or no refined instructions:", result);
      return { refinedInstructions: null, error: "L'IA de raffinement n'a pas retourné d'instructions valides. Veuillez vérifier le prompt de raffinement ou réessayer." };
    }
  } catch (error) {
    console.error("Error fetching refined instructions from AI flow:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la communication avec l'IA pour le raffinement.";
    return { refinedInstructions: null, error: `Échec du raffinement des instructions par l'IA: ${errorMessage}. Assurez-vous que le service Genkit est démarré et que le prompt de raffinement est configuré.` };
  }
}


interface GenerationResult {
  bpmnXml: string | null;
  validation?: ValidateBPMNXmlOutput | null;
  error: string | null;
}

export async function getGeneratedAndValidatedBPMNXml(refinedUserInput: string, modelId?: string): Promise<GenerationResult> {
  if (!refinedUserInput.trim()) {
    return { bpmnXml: null, error: "Les instructions raffinées pour l'IA ne peuvent pas être vides." };
  }
  
  let generatedXml: string | null = null;

  try {
    const generationInput: GenerateBPMNXmlInput = { userInput: refinedUserInput, modelId };
    const generationResult: GenerateBPMNXmlOutput = await generateBPMNXml(generationInput); 

    if (!generationResult || !generationResult.bpmnXml) {
      console.warn("AI BPMN generation flow returned an unexpected result or no BPMN XML:", generationResult);
      return { bpmnXml: null, error: "L'IA de génération n'a pas retourné de XML BPMN valide. Veuillez vérifier le prompt de génération ou réessayer." };
    }
    generatedXml = generationResult.bpmnXml;

  } catch (error) {
    console.error("Error fetching BPMN XML from AI flow with refined input:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la communication avec l'IA pour la génération BPMN.";
    return { bpmnXml: null, error: `Échec de la génération du XML BPMN par l'IA: ${errorMessage}. Assurez-vous que le service Genkit est démarré et que le prompt de génération est configuré.` };
  }

  try {
    const validationInput: ValidateBPMNXmlInput = { bpmnXml: generatedXml, modelId };
    const validationResult: ValidateBPMNXmlOutput = await validateBPMNXml(validationInput);
    return { bpmnXml: generatedXml, validation: validationResult, error: null };

  } catch (error) {
    console.error("Error validating BPMN XML with AI flow:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la validation BPMN.";
    // Return the generated XML even if validation fails, but include the error
    return { 
        bpmnXml: generatedXml, 
        validation: { isValid: false, issues: [`La validation a échoué: ${errorMessage}. Assurez-vous que le service Genkit est démarré et que le prompt de validation est configuré.`]}, 
        error: null // Error is about validation, not generation itself here
    };
  }
}


interface CorrectionResult {
  correctedBpmnXml: string | null;
  validation?: ValidateBPMNXmlOutput | null;
  error: string | null;
}

export async function getCorrectedAndValidatedBPMNXml(originalBpmnXml: string, validationIssues: string[], modelId?: string): Promise<CorrectionResult> {
  if (!originalBpmnXml.trim()) {
    return { correctedBpmnXml: null, error: "Le XML BPMN original ne peut pas être vide pour la correction." };
  }
  if (!validationIssues || validationIssues.length === 0) {
    return { correctedBpmnXml: originalBpmnXml, error: "Aucun problème de validation fourni pour la correction." };
  }

  let correctedXml: string | null = null;

  try {
    const correctionInput: CorrectBpmnXmlInput = { originalBpmnXml, validationIssues, modelId };
    const correctionOutput: CorrectBpmnXmlOutput = await correctBpmnXml(correctionInput);

    if (!correctionOutput || !correctionOutput.correctedBpmnXml) {
      console.warn("AI BPMN correction flow returned an unexpected result or no corrected BPMN XML:", correctionOutput);
      return { correctedBpmnXml: null, error: "L'IA de correction n'a pas retourné de XML BPMN corrigé. Veuillez vérifier le prompt de correction ou réessayer." };
    }
    correctedXml = correctionOutput.correctedBpmnXml;

  } catch (error) {
    console.error("Error correcting BPMN XML with AI flow:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la communication avec l'IA pour la correction BPMN.";
    return { correctedBpmnXml: null, error: `Échec de la correction du XML BPMN par l'IA: ${errorMessage}. Assurez-vous que le service Genkit est démarré et que le prompt de correction est configuré.` };
  }

  // Re-validate the corrected XML
  try {
    const validationInput: ValidateBPMNXmlInput = { bpmnXml: correctedXml, modelId };
    const validationResult: ValidateBPMNXmlOutput = await validateBPMNXml(validationInput);
    return { correctedBpmnXml: correctedXml, validation: validationResult, error: null };

  } catch (error) {
    console.error("Error re-validating corrected BPMN XML with AI flow:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur interne est survenue lors de la nouvelle validation BPMN.";
    return {
      correctedBpmnXml: correctedXml,
      validation: { isValid: false, issues: [`La nouvelle validation après correction a échoué: ${errorMessage}.`] },
      error: null
    };
  }
}

/**
 * Retrieves the list of available LLM models from the backend
 * @returns Object containing the list of models and optional error message
 */
export async function getAvailableLlmList(): Promise<{ models: AvailableModelInfo[]; error?: string }> {
  try {
    const models = await listAvailableModels();
    return { models };
  } catch (error) {
    console.error("Error fetching available LLM list:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { models: [], error: `Impossible de récupérer la liste des modèles : ${errorMessage}` };
  }
}
