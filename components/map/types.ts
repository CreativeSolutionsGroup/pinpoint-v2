export interface Position {
  x: number;
  y: number;
}

export interface MapIcon {
  id: string;
  type: string;
  label: string;
  position: Position;
  icon: string;
  color?: string;
  rotation?: number; // 0-360 degrees
  size?: number; // 1-3 scale multiplier (default 1)
  description?: string; // Optional description/notes
  layer?: string; // Layer name (default "default")
}

export interface TextElement {
  id: string;
  text: string;
  position: Position;
  color?: string;
  rotation?: number; // 0-360 degrees
  size?: number; // 1-3 scale multiplier (default 1)
  fontSize?: number; // Base font size in pixels (default 16)
  layer?: string; // Layer name (default "default")
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color?: string; // Optional color indicator
}

export interface IconType {
  type: string;
  label: string;
  icon: string;
  color?: string;
}

export type ConnectorStyle = "solid" | "dashed" | "dotted";

export interface Connector {
  id: string;
  startIconId: string;
  endIconId: string;
  color?: string;
  width?: number; // Line width in pixels (default 2)
  style?: ConnectorStyle; // Line style (default "solid")
  label?: string;
  description?: string;
}

export type DrawingTool = "pen" | "line" | "rectangle" | "circle" | "ellipse" | "arrow" | "eraser" | "partial-eraser";

export interface DrawingPath {
  points: Position[]; // For pen tool
}

export interface Drawing {
  id: string;
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  fill?: string; // Fill color for shapes (optional)
  opacity?: number; // 0-1 (default 1)
  // Shape-specific properties
  path?: DrawingPath; // For pen tool
  startPoint?: Position; // For line, arrow
  endPoint?: Position; // For line, arrow
  x?: number; // Top-left x for rectangle, center x for circle/ellipse
  y?: number; // Top-left y for rectangle, center y for circle/ellipse
  width?: number; // For rectangle
  height?: number; // For rectangle
  radius?: number; // For circle
  radiusX?: number; // For ellipse
  radiusY?: number; // For ellipse
  text?: string; // For text tool
  fontSize?: number; // For text tool
  layer?: string; // Layer name (default "default")
}

export interface MapData {
  id: string;
  name: string;
  imageUrl: string;
  icons: MapIcon[];
  texts?: TextElement[];
  connectors?: Connector[];
  drawings?: Drawing[];
}
