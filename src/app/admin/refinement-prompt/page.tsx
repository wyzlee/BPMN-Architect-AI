import { getRefinementSystemPrompt, saveRefinementSystemPrompt } from './actions';
import PromptEditorForm from '@/app/admin/system-prompt/prompt-editor-form'; // Reusing the existing form component
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Éditeur de Prompt de Raffinement | BPMN Architect AI',
  description: "Modifiez le prompt système utilisé par l'IA pour raffiner les descriptions utilisateur en instructions BPMN détaillées.",
};

export const revalidate = 0; 

export default async function RefinementSystemPromptAdminPage() {
  const currentPrompt = await getRefinementSystemPrompt();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary border-b pb-3">
          Éditeur de Prompt Système pour le Raffinement des Instructions
        </h1>
        <p className="text-muted-foreground mt-2">
          Modifiez ici le prompt système qui guide l'IA pour analyser l'entrée utilisateur et générer des instructions détaillées pour la modélisation BPMN.
        </p>
      </header>
      <PromptEditorForm initialPrompt={currentPrompt} saveAction={saveRefinementSystemPrompt} />
    </div>
  );
}
