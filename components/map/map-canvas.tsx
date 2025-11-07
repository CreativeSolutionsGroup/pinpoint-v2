"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapIcon as MapIconComponent } from "./map-icon";
import { MapIcon as MapIconType, IconType } from "./types";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapCanvasProps {
  mapImageUrl: string;
  icons: MapIconType[];
  onIconsChange: (icons: MapIconType[]) => void;
  onIconMoveComplete?: (icons: MapIconType[]) => void;
  onAddIcon?: (iconType: IconType, position: { x: number; y: number }) => void;
}

export function MapCanvas({
  mapImageUrl,
  icons,
  onIconsChange,
  onIconMoveComplete,
  onAddIcon,
}: MapCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

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
      
      if (!clickedOnIcon || e.button === 1 || e.shiftKey) {
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
    }
  }, [isPanning, panStart]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

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
  };

  // Handle panning with mouse
  useEffect(() => {
    if (isPanning) {
      window.addEventListener("mousemove", handlePanMove);
      window.addEventListener("mouseup", handlePanEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handlePanMove);
      window.removeEventListener("mouseup", handlePanEnd);
    };
  }, [isPanning, handlePanMove, handlePanEnd]);

  return (
    <div className="relative w-full h-full bg-muted rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
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
        className="w-full h-full overflow-hidden"
        onMouseDown={handlePanStart}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        <div
          id="map-canvas"
          ref={canvasRef}
          className="relative w-full h-full"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onWheel={handleWheel}
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

          {/* Placed Icons */}
          {icons.map((icon) => (
            <MapIconComponent
              key={icon.id}
              icon={icon}
              onMove={handleIconMove}
              onMoveComplete={handleIconMoveComplete}
              onUpdate={handleIconUpdate}
              onDelete={handleIconDelete}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-[10px] leading-tight">
        Drag icons to add • Move icons • Drag map to pan • Scroll to zoom
      </div>
    </div>
  );
}
