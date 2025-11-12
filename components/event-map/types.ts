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
}

export interface MapState {
  zoom: number;
  panX: number;
  panY: number;
  placedIcons: PlacedIcon[];
}
