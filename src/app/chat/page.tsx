import ChatInterface from '@/components/chat/chat-interface';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat de Génération XML BPMN | BPMN Architect AI',
  description: 'Utilisez notre IA pour générer des fichiers XML BPMN 2.0 à partir de descriptions de processus métier.',
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] max-w-4xl mx-auto w-full px-0 sm:px-2"> {/* Adjusted height and max-width for better layout */}
      <header className="mb-4 sm:mb-6 px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary border-b pb-2 sm:pb-3">
          Générateur XML BPMN Assisté par IA
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Décrivez le processus métier que vous souhaitez modéliser. Notre IA tentera de générer le fichier XML BPMN 2.0 correspondant.
        </p>
      </header>
      <ChatInterface />
    </div>
  );
}
