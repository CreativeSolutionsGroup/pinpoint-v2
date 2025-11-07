"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Settings, Trash2, Minus, Plus, RotateCw, RotateCcw } from "lucide-react";
import { MapIcon } from "./types";

interface IconEditMenuProps {
  icon: MapIcon;
  onUpdate: (updates: Partial<MapIcon>) => void;
  onDelete: () => void;
  onOpenChange?: (open: boolean) => void;
}

const COLOR_PRESETS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
];

export function IconEditMenu({ icon, onUpdate, onDelete, onOpenChange }: IconEditMenuProps) {
  const [open, setOpen] = useState(false);
  const currentColor = icon.color || "#3b82f6";
  const currentSize = icon.size || 1;
  const currentRotation = icon.rotation || 0;

  // Position button at top-right corner of the circular icon
  // The circular icon is centered in the container, base size is 32px (16px radius)
  const iconRadius = 16;
  const scaledRadius = iconRadius * currentSize;
  
  // Calculate position for top-right corner (45° angle from center)
  // Using polar coordinates: at 45°, x = r*cos(45°), y = r*sin(45°)
  // cos(45°) = sin(45°) = √2/2
  const cornerOffset = (scaledRadius * Math.sqrt(2)) / 2;
  const topOffset = cornerOffset - 2; // Slight overlap
  const rightOffset = cornerOffset - 2;
  
  // Scale button size with icon (min 12px, max 20px)
  const buttonSize = Math.max(12, Math.min(20, 16 * currentSize));
  const iconSize = Math.max(8, Math.min(12, 10 * currentSize));

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  const handleSizeChange = (delta: number) => {
    const newSize = Math.max(0.5, Math.min(3, currentSize + delta));
    onUpdate({ size: newSize });
  };

  const handleRotate = (degrees: number) => {
    // Don't normalize to 0-360, allow negative and >360 for smooth CSS transitions
    const newRotation = currentRotation + degrees;
    onUpdate({ rotation: newRotation });
  };

  const handleColorChange = (color: string) => {
    onUpdate({ color });
  };

  const handleDelete = () => {
    setOpen(false);
    onOpenChange?.(false);
    onDelete();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="absolute bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-primary/90"
          style={{
            top: `${-topOffset}px`,
            left: `calc(50% + ${rightOffset}px)`,
            width: `${buttonSize}px`,
            height: `${buttonSize}px`,
            transform: 'translate(-50%, 0)',
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          <Settings style={{ width: `${iconSize}px`, height: `${iconSize}px` }} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 max-h-[500px] overflow-y-auto" 
        side="right" 
        align="start"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-none">
          <div className="space-y-2">
            {/* Name Field */}
            <div>
              <label className="text-xs font-medium mb-1 block">Name</label>
              <Input
                value={icon.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="h-7 text-xs"
                placeholder="Icon name"
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="text-xs font-medium mb-1 block">Description</label>
              <textarea
                value={icon.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className="w-full h-12 text-xs rounded-md border border-input bg-background px-2 py-1.5 resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add notes..."
              />
            </div>

            {/* Size & Rotation Controls */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium mb-1 block">Size</label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 p-0"
                    onClick={() => handleSizeChange(-0.25)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 p-0"
                    onClick={() => handleSizeChange(0.25)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1">
                <label className="text-xs font-medium mb-1 block">Rotation</label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 p-0"
                    onClick={() => handleRotate(-45)}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 flex-1 p-0"
                    onClick={() => handleRotate(45)}
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-xs font-medium mb-1 block">Color</label>
              <div className="space-y-1">
                {/* Color Slider */}
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-6 rounded cursor-pointer"
                />
                
                {/* Color Presets */}
                <div className="grid grid-cols-4 gap-1">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      className="h-6 rounded border-2 hover:scale-110 transition-transform"
                      style={{
                        backgroundColor: preset.value,
                        borderColor: currentColor === preset.value ? "#000" : "transparent",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorChange(preset.value);
                      }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Delete Button */}
            <div className="pt-1.5 border-t">
              <Button
                variant="destructive"
                size="sm"
                className="w-full h-8"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3 mr-1.5" />
                Delete Icon
              </Button>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
