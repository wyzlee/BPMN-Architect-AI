Tâche d'Amélioration : Interface Utilisateur pour la Sélection des LLMs et Récupération Dynamique de la ListeObjectif :Développer une interface utilisateur (UI) intuitive et graphiquement agréable pour permettre aux utilisateurs de sélectionner le Large Language Model (LLM) à utiliser pour les opérations d'IA. Implémenter un mécanisme robuste pour récupérer dynamiquement la liste des modèles configurés et disponibles depuis le backend.Documents de Référence :multi_llm_implementation_prompt (ID: multi_llm_implementation_prompt) pour le contexte de l'intégration multi-LLM.src/ai/genkit.ts (tel que modifié par genkit_ts_updated) pour la configuration des plugins.Parties Concernées :Frontend : Principalement src/components/chat/chat-interface.tsxBackend : src/ai/genkit.ts et src/components/chat/actions.tsÉtapes Clés et Directives d'Implémentation :Phase 1: Amélioration de la Récupération de la Liste des Modèles (Backend)Affiner listAvailableModels dans src/ai/genkit.ts :Objectif : Rendre cette fonction plus informative.Actions :Modifier la fonction pour qu'elle retourne une structure de données plus riche pour chaque modèle, par exemple :interface AvailableModelInfo {
  id: string; // e.g., 'googleai/gemini-1.5-flash-latest'
  name: string; // e.g., 'Gemini 1.5 Flash'
  provider: string; // e.g., 'Google AI', 'OpenAI', 'Ollama'
  status: 'available' | 'configured_no_key' | 'not_configured';
  // Potentiellement d'autres infos : description courte, type (chat/generate), etc.
}
Pour chaque fournisseur configuré dans activePlugins, lister les modèles pertinents.Déterminer le status en fonction de la présence de la clé API correspondante (pour les services cloud) ou de la configuration du plugin (pour Ollama).Exemple de structure retournée :// Dans src/ai/genkit.ts
export async function listAvailableModels(): Promise<AvailableModelInfo[]> {
  const models: AvailableModelInfo[] = [];

  // Google AI
  if (process.env.GOOGLE_API_KEY) {
    models.push({ id: 'googleai/gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', provider: 'Google AI', status: 'available' });
    models.push({ id: 'googleai/gemini-pro', name: 'Gemini Pro', provider: 'Google AI', status: 'available' });
  } else {
    models.push({ id: 'googleai/gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', provider: 'Google AI', status: 'configured_no_key' });
  }

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    models.push({ id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', status: 'available' });
    models.push({ id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', status: 'available' });
  } else {
     models.push({ id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', status: 'configured_no_key' });
  }

  // Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    models.push({ id: 'anthropic/claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic', status: 'available' });
    models.push({ id: 'anthropic/claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'Anthropic', status: 'available' });
  } else {
    models.push({ id: 'anthropic/claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'Anthropic', status: 'configured_no_key' });
  }

  // Mistral
  if (process.env.MISTRAL_API_KEY) {
    models.push({ id: 'mistral/mistral-large-latest', name: 'Mistral Large', provider: 'Mistral AI', status: 'available' });
  } else {
     models.push({ id: 'mistral/mistral-large-latest', name: 'Mistral Large', provider: 'Mistral AI', status: 'configured_no_key' });
  }

  // Cohere
  if (process.env.COHERE_API_KEY) {
    models.push({ id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere', status: 'available' });
  } else {
    models.push({ id: 'cohere/command-r-plus', name: 'Command R+', provider: 'Cohere', status: 'configured_no_key' });
  }

  // Ollama - vérifier si le plugin est configuré (pas de clé API directe)
  // On pourrait vérifier si `ollama` est dans `activePlugins` si on structure mieux l'initialisation
  // Pour l'instant, on se base sur la config dans genkit.ts
  const ollamaPluginConfig = activePlugins.find(p => p.name === 'ollama'); // Nécessiterait d'exposer `activePlugins` ou une logique similaire
  if (ollamaPluginConfig) { // Simplification: on suppose que si le code est là, il est "configuré"
    models.push({ id: 'ollama/llama3', name: 'Llama 3 (Ollama)', provider: 'Ollama', status: 'available' });
    models.push({ id: 'ollama/mistral', name: 'Mistral (Ollama)', provider: 'Ollama', status: 'available' });
    models.push({ id: 'ollama/gemma', name: 'Gemma (Ollama)', provider: 'Ollama', status: 'available' });
  } else {
    // Optionnel: indiquer que Ollama n'est pas configuré
  }

  console.log("Modèles disponibles déterminés :", models);
  return models;
}
Créer une Nouvelle Action Serveur (src/components/chat/actions.ts) :Objectif : Exposer la liste des modèles au frontend.Actions :Créer une nouvelle fonction async exportée, par exemple getAvailableLlmList.Cette fonction appellera listAvailableModels (depuis src/ai/genkit.ts).Retourner la liste des AvailableModelInfo.Gérer les erreurs potentielles.// Dans src/components/chat/actions.ts
import { listAvailableModels, type AvailableModelInfo } from '@/ai/genkit'; // Assurez-vous que AvailableModelInfo est exporté

export async function getAvailableLlmList(): Promise<{ models: AvailableModelInfo[]; error?: string }> {
  try {
    const models = await listAvailableModels();
    return { models };
  } catch (error) {
    console.error("Error fetching available LLM list:", error);
    const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
    return { models: [], error: `Impossible de récupérer la liste des modèles : ${errorMessage}` };
  }
}
Phase 2: Implémentation de l'Interface Utilisateur de Sélection (Frontend)Modifier src/components/chat/chat-interface.tsx :Objectif : Intégrer un sélecteur de LLM graphique et convivial.Suggestions de Design UI/UX :Dropdown (Menu Déroulant) / Select :Simple et compact.Afficher le name du modèle et peut-être le provider (ex: "GPT-4o (OpenAI)").Utiliser les composants Select de @/components/ui/select.Regrouper visuellement par provider si la liste est longue (en utilisant SelectGroup et SelectLabel).Griser ou marquer clairement les modèles avec status: 'configured_no_key' et les rendre non sélectionnables, avec une infobulle expliquant pourquoi (ex: "Clé API manquante").(Alternative) Cartes ou Radio Group avec Icônes :Plus visuel si vous avez des logos pour chaque fournisseur.Chaque carte pourrait afficher le logo du fournisseur, le nom du modèle, et une brève description ou des tags de capacité.Peut prendre plus de place.État du Composant :Ajouter un état pour stocker la liste des modèles récupérés : const [availableLlms, setAvailableLlms] = useState<AvailableModelInfo[]>([]);Ajouter un état pour le modèle actuellement sélectionné : const [selectedLlmId, setSelectedLlmId] = useState<string | null>(null); (initialiser avec un ID de modèle par défaut si souhaité).Ajouter un état pour le chargement de la liste : const [isLoadingLlms, setIsLoadingLlms] = useState(true);Récupération des Données :Dans un useEffect, appeler l'action getAvailableLlmList au montage du composant.Mettre à jour availableLlms et isLoadingLlms.Gérer les erreurs d'affichage (par exemple, un message si la liste ne peut pas être chargée).Définir un selectedLlmId par défaut une fois la liste chargée (par exemple, le premier modèle disponible).Affichage du Sélecteur :Placer le sélecteur de manière visible, par exemple, à côté du champ de saisie du message ou dans un menu de configuration accessible.Le sélecteur doit être désactivé pendant les opérations de l'IA (currentLoading).Passage du Modèle Sélectionné :Lorsque l'utilisateur envoie un message (handleSendMessage), inclure selectedLlmId dans les données envoyées à l'action serveur (getRefinedInstructions ou directement à getGeneratedAndValidatedBPMNXml si le raffinement est sauté).Les actions serveur (dans actions.ts) devront être mises à jour pour accepter ce modelId et le passer aux flux Genkit correspondants, comme décrit dans l'étape 4 de multi_llm_implementation_prompt.Exemple de Logique pour le Frontend (ChatInterface) :// Dans src/components/chat/chat-interface.tsx

// ... imports ...
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableLlmList } from './actions'; // Assurez-vous que le chemin est correct
import type { AvailableModelInfo } from '@/ai/genkit'; // Exporter ce type depuis genkit.ts

// ... à l'intérieur du composant ChatInterface ...
const [availableLlms, setAvailableLlms] = useState<AvailableModelInfo[]>([]);
const [selectedLlmId, setSelectedLlmId] = useState<string | undefined>(undefined); // Ou un ID par défaut
const [isLoadingLlms, setIsLoadingLlms] = useState(true);

useEffect(() => {
  async function fetchModels() {
    setIsLoadingLlms(true);
    const result = await getAvailableLlmList();
    if (result.error) {
      toast({ title: "Erreur de chargement des modèles", description: result.error, variant: "destructive" });
      setAvailableLlms([]);
    } else {
      setAvailableLlms(result.models);
      // Définir un modèle par défaut si aucun n'est sélectionné et que la liste n'est pas vide
      const defaultModel = result.models.find(m => m.status === 'available');
      if (defaultModel && !selectedLlmId) {
        setSelectedLlmId(defaultModel.id);
      }
    }
    setIsLoadingLlms(false);
  }
  fetchModels();
}, [toast]); // Ne pas inclure selectedLlmId ici pour éviter une boucle si on le définit

// ... dans la fonction handleSendMessage ...
// Ajouter selectedLlmId à l'appel de l'action
// Par exemple, pour getRefinedInstructions:
// const result = await getRefinedInstructions(rawUserInput, selectedLlmId);
// (Nécessite de modifier la signature de getRefinedInstructions dans actions.ts et le flux associé)

// ... dans le JSX pour le sélecteur (exemple avec Shadcn UI Select) ...
// À placer judicieusement dans votre formulaire ou à côté.

{isLoadingLlms ? (
  <p className="text-xs text-muted-foreground">Chargement des modèles...</p>
) : availableLlms.length > 0 ? (
  <Select
    value={selectedLlmId}
    onValueChange={setSelectedLlmId}
    disabled={currentLoading || isLoadingLlms}
  >
    <SelectTrigger className="w-[280px] sm:w-auto text-xs sm:text-sm" aria-label="Sélectionner un modèle LLM">
      <SelectValue placeholder="Sélectionner un modèle..." />
    </SelectTrigger>
    <SelectContent>
      {
        // Grouper par fournisseur
        Object.entries(
          availableLlms.reduce((acc, model) => {
            if (!acc[model.provider]) acc[model.provider] = [];
            acc[model.provider].push(model);
            return acc;
          }, {} as Record<string, AvailableModelInfo[]>)
        ).map(([provider, models]) => (
          <SelectGroup key={provider}>
            <SelectLabel>{provider}</SelectLabel>
            {models.map(model => (
              <SelectItem
                key={model.id}
                value={model.id}
                disabled={model.status !== 'available'}
                title={model.status !== 'available' ? `Non disponible (${model.status.replace('_', ' ')})` : model.name}
              >
                {model.name} {model.status !== 'available' && <span className="text-destructive/70 text-xs ml-2">({model.status === 'configured_no_key' ? 'Clé API manquante' : 'Non configuré'})</span>}
              </SelectItem>
            ))}
          </SelectGroup>
        ))
      }
    </SelectContent>
  </Select>
) : (
  <p className="text-xs text-destructive">Aucun modèle LLM n'est disponible.</p>
)}

Phase 3: Tests et RaffinementsTests Fonctionnels :Vérifier que la liste des modèles s'affiche correctement, avec les statuts adéquats.Tester la sélection de chaque modèle disponible.Confirmer que les opérations IA (raffinement, génération, correction) utilisent bien le modèle sélectionné.Observer les logs de Genkit et les traces dans le Genkit Developer UI pour confirmer les appels aux bons modèles.Tests d'Erreurs :Simuler des clés API manquantes pour certains fournisseurs et vérifier que les modèles correspondants sont bien désactivés/marqués dans l'UI.Tester le comportement si aucun modèle n'est disponible.Améliorations UX :Recueillir des retours sur la clarté et la facilité d'utilisation du sélecteur.Ajouter des infobulles ou des descriptions plus détaillées pour les modèles si nécessaire.Considérer la mémorisation du dernier modèle sélectionné par l'utilisateur (par exemple, via localStorage).Considérations Importantes :Gestion des Capacités des Modèles : Certains modèles sont meilleurs pour certaines tâches (chat vs génération de code, etc.). Actuellement, le type dans la configuration Ollama est un exemple. Vous pourriez vouloir étendre AvailableModelInfo pour inclure des tags de capacité et filtrer/guider l'utilisateur.Coûts : Si vous utilisez des modèles payants, l'UI pourrait éventuellement afficher des indicateurs de coût relatif, mais c'est une fonctionnalité avancée.Prompt Engineering : Différents modèles peuvent réagir différemment aux mêmes prompts. Des ajustements de prompts pourraient être nécessaires pour optimiser les performances avec chaque modèle.En suivant ces étapes, vous devriez pouvoir implémenter une solution robuste et conviviale pour la sélection des LLMs dans votre application BPMN Architect AI.