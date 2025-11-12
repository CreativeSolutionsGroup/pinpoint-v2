"use client";

import { useRef, useEffect, useState } from "react";
import { MapState, MapIcon } from "./types";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2, Trash2 } from "lucide-react";
import {
  Pin,
  Flag,
  Circle,
  Square,
  Star,
  Info,
  MapPin,
  DoorOpen,
  DoorClosed,
  Utensils,
  Wine,
  Coffee,
  Wifi,
  Camera,
  Car,
  Bike,
} from "lucide-react";
import {
  ATMIcon,
  FirstAidIcon,
  SecurityIcon,
  ChargingStationIcon,
  LostAndFoundIcon,
  VIPIcon,
  MeetingPointIcon,
  SeatingIcon,
  CoatCheckIcon,
  TicketBoothIcon,
  EmergencyExitIcon,
  MerchandiseIcon,
  PodiumIcon,
  AccessibleIcon,
  BabyChangingIcon,
} from "./icons/custom-icons";

const iconComponents = {
  // Lucide React icons
  pin: Pin,
  flag: Flag,
  circle: Circle,
  square: Square,
  star: Star,
  info: Info,
  "map-pin": MapPin,
  "door-open": DoorOpen,
  "door-closed": DoorClosed,
  utensils: Utensils,
  wine: Wine,
  coffee: Coffee,
  wifi: Wifi,
  camera: Camera,
  car: Car,
  bike: Bike,

  // Custom icons
  atm: ATMIcon,
  "first-aid": FirstAidIcon,
  security: SecurityIcon,
  "charging-station": ChargingStationIcon,
  "lost-found": LostAndFoundIcon,
  vip: VIPIcon,
  "meeting-point": MeetingPointIcon,
  seating: SeatingIcon,
  "coat-check": CoatCheckIcon,
  "ticket-booth": TicketBoothIcon,
  "emergency-exit": EmergencyExitIcon,
  merchandise: MerchandiseIcon,
  podium: PodiumIcon,
  accessible: AccessibleIcon,
  "baby-changing": BabyChangingIcon,
};

interface EventMapProps {
  mapState: MapState;
  onIconDrop: (icon: MapIcon, x: number, y: number) => void;
  onIconMove: (iconId: string, x: number, y: number) => void;
  onIconDelete: (iconId: string) => void;
  onZoom: (delta: number) => void;
  onPan: (deltaX: number, deltaY: number) => void;
}

export function EventMap({
  mapState,
  onIconDrop,
  onIconMove,
  onIconDelete,
  onZoom,
  onPan,
}: EventMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingIcon, setDraggingIcon] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const updateSize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      draw();
    };

    const draw = () => {
      const { width, height } = canvas;
      const { zoom, panX, panY } = mapState;

      // Clear canvas
      ctx.fillStyle = "#fafafa";
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = "#e5e5e5";
      ctx.lineWidth = 1;

      const gridSize = 50 * zoom;
      const offsetX = (panX % gridSize) + width / 2;
      const offsetY = (panY % gridSize) + height / 2;

      // Vertical lines
      for (let x = offsetX % gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = offsetY % gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw center cross
      ctx.strokeStyle = "#d4d4d4";
      ctx.lineWidth = 2;
      const centerX = panX + width / 2;
      const centerY = panY + height / 2;

      ctx.beginPath();
      ctx.moveTo(centerX - 20, centerY);
      ctx.lineTo(centerX + 20, centerY);
      ctx.moveTo(centerX, centerY - 20);
      ctx.lineTo(centerX, centerY + 20);
      ctx.stroke();

      // Draw placed icons (we'll render them as DOM elements instead for better icon rendering)
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, [mapState]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const iconData = e.dataTransfer.getData("icon");
    if (!iconData) return;

    const icon: MapIcon = JSON.parse(iconData);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - mapState.panX;
    const y = e.clientY - rect.top - mapState.panY;

    onIconDrop(icon, x, y);
  };

  const handleIconMouseDown = (e: React.MouseEvent, iconId: string) => {
    e.stopPropagation();
    const icon = mapState.placedIcons.find((i) => i.id === iconId);
    if (!icon) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDraggingIcon(iconId);
    setSelectedIcon(iconId);
    setDragOffset({
      x: e.clientX - rect.left - icon.x - mapState.panX,
      y: e.clientY - rect.top - icon.y - mapState.panY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (draggingIcon) {
      const x = e.clientX - rect.left - dragOffset.x - mapState.panX;
      const y = e.clientY - rect.top - dragOffset.y - mapState.panY;
      onIconMove(draggingIcon, x, y);
    } else if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      onPan(deltaX, deltaY);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setDraggingIcon(null);
    setIsPanning(false);
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggingIcon) {
      // Left click for panning
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedIcon(null);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    onZoom(delta);
  };

  const handleReset = () => {
    onPan(-mapState.panX, -mapState.panY);
    onZoom(1 - mapState.zoom);
  };

  const handleDeleteSelected = () => {
    if (selectedIcon) {
      onIconDelete(selectedIcon);
      setSelectedIcon(null);
    }
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMapMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Render placed icons as DOM elements */}
      {mapState.placedIcons.map((icon) => {
        const IconComponent = iconComponents[icon.icon as keyof typeof iconComponents] || Pin;
        const isSelected = selectedIcon === icon.id;
        const isHovered = hoveredIcon === icon.id;

        return (
          <div
            key={icon.id}
            className={`absolute cursor-move transition-transform ${
              isSelected ? "ring-2 ring-blue-500 ring-offset-2 scale-110" : ""
            } ${isHovered && !isSelected ? "scale-105" : ""}`}
            style={{
              left: `${icon.x + mapState.panX}px`,
              top: `${icon.y + mapState.panY}px`,
              transform: `translate(-50%, -50%) scale(${mapState.zoom})`,
              transformOrigin: "center",
            }}
            onMouseDown={(e) => handleIconMouseDown(e, icon.id)}
            onMouseEnter={() => setHoveredIcon(icon.id)}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            <div
              className="w-12 h-12 rounded-lg shadow-lg flex items-center justify-center"
              style={{ backgroundColor: `${icon.color}40`, border: `2px solid ${icon.color}` }}
            >
              <IconComponent className="w-6 h-6" style={{ color: icon.color }} />
            </div>
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap"
              style={{ fontSize: `${12 / mapState.zoom}px` }}
            >
              {icon.label}
            </div>
          </div>
        );
      })}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="outline"
          className="bg-white dark:bg-neutral-900 shadow-md"
          onClick={() => onZoom(0.1)}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="bg-white dark:bg-neutral-900 shadow-md"
          onClick={() => onZoom(-0.1)}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="bg-white dark:bg-neutral-900 shadow-md"
          onClick={handleReset}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
        {selectedIcon && (
          <Button
            size="icon"
            variant="outline"
            className="bg-red-50 dark:bg-red-950 shadow-md border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900"
            onClick={handleDeleteSelected}
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </Button>
        )}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 bg-white dark:bg-neutral-900 px-3 py-2 rounded-md shadow-md text-sm">
        <span className="text-neutral-600 dark:text-neutral-400">
          Zoom: {Math.round(mapState.zoom * 100)}%
        </span>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-neutral-900 px-4 py-3 rounded-md shadow-md text-sm max-w-md">
        <p className="text-neutral-600 dark:text-neutral-400">
          <span className="font-semibold">Tip:</span> Drag icons from the sidebar to the map. Click and drag to pan. Scroll to zoom.
        </p>
      </div>
    </div>
  );
}
