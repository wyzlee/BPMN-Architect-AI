
'use server';
/**
 * @fileOverview An AI agent that corrects BPMN 2.0 XML based on validation issues.
 *
 * - correctBpmnXml - A function that attempts to correct BPMN XML.
 * - CorrectBpmnXmlInput - The input type for the correctBpmnXml function.
 * - CorrectBpmnXmlOutput - The return type for the correctBpmnXml function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getCorrectionSystemPrompt } from '@/app/admin/correction-prompt/actions';

const CorrectBpmnXmlInputSchema = z.object({
  originalBpmnXml: z.string().describe('The original BPMN 2.0 XML content that has validation issues.'),
  validationIssues: z.array(z.string()).describe('A list of validation issues identified for the original XML.'),
  // Optional model ID for dynamic model selection
  modelId: z.string().optional().describe('The ID of the model to use for correction, in the format provider/model-name'),
});
export type CorrectBpmnXmlInput = z.infer<typeof CorrectBpmnXmlInputSchema>;

const CorrectBpmnXmlOutputSchema = z.object({
  correctedBpmnXml: z.string().describe('The corrected BPMN 2.0 XML content.'),
});
export type CorrectBpmnXmlOutput = z.infer<typeof CorrectBpmnXmlOutputSchema>;

// Internal schema for the prompt, including the system prompt
const PromptInputSchema = z.object({
  systemPrompt: z.string().describe('The system prompt guiding the AI for BPMN XML correction.'),
  originalBpmnXml: z.string().describe('The original BPMN 2.0 XML content.'),
  validationIssues: z.array(z.string()).describe('The list of validation issues.'),
});

const correctionPrompt = ai.definePrompt({
  name: 'correctBpmnXmlPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: CorrectBpmnXmlOutputSchema },
  prompt: `{{{systemPrompt}}}`, // The actual prompt content including placeholders for XML and issues is in the .txt file loaded by getCorrectionSystemPrompt
  config: {
    temperature: 0.1, // Low temperature for precise corrections
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const correctBpmnXmlFlow = ai.defineFlow(
  {
    name: 'correctBpmnXmlFlow',
    inputSchema: CorrectBpmnXmlInputSchema,
    outputSchema: CorrectBpmnXmlOutputSchema,
  },
  async (flowInput) => {
    const systemPromptContentTemplate = await getCorrectionSystemPrompt();
    
    // Dynamic model selection based on the provided modelId
    // Instead of trying to get a model instance, we'll pass the model ID directly
    const promptOptions: { model?: string } = {};
    
    if (flowInput.modelId) {
      console.log(`Using selected model for correction: ${flowInput.modelId}`);
      promptOptions.model = flowInput.modelId;
    } else {
      console.log('Using default model for correction');
    }
    
    // The system prompt template itself contains the placeholders for originalBpmnXml and validationIssues
    // So, we pass them along with the template to the prompt function.
    // The Handlebars templating for originalBpmnXml and validationIssues happens within the systemPromptContentTemplate.

    const { output } = await correctionPrompt(
      {
        systemPrompt: systemPromptContentTemplate, // This now includes the template AND the data to fill it
        originalBpmnXml: flowInput.originalBpmnXml,
        validationIssues: flowInput.validationIssues,
      },
      promptOptions
    );

    if (!output || !output.correctedBpmnXml) {
      console.error('AI did not produce corrected BPMN XML output. Original XML:', flowInput.originalBpmnXml, "Issues:", flowInput.validationIssues);
      throw new Error("L'IA n'a pas réussi à générer le contenu XML BPMN corrigé.");
    }
    return output;
  }
);

export async function correctBpmnXml(input: CorrectBpmnXmlInput): Promise<CorrectBpmnXmlOutput> {
  return correctBpmnXmlFlow(input);
}
