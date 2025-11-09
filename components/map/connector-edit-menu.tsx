"use client";

import { useState } from "react";
import { Connector, ConnectorStyle } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Edit, Trash2 } from "lucide-react";

interface ConnectorEditMenuProps {
  connector: Connector;
  onUpdate: (updates: Partial<Connector>) => void;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
}

const LINE_STYLES: { value: ConnectorStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const CONNECTOR_COLORS = [
  { value: "#64748b", label: "Gray" },
  { value: "#ef4444", label: "Red" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#10b981", label: "Green" },
  { value: "#f59e0b", label: "Orange" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#ec4899", label: "Pink" },
];

export function ConnectorEditMenu({ 
  connector, 
  onUpdate, 
  onDelete, 
  onOpenChange 
}: ConnectorEditMenuProps) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(connector.label || "");
  const [description, setDescription] = useState(connector.description || "");

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange(newOpen);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    onUpdate({ label: newLabel });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    onUpdate({ description: newDescription });
  };

  const handleColorChange = (color: string) => {
    onUpdate({ color });
  };

  const handleStyleChange = (style: ConnectorStyle) => {
    onUpdate({ style });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value);
    if (!isNaN(width) && width >= 1 && width <= 10) {
      onUpdate({ width });
    }
  };

  const handleDelete = () => {
    onDelete();
    handleOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-6 w-6 rounded-full shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          {/* Label */}
          <div>
            <label className="text-xs font-medium mb-1 block">Label</label>
            <Input
              value={label}
              onChange={handleLabelChange}
              placeholder="Connector label"
              className="h-7 text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <Input
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Optional description"
              className="h-7 text-xs"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-medium mb-1 block">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {CONNECTOR_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    connector.color === colorOption.value || (!connector.color && colorOption.value === "#64748b")
                      ? "border-primary scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => handleColorChange(colorOption.value)}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-xs font-medium mb-1 block">Line Style</label>
            <div className="flex gap-1">
              {LINE_STYLES.map((styleOption) => (
                <Button
                  key={styleOption.value}
                  variant={
                    (connector.style || "solid") === styleOption.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => handleStyleChange(styleOption.value)}
                >
                  {styleOption.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Width */}
          <div>
            <label className="text-xs font-medium mb-1 block">
              Width: {connector.width || 2}px
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={connector.width || 2}
              onChange={handleWidthChange}
              className="w-full"
            />
          </div>

          {/* Delete */}
          <Button
            variant="destructive"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete Connector
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
