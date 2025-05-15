
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSavedBpmnList, deleteBpmnDiagramById, type SavedBpmnDiagram, updateBpmnDiagramTitle } from '@/lib/bpmn-storage';
import BpmnLocalViewer from '@/components/bpmn/bpmn-local-viewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Trash2, Edit3, Eye, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

export default function SavedBpmnPage() {
  const [savedDiagrams, setSavedDiagrams] = useState<SavedBpmnDiagram[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState<SavedBpmnDiagram | null>(null);
  const [editingDiagram, setEditingDiagram] = useState<SavedBpmnDiagram | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const { toast } = useToast();

  const loadDiagrams = useCallback(() => {
    setSavedDiagrams(getSavedBpmnList());
  }, []);

  useEffect(() => {
    loadDiagrams();
  }, [loadDiagrams]);

  const handleSelectDiagram = (diagram: SavedBpmnDiagram) => {
    setSelectedDiagram(diagram);
  };

  const handleDeleteDiagram = (id: string) => {
    deleteBpmnDiagramById(id);
    loadDiagrams();
    if (selectedDiagram?.id === id) {
      setSelectedDiagram(null);
    }
    toast({ title: "Succès", description: "Diagramme supprimé." });
  };

  const handleEditTitle = (diagram: SavedBpmnDiagram) => {
    setEditingDiagram(diagram);
    setNewTitle(diagram.title);
  };

  const handleSaveTitle = () => {
    if (editingDiagram && newTitle.trim()) {
      updateBpmnDiagramTitle(editingDiagram.id, newTitle);
      loadDiagrams();
      if (selectedDiagram?.id === editingDiagram.id) {
        setSelectedDiagram(prev => prev ? {...prev, title: newTitle} : null);
      }
      toast({ title: "Succès", description: "Titre du diagramme mis à jour."});
    }
    setEditingDiagram(null);
    setNewTitle('');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)]">
      <aside className="w-full md:w-1/3 lg:w-1/4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>BPMN Sauvegardés</CardTitle>
            <CardDescription>Vos diagrammes BPMN enregistrés localement.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            <ScrollArea className="h-full p-4">
              {savedDiagrams.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Aucun diagramme sauvegardé.</p>
              ) : (
                <ul className="space-y-3">
                  {savedDiagrams.map((diagram) => (
                    <li key={diagram.id}>
                      <Card 
                        className={`hover:shadow-md transition-shadow cursor-pointer ${selectedDiagram?.id === diagram.id ? 'border-primary ring-2 ring-primary' : ''}`}
                        onClick={() => handleSelectDiagram(diagram)}
                      >
                        <CardHeader className="pb-2 pt-3 px-3">
                          <CardTitle className="text-base truncate" title={diagram.title}>
                            {diagram.title}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            Sauvegardé le : {format(new Date(diagram.savedAt), 'dd MMM yyyy, HH:mm', { locale: fr })}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="px-3 pb-3 pt-1 flex justify-end gap-2">
                           <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleSelectDiagram(diagram); }} title="Voir ce diagramme">
                              <Eye className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEditTitle(diagram);}} title="Modifier le titre">
                              <Edit3 className="h-4 w-4" />
                           </Button>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => e.stopPropagation()} title="Supprimer ce diagramme">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce diagramme ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible et supprimera "{diagram.title}" de votre stockage local.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDiagram(diagram.id)} className="bg-destructive hover:bg-destructive/90">
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </CardFooter>
                      </Card>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

      <main className="flex-1 flex flex-col">
        {editingDiagram && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Modifier le titre du diagramme</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 items-center">
              <Input 
                value={newTitle} 
                onChange={(e) => setNewTitle(e.target.value)} 
                placeholder="Nouveau titre"
                className="flex-grow"
              />
              <Button onClick={handleSaveTitle}>Sauvegarder</Button>
              <Button variant="outline" onClick={() => setEditingDiagram(null)}>Annuler</Button>
            </CardContent>
          </Card>
        )}
        <Card className="flex-grow flex flex-col">
          <CardHeader className="flex-row justify-between items-center">
            <div>
              <CardTitle>{selectedDiagram ? `Prévisualisation : ${selectedDiagram.title}` : "Aucun diagramme sélectionné"}</CardTitle>
              {selectedDiagram && <CardDescription>Modèle BPMN chargé.</CardDescription>}
            </div>
            {selectedDiagram && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedDiagram(null)} title="Fermer la prévisualisation">
                <XCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-grow p-0 md:p-0 relative">
            {/* The viewer needs specific height, often set on its container or itself */}
            <div className="w-full h-full min-h-[300px] md:min-h-0">
              <BpmnLocalViewer xml={selectedDiagram?.xml || null} className="w-full h-full" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
