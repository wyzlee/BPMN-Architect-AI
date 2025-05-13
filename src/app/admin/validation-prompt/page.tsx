
import React from 'react';
import { getValidationSystemPrompt, saveValidationSystemPrompt } from './actions';
import PromptEditorForm from '@/app/admin/system-prompt/prompt-editor-form'; // Reusing the existing form component
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Éditeur de Prompt de Validation BPMN | BPMN Architect AI',
  description: "Modifiez le prompt système utilisé par l'IA pour valider les fichiers XML BPMN.",
};

export const revalidate = 0;

export default async function ValidationSystemPromptAdminPage() {
  const currentPrompt = await getValidationSystemPrompt();

  return (
    <React.Fragment>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary border-b pb-3">
            Éditeur de Prompt Système pour la Validation BPMN
          </h1>
          <p className="text-muted-foreground mt-2">
            Modifiez ici le prompt système qui guide l'IA dans la validation des fichiers XML BPMN 2.0.
            {' Assurez-vous que le prompt contienne la variable `{{{bpmnXml}}}` pour l\'injection du contenu XML à valider.'}
          </p>
        </header>
        <PromptEditorForm initialPrompt={currentPrompt} saveAction={saveValidationSystemPrompt} />
      </div>
    </React.Fragment>
  );
}
