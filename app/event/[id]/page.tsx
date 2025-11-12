"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Plus, Redo, Undo, Download, Upload } from "lucide-react";
import { EventMap } from "@/components/event-map/event-map";
import { IconLegend } from "@/components/event-map/icon-legend";
import { MapIcon, PlacedIcon, MapState } from "@/components/event-map/types";

const defaultIcons: MapIcon[] = [
  // Main Venues & Structures
  { id: "1", type: "stage", label: "Stage", icon: "flag", color: "#ef4444" },
  { id: "2", type: "booth", label: "Booth", icon: "square", color: "#3b82f6" },
  { id: "3", type: "entrance", label: "Entrance", icon: "door-open", color: "#10b981" },
  { id: "4", type: "exit", label: "Exit", icon: "door-closed", color: "#dc2626" },
  { id: "5", type: "emergency-exit", label: "Emergency Exit", icon: "emergency-exit", color: "#dc2626" },

  // Food & Beverage
  { id: "6", type: "food", label: "Food Stand", icon: "utensils", color: "#f59e0b" },
  { id: "7", type: "bar", label: "Bar", icon: "wine", color: "#8b5cf6" },
  { id: "8", type: "coffee", label: "Coffee", icon: "coffee", color: "#92400e" },

  // Facilities
  { id: "9", type: "restroom", label: "Restroom", icon: "circle", color: "#06b6d4" },
  { id: "10", type: "accessible", label: "Accessible Restroom", icon: "accessible", color: "#2563eb" },
  { id: "11", type: "baby-changing", label: "Baby Changing", icon: "baby-changing", color: "#ec4899" },

  // Services
  { id: "12", type: "info", label: "Information", icon: "info", color: "#06b6d4" },
  { id: "13", type: "ticket-booth", label: "Ticket Booth", icon: "ticket-booth", color: "#7c3aed" },
  { id: "14", type: "coat-check", label: "Coat Check", icon: "coat-check", color: "#64748b" },
  { id: "15", type: "lost-found", label: "Lost & Found", icon: "lost-found", color: "#ea580c" },
  { id: "16", type: "merchandise", label: "Merchandise", icon: "merchandise", color: "#059669" },

  // Medical & Safety
  { id: "17", type: "first-aid", label: "First Aid", icon: "first-aid", color: "#dc2626" },
  { id: "18", type: "security", label: "Security", icon: "security", color: "#1e40af" },

  // Technology & Utilities
  { id: "19", type: "wifi", label: "WiFi Zone", icon: "wifi", color: "#0891b2" },
  { id: "20", type: "charging", label: "Charging Station", icon: "charging-station", color: "#65a30d" },
  { id: "21", type: "atm", label: "ATM", icon: "atm", color: "#15803d" },

  // Special Areas
  { id: "22", type: "vip", label: "VIP Area", icon: "vip", color: "#fbbf24" },
  { id: "23", type: "meeting-point", label: "Meeting Point", icon: "meeting-point", color: "#f97316" },
  { id: "24", type: "photo-booth", label: "Photo Booth", icon: "camera", color: "#a855f7" },
  { id: "25", type: "seating", label: "Seating Area", icon: "seating", color: "#475569" },
  { id: "26", type: "podium", label: "Podium", icon: "podium", color: "#be123c" },

  // Transportation
  { id: "27", type: "parking", label: "Parking", icon: "car", color: "#4b5563" },
  { id: "28", type: "bike-parking", label: "Bike Parking", icon: "bike", color: "#14b8a6" },

  // Miscellaneous
  { id: "29", type: "landmark", label: "Landmark", icon: "star", color: "#ec4899" },
  { id: "30", type: "map-pin", label: "Custom Point", icon: "map-pin", color: "#6366f1" },
];

interface LocationState {
  name: string;
  mapState: MapState;
}

