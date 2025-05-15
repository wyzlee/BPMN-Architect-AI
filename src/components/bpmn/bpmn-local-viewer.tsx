
'use client';

import React, { useEffect, useRef } from 'react';
import { BpmnVisualization, FitType } from 'bpmn-visualization';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info } from 'lucide-react';

interface BpmnLocalViewerProps {
  xml: string | null; // Allow null for when no diagram is selected
  className?: string;
}

const BpmnLocalViewer: React.FC<BpmnLocalViewerProps> = ({ xml, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnVisualizationRef = useRef<BpmnVisualization | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      console.warn("BPMN Local Viewer: Container ref not available yet.");
      return;
    }
    
    // Initialize BpmnVisualization instance only once
    if (!bpmnVisualizationRef.current) {
        try {
            bpmnVisualizationRef.current = new BpmnVisualization({ 
                container: containerRef.current,
                navigation: { enabled: true } // Enable pan and zoom
            });
        } catch (initError) {
            console.error("Failed to initialize BpmnVisualization:", initError);
            setError(initError instanceof Error ? initError.message : "Failed to initialize BPMN viewer.");
            return;
        }
    }

    const viewer = bpmnVisualizationRef.current;

    if (xml && xml.trim()) {
      setIsLoading(true);
      setError(null);
      // Use a timeout to ensure the container is fully rendered and sized
      setTimeout(() => {
        if (!containerRef.current) { // Double check ref
             setIsLoading(false);
             return;
        }
        try {
          console.log("Loading XML into bpmn-visualization:", xml.substring(0,100) + "...");
          viewer.load(xml, { fit: { type: FitType.Center, margin: 20 } });
        } catch (err) {
          console.error('Error loading BPMN XML with bpmn-visualization:', err);
          setError(err instanceof Error ? err.message : 'Failed to load BPMN diagram.');
        } finally {
          setIsLoading(false);
        }
      }, 0); // Small delay can sometimes help with layout issues
    } else {
      // Clear canvas if XML is null or empty
      setError(null);
      setIsLoading(false);
      try {
        // Load a minimal valid empty diagram to clear the view
        const emptyDiagramXml = '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn:process id="Process_1" isExecutable="false"/><bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1"/></bpmndi:BPMNDiagram></bpmn:definitions>';
        viewer.load(emptyDiagramXml, { fit: { type: FitType.None } });
      } catch (e) {
        console.warn("Could not clear bpmn-visualization canvas:", e);
      }
    }
  }, [xml]); // Rerun effect if XML changes

  if (isLoading) {
    return (
        <div className={cn("p-4 text-center min-h-[300px] flex items-center justify-center bg-muted/20 rounded-md", className)}>
            Chargement du diagramme...
        </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={cn("my-4 mx-auto max-w-md", className)}>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Erreur d'affichage BPMN</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!xml && !isLoading && !error) {
     return (
      <div className={cn("p-4 text-center text-muted-foreground min-h-[300px] flex flex-col items-center justify-center border border-dashed rounded-md bg-muted/20", className)}>
        <Info className="h-10 w-10 mb-3 text-muted-foreground/70"/>
        <p>Aucun diagramme sélectionné.</p>
        <p className="text-xs">Veuillez sélectionner un diagramme dans la liste pour le prévisualiser ici.</p>
      </div>
    );
  }

  // The container for bpmn-visualization. It must have a defined size.
  return (
    <div 
      ref={containerRef} 
      className={cn(
        "bpmn-local-viewer-container w-full h-full border rounded-md bg-background shadow-sm overflow-hidden",
        className
      )}
      style={{ minHeight: '300px' }} // Ensure a minimum height, actual height comes from parent normally
    />
  );
};

export default BpmnLocalViewer;
