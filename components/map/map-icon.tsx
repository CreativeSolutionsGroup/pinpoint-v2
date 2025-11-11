"use client";

import { MapIcon as MapIconType } from "./types";
import { useState, useEffect, useRef } from "react";
import { iconComponents } from "./map-editor";
import { IconEditMenu } from "./icon-edit-menu";

interface MapIconProps {
  icon: MapIconType;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onMoveComplete?: (id: string, position: { x: number; y: number }) => void;
  onUpdate: (id: string, updates: Partial<MapIconType>) => void;
  onDelete: (id: string) => void;
  onCopy?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onClick?: (iconId: string) => void;
  onDragStart?: (id: string) => void;
  isConnectMode?: boolean;
  isConnectStart?: boolean;
  isSelected?: boolean;
}

export function MapIcon({ 
  icon, 
  onMove, 
  onMoveComplete, 
  onUpdate, 
  onDelete,
  onCopy,
  onDuplicate,
  onClick,
  onDragStart,
  isConnectMode = false,
  isConnectStart = false,
  isSelected = false,
}: MapIconProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const finalPositionRef = useRef({ x: icon.position.x, y: icon.position.y });

  const currentSize = icon.size || 1;
  const currentRotation = icon.rotation || 0;

  const handleMouseDown = (e: React.MouseEvent) => {
    // In connect mode, handle clicks instead of dragging
    if (isConnectMode) {
      e.preventDefault();
      e.stopPropagation();
      onClick?.(icon.id);
      return;
    }

    // Only drag icon with left mouse button and no modifier keys
    if (e.button !== 0 || e.shiftKey) {
      return;
    }
    
    e.preventDefault();
    const iconElement = e.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - iconElement.left - iconElement.width / 2,
      y: e.clientY - iconElement.top - iconElement.height / 2,
    };
    
    // Notify that drag is starting (for group drag tracking)
    onDragStart?.(icon.id);
    
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.getElementById("map-canvas");
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const x = ((e.clientX - canvasRect.left - dragOffsetRef.current.x) / canvasRect.width) * 100;
      const y = ((e.clientY - canvasRect.top - dragOffsetRef.current.y) / canvasRect.height) * 100;

      // Clamp position within canvas
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      finalPositionRef.current = { x: clampedX, y: clampedY };
      onMove(icon.id, { x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Call onMoveComplete when dragging ends
      if (onMoveComplete) {
        onMoveComplete(icon.id, finalPositionRef.current);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, icon.id, onMove, onMoveComplete]);

  const IconComponent = iconComponents[icon.icon as keyof typeof iconComponents];

  // Calculate label margin based on icon size to prevent overlap
  // At 1x, the icon is 32px but scaled from center, so bottom is at 16px from top
  // Original margin was 2px (mt-0.5), but we need to account for scaling
  // When scaled, only the visual radius changes: (currentSize - 1) * 16px
  const extraSpace = Math.max(0, (currentSize - 1) * 16); // Additional space when scaled beyond 1x
  const labelMarginTop = 2 + extraSpace;

  return (
    <div
      className={`absolute group map-icon-container ${
        isConnectMode ? "cursor-pointer" : "cursor-move"
      }`}
      style={{
        left: `${icon.position.x}%`,
        top: `${icon.position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex flex-col items-center">
        {/* Icon with scaling and rotation */}
        <div
          className={`relative transition-all ${
            isDragging ? "opacity-75 scale-110" : ""
          } ${isConnectStart ? "animate-pulse" : ""}`}
          style={{
            transform: `scale(${currentSize}) rotate(${currentRotation}deg)`,
            transformOrigin: "center center",
          }}
        >
          <div
            className={`flex items-center justify-center ${
              isConnectStart ? "ring-4 ring-primary ring-offset-2" : ""
            } ${isConnectMode && isHovered ? "ring-2 ring-primary ring-offset-1" : ""} ${isSelected ? "ring-4 ring-blue-400/50 ring-offset-2" : ""} rounded-full`}
          >
            {IconComponent && (
              <IconComponent 
                className="w-8 h-8 drop-shadow-lg" 
                style={{ color: icon.color || "#3b82f6", strokeWidth: 1.5 }}
              />
            )}
          </div>
        </div>
        
        {/* Label below icon (not transformed) - margin scales with icon size */}
        <div 
          className="px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded max-w-28 text-center truncate leading-tight"
          style={{ marginTop: `${labelMarginTop}px` }}
        >
          {icon.label}
        </div>
      </div>
      
      {/* Menu button positioned outside all transforms, at top-right of where circular icon appears */}
      {(isHovered || isMenuOpen) && !isDragging && !isConnectMode && (
        <IconEditMenu
          icon={icon}
          onUpdate={(updates) => onUpdate(icon.id, updates)}
          onDelete={() => onDelete(icon.id)}
          onCopy={() => onCopy?.(icon.id)}
          onDuplicate={() => onDuplicate?.(icon.id)}
          onOpenChange={setIsMenuOpen}
        />
      )}
    </div>
  );
}
