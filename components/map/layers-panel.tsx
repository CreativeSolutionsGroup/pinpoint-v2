"use client";

import { Layer } from "./types";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LayersPanelProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  currentLayer: string;
  onCurrentLayerChange: (layerId: string) => void;
}

export function LayersPanel({
  layers,
  onLayersChange,
  currentLayer,
  onCurrentLayerChange,
}: LayersPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLayerName, setNewLayerName] = useState("");
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingLayerName, setEditingLayerName] = useState("");
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);

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

  const handleStartRename = (layer: Layer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLayerId(layer.id);
    setEditingLayerName(layer.name);
  };

  const handleFinishRename = () => {
    if (!editingLayerId || !editingLayerName.trim()) {
      setEditingLayerId(null);
      return;
    }

    onLayersChange(
      layers.map((layer) =>
        layer.id === editingLayerId
          ? { ...layer, name: editingLayerName.trim() }
          : layer
      )
    );
    setEditingLayerId(null);
    setEditingLayerName("");
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

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverLayerId(layerId);
  };

  const handleDragLeave = () => {
    setDragOverLayerId(null);
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    
    if (!draggedLayerId || draggedLayerId === targetLayerId) {
      setDraggedLayerId(null);
      setDragOverLayerId(null);
      return;
    }

    const draggedIndex = layers.findIndex((l) => l.id === draggedLayerId);
    const targetIndex = layers.findIndex((l) => l.id === targetLayerId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedLayerId(null);
      setDragOverLayerId(null);
      return;
    }

    const newLayers = [...layers];
    const [draggedLayer] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(targetIndex, 0, draggedLayer);

    onLayersChange(newLayers);
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const handleDragEnd = () => {
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  return (
    <div className="flex flex-col">
      <div className="p-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Manage Layers</span>
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

      <div className="max-h-64 overflow-y-auto">{layers.map((layer) => (
          <div
            key={layer.id}
            draggable
            onDragStart={(e) => handleDragStart(e, layer.id)}
            onDragOver={(e) => handleDragOver(e, layer.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, layer.id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 px-3 py-2 border-b hover:bg-muted/50 cursor-pointer transition-colors ${
              currentLayer === layer.id ? "bg-muted" : ""
            } ${draggedLayerId === layer.id ? "opacity-50" : ""} ${
              dragOverLayerId === layer.id ? "border-t-2 border-t-primary" : ""
            }`}
            onClick={() => onCurrentLayerChange(layer.id)}
          >
            <div className="cursor-grab active:cursor-grabbing shrink-0">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

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

            {editingLayerId === layer.id ? (
              <Input
                value={editingLayerName}
                onChange={(e) => setEditingLayerName(e.target.value)}
                className="h-6 text-sm flex-1"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleFinishRename();
                  if (e.key === "Escape") {
                    setEditingLayerId(null);
                    setEditingLayerName("");
                  }
                }}
                onBlur={handleFinishRename}
                autoFocus
              />
            ) : (
              <span
                className="flex-1 text-sm truncate hover:text-primary"
                onClick={(e) => handleStartRename(layer, e)}
              >
                {layer.name}
              </span>
            )}

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
