"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapCanvas } from "./map-canvas";
import { IconPalette } from "./icon-palette";
import { SidebarPanel } from "./sidebar-panel";
import { MapIcon, IconType, Connector, Layer } from "./types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Drama, Armchair, Utensils, Coffee, WashingMachine, 
  DoorOpen, DoorClosed, ParkingSquare, Info, Cross,
  Speaker, Camera, ShoppingBag, ClipboardPen, Shield, Wifi,
  Music, Mic, Pizza, IceCream, Sandwich, Apple,
  MapPin, Flag, Star, Heart, Zap, Gift, Ticket,
  Users, User, Ambulance, FireExtinguisher,
  ShoppingCart, CreditCard, Wallet, DollarSign, Coins, Banknote
} from "lucide-react";

// Sample icon types - you can customize these
const DEFAULT_ICON_TYPES: IconType[] = [
  // Seating & Areas
  { type: "seating", label: "Seating", icon: "Armchair", color: "#3b82f6" },
  { type: "users", label: "Group Area", icon: "Users", color: "#8b5cf6" },
  { type: "user", label: "Individual", icon: "User", color: "#6366f1" },
  
  // Food & Beverages
  { type: "food", label: "Food Stand", icon: "Utensils", color: "#f59e0b" },
  { type: "pizza", label: "Pizza", icon: "Pizza", color: "#ea580c" },
  { type: "sandwich", label: "Sandwich", icon: "Sandwich", color: "#facc15" },
  { type: "apple", label: "Snacks", icon: "Apple", color: "#22c55e" },
  { type: "icecream", label: "Ice Cream", icon: "IceCream", color: "#06b6d4" },
  { type: "drinks", label: "Drinks", icon: "Coffee", color: "#06b6d4" },
  
  // Facilities
  { type: "restroom", label: "Restroom", icon: "WashingMachine", color: "#8b5cf6" },
  { type: "entrance", label: "Entrance", icon: "DoorOpen", color: "#10b981" },
  { type: "exit", label: "Exit", icon: "DoorClosed", color: "#dc2626" },
  { type: "parking", label: "Parking", icon: "ParkingSquare", color: "#6366f1" },
  { type: "wifi", label: "WiFi Zone", icon: "Wifi", color: "#06b6d4" },
  
  // Information & Services
  { type: "info", label: "Info Booth", icon: "Info", color: "#0ea5e9" },
  { type: "registration", label: "Registration", icon: "ClipboardPen", color: "#22c55e" },
  { type: "merchandise", label: "Merch", icon: "ShoppingBag", color: "#a855f7" },
  { type: "shopping", label: "Shop", icon: "ShoppingCart", color: "#ec4899" },
  { type: "ticket", label: "Tickets", icon: "Ticket", color: "#f59e0b" },
  { type: "gift", label: "Gift Shop", icon: "Gift", color: "#ec4899" },
  
  // Safety & Security
  { type: "first-aid", label: "First Aid", icon: "Cross", color: "#ec4899" },
  { type: "security", label: "Security", icon: "Shield", color: "#64748b" },
  { type: "ambulance", label: "Medical", icon: "Ambulance", color: "#dc2626" },
  { type: "fire", label: "Fire Safety", icon: "FireExtinguisher", color: "#ef4444" },
  
  // Entertainment
  { type: "stage", label: "Stage", icon: "Drama", color: "#a855f7" },
  { type: "speaker", label: "Speaker", icon: "Speaker", color: "#6366f1" },
  { type: "music", label: "Music", icon: "Music", color: "#ec4899" },
  { type: "mic", label: "Microphone", icon: "Mic", color: "#f97316" },
  { type: "camera", label: "Photo Booth", icon: "Camera", color: "#0ea5e9" },
  
  // Payment & Finance
  { type: "creditcard", label: "Payment", icon: "CreditCard", color: "#3b82f6" },
  { type: "wallet", label: "Wallet", icon: "Wallet", color: "#8b5cf6" },
  { type: "dollar", label: "Money", icon: "DollarSign", color: "#22c55e" },
  { type: "coins", label: "Coins", icon: "Coins", color: "#f59e0b" },
  { type: "banknote", label: "Cash", icon: "Banknote", color: "#10b981" },
  
  // Markers & Highlights
  { type: "pin", label: "Location", icon: "MapPin", color: "#ef4444" },
  { type: "flag", label: "Flag", icon: "Flag", color: "#dc2626" },
  { type: "star", label: "Star", icon: "Star", color: "#facc15" },
  { type: "heart", label: "Favorite", icon: "Heart", color: "#ec4899" },
  { type: "zap", label: "Special", icon: "Zap", color: "#f59e0b" },
];

