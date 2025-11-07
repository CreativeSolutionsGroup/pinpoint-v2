"use client";

import { IconType } from "./types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { iconComponents } from "./map-editor";

interface IconPaletteProps {
  icons: IconType[];
  onIconSelect: (iconType: IconType) => void;
}

export function IconPalette({ icons, onIconSelect }: IconPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIcons = icons.filter((icon) =>
    icon.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, iconType: IconType) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/json", JSON.stringify(iconType));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <div className="relative">
          <Input
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-2 gap-2">
          {filteredIcons.map((iconType) => {
            const IconComponent = iconComponents[iconType.icon as keyof typeof iconComponents];
            return (
              <div
                key={iconType.type}
                draggable
                onDragStart={(e) => handleDragStart(e, iconType)}
                onClick={() => onIconSelect(iconType)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary cursor-move transition-colors bg-card"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                  style={{ backgroundColor: iconType.color || "#3b82f6" }}
                >
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                </div>
                <span className="text-[10px] text-center font-medium leading-tight">{iconType.label}</span>
              </div>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-6">
            No icons found
          </div>
        )}
      </div>
    </div>
  );
}
