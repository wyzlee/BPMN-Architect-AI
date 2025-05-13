
'use server';

import fs from 'fs/promises';
import path from 'path';
import { ensureDir } from 'fs-extra';

const promptsDir = path.join(process.cwd(), 'src', 'ai', 'prompts');
const promptFilePath = path.join(promptsDir, 'bpmn-validation-prompt.txt');

export async function getValidationSystemPrompt(): Promise<string> {
  try {
    await ensureDir(promptsDir);
    const prompt = await fs.readFile(promptFilePath, 'utf-8');
    return prompt;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      const defaultPrompt = `You are an expert BPMN 2.0 validation AI... (Default validation prompt if file is missing)

Analyze the following BPMN XML content:
\`\`\`xml
{{{bpmnXml}}}
\`\`\`
`;
      // await fs.writeFile(promptFilePath, defaultPrompt, 'utf-8'); // Optionally create it
      return "Le fichier de prompt de validation système n'a pas été trouvé. Un prompt par défaut sera utilisé.";
    }
    console.error('Error reading validation system prompt:', error);
    return "Erreur: Le prompt de validation système n'a pas pu être chargé.";
  }
}

export async function saveValidationSystemPrompt(newPrompt: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureDir(promptsDir);
    await fs.writeFile(promptFilePath, newPrompt, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error saving validation system prompt:', error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { success: false, error: `Échec de la sauvegarde du prompt de validation système: ${errorMessage}` };
  }
}
