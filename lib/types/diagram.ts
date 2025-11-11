// Type definitions for the diagram feature

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