export default function EventPage() {
  const [locations, setLocations] = useState<LocationState[]>([
    {
      name: "Location 1",
      mapState: { zoom: 1, panX: 0, panY: 0, placedIcons: [] },
    },
    {
      name: "Location 2",
      mapState: { zoom: 1, panX: 0, panY: 0, placedIcons: [] },
    },
  ]);
  const [currentTab, setCurrentTab] = useState("location-0");
  const [history, setHistory] = useState<LocationState[][]>([locations]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentLocationIndex = currentTab === "add-location" ? -1 : parseInt(currentTab.split("-")[1]);

  // Update state with history tracking (for undoable actions)
  const updateLocationStateWithHistory = (index: number, newState: MapState) => {
    const newLocations = [...locations];
    newLocations[index] = { ...newLocations[index], mapState: newState };
    setLocations(newLocations);

    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newLocations);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Update state without history tracking (for non-undoable actions like zoom/pan)
  const updateLocationStateNoHistory = (index: number, newState: MapState) => {
    const newLocations = [...locations];
    newLocations[index] = { ...newLocations[index], mapState: newState };
    setLocations(newLocations);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setLocations(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setLocations(history[historyIndex + 1]);
    }
  };

  const handleAddLocation = () => {
    const newLocation: LocationState = {
      name: `Location ${locations.length + 1}`,
      mapState: { zoom: 1, panX: 0, panY: 0, placedIcons: [] },
    };
    setLocations([...locations, newLocation]);
    setCurrentTab(`location-${locations.length}`);
  };

  const handleIconDrop = (icon: MapIcon, x: number, y: number) => {
    if (currentLocationIndex === -1) return;
    const newIcon: PlacedIcon = {
      id: `${icon.type}-${Date.now()}`,
      type: icon.type,
      x,
      y,
      icon: icon.icon,
      color: icon.color,
      label: icon.label,
      size: 1, // Default size
    };

    const currentMapState = locations[currentLocationIndex].mapState;
    updateLocationStateWithHistory(currentLocationIndex, {
      ...currentMapState,
      placedIcons: [...currentMapState.placedIcons, newIcon],
    });
  };

  // Update icon position during drag (no history)
  const handleIconMove = (iconId: string, x: number, y: number) => {
    if (currentLocationIndex === -1) return;
    const currentMapState = locations[currentLocationIndex].mapState;
    updateLocationStateNoHistory(currentLocationIndex, {
      ...currentMapState,
      placedIcons: currentMapState.placedIcons.map((icon) =>
        icon.id === iconId ? { ...icon, x, y } : icon
      ),
    });
  };

  // Commit icon position when drag ends (with history)
  const handleIconMoveEnd = (iconId: string, x: number, y: number) => {
    if (currentLocationIndex === -1) return;
    const currentMapState = locations[currentLocationIndex].mapState;
    updateLocationStateWithHistory(currentLocationIndex, {
      ...currentMapState,
      placedIcons: currentMapState.placedIcons.map((icon) =>
        icon.id === iconId ? { ...icon, x, y } : icon
      ),
    });
  };

  const handleIconDelete = (iconId: string) => {
    if (currentLocationIndex === -1) return;
    const currentMapState = locations[currentLocationIndex].mapState;
    updateLocationStateWithHistory(currentLocationIndex, {
      ...currentMapState,
      placedIcons: currentMapState.placedIcons.filter((icon) => icon.id !== iconId),
    });
  };

  const handleZoom = (delta: number) => {
    if (currentLocationIndex === -1) return;
    const currentMapState = locations[currentLocationIndex].mapState;
    updateLocationStateNoHistory(currentLocationIndex, {
      ...currentMapState,
      zoom: Math.max(0.5, Math.min(3, currentMapState.zoom + delta)),
    });
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    if (currentLocationIndex === -1) return;
    const currentMapState = locations[currentLocationIndex].mapState;
    updateLocationStateNoHistory(currentLocationIndex, {
      ...currentMapState,
      panX: currentMapState.panX + deltaX,
      panY: currentMapState.panY + deltaY,
    });
  };

  const handleIconUpdate = (iconId: string, updates: Partial<PlacedIcon>) => {
    if (currentLocationIndex === -1) return;
    const currentMapState = locations[currentLocationIndex].mapState;
    updateLocationStateWithHistory(currentLocationIndex, {
      ...currentMapState,
      placedIcons: currentMapState.placedIcons.map((icon) =>
        icon.id === iconId ? { ...icon, ...updates } : icon
      ),
    });
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMapStateUpdate = (updates: Partial<MapState>) => {
    if (currentLocationIndex === -1) return;
    const currentMapState = locations[currentLocationIndex].mapState;
    updateLocationStateWithHistory(currentLocationIndex, {
      ...currentMapState,
      ...updates,
    });
  };

  const handleExportLocations = () => {
    const dataStr = JSON.stringify(locations, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `event-locations-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportLocations = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as LocationState[];
        setLocations(imported);
        setHistory([imported]);
        setHistoryIndex(0);
        setCurrentTab("location-0");
      } catch (error) {
        alert("Failed to import locations. Invalid file format.");
        console.error(error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-full py-2 pr-2">
      {/* Header - hidden in fullscreen */}
      {!isFullscreen && (
        <div className="flex-shrink-0 min-h-12 max-h-12 bg-muted rounded-md px-3 flex items-center gap-2">
          <h1 className="text-xl">Event Mapping</h1>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLocations}
              title="Export all locations"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('import-input')?.click()}
                title="Import locations"
              >
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
              <input
                id="import-input"
                type="file"
                accept=".json"
                onChange={handleImportLocations}
                className="hidden"
              />
            </label>
            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700" />
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 border shadow-md rounded-md overflow-hidden relative flex flex-col min-h-0 ${isFullscreen ? '' : 'mt-2'}`}>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex flex-col h-full">
          {/* Tab Contents - takes full height */}
          {locations.map((location, index) => (
            <TabsContent key={index} value={`location-${index}`} className="flex-1 m-0 data-[state=active]:flex h-full">
              <div className="flex h-full w-full">
                {/* Icon Legend Sidebar - hidden in fullscreen */}
                {!isFullscreen && (
                  <div className="w-72 h-full border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col flex-shrink-0">
                    <div className="p-4 pb-2 flex-shrink-0">
                      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {location.name}
                      </h2>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Drag icons to map
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0">
                      <IconLegend icons={defaultIcons} />
                    </div>
                  </div>
                )}

                {/* Map Area */}
                <div className="flex-1 relative min-w-0 min-h-0">
                  <EventMap
                    mapState={location.mapState}
                    onIconDrop={handleIconDrop}
                    onIconMove={handleIconMove}
                    onIconMoveEnd={handleIconMoveEnd}
                    onIconDelete={handleIconDelete}
                    onIconUpdate={handleIconUpdate}
                    onZoom={handleZoom}
                    onPan={handlePan}
                    onFullscreen={handleFullscreen}
                    isFullscreen={isFullscreen}
                    onMapStateUpdate={handleMapStateUpdate}
                  />
                </div>
              </div>
            </TabsContent>
          ))}

          <TabsContent value="add-location" className="flex-1 m-0 data-[state=active]:flex h-full">
            <div className="flex items-center justify-center h-full w-full">
              <Button onClick={handleAddLocation} size="lg">
                <Plus className="mr-2" />
                Create New Location
              </Button>
            </div>
          </TabsContent>

          {/* Floating Tab Selector at Bottom Left - hidden in fullscreen */}
          {!isFullscreen && (
            <TabsList className="absolute bottom-4 left-4 z-50 shadow-lg bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800">
              {locations.map((location, index) => (
                <TabsTrigger key={index} value={`location-${index}`}>
                  {location.name}
                </TabsTrigger>
              ))}
              <TabsTrigger value="add-location">
                <Plus />
              </TabsTrigger>
            </TabsList>
          )}
        </Tabs>
      </div>
    </div>
  );
}
