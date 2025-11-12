"use client";

import { useState } from "react";
import { EventMap } from "./event-map";
import { IconLegend } from "./icon-legend";
import { MapIcon, PlacedIcon, MapState } from "./types";

const defaultIcons: MapIcon[] = [
  // Main Venues & Structures
  { id: "1", type: "stage", label: "Stage", icon: "flag", color: "#ef4444" },
  { id: "2", type: "booth", label: "Booth", icon: "square", color: "#3b82f6" },
  { id: "3", type: "entrance", label: "Entrance", icon: "door-open", color: "#10b981" },
  { id: "4", type: "exit", label: "Exit", icon: "door-closed", color: "#dc2626" },
  { id: "5", type: "emergency-exit", label: "Emergency Exit", icon: "emergency-exit", color: "#dc2626" },

  // Food & Beverage
  { id: "6", type: "food", label: "Food Stand", icon: "utensils", color: "#f59e0b" },
  { id: "7", type: "bar", label: "Bar", icon: "wine", color: "#8b5cf6" },
  { id: "8", type: "coffee", label: "Coffee", icon: "coffee", color: "#92400e" },

  // Facilities
  { id: "9", type: "restroom", label: "Restroom", icon: "circle", color: "#06b6d4" },
  { id: "10", type: "accessible", label: "Accessible Restroom", icon: "accessible", color: "#2563eb" },
  { id: "11", type: "baby-changing", label: "Baby Changing", icon: "baby-changing", color: "#ec4899" },

  // Services
  { id: "12", type: "info", label: "Information", icon: "info", color: "#06b6d4" },
  { id: "13", type: "ticket-booth", label: "Ticket Booth", icon: "ticket-booth", color: "#7c3aed" },
  { id: "14", type: "coat-check", label: "Coat Check", icon: "coat-check", color: "#64748b" },
  { id: "15", type: "lost-found", label: "Lost & Found", icon: "lost-found", color: "#ea580c" },
  { id: "16", type: "merchandise", label: "Merchandise", icon: "merchandise", color: "#059669" },

  // Medical & Safety
  { id: "17", type: "first-aid", label: "First Aid", icon: "first-aid", color: "#dc2626" },
  { id: "18", type: "security", label: "Security", icon: "security", color: "#1e40af" },

  // Technology & Utilities
  { id: "19", type: "wifi", label: "WiFi Zone", icon: "wifi", color: "#0891b2" },
  { id: "20", type: "charging", label: "Charging Station", icon: "charging-station", color: "#65a30d" },
  { id: "21", type: "atm", label: "ATM", icon: "atm", color: "#15803d" },

  // Special Areas
  { id: "22", type: "vip", label: "VIP Area", icon: "vip", color: "#fbbf24" },
  { id: "23", type: "meeting-point", label: "Meeting Point", icon: "meeting-point", color: "#f97316" },
  { id: "24", type: "photo-booth", label: "Photo Booth", icon: "camera", color: "#a855f7" },
  { id: "25", type: "seating", label: "Seating Area", icon: "seating", color: "#475569" },
  { id: "26", type: "podium", label: "Podium", icon: "podium", color: "#be123c" },

  // Transportation
  { id: "27", type: "parking", label: "Parking", icon: "car", color: "#4b5563" },
  { id: "28", type: "bike-parking", label: "Bike Parking", icon: "bike", color: "#14b8a6" },

  // Miscellaneous
  { id: "29", type: "landmark", label: "Landmark", icon: "star", color: "#ec4899" },
  { id: "30", type: "map-pin", label: "Custom Point", icon: "map-pin", color: "#6366f1" },
];

interface EventMapContainerProps {
  eventId: string;
}

export function EventMapContainer({ eventId }: EventMapContainerProps) {
  const [mapState, setMapState] = useState<MapState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    placedIcons: [],
  });

  const handleIconDrop = (icon: MapIcon, x: number, y: number) => {
    const newIcon: PlacedIcon = {
      id: `${icon.type}-${Date.now()}`,
      type: icon.type,
      x,
      y,
      icon: icon.icon,
      color: icon.color,
      label: icon.label,
    };

    setMapState((prev) => ({
      ...prev,
      placedIcons: [...prev.placedIcons, newIcon],
    }));
  };

  const handleIconMove = (iconId: string, x: number, y: number) => {
    setMapState((prev) => ({
      ...prev,
      placedIcons: prev.placedIcons.map((icon) =>
        icon.id === iconId ? { ...icon, x, y } : icon
      ),
    }));
  };

  const handleIconDelete = (iconId: string) => {
    setMapState((prev) => ({
      ...prev,
      placedIcons: prev.placedIcons.filter((icon) => icon.id !== iconId),
    }));
  };

  const handleZoom = (delta: number) => {
    setMapState((prev) => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(3, prev.zoom + delta)),
    }));
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    setMapState((prev) => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY,
    }));
  };

  return (
    <div className="flex h-full w-full bg-neutral-50 dark:bg-neutral-950">
      {/* Legend Sidebar */}
      <div className="w-72 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Event Map
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Event ID: {eventId}
          </p>
        </div>
        <IconLegend icons={defaultIcons} />
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <EventMap
          mapState={mapState}
          onIconDrop={handleIconDrop}
          onIconMove={handleIconMove}
          onIconDelete={handleIconDelete}
          onZoom={handleZoom}
          onPan={handlePan}
        />
      </div>
    </div>
  );
}
