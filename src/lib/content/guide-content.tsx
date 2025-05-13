import React from 'react';
import { BpmnElementCard } from '@/components/guide/bpmn-element-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { BpmnElementKey } from './bpmn-data';

interface GuideSection {
  title: string;
  content: React.ReactNode;
}

const commonElementList = (elements: BpmnElementKey[]) => (
  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
    {elements.map(name => (
      <li key={name} className="list-none">
        <BpmnElementCard elementName={name} />
      </li>
    ))}
  </ul>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-3xl font-bold text-primary mb-6 pb-2 border-b-2 border-border">{children}</h2>
);

const SectionSubTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-2xl font-semibold text-primary/90 mt-8 mb-4">{children}</h3>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="mb-4 leading-relaxed text-foreground/90">{children}</p>
);

const Ul: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="list-disc pl-6 mb-4 space-y-1 text-foreground/90">{children}</ul>
);


export const guideContents: Record<string, GuideSection> = {
  intro: {
    title: "1. Qu'est-ce que BPMN 2.0 ?",
    content: (
      <>
        <SectionTitle>1. Qu'est-ce que la Norme BPMN 2.0 ?</SectionTitle>
        <P>
          La norme BPMN (Business Process Model and Notation) est un standard géré par l'Object Management Group (OMG). 
          Sa version 2.0, standardisée en 2013 et devenue la norme internationale ISO/CEI 19510 en juillet 2013, 
          est un standard incontournable pour la modélisation des processus métier.
        </P>
        <P>
          L'objectif principal de BPMN 2.0 est de fournir une notation compréhensible par tous les utilisateurs métier, 
          des analystes qui créent les ébauches initiales des processus, aux développeurs responsables de leur mise en œuvre technologique, 
          et enfin, aux personnes qui gèrent et surveillent ces processus. Elle vise à créer un pont standardisé entre la conception 
          des processus métier et leur implémentation.
        </P>
        <P>
          Les avantages clés de BPMN 2.0 incluent sa capacité à faciliter la communication, sa précision dans la description des processus, 
          et son potentiel pour l'automatisation des processus via des moteurs BPMN.
        </P>
      </>
    ),
  },
  concepts: { // This will be a generic landing for /guide/concepts, maybe show sub-links or brief overview.
    title: "2. Concepts Clés et Éléments BPMN 2.0",
    content: (
      <>
        <SectionTitle>2. Concepts Clés et Éléments BPMN 2.0</SectionTitle>
        <P>
          BPMN 2.0 organise ses éléments graphiques en catégories pour faciliter la compréhension tout en permettant de gérer la complexité inhérente aux processus métier. Les cinq catégories principales d'éléments sont :
        </P>
        <Ul>
          <li>Objets de Flux (Flow Objects) - Les principaux éléments graphiques qui définissent le comportement.</li>
          <li>Objets de Connexion (Connecting Objects) - Connectent les Objets de Flux entre eux.</li>
          <li>Couloirs (Swimlanes) - Organisent les activités en fonction des responsabilités ou des rôles.</li>
          <li>Artefacts (Artifacts) - Permettent d'ajouter des informations supplémentaires.</li>
          <li>Données (Data) - Représentent les informations utilisées ou produites par le processus.</li>
        </Ul>
        <P>
          Naviguez vers les sous-sections pour explorer chaque catégorie en détail.
        </P>
      </>
    )
  },
  "flow-objects": {
    title: "2.1 Objets de Flux",
    content: (
      <>
        <SectionTitle>2.1 Objets de Flux (Flow Objects)</SectionTitle>
        <P>Les objets de flux sont les éléments principaux qui définissent le comportement d'un processus. Ils incluent les Activités, les Événements et les Passerelles.</P>
        
        <Accordion type="single" collapsible className="w-full space-y-3">
          <AccordionItem value="activities">
            <AccordionTrigger className="text-xl font-medium hover:bg-accent/5 rounded-md px-4 py-3">Activités (Activities)</AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <P>Une activité est un terme générique pour le travail effectué dans un processus. Il existe deux types principaux d'activités : les Tâches et les Sous-processus.</P>
              {commonElementList(["Tâche", "Sous-processus", "Activité d'Appel"])}
              <P><strong>Types de tâches spécifiques :</strong> Service Task, Send Task, Receive Task, User Task, Manual Task, Business Rule Task, Script Task.</P>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="events">
            <AccordionTrigger className="text-xl font-medium hover:bg-accent/5 rounded-md px-4 py-3">Événements (Events)</AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <P>Un événement est quelque chose qui "arrive" pendant le déroulement d'un processus. Ces événements affectent le flux du processus et ont généralement une cause (déclencheur) ou un impact (résultat).</P>
              {commonElementList(["Événement de Début", "Événement Intermédiaire", "Événement de Fin"])}
              <P>Les événements peuvent être "catch" (capturer un déclencheur) ou "throw" (lancer un résultat), et peuvent être de différents types (Message, Timer, Error, etc.).</P>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="gateways">
            <AccordionTrigger className="text-xl font-medium hover:bg-accent/5 rounded-md px-4 py-3">Passerelles (Gateways)</AccordionTrigger>
            <AccordionContent className="px-4 pt-2 pb-4">
              <P>Les passerelles sont utilisées pour contrôler la divergence et la convergence du flux séquentiel dans un processus.</P>
              {commonElementList(["Passerelle Exclusive (XOR)", "Passerelle Parallèle (AND)", "Passerelle Inclusive (OR)"])}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </>
    ),
  },
  "connecting-objects": {
    title: "2.2 Objets de Connexion",
    content: (
      <>
        <SectionTitle>2.2 Objets de Connexion (Connecting Objects)</SectionTitle>
        <P>Les objets de connexion relient les objets de flux entre eux ou à d'autres informations.</P>
        {commonElementList(["Flux Séquentiel", "Flux de Message", "Association"])}
      </>
    ),
  },
  "swimlanes": {
    title: "2.3 Couloirs",
    content: (
      <>
        <SectionTitle>2.3 Couloirs (Swimlanes)</SectionTitle>
        <P>Les couloirs sont des conteneurs graphiques utilisés pour partitionner un ensemble d'activités. Ils représentent souvent des participants organisationnels, des rôles ou des systèmes.</P>
        {commonElementList(["Pool", "Lane"])}
      </>
    ),
  },
  "artifacts": {
    title: "2.4 Artefacts",
    content: (
      <>
        <SectionTitle>2.4 Artefacts (Artifacts)</SectionTitle>
        <P>Les artefacts fournissent des informations supplémentaires sur le processus mais n'affectent pas directement son flux séquentiel. Ils peuvent être associés aux objets de flux.</P>
        {commonElementList(["Objet de Données", "Annotation Textuelle"])}
      </>
    ),
  },
  "diagram-types": {
    title: "3. Types de Diagrammes BPMN",
    content: (
      <>
        <SectionTitle>3. Types de Diagrammes BPMN</SectionTitle>
        <P>BPMN 2.0 supporte plusieurs types de diagrammes, chacun ayant un objectif spécifique :</P>
        <Ul>
            <li><strong>Diagrammes de Processus (ou d'Orchestration) :</strong> Décrivent la séquence des activités au sein d'un seul participant (Pool). C'est le type de diagramme le plus courant.</li>
            <li><strong>Diagrammes de Collaboration :</strong> Montrent les interactions (flux de messages) entre deux ou plusieurs participants (Pools). Chaque Pool peut contenir son propre processus.</li>
            <li><strong>Diagrammes de Chorégraphie :</strong> Se concentrent sur les interactions entre les participants, plutôt que sur l'orchestration interne de chaque participant. Les tâches de chorégraphie représentent un ensemble d'échanges de messages.</li>
            <li><strong>Diagrammes de Conversation :</strong> Fournissent une vue d'ensemble des échanges de messages entre les participants, sans détailler la séquence exacte des activités ou des messages.</li>
        </Ul>
      </>
    ),
  },
  "best-practices": {
    title: "4. Bonnes Pratiques et Directives de Modélisation",
    content: (
      <>
        <SectionTitle>4. Bonnes Pratiques et Directives de Modélisation</SectionTitle>
        <P>Pour créer des modèles BPMN clairs, compréhensibles et utiles, il est important de suivre certaines bonnes pratiques :</P>
        <Ul>
            <li><strong>Utiliser l'ensemble de symboles BPMN 2.0 de manière cohérente :</strong> Respecter la sémantique de chaque élément.</li>
            <li><strong>Adopter des styles de modélisation clairs :</strong> Par exemple, commencer de gauche à droite, utiliser des noms significatifs, éviter les croisements de flux autant que possible.</li>
            <li><strong>Soigner la mise en page :</strong> Un diagramme bien organisé est plus facile à lire. Aligner les éléments, espacer uniformément.</li>
            <li><strong>Choisir le bon niveau de détail :</strong> Ne pas surcharger le diagramme avec trop de détails inutiles pour l'objectif du modèle. Utiliser des sous-processus pour gérer la complexité.</li>
            <li><strong>Utiliser des conventions de nommage :</strong> Nommer les tâches avec des verbes d'action, les événements avec des noms décrivant ce qui s'est passé.</li>
            <li><strong>Valider les modèles :</strong> Faire relire les modèles par les parties prenantes pour s'assurer qu'ils reflètent correctement la réalité.</li>
            <li><strong>Modéliser d'abord le "happy path" :</strong> Commencer par le scénario nominal, puis ajouter les exceptions et les chemins alternatifs.</li>
        </Ul>
      </>
    ),
  },
  "interoperability": {
    title: "5. Interopérabilité et Conformité",
    content: (
      <>
        <SectionTitle>5. Interopérabilité et Conformité</SectionTitle>
        <P>
          Un objectif majeur de BPMN 2.0 est de fournir un format d'échange standardisé qui permet aux modèles de processus d'être partagés entre différents outils de modélisation et d'exécution. Ceci est réalisé grâce à une sérialisation XML (XSD).
        </P>
        <P>
          La spécification BPMN 2.0 définit plusieurs niveaux de conformité pour les outils :
        </P>
        <Ul>
          <li><strong>Conformité du Processus de Modélisation :</strong> L'outil supporte la création et la modification de diagrammes de processus.</li>
          <li><strong>Conformité de la Chorégraphie de Modélisation :</strong> L'outil supporte la création et la modification de diagrammes de chorégraphie.</li>
          <li><strong>Conformité de l'Exécution du Processus :</strong> L'outil peut exécuter des modèles de processus BPMN.</li>
        </Ul>
        <P>
          L'interopérabilité permet aux entreprises de choisir les meilleurs outils pour chaque tâche (par exemple, un outil pour la conception métier, un autre pour l'exécution technique) tout en maintenant une représentation cohérente du processus.
        </P>
      </>
    ),
  },
  "execution-semantics": {
    title: "6. Sémantique d'Exécution",
    content: (
      <>
        <SectionTitle>6. Sémantique d'Exécution</SectionTitle>
        <P>
          BPMN 2.0 a formalisé la sémantique d'exécution des éléments de processus. Cela signifie que la spécification décrit comment chaque élément doit se comporter lorsqu'un processus est exécuté, par exemple, par un moteur de processus (BPMS).
        </P>
        <P>
          Cette sémantique d'exécution couvre des aspects tels que :
        </P>
        <Ul>
          <li>Comment les "tokens" (jetons virtuels) se déplacent à travers le processus.</li>
          <li>Comment les passerelles dirigent le flux.</li>
          <li>Comment les événements sont déclenchés et gérés.</li>
          <li>Comment les tâches sont instanciées et complétées.</li>
          <li>La gestion des instances de processus parallèles et des données.</li>
        </Ul>
        <P>
          Avoir une sémantique d'exécution bien définie est crucial pour l'automatisation des processus et garantit que les modèles BPMN peuvent être interprétés de manière cohérente par différents moteurs d'exécution.
        </P>
      </>
    ),
  },
  "ai-instructions": {
    title: "7. Instructions pour l'IA (Utilisateur de ce Chat)",
    content: (
      <>
        <SectionTitle>7. Instructions pour l'IA (Utilisateur de ce Chat)</SectionTitle>
        <P>En tant qu'utilisateur de ce chat de génération BPMN (simulé), lorsque vous donnez des instructions à l'IA (moi !), gardez à l'esprit les points suivants pour obtenir les meilleurs résultats :</P>
        <Ul>
            <li><strong>Soyez clair et précis :</strong> Décrivez les étapes de votre processus de manière séquentielle et logique.</li>
            <li><strong>Utilisez la terminologie BPMN si possible :</strong> Si vous savez qu'une étape est une "tâche" ou qu'une décision est une "passerelle exclusive", mentionnez-le. Par exemple, "Commence par un événement de début, suivi d'une tâche 'Vérifier la commande'."</li>
            <li><strong>Indiquez les points de décision :</strong> Si le processus a des branches conditionnelles, expliquez les conditions et les chemins. Par exemple, "Si la commande est valide, alors effectuer la tâche 'Traiter le paiement', sinon effectuer la tâche 'Notifier le client d'une erreur'."</li>
            <li><strong>Mentionnez le début et la fin :</strong> Précisez comment le processus commence et se termine (par exemple, "Le processus se termine lorsque la notification est envoyée.")</li>
            <li><strong>Pour les flux parallèles :</strong> Si des activités peuvent se dérouler en même temps, indiquez-le. Par exemple, "Après la validation, les tâches 'Préparer l'expédition' et 'Envoyer la facture' se font en parallèle."</li>
            <li><strong>Simplicité pour la simulation :</strong> Gardez à l'esprit que cette IA est une simulation. Des descriptions très complexes pourraient ne pas être entièrement interprétées. Essayez de décomposer les processus complexes en parties plus petites.</li>
            <li><strong>Exemple d'invite :</strong> "Je veux modéliser un processus de demande de congé. Ça commence quand un employé soumet une demande. Ensuite, le manager doit approuver la demande. Si elle est approuvée, le système RH est mis à jour. Si elle est refusée, l'employé est notifié. Le processus se termine après ces actions."</li>
        </Ul>
        <P>Je ferai de mon mieux pour suggérer les éléments BPMN pertinents. Vous pourrez ensuite télécharger une représentation XML simplifiée de ces suggestions.</P>
      </>
    ),
  },
};
