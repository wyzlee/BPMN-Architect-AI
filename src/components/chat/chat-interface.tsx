"use client";

import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Download, Loader2 } from 'lucide-react';
import { getGeneratedBPMNXml } from './actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string; 
  sender: 'user' | 'ai';
  isXML?: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai-message',
      text: "Bonjour ! Décrivez le processus que vous souhaitez modéliser. Je vais tenter de générer le fichier XML BPMN 2.0 correspondant.",
      sender: 'ai',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastGeneratedXml, setLastGeneratedXml] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault(); // Prevent form submission if called from form
    if (inputValue.trim() === '' || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    const currentInput = inputValue; // Capture input value before clearing
    setInputValue('');
    setIsLoading(true);
    setLastGeneratedXml(null); 

    try {
      const result = await getGeneratedBPMNXml(currentInput); 
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.bpmnXml) {
        const newAIMessage: Message = {
          id: Date.now().toString() + '-ai-xml',
          text: result.bpmnXml,
          sender: 'ai',
          isXML: true,
        };
        setMessages((prevMessages) => [...prevMessages, newAIMessage]);
        setLastGeneratedXml(result.bpmnXml);
      } else {
        const noXmlMessage: Message = {
          id: Date.now().toString() + '-ai-empty',
          text: "Je n'ai pas pu générer de XML BPMN pour cette description. Pourriez-vous essayer une autre formulation ou vérifier les logs du serveur IA ?",
          sender: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, noXmlMessage]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
      const newAIErrorMessage: Message = {
        id: Date.now().toString() + '-ai-error',
        text: `Désolé, une erreur est survenue : ${errorMessage}`,
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, newAIErrorMessage]);
      toast({
        title: "Erreur de l'IA",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadXML = () => {
    if (!lastGeneratedXml) {
      toast({
        title: "Aucun XML à télécharger",
        description: "Veuillez d'abord générer un XML BPMN via le chat.",
        variant: "destructive",
      });
      return;
    }
    const blob = new Blob([lastGeneratedXml], { type: 'application/bpmn+xml;charset=utf-8' }); // Correct MIME type
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bpmn_model_${Date.now()}.bpmn`; // More unique filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Téléchargement réussi",
      description: "Fichier BPMN (.bpmn) téléchargé.",
    });
  };

  return (
    <div className="flex flex-col flex-grow bg-card border rounded-lg shadow-sm overflow-hidden">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex items-start space-x-2 max-w-[95%] sm:max-w-[85%] break-words', 
                msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
              )}
            >
              {msg.sender === 'ai' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="https://picsum.photos/seed/ai-avatar/40/40" data-ai-hint="robot face" alt="AI Avatar" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'p-3 rounded-xl shadow w-full', 
                  msg.isXML ? 'bg-gray-800 dark:bg-gray-900 text-gray-100' : // Specific style for XML
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted text-muted-foreground rounded-bl-none'
                )}
              >
                {msg.isXML ? (
                  <pre className="text-xs whitespace-pre-wrap font-mono bg-transparent p-0 m-0 overflow-x-auto"><code className="language-xml">{msg.text}</code></pre>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" data-ai-hint="person icon" alt="User Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 justify-start">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="https://picsum.photos/seed/ai-avatar/40/40" data-ai-hint="robot thinking" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-xl shadow bg-muted text-muted-foreground rounded-bl-none">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Décrivez votre processus pour générer le XML BPMN..."
            value={inputValue}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-grow text-base"
            aria-label="Entrée utilisateur pour description du processus"
          />
          <Button type="submit" disabled={isLoading || inputValue.trim() === ''} aria-label="Envoyer message">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="ml-2 hidden sm:inline">Envoyer</span>
          </Button>
          <Button variant="outline" type="button" onClick={handleDownloadXML} disabled={!lastGeneratedXml || isLoading} aria-label="Télécharger XML BPMN">
            <Download className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">BPMN</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
