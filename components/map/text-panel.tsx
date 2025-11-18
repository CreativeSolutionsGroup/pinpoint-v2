"use client";

import { TextElement } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Type, Palette, Plus } from "lucide-react";
import { useState } from "react";

interface TextPanelProps {
  onTextAdd: (text: TextElement) => void;
  currentLayer: string;
}

export function TextPanel({
  onTextAdd,
  currentLayer,
}: TextPanelProps) {
  const [textContent, setTextContent] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(16);

  const handleAddText = () => {
    if (!textContent.trim()) {
      alert("Please enter some text");
      return;
    }

    const newText: TextElement = {
      id: `text-${Date.now()}`,
      text: textContent.trim(),
      position: { x: 50, y: 50 }, // Center of canvas
      color: textColor,
      rotation: 0,
      size: 1,
      fontSize: fontSize,
      layer: currentLayer || "default",
    };

    onTextAdd(newText);
    setTextContent(""); // Clear input after adding
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddText();
    }
  };

  return (
    <div className="p-3 space-y-4">
      {/* Text Input */}
      <div className="space-y-2">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Type className="h-3.5 w-3.5" />
          Text Content
        </Label>
        <Input
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter text..."
          className="text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Press Enter to add text to center of canvas
        </p>
      </div>

      {/* Text Color */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5" />
          Text Color
        </Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-8 w-16 p-1 cursor-pointer"
          />
          <Input
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            className="h-8 text-sm flex-1"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Font Size</Label>
          <span className="text-xs text-muted-foreground">{fontSize}px</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={(values: number[]) => setFontSize(values[0])}
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
            onClick={() => setFontSize(12)}
          >
            Small
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => setFontSize(16)}
          >
            Medium
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => setFontSize(24)}
          >
            Large
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 text-xs flex-1"
            onClick={() => setFontSize(36)}
          >
            XL
          </Button>
        </div>
      </div>

      {/* Add Text Button */}
      <Button
        onClick={handleAddText}
        className="w-full"
        size="sm"
        disabled={!textContent.trim()}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Text to Canvas
      </Button>
    </div>
  );
}
