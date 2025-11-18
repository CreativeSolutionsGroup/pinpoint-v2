"use client";

import { TextElement } from "./types";
import { useState, useEffect, useRef } from "react";

interface MapTextProps {
  text: TextElement;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onMoveComplete?: (id: string, position: { x: number; y: number }) => void;
  onClick?: (textId: string) => void;
  onDragStart?: (id: string) => void;
  isSelected?: boolean;
  isDrawingMode?: boolean;
  zIndex?: number;
}

export function MapText({ 
  text, 
  onMove, 
  onMoveComplete, 
  onClick,
  onDragStart,
  isSelected = false,
  isDrawingMode = false,
  zIndex = 0,
}: MapTextProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const finalPositionRef = useRef({ x: text.position.x, y: text.position.y });
  const mouseDownTimeRef = useRef<number>(0);
  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  const currentSize = text.size || 1;
  const currentRotation = text.rotation || 0;
  const baseFontSize = text.fontSize || 16;

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent all interaction in drawing mode
    if (isDrawingMode) {
      return;
    }

    // Only drag with left mouse button and no modifier keys
    if (e.button !== 0 || e.shiftKey) {
      return;
    }
    
    e.preventDefault();
    
    // Track mouse down time and position to detect click vs drag
    mouseDownTimeRef.current = Date.now();
    mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    
    const textElement = e.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - textElement.left - textElement.width / 2,
      y: e.clientY - textElement.top - textElement.height / 2,
    };
    
    // Notify that drag is starting
    onDragStart?.(text.id);
    
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

      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));
      
      finalPositionRef.current = { x: clampedX, y: clampedY };
      onMove(text.id, finalPositionRef.current);
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      
      // Check if this was a click or a drag
      const timeDiff = Date.now() - mouseDownTimeRef.current;
      const posDiff = Math.sqrt(
        Math.pow(e.clientX - mouseDownPosRef.current.x, 2) +
        Math.pow(e.clientY - mouseDownPosRef.current.y, 2)
      );
      
      // If it was a quick action with minimal movement, treat it as a click
      if (timeDiff < 200 && posDiff < 5) {
        onClick?.(text.id);
      } else {
        // Otherwise, it was a drag, so complete the move
        onMoveComplete?.(text.id, finalPositionRef.current);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, text.id, onMove, onMoveComplete, onClick]);

  return (
    <div
      className={`absolute group map-text-container ${
        isDrawingMode ? "pointer-events-none opacity-50" : "cursor-move"
      }`}
      style={{
        left: `${text.position.x}%`,
        top: `${text.position.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: zIndex,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative transition-all ${
          isDragging ? "opacity-75 scale-110" : ""
        }`}
        style={{
          transform: `scale(${currentSize}) rotate(${currentRotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        <div
          className={`px-2 py-1 ${
            isSelected ? "ring-4 ring-blue-400/50 ring-offset-2" : ""
          } ${isHovered && !isDrawingMode ? "ring-2 ring-primary/30 ring-offset-1" : ""} rounded whitespace-nowrap`}
          style={{
            fontSize: `${baseFontSize}px`,
            color: text.color || "#000000",
            fontFamily: "Arial, sans-serif",
            textShadow: "0 0 3px rgba(255, 255, 255, 0.8)",
          }}
        >
          {text.text}
        </div>
      </div>
    </div>
  );
}
