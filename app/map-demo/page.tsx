"use client";

import { useState, useCallback, useRef } from "react";
import { MapEditor } from "@/components/map";
import { MapIcon, Connector, Layer, Drawing } from "@/components/map/types";

interface MapState {
  icons: MapIcon[];
  connectors: Connector[];
  layers: Layer[];
  currentLayer: string;
  drawings: Drawing[];
}

export default function MapDemo() {
  const [history, setHistory] = useState<MapState[]>([{
    icons: [],
    connectors: [],
    layers: [{ id: "default", name: "Default", visible: true, locked: false }],
    currentLayer: "default",
    drawings: [],
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const currentState = history[historyIndex];

  const addToHistory = useCallback((newState: Partial<MapState>) => {
    if (isUndoRedoRef.current) {
      return; // Don't add to history if this is an undo/redo operation
    }

    setHistoryIndex((prevIndex) => {
      setHistory((prevHistory) => {
        const currentState = prevHistory[prevIndex];
        const updatedState = { ...currentState, ...newState };
        const newHistory = prevHistory.slice(0, prevIndex + 1);
        newHistory.push(updatedState);
        
        // Limit history to 50 states
        if (newHistory.length > 50) {
          newHistory.shift();
        }
        
        return newHistory;
      });
      
      // Return new index
      return prevIndex + 1;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isUndoRedoRef.current = true;
      setHistoryIndex(historyIndex - 1);
      // Reset flag after state updates
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      isUndoRedoRef.current = true;
      setHistoryIndex(historyIndex + 1);
      // Reset flag after state updates
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [historyIndex, history.length]);

  return (
    <div className="h-screen p-4">
      <div className="h-full flex flex-col gap-4">
        <div className="bg-muted rounded-lg px-4 py-3">
          <h1 className="text-2xl font-bold">Pinpoint Map Demo</h1>
          <p className="text-sm text-muted-foreground">
            Drag icons from the left palette onto the map, or click them to place at center
          </p>
        </div>
        <div className="flex-1">
          <MapEditor
            mapImageUrl="https://placehold.co/1600x1200/1e293b/94a3b8?text=Campus+Map+Demo"
            initialIcons={currentState.icons}
            initialConnectors={currentState.connectors}
            initialLayers={currentState.layers}
            initialCurrentLayer={currentState.currentLayer}
            initialDrawings={currentState.drawings}
            onIconMoveComplete={(icons) => addToHistory({ icons })}
            onConnectorMoveComplete={(connectors) => addToHistory({ connectors })}
            onIconsChange={(icons) => {
              if (!isUndoRedoRef.current) {
                addToHistory({ icons });
              }
            }}
            onConnectorsChange={(connectors) => {
              if (!isUndoRedoRef.current) {
                addToHistory({ connectors });
              }
            }}
            onLayersChange={(layers) => addToHistory({ layers })}
            onCurrentLayerChange={(currentLayer) => addToHistory({ currentLayer })}
            onDrawingsChange={(drawings) => addToHistory({ drawings })}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        </div>
      </div>
    </div>
  );
}
