# Configuration des Multiples Fournisseurs de LLM

Ce document explique comment configurer et utiliser plusieurs fournisseurs de modèles de langage (LLM) dans BPMN Architect AI.

## Variables d'Environnement

Pour utiliser différents fournisseurs de LLM, vous devez configurer les variables d'environnement appropriées dans un fichier `.env` à la racine du projet. Voici les variables à configurer pour chaque fournisseur :

### Google AI (Gemini)

```
GOOGLE_API_KEY=votre_clé_api_google
```

### Vertex AI (Google Cloud)

```
VERTEX_AI_PROJECT=votre_projet_gcp
VERTEX_AI_LOCATION=votre_region_gcp
```

### OpenAI

```
OPENAI_API_KEY=votre_clé_api_openai
```

### Anthropic

```
ANTHROPIC_API_KEY=votre_clé_api_anthropic
```

### Mistral

```
MISTRAL_API_KEY=votre_clé_api_mistral
```

### Cohere

```
COHERE_API_KEY=votre_clé_api_cohere
```

### Ollama (Modèles Locaux)

```
ENABLE_OLLAMA=true
OLLAMA_SERVER_ADDRESS=http://localhost:11434
```

## Modèle par Défaut

Vous pouvez définir un modèle par défaut à utiliser si aucun n'est sélectionné par l'utilisateur :

```
DEFAULT_MODEL=googleai/gemini-2.0-flash
```

## Sécurité

**Important** : Ne commettez jamais votre fichier `.env` contenant vos clés API dans le dépôt Git. Le fichier `.env` est déjà inclus dans le `.gitignore` pour éviter ce problème.

## Interface Utilisateur

L'interface utilisateur permet de sélectionner le modèle à utiliser pour chaque tâche via un menu déroulant accessible depuis l'icône "Paramètres" dans l'interface de chat. Les modèles disponibles sont automatiquement détectés en fonction des clés API configurées.

## Utilisation Programmatique

Pour les développeurs qui souhaitent étendre l'application, les flux AI acceptent maintenant un paramètre `modelId` optionnel qui peut être utilisé pour spécifier le modèle à utiliser :

```typescript
// Exemple d'utilisation programmatique
const result = await refineUserInput({ 
  rawUserInput: "Description du processus", 
  modelId: "openai/gpt-4o" 
});
```

## Modèles Disponibles

La liste des modèles disponibles dépend des clés API configurées. Voici quelques exemples de modèles couramment utilisés :

- `googleai/gemini-2.0-flash` - Modèle rapide de Google AI
- `googleai/gemini-2.0-pro` - Modèle avancé de Google AI
- `openai/gpt-4o` - Modèle GPT-4o d'OpenAI
- `openai/gpt-3.5-turbo` - Modèle GPT-3.5 Turbo d'OpenAI
- `anthropic/claude-3-opus` - Modèle Claude 3 Opus d'Anthropic
- `anthropic/claude-3-sonnet` - Modèle Claude 3 Sonnet d'Anthropic
- `mistral/mistral-large` - Modèle Large de Mistral AI
- `mistral/mistral-small` - Modèle Small de Mistral AI
- `cohere/command-r` - Modèle Command-R de Cohere
- `cohere/command-r-plus` - Modèle Command-R+ de Cohere
- `ollama/llama3` - Modèle Llama 3 local via Ollama
