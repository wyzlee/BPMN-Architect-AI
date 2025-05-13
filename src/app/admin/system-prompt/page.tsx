import { getSystemPrompt, saveSystemPrompt } from './actions';
import PromptEditorForm from './prompt-editor-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Éditeur de Prompt Système | BPMN Architect AI',
  description: "Modifiez le prompt système utilisé par l'IA pour la génération BPMN.",
};

// Ensure the page is revalidated on demand or frequently if prompt changes should be reflected immediately without server restart.
// For now, we rely on getSystemPrompt being called on each page load.
export const revalidate = 0; // Or use a specific time in seconds, or on-demand revalidation

export default async function SystemPromptAdminPage() {
  const currentPrompt = await getSystemPrompt();

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary border-b pb-3">
          Éditeur de Prompt Système pour l'IA
        </h1>
        <p className="text-muted-foreground mt-2">
          Modifiez ici le prompt système qui guide l'IA dans la génération de fichiers BPMN 2.0 XML.
        </p>
      </header>
      <PromptEditorForm initialPrompt={currentPrompt} saveAction={saveSystemPrompt} />
    </div>
  );
}
