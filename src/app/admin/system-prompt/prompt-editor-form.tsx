'use client';

import { useState, useTransition, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PromptEditorFormProps {
  initialPrompt: string;
  saveAction: (newPrompt: string) => Promise<{ success: boolean; error?: string }>;
}

export default function PromptEditorForm({ initialPrompt, saveAction }: PromptEditorFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveAction(prompt);
      if (result.success) {
        toast({
          title: 'Succès',
          description: 'Le prompt système a été sauvegardé.',
        });
      } else {
        toast({
          title: 'Erreur',
          description: result.error || "Échec de la sauvegarde du prompt système.",
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={30} // Increased rows for better visibility of long prompt
          className="w-full p-4 border rounded-md shadow-sm text-sm font-mono bg-card text-card-foreground"
          placeholder="Entrez le prompt système ici..."
          aria-label="Éditeur de Prompt Système"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Le prompt système guide le comportement de l'IA. Assurez-vous que les instructions sont claires et conformes aux attentes. Les modifications prendront effet après le prochain rechargement du serveur de l'IA (si applicable) ou lors de la prochaine génération.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde en cours...
            </>
          ) : (
            'Sauvegarder le Prompt'
          )}
        </Button>
      </div>
    </form>
  );
}
