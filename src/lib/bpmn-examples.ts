
export interface BpmnExamplePrompt {
  id: string;
  title: string;
  prompt: string;
}

export const examplePrompts: BpmnExamplePrompt[] = [
  {
    id: 'ex1',
    title: 'Demande de Congé Simple',
    prompt: "Modéliser un processus simple de demande de congé. L'employé soumet une demande. Le manager approuve ou rejette. Si approuvé, le système RH est notifié. Si rejeté, l'employé est notifié. Le processus se termine ensuite.",
  },
  {
    id: 'ex2',
    title: 'Traitement de Commande Client',
    prompt: "Un client passe une commande. Le système vérifie le stock. Si le stock est suffisant, la commande est préparée pour l'expédition et une facture est générée en parallèle. Une fois l'expédition prête et la facture générée, la commande est expédiée et le client est notifié. Si le stock est insuffisant, le client est informé du délai et on lui demande s'il souhaite attendre ou annuler.",
  },
  {
    id: 'ex3',
    title: 'Processus d\'Intégration Nouvel Employé',
    prompt: "Lorsqu'un nouvel employé est embauché, le département RH initie le processus d'intégration. Simultanément, le service IT prépare le matériel informatique et le manager prépare le plan d'intégration. Une fois que le matériel est prêt et que le plan d'intégration est finalisé, une réunion de bienvenue est organisée. Après la réunion, l'employé commence sa formation.",
  },
  {
    id: 'ex4',
    title: 'Gestion de Réclamation Client',
    prompt: "Un client soumet une réclamation. Le service client enregistre la réclamation et l'assigne à un agent. L'agent analyse la réclamation. Si la réclamation est valide, une solution est proposée au client. Si le client accepte la solution, la réclamation est clôturée. Si la réclamation n'est pas valide ou si le client refuse la solution, le dossier est escaladé à un superviseur.",
  },
];
