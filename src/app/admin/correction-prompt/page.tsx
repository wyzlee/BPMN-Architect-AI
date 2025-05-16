
import { getCorrectionSystemPrompt, saveCorrectionSystemPrompt } from './actions';
import PromptEditorForm from '@/app/admin/system-prompt/prompt-editor-form'; // Reusing the existing form component
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Éditeur de Prompt de Correction BPMN | BPMN Architect AI',
  description: "Modifiez le prompt système utilisé par l'IA pour corriger les fichiers XML BPMN en fonction des problèmes de validation.",
};

export const revalidate = 0; 

export default async function CorrectionSystemPromptAdminPage() {
  const currentPrompt = await getCorrectionSystemPrompt();

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary border-b pb-3">
            Éditeur de Prompt Système pour la Correction BPMN
          </h1>
          <p className="text-muted-foreground mt-2">
            Modifiez ici le prompt système qui guide l'IA pour analyser un XML BPMN existant et une liste de problèmes de validation, puis générer un XML corrigé.
            Le prompt doit utiliser les variables `{'{{originalBpmnXml}}'}` et `{'{{validationIssues}}'}`.
          </p>
        </header>
        <PromptEditorForm initialPrompt={currentPrompt} saveAction={saveCorrectionSystemPrompt} />
      </div>
    </>
  );
}
