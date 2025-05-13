'use server';

/**
 * @fileOverview An AI agent that generates BPMN 2.0 XML based on user input and a system prompt.
 *
 * - generateBPMNXml - A function that generates BPMN XML.
 * - GenerateBPMNXmlInput - The input type for the generateBPMNXml function (external).
 * - GenerateBPMNXmlOutput - The return type for the generateBPMNXml function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getSystemPrompt } from '@/app/admin/system-prompt/actions';

// Internal schema for the prompt, including the system prompt
const PromptInputSchema = z.object({
  systemPrompt: z.string().describe('The system prompt guiding the AI for BPMN XML generation.'),
  userInput: z.string().describe('The user input describing the business process.'),
});

// External input schema for the exported function and flow
const GenerateBPMNXmlInputSchema = z.object({
  userInput: z.string().describe('The user input describing the business process for BPMN XML generation.'),
});
export type GenerateBPMNXmlInput = z.infer<typeof GenerateBPMNXmlInputSchema>;

const GenerateBPMNXmlOutputSchema = z.object({
  bpmnXml: z.string().describe('The generated BPMN 2.0 XML content.'),
});
export type GenerateBPMNXmlOutput = z.infer<typeof GenerateBPMNXmlOutputSchema>;

// Define the prompt once, using placeholders for both system and user inputs
const bpmnPrompt = ai.definePrompt({
  name: 'generateBPMNXmlPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: GenerateBPMNXmlOutputSchema },
  prompt: `{{{systemPrompt}}}

User Input: {{{userInput}}}
`,
  config: {
    temperature: 0.1, // Lower temperature for more deterministic XML output
    // Adjust safetySettings if needed for complex XML/code generation
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
  // Ensure you're using a model capable of handling potentially large prompts and generating structured XML.
  // model: ai.getModel('gemini-1.5-flash-latest'), // Example, ensure this model is available and suitable
});

// Define the flow that orchestrates fetching the system prompt and calling the main prompt
const generateBPMNXmlFlow = ai.defineFlow(
  {
    name: 'generateBPMNXmlFlow',
    inputSchema: GenerateBPMNXmlInputSchema, // External API uses this simple input
    outputSchema: GenerateBPMNXmlOutputSchema,
  },
  async (flowInput) => { // flowInput is of type GenerateBPMNXmlInput
    const systemPromptContent = await getSystemPrompt(); // Fetch the system prompt

    // Call the predefined prompt, passing both the fetched system prompt and user input
    const { output } = await bpmnPrompt({
      systemPrompt: systemPromptContent,
      userInput: flowInput.userInput,
    });

    if (!output || !output.bpmnXml) {
      // Log the input that caused the issue for easier debugging
      console.error('AI did not produce BPMN XML output. User input:', flowInput.userInput);
      throw new Error("L'IA n'a pas réussi à générer le contenu XML BPMN.");
    }
    return output;
  }
);

// Exported wrapper function to be called by server actions/components
export async function generateBPMNXml(input: GenerateBPMNXmlInput): Promise<GenerateBPMNXmlOutput> {
  return generateBPMNXmlFlow(input);
}
