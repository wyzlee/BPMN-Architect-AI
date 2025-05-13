
'use server';
/**
 * @fileOverview An AI agent that validates BPMN 2.0 XML.
 *
 * - validateBPMNXml - A function that validates BPMN XML.
 * - ValidateBPMNXmlInput - The input type for the validateBPMNXml function.
 * - ValidateBPMNXmlOutput - The return type for the validateBPMNXml function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getValidationSystemPrompt } from '@/app/admin/validation-prompt/actions';

const ValidateBPMNXmlInputSchema = z.object({
  bpmnXml: z.string().describe('The BPMN 2.0 XML content to validate.'),
});
export type ValidateBPMNXmlInput = z.infer<typeof ValidateBPMNXmlInputSchema>;

const ValidateBPMNXmlOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the BPMN XML is valid according to BPMN 2.0 standards.'),
  issues: z.array(z.string()).describe('A list of issues or suggestions if the XML is not valid or could be improved. Empty if valid.'),
});
export type ValidateBPMNXmlOutput = z.infer<typeof ValidateBPMNXmlOutputSchema>;

const PromptInputSchema = z.object({
  systemPrompt: z.string().describe('The system prompt guiding the AI for BPMN XML validation.'),
  bpmnXml: z.string().describe('The BPMN 2.0 XML content to validate.'),
});

const validationPrompt = ai.definePrompt({
  name: 'validateBPMNXmlPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: ValidateBPMNXmlOutputSchema },
  prompt: `{{{systemPrompt}}}`, // The actual XML will be part of the system prompt template
  config: {
    temperature: 0.0, // Validation should be deterministic
    // Adjust safety settings as needed; likely less restrictive for validation
    safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
  },
});

const validateBPMNXmlFlow = ai.defineFlow(
  {
    name: 'validateBPMNXmlFlow',
    inputSchema: ValidateBPMNXmlInputSchema,
    outputSchema: ValidateBPMNXmlOutputSchema,
  },
  async (flowInput) => {
    const systemPromptContent = await getValidationSystemPrompt();

    // The prompt template expects the XML to be injected into it.
    // The system prompt itself contains `{{{bpmnXml}}}`
    const { output } = await validationPrompt({
      systemPrompt: systemPromptContent, // This prompt already contains the {{{bpmnXml}}} placeholder
      bpmnXml: flowInput.bpmnXml, // Pass XML here to fill the placeholder
    });

    if (!output) {
      console.error('AI did not produce validation output. BPMN XML:', flowInput.bpmnXml);
      throw new Error("L'IA n'a pas réussi à générer le résultat de la validation.");
    }
    return output;
  }
);

export async function validateBPMNXml(input: ValidateBPMNXmlInput): Promise<ValidateBPMNXmlOutput> {
  return validateBPMNXmlFlow(input);
}
