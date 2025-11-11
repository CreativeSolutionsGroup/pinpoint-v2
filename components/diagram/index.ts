// Central export file for diagram components
// Makes importing easier throughout the application

// Main components
export { DiagramCanvas } from './diagram-canvas';
export { DiagramItem } from './diagram-item';
export { IconPalette } from './icon-palette';
export { PropertiesPanel } from './properties-panel';

// Types
export type {
  Diagram,
  DiagramItem as DiagramItemType,
  IconDefinition,
  IconRenderProps,
  Transform,
  CanvasState,
  DiagramTool,
} from '@/lib/types/diagram';

// Icon library utilities
export {
  ICON_LIBRARY,
  ICON_CATEGORIES,
  getIconById,
  getIconsByCategory,
  getAllCategories,
} from '@/lib/icons/icon-library';

// Hooks
export {
  useDebounce,
  useKeyboardShortcuts,
  useLocalStorage,
  useHistory,
} from '@/lib/hooks/diagram-hooks';
