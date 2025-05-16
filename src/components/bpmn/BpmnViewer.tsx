'use client';

import { useEffect, useRef, useState } from 'react';
// @ts-ignore - bpmn-visualization types are not properly exported
import { BpmnVisualization, FitType } from 'bpmn-visualization';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Info, Code, Eye, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogTitle } from '@/components/ui/dialog';

interface BpmnViewerProps {
  xml: string | null;
  className?: string;
}

const BpmnViewer: React.FC<BpmnViewerProps> = ({ xml, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bpmnVisualizationRef = useRef<BpmnVisualization | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenBpmnVisualizationRef = useRef<BpmnVisualization | null>(null);
  const containerIdRef = useRef<string>('');
  const fullscreenContainerIdRef = useRef<string>('fs-bpmn-container');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'xml'>('view');
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  // Utiliser un ID fixe pour le conteneur
  useEffect(() => {
    // Utiliser l'ID fixe défini dans le HTML
    containerIdRef.current = 'bpmn-container';
    setIsMounted(true);
  }, []);

  // Handle container reference and ID assignment
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;
    
    // Initialisation avec un délai pour s'assurer que le DOM est prêt
    const initTimer = setTimeout(() => {
      try {
        console.log('Initializing BPMN Visualization with fixed container ID: bpmn-container');
        console.log('Container element exists:', !!document.getElementById('bpmn-container'));
        
        // Vérifier que le conteneur existe dans le DOM
        if (!document.getElementById('bpmn-container')) {
          console.error('Container with ID bpmn-container not found in DOM');
          return;
        }
        
        // Initialize BpmnVisualization instance exactly as in the documentation
        if (!bpmnVisualizationRef.current) {
          // IMPORTANT: Use the string ID, not the DOM element reference
          bpmnVisualizationRef.current = new BpmnVisualization({ 
            container: containerIdRef.current,
            navigation: { 
              enabled: true
            }
          });
          
          // Initialiser le niveau de zoom
          setZoomLevel(1);
          
          console.log('BpmnVisualization instance created successfully');
          
          // Charger immédiatement le XML si disponible et valide
          if (xml?.trim() && xml.includes('<bpmn')) {
            console.log('Loading XML immediately after initialization');
            bpmnVisualizationRef.current.load(xml);
          }
        }
      } catch (initError) {
        console.error("Failed to initialize BpmnVisualization:", initError);
        setError(initError instanceof Error ? initError.message : "Failed to initialize BPMN viewer.");
      }
    }, 500); // Délai de 500ms pour s'assurer que le DOM est prêt
    
    // Cleanup function
    return () => {
      clearTimeout(initTimer);
      if (bpmnVisualizationRef.current) {
        try {
          // Ne pas essayer de charger un XML vide, cela cause des erreurs
          // Au lieu de cela, on nettoie directement le conteneur
          const container = document.getElementById(containerIdRef.current);
          if (container) {
            container.innerHTML = '';
          }
        } catch (e) {
          console.error("Error cleaning up BPMN viewer:", e);
        } finally {
          bpmnVisualizationRef.current = null;
        }
      }
    };
  }, [isMounted, xml]);

  // Load BPMN content when xml prop changes - mais seulement si ce n'est pas déjà chargé par l'initialisation
  useEffect(() => {
    // On saute cette étape si l'initialisation a déjà chargé le XML
    if (typeof window === 'undefined' || !xml || !isMounted) return;
    
    // On attend un peu pour s'assurer que l'initialisation a eu le temps de se faire
    const loadTimer = setTimeout(() => {
      // Vérifier à nouveau que le viewer existe
      if (!bpmnVisualizationRef.current) {
        console.log('Viewer not initialized yet, cannot load XML');
        return;
      }
      
      console.log('Loading XML content into BPMN viewer (delayed load)');
      const viewer = bpmnVisualizationRef.current;
      
      // Load and render the BPMN diagram exactly as in the documentation
      try {
        // Vérifier que le XML est valide avant de le charger
        if (!xml || !xml.trim() || !xml.includes('<bpmn')) {
          console.error("Invalid or empty BPMN XML content");
          setError("Le contenu XML BPMN semble invalide ou vide");
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        // Simple load without options first to ensure compatibility
        viewer.load(xml);
        console.log('XML loaded successfully (delayed load)');
        setError(null);
      } catch (loadError) {
        console.error("Error loading BPMN content:", loadError);
        setError(loadError instanceof Error ? loadError.message : "Failed to load BPMN content.");
      } finally {
        setIsLoading(false);
      }
    }, 1000); // Délai plus long pour s'assurer que l'initialisation est terminée
    
    return () => {
      clearTimeout(loadTimer);
    };
  }, [xml, isMounted]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'view' | 'xml');
    
    // Recharger le diagramme BPMN lorsqu'on revient à l'onglet de visualisation
    if (value === 'view' && xml) {
      // Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
      requestAnimationFrame(() => {
        // Petit délai pour s'assurer que l'onglet est bien affiché
        setTimeout(() => {
          if (bpmnVisualizationRef.current) {
            try {
              console.log('Rechargement du diagramme après changement d\'onglet');
              // Vérifier que le XML est valide avant de le charger
              if (!xml || !xml.trim() || !xml.includes('<bpmn')) {
                console.error("Invalid or empty BPMN XML content when switching tabs");
                return;
              }
              
              // Sauvegarder la position de défilement
              const container = document.getElementById('bpmn-container');
              const scrollX = container?.scrollLeft || 0;
              const scrollY = container?.scrollTop || 0;
              
              // Recharger le diagramme
              bpmnVisualizationRef.current.load(xml);
              
              // Restaurer la position de défilement après un court délai
              setTimeout(() => {
                if (container) {
                  container.scrollTo(scrollX, scrollY);
                }
              }, 50);
            } catch (e) {
              console.error('Erreur lors du rechargement du diagramme:', e);
            }
          }
        }, 50);
      });
    }
  };

  // Format XML for display
  const formatXml = (xmlString: string): string => {
    if (typeof window === 'undefined') return xmlString;
    
    try {
      // Basic XML formatting (add indentation)
      const PADDING = ' '.repeat(2);
      const reg = /(>)(<)(\/*)/g;
      let pad = 0;
      
      // Add line breaks and indentation
      const formattedXml = xmlString.replace(reg, '$1\r\n$2$3');
      
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
      console.error("Error formatting XML:", e);
      return xmlString; // Return original if formatting fails
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = () => {
    if (!xml) return;
    
    navigator.clipboard.writeText(xml).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy XML to clipboard:', err);
    });
  };

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

  return (
    <div className={cn("w-full h-full flex flex-col relative", className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
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
              onClick={handleCopyToClipboard}
              className="h-8 text-xs"
            >
              {copied ? 'Copié !' : 'Copier le XML'}
            </Button>
          )}
        </div>
        
        <TabsContent value="view" className="flex-1 min-h-0 relative flex flex-col">
          <div className="flex-1 relative">
            <div 
              id="bpmn-container"
              ref={containerRef}
              className="bg-white rounded-md shadow-sm h-full w-full max-w-full"
              style={{ 
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'auto',
                overflowX: 'hidden',
                maxWidth: '100%'
              }}
            />
          </div>
          
          {/* Contrôles de zoom et plein écran - Horizontal et coloré */}
          <div className="sticky bottom-0 left-0 right-0 z-10 flex justify-center p-3 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-lg">
            <div className="flex gap-3 items-center">
              <Dialog 
                open={fullscreenOpen} 
                onOpenChange={(open) => {
                  setFullscreenOpen(open);
                  
                  // Chargement du diagramme dans le conteneur plein écran
                  if (open && xml) {
                    // Petit délai pour s'assurer que le modal est visible
                    setTimeout(() => {
                      try {
                        if (!fullscreenBpmnVisualizationRef.current) {
                          fullscreenBpmnVisualizationRef.current = new BpmnVisualization({
                            container: fullscreenContainerIdRef.current,
                            navigation: { enabled: true }
                          });
                        }
                        
                        // Charger le diagramme
                        if (xml?.trim() && xml.includes('<bpmn')) {
                          fullscreenBpmnVisualizationRef.current.load(xml);
                          
                          // Réinitialiser le zoom
                          const container = document.getElementById('fs-bpmn-container');
                          const diagram = container?.querySelector('svg');
                          if (diagram) {
                            setZoomLevel(1); // Reset zoom level for fullscreen view
                            diagram.style.transform = 'scale(1)';
                            diagram.style.transformOrigin = 'center center';
                          }
                        }
                      } catch (e) {
                        console.error('Erreur lors de la création de la visualisation plein écran:', e);
                      }
                    }, 100);
                  } else {
                    // Nettoyer la référence lors de la fermeture
                    if (fullscreenBpmnVisualizationRef.current) {
                      const container = document.getElementById('fs-bpmn-container');
                      if (container) {
                        container.innerHTML = '';
                      }
                      fullscreenBpmnVisualizationRef.current = null;
                    }
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button 
                    variant="default"
                    size="sm"
                    className="shadow-md bg-green-600 hover:bg-green-700 text-white font-medium"
                    title="Plein écran"
                  >
                    <Maximize2 size={16} className="mr-1" /> 
                    <span>Plein écran</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-screen h-screen max-w-none p-0 flex flex-col bg-white" style={{ margin: 0, borderRadius: 0, overflow: 'hidden' }}>
                  <div className="flex-shrink-0 flex justify-between items-center p-3 border-b bg-gray-50">
                    <DialogTitle className="text-lg font-medium text-gray-800">Visualisation plein écran</DialogTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{Math.round(zoomLevel * 100)}%</span>
                      <DialogClose asChild>
                        <Button 
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:bg-gray-200"
                          title="Fermer le plein écran"
                        >
                          <Minimize2 size={16} />
                        </Button>
                      </DialogClose>
                    </div>
                  </div>
                  <div className="flex-1 relative overflow-hidden">
                    <div 
                      id="fs-bpmn-container"
                      ref={fullscreenContainerRef}
                      className="absolute inset-0 bg-white max-w-full"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'auto',
                        overflowX: 'hidden',
                        padding: '1rem',
                        maxWidth: '100%'
                      }}
                    />
                    
                    {/* Contrôles de zoom en plein écran - Horizontal et coloré */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex justify-center gap-2 p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200">
                      <div className="flex gap-3 items-center">
                        <Button 
                          variant="default"
                          size="sm"
                          className="shadow-md bg-blue-500 hover:bg-blue-600 text-white font-medium"
                          onClick={() => {
                            const container = document.getElementById('fs-bpmn-container');
                            const diagram = container?.querySelector('svg');
                            if (diagram) {
                              const newZoom = Math.min(zoomLevel + 0.1, 2.0);
                              setZoomLevel(newZoom);
                              diagram.style.transform = `scale(${newZoom})`;
                              diagram.style.transformOrigin = 'center center';
                            }
                          }}
                          title="Zoom +"
                        >
                          <span className="text-lg">+</span>
                        </Button>
                        <Button 
                          variant="default"
                          size="sm"
                          className="shadow-md bg-blue-500 hover:bg-blue-600 text-white font-medium"
                          onClick={() => {
                            const container = document.getElementById('fs-bpmn-container');
                            const diagram = container?.querySelector('svg');
                            if (diagram) {
                              const newZoom = Math.max(zoomLevel - 0.1, 0.5);
                              setZoomLevel(newZoom);
                              diagram.style.transform = `scale(${newZoom})`;
                              diagram.style.transformOrigin = 'center center';
                            }
                          }}
                          title="Zoom -"
                        >
                          <span className="text-lg">-</span>
                        </Button>
                        <Button 
                          variant="default"
                          size="sm"
                          className="shadow-md bg-gray-500 hover:bg-gray-600 text-white font-medium"
                          onClick={() => {
                            const container = document.getElementById('fs-bpmn-container');
                            const diagram = container?.querySelector('svg');
                            if (diagram) {
                              setZoomLevel(1);
                              diagram.style.transform = 'scale(1)';
                              diagram.style.transformOrigin = 'center center';
                            }
                          }}
                          title="Taille normale"
                        >
                          <span className="text-sm">1:1</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                onClick={() => {
                  const container = document.getElementById('bpmn-container');
                  const diagram = container?.querySelector('svg');
                  if (diagram) {
                    const newZoom = Math.min(zoomLevel + 0.1, 2.0);
                    setZoomLevel(newZoom);
                    diagram.style.transform = `scale(${newZoom})`;
                    diagram.style.transformOrigin = 'center center';
                  }
                }}
                title="Zoom +"
              >
                <span className="text-lg font-medium">+</span>
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                onClick={() => {
                  const container = document.getElementById('bpmn-container');
                  const diagram = container?.querySelector('svg');
                  if (diagram) {
                    const newZoom = Math.max(zoomLevel - 0.1, 0.5);
                    setZoomLevel(newZoom);
                    diagram.style.transform = `scale(${newZoom})`;
                    diagram.style.transformOrigin = 'center center';
                  }
                }}
                title="Zoom -"
              >
                <span className="text-lg font-medium">-</span>
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="h-9 px-3 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 border-gray-300 shadow-sm"
                onClick={() => {
                  const container = document.getElementById('bpmn-container');
                  const diagram = container?.querySelector('svg');
                  if (diagram) {
                    setZoomLevel(1);
                    diagram.style.transform = 'scale(1)';
                    diagram.style.transformOrigin = 'center center';
                  }
                }}
                title="Taille normale (100%)"
              >
                <span className="text-sm font-medium">100%</span>
              </Button>
            </div>
            <Button 
              variant="default"
              size="sm"
              className="shadow-md bg-amber-500 hover:bg-amber-600 text-white font-medium"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (xml) {
                  try {
                    console.log('Bouton de rechargement cliqué, réinitialisation du visualiseur');
                    
                    // Reset complet du container
                    const container = document.getElementById('bpmn-container');
                    if (container) {
                      // Sauvegarder la position de défilement
                      const scrollX = container.scrollLeft || 0;
                      const scrollY = container.scrollTop || 0;
                      
                      // Vider le conteneur pour éviter les conflits
                      container.innerHTML = '';
                      
                      // Re-créer l'instance de visualisation
                      setTimeout(() => {
                        try {
                          // Vérifier que le XML est valide avant de le charger
                          if (!xml || !xml.trim() || !xml.includes('<bpmn')) {
                            console.error("Invalid or empty BPMN XML content during reload");
                            return;
                          }
                          
                          // Recréer complètement une nouvelle instance
                          bpmnVisualizationRef.current = new BpmnVisualization({ 
                            container: containerIdRef.current,
                            navigation: { enabled: true }
                          });
                          
                          // Réinitialiser le niveau de zoom
                          setZoomLevel(1);
                          
                          // Recharger le diagramme
                          bpmnVisualizationRef.current.load(xml);
                          
                          // Restaurer la position de défilement
                          setTimeout(() => {
                            if (container) {
                              container.scrollTo(scrollX, scrollY);
                            }
                          }, 50);
                          
                          console.log('Diagramme complètement réinitialisé et rechargé avec succès');
                        } catch (innerError) {
                          console.error('Erreur lors de la réinitialisation du diagramme:', innerError);
                        }
                      }, 50);
                    }
                  } catch (e) {
                    console.error('Erreur lors du rechargement du diagramme:', e);
                  }
                }
              }}
              title="Recharger le diagramme"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2" aria-hidden="true">
                <title>Icône de rechargement</title>
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
              Recharger
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="xml" className="flex-1 min-h-0 overflow-auto">
          {xml ? (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="absolute top-2 right-2 z-10"
                disabled={!xml}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy XML
                  </>
                )}
              </Button>
              <pre className="p-4 bg-gray-100 rounded-md overflow-auto text-sm h-[400px] whitespace-pre-wrap break-words">
                {xml ? formatXml(xml) : 'Aucun contenu BPMN disponible.'}
              </pre>
            </div>
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

export default BpmnViewer;
