"use client";

import { TextElement } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RotateCw, Maximize2, Palette, Trash2, Type, Move } from "lucide-react";

interface TextOptionsPanelProps {
  selectedText: TextElement | null;
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
}

export function TextOptionsPanel({ 
  selectedText, 
  onUpdate, 
  onDelete 
}: TextOptionsPanelProps) {
  if (!selectedText) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No text selected
      </div>
    );
  }

  const currentRotation = selectedText.rotation || 0;
  const currentSize = selectedText.size || 1;
  const currentFontSize = selectedText.fontSize || 16;
  const currentColor = selectedText.color || "#000000";

  return (
    <div className="p-3 space-y-4">
      {/* Text Content */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5" />
          Text Content
        </Label>
        <Input
          defaultValue={selectedText.text}
          onBlur={(e) => onUpdate({ text: e.target.value })}
          className="text-sm"
          placeholder="Enter text..."
          key={selectedText.id} // Reset input when text changes
        />
      </div>

      {/* Position */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Move className="h-3.5 w-3.5" />
          Position
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label htmlFor="text-x" className="text-xs text-muted-foreground">
              X Position
            </Label>
            <Input
              id="text-x"
              type="number"
              value={selectedText.position.x.toFixed(2)}
              onChange={(e) => {
                const newX = parseFloat(e.target.value);
                if (!isNaN(newX) && newX >= 0 && newX <= 100) {
                  onUpdate({ position: { ...selectedText.position, x: newX } });
                }
              }}
              className="h-7 text-xs"
              step="0.1"
              min="0"
              max="100"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="text-y" className="text-xs text-muted-foreground">
              Y Position
            </Label>
            <Input
              id="text-y"
              type="number"
              value={selectedText.position.y.toFixed(2)}
              onChange={(e) => {
                const newY = parseFloat(e.target.value);
                if (!isNaN(newY) && newY >= 0 && newY <= 100) {
                  onUpdate({ position: { ...selectedText.position, y: newY } });
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

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Font Size</Label>
          <span className="text-xs text-muted-foreground">{currentFontSize}px</span>
        </div>
        <Slider
          value={[currentFontSize]}
          onValueCommit={(values: number[]) => onUpdate({ fontSize: values[0] })}
          min={8}
          max={72}
          step={1}
          className="w-full"
        />
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ fontSize: 12 })}
          >
            Small
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ fontSize: 16 })}
          >
            Medium
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ fontSize: 24 })}
          >
            Large
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ fontSize: 36 })}
          >
            XL
          </Button>
        </div>
      </div>

      {/* Color */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5" />
          Text Color
        </Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={currentColor}
            onChange={(e) => onUpdate({ color: e.target.value })}
            className="h-8 w-16 p-1 cursor-pointer"
          />
          <Input
            defaultValue={currentColor}
            onBlur={(e) => onUpdate({ color: e.target.value })}
            className="h-8 text-sm flex-1"
            placeholder="#000000"
            key={`color-${selectedText.id}`}
          />
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
          onValueCommit={(values: number[]) => onUpdate({ rotation: values[0] })}
          min={0}
          max={360}
          step={1}
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

      {/* Scale */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5" />
            Scale
          </Label>
          <span className="text-xs text-muted-foreground">{currentSize.toFixed(2)}x</span>
        </div>
        <Slider
          value={[currentSize]}
          onValueCommit={(values: number[]) => onUpdate({ size: values[0] })}
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
            onClick={() => onUpdate({ size: 2 })}
          >
            2x
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => onUpdate({ size: 3 })}
          >
            3x
          </Button>
        </div>
      </div>

      {/* Delete Button */}
      <div className="pt-2 border-t">
        <Button
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={() => {
            if (confirm("Delete this text?")) {
              onDelete();
            }
          }}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Text
        </Button>
      </div>
    </div>
  );
}
