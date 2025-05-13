import ChatInterface from '@/components/chat/chat-interface';

export const metadata = {
  title: 'Chat de Génération BPMN | BPMN Architect AI',
  description: 'Utilisez notre IA pour générer des suggestions d\'éléments BPMN à partir de descriptions de processus.',
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-3xl mx-auto w-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-primary border-b pb-3">
          Chat de Génération BPMN
        </h1>
        <p className="text-muted-foreground mt-2">
          Décrivez le processus que vous souhaitez modéliser. Notre IA vous suggérera des éléments BPMN.
        </p>
      </header>
      <ChatInterface />
    </div>
  );
}
