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

export interface MapData {
  id: string;
  name: string;
  imageUrl: string;
  icons: MapIcon[];
  connectors?: Connector[];
}
