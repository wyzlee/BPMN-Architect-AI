
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Download, Loader2, CheckCircle, XCircle, Wand2 } from 'lucide-react';
import { getGeneratedBPMNXml, getRefinedInstructions } from './actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';


interface ActionButton {
  id: string;
  label: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  Icon?: React.ElementType;
  disabled?: boolean;
}
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isXML?: boolean;
  isRefinement?: boolean;
  refinedText?: string; // The refined text, if isRefinement is true and requires confirmation
  requiresConfirmation?: boolean;
  confirmationProcessed?: boolean; // True if user has acted on this confirmation
  originalUserInput?: string; // The original user input that led to this refined text
  actionButtons?: ActionButton[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai-message',
      text: "Bonjour ! Décrivez le processus que vous souhaitez modéliser. Je vais d'abord raffiner votre description en instructions détaillées, puis vous pourrez générer le XML BPMN.",
      sender: 'ai',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingRefinement, setIsLoadingRefinement] = useState(false);
  const [isLoadingBpmn, setIsLoadingBpmn] = useState(false);
  const [lastGeneratedXml, setLastGeneratedXml] = useState<string | null>(null);
  const [editingRefinedText, setEditingRefinedText] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);


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

  const processMessageForBPMN = useCallback(async (messageId: string, instructions: string) => {
    setIsLoadingBpmn(true);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, confirmationProcessed: true, actionButtons: undefined } : m));

    try {
      const result = await getGeneratedBPMNXml(instructions);
      if (result.error) throw new Error(result.error);

      if (result.bpmnXml) {
        const newAIMessage: Message = {
          id: Date.now().toString() + '-ai-xml',
          text: result.bpmnXml,
          sender: 'ai',
          isXML: true,
        };
        setMessages(prev => [...prev, newAIMessage]);
        setLastGeneratedXml(result.bpmnXml);
      } else {
        const noXmlMessage: Message = {
          id: Date.now().toString() + '-ai-empty',
          text: "Je n'ai pas pu générer de XML BPMN à partir des instructions fournies.",
          sender: 'ai',
        };
        setMessages(prev => [...prev, noXmlMessage]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de la génération BPMN.";
      const newAIErrorMessage: Message = {
        id: Date.now().toString() + '-ai-error-bpmn',
        text: `Erreur lors de la génération BPMN : ${errorMessage}`,
        sender: 'ai',
      };
      setMessages(prev => [...prev, newAIErrorMessage]);
      toast({ title: "Erreur de Génération BPMN", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingBpmn(false);
    }
  }, [toast]);

  const handleEditInstructions = (messageId: string, currentInstructions: string) => {
    setEditingMessageId(messageId);
    setEditingRefinedText(currentInstructions);
     setMessages(prev => prev.map(m => m.id === messageId ? { ...m, confirmationProcessed: true, actionButtons: undefined } : m));
  };

  const handleSaveEditedInstructions = async () => {
    if (editingMessageId && editingRefinedText) {
      // Add a message indicating the user has edited the instructions
      const editedMarkerMessage: Message = {
        id: Date.now().toString() + '-user-edited',
        text: "J'ai modifié les instructions. Voici la nouvelle version :",
        sender: 'user',
      };
       const newRefinedMessage: Message = {
        id: editingMessageId + '-edited-' + Date.now(), // Ensure unique ID
        text: editingRefinedText,
        sender: 'ai', // Displayed as if AI proposed this new version for confirmation
        isRefinement: true,
        refinedText: editingRefinedText,
        requiresConfirmation: true,
        confirmationProcessed: false,
        originalUserInput: messages.find(m => m.id === editingMessageId)?.originalUserInput || "N/A",
         actionButtons: [
          { id: 'generate-' + editingMessageId, label: 'Générer BPMN', onClick: () => processMessageForBPMN(editingMessageId + '-edited-' + Date.now(), editingRefinedText!), Icon: CheckCircle, variant: 'default' },
          { id: 'edit-' + editingMessageId, label: 'Modifier', onClick: () => handleEditInstructions(editingMessageId + '-edited-' + Date.now(), editingRefinedText!), Icon: Wand2, variant: 'outline' },
          { id: 'cancel-' + editingMessageId, label: 'Annuler', onClick: () => setMessages(prev => prev.map(m => m.id === editingMessageId + '-edited-' + Date.now() ? { ...m, confirmationProcessed: true, actionButtons: undefined } : m)), Icon: XCircle, variant: 'ghost' },
        ]
      };
      setMessages(prev => [...prev, editedMarkerMessage, newRefinedMessage]);
      setEditingMessageId(null);
      setEditingRefinedText(null);
    }
  };


  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (inputValue.trim() === '' || isLoadingRefinement || isLoadingBpmn) return;

    const rawUserInput = inputValue;
    const newUserMessage: Message = {
      id: Date.now().toString() + '-user-raw',
      text: rawUserInput,
      sender: 'user',
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoadingRefinement(true);
    setLastGeneratedXml(null);

    try {
      const result = await getRefinedInstructions(rawUserInput);
      if (result.error) throw new Error(result.error);

      if (result.refinedInstructions) {
        const refinedMessageId = Date.now().toString() + '-ai-refined';
        const newAIRefinedMessage: Message = {
          id: refinedMessageId,
          text: result.refinedInstructions,
          sender: 'ai',
          isRefinement: true,
          refinedText: result.refinedInstructions,
          requiresConfirmation: true,
          confirmationProcessed: false,
          originalUserInput: rawUserInput,
          actionButtons: [
            { id: 'generate-' + refinedMessageId, label: 'Générer BPMN', onClick: () => processMessageForBPMN(refinedMessageId, result.refinedInstructions!), Icon: CheckCircle, variant: 'default' },
            { id: 'edit-' + refinedMessageId, label: 'Modifier', onClick: () => handleEditInstructions(refinedMessageId, result.refinedInstructions!), Icon: Wand2, variant: 'outline' },
            { id: 'cancel-' + refinedMessageId, label: 'Annuler', onClick: () => setMessages(prev => prev.map(m => m.id === refinedMessageId ? { ...m, confirmationProcessed: true, actionButtons: undefined } : m)), Icon: XCircle, variant: 'ghost' },
          ]
        };
        setMessages(prev => [...prev, newAIRefinedMessage]);
      } else {
        throw new Error("L'IA n'a pas pu raffiner les instructions.");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue lors du raffinement.";
      const newAIErrorMessage: Message = {
        id: Date.now().toString() + '-ai-error-refine',
        text: `Erreur de raffinement : ${errorMessage}`,
        sender: 'ai',
      };
      setMessages(prev => [...prev, newAIErrorMessage]);
      toast({ title: "Erreur de Raffinement", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingRefinement(false);
    }
  };

  const handleDownloadXML = () => {
    if (!lastGeneratedXml) {
      toast({ title: "Aucun XML à télécharger", description: "Veuillez d'abord générer un XML BPMN.", variant: "destructive" });
      return;
    }
    const blob = new Blob([lastGeneratedXml], { type: 'application/bpmn+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bpmn_model_${Date.now()}.bpmn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Téléchargement réussi", description: "Fichier BPMN (.bpmn) téléchargé." });
  };
  
  const currentLoading = isLoadingRefinement || isLoadingBpmn;

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
                  msg.isXML ? 'bg-gray-800 dark:bg-gray-900 text-gray-100' :
                  msg.isRefinement ? 'bg-accent/10 border border-accent/30 text-foreground' :
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
                {msg.requiresConfirmation && !msg.confirmationProcessed && msg.actionButtons && (
                  <div className="mt-3 pt-3 border-t border-accent/20 flex flex-wrap gap-2">
                    {msg.actionButtons.map(btn => (
                       <Button key={btn.id} variant={btn.variant || 'default'} size="sm" onClick={btn.onClick} disabled={currentLoading || btn.disabled}>
                        {btn.Icon && <btn.Icon className="mr-2 h-4 w-4" />}
                        {btn.label}
                      </Button>
                    ))}
                  </div>
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
          {(isLoadingRefinement || isLoadingBpmn) && (
            <div className="flex items-center space-x-2 justify-start">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="https://picsum.photos/seed/ai-avatar/40/40" data-ai-hint="robot thinking" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-xl shadow bg-muted text-muted-foreground rounded-bl-none">
                <Loader2 className="h-5 w-5 animate-spin" />
                 <span className="ml-2 text-sm">
                  {isLoadingRefinement ? "Raffinement en cours..." : "Génération BPMN..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {editingMessageId && editingRefinedText !== null && (
        <div className="p-4 border-t bg-background space-y-2">
          <h3 className="text-sm font-medium text-primary">Modifier les instructions raffinées :</h3>
          <Textarea
            value={editingRefinedText}
            onChange={(e) => setEditingRefinedText(e.target.value)}
            rows={8}
            className="w-full p-2 border rounded-md shadow-sm text-sm font-mono bg-card text-card-foreground"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setEditingMessageId(null); setEditingRefinedText(null); }}>Annuler</Button>
            <Button onClick={handleSaveEditedInstructions}>Valider les modifications et Confirmer</Button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Décrivez votre processus..."
            value={inputValue}
            onChange={handleInputChange}
            disabled={currentLoading || !!editingMessageId}
            className="flex-grow text-base"
            aria-label="Entrée utilisateur pour description du processus"
          />
          <Button type="submit" disabled={currentLoading || inputValue.trim() === '' || !!editingMessageId} aria-label="Envoyer message">
            {currentLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            <span className="ml-2 hidden sm:inline">Envoyer</span>
          </Button>
          <Button variant="outline" type="button" onClick={handleDownloadXML} disabled={!lastGeneratedXml || currentLoading || !!editingMessageId} aria-label="Télécharger XML BPMN">
            <Download className="h-5 w-5" />
            <span className="ml-2 hidden sm:inline">BPMN</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
