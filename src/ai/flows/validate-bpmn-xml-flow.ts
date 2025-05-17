
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

// Schema for the input TO THE FLOW
const ValidateBPMNXmlInputSchema = z.object({
  bpmnXml: z.string().describe('The BPMN 2.0 XML content to validate.'),
  // Optional model ID for dynamic model selection
  modelId: z.string().optional().describe('The ID of the model to use for validation, in the format provider/model-name'),
});
export type ValidateBPMNXmlInput = z.infer<typeof ValidateBPMNXmlInputSchema>;

// Schema for the output OF THE FLOW (and the prompt)
const ValidateBPMNXmlOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the BPMN XML is valid according to BPMN 2.0 standards.'),
  issues: z.array(z.string()).describe('A list of issues or suggestions if the XML is not valid or could be improved. Empty if valid.'),
  summary: z.string().optional().describe('A brief summary of the validation, including positive points and major concerns.'),
});
export type ValidateBPMNXmlOutput = z.infer<typeof ValidateBPMNXmlOutputSchema>;

// Schema for the input TO THE PROMPT ITSELF.
// The prompt template is stored in 'bpmn-validation-prompt.txt' and uses '{{{bpmnXml}}}'.
const ActualPromptInputSchema = z.object({
  bpmnXml: z.string().describe('The BPMN 2.0 XML content to be injected into the validation prompt template.'),
  // We will also pass the guidelines themselves as part of the input to the prompt for clarity,
  // even if the prompt template could be defined to include them statically.
  // However, to keep the pattern of loading the main prompt text from a file and passing it,
  // we will define the prompt template for ai.definePrompt more directly.
});

// This approach assumes that `getValidationSystemPrompt` returns the *template string*
// that itself uses `{{{bpmnXml}}}`.
// To use ai.definePrompt effectively, the prompt template string should be known at definition time.
// Since getValidationSystemPrompt is async, we cannot use its result directly in a top-level ai.definePrompt.
// We will load the template string inside the flow and then use a more generic prompt definition,
// or define the prompt to take the template string as input.

// Let's refine: the prompt template IS the content of bpmn-validation-prompt.txt.
// This template string uses `{{{bpmnXml}}}`.
// So, `ai.definePrompt` needs to be defined with this template.
// This is problematic due to async loading of the template file for a top-level definition.

// Adopting the pattern from generate-bpmn-xml.ts:
// The main prompt text comes from a file (guidelines).
// The dynamic data (bpmnXml) is injected into a static template string in `ai.definePrompt`.

const PromptDefinitionInputSchema = z.object({
  validationGuidelines: z.string().describe("The static content of the validation prompt file."),
  bpmnXmlToValidate: z.string().describe("The actual BPMN XML to validate."),
});

const validationPrompt = ai.definePrompt({
  name: 'validateBPMNXmlPrompt',
  input: { schema: PromptDefinitionInputSchema },
  output: { schema: ValidateBPMNXmlOutputSchema },
  prompt: `{{{validationGuidelines}}}

Please analyze and validate the following BPMN XML content based *only* on the guidelines provided above:
\`\`\`xml
{{{bpmnXmlToValidate}}}
\`\`\`

Ensure your response strictly follows the JSON format specified in the guidelines.
`,
  config: {
    temperature: 0.0, 
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
    inputSchema: ValidateBPMNXmlInputSchema, // Flow takes { bpmnXml: string, modelId?: string }
    outputSchema: ValidateBPMNXmlOutputSchema,
  },
  async (flowInput) => { // flowInput.bpmnXml is the XML string
    const guidelines = await getValidationSystemPrompt(); // Reads 'bpmn-validation-prompt.txt'

    // Dynamic model selection based on the provided modelId
    // Instead of trying to get a model instance, we'll pass the model ID directly
    const promptOptions: { model?: string } = {};
    
    if (flowInput.modelId) {
      console.log(`Using selected model for validation: ${flowInput.modelId}`);
      promptOptions.model = flowInput.modelId;
    } else {
      console.log('Using default model for validation');
    }

    const { output } = await validationPrompt(
      {
        validationGuidelines: guidelines,
        bpmnXmlToValidate: flowInput.bpmnXml,
      },
      promptOptions
    );

    if (!output) {
      console.error('AI did not produce validation output. BPMN XML:', flowInput.bpmnXml);
      // Construct a valid output object indicating failure
      return {
        isValid: false,
        issues: ["L'IA n'a pas réussi à générer le résultat de la validation. Le modèle n'a pas répondu."],
        summary: "Échec de la validation par l'IA."
      };
    }
    // If the AI responds with a string that's not JSON, or malformed JSON for ValidateBPMNXmlOutputSchema
    // Genkit might throw an error before this point, or output might be null/undefined.
    // The schema definition on the prompt output should handle parsing.
    return output;
  }
);

export async function validateBPMNXml(input: ValidateBPMNXmlInput): Promise<ValidateBPMNXmlOutput> {
  return validateBPMNXmlFlow(input);
}

