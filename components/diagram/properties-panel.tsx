'use client';

import React from 'react';
import type { DiagramItem } from '@/lib/types/diagram';
import { getIconById } from '@/lib/icons/icon-library';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, X } from 'lucide-react';

interface PropertiesPanelProps {
  item: DiagramItem | null;
  onUpdate: (updates: Partial<DiagramItem>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function PropertiesPanel({ item, onUpdate, onDelete, onClose }: PropertiesPanelProps) {
  if (!item) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 border-l">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Select an item to edit properties
        </p>
      </div>
    );
  }

  const iconDef = getIconById(item.iconType);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Properties</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X size={16} />
        </Button>
      </div>

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
              placeholder="Enter item name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="item-description">Description / Instructions</Label>
            <Textarea
              id="item-description"
              value={item.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Enter description or instructions"
              className="mt-1"
              rows={3}
            />
          </div>
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
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Size</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="item-width" className="text-xs">Width</Label>
              <Input
                id="item-width"
                type="number"
                value={Math.round(item.width)}
                onChange={(e) => onUpdate({ width: parseFloat(e.target.value) || 20 })}
                className="mt-1"
                min="20"
              />
            </div>
            <div>
              <Label htmlFor="item-height" className="text-xs">Height</Label>
              <Input
                id="item-height"
                type="number"
                value={Math.round(item.height)}
                onChange={(e) => onUpdate({ height: parseFloat(e.target.value) || 20 })}
                className="mt-1"
                min="20"
              />
            </div>
          </div>
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
            min="0"
            max="1"
            step="0.01"
            value={item.opacity}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
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
            onChange={(e) => onUpdate({ zIndex: parseInt(e.target.value) || 0 })}
            className="mt-1"
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
