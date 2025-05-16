
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BpmnVisualization, FitType } from 'bpmn-visualization';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info, Code, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface BpmnLocalViewerProps {
  xml: string | null; // Allow null for when no diagram is selected
  className?: string;
}

const BpmnLocalViewer: React.FC<BpmnLocalViewerProps> = ({ xml, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnVisualizationRef = useRef<BpmnVisualization | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'xml'>('view');
  const [copied, setCopied] = useState(false);

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

    if (xml?.trim()) {
      setIsLoading(true);
      setError(null);
      // Use a timeout to ensure the container is fully rendered and sized
      setTimeout(() => {
        if (!containerRef.current) { // Double check ref
             setIsLoading(false);
             return;
        }
        try {
          console.log(`Loading XML into bpmn-visualization: ${xml.substring(0, 100)}...`);
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
        if (viewer) {
          viewer.load(emptyDiagramXml, { fit: { type: FitType.None } });
        }
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
  
  // Format XML for display
  const formatXml = (xmlContent: string | null): string => {
    if (!xmlContent) return '';
    try {
      // Basic XML formatting (add indentation)
      const PADDING = ' '.repeat(2);
      const reg = /(>)(<)(\/*)/g;
      let pad = 0;
      
      // Add line breaks and indentation
      const formattedXml = xmlContent.replace(reg, '$1\r\n$2$3');
      
      return formattedXml.split('\r\n').map((node) => {
        let indent = 0;
        if (node.match(/.+<\/\w[^>]*>$/)) {
          indent = 0;
        } else if (node.match(/^<\/\w/)) {
          if (pad !== 0) {
            pad -= 1;
          }
        } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
          indent = 1;
        } else {
          indent = 0;
        }
        
        const padding = PADDING.repeat(pad);
        pad += indent;
        
        return `${padding}${node}`;
      }).join('\r\n');
    } catch (e) {
      return xmlContent; // Return original if formatting fails
    }
  };

  const copyToClipboard = () => {
    if (!xml) return;
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!xml && !isLoading && !error) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground min-h-[300px] flex flex-col items-center justify-center border border-dashed rounded-md bg-muted/20", className)}>
        <Info className="h-10 w-10 mb-3 text-muted-foreground/70"/>
        <p>Aucun diagramme sélectionné.</p>
        <p className="text-xs">Veuillez sélectionner un diagramme dans la liste pour le prévisualiser ici.</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'view' | 'xml')}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="flex justify-between items-center border-b px-4">
          <TabsList className="bg-transparent p-0 h-auto">
            <TabsTrigger value="view" className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Vue graphique
            </TabsTrigger>
            <TabsTrigger value="xml" className="flex items-center gap-2">
              <Code className="h-4 w-4" /> Code XML
            </TabsTrigger>
          </TabsList>
          {activeTab === 'xml' && xml && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className="h-8 text-xs"
            >
              {copied ? 'Copié !' : 'Copier le XML'}
            </Button>
          )}
        </div>
        
        <TabsContent value="view" className="flex-1 min-h-0">
          <div 
            ref={containerRef} 
            className="w-full h-full min-h-[400px] overflow-hidden"
          />
        </TabsContent>
        
        <TabsContent value="xml" className="flex-1 min-h-0 overflow-auto">
          {xml ? (
            <pre className="p-4 bg-muted/50 rounded-md text-sm h-full overflow-auto">
              <code className="whitespace-pre-wrap">
                {formatXml(xml)}
              </code>
            </pre>
          ) : (
            <div className="p-4 text-muted-foreground text-center">
              Aucun contenu XML à afficher
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BpmnLocalViewer;
