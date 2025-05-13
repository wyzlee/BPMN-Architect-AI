'use server';

/**
 * @fileOverview An AI agent that suggests BPMN elements and connections based on user input.
 *
 * - suggestBPMNElements - A function that suggests BPMN elements based on user input.
 * - SuggestBPMNElementsInput - The input type for the suggestBPMNElements function.
 * - SuggestBPMNElementsOutput - The return type for the suggestBPMNElements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBPMNElementsInputSchema = z.object({
  userInput: z.string().describe('The user input describing the business process.'),
});
export type SuggestBPMNElementsInput = z.infer<typeof SuggestBPMNElementsInputSchema>;

const SuggestBPMNElementsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggested BPMN elements and connections.'),
});
export type SuggestBPMNElementsOutput = z.infer<typeof SuggestBPMNElementsOutputSchema>;

export async function suggestBPMNElements(input: SuggestBPMNElementsInput): Promise<SuggestBPMNElementsOutput> {
  return suggestBPMNElementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBPMNElementsPrompt',
  input: {schema: SuggestBPMNElementsInputSchema},
  output: {schema: SuggestBPMNElementsOutputSchema},
  prompt: `You are an expert in BPMN 2.0 and your task is to suggest relevant BPMN elements and connections based on the user's description of a business process.

  User Input: {{{userInput}}}

  Consider the user input and suggest a list of BPMN elements and connections that would be appropriate for modeling the described process. Provide suggestions as a simple array of strings.
  Do not include any introductory or concluding remarks, only the array itself.
  For example:
  [
    "Start Event",
    "Task: Process Data",
    "Sequence Flow",
    "Exclusive Gateway",
    "Task: Send Notification",
    "End Event"
  ]
  `,
});

const suggestBPMNElementsFlow = ai.defineFlow(
  {
    name: 'suggestBPMNElementsFlow',
    inputSchema: SuggestBPMNElementsInputSchema,
    outputSchema: SuggestBPMNElementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
