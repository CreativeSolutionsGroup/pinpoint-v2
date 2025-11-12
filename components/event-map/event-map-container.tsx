"use client";

import { useState } from "react";
import { EventMap } from "./event-map";
import { IconLegend } from "./icon-legend";
import { MapIcon, PlacedIcon, MapState } from "./types";

const defaultIcons: MapIcon[] = [
  { id: "1", type: "stage", label: "Stage", icon: "flag", color: "#ef4444" },
  { id: "2", type: "booth", label: "Booth", icon: "square", color: "#3b82f6" },
  { id: "3", type: "entrance", label: "Entrance", icon: "navigation", color: "#10b981" },
  { id: "4", type: "restroom", label: "Restroom", icon: "circle", color: "#8b5cf6" },
  { id: "5", type: "food", label: "Food Stand", icon: "triangle", color: "#f59e0b" },
  { id: "6", type: "info", label: "Info Point", icon: "pin", color: "#06b6d4" },
  { id: "7", type: "parking", label: "Parking", icon: "square", color: "#6366f1" },
  { id: "8", type: "landmark", label: "Landmark", icon: "star", color: "#ec4899" },
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
