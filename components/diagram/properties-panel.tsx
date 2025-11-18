'use client';

import React from 'react';
import type { DiagramItem, DiagramLayer, DrawingShape, DrawingPath } from '@/lib/types/diagram';
import { getIconById } from '@/lib/icons/icon-library';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  item: DiagramItem | null;
  items: DiagramItem[];
  selectedItemIds: string[];
  selectedDrawingIds?: Array<{id: string, type: 'path' | 'shape'}>;
  layers: DiagramLayer[];
  selectedDrawingId?: string | null;
  selectedDrawingType?: 'path' | 'shape' | null;
  drawingShapes?: DrawingShape[];
  drawingPaths?: DrawingPath[];
  onUpdate: (updates: Partial<DiagramItem>) => void;
  onMultiUpdate: (updates: Partial<DiagramItem>) => void;
  onDrawingUpdate?: (updates: Partial<DrawingShape> | Partial<DrawingPath>) => void;
  onDrawingMultiUpdate?: (shapeUpdates: Partial<DrawingShape>, pathUpdates: Partial<DrawingPath>) => void;
  onDelete: () => void;
  onEditingChange?: (isEditing: boolean) => void;
  onClose?: () => void;
}

export function PropertiesPanel({ item, items, selectedItemIds, selectedDrawingIds = [], layers, selectedDrawingId, selectedDrawingType, drawingShapes, drawingPaths, onUpdate, onMultiUpdate, onDrawingUpdate, onDrawingMultiUpdate, onDelete, onEditingChange }: PropertiesPanelProps) {
  const isMultiSelect = selectedItemIds.length > 1 || selectedDrawingIds.length > 1 || (selectedItemIds.length > 0 && selectedDrawingIds.length > 0);
  const isMixedSelect = selectedItemIds.length > 0 && selectedDrawingIds.length > 0;
  const selectedItems = selectedItemIds.length > 0 ? items.filter(i => selectedItemIds.includes(i.id)) : [];
  const totalSelected = selectedItemIds.length + selectedDrawingIds.length;
  
  // Check for selected drawing (only for single selection)
  const selectedShape = !isMultiSelect && selectedDrawingType === 'shape' && selectedDrawingId && drawingShapes
    ? drawingShapes.find(s => s.id === selectedDrawingId)
    : null;
  const selectedPath = !isMultiSelect && selectedDrawingType === 'path' && selectedDrawingId && drawingPaths
    ? drawingPaths.find(p => p.id === selectedDrawingId)
    : null;

  if (!item && selectedItemIds.length === 0 && selectedDrawingIds.length === 0 && !selectedShape && !selectedPath) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 border-l">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Select an item to edit properties
        </p>
      </div>
    );
  }

  const iconDef = item ? getIconById(item.iconType) : null;

  // Drawing shape properties
  if (selectedShape && onDrawingUpdate) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1)} Shape
            </h3>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-500">X</Label>
                <Input
                  type="number"
                  value={Math.round(selectedShape.x)}
                  onChange={(e) => onDrawingUpdate({ x: parseFloat(e.target.value) || 0 })}
                  onFocus={() => onEditingChange?.(true)}
                  onBlur={() => onEditingChange?.(false)}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">Y</Label>
                <Input
                  type="number"
                  value={Math.round(selectedShape.y)}
                  onChange={(e) => onDrawingUpdate({ y: parseFloat(e.target.value) || 0 })}
                  onFocus={() => onEditingChange?.(true)}
                  onBlur={() => onEditingChange?.(false)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <Label>Rotation</Label>
            <div className="flex gap-2 mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDrawingUpdate({ rotation: 0 })}
                className="flex-1"
              >
                0°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDrawingUpdate({ rotation: 90 })}
                className="flex-1"
              >
                90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDrawingUpdate({ rotation: 180 })}
                className="flex-1"
              >
                180°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDrawingUpdate({ rotation: 270 })}
                className="flex-1"
              >
                270°
              </Button>
            </div>
            <Input
              type="number"
              value={Math.round(selectedShape.rotation)}
              onChange={(e) => onDrawingUpdate({ rotation: parseFloat(e.target.value) || 0 })}
              onFocus={() => onEditingChange?.(true)}
              onBlur={() => onEditingChange?.(false)}
              min="0"
              max="360"
              step="1"
              className="h-8"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Stroke Color</Label>
            <Input
              type="color"
              value={selectedShape.color}
              onChange={(e) => onDrawingUpdate({ color: e.target.value })}
              className="h-10 w-full"
            />
          </div>

          {/* Stroke Width */}
          <div className="space-y-2">
            <Label>Stroke Width</Label>
            <Input
              type="number"
              value={selectedShape.strokeWidth}
              onChange={(e) => onDrawingUpdate({ strokeWidth: parseFloat(e.target.value) || 1 })}
              onFocus={() => onEditingChange?.(true)}
              onBlur={() => onEditingChange?.(false)}
              min="1"
              max="20"
              className="h-8"
            />
          </div>

          {/* Stroke Opacity */}
          <div className="space-y-2">
            <Label>Stroke Opacity: {Math.round(selectedShape.opacity * 100)}%</Label>
            <Input
              type="range"
              value={selectedShape.opacity}
              onChange={(e) => onDrawingUpdate({ opacity: parseFloat(e.target.value) })}
              min="0"
              max="1"
              step="0.01"
              className="w-full"
            />
          </div>

          {/* Fill */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedShape.filled}
                onChange={(e) => onDrawingUpdate({ filled: e.target.checked })}
                className="rounded"
              />
              Filled
            </Label>
          </div>

          {/* Fill Color - only show if filled */}
          {selectedShape.filled && (
            <>
              <div className="space-y-2">
                <Label>Fill Color</Label>
                <Input
                  type="color"
                  value={selectedShape.fillColor || selectedShape.color}
                  onChange={(e) => onDrawingUpdate({ fillColor: e.target.value })}
                  className="h-10 w-full"
                />
              </div>

              {/* Fill Opacity */}
              <div className="space-y-2">
                <Label>Fill Opacity: {Math.round((selectedShape.fillOpacity ?? selectedShape.opacity * 0.5) * 100)}%</Label>
                <Input
                  type="range"
                  value={selectedShape.fillOpacity ?? selectedShape.opacity * 0.5}
                  onChange={(e) => onDrawingUpdate({ fillOpacity: parseFloat(e.target.value) })}
                  min="0"
                  max="1"
                  step="0.01"
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Drawing path properties
  if (selectedPath && onDrawingUpdate) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Freeform Path
            </h3>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <Input
              type="color"
              value={selectedPath.color}
              onChange={(e) => onDrawingUpdate({ color: e.target.value })}
              className="h-10 w-full"
            />
          </div>

          {/* Stroke Width */}
          <div className="space-y-2">
            <Label>Stroke Width</Label>
            <Input
              type="number"
              value={selectedPath.width}
              onChange={(e) => onDrawingUpdate({ width: parseFloat(e.target.value) || 1 })}
              onFocus={() => onEditingChange?.(true)}
              onBlur={() => onEditingChange?.(false)}
              min="1"
              max="20"
              className="h-8"
            />
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <Label>Opacity: {Math.round(selectedPath.opacity * 100)}%</Label>
            <Input
              type="range"
              value={selectedPath.opacity}
              onChange={(e) => onDrawingUpdate({ opacity: parseFloat(e.target.value) })}
              min="0"
              max="1"
              step="0.01"
              className="w-full"
            />
          </div>

          <div className="text-xs text-gray-500">
            {selectedPath.points.length} points
          </div>
        </div>
      </div>
    );
  }

  // Multi-select mode
  if (isMultiSelect) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>{totalSelected}</strong> {totalSelected === 1 ? 'item' : 'items'} selected
            </p>
            {isMixedSelect && (
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {selectedItemIds.length} {selectedItemIds.length === 1 ? 'icon' : 'icons'}, {selectedDrawingIds.length} {selectedDrawingIds.length === 1 ? 'drawing' : 'drawings'}
              </p>
            )}
          </div>

          {/* Common Properties */}
          
          {/* Rotation */}
          <div className="space-y-2">
            <Label>Rotation {isMixedSelect && '(Icons & Shapes)'}</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedItemIds.length > 0) onMultiUpdate({ rotation: 0 });
                  if (selectedDrawingIds.length > 0) onDrawingMultiUpdate?.({ rotation: 0 }, {});
                }}
                className="flex-1"
              >
                0°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedItemIds.length > 0) onMultiUpdate({ rotation: 90 });
                  if (selectedDrawingIds.length > 0) onDrawingMultiUpdate?.({ rotation: 90 }, {});
                }}
                className="flex-1"
              >
                90°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedItemIds.length > 0) onMultiUpdate({ rotation: 180 });
                  if (selectedDrawingIds.length > 0) onDrawingMultiUpdate?.({ rotation: 180 }, {});
                }}
                className="flex-1"
              >
                180°
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedItemIds.length > 0) onMultiUpdate({ rotation: 270 });
                  if (selectedDrawingIds.length > 0) onDrawingMultiUpdate?.({ rotation: 270 }, {});
                }}
                className="flex-1"
              >
                270°
              </Button>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="multi-color">Color {isMixedSelect && '(All)'}</Label>
            <div className="flex gap-2">
              <Input
                id="multi-color"
                type="color"
                onChange={(e) => {
                  if (selectedItemIds.length > 0) onMultiUpdate({ color: e.target.value });
                  if (selectedDrawingIds.length > 0) onDrawingMultiUpdate?.({ color: e.target.value }, { color: e.target.value });
                }}
                className="w-20 h-10 p-1"
              />
              <Input
                type="text"
                onChange={(e) => {
                  if (selectedItemIds.length > 0) onMultiUpdate({ color: e.target.value });
                  if (selectedDrawingIds.length > 0) onDrawingMultiUpdate?.({ color: e.target.value }, { color: e.target.value });
                }}
                onFocus={() => onEditingChange?.(true)}
                onBlur={() => onEditingChange?.(false)}
                className="flex-1"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Opacity */}
          <div className="space-y-2">
            <Label htmlFor="multi-opacity">Opacity {isMixedSelect && '(All)'}</Label>
            <input
              id="multi-opacity"
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              onChange={(e) => {
                const opacity = Math.max(0.1, parseFloat(e.target.value));
                if (selectedItemIds.length > 0) onMultiUpdate({ opacity });
                if (selectedDrawingIds.length > 0) onDrawingMultiUpdate?.({ opacity }, { opacity });
              }}
              className="w-full"
            />
          </div>

          {/* Stroke Width - only for drawings */}
          {selectedDrawingIds.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="multi-stroke-width">Stroke Width (Drawings)</Label>
              <Input
                id="multi-stroke-width"
                type="number"
                min="1"
                max="20"
                step="1"
                placeholder="1-20"
                onChange={(e) => {
                  const width = parseFloat(e.target.value) || 1;
                  // Shapes use strokeWidth, paths use width
                  onDrawingMultiUpdate?.({ strokeWidth: width }, { width });
                }}
                onFocus={() => onEditingChange?.(true)}
                onBlur={() => onEditingChange?.(false)}
                className="h-8"
              />
            </div>
          )}

          {/* Z-Index */}
          {selectedItemIds.length > 0 && (
            <div className="space-y-2">
              <Label>Layer Order (Icons)</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const minZ = Math.min(...selectedItems.map(i => i.zIndex));
                    onMultiUpdate({ zIndex: Math.max(0, minZ - 1) });
                  }}
                  className="flex-1"
                >
                  Send Backward
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const maxZ = Math.max(...selectedItems.map(i => i.zIndex));
                    onMultiUpdate({ zIndex: maxZ + 1 });
                  }}
                  className="flex-1"
                >
                  Bring Forward
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Delete Button */}
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={onDelete}
          >
            <Trash2 size={16} className="mr-2" />
            Delete {totalSelected} {totalSelected === 1 ? 'Item' : 'Items'}
          </Button>
        </div>
      </div>
    );
  }

  // Single item mode
  if (!item) return null;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Icon Preview */}
        <div className="flex flex-col items-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
          <div style={{ color: item.color }}>
            {iconDef?.renderIcon({ size: 64, color: item.color })}
          </div>
          <p className="text-sm font-medium mt-2">{iconDef?.name}</p>
        </div>

        {/* Basic Properties */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              onFocus={() => onEditingChange?.(true)}
              onBlur={() => onEditingChange?.(false)}
              placeholder="Enter item name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              value={item.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              onFocus={() => onEditingChange?.(true)}
              onBlur={() => onEditingChange?.(false)}
              placeholder="Enter description or instructions"
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* Layer Selection */}
        <div className="space-y-2">
          <Label htmlFor="item-layer">Layer</Label>
          <select
            id="item-layer"
            value={item.layerId || ''}
            onChange={(e) => onUpdate({ layerId: e.target.value })}
            className="w-full h-9 px-3 py-1 text-sm rounded-md border border-input bg-transparent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
          >
            {layers.map(layer => (
              <option key={layer.id} value={layer.id}>
                {layer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Position */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Position</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="item-x" className="text-xs">X</Label>
              <Input
                id="item-x"
                type="number"
                value={Math.round(item.x)}
                onChange={(e) => onUpdate({ x: parseFloat(e.target.value) || 0 })}
                onFocus={() => onEditingChange?.(true)}
                onBlur={() => onEditingChange?.(false)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="item-y" className="text-xs">Y</Label>
              <Input
                id="item-y"
                type="number"
                value={Math.round(item.y)}
                onChange={(e) => onUpdate({ y: parseFloat(e.target.value) || 0 })}
                onFocus={() => onEditingChange?.(true)}
                onBlur={() => onEditingChange?.(false)}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-2">
          <Label htmlFor="item-size">Size</Label>
          <Input
            id="item-size"
            type="number"
            value={Math.round(item.width)}
            onChange={(e) => {
              const newSize = parseFloat(e.target.value) || 20;
              const aspectRatio = item.width / item.height;
              onUpdate({ 
                width: newSize, 
                height: newSize / aspectRatio 
              });
            }}
            onFocus={() => onEditingChange?.(true)}
            onBlur={() => onEditingChange?.(false)}
            className="mt-1"
            min="20"
          />
        </div>

        {/* Rotation */}
        <div className="space-y-2">
          <Label htmlFor="item-rotation">Rotation: {Math.round(item.rotation)}°</Label>
          <input
            id="item-rotation"
            type="range"
            min="0"
            max="360"
            value={item.rotation}
            onChange={(e) => onUpdate({ rotation: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor="item-color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="item-color"
              type="color"
              value={item.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-20 h-10 p-1"
            />
            <Input
              type="text"
              value={item.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1"
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <Label htmlFor="item-opacity">Opacity: {Math.round(item.opacity * 100)}%</Label>
          <input
            id="item-opacity"
            type="range"
            min="0.1"
            max="1"
            step="0.01"
            value={item.opacity}
            onChange={(e) => onUpdate({ opacity: Math.max(0.1, parseFloat(e.target.value)) })}
            className="w-full"
          />
        </div>

        {/* Z-Index */}
        <div className="space-y-2">
          <Label htmlFor="item-zindex">Layer Order (Z-Index)</Label>
          <Input
            id="item-zindex"
            type="number"
            value={item.zIndex}
            onChange={(e) => onUpdate({ zIndex: Math.max(0, parseInt(e.target.value) || 0) })}
            className="mt-1"
            min="0"
          />
        </div>
      </div>

      {/* Footer - Delete Button */}
      <div className="p-4 border-t">
        <Button
          variant="destructive"
          className="w-full"
          onClick={onDelete}
        >
          <Trash2 size={16} className="mr-2" />
          Delete Item
        </Button>
      </div>
    </div>
  );
}
