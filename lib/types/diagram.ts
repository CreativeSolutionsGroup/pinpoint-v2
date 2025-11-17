// Type definitions for the diagram feature

export interface DiagramLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
}

export interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
  rotation?: number;
  layerId?: string;
}

export interface DrawingShape {
  id: string;
  type: 'circle' | 'rectangle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string; // stroke color
  strokeWidth: number;
  opacity: number; // stroke opacity
  filled: boolean;
  fillColor?: string; // fill color (defaults to stroke color if not set)
  fillOpacity?: number; // fill opacity (defaults to opacity * 0.5 if not set)
  layerId?: string;
}

export interface DiagramItem {
  id: string;
  diagramId: string;
  iconType: string;
  name: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  opacity: number;
  zIndex: number;
  layerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Diagram {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  createdAt?: Date;
  updatedAt?: Date;
  userId: string;
  eventId?: string;
  items?: DiagramItem[];
}

export interface IconDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultWidth: number;
  defaultHeight: number;
  renderIcon: (props: IconRenderProps) => React.ReactNode;
}

export interface IconRenderProps {
  color?: string;
  size?: number;
  className?: string;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasState {
  transform: Transform;
  selectedItemId: string | null;
  isDragging: boolean;
  isPanning: boolean;
}

export type DiagramTool = 'select' | 'pan' | 'add-icon';
