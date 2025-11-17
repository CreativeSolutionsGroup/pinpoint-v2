'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Pen, Eraser, Trash2, Circle, Square, Triangle } from 'lucide-react';
import type { DrawingPath, DrawingShape } from '@/lib/types/diagram';

interface DrawingPanelProps {
  drawingPaths: DrawingPath[];
  drawingShapes: DrawingShape[];
  drawingTool: 'pen' | 'eraser' | 'circle' | 'rectangle' | 'triangle' | null;
  drawingColor: string;
  drawingWidth: number;
  drawingOpacity: number;
  drawingFilled: boolean;
  onDrawingToolChange: (tool: 'pen' | 'eraser' | 'circle' | 'rectangle' | 'triangle' | null) => void;
  onDrawingColorChange: (color: string) => void;
  onDrawingWidthChange: (width: number) => void;
  onDrawingOpacityChange: (opacity: number) => void;
  onDrawingFilledChange: (filled: boolean) => void;
  onClearDrawings: () => void;
}

const predefinedColors = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFFFFF', // White
  '#808080', // Gray
  '#FFA500', // Orange
  '#800080', // Purple
  '#008000', // Dark Green
];

export function DrawingPanel({
  drawingPaths,
  drawingShapes,
  drawingTool,
  drawingColor,
  drawingWidth,
  drawingOpacity,
  drawingFilled,
  onDrawingToolChange,
  onDrawingColorChange,
  onDrawingWidthChange,
  onDrawingOpacityChange,
  onDrawingFilledChange,
  onClearDrawings,
}: DrawingPanelProps) {
  const totalDrawings = drawingPaths.length + drawingShapes.length;
  
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-full">
      {/* Drawing Tools */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Drawing Tools
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={drawingTool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDrawingToolChange(drawingTool === 'pen' ? null : 'pen')}
          >
            <Pen size={16} className="mr-1" />
            Pen
          </Button>
          <Button
            variant={drawingTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDrawingToolChange(drawingTool === 'eraser' ? null : 'eraser')}
          >
            <Eraser size={16} className="mr-1" />
            Eraser
          </Button>
        </div>
      </div>

      {/* Shape Tools */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Shapes
        </label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={drawingTool === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDrawingToolChange(drawingTool === 'circle' ? null : 'circle')}
          >
            <Circle size={16} />
          </Button>
          <Button
            variant={drawingTool === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDrawingToolChange(drawingTool === 'rectangle' ? null : 'rectangle')}
          >
            <Square size={16} />
          </Button>
          <Button
            variant={drawingTool === 'triangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDrawingToolChange(drawingTool === 'triangle' ? null : 'triangle')}
          >
            <Triangle size={16} />
          </Button>
        </div>
        {drawingTool && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {drawingTool === 'pen' ? 'Click and drag to draw' 
              : drawingTool === 'eraser' ? 'Click and drag to erase'
              : 'Click and drag to draw shape'}
          </p>
        )}
      </div>

      {/* Fill Option for Shapes */}
      {(drawingTool === 'circle' || drawingTool === 'rectangle' || drawingTool === 'triangle') && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={drawingFilled}
              onChange={(e) => onDrawingFilledChange(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Fill shape
            </span>
          </div>
        </div>
      )}

      {/* Color Picker */}
      {(drawingTool === 'pen' || drawingTool === 'circle' || drawingTool === 'rectangle' || drawingTool === 'triangle') && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Color
          </label>
          <div className="grid grid-cols-6 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color}
                onClick={() => onDrawingColorChange(color)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  drawingColor === color
                    ? 'border-blue-500 scale-110'
                    : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="color"
              value={drawingColor}
              onChange={(e) => onDrawingColorChange(e.target.value)}
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Stroke Width */}
      {(drawingTool === 'pen' || drawingTool === 'circle' || drawingTool === 'rectangle' || drawingTool === 'triangle') && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Stroke Width: {drawingWidth}px
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={drawingWidth}
            onChange={(e) => onDrawingWidthChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Thin</span>
            <span>Thick</span>
          </div>
        </div>
      )}

      {/* Opacity */}
      {(drawingTool === 'pen' || drawingTool === 'circle' || drawingTool === 'rectangle' || drawingTool === 'triangle') && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Opacity: {Math.round(drawingOpacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={drawingOpacity}
            onChange={(e) => onDrawingOpacityChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Transparent</span>
            <span>Solid</span>
          </div>
        </div>
      )}

      {/* Drawing Stats and Actions */}
      <div className="pt-4 border-t space-y-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Total drawings: {totalDrawings}</p>
        </div>
        {totalDrawings > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearDrawings}
            className="w-full"
          >
            <Trash2 size={16} className="mr-2" />
            Clear All Drawings
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="pt-4 border-t">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Instructions
        </h4>
        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Pen: Draw freeform paths</li>
          <li>• Shapes: Click and drag to draw circles, squares, or triangles</li>
          <li>• Eraser: Remove drawings</li>
          <li>• Adjust color, width, opacity, and fill before drawing</li>
          <li>• Click tool again to return to select mode</li>
        </ul>
      </div>
    </div>
  );
}
