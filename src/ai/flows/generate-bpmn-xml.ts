
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
  refinedUserInput: z.string().describe('The refined and detailed user input describing the business process.'),
});

// External input schema for the exported function and flow
const GenerateBPMNXmlInputSchema = z.object({
  // This 'userInput' will be the refined instructions from the previous AI step
  userInput: z.string().describe('The refined and detailed user input describing the business process for BPMN XML generation.'),
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

Refined User Instructions:
\`\`\`
{{{refinedUserInput}}}
\`\`\`

Generate the BPMN 2.0 XML based on the refined user instructions above.
`,
  config: {
    temperature: 0.1, 
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const generateBPMNXmlFlow = ai.defineFlow(
  {
    name: 'generateBPMNXmlFlow',
    inputSchema: GenerateBPMNXmlInputSchema, 
    outputSchema: GenerateBPMNXmlOutputSchema,
  },
  async (flowInput) => { 
    const systemPromptContent = await getSystemPrompt(); 

    const { output } = await bpmnPrompt({
      systemPrompt: systemPromptContent,
      refinedUserInput: flowInput.userInput, // This is now the refined input
    });

    if (!output || !output.bpmnXml) {
      console.error('AI did not produce BPMN XML output. Refined user input:', flowInput.userInput);
      throw new Error("L'IA n'a pas réussi à générer le contenu XML BPMN à partir des instructions raffinées.");
    }
    return output;
  }
);

export async function generateBPMNXml(input: GenerateBPMNXmlInput): Promise<GenerateBPMNXmlOutput> {
  return generateBPMNXmlFlow(input);
}
