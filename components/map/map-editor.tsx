"use client";

import { useState, useRef } from "react";
import { MapCanvas } from "./map-canvas";
import { IconPalette } from "./icon-palette";
import { LayersPanel } from "./layers-panel";
import { MapIcon, IconType, Connector, Layer } from "./types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Drama, Armchair, Utensils, Coffee, WashingMachine, 
  DoorOpen, DoorClosed, ParkingSquare, Info, Cross,
  Speaker, Camera, ShoppingBag, ClipboardPen, Shield, Wifi,
  Music, Mic, Beer, Wine, Pizza, IceCream, Sandwich, Apple,
  MapPin, Flag, Star, Heart, Zap, Gift, Ticket, Trophy,
  Users, User, Baby, Dog, Cat, Trees, Flower2, Leaf,
  Sun, Moon, Cloud, CloudRain, Snowflake, Umbrella,
  Bus, Car, Bike, Train, Plane, Ship, Ambulance, FireExtinguisher,
  Book, Laptop, Printer, Phone, Mail, MessageSquare, Bell, Megaphone,
  Home, Building, Building2, Church, Hotel, Hospital, School, Store,
  Dumbbell, Volleyball, CircleDot, Award, Medal,
  Lightbulb, Flame, Battery, Plug, Radio, Tv, Gamepad2,
  Scissors, Wrench, Hammer, Paintbrush, Palette, Brush,
  ShoppingCart, CreditCard, Wallet, DollarSign, Coins, Banknote,
  Clock, Calendar, AlarmClock, Timer, Hourglass, Watch
} from "lucide-react";

