"use client";

import { Layer, MapIcon } from "./types";
import { LayersPanel } from "./layers-panel";
import { IconOptionsPanel } from "./icon-options-panel";
import { ChevronDown, ChevronRight, Layers, Settings } from "lucide-react";
import { useState } from "react";

interface SidebarPanelProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  currentLayer: string;
  onCurrentLayerChange: (layerId: string) => void;
  selectedIcon: MapIcon | null;
  onIconUpdate: (updates: Partial<MapIcon>) => void;
}

export function SidebarPanel({
  layers,
  onLayersChange,
  currentLayer,
  onCurrentLayerChange,
  selectedIcon,
  onIconUpdate,
}: SidebarPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["layers", "options"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Layers Section */}
      <div className="border-b">
        <button
          onClick={() => toggleSection("layers")}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Layers</span>
          </div>
          {expandedSections.has("layers") ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {expandedSections.has("layers") && (
          <div className="max-h-80 overflow-hidden">
            <LayersPanel
              layers={layers}
              onLayersChange={onLayersChange}
              currentLayer={currentLayer}
              onCurrentLayerChange={onCurrentLayerChange}
            />
          </div>
        )}
      </div>

      {/* Icon Options Section */}
      <div className="border-b">
        <button
          onClick={() => toggleSection("options")}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Icon Options</span>
            {selectedIcon && (
              <span className="text-xs text-muted-foreground">({selectedIcon.label})</span>
            )}
          </div>
          {expandedSections.has("options") ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {expandedSections.has("options") && (
          <div className="max-h-96 overflow-y-auto">
            <IconOptionsPanel selectedIcon={selectedIcon} onUpdate={onIconUpdate} />
          </div>
        )}
      </div>
    </div>
  );
}
