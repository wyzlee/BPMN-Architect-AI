
'use client';

import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/NavigatedViewer'; // Use NavigatedViewer for zoom/pan capabilities
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BpmnViewerProps {
  xml: string;
  className?: string;
}

const BpmnViewer: React.FC<BpmnViewerProps> = ({ xml, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnViewerRef = useRef<BpmnJS | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    // Ensure we only initialize once or clean up previous instances
    if (bpmnViewerRef.current) {
      bpmnViewerRef.current.destroy();
    }
    
    const viewer = new BpmnJS({
      container: containerRef.current,
      height: '100%', // Ensure viewer takes full height of its container
      width: '100%',
    });
    bpmnViewerRef.current = viewer;

    const displayDiagram = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!xml) {
          // setError("Aucun XML BPMN à afficher.");
          // Clear canvas if XML is empty
          if (bpmnViewerRef.current) {
            await bpmnViewerRef.current.clear();
          }
          setIsLoading(false);
          return;
        }
        const result = await viewer.importXML(xml);
        const { warnings } = result;
        if (warnings && warnings.length) {
          console.warn('BPMN Viewer Warnings:', warnings);
          // Optionally display warnings to the user, for now just log
        }
        // Zoom to fit diagram
        const canvas = viewer.get('canvas') as any; // Type assertion for canvas
        if (canvas) {
           canvas.zoom('fit-viewport', 'auto');
        }
      } catch (err) {
        console.error('Error importing BPMN XML:', err);
        setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue lors du chargement du diagramme BPMN.');
      } finally {
        setIsLoading(false);
      }
    };

    displayDiagram();

    return () => {
      if (bpmnViewerRef.current) {
        bpmnViewerRef.current.destroy();
        bpmnViewerRef.current = null;
      }
    };
  }, [xml]); // Re-run effect if XML changes

  if (isLoading) {
    return <div className={cn("p-4 text-center min-h-[300px] flex items-center justify-center", className)}>Chargement du diagramme...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className={cn("my-4", className)}>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erreur d'affichage BPMN</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!xml && !isLoading && !error) {
     return (
      <div className={cn("p-4 text-center text-muted-foreground min-h-[300px] flex items-center justify-center", className)}>
        Aucun diagramme BPMN à afficher. Le XML est vide.
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={cn("bpmn-viewer-container w-full h-[400px] md:h-[500px] border rounded-md bg-background shadow-sm", className)}
      style={{ minHeight: '300px' }} // Ensure a minimum height
    />
  );
};

export default BpmnViewer;
