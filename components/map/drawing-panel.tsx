"use client";

import { Drawing, DrawingTool } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Pen, 
  Minus, 
  Square, 
  Circle, 
  MoveUpRight,
  Palette,
  Trash2,
  Eye,
  EyeOff,
  PenTool,
  Eraser,
  Scissors
} from "lucide-react";
import { useState } from "react";

interface DrawingPanelProps {
  drawings: Drawing[];
  selectedTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  drawingColor: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fillColor: string;
  onFillColorChange: (color: string) => void;
  enableFill: boolean;
  onEnableFillChange: (enabled: boolean) => void;
  isDrawing: boolean;
  onDrawingModeToggle: () => void;
  onDrawingDelete: (id: string) => void;
  onDrawingUpdate: (id: string, updates: Partial<Drawing>) => void;
  onClearAllDrawings: () => void;
}

export function DrawingPanel({
  drawings,
  selectedTool,
  onToolChange,
  drawingColor,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fillColor,
  onFillColorChange,
  enableFill,
  onEnableFillChange,
  isDrawing,
  onDrawingModeToggle,
  onDrawingDelete,
  onDrawingUpdate,
  onClearAllDrawings,
}: DrawingPanelProps) {
  const [showDrawings, setShowDrawings] = useState(true);

  const tools: { tool: DrawingTool; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
    { tool: "pen", icon: Pen, label: "Pen" },
    { tool: "line", icon: Minus, label: "Line" },
    { tool: "rectangle", icon: Square, label: "Rectangle" },
    { tool: "circle", icon: Circle, label: "Circle" },
    { tool: "arrow", icon: MoveUpRight, label: "Arrow" },
    { tool: "eraser", icon: Eraser, label: "Eraser" },
    { tool: "partial-eraser", icon: Scissors, label: "Partial" },
  ];

  return (
    <div className="p-3 space-y-4">
      {/* Drawing Mode Toggle */}
      <div className="space-y-2">
        <Button
          variant={isDrawing ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={onDrawingModeToggle}
        >
          <PenTool className="h-4 w-4 mr-2" />
          {isDrawing ? "Exit Drawing Mode" : "Enter Drawing Mode"}
        </Button>
        {isDrawing && (
          <p className="text-xs text-muted-foreground text-center">
            Click and drag to draw on the canvas
          </p>
        )}
      </div>

      {/* Tool Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Drawing Tool</Label>
        <div className="grid grid-cols-3 gap-1">
          {tools.map(({ tool, icon: Icon, label }) => (
            <Button
              key={tool}
              variant={selectedTool === tool ? "default" : "outline"}
              size="sm"
              className="h-16 flex flex-col gap-1"
              onClick={() => onToolChange(tool)}
              title={label}
            >
              <Icon className="h-4 w-4" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Stroke Color */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5" />
          Stroke Color
        </Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={drawingColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="h-8 w-16 p-1 cursor-pointer"
          />
          <Input
            value={drawingColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="h-8 text-sm flex-1"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Stroke Width */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Stroke Width</Label>
          <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
        </div>
        <Slider
          value={[strokeWidth]}
          onValueChange={(values: number[]) => onStrokeWidthChange(values[0])}
          min={0.5}
          max={3}
          step={0.1}
          className="w-full"
        />
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onStrokeWidthChange(0.5)}
          >
            Thin
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onStrokeWidthChange(1.5)}
          >
            Medium
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onStrokeWidthChange(3)}
          >
            Thick
          </Button>
        </div>
      </div>

      {/* Fill Options (for shapes) */}
      {(selectedTool === "rectangle" || selectedTool === "circle" || selectedTool === "ellipse") && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Fill Shape</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onEnableFillChange(!enableFill)}
            >
              {enableFill ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          {enableFill && (
            <div className="flex gap-2">
              <Input
                type="color"
                value={fillColor}
                onChange={(e) => onFillColorChange(e.target.value)}
                className="h-8 w-16 p-1 cursor-pointer"
              />
              <Input
                value={fillColor}
                onChange={(e) => onFillColorChange(e.target.value)}
                className="h-8 text-sm flex-1"
                placeholder="#ffffff"
              />
            </div>
          )}
        </div>
      )}

      {/* Drawings List */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Drawings ({drawings.length})</Label>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setShowDrawings(!showDrawings)}
          >
            {showDrawings ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        
        {showDrawings && (
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {drawings.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                No drawings yet
              </p>
            ) : (
              drawings.map((drawing, index) => (
                <div
                  key={drawing.id}
                  className="flex items-center gap-2 p-2 rounded-md border hover:bg-accent group"
                >
                  <div
                    className="w-4 h-4 rounded border shrink-0"
                    style={{ backgroundColor: drawing.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate capitalize">
                      {drawing.tool} {index + 1}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {drawing.strokeWidth}px stroke
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => onDrawingDelete(drawing.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {drawings.length > 0 && (
        <div className="pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm(`Delete all ${drawings.length} drawings?`)) {
                onClearAllDrawings();
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Clear All Drawings
          </Button>
        </div>
      )}
    </div>
  );
}
