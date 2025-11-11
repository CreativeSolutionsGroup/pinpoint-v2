"use client";

import { Layer } from "./types";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LayersPanelProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  currentLayer: string;
  onCurrentLayerChange: (layerId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function LayersPanel({
  layers,
  onLayersChange,
  currentLayer,
  onCurrentLayerChange,
}: LayersPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");

  const handleAddLayer = () => {
    if (!newLayerName.trim()) return;

    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: newLayerName.trim(),
      visible: true,
      locked: false,
    };

    onLayersChange([...layers, newLayer]);
    setNewLayerName("");
    setIsAdding(false);
    onCurrentLayerChange(newLayer.id);
  };

  const handleToggleVisibility = (layerId: string) => {
    onLayersChange(
      layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const handleToggleLock = (layerId: string) => {
    onLayersChange(
      layers.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    );
  };

  const handleDeleteLayer = (layerId: string) => {
    if (layers.length === 1) {
      return; // Can't delete the last layer
    }
    
    const filteredLayers = layers.filter((layer) => layer.id !== layerId);
    onLayersChange(filteredLayers);
    
    // If deleting current layer, switch to first available layer
    if (currentLayer === layerId) {
      onCurrentLayerChange(filteredLayers[0].id);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Layers</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsAdding(true)}
            title="Add Layer"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {isAdding && (
          <div className="flex gap-1 mt-2">
            <Input
              value={newLayerName}
              onChange={(e) => setNewLayerName(e.target.value)}
              placeholder="Layer name..."
              className="h-7 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddLayer();
                if (e.key === "Escape") {
                  setIsAdding(false);
                  setNewLayerName("");
                }
              }}
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleAddLayer}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {layers.map((layer) => (
          <div
            key={layer.id}
            className={`flex items-center gap-2 px-3 py-2 border-b hover:bg-muted/50 cursor-pointer ${
              currentLayer === layer.id ? "bg-muted" : ""
            }`}
            onClick={() => onCurrentLayerChange(layer.id)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility(layer.id);
              }}
              title={layer.visible ? "Hide Layer" : "Show Layer"}
            >
              {layer.visible ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLock(layer.id);
              }}
              title={layer.locked ? "Unlock Layer" : "Lock Layer"}
            >
              {layer.locked ? (
                <Lock className="h-3.5 w-3.5" />
              ) : (
                <Unlock className="h-3.5 w-3.5 text-muted-foreground/50" />
              )}
            </Button>

            <span className="flex-1 text-sm truncate">{layer.name}</span>

            {layers.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLayer(layer.id);
                }}
                title="Delete Layer"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
