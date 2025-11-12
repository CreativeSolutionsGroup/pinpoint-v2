"use client";

import { MapIcon } from "./types";
import { Card } from "@/components/ui/card";
import { Pin, Flag, Circle, Triangle, Square, Star, Navigation } from "lucide-react";

const iconComponents = {
  pin: Pin,
  flag: Flag,
  circle: Circle,
  triangle: Triangle,
  square: Square,
  star: Star,
  navigation: Navigation,
};

interface IconLegendProps {
  icons: MapIcon[];
}

export function IconLegend({ icons }: IconLegendProps) {
  const handleDragStart = (e: React.DragEvent, icon: MapIcon) => {
    e.dataTransfer.setData("icon", JSON.stringify(icon));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
        Drag icons to map
      </h3>
      {icons.map((icon) => {
        const IconComponent = iconComponents[icon.icon as keyof typeof iconComponents] || Pin;

        return (
          <Card
            key={icon.id}
            draggable
            onDragStart={(e) => handleDragStart(e, icon)}
            className="p-3 cursor-move hover:shadow-md transition-shadow border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ backgroundColor: `${icon.color}20`, color: icon.color }}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {icon.label}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {icon.type}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
