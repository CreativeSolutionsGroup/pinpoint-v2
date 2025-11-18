'use client';

import React, { useState } from 'react';
import type { DiagramItem, DiagramLayer, DrawingShape, DrawingPath } from '@/lib/types/diagram';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Unlock, Trash2, Plus, GripVertical, Pencil, CheckSquare } from 'lucide-react';

interface LayersPanelProps {
  layers: DiagramLayer[];
  items: DiagramItem[];
  drawingShapes?: DrawingShape[];
  drawingPaths?: DrawingPath[];
  selectedLayerId: string | null;
  onLayersUpdate: (layers: DiagramLayer[]) => void;
  onItemsUpdate: (items: DiagramItem[]) => void;
  onLayerSelect: (layerId: string) => void;
  onSelectLayerItems?: (itemIds: string[], drawingIds: Array<{id: string, type: 'path' | 'shape'}>) => void;
  onEditingChange?: (isEditing: boolean) => void;
}

export function LayersPanel({ layers, items, drawingShapes = [], drawingPaths = [], selectedLayerId, onLayersUpdate, onItemsUpdate, onLayerSelect, onSelectLayerItems, onEditingChange }: LayersPanelProps) {
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);
  const [dragOverLayerId, setDragOverLayerId] = useState<string | null>(null);

  const addLayer = () => {
    const newLayer: DiagramLayer = {
      id: `layer_${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      order: layers.length,
    };
    onLayersUpdate([...layers, newLayer]);
  };

  const deleteLayer = (layerId: string) => {
    // Move items from deleted layer to default layer (if exists) or remove layerId
    const defaultLayer = layers.find(l => l.id !== layerId);
    const updatedItems = items.map(item =>
      item.layerId === layerId
        ? { ...item, layerId: defaultLayer?.id }
        : item
    );
    onItemsUpdate(updatedItems);
    onLayersUpdate(layers.filter(l => l.id !== layerId));
  };

  const toggleLayerVisibility = (layerId: string) => {
    onLayersUpdate(
      layers.map(l =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      )
    );
  };

  const toggleLayerLock = (layerId: string) => {
    onLayersUpdate(
      layers.map(l =>
        l.id === layerId ? { ...l, locked: !l.locked } : l
      )
    );
  };

  const updateLayerName = (layerId: string, name: string) => {
    onLayersUpdate(
      layers.map(l =>
        l.id === layerId ? { ...l, name } : l
      )
    );
  };

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    setDraggedLayerId(layerId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    if (!draggedLayerId || draggedLayerId === targetLayerId) return;
    if (dragOverLayerId === targetLayerId) return; // Prevent multiple updates

    setDragOverLayerId(targetLayerId);

    const draggedIndex = layers.findIndex(l => l.id === draggedLayerId);
    const targetIndex = layers.findIndex(l => l.id === targetLayerId);

    const newLayers = [...layers];
    const [draggedLayer] = newLayers.splice(draggedIndex, 1);
    newLayers.splice(targetIndex, 0, draggedLayer);

    // Update order property
    const reorderedLayers = newLayers.map((layer, index) => ({
      ...layer,
      order: index,
    }));

    onLayersUpdate(reorderedLayers);
  };

  const handleDragEnd = () => {
    setDraggedLayerId(null);
    setDragOverLayerId(null);
  };

  const getLayerItemCount = (layerId: string) => {
    const iconCount = items.filter(item => item.layerId === layerId).length;
    const shapeCount = drawingShapes.filter(shape => shape.layerId === layerId).length;
    const pathCount = drawingPaths.filter(path => path.layerId === layerId).length;
    return iconCount + shapeCount + pathCount;
  };

  const selectAllInLayer = (layerId: string) => {
    const layerItems = items.filter(item => item.layerId === layerId).map(item => item.id);
    const layerShapes = drawingShapes.filter(shape => shape.layerId === layerId).map(shape => ({ id: shape.id, type: 'shape' as const }));
    const layerPaths = drawingPaths.filter(path => path.layerId === layerId).map(path => ({ id: path.id, type: 'path' as const }));
    const layerDrawings = [...layerShapes, ...layerPaths];
    
    if (onSelectLayerItems) {
      onSelectLayerItems(layerItems, layerDrawings);
    }
  };

  // Sort layers by order
  const sortedLayers = [...layers].sort((a, b) => a.order - b.order);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Layers</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={addLayer}
            className="h-7 px-2"
          >
            <Plus size={14} className="mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {sortedLayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No layers yet. Add one to get started.
          </div>
        ) : (
          sortedLayers.map((layer) => (
            <div
              key={layer.id}
              draggable
              onDragStart={(e) => handleDragStart(e, layer.id)}
              onDragOver={(e) => handleDragOver(e, layer.id)}
              onDragEnd={handleDragEnd}
              onClick={() => onLayerSelect(layer.id)}
              className={`
                flex items-center gap-2 p-2 rounded border cursor-pointer
                ${selectedLayerId === layer.id 
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' 
                  : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
                ${draggedLayerId === layer.id ? 'opacity-50' : ''}
              `}
            >
              {/* Drag Handle */}
              <GripVertical size={14} className="text-gray-400 shrink-0" />

              {/* Layer Name */}
              {editingLayerId === layer.id ? (
                <Input
                  value={layer.name}
                  onChange={(e) => updateLayerName(layer.id, e.target.value)}
                  onBlur={() => {
                    setEditingLayerId(null);
                    onEditingChange?.(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      setEditingLayerId(null);
                      onEditingChange?.(false);
                    }
                  }}
                  className="h-6 text-xs flex-1"
                  autoFocus
                />
              ) : (
                <div
                  className="flex-1 text-xs truncate cursor-text group/name flex items-center gap-1"
                  onClick={() => {
                    setEditingLayerId(layer.id);
                    onEditingChange?.(true);
                  }}
                >
                  <span className={!layer.visible ? 'opacity-50' : ''}>
                    {layer.name}
                  </span>
                  <span className="text-gray-400 text-[10px]">
                    ({getLayerItemCount(layer.id)}) [Z:{layer.order}]
                  </span>
                  <Pencil 
                    size={10} 
                    className="opacity-0 group-hover/name:opacity-100 transition-opacity text-gray-400 ml-auto" 
                  />
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => selectAllInLayer(layer.id)}
                  className="h-6 w-6"
                  title="Select all items in layer"
                >
                  <CheckSquare size={12} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleLayerVisibility(layer.id)}
                  className="h-6 w-6"
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleLayerLock(layer.id)}
                  className="h-6 w-6"
                  title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteLayer(layer.id)}
                  className="h-6 w-6 text-red-500 hover:text-red-600"
                  title="Delete layer"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
