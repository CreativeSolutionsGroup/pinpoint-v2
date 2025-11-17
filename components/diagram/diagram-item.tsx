'use client';

import React, { useRef, useState, useCallback } from 'react';
import type { DiagramItem as DiagramItemType } from '@/lib/types/diagram';
import { getIconById } from '@/lib/icons/icon-library';
import { Trash2, RotateCw, Pencil } from 'lucide-react';

interface DiagramItemProps {
  item: DiagramItemType;
  isSelected: boolean;
  isMultiSelected?: boolean;
  canvasScale: number;
  onSelect: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<DiagramItemType>) => void;
  onDelete: () => void;
  disabled?: boolean;
  onLabelEditChange?: (isEditing: boolean) => void;
}

export function DiagramItem({
  item,
  isSelected,
  isMultiSelected = false,
  canvasScale,
  onSelect,
  onUpdate,
  onDelete,
  disabled = false,
  onLabelEditChange,
}: DiagramItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [rotateStart, setRotateStart] = useState({ angle: 0, centerX: 0, centerY: 0, startAngle: 0 });

  const iconDef = getIconById(item.iconType);

  // Handle item dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      
      e.stopPropagation();
      onSelect(e);
      
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
        
        // Always maintain aspect ratio
        const aspectRatio = resizeStart.width / resizeStart.height;
        const newWidth = Math.max(20, resizeStart.width + deltaX);
        const newHeight = newWidth / aspectRatio;
        onUpdate({ width: newWidth, height: newHeight });
      } else if (isRotating) {
        if (!itemRef.current) return;
        
        // Get the current screen position of the element's center
        const rect = itemRef.current.getBoundingClientRect();
        const screenCenterX = rect.left + rect.width / 2;
        const screenCenterY = rect.top + rect.height / 2;
        
        // Calculate current angle from screen coordinates
        const currentAngle = Math.atan2(
          e.clientY - screenCenterY,
          e.clientX - screenCenterX
        );
        const currentDegrees = (currentAngle * 180) / Math.PI;
        const delta = currentDegrees - rotateStart.startAngle;
        let newRotation = (rotateStart.angle + delta + 360) % 360;
        
        // Snap to 90 degree increments if within 10 degrees
        const snapThreshold = 10;
        const snapPoints = [0, 90, 180, 270];
        for (const snapPoint of snapPoints) {
          const distance = Math.abs(newRotation - snapPoint);
          const wrappedDistance = Math.abs((newRotation - snapPoint + 360) % 360);
          if (Math.min(distance, wrappedDistance, Math.abs(360 - wrappedDistance)) < snapThreshold) {
            newRotation = snapPoint;
            break;
          }
        }
        
        onUpdate({ rotation: newRotation });
      }
    },
    [isDragging, isResizing, isRotating, dragStart, resizeStart, rotateStart, canvasScale, onUpdate]
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
      if (disabled || !itemRef.current) return;
      e.stopPropagation();
      setIsRotating(true);
      
      // Get the actual screen position of the element's center
      const rect = itemRef.current.getBoundingClientRect();
      const screenCenterX = rect.left + rect.width / 2;
      const screenCenterY = rect.top + rect.height / 2;
      
      // Calculate the starting angle from the screen center
      const startAngle = Math.atan2(
        e.clientY - screenCenterY,
        e.clientX - screenCenterX
      );
      
      // Store canvas space center for calculations
      const centerX = item.x + item.width / 2;
      const centerY = item.y + item.height / 2;
      
      setRotateStart({
        angle: item.rotation,
        centerX,
        centerY,
        startAngle: (startAngle * 180) / Math.PI,
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

  // Handle delete key (only for single selection - multi-select is handled at page level)
  React.useEffect(() => {
    if (isSelected && !disabled && !isEditingLabel && !isMultiSelected) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          onDelete();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isSelected, disabled, onDelete, isEditingLabel, isMultiSelected]);

  if (!iconDef) return null;

  // Calculate square bounding box size (use the larger dimension)
  const boundingSize = Math.max(item.width, item.height);
  const offsetX = (boundingSize - item.width) / 2;
  const offsetY = (boundingSize - item.height) / 2;

  return (
    <div
      ref={itemRef}
      className="absolute group diagram-item"
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: item.zIndex,
        cursor: disabled ? 'default' : 'move',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Icon with opacity */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ color: item.color, opacity: item.opacity }}
      >
        {iconDef.renderIcon({ color: item.color, size: Math.min(item.width, item.height) * 0.8 })}
      </div>
      
      {/* Selection outline and handles */}
      {isSelected && !disabled && (
        <>
          {/* Selection outline - square bounding box */}
          <div 
            className="absolute border-2 border-blue-500 pointer-events-none" 
            style={{
              left: -offsetX,
              top: -offsetY,
              width: boundingSize,
              height: boundingSize,
            }}
          />
          
          {/* Only show handles if not part of multi-selection */}
          {!isMultiSelected && (
            <>
              {/* Resize handle (bottom-right of square box) */}
              <div
                className="resize-handle absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-se-resize"
                onMouseDown={handleResizeMouseDown}
                style={{ 
                  right: -offsetX - 8,
                  bottom: -offsetY - 8,
                  transform: `scale(${1 / canvasScale})` 
                }}
              />
              
              {/* Rotate handle (top-center of square box) */}
              <div
                className="rotate-handle absolute w-6 h-6 bg-green-500 border-2 border-white rounded-full cursor-pointer flex items-center justify-center"
                onMouseDown={handleRotateMouseDown}
                style={{ 
                  left: '50%',
                  top: -offsetY - 32,
                  transform: `scale(${1 / canvasScale}) translateX(-50%)` 
                }}
              >
                <RotateCw size={12} color="white" />
              </div>
              
              {/* Delete button (top-right of square box) */}
              <button
                className="absolute w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={{ 
                  right: -offsetX - 32,
                  top: -offsetY - 32,
                  transform: `scale(${1 / canvasScale})` 
                }}
              >
                <Trash2 size={12} color="white" />
              </button>
            </>
          )}
          
          {/* Item name label (bottom-center of icon) - always show */}
          {item.name && !isEditingLabel && (
            <div
              className="absolute -translate-x-1/2 group/label"
              style={{ 
                left: '50%',
                bottom: -32,
                transform: `scale(${1 / canvasScale}) rotate(${-item.rotation}deg)`,
                transformOrigin: 'center top',
                pointerEvents: 'auto',
              }}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingLabel(true);
                onLabelEditChange?.(true);
              }}
            >
              <div className="relative bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap cursor-text hover:bg-black/90">
                {item.name}
                <Pencil 
                  size={18} 
                  className="opacity-0 group-hover/label:opacity-100 transition-opacity duration-200 absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full ml-1 text-black" 
                />
              </div>
            </div>
          )}
          
          {/* Editable label input */}
          {isEditingLabel && (
            <input
              type="text"
              className="absolute bg-black/75 text-white px-2 py-1 rounded text-xs whitespace-nowrap outline-none border-2 border-blue-400 -translate-x-1/2"
              style={{ 
                left: '50%',
                bottom: -32,
                transform: `scale(${1 / canvasScale}) rotate(${-item.rotation}deg)`,
                transformOrigin: 'center top',
                pointerEvents: 'auto',
                width: 'auto',
                minWidth: '100px',
              }}
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              onBlur={() => {
                setIsEditingLabel(false);
                onLabelEditChange?.(false);
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter' || e.key === 'Escape') {
                  setIsEditingLabel(false);
                  onLabelEditChange?.(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              autoFocus
            />
          )}
        </>
      )}
    </div>
  );
}
