
'use server';

import fs from 'fs/promises';
import path from 'path';
import { ensureDir } from 'fs-extra';

const promptsDir = path.join(process.cwd(), 'src', 'ai', 'prompts');
const promptFilePath = path.join(promptsDir, 'bpmn-correction-prompt.txt');

export async function getCorrectionSystemPrompt(): Promise<string> {
  try {
    await ensureDir(promptsDir);
    const prompt = await fs.readFile(promptFilePath, 'utf-8');
    return prompt;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      const defaultPrompt = `You are an expert AI assistant specialized in correcting BPMN 2.0 XML... (Default correction prompt text if file is missing)

Original BPMN XML:
\`\`\`xml
{{{originalBpmnXml}}}
\`\`\`

Validation Issues:
{{#each validationIssues}}
- {{{this}}}
{{/each}}

Corrected BPMN 2.0 XML:
`;
      // await fs.writeFile(promptFilePath, defaultPrompt, 'utf-8'); // Optionally create with default
      return "Le fichier de prompt de correction système n'a pas été trouvé. Veuillez en créer un ou en sauvegarder un nouveau. Un prompt par défaut sera utilisé en attendant.";
    }
    console.error('Error reading correction system prompt:', error);
    return "Erreur: Le prompt de correction système n'a pas pu être chargé.";
  }
}

export async function saveCorrectionSystemPrompt(newPrompt: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureDir(promptsDir);
    await fs.writeFile(promptFilePath, newPrompt, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error saving correction system prompt:', error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { success: false, error: `Échec de la sauvegarde du prompt de correction système: ${errorMessage}` };
  }
}