// Sample icon types - you can customize these
const DEFAULT_ICON_TYPES: IconType[] = [
  // Event & Entertainment
  { type: "stage", label: "Stage", icon: "Drama", color: "#ef4444" },
  { type: "music", label: "Music", icon: "Music", color: "#ec4899" },
  { type: "mic", label: "Microphone", icon: "Mic", color: "#a855f7" },
  { type: "speaker", label: "Speaker", icon: "Speaker", color: "#14b8a6" },
  { type: "photo", label: "Photo Spot", icon: "Camera", color: "#f97316" },
  { type: "gamepad", label: "Gaming", icon: "Gamepad2", color: "#8b5cf6" },
  { type: "tv", label: "Display", icon: "Tv", color: "#6366f1" },
  
  // Food & Beverages
  { type: "food", label: "Food Stand", icon: "Utensils", color: "#f59e0b" },
  { type: "pizza", label: "Pizza", icon: "Pizza", color: "#ea580c" },
  { type: "sandwich", label: "Sandwich", icon: "Sandwich", color: "#facc15" },
  { type: "apple", label: "Snacks", icon: "Apple", color: "#22c55e" },
  { type: "icecream", label: "Ice Cream", icon: "IceCream", color: "#06b6d4" },
  { type: "drinks", label: "Drinks", icon: "Coffee", color: "#06b6d4" },
  { type: "beer", label: "Beer", icon: "Beer", color: "#f59e0b" },
  { type: "wine", label: "Wine", icon: "Wine", color: "#dc2626" },
  
  // Seating & Areas
  { type: "seating", label: "Seating", icon: "Armchair", color: "#3b82f6" },
  { type: "users", label: "Group Area", icon: "Users", color: "#8b5cf6" },
  { type: "user", label: "Individual", icon: "User", color: "#6366f1" },
  
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
  
  // Buildings & Structures
  { type: "home", label: "Home", icon: "Home", color: "#3b82f6" },
  { type: "building", label: "Building", icon: "Building", color: "#64748b" },
  { type: "office", label: "Office", icon: "Building2", color: "#6366f1" },
  { type: "church", label: "Chapel", icon: "Church", color: "#8b5cf6" },
  { type: "hotel", label: "Hotel", icon: "Hotel", color: "#06b6d4" },
  { type: "hospital", label: "Hospital", icon: "Hospital", color: "#ef4444" },
  { type: "school", label: "School", icon: "School", color: "#f59e0b" },
  { type: "store", label: "Store", icon: "Store", color: "#ec4899" },
  
  // Transportation
  { type: "bus", label: "Bus Stop", icon: "Bus", color: "#f59e0b" },
  { type: "car", label: "Vehicle", icon: "Car", color: "#3b82f6" },
  { type: "bike", label: "Bike", icon: "Bike", color: "#10b981" },
  { type: "train", label: "Train", icon: "Train", color: "#6366f1" },
  { type: "plane", label: "Airport", icon: "Plane", color: "#0ea5e9" },
  { type: "ship", label: "Boat", icon: "Ship", color: "#06b6d4" },
  
  // Sports & Recreation
  { type: "sports", label: "Sports", icon: "Volleyball", color: "#f97316" },
  { type: "ball", label: "Ball", icon: "CircleDot", color: "#22c55e" },
  { type: "gym", label: "Gym", icon: "Dumbbell", color: "#dc2626" },
  { type: "trophy", label: "Awards", icon: "Trophy", color: "#facc15" },
  { type: "medal", label: "Medal", icon: "Medal", color: "#f59e0b" },
  { type: "award", label: "Achievement", icon: "Award", color: "#a855f7" },
  
  // Nature & Weather
  { type: "tree", label: "Trees", icon: "Trees", color: "#22c55e" },
  { type: "flower", label: "Garden", icon: "Flower2", color: "#ec4899" },
  { type: "leaf", label: "Nature", icon: "Leaf", color: "#10b981" },
  { type: "sun", label: "Sunny", icon: "Sun", color: "#facc15" },
  { type: "moon", label: "Night", icon: "Moon", color: "#6366f1" },
  { type: "cloud", label: "Cloudy", icon: "Cloud", color: "#94a3b8" },
  { type: "rain", label: "Rain", icon: "CloudRain", color: "#0ea5e9" },
  { type: "snow", label: "Snow", icon: "Snowflake", color: "#06b6d4" },
  { type: "umbrella", label: "Umbrella", icon: "Umbrella", color: "#3b82f6" },
  
  // Animals
  { type: "dog", label: "Dog Area", icon: "Dog", color: "#f59e0b" },
  { type: "cat", label: "Cat Area", icon: "Cat", color: "#8b5cf6" },
  { type: "baby", label: "Kids Area", icon: "Baby", color: "#ec4899" },
  
  // Communication & Tech
  { type: "phone", label: "Phone", icon: "Phone", color: "#10b981" },
  { type: "mail", label: "Mail", icon: "Mail", color: "#3b82f6" },
  { type: "message", label: "Message", icon: "MessageSquare", color: "#06b6d4" },
  { type: "megaphone", label: "Announce", icon: "Megaphone", color: "#f97316" },
  { type: "bell", label: "Alert", icon: "Bell", color: "#ef4444" },
  { type: "laptop", label: "Computer", icon: "Laptop", color: "#6366f1" },
  { type: "printer", label: "Printer", icon: "Printer", color: "#64748b" },
  { type: "book", label: "Library", icon: "Book", color: "#8b5cf6" },
  
  // Utilities & Tools
  { type: "lightbulb", label: "Idea", icon: "Lightbulb", color: "#facc15" },
  { type: "flame", label: "Fire", icon: "Flame", color: "#ef4444" },
  { type: "battery", label: "Power", icon: "Battery", color: "#22c55e" },
  { type: "plug", label: "Charging", icon: "Plug", color: "#10b981" },
  { type: "radio", label: "Radio", icon: "Radio", color: "#6366f1" },
  { type: "scissors", label: "Scissors", icon: "Scissors", color: "#64748b" },
  { type: "wrench", label: "Tools", icon: "Wrench", color: "#f59e0b" },
  { type: "hammer", label: "Workshop", icon: "Hammer", color: "#dc2626" },
  { type: "paintbrush", label: "Art", icon: "Paintbrush", color: "#ec4899" },
  { type: "palette", label: "Paint", icon: "Palette", color: "#a855f7" },
  { type: "brush", label: "Design", icon: "Brush", color: "#f97316" },
  
  // Financial
  { type: "creditcard", label: "Payment", icon: "CreditCard", color: "#3b82f6" },
  { type: "wallet", label: "Wallet", icon: "Wallet", color: "#8b5cf6" },
  { type: "dollar", label: "Money", icon: "DollarSign", color: "#22c55e" },
  { type: "coins", label: "Coins", icon: "Coins", color: "#f59e0b" },
  { type: "banknote", label: "Cash", icon: "Banknote", color: "#10b981" },
  
  // Time & Scheduling
  { type: "clock", label: "Clock", icon: "Clock", color: "#6366f1" },
  { type: "calendar", label: "Calendar", icon: "Calendar", color: "#3b82f6" },
  { type: "alarm", label: "Alarm", icon: "AlarmClock", color: "#ef4444" },
  { type: "timer", label: "Timer", icon: "Timer", color: "#f97316" },
  { type: "hourglass", label: "Wait", icon: "Hourglass", color: "#8b5cf6" },
  { type: "watch", label: "Watch", icon: "Watch", color: "#64748b" },
  
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
  Music, Mic, Beer, Wine, Pizza, IceCream, Sandwich, Apple,
  MapPin, Flag, Star, Heart, Zap, Gift, Ticket, Trophy,
  Users, User, Baby, Dog, Cat, Trees, Flower2, Leaf,
  Sun, Moon, Cloud, CloudRain, Snowflake, Umbrella,
  Bus, Car, Bike, Train, Plane, Ship, Ambulance, FireExtinguisher,
  Book, Laptop, Printer, Phone, Mail, MessageSquare, Bell, Megaphone,
  Home, Building, Building2, Church, Hotel, Hospital, School, Store,
  Dumbbell, Volleyball, CircleDot, Medal, Award,
  Lightbulb, Flame, Battery, Plug, Radio, Tv, Gamepad2,
  Scissors, Wrench, Hammer, Paintbrush, Palette, Brush,
  ShoppingCart, CreditCard, Wallet, DollarSign, Coins, Banknote,
  Clock, Calendar, AlarmClock, Timer, Hourglass, Watch
};

