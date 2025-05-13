export interface BpmnElement {
  description: string;
  svg: string;
  category: 'FlowObject' | 'ConnectingObject' | 'Swimlane' | 'Artifact' | 'Event' | 'Gateway' | 'Activity';
}

export type BpmnElementKey = keyof typeof bpmnData;

export const bpmnData = {
  // Activities (a subtype of FlowObject)
  "Tâche": { 
    description: "Une tâche (Task) est une activité atomique au sein d'un processus. C'est une unité de travail qui ne peut pas être décomposée davantage au niveau de détail actuel du modèle.",
    svg: `<svg viewBox="0 0 100 80"><rect x="5" y="5" width="90" height="70" rx="10" ry="10" stroke="currentColor" stroke-width="2" fill="hsl(var(--card))"/></svg>`,
    category: 'Activity',
  },
  "Sous-processus": { 
    description: "Un sous-processus (Sub-Process) est une activité composée qui contient son propre ensemble d'activités, de passerelles et d'événements. Il peut être affiché en mode réduit (collapsed) ou étendu (expanded).",
    svg: `<svg viewBox="0 0 100 80"><rect x="5" y="5" width="90" height="70" rx="10" ry="10" stroke="currentColor" stroke-width="2" fill="hsl(var(--card))"/><rect x="40" y="60" width="20" height="10" stroke="currentColor" stroke-width="1.5" fill="hsl(var(--card))" /><line x1="50" y1="60" x2="50" y2="70" stroke="currentColor" stroke-width="1.5" /><line x1="40" y1="65" x2="60" y2="65" stroke="currentColor" stroke-width="1.5" /></svg>`,
    category: 'Activity',
  },
  "Activité d'Appel": {
    description: "Une activité d'appel (Call Activity) est un objet permettant d'appeler une Tâche Globale ou un Processus (sous-processus) réutilisable défini ailleurs.",
    svg: `<svg viewBox="0 0 100 80"><rect x="5" y="5" width="90" height="70" rx="10" ry="10" stroke="currentColor" stroke-width="3.5" fill="hsl(var(--card))"/></svg>`,
    category: 'Activity',
  },
  // Events (a subtype of FlowObject)
  "Événement de Début": { 
    description: "Un événement de début (Start Event) indique où un processus particulier commence. Il démarre le flux et ne doit pas avoir de flux séquentiel entrant.",
    svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" stroke="currentColor" stroke-width="1.5" fill="hsl(var(--card))"/></svg>`,
    category: 'Event',
  },
  "Événement Intermédiaire": { 
    description: "Un événement intermédiaire (Intermediate Event) arrive entre le début et la fin d'un processus. Il peut être attaché à la bordure d'une activité (boundary event) ou placé dans le flux normal.",
    svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" stroke="currentColor" stroke-width="1.5" fill="hsl(var(--card))"/><circle cx="18" cy="18" r="12" stroke="currentColor" stroke-width="1.5" fill="hsl(var(--card))"/></svg>`,
    category: 'Event',
  },
  "Événement de Fin": { 
    description: "Un événement de fin (End Event) indique où un chemin dans le processus se termine. Atteindre un End Event peut avoir des conséquences (Résultats).",
    svg: `<svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" stroke="currentColor" stroke-width="3" fill="hsl(var(--card))"/></svg>`,
    category: 'Event',
  },
  // Gateways (a subtype of FlowObject)
  "Passerelle Exclusive (XOR)": { 
    description: "Une passerelle exclusive (Exclusive Gateway - XOR) est utilisée pour représenter un point de décision où un seul des chemins alternatifs peut être pris.",
    svg: `<svg viewBox="0 0 40 40"><polygon points="20,2 38,20 20,38 2,20" stroke="currentColor" stroke-width="2" fill="hsl(var(--card))"/><line x1="10" y1="10" x2="30" y2="30" stroke="currentColor" stroke-width="2"/><line x1="10" y1="30" x2="30" y2="10" stroke="currentColor" stroke-width="2"/></svg>`,
    category: 'Gateway',
  },
  "Passerelle Parallèle (AND)": { 
    description: "Une passerelle parallèle (Parallel Gateway - AND) est utilisée pour représenter des chemins parallèles simultanés. Tous les chemins sortants sont activés.",
    svg: `<svg viewBox="0 0 40 40"><polygon points="20,2 38,20 20,38 2,20" stroke="currentColor" stroke-width="2" fill="hsl(var(--card))"/><line x1="20" y1="8" x2="20" y2="32" stroke="currentColor" stroke-width="3"/><line x1="8" y1="20" x2="32" y2="20" stroke="currentColor" stroke-width="3"/></svg>`,
    category: 'Gateway',
  },
  "Passerelle Inclusive (OR)": {
    description: "Une passerelle inclusive (Inclusive Gateway - OR) permet de prendre un ou plusieurs chemins sur plusieurs options, en fonction de conditions.",
    svg: `<svg viewBox="0 0 40 40"><polygon points="20,2 38,20 20,38 2,20" stroke="currentColor" stroke-width="2" fill="hsl(var(--card))"/><circle cx="20" cy="20" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    category: 'Gateway',
  },
  // Connecting Objects
  "Flux Séquentiel": {
    description: "Un flux séquentiel (Sequence Flow) montre l'ordre dans lequel les activités sont exécutées dans un processus. Représenté par une ligne solide avec une flèche.",
    svg: `<svg viewBox="0 0 100 40"><line x1="10" y1="20" x2="80" y2="20" stroke="currentColor" stroke-width="2"/><polygon points="80,15 90,20 80,25" fill="currentColor"/></svg>`,
    category: 'ConnectingObject',
  },
  "Flux de Message": {
    description: "Un flux de message (Message Flow) représente le flux de messages entre deux participants (Pools). Représenté par une ligne pointillée avec un cercle au début et une flèche à la fin.",
    svg: `<svg viewBox="0 0 100 40"><circle cx="10" cy="20" r="4" stroke="currentColor" stroke-width="1.5" fill="hsl(var(--card))"/><line x1="15" y1="20" x2="80" y2="20" stroke="currentColor" stroke-width="2" stroke-dasharray="4 2"/><polygon points="80,15 90,20 80,25" fill="currentColor"/></svg>`,
    category: 'ConnectingObject',
  },
  "Association": {
    description: "Une association (Association) est utilisée pour lier des informations et des artefacts (comme les annotations textuelles ou les objets de données) avec des objets de flux. Représentée par une ligne pointillée.",
    svg: `<svg viewBox="0 0 100 40"><line x1="10" y1="20" x2="90" y2="20" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/></svg>`,
    category: 'ConnectingObject',
  },
  // Swimlanes
  "Pool": {
    description: "Un pool (Pool) représente un participant à un processus (par exemple, une entreprise, un département). Il peut contenir un processus interne (boîte blanche) ou représenter un participant externe (boîte noire).",
    svg: `<svg viewBox="0 0 150 100"><rect x="5" y="5" width="140" height="90" stroke="currentColor" stroke-width="2" fill="hsl(var(--secondary))"/><rect x="5" y="5" width="30" height="90" stroke="currentColor" stroke-width="2" fill="hsl(var(--muted))"/><text x="15" y="55" font-family="Inter, sans-serif" font-size="10" transform="rotate(-90 15,55)" text-anchor="middle" fill="currentColor">Pool</text></svg>`,
    category: 'Swimlane',
  },
  "Lane": {
    description: "Une lane (Lane / Couloir) est une sous-partition d'un Pool ou d'une autre Lane. Utilisée pour organiser et catégoriser les activités au sein d'un Pool, par exemple par rôle ou système.",
    svg: `<svg viewBox="0 0 150 60"><rect x="5" y="5" width="140" height="50" stroke="currentColor" stroke-width="2" fill="hsl(var(--secondary))"/><rect x="5" y="5" width="30" height="50" stroke="currentColor" stroke-width="2" fill="hsl(var(--muted))"/><text x="15" y="30" font-family="Inter, sans-serif" font-size="10" transform="rotate(-90 15,30)" text-anchor="middle" fill="currentColor">Lane</text></svg>`,
    category: 'Swimlane',
  },
  // Artifacts
  "Objet de Données": {
    description: "Un objet de données (Data Object) fournit des informations sur ce que les activités nécessitent pour être exécutées et/ou ce qu'elles produisent. Représenté par une feuille de papier avec un coin replié.",
    svg: `<svg viewBox="0 0 80 100"><path d="M10 10 H60 L70 20 V90 H10 Z" stroke="currentColor" stroke-width="2" fill="hsl(var(--card))"/><path d="M60 10 V20 H70" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    category: 'Artifact',
  },
  "Annotation Textuelle": {
    description: "Une annotation textuelle (Text Annotation) est un mécanisme pour ajouter des commentaires ou une explication au modèle BPMN. Elle est connectée à un objet de flux par une Association.",
    svg: `<svg viewBox="0 0 100 60"><path d="M20 10 H90 V50 H20" stroke="currentColor" stroke-width="2" fill="hsl(var(--card))"/><line x1="20" y1="10" x2="20" y2="50" stroke="currentColor" stroke-width="2"/></svg>`,
    category: 'Artifact',
  }
} as const;

// Helper to get all elements of a certain category
export function getElementsByCategory(category: BpmnElement['category']): BpmnElementKey[] {
  return (Object.keys(bpmnData) as BpmnElementKey[]).filter(
    key => bpmnData[key].category === category
  );
}
