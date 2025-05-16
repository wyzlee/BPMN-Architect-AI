'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import BpmnViewer with SSR disabled
const BpmnViewer = dynamic(
  () => import('./BpmnViewer'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] flex items-center justify-center bg-white rounded-md shadow-sm">
        <Skeleton className="h-[350px] w-[90%] mx-auto" />
      </div>
    )
  }
);

interface BpmnViewerWrapperProps {
  xml: string | null;
  className?: string;
}

const BpmnViewerWrapper: React.FC<BpmnViewerWrapperProps> = (props) => {
  const [isClient, setIsClient] = useState(false);
  // Utilisez un key unique pour forcer le rechargement complet du composant lorsque le XML change
  const [bpmnKey, setBpmnKey] = useState(1);
  
  // Ensure we're on the client side before rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Force un rechargement complet lorsque les props XML changent
  useEffect(() => {
    // Incrémenter la clé pour forcer React à recréer le composant
    if (props.xml) {
      setBpmnKey(prevKey => prevKey + 1);
    }
  }, [props.xml]);
  
  // Only render the component on the client side
  if (!isClient) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-white rounded-md shadow-sm">
        <Skeleton className="h-[350px] w-[90%] mx-auto" />
      </div>
    );
  }
  
  // Utiliser key pour forcer la recréation du composant quand le XML change
  return <BpmnViewer key={bpmnKey} {...props} />;
};

export default BpmnViewerWrapper;
