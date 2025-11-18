"use client";

import { Layer, MapIcon, Drawing, DrawingTool, TextElement } from "./types";
import { LayersPanel } from "./layers-panel";
import { IconOptionsPanel } from "./icon-options-panel";
import { TextPanel } from "./text-panel";
import { TextOptionsPanel } from "./text-options-panel";
import { DrawingPanel } from "./drawing-panel";
import { ChevronDown, ChevronRight, Layers, Settings, PenTool, Type } from "lucide-react";
import { useState } from "react";

interface SidebarPanelProps {
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  currentLayer: string;
  onCurrentLayerChange: (layerId: string) => void;
  selectedIcon: MapIcon | null;
  selectedIcons: MapIcon[];
  onIconUpdate: (updates: Partial<MapIcon>) => void;
  onGroupUpdate: (iconId: string, updates: Partial<MapIcon>) => void;
  onIconDelete: () => void;
  onGroupDelete: () => void;
  // Text props
  texts: TextElement[];
  selectedText: TextElement | null;
  onTextAdd: (text: TextElement) => void;
  onTextUpdate: (updates: Partial<TextElement>) => void;
  onTextDelete: () => void;
  // Drawing props
  drawings: Drawing[];
  selectedDrawingTool: DrawingTool;
  onDrawingToolChange: (tool: DrawingTool) => void;
  drawingColor: string;
  onDrawingColorChange: (color: string) => void;
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

export function SidebarPanel({
  layers,
  onLayersChange,
  currentLayer,
  onCurrentLayerChange,
  selectedIcon,
  selectedIcons,
  onIconUpdate,
  onGroupUpdate,
  onIconDelete,
  onGroupDelete,
  texts,
  selectedText,
  onTextAdd,
  onTextUpdate,
  onTextDelete,
  drawings,
  selectedDrawingTool,
  onDrawingToolChange,
  drawingColor,
  onDrawingColorChange,
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
}: SidebarPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["layers", "options", "text", "drawing"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {/* Layers Section */}
        <div className="border-b">
        <button
          onClick={() => toggleSection("layers")}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Layers</span>
          </div>
          {expandedSections.has("layers") ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {expandedSections.has("layers") && (
          <div className="max-h-64 overflow-y-auto">
            <LayersPanel
              layers={layers}
              onLayersChange={onLayersChange}
              currentLayer={currentLayer}
              onCurrentLayerChange={onCurrentLayerChange}
            />
          </div>
        )}
      </div>

      {/* Icon Options Section */}
      <div className="border-b">
        <button
          onClick={() => toggleSection("options")}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Icon Options</span>
            {selectedIcons.length > 1 ? (
              <span className="text-xs text-muted-foreground">({selectedIcons.length} icons)</span>
            ) : selectedIcon && (
              <span className="text-xs text-muted-foreground">({selectedIcon.label})</span>
            )}
          </div>
          {expandedSections.has("options") ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {expandedSections.has("options") && (
          <div className="overflow-y-auto">
            <IconOptionsPanel 
              selectedIcon={selectedIcon}
              selectedIcons={selectedIcons}
              onUpdate={onIconUpdate}
              onGroupUpdate={onGroupUpdate}
              onDelete={onIconDelete}
              onGroupDelete={onGroupDelete}
            />
          </div>
        )}
        </div>

        {/* Text Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection("text")}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors text-sm font-medium"
          >
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <span>Text</span>
              {texts.length > 0 && (
                <span className="text-xs text-muted-foreground">({texts.length})</span>
              )}
              {selectedText && (
                <span className="text-xs text-muted-foreground">({selectedText.text.substring(0, 20)}{selectedText.text.length > 20 ? "..." : ""})</span>
              )}
            </div>
            {expandedSections.has("text") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has("text") && (
            <div className="overflow-y-auto">
              {selectedText ? (
                <TextOptionsPanel 
                  selectedText={selectedText}
                  onUpdate={onTextUpdate}
                  onDelete={onTextDelete}
                />
              ) : (
                <TextPanel 
                  onTextAdd={onTextAdd}
                  currentLayer={currentLayer}
                />
              )}
            </div>
          )}
        </div>

        {/* Drawing Section */}
        <div className="border-b">
          <button
            onClick={() => toggleSection("drawing")}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent transition-colors text-sm font-medium"
          >
            <div className="flex items-center gap-2">
              <PenTool className="h-4 w-4" />
              <span>Drawing Tools</span>
              {drawings.length > 0 && (
                <span className="text-xs text-muted-foreground">({drawings.length})</span>
              )}
            </div>
            {expandedSections.has("drawing") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {expandedSections.has("drawing") && (
            <div className="overflow-y-auto">
              <DrawingPanel
                drawings={drawings}
                selectedTool={selectedDrawingTool}
                onToolChange={onDrawingToolChange}
                drawingColor={drawingColor}
                onColorChange={onDrawingColorChange}
                strokeWidth={strokeWidth}
                onStrokeWidthChange={onStrokeWidthChange}
                fillColor={fillColor}
                onFillColorChange={onFillColorChange}
                enableFill={enableFill}
                onEnableFillChange={onEnableFillChange}
                isDrawing={isDrawing}
                onDrawingModeToggle={onDrawingModeToggle}
                onDrawingDelete={onDrawingDelete}
                onDrawingUpdate={onDrawingUpdate}
                onClearAllDrawings={onClearAllDrawings}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
