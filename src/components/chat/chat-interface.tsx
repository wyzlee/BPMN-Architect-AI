"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Download, Loader2 } from 'lucide-react';
import { getBPMNSuggestions } from './actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string | string[]; // string for normal text, string[] for AI suggestions
  sender: 'user' | 'ai';
  isXML?: boolean;
  isSuggestions?: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai-message',
      text: "Bonjour ! Décrivez le processus que vous souhaitez modéliser en BPMN. Je vais tenter de générer une représentation textuelle structurée des éléments BPMN.",
      sender: 'ai',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAIResponseXML, setLastAIResponseXML] = useState<string | null>(null);
  const [lastAISuggestions, setLastAISuggestions] = useState<string[] | null>(null);

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

  const generateSimplifiedXML = (suggestions: string[]): string => {
    let simplifiedXML = `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="SimulatedDef_${Date.now()}">\n  <bpmn:process id="SimulatedProcess_${Date.now()}" isExecutable="false">\n`;
    let elementIdCounter = 1;
    let lastElementId: string | null = null;

    suggestions.forEach(suggestion => {
      const [type, ...nameParts] = suggestion.split(': ');
      const name = nameParts.join(': ') || type; // Handle cases like "Start Event" where there's no colon part.
      let currentElementId: string | null = null;

      if (type.toLowerCase().includes("start event")) {
        currentElementId = `start_${elementIdCounter}`;
        simplifiedXML += `    <bpmn:startEvent id="${currentElementId}" name="${name.trim()}"/>\n`;
      } else if (type.toLowerCase().includes("task")) {
        currentElementId = `task_${elementIdCounter}`;
        simplifiedXML += `    <bpmn:task id="${currentElementId}" name="${name.trim()}"/>\n`;
      } else if (type.toLowerCase().includes("exclusive gateway")) {
        currentElementId = `exclusiveGateway_${elementIdCounter}`;
        simplifiedXML += `    <bpmn:exclusiveGateway id="${currentElementId}" name="${name.trim()}"/>\n`;
      } else if (type.toLowerCase().includes("parallel gateway")) {
        currentElementId = `parallelGateway_${elementIdCounter}`;
        simplifiedXML += `    <bpmn:parallelGateway id="${currentElementId}" name="${name.trim()}"/>\n`;
      } else if (type.toLowerCase().includes("inclusive gateway")) {
        currentElementId = `inclusiveGateway_${elementIdCounter}`;
        simplifiedXML += `    <bpmn:inclusiveGateway id="${currentElementId}" name="${name.trim()}"/>\n`;
      } else if (type.toLowerCase().includes("end event")) {
        currentElementId = `end_${elementIdCounter}`;
        simplifiedXML += `    <bpmn:endEvent id="${currentElementId}" name="${name.trim()}"/>\n`;
      }
      // Add sequence flow if there's a previous element and the current one is not a flow itself
      if (lastElementId && currentElementId && !type.toLowerCase().includes("sequence flow")) {
        simplifiedXML += `    <bpmn:sequenceFlow id="flow_${lastElementId}_${currentElementId}" sourceRef="${lastElementId}" targetRef="${currentElementId}"/>\n`;
      }
      
      if (currentElementId && !type.toLowerCase().includes("sequence flow")) {
        lastElementId = currentElementId;
        elementIdCounter++;
      }
    });

    simplifiedXML += `  </bpmn:process>\n</bpmn:definitions>`;
    return simplifiedXML;
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const result = await getBPMNSuggestions(newUserMessage.text as string);
      if (result.error) {
        throw new Error(result.error);
      }
      if (result.suggestions && result.suggestions.length > 0) {
        const aiSuggestions = result.suggestions;
        const newAIMessage: Message = {
          id: Date.now().toString() + '-ai',
          text: aiSuggestions,
          sender: 'ai',
          isSuggestions: true,
        };
        setMessages((prevMessages) => [...prevMessages, newAIMessage]);
        setLastAISuggestions(aiSuggestions);
        const xml = generateSimplifiedXML(aiSuggestions);
        setLastAIResponseXML(xml);

      } else {
        const noSuggestionsMessage: Message = {
          id: Date.now().toString() + '-ai-empty',
          text: "Je n'ai pas pu générer de suggestions pour cette description. Pourriez-vous essayer une autre formulation ?",
          sender: 'ai',
        };
        setMessages((prevMessages) => [...prevMessages, noSuggestionsMessage]);
        setLastAISuggestions(null);
        setLastAIResponseXML(null);
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
      setLastAISuggestions(null);
      setLastAIResponseXML(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadXML = () => {
    if (!lastAIResponseXML) {
      toast({
        title: "Aucun XML à télécharger",
        description: "Veuillez d'abord générer des suggestions BPMN.",
        variant: "destructive",
      });
      return;
    }
    const blob = new Blob([lastAIResponseXML], { type: 'application/xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'simulation_bpmn.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: "Téléchargement réussi",
      description: "Fichier XML simulé (pseudo-BPMN) téléchargé.",
    });
  };

  return (
    <div className="flex flex-col flex-grow bg-card border rounded-lg shadow-sm overflow-hidden">
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex items-end space-x-2 max-w-[85%] break-words',
              msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
            )}
          >
            {msg.sender === 'ai' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/seed/ai-avatar/40/40" data-ai-hint="robot face" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'p-3 rounded-xl shadow',
                msg.sender === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-muted text-muted-foreground rounded-bl-none'
              )}
            >
              {msg.isSuggestions && Array.isArray(msg.text) ? (
                <ul className="list-disc list-inside space-y-1">
                  {msg.text.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
            {msg.sender === 'user' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" data-ai-hint="person icon" alt="User Avatar" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 justify-start">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://picsum.photos/seed/ai-avatar/40/40" data-ai-hint="robot thinking" alt="AI Avatar" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div className="p-3 rounded-xl shadow bg-muted text-muted-foreground rounded-bl-none">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Décrivez votre processus ici..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="flex-grow text-base"
          />
          <Button onClick={handleSendMessage} disabled={isLoading || inputValue.trim() === ''} aria-label="Envoyer message">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="ml-2 hidden sm:inline">Envoyer</span>
          </Button>
          <Button variant="outline" onClick={handleDownloadXML} disabled={!lastAIResponseXML} aria-label="Télécharger XML">
            <Download className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">XML</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
