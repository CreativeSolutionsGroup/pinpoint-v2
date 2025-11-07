"use client";

import { useState } from "react";
import { MapCanvas } from "./map-canvas";
import { IconPalette } from "./icon-palette";
import { MapIcon, IconType } from "./types";
import { 
  Drama, Armchair, Utensils, Coffee, WashingMachine, 
  DoorOpen, DoorClosed, ParkingSquare, Info, Cross,
  Speaker, Camera, ShoppingBag, ClipboardPen, Shield, Wifi
} from "lucide-react";

// Sample icon types - you can customize these
const DEFAULT_ICON_TYPES: IconType[] = [
  { type: "stage", label: "Stage", icon: "Drama", color: "#ef4444" },
  { type: "seating", label: "Seating", icon: "Armchair", color: "#3b82f6" },
  { type: "food", label: "Food Stand", icon: "Utensils", color: "#f59e0b" },
  { type: "drinks", label: "Drinks", icon: "Coffee", color: "#06b6d4" },
  { type: "restroom", label: "Restroom", icon: "WashingMachine", color: "#8b5cf6" },
  { type: "entrance", label: "Entrance", icon: "DoorOpen", color: "#10b981" },
  { type: "exit", label: "Exit", icon: "DoorClosed", color: "#dc2626" },
  { type: "parking", label: "Parking", icon: "ParkingSquare", color: "#6366f1" },
  { type: "info", label: "Info Booth", icon: "Info", color: "#0ea5e9" },
  { type: "first-aid", label: "First Aid", icon: "Cross", color: "#ec4899" },
  { type: "speaker", label: "Speaker", icon: "Speaker", color: "#14b8a6" },
  { type: "photo", label: "Photo Spot", icon: "Camera", color: "#f97316" },
  { type: "merchandise", label: "Merch", icon: "ShoppingBag", color: "#a855f7" },
  { type: "registration", label: "Registration", icon: "ClipboardPen", color: "#22c55e" },
  { type: "security", label: "Security", icon: "Shield", color: "#64748b" },
  { type: "wifi", label: "WiFi Zone", icon: "Wifi", color: "#06b6d4" },
];

export const iconComponents = {
  Drama, Armchair, Utensils, Coffee, WashingMachine,
  DoorOpen, DoorClosed, ParkingSquare, Info, Cross,
  Speaker, Camera, ShoppingBag, ClipboardPen, Shield, Wifi
};

interface MapEditorProps {
  mapImageUrl?: string;
  initialIcons?: MapIcon[];
  availableIconTypes?: IconType[];
  onIconsChange?: (icons: MapIcon[]) => void;
  onIconMoveComplete?: (icons: MapIcon[]) => void;
}

export function MapEditor({
  mapImageUrl = "/campus-map-placeholder.jpg",
  initialIcons = [],
  availableIconTypes = DEFAULT_ICON_TYPES,
  onIconsChange,
  onIconMoveComplete,
}: MapEditorProps) {
  const [icons, setIcons] = useState<MapIcon[]>(initialIcons);

  const handleAddIcon = (iconType: IconType, position: { x: number; y: number }) => {
    const newIcon: MapIcon = {
      id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: iconType.type,
      label: iconType.label,
      icon: iconType.icon,
      color: iconType.color,
      position,
      rotation: 0,
      size: 1,
    };

    const updatedIcons = [...icons, newIcon];
    setIcons(updatedIcons);
    onIconsChange?.(updatedIcons);
    onIconMoveComplete?.(updatedIcons); // Also add to history when adding new icon
  };

  const handleIconsChange = (updatedIcons: MapIcon[]) => {
    setIcons(updatedIcons);
    onIconsChange?.(updatedIcons);
  };

  return (
    <div className="flex h-full gap-2">
      {/* Icon Palette - Sidebar */}
      <div className="w-56 border rounded-lg bg-card shrink-0">
        <IconPalette icons={availableIconTypes} onIconSelect={(iconType) => {
          // Add icon to center when clicked
          handleAddIcon(iconType, { x: 50, y: 50 });
        }} />
      </div>

      {/* Map Canvas - Main area */}
      <div className="flex-1">
        <MapCanvas
          mapImageUrl={mapImageUrl}
          icons={icons}
          onIconsChange={handleIconsChange}
          onIconMoveComplete={onIconMoveComplete}
          onAddIcon={handleAddIcon}
        />
      </div>
    </div>
  );
}
