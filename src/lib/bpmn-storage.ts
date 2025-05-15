'use client'; // Because it uses localStorage

export interface SavedBpmnDiagram {
  id: string;
  title: string;
  xml: string;
  savedAt: string; // ISO string
}

const STORAGE_KEY = 'bpmnArchitectAi_savedDiagrams';

export function getSavedBpmnList(): SavedBpmnDiagram[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const itemsJson = localStorage.getItem(STORAGE_KEY);
  if (!itemsJson) {
    return [];
  }
  try {
    const items = JSON.parse(itemsJson) as SavedBpmnDiagram[];
    // Sort by savedAt descending (newest first)
    return items.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  } catch (error) {
    console.error("Error parsing saved BPMN diagrams from localStorage:", error);
    localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
    return [];
  }
}

export function saveBpmnDiagram(xml: string, title: string): SavedBpmnDiagram {
  if (typeof window === 'undefined') {
    // This case should ideally not be hit if called from client components
    console.error("Attempted to save BPMN diagram outside of browser environment.");
    // Return a mock or throw an error, depending on desired server-side behavior if any
    throw new Error("localStorage is not available.");
  }
  const list = getSavedBpmnList();
  const newDiagram: SavedBpmnDiagram = {
    id: `bpmn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    title: title.trim() || `Diagramme du ${new Date().toLocaleString()}`,
    xml,
    savedAt: new Date().toISOString(),
  };
  list.unshift(newDiagram); 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return newDiagram;
}

export function getBpmnDiagramById(id: string): SavedBpmnDiagram | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const list = getSavedBpmnList();
  return list.find(diagram => diagram.id === id) || null;
}

export function deleteBpmnDiagramById(id: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  let list = getSavedBpmnList();
  list = list.filter(diagram => diagram.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function updateBpmnDiagramTitle(id: string, newTitle: string): SavedBpmnDiagram | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const list = getSavedBpmnList();
  const diagramIndex = list.findIndex(diagram => diagram.id === id);
  if (diagramIndex === -1) {
    return null;
  }
  list[diagramIndex].title = newTitle.trim() || list[diagramIndex].title;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list[diagramIndex];
}