export const iconComponents = {
  Drama, Armchair, Utensils, Coffee, WashingMachine,
  DoorOpen, DoorClosed, ParkingSquare, Info, Cross,
  Speaker, Camera, ShoppingBag, ClipboardPen, Shield, Wifi,
  Music, Mic, Pizza, IceCream, Sandwich, Apple,
  MapPin, Flag, Star, Heart, Zap, Gift, Ticket,
  Users, User, Ambulance, FireExtinguisher,
  ShoppingCart, CreditCard, Wallet, DollarSign, Coins, Banknote
};

interface MapEditorProps {
  mapImageUrl?: string;
  initialIcons?: MapIcon[];
  initialConnectors?: Connector[];
  initialLayers?: Layer[];
  initialCurrentLayer?: string;
  availableIconTypes?: IconType[];
  onIconsChange?: (icons: MapIcon[]) => void;
  onConnectorsChange?: (connectors: Connector[]) => void;
  onLayersChange?: (layers: Layer[]) => void;
  onCurrentLayerChange?: (currentLayer: string) => void;
  onIconMoveComplete?: (icons: MapIcon[]) => void;
  onConnectorMoveComplete?: (connectors: Connector[]) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function MapEditor({
  mapImageUrl = "/campus-map-placeholder.jpg",
  initialIcons = [],
  initialConnectors = [],
  initialLayers = [{ id: "default", name: "Default", visible: true, locked: false }],
  initialCurrentLayer = "default",
  availableIconTypes = DEFAULT_ICON_TYPES,
  onIconsChange,
  onConnectorsChange,
  onLayersChange,
  onCurrentLayerChange,
  onIconMoveComplete,
  onConnectorMoveComplete,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: MapEditorProps) {
  const [icons, setIcons] = useState<MapIcon[]>(initialIcons);
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [currentLayer, setCurrentLayer] = useState<string>(initialCurrentLayer);
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());
  const [showLayers, setShowLayers] = useState<boolean>(true);
  const [layersPanelWidth, setLayersPanelWidth] = useState<number>(224); // Default w-56 = 224px
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const resizeStartRef = useRef<{ width: number; mouseX: number }>({ width: 224, mouseX: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the first selected icon (for single selection)
  const selectedIcon = selectedIconIds.size === 1 
    ? icons.find(icon => selectedIconIds.has(icon.id)) || null
    : null;

  // Constants for resize limits
  const MIN_PANEL_WIDTH = 180; // Minimum width in pixels
  const MAX_PANEL_WIDTH = 400; // Maximum width in pixels

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Store the starting width and mouse position
    resizeStartRef.current = {
      width: layersPanelWidth,
      mouseX: e.clientX,
    };
    setIsResizing(true);
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    // Calculate the delta (how much the mouse moved)
    const deltaX = resizeStartRef.current.mouseX - e.clientX;
    
    // New width = starting width + delta (moving left increases width)
    const newWidth = resizeStartRef.current.width + deltaX;
    
    // Clamp width between min and max
    const clampedWidth = Math.max(MIN_PANEL_WIDTH, Math.min(MAX_PANEL_WIDTH, newWidth));
    setLayersPanelWidth(clampedWidth);
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add event listeners for resize
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleResizeMove);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const handleExport = () => {
    const mapData = {
      version: "1.0",
      icons,
      connectors,
      layers,
      currentLayer,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(mapData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `map-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Map exported successfully");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const mapData = JSON.parse(content);

        if (!mapData.icons || !Array.isArray(mapData.icons)) {
          throw new Error("Invalid map file format");
        }

        const updatedIcons = mapData.icons;
        const updatedConnectors = mapData.connectors || [];
        const updatedLayers = mapData.layers || [
          { id: "default", name: "Default", visible: true, locked: false }
        ];
        const updatedCurrentLayer = mapData.currentLayer || "default";

        setIcons(updatedIcons);
        setConnectors(updatedConnectors);
        setLayers(updatedLayers);
        setCurrentLayer(updatedCurrentLayer);
        onIconsChange?.(updatedIcons);
        onConnectorsChange?.(updatedConnectors);
        onIconMoveComplete?.(updatedIcons);
        if (onConnectorMoveComplete) {
          onConnectorMoveComplete(updatedConnectors);
        }

        toast.success(`Imported ${updatedIcons.length} icons and ${updatedConnectors.length} connectors`);
      } catch (error) {
        toast.error("Failed to import map file");
        console.error("Import error:", error);
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddIcon = (iconType: IconType, position: { x: number; y: number }) => {
    const newIcon: MapIcon = {
      id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: iconType.type,
      label: iconType.label,
      icon: iconType.icon,
      color: iconType.color,
      position,
      rotation: 0,
      size: 1,
      layer: currentLayer, // Assign to current layer
    };

    const updatedIcons = [...icons, newIcon];
    setIcons(updatedIcons);
    onIconsChange?.(updatedIcons);
    onIconMoveComplete?.(updatedIcons); // Also add to history when adding new icon
  };

  const handleIconsChange = (updatedIcons: MapIcon[]) => {
    setIcons(updatedIcons);
    onIconsChange?.(updatedIcons);
  };

  const handleConnectorsChange = (updatedConnectors: Connector[]) => {
    setConnectors(updatedConnectors);
    onConnectorsChange?.(updatedConnectors);
  };

  const handleLayersChange = (updatedLayers: Layer[]) => {
    setLayers(updatedLayers);
    onLayersChange?.(updatedLayers);
  };

  const handleCurrentLayerChange = (updatedCurrentLayer: string) => {
    setCurrentLayer(updatedCurrentLayer);
    onCurrentLayerChange?.(updatedCurrentLayer);
  };

  const handleIconUpdate = (updates: Partial<MapIcon>) => {
    if (!selectedIcon) return;
    
    const updatedIcons = icons.map(icon =>
      icon.id === selectedIcon.id ? { ...icon, ...updates } : icon
    );
    handleIconsChange(updatedIcons);
    onIconMoveComplete?.(updatedIcons);
  };

  return (
    <div className="flex h-full gap-2">
      {/* Icon Palette - Left Sidebar */}
      <div className="w-56 border rounded-lg bg-card shrink-0 flex flex-col">
        {/* Export/Import buttons */}
        <div className="p-2 border-b flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8"
            onClick={handleExport}
            title="Export Map"
          >
            <Upload className="h-3.5 w-3.5 mr-1" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8"
            onClick={() => fileInputRef.current?.click()}
            title="Import Map"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        {/* Icon Palette */}
        <div className="flex-1 overflow-hidden">
          <IconPalette icons={availableIconTypes} onIconSelect={(iconType) => {
            // Add icon to center when clicked
            handleAddIcon(iconType, { x: 50, y: 50 });
          }} />
        </div>
      </div>

      {/* Map Canvas - Main area */}
      <div className="flex-1">
        <MapCanvas
          mapImageUrl={mapImageUrl}
          icons={icons}
          connectors={connectors}
          layers={layers}
          onIconsChange={handleIconsChange}
          onConnectorsChange={handleConnectorsChange}
          onIconMoveComplete={onIconMoveComplete}
          onConnectorMoveComplete={onConnectorMoveComplete}
          onAddIcon={handleAddIcon}
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onSelectionChange={setSelectedIconIds}
        />
      </div>

      {/* Layers Panel - Right Sidebar (Collapsible & Resizable) */}
      <div 
        className="border rounded-lg bg-card shrink-0 flex relative"
        style={{ 
          width: showLayers ? `${layersPanelWidth + 40}px` : '40px' // +40px for toggle button width
        }}
      >
        {/* Resize handle - only visible when panel is open */}
        {showLayers && (
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 active:bg-primary transition-colors z-10"
            onMouseDown={handleResizeStart}
            style={{
              cursor: isResizing ? 'ew-resize' : 'ew-resize',
            }}
          />
        )}

        {/* Toggle button sidebar - always visible */}
        <div className="w-10 flex flex-col items-center p-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowLayers(!showLayers)}
            title={showLayers ? "Hide Layers Panel" : "Show Layers Panel"}
          >
            {showLayers ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Layers panel content (collapsible) */}
        {showLayers && (
          <div style={{ width: `${layersPanelWidth}px` }}>
            <SidebarPanel
              layers={layers}
              onLayersChange={handleLayersChange}
              currentLayer={currentLayer}
              onCurrentLayerChange={handleCurrentLayerChange}
              selectedIcon={selectedIcon}
              onIconUpdate={handleIconUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
