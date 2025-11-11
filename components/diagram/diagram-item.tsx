'use client';

import React, { useRef, useState, useCallback } from 'react';
import type { DiagramItem as DiagramItemType } from '@/lib/types/diagram';
import { getIconById } from '@/lib/icons/icon-library';
import { Trash2, RotateCw } from 'lucide-react';

interface DiagramItemProps {
  item: DiagramItemType;
  isSelected: boolean;
  canvasScale: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<DiagramItemType>) => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function DiagramItem({
  item,
  isSelected,
  canvasScale,
  onSelect,
  onUpdate,
  onDelete,
  disabled = false,
}: DiagramItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [rotateStart, setRotateStart] = useState({ angle: 0, centerX: 0, centerY: 0 });

  const iconDef = getIconById(item.iconType);

  // Handle item dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      
      e.stopPropagation();
      onSelect();
      
      if ((e.target as HTMLElement).classList.contains('resize-handle') ||
          (e.target as HTMLElement).classList.contains('rotate-handle')) {
        return;
      }
      
      setIsDragging(true);
      setDragStart({
        x: e.clientX / canvasScale - item.x,
        y: e.clientY / canvasScale - item.y,
      });
    },
    [disabled, canvasScale, item.x, item.y, onSelect]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX / canvasScale - dragStart.x;
        const newY = e.clientY / canvasScale - dragStart.y;
        onUpdate({ x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = (e.clientX - resizeStart.x) / canvasScale;
        const deltaY = (e.clientY - resizeStart.y) / canvasScale;
        
        // Maintain aspect ratio if shift is held
        if (e.shiftKey) {
          const aspectRatio = resizeStart.width / resizeStart.height;
          const newWidth = Math.max(20, resizeStart.width + deltaX);
          const newHeight = newWidth / aspectRatio;
          onUpdate({ width: newWidth, height: newHeight });
        } else {
          onUpdate({
            width: Math.max(20, resizeStart.width + deltaX),
            height: Math.max(20, resizeStart.height + deltaY),
          });
        }
      } else if (isRotating) {
        const centerX = item.x + item.width / 2;
        const centerY = item.y + item.height / 2;
        const angle = Math.atan2(
          e.clientY / canvasScale - centerY,
          e.clientX / canvasScale - centerX
        );
        const degrees = (angle * 180) / Math.PI;
        onUpdate({ rotation: (degrees + 360) % 360 });
      }
    },
    [isDragging, isResizing, isRotating, dragStart, resizeStart, canvasScale, item, onUpdate]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  }, []);

  // Resize handle mouse down
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.stopPropagation();
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: item.width,
        height: item.height,
      });
    },
    [disabled, item.width, item.height]
  );

  // Rotate handle mouse down
  const handleRotateMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.stopPropagation();
      setIsRotating(true);
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      setRotateStart({
        angle: item.rotation,
        centerX,
        centerY,
      });
    },
    [disabled, item]
  );

  // Global mouse events
  React.useEffect(() => {
    if (isDragging || isResizing || isRotating) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, isRotating, handleMouseMove, handleMouseUp]);

  // Handle delete key
  React.useEffect(() => {
    if (isSelected && !disabled) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          onDelete();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, disabled, onDelete]);

  if (!iconDef) return null;

  return (
    <div
      ref={itemRef}
      className="absolute group"
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: item.zIndex,
        opacity: item.opacity,
        cursor: disabled ? 'default' : 'move',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Icon */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ color: item.color }}
      >
        {iconDef.renderIcon({ color: item.color, size: Math.min(item.width, item.height) * 0.8 })}
      </div>
      
      {/* Selection outline and handles */}
      {isSelected && !disabled && (
        <>
          {/* Selection outline */}
          <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none" />
          
          {/* Resize handle (bottom-right) */}
          <div
            className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
            style={{ transform: `scale(${1 / canvasScale})` }}
          />
          
          {/* Rotate handle (top-center) */}
          <div
            className="rotate-handle absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-green-500 border-2 border-white rounded-full cursor-pointer flex items-center justify-center"
            onMouseDown={handleRotateMouseDown}
            style={{ transform: `scale(${1 / canvasScale}) translateX(-50%)` }}
          >
            <RotateCw size={12} color="white" />
          </div>
          
          {/* Delete button */}
          <button
            className="absolute -top-8 -right-8 w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center hover:bg-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{ transform: `scale(${1 / canvasScale})` }}
          >
            <Trash2 size={12} color="white" />
          </button>
          
          {/* Item name label */}
          {item.name && (
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none"
              style={{ transform: `scale(${1 / canvasScale}) translateX(-50%)` }}
            >
              {item.name}
            </div>
          )}
        </>
      )}
    </div>
  );
}
