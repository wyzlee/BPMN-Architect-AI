'use server';

import fs from 'fs/promises';
import path from 'path';
import { ensureDir } from 'fs-extra'; // Using fs-extra for ensureDir

const promptsDir = path.join(process.cwd(), 'src', 'ai', 'prompts');
const promptFilePath = path.join(promptsDir, 'bpmn-generation-prompt.txt');

export async function getSystemPrompt(): Promise<string> {
  try {
    await ensureDir(promptsDir); // Ensure directory exists
    const prompt = await fs.readFile(promptFilePath, 'utf-8');
    return prompt;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return a default or empty string
      // Or, create it with a default prompt if desired. For now, just return a placeholder.
      return "Le fichier de prompt système n'a pas été trouvé. Veuillez en créer un ou en sauvegarder un nouveau.";
    }
    console.error('Error reading system prompt:', error);
    return "Erreur: Le prompt système n'a pas pu être chargé.";
  }
}

export async function saveSystemPrompt(newPrompt: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureDir(promptsDir); // Ensure directory exists before writing
    await fs.writeFile(promptFilePath, newPrompt, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error saving system prompt:', error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { success: false, error: `Échec de la sauvegarde du prompt système: ${errorMessage}` };
  }
}
