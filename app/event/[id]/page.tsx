"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { Plus, Search, Pencil, Check } from "lucide-react";
import { MapEditor } from "@/components/map";
import type { MapIconType, Connector, Layer } from "@/components/map";
import { useState } from "react";

interface MapState {
  icons: MapIconType[];
  connectors: Connector[];
}

export default function EventPage() {
  const [eventName, setEventName] = useState("Placeholder Event Name");
  const [isEditingName, setIsEditingName] = useState(false);
  const [map1Icons, setMap1Icons] = useState<MapIconType[]>([]);
  const [map2Icons, setMap2Icons] = useState<MapIconType[]>([]);
  const [map1Connectors, setMap1Connectors] = useState<Connector[]>([]);
  const [map2Connectors, setMap2Connectors] = useState<Connector[]>([]);
  const [map1Layers, setMap1Layers] = useState<Layer[]>([
    { id: "default", name: "Default", visible: true, locked: false }
  ]);
  const [map2Layers, setMap2Layers] = useState<Layer[]>([
    { id: "default", name: "Default", visible: true, locked: false }
  ]);
  const [map1CurrentLayer, setMap1CurrentLayer] = useState<string>("default");
  const [map2CurrentLayer, setMap2CurrentLayer] = useState<string>("default");
  const [history, setHistory] = useState<MapState[]>([{ 
    icons: [], 
    connectors: []
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [activeTab, setActiveTab] = useState("location-1");

  const setCurrentIcons = activeTab === "location-1" ? setMap1Icons : setMap2Icons;
  const setCurrentConnectors = activeTab === "location-1" ? setMap1Connectors : setMap2Connectors;
  const setCurrentLayers = activeTab === "location-1" ? setMap1Layers : setMap2Layers;
  const setCurrentCurrentLayer = activeTab === "location-1" ? setMap1CurrentLayer : setMap2CurrentLayer;
  const currentIcons = activeTab === "location-1" ? map1Icons : map2Icons;
  const currentConnectors = activeTab === "location-1" ? map1Connectors : map2Connectors;

  // Live update handler - updates display but doesn't add to history
  const handleIconsChange = (newIcons: MapIconType[]) => {
    setCurrentIcons(newIcons);
  };

  const handleConnectorsChange = (newConnectors: Connector[]) => {
    setCurrentConnectors(newConnectors);
  };

  const handleLayersChange = (newLayers: Layer[]) => {
    setCurrentLayers(newLayers);
  };

  const handleCurrentLayerChange = (newCurrentLayer: string) => {
    setCurrentCurrentLayer(newCurrentLayer);
  };

  // Move complete handler - adds to history only when icon is dropped or moved
  const handleIconMoveComplete = (newIcons: MapIconType[]) => {
    const newState: MapState = { 
      icons: newIcons, 
      connectors: currentConnectors
    };
    saveToHistory(newState);
  };

  // Connector complete handler - adds to history when connector is added/edited/deleted
  const handleConnectorMoveComplete = (newConnectors: Connector[]) => {
    const newState: MapState = { 
      icons: currentIcons, 
      connectors: newConnectors
    };
    saveToHistory(newState);
  };

  const saveToHistory = (newState: MapState) => {
    // Only add to history if the state actually changed
    const currentState = history[historyIndex];
    if (JSON.stringify(currentState) === JSON.stringify(newState)) {
      return;
    }

    setCurrentIcons(newState.icons);
    setCurrentConnectors(newState.connectors);
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setCurrentIcons(state.icons);
      setCurrentConnectors(state.connectors);
      setForceUpdate(prev => prev + 1); // Force re-render
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex];
      setCurrentIcons(state.icons);
      setCurrentConnectors(state.connectors);
      setForceUpdate(prev => prev + 1); // Force re-render
    }
  };

  const handleNameEdit = () => {
    if (isEditingName) {
      setIsEditingName(false);
    } else {
      setIsEditingName(true);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingName(false);
    }
  };

  return (
    <div className="flex flex-col h-full py-2 pr-2">
      <div className="h-10 bg-muted rounded-md px-3 flex items-center shrink-0">
        {isEditingName ? (
          <Input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={handleNameKeyDown}
            className="h-7 text-lg font-normal border-none bg-transparent p-0 focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <h1 className="text-lg cursor-pointer hover:text-primary" onClick={handleNameEdit}>
            {eventName}
          </h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-2 h-7 w-7 p-0"
          onClick={handleNameEdit}
        >
          {isEditingName ? <Check className="h-3 w-3" /> : <Pencil className="h-3 w-3" />}
        </Button>
      </div>
      <div className="flex-1 flex flex-col border shadow-md rounded-md p-2 mt-2 min-h-0 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full gap-2">
          <div className="flex-1 min-h-0 overflow-hidden">
            <TabsContent value="location-1" className="h-full mt-0">
              <MapEditor
                key={`map-1-${forceUpdate}`}
                mapImageUrl="https://placehold.co/1200x800/1e293b/94a3b8?text=Campus+Map+1"
                initialIcons={map1Icons}
                initialConnectors={map1Connectors}
                initialLayers={map1Layers}
                initialCurrentLayer={map1CurrentLayer}
                onIconsChange={handleIconsChange}
                onConnectorsChange={handleConnectorsChange}
                onLayersChange={handleLayersChange}
                onCurrentLayerChange={handleCurrentLayerChange}
                onIconMoveComplete={handleIconMoveComplete}
                onConnectorMoveComplete={handleConnectorMoveComplete}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
              />
            </TabsContent>
            <TabsContent value="location-2" className="h-full mt-0">
              <MapEditor
                key={`map-2-${forceUpdate}`}
                mapImageUrl="https://placehold.co/1200x800/1e293b/94a3b8?text=Campus+Map+2"
                initialIcons={map2Icons}
                initialConnectors={map2Connectors}
                initialLayers={map2Layers}
                initialCurrentLayer={map2CurrentLayer}
                onIconsChange={handleIconsChange}
                onConnectorsChange={handleConnectorsChange}
                onLayersChange={handleLayersChange}
                onCurrentLayerChange={handleCurrentLayerChange}
                onIconMoveComplete={handleIconMoveComplete}
                onConnectorMoveComplete={handleConnectorMoveComplete}
                onUndo={handleUndo}
                onRedo={handleRedo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
              />
            </TabsContent>
            <TabsContent value="add-event" className="h-full mt-0">
              <div className="flex p-3 pt-1 items-center">
                <h1 className="text-lg">Add Location</h1>
                <div className="relative ml-auto">
                  <Input placeholder="Search location" className="ml-auto max-w-48" />
                  <Search className="absolute right-2 top-1.5 text-muted-foreground" />
                </div>
              </div>
              <div className="w-full h-[calc(100%-3.5rem)] flex flex-wrap gap-2 overflow-y-auto">
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              <div className="mx-auto w-1/6 h-1/3 bg-slate-800 animate-pulse rounded-md"></div>
              </div>
            </TabsContent>
          </div>
          <TabsList className="shrink-0">
            <TabsTrigger value="location-1">Location 1</TabsTrigger>
            <TabsTrigger value="location-2">Location 2</TabsTrigger>
            <TabsTrigger value="add-event">
              <Plus />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
