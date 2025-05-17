
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Download, Loader2, CheckCircle, XCircle, Wand2, ListChecks, ShieldAlert, FileCheck2, Save, Settings } from 'lucide-react';
import { 
  getGeneratedAndValidatedBPMNXml, 
  getRefinedInstructions, 
  getCorrectedAndValidatedBPMNXml,
  // getAndValidateBPMNXml // Ensure this is imported if you re-enabled direct XML input
} from './actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import type { ValidateBPMNXmlOutput } from '@/ai/flows/validate-bpmn-xml-flow';
import { examplePrompts } from '@/lib/bpmn-examples';
import { saveBpmnDiagram as saveDiagramToStorage } from '@/lib/bpmn-storage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ModelSelector } from '@/components/model-selector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; 


interface ActionButton {
  id: string;
  label: string;
  onClick: () => void;
  variant?: ButtonProps['variant'];
  Icon?: React.ElementType;
  disabled?: boolean;
  tooltip?: string;
}
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  isXML?: boolean;
  validationResult?: ValidateBPMNXmlOutput;
  isRefinement?: boolean;
  refinedText?: string; 
  requiresConfirmation?: boolean;
  confirmationProcessed?: boolean; 
  originalUserInput?: string; 
  actionButtons?: ActionButton[];
  isCorrectionAttempt?: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-ai-message',
      text: "Bonjour ! Décrivez le processus que vous souhaitez modéliser ou choisissez un exemple. Je vais d'abord raffiner votre description en instructions détaillées, puis vous pourrez générer et valider le XML BPMN.",
      sender: 'ai',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoadingRefinement, setIsLoadingRefinement] = useState(false);
  const [isLoadingBpmn, setIsLoadingBpmn] = useState(false);
  const [isLoadingCorrection, setIsLoadingCorrection] = useState(false);
  const [editingRefinedText, setEditingRefinedText] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('');


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
  
  const handleSaveCurrentXML = (xmlContent: string, currentTitle?: string) => {
    const title = window.prompt("Entrez un titre pour ce diagramme BPMN :", currentTitle || `Diagramme ${new Date().toLocaleDateString()}`);
    if (title === null) return; // User cancelled
    try {
      saveDiagramToStorage(xmlContent, title);
      toast({ title: "Sauvegarde Réussie", description: `Diagramme "${title}" sauvegardé localement.` });
    } catch (error) {
      console.error("Error saving BPMN to localStorage:", error);
      toast({ title: "Erreur de Sauvegarde", description: (error instanceof Error ? error.message : "Impossible de sauvegarder le diagramme."), variant: "destructive" });
    }
  };
  
  const generateActionButtonsForXml = (messageId: string, xmlContent: string, validation: ValidateBPMNXmlOutput | undefined): ActionButton[] => {
    const buttons: ActionButton[] = [
      { 
        id: `download-${messageId}`, 
        label: 'Télécharger BPMN', 
        onClick: () => handleDownloadSpecificXML(xmlContent), 
        Icon: Download, 
        variant: 'outline', // Changed from default to outline
        tooltip: 'Télécharger ce XML BPMN' 
      },
      { 
        id: `save-${messageId}`, 
        label: 'Sauvegarder Localement', 
        onClick: () => handleSaveCurrentXML(xmlContent), 
        Icon: Save, 
        variant: 'default', 
        tooltip: 'Sauvegarder ce diagramme BPMN dans votre navigateur' 
      },
    ];
    if (validation && !validation.isValid && validation.issues && validation.issues.length > 0) {
      buttons.push({ 
        id: `correct-${messageId}`, 
        label: 'Tenter Correction IA', 
        onClick: () => handleAttemptCorrection(messageId, xmlContent, validation.issues || []), 
        Icon: ShieldAlert, 
        variant: 'destructive',
        tooltip: "Demander à l'IA de corriger les erreurs de validation"
      });
    }
    return buttons;
  };


  const processMessageForBPMN = useCallback(async (messageId: string, instructions: string) => {
    setIsLoadingBpmn(true);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, confirmationProcessed: true, actionButtons: undefined } : m));

    const generatingMessage: Message = {
      id: Date.now().toString() + '-ai-generating',
      text: "Génération et validation du XML BPMN en cours...",
      sender: 'ai',
    };
    setMessages(prev => [...prev, generatingMessage]);
    
    try {
      // Pass the selected model ID to the server action
      const result = await getGeneratedAndValidatedBPMNXml(instructions, selectedModelId);
      setMessages(prev => prev.filter(m => m.id !== generatingMessage.id)); 

      if (result.error) throw new Error(result.error);

      if (result.bpmnXml) {
        const newXmlMessageId = Date.now().toString() + '-ai-xml';
        const newAIMessage: Message = {
          id: newXmlMessageId,
          text: result.bpmnXml,
          sender: 'ai',
          isXML: true,
          validationResult: result.validation,
          actionButtons: generateActionButtonsForXml(newXmlMessageId, result.bpmnXml, result.validation),
        };
        setMessages(prev => [...prev, newAIMessage]);
      } else {
        const noXmlMessage: Message = {
          id: Date.now().toString() + '-ai-empty',
          text: "Je n'ai pas pu générer de XML BPMN à partir des instructions fournies.",
          sender: 'ai',
        };
        setMessages(prev => [...prev, noXmlMessage]);
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== generatingMessage.id)); 
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de la génération ou validation BPMN.";
      const newAIErrorMessage: Message = {
        id: Date.now().toString() + '-ai-error-bpmn',
        text: `Erreur lors de la génération/validation BPMN : ${errorMessage}`,
        sender: 'ai',
      };
      setMessages(prev => [...prev, newAIErrorMessage]);
      toast({ title: "Erreur de Génération/Validation BPMN", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingBpmn(false);
    }
  }, [toast]); // Removed generateActionButtonsForXml from dependencies as it's defined outside or can be memoized if needed

  const handleAttemptCorrection = useCallback(async (messageId: string, originalXml: string, issues: string[]) => {
    setIsLoadingCorrection(true);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, actionButtons: m.actionButtons?.map(b => b.id === `correct-${messageId}` ? {...b, disabled: true} : b) } : m));
    
    const correctingMessage: Message = {
      id: Date.now().toString() + '-ai-correcting',
      text: "Tentative de correction du XML BPMN par l'IA en cours...",
      sender: 'ai',
      isCorrectionAttempt: true,
    };
    setMessages(prev => [...prev, correctingMessage]);
    
    try {
      // Pass the selected model ID to the server action
      const result = await getCorrectedAndValidatedBPMNXml(originalXml, issues, selectedModelId);
      setMessages(prev => prev.filter(m => m.id !== correctingMessage.id)); 

      if (result.error) throw new Error(result.error);

      if (result.correctedBpmnXml) {
        const correctedXmlMessageId = Date.now().toString() + '-ai-corrected-xml';
        const newCorrectedMessage: Message = {
          id: correctedXmlMessageId,
          text: result.correctedBpmnXml, 
          sender: 'ai',
          isXML: true,
          validationResult: result.validation,
          actionButtons: generateActionButtonsForXml(correctedXmlMessageId, result.correctedBpmnXml, result.validation),
          isCorrectionAttempt: true,
        };
        setMessages(prev => [...prev, newCorrectedMessage]);
         toast({ title: "Correction Tentée par l'IA", description: "L'IA a tenté de corriger le XML. Veuillez vérifier le nouveau résultat et sa validation.", variant: "default" });
      } else {
         const noCorrectionMessage: Message = {
          id: Date.now().toString() + '-ai-no-correction',
          text: "L'IA n'a pas pu fournir de correction pour le XML BPMN.",
          sender: 'ai',
          isCorrectionAttempt: true,
        };
        setMessages(prev => [...prev, noCorrectionMessage]);
      }

    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== correctingMessage.id));
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de la tentative de correction.";
      const newAIErrorCorrectionMessage: Message = {
        id: Date.now().toString() + '-ai-error-correction',
        text: `Erreur lors de la tentative de correction BPMN par l'IA : ${errorMessage}`,
        sender: 'ai',
        isCorrectionAttempt: true,
      };
      setMessages(prev => [...prev, newAIErrorCorrectionMessage]);
      toast({ title: "Erreur de Correction BPMN", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoadingCorrection(false);
       setMessages(prev => prev.map(m => m.id === messageId ? { ...m, actionButtons: m.actionButtons?.map(b => b.id === `correct-${messageId}` ? {...b, disabled: false} : b) } : m));
    }
  }, [toast]); // Removed generateActionButtonsForXml

  const handleEditInstructions = (messageId: string, currentInstructions: string) => {
    setEditingMessageId(messageId);
    setEditingRefinedText(currentInstructions);
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, confirmationProcessed: true, actionButtons: undefined } : m));
  };

  const handleSaveEditedInstructions = async () => {
    if (editingMessageId && editingRefinedText) {
      const editedMarkerMessage: Message = {
        id: Date.now().toString() + '-user-edited',
        text: "J'ai modifié les instructions. Voici la nouvelle version :",
        sender: 'user',
      };
      const newRefinedMessageId = editingMessageId + '-edited-' + Date.now();
      const newRefinedMessage: Message = {
        id: newRefinedMessageId,
        text: editingRefinedText,
        sender: 'ai', 
        isRefinement: true,
        refinedText: editingRefinedText,
        requiresConfirmation: true,
        confirmationProcessed: false,
        originalUserInput: messages.find(m => m.id === editingMessageId)?.originalUserInput || "N/A",
        actionButtons: [
          { id: 'generate-' + newRefinedMessageId, label: 'Générer BPMN', onClick: () => processMessageForBPMN(newRefinedMessageId, editingRefinedText!), Icon: FileCheck2, variant: 'default', tooltip: "Générer le XML BPMN avec ces instructions" },
          { id: 'edit-' + newRefinedMessageId, label: 'Modifier', onClick: () => handleEditInstructions(newRefinedMessageId, editingRefinedText!), Icon: Wand2, variant: 'outline', tooltip: "Modifier à nouveau ces instructions" },
          { id: 'cancel-' + newRefinedMessageId, label: 'Annuler', onClick: () => setMessages(prev => prev.map(m => m.id === newRefinedMessageId ? { ...m, confirmationProcessed: true, actionButtons: undefined, text: "Génération annulée pour ces instructions modifiées." } : m)), Icon: XCircle, variant: 'ghost', tooltip: "Annuler cette étape de génération" },
        ]
      };
      setMessages(prev => [...prev, editedMarkerMessage, newRefinedMessage]);
      setEditingMessageId(null);
      setEditingRefinedText(null);
    }
  };

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement> | string) => {
    if (typeof event !== 'string' && event) event.preventDefault();
    
    const currentInput = typeof event === 'string' ? event : inputValue;

    if (currentInput.trim() === '' || isLoadingRefinement || isLoadingBpmn || isLoadingCorrection) {
        if(currentInput.trim() === '') toast({ title: "Entrée vide", description: "Veuillez entrer une description pour votre processus.", variant: "destructive" });
        return;
    }
    if (currentInput.trim().length < 10) {
      toast({ title: "Entrée trop courte", description: "Veuillez fournir une description plus détaillée (au moins 10 caractères).", variant: "destructive" });
      return;
    }


    const rawUserInput = currentInput;
    const newUserMessage: Message = {
      id: Date.now().toString() + '-user-raw',
      text: rawUserInput,
      sender: 'user',
    };
    setMessages(prev => [...prev, newUserMessage]);
    if (typeof event !== 'string') setInputValue('');
    setIsLoadingRefinement(true);

    const refiningMessage: Message = {
      id: Date.now().toString() + '-ai-refining',
      text: "Raffinement de votre description en cours...",
      sender: 'ai',
    };
    setMessages(prev => [...prev, refiningMessage]);

    try {
      // Pass the selected model ID to the server action
      const result = await getRefinedInstructions(rawUserInput, selectedModelId);
      setMessages(prev => prev.filter(m => m.id !== refiningMessage.id)); 

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
            { id: 'generate-' + refinedMessageId, label: 'Générer BPMN', onClick: () => processMessageForBPMN(refinedMessageId, result.refinedInstructions!), Icon: FileCheck2, variant: 'default', tooltip: "Générer le XML BPMN avec ces instructions" },
            { id: 'edit-' + refinedMessageId, label: 'Modifier', onClick: () => handleEditInstructions(refinedMessageId, result.refinedInstructions!), Icon: Wand2, variant: 'outline', tooltip: "Modifier ces instructions avant génération" },
            { id: 'cancel-' + refinedMessageId, label: 'Annuler', onClick: () => setMessages(prev => prev.map(m => m.id === refinedMessageId ? { ...m, confirmationProcessed: true, actionButtons: undefined, text: "Génération annulée pour ces instructions." } : m)), Icon: XCircle, variant: 'ghost', tooltip: "Annuler cette étape de génération" },
          ]
        };
        setMessages(prev => [...prev, newAIRefinedMessage]);
      } else {
        throw new Error("L'IA n'a pas pu raffiner les instructions. Vérifiez le prompt de raffinement ou réessayez.");
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== refiningMessage.id)); 
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
  
  const handleDownloadSpecificXML = (xmlContent: string) => {
    if (!xmlContent) {
      toast({ title: "Aucun XML à télécharger", description: "Le contenu XML est vide.", variant: "destructive" });
      return;
    }
    const blob = new Blob([xmlContent], { type: 'application/bpmn+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bpmn_model_${Date.now()}.bpmn`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Téléchargement réussi", description: "Fichier BPMN (.bpmn) téléchargé." });
  };
  
  const currentLoading = isLoadingRefinement || isLoadingBpmn || isLoadingCorrection;

  return (
    <div className="flex flex-col flex-grow h-full bg-card border rounded-lg shadow-sm overflow-hidden">
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
                {msg.isXML && msg.text && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm text-gray-200">
                        {msg.isCorrectionAttempt ? "Tentative de Correction BPMN par l'IA" : "Résultat de la Génération BPMN"}
                      </h4>
                    </div>
                    <details className="max-h-64 overflow-y-auto">
                      <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-200">Voir/Cacher XML {msg.isCorrectionAttempt ? "Corrigé" : "Généré"}</summary>
                      <pre className="mt-1 text-xs whitespace-pre-wrap font-mono bg-transparent p-0 m-0"><code className="language-xml">{msg.text}</code></pre>
                    </details>
                    {msg.validationResult && (
                      <div className={cn(
                        "mt-3 pt-3 border-t",
                        msg.validationResult.isValid ? "border-green-700/50" : "border-red-700/50"
                      )}>
                        <h5 className={cn(
                          "text-sm font-semibold mb-1 flex items-center",
                          msg.validationResult.isValid ? "text-green-400" : "text-red-400"
                        )}>
                          {msg.validationResult.isValid ? <CheckCircle className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                          Résultat Validation: {msg.validationResult.isValid ? 
                            <span className="text-green-400 ml-1">Valide</span> : 
                            <span className="text-red-400 ml-1">Invalide</span>
                          }
                        </h5>
                        {msg.validationResult.summary && (
                             <p className="text-xs text-gray-400 mb-1 italic">{msg.validationResult.summary}</p>
                        )}
                        {msg.validationResult.issues && msg.validationResult.issues.length > 0 ? (
                          <ul className="list-disc list-inside text-xs space-y-0.5 text-gray-300 max-h-40 overflow-y-auto">
                            {msg.validationResult.issues.map((issue, index) => (
                              <li key={index} 
                                className={cn(
                                  issue.toLowerCase().includes("error:") ? "text-red-400" : 
                                  issue.toLowerCase().includes("warning:") ? "text-yellow-400" : 
                                  "text-gray-300"
                                )}
                              >
                                {issue}
                              </li>
                            ))}
                          </ul>
                        ) : (
                           msg.validationResult.isValid && <p className="text-xs text-green-400">Aucun problème spécifique signalé.</p>
                        )}
                      </div>
                    )}
                    {msg.actionButtons && msg.actionButtons.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50 flex flex-wrap gap-2">
                        {msg.actionButtons.map(btn => (
                          <Button key={btn.id} variant={btn.variant || 'default'} size="sm" onClick={btn.onClick} disabled={currentLoading || btn.disabled} title={btn.tooltip}>
                            {btn.Icon && <btn.Icon className="mr-2 h-4 w-4" />}
                            {btn.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {!msg.isXML && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                {msg.requiresConfirmation && !msg.confirmationProcessed && msg.actionButtons && (
                  <div className="mt-3 pt-3 border-t border-accent/20 flex flex-wrap gap-2">
                    {msg.actionButtons.map(btn => (
                       <Button key={btn.id} variant={btn.variant || 'default'} size="sm" onClick={btn.onClick} disabled={currentLoading || btn.disabled} title={btn.tooltip}>
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
          {(isLoadingRefinement || isLoadingBpmn || isLoadingCorrection) && (
            <div className="flex items-center space-x-2 justify-start">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src="https://picsum.photos/seed/ai-avatar/40/40" data-ai-hint="robot thinking" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="p-3 rounded-xl shadow bg-muted text-muted-foreground rounded-bl-none flex items-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                 <span className="ml-2 text-sm">
                  {isLoadingRefinement ? "Raffinement en cours..." : isLoadingBpmn ? "Génération &amp; Validation BPMN..." : "Tentative de correction..."}
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

      <form onSubmit={e => handleSendMessage(e)} className="p-4 border-t bg-background">
        <div className="flex flex-col space-y-2">
          {/* Model Selector */}
          <div className="flex items-center justify-between">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span>Modèle IA</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium">Sélectionner un modèle d'IA</h4>
                  <p className="text-sm text-muted-foreground">Choisissez le modèle d'IA à utiliser pour la génération de BPMN</p>
                  <ModelSelector 
                    onModelChange={setSelectedModelId} 
                    defaultModelId={selectedModelId} 
                  />
                </div>
              </PopoverContent>
            </Popover>
            
            {selectedModelId && (
              <p className="text-xs text-muted-foreground">
                Modèle actuel: <span className="font-mono">{selectedModelId.split('/')[1]}</span>
              </p>
            )}
          </div>
          
          {/* Input and Send */}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" disabled={currentLoading || !!editingMessageId} aria-label="Choisir un exemple">
                  <ListChecks className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {examplePrompts.map((ex) => (
                  <DropdownMenuItem key={ex.id} onClick={() => handleSendMessage(ex.prompt)}>
                    {ex.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="submit" disabled={currentLoading || inputValue.trim() === '' || !!editingMessageId} aria-label="Envoyer message">
              {currentLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="ml-2 hidden sm:inline">Envoyer</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

