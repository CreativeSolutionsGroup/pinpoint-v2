"use client";

import { MapIcon } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCw, Maximize2, Palette, Trash2, FileText, Move } from "lucide-react";

interface IconOptionsPanelProps {
  selectedIcon: MapIcon | null;
  selectedIcons: MapIcon[];
  onUpdate: (updates: Partial<MapIcon>) => void;
  onGroupUpdate: (iconId: string, updates: Partial<MapIcon>) => void;
  onDelete: () => void;
  onGroupDelete: () => void;
}

export function IconOptionsPanel({ 
  selectedIcon, 
  selectedIcons,
  onUpdate, 
  onGroupUpdate,
  onDelete,
  onGroupDelete 
}: IconOptionsPanelProps) {
  const isMultiSelect = selectedIcons.length > 1;
  
  if (selectedIcons.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No icon selected
      </div>
    );
  }

  // For multiple selection, show group controls
  if (isMultiSelect) {
    return (
      <div className="p-3 space-y-4">
        <div className="text-sm text-muted-foreground text-center pb-2 border-b">
          {selectedIcons.length} icons selected
        </div>

        {/* Individual icon position controls */}
        <div className="space-y-3">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Move className="h-3.5 w-3.5" />
            Individual Positions
          </Label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedIcons.map((icon) => (
              <div key={icon.id} className="p-2 border rounded-md space-y-2">
                <div className="text-xs font-medium truncate">{icon.label}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor={`x-${icon.id}`} className="text-xs text-muted-foreground">
                      X Position
                    </Label>
                    <Input
                      id={`x-${icon.id}`}
                      type="number"
                      value={icon.position.x.toFixed(2)}
                      onChange={(e) => {
                        const newX = parseFloat(e.target.value);
                        if (!isNaN(newX) && newX >= 0 && newX <= 100) {
                          onGroupUpdate(icon.id, { position: { ...icon.position, x: newX } });
                        }
                      }}
                      className="h-7 text-xs"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`y-${icon.id}`} className="text-xs text-muted-foreground">
                      Y Position
                    </Label>
                    <Input
                      id={`y-${icon.id}`}
                      type="number"
                      value={icon.position.y.toFixed(2)}
                      onChange={(e) => {
                        const newY = parseFloat(e.target.value);
                        if (!isNaN(newY) && newY >= 0 && newY <= 100) {
                          onGroupUpdate(icon.id, { position: { ...icon.position, y: newY } });
                        }
                      }}
                      className="h-7 text-xs"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Group Button */}
        <div className="pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-9"
            onClick={onGroupDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Group ({selectedIcons.length} icons)
          </Button>
        </div>
      </div>
    );
  }

  // Single icon selection - existing controls plus editable position
  if (!selectedIcon) return null;

  const currentSize = selectedIcon.size || 1;
  const currentRotation = selectedIcon.rotation || 0;

  return (
    <div className="p-3 space-y-4">
      {/* Label */}
      <div className="space-y-1.5">
        <Label htmlFor="icon-label" className="text-xs font-medium">
          Label
        </Label>
        <Input
          id="icon-label"
          value={selectedIcon.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label htmlFor="icon-color" className="text-xs font-medium flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5" />
          Color
        </Label>
        <div className="flex gap-2">
          <Input
            id="icon-color"
            type="color"
            value={selectedIcon.color || "#3b82f6"}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-8 w-16 p-1 cursor-pointer"
          />
          <Input
            value={selectedIcon.color || "#3b82f6"}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-8 text-sm flex-1"
            placeholder="#3b82f6"
          />
        </div>
      </div>

      {/* Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5" />
            Size
          </Label>
          <span className="text-xs text-muted-foreground">{currentSize.toFixed(2)}x</span>
        </div>
        <Slider
          value={[currentSize]}
          onValueChange={(values: number[]) => onUpdate({ size: values[0] })}
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
            onClick={() => onUpdate({ size: 0.5 })}
          >
            0.5x
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ size: 1 })}
          >
            1x
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ size: 1.5 })}
          >
            1.5x
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ size: 2 })}
          >
            2x
          </Button>
        </div>
      </div>

      {/* Rotation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <RotateCw className="h-3.5 w-3.5" />
            Rotation
          </Label>
          <span className="text-xs text-muted-foreground">{currentRotation}°</span>
        </div>
        <Slider
          value={[currentRotation]}
          onValueChange={(values: number[]) => onUpdate({ rotation: values[0] })}
          min={0}
          max={360}
          step={15}
          className="w-full"
        />
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ rotation: 0 })}
          >
            0°
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ rotation: 90 })}
          >
            90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ rotation: 180 })}
          >
            180°
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ rotation: 270 })}
          >
            270°
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="icon-description" className="text-xs font-medium flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Description
        </Label>
        <textarea
          id="icon-description"
          value={selectedIcon.description || ""}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Add notes or description..."
          className="w-full h-20 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Position (editable) */}
      <div className="space-y-1.5 pt-2 border-t">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Move className="h-3.5 w-3.5" />
          Position
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="icon-x" className="text-xs text-muted-foreground">
              X Position (%)
            </Label>
            <Input
              id="icon-x"
              type="number"
              value={selectedIcon.position.x.toFixed(2)}
              onChange={(e) => {
                const newX = parseFloat(e.target.value);
                if (!isNaN(newX) && newX >= 0 && newX <= 100) {
                  onUpdate({ position: { ...selectedIcon.position, x: newX } });
                }
              }}
              className="h-8 text-sm"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="icon-y" className="text-xs text-muted-foreground">
              Y Position (%)
            </Label>
            <Input
              id="icon-y"
              type="number"
              value={selectedIcon.position.y.toFixed(2)}
              onChange={(e) => {
                const newY = parseFloat(e.target.value);
                if (!isNaN(newY) && newY >= 0 && newY <= 100) {
                  onUpdate({ position: { ...selectedIcon.position, y: newY } });
                }
              }}
              className="h-8 text-sm"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <div className="pt-2 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full h-9"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Icon
        </Button>
      </div>
    </div>
  );
}
