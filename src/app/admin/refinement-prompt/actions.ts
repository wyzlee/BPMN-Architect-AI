
'use server';

import fs from 'fs/promises';
import path from 'path';
import { ensureDir } from 'fs-extra';

const promptsDir = path.join(process.cwd(), 'src', 'ai', 'prompts');
const promptFilePath = path.join(promptsDir, 'bpmn-refinement-prompt.txt');

export async function getRefinementSystemPrompt(): Promise<string> {
  try {
    await ensureDir(promptsDir);
    const prompt = await fs.readFile(promptFilePath, 'utf-8');
    return prompt;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // If the refinement prompt doesn't exist, return a placeholder or default.
      // This is crucial for the first run or if the file is accidentally deleted.
      const defaultPrompt = `You are an AI assistant specialized in understanding and deconstructing business process workflows... (Default refinement prompt text if file is missing)`;
      // Optionally, write this default prompt to the file.
      // await fs.writeFile(promptFilePath, defaultPrompt, 'utf-8');
      return "Le fichier de prompt de raffinement système n'a pas été trouvé. Veuillez en créer un ou en sauvegarder un nouveau. Un prompt par défaut sera utilisé en attendant.";
    }
    console.error('Error reading refinement system prompt:', error);
    return "Erreur: Le prompt de raffinement système n'a pas pu être chargé.";
  }
}

export async function saveRefinementSystemPrompt(newPrompt: string): Promise<{ success: boolean; error?: string }> {
  try {
    await ensureDir(promptsDir);
    await fs.writeFile(promptFilePath, newPrompt, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error saving refinement system prompt:', error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { success: false, error: `Échec de la sauvegarde du prompt de raffinement système: ${errorMessage}` };
  }
}