interface MapEditorProps {
  mapImageUrl?: string;
  initialIcons?: MapIcon[];
  initialConnectors?: Connector[];
  availableIconTypes?: IconType[];
  onIconsChange?: (icons: MapIcon[]) => void;
  onConnectorsChange?: (connectors: Connector[]) => void;
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
  availableIconTypes = DEFAULT_ICON_TYPES,
  onIconsChange,
  onConnectorsChange,
  onIconMoveComplete,
  onConnectorMoveComplete,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: MapEditorProps) {
  const [icons, setIcons] = useState<MapIcon[]>(initialIcons);
  const [connectors, setConnectors] = useState<Connector[]>(initialConnectors);
  const [layers, setLayers] = useState<Layer[]>([
    { id: "default", name: "Default", visible: true, locked: false }
  ]);
  const [currentLayer, setCurrentLayer] = useState<string>("default");
  const [showLayers, setShowLayers] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const mapData = {
      version: "1.0",
      icons,
      connectors,
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

        setIcons(updatedIcons);
        setConnectors(updatedConnectors);
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
        />
      </div>

      {/* Layers Panel - Right Sidebar (Collapsible) */}
      <div className="border rounded-lg bg-card shrink-0 flex">
        {/* Toggle button sidebar - always visible */}
        <div className="w-12 flex flex-col items-center p-2 border-r">
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
          <div className="w-56">
            <LayersPanel
              layers={layers}
              onLayersChange={setLayers}
              currentLayer={currentLayer}
              onCurrentLayerChange={setCurrentLayer}
            />
          </div>
        )}
      </div>
    </div>
  );
}
