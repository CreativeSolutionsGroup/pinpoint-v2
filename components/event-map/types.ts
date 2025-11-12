export interface MapIcon {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
}

export interface PlacedIcon {
  id: string;
  type: string;
  x: number;
  y: number;
  icon: string;
  color: string;
  label: string;
  size?: number; // Icon size multiplier (default 1)
}

export interface MapState {
  zoom: number;
  panX: number;
  panY: number;
  placedIcons: PlacedIcon[];
}
