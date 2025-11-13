"use client";

import { IconType } from "./types";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { iconComponents } from "./map-editor";

interface IconPaletteProps {
  icons: IconType[];
  onIconSelect: (iconType: IconType) => void;
}

interface IconCategory {
  name: string;
  icons: IconType[];
}

export function IconPalette({ icons, onIconSelect }: IconPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["Seating & Areas", "Food & Beverages"])
  );

  // Categorize icons
  const categories: IconCategory[] = [
    {
      name: "Seating & Areas",
      icons: icons.filter(icon => 
        ["seating", "users", "user"].includes(icon.type)
      )
    },
    {
      name: "Food & Beverages",
      icons: icons.filter(icon => 
        ["food", "pizza", "sandwich", "apple", "icecream", "drinks"].includes(icon.type)
      )
    },
    {
      name: "Facilities",
      icons: icons.filter(icon => 
        ["restroom", "entrance", "exit", "parking", "wifi"].includes(icon.type)
      )
    },
    {
      name: "Information & Services",
      icons: icons.filter(icon => 
        ["info", "registration", "merchandise", "shopping", "ticket", "gift"].includes(icon.type)
      )
    },
    {
      name: "Safety & Security",
      icons: icons.filter(icon => 
        ["first-aid", "security", "ambulance", "fire"].includes(icon.type)
      )
    },
    {
      name: "Entertainment",
      icons: icons.filter(icon => 
        ["speaker", "music", "mic", "camera", "stage"].includes(icon.type)
      )
    },
    {
      name: "Payment & Finance",
      icons: icons.filter(icon => 
        ["creditcard", "wallet", "dollar", "coins", "banknote"].includes(icon.type)
      )
    },
    {
      name: "Markers & Highlights",
      icons: icons.filter(icon => 
        ["pin", "flag", "star", "heart", "zap"].includes(icon.type)
      )
    }
  ].filter(category => category.icons.length > 0);

  const filteredCategories = searchQuery
    ? categories.map(category => ({
        ...category,
        icons: category.icons.filter(icon =>
          icon.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.icons.length > 0)
    : categories;

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

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
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.name} className="border-b last:border-b-0">
            <button
              onClick={() => toggleCategory(category.name)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors text-sm font-medium"
            >
              <span>{category.name}</span>
              {expandedCategories.has(category.name) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            {expandedCategories.has(category.name) && (
              <div className="p-2 bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  {category.icons.map((iconType) => {
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
                        <span className="text-[10px] text-center font-medium leading-tight">
                          {iconType.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-6">
            No icons found
          </div>
        )}
      </div>
    </div>
  );
}
