"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapIcon as MapIconComponent } from "./map-icon";
import { MapConnector } from "./map-connector";
import { MapIcon as MapIconType, IconType, Connector } from "./types";
import { ZoomIn, ZoomOut, Maximize2, Link, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MapCanvasProps {
  mapImageUrl: string;
  icons: MapIconType[];
  connectors?: Connector[];
  onIconsChange: (icons: MapIconType[]) => void;
  onConnectorsChange?: (connectors: Connector[]) => void;
  onIconMoveComplete?: (icons: MapIconType[]) => void;
  onConnectorMoveComplete?: (connectors: Connector[]) => void;
  onAddIcon?: (iconType: IconType, position: { x: number; y: number }) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function MapCanvas({
  mapImageUrl,
  icons,
  connectors = [],
  onIconsChange,
  onConnectorsChange,
  onIconMoveComplete,
  onConnectorMoveComplete,
  onAddIcon,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: MapCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectStartIconId, setConnectStartIconId] = useState<string | null>(null);
  const [copiedIcon, setCopiedIcon] = useState<MapIconType | null>(null);
  const [copiedIcons, setCopiedIcons] = useState<MapIconType[]>([]);
  const [selectedIconIds, setSelectedIconIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 }); // Track mouse position as percentage
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePanStart = (e: React.MouseEvent) => {
    // Allow panning with left click (unless clicking on an icon), middle mouse, or Shift + left click
    if (e.button === 0 || e.button === 1) {
      // Only start panning if clicking on the background (not an icon)
      const target = e.target as HTMLElement;
      const clickedOnIcon = target.closest('.map-icon-container');
      
      // Start drag selection with Ctrl/Cmd key (not shift - that's for pan)
      if (!clickedOnIcon && e.button === 0 && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        if (!containerRef.current) return;
        
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setIsSelecting(true);
        setSelectionStart({ x, y });
        setSelectionEnd({ x, y });
        return; // Important: return early to prevent panning
      }
      
      // Clear selection when clicking on empty space (without Ctrl)
      if (!clickedOnIcon && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        setSelectedIconIds(new Set());
      }
      
      // Only start panning if NOT selecting
      if ((!clickedOnIcon || e.button === 1 || e.shiftKey) && !(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handlePanMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isSelecting && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const selX = e.clientX - rect.left;
      const selY = e.clientY - rect.top;
      setSelectionEnd({ x: selX, y: selY });
    }
  }, [isPanning, panStart, isSelecting]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
    
    // Finalize selection
    if (isSelecting) {
      setIsSelecting(false);
      
      // Calculate selection bounds in canvas coordinates
      const minX = Math.min(selectionStart.x, selectionEnd.x);
      const maxX = Math.max(selectionStart.x, selectionEnd.x);
      const minY = Math.min(selectionStart.y, selectionEnd.y);
      const maxY = Math.max(selectionStart.y, selectionEnd.y);
      
      // Find icons within selection bounds
      const selected = new Set<string>();
      icons.forEach(icon => {
        // Convert icon position (percentage) to viewport pixels
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        // Icon position formula: (percentage / 100) * width * zoom + pan
        const iconX = (icon.position.x / 100) * rect.width * zoom + pan.x;
        const iconY = (icon.position.y / 100) * rect.height * zoom + pan.y;
        
        if (iconX >= minX && iconX <= maxX && iconY >= minY && iconY <= maxY) {
          selected.add(icon.id);
        }
      });
      
      setSelectedIconIds(selected);
      toast.success(`${selected.size} icon${selected.size !== 1 ? 's' : ''} selected`);
    }
  }, [isSelecting, selectionStart, selectionEnd, icons, zoom, pan]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Convert mouse position from viewport coordinates to canvas percentage
    // Account for pan and zoom transformations
    const x = (((e.clientX - rect.left) - pan.x) / zoom / rect.width) * 100;
    const y = (((e.clientY - rect.top) - pan.y) / zoom / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const container = canvasRef.current.parentElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate the point under the mouse in the canvas coordinate system
    const pointX = (mouseX - pan.x) / zoom;
    const pointY = (mouseY - pan.y) / zoom;
    
    // Update zoom
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
    
    // Calculate new pan to keep the mouse point in the same position
    const newPan = {
      x: mouseX - pointX * newZoom,
      y: mouseY - pointY * newZoom,
    };
    
    setZoom(newZoom);
    setPan(newPan);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!canvasRef.current || !onAddIcon) return;

    try {
      const iconType: IconType = JSON.parse(e.dataTransfer.getData("application/json"));
      const rect = canvasRef.current.getBoundingClientRect();
      
      // Calculate position accounting for zoom and pan
      const x = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * 100;
      const y = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * 100;

      // Clamp position
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      onAddIcon(iconType, { x: clampedX, y: clampedY });
    } catch (error) {
      console.error("Failed to parse dropped icon data:", error);
    }
  };

  const handleIconMove = (id: string, position: { x: number; y: number }) => {
    const updatedIcons = icons.map((icon) =>
      icon.id === id ? { ...icon, position } : icon
    );
    onIconsChange(updatedIcons);
  };

  const handleIconMoveComplete = (id: string, position: { x: number; y: number }) => {
    const updatedIcons = icons.map((icon) =>
      icon.id === id ? { ...icon, position } : icon
    );
    onIconMoveComplete?.(updatedIcons);
  };

  const handleIconUpdate = (id: string, updates: Partial<MapIconType>) => {
    const updatedIcons = icons.map((icon) =>
      icon.id === id ? { ...icon, ...updates } : icon
    );
    onIconsChange(updatedIcons);
    onIconMoveComplete?.(updatedIcons); // Save to history when updating properties
  };

  const handleIconDelete = (id: string) => {
    const updatedIcons = icons.filter((icon) => icon.id !== id);
    onIconsChange(updatedIcons);
    onIconMoveComplete?.(updatedIcons); // Also save to history when deleting
    
    // Also delete any connectors connected to this icon
    if (onConnectorsChange) {
      const updatedConnectors = connectors.filter(
        (conn) => conn.startIconId !== id && conn.endIconId !== id
      );
      onConnectorsChange(updatedConnectors);
      onConnectorMoveComplete?.(updatedConnectors);
    }
  };

  const handleIconClick = (iconId: string) => {
    if (!isConnectMode) return;

    if (!connectStartIconId) {
      // First icon selected - start connection
      setConnectStartIconId(iconId);
    } else if (connectStartIconId === iconId) {
      // Clicked the same icon - cancel
      setConnectStartIconId(null);
    } else {
      // Check if a connector already exists between these two icons (in either direction)
      const connectorExists = connectors.some(
        (conn) =>
          (conn.startIconId === connectStartIconId && conn.endIconId === iconId) ||
          (conn.startIconId === iconId && conn.endIconId === connectStartIconId)
      );

      if (connectorExists) {
        // Show notification that connector already exists
        toast.info("Connector Already Exists", {
          description: "A connector already exists between these two icons."
        });
        // Reset and exit connect mode
        setConnectStartIconId(null);
        setIsConnectMode(false);
        return;
      }

      // Second icon selected - create connection
      const newConnector: Connector = {
        id: `connector-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startIconId: connectStartIconId,
        endIconId: iconId,
        color: "#64748b",
        width: 2,
        style: "solid",
      };

      if (onConnectorsChange) {
        const updatedConnectors = [...connectors, newConnector];
        onConnectorsChange(updatedConnectors);
        onConnectorMoveComplete?.(updatedConnectors);
      }

      // Reset connection state
      setConnectStartIconId(null);
      setIsConnectMode(false);
    }
  };

  const handleConnectorUpdate = (id: string, updates: Partial<Connector>) => {
    if (!onConnectorsChange) return;

    const updatedConnectors = connectors.map((conn) =>
      conn.id === id ? { ...conn, ...updates } : conn
    );
    onConnectorsChange(updatedConnectors);
    onConnectorMoveComplete?.(updatedConnectors);
  };

  const handleConnectorDelete = (id: string) => {
    if (!onConnectorsChange) return;

    const updatedConnectors = connectors.filter((conn) => conn.id !== id);
    onConnectorsChange(updatedConnectors);
    onConnectorMoveComplete?.(updatedConnectors);
  };

  const toggleConnectMode = () => {
    setIsConnectMode(!isConnectMode);
    setConnectStartIconId(null);
  };

  const handleIconCopy = (id: string) => {
    const iconToCopy = icons.find((icon) => icon.id === id);
    if (iconToCopy) {
      setCopiedIcon(iconToCopy);
      toast.success("Icon Copied", {
        description: "Press Ctrl+V to paste the icon."
      });
    }
  };

  const handleIconDuplicate = (id: string) => {
    const iconToDuplicate = icons.find((icon) => icon.id === id);
    if (iconToDuplicate) {
      const newIcon: MapIconType = {
        ...iconToDuplicate,
        id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: Math.min(iconToDuplicate.position.x + 5, 95),
          y: Math.min(iconToDuplicate.position.y + 5, 95),
        },
      };
      const updatedIcons = [...icons, newIcon];
      onIconsChange(updatedIcons);
      onIconMoveComplete?.(updatedIcons);
      toast.success("Icon Duplicated");
    }
  };

  const handlePaste = useCallback(() => {
    // Handle multi-icon paste
    if (copiedIcons.length > 0) {
      // Calculate centroid of copied icons
      const centroidX = copiedIcons.reduce((sum, icon) => sum + icon.position.x, 0) / copiedIcons.length;
      const centroidY = copiedIcons.reduce((sum, icon) => sum + icon.position.y, 0) / copiedIcons.length;
      
      // Create new icons with positions relative to mouse position
      const newIcons = copiedIcons.map(icon => {
        const offsetX = icon.position.x - centroidX;
        const offsetY = icon.position.y - centroidY;
        
        return {
          ...icon,
          id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          position: {
            x: Math.max(0, Math.min(mousePosition.x + offsetX, 100)),
            y: Math.max(0, Math.min(mousePosition.y + offsetY, 100)),
          },
        };
      });
      
      const updatedIcons = [...icons, ...newIcons];
      onIconsChange(updatedIcons);
      onIconMoveComplete?.(updatedIcons);
      toast.success(`${newIcons.length} icon${newIcons.length !== 1 ? 's' : ''} pasted`);
      
      // Clear selection and select newly pasted icons
      setSelectedIconIds(new Set(newIcons.map(icon => icon.id)));
      return;
    }
    
    // Handle single icon paste (legacy)
    if (!copiedIcon) return;

    const newIcon: MapIconType = {
      ...copiedIcon,
      id: `icon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: Math.max(0, Math.min(mousePosition.x, 100)),
        y: Math.max(0, Math.min(mousePosition.y, 100)),
      },
    };
    const updatedIcons = [...icons, newIcon];
    onIconsChange(updatedIcons);
    onIconMoveComplete?.(updatedIcons);
    toast.success("Icon Pasted");
  }, [copiedIcons, copiedIcon, icons, mousePosition, onIconsChange, onIconMoveComplete]);

  // Handle keyboard shortcuts
  const handleCopy = useCallback(() => {
    if (selectedIconIds.size === 0) return;
    
    const selectedIcons = icons.filter(icon => selectedIconIds.has(icon.id));
    setCopiedIcons(selectedIcons);
    toast.success(`${selectedIcons.length} icon${selectedIcons.length !== 1 ? 's' : ''} copied`);
  }, [selectedIconIds, icons]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCopy, handlePaste]);

  // Handle panning and selecting with mouse
  useEffect(() => {
    if (isPanning || isSelecting) {
      window.addEventListener("mousemove", handlePanMove);
      window.addEventListener("mouseup", handlePanEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handlePanMove);
      window.removeEventListener("mouseup", handlePanEnd);
    };
  }, [isPanning, isSelecting, handlePanMove, handlePanEnd]);

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
        {/* Undo/Redo Controls - Horizontal row at top */}
        {(onUndo || onRedo) && (
          <div className="flex gap-1">
            {onUndo && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo"
              >
                <Undo className="h-3.5 w-3.5" />
              </Button>
            )}
            {onRedo && (
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo"
              >
                <Redo className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
        {/* Main controls - Vertical stack below, aligned right */}
        <Button
          variant={isConnectMode ? "default" : "secondary"}
          size="icon"
          className="h-8 w-8"
          onClick={toggleConnectMode}
          title={isConnectMode ? "Exit Connect Mode" : "Connect Icons"}
        >
          <Link className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8"
          onClick={handleResetView}
          title="Reset View"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-2 left-2 z-10 bg-secondary px-2 py-1 rounded text-xs font-medium">
        {Math.round(zoom * 100)}%
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden relative"
        onMouseDown={handlePanStart}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        {/* Selection Box - positioned relative to viewport, not canvas */}
        {isSelecting && (
          <div
            className="absolute border-2 border-blue-400 bg-blue-400/10 pointer-events-none z-20"
            style={{
              left: `${Math.min(selectionStart.x, selectionEnd.x)}px`,
              top: `${Math.min(selectionStart.y, selectionEnd.y)}px`,
              width: `${Math.abs(selectionEnd.x - selectionStart.x)}px`,
              height: `${Math.abs(selectionEnd.y - selectionStart.y)}px`,
            }}
          />
        )}
        
        <div
          id="map-canvas"
          ref={canvasRef}
          className="relative w-full h-full"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onWheel={handleWheel}
          onMouseMove={handleMouseMove}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
          }}
        >
          {/* Map Image */}
          <img
            src={mapImageUrl}
            alt="Campus Map"
            className="w-full h-full object-contain pointer-events-none select-none"
            draggable={false}
          />

          {/* Connectors Layer - SVG overlay */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ pointerEvents: "none" }}
          >
            <g style={{ pointerEvents: "auto" }}>
              {connectors.map((connector) => {
                const startIcon = icons.find((icon) => icon.id === connector.startIconId);
                const endIcon = icons.find((icon) => icon.id === connector.endIconId);
                return (
                  <MapConnector
                    key={connector.id}
                    connector={connector}
                    startIcon={startIcon}
                    endIcon={endIcon}
                    onUpdate={handleConnectorUpdate}
                    onDelete={handleConnectorDelete}
                  />
                );
              })}
            </g>
          </svg>

          {/* Placed Icons */}
          {icons.map((icon) => (
            <MapIconComponent
              key={icon.id}
              icon={icon}
              onMove={handleIconMove}
              onMoveComplete={handleIconMoveComplete}
              onUpdate={handleIconUpdate}
              onDelete={handleIconDelete}
              onCopy={handleIconCopy}
              onDuplicate={handleIconDuplicate}
              onClick={handleIconClick}
              isConnectMode={isConnectMode}
              isConnectStart={connectStartIconId === icon.id}
              isSelected={selectedIconIds.has(icon.id)}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-[10px] leading-tight">
        {isConnectMode ? (
          <>
            {connectStartIconId 
              ? "Click another icon to create connector • Click again to cancel"
              : "Click an icon to start connector"
            }
          </>
        ) : (
          "Drag icons to add • Move icons • Ctrl+Drag to select • Ctrl+C/V to copy/paste • Drag map to pan • Scroll to zoom"
        )}
      </div>
    </div>
  );
}
