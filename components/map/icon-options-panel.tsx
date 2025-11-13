"use client";

import { MapIcon } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCw, Maximize2, Palette } from "lucide-react";

interface IconOptionsPanelProps {
  selectedIcon: MapIcon | null;
  onUpdate: (updates: Partial<MapIcon>) => void;
}

export function IconOptionsPanel({ selectedIcon, onUpdate }: IconOptionsPanelProps) {
  if (!selectedIcon) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No icon selected
      </div>
    );
  }

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

      {/* Position (read-only for reference) */}
      <div className="space-y-1.5 pt-2 border-t">
        <Label className="text-xs font-medium text-muted-foreground">
          Position
        </Label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground">X:</span>
            <span className="ml-1">{selectedIcon.position.x.toFixed(2)}%</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-muted-foreground">Y:</span>
            <span className="ml-1">{selectedIcon.position.y.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
